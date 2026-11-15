/**
 * ИНВЕНТАРЬ «POPCORN PAWS» — лут из сундучков и лапка со слотами.
 *
 * Как работает:
 *  - Сундучки после этапа, кроме перка и подарка, роняют ПРЕДМЕТ
 *    (ошейник / браслет / венец) одной из четырёх редкостей;
 *  - Предметы складываются на склад — сетка 4×9 = 36 ячеек; вторая
 *    страница (+36 ячеек, всего 72) покупается за монетки (0.0.54);
 *  - Простые предметы можно ПРОДАТЬ за монетки, редкие — НАДЕТЬ на лапку;
 *    три одинаковых — ПЕРЕПЛАВИТЬ в предмет ступенью выше (0.0.54);
 *  - Слоты лапки: ОШЕЙНИК (+монетки), БРАСЛЕТ (+опыт), ВЕНЕЦ (+алмазы путешествий).
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
 * и счётчикам sold/recycled; легендарка на лапке — по текущим слотам.
 *
 * Хранится в localStorage одним JSON-объектом; изменения бродкастятся
 * событием INVENTORY_EVENT (useSyncExternalStore в UI).
 */

import { getMarketSnapshot, isArtifactId, type ArtifactId } from './market'

/* ════════════════ Каталог предметов ════════════════ */

export type ItemKind = 'collar' | 'bracelet' | 'crown'
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type InvItemId =
  | 'col-leather'
  | 'col-red'
  | 'col-spiked'
  | 'col-diamond'
  | 'bra-beads'
  | 'bra-silver'
  | 'bra-gold'
  | 'bra-legend'
  | 'crown-gold'
  | 'crown-diamond'
  | 'crown-ancient'

export interface InvDef {
  id: InvItemId
  kind: ItemKind
  rarity: Rarity
  /** Путь к мини-рисунку в public/inventory */
  icon: string
  /** Цена продажи в монетках 🪙 */
  sell: number
  /** Сила бонуса: 0.08 = +8% */
  bonus: number
  /** Вес в рулетке лута сундучков (чем реже, тем ценнее) */
  weight: number
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
  /* Браслеты */
  { id: 'bra-beads', kind: 'bracelet', rarity: 'common', icon: '/inventory/bra-beads.png', sell: 25, bonus: 0.04, weight: 22 },
  { id: 'bra-silver', kind: 'bracelet', rarity: 'rare', icon: '/inventory/bra-silver.png', sell: 75, bonus: 0.08, weight: 12 },
  { id: 'bra-gold', kind: 'bracelet', rarity: 'epic', icon: '/inventory/bra-gold.png', sell: 200, bonus: 0.12, weight: 6 },
  { id: 'bra-legend', kind: 'bracelet', rarity: 'legendary', icon: '/inventory/bra-legend.png', sell: 600, bonus: 0.18, weight: 3 },
  /* Легендарные венцы */
  { id: 'crown-gold', kind: 'crown', rarity: 'legendary', icon: '/inventory/crown-gold.png', sell: 600, bonus: 0.1, weight: 4 },
  { id: 'crown-diamond', kind: 'crown', rarity: 'legendary', icon: '/inventory/crown-diamond.png', sell: 800, bonus: 0.15, weight: 2 },
  { id: 'crown-ancient', kind: 'crown', rarity: 'legendary', icon: '/inventory/crown-ancient.png', sell: 1000, bonus: 0.2, weight: 1 },
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

/** Все 11 лутовых предметов — для ачивки «Полный лут» */
export const LOOT_IDS: ReadonlyArray<InvItemId> = INV_DEFS.map((d) => d.id)

/**
 * Переплавка 3→1 (0.0.54): ступень выше той же ветки.
 * null — вершина ветки (переплавлять нельзя).
 */
export const NEXT_TIER: Record<InvItemId, InvItemId | null> = {
  'col-leather': 'col-red',
  'col-red': 'col-spiked',
  'col-spiked': 'col-diamond',
  'col-diamond': null,
  'bra-beads': 'bra-silver',
  'bra-silver': 'bra-gold',
  'bra-gold': 'bra-legend',
  'bra-legend': null,
  'crown-gold': 'crown-diamond',
  'crown-diamond': 'crown-ancient',
  'crown-ancient': null,
}

/** Цвет редкости (рамки/подписи) — в палитре игры, без синего */
export const RARITY_COLOR: Record<Rarity, { border: string; text: string; bg: string }> = {
  common: { border: 'border-[#a97c50]', text: 'text-[#a97c50]', bg: 'bg-[#f3e2c8]' },
  rare: { border: 'border-[#3f8a5f]', text: 'text-[#3f8a5f]', bg: 'bg-[#e7f2e4]' },
  epic: { border: 'border-[#B33A26]', text: 'text-[#B33A26]', bg: 'bg-[#fbe9e4]' },
  legendary: { border: 'border-[#C979F0]', text: 'text-[#9A4ED6]', bg: 'bg-[#f6ecff]' },
}

/* ════════════════ Состояние ════════════════ */

/** Экземпляр предмета на складе (uid — чтобы продавать/надевать поштучно) */
export interface InvItem {
  uid: string
  id: InvItemId
  /** Время дропа (мс) — для NEW-подсветки; у старых сейвов 0 */
  ts: number
}

export interface InventoryState {
  /** Склад: до 36 ячеек на страницу, 72 со второй страницей */
  items: InvItem[]
  /** Надетый ошейник (uid из items) */
  collar: string | null
  /** Надетый браслет (uid из items) */
  bracelet: string | null
  /** Надетый венец (uid из items) */
  crown: string | null
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
  /** Переплавок за всё время — ачивка «Переплавщик» */
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
  collar: null,
  bracelet: null,
  crown: null,
  arts: [],
  page2: false,
  lastOpened: 0,
  everHad: [],
  sold: 0,
  recycled: 0,
}

/** Вместимость склада игрока: 36 или 72 со второй страницей */
export const storageCap = (s: InventoryState): number => (s.page2 ? INV_MAX : INV_CAPACITY)

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary']
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
    return {
      items,
      collar: eq(o.collar),
      bracelet: eq(o.bracelet),
      crown: eq(o.crown),
      arts,
      page2: o.page2 === true,
      lastOpened: Math.max(0, Math.floor(Number(o.lastOpened) || 0)),
      everHad: [...everSet],
      sold: Math.max(0, Math.floor(Number(o.sold) || 0)),
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
export const isNewItem = (item: InvItem, lastOpened: number): boolean =>
  item.ts > 0 && item.ts > lastOpened

/** Сколько новинок ждёт на складе — бейдж на кнопке ИНВЕНТАРЬ */
export function countNewItems(state: InventoryState = getInventorySnapshot()): number {
  return state.items.reduce((n, it) => n + (isNewItem(it, state.lastOpened) ? 1 : 0), 0)
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

const totalWeight = INV_DEFS.reduce((s, d) => s + d.weight, 0)

/** Рулетка лута: взвешенно по каталогу (венцы — только легендарки, потому редкие) */
export function rollInvDef(): InvDef {
  let r = Math.random() * totalWeight
  for (const d of INV_DEFS) {
    r -= d.weight
    if (r <= 0) return d
  }
  return INV_DEFS[0]
}

/** Уронить предмет сундучка на склад. Если склад полон — автопродажа */
export function dropInvItem(): DropResult {
  const def = rollInvDef()
  const cur = getInventorySnapshot()
  if (cur.items.length >= storageCap(cur)) {
    return { def, stored: false, coins: def.sell }
  }
  const item: InvItem = { uid: newUid(), id: def.id, ts: Date.now() }
  const everSet = new Set<InvItemId>(cur.everHad)
  everSet.add(def.id)
  saveInventory({ ...cur, items: [...cur.items, item], everHad: [...everSet] })
  return { def, stored: true, coins: 0 }
}

/** Продать предмет со склада: возвращает монетки (0 — не найден) */
export function sellInvItem(uid: string): number {
  const cur = getInventorySnapshot()
  const item = cur.items.find((i) => i.uid === uid)
  if (!item) return 0
  const coins = INV_MAP[item.id].sell
  saveInventory({
    ...cur,
    items: cur.items.filter((i) => i.uid !== uid),
    collar: cur.collar === uid ? null : cur.collar,
    bracelet: cur.bracelet === uid ? null : cur.bracelet,
    crown: cur.crown === uid ? null : cur.crown,
    sold: cur.sold + 1,
  })
  return coins
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

/* ════════════════ Переплавка 3→1 (0.0.54) ════════════════ */

export interface RecycleInfo {
  /** Сколько предметов ветки участвует: выбранный + до 2 свободных (1..3) */
  have: number
  /** Что получится (null — вершина ветки, переплавка невозможна) */
  next: InvItemId | null
}

/** Данные для кнопки переплавки по выбранному предмету.
    Выбранный участвует всегда: если он надет — снимется при переплавке */
export function recycleInfo(state: InventoryState, uid: string): RecycleInfo {
  const sel = state.items.find((i) => i.uid === uid)
  if (!sel) return { have: 0, next: null }
  const equipped = new Set([state.collar, state.bracelet, state.crown])
  const othersFree = state.items.filter(
    (i) => i.id === sel.id && !equipped.has(i.uid) && i.uid !== uid,
  ).length
  return { have: 1 + Math.min(othersFree, 2), next: NEXT_TIER[sel.id] }
}

export interface RecycleResult {
  ok: boolean
  /** Предмет следующей ступени (для тоста) */
  next?: InvDef
}

/**
 * Переплавить: выбранный предмет + 2 таких же свободных уходят,
 * взамен рождается предмет ступенью выше той же ветки.
 * Выбранный может быть надет — слот снимается автоматически.
 * 3 consumed → 1 added: склад не переполняется никогда.
 */
export function recycleInvItem(uid: string): RecycleResult {
  const cur = getInventorySnapshot()
  const sel = cur.items.find((i) => i.uid === uid)
  if (!sel) return { ok: false }
  const nextId = NEXT_TIER[sel.id]
  if (!nextId) return { ok: false }
  const equipped = new Set([cur.collar, cur.bracelet, cur.crown])
  const others = cur.items.filter((i) => i.id === sel.id && !equipped.has(i.uid) && i.uid !== uid)
  if (others.length < 2) return { ok: false }
  const gone = new Set([uid, others[0].uid, others[1].uid])
  const fresh: InvItem = { uid: newUid(), id: nextId, ts: Date.now() }
  const everSet = new Set<InvItemId>(cur.everHad)
  everSet.add(nextId)
  saveInventory({
    ...cur,
    items: [...cur.items.filter((i) => !gone.has(i.uid)), fresh],
    collar: cur.collar === uid ? null : cur.collar,
    bracelet: cur.bracelet === uid ? null : cur.bracelet,
    crown: cur.crown === uid ? null : cur.crown,
    everHad: [...everSet],
    recycled: cur.recycled + 1,
  })
  return { ok: true, next: INV_MAP[nextId] }
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
}

export const ZERO_INV_BONUS: InvBonuses = { coins: 1, xp: 1, gems: 1 }

/** Множители надетых предметов (по умолчанию 1 — ничего не надето) */
export function inventoryBonuses(state: InventoryState = getInventorySnapshot()): InvBonuses {
  const byUid = (uid: string | null): InvDef | null => {
    if (!uid) return null
    const item = state.items.find((i) => i.uid === uid)
    return item ? INV_MAP[item.id] : null
  }
  const collar = byUid(state.collar)
  const bracelet = byUid(state.bracelet)
  const crown = byUid(state.crown)
  return {
    coins: collar ? 1 + collar.bonus : 1,
    xp: bracelet ? 1 + bracelet.bonus : 1,
    gems: crown ? 1 + crown.bonus : 1,
  }
}
