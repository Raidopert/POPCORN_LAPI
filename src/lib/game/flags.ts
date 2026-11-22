/**
 * Флаги будущих фич (заготовка под live-ops).
 *
 * Правило: новая крупная механика входит в код под флагом и включается
 * точечно, когда контент готов. Пока все флаги выключены и UI их не
 * читает — это чистая инфраструктура. Хранятся в localStorage, чтобы
 * можно было включать локально без выкладки.
 *
 * Пример будущего использования в компоненте:
 *   if (isFlagOn('dailies')) render <DailyOverlay/>
 */

export type GameFlag =
  | 'varieties'      // виды попкорна из popcorn-varieties.ts в спавне
  | 'roomModifiers'  // модификаторы комнат из rooms-future.ts
  | 'dailies'        // ежедневный вызов + задания
  | 'endless'        // бесконечный режим
  | 'timeAttack'     // забег на 60 секунд
  | 'seasons'        // сезонный пропуск-lite (награды за XP)
  | 'collection'     // альбом «поймай все виды»
  | 'friendsLb'      // друзья в мировом топе (VK)

const KEY = 'popcorn-flags'

const DEFAULTS: Record<GameFlag, boolean> = {
  varieties: false,
  roomModifiers: false,
  dailies: false,
  endless: false,
  timeAttack: false,
  seasons: false,
  collection: false,
  friendsLb: false,
}

export const FLAG_LABELS: Record<GameFlag, string> = {
  varieties: 'Виды попкорна',
  roomModifiers: 'Модификаторы комнат',
  dailies: 'Ежедневный вызов',
  endless: 'Бесконечный режим',
  timeAttack: 'Забег на 60 секунд',
  seasons: 'Сезоны',
  collection: 'Коллекция зёрен',
  friendsLb: 'Друзья в топе',
}

export function readFlags(): Record<GameFlag, boolean> {
  if (typeof window === 'undefined') return { ...DEFAULTS }
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Record<GameFlag, boolean>>) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function isFlagOn(flag: GameFlag): boolean {
  return readFlags()[flag]
}

export function setFlag(flag: GameFlag, on: boolean): void {
  if (typeof window === 'undefined') return
  try {
    const next = { ...readFlags(), [flag]: on }
    window.localStorage.setItem(KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('popcorn-flags-update'))
  } catch {
    // приватный режим — флаг просто не сохранится
  }
}
