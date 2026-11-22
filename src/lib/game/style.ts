/**
 * СТИЛЬ КОТИКА «POPCORN PAWS» (v0.0.75) — аватары, рамки, фоны и цвета меню.
 *
 *  🌾 Зёрнышки наконец-то получили трату: вся ЛАВКА СТИЛЯ покупается
 *    за зерно (бывшая «кукуруза», копившаяся без дела с 0.0.54).
 *
 *  👤 Аватар — пиксель-арт котик (public/avatars/*.png): виден в меню,
 *    в локальном и мировом лидербордах. Дефолтный «kitten» есть у всех.
 *  🖼 Рамка — декоративное кольцо вокруг аватара (CSS-класс).
 *  🎨 Фон — подмена фона главного меню (CSS-класс на контейнере).
 *  🌈 Цвет — акцентная тема меню (CSS-переменные на контейнере).
 *
 * Хранится в localStorage ('popcorn-style'), бродкастит то же событие
 * магазина ('popcorn-store-update'), что и весь остальной метапрогресс —
 * UI обновляется мгновенно через useSyncExternalStore.
 */

import { spendGrains } from './market'
import { charLevel, getTotalXp } from './meta'

/* ════════════════ Каталог ════════════════ */

export type AvatarId =
  | 'kitten'
  | 'smoke'
  | 'ninja'
  | 'snow'
  | 'siam'
  | 'spot'
  | 'royale'
  | 'stripes'

export type FrameId = 'none' | 'wood' | 'gold' | 'hearts' | 'runic' | 'neon' | 'laurel'

export type BgId = 'classic' | 'popcorn' | 'night' | 'mint' | 'sunset' | 'bubble'

export type ThemeId = 'classic' | 'mint' | 'sunset' | 'bubble' | 'midnight'

export const DEFAULT_AVATAR: AvatarId = 'kitten'
export const DEFAULT_FRAME: FrameId = 'none'
export const DEFAULT_BG: BgId = 'classic'
export const DEFAULT_THEME: ThemeId = 'classic'

/**
 * Аватары: цена в 🌾 (0 — есть у всех с самого начала).
 * v0.0.81: привязка к развитию персонажа — у каждого аватара reqLevel,
 * уровень котика 🎖, с которого он открывается в лавке (дефолт — 1):
 * покупка за зёрнышки возможна только после этого уровня.
 */
export const AVATARS: ReadonlyArray<{ id: AvatarId; price: number; reqLevel: number }> = [
  { id: 'kitten', price: 0, reqLevel: 1 },
  { id: 'smoke', price: 250, reqLevel: 3 },
  { id: 'snow', price: 400, reqLevel: 5 },
  { id: 'stripes', price: 550, reqLevel: 7 },
  { id: 'ninja', price: 700, reqLevel: 9 },
  { id: 'siam', price: 900, reqLevel: 12 },
  { id: 'spot', price: 1300, reqLevel: 15 },
  { id: 'royale', price: 1900, reqLevel: 20 },
]

/** Рамки аватара: цена в 🌾 */
export const FRAMES: ReadonlyArray<{ id: FrameId; price: number }> = [
  { id: 'none', price: 0 },
  { id: 'wood', price: 300 },
  { id: 'hearts', price: 650 },
  { id: 'gold', price: 1100 },
  { id: 'runic', price: 1500 },
  { id: 'neon', price: 2000 },
  { id: 'laurel', price: 2800 },
]

/** Фоны главного меню: цена в 🌾 */
export const BGS: ReadonlyArray<{ id: BgId; price: number }> = [
  { id: 'classic', price: 0 },
  { id: 'popcorn', price: 350 },
  { id: 'mint', price: 600 },
  { id: 'night', price: 900 },
  { id: 'sunset', price: 1300 },
  { id: 'bubble', price: 1800 },
]

/** Акцентные темы меню: цена в 🌾 */
export const THEMES: ReadonlyArray<{ id: ThemeId; price: number }> = [
  { id: 'classic', price: 0 },
  { id: 'mint', price: 400 },
  { id: 'sunset', price: 700 },
  { id: 'bubble', price: 1000 },
  { id: 'midnight', price: 1400 },
]

export const AVATAR_MAP = Object.fromEntries(AVATARS.map((a) => [a.id, a])) as Record<
  AvatarId,
  (typeof AVATARS)[number]
>
export const FRAME_MAP = Object.fromEntries(FRAMES.map((f) => [f.id, f])) as Record<
  FrameId,
  (typeof FRAMES)[number]
>
export const BG_MAP = Object.fromEntries(BGS.map((b) => [b.id, b])) as Record<
  BgId,
  (typeof BGS)[number]
>
export const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<
  ThemeId,
  (typeof THEMES)[number]
>

export const isAvatarId = (v: unknown): v is AvatarId =>
  typeof v === 'string' && AVATAR_MAP[v] !== undefined

/** УРОВЕНЬ КОТИКА, с которого аватар открывается в лавке (v0.0.81) */
export function avatarReqLevel(id: AvatarId): number {
  return AVATAR_MAP[id]?.reqLevel ?? 1
}

/** Аватар ещё закрыт уровнем котика? */
export function avatarLevelLocked(id: AvatarId, totalXp: number): boolean {
  return avatarReqLevel(id) > charLevel(totalXp)
}

export const isFrameId = (v: unknown): v is FrameId =>
  typeof v === 'string' && FRAME_MAP[v] !== undefined
export const isBgId = (v: unknown): v is BgId => typeof v === 'string' && BG_MAP[v] !== undefined
export const isThemeId = (v: unknown): v is ThemeId =>
  typeof v === 'string' && THEME_MAP[v] !== undefined

/** Файл аватара (для <img src>) */
export function avatarSrc(id: AvatarId): string {
  return `/avatars/${id}.png`
}

/* ════════════════ Состояние ════════════════ */

export interface StyleState {
  avatar: AvatarId
  frame: FrameId
  bg: BgId
  theme: ThemeId
  owned: {
    avatars: AvatarId[]
    frames: FrameId[]
    bgs: BgId[]
    themes: ThemeId[]
  }
}

export const STYLE_KEY = 'popcorn-style'

export const DEFAULT_STYLE: StyleState = {
  avatar: DEFAULT_AVATAR,
  frame: DEFAULT_FRAME,
  bg: DEFAULT_BG,
  theme: DEFAULT_THEME,
  owned: {
    avatars: [DEFAULT_AVATAR],
    frames: [DEFAULT_FRAME],
    bgs: [DEFAULT_BG],
    themes: [DEFAULT_THEME],
  },
}

/** Тот же ивент, что у магазина: один стор на всё меню */
export const STORE_EVENT = 'popcorn-store-update'

function dedupe<T>(list: unknown, is: (v: unknown) => v is T, fallback: T[]): T[] {
  const arr = Array.isArray(list) ? (list.filter(is) as T[]) : []
  const merged = [...new Set([...fallback, ...arr])]
  return merged
}

/** Прочитать стиль из localStorage (старые сохранения получают дефолты) */
export function loadStyle(): StyleState {
  if (typeof window === 'undefined') return DEFAULT_STYLE
  try {
    const raw = window.localStorage.getItem(STYLE_KEY)
    if (!raw) return DEFAULT_STYLE
    const o = JSON.parse(raw) as Record<string, unknown>
    const owned = (o.owned ?? {}) as Record<string, unknown>
    const avatars = dedupe(owned.avatars, isAvatarId, [DEFAULT_AVATAR]) as AvatarId[]
    const frames = dedupe(owned.frames, isFrameId, [DEFAULT_FRAME]) as FrameId[]
    const bgs = dedupe(owned.bgs, isBgId, [DEFAULT_BG]) as BgId[]
    const themes = dedupe(owned.themes, isThemeId, [DEFAULT_THEME]) as ThemeId[]
    const avatar = isAvatarId(o.avatar) && avatars.includes(o.avatar) ? o.avatar : DEFAULT_AVATAR
    const frame = isFrameId(o.frame) && frames.includes(o.frame) ? o.frame : DEFAULT_FRAME
    const bg = isBgId(o.bg) && bgs.includes(o.bg) ? o.bg : DEFAULT_BG
    const theme = isThemeId(o.theme) && themes.includes(o.theme) ? o.theme : DEFAULT_THEME
    return { avatar, frame, bg, theme, owned: { avatars, frames, bgs, themes } }
  } catch {
    return DEFAULT_STYLE
  }
}

let styleCache: StyleState | null = null

/** Кэш для useSyncExternalStore (стабильная ссылка) */
export function getStyleSnapshot(): StyleState {
  if (styleCache === null) styleCache = loadStyle()
  return styleCache
}

export function subscribeStyle(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(STORE_EVENT, cb)
  return () => window.removeEventListener(STORE_EVENT, cb)
}

export function saveStyle(s: StyleState): void {
  styleCache = s
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STYLE_KEY, JSON.stringify(s))
    window.dispatchEvent(new Event(STORE_EVENT))
  } catch {
    /* приватный режим — игнорируем */
  }
}

export type StyleKind = 'avatar' | 'frame' | 'bg' | 'theme'

/** Цена предмета в 🌾 (неизвестный id — несуществующий товар) */
export function stylePrice(kind: StyleKind, id: AvatarId | FrameId | BgId | ThemeId): number | null {
  switch (kind) {
    case 'avatar':
      return isAvatarId(id) ? AVATAR_MAP[id].price : null
    case 'frame':
      return isFrameId(id) ? FRAME_MAP[id].price : null
    case 'bg':
      return isBgId(id) ? BG_MAP[id].price : null
    case 'theme':
      return isThemeId(id) ? THEME_MAP[id].price : null
  }
}

/** Уже куплено? (дефолты куплены всегда) */
export function isOwned(style: StyleState, kind: StyleKind, id: AvatarId | FrameId | BgId | ThemeId): boolean {
  switch (kind) {
    case 'avatar':
      return style.owned.avatars.includes(id as AvatarId)
    case 'frame':
      return style.owned.frames.includes(id as FrameId)
    case 'bg':
      return style.owned.bgs.includes(id as BgId)
    case 'theme':
      return style.owned.themes.includes(id as ThemeId)
  }
}

/** Надето ли прямо сейчас? */
export function isEquipped(style: StyleState, kind: StyleKind, id: AvatarId | FrameId | BgId | ThemeId): boolean {
  switch (kind) {
    case 'avatar':
      return style.avatar === id
    case 'frame':
      return style.frame === id
    case 'bg':
      return style.bg === id
    case 'theme':
      return style.theme === id
  }
}

/**
 * Купить за зёрнышки 🌾: списывает зерно через spendGrains() (баланс и списание
 * — в market.ts, тот же сейф, что копит его в забегах) и помечает купленным.
 * Аватары привязаны к развитию персонажа: до нужного уровня котика
 * покупка недоступна, сколько зерна ни копи (v0.0.81).
 * Возвращает новое состояние или null (не хватило зерна / мал уровень /
 * нет такого товара).
 */
export function buyStyleItem(
  kind: StyleKind,
  id: AvatarId | FrameId | BgId | ThemeId,
): StyleState | null {
  const price = stylePrice(kind, id)
  if (price === null || price < 0) return null
  const cur = getStyleSnapshot()
  if (isOwned(cur, kind, id)) return null
  if (kind === 'avatar' && avatarLevelLocked(id as AvatarId, getTotalXp())) return null
  /* Зерно списывается только если хватает (ленивая проверка внутри) */
  if (!spendGrains(price)) return null
  const next: StyleState = { ...cur, owned: { ...cur.owned } }
  switch (kind) {
    case 'avatar':
      next.owned.avatars = [...cur.owned.avatars, id as AvatarId]
      break
    case 'frame':
      next.owned.frames = [...cur.owned.frames, id as FrameId]
      break
    case 'bg':
      next.owned.bgs = [...cur.owned.bgs, id as BgId]
      break
    case 'theme':
      next.owned.themes = [...cur.owned.themes, id as ThemeId]
      break
  }
  saveStyle(next)
  return next
}

/** Надеть купленное (аватар/рамка/фон/тема). Возвращает новое состояние */
export function equipStyleItem(
  kind: StyleKind,
  id: AvatarId | FrameId | BgId | ThemeId,
): StyleState | null {
  const cur = getStyleSnapshot()
  if (!isOwned(cur, kind, id)) return null
  const next: StyleState = { ...cur }
  switch (kind) {
    case 'avatar':
      next.avatar = id as AvatarId
      break
    case 'frame':
      next.frame = id as FrameId
      break
    case 'bg':
      next.bg = id as BgId
      break
    case 'theme':
      next.theme = id as ThemeId
      break
  }
  saveStyle(next)
  return next
}

/** Снять рамку (вернуть «none») — бесплатно и всегда доступно */
export function unequipFrame(): StyleState {
  const cur = getStyleSnapshot()
  const next = { ...cur, frame: DEFAULT_FRAME }
  saveStyle(next)
  return next
}
