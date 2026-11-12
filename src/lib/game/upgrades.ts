/**
 * Постоянные апгрейды «POPCORN PAWS» — 20 штук.
 *
 *  Покупаются за опыт 🍿 один раз и навсегда (у многих несколько ступеней).
 *  Это «магазин механик» в отличие от древа улучшений (очки за уровень котика):
 *  древо тонко настраивает забег, а апгрейды — крупные вехи, которые видны сразу.
 *
 *  🥡 Вместимость и сердца — база выживания;
 *  🧈 «Сливочное масло», «Золотая удача», «Магнит-приманка», «Щедрая волна» —
 *     урожайность и сбор;
 *  ⛏️ «Сапёр», 🛡️ «Запасной щит», 💪 «Крепкий нос», 🕊 «Кроткий голубь»,
 *     ⏱ «Длинный сеанс», 💨 «Проворная лапка» — безопасность и контроль;
 *  🔥 «Долгая жара», 🎲 «Фартовщик», 🍀 «Комбо-тренер», 🎁 «Щедрые сундуки» —
 *     азарт и подарки;
 *  🪙 «Монетный магнит», 🎖 «Умный котик» — мета-экономика.
 *
 *  Численные бонусы собираются upgradeBonuses() и в компоненте игры
 *  сливаются с бонусами древа (mergeBonuses) — движок получает единый пакет.
 */

import type { TreeBonus } from './skill-tree'

export type UpgradeId =
  | 'capacity'
  | 'life'
  | 'startperk'
  | 'hearts'
  | 'butter'
  | 'goldluck'
  | 'magnet'
  | 'seeds'
  | 'timeplus'
  | 'speed'
  | 'miner'
  | 'shield'
  | 'stun'
  | 'pigeonlate'
  | 'fevertime'
  | 'feverluck'
  | 'gift'
  | 'combo'
  | 'coins'
  | 'xpboost'

export interface UpgradeDef {
  id: UpgradeId
  name: string
  desc: string
  icon: string
  /** Цены ступеней: длина = максимальный уровень */
  prices: number[]
  /** Шаг эффекта за ступень — для подписи «upg.<id>.effect» с {{n}}:
      например «Сливочное масло» +5% за ступень → подпись покажет +{{n}}% при n = 5 × уровень */
  step: number
}

export const UPGRADES: UpgradeDef[] = [
  /* ---------- база выживания ---------- */
  {
    id: 'capacity',
    name: 'Большой стаканчик',
    desc: 'Лапка носит на одно зерно больше в каждом забеге. Можно купить дважды!',
    icon: '🥡',
    prices: [12000, 34000],
    step: 1,
  },
  {
    id: 'life',
    name: 'Девятая жизнь',
    desc: 'Один раз за забег, когда время выйдет, можно продолжить с тем же счётом (+15 секунд).',
    icon: '❤️‍🔥',
    prices: [20000],
    step: 1,
  },
  {
    id: 'startperk',
    name: 'Счастливый сундучок',
    desc: 'Каждый новый забег начинается со случайным БОНУСНЫМ перком первого уровня.',
    icon: '🍀',
    prices: [26000],
    step: 1,
  },
  {
    id: 'hearts',
    name: 'Крепкое сердце',
    desc: 'Плюс одно сердечко ❤️ к максимуму в каждом забеге: мины и голуби станут не так страшны. Можно купить дважды!',
    icon: '❤️',
    prices: [24000, 65000],
    step: 1,
  },
  /* ---------- урожай и сбор ---------- */
  {
    id: 'butter',
    name: 'Сливочное масло',
    desc: 'Каждое сданное зерно жирнее: +5% очков за зерно за ступень. Можно купить трижды!',
    icon: '🧈',
    prices: [8000, 20000, 45000],
    step: 5,
  },
  {
    id: 'goldluck',
    name: 'Золотая удача',
    desc: 'Золотые зёрна падают чаще: +4% к шансу за ступень. Можно купить трижды!',
    icon: '🌟',
    prices: [7000, 18000, 40000],
    step: 4,
  },
  {
    id: 'magnet',
    name: 'Магнит-приманка',
    desc: 'Лапка собирает зёрна с большего расстояния: +6% к радиусу подбора за ступень. Можно купить трижды!',
    icon: '🧲',
    prices: [6000, 15000, 34000],
    step: 6,
  },
  {
    id: 'seeds',
    name: 'Щедрая волна',
    desc: 'В каждой волне на 2 зерна больше — больше урожая за то же время. Можно купить трижды!',
    icon: '🧺',
    prices: [9000, 22000, 50000],
    step: 2,
  },
  /* ---------- время и скорость ---------- */
  {
    id: 'timeplus',
    name: 'Длинный сеанс',
    desc: 'Каждый уровень длиннее на 3 секунды — время успеть всё. Можно купить трижды!',
    icon: '⏱',
    prices: [10000, 25000, 55000],
    step: 3,
  },
  {
    id: 'speed',
    name: 'Проворная лапка',
    desc: 'Лапка летит за пальцем на 5% быстрее за ступень. Можно купить трижды!',
    icon: '💨',
    prices: [6500, 16000, 36000],
    step: 5,
  },
  /* ---------- безопасность ---------- */
  {
    id: 'miner',
    name: 'Сапёр',
    desc: 'На одну мину-кукурузину меньше в каждой волне. Можно купить дважды!',
    icon: '⛏️',
    prices: [14000, 38000],
    step: 1,
  },
  {
    id: 'shield',
    name: 'Запасной щит',
    desc: 'Каждый забег начинается с +1 щитом 🛡️: одна мина прощается. Можно купить дважды!',
    icon: '🛡️',
    prices: [12000, 30000],
    step: 1,
  },
  {
    id: 'stun',
    name: 'Крепкий нос',
    desc: 'Шок от мины короче на 0.3 секунды за ступень — быстрее снова в бой. Можно купить дважды!',
    icon: '💪',
    prices: [7000, 17000],
    step: 0.3,
  },
  {
    id: 'pigeonlate',
    name: 'Кроткий голубь',
    desc: 'Голубь-воришка прилетает на 3 секунды позже за ступень. Можно купить дважды!',
    icon: '🕊',
    prices: [8000, 20000],
    step: 3,
  },
  /* ---------- азарт и подарки ---------- */
  {
    id: 'fevertime',
    name: 'Долгая жара',
    desc: 'ЛИХОРАДКА длится на 1 секунду дольше за ступень. Можно купить дважды!',
    icon: '🔥',
    prices: [9000, 22000],
    step: 1,
  },
  {
    id: 'feverluck',
    name: 'Фартовщик',
    desc: 'Сдача зерна чаще запускает внезапную ЛИХОРАДКУ: +5% шанса за ступень. Можно купить дважды!',
    icon: '🎲',
    prices: [11000, 26000],
    step: 5,
  },
  {
    id: 'gift',
    name: 'Щедрые сундуки',
    desc: 'Подарки из сундучков ценнее на 25% за ступень. Можно купить дважды!',
    icon: '🎁',
    prices: [13000, 32000],
    step: 25,
  },
  {
    id: 'combo',
    name: 'Комбо-тренер',
    desc: 'Комбо-множитель растёт каждые 5 сдач вместо 6. Купи один раз — и навсегда!',
    icon: '🎯',
    prices: [18000],
    step: 1,
  },
  /* ---------- мета-экономика ---------- */
  {
    id: 'coins',
    name: 'Монетный магнит',
    desc: '+10% монеток 🪙 с этапов, сундучков и ЛИХОРАДКИ за ступень. Можно купить трижды!',
    icon: '🪙',
    prices: [7500, 19000, 42000],
    step: 10,
  },
  {
    id: 'xpboost',
    name: 'Умный котик',
    desc: '+10% опыта-стажа 🎖 за пройденные этапы за ступень. Можно купить трижды!',
    icon: '🎖',
    prices: [8500, 21000, 47000],
    step: 10,
  },
]

export const UPGRADE_MAP: Record<UpgradeId, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
) as Record<UpgradeId, UpgradeDef>

/** Состояние апгрейдов игрока (сколько ступеней куплено) */
export type UpgradeState = Record<UpgradeId, number>

export const DEFAULT_UPGRADES: UpgradeState = Object.fromEntries(
  UPGRADES.map((u) => [u.id, 0]),
) as UpgradeState

export function parseUpgrades(raw: string | null): UpgradeState {
  const out: UpgradeState = { ...DEFAULT_UPGRADES }
  try {
    const v: unknown = JSON.parse(raw ?? '')
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      for (const def of UPGRADES) {
        const n = Number(o[def.id])
        if (Number.isFinite(n) && n > 0) out[def.id] = Math.min(def.prices.length, Math.floor(n))
      }
    }
  } catch {
    /* пусто — дефолты */
  }
  return out
}

/** Сколько РАЗЛИЧНЫХ апгрейдов куплено (хотя бы одна ступень) */
export function upgradesBought(state: UpgradeState): number {
  return UPGRADES.reduce((s, u) => s + (state[u.id] > 0 ? 1 : 0), 0)
}

/** Все ли апгрейды выкуплены до максимума */
export function upgradesAllMaxed(state: UpgradeState): boolean {
  return UPGRADES.every((u) => state[u.id] >= u.prices.length)
}

/**
 * Численные бонусы апгрейдов — в том же формате, что и древо (TreeBonus),
 * но частично: carry/hearts идут в движок отдельно (setUpgrades),
 * coins/xp/gift применяются в компоненте, остальное едет в движок
 * через merged-пакет древа.
 */
export interface UpgradeBonus extends Partial<TreeBonus> {
  /** «Большой стаканчик»: +N зерна в лапке */
  carryPlus: number
  /** «Крепкое сердце»: +N к максимуму сердец */
  heartsPlus: number
}

export function upgradeBonuses(state: UpgradeState): UpgradeBonus {
  return {
    carryPlus: state.capacity,
    heartsPlus: state.hearts,
    /* «Сливочное масло» */
    grainMult01: 0.05 * state.butter,
    /* «Золотая удача» */
    goldAdd: 0.04 * state.goldluck,
    /* «Магнит-приманка» */
    grabR01: 0.06 * state.magnet,
    /* «Щедрая волна» */
    grains: 2 * state.seeds,
    /* «Длинный сеанс» */
    timePlus: 3 * state.timeplus,
    /* «Проворная лапка» */
    speedAdd: 0.05 * state.speed,
    /* «Сапёр» */
    cornCut: state.miner,
    /* «Запасной щит» */
    shields: state.shield,
    /* «Крепкий нос» */
    stunCut: 0.3 * state.stun,
    /* «Кроткий голубь» */
    pigeonLate: 3 * state.pigeonlate,
    /* «Долгая жара» */
    feverPlus: state.fevertime,
    /* «Фартовщик» */
    feverLuck: 0.05 * state.feverluck,
    /* «Щедрые сундуки» */
    giftAdd: 0.25 * state.gift,
    /* «Комбо-тренер» */
    comboFast: state.combo > 0,
    /* «Монетный магнит» */
    coinsAdd: 0.1 * state.coins,
    /* «Умный котик» */
    xpAdd: 0.1 * state.xpboost,
  }
}
