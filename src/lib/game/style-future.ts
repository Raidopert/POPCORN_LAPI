/**
 * ЗАГОТОВКА КОНТЕНТА: следующие партии лавки стиля.
 *
 * Текущий каталог — src/lib/game/style.ts (8 аватаров, 7 рамок, 6 фонов, 5 тем).
 * Этот реестр НЕ подключён к рынку: покупка/экипировка остаётся в style.ts.
 *
 * Внедрение элемента:
 *   - аватар: PNG 128x128 в public/avatars/<id>.png + ключ i18n avatar.<id>.name ×4;
 *   - рамка: CSS-класс .pp-frame-<id> в globals.css + i18n frame.<id>.name;
 *   - фон: класс .pp-bg-<id> + i18n bg.<id>.name;
 *   - тема: класс .pp-theme-<id> (CSS-переменные --pp-accent и др.) + i18n theme.<id>.name;
 *   - запись в соответствующий массив style.ts с ценой из этой заготовки.
 *
 * Цены держим в шкале текущей лавки: 300-1900 🌾 (топ-рамка 2800).
 */

export type StyleKind = 'avatar' | 'frame' | 'bg' | 'theme'

export interface FutureStyleItem {
  kind: StyleKind
  id: string
  price: number
  /** Название по-русски (рабочее; при внедрении уедет в i18n ×4). */
  nameRu: string
  /** Целевая версия. */
  from: string
  /** Партия/сезон, чтобы выпускать лавку наборами. */
  set: string
  /** Файл-концепт в public/studio/concepts (если нарисован). */
  art?: string
  note?: string
}

export const FUTURE_STYLE: FutureStyleItem[] = [
  // Партия «Хэллоуин» — первая сезонная волна
  { kind: 'avatar', id: 'pumpkin', price: 800, nameRu: 'Тыквенный кот', from: '0.0.77', set: 'halloween' },
  { kind: 'avatar', id: 'ghosty', price: 1000, nameRu: 'Кот-призрак', from: '0.0.77', set: 'halloween' },
  { kind: 'frame', id: 'pumpkin', price: 900, nameRu: 'Тыквенная рамка', from: '0.0.77', set: 'halloween' },
  { kind: 'bg', id: 'halloween', price: 900, nameRu: 'Хэллоуин', from: '0.0.77', set: 'halloween', note: 'тёмно-оранжевый градиент, летучие мыши по краям' },
  { kind: 'theme', id: 'halloween', price: 900, nameRu: 'Тыквенная ночь', from: '0.0.77', set: 'halloween' },

  // Партия «Космос» — под будущую комнату «Космодром»
  { kind: 'avatar', id: 'cosmo', price: 1200, nameRu: 'Космо-кот', from: '0.0.78', set: 'space', art: '/studio/concepts/avatars-space.png' },
  { kind: 'frame', id: 'star', price: 1600, nameRu: 'Звёздная рамка', from: '0.0.78', set: 'space' },
  { kind: 'bg', id: 'space', price: 1200, nameRu: 'Открытый космос', from: '0.0.78', set: 'space' },
  { kind: 'theme', id: 'space', price: 1200, nameRu: 'Глубокий космос', from: '0.0.78', set: 'space' },

  // Партия «Зима»
  { kind: 'avatar', id: 'winter', price: 800, nameRu: 'Снежный кот', from: '0.0.79', set: 'winter' },
  { kind: 'frame', id: 'snow', price: 700, nameRu: 'Снежная рамка', from: '0.0.79', set: 'winter' },
  { kind: 'bg', id: 'winter', price: 700, nameRu: 'Зимний вечер', from: '0.0.79', set: 'winter' },
  { kind: 'theme', id: 'winter', price: 800, nameRu: 'Морозная свежесть', from: '0.0.79', set: 'winter' },

  // Партия «Рыцари» — фансервис для топ-игроков
  { kind: 'avatar', id: 'knight', price: 1600, nameRu: 'Кот-рыцарь', from: '0.0.79', set: 'knight', art: '/studio/concepts/avatars-space.png' },
  { kind: 'frame', id: 'royal', price: 2800, nameRu: 'Королевская рамка', from: '0.0.79', set: 'knight', note: 'сопоставима с текущей топ-рамкой Лавровая (2800)' },
]

export function futureStyleBySet(set: string): FutureStyleItem[] {
  return FUTURE_STYLE.filter((s) => s.set === set)
}

export function futureStyleKinds(set: string): Record<StyleKind, number> {
  const items = futureStyleBySet(set)
  return {
    avatar: items.filter((i) => i.kind === 'avatar').length,
    frame: items.filter((i) => i.kind === 'frame').length,
    bg: items.filter((i) => i.kind === 'bg').length,
    theme: items.filter((i) => i.kind === 'theme').length,
  }
}
