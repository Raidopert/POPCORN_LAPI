/**
 * Мета-прогресс «Кошачьего попкорнного Беспредела» — монетки и уровни котика.
 *
 *  🪙 Монетки — отдельная валюта: капают за каждый пройденный этап,
 *    выпадают из сундучков и за успех в «Лихорадке». Ими покупаются
 *    редкие артефактные лапки в магазине.
 *  🎖 Уровень котика — растёт от ВЕГО опыта, заработанного за всё время
 *    (очки попкорна + бонус за каждый пройденный этап). Уровень никогда
 *    не уменьшается — это чистый показатель стажа охотника.
 *
 * Хранится в localStorage; изменения бродкастятся тем же событием,
 * что и остальной магазин, чтобы UI обновлялся мгновенно.
 */

const COINS_KEY = 'popcorn-coins'
const TOTAL_KEY = 'popcorn-totalxp'

/** Тот же ивент, что у магазина: один стор на всё меню */
const STORE_EVENT = 'popcorn-store-update'

function readNum(key: string): number {
  if (typeof window === 'undefined') return 0
  try {
    return Math.max(0, Math.floor(Number(window.localStorage.getItem(key)) || 0))
  } catch {
    return 0
  }
}

function writeNum(key: string, value: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, String(Math.max(0, Math.floor(value))))
    window.dispatchEvent(new Event(STORE_EVENT))
  } catch {
    /* приватный режим — игнорируем */
  }
}

/* ================= монетки 🪙 ================= */

export function getCoins(): number {
  return readNum(COINS_KEY)
}

/** Начислить/потратить монетки (delta может быть отрицательной) */
export function addCoins(delta: number): void {
  writeNum(COINS_KEY, readNum(COINS_KEY) + delta)
}

/* ================= уровень котика 🎖 ================= */

export function getTotalXp(): number {
  return readNum(TOTAL_KEY)
}

/** Добавить опыт стажа котика (только положительный — стаж не сгорает) */
export function addTotalXp(delta: number): void {
  if (delta <= 0) return
  writeNum(TOTAL_KEY, readNum(TOTAL_KEY) + delta)
}

/** Опыт, нужный для перехода с уровня на следующий: 800, 1200, 1600, 2000…
    Все цифры в игре с нулями (очки зёрен ×10) — и пороги тоже */
export function needForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level))
  return 800 + 400 * (l - 1)
}

/** Уровень котика по суммарному опыту (без потолка) */
export function charLevel(total: number): number {
  let level = 1
  let acc = 0
  while (total >= acc + needForLevel(level) && level < 999) {
    acc += needForLevel(level)
    level++
  }
  return level
}

export interface CharLevelInfo {
  /** Текущий уровень котика */
  level: number
  /** Опыт, накопленный внутри текущего уровня */
  into: number
  /** Сколько опыта нужно на весь текущий уровень */
  need: number
}

/** Уровень + прогресс внутри уровня (для полоски в меню) */
export function charLevelProgress(total: number): CharLevelInfo {
  const level = charLevel(total)
  let acc = 0
  for (let l = 1; l < level; l++) acc += needForLevel(l)
  const into = Math.max(0, total - acc)
  return { level, into, need: needForLevel(level) }
}
