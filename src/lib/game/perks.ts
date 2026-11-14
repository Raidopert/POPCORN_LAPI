/**
 * Рогалик-перки «POPCORN PAWS».
 * Между уровнями игрок открывает один из трёх сундучков и получает
 * случайный перк, действующий весь следующий уровень.
 *
 * v0.0.41: перки, ИНВЕРТИРУЮЩИЕ управление (переворот экрана rot180/rot90,
 * зеркало) и режим «нет света» (Ночная смена) УДАЛЕНЫ — игроки их не любят.
 * Вместо них — ступени медленной лапки (сложность с наградой очков) и
 * «Парящая лапка» (мины не срабатывают первые секунды уровня).
 */

export type PerkId =
  | 'grayscale'
  | 'slowpaw'
  | 'slowpaw2'
  | 'slowpaw3'
  | 'hover'
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
    id: 'grayscale',
    name: 'Чёрно-белое кино',
    desc: 'Мир теряет краски. Ищи попкорн среди серых теней, как в старом фильме!',
    icon: '🎞️',
    curse: true,
  },
  {
    id: 'slowpaw',
    name: 'Тяжёлая лапа',
    desc: 'Лапка налила свинца: тянется к цели в два раза медленнее. Награда за терпение — очки ×1.35!',
    icon: '🐾',
    curse: true,
  },
  {
    id: 'slowpaw2',
    name: 'Каменная лапа',
    desc: 'Лапка окаменела: тянется к цели втрое медленнее. Сложно, но за то очки ×1.8!',
    icon: '🗿',
    curse: true,
  },
  {
    id: 'slowpaw3',
    name: 'Лапа-валун',
    desc: 'Едва ползёт — в 4 раза медленнее. Испытание для мастеров: очки ×2.5!',
    icon: '🪨',
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
    id: 'hover',
    name: 'Парящая лапка',
    desc: 'Лапка парит над минами: первые 8 секунд уровня мины не взрываются под ней!',
    icon: '🎈',
    curse: false,
  },
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

/** Жёсткие проклятья: целиком перекрашивают, засыпают или сильно
    замедляют игру — играть с ними труднее всего, поэтому сундучок с таким
    перком обязан компенсировать игрока опытом 🍿 (туман, каменная лапа и т.п.) */
const HARSH_CURSES: readonly PerkId[] = [
  'grayscale',
  'slowpaw2',
  'slowpaw3',
  'fog',
  'whiteout',
  'popcornfall',
  'neon',
  'rainbow',
  /* «Птичий базар»: голуби втрое чаще — темп уровня заметно меняется,
     поэтому сундучок с ним тоже обязан компенсировать (раньше перк
     помечался curse, но компенсации не давал — сундук всегда пустовал) */
  'pigeonfeast',
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
 * Норма попкорна на уровень — растёт линейно БЕЗ ПОТОЛКА: чем глубже
 * забег, тем труднее успеть за отведённое время (у скилла предела нет,
 * а средний игрок упрётся в таймер):
 *   1: 9 · 2: 12 · 3: 15 · 4: 19 · 5: 22 · 6: 25 · 8: 31 · 10: 38
 *   12: 44 · 15: 54 · 18: 64 · 20: 70 · 25: 87 · 30: 103
 */
export function quotaFor(level: number, double = false): number {
  const q = Math.round(9 + (level - 1) * 3.2)
  return double ? Math.round(q * 1.3) : q
}

/* ================= трансформации экрана =================

   v0.0.41: перки-трансформации (переворот экрана, зеркало) УДАЛЕНЫ —
   инвертированное управление не нравится игрокам. Тип и функция
   остаются для совместимости, но трансформация теперь всегда «none». */

export type ScreenTransform = 'none'

/** Перки, визуально преобразующие весь экран (с 0.0.41 — никого) */
export function transformFor(_perk: PerkId | null): ScreenTransform {
  return 'none'
}

/** Множитель очков уровня от перка (сверх комбо и древа).
    Сложные перки платят очками: ступени медленной лапки — тем больше,
    чем медленнее лапка; фоновые проклятья — за плохую видимость. */
export function perkScoreMult(perk: PerkId | null): number {
  if (perk === 'doublepoints') return 2
  if (perk === 'slowpaw3') return 2.5
  if (perk === 'slowpaw2') return 1.8
  if (perk === 'slowpaw') return 1.35
  if (perk === 'popcornfall') return 1.4
  if (perk === 'whiteout') return 1.25
  return 1
}

/** CSS-фильтр игрового канваса для цветовых перков (как «Чёрно-белое кино»).
    «Хамелеон» анимируется отдельным CSS-классом — здесь фильтр не нужен. */
export function perkCanvasFilter(perk: PerkId | null): string {
  if (perk === 'grayscale') return 'grayscale(1) contrast(1.05)'
  if (perk === 'neon') return 'hue-rotate(150deg) saturate(2.2) contrast(1.1)'
  return ''
}

/** Фоновый перк: чем залить игровое поле вместо комнаты (в движке).
    «Ночная смена» (полная тьма) удалена в 0.0.41 — игроки её не любят. */
export type BgPerk = 'whiteout' | 'popcornfall' | null

export function bgPerkFor(perk: PerkId | null): BgPerk {
  if (perk === 'whiteout' || perk === 'popcornfall') return perk
  return null
}

/** Длительность парения над минами (перк «Парящая лапка»), сек.
    Древо «Лёгкое крыло» продлевает (hoverPlus) */
export const HOVER_BASE_SECONDS = 8
