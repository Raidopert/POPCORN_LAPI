/**
 * Рост куницы NANA — живого питомца в главном меню.
 *
 * Куница растёт от прогресса игрока: каждый пройденный уровень и время,
 * проведённое в игре, копят «опыт роста». Каждые 4–5 уровней (плюс бонус
 * за минуты) куница переходит на следующую стадию — становится крупнее,
 * а комната в меню обставляется богаче: гирлянда, леопардовый ковёр,
 * монеты, кошачьи игрушки.
 *
 * Помимо стадий у NANA есть боевой уровень (xp от очков игрока в забегах,
 * путешествий и кликера), алмазы 💎 и снаряжение путешественницы из
 * лавки: ботиночки, шляпки и сумочки. Куница сама ходит в авто-забеги
 * (путешествия) за зерном, алмазами и особым лутом: таймер идёт в
 * реальном времени, даже когда игра закрыта.
 *
 * Хранится в localStorage одним JSON-объектом.
 */

/** Идентификатор путешествия */
export type TripId = 't10' | 't30' | 't60' | 't180' | 't360' | 't720'
/** Идентификатор ботинок куницы */
export type BootsId = 'none' | 'sapozhki' | 'krest' | 'sluzh' | 'leopard'
/** Идентификатор шляпки куницы */
export type HatId = 'none' | 'straw' | 'cap' | 'crown' | 'superleo'
/** Идентификатор сумочки куницы */
export type BagId = 'none' | 'packet' | 'tote' | 'baguette' | 'leobag'

/** Активное путешествие (оффлайн: таймер от реальных часов) */
export interface MartenTrip {
  id: TripId
  /** Начало пути, epoch ms */
  startedAt: number
  /** Возвращение, epoch ms (с учётом ботинок и шляпки) */
  endsAt: number
  /** Зафиксированная награда: алмазы */
  diamonds: number
  /** Зафиксированная награда: опыт куницы */
  xp: number
  /** Особый лут: монетки котика (0 — путешествие без особого лута) */
  coins: number
  /** Особый лут: зёрна в зерновой сейф */
  grains: number
}

export interface MartenState {
  /** Сколько уровней пройдено (за всё время) */
  levels: number
  /** Сколько секунд проведено в забегах (за всё время) */
  seconds: number
  /** Опыт боевого уровня куницы: очки игрока в забегах + путешествия + кликер */
  xp: number
  /** Алмазы 💎 — валюта лавки и рынка */
  diamonds: number
  /** Надетые ботиночки */
  boots: BootsId
  /** Купленные ботиночки */
  ownedBoots: BootsId[]
  /** Надетая шляпка */
  hat: HatId
  /** Купленные шляпки */
  ownedHats: HatId[]
  /** Надетая сумочка */
  bag: BagId
  /** Купленные сумочки */
  ownedBags: BagId[]
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
  hat: 'none',
  ownedHats: ['none'],
  bag: 'none',
  ownedBags: ['none'],
  trip: null,
  trips: 0,
}

/* ════════════════ Путешествия (авто-забеги за зерном) ════════════════ */

/**
 * Каталог путешествий: базовые награды до снаряжения.
 * Классика (~1 💎 за минуту; часовой — 100) и дальние маршруты с ОСОБЫМИ
 * наградами: монетки котика 🪙 и зёрна в сейф 🌾. Дальние маршруты
 * открываются по боевому уровню NANA (поле lock).
 */
export const TRIPS: ReadonlyArray<{
  id: TripId
  ms: number
  diamonds: number
  xp: number
  coins: number
  grains: number
  /** Требуемый боевой уровень куницы (0 — открыто сразу) */
  lock: number
}> = [
  { id: 't10', ms: 10 * 60_000, diamonds: 10, xp: 20, coins: 0, grains: 0, lock: 0 },
  { id: 't30', ms: 30 * 60_000, diamonds: 30, xp: 70, coins: 0, grains: 0, lock: 0 },
  { id: 't60', ms: 60 * 60_000, diamonds: 100, xp: 180, coins: 0, grains: 0, lock: 0 },
  { id: 't180', ms: 180 * 60_000, diamonds: 340, xp: 620, coins: 30, grains: 140, lock: 5 },
  { id: 't360', ms: 360 * 60_000, diamonds: 760, xp: 1400, coins: 70, grains: 340, lock: 8 },
  { id: 't720', ms: 720 * 60_000, diamonds: 1600, xp: 3000, coins: 170, grains: 850, lock: 12 },
]

export const TRIP_MAP: Record<TripId, (typeof TRIPS)[number]> = TRIPS.reduce(
  (acc, t) => {
    acc[t.id] = t
    return acc
  },
  {} as Record<TripId, (typeof TRIPS)[number]>,
)

export const isTripId = (v: unknown): v is TripId =>
  v === 't10' || v === 't30' || v === 't60' || v === 't180' || v === 't360' || v === 't720'

/* ════════════════ Ботиночки путешественницы (лавка) ════════════════ */

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
  { id: 'sapozhki', price: 90, gemMul: 1.15, xpMul: 1.15, timeMul: 0.95 },
  { id: 'krest', price: 280, gemMul: 1.3, xpMul: 1.3, timeMul: 0.9 },
  { id: 'sluzh', price: 800, gemMul: 1.55, xpMul: 1.55, timeMul: 0.82 },
  { id: 'leopard', price: 2200, gemMul: 2, xpMul: 2, timeMul: 0.75 },
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

/* ════════════════ Шляпки путешественницы (лавка) ════════════════ */

/**
 * Каталог шляпок: от соломенной до Леопардовой кошачьей супер-шляпы.
 * Шляпка усиливает КЛИКЕР (+🐾 за клик по кунице) и награды путешествий.
 */
export const HATS: ReadonlyArray<{
  id: HatId
  price: number
  /** Бонусные 🐾 за каждый клик по кунице (кликер) */
  clickXp: number
  gemMul: number
  xpMul: number
  timeMul: number
}> = [
  { id: 'none', price: 0, clickXp: 0, gemMul: 1, xpMul: 1, timeMul: 1 },
  { id: 'straw', price: 160, clickXp: 1, gemMul: 1.05, xpMul: 1.25, timeMul: 1 },
  { id: 'cap', price: 480, clickXp: 2, gemMul: 1.1, xpMul: 1.5, timeMul: 0.97 },
  { id: 'crown', price: 1500, clickXp: 4, gemMul: 1.2, xpMul: 2, timeMul: 0.94 },
  { id: 'superleo', price: 4200, clickXp: 9, gemMul: 1.35, xpMul: 2.5, timeMul: 0.9 },
]

export const HATS_MAP: Record<HatId, (typeof HATS)[number]> = HATS.reduce(
  (acc, h) => {
    acc[h.id] = h
    return acc
  },
  {} as Record<HatId, (typeof HATS)[number]>,
)

export const isHatId = (v: unknown): v is HatId =>
  v === 'none' || v === 'straw' || v === 'cap' || v === 'crown' || v === 'superleo'

/* ════════════════ Сумочки путешественницы (лавка) ════════════════ */

/**
 * Каталог сумочек: плоский бонусный лут к КАЖДОМУ путешествию —
 * монетки котика 🪙 и зёрна в зерновой сейф 🌾. Леопардовая добавляет
 * ещё и процент алмазов.
 */
export const BAGS: ReadonlyArray<{
  id: BagId
  price: number
  coins: number
  grains: number
  gemAdd: number
}> = [
  { id: 'none', price: 0, coins: 0, grains: 0, gemAdd: 0 },
  { id: 'packet', price: 130, coins: 4, grains: 30, gemAdd: 0 },
  { id: 'tote', price: 420, coins: 10, grains: 80, gemAdd: 0 },
  { id: 'baguette', price: 1200, coins: 24, grains: 180, gemAdd: 0 },
  { id: 'leobag', price: 3400, coins: 55, grains: 420, gemAdd: 1.05 },
]

export const BAGS_MAP: Record<BagId, (typeof BAGS)[number]> = BAGS.reduce(
  (acc, b) => {
    acc[b.id] = b
    return acc
  },
  {} as Record<BagId, (typeof BAGS)[number]>,
)

export const isBagId = (v: unknown): v is BagId =>
  v === 'none' || v === 'packet' || v === 'tote' || v === 'baguette' || v === 'leobag'

/** Снаряжение куницы одним пакетом */
export interface MartenGear {
  boots: BootsId
  hat: HatId
  bag: BagId
}

/**
 * Итоговые награды/длительность путешествия с учётом ботинок, шляпки,
 * сумочки и множителя артефактов (gemMult/xpMult — от рынка).
 * Награды — вверх, время — вниз. Плоский лут сумочки не множится ботинками.
 */
export function tripReward(
  trip: TripId,
  gear: MartenGear,
  gemMult = 1,
  xpMult = 1,
): { diamonds: number; xp: number; coins: number; grains: number; ms: number } {
  const def = TRIP_MAP[trip]
  const b = BOOTS_MAP[gear.boots] ?? BOOTS_MAP.none
  const h = HATS_MAP[gear.hat] ?? HATS_MAP.none
  const bag = BAGS_MAP[gear.bag] ?? BAGS_MAP.none
  const bagGem = Math.round(def.diamonds * (bag.gemAdd - 1 > 0 ? bag.gemAdd - 1 : 0))
  return {
    diamonds: Math.max(1, Math.round(def.diamonds * b.gemMul * h.gemMul * gemMult)) + bagGem,
    xp: Math.max(1, Math.round(def.xp * b.xpMul * h.xpMul * xpMult)),
    coins: bag.coins,
    grains: bag.grains,
    ms: Math.max(15_000, Math.round(def.ms * b.timeMul * h.timeMul)),
  }
}

/* ════════════════ Боевой уровень куницы ════════════════ */

/**
 * Опыт, необходимый для перехода с уровня на следующий.
 * Мягкая кривая: 1-й уровень — 60🐾, дальше +30 за каждый уровень
 * (до 20-го ≈ 6.3k🐾, до 30-го ≈ 13.9k🐾, до 100-го ≈ 151k🐾).
 */
export function martenXpNeed(level: number): number {
  return 60 + (Math.max(1, level) - 1) * 30
}

/**
 * Бонус боевого уровня NANA к наградам путешествий:
 * каждый уровень добавляет +2% к 💎 и 🐾 (ур. 1 → ×1, ур. 20 → ×1.38,
 * ур. 100 → ×2.98). Полевой бонус — тот же множитель, что и артефакты.
 */
export function nanaLevelBonus(level: number): number {
  return 1 + (Math.max(1, level) - 1) * 0.02
}

/**
 * Монетки за клик по кунице (кликер): +1 монетка за каждые 5 уровней NANA
 * (ур. 1–4 → 1🪙, ур. 5–9 → 2🪙, ур. 100 → 21🪙). До умножения на артефакты.
 */
export function nanaClickCoins(level: number): number {
  return 1 + Math.floor((Math.max(1, level) - 1) / 5)
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
  if (typeof window === 'undefined') return { ...DEFAULT_MARTEN, ownedBoots: ['none'], ownedHats: ['none'], ownedBags: ['none'] }
  try {
    const raw = window.localStorage.getItem(MARTEN_KEY)
    if (!raw) return { ...DEFAULT_MARTEN, ownedBoots: ['none'], ownedHats: ['none'], ownedBags: ['none'] }
    const o = JSON.parse(raw) as Record<string, unknown>
    const ownedBoots = Array.isArray(o.ownedBoots)
      ? (o.ownedBoots.filter(isBootsId) as BootsId[])
      : []
    if (!ownedBoots.includes('none')) ownedBoots.unshift('none')
    const boots = isBootsId(o.boots) ? o.boots : 'none'
    const ownedHats = Array.isArray(o.ownedHats)
      ? (o.ownedHats.filter(isHatId) as HatId[])
      : []
    if (!ownedHats.includes('none')) ownedHats.unshift('none')
    const hat = isHatId(o.hat) ? o.hat : 'none'
    const ownedBags = Array.isArray(o.ownedBags)
      ? (o.ownedBags.filter(isBagId) as BagId[])
      : []
    if (!ownedBags.includes('none')) ownedBags.unshift('none')
    const bag = isBagId(o.bag) ? o.bag : 'none'
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
              coins: Math.max(0, Math.floor(Number(t.coins) || 0)),
              grains: Math.max(0, Math.floor(Number(t.grains) || 0)),
            } satisfies MartenTrip
          })()
        : null
    return {
      levels: Math.max(0, Math.floor(Number(o.levels) || 0)),
      seconds: Math.max(0, Math.floor(Number(o.seconds) || 0)),
      xp: Math.max(0, Math.floor(Number(o.xp) || 0)),
      diamonds: Math.max(0, Math.floor(Number(o.diamonds) || 0)),
      boots: ownedBoots.includes(boots) ? boots : 'none',
      ownedBoots,
      hat: ownedHats.includes(hat) ? hat : 'none',
      ownedHats,
      bag: ownedBags.includes(bag) ? bag : 'none',
      ownedBags,
      trip,
      trips: Math.max(0, Math.floor(Number(o.trips) || 0)),
    }
  } catch {
    return { ...DEFAULT_MARTEN, ownedBoots: ['none'], ownedHats: ['none'], ownedBags: ['none'] }
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

/* ════════════════ Действия: xp / алмазы / путешествия / снаряжение ════════════════ */

/** Добавить кунице боевой опыт (очки игрока в забегах, награды путешествий, кликер) */
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

/** Потратить алмазы (рынок и лавка); true — хватило и списалось */
export function spendMartenDiamonds(n: number): boolean {
  const cost = Math.max(0, Math.floor(n))
  if (cost <= 0) return true
  const cur = getMartenSnapshot()
  if (cur.diamonds < cost) return false
  saveMarten({ ...cur, diamonds: cur.diamonds - cost })
  return true
}

/** Отправить куницу в путешествие (награда фиксируется на момент отправки;
    множители артефактов gemMult/xpMult передаёт вызывающий — рынок) */
export function startMartenTrip(id: TripId, gemMult = 1, xpMult = 1): MartenState {
  const cur = getMartenSnapshot()
  if (cur.trip) return cur // уже в пути
  const lvl = martenLevelOf(cur).level
  const def = TRIP_MAP[id]
  if (lvl < def.lock) return cur // маршрут ещё закрыт
  const rw = tripReward(id, { boots: cur.boots, hat: cur.hat, bag: cur.bag }, gemMult, xpMult)
  const now = Date.now()
  const next: MartenState = {
    ...cur,
    trip: {
      id,
      startedAt: now,
      endsAt: now + rw.ms,
      diamonds: rw.diamonds,
      xp: rw.xp,
      coins: rw.coins,
      grains: rw.grains,
    },
  }
  saveMarten(next)
  return next
}

/** Забрать награду за завершённое путешествие; если время не вышло — ничего */
export function claimMartenTrip(): {
  state: MartenState
  diamonds: number
  xp: number
  coins: number
  grains: number
} | null {
  const cur = getMartenSnapshot()
  if (!cur.trip || Date.now() < cur.trip.endsAt) return null
  const { diamonds, xp, coins, grains } = cur.trip
  const next: MartenState = {
    ...cur,
    diamonds: cur.diamonds + diamonds,
    xp: cur.xp + xp,
    trip: null,
    trips: cur.trips + 1,
  }
  saveMarten(next)
  return { state: next, diamonds, xp, coins, grains }
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

/** Купить шляпку за алмазы; true — успех */
export function buyMartenHat(id: HatId): boolean {
  const def = HATS_MAP[id]
  if (!def || id === 'none') return false
  const cur = getMartenSnapshot()
  if (cur.ownedHats.includes(id) || cur.diamonds < def.price) return false
  saveMarten({
    ...cur,
    diamonds: cur.diamonds - def.price,
    ownedHats: [...cur.ownedHats, id],
    hat: id,
  })
  return true
}

/** Надеть купленную шляпку */
export function equipMartenHat(id: HatId): void {
  const cur = getMartenSnapshot()
  if (!cur.ownedHats.includes(id)) return
  if (cur.hat === id) return
  saveMarten({ ...cur, hat: id })
}

/** Купить сумочку за алмазы; true — успех */
export function buyMartenBag(id: BagId): boolean {
  const def = BAGS_MAP[id]
  if (!def || id === 'none') return false
  const cur = getMartenSnapshot()
  if (cur.ownedBags.includes(id) || cur.diamonds < def.price) return false
  saveMarten({
    ...cur,
    diamonds: cur.diamonds - def.price,
    ownedBags: [...cur.ownedBags, id],
    bag: id,
  })
  return true
}

/** Надеть купленную сумочку */
export function equipMartenBag(id: BagId): void {
  const cur = getMartenSnapshot()
  if (!cur.ownedBags.includes(id)) return
  if (cur.bag === id) return
  saveMarten({ ...cur, bag: id })
}

/** Снять весь лут с куницы в путешествие не даём — снаряжение надето всегда */

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
