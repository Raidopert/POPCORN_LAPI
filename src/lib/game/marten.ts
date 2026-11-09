/**
 * Рост куницы NANA — живого питомца в главном меню.
 *
 * Куница растёт от прогресса игрока: каждый пройденный уровень и время,
 * проведённое в игре, копят «опыт роста». Каждые 4–5 уровней (плюс бонус
 * за минуты) куница переходит на следующую стадию — становится крупнее,
 * а комната в меню обставляется богаче: гирлянда, леопардовый ковёр,
 * монеты, кошачьи игрушки.
 *
 * Хранится в localStorage одним JSON-объектом.
 */

export interface MartenState {
  /** Сколько уровней пройдено (за всё время) */
  levels: number
  /** Сколько секунд проведено в забегах (за всё время) */
  seconds: number
}

export const MARTEN_KEY = 'popcorn-marten'
/** Событие после каждого сохранения — для useSyncExternalStore в UI */
export const MARTEN_EVENT = 'popcorn-marten-update'

/** Каждые 4 минуты в игре дают +1 очко роста */
const SECONDS_PER_POINT = 240

/** Пороги очков роста для стадий 0..6 (первый рост — после ~4 уровней) */
const GROWTH_THRESHOLDS = [0, 4, 9, 15, 22, 30, 40]

export const MAX_MARTEN_STAGE = GROWTH_THRESHOLDS.length - 1

export const DEFAULT_MARTEN: MartenState = { levels: 0, seconds: 0 }

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

/** Прочитать состояние из localStorage (без него — нули) */
export function loadMarten(): MartenState {
  if (typeof window === 'undefined') return { ...DEFAULT_MARTEN }
  try {
    const raw = window.localStorage.getItem(MARTEN_KEY)
    if (!raw) return { ...DEFAULT_MARTEN }
    const o = JSON.parse(raw) as Record<string, unknown>
    return {
      levels: Math.max(0, Math.floor(Number(o.levels) || 0)),
      seconds: Math.max(0, Math.floor(Number(o.seconds) || 0)),
    }
  } catch {
    return { ...DEFAULT_MARTEN }
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
    levels: cur.levels + Math.max(0, Math.floor(levels)),
    seconds: cur.seconds + Math.max(0, Math.floor(seconds)),
  }
  saveMarten(next)
  return next
}
