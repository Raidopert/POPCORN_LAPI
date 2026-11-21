/**
 * Мировой лидерборд КОТО-ЛУТа на Prisma — отдельный контур от POPCORN PAWS,
 * но в том же доме: тот же db-синглтон, тот же секрет HMAC, тот же стиль
 * «нулевая настройка» (идемпотентный DDL при первом запросе в Postgres).
 *
 * База: локально SQLite (file:./db/custom.db — таблицы создаёт `bun run db:push`),
 * в проде Supabase/Neon Postgres — первый же запрос к /api/kotolut/* сам создаст
 * таблицы (см. KOTO_DDL). Правка схемы: обнови prisma/schema.prisma и KOTO_DDL
 * ОДНОВРЕМЕННО.
 *
 * Модель данных:
 *   KotoLeader — «аккаунт слуги»: один device = одна строка, хранится только
 *   максимальный результат (лучшая волна + боссы/опыт/уровень/время на момент рекорда).
 *   KotoRun — одноразовый забег: runId + HMAC-токен из /api/kotolut/leaders/start,
 *   статус open→closed (atomic), повторно сдать результат нельзя.
 *
 * Честность: потолки разумности (волна ≤ 500, боссы ≤ волна×5, опыт ≤ волна×5000,
 * уровень ≤ 300, время ≤ 60 суток), минимальное время забега, rate-limit в
 * route-файлах. Клиент рапортует реперные точки (каждая 5-я волна).
 */

import { db } from '@/lib/db'
import { signRun, verifyRunToken } from '@/lib/leaderboard-guard'

export interface KotoLeaderRow {
  name: string
  wave: number
  bosses: number
  date: number
}

export interface KotoWorldStats {
  players: number
  topWave: number
  bosses: number
}

/* ---------- автосоздание таблиц (Supabase: нулевая настройка) ---------- */

const KOTO_DDL: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS "KotoLeader" (
    "id" SERIAL NOT NULL,
    "device" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Слуга Рыбца',
    "wave" INTEGER NOT NULL DEFAULT 0,
    "bosses" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "maxLvl" INTEGER NOT NULL DEFAULT 1,
    "playtime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KotoLeader_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "KotoLeader_device_key" ON "KotoLeader"("device")`,
  `CREATE INDEX IF NOT EXISTS "KotoLeader_wave_idx" ON "KotoLeader"("wave")`,

  `CREATE TABLE IF NOT EXISTS "KotoRun" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "ipHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "wave" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "KotoRun_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "KotoRun_ipHash_startedAt_idx" ON "KotoRun"("ipHash", "startedAt")`,
  `CREATE INDEX IF NOT EXISTS "KotoRun_device_status_idx" ON "KotoRun"("device", "status")`,
]

let ensurePromise: Promise<void> | null = null

function isPostgresUrl(): boolean {
  return /^postgres(ql)?:/i.test((process.env.DATABASE_URL ?? '').trim())
}

function ensureTables(): Promise<void> {
  if (!isPostgresUrl()) return Promise.resolve()
  if (!ensurePromise) {
    ensurePromise = (async () => {
      for (const sql of KOTO_DDL) await db.$executeRawUnsafe(sql)
    })().catch((err) => {
      ensurePromise = null // повтор на следующем запросе
      throw err
    })
  }
  return ensurePromise
}

/* ---------- чтение топа и статистики ---------- */

export async function fetchKotoTop(limit = 20): Promise<KotoLeaderRow[] | null> {
  try {
    await ensureTables()
    const rows = await db.kotoLeader.findMany({
      where: { wave: { gt: 0 } },
      orderBy: [{ wave: 'desc' }, { updatedAt: 'asc' }],
      take: limit,
      select: { name: true, wave: true, bosses: true, updatedAt: true },
    })
    return rows.map((r) => ({
      name: r.name,
      wave: r.wave,
      bosses: r.bosses,
      date: r.updatedAt.getTime(),
    }))
  } catch (err) {
    console.error('[kotolut] fetchTop failed:', err)
    return null
  }
}

export async function fetchKotoStats(): Promise<KotoWorldStats | null> {
  try {
    await ensureTables()
    const [players, agg] = await Promise.all([
      db.kotoLeader.count({ where: { wave: { gt: 0 } } }),
      db.kotoLeader.aggregate({ _max: { wave: true }, _sum: { bosses: true } }),
    ])
    return {
      players,
      topWave: agg._max.wave ?? 0,
      bosses: agg._sum.bosses ?? 0,
    }
  } catch (err) {
    console.error('[kotolut] fetchStats failed:', err)
    return null
  }
}

export async function kotoPlayerRank(
  device: string,
): Promise<{ rank: number; best: number } | null> {
  try {
    await ensureTables()
    const me = await db.kotoLeader.findUnique({
      where: { device },
      select: { wave: true },
    })
    if (!me || me.wave <= 0) return null
    const better = await db.kotoLeader.count({ where: { wave: { gt: me.wave } } })
    return { rank: better + 1, best: me.wave }
  } catch (err) {
    console.error('[kotolut] rank failed:', err)
    return null
  }
}

/* ---------- забеги: старт и сдача ---------- */

export interface KotoRunStart {
  ok: boolean
  runId?: string
  token?: string
  startedAt?: number
}

export async function startKotoRun(device: string, ipHash: string): Promise<KotoRunStart> {
  try {
    await ensureTables()
    const runId = crypto.randomUUID()
    const startedAt = new Date()
    await db.kotoRun.create({
      data: { id: runId, device, ipHash, startedAt },
    })
    return {
      ok: true,
      runId,
      token: signRun(runId, startedAt.getTime()),
      startedAt: startedAt.getTime(),
    }
  } catch (err) {
    console.error('[kotolut] startRun failed:', err)
    return { ok: false }
  }
}

export interface KotoSubmitInput {
  device: string
  name: string
  wave: number
  bosses: number
  xp: number
  maxLvl: number
  playtime: number
  runId: string
  token: string
}

export interface KotoSubmitResult {
  ok: boolean
  rank?: number
  best?: number
  reason?: string
}

/** Потолки разумности: честная игра до этих значений не добирается, накрутка — да */
const WAVE_CAP = 500
const LVL_CAP = 300
const PLAYTIME_CAP = 60 * 24 * 3600

export async function submitKotoRun(input: KotoSubmitInput): Promise<KotoSubmitResult> {
  /* гранулярные причины падения — чтобы прод-сбой читался по reason без логов */
  const t = async <T>(reason: string, fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn()
    } catch (err) {
      console.error(`[kotolut] submit failed at ${reason}:`, err)
      throw reason
    }
  }
  try {
    await t('ensure', ensureTables)
    const run = await t('run', () =>
      db.kotoRun.findUnique({ where: { id: input.runId } }),
    )
    if (!run || run.device !== input.device) return { ok: false, reason: 'no-run' }
    if (run.status !== 'open') return { ok: false, reason: 'closed' }

    const startedAtMs = run.startedAt.getTime()
    const elapsed = Date.now() - startedAtMs
    /* подпись забега: без секрета сервера результат подделать нельзя */
    if (!verifyRunToken(input.runId, startedAtMs, input.token)) {
      return { ok: false, reason: 'token' }
    }
    /* забег физически не может быть короче пары секунд; зависший — не дольше 7 суток */
    if (elapsed < 2000) return { ok: false, reason: 'too-fast' }
    if (elapsed > 7 * 24 * 3600 * 1000) return { ok: false, reason: 'stale' }

    const wave = Math.floor(input.wave)
    if (!(wave >= 1 && wave <= WAVE_CAP)) return { ok: false, reason: 'wave' }
    const bosses = Math.max(0, Math.min(Math.floor(input.bosses), wave * 5))
    const xp = Math.max(0, Math.min(Math.floor(input.xp), wave * 5000))
    const maxLvl = Math.max(1, Math.min(Math.floor(input.maxLvl), LVL_CAP))
    const playtime = Math.max(0, Math.min(Math.floor(input.playtime), PLAYTIME_CAP))

    /* одноразовость: atomic UPDATE WHERE status='open' — второй submit не пройдёт */
    const consumed = await t('consume', () =>
      db.kotoRun.updateMany({
        where: { id: input.runId, device: input.device, status: 'open' },
        data: { status: 'closed', wave, endedAt: new Date() },
      }),
    )
    if (consumed.count !== 1) return { ok: false, reason: 'closed' }

    const prev = await t('player', () =>
      db.kotoLeader.findUnique({
        where: { device: input.device },
        select: { wave: true },
      }),
    )
    const best = Math.max(prev?.wave ?? 0, wave)
    if (!prev) {
      await t('create', () =>
        db.kotoLeader.create({
          data: { device: input.device, name: input.name, wave, bosses, xp, maxLvl, playtime },
        }),
      )
    } else if (wave > prev.wave) {
      /* пишем только новый рекорд; имя освежаем тоже */
      await t('update', () =>
        db.kotoLeader.update({
          where: { device: input.device },
          data: { name: input.name, wave, bosses, xp, maxLvl, playtime },
        }),
      )
    }

    const better = await t('rank', () =>
      db.kotoLeader.count({ where: { wave: { gt: best } } }),
    )
    return { ok: true, rank: better + 1, best }
  } catch (reason) {
    return { ok: false, reason: String(reason) }
  }
}

export { verifyRunToken }
