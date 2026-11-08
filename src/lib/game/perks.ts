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
    desc: 'Экран переворачивается на 180°. Привычный маршрут больше не работает!',
    icon: '🔄',
    curse: true,
  },
  {
    id: 'rot90',
    name: 'Всё на боку!',
    desc: 'Экран поворачивается на 90° — поле ложится набок, а стаканчик уезжает вбок.',
    icon: '🔃',
    curse: true,
  },
  {
    id: 'mirror',
    name: 'Зеркальный мир',
    desc: 'Картинка отражается по горизонтали: тянешь лапку влево — она идёт вправо.',
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
]

export const PERK_MAP: Record<PerkId, PerkDef> = Object.fromEntries(
  PERKS.map((p) => [p.id, p]),
) as Record<PerkId, PerkDef>

/** Случайные N различных перков для сундучков (force — перк, который гарантированно входит) */
export function rollPerkOffer(count = 3, force?: PerkId): PerkDef[] {
  const pool = [...PERKS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const picked: PerkDef[] = []
  if (force && PERK_MAP[force]) picked.push(PERK_MAP[force])
  for (const p of pool) {
    if (picked.length >= count) break
    if (picked.some((q) => q.id === p.id)) continue
    picked.push(p)
  }
  return picked
}

/* ================= математика уровня ================= */

/**
 * Норма попкорна на уровень. Уровни 1–5 лёгкие (рост +4),
 * дальше норма растёт с ускорением, но и попкорна с кукурузой больше.
 *   1: 10 · 2: 14 · 3: 18 · 4: 22 · 5: 26 · 6: 31 · 7: 38 · 8: 46 · 10: 65
 */
export function quotaFor(level: number, double = false): number {
  const base = 10 + (level - 1) * 4
  const extra = level > 5 ? Math.pow(level - 5, 1.5) * 1.4 : 0
  const q = Math.round(base + extra)
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
