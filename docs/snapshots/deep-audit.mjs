/**
 * ПОЛНЫЙ АУДИТ мировой базы POPCORN PAWS (Supabase Postgres).
 *
 * Запуск (только чтение, ни одной записи не меняет):
 *   DATABASE_URL="postgresql://postgres.xxx:ПАРОЛЬ@aws-0-<регион>.pooler.supabase.com:6543/postgres" bun docs/snapshots/deep-audit.mjs
 *
 * Что проверяет (в дополнение к внешней сверке через API):
 *   A  LeaderPlayer: всего/играли/нулевые, максимум, первая и последняя активность
 *   B  Нарушения потолка очков (bestScore > 15000 + bestLevel*10000) на уровне БД
 *   C  Дубли ников (без учёта регистра)
 *   D  Журнал LeaderSubmission: объём, диапазон очков, окна активности
 *   E  Дрейф рекорда: LeaderPlayer.bestScore ≠ MAX(score) из журнала
 *   F  Бурсты: >18 зачтённых забегов одного устройства в течение часа
 *   G  Прорывы гвардов в БД: submitted-забеги короче 15 сек, очки выше потолка
 *   H  Висячие open-забеги LeaderRun (утечка nonce) и возраст
 *   I  Счётчики LeaderStat vs фактические COUNT из журнала
 *   J  LeaderVisit: посетители
 *   K  Кото-лут: KotoLeader (топ волна, сумма боссов, дубли имён)
 *   L  Кото-лут: зависшие open-забеги KotoRun старше 7 суток
 *   M  Вердикт
 */
import { SQL } from 'bun'

const url = process.env.DATABASE_URL
if (!url || !/^postgres(ql)?:/i.test(url)) {
  console.error('Нет DATABASE_URL. Пример:\n  DATABASE_URL="postgresql://postgres.<ref>:<ПАРОЛЬ>@aws-0-<регион>.pooler.supabase.com:6543/postgres" bun docs/snapshots/deep-audit.mjs')
  process.exit(1)
}

const conn = url.includes('sslmode') ? url : `${url}${url.includes('?') ? '&' : '?'}sslmode=require`
const db = new SQL(conn)

const fmt = (d) => (d ? new Date(d).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—')
const hr = (t) => console.log(`\n=== ${t} ===`)
const issues = []
const notes = []

/* A — аккаунты котиков */
hr('A. LeaderPlayer — аккаунты котиков')
{
  const [r] = await db`SELECT COUNT(*)::int total,
    COUNT(*) FILTER (WHERE "bestScore" > 0)::int scored,
    COUNT(*) FILTER (WHERE "bestScore" = 0)::int zero,
    COALESCE(MAX("bestScore"), 0)::int max_score,
    MIN("createdAt") first, MAX("updatedAt") last,
    COALESCE(SUM(runs), 0)::int runs_sum
    FROM "LeaderPlayer"`
  console.log(`Всего котиков:        ${r.total}`)
  console.log(`С рекордом > 0:       ${r.scored}`)
  console.log(`Только закрепили имя: ${r.zero}`)
  console.log(`Максимум очков:       ${r.max_score}`)
  console.log(`Сумма runs:           ${r.runs_sum}`)
  console.log(`Первый игрок:         ${fmt(r.first)}`)
  console.log(`Последняя активность: ${fmt(r.last)}`)
}

/* B — потолок очков */
hr('B. Нарушения потолка (15000 + 10000×уровень)')
{
  const rows = await db`SELECT nick, device, "bestScore", "bestLevel"
    FROM "LeaderPlayer"
    WHERE "bestScore" > 15000 + "bestLevel" * 10000
    ORDER BY "bestScore" DESC`
  if (rows.length === 0) console.log('Чисто: ни одна строка потолок не превышает.')
  else rows.forEach((r) => issues.push(`ПОТОЛОК: «${r.nick}» ${r.bestScore} очк. @ ур.${r.bestLevel} (device ${r.device.slice(0, 12)}…)`))
}

/* C — дубли ников */
hr('C. Дубли ников (без учёта регистра)')
{
  const rows = await db`SELECT LOWER(TRIM(nick)) n, COUNT(*)::int c, array_agg(nick ORDER BY "bestScore" DESC) names
    FROM "LeaderPlayer" GROUP BY 1 HAVING COUNT(*) > 1 ORDER BY c DESC`
  if (rows.length === 0) console.log('Дублей нет.')
  else for (const r of rows) console.log(`«${r.n}» ×${r.c} → [${r.names.join(', ')}]`)
}

/* D — журнал забегов */
hr('D. LeaderSubmission — журнал зачтённых забегов')
{
  const [r] = await db`SELECT COUNT(*)::int total, COUNT(DISTINCT device)::int devices,
    COALESCE(MAX(score), 0)::int max_score, COALESCE(MIN(score), 0)::int min_score,
    MIN("createdAt") first, MAX("createdAt") last
    FROM "LeaderSubmission"`
  console.log(`Забегов: ${r.total} от ${r.devices} устройств`)
  console.log(`Очки: ${r.min_score} … ${r.max_score}`)
  console.log(`Первый: ${fmt(r.first)} · Последний: ${fmt(r.last)}`)
}

/* E — дрейф рекорда */
hr('E. Дрейф: bestScore ≠ MAX(score) из журнала')
{
  const rows = await db`SELECT p.device, p.nick, p."bestScore" best, COALESCE(MAX(s.score), 0)::int jmax
    FROM "LeaderPlayer" p LEFT JOIN "LeaderSubmission" s ON s.device = p.device
    GROUP BY p.device, p.nick, p."bestScore"
    HAVING p."bestScore" <> COALESCE(MAX(s.score), 0)
    ORDER BY p."bestScore" DESC LIMIT 30`
  if (rows.length === 0) console.log('Сходимость идеальна: каждый рекорд подтверждён журналом.')
  else {
    notes.push(`Дрейф рекорда у ${rows.length} котиков (обычно безвредно: строки до первого забега).`)
    rows.forEach((r) => console.log(`«${r.nick}» best=${r.best} journal_max=${r.jmax} (Δ ${r.best - r.jmax})`))
  }
}

/* F — бурсты */
hr('F. Бурсты: >18 забегов одного устройства за час')
{
  const rows = await db`SELECT device, date_trunc('hour', "createdAt") h, COUNT(*)::int c, MAX(score)::int maxs
    FROM "LeaderSubmission" GROUP BY 1, 2 HAVING COUNT(*) > 18 ORDER BY c DESC LIMIT 20`
  if (rows.length === 0) console.log('Бурстов нет (у всех устройств ≤18 забегов в час).')
  else rows.forEach((r) => notes.push(`Бурст: device ${r.device.slice(0, 12)}… в час ${fmt(r.h)} сделал ${r.c} забегов (макс ${r.maxs})`))
}

/* G — прорывы гвардов */
hr('G. Прорывы защиты на уровне БД')
{
  const [fast] = await db`SELECT COUNT(*)::int c FROM "LeaderRun"
    WHERE status = 'submitted' AND "endedAt" IS NOT NULL AND "endedAt" - "startedAt" < interval '15 seconds'`
  console.log(`Submitted-забегов короче 15 сек: ${fast.c} ${fast.c === 0 ? '(гвард таймингов цел)' : '← ГВАРД ОБОЙДЁН'}`)
  if (fast.c > 0) issues.push(`Тайминги обойдены: ${fast.c} забегов короче 15 сек зачтены`)
  const [over] = await db`SELECT COUNT(*)::int c FROM "LeaderSubmission"
    WHERE score > 15000 + level * 10000`
  console.log(`Записей в журнале выше потолка: ${over.c} ${over.c === 0 ? '(гвард счёта цел)' : '← ГВАРД ОБОЙДЁН'}`)
  if (over.c > 0) issues.push(`Потолок обойдён: ${over.c} записей выше scoreCap`)
}

/* H — висячие open-забеги */
hr('H. LeaderRun — висячие open-забеги (>3 ч)')
{
  const rows = await db`SELECT device, "startedAt", EXTRACT(EPOCH FROM (now() - "startedAt"))/3600 h
    FROM "LeaderRun" WHERE status = 'open' AND "startedAt" < now() - interval '3 hours'
    ORDER BY "startedAt" DESC LIMIT 30`
  const st = await db`SELECT status, COUNT(*)::int c FROM "LeaderRun" GROUP BY status`
  console.log(`Статусы LeaderRun: ${st.map((s) => `${s.status}=${s.c}`).join(', ')}`)
  if (rows.length === 0) console.log('Висячих open-забегов нет.')
  else {
    notes.push(`Висячих open-забегов: ${rows.length} (утёкшие nonce; сами истекают — не опасно)`)
    rows.slice(0, 10).forEach((r) => console.log(`device ${r.device.slice(0, 12)}… открыт ${fmt(r.startedAt)} (${Number(r.h).toFixed(1)} ч)`))
  }
}

/* I — счётчики vs журнал */
hr('I. LeaderStat vs фактические COUNT')
{
  const stats = await db`SELECT key, value::text FROM "LeaderStat"`
  const [sub] = await db`SELECT COUNT(*)::int c FROM "LeaderSubmission"`
  const [vis] = await db`SELECT COUNT(*)::int c FROM "LeaderVisit"`
  const get = (k) => Number(stats.find((s) => s.key === k)?.value ?? 0)
  console.log(`launches=${get('launches')}  runs=${get('runs')}  playsecs=${get('playsecs')}`)
  console.log(`Журнал забегов (COUNT): ${sub.c}`)
  console.log(`LeaderVisit (посетители): ${vis.c}`)
  if (get('runs') !== sub.c) notes.push(`Счётчик runs=${get('runs')} ≠ журналу ${sub.c} (Δ ${get('runs') - sub.c}); расхождение бывает при отказах записи счётчика — на топ не влияет`)
}

/* K — кото-лут */
hr('K. Кото-лут: KotoLeader')
{
  const [r] = await db`SELECT COUNT(*)::int total, COALESCE(MAX(wave), 0)::int top_wave,
    COALESCE(SUM(bosses), 0)::int bosses_sum, COALESCE(MAX(playtime), 0)::int max_pt
    FROM "KotoLeader"`
  console.log(`Слуг двора: ${r.total} · топ волна: ${r.top_wave} · боссов суммарно: ${r.bosses_sum} · макс. праймтайм: ${r.max_pt} сек`)
  const dups = await db`SELECT name, COUNT(*)::int c FROM "KotoLeader" GROUP BY name HAVING COUNT(*) > 1`
  if (dups.length) for (const d of dups) notes.push(`Кото-лут: имя «${d.name}» ×${d.c} — без различающего тега (косметика, fetchKotoTop не развязывает дубли)`)
}

/* L — зависшие KotoRun */
hr('L. Кото-лут: KotoRun — зависшие open (>7 суток)')
{
  const [r] = await db`SELECT COUNT(*)::int c FROM "KotoRun" WHERE status = 'open' AND "startedAt" < now() - interval '7 days'`
  console.log(`Зависших open-забегов: ${r.c}`)
}

/* M — вердикт */
hr('M. ВЕРДИКТ')
console.log(issues.length ? `ПРОБЛЕМЫ (${issues.length}):\n- ` + issues.join('\n- ') : 'Критичных проблем не найдено.')
console.log(notes.length ? `\nЗамечания (${notes.length}):\n- ` + notes.join('\n- ') : 'Замечаний нет.')
await db.close()
process.exit(0)
