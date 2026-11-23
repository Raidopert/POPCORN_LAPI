/**
 * ДЕЖУРСТВО ПО ПОПКОРНУ (v0.0.82) — ежедневные задания + жёсткий стрик.
 *
 * Три задания в день, одинаковые для всех игроков (детерминированный
 * генератор от даты — задания можно обсуждать в чатах и сравнивать).
 * Выполнил все три и забрал награды — серия +1. Пропустил день — серия
 * сгорела (жёсткий режим, по решению студии). Каждые 7 дней серии —
 * большой приз «Кисиньковская радость».
 *
 * Прогресс собирается с того же потока событий, что и пожизненная
 * статистика: lifestats.addLife пробрасывает дельты сюда через setLifeHook,
 * комбо — из emitStats (максимальная серия дня), путешествия NANA —
 * из счётчика trips стора куницы.
 *
 * Награда за задание: зёрнышки 🌾 + случайный предмет лута (редкость
 * по шансам 70/25/5). Приз недели: 200 🌾 + эпический предмет + 250 🪙.
 */

import { addCoins, charLevel, getTotalXp } from './meta'
import { addGrains } from './market'
import {
  dropInvItemOfRarity,
  type DropResult,
  type Rarity,
} from './inventory'
import { setLifeHook, type LifeStats } from './lifestats'
import { getMartenSnapshot, subscribeMarten } from './marten'

/* ════════════════ Типы ════════════════ */

/** Шаблоны заданий (все 8 утверждены студией) */
export type DailyKind =
  | 'grains' // сдай N зёрен в стаканчик
  | 'golden' // поймай N золотых зёрен
  | 'combo' // доведи серию сдач до ×N
  | 'kinds' // поймай N зёрен новых видов (сырное/шоколад/лёд/перчик)
  | 'chests' // открой N сундучков на поле
  | 'boss' // победи N боссов
  | 'travel' // отвези NANA в путешествие
  | 'slice' // нарежь N больших попкорнин

export interface DailyTask {
  kind: DailyKind
  goal: number
  progress: number
  claimed: boolean
}

export interface DailyState {
  /** Локальная дата 'YYYY-MM-DD' */
  date: string
  tasks: DailyTask[]
  /** Максимальная серия сдач за день (для задания combo) */
  comboBest: number
  /** Текущая серия дней с забором всех наград */
  streak: number
  /** Дата последнего полного забора ('YYYY-MM-DD') */
  lastFull: string
  /** Дата последнего приза серии (Кисиньковская радость) */
  lastPrize: string
}

/* ════════════════ Хранилище ════════════════ */

const KEY = 'popcorn-dailies'
const STORE_EVENT = 'popcorn-dailies-update'

/** Кэш-снимок: useSyncExternalStore требует стабильную ссылку между вызовами */
let cache: DailyState | null = null

function saveDaily(state: DailyState): void {
  if (typeof window === 'undefined') return
  cache = state
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent(STORE_EVENT))
  } catch {
    // приватный режим — день просто не сохранится
  }
}

/** Локальная дата 'YYYY-MM-DD' (как у игрока на устройстве) */
function today(): string {
  const d = new Date()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Вчерашняя дата относительно заданной */
function yesterday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
  dt.setDate(dt.getDate() - 1)
  const mm = `${dt.getMonth() + 1}`.padStart(2, '0')
  const dd = `${dt.getDate()}`.padStart(2, '0')
  return `${dt.getFullYear()}-${mm}-${dd}`
}

/* ════════════════ Генератор дня ════════════════ */

/** Детерминированный PRNG от строки-сида (mulberry32 с FNV-хэшем) */
function seeded(seedStr: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Цель задания — от уровня котика (шкала растёт вместе с игроком) */
function goalFor(kind: DailyKind, lvl: number): number {
  switch (kind) {
    case 'grains':
      return 60 + lvl * 15
    case 'golden':
      return 4 + Math.floor(lvl * 0.8)
    case 'combo':
      return 8 + lvl
    case 'kinds':
      return 6 + lvl * 2
    case 'chests':
      return 2 + Math.floor(lvl / 8)
    case 'boss':
      return 1 + Math.floor(lvl / 12)
    case 'travel':
      return 1
    case 'slice':
      return 1 + Math.floor(lvl / 10)
  }
}

/** Зёрнышки за задание */
export function rewardGrains(kind: DailyKind, goal: number): number {
  const base: Record<DailyKind, number> = {
    grains: 22,
    golden: 26,
    combo: 24,
    kinds: 24,
    chests: 30,
    boss: 34,
    travel: 28,
    slice: 26,
  }
  return Math.round((base[kind] ?? 24) + goal * 0.6)
}

const ALL_KINDS: DailyKind[] = [
  'grains',
  'golden',
  'combo',
  'kinds',
  'chests',
  'boss',
  'travel',
  'slice',
]

/** Сгенерировать 3 задания дня: детерминированно от даты, шкала от уровня */
function generateTasks(dateStr: string, lvl: number): DailyTask[] {
  const rng = seeded(`popcorn-dailies-${dateStr}`)
  const pool = [...ALL_KINDS]
  const tasks: DailyTask[] = []
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length) % pool.length
    const kind = pool.splice(idx, 1)[0] as DailyKind
    tasks.push({ kind, goal: goalFor(kind, lvl), progress: 0, claimed: false })
  }
  return tasks
}

/* ════════════════ Публичный API ════════════════ */

/**
 * Состояние дня: пересоздаёт при смене даты. Ссылка стабильна между
 * вызовами (кэш) — безопасно для useSyncExternalStore.
 */
export function getDailies(): DailyState {
  if (typeof window === 'undefined') {
    /* SSR: минимальный пустой день (UI до гидрации его не рисует) */
    return {
      date: '1970-01-01',
      tasks: [],
      comboBest: 0,
      streak: 0,
      lastFull: '',
      lastPrize: '',
    }
  }
  const d = today()
  if (cache && cache.date === d) return cache
  /* Первое обращение за сессию: поднять сохранённый день с диска,
     иначе прогресс дня терялся бы после каждой перезагрузки страницы */
  let raw: DailyState | null = null
  try {
    raw = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as DailyState | null
  } catch {
    raw = null
  }
  if (raw && raw.date === d && Array.isArray(raw.tasks)) {
    cache = raw
    return cache
  }
  /* Новый день: серия переживает только если вчера/сегодня был полный забор.
     Жёсткий стрик: пропустил день — серия сгорела (решение студии) */
  const lvl = Math.max(1, charLevel(getTotalXp()))
  const prevStreak =
    raw && (raw.lastFull === yesterday(d) || raw.lastFull === d) ? raw.streak : 0
  const next: DailyState = {
    date: d,
    tasks: generateTasks(d, lvl),
    comboBest: 0,
    streak: prevStreak,
    lastFull: raw?.lastFull ?? '',
    lastPrize: raw?.lastPrize ?? '',
  }
  cache = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(STORE_EVENT))
  } catch {
    // приватный режим — день просто не сохранится
  }
  return next
}

/** Прогресс задания: приращение с потолком у цели */
function bumpTask(kind: DailyKind, n: number): void {
  const state = getDailies()
  let changed = false
  for (const t of state.tasks) {
    if (t.kind !== kind || t.claimed || t.progress >= t.goal) continue
    t.progress = Math.min(t.goal, t.progress + n)
    changed = true
  }
  if (changed) saveDaily(state)
}

/** Комбо-максимум дня (вызывается из emitStats в компоненте) */
export function noteCombo(streak: number): void {
  const state = getDailies()
  if (streak <= state.comboBest) return
  state.comboBest = streak
  for (const t of state.tasks) {
    if (t.kind === 'combo' && !t.claimed) {
      t.progress = Math.min(t.goal, streak)
    }
  }
  saveDaily(state)
}

/* Прогресс из пожизненной статистики: хук ставится один раз при загрузке */
let hookInstalled = false

function noteLife(patch: Partial<LifeStats>): void {
  if (patch.grains) bumpTask('grains', patch.grains)
  if (patch.golden) bumpTask('golden', patch.golden)
  if (patch.bonus || patch.curse)
    bumpTask('chests', (patch.bonus ?? 0) + (patch.curse ?? 0))
  if (patch.bossKills) bumpTask('boss', patch.bossKills)
  if (patch.sliceCaramel || patch.sliceCherry || patch.sliceGrape)
    bumpTask(
      'slice',
      (patch.sliceCaramel ?? 0) + (patch.sliceCherry ?? 0) + (patch.sliceGrape ?? 0),
    )
  if (patch.cheese || patch.choco || patch.ice || patch.pepper)
    bumpTask(
      'kinds',
      (patch.cheese ?? 0) + (patch.choco ?? 0) + (patch.ice ?? 0) + (patch.pepper ?? 0),
    )
}

/** Подключить сбор прогресса (идемпотентно; вызывать на клиенте) */
export function initDailies(): void {
  if (hookInstalled || typeof window === 'undefined') return
  hookInstalled = true
  setLifeHook(noteLife)
  /* Путешествия NANA: дифф счётчика trips стора куницы */
  let prevTrips = getMartenSnapshot().trips
  subscribeMarten(() => {
    const cur = getMartenSnapshot().trips
    if (cur > prevTrips) {
      const d = cur - prevTrips
      prevTrips = cur
      bumpTask('travel', d)
    } else {
      prevTrips = cur
    }
  })
}

/** Приз недели «Кисиньковская радость» выдан сегодня? (для тоста) */
export function dailyPrizeToday(): boolean {
  return getDailies().lastPrize === today()
}

/** Забрать награду за задание. Возвращает выданный предмет (или null) */
export function claimTask(index: number): DropResult | null {
  const state = getDailies()
  const t = state.tasks[index]
  if (!t || t.claimed || t.progress < t.goal) return null
  t.claimed = true
  /* Награда: зёрнышки + предмет лута (склад полон — автопродажа в монетки) */
  addGrains(rewardGrains(t.kind, t.goal))
  const roll = Math.random()
  const rarity: Rarity = roll < 0.7 ? 'common' : roll < 0.95 ? 'rare' : 'epic'
  const drop = dropInvItemOfRarity(rarity)
  if (!drop.stored) addCoins(drop.coins)
  /* Все три забраны — стрик и приз недели */
  if (state.tasks.every((q) => q.claimed)) {
    const d = today()
    if (state.lastFull !== d) {
      /* Серия +1, если вчера был полный забор; иначе серия начинается заново */
      state.streak = state.lastFull === yesterday(d) ? state.streak + 1 : 1
      state.lastFull = d
    }
    /* Кисиньковская радость: каждые 7 дней серии, один раз в день */
    if (state.streak > 0 && state.streak % 7 === 0 && state.lastPrize !== d) {
      state.lastPrize = d
      addGrains(200)
      addCoins(250)
      const prize = dropInvItemOfRarity('epic')
      if (!prize.stored) addCoins(prize.coins)
    }
  }
  saveDaily(state)
  return drop
}

/** Есть незакрытые задания дня? (для бейджа вкладки ПРОКАЧКА) */
export function dailyBadgeActive(): boolean {
  const state = getDailies()
  return state.tasks.some((t) => !t.claimed)
}

/** Сколько заданий выполнено, но награда ещё не забрана (бейдж на кнопке) */
export function dailyClaimableCount(): number {
  const state = getDailies()
  return state.tasks.filter((t) => !t.claimed && t.progress >= t.goal).length
}

/** Событие обновления для UI (useSyncExternalStore) */
export function subscribeDailies(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(STORE_EVENT, cb)
  return () => window.removeEventListener(STORE_EVENT, cb)
}
