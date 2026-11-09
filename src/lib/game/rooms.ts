/**
 * Фоны уровней «Кошачьего попкорнного Беспредела».
 * 8 локаций в едином 16-битном стиле: кинозал + 7 новых комнат.
 * Уровень N играет в комнате (N-1) % 8 — круг замыкается каждые 8 уровней.
 */

export interface RoomDef {
  /** Путь к картинке (webp, сжатая) */
  src: string
  /** Название локации для плашек и правил */
  name: string
  /** Эмодзи-подсказка локации */
  icon: string
}

export const ROOMS: RoomDef[] = [
  { src: '/rooms/cinema.webp', name: 'Кинозал', icon: '🎬' },
  { src: '/rooms/kitchen.webp', name: 'Кухня пиццерии', icon: '🍕' },
  { src: '/rooms/yard.webp', name: 'Ночной двор', icon: '🌙' },
  { src: '/rooms/arcade.webp', name: 'Аркадный зал', icon: '🕹️' },
  { src: '/rooms/roof.webp', name: 'Крыша на закате', icon: '🌇' },
  { src: '/rooms/park.webp', name: 'Дневной парк', icon: '🌳' },
  { src: '/rooms/attic.webp', name: 'Чердак', icon: '📦' },
  { src: '/rooms/basement.webp', name: 'Кладовка', icon: '🫙' },
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
