/**
 * Рост куницы NANA — живого питомца в главном меню.
 *
 * Куница растёт от прогресса игрока: каждый пройденный уровень и время,
 * проведённое в игре, копят «опыт роста». Каждые 4–5 уровней (плюс бонус
 * за минуты) куница переходит на следующую стадию — становится крупнее,
 * а комната в меню обставляется богаче: гирлянда, леопардовый ковёр,
 * монеты, кошачьи игрушки.
 *
 * Помимо стадий у NANA есть боевой уровень (xp от очков игрока в забегах
 * и от путешествий), алмазы 💎 и снаряжение путешественницы — ботиночки
 * из минимаркета. Куница сама ходит в авто-забеги (путешествия) за зерном
 * и алмазами: таймер идёт в реальном времени, даже когда игра закрыта.
 *
 * Хранится в localStorage одним JSON-объектом.
 */

/** Идентификатор путешествия */
export type TripId = 't10' | 't30' | 't60'
/** Идентификатор ботинок куницы */
export type BootsId = 'none' | 'sapozhki' | 'krest' | 'sluzh' | 'leopard'

/** Активное путешествие (оффлайн: таймер от реальных часов) */
export interface MartenTrip {
  id: TripId
  /** Начало пути, epoch ms */
  startedAt: number
  /** Возвращение, epoch ms (с учётом ботинок) */
  endsAt: number
  /** Зафиксированная награда: алмазы */
  diamonds: number
  /** Зафиксированная награда: опыт куницы */
  xp: number
}

export interface MartenState {
  /** Сколько уровней пройдено (за всё время) */
  levels: number
  /** Сколько секунд проведено в забегах (за всё время) */
  seconds: number
  /** Опыт боевого уровня куницы: очки игрока в забегах + путешествия */
  xp: number
  /** Алмазы 💎 — валюта минимаркета */
  diamonds: number
  /** Надетые ботиночки */
  boots: BootsId
  /** Купленные ботиночки */
  ownedBoots: BootsId[]
  /** Активное путешествие (null — NANA дома) */
  trip: MartenTrip | null
  /** Сколько путешествий совершено (за всё время) */
  trips: number
}

export const MARTEN_KEY = 'popcorn-marten'
/** Событие после каждого сохранения — для useSyncExternalStore в UI */
export const MARTEN_EVENT = 'popcorn-marten-update'

/** Каждые 4 минуты в игре дают +1 очко роста */
const SECONDS_PER_POINT = 240

/** Пороги очков роста для стадий 0..6 (первый рост — после ~4 уровней) */
const GROWTH_THRESHOLDS = [0, 4, 9, 15, 22, 30, 40]

export const MAX_MARTEN_STAGE = GROWTH_THRESHOLDS.length - 1

export const DEFAULT_MARTEN: MartenState = {
  levels: 0,
  seconds: 0,
  xp: 0,
  diamonds: 0,
  boots: 'none',
  ownedBoots: ['none'],
  trip: null,
  trips: 0,
}

/* ════════════════ Путешествия (авто-забеги за зерном) ════════════════ */

/** Каталог путешествий: базовые награды до ботинок (~1 💎 за минуту; часовой — 100) */
export const TRIPS: ReadonlyArray<{ id: TripId; ms: number; diamonds: number; xp: number }> = [
  { id: 't10', ms: 10 * 60_000, diamonds: 10, xp: 20 },
  { id: 't30', ms: 30 * 60_000, diamonds: 30, xp: 70 },
  { id: 't60', ms: 60 * 60_000, diamonds: 100, xp: 180 },
]

export const TRIP_MAP: Record<TripId, (typeof TRIPS)[number]> = {
  t10: TRIPS[0] as (typeof TRIPS)[number],
  t30: TRIPS[1] as (typeof TRIPS)[number],
  t60: TRIPS[2] as (typeof TRIPS)[number],
}

/* ════════════════ Ботиночки путешественницы (минимаркет) ════════════════ */

/**
 * Каталог ботинок: множитель алмазов, множитель опыта и коэффициент
 * времени пути. «none» — мохнатые лапки (надеты по умолчанию, не продаются).
 */
export const BOOTS: ReadonlyArray<{
  id: BootsId
  price: number
  gemMul: number
  xpMul: number
  timeMul: number
}> = [
  { id: 'none', price: 0, gemMul: 1, xpMul: 1, timeMul: 1 },
  { id: 'sapozhki', price: 40, gemMul: 1.15, xpMul: 1.15, timeMul: 0.95 },
  { id: 'krest', price: 120, gemMul: 1.3, xpMul: 1.3, timeMul: 0.9 },
  { id: 'sluzh', price: 300, gemMul: 1.55, xpMul: 1.55, timeMul: 0.82 },
  { id: 'leopard', price: 750, gemMul: 2, xpMul: 2, timeMul: 0.75 },
]

export const BOOTS_MAP: Record<BootsId, (typeof BOOTS)[number]> = BOOTS.reduce(
  (acc, b) => {
    acc[b.id] = b
    return acc
  },
  {} as Record<BootsId, (typeof BOOTS)[number]>,
)

export const isBootsId = (v: unknown): v is BootsId =>
  v === 'none' || v === 'sapozhki' || v === 'krest' || v === 'sluzh' || v === 'leopard'

export const isTripId = (v: unknown): v is TripId => v === 't10' || v === 't30' || v === 't60'

/** Итоговые награды/длительность путешествия с учётом ботинок (награды — вверх, время — вниз) */
export function tripReward(trip: TripId, boots: BootsId): { diamonds: number; xp: number; ms: number } {
  const def = TRIP_MAP[trip]
  const b = BOOTS_MAP[boots] ?? BOOTS_MAP.none
  return {
    diamonds: Math.max(1, Math.round(def.diamonds * b.gemMul)),
    xp: Math.max(1, Math.round(def.xp * b.xpMul)),
    ms: Math.max(15_000, Math.round(def.ms * b.timeMul)),
  }
}

/* ════════════════ Боевой уровень куницы ════════════════ */

/** Опыт, необходимый для перехода с уровня на следующий */
export function martenXpNeed(level: number): number {
  return 100 + (Math.max(1, level) - 1) * 60
}

export interface MartenLevelInfo {
  level: number
  into: number
  need: number
}

/** Текущий боевой уровень куницы и прогресс внутри уровня */
export function martenLevelOf(s: MartenState): MartenLevelInfo {
  let lvl = 1
  let rest = Math.max(0, Math.floor(s.xp))
  while (lvl < 999 && rest >= martenXpNeed(lvl)) {
    rest -= martenXpNeed(lvl)
    lvl += 1
  }
  return { level: lvl, into: rest, need: martenXpNeed(lvl) }
}

/** Очки роста: уровни + бонус за минуты в игре */
export function growthOf(s: MartenState): number {
  return Math.max(0, Math.floor(s.levels)) + Math.floor(Math.max(0, s.seconds) / SECONDS_PER_POINT)
}

/** Текущая стадия куницы 0..6 */
export function stageOf(s: MartenState): number {
  const g = growthOf(s)
  let stage = 0
  for (let i = 0; i < GROWTH_THRESHOLDS.length; i++) {
    if (g >= GROWTH_THRESHOLDS[i]) stage = i
  }
  return stage
}

/** Прогресс до следующей стадии: доля 0..1 (на максимальной — 1) */
export function progressToNext(s: MartenState): number {
  const stage = stageOf(s)
  if (stage >= MAX_MARTEN_STAGE) return 1
  const cur = GROWTH_THRESHOLDS[stage]
  const next = GROWTH_THRESHOLDS[stage + 1]
  return Math.min(1, Math.max(0, (growthOf(s) - cur) / (next - cur)))
}

/** Сколько уровней осталось до следующей стадии (на максимальной — 0) */
export function levelsToNext(s: MartenState): number {
  const stage = stageOf(s)
  if (stage >= MAX_MARTEN_STAGE) return 0
  const g = growthOf(s)
  const next = GROWTH_THRESHOLDS[stage + 1]
  const levelsLeft = Math.ceil(next - g)
  return Math.max(0, levelsLeft)
}

/** Прочитать состояние из localStorage (без него — нули; старые сейвы мигрируют) */
export function loadMarten(): MartenState {
  if (typeof window === 'undefined') return { ...DEFAULT_MARTEN, ownedBoots: ['none'] }
  try {
    const raw = window.localStorage.getItem(MARTEN_KEY)
    if (!raw) return { ...DEFAULT_MARTEN, ownedBoots: ['none'] }
    const o = JSON.parse(raw) as Record<string, unknown>
    const owned = Array.isArray(o.ownedBoots)
      ? (o.ownedBoots.filter(isBootsId) as BootsId[])
      : []
    if (!owned.includes('none')) owned.unshift('none')
    const boots = isBootsId(o.boots) ? o.boots : 'none'
    const trip =
      o.trip && typeof o.trip === 'object'
        ? (() => {
            const t = o.trip as Record<string, unknown>
            if (!isTripId(t.id)) return null
            const startedAt = Math.max(0, Math.floor(Number(t.startedAt) || 0))
            const endsAt = Math.max(0, Math.floor(Number(t.endsAt) || 0))
            if (endsAt <= startedAt) return null
            return {
              id: t.id,
              startedAt,
              endsAt,
              diamonds: Math.max(0, Math.floor(Number(t.diamonds) || 0)),
              xp: Math.max(0, Math.floor(Number(t.xp) || 0)),
            } satisfies MartenTrip
          })()
        : null
    return {
      levels: Math.max(0, Math.floor(Number(o.levels) || 0)),
      seconds: Math.max(0, Math.floor(Number(o.seconds) || 0)),
      xp: Math.max(0, Math.floor(Number(o.xp) || 0)),
      diamonds: Math.max(0, Math.floor(Number(o.diamonds) || 0)),
      boots: owned.includes(boots) ? boots : 'none',
      ownedBoots: owned,
      trip,
      trips: Math.max(0, Math.floor(Number(o.trips) || 0)),
    }
  } catch {
    return { ...DEFAULT_MARTEN, ownedBoots: ['none'] }
  }
}

/** Сохранить состояние: обновляем кеш-снапшот, хранилище и подписчиков */
let snapshotCache: MartenState | null = null

/** Стабильный снапшот для useSyncExternalStore (кеш, перечитывается при записи) */
export function getMartenSnapshot(): MartenState {
  if (snapshotCache === null) snapshotCache = loadMarten()
  return snapshotCache
}

/** Подписка на изменения роста куницы */
export function subscribeMarten(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(MARTEN_EVENT, cb)
  return () => window.removeEventListener(MARTEN_EVENT, cb)
}

export function saveMarten(s: MartenState): void {
  snapshotCache = s
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MARTEN_KEY, JSON.stringify(s))
    window.dispatchEvent(new Event(MARTEN_EVENT))
  } catch {
    /* переполнение приватного режима — игнорируем */
  }
}

/** Добавить прогресс (пройденные уровни + секунды игры) и сохранить */
export function addMartenProgress(levels: number, seconds: number): MartenState {
  const cur = getMartenSnapshot()
  const next: MartenState = {
    ...cur,
    levels: cur.levels + Math.max(0, Math.floor(levels)),
    seconds: cur.seconds + Math.max(0, Math.floor(seconds)),
  }
  saveMarten(next)
  return next
}

/* ════════════════ Действия v0.0.12: xp / алмазы / путешествия / ботинки ════════════════ */

/** Добавить кунице боевой опыт (очки игрока в забегах, награды путешествий) */
export function addMartenXp(n: number): MartenState {
  const add = Math.max(0, Math.floor(n))
  if (add <= 0) return getMartenSnapshot()
  const cur = getMartenSnapshot()
  const next: MartenState = { ...cur, xp: cur.xp + add }
  saveMarten(next)
  return next
}

/** Выдать алмазы (награда за путешествия) */
export function addMartenDiamonds(n: number): MartenState {
  const add = Math.max(0, Math.floor(n))
  if (add <= 0) return getMartenSnapshot()
  const cur = getMartenSnapshot()
  const next: MartenState = { ...cur, diamonds: cur.diamonds + add }
  saveMarten(next)
  return next
}

/** Отправить куницу в путешествие (награда фиксируется на момент отправки) */
export function startMartenTrip(id: TripId): MartenState {
  const cur = getMartenSnapshot()
  if (cur.trip) return cur // уже в пути
  const rw = tripReward(id, cur.boots)
  const now = Date.now()
  const next: MartenState = {
    ...cur,
    trip: { id, startedAt: now, endsAt: now + rw.ms, diamonds: rw.diamonds, xp: rw.xp },
  }
  saveMarten(next)
  return next
}

/** Забрать награду за завершённое путешествие; если время не вышло — ничего */
export function claimMartenTrip(): { state: MartenState; diamonds: number; xp: number } | null {
  const cur = getMartenSnapshot()
  if (!cur.trip || Date.now() < cur.trip.endsAt) return null
  const { diamonds, xp } = cur.trip
  const next: MartenState = {
    ...cur,
    diamonds: cur.diamonds + diamonds,
    xp: cur.xp + xp,
    trip: null,
    trips: cur.trips + 1,
  }
  saveMarten(next)
  return { state: next, diamonds, xp }
}

/** Купить ботиночки за алмазы; true — успех */
export function buyMartenBoots(id: BootsId): boolean {
  const def = BOOTS_MAP[id]
  if (!def || id === 'none') return false
  const cur = getMartenSnapshot()
  if (cur.ownedBoots.includes(id) || cur.diamonds < def.price) return false
  saveMarten({
    ...cur,
    diamonds: cur.diamonds - def.price,
    ownedBoots: [...cur.ownedBoots, id],
    boots: id,
  })
  return true
}

/** Надеть купленные ботиночки */
export function equipMartenBoots(id: BootsId): void {
  const cur = getMartenSnapshot()
  if (!cur.ownedBoots.includes(id)) return
  if (cur.boots === id) return
  saveMarten({ ...cur, boots: id })
}

/** Формат таймера путешествия: «ММ:СС» или «Ч:ММ:СС» для часового */
export function fmtTripMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const s = total % 60
  const m = Math.floor(total / 60) % 60
  const h = Math.floor(total / 3600)
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Короткий формат длительности для карточек: «10 мин» / «45 мин» / «1 ч» */
export function fmtTripDur(ms: number): string {
  const min = Math.round(ms / 60_000)
  if (min < 60) return `${min} мин`
  return `${Math.round((min / 60) * 10) / 10} ч`
}
