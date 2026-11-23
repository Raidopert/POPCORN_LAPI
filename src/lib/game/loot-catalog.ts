/**
 * КАТАЛОГ ЛУТА 0.0.83 «БОЛЬШОЙ СКЛАД» — расширение инвентаря до 300 предметов.
 *
 * Как устроено:
 *  - 48 тематических СЕМЕЙ (ribbon, bell, band, sea, winter, space, woven…),
 *    каждая семья — лестница из 5 предметов одной ветки:
 *    обычный → редкий → эпический → легендарный → леопардовая вершина.
 *    Семья clock (часовые кольца) — 6 ступеней: в конце ещё и ЗОЛОТАЯ вершина.
 *  - Каждый предмет попадает в один из 9 слотов лапки (kind), бонус берётся
 *    по редкости (ошейник/браслет/венец) или из fx-таблицы семьи (остальные).
 *  - 59 старых предметов (inventory.ts) + 241 новый = ровно 300.
 *  - 6 КОМПЛЕКТОВ (set): собери все 5 вещей — эпический бонус НАВСЕГДА
 *    (проверяется по everHad, поэтому продажа вещей комплект не ломает).
 *
 * Имена/бонусы/описания для новых предметов генерирует loot-i18n.ts
 * из adj/flavor-строк этой таблицы (4 языка: ru, en, de, es).
 */

import type { InvDef, InvFx, ItemKind, Rarity } from './inventory'

/** Строка на 4 языка: [ru, en, de, es] — порядок как в i18n LANGS */
export type L4 = readonly [string, string, string, string]

/* ════════════════ Тарифы по редкости ════════════════ */

const R_SELL: Record<Rarity, number> = {
  common: 30,
  rare: 90,
  epic: 240,
  legendary: 720,
  leopard: 2000,
  'leopard-gold': 5000,
  'leopard-mega': 12000,
}

const R_WEIGHT: Record<Rarity, number> = {
  common: 20,
  rare: 11,
  epic: 5,
  legendary: 2.5,
  leopard: 1,
  'leopard-gold': 0.5,
  'leopard-mega': 0.25,
}

/** Бонус базовых трёх видов (ошейник=монетки, браслет=опыт, венец=алмазы) */
const R_BONUS: Record<Rarity, number> = {
  common: 0.04,
  rare: 0.08,
  epic: 0.12,
  legendary: 0.18,
  leopard: 0.24,
  'leopard-gold': 0.28,
  'leopard-mega': 0.32,
}

/* ════════════════ fx-таблицы по видам (ступень 0..5) ════════════════ */

const RING_FX: InvFx[] = [
  { luck: 1.05 },
  { luck: 1.1, coins: 1.04 },
  { luck: 1.18, xp: 1.06 },
  { luck: 1.28, coins: 1.08, xp: 1.08 },
  { luck: 1.45, coins: 1.1, xp: 1.1, gems: 1.06 },
  { luck: 1.7, coins: 1.15, xp: 1.15, gems: 1.12 },
]

const MAGIC_FX: InvFx[] = [
  { coins: 1.03, xp: 1.03 },
  { xp: 1.06, gems: 1.04 },
  { coins: 1.08, xp: 1.08 },
  { coins: 1.11, xp: 1.11, gems: 1.08 },
  { coins: 1.14, xp: 1.14, gems: 1.1, luck: 1.15 },
  { coins: 1.2, xp: 1.2, gems: 1.14, luck: 1.4 },
]

const WRIST_FX: InvFx[] = [
  { comboPlus: 1 },
  { comboPlus: 2, coins: 1.03 },
  { comboPlus: 3, xp: 1.05 },
  { comboPlus: 5, coins: 1.06 },
  { comboPlus: 8, coins: 1.1, xp: 1.1 },
  { comboPlus: 10, coins: 1.15, xp: 1.15 },
]

const PADS_FX: InvFx[] = [
  { pawSpeed: 0.03, mineBrake: 0.3 },
  { pawSpeed: 0.05, mineBrake: 0.38 },
  { pawSpeed: 0.07, mineBrake: 0.45 },
  { pawSpeed: 0.09, mineBrake: 0.5, xp: 1.04 },
  { pawSpeed: 0.12, mineBrake: 0.6, coins: 1.06 },
  { pawSpeed: 0.15, mineBrake: 0.68, coins: 1.1 },
]

const PERF_FX: InvFx[] = [
  { dropRange: 1.07 },
  { dropRange: 1.1 },
  { dropRange: 1.13, xp: 1.03 },
  { dropRange: 1.18, xp: 1.04 },
  { dropRange: 1.24, luck: 1.05, coins: 1.05 },
  { dropRange: 1.3, luck: 1.08, xp: 1.05 },
]

/** fx по умолчанию для вида; у баночек — свои (цветные) наборы в семье */
const KIND_FX: Partial<Record<ItemKind, (i: number) => InvFx>> = {
  ring: (i) => RING_FX[Math.min(i, RING_FX.length - 1)],
  magic: (i) => MAGIC_FX[Math.min(i, MAGIC_FX.length - 1)],
  wrist: (i) => WRIST_FX[Math.min(i, WRIST_FX.length - 1)],
  pads: (i) => PADS_FX[Math.min(i, PADS_FX.length - 1)],
  perfume: (i) => PERF_FX[Math.min(i, PERF_FX.length - 1)],
}

/* ════════════════ Типы ════════════════ */

export interface LootVariant {
  /** Суффикс id: итоговый id = `${prefix}-${familyId}-${suffix}` */
  suffix: string
  /** «Имя в кавычках» — титул предмета */
  adj: L4
  rarity: Rarity
  sell?: number
  bonus?: number
  fx?: InvFx
}

export interface LootFamily {
  id: string
  kind: ItemKind
  /** Название темы (для сортировок/группировок UI) */
  theme: L4
  /** Флейвор-описание всех предметов семьи */
  flavor: L4
  /** Цвета шлейфа духов (только kind: perfume) */
  trail?: readonly [string, string]
  /** fx-набор семьи (по ступеням); иначе — таблица вида KIND_FX */
  fx?: ReadonlyArray<InvFx>
  variants: LootVariant[]
}

export interface LootSet {
  id: string
  name: L4
  /** Текст эпического бонуса (уже готовая строка на 4 языках) */
  bonus: L4
  /** Флейвор комплекта */
  desc: L4
  /** 5 предметов комплекта */
  items: string[]
  /** Эпический бонус: InvFx-часть (монетки/опыт/алмазы/удача) */
  fx: InvFx
}

/* ════════════════ Семьи ════════════════ */

export const LOOT_FAMILIES: ReadonlyArray<LootFamily> = [
  /* ── ОШЕЙНИКИ (collar) ── */
  {
    id: 'ribbon', kind: 'collar',
    theme: ['Ленты', 'Ribbons', 'Bänder', 'Cintas'],
    flavor: [
      'Шелест ленты слышно раньше, чем звенит сундучок.',
      'The rustle of a ribbon is heard before the chest chimes.',
      'Das Rascheln des Bandes ist früher zu hören als die Truhe.',
      'El crujido de la cinta se oye antes que el cofre.',
    ],
    variants: [
      { suffix: 'red', adj: ['Алый', 'Scarlet', 'Scharlach', 'Escarlata'], rarity: 'common' },
      { suffix: 'mint', adj: ['Мятный', 'Mint', 'Minze', 'Menta'], rarity: 'rare' },
      { suffix: 'royal', adj: ['Королевский', 'Royal', 'Königlich', 'Real'], rarity: 'epic' },
      { suffix: 'brocade', adj: ['Парчовый', 'Brocade', 'Brokat', 'Brocado'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'bell', kind: 'collar',
    theme: ['Колокольчики', 'Bells', 'Glocken', 'Cascabeles'],
    flavor: [
      'Каждый колокольчик — своя нотка в песне удачи.',
      'Every bell is its own note in the song of luck.',
      'Jede Glocke ist eine eigene Note im Lied des Glücks.',
      'Cada cascabel es una nota en la canción de la suerte.',
    ],
    variants: [
      { suffix: 'clay', adj: ['Глиняный', 'Clay', 'Ton', 'Barro'], rarity: 'common' },
      { suffix: 'brass', adj: ['Латунный', 'Brass', 'Messing', 'Latón'], rarity: 'rare' },
      { suffix: 'crystal', adj: ['Хрустальный', 'Crystal', 'Kristall', 'Cristal'], rarity: 'epic' },
      { suffix: 'star', adj: ['Звёздный', 'Star', 'Stern', 'Estrella'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'band', kind: 'collar',
    theme: ['Банданы', 'Bandanas', 'Bandanas', 'Bandanas'],
    flavor: [
      'Бандана держит уши в тонусе, а хвост — в парадном виде.',
      'The bandana keeps ears sharp and the tail ceremonial.',
      'Das Bandana hält die Ohren wach und den Schwanz paradierend.',
      'La bandana mantiene las orejas alerta y la cola en gala.',
    ],
    variants: [
      { suffix: 'dot', adj: ['Горошек', 'Polka Dot', 'Punkte', 'Lunares'], rarity: 'common' },
      { suffix: 'check', adj: ['Клетка', 'Plaid', 'Karo', 'Cuadros'], rarity: 'rare' },
      { suffix: 'flame', adj: ['Пламя', 'Flame', 'Flamme', 'Llama'], rarity: 'epic' },
      { suffix: 'phoenix', adj: ['Феникс', 'Phoenix', 'Phönix', 'Fénix'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовая', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'sea', kind: 'collar',
    theme: ['Морские', 'Sea', 'Meer', 'Mar'],
    flavor: [
      'Пахнет прибоем даже посреди двора.',
      'It smells of surf even in the middle of the yard.',
      'Es riecht nach Brandung mitten im Hof.',
      'Huele a oleaje incluso en medio del patio.',
    ],
    variants: [
      { suffix: 'shell-pink', adj: ['Розовый', 'Pink', 'Rosa', 'Rosa'], rarity: 'common' },
      { suffix: 'shell-pearl', adj: ['Жемчужный', 'Pearl', 'Perle', 'Perla'], rarity: 'rare' },
      { suffix: 'shell-coral', adj: ['Коралловый', 'Coral', 'Koralle', 'Coral'], rarity: 'epic' },
      { suffix: 'shell-abyss', adj: ['Бездонный', 'Abyssal', 'Abgründig', 'Abisal'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'winter', kind: 'collar',
    theme: ['Шарфы', 'Scarves', 'Schals', 'Bufandas'],
    flavor: [
      'Связан из трёх шапок деда Мороза и одной ностальгии.',
      'Knitted from three Santa hats and one nostalgia.',
      'Gestrickt aus drei Weihnachtsmützen und einer Nostalgie.',
      'Tejido con tres gorros de Santa y una nostalgia.',
    ],
    variants: [
      { suffix: 'scarf-knit', adj: ['Вязаный', 'Knitted', 'Gestrickt', 'Tejido'], rarity: 'common' },
      { suffix: 'scarf-wool', adj: ['Шерстяной', 'Wool', 'Wolle', 'Lana'], rarity: 'rare' },
      { suffix: 'scarf-frost', adj: ['Морозный', 'Frost', 'Frost', 'Helada'], rarity: 'epic' },
      { suffix: 'scarf-blizzard', adj: ['Вьюжный', 'Blizzard', 'Schneesturm', 'Nevada'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'space', kind: 'collar',
    theme: ['Космос', 'Space', 'Weltraum', 'Espacio'],
    flavor: [
      'Застёгивается на звёзды, а не на пряжку.',
      'It fastens to stars, not to buckles.',
      'Es schließt sich mit Sternen, nicht mit Schnallen.',
      'Se abrocha con estrellas, no con hebillas.',
    ],
    variants: [
      { suffix: 'comet-tail', adj: ['Кометный', 'Comet', 'Komet', 'Cometa'], rarity: 'common' },
      { suffix: 'nebula-mist', adj: ['Туманный', 'Nebular', 'Nebel', 'Nebulosa'], rarity: 'rare' },
      { suffix: 'astro-gear', adj: ['Орбитальный', 'Orbital', 'Orbital', 'Orbital'], rarity: 'epic' },
      { suffix: 'galaxy-core', adj: ['Галактический', 'Galactic', 'Galaktisch', 'Galáctico'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },

  /* ── БРАСЛЕТЫ (bracelet) ── */
  {
    id: 'woven', kind: 'bracelet',
    theme: ['Плетёные', 'Woven', 'Geflochten', 'Tejidas'],
    flavor: [
      'Плетено лапкой, носится сердцем.',
      'Woven by paw, worn by heart.',
      'Von der Pfote geflochten, vom Herzen getragen.',
      'Tejido por la pata, llevado por el corazón.',
    ],
    variants: [
      { suffix: 'grass', adj: ['Травяной', 'Grass', 'Gras', 'Hierba'], rarity: 'common' },
      { suffix: 'thread', adj: ['Нитяной', 'Thread', 'Faden', 'Hilo'], rarity: 'rare' },
      { suffix: 'silk', adj: ['Шёлковый', 'Silk', 'Seide', 'Seda'], rarity: 'epic' },
      { suffix: 'goldwoven', adj: ['Златотканый', 'Goldwoven', 'Goldgewoben', 'Tejido de Oro'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'fruit', kind: 'bracelet',
    theme: ['Фруктовые бусины', 'Fruit Beads', 'Fruchtperlen', 'Cuentas de Frutas'],
    flavor: [
      'Бусины спелые — сорваны в самый сезон.',
      'The beads are ripe — picked right in season.',
      'Die Perlen sind reif — zur besten Saison gepflückt.',
      'Las cuentas están maduras: recogidas en plena temporada.',
    ],
    variants: [
      { suffix: 'apple', adj: ['Яблочный', 'Apple', 'Apfel', 'Manzana'], rarity: 'common' },
      { suffix: 'cherry', adj: ['Вишнёвый', 'Cherry', 'Kirsche', 'Cereza'], rarity: 'rare' },
      { suffix: 'mango', adj: ['Манговый', 'Mango', 'Mango', 'Mango'], rarity: 'epic' },
      { suffix: 'dragon', adj: ['Драконий', 'Dragon', 'Drache', 'Dragón'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'sport', kind: 'bracelet',
    theme: ['Спортивные', 'Sport', 'Sport', 'Deporte'],
    flavor: [
      'Пульс победы — прямо на запястье.',
      'The pulse of victory — right on the wrist.',
      'Der Pulsschlag des Sieges — direkt am Handgelenk.',
      'El pulso de la victoria: justo en la muñeca.',
    ],
    variants: [
      { suffix: 'step', adj: ['Шагомерный', 'Step', 'Schritt', 'Paso'], rarity: 'common' },
      { suffix: 'pulse', adj: ['Пульсовой', 'Pulse', 'Puls', 'Pulso'], rarity: 'rare' },
      { suffix: 'record', adj: ['Рекордный', 'Record', 'Rekord', 'Récord'], rarity: 'epic' },
      { suffix: 'trophy', adj: ['Трофейный', 'Trophy', 'Trophäe', 'Trofeo'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'pirate', kind: 'bracelet',
    theme: ['Пиратские', 'Pirate', 'Piraten', 'Pirata'],
    flavor: [
      'Йо-хо и бутылка молока!',
      'Yo-ho and a bottle of milk!',
      'Joho und eine Flasche Milch!',
      '¡Yo-ho y una botella de leche!',
    ],
    variants: [
      { suffix: 'rope', adj: ['Канатный', 'Rope', 'Seil', 'Cuerda'], rarity: 'common' },
      { suffix: 'hook', adj: ['Крюкастый', 'Hooked', 'Gehakt', 'Anzado'], rarity: 'rare' },
      { suffix: 'doubloon', adj: ['Дублонный', 'Doubloon', 'Dublonen', 'Doblón'], rarity: 'epic' },
      { suffix: 'flagship', adj: ['Флагманский', 'Flagship', 'Flaggschiff', 'Insignia'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'coral', kind: 'bracelet',
    theme: ['Кораллы', 'Coral', 'Korallen', 'Corales'],
    flavor: [
      'Коралловый риф одобряет этот блеск.',
      'The coral reef approves of this shine.',
      'Das Korallenriff billigt diesen Glanz.',
      'El arrecife aprueba este brillo.',
    ],
    variants: [
      { suffix: 'branch', adj: ['Ветвистый', 'Branch', 'Zweig', 'Rama'], rarity: 'common' },
      { suffix: 'rose', adj: ['Розовый', 'Rose', 'Rosa', 'Rosa'], rarity: 'rare' },
      { suffix: 'reef', adj: ['Рифовый', 'Reef', 'Riff', 'Arrecife'], rarity: 'epic' },
      { suffix: 'deep', adj: ['Глубинный', 'Deep-sea', 'Tiefsee', 'Profundo'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'star', kind: 'bracelet',
    theme: ['Звёзды', 'Stars', 'Sterne', 'Estrellas'],
    flavor: [
      'Носится на запястье — светит на весь этап.',
      'Worn on the wrist — shines across the whole stage.',
      'Am Handgelenk getragen — leuchtet über die ganze Etappe.',
      'Llevado en la muñeca: brilla por toda la etapa.',
    ],
    variants: [
      { suffix: 'bead', adj: ['Звёздный', 'Star', 'Stern', 'Estrella'], rarity: 'common' },
      { suffix: 'orbit', adj: ['Орбитальный', 'Orbital', 'Orbital', 'Orbital'], rarity: 'rare' },
      { suffix: 'twinkle', adj: ['Мерцающий', 'Twinkling', 'Funkelnd', 'Centelleante'], rarity: 'epic' },
      { suffix: 'supernova', adj: ['Сверхновый', 'Supernova', 'Supernova', 'Supernova'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },

  /* ── ВЕНЦЫ (crown) ── */
  {
    id: 'flower', kind: 'crown',
    theme: ['Цветочные', 'Flower', 'Blumen', 'Flores'],
    flavor: [
      'Цветы свежие — пчёлы уже в очереди.',
      'The flowers are fresh — the bees are already queuing.',
      'Die Blumen sind frisch — die Bienen stehen schon Schlange.',
      'Las flores están frescas: las abejas ya hacen fila.',
    ],
    variants: [
      { suffix: 'daisy', adj: ['Ромашковый', 'Daisy', 'Gänseblume', 'Margarita'], rarity: 'common' },
      { suffix: 'clover', adj: ['Клеверный', 'Clover', 'Klee', 'Trébol'], rarity: 'rare' },
      { suffix: 'rose', adj: ['Розовый', 'Rose', 'Rosa', 'Rosa'], rarity: 'epic' },
      { suffix: 'lotus', adj: ['Лотосовый', 'Lotus', 'Lotos', 'Loto'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'berry', kind: 'crown',
    theme: ['Ягодные', 'Berry', 'Beeren', 'Bayas'],
    flavor: [
      'Сок ягод — лучшая королевская печать.',
      'Berry juice is the finest royal seal.',
      'Beersaft ist das allerbeste Königssiegel.',
      'El zumo de baya es el mejor sello real.',
    ],
    variants: [
      { suffix: 'straw', adj: ['Земляничный', 'Strawberry', 'Erdbeere', 'Fresa'], rarity: 'common' },
      { suffix: 'ling', adj: ['Брусничный', 'Lingonberry', 'Preiselbeere', 'Arándano'], rarity: 'rare' },
      { suffix: 'cassis', adj: ['Черносмородиновый', 'Cassis', 'Cassis', 'Casis'], rarity: 'epic' },
      { suffix: 'preserve', adj: ['Вареньевый', 'Preserve', 'Konfitüre', 'Mermelada'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'ice', kind: 'crown',
    theme: ['Ледяные', 'Ice', 'Eis', 'Hielo'],
    flavor: [
      'Не тает даже в самой жаркой Лихорадке.',
      'It does not melt even in the hottest Fever.',
      'Es schmilzt nicht einmal im heißesten Fieber.',
      'No se derrita ni en la Fiebre más ardiente.',
    ],
    variants: [
      { suffix: 'snow', adj: ['Снежный', 'Snowy', 'Verschneit', 'Nieve'], rarity: 'common' },
      { suffix: 'frost', adj: ['Морозный', 'Frost', 'Frost', 'Helada'], rarity: 'rare' },
      { suffix: 'crystal', adj: ['Кристальный', 'Crystal', 'Kristall', 'Cristal'], rarity: 'epic' },
      { suffix: 'glacier', adj: ['Ледниковый', 'Glacier', 'Gletscher', 'Glaciar'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'autumn', kind: 'crown',
    theme: ['Осенние', 'Autumn', 'Herbst', 'Otoño'],
    flavor: [
      'Собран в самый золотой листопад.',
      'Gathered in the most golden of leaf falls.',
      'Gesammelt im goldensten Laubfall.',
      'Recogido en el otoño más dorado.',
    ],
    variants: [
      { suffix: 'leaf', adj: ['Лиственный', 'Leaf', 'Blatt', 'Hoja'], rarity: 'common' },
      { suffix: 'oak', adj: ['Дубовый', 'Oak', 'Eiche', 'Roble'], rarity: 'rare' },
      { suffix: 'amber', adj: ['Янтарный', 'Amber', 'Bernstein', 'Ámbar'], rarity: 'epic' },
      { suffix: 'harvest', adj: ['Урожайный', 'Harvest', 'Ernte', 'Cosecha'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'star', kind: 'crown',
    theme: ['Звёздные', 'Star', 'Sterne', 'Estrellas'],
    flavor: [
      'Каждый лепесток — маленькая звезда.',
      'Every petal is a tiny star.',
      'Jedes Blatt ist ein kleiner Stern.',
      'Cada pétalo es una pequeña estrella.',
    ],
    variants: [
      { suffix: 'dust', adj: ['Пылевой', 'Stardust', 'Sternenstaub', 'Polvo'], rarity: 'common' },
      { suffix: 'comet', adj: ['Кометный', 'Comet', 'Komet', 'Cometa'], rarity: 'rare' },
      { suffix: 'constellation', adj: ['Созвездный', 'Constellation', 'Konstellation', 'Constelación'], rarity: 'epic' },
      { suffix: 'galaxy', adj: ['Галактический', 'Galactic', 'Galaktisch', 'Galáctico'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },

  /* ── КОЛЬЦА (ring) ── */
  {
    id: 'gem', kind: 'ring',
    theme: ['Самоцветы', 'Gemstones', 'Edelsteine', 'Gemas'],
    flavor: [
      'Камень подогнан под подушечку — сидит как влитой.',
      'The stone is fitted to the pad — sits like a glove.',
      'Der Stein ist auf das Polster gefasst — sitzt wie angegossen.',
      'La gema está tallada para la almohadilla: calza perfecta.',
    ],
    variants: [
      { suffix: 'quartz', adj: ['Кварцевый', 'Quartz', 'Quarz', 'Cuarzo'], rarity: 'common' },
      { suffix: 'topaz', adj: ['Топазовый', 'Topaz', 'Topas', 'Topacio'], rarity: 'rare' },
      { suffix: 'garnet', adj: ['Гранатовый', 'Garnet', 'Granat', 'Granate'], rarity: 'epic' },
      { suffix: 'amethyst', adj: ['Аметистовый', 'Amethyst', 'Amethyst', 'Amatista'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'candy', kind: 'ring',
    theme: ['Карамельные', 'Candy', 'Bonbons', 'Caramelos'],
    flavor: [
      'Сладко, но слизывать нельзя.',
      'Sweet, but no licking allowed.',
      'Süß, aber Ablecken verboten.',
      'Dulce, pero no se puede lamer.',
    ],
    variants: [
      { suffix: 'marmalade', adj: ['Мармеладный', 'Marmalade', 'Marmelade', 'Gelatina'], rarity: 'common' },
      { suffix: 'lollipop', adj: ['Леденцовый', 'Lollipop', 'Lolli', 'Paleta'], rarity: 'rare' },
      { suffix: 'caramel', adj: ['Карамельный', 'Caramel', 'Karamell', 'Caramelo'], rarity: 'epic' },
      { suffix: 'toffee', adj: ['Тоффи', 'Toffee', 'Toffee', 'Toffee'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'pearl', kind: 'ring',
    theme: ['Жемчужные', 'Pearl', 'Perlen', 'Perlas'],
    flavor: [
      'Жемчуг из самой хвастливой ракушки.',
      'Pearl from the most boastful of shells.',
      'Perle aus der angeberischsten Muschel.',
      'Perla de la concha más presumida.',
    ],
    variants: [
      { suffix: 'seed', adj: ['Жемчужный', 'Pearl', 'Perle', 'Perla'], rarity: 'common' },
      { suffix: 'rose', adj: ['Розовый', 'Rose', 'Rosa', 'Rosada'], rarity: 'rare' },
      { suffix: 'black', adj: ['Чёрный', 'Black', 'Schwarz', 'Negra'], rarity: 'epic' },
      { suffix: 'abyss', adj: ['Бездонный', 'Abyssal', 'Abgrund', 'Abisal'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'meteor', kind: 'ring',
    theme: ['Метеоритные', 'Meteor', 'Meteore', 'Meteoritos'],
    flavor: [
      'Падал к нам через три галактики.',
      'It fell our way across three galaxies.',
      'Er fiel über drei Galaxien zu uns.',
      'Cayó hacia nosotros a través de tres galaxias.',
    ],
    variants: [
      { suffix: 'chip', adj: ['Осколочный', 'Chip', 'Splitter', 'Esquirla'], rarity: 'common' },
      { suffix: 'iron', adj: ['Железный', 'Iron', 'Eisen', 'Hierro'], rarity: 'rare' },
      { suffix: 'core', adj: ['Ядровый', 'Core', 'Kern', 'Núcleo'], rarity: 'epic' },
      { suffix: 'quasar', adj: ['Квазарный', 'Quasar', 'Quasar', 'Cuásar'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'clock', kind: 'ring',
    theme: ['Часовые', 'Clockwork', 'Uhrwerk', 'Relojería'],
    flavor: [
      'Тикает в ритме комбо.',
      'It ticks in the rhythm of the combo.',
      'Sie tickt im Rhythmus des Combos.',
      'Late al ritmo del combo.',
    ],
    variants: [
      { suffix: 'second', adj: ['Секундный', 'Second', 'Sekunde', 'Segundo'], rarity: 'common' },
      { suffix: 'bronze', adj: ['Бронзовый', 'Bronze', 'Bronze', 'Bronce'], rarity: 'rare' },
      { suffix: 'gearwork', adj: ['Зубчатый', 'Gearwork', 'Zahnrad', 'Engranaje'], rarity: 'epic' },
      { suffix: 'eternity', adj: ['Вечный', 'Eternal', 'Ewig', 'Eterno'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
      { suffix: 'leopard-gold', adj: ['Златолапый', 'Golden Paw', 'Goldpfote', 'Pata Dorada'], rarity: 'leopard-gold' },
    ],
  },

  /* ── БАНОЧКИ (jar) — у каждой семьи свой набор fx ── */
  {
    id: 'soda', kind: 'jar',
    theme: ['Газировки', 'Sodas', 'Limonaden', 'Refrescos'],
    flavor: [
      'Шипит и булькает — боссы стесняются подойти.',
      'Fizzing and bubbling — even bosses keep their distance.',
      'Zischt und blubbert — selbst Bosse halten Abstand.',
      'Chisporrotea y burbujea: hasta los jefes mantienen distancia.',
    ],
    fx: [
      { coins: 1.05 },
      { coins: 1.08 },
      { coins: 1.12 },
      { coins: 1.16, xp: 1.04 },
      { coins: 1.22, xp: 1.06 },
    ],
    variants: [
      { suffix: 'lemon', adj: ['Лимонадный', 'Lemonade', 'Limonade', 'Limonada'], rarity: 'common' },
      { suffix: 'berry', adj: ['Ягодный', 'Berry', 'Beere', 'Baya'], rarity: 'rare' },
      { suffix: 'cola', adj: ['Кола', 'Cola', 'Cola', 'Cola'], rarity: 'epic' },
      { suffix: 'thunder', adj: ['Грозовой', 'Thunder', 'Donner', 'Trueno'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'jam', kind: 'jar',
    theme: ['Варенья', 'Jams', 'Konfitüren', 'Mermeladas'],
    flavor: [
      'Сварено по бабушкиному рецепту удачи.',
      'Brewed by grandma’s own recipe of luck.',
      'Nach Omas eigenem Glücksrezept eingekocht.',
      'Cocinado con la receta de suerte de la abuela.',
    ],
    fx: [
      { xp: 1.04 },
      { xp: 1.07 },
      { xp: 1.1 },
      { xp: 1.14, coins: 1.04 },
      { xp: 1.2, coins: 1.06 },
    ],
    variants: [
      { suffix: 'apple', adj: ['Яблочное', 'Apple', 'Apfel', 'Manzana'], rarity: 'common' },
      { suffix: 'raspberry', adj: ['Малиновое', 'Raspberry', 'Himbeere', 'Frambuesa'], rarity: 'rare' },
      { suffix: 'royal', adj: ['Королевское', 'Royal', 'Königlich', 'Real'], rarity: 'epic' },
      { suffix: 'amber', adj: ['Янтарное', 'Amber', 'Bernstein', 'Ámbar'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовое', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'brew', kind: 'jar',
    theme: ['Зелья', 'Brews', 'Bräue', 'Pociones'],
    flavor: [
      'Рецепт из старого фолианта, пузырьки прилагаются.',
      'A recipe from an old tome, bubbles included.',
      'Ein Rezept aus altem Foliant, Bläschen inbegriffen.',
      'Receta de un tomo antiguo, burbujas incluidas.',
    ],
    fx: [
      { luck: 1.04 },
      { luck: 1.08 },
      { luck: 1.14, xp: 1.04 },
      { luck: 1.2, gems: 1.05 },
      { luck: 1.3, gems: 1.08 },
    ],
    variants: [
      { suffix: 'herb', adj: ['Травяное', 'Herbal', 'Kräuter', 'Hierbas'], rarity: 'common' },
      { suffix: 'moon', adj: ['Лунное', 'Moon', 'Mond', 'Luna'], rarity: 'rare' },
      { suffix: 'shadow', adj: ['Тенистое', 'Shadow', 'Schatten', 'Sombra'], rarity: 'epic' },
      { suffix: 'phantom', adj: ['Призрачное', 'Phantom', 'Phantom', 'Fantasma'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовое', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'cocoa', kind: 'jar',
    theme: ['Какао', 'Cocoa', 'Kakao', 'Cacao'],
    flavor: [
      'Тёплое, как мурлыканье у камина.',
      'Warm as a purr by the fireplace.',
      'Warm wie ein Schnurren am Kamin.',
      'Cálido como un ronroneo junto a la chimenea.',
    ],
    fx: [
      { xp: 1.03, coins: 1.03 },
      { xp: 1.06, coins: 1.05 },
      { xp: 1.09, coins: 1.07 },
      { xp: 1.12, coins: 1.09 },
      { xp: 1.16, coins: 1.12 },
    ],
    variants: [
      { suffix: 'milk', adj: ['Молочное', 'Milky', 'Milch', 'Leche'], rarity: 'common' },
      { suffix: 'spice', adj: ['Пряное', 'Spiced', 'Würzig', 'Especiado'], rarity: 'rare' },
      { suffix: 'espresso', adj: ['Эспрессо', 'Espresso', 'Espresso', 'Espresso'], rarity: 'epic' },
      { suffix: 'velvet', adj: ['Бархатное', 'Velvet', 'Samt', 'Terciopelo'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовое', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'juice', kind: 'jar',
    theme: ['Соки', 'Juices', 'Säfte', 'Zumos'],
    flavor: [
      'Отжато из самого солнечного урожая.',
      'Pressed from the sunniest harvest.',
      'Gepresst aus der sonnigsten Ernte.',
      'Exprimido de la cosecha más soleada.',
    ],
    fx: [
      { gems: 1.04 },
      { gems: 1.07 },
      { gems: 1.1 },
      { gems: 1.13, xp: 1.04 },
      { gems: 1.18, xp: 1.06 },
    ],
    variants: [
      { suffix: 'fresh', adj: ['Свежий', 'Fresh', 'Frisch', 'Fresco'], rarity: 'common' },
      { suffix: 'orange', adj: ['Апельсиновый', 'Orange', 'Orange', 'Naranja'], rarity: 'rare' },
      { suffix: 'pomegranate', adj: ['Гранатовый', 'Pomegranate', 'Granatapfel', 'Granada'], rarity: 'epic' },
      { suffix: 'nectar', adj: ['Нектарный', 'Nectar', 'Nektar', 'Néctar'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'ocean', kind: 'jar',
    theme: ['Морские', 'Ocean', 'Ozean', 'Océano'],
    flavor: [
      'Внутри — прилив, отлив и капля тайны.',
      'Inside: tide, ebb and a drop of mystery.',
      'Drinnen: Flut, Ebbe und ein Tropfen Geheimnis.',
      'Dentro: marea, reflujo y una gota de misterio.',
    ],
    fx: [
      { gems: 1.03 },
      { gems: 1.06, coins: 1.04 },
      { gems: 1.1, coins: 1.05 },
      { gems: 1.14, luck: 1.05 },
      { gems: 1.18, luck: 1.08 },
    ],
    variants: [
      { suffix: 'salt', adj: ['Солёная', 'Salty', 'Salzig', 'Salada'], rarity: 'common' },
      { suffix: 'tide', adj: ['Приливная', 'Tide', 'Gezeiten', 'Marea'], rarity: 'rare' },
      { suffix: 'pearl', adj: ['Жемчужная', 'Pearl', 'Perle', 'Perla'], rarity: 'epic' },
      { suffix: 'depth', adj: ['Глубинная', 'Deep-sea', 'Tiefsee', 'Profunda'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовая', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },

  /* ── ТАЛИСМАНЫ (magic) ── */
  {
    id: 'critter', kind: 'magic',
    theme: ['Зверюшки', 'Critters', 'Tierchen', 'Animalitos'],
    flavor: [
      'Маленький друг приносит большую удачу.',
      'A little friend brings big luck.',
      'Ein kleiner Freund bringt großes Glück.',
      'Un pequeño amigo trae gran suerte.',
    ],
    variants: [
      { suffix: 'mouse', adj: ['Мышиный', 'Mouse', 'Maus', 'Ratón'], rarity: 'common' },
      { suffix: 'hedgehog', adj: ['Ежовый', 'Hedgehog', 'Igel', 'Erizo'], rarity: 'rare' },
      { suffix: 'owl', adj: ['Совиный', 'Owl', 'Eule', 'Búho'], rarity: 'epic' },
      { suffix: 'fox', adj: ['Лисий', 'Fox', 'Fuchs', 'Zorro'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'sweet', kind: 'magic',
    theme: ['Сладости', 'Sweets', 'Süßigkeiten', 'Dulces'],
    flavor: [
      'Держать подальше от Ланы. И от себя.',
      'Keep away from Lana. And from yourself.',
      'Fern von Lana halten. Und von einem selbst.',
      'Mantener lejos de Lana. Y de uno mismo.',
    ],
    variants: [
      { suffix: 'cookie', adj: ['Печеньковый', 'Cookie', 'Keks', 'Galleta'], rarity: 'common' },
      { suffix: 'marshmallow', adj: ['Зефирный', 'Marshmallow', 'Schaumzucker', 'Nube'], rarity: 'rare' },
      { suffix: 'donut', adj: ['Пончиковый', 'Donut', 'Donut', 'Dona'], rarity: 'epic' },
      { suffix: 'confection', adj: ['Кондитерский', 'Confection', 'Konditor', 'Repostería'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'sky', kind: 'magic',
    theme: ['Небесные', 'Sky', 'Himmel', 'Cielo'],
    flavor: [
      'Кусочек неба в кармане.',
      'A little piece of sky in your pocket.',
      'Ein kleines Stück Himmel in der Tasche.',
      'Un pedacito de cielo en el bolsillo.',
    ],
    variants: [
      { suffix: 'cloud', adj: ['Облачный', 'Cloud', 'Wolke', 'Nube'], rarity: 'common' },
      { suffix: 'rainbow', adj: ['Радужный', 'Rainbow', 'Regenbogen', 'Arcoíris'], rarity: 'rare' },
      { suffix: 'sun', adj: ['Солнечный', 'Sunny', 'Sonnig', 'Soleado'], rarity: 'epic' },
      { suffix: 'borealis', adj: ['Полярный', 'Boreal', 'Polar', 'Boreal'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'popcorn', kind: 'magic',
    theme: ['Попкорн', 'Popcorn', 'Popcorn', 'Palomitas'],
    flavor: [
      'Хрустит в такт комбо.',
      'It crunches in rhythm with the combo.',
      'Es knuspert im Takt des Combos.',
      'Cruje al ritmo del combo.',
    ],
    variants: [
      { suffix: 'kernel', adj: ['Зерновой', 'Kernel', 'Korn', 'Grano'], rarity: 'common' },
      { suffix: 'caramel', adj: ['Карамельный', 'Caramel', 'Karamell', 'Caramelo'], rarity: 'rare' },
      { suffix: 'butter', adj: ['Масляный', 'Butter', 'Butter', 'Mantequilla'], rarity: 'epic' },
      { suffix: 'golden', adj: ['Золотой', 'Golden', 'Golden', 'Dorado'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'firefly', kind: 'magic',
    theme: ['Ночные', 'Night', 'Nacht', 'Noche'],
    flavor: [
      'Светит в темноте лучше любого фонаря.',
      'It lights the dark better than any lantern.',
      'Erleuchtet die Dunkelheit besser als jede Laterne.',
      'Ilumina la oscuridad mejor que cualquier farol.',
    ],
    variants: [
      { suffix: 'spark', adj: ['Искристый', 'Spark', 'Funken', 'Chispa'], rarity: 'common' },
      { suffix: 'lantern', adj: ['Фонарный', 'Lantern', 'Laterne', 'Farol'], rarity: 'rare' },
      { suffix: 'ghost', adj: ['Призрачный', 'Ghost', 'Geist', 'Fantasma'], rarity: 'epic' },
      { suffix: 'eclipse', adj: ['Затменный', 'Eclipse', 'Finsternis', 'Eclipse'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'beach', kind: 'magic',
    theme: ['Пляжные', 'Beach', 'Strand', 'Playa'],
    flavor: [
      'Песок между подушечками — это стиль.',
      'Sand between the pads — that is style.',
      'Sand zwischen den Pfoten — das ist Stil.',
      'Arena entre las almohadillas: eso es estilo.',
    ],
    variants: [
      { suffix: 'whisper', adj: ['Шёпотный', 'Whisper', 'Flüstern', 'Susurro'], rarity: 'common' },
      { suffix: 'wave', adj: ['Волновой', 'Wave', 'Welle', 'Ola'], rarity: 'rare' },
      { suffix: 'starfish', adj: ['Звездоносный', 'Starfish', 'Seestern', 'Estelar'], rarity: 'epic' },
      { suffix: 'tide', adj: ['Приливный', 'Tide', 'Gezeiten', 'Marea'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },

  /* ── НАПУЛЬСНИКИ (wrist) ── */
  {
    id: 'capt', kind: 'wrist',
    theme: ['Капитанские', 'Captain', 'Kapitän', 'Capitán'],
    flavor: [
      'Курс — на самый большой сундук.',
      'Course set for the biggest chest.',
      'Kurs auf die größte Truhe.',
      'Rumbo al cofre más grande.',
    ],
    variants: [
      { suffix: 'cadet', adj: ['Юнга', 'Cadet', 'Kadett', 'Cadete'], rarity: 'common' },
      { suffix: 'flag', adj: ['Флагманский', 'Flag', 'Flagge', 'Bandera'], rarity: 'rare' },
      { suffix: 'storm', adj: ['Штормовой', 'Storm', 'Sturm', 'Tormenta'], rarity: 'epic' },
      { suffix: 'admiral', adj: ['Адмиральский', 'Admiral', 'Admiral', 'Almirante'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'glow', kind: 'wrist',
    theme: ['Светящиеся', 'Glow', 'Leuchten', 'Brillo'],
    flavor: [
      'Светится ярче, чем планы на выходные.',
      'It glows brighter than weekend plans.',
      'Leuchtet heller als Wochenendpläne.',
      'Brilla más que los planes del fin de semana.',
    ],
    variants: [
      { suffix: 'soft', adj: ['Мягкий', 'Soft', 'Weich', 'Suave'], rarity: 'common' },
      { suffix: 'neon', adj: ['Неоновый', 'Neon', 'Neon', 'Neón'], rarity: 'rare' },
      { suffix: 'laser', adj: ['Лазерный', 'Laser', 'Laser', 'Láser'], rarity: 'epic' },
      { suffix: 'sunrise', adj: ['Рассветный', 'Sunrise', 'Sonnenaufgang', 'Amanecer'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'nano', kind: 'wrist',
    theme: ['Ультра', 'Nano', 'Nano', 'Nano'],
    flavor: [
      'Технологии будущего в спортивном размере.',
      'Future tech in sport size.',
      'Zukunftstechnik in Sportgröße.',
      'Tecnología del futuro en tamaño deportivo.',
    ],
    variants: [
      { suffix: 'carbon', adj: ['Карбоновый', 'Carbon', 'Karbon', 'Carbono'], rarity: 'common' },
      { suffix: 'titan', adj: ['Титановый', 'Titan', 'Titan', 'Titán'], rarity: 'rare' },
      { suffix: 'quantum', adj: ['Квантовый', 'Quantum', 'Quantum', 'Cuántico'], rarity: 'epic' },
      { suffix: 'singularity', adj: ['Сингулярный', 'Singularity', 'Singularität', 'Singularidad'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'retro', kind: 'wrist',
    theme: ['Ретро', 'Retro', 'Retro', 'Retro'],
    flavor: [
      'Из эпохи, когда комбо мерили на пальцах.',
      'From the era when combos were counted on fingers.',
      'Aus der Zeit, als Combos an Fingern gezählt wurden.',
      'De la época en que los combos se contaban con los dedos.',
    ],
    variants: [
      { suffix: 'wool', adj: ['Шерстяной', 'Wool', 'Wolle', 'Lana'], rarity: 'common' },
      { suffix: 'stripe', adj: ['Полосатый', 'Striped', 'Gestreift', 'Rayado'], rarity: 'rare' },
      { suffix: 'vinyl', adj: ['Виниловый', 'Vinyl', 'Vinyl', 'Vinilo'], rarity: 'epic' },
      { suffix: 'arcade', adj: ['Аркадный', 'Arcade', 'Arcade', 'Arcade'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },

  /* ── НАКЛАДКИ (pads) ── */
  {
    id: 'felt', kind: 'pads',
    theme: ['Войлочные', 'Felt', 'Filz', 'Fieltro'],
    flavor: [
      'Мягкие, как первый снег на подушечках.',
      'Soft as the first snow on the pads.',
      'Weich wie der erste Schnee auf den Pfoten.',
      'Suaves como la primera nieve en las almohadillas.',
    ],
    variants: [
      { suffix: 'soft', adj: ['Мягкий', 'Soft', 'Weich', 'Suave'], rarity: 'common' },
      { suffix: 'dense', adj: ['Плотный', 'Dense', 'Dicht', 'Denso'], rarity: 'rare' },
      { suffix: 'ember', adj: ['Тлеющий', 'Ember', 'Glut', 'Brasa'], rarity: 'epic' },
      { suffix: 'meteor', adj: ['Метеоритный', 'Meteor', 'Meteor', 'Meteorito'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'rubber', kind: 'pads',
    theme: ['Резиновые', 'Rubber', 'Gummi', 'Caucho'],
    flavor: [
      'Сцепление — как у кота с недоеденной сосиской.',
      'Grip like a cat with an uneaten sausage.',
      'Haftung wie eine Katze mit unbeender Wurst.',
      'Agarre como un gato con salchicha sin terminar.',
    ],
    variants: [
      { suffix: 'matte', adj: ['Матовый', 'Matte', 'Matt', 'Mate'], rarity: 'common' },
      { suffix: 'grip', adj: ['Цепкий', 'Grippy', 'Griffig', 'Agarre'], rarity: 'rare' },
      { suffix: 'thunder', adj: ['Громовой', 'Thunder', 'Donner', 'Trueno'], rarity: 'epic' },
      { suffix: 'typhoon', adj: ['Тайфунный', 'Typhoon', 'Taifun', 'Tifón'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'magnet', kind: 'pads',
    theme: ['Магнитные', 'Magnetic', 'Magnetisch', 'Magnéticas'],
    flavor: [
      'Притягивает удачу и немного пыли.',
      'It attracts luck and a bit of dust.',
      'Zieht Glück und ein wenig Staub an.',
      'Atrae la suerte y un poco de polvo.',
    ],
    variants: [
      { suffix: 'fridge', adj: ['Холодильниковый', 'Fridge', 'Kühlschrank', 'Nevera'], rarity: 'common' },
      { suffix: 'field', adj: ['Полевой', 'Field', 'Feld', 'Campo'], rarity: 'rare' },
      { suffix: 'storm', adj: ['Буревой', 'Storm', 'Sturm', 'Tormenta'], rarity: 'epic' },
      { suffix: 'polarity', adj: ['Полярный', 'Polarity', 'Polarität', 'Polaridad'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'velvet', kind: 'pads',
    theme: ['Бархатные', 'Velvet', 'Samt', 'Terciopelo'],
    flavor: [
      'Королевская мягкость для королевских лапок.',
      'Royal softness for royal paws.',
      'Königliche Weichheit für königliche Pfoten.',
      'Suavidad real para patas reales.',
    ],
    variants: [
      { suffix: 'plush', adj: ['Плюшевый', 'Plush', 'Plüsch', 'Peluche'], rarity: 'common' },
      { suffix: 'royal', adj: ['Королевский', 'Royal', 'Königlich', 'Real'], rarity: 'rare' },
      { suffix: 'midnight', adj: ['Полуночный', 'Midnight', 'Mitternacht', 'Medianoche'], rarity: 'epic' },
      { suffix: 'crowned', adj: ['Коронованный', 'Crowned', 'Gekrönt', 'Coronado'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },

  /* ── ДУХИ (perfume) ── */
  {
    id: 'forest', kind: 'perfume',
    theme: ['Лесные', 'Forest', 'Wald', 'Bosque'],
    flavor: [
      'Аромат хвои, дождя и тихого триумфа.',
      'The scent of pine, rain and quiet triumph.',
      'Der Duft von Nadeln, Regen und stillem Triumph.',
      'Aroma de pino, lluvia y triunfo tranquilo.',
    ],
    trail: ['#5da871', '#a3d9a5'],
    variants: [
      { suffix: 'rain', adj: ['Дождливый', 'Rain', 'Regen', 'Lluvia'], rarity: 'common' },
      { suffix: 'moss', adj: ['Мшистый', 'Moss', 'Moos', 'Musgo'], rarity: 'rare' },
      { suffix: 'cedar', adj: ['Кедровый', 'Cedar', 'Zeder', 'Cedro'], rarity: 'epic' },
      { suffix: 'myst', adj: ['Туманный', 'Mystic', 'Mystisch', 'Místico'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'gour', kind: 'perfume',
    theme: ['Гурманские', 'Gourmet', 'Gourmet', 'Gourmet'],
    flavor: [
      'Пахнет так, что сундучки сами подходят.',
      'It smells so good the chests come over on their own.',
      'Es duftet so, dass die Truhen von selbst herkommen.',
      'Huele tan bien que los cofres vienen solos.',
    ],
    trail: ['#8a5a3b', '#c9a06b'],
    variants: [
      { suffix: 'cocoa', adj: ['Какао', 'Cocoa', 'Kakao', 'Cacao'], rarity: 'common' },
      { suffix: 'mocha', adj: ['Мокко', 'Mocha', 'Mokka', 'Moca'], rarity: 'rare' },
      { suffix: 'praline', adj: ['Пралине', 'Praline', 'Praline', 'Praliné'], rarity: 'epic' },
      { suffix: 'truffle', adj: ['Трюфельный', 'Truffle', 'Trüffel', 'Trufa'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'bloom', kind: 'perfume',
    theme: ['Цветочные', 'Bloom', 'Blüte', 'Floración'],
    flavor: [
      'Букет, который не завянет к третьему этапу.',
      'A bouquet that will not wilt by stage three.',
      'Ein Strauß, der bis Etappe drei nicht verwelkt.',
      'Un ramo que no se marchita en la tercera etapa.',
    ],
    trail: ['#d977b8', '#f0b3dd'],
    variants: [
      { suffix: 'lilac', adj: ['Сиреневый', 'Lilac', 'Flieder', 'Lila'], rarity: 'common' },
      { suffix: 'peony', adj: ['Пионовый', 'Peony', 'Pfingstrose', 'Peonía'], rarity: 'rare' },
      { suffix: 'jasmine', adj: ['Жасминовый', 'Jasmine', 'Jasmin', 'Jazmín'], rarity: 'epic' },
      { suffix: 'gardenia', adj: ['Гардениевый', 'Gardenia', 'Gardenie', 'Gardenia'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'fiesta', kind: 'perfume',
    theme: ['Праздничные', 'Fiesta', 'Fiesta', 'Fiesta'],
    flavor: [
      'Каждый забег — маленький карнавал.',
      'Every run is a little carnival.',
      'Jeder Lauf ist ein kleiner Karneval.',
      'Cada carrera es un pequeño carnaval.',
    ],
    trail: ['#e05a8a', '#f2c94c'],
    variants: [
      { suffix: 'confetti', adj: ['Конфетти', 'Confetti', 'Konfetti', 'Confeti'], rarity: 'common' },
      { suffix: 'streamer', adj: ['Гирляндовый', 'Streamer', 'Luftschlange', 'Serpentina'], rarity: 'rare' },
      { suffix: 'firework', adj: ['Фейерверочный', 'Firework', 'Feuerwerk', 'Fuegos'], rarity: 'epic' },
      { suffix: 'carnival', adj: ['Карнавальный', 'Carnival', 'Karneval', 'Carnaval'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'ozone', kind: 'perfume',
    theme: ['Морские духи', 'Sea Breeze', 'Seewind', 'Brisa Marina'],
    flavor: [
      'Свежесть бризов и дерзость волн.',
      'The freshness of breezes and the audacity of waves.',
      'Die Frische der Brisen und die Frechheit der Wellen.',
      'La frescura de las brisas y la osadía de las olas.',
    ],
    trail: ['#57b8b0', '#9fe0d8'],
    variants: [
      { suffix: 'surf', adj: ['Прибойный', 'Surf', 'Brandung', 'Oleaje'], rarity: 'common' },
      { suffix: 'breeze', adj: ['Бризовый', 'Breeze', 'Brise', 'Brisa'], rarity: 'rare' },
      { suffix: 'deep', adj: ['Глубоководный', 'Deep', 'Tief', 'Profundo'], rarity: 'epic' },
      { suffix: 'storm', adj: ['Штормовой', 'Storm', 'Sturm', 'Tormenta'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
  {
    id: 'frost', kind: 'perfume',
    theme: ['Морозные', 'Frost', 'Frost', 'Escarcha'],
    flavor: [
      'Хрустящая свежесть с первого вдоха.',
      'Crunchy freshness from the very first breath.',
      'Knusprige Frische ab dem ersten Atemzug.',
      'Frescura crujiente desde el primer aliento.',
    ],
    trail: ['#79c9c4', '#c2ece8'],
    variants: [
      { suffix: 'air', adj: ['Воздушный', 'Air', 'Luft', 'Aire'], rarity: 'common' },
      { suffix: 'pine', adj: ['Хвойный', 'Pine', 'Kiefer', 'Pino'], rarity: 'rare' },
      { suffix: 'crystal', adj: ['Кристальный', 'Crystal', 'Kristall', 'Cristal'], rarity: 'epic' },
      { suffix: 'blizzard', adj: ['Вьюжный', 'Blizzard', 'Schneesturm', 'Nevada'], rarity: 'legendary' },
      { suffix: 'leopard', adj: ['Леопардовый', 'Leopard', 'Leopard', 'Leopardo'], rarity: 'leopard' },
    ],
  },
]

/* ════════════════ Сборка ════════════════ */

const KIND_PREFIX: Record<ItemKind, string> = {
  collar: 'col',
  bracelet: 'bra',
  crown: 'crown',
  ring: 'ring',
  jar: 'jar',
  magic: 'magic',
  wrist: 'wrist',
  pads: 'pad',
  perfume: 'perf',
}

export const lootItemId = (kind: ItemKind, familyId: string, suffix: string): string =>
  `${KIND_PREFIX[kind]}-${familyId}-${suffix}`

/** 241 новый предмет — слияние с INV_DEFS в inventory.ts */
export const LOOT_EXTRA_DEFS: ReadonlyArray<InvDef> = LOOT_FAMILIES.flatMap((f) => {
  const fxFor = (i: number): InvFx | undefined => {
    if (f.fx) return f.fx[Math.min(i, f.fx.length - 1)]
    return KIND_FX[f.kind]?.(i)
  }
  return f.variants.map((vr, i) => {
    const isBase = f.kind === 'collar' || f.kind === 'bracelet' || f.kind === 'crown'
    return {
      id: lootItemId(f.kind, f.id, vr.suffix),
      kind: f.kind,
      rarity: vr.rarity,
      icon: `/inventory/${lootItemId(f.kind, f.id, vr.suffix)}.png`,
      sell: vr.sell ?? R_SELL[vr.rarity],
      bonus: vr.bonus ?? (isBase ? R_BONUS[vr.rarity] : 0),
      weight: R_WEIGHT[vr.rarity],
      fx: vr.fx ?? (isBase ? undefined : fxFor(i)),
    }
  })
})

/** Лестницы обмена 3→1 для новых предметов: в пределах семьи */
export const LOOT_EXTRA_NEXT: Record<string, string | null> = (() => {
  const map: Record<string, string | null> = {}
  for (const f of LOOT_FAMILIES) {
    const ids = f.variants.map((vr) => lootItemId(f.kind, f.id, vr.suffix))
    ids.forEach((id, i) => {
      map[id] = i + 1 < ids.length ? ids[i + 1] : null
    })
  }
  return map
})()

/** Цвета шлейфа для новых духов (слияние с PERFUME_TRAIL в inventory.ts) */
export const LOOT_TRAILS: Record<string, readonly [string, string]> = (() => {
  const map: Record<string, readonly [string, string]> = {}
  for (const f of LOOT_FAMILIES) {
    if (f.kind !== 'perfume' || !f.trail) continue
    for (const vr of f.variants) {
      map[lootItemId(f.kind, f.id, vr.suffix)] = f.trail
    }
  }
  return map
})()

/* ════════════════ КОМПЛЕКТЫ (0.0.83) ════════════════ */

export const SET_DEFS: ReadonlyArray<LootSet> = [
  {
    id: 'popcorn',
    name: ['Золотая жарка', 'Golden Pop', 'Goldene Röstung', 'Tueste Dorado'],
    bonus: [
      'Монетки ×1.12 — навсегда',
      'Coins ×1.12 — forever',
      'Münzen ×1.12 — für immer',
      'Monedas ×1.12 — para siempre',
    ],
    desc: [
      'Хрустящий золотой стандарт: собери весь попкорн-набор.',
      'The crunchy gold standard: collect the whole popcorn set.',
      'Der knusprige Goldstandard: sammle das ganze Popcorn-Set.',
      'El estándar dorado: reúne todo el set de palomitas.',
    ],
    items: [
      'magic-popcorn-kernel',
      'magic-popcorn-caramel',
      'magic-popcorn-butter',
      'magic-popcorn-golden',
      'jar-soda-cola',
    ],
    fx: { coins: 1.12 },
  },
  {
    id: 'sea',
    name: ['Морская пена', 'Sea Foam', 'Meerschaum', 'Espuma del Mar'],
    bonus: [
      'Опыт ×1.12 — навсегда',
      'XP ×1.12 — forever',
      'EP ×1.12 — für immer',
      'EXP ×1.12 — para siempre',
    ],
    desc: [
      'Пять сокровищ с глубины — и море работает на тебя.',
      'Five treasures from the deep — the sea works for you.',
      'Fünf Schätze der Tiefe — das Meer arbeitet für dich.',
      'Cinco tesoros de las profundidades: el mar trabaja para ti.',
    ],
    items: [
      'col-sea-shell-pearl',
      'bra-coral-branch',
      'ring-pearl-seed',
      'magic-beach-wave',
      'jar-ocean-tide',
    ],
    fx: { xp: 1.12 },
  },
  {
    id: 'space',
    name: ['Космический экипаж', 'Space Crew', 'Weltraum-Crew', 'Tripulación Espacial'],
    bonus: [
      'Алмазы ×1.15 — навсегда',
      'Diamonds ×1.15 — forever',
      'Diamanten ×1.15 — für immer',
      'Diamantes ×1.15 — para siempre',
    ],
    desc: [
      'Экипаж укомплектован — алмазные тропы открыты.',
      'Crew assembled — the diamond routes are open.',
      'Crew komplett — die Diamanten-Routen sind offen.',
      'Tripulación lista: las rutas de diamantes están abiertas.',
    ],
    items: [
      'col-space-comet-tail',
      'bra-star-bead',
      'crown-star-dust',
      'ring-meteor-chip',
      'wrist-nano-titan',
    ],
    fx: { gems: 1.15 },
  },
  {
    id: 'winter',
    name: ['Зимний свитер', 'Winter Sweater', 'Winterpullover', 'Suéter de Invierno'],
    bonus: [
      'Удача ×1.12 — навсегда',
      'Luck ×1.12 — forever',
      'Glück ×1.12 — für immer',
      'Suerte ×1.12 — para siempre',
    ],
    desc: [
      'Тёплый набор для холодных забегов.',
      'A cozy set for cold runs.',
      'Ein kuscheliges Set für kalte Läufe.',
      'Un set acogedor para carreras frías.',
    ],
    items: [
      'col-winter-scarf-knit',
      'crown-ice-frost',
      'jar-cocoa-milk',
      'perf-frost-pine',
      'pad-velvet-royal',
    ],
    fx: { luck: 1.12 },
  },
  {
    id: 'night',
    name: ['Ночной дозор', 'Night Watch', 'Nachtwache', 'Guardia Nocturna'],
    bonus: [
      '+1 сердечко к каждому забегу',
      '+1 heart to every run',
      '+1 Herz für jeden Lauf',
      '+1 corazón en cada carrera',
    ],
    desc: [
      'Когда саше спит, дозор не спит.',
      'While the pouch sleeps, the watch stays awake.',
      'Wenn das Säckchen schläft, bleibt die Wache wach.',
      'Mientras la bolsa duerme, la guardia vela.',
    ],
    items: [
      'magic-firefly-spark',
      'magic-firefly-lantern',
      'jar-brew-herb',
      'jar-brew-moon',
      'pad-velvet-midnight',
    ],
    fx: { heartsPlus: 1 },
  },
  {
    id: 'leopard',
    name: ['Леопардовый клан', 'Leopard Clan', 'Leoparden-Clan', 'Clan del Leopardo'],
    bonus: [
      'Золотые зёрна ×1.5, Лихорадка +2 сек',
      'Golden kernels ×1.5, Fever +2 s',
      'Goldkörner ×1.5, Fieber +2 s',
      'Granos dorados ×1.5, Fiebre +2 s',
    ],
    desc: [
      'Пять пятнистых вершин для самых упорных охотников.',
      'Five spotted summits for the most stubborn hunters.',
      'Fünf gefleckte Gipfel für die hartnäckigsten Jäger.',
      'Cinco cimas moteadas para los cazadores más tercos.',
    ],
    items: [
      'col-bell-leopard',
      'bra-fruit-leopard',
      'crown-berry-leopard',
      'ring-gem-leopard',
      'jar-soda-leopard',
    ],
    fx: { goldenUp: 1.5, feverPlus: 2 },
  },
]
