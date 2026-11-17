/**
 * ИНВЕНТАРЬ «POPCORN PAWS» — лут из сундучков и лапка со слотами.
 *
 * Как работает:
 *  - Сундучки после этапа, кроме перка и подарка, роняют ПРЕДМЕТ
 *    (ошейник / браслет / венец / кольцо / баночка / талисман) одной из
 *    семи редкостей — четыре базовые и три леопардовых вершины (0.0.66):
 *    ЛЕОПАРД → ЗОЛОТОЙ ЛЕОПАРД → ФИОЛЕТОВЫЙ МЕГА-ЛЕОПАРД;
 *  - Предметы складываются на склад — сетка 4×9 = 36 ячеек; вторая
 *    страница (+36 ячеек, всего 72) покупается за монетки (0.0.54);
 *  - Простые предметы можно ПРОДАТЬ за монетки, редкие — НАДЕТЬ на лапку;
 *    ОБМЕН 3→1 (0.0.68): каждая третья ПРОДАЖА одинакового предмета рождает
 *    вещь классом выше — прежняя отдельная «переплавка» ушла в продажу;
 *  - Слоты лапки: ОШЕЙНИК (+монетки), БРАСЛЕТ (+опыт), ВЕНЕЦ (+алмазы путешествий),
 *    КОЛЬЦО (+удача — редкий лут выпадает чаще), БАНОЧКА (+бонус цвета),
 *    ВОЛШЕБНАЯ ЛАПКА (талисман-мультибонус, квадрат слева вверху инвентаря).
 *    Надеть можно по одному предмету каждого вида; бонус действует сразу;
 *  - Артефакты ЛАВКИ (0.0.54) живут в инвентаре полоской на лапке:
 *    купленный артефакт надевается автоматически, можно снять/надеть
 *    обратно. Бонус артефакта действует, только пока он надет —
 *    marketBonuses(market, equippedArtifacts(inv)) в popcorn-game.
 *
 * NEW-подсветка (0.0.54): у предмета хранится время дропа (ts), у склада —
 * время последнего открытия (lastOpened). Свежий лут помечается точкой,
 * кнопка ИНВЕНТАРЬ показывает бейдж с числом новинок.
 *
 * Ачивки инвентаря (0.0.54) считаются по everHad (все 11 лут-предметов)
 * и счётчикам sold/recycled (обмены 3→1); легендарка на лапке — по слотам.
 *
 * Хранится в localStorage одним JSON-объектом; изменения бродкастятся
 * событием INVENTORY_EVENT (useSyncExternalStore в UI).
 */

import { getMarketSnapshot, isArtifactId, type ArtifactId } from './market'
import type { BossKind } from './engine'

/* ════════════════ Каталог предметов ════════════════ */

export type ItemKind =
  | 'collar'
  | 'bracelet'
  | 'crown'
  /** Кольцо (0.0.66): удача — редкий лут выпадает чаще */
  | 'ring'
  /** Баночка (0.0.66): цвет = редкость, даёт один бонус */
  | 'jar'
  /** Волшебная лапка (0.0.66): талисман с несколькими бонусами сразу */
  | 'magic'

/**
 * Редкости (0.0.66): четыре базовые + три леопардовые вершины.
 * Леопардовые считаются «супер-редкими»: в лут попадают с крошечным весом,
 * а до вершины ветки можно дойти переплавкой 3→1.
 */
export type Rarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'leopard'
  | 'leopard-gold'
  | 'leopard-mega'

export type InvItemId =
  | 'col-leather'
  | 'col-red'
  | 'col-spiked'
  | 'col-diamond'
  /* 0.0.68: леопардовая вершина — минимум 5 предметов каждого вида */
  | 'col-leopard'
  | 'bra-beads'
  | 'bra-silver'
  | 'bra-gold'
  | 'bra-legend'
  | 'bra-leopard'
  /* 0.0.68: розовый венец в начале ветки + леопардовая вершина */
  | 'crown-rose'
  | 'crown-gold'
  | 'crown-diamond'
  | 'crown-ancient'
  | 'crown-leopard'
  /* Кольца (0.0.66) */
  | 'ring-silver'
  | 'ring-amber'
  | 'ring-emerald'
  | 'ring-sunstone'
  | 'ring-leopard'
  | 'ring-leopard-gold'
  | 'ring-leopard-mega'
  /* Баночки (0.0.66) */
  | 'jar-mint'
  | 'jar-honey'
  | 'jar-berry'
  | 'jar-star'
  | 'jar-leopard'
  | 'jar-leopard-gold'
  | 'jar-leopard-mega'
  /* БОССОВЫЕ БАНОЧКИ (0.0.69): падают ТОЛЬКО с боссов, у каждой свой эффект */
  | 'jar-pigeon'
  | 'jar-kid'
  | 'jar-lion'
  | 'jar-gypsy'
  | 'jar-marten'
  /* Волшебные талисманы (0.0.66) */
  | 'magic-star'
  | 'magic-moon'
  | 'magic-comet'
  | 'magic-aurora'
  | 'magic-leopard'
  | 'magic-leopard-gold'
  | 'magic-leopard-mega'

export interface InvDef {
  id: InvItemId
  kind: ItemKind
  rarity: Rarity
  /** Путь к мини-рисунку в public/inventory */
  icon: string
  /** Цена продажи в монетках 🪙 */
  sell: number
  /** Сила базового бонуса: 0.08 = +8% (ошейник/браслет/венец) */
  bonus: number
  /** Вес в рулетке лута сундучков (чем реже, тем ценнее) */
  weight: number
  /**
   * Волшебные эффекты (0.0.66) — для колец, баночек и талисманов.
   * Множители складываются между надетыми предметами; luck — удача
   * (поднимает вес редких ступеней в рулетке лута, кап см. LUCK_CAP).
   */
  fx?: InvFx
}

/** Множители волшебного предмета: 1.08 = +8% */
export interface InvFx {
  coins?: number
  xp?: number
  gems?: number
  /** Удача: вес редких ступеней лута растёт как luck^(ступень/2) */
  luck?: number
  /* ── Спец-эффекты боссовых баночек (0.0.69) ── */
  /** Голуби-воришки летают медленнее (0.3 = −30% скорости) */
  pigeonSlow?: number
  /** Все воры выгребают на долю меньше (0.25 = −25% кражи) */
  theftDown?: number
  /** Лихорадка длиннее на N секунд */
  feverPlus?: number
  /** Золотые зёрна падают чаще (множитель шанса, 1.6 = ×1.6) */
  goldenUp?: number
  /** +N сердечек к максимуму забега */
  heartsPlus?: number
}

/**
 * Бонус по виду предмета:
 *  - ОШЕЙНИК  → монетки: сундучки, большие попкорнины, боссы, золото, Лихорадка;
 *  - БРАСЛЕТ  → опыт: сундучки и награда за этап;
 *  - ВЕНЕЦ    → алмазы из путешествий NANA.
 */
export const INV_DEFS: ReadonlyArray<InvDef> = [
  /* Ошейники */
  { id: 'col-leather', kind: 'collar', rarity: 'common', icon: '/inventory/col-leather.png', sell: 25, bonus: 0.04, weight: 22 },
  { id: 'col-red', kind: 'collar', rarity: 'rare', icon: '/inventory/col-red.png', sell: 75, bonus: 0.08, weight: 12 },
  { id: 'col-spiked', kind: 'collar', rarity: 'epic', icon: '/inventory/col-spiked.png', sell: 200, bonus: 0.12, weight: 6 },
  { id: 'col-diamond', kind: 'collar', rarity: 'legendary', icon: '/inventory/col-diamond.png', sell: 600, bonus: 0.18, weight: 3 },
  /* 0.0.68: леопардовая вершина ошейников */
  { id: 'col-leopard', kind: 'collar', rarity: 'leopard', icon: '/inventory/col-leopard.png', sell: 1750, bonus: 0.24, weight: 1 },
  /* Браслеты */
  { id: 'bra-beads', kind: 'bracelet', rarity: 'common', icon: '/inventory/bra-beads.png', sell: 25, bonus: 0.04, weight: 22 },
  { id: 'bra-silver', kind: 'bracelet', rarity: 'rare', icon: '/inventory/bra-silver.png', sell: 75, bonus: 0.08, weight: 12 },
  { id: 'bra-gold', kind: 'bracelet', rarity: 'epic', icon: '/inventory/bra-gold.png', sell: 200, bonus: 0.12, weight: 6 },
  { id: 'bra-legend', kind: 'bracelet', rarity: 'legendary', icon: '/inventory/bra-legend.png', sell: 600, bonus: 0.18, weight: 3 },
  /* 0.0.68: леопардовая вершина браслетов */
  { id: 'bra-leopard', kind: 'bracelet', rarity: 'leopard', icon: '/inventory/bra-leopard.png', sell: 1750, bonus: 0.24, weight: 1 },
  /* Венцы. 0.0.68: ветка расширена до 5 ступеней — розовый венец в начале
     и леопардовая вершина в конце (обмен 3→1 теперь доходит до неё) */
  { id: 'crown-rose', kind: 'crown', rarity: 'epic', icon: '/inventory/crown-rose.png', sell: 200, bonus: 0.12, weight: 6 },
  { id: 'crown-gold', kind: 'crown', rarity: 'legendary', icon: '/inventory/crown-gold.png', sell: 600, bonus: 0.1, weight: 4 },
  /* v0.0.59: sell верхних венцов поднят — раньше переплавка 3×венец давала
     предмет ДЕШЕВЛЕ тройки исходников (1800 🪙 → 800) и была всегда невыгодна */
  { id: 'crown-diamond', kind: 'crown', rarity: 'legendary', icon: '/inventory/crown-diamond.png', sell: 1500, bonus: 0.15, weight: 2 },
  { id: 'crown-ancient', kind: 'crown', rarity: 'legendary', icon: '/inventory/crown-ancient.png', sell: 3800, bonus: 0.2, weight: 1 },
  /* 0.0.68: леопардовая вершина венцов */
  { id: 'crown-leopard', kind: 'crown', rarity: 'leopard', icon: '/inventory/crown-leopard.png', sell: 10500, bonus: 0.28, weight: 0.8 },

  /* ═══ Кольца (0.0.66): удача — редкий лут выпадает чаще ═══ */
  { id: 'ring-silver', kind: 'ring', rarity: 'common', icon: '/inventory/ring-silver.png', sell: 30, bonus: 0, weight: 20, fx: { luck: 1.05 } },
  { id: 'ring-amber', kind: 'ring', rarity: 'rare', icon: '/inventory/ring-amber.png', sell: 90, bonus: 0, weight: 11, fx: { luck: 1.1, coins: 1.04 } },
  { id: 'ring-emerald', kind: 'ring', rarity: 'epic', icon: '/inventory/ring-emerald.png', sell: 240, bonus: 0, weight: 5, fx: { luck: 1.18, xp: 1.06 } },
  { id: 'ring-sunstone', kind: 'ring', rarity: 'legendary', icon: '/inventory/ring-sunstone.png', sell: 700, bonus: 0, weight: 2.5, fx: { luck: 1.28, coins: 1.08, xp: 1.08 } },
  /* Леопардовые вершины: супер-редкие, но достижимы переплавкой 3→1 */
  { id: 'ring-leopard', kind: 'ring', rarity: 'leopard', icon: '/inventory/ring-leopard.png', sell: 2000, bonus: 0, weight: 1, fx: { luck: 1.45, coins: 1.1, xp: 1.1, gems: 1.06 } },
  { id: 'ring-leopard-gold', kind: 'ring', rarity: 'leopard-gold', icon: '/inventory/ring-leopard-gold.png', sell: 5000, bonus: 0, weight: 0.5, fx: { luck: 1.7, coins: 1.15, xp: 1.15, gems: 1.12 } },
  { id: 'ring-leopard-mega', kind: 'ring', rarity: 'leopard-mega', icon: '/inventory/ring-leopard-mega.png', sell: 12000, bonus: 0, weight: 0.25, fx: { luck: 2.1, coins: 1.2, xp: 1.2, gems: 1.15 } },

  /* ═══ Баночки (0.0.66): цвет = редкость, каждая даёт свой бонус ═══ */
  { id: 'jar-mint', kind: 'jar', rarity: 'common', icon: '/inventory/jar-mint.png', sell: 25, bonus: 0, weight: 22, fx: { xp: 1.04 } },
  { id: 'jar-honey', kind: 'jar', rarity: 'rare', icon: '/inventory/jar-honey.png', sell: 80, bonus: 0, weight: 12, fx: { coins: 1.07 } },
  { id: 'jar-berry', kind: 'jar', rarity: 'epic', icon: '/inventory/jar-berry.png', sell: 220, bonus: 0, weight: 6, fx: { gems: 1.1 } },
  { id: 'jar-star', kind: 'jar', rarity: 'legendary', icon: '/inventory/jar-star.png', sell: 650, bonus: 0, weight: 3, fx: { coins: 1.1, xp: 1.1 } },
  { id: 'jar-leopard', kind: 'jar', rarity: 'leopard', icon: '/inventory/jar-leopard.png', sell: 1900, bonus: 0, weight: 1.2, fx: { coins: 1.12, xp: 1.12, gems: 1.08, luck: 1.15 } },
  { id: 'jar-leopard-gold', kind: 'jar', rarity: 'leopard-gold', icon: '/inventory/jar-leopard-gold.png', sell: 4800, bonus: 0, weight: 0.5, fx: { coins: 1.18, xp: 1.18, gems: 1.12, luck: 1.3 } },
  { id: 'jar-leopard-mega', kind: 'jar', rarity: 'leopard-mega', icon: '/inventory/jar-leopard-mega.png', sell: 11000, bonus: 0, weight: 0.25, fx: { coins: 1.25, xp: 1.25, gems: 1.18, luck: 1.6 } },

  /* ═══ БОССОВЫЕ БАНОЧКИ (0.0.69): 5 видов — по одной на каждого босса.
     В общий пул сундучков НЕ входят (weight 0) — падают только с боссов;
     обмен 3→1 ведёт по лестнице баночек до леопардовой вершины.
     У каждой — свой спец-эффект, вместо скучных множителей */
  { id: 'jar-pigeon', kind: 'jar', rarity: 'common', icon: '/inventory/jar-pigeon.png', sell: 45, bonus: 0, weight: 0, fx: { pigeonSlow: 0.3 } },
  { id: 'jar-kid', kind: 'jar', rarity: 'rare', icon: '/inventory/jar-kid.png', sell: 120, bonus: 0, weight: 0, fx: { theftDown: 0.25 } },
  { id: 'jar-lion', kind: 'jar', rarity: 'epic', icon: '/inventory/jar-lion.png', sell: 320, bonus: 0, weight: 0, fx: { feverPlus: 4 } },
  { id: 'jar-gypsy', kind: 'jar', rarity: 'legendary', icon: '/inventory/jar-gypsy.png', sell: 850, bonus: 0, weight: 0, fx: { goldenUp: 1.6 } },
  { id: 'jar-marten', kind: 'jar', rarity: 'legendary', icon: '/inventory/jar-marten.png', sell: 1500, bonus: 0, weight: 0, fx: { heartsPlus: 1, luck: 1.08 } },

  /* ═══ Волшебные талисманы (0.0.66): слот слева вверху инвентаря, мультибонус ═══ */
  { id: 'magic-star', kind: 'magic', rarity: 'common', icon: '/inventory/magic-star.png', sell: 35, bonus: 0, weight: 20, fx: { coins: 1.03, xp: 1.03 } },
  { id: 'magic-moon', kind: 'magic', rarity: 'rare', icon: '/inventory/magic-moon.png', sell: 95, bonus: 0, weight: 11, fx: { xp: 1.08, gems: 1.05 } },
  { id: 'magic-comet', kind: 'magic', rarity: 'epic', icon: '/inventory/magic-comet.png', sell: 260, bonus: 0, weight: 5, fx: { coins: 1.09, xp: 1.09 } },
  { id: 'magic-aurora', kind: 'magic', rarity: 'legendary', icon: '/inventory/magic-aurora.png', sell: 750, bonus: 0, weight: 2.5, fx: { coins: 1.12, xp: 1.12, gems: 1.1 } },
  { id: 'magic-leopard', kind: 'magic', rarity: 'leopard', icon: '/inventory/magic-leopard.png', sell: 2200, bonus: 0, weight: 1, fx: { coins: 1.14, xp: 1.14, gems: 1.12, luck: 1.2 } },
  { id: 'magic-leopard-gold', kind: 'magic', rarity: 'leopard-gold', icon: '/inventory/magic-leopard-gold.png', sell: 5500, bonus: 0, weight: 0.5, fx: { coins: 1.2, xp: 1.2, gems: 1.16, luck: 1.45 } },
  { id: 'magic-leopard-mega', kind: 'magic', rarity: 'leopard-mega', icon: '/inventory/magic-leopard-mega.png', sell: 13000, bonus: 0, weight: 0.25, fx: { coins: 1.28, xp: 1.28, gems: 1.22, luck: 1.8 } },
]

export const INV_MAP: Record<InvItemId, InvDef> = INV_DEFS.reduce(
  (acc, d) => {
    acc[d.id] = d
    return acc
  },
  {} as Record<InvItemId, InvDef>,
)

export const isInvItemId = (v: unknown): v is InvItemId =>
  typeof v === 'string' && v in INV_MAP

/**
 * Базовые 11 лут-предметов — для ачивки «Полный лут».
 * Новые ветки 0.0.66 (кольца/баночки/талисманы) в ачивку не входят —
 * иначе она стала бы недостижимой для старых игроков.
 */
export const LOOT_IDS: ReadonlyArray<InvItemId> = [
  'col-leather',
  'col-red',
  'col-spiked',
  'col-diamond',
  'bra-beads',
  'bra-silver',
  'bra-gold',
  'bra-legend',
  'crown-gold',
  'crown-diamond',
  'crown-ancient',
]

/**
 * Переплавка 3→1 (0.0.54): ступень выше той же ветки.
 * null — вершина ветки (переплавлять нельзя).
 */
export const NEXT_TIER: Record<InvItemId, InvItemId | null> = {
  'col-leather': 'col-red',
  'col-red': 'col-spiked',
  'col-spiked': 'col-diamond',
  /* 0.0.68: ветки ошейников/браслетов/венцов доведены до леопардовых вершин */
  'col-diamond': 'col-leopard',
  'col-leopard': null,
  'bra-beads': 'bra-silver',
  'bra-silver': 'bra-gold',
  'bra-gold': 'bra-legend',
  'bra-legend': 'bra-leopard',
  'bra-leopard': null,
  'crown-rose': 'crown-gold',
  'crown-gold': 'crown-diamond',
  'crown-diamond': 'crown-ancient',
  'crown-ancient': 'crown-leopard',
  'crown-leopard': null,
  /* Кольца (0.0.66): до мега-вершины — 6 переплавок */
  'ring-silver': 'ring-amber',
  'ring-amber': 'ring-emerald',
  'ring-emerald': 'ring-sunstone',
  'ring-sunstone': 'ring-leopard',
  'ring-leopard': 'ring-leopard-gold',
  'ring-leopard-gold': 'ring-leopard-mega',
  'ring-leopard-mega': null,
  /* Баночки (0.0.66) */
  'jar-mint': 'jar-honey',
  'jar-honey': 'jar-berry',
  'jar-berry': 'jar-star',
  'jar-star': 'jar-leopard',
  'jar-leopard': 'jar-leopard-gold',
  'jar-leopard-gold': 'jar-leopard-mega',
  'jar-leopard-mega': null,
  /* Боссовые баночки (0.0.69): своя лестница — голубь → малыш → лев →
     цыган → Лана → леопардовая вершина (мост от боссового лута к короне) */
  'jar-pigeon': 'jar-kid',
  'jar-kid': 'jar-lion',
  'jar-lion': 'jar-gypsy',
  'jar-gypsy': 'jar-marten',
  'jar-marten': 'jar-leopard',
  /* Талисманы (0.0.66) */
  'magic-star': 'magic-moon',
  'magic-moon': 'magic-comet',
  'magic-comet': 'magic-aurora',
  'magic-aurora': 'magic-leopard',
  'magic-leopard': 'magic-leopard-gold',
  'magic-leopard-gold': 'magic-leopard-mega',
  'magic-leopard-mega': null,
}

/**
 * ОБМЕН 3→1 (0.0.68): каждая третья ПРОДАЖА одинакового рождает вещь
 * классом выше той же ветки. У коготков — своя лестница до МЕГА-вершины.
 */
export const CLAW_NEXT_TIER: Record<ClawId, ClawId | null> = {
  'claw-frost': 'claw-sun',
  'claw-sun': 'claw-dusk',
  'claw-dusk': 'claw-panther',
  'claw-panther': 'claw-leopard',
  'claw-leopard': 'claw-leopard-gold',
  'claw-leopard-gold': 'claw-leopard-mega',
  'claw-leopard-mega': null,
}

/** Любой лутовый id: предмет из сундучка или коготок из нарезки */
export type AnyLootId = InvItemId | ClawId

/** Следующая ступень ветки (null — вершина, обмен невозможен) */
export function nextTierOf(id: AnyLootId): AnyLootId | null {
  if (isInvItemId(id)) return NEXT_TIER[id]
  return CLAW_NEXT_TIER[id]
}

/** Цвет редкости (рамки/подписи) — в палитре игры, без синего.
 *  Леопардовые вершины (0.0.66): оранжевый → золотой → фиолетовый мега */
export const RARITY_COLOR: Record<Rarity, { border: string; text: string; bg: string }> = {
  common: { border: 'border-[#a97c50]', text: 'text-[#a97c50]', bg: 'bg-[#f3e2c8]' },
  rare: { border: 'border-[#3f8a5f]', text: 'text-[#3f8a5f]', bg: 'bg-[#e7f2e4]' },
  epic: { border: 'border-[#B33A26]', text: 'text-[#B33A26]', bg: 'bg-[#fbe9e4]' },
  legendary: { border: 'border-[#C979F0]', text: 'text-[#9A4ED6]', bg: 'bg-[#f6ecff]' },
  leopard: { border: 'border-[#E8862E]', text: 'text-[#C96A1A]', bg: 'bg-[#FFF3E2]' },
  'leopard-gold': { border: 'border-[#D9A21B]', text: 'text-[#A87410]', bg: 'bg-[#FFF8E0]' },
  'leopard-mega': { border: 'border-[#9A4ED6]', text: 'text-[#7A29C9]', bg: 'bg-[#F6E9FF]' },
}

/** Порядок сортировки склада: самое редкое сверху (0 = первый)
 *  0.0.66: леопардовые вершины выше легендарок */
export const RARITY_RANK: Record<Rarity, number> = {
  'leopard-mega': 0,
  'leopard-gold': 1,
  leopard: 2,
  legendary: 3,
  epic: 4,
  rare: 5,
  common: 6,
}

/* ════════════════ Коготки из нарезки (0.0.57) ════════════════ */

/** Цвета коготков: морозный / солнечный / сумеречный / пантера
 *  0.0.66: леопардовые вершины — леопард / золотой леопард / фиолетовый МЕГА-леопард */
export type ClawId =
  | 'claw-frost'
  | 'claw-sun'
  | 'claw-dusk'
  | 'claw-panther'
  | 'claw-leopard'
  | 'claw-leopard-gold'
  | 'claw-leopard-mega'

export interface ClawDef {
  id: ClawId
  rarity: Rarity
  /** Путь к мини-рисунку в public/inventory */
  icon: string
  /** Цена продажи в монетках 🪙 */
  sell: number
  /** Вес в рулетке когтей (пантера — самая редкая) */
  weight: number
}

/**
 * Коготки (0.0.57) выпадают из ГИГАНТСКОЙ попкорнины бонус-нарезки:
 *  - МОРОЗНЫЙ (сине-голубой) → воришки-голуби медленнее на 25%;
 *  - СОЛНЕЧНЫЙ (бело-золотой) → +15% опыта (сундучки и этапы);
 *  - СУМЕРЕЧНЫЙ (фиолетовый) → «девятая жизнь» дважды за забег;
 *  - КОГОТЬ СУПЕР-ПАНТЕРЫ (леопардовый, 5%) → мины безвредны
 *    на первых 10 этапах забега.
 *  0.0.66 — леопардовые вершины (супер-редкие):
 *  - КОГОТЬ ЛЕОПАРДА → голуби −40%, мины безвредны 20 этапов, +1 «девятая жизнь»;
 *  - ЗОЛОТОЙ КОГОТЬ ЛЕОПАРДА → ещё сильнее + опыт ×1.25;
 *  - ФИОЛЕТОВЫЙ МЕГА-КОГОТЬ → голуби −60%, мины безвредны ВЕСЬ забег,
 *    3 «девятые жизни», опыт ×1.4.
 * Слоты лапки закреплены за цветом: 7 квадратиков под артефактами.
 */
export const CLAW_DEFS: ReadonlyArray<ClawDef> = [
  { id: 'claw-frost', rarity: 'common', icon: '/inventory/claw-frost.png', sell: 40, weight: 50 },
  { id: 'claw-sun', rarity: 'rare', icon: '/inventory/claw-sun.png', sell: 120, weight: 30 },
  { id: 'claw-dusk', rarity: 'epic', icon: '/inventory/claw-dusk.png', sell: 300, weight: 15 },
  { id: 'claw-panther', rarity: 'legendary', icon: '/inventory/claw-panther.png', sell: 1000, weight: 5 },
  { id: 'claw-leopard', rarity: 'leopard', icon: '/inventory/claw-leopard.png', sell: 2500, weight: 2 },
  { id: 'claw-leopard-gold', rarity: 'leopard-gold', icon: '/inventory/claw-leopard-gold.png', sell: 6000, weight: 0.8 },
  { id: 'claw-leopard-mega', rarity: 'leopard-mega', icon: '/inventory/claw-leopard-mega.png', sell: 14000, weight: 0.3 },
]

export const CLAW_MAP: Record<ClawId, ClawDef> = CLAW_DEFS.reduce(
  (acc, d) => {
    acc[d.id] = d
    return acc
  },
  {} as Record<ClawId, ClawDef>,
)

export const isClawId = (v: unknown): v is ClawId =>
  typeof v === 'string' && v in CLAW_MAP

/** Шанс коготка из одной нарезки (0.0.57, выбор игрока: щедрый вариант) */
export const CLAW_DROP_CHANCE = 0.55

/** Индекс ступени редкости — для действия удачи (0.0.66) */
const RARITY_INDEX: Record<Rarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
  leopard: 4,
  'leopard-gold': 5,
  'leopard-mega': 6,
}

/** Кап удачи: даже полный мега-комплект не превращает лут в конфетти */
export const LUCK_CAP = 2.2

/**
 * Вес предмета с учётом удачи: чем выше ступень, тем сильнее удача
 * её поднимает. luck=1 — обычная рулетка без изменений.
 */
const luckWeight = (weight: number, rarity: Rarity, luck: number): number =>
  weight * Math.pow(Math.min(Math.max(luck, 1), LUCK_CAP), RARITY_INDEX[rarity] / 2)

/** Текущая удача игрока — по надетым кольцам/баночкам/талисманам */
function currentLuck(): number {
  return inventoryBonuses().luck
}

/** Рулетка нарезки: null — коготок не выпал, иначе его определение.
 *  Удача (0.0.66) сдвигает рулетку к редким коготкам */
export function rollClawDef(): ClawDef | null {
  if (Math.random() >= CLAW_DROP_CHANCE) return null
  const luck = currentLuck()
  const total = CLAW_DEFS.reduce((s, d) => s + luckWeight(d.weight, d.rarity, luck), 0)
  let r = Math.random() * total
  for (const d of CLAW_DEFS) {
    r -= luckWeight(d.weight, d.rarity, luck)
    if (r <= 0) return d
  }
  return CLAW_DEFS[0]
}

/* ════════════════ Состояние ════════════════ */

/** Экземпляр предмета на складе (uid — чтобы продавать/надевать поштучно) */
export interface InvItem {
  uid: string
  id: InvItemId
  /** Время дропа (мс) — для NEW-подсветки; у старых сейвов 0 */
  ts: number
}

/** Экземпляр коготка на складе (0.0.57) */
export interface ClawItem {
  uid: string
  id: ClawId
  /** Время дропа (мс) — для NEW-подсветки */
  ts: number
}

export interface InventoryState {
  /** Склад: до 36 ячеек на страницу, 72 со второй страницей */
  items: InvItem[]
  /** Коготки на складе (0.0.57) — та же сетка, свой список */
  claws: ClawItem[]
  /** Надетый ошейник (uid из items) */
  collar: string | null
  /** Надетый браслет (uid из items) */
  bracelet: string | null
  /** Надетый венец (uid из items) */
  crown: string | null
  /** Надетое кольцо (0.0.66) — удача и бонусы */
  ring: string | null
  /** Надетая баночка (0.0.66) — бонус цвета */
  jar: string | null
  /** Надетый талисман «волшебная лапка» (0.0.66) — мультибонус */
  magic: string | null
  /** Надетые коготки: слот закреплён за цветом (0.0.57) */
  clawSlots: Partial<Record<ClawId, string>>
  /** Надетые артефакты ЛАВКИ (0.0.54) — бонус действует, пока надет */
  arts: ArtifactId[]
  /** Вторая страница склада куплена (0.0.54) */
  page2: boolean
  /** Время последнего открытия инвентаря (мс) — для NEW-подсветки */
  lastOpened: number
  /** Какие лут-предметы когда-либо попадали в руки — ачивка «Полный лут» */
  everHad: InvItemId[]
  /** Продано предметов за всё время — ачивка «Торгаш» */
  sold: number
  /** Продано по видам (0.0.68): каждый 3-й одинаковый — обмен на класс выше */
  soldById: Record<string, number>
  /** Обменов 3→1 за всё время — ачивка «Переплавщик» */
  recycled: number
}

export const INVENTORY_KEY = 'popcorn-inventory'
export const INVENTORY_EVENT = 'popcorn-inventory-update'

/** Вместимость страницы склада: сетка 4×9 */
export const INV_CAPACITY = 36
/** Максимум со второй страницей: 72 ячейки */
export const INV_MAX = 72
/** Цена второй страницы склада (0.0.54) */
export const PAGE2_PRICE = 2000

export const DEFAULT_INVENTORY: InventoryState = {
  items: [],
  claws: [],
  collar: null,
  bracelet: null,
  crown: null,
  ring: null,
  jar: null,
  magic: null,
  clawSlots: {},
  arts: [],
  page2: false,
  lastOpened: 0,
  everHad: [],
  sold: 0,
  soldById: {},
  recycled: 0,
}

/** Все слоты-«одёжки» на лапке: три базовых + кольцо/баночка/талисман (0.0.66) */
export const EQUIP_KINDS: ReadonlyArray<ItemKind> = [
  'collar',
  'bracelet',
  'crown',
  'ring',
  'jar',
  'magic',
]

/** Вместимость склада игрока: 36 или 72 со второй страницей */
export const storageCap = (s: InventoryState): number => (s.page2 ? INV_MAX : INV_CAPACITY)

const RARITIES: Rarity[] = [
  'common',
  'rare',
  'epic',
  'legendary',
  'leopard',
  'leopard-gold',
  'leopard-mega',
]
export const isRarity = (v: unknown): v is Rarity =>
  typeof v === 'string' && (RARITIES as string[]).includes(v)

/** Прочитать инвентарь из localStorage (старые сейвы мигрируют мягко) */
export function loadInventory(): InventoryState {
  if (typeof window === 'undefined') return { ...DEFAULT_INVENTORY, items: [], everHad: [], arts: [] }
  try {
    const raw = window.localStorage.getItem(INVENTORY_KEY)
    if (!raw) return { ...DEFAULT_INVENTORY, items: [], everHad: [], arts: [] }
    const o = JSON.parse(raw) as Record<string, unknown>
    const items: InvItem[] = []
    if (Array.isArray(o.items)) {
      for (const it of o.items.slice(0, INV_MAX)) {
        const rec = it as Record<string, unknown>
        if (isInvItemId(rec.id) && typeof rec.uid === 'string') {
          items.push({ uid: rec.uid, id: rec.id, ts: Math.max(0, Number(rec.ts) || 0) })
        }
      }
    }
    const uids = new Set(items.map((i) => i.uid))
    const eq = (v: unknown): string | null =>
      typeof v === 'string' && uids.has(v) ? v : null
    /* 0.0.57: коготки — мягкая миграция старых сейвов */
    const claws: ClawItem[] = []
    if (Array.isArray(o.claws)) {
      for (const it of o.claws.slice(0, INV_MAX)) {
        const rec = it as Record<string, unknown>
        if (isClawId(rec.id) && typeof rec.uid === 'string') {
          claws.push({ uid: rec.uid, id: rec.id, ts: Math.max(0, Number(rec.ts) || 0) })
        }
      }
    }
    const clawUids = new Set(claws.map((c) => c.uid))
    const clawSlots: Partial<Record<ClawId, string>> = {}
    if (o.clawSlots && typeof o.clawSlots === 'object') {
      for (const [k, v] of Object.entries(o.clawSlots as Record<string, unknown>)) {
        if (isClawId(k) && typeof v === 'string' && clawUids.has(v)) clawSlots[k] = v
      }
    }
    /* 0.0.54 миграция: у старых сейвов артефакты ЛАВКИ действовали сразу после
       покупки — надеваем все купленные, чтобы бонусы не пропали */
    const arts = Array.isArray(o.arts)
      ? [...new Set(o.arts.filter(isArtifactId) as ArtifactId[])]
      : [...getMarketSnapshot().artifacts]
    /* everHad — всё, что когда-либо было на складе (старые сейвы: текущие предметы) */
    const everSet = new Set<InvItemId>(
      Array.isArray(o.everHad) ? (o.everHad.filter(isInvItemId) as InvItemId[]) : [],
    )
    for (const it of items) everSet.add(it.id)
    /* 0.0.68: счётчик продаж по видам — мягкая миграция старых сейвов */
    const soldById: Record<string, number> = {}
    if (o.soldById && typeof o.soldById === 'object') {
      for (const [k, v] of Object.entries(o.soldById as Record<string, unknown>)) {
        const n = Math.floor(Number(v) || 0)
        if (n > 0) soldById[k] = n
      }
    }
    return {
      items,
      claws,
      collar: eq(o.collar),
      bracelet: eq(o.bracelet),
      crown: eq(o.crown),
      /* 0.0.66: новые слоты — у старых сейвов их просто нет (null) */
      ring: eq(o.ring),
      jar: eq(o.jar),
      magic: eq(o.magic),
      clawSlots,
      arts,
      page2: o.page2 === true,
      lastOpened: Math.max(0, Math.floor(Number(o.lastOpened) || 0)),
      everHad: [...everSet],
      sold: Math.max(0, Math.floor(Number(o.sold) || 0)),
      soldById,
      recycled: Math.max(0, Math.floor(Number(o.recycled) || 0)),
    }
  } catch {
    return { ...DEFAULT_INVENTORY, items: [], everHad: [], arts: [] }
  }
}

let snapshotCache: InventoryState | null = null

/** Стабильный снапшот для useSyncExternalStore */
export function getInventorySnapshot(): InventoryState {
  if (snapshotCache === null) snapshotCache = loadInventory()
  return snapshotCache
}

/** Подписка на изменения инвентаря */
export function subscribeInventory(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(INVENTORY_EVENT, cb)
  return () => window.removeEventListener(INVENTORY_EVENT, cb)
}

function saveInventory(s: InventoryState): void {
  snapshotCache = s
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(s))
    window.dispatchEvent(new Event(INVENTORY_EVENT))
  } catch {
    /* приватный режим — игнорируем */
  }
}

/** Свежий uid: хватит простого счётчика времени */
const newUid = (): string => `i${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`

/* ════════════════ NEW-подсветка ════════════════ */

/** Предмет ещё не видели в инвентаре (дроп после последнего открытия) */
export const isNewItem = (item: { ts: number }, lastOpened: number): boolean =>
  item.ts > 0 && item.ts > lastOpened

/** Сколько новинок ждёт на складе — бейдж на кнопке ИНВЕНТАРЬ (0.0.57: и коготки) */
export function countNewItems(state: InventoryState = getInventorySnapshot()): number {
  return (
    state.items.reduce((n, it) => n + (isNewItem(it, state.lastOpened) ? 1 : 0), 0) +
    state.claws.reduce((n, it) => n + (isNewItem(it, state.lastOpened) ? 1 : 0), 0)
  )
}

/** Открыли инвентарь: всё, что было на складе, — уже видели */
export function markInventoryOpened(): void {
  const cur = getInventorySnapshot()
  const now = Date.now()
  if (now - cur.lastOpened < 500) return
  saveInventory({ ...cur, lastOpened: now })
}

/* ════════════════ Действия ════════════════ */

/** Результат дропа: предмет добавлен ИЛИ склад полон (возврат цены продажи) */
export interface DropResult {
  /** Что выпало (даже при переполнении — для тоста) */
  def: InvDef
  /** true — предмет лёг на склад; false — склад полон, предмет сразу продан */
  stored: boolean
  /** Монетки при автопродаже (0, если предмет хранится) */
  coins: number
}

/** Рулетка лута: взвешенно по каталогу. Удача (0.0.66) — надетые
 *  кольца/баночки/талисманы поднимают вес редких ступеней.
 *  Венцы и леопардовые вершины — только редкие ступени, потому особо ценные */
export function rollInvDef(): InvDef {
  const luck = currentLuck()
  let r = Math.random() * INV_DEFS.reduce((s, d) => s + luckWeight(d.weight, d.rarity, luck), 0)
  for (const d of INV_DEFS) {
    r -= luckWeight(d.weight, d.rarity, luck)
    if (r <= 0) return d
  }
  return INV_DEFS[0]
}

/** Склад полон? Коготки лежат в тех же ячейках (0.0.57) */
export const storageFull = (s: InventoryState): boolean =>
  s.items.length + s.claws.length >= storageCap(s)

/* ── БОССОВЫЕ БАНОЧКИ (0.0.69) ──
 * Каждый босс хранит СВОЮ баночку с уникальным эффектом:
 *   ГОЛУБЬ → голубиная (голуби медленнее) · МАЛЫШ → детская (воры крадут меньше)
 *   ЛЕВ → львиная (Лихорадка длиннее) · ЦЫГАН → цыганская (золотые зёрна чаще)
 *   ЛАНА (куница) → баночка Ланы (+1 сердечко)
 * Чистая победа без потери сердец — баночка гарантирована.
 * Шанс капает удачей: надетые кольца/баночки поднимают дроп */
export const BOSS_JAR_BY_KIND: Record<BossKind, InvItemId> = {
  kid: 'jar-kid',
  lion: 'jar-lion',
  marten: 'jar-marten',
  pigeon: 'jar-pigeon',
  gypsy: 'jar-gypsy',
}

/** Базовый шанс баночки за победу над боссом (удача умножает, кап 90%) */
export const BOSS_JAR_BASE_CHANCE = 0.5

/** Уронить баночку с победы над боссом. null — сегодня не повезло.
 *  guarantee — «чистая победа» (бои без потери сердец) даёт баночку точно */
export function dropBossJar(kind: BossKind, guarantee = false): DropResult | null {
  const luck = currentLuck()
  const chance = Math.min(0.9, BOSS_JAR_BASE_CHANCE * luck)
  if (!guarantee && Math.random() > chance) return null
  const jarId = BOSS_JAR_BY_KIND[kind]
  const def = INV_MAP[jarId]
  const cur = getInventorySnapshot()
  if (storageFull(cur)) {
    return { def, stored: false, coins: def.sell }
  }
  const item: InvItem = { uid: newUid(), id: jarId, ts: Date.now() }
  const everSet = new Set<InvItemId>(cur.everHad)
  everSet.add(jarId)
  saveInventory({ ...cur, items: [...cur.items, item], everHad: [...everSet] })
  return { def, stored: true, coins: 0 }
}

/** Уронить предмет сундучка на склад. Если склад полон — автопродажа */
export function dropInvItem(): DropResult {
  const def = rollInvDef()
  const cur = getInventorySnapshot()
  if (storageFull(cur)) {
    return { def, stored: false, coins: def.sell }
  }
  const item: InvItem = { uid: newUid(), id: def.id, ts: Date.now() }
  const everSet = new Set<InvItemId>(cur.everHad)
  everSet.add(def.id)
  saveInventory({ ...cur, items: [...cur.items, item], everHad: [...everSet] })
  return { def, stored: true, coins: 0 }
}

/** Результат обмена 3→1 (0.0.68): вещь классом выше за 3-ю продажу одинакового */
export interface SellTradeUp {
  /** Что родилось (id и def — предмет или коготок) */
  id: AnyLootId
  def: InvDef | ClawDef
  /** true — лег на склад; false — склад полон, сразу продан */
  stored: boolean
  /** Монетки, если вещь сразу продана (0, если хранится) */
  coins: number
}

/** Результат продажи: монетки + возможно обмен 3→1 */
export interface SellResult {
  /** Монетки за сам предмет (0 — не найден) */
  coins: number
  /** Обмен: 3-я продажа одинакового — вещь классом выше */
  tradeUp?: SellTradeUp
}

/**
 * Продать предмет или коготок со склада (0 — не найден).
 * Снятые при продаже слоты: базовые три + кольцо/баночка/талисман (0.0.66).
 * ОБМЕН 3→1 (0.0.68): каждая третья продажа одинакового рождает вещь классом
 * выше — продажа освободила ячейку, так что обмен не переполняет склад.
 */
export function sellInvItem(uid: string): SellResult {
  const cur = getInventorySnapshot()
  const item = cur.items.find((i) => i.uid === uid)
  if (item) {
    const coins = INV_MAP[item.id].sell
    const cleared = {} as InventoryState
    for (const k of EQUIP_KINDS) {
      cleared[k] = cur[k] === uid ? null : cur[k]
    }
    const soldById = { ...cur.soldById, [item.id]: (cur.soldById[item.id] || 0) + 1 }
    const base: InventoryState = {
      ...cur,
      ...cleared,
      items: cur.items.filter((i) => i.uid !== uid),
      sold: cur.sold + 1,
      soldById,
    }
    return { coins, tradeUp: commitSellTrade(base, item.id) }
  }
  const claw = cur.claws.find((i) => i.uid === uid)
  if (!claw) return { coins: 0 }
  const coins = CLAW_MAP[claw.id].sell
  const slots = { ...cur.clawSlots }
  if (slots[claw.id] === uid) delete slots[claw.id]
  const soldById = { ...cur.soldById, [claw.id]: (cur.soldById[claw.id] || 0) + 1 }
  const base: InventoryState = {
    ...cur,
    claws: cur.claws.filter((i) => i.uid !== uid),
    clawSlots: slots,
    sold: cur.sold + 1,
    soldById,
  }
  return { coins, tradeUp: commitSellTrade(base, claw.id) }
}

/** Сохранить продажу; если это был 3-й одинаковый — уронить вещь классом выше */
function commitSellTrade(base: InventoryState, soldId: AnyLootId): SellTradeUp | undefined {
  const nextId = (base.soldById[soldId] || 0) % 3 === 0 ? nextTierOf(soldId) : null
  if (!nextId) {
    saveInventory(base)
    return undefined
  }
  const recycled = base.recycled + 1
  if (isInvItemId(nextId)) {
    const def = INV_MAP[nextId]
    if (storageFull(base)) {
      saveInventory(base)
      return { id: nextId, def, stored: false, coins: def.sell }
    }
    const fresh: InvItem = { uid: newUid(), id: nextId, ts: Date.now() }
    const everSet = new Set<InvItemId>(base.everHad)
    everSet.add(nextId)
    saveInventory({ ...base, items: [...base.items, fresh], everHad: [...everSet], recycled })
    return { id: nextId, def, stored: true, coins: 0 }
  }
  const cdef = CLAW_MAP[nextId]
  if (storageFull(base)) {
    saveInventory(base)
    return { id: nextId, def: cdef, stored: false, coins: cdef.sell }
  }
  const fresh: ClawItem = { uid: newUid(), id: nextId, ts: Date.now() }
  saveInventory({ ...base, claws: [...base.claws, fresh], recycled })
  return { id: nextId, def: cdef, stored: true, coins: 0 }
}

/** Надеть предмет по uid (снимает предыдущий того же слота) */
export function equipInvItem(uid: string): boolean {
  const cur = getInventorySnapshot()
  const item = cur.items.find((i) => i.uid === uid)
  if (!item) return false
  const kind = INV_MAP[item.id].kind
  saveInventory({ ...cur, [kind]: uid } as InventoryState)
  return true
}

/** Снять предмет со слота */
export function unequipInvSlot(kind: ItemKind): boolean {
  const cur = getInventorySnapshot()
  if (cur[kind] === null) return false
  saveInventory({ ...cur, [kind]: null } as InventoryState)
  return true
}

/* ════════════════ Артефакты ЛАВКИ на лапке (0.0.54) ════════════════ */

/** Надеть артефакт лавки (только купленный). Бонусы действуют, пока надет */
export function equipArtifactInv(id: ArtifactId): boolean {
  if (!getMarketSnapshot().artifacts.includes(id)) return false
  const cur = getInventorySnapshot()
  if (cur.arts.includes(id)) return false
  saveInventory({ ...cur, arts: [...cur.arts, id] })
  return true
}

/** Снять артефакт лавки с лапки */
export function unequipArtifactInv(id: ArtifactId): boolean {
  const cur = getInventorySnapshot()
  if (!cur.arts.includes(id)) return false
  saveInventory({ ...cur, arts: cur.arts.filter((a) => a !== id) })
  return true
}

/** Список надетых артефактов — для marketBonuses(market, arts) */
export const equippedArtifacts = (s: InventoryState): ArtifactId[] => s.arts

/* ════════════════ Вторая страница склада (0.0.54) ════════════════ */

/** Купить вторую страницу (+36 ячеек). Монетки списывает вызывающий */
export function buyPage2(): boolean {
  const cur = getInventorySnapshot()
  if (cur.page2) return false
  saveInventory({ ...cur, page2: true })
  return true
}

/* ════════════════ Коготки: склад, слоты, бонусы (0.0.57) ════════════════ */

/** Результат падения коготка: положен на склад ИЛИ склад полон (автопродажа) */
export interface ClawDropResult {
  def: ClawDef
  stored: boolean
  /** Монетки при автопродаже (0, если коготок хранится) */
  coins: number
}

/** Уронить коготок из нарезки на склад. Если склад полон — автопродажа */
export function addClawToStorage(def: ClawDef): ClawDropResult {
  const cur = getInventorySnapshot()
  if (storageFull(cur)) {
    return { def, stored: false, coins: def.sell }
  }
  const item: ClawItem = { uid: newUid(), id: def.id, ts: Date.now() }
  saveInventory({ ...cur, claws: [...cur.claws, item] })
  return { def, stored: true, coins: 0 }
}

/** Коготок сейчас в своём слоте? (uid жив и лежит на складе) */
export function clawEquipped(state: InventoryState, id: ClawId): boolean {
  const uid = state.clawSlots[id]
  return !!uid && state.claws.some((c) => c.uid === uid)
}

/** Надеть коготок по uid в слот своего цвета */
export function equipClaw(uid: string): boolean {
  const cur = getInventorySnapshot()
  const claw = cur.claws.find((i) => i.uid === uid)
  if (!claw) return false
  saveInventory({ ...cur, clawSlots: { ...cur.clawSlots, [claw.id]: uid } })
  return true
}

/** Снять коготок со слота */
export function unequipClaw(id: ClawId): boolean {
  const cur = getInventorySnapshot()
  if (!cur.clawSlots[id]) return false
  const slots = { ...cur.clawSlots }
  delete slots[id]
  saveInventory({ ...cur, clawSlots: slots })
  return true
}

export interface ClawBonuses {
  /** Замедление воришек-голубей (0..0.6) — морозный коготок и леопардовые */
  pigeonSlow: number
  /** Множитель опыта — солнечный коготок и золотые леопарды */
  xpMult: number
  /** «Девятая жизнь» раз за забег — сумеречный и леопардовые коготки */
  revives: number
  /** Этапов иммунитета к минам с начала забега — пантера и леопардовые */
  mineImmuneStages: number
}

export const ZERO_CLAW_BONUS: ClawBonuses = {
  pigeonSlow: 0,
  xpMult: 1,
  revives: 0,
  mineImmuneStages: 0,
}

/**
 * Эффекты каждого коготка (0.0.66): таблица вместо if-цепочек.
 * При надевании нескольких эффекты складываются (замедление — берётся максимум).
 */
const CLAW_FX: Record<ClawId, ClawBonuses> = {
  'claw-frost': { pigeonSlow: 0.25, xpMult: 1, revives: 0, mineImmuneStages: 0 },
  'claw-sun': { pigeonSlow: 0, xpMult: 1.15, revives: 0, mineImmuneStages: 0 },
  'claw-dusk': { pigeonSlow: 0, xpMult: 1, revives: 2, mineImmuneStages: 0 },
  'claw-panther': { pigeonSlow: 0, xpMult: 1, revives: 0, mineImmuneStages: 10 },
  /* Леопардовые вершины (0.0.66): сильнее и пантеры, и всех базовых */
  'claw-leopard': { pigeonSlow: 0.4, xpMult: 1, revives: 1, mineImmuneStages: 20 },
  'claw-leopard-gold': { pigeonSlow: 0.5, xpMult: 1.25, revives: 2, mineImmuneStages: 30 },
  'claw-leopard-mega': { pigeonSlow: 0.6, xpMult: 1.4, revives: 3, mineImmuneStages: 999 },
}

/** Бонусы надетых коготков (0.0.57; 0.0.66 — стекание леопардовых с базовыми) */
export function clawBonuses(state: InventoryState = getInventorySnapshot()): ClawBonuses {
  const acc: ClawBonuses = { ...ZERO_CLAW_BONUS }
  for (const d of CLAW_DEFS) {
    if (!clawEquipped(state, d.id)) continue
    const fx = CLAW_FX[d.id]
    acc.pigeonSlow = Math.max(acc.pigeonSlow, fx.pigeonSlow)
    acc.xpMult *= fx.xpMult
    acc.revives += fx.revives
    acc.mineImmuneStages += fx.mineImmuneStages
  }
  return acc
}

/* ════════════════ Ачивки инвентаря ════════════════ */

/** Все 11 лутовых предметов побывали в руках — «Полный лут» */
export function lootAllHad(state: InventoryState): boolean {
  const has = new Set<InvItemId>(state.everHad)
  return LOOT_IDS.every((id) => has.has(id))
}

/** Легендарный предмет сейчас на лапке — «Корона на лапку» */
export function legendaryEquipped(state: InventoryState): boolean {
  return state.items.some(
    (i) =>
      (i.uid === state.collar || i.uid === state.bracelet || i.uid === state.crown) &&
      INV_MAP[i.id].rarity === 'legendary',
  )
}

/* ════════════════ Бонусы ════════════════ */

export interface InvBonuses {
  /** Множитель монеток (ошейник): сундучки, попкорнины, золото, Лихорадка */
  coins: number
  /** Множитель опыта (браслет): сундучки и награда за этап */
  xp: number
  /** Множитель алмазов путешествий (венец) */
  gems: number
  /** Удача (0.0.66): кольца/баночки/талисманы — редкий лут выпадает чаще */
  luck: number
}

export const ZERO_INV_BONUS: InvBonuses = { coins: 1, xp: 1, gems: 1, luck: 1 }

/** Волшебные эффекты предмета: у базовых трёх выводятся из kind+bonus,
 *  у новых веток (0.0.66) берутся из fx */
export function defFx(d: InvDef): InvFx {
  if (d.fx) return d.fx
  switch (d.kind) {
    case 'collar':
      return { coins: 1 + d.bonus }
    case 'bracelet':
      return { xp: 1 + d.bonus }
    case 'crown':
      return { gems: 1 + d.bonus }
    default:
      return {}
  }
}

/** Множители надетых предметов (по умолчанию 1 — ничего не надето).
 *  0.0.66: учитываются и кольцо, и баночка, и талисман «волшебная лапка» */
export function inventoryBonuses(state: InventoryState = getInventorySnapshot()): InvBonuses {
  const byUid = (uid: string | null): InvDef | null => {
    if (!uid) return null
    const item = state.items.find((i) => i.uid === uid)
    return item ? INV_MAP[item.id] : null
  }
  const out: InvBonuses = { ...ZERO_INV_BONUS }
  for (const kind of EQUIP_KINDS) {
    const def = byUid(state[kind])
    if (!def) continue
    const fx = defFx(def)
    if (fx.coins) out.coins *= fx.coins
    if (fx.xp) out.xp *= fx.xp
    if (fx.gems) out.gems *= fx.gems
    if (fx.luck) out.luck *= fx.luck
  }
  return out
}

/* ════════════════ Спец-эффекты боссовых баночек (0.0.69) ════════════════ */

/** Спец-эффекты надетой баночки — не множители валют, а правила игры */
export interface JarFx {
  /** Голуби-воришки медленнее (0..0.6) */
  pigeonSlow: number
  /** Все воры крадут на долю меньше (0.25 = −25%) */
  theftDown: number
  /** Лихорадка длиннее, секунд */
  feverPlus: number
  /** Шанс золотых зёрен ×N */
  goldenUp: number
  /** +N сердечек к максимуму забега */
  heartsPlus: number
}

export const ZERO_JAR_FX: JarFx = {
  pigeonSlow: 0,
  theftDown: 0,
  feverPlus: 0,
  goldenUp: 1,
  heartsPlus: 0,
}

/** Эффекты надетой баночки (слот «jar»); пусто — нейтральный набор */
export function jarBonuses(state: InventoryState = getInventorySnapshot()): JarFx {
  const uid = state.jar
  if (!uid) return ZERO_JAR_FX
  const item = state.items.find((i) => i.uid === uid)
  if (!item) return ZERO_JAR_FX
  const fx = INV_MAP[item.id]?.fx
  if (!fx) return ZERO_JAR_FX
  return {
    pigeonSlow: fx.pigeonSlow ?? 0,
    theftDown: fx.theftDown ?? 0,
    feverPlus: fx.feverPlus ?? 0,
    goldenUp: fx.goldenUp ?? 1,
    heartsPlus: fx.heartsPlus ?? 0,
  }
}
