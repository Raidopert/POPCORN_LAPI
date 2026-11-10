/**
 * Рогалик-перки «Кошачьего попкорнного Беспредела».
 * Между уровнями игрок открывает один из трёх сундучков и получает
 * случайный перк, действующий весь следующий уровень.
 */

export type PerkId =
  | 'rot180'
  | 'rot90'
  | 'mirror'
  | 'grayscale'
  | 'slowpaw'
  | 'smallpaw'
  | 'shaky'
  | 'cornrain'
  | 'fog'
  | 'drift'
  | 'magnet'
  | 'goldenvein'
  | 'doublepoints'
  | 'bigpaw'
  | 'timeplus'
  | 'shield'
  | 'secondcup'
  | 'slowmo'
  | 'milky'
  | 'nightshift'
  | 'whiteout'
  | 'popcornfall'
  | 'neon'
  | 'rainbow'
  | 'pigeonfeast'

export interface PerkDef {
  id: PerkId
  name: string
  desc: string
  icon: string
  /** true — проклятье (усложняет), false — бонус (помогает) */
  curse: boolean
}

export const PERKS: PerkDef[] = [
  /* ---------- проклятья ---------- */
  {
    id: 'rot180',
    name: 'Вверх тормашками',
    desc: 'Экран переворачивается на 180°, и лапка теперь идёт в противоположную сторону от пальца!',
    icon: '🔄',
    curse: true,
  },
  {
    id: 'rot90',
    name: 'Всё на боку!',
    desc: 'Экран ложится набок, а лапка двигается «наоборот» — двойная путаница!',
    icon: '🔃',
    curse: true,
  },
  {
    id: 'mirror',
    name: 'Зеркальный мир',
    desc: 'Мир отражён по горизонтали: тянешь лапку вправо — она уходит влево!',
    icon: '🪞',
    curse: true,
  },
  {
    id: 'grayscale',
    name: 'Чёрно-белое кино',
    desc: 'Мир теряет краски. Ищи попкорн среди серых теней, как в старом фильме!',
    icon: '🎞️',
    curse: true,
  },
  {
    id: 'slowpaw',
    name: 'Тяжёлая лапа',
    desc: 'Лапка налила свинца: тянется к цели в два раза медленнее.',
    icon: '🐾',
    curse: true,
  },
  {
    id: 'smallpaw',
    name: 'Мини-лапка',
    desc: 'Лапка заметно уменьшилась — зачерпнуть зерно можно только вплотную.',
    icon: '🤏',
    curse: true,
  },
  {
    id: 'shaky',
    name: 'Нервная лапа',
    desc: 'Лапка подрагивает и дёргается — прицелиться стало трудно.',
    icon: '😵',
    curse: true,
  },
  {
    id: 'cornrain',
    name: 'Кукурузный ливень',
    desc: 'Кукурузы-мин падает вдвое больше! Маршрут — только по чистому полу.',
    icon: '🌽',
    curse: true,
  },
  {
    id: 'fog',
    name: 'Попкорнный туман',
    desc: 'Поле тонет в тумане: видно только то, что рядом с лапкой.',
    icon: '🌫️',
    curse: true,
  },
  {
    id: 'drift',
    name: 'Скользкий пол',
    desc: 'Зёрна катаются по полу в разные стороны — поймай их первыми!',
    icon: '🧊',
    curse: true,
  },
  /* ---------- бонусы ---------- */
  {
    id: 'magnet',
    name: 'Магнитная лапа',
    desc: 'Попкорн сам прыгает в лапку, стоит подойти поближе!',
    icon: '🧲',
    curse: false,
  },
  {
    id: 'goldenvein',
    name: 'Золотая жила',
    desc: 'Золотых зёрен (+5 очков) стало в разы больше. Греби богатство!',
    icon: '✨',
    curse: false,
  },
  {
    id: 'doublepoints',
    name: 'Двойной улов',
    desc: 'Все очки удваиваются! Но и норма попкорна на уровень +30%.',
    icon: '💰',
    curse: false,
  },
  {
    id: 'bigpaw',
    name: 'Лапа великана',
    desc: 'Лапка выросла и гребёт разом — зерно летит в неё с большого радиуса.',
    icon: '🐱',
    curse: false,
  },
  {
    id: 'timeplus',
    name: 'Кошачьи часы',
    desc: 'Целых 75 секунд на уровень вместо 60. Время — резиновое!',
    icon: '⏱️',
    curse: false,
  },
  {
    id: 'shield',
    name: 'Кошачий щит',
    desc: 'Первое попадание в мину за уровень прощается — щит лопается с шипением вместо минуса!',
    icon: '🛡️',
    curse: false,
  },
  {
    id: 'secondcup',
    name: 'Двойной стаканчик',
    desc: 'Лапка носит на 2 зерна больше, а сдавать попкорн можно с дальнего подлёта!',
    icon: '🥤',
    curse: false,
  },
  {
    id: 'slowmo',
    name: 'Черепаший час',
    desc: 'Таймер тикает на четверть медленнее: по сути, 80 секунд вместо 60!',
    icon: '🐢',
    curse: false,
  },
  {
    id: 'milky',
    name: 'Соски-малышки',
    desc: 'Все обычные зёрна заменены на соски 🍼: каждая +40 очков, но и норма подросла на 20%!',
    icon: '🍼',
    curse: false,
  },
  {
    id: 'nightshift',
    name: 'Ночная смена',
    desc: 'Полная тьма: фон гаснет до чёрного, зёрна светятся как звёзды. +20% очков!',
    icon: '🌙',
    curse: false,
  },
  {
    id: 'whiteout',
    name: 'Засвет',
    desc: 'Белое пекло: фон выжигает все краски, белые зёрна почти невидимы! +25% очков.',
    icon: '🔆',
    curse: false,
  },
  {
    id: 'popcornfall',
    name: 'Попкорнопад',
    desc: 'Весь пол засыпан фоновым попкорном — свои зёрна ищи среди тысяч! +40% очков.',
    icon: '🍿',
    curse: false,
  },
  {
    id: 'neon',
    name: 'Неон',
    desc: 'Мир перекрашен в кислотные цвета — ищи зёрна по форме, а не по цвету!',
    icon: '🟣',
    curse: true,
  },
  {
    id: 'rainbow',
    name: 'Хамелеон',
    desc: 'Цвета бегут по кругу каждые несколько секунд — глаза разбегаются!',
    icon: '🦎',
    curse: true,
  },
  {
    id: 'pigeonfeast',
    name: 'Птичий базар',
    desc: 'Голуби прилетают втрое чаще, но за каждого поверженного — двойные очки!',
    icon: '🕊️',
    curse: true,
  },
]

export const PERK_MAP: Record<PerkId, PerkDef> = Object.fromEntries(
  PERKS.map((p) => [p.id, p]),
) as Record<PerkId, PerkDef>

/* ============ «злость» перков → адекватные призы сундучков ============ */

/** Жёсткие проклятья: целиком переворачивают, перекрашивают или засыпают
    экран — играть с ними труднее всего, поэтому сундучок с таким перком
    обязан компенсировать игрока опытом 🍿 (зеркало, чёрная комната и т.п.) */
const HARSH_CURSES: readonly PerkId[] = [
  'rot180',
  'rot90',
  'mirror',
  'grayscale',
  'fog',
  'nightshift',
  'whiteout',
  'popcornfall',
  'neon',
  'rainbow',
]

/** Тяжёлое ли это проклятье (для сундучка: компенсация опытом) */
export function isHarshCurse(id: PerkId): boolean {
  return HARSH_CURSES.includes(id)
}

/** Случайные N различных перков для сундучков.
    force — перк, который гарантированно входит;
    allow — фильтр из настроек (проклятья/бонусы можно отключать) */
export function rollPerkOffer(
  count = 3,
  force?: PerkId,
  allow?: (p: PerkDef) => boolean,
): PerkDef[] {
  const pool = allow ? PERKS.filter(allow) : [...PERKS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const picked: PerkDef[] = []
  if (force && PERK_MAP[force] && (!allow || allow(PERK_MAP[force]))) picked.push(PERK_MAP[force])
  for (const p of pool) {
    if (picked.length >= count) break
    if (picked.some((q) => q.id === p.id)) continue
    picked.push(p)
  }
  return picked
}

/* ================= математика уровня ================= */

/**
 * Норма попкорна на уровень — растёт линейно и упирается в потолок 75,
 * чтобы рост всегда был по силам растущей лапке (3→4→5 зёрен за раз):
 *   1: 9 · 2: 12 · 3: 15 · 4: 19 · 5: 22 · 6: 25 · 8: 31 · 10: 38
 *   12: 44 · 15: 54 · 18: 64 · 20: 70 · 22+: 75
 */
export function quotaFor(level: number, double = false): number {
  const q = Math.min(75, Math.round(9 + (level - 1) * 3.2))
  return double ? Math.round(q * 1.3) : q
}

/* ================= трансформации экрана ================= */

export type ScreenTransform = 'none' | 'rot90' | 'rot180' | 'mirror'

/** Перки, визуально преобразующие весь экран */
export function transformFor(perk: PerkId | null): ScreenTransform {
  if (perk === 'rot90') return 'rot90'
  if (perk === 'rot180') return 'rot180'
  if (perk === 'mirror') return 'mirror'
  return 'none'
}

/** Множитель очков уровня от перка (сверх комбо и древа).
    Фоновые перки сложнее обычной игры — за это платим очками. */
export function perkScoreMult(perk: PerkId | null): number {
  if (perk === 'doublepoints') return 2
  if (perk === 'popcornfall') return 1.4
  if (perk === 'whiteout') return 1.25
  if (perk === 'nightshift') return 1.2
  return 1
}

/** CSS-фильтр игрового канваса для цветовых перков (как «Чёрно-белое кино»).
    «Хамелеон» анимируется отдельным CSS-классом — здесь фильтр не нужен. */
export function perkCanvasFilter(perk: PerkId | null): string {
  if (perk === 'grayscale') return 'grayscale(1) contrast(1.05)'
  if (perk === 'neon') return 'hue-rotate(150deg) saturate(2.2) contrast(1.1)'
  return ''
}

/** Фоновый перк: чем залить игровое поле вместо комнаты (в движке) */
export type BgPerk = 'nightshift' | 'whiteout' | 'popcornfall' | null

export function bgPerkFor(perk: PerkId | null): BgPerk {
  if (perk === 'nightshift' || perk === 'whiteout' || perk === 'popcornfall') return perk
  return null
}
