/**
 * Древо улучшений «Кошачьего попкорнного Беспредела» — ТЕСТОВАЯ ВЕРСИЯ.
 *
 *  🌳 Постоянные улучшения в виде дерева-сетки (1 корень → 3 ветки → 3 вершины):
 *     1-й ярус — «Урожай» (+5% к очкам за зёрна за уровень, можно качать до 10 раз);
 *     2-й ярус — «Проворство» (скорость лапки), «Вместимость» (+1, +2, +3, +4
 *                зерна в лапке) и «Засев» (больше зёрен на карте);
 *     3-й ярус — «Фарт лихорадки» (шанс внезапной ЛИХОРАДКИ), «Щит» (1, 2, 3
 *                щита от взрыва мины за забег) и «Золотая жила».
 *
 *  🎖 Очки древа: по 1 очку за каждый уровень котика (опыт за всё время).
 *     Потраченные очки не возвращаются — улучшения постоянные.
 *
 * Хранится в localStorage ('popcorn-tree' → {id: куплено раз}),
 * бродкастит то же событие магазина, что и остальное меню.
 */

import { charLevel, getTotalXp } from './meta'

export type TreeId = 'harvest' | 'swift' | 'cap' | 'seeds' | 'feverluck' | 'shield' | 'goldluck'

export interface TreeNodeDef {
  id: TreeId
  /** Ярус дерева: 1 — корень, 2 — ветки, 3 — удача */
  tier: 1 | 2 | 3
  /** Уровень котика, с которого узел доступен */
  reqLevel: number
  /** Сколько раз можно купить узел */
  maxLevel: number
  icon: string
}

export const TREE_NODES: TreeNodeDef[] = [
  { id: 'harvest', tier: 1, reqLevel: 1, maxLevel: 10, icon: '🍿' },
  { id: 'swift', tier: 2, reqLevel: 2, maxLevel: 1, icon: '💨' },
  { id: 'cap', tier: 2, reqLevel: 2, maxLevel: 4, icon: '🎒' },
  { id: 'seeds', tier: 2, reqLevel: 2, maxLevel: 1, icon: '🧺' },
  { id: 'feverluck', tier: 3, reqLevel: 3, maxLevel: 1, icon: '🔥' },
  { id: 'shield', tier: 3, reqLevel: 3, maxLevel: 3, icon: '🛡️' },
  { id: 'goldluck', tier: 3, reqLevel: 3, maxLevel: 1, icon: '✨' },
]

export const TREE_MAP = Object.fromEntries(TREE_NODES.map((n) => [n.id, n])) as Record<
  TreeId,
  TreeNodeDef
>

/** Корень дерева: ветки 2–3 ярусов открываются только после его покупки */
const ROOT: TreeId = 'harvest'

export type TreeState = Partial<Record<TreeId, number>>

export const TREE_KEY = 'popcorn-tree'

/** Тот же ивент, что у магазина: один стор на всё меню */
const STORE_EVENT = 'popcorn-store-update'

/** Разобрать JSON localStorage → корректное состояние (только известные id) */
export function parseTreeRaw(raw: string | null | undefined): TreeState {
  try {
    const v: unknown = JSON.parse(raw ?? '{}')
    if (v && typeof v === 'object') {
      const out: TreeState = {}
      for (const n of TREE_NODES) {
        const val = (v as Record<string, unknown>)[n.id]
        if (typeof val === 'number' && val > 0) {
          out[n.id] = Math.min(n.maxLevel, Math.floor(val))
        }
      }
      return out
    }
  } catch {
    /* пусто */
  }
  return {}
}

/** Сколько очков уже потрачено */
export function treeSpent(state: TreeState): number {
  return TREE_NODES.reduce((s, n) => s + (state[n.id] ?? 0), 0)
}

/** Доступные очки: уровень котика минус потраченные */
export function treePoints(totalXp: number, spent: number): number {
  return Math.max(0, charLevel(totalXp) - spent)
}

export type TreeBuyError = 'points' | 'level' | 'root' | 'max'

/** Проверка: можно ли купить узел (ок / нет очков / мал уровень / нет корня / максимум) */
export function canBuy(id: TreeId, state: TreeState, totalXp: number): TreeBuyError | 'ok' {
  const def = TREE_MAP[id]
  if ((state[id] ?? 0) >= def.maxLevel) return 'max'
  if (def.tier > 1 && (state[ROOT] ?? 0) < 1) return 'root'
  if (charLevel(totalXp) < def.reqLevel) return 'level'
  if (treePoints(totalXp, treeSpent(state)) < 1) return 'points'
  return 'ok'
}

/** Купить узел за 1 очко: пишет localStorage и бродкастит событие магазина */
export function buyNode(id: TreeId): TreeState | null {
  if (typeof window === 'undefined') return null
  const state = parseTreeRaw(window.localStorage.getItem(TREE_KEY))
  if (canBuy(id, state, getTotalXp()) !== 'ok') return null
  const next: TreeState = { ...state, [id]: (state[id] ?? 0) + 1 }
  try {
    window.localStorage.setItem(TREE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(STORE_EVENT))
  } catch {
    /* приватный режим — игнорируем */
    return null
  }
  return next
}

/** «Вместимость»: уровень N даёт +N зерна в лапке (1+2+3+4 = +10 на максимум) */
export function capGain(level: number): number {
  return (level * (level + 1)) / 2
}

/** Числовые бонусы древа для движка (постоянные, действуют в каждом забеге) */
export interface TreeBonus {
  /** «Урожай»: +5% очков за зёрна за каждый купленный уровень (0.05 × уровень) */
  grainMult01: number
  /** «Проворство»: +6% скорости следования лапки */
  speedAdd: number
  /** «Вместимость»: +1, +2, +3, +4 зерна в лапке (накопительно) */
  carry: number
  /** «Засев»: +2 зерна в каждой волне */
  grains: number
  /** «Фарт лихорадки»: шанс 0.05, что сдача зерна запустит внезапную ЛИХОРАДКУ */
  feverLuck: number
  /** «Щит»: столько мин за забег прощается без штрафа */
  shields: number
  /** «Золотая жила»: +10% к шансу золотого зерна */
  goldAdd: number
}

const ZERO_BONUS: TreeBonus = {
  grainMult01: 0,
  speedAdd: 0,
  carry: 0,
  grains: 0,
  feverLuck: 0,
  shields: 0,
  goldAdd: 0,
}

export function treeBonuses(state: TreeState): TreeBonus {
  return {
    grainMult01: 0.05 * (state.harvest ?? 0),
    speedAdd: state.swift ? 0.06 : 0,
    carry: capGain(state.cap ?? 0),
    grains: state.seeds ? 2 : 0,
    feverLuck: state.feverluck ? 0.05 : 0,
    shields: state.shield ?? 0,
    goldAdd: state.goldluck ? 0.1 : 0,
  }
}

export { ZERO_BONUS }
