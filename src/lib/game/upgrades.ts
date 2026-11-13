/**
 * Постоянные апгрейды «POPCORN PAWS» — 33 штуки в 8 разделах.
 *
 *  Покупаются за опыт 🍿 и действуют в каждом забеге навсегда.
 *  Это «магазин механик» в отличие от древа улучшений (очки за уровень котика):
 *  древо тонко настраивает забег, а апгрейды — крупные вехи, которые видны сразу.
 *
 *  Разделы вкладки «АПГРЕЙДЫ» (v0.0.32 — наведён порядок, у каждого раздела
 *  свой заголовок в магазине):
 *    🧱 База выживания   — стаканчик, сердца, жизнь, щит, старт-перк;
 *    🧺 Урожай и сбор    — масло, золото, магнит, волна;
 *    🍿 Большие попкорнины — ранний выход, живучесть, глазурь, золотая сдача;
 *    👶 Босс «Малыш»     — призовые, время боя, меткий пинок, рукавички;
 *    ⏱ Время и скорость — длинный сеанс, проворная лапка;
 *    🛡 Безопасность     — сапёр, крепкий нос, голубиные договоры;
 *    🔥 Азарт и комбо    — лихорадка, сундуки, быстрый старт, комбо-броня;
 *    🏦 Мета-экономика   — монетки, опыт, кассовый куш.
 *
 *  Численные бонусы собираются upgradeBonuses() и в компоненте игры
 *  сливаются с бонусами древа (mergeBonuses) — движок получает единый пакет.
 *
 *  v0.0.28 — вся прокачка ≈ 14 400 🍿.
 *  v0.0.31 — строже: ×2.5 → ≈ 36 000 🍿.
 *  v0.0.32 — ЗАПРОС ИГРОКА: «постоянные апдейты должны быть НАМНОГО дороже,
 *  10-15 новых штук, в каждом по 3-5 улучшений». Что сделано:
 *    • каждый апгрейд доработан до 3–5 ступеней (одиночные — только редкие
 *      «вехи»: Девятая жизнь, Счастливый сундучок, Комбо-тренер);
 *    • цены ×3–×4 от 0.0.31: первые ступени по-прежнему по зубам (~700–1800),
 *      финальные ступени стоят как дорогие лапки (10–55 тысяч);
 *    • добавлено 13 новых апгрейдов под механики больших попкорнин и босса;
 *    • полная покупка вкладки ≈ 640 000 🍿 — путь на долгие недели.
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
  | 'pigeonguard'
  | 'fevertime'
  | 'feverluck'
  | 'fevermult'
  | 'gift'
  | 'combo'
  | 'combostart'
  | 'comboarmor'
  | 'coins'
  | 'xpboost'
  | 'scorecoins'
  | 'bigchance'
  | 'bigtime'
  | 'bigmult'
  | 'goldcoin'
  | 'bosscoins'
  | 'bosstime'
  | 'flingease'
  | 'bossheart'

/** Разделы вкладки «АПГРЕЙДЫ» — порядок отображения в магазине */
export type UpgradeCat = 'base' | 'yield' | 'big' | 'boss' | 'tempo' | 'guard' | 'lucky' | 'meta'

export const UPGRADE_CATS: ReadonlyArray<{ id: UpgradeCat; key: string; icon: string }> = [
  { id: 'base', key: 'shop.cat.base', icon: '🧱' },
  { id: 'yield', key: 'shop.cat.yield', icon: '🧺' },
  { id: 'big', key: 'shop.cat.big', icon: '🍿' },
  { id: 'boss', key: 'shop.cat.boss', icon: '👶' },
  { id: 'tempo', key: 'shop.cat.tempo', icon: '⏱' },
  { id: 'guard', key: 'shop.cat.guard', icon: '🛡' },
  { id: 'lucky', key: 'shop.cat.lucky', icon: '🔥' },
  { id: 'meta', key: 'shop.cat.meta', icon: '🏦' },
]

export interface UpgradeDef {
  id: UpgradeId
  /** Раздел вкладки «АПГРЕЙДЫ» */
  cat: UpgradeCat
  name: string
  desc: string
  icon: string
  /** Цены ступеней: длина = максимальный уровень (у новых — 3–5 ступеней) */
  prices: number[]
  /** Шаг эффекта за ступень — для подписи «upg.<id>.effect» с {{n}}:
      например «Сливочное масло» +5% за ступень → подпись покажет +{{n}}% при n = 5 × уровень */
  step: number
}

export const UPGRADES: UpgradeDef[] = [
  /* ══════════ 🧱 База выживания ══════════ */
  {
    id: 'capacity',
    cat: 'base',
    name: 'Большой стаканчик',
    desc: 'Лапка носит на одно зерно больше в каждом забеге. Можно купить четырежды!',
    icon: '🥡',
    prices: [1200, 3200, 8000, 18000],
    step: 1,
  },
  {
    id: 'hearts',
    cat: 'base',
    name: 'Крепкое сердце',
    desc: 'Плюс одно сердечко ❤️ к максимуму в каждом забеге: мины и голуби станут не так страшны. Можно купить четырежды!',
    icon: '❤️',
    prices: [1500, 4200, 10000, 24000],
    step: 1,
  },
  {
    id: 'life',
    cat: 'base',
    name: 'Девятая жизнь',
    desc: 'Один раз за забег, когда время выйдет, можно продолжить с тем же счётом (+15 секунд).',
    icon: '❤️‍🔥',
    prices: [4000],
    step: 1,
  },
  {
    id: 'startperk',
    cat: 'base',
    name: 'Счастливый сундучок',
    desc: 'Каждый новый забег начинается со случайным БОНУСНЫМ перком первого уровня.',
    icon: '🍀',
    prices: [5000],
    step: 1,
  },
  {
    id: 'shield',
    cat: 'base',
    name: 'Запасной щит',
    desc: 'Каждый забег начинается с +1 щитом 🛡️: одна мина прощается. Можно купить трижды!',
    icon: '🛡️',
    prices: [1100, 3000, 7400],
    step: 1,
  },
  /* ══════════ 🧺 Урожай и сбор ══════════ */
  {
    id: 'butter',
    cat: 'yield',
    name: 'Сливочное масло',
    desc: 'Каждое сданное зерно жирнее: +5% очков за зерно за ступень. Можно купить четырежды!',
    icon: '🧈',
    prices: [900, 2200, 5500, 13000],
    step: 5,
  },
  {
    id: 'goldluck',
    cat: 'yield',
    name: 'Золотая удача',
    desc: 'Золотые зёрна падают чаще: +4% к шансу за ступень. Можно купить четырежды!',
    icon: '🌟',
    prices: [800, 2000, 4800, 11000],
    step: 4,
  },
  {
    id: 'magnet',
    cat: 'yield',
    name: 'Магнит-приманка',
    desc: 'Лапка собирает зёрна с большего расстояния: +6% к радиусу подбора за ступень. Можно купить четырежды!',
    icon: '🧲',
    prices: [700, 1800, 4400, 10000],
    step: 6,
  },
  {
    id: 'seeds',
    cat: 'yield',
    name: 'Щедрая волна',
    desc: 'В каждой волне на 2 зерна больше — больше урожая за то же время. Можно купить четырежды!',
    icon: '🧺',
    prices: [1000, 2600, 6400, 15000],
    step: 2,
  },
  /* ══════════ 🍿 Большие попкорнины ══════════ */
  {
    id: 'bigchance',
    cat: 'big',
    name: 'Ранняя попкорнина',
    desc: 'БОЛЬШАЯ ПОПКОРНИНА выскакивает на 1.5 сек раньше за ступень — больше шансов успеть. Можно купить четырежды!',
    icon: '🍿',
    prices: [1400, 3600, 8800, 20000],
    step: 1.5,
  },
  {
    id: 'bigtime',
    cat: 'big',
    name: 'Живучая попкорнина',
    desc: 'Большая попкорнина живёт на 1 секунду дольше за ступень — не убежит так скоро. Можно купить трижды!',
    icon: '⌛',
    prices: [1200, 3200, 7800],
    step: 1,
  },
  {
    id: 'bigmult',
    cat: 'big',
    name: 'Сладкая глазурь',
    desc: 'Очки за любую БОЛЬШУЮ ПОПКОРНИНУ +10% за ступень: карамель, вишня и виноград жирнее. Можно купить пять раз!',
    icon: '🍯',
    prices: [1800, 4500, 11000, 26000, 55000],
    step: 10,
  },
  {
    id: 'goldcoin',
    cat: 'big',
    name: 'Золотая сдача',
    desc: 'Каждое сданное ЗОЛОТОЕ зерно приносит +1 монетку 🪙 за ступень. Можно купить трижды!',
    icon: '🌟',
    prices: [1300, 3400, 8200],
    step: 1,
  },
  /* ══════════ 👶 Босс «Малыш» ══════════ */
  {
    id: 'bosscoins',
    cat: 'boss',
    name: 'Призовые малыша',
    desc: 'Монетки 🪙 за победу над малышом +12% за ступень. Можно купить трижды!',
    icon: '🏅',
    prices: [1500, 3800, 9200],
    step: 12,
  },
  {
    id: 'bosstime',
    cat: 'boss',
    name: 'Долгий бой',
    desc: 'Босс-бой длится на 3 секунды дольше за ступень — время на добивание. Можно купить трижды!',
    icon: '⏱',
    prices: [1200, 3000, 7400],
    step: 3,
  },
  {
    id: 'flingease',
    cat: 'boss',
    name: 'Меткий пинок',
    desc: 'Пинок лапкой срабатывает легче: порог скорости −6% за ступень. Можно купить трижды!',
    icon: '🎯',
    prices: [1600, 4000, 9600],
    step: 6,
  },
  {
    id: 'bossheart',
    cat: 'boss',
    name: 'Мягкие рукавички',
    desc: 'Шанс 12% за ступень, что касание малыша не отнимет сердечко. Можно купить четырежды!',
    icon: '🧤',
    prices: [1500, 3800, 9200, 21000],
    step: 12,
  },
  /* ══════════ ⏱ Время и скорость ══════════ */
  {
    id: 'timeplus',
    cat: 'tempo',
    name: 'Длинный сеанс',
    desc: 'Каждый уровень длиннее на 3 секунды — время успеть всё. Можно купить четырежды!',
    icon: '⏱',
    prices: [1100, 2800, 7000, 16000],
    step: 3,
  },
  {
    id: 'speed',
    cat: 'tempo',
    name: 'Проворная лапка',
    desc: 'Лапка летит за пальцем на 5% быстрее за ступень. Можно купить четырежды!',
    icon: '💨',
    prices: [650, 1700, 4200, 9500],
    step: 5,
  },
  /* ══════════ 🛡 Безопасность ══════════ */
  {
    id: 'miner',
    cat: 'guard',
    name: 'Сапёр',
    desc: 'На одну мину-кукурузину меньше в каждой волне. Можно купить трижды!',
    icon: '⛏️',
    prices: [1300, 3400, 8500],
    step: 1,
  },
  {
    id: 'stun',
    cat: 'guard',
    name: 'Крепкий нос',
    desc: 'Шок от мины короче на 0.3 секунды за ступень — быстрее снова в бой. Можно купить трижды!',
    icon: '💪',
    prices: [700, 1900, 4800],
    step: 0.3,
  },
  {
    id: 'pigeonlate',
    cat: 'guard',
    name: 'Кроткий голубь',
    desc: 'Голубь-воришка прилетает на 3 секунды позже за ступень. Можно купить трижды!',
    icon: '🕊',
    prices: [800, 2200, 5600],
    step: 3,
  },
  {
    id: 'pigeonguard',
    cat: 'guard',
    name: 'Мир с голубем',
    desc: 'Голубь-воришка тащит на 1 зерно меньше за ступень. Можно купить трижды!',
    icon: '🕊',
    prices: [1100, 2800, 7000],
    step: 1,
  },
  /* ══════════ 🔥 Азарт и комбо ══════════ */
  {
    id: 'fevertime',
    cat: 'lucky',
    name: 'Долгая жара',
    desc: 'ЛИХОРАДКА длится на 1 секунду дольше за ступень. Можно купить трижды!',
    icon: '🔥',
    prices: [900, 2400, 6000],
    step: 1,
  },
  {
    id: 'feverluck',
    cat: 'lucky',
    name: 'Фартовщик',
    desc: 'Сдача зерна чаще запускает внезапную ЛИХОРАДКУ: +5% шанса за ступень. Можно купить трижды!',
    icon: '🎲',
    prices: [1000, 2700, 6800],
    step: 5,
  },
  {
    id: 'fevermult',
    cat: 'lucky',
    name: 'Жаркий урожай',
    desc: 'Очки в ЛИХОРАДКЕ +10% за ступень — жара становится жирнее. Можно купить четырежды!',
    icon: '🔥',
    prices: [1200, 3000, 7400, 17000],
    step: 10,
  },
  {
    id: 'gift',
    cat: 'lucky',
    name: 'Щедрые сундуки',
    desc: 'Подарки из сундучков ценнее на 25% за ступень. Можно купить трижды!',
    icon: '🎁',
    prices: [1100, 2900, 7200],
    step: 25,
  },
  {
    id: 'combostart',
    cat: 'lucky',
    name: 'Быстрый старт',
    desc: 'Серия сдач начинается с запасом +5 за ступень: комбо-множитель сразу выше. Можно купить трижды!',
    icon: '🚀',
    prices: [900, 2300, 5800],
    step: 5,
  },
  {
    id: 'comboarmor',
    cat: 'lucky',
    name: 'Комбо-броня',
    desc: 'Мина или воришка НЕ сбивают серию — по одному спасению за ступень в каждом забеге. Можно купить трижды!',
    icon: '🎢',
    prices: [1400, 3500, 8600],
    step: 1,
  },
  {
    id: 'combo',
    cat: 'lucky',
    name: 'Комбо-тренер',
    desc: 'Комбо-множитель растёт каждые 5 сдач вместо 6. Купи один раз — и навсегда!',
    icon: '🎯',
    prices: [7000],
    step: 1,
  },
  /* ══════════ 🏦 Мета-экономика ══════════ */
  {
    id: 'coins',
    cat: 'meta',
    name: 'Монетный магнит',
    desc: '+10% монеток 🪙 с этапов, сундучков и ЛИХОРАДКИ за ступень. Можно купить четырежды!',
    icon: '🪙',
    prices: [900, 2300, 5800, 13500],
    step: 10,
  },
  {
    id: 'xpboost',
    cat: 'meta',
    name: 'Умный котик',
    desc: '+10% опыта-стажа 🎖 за пройденные этапы за ступень. Можно купить четырежды!',
    icon: '🎖',
    prices: [1000, 2500, 6200, 14000],
    step: 10,
  },
  {
    id: 'scorecoins',
    cat: 'meta',
    name: 'Кассовый куш',
    desc: 'В конце забега кэшбэк: 0.5% очков забега возвращаются монетками 🪙 за ступень. Можно купить трижды!',
    icon: '🏦',
    prices: [1600, 4000, 9800],
    step: 0.5,
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
    /* «Мир с голубем»: воришка тащит на 1 зерно меньше за ступень */
    pigeonStealCut: state.pigeonguard,
    /* «Долгая жара» */
    feverPlus: state.fevertime,
    /* «Фартовщик» */
    feverLuck: 0.05 * state.feverluck,
    /* «Жаркий урожай»: очки в ЛИХОРАДКЕ +10% за ступень */
    feverMult01: 0.1 * state.fevermult,
    /* «Щедрые сундуки» */
    giftAdd: 0.25 * state.gift,
    /* «Комбо-тренер» */
    comboFast: state.combo > 0,
    /* «Быстрый старт»: серия начинается с запаса +5 за ступень */
    comboStart: 5 * state.combostart,
    /* «Комбо-броня»: по одному спасению серии за ступень */
    comboArmor: state.comboarmor,
    /* «Монетный магнит» */
    coinsAdd: 0.1 * state.coins,
    /* «Умный котик» */
    xpAdd: 0.1 * state.xpboost,
    /* «Кассовый куш»: 0.5% очков забега монетками за ступень */
    scoreCoins01: 0.005 * state.scorecoins,
    /* «Ранняя попкорнина»: выходит на 1.5 сек раньше за ступень */
    bigEarly: 1.5 * state.bigchance,
    /* «Живучая попкорнина»: +1 сек к жизни за ступень */
    bigLife: state.bigtime,
    /* «Сладкая глазурь»: очки попкорнин +10% за ступень */
    bigMult01: 0.1 * state.bigmult,
    /* «Золотая сдача»: +1 монетка за золотое зерно за ступень */
    goldCoinPer: state.goldcoin,
    /* «Призовые малыша»: монетки с боссов +12% за ступень */
    bossCoins01: 0.12 * state.bosscoins,
    /* «Долгий бой»: +3 сек в босс-бою за ступень */
    bossTime: 3 * state.bosstime,
    /* «Меткий пинок»: порог пинка −6% за ступень */
    flingEase01: 0.06 * state['flingease'],
    /* «Мягкие рукавички»: шанс не потерять сердце от касания босса */
    bossGuard01: 0.12 * state.bossheart,
  }
}
