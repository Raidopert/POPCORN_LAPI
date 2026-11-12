/**
 * Фоны уровней «POPCORN PAWS».
 * 8 локаций в едином 16-битном стиле: кинозал + 7 новых комнат.
 * Уровень N играет в комнате (N-1) % 8 — круг замыкается каждые 8 уровней.
 * Название локации локализуется через i18n: room.<id>.name.
 */

export interface RoomDef {
  /** Идентификатор локации (ключ перевода room.<id>.name) */
  id: 'cinema' | 'kitchen' | 'yard' | 'arcade' | 'roof' | 'park' | 'attic' | 'basement'
  /** Путь к картинке (webp, сжатая) */
  src: string
  /** Русское название (fallback, если перевод не найден) */
  name: string
  /** Эмодзи-подсказка локации */
  icon: string
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
]

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
