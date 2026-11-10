/**
 * Древо улучшений «Кошачьего попкорнного Беспредела» — БОЛЬШОЕ ДЕРЕВО.
 *
 *  🌳 Постоянные улучшения в виде дерева-сетки (5 ярусов, 18 узлов):
 *
 *     Ярус 1 — корень «Урожай» (+5% к очкам за зёрна, качается до 10 раз);
 *     Ярус 2 — три ветки: «Проворство» (скорость лапки), «Вместимость»
 *              (+1..+4 зерна в лапке) и «Засев» (больше зёрен в волне);
 *     Ярус 3 — по двое детей у каждой ветки:
 *              Ловкость → «Магнит» (радиус подбора) и «Коготки-обереги» (шианс
 *                          игнорировать мину);
 *              Запасы   → «Золотая жила» (шанс золота) и «Монетный дождь»
 *                          (+10% монеток с этапов и сундуков);
 *              Урожай   → «Фарт лихорадки» (шанс внезапной ЛИХОРАДКИ) и
 *                          «Долгая лихорадка» (+1 сек);
 *     Ярус 4 — вершины: «Шахтёр» (−1 мина в волне), «Крепкий нос» (шок от
 *              мины короче), «Комбо-тренер» (комбо растёт быстрее), «Стаж»
 *              (+10% опыта котика), «Щит» (1–3 щита от мин) и «Щедрость»
 *              (+25% ценность подарков из сундучков).
 *     Ярус 5 — сердечная ветка: «Плюшевое сердце» (+1 максимум сердец) и
 *              «Лапка-целитель» (+1 сердце за пройденный уровень сверх обычного).
 *
 *  🎖 Очки древа: по 1 очку за каждый уровень котика (опыт за всё время).
 *     Узел открывается, только если куплен его родитель.
 *
 * Хранится в localStorage ('popcorn-tree' → {id: куплено раз}),
 * бродкастит то же событие магазина, что и остальное меню.
 */

import { charLevel, getTotalXp } from './meta'

export type TreeId =
  | 'harvest'
  | 'swift'
  | 'cap'
  | 'seeds'
  | 'magnet'
  | 'guard'
  | 'goldluck'
  | 'coins'
  | 'feverluck'
  | 'fevertime'
  | 'miner'
  | 'stun'
  | 'combo'
  | 'xpboost'
  | 'shield'
  | 'double'
  | 'heartmax'
  | 'healer'

export interface TreeNodeDef {
  id: TreeId
  /** Ярус дерева: 1 — корень, 2 — ветки, 3 — дети веток, 4 — вершины, 5 — сердечная ветка */
  tier: 1 | 2 | 3 | 4 | 5
  /** Уровень котика, с которого узел доступен */
  reqLevel: number
  /** Сколько раз можно купить узел */
  maxLevel: number
  /** Родитель: узел открывается только после покупки родителя */
  parent?: TreeId
  icon: string
}

export const TREE_NODES: TreeNodeDef[] = [
  /* ярус 1 — корень */
  { id: 'harvest', tier: 1, reqLevel: 1, maxLevel: 10, icon: '🍿' },
  /* ярус 2 — три ветки */
  { id: 'swift', tier: 2, reqLevel: 2, maxLevel: 4, parent: 'harvest', icon: '💨' },
  { id: 'cap', tier: 2, reqLevel: 2, maxLevel: 4, parent: 'harvest', icon: '🎒' },
  { id: 'seeds', tier: 2, reqLevel: 2, maxLevel: 3, parent: 'harvest', icon: '🧺' },
  /* ярус 3 — дети веток */
  { id: 'magnet', tier: 3, reqLevel: 4, maxLevel: 3, parent: 'swift', icon: '🧲' },
  { id: 'guard', tier: 3, reqLevel: 5, maxLevel: 2, parent: 'swift', icon: '🐾' },
  { id: 'goldluck', tier: 3, reqLevel: 4, maxLevel: 3, parent: 'cap', icon: '✨' },
  { id: 'coins', tier: 3, reqLevel: 5, maxLevel: 3, parent: 'cap', icon: '🪙' },
  { id: 'feverluck', tier: 3, reqLevel: 4, maxLevel: 2, parent: 'seeds', icon: '🔥' },
  { id: 'fevertime', tier: 3, reqLevel: 5, maxLevel: 2, parent: 'seeds', icon: '⏱️' },
  /* ярус 4 — вершины */
  { id: 'miner', tier: 4, reqLevel: 7, maxLevel: 2, parent: 'magnet', icon: '⛏️' },
  { id: 'stun', tier: 4, reqLevel: 8, maxLevel: 2, parent: 'guard', icon: '💪' },
  { id: 'combo', tier: 4, reqLevel: 7, maxLevel: 1, parent: 'goldluck', icon: '🎯' },
  { id: 'xpboost', tier: 4, reqLevel: 8, maxLevel: 3, parent: 'coins', icon: '🎖' },
  { id: 'shield', tier: 4, reqLevel: 7, maxLevel: 3, parent: 'feverluck', icon: '🛡️' },
  { id: 'double', tier: 4, reqLevel: 8, maxLevel: 2, parent: 'fevertime', icon: '🍀' },
  /* ярус 5 — сердечная ветка */
  { id: 'heartmax', tier: 5, reqLevel: 10, maxLevel: 2, parent: 'shield', icon: '🧸' },
  { id: 'healer', tier: 5, reqLevel: 12, maxLevel: 1, parent: 'double', icon: '💞' },
]

export const TREE_MAP = Object.fromEntries(TREE_NODES.map((n) => [n.id, n])) as Record<
  TreeId,
  TreeNodeDef
>

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

/** Сколько очков уже потрачено (сумма уровней всех узлов) */
export function treeSpent(state: TreeState): number {
  return TREE_NODES.reduce((s, n) => s + (state[n.id] ?? 0), 0)
}

/** Сколько РАЗЛИЧНЫХ узлов открыто (хотя бы 1 уровень) */
export function treeNodesOpened(state: TreeState): number {
  return TREE_NODES.reduce((s, n) => s + ((state[n.id] ?? 0) > 0 ? 1 : 0), 0)
}

/** Доступные очки: уровень котика минус потраченные */
export function treePoints(totalXp: number, spent: number): number {
  return Math.max(0, charLevel(totalXp) - spent)
}

export type TreeBuyError = 'points' | 'level' | 'root' | 'max'

/** Проверка: можно ли купить узел (ок / нет очков / мал уровень / нет родителя / максимум) */
export function canBuy(id: TreeId, state: TreeState, totalXp: number): TreeBuyError | 'ok' {
  const def = TREE_MAP[id]
  if ((state[id] ?? 0) >= def.maxLevel) return 'max'
  if (def.parent && (state[def.parent] ?? 0) < 1) return 'root'
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
  /** «Проворство»: +5% скорости следования лапки за уровень (до +20%) */
  speedAdd: number
  /** «Вместимость»: +1, +2, +3, +4 зерна в лапке (накопительно) */
  carry: number
  /** «Засев»: +2 зерна в каждой волне за уровень */
  grains: number
  /** «Фарт лихорадки»: шанс 0.05×ур, что сдача зерна запустит внезапную ЛИХОРАДКУ */
  feverLuck: number
  /** «Щит»: столько мин за забег прощается без штрафа */
  shields: number
  /** «Золотая жила»: +10% к шансу золотого зерна за уровень */
  goldAdd: number
  /** «Магнит»: +8% радиуса подбора за уровень */
  grabR01: number
  /** «Коготки-обереги»: +15% шанс, что мина не сработает, за уровень */
  guardAdd: number
  /** «Шахтёр»: −1 мина в каждой волне за уровень */
  cornCut: number
  /** «Крепкий нос»: шок от мины короче на 0.3с за уровень */
  stunCut: number
  /** «Долгая лихорадка»: +1 сек лихорадки за уровень */
  feverPlus: number
  /** «Комбо-тренер»: комбо растёт каждые 5 сдач вместо 6 */
  comboFast: boolean
  /** «Монетный дождь»: +10% монеток с этапов и сундуков за уровень */
  coinsAdd: number
  /** «Стаж»: +10% опыта котика за этапы за уровень */
  xpAdd: number
  /** «Щедрость»: +25% ценность подарков из сундучков за уровень */
  giftAdd: number
  /** «Плюшевое сердце»: +1 к максимуму сердец за уровень */
  heartsMax: number
  /** «Лапка-целитель»: +1 сердце за пройденный уровень сверх обычного */
  healPlus: number
}

const ZERO_BONUS: TreeBonus = {
  grainMult01: 0,
  speedAdd: 0,
  carry: 0,
  grains: 0,
  feverLuck: 0,
  shields: 0,
  goldAdd: 0,
  grabR01: 0,
  guardAdd: 0,
  cornCut: 0,
  stunCut: 0,
  feverPlus: 0,
  comboFast: false,
  coinsAdd: 0,
  xpAdd: 0,
  giftAdd: 0,
  heartsMax: 0,
  healPlus: 0,
}

export function treeBonuses(state: TreeState): TreeBonus {
  return {
    grainMult01: 0.05 * (state.harvest ?? 0),
    speedAdd: 0.05 * (state.swift ?? 0),
    carry: capGain(state.cap ?? 0),
    grains: 2 * (state.seeds ?? 0),
    feverLuck: 0.05 * (state.feverluck ?? 0),
    shields: state.shield ?? 0,
    goldAdd: 0.1 * (state.goldluck ?? 0),
    grabR01: 0.08 * (state.magnet ?? 0),
    guardAdd: 0.15 * (state.guard ?? 0),
    cornCut: state.miner ?? 0,
    stunCut: 0.3 * (state.stun ?? 0),
    feverPlus: state.fevertime ?? 0,
    comboFast: (state.combo ?? 0) > 0,
    coinsAdd: 0.1 * (state.coins ?? 0),
    xpAdd: 0.1 * (state.xpboost ?? 0),
    giftAdd: 0.25 * (state.double ?? 0),
    heartsMax: state.heartmax ?? 0,
    healPlus: state.healer ?? 0,
  }
}

export { ZERO_BONUS }
