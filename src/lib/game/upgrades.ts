/**
 * Постоянные апгрейды «POPCORN PAWS».
 * Покупаются за опыт один раз и навсегда (у некоторых несколько ступеней):
 *  - «Большой стаканчик» — лапка носит больше зёрен в каждом забеге;
 *  - «Девятая жизнь» — раз за забег можно продолжить после провала;
 *  - «Счастливый сундучок» — забег начинается со случайным бонусным перком;
 *  - «Крепкое сердце» — +1 сердечко к максимуму (механика 5 жизней).
 */

export type UpgradeId = 'capacity' | 'life' | 'startperk' | 'hearts'

export interface UpgradeDef {
  id: UpgradeId
  name: string
  desc: string
  icon: string
  /** Цены ступеней: длина = максимальный уровень */
  prices: number[]
  /** Подпись эффекта для текущего уровня (level — куплено ступеней) */
  effectLabel: (level: number) => string
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'capacity',
    name: 'Большой стаканчик',
    desc: 'Лапка носит на одно зерно больше в каждом забеге. Можно купить дважды!',
    icon: '🥡',
    prices: [12000, 34000],
    effectLabel: (level) => (level > 0 ? `Вместимость +${level} зерно(-а)` : 'Пока без бонуса'),
  },
  {
    id: 'life',
    name: 'Девятая жизнь',
    desc: 'Один раз за забег, когда время выйдет, можно продолжить с тем же счётом (+15 секунд).',
    icon: '❤️‍🔥',
    prices: [20000],
    effectLabel: (level) =>
      level > 0 ? 'Второй шанс доступен каждый забег' : 'Пока без второго шанса',
  },
  {
    id: 'startperk',
    name: 'Счастливый сундучок',
    desc: 'Каждый новый забег начинается со случайным БОНУСНЫМ перком первого уровня.',
    icon: '🍀',
    prices: [26000],
    effectLabel: (level) =>
      level > 0 ? 'Забег стартует с бонус-перком' : 'Пока без стартового перка',
  },
  {
    id: 'hearts',
    name: 'Крепкое сердце',
    desc: 'Плюс одно сердечко ❤️ к максимуму в каждом забеге: мины и голуби станут не так страшны. Можно купить дважды!',
    icon: '❤️',
    prices: [24000, 65000],
    effectLabel: (level) => (level > 0 ? `Максимум сердец +${level}` : 'Пока без бонуса'),
  },
]

export const UPGRADE_MAP: Record<UpgradeId, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
) as Record<UpgradeId, UpgradeDef>

/** Состояние апгрейдов игрока (сколько ступеней куплено) */
export interface UpgradeState {
  capacity: number
  life: number
  startperk: number
  hearts: number
}

export const DEFAULT_UPGRADES: UpgradeState = { capacity: 0, life: 0, startperk: 0, hearts: 0 }

export function parseUpgrades(raw: string | null): UpgradeState {
  try {
    const v: unknown = JSON.parse(raw ?? '')
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      return {
        capacity: Math.max(0, Math.min(2, Number(o.capacity) || 0)),
        life: Math.max(0, Math.min(1, Number(o.life) || 0)),
        startperk: Math.max(0, Math.min(1, Number(o.startperk) || 0)),
        hearts: Math.max(0, Math.min(2, Number(o.hearts) || 0)),
      }
    }
  } catch {
    /* пусто — дефолты */
  }
  return { ...DEFAULT_UPGRADES }
}
