/**
 * Достижения «Кошачьего попкорнного Беспредела».
 * Разблокировки хранятся локально в браузере (localStorage),
 * в меню открывается «АЧИВКИ» со всеми медалями.
 */

export type AchId =
  | 'score100'
  | 'combo10'
  | 'golden1'
  | 'pigeon1'
  | 'level5'
  | 'level10'
  | 'rich1k'
  | 'shopper'
  | 'collector'
  | 'upgrade1'

export interface AchDef {
  id: AchId
  name: string
  desc: string
  icon: string
}

export const ACHIEVEMENTS: AchDef[] = [
  {
    id: 'score100',
    name: 'Первая сотня',
    desc: 'Набрать 100 очков за один забег',
    icon: '💯',
  },
  {
    id: 'combo10',
    name: 'Комбо-мастер',
    desc: 'Серия из 10 сдач подряд без мины',
    icon: '🔥',
  },
  {
    id: 'golden1',
    name: 'Золотая лапка',
    desc: 'Поймать золотое зерно (+5 очков)',
    icon: '✨',
  },
  {
    id: 'pigeon1',
    name: 'Птицебой',
    desc: 'Повалить голубя-воришку ударами лапки',
    icon: '🐦',
  },
  {
    id: 'level5',
    name: 'Киношка',
    desc: 'Дойти до 5-го уровня',
    icon: '🎬',
  },
  {
    id: 'level10',
    name: 'Мастер попкорна',
    desc: 'Дойти до 10-го уровня',
    icon: '🏆',
  },
  {
    id: 'rich1k',
    name: 'Попкорн-богач',
    desc: 'Накопить 1000 опыта в банке',
    icon: '💰',
  },
  {
    id: 'shopper',
    name: 'Модная лапка',
    desc: 'Купить любую лапку в магазине',
    icon: '🐾',
  },
  {
    id: 'collector',
    name: 'Коллекционер',
    desc: 'Владеть пятью лапками сразу',
    icon: '🎨',
  },
  {
    id: 'upgrade1',
    name: 'Обустроился',
    desc: 'Купить постоянный апгрейд',
    icon: '🛠️',
  },
]

export const ACH_MAP: Record<AchId, AchDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<AchId, AchDef>

export const ACH_KEY = 'popcorn-ach'
export const ACH_EVENT = 'popcorn-ach-update'

/** Список уже открытых достижений (localStorage → массив id) */
export function readAch(): AchId[] {
  try {
    const v: unknown = JSON.parse(window.localStorage.getItem(ACH_KEY) ?? '[]')
    if (Array.isArray(v)) return v.filter((x): x is AchId => typeof x === 'string' && x in ACH_MAP)
  } catch {
    /* пусто */
  }
  return []
}

/**
 * Попытаться открыть достижения. Возвращает только НОВО открытыe id
 * (для тостов). Пустой вызов дёшев: всё уже открытое отфильтровывается.
 */
export function unlockMany(ids: AchId[]): AchId[] {
  if (ids.length === 0) return []
  const have = new Set<AchId>(readAch())
  const fresh = ids.filter((id, i) => !have.has(id) && ids.indexOf(id) === i)
  if (fresh.length === 0) return []
  const next = [...readAch(), ...fresh]
  window.localStorage.setItem(ACH_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(ACH_EVENT))
  return fresh
}
