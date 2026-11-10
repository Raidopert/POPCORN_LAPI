/**
 * Накопительные счётчики за всё время — «стаж охотника».
 * Нужны для достижений с пожизненными условиями (5000 зёрен, 25 голубей,
 * 10 лихорадок, 50 сосок…). Хранятся в localStorage одним JSON-объектом.
 *
 * Пишет лениво: изменения копятся в памяти и сбрасываются на диск
 * не чаще раза в 1.5 секунды (или принудительно flushLife()),
 * чтобы частые события (каждое зёрнышко) не дёргали localStorage.
 */

export interface LifeStats {
  /** Зёрен сдано в стаканчик за всё время */
  grains: number
  /** Золотых зёрен за всё время */
  golden: number
  /** Повержено голубей-воришек */
  pigeons: number
  /** Ловушек-мин (со шком) — «горький опыт» */
  mines: number
  /** ЛИХОРАДОК пережито */
  fevers: number
  /** Забегов начато */
  runs: number
  /** Проклятий из сундучков взято */
  curse: number
  /** Бонусов из сундучков взято */
  bonus: number
  /** Сосок 🍼 поймано (перк «Соски-малышки») */
  nipples: number
}

export const LIFE_KEY = 'popcorn-lifestats'

const DEFAULT_LIFE: LifeStats = {
  grains: 0,
  golden: 0,
  pigeons: 0,
  mines: 0,
  fevers: 0,
  runs: 0,
  curse: 0,
  bonus: 0,
  nipples: 0,
}

/** Живой объект в памяти — единый источник между кадрами */
let cache: LifeStats | null = null
let dirty = false
let flushTimer: number | null = null

function parseLife(raw: string | null | undefined): LifeStats {
  try {
    const v: unknown = JSON.parse(raw ?? '')
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      const out = { ...DEFAULT_LIFE }
      for (const k of Object.keys(DEFAULT_LIFE) as Array<keyof LifeStats>) {
        const n = Number(o[k])
        if (Number.isFinite(n) && n > 0) out[k] = Math.floor(n)
      }
      return out
    }
  } catch {
    /* пусто — дефолты */
  }
  return { ...DEFAULT_LIFE }
}

/** Текущие счётчики (память → localStorage при первом обращении) */
export function getLife(): LifeStats {
  if (cache) return cache
  if (typeof window === 'undefined') return { ...DEFAULT_LIFE }
  try {
    cache = parseLife(window.localStorage.getItem(LIFE_KEY))
  } catch {
    cache = { ...DEFAULT_LIFE }
  }
  return cache
}

/** Прибавить дельты (только положительные поля учитываются) */
export function addLife(patch: Partial<LifeStats>): LifeStats {
  const cur = getLife()
  for (const k of Object.keys(patch) as Array<keyof LifeStats>) {
    const d = patch[k]
    if (typeof d === 'number' && d > 0) cur[k] += Math.floor(d)
  }
  dirty = true
  scheduleFlush()
  return cur
}

function scheduleFlush(): void {
  if (flushTimer !== null || typeof window === 'undefined') return
  flushTimer = window.setTimeout(() => {
    flushTimer = null
    flushLife()
  }, 1500)
}

/** Сбросить накопленное на диск (по таймеру, при уходе со страницы) */
export function flushLife(): void {
  if (!dirty || !cache || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LIFE_KEY, JSON.stringify(cache))
  } catch {
    /* приватный режим — молча */
  }
  dirty = false
}
