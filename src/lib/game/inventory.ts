/**
 * ИНВЕНТАРЬ «POPCORN PAWS» (0.0.53) — лут из сундучков и лапка со слотами.
 *
 * Как работает:
 *  - Сундучки после этапа, кроме перка и подарка, роняют ПРЕДМЕТ
 *    (ошейник / браслет / венец) одной из четырёх редкостей;
 *  - Предметы складываются на склад (сетка 4×9 = 36 ячеек);
 *  - Простые предметы можно ПРОДАТЬ за монетки, редкие — НАДЕТЬ на лапку;
 *  - Слоты лапки: ОШЕЙНИК (+монетки), БРАСЛЕТ (+опыт), ВЕНЕЦ (+алмазы путешествий).
 *    Надеть можно по одному предмету каждого вида; бонус действует сразу.
 *
 * Хранится в localStorage одним JSON-объектом; изменения бродкастятся
 * событием INVENTORY_EVENT (useSyncExternalStore в UI).
 */

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
}

export interface InventoryState {
  /** Склад: до 36 предметов (сетка 4×9) */
  items: InvItem[]
  /** Надетый ошейник (uid из items) */
  collar: string | null
  /** Надетый браслет (uid из items) */
  bracelet: string | null
  /** Надетый венец (uid из items) */
  crown: string | null
}

export const INVENTORY_KEY = 'popcorn-inventory'
export const INVENTORY_EVENT = 'popcorn-inventory-update'

/** Вместимость склада: сетка 4×9 */
export const INV_CAPACITY = 36

export const DEFAULT_INVENTORY: InventoryState = {
  items: [],
  collar: null,
  bracelet: null,
  crown: null,
}

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary']
export const isRarity = (v: unknown): v is Rarity =>
  typeof v === 'string' && (RARITIES as string[]).includes(v)

/** Прочитать инвентарь из localStorage (старые сейвы мигрируют мягко) */
export function loadInventory(): InventoryState {
  if (typeof window === 'undefined') return { ...DEFAULT_INVENTORY, items: [] }
  try {
    const raw = window.localStorage.getItem(INVENTORY_KEY)
    if (!raw) return { ...DEFAULT_INVENTORY, items: [] }
    const o = JSON.parse(raw) as Record<string, unknown>
    const items: InvItem[] = []
    if (Array.isArray(o.items)) {
      for (const it of o.items.slice(0, INV_CAPACITY)) {
        const rec = it as Record<string, unknown>
        if (isInvItemId(rec.id) && typeof rec.uid === 'string') {
          items.push({ uid: rec.uid, id: rec.id })
        }
      }
    }
    const uids = new Set(items.map((i) => i.uid))
    const eq = (v: unknown): string | null =>
      typeof v === 'string' && uids.has(v) ? v : null
    return {
      items,
      collar: eq(o.collar),
      bracelet: eq(o.bracelet),
      crown: eq(o.crown),
    }
  } catch {
    return { ...DEFAULT_INVENTORY, items: [] }
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
  if (cur.items.length >= INV_CAPACITY) {
    return { def, stored: false, coins: def.sell }
  }
  const item: InvItem = { uid: newUid(), id: def.id }
  saveInventory({ ...cur, items: [...cur.items, item] })
  return { def, stored: true, coins: 0 }
}

/** Продать предмет со склада: возвращает монетки (0 — не найден) */
export function sellInvItem(uid: string): number {
  const cur = getInventorySnapshot()
  const item = cur.items.find((i) => i.uid === uid)
  if (!item) return 0
  const coins = INV_MAP[item.id].sell
  const next: InventoryState = {
    items: cur.items.filter((i) => i.uid !== uid),
    collar: cur.collar === uid ? null : cur.collar,
    bracelet: cur.bracelet === uid ? null : cur.bracelet,
    crown: cur.crown === uid ? null : cur.crown,
  }
  saveInventory(next)
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
