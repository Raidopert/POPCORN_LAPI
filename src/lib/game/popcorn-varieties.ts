/**
 * ЗАГОТОВКА КОНТЕНТА: разновидности попкорна (реестр на будущее).
 *
 * Движок сейчас умеет 5 PieceKind: popcorn / caramel / butter / golden / corn(мина)
 * + соска (nipple) и большие зёрна BigKind (caramel/cherry/grape).
 * Точки внедрения нового вида (engine.ts / sprites.ts):
 *   1) вариант спрайта в makeSmoothPopcornSprite (sprites.ts, варианты white|golden|caramel|butter);
 *   2) ветка в spawnWave/spawnPiece (engine.ts ~L1818-1879) с шансом, как goldenChance;
 *   3) при эффекте — хук в логику захвата/таймера/комбо;
 *   4) ключи i18n kernel.<id>.name ×4 языка;
 *   5) карточки в «коллекцию» (будущий раздел).
 *
 * Пока ВСЕ будущие виды имеют weight = 0 — они не спавнятся и не влияют на игру.
 * Файл существует, чтобы дизайн можно было обсуждать и показывать (сайт студии,
 * roadmap) до внедрения в движок.
 */

export type VarietyEffect =
  | 'none'    // только очки
  | 'combo'   // серия N подряд усиливает множитель
  | 'sticky'  // усиливает захват лапки на время
  | 'freeze'  // останавливает таймер
  | 'double'  // дублирует следующий бонус
  | 'gold'    // даёт монеты
  | 'ghost'   // пролетает сквозь мины
  | 'spicy'   // риск-награда
  | 'hop'     // подпрыгивает — труднее поймать

export type VarietyRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface PopcornVariety {
  id: string
  rarity: VarietyRarity
  /** Спавн-вес в волне. 0 = пока не в игре (заготовка). */
  weight: number
  /** Базовые очки за зерно (сравнивать с popcorn=5, golden=25). */
  points: number
  effect: VarietyEffect
  /** Опорный цвет ядра для спрайта/превью. */
  hue: string
  /** Целевая версия внедрения. */
  from?: string
  /** Как встроить в движок. */
  note?: string
}

/** Виды, которые УЖЕ в движке (референс для баланса). */
export const RELEASED_VARIETIES: PopcornVariety[] = [
  { id: 'classic', rarity: 'common', weight: 1, points: 5, effect: 'none', hue: '#fff7ea', note: 'текущий popcorn из engine.ts' },
  { id: 'caramel', rarity: 'common', weight: 1, points: 10, effect: 'none', hue: '#e09a4e', note: 'текущий caramel' },
  { id: 'butter', rarity: 'common', weight: 1, points: 15, effect: 'none', hue: '#f2c14e', note: 'текущий butter' },
  { id: 'golden', rarity: 'epic', weight: 1, points: 25, effect: 'none', hue: '#ffd54a', note: 'текущий golden, мельче и реже' },
]

/** БУДУЩИЕ виды (weight = 0, не спавнятся). */
export const FUTURE_VARIETIES: PopcornVariety[] = [
  {
    id: 'cheese', rarity: 'rare', weight: 0, points: 15, effect: 'combo', hue: '#f6c445', from: '0.0.76',
    note: 'серия из 3 сырных подряд = множитель x2 на 2с; хук в combo-логику комбо-вершины древа',
  },
  {
    id: 'choco', rarity: 'rare', weight: 0, points: 15, effect: 'sticky', hue: '#7a4a2b', from: '0.0.76',
    note: 'липкая карамель: grabR +15% на 3с после поимки; переиспользует пул спрайтов paw-модификаторов',
  },
  {
    id: 'ice', rarity: 'rare', weight: 0, points: 15, effect: 'freeze', hue: '#9adcf0', from: '0.0.77',
    note: 'заморозка таймера на 2с; эффект уже существует у подарка freeze — переиспользовать GIFT_LOGIC',
  },
  {
    id: 'pepper', rarity: 'epic', weight: 0, points: 30, effect: 'spicy', hue: '#e04b3a', from: '0.0.77',
    note: 'риск-награда: очки x6, но пропущенный перечный зёрна-жгут забирает 1 сердце; нужен полупрозрачный индикатор опасности',
  },
  {
    id: 'rainbow', rarity: 'epic', weight: 0, points: 40, effect: 'double', hue: '#9be3c9', from: '0.0.78',
    note: 'дублирует очки следующего зерна; шиммер-анимация спрайта (2 кадра)',
  },
  {
    id: 'ghost', rarity: 'epic', weight: 0, points: 20, effect: 'ghost', hue: '#e8ecf4', from: '0.0.78',
    note: 'призрачный: игнорирует мины на поле (не взрывает); полупрозрачный рендер, как у ghost-лапки',
  },
  {
    id: 'goldbar', rarity: 'legendary', weight: 0, points: 60, effect: 'gold', hue: '#ffe98a', from: '0.0.79',
    note: 'легендарный слиток: +3 монеты за штуку; слышен звон, редкость как у golden x0.5',
  },
  {
    id: 'hoppy', rarity: 'rare', weight: 0, points: 20, effect: 'hop', hue: '#c9e08a', from: '0.0.79',
    note: 'прыгучее зерно: падает рывками — сложнее поймать; для поздних уровней вместо роста числа мин',
  },
]

export const POPCORN_VARIETIES: PopcornVariety[] = [...RELEASED_VARIETIES, ...FUTURE_VARIETIES]

export function releasedVarieties(): PopcornVariety[] {
  return POPCORN_VARIETIES.filter((v) => v.weight > 0)
}

export function futureVarieties(): PopcornVariety[] {
  return POPCORN_VARIETIES.filter((v) => v.weight === 0)
}

export function varietyById(id: string): PopcornVariety | undefined {
  return POPCORN_VARIETIES.find((v) => v.id === id)
}

/**
 * Заготовка взвешенного выбора вида для будущей интеграции в spawnWave.
 * НЕ вызывается движком сейчас. Пример будущего использования:
 *   const kind = pickVariety(Math.random()).id
 */
export function pickVariety(r: number, pool: PopcornVariety[] = releasedVarieties()): PopcornVariety {
  const total = pool.reduce((s, v) => s + v.weight, 0)
  if (total <= 0) return pool[0]
  let x = r * total
  for (const v of pool) {
    x -= v.weight
    if (x < 0) return v
  }
  return pool[pool.length - 1]
}
