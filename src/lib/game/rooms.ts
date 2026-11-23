/**
 * Фоны уровней «POPCORN PAWS».
 * 14 локаций в едином 16-битном стиле: 8 базовых + 6 с модификаторами (v0.0.82).
 * Уровень N играет в комнате (N-1) % 14 — круг замыкается каждые 14 уровней.
 * Название локации локализуется через i18n: room.<id>.name.
 * v0.0.82: у шести новых комнат есть RoomModifier — механическая особенность
 * (см. modifier в RoomDef и ROOM_MODIFIER_LABELS ниже).
 */

/** Модификатор комнаты (v0.0.82) — лёгкая механическая особенность поля */
export type RoomModifier =
  | 'none'      // чистая комната
  | 'levitate'  // зёрна падают медленнее (гравитация ×0.6)
  | 'warm'      // карамель/баттер спавнятся заметно чаще
  | 'dark'      // тьма: подсветка поля «фонариком» вокруг лапки
  | 'windy'     // лёгкий горизонтальный дрейф зёрен (синусоида)
  | 'zero-g'    // падение рывками — «невесомость»

export interface RoomDef {
  /** Идентификатор локации (ключ перевода room.<id>.name) */
  id:
    | 'cinema' | 'kitchen' | 'yard' | 'arcade' | 'roof' | 'park' | 'attic' | 'basement'
    | 'lab' | 'bakery' | 'cosmodrome' | 'haunted' | 'metro' | 'beach'
  /** Путь к картинке (webp, сжатая) */
  src: string
  /** Русское название (fallback, если перевод не найден) */
  name: string
  /** Эмодзи-подсказка локации */
  icon: string
  /** Модификатор поля (v0.0.82); у базовых 8 комнат — 'none' */
  modifier?: RoomModifier
}

export const ROOMS: RoomDef[] = [
  { id: 'cinema', src: '/rooms/cinema.webp', name: 'Кинозал', icon: '🎬' },
  { id: 'kitchen', src: '/rooms/kitchen.webp', name: 'Кухня пиццерии', icon: '🍕' },
  { id: 'yard', src: '/rooms/yard.webp', name: 'Ночной двор', icon: '🌙' },
  { id: 'arcade', src: '/rooms/arcade.webp', name: 'Аркадный зал', icon: '🕹️' },
  { id: 'roof', src: '/rooms/roof.webp', name: 'Крыша на закате', icon: '🌇' },
  { id: 'park', src: '/rooms/park.webp', name: 'Дневной парк', icon: '🌳' },
  { id: 'attic', src: '/rooms/attic.webp', name: 'Чердак', icon: '📦' },
  { id: 'basement', src: '/rooms/basement.webp', name: 'Кладовка', icon: '🫙' },
  // v0.0.82: шесть комнат с модификаторами (из rooms-future.ts)
  { id: 'lab', src: '/rooms/lab.webp', name: 'Кошачья лаборатория', icon: '🧪', modifier: 'levitate' },
  { id: 'bakery', src: '/rooms/bakery.webp', name: 'Пекарня', icon: '🥐', modifier: 'warm' },
  { id: 'cosmodrome', src: '/rooms/cosmodrome.webp', name: 'Космодром', icon: '🚀', modifier: 'zero-g' },
  { id: 'haunted', src: '/rooms/haunted.webp', name: 'Дом с призраками', icon: '👻', modifier: 'dark' },
  { id: 'metro', src: '/rooms/metro.webp', name: 'Метро', icon: '🚇', modifier: 'windy' },
  { id: 'beach', src: '/rooms/beach.webp', name: 'Пляж', icon: '🏖', modifier: 'none' },
]

/** Человекочитаемая подпись модификатора (для HUD/лавки/сайта) */
export const ROOM_MODIFIER_LABELS: Record<RoomModifier, string> = {
  none: 'без модификатора',
  levitate: 'медленное падение',
  warm: 'больше карамели',
  dark: 'тьма и фонарик',
  windy: 'порывы ветра',
  'zero-g': 'невесомость',
}

/** Модификатор для уровня N (безопасно для любой комнаты) */
export function roomModifierForLevel(level: number): RoomModifier {
  return roomForLevel(level).modifier ?? 'none'
}

const FALLBACK = ROOMS[0]

/** Фон для игрового уровня (уровень 1 = кинозал, дальше по кругу) */
export function roomForLevel(level: number): RoomDef {
  const idx = (Math.max(1, Math.floor(level)) - 1) % ROOMS.length
  return ROOMS[idx] ?? FALLBACK
}

/** Путь к картинке уровня — для быстрого сравнения в компоненте */
export function roomSrcForLevel(level: number): string {
  return roomForLevel(level).src
}
