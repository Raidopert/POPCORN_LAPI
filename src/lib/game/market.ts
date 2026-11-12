/**
 * Рынок «POPCORN PAWS» — обменник валют и лавка
 * постоянных артефактов.
 *
 * Четыре валюты ходят по рынку:
 *  💎 Алмазы     — из путешествий NANA (активная валюта её лавки);
 *  🪙 Монетки    — из этапов, Лихорадки и сундучков; кликер тоже даёт;
 *  🍿 Опыт       — очки попкорна (банк опыта, им же куплены лапки);
 *  🌾 Зёрнышки   — зерновой сейф: каждое сданное в игре зерно капает сюда.
 *
 * Курсы привязаны к монетке (см. VAL), рынок берёт комиссию 15% —
 * туда-сюда гонять валюту невыгодно. Артефакты — постоянные усиления
 * за алмазы (экономические множители), покупаются один раз.
 *
 * Хранится в localStorage одним JSON-объектом; изменения бродкастятся
 * событием MARKET_EVENT (useSyncExternalStore в UI).
 */

/* ════════════════ Валюты и курсы ════════════════ */

export type Currency = 'gems' | 'coins' | 'xp' | 'grains'

export const CURRENCIES: Currency[] = ['gems', 'coins', 'xp', 'grains']

/** Стоимость единицы валюты в монетках (основа курсов) */
const VAL: Record<Currency, number> = {
  gems: 12,
  coins: 1,
  xp: 0.2,
  grains: 0.1,
}

/** Комиссия рынка: 20% с каждого обмена (курсы ощутимо асимметричны —
 *    гонять валюту по кругу и «фармить» обменом невыгодно) */
export const MARKET_FEE = 0.2

/** Сколько валюты to получат за n валюты from (с комиссией, округление вниз) */
export function exchangeQuote(from: Currency, to: Currency, n: number): number {
  if (from === to || n <= 0) return 0
  const value = Math.floor(n) * VAL[from] * (1 - MARKET_FEE)
  return Math.max(0, Math.floor(value / VAL[to]))
}

/* ════════════════ Артефакты (постоянные усиления за алмазы) ════════════════ */

export type ArtifactId = 'piggy' | 'academy' | 'sieve' | 'travelmap' | 'bell' | 'rattle'

export const ARTIFACTS: ReadonlyArray<{ id: ArtifactId; price: number }> = [
  { id: 'piggy', price: 280 },
  { id: 'academy', price: 280 },
  { id: 'sieve', price: 240 },
  { id: 'travelmap', price: 450 },
  { id: 'bell', price: 650 },
  { id: 'rattle', price: 500 },
]

export const ARTIFACT_MAP: Record<ArtifactId, (typeof ARTIFACTS)[number]> = ARTIFACTS.reduce(
  (acc, a) => {
    acc[a.id] = a
    return acc
  },
  {} as Record<ArtifactId, (typeof ARTIFACTS)[number]>,
)

export const isArtifactId = (v: unknown): v is ArtifactId =>
  v === 'piggy' || v === 'academy' || v === 'sieve' || v === 'travelmap' || v === 'bell' || v === 'rattle'

export interface MarketState {
  /** Купленные артефакты */
  artifacts: ArtifactId[]
  /** Всего кликов по кунице (кликер, за всё время) */
  clicks: number
  /** Зерновой сейф 🌾 — третья валюта рынка */
  grains: number
}

export const MARKET_KEY = 'popcorn-market'
export const MARKET_EVENT = 'popcorn-market-update'

export const DEFAULT_MARKET: MarketState = {
  artifacts: [],
  clicks: 0,
  grains: 0,
}

/** Прочитать состояние рынка из localStorage (старые сейвы мигрируют) */
export function loadMarket(): MarketState {
  if (typeof window === 'undefined') return { ...DEFAULT_MARKET, artifacts: [] }
  try {
    const raw = window.localStorage.getItem(MARKET_KEY)
    if (!raw) return { ...DEFAULT_MARKET, artifacts: [] }
    const o = JSON.parse(raw) as Record<string, unknown>
    const artifacts = Array.isArray(o.artifacts) ? (o.artifacts.filter(isArtifactId) as ArtifactId[]) : []
    return {
      artifacts: [...new Set(artifacts)],
      clicks: Math.max(0, Math.floor(Number(o.clicks) || 0)),
      grains: Math.max(0, Math.floor(Number(o.grains) || 0)),
    }
  } catch {
    return { ...DEFAULT_MARKET, artifacts: [] }
  }
}

let snapshotCache: MarketState | null = null

/** Стабильный снапшот для useSyncExternalStore */
export function getMarketSnapshot(): MarketState {
  if (snapshotCache === null) snapshotCache = loadMarket()
  return snapshotCache
}

/** Подписка на изменения рынка */
export function subscribeMarket(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(MARKET_EVENT, cb)
  return () => window.removeEventListener(MARKET_EVENT, cb)
}

export function saveMarket(s: MarketState): void {
  snapshotCache = s
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MARKET_KEY, JSON.stringify(s))
    window.dispatchEvent(new Event(MARKET_EVENT))
  } catch {
    /* приватный режим — игнорируем */
  }
}

/* ════════════════ Действия ════════════════ */

/** Зафиксировать клик по кунице (кликер): счётчик за всё время */
export function countClick(): MarketState {
  const cur = getMarketSnapshot()
  const next: MarketState = { ...cur, clicks: cur.clicks + 1 }
  saveMarket(next)
  return next
}

/** Зёрна капают в сейф (множитель ситечка применяет вызывающий) */
export function addGrains(n: number): MarketState {
  const add = Math.max(0, Math.floor(n))
  if (add <= 0) return getMarketSnapshot()
  const cur = getMarketSnapshot()
  const next: MarketState = { ...cur, grains: cur.grains + add }
  saveMarket(next)
  return next
}

/** Тратить зёрна напрямую (рынок использует exchange) */
export function spendGrains(n: number): boolean {
  const cost = Math.max(0, Math.floor(n))
  const cur = getMarketSnapshot()
  if (cur.grains < cost) return false
  saveMarket({ ...cur, grains: cur.grains - cost })
  return true
}

/** Купить артефакт за алмазы (баланс алмазов передаёт вызывающий — он в marten) */
export function buyArtifact(id: ArtifactId, diamonds: number): boolean {
  const def = ARTIFACT_MAP[id]
  if (!def) return false
  const cur = getMarketSnapshot()
  if (cur.artifacts.includes(id) || diamonds < def.price) return false
  saveMarket({ ...cur, artifacts: [...cur.artifacts, id] })
  return true
}

/** Есть ли артефакт */
export function hasArtifact(id: ArtifactId): boolean {
  return getMarketSnapshot().artifacts.includes(id)
}

/**
 * Экономические множители артефактов — применяются в точках выдачи наград:
 *  - coinGift: монетки из Лихорадки, сундучков и дальних путешествий (Копилка-хрюшка);
 *  - xpGift: опыт-стаж за этапы и из сундучков (Котоакадемия);
 *  - grain: зёрна в сейф, включая путешествия (Золотое ситечко);
 *  - gemTrip / xpTrip: награды путешествий (Карта странствий);
 *  - clickCoin / clickAdd: монетки кликера (Кликер-колокольчик ×1.5,
 *    Погремушка — плоские +2🪙 к каждому клику).
 */
export interface MarketBonuses {
  coinGift: number
  xpGift: number
  grain: number
  gemTrip: number
  xpTrip: number
  clickCoin: number
  clickAdd: number
}

export const ZERO_MARKET_BONUS: MarketBonuses = {
  coinGift: 1,
  xpGift: 1,
  grain: 1,
  gemTrip: 1,
  xpTrip: 1,
  clickCoin: 1,
  clickAdd: 0,
}

export function marketBonuses(state: MarketState = getMarketSnapshot()): MarketBonuses {
  const has = (id: ArtifactId) => state.artifacts.includes(id)
  return {
    coinGift: has('piggy') ? 1.25 : 1,
    xpGift: has('academy') ? 1.25 : 1,
    grain: has('sieve') ? 1.25 : 1,
    gemTrip: has('travelmap') ? 1.15 : 1,
    xpTrip: has('travelmap') ? 1.15 : 1,
    /* Колокольчик ×1.5 (округление вверх в точке начисления): инфляция кликера
       держится под контролем, но артефакт остаётся ощутимым */
    clickCoin: has('bell') ? 1.5 : 1,
    clickAdd: has('rattle') ? 2 : 0,
  }
}

/** Системные ключи соседних валют (читает popcorn-game, здесь — только для справки) */
export const CURRENCY_KEYS = {
  coins: 'popcorn-coins',
  xp: 'popcorn-xp',
} as const
