/**
 * Магазин лапок «Кошачьего попкорнного Беспредела».
 * Очки попкорна — это опыт игрока: за опыт покупаются лапки,
 * чьи улучшения действуют ПОСТОЯННО (в каждом забеге, каждый уровень).
 * От простой рыжей до самой дорогой леопардовой.
 */

import type { PawPalette } from './sprites'

export type PawId =
  | 'classic'
  | 'ember'
  | 'snow'
  | 'flame'
  | 'lime'
  | 'teal'
  | 'thimble'
  | 'berry'
  | 'strawberry'
  | 'rainbow'
  | 'neon'
  | 'leopard'
  | 'goldenpaw'
  | 'double'
  | 'ghost'
  | 'magic'

/** Постоянные улучшения лапки */
export interface PawBonus {
  /** Множитель радиуса подбора зёрен (1 = как было) */
  grabR?: number
  /** Множитель скорости следования лапки за пальцем */
  speed?: number
  /** + секунды к каждому уровню */
  timePlus?: number
  /** + шанс золотого зерна (0.04 = +4%) */
  goldenAdd?: number
  /** Мины-кукурузины: на столько меньше в каждой волне */
  cornCut?: number
  /** +1 зерно к вместимости лапки */
  carryPlus?: number
  /** Шанс 0..1, что мина не отнимет очко («коготки-обереги») */
  guard?: number
  /** Волшебный шлейф звёздочек за лапкой */
  stars?: boolean
}

export interface PawDef {
  id: PawId
  name: string
  desc: string
  /** Короткая подпись бонуса для карточки магазина */
  bonusLabel: string
  /** Цена (валюта — currency; 0 — базовая, доступна сразу) */
  price: number
  /** Валюта покупки: 'xp' — опыт 🍿 (по умолчанию), 'coins' — монетки 🪙 */
  currency?: 'xp' | 'coins'
  palette: Partial<PawPalette>
  bonus: PawBonus
}

export const PAWS: PawDef[] = [
  /* ---------- простые (первые 3) ---------- */
  {
    id: 'classic',
    name: 'Рыжая классика',
    desc: 'Родная тёплая лапка куницы. Проверена попкорном!',
    bonusLabel: 'Без бонуса — чистое мастерство',
    price: 0,
    palette: {},
    bonus: {},
  },
  {
    id: 'ember',
    name: 'Уголёк',
    desc: 'Чёрная как смоль, но зёрна чует чуть лучше всех.',
    bonusLabel: 'Радиус подбора +10%',
    price: 120,
    palette: {
      fur: '#3A3432',
      furShade: '#2B2624',
      pad: '#6E5A55',
      beans: '#C9BBB2',
      claw: '#18120F',
      edge: '#0D0B0A',
    },
    bonus: { grabR: 1.1 },
  },
  {
    id: 'snow',
    name: 'Снежка',
    desc: 'Белая пушистика с красными коготками-оберегами.',
    bonusLabel: '25% шанс: мина не отнимет очко',
    price: 250,
    palette: {
      fur: '#F8F2E9',
      furShade: '#E3D6C5',
      pad: '#F5B9AD',
      beans: '#FFEDE6',
      claw: '#E24B3B',
      edge: '#97785F',
    },
    bonus: { guard: 0.25 },
  },
  /* ---------- основные — уже яркие ---------- */
  {
    id: 'flame',
    name: 'Огонёк',
    desc: 'Горячая шёрстка подгоняет часы — времени чуть больше.',
    bonusLabel: '+5 секунд к каждому уровню',
    price: 420,
    palette: {
      fur: '#F4552F',
      furShade: '#D8381C',
      pad: '#FFB36B',
      beans: '#FFE0A8',
      claw: '#7A1D08',
      edge: '#8E2410',
    },
    bonus: { timePlus: 5 },
  },
  {
    id: 'lime',
    name: 'Лаймовая',
    desc: 'Яркая, как летний луг. Золото само липнет к шерсти.',
    bonusLabel: 'Золотых зёрен заметно больше',
    price: 650,
    palette: {
      fur: '#7BC447',
      furShade: '#5E9E33',
      pad: '#D9F0A8',
      beans: '#F4FFD6',
      claw: '#2F5D14',
      edge: '#3E7019',
    },
    bonus: { goldenAdd: 0.06 },
  },
  {
    id: 'teal',
    name: 'Бирюзовая',
    desc: 'Прохладный морской окрас. Кукуруза её побаивается.',
    bonusLabel: 'На одну мину меньше в каждой волне',
    price: 950,
    palette: {
      fur: '#2FB8A6',
      furShade: '#1F8F80',
      pad: '#A8EFE3',
      beans: '#E2FFF8',
      claw: '#0F5A50',
      edge: '#136459',
    },
    bonus: { cornCut: 1 },
  },
  {
    id: 'thimble',
    name: 'Напёрсток',
    desc: 'Портновская точность: лапка и юркая, и цепкая, как игла.',
    bonusLabel: 'Радиус +15% и лапка проворнее',
    price: 1100,
    palette: {
      fur: '#C9B37E',
      furShade: '#A98F58',
      pad: '#EFE0BC',
      beans: '#FBF3DC',
      claw: '#8A6A30',
      edge: '#6B5322',
    },
    bonus: { grabR: 1.15, speed: 1.1 },
  },
  {
    id: 'berry',
    name: 'Малиновая',
    desc: 'Сладкая и шустрая — ягодный заряд бодрости.',
    bonusLabel: 'Радиус +20% и лапка проворнее',
    price: 1300,
    palette: {
      fur: '#E23B7A',
      furShade: '#BC2459',
      pad: '#FFA8C8',
      beans: '#FFE2EE',
      claw: '#6E0F31',
      edge: '#7E1240',
    },
    bonus: { grabR: 1.2, speed: 1.2 },
  },
  {
    id: 'strawberry',
    name: 'Клубничная',
    desc: 'Спелая ягода в крапинку — мины на неё натыкаются и стесняются.',
    bonusLabel: '35% шанс: мина не отнимет очко',
    price: 1600,
    palette: {
      fur: '#F0526A',
      furShade: '#CC3550',
      pad: '#FFC3CE',
      beans: '#FFE8EC',
      claw: '#7C1228',
      edge: '#8E1A32',
      spots: '#FFE8EC',
    },
    bonus: { guard: 0.35, goldenAdd: 0.03 },
  },
  {
    id: 'rainbow',
    name: 'Радужная',
    desc: 'Все цвета радуги на трёх пальцах! Носит больше зерна.',
    bonusLabel: 'Вместимость +1 зерно',
    price: 1800,
    palette: {
      fur: '#F2B35A',
      furShade: '#D8923C',
      pad: '#FFB1C8',
      beans: '#FFF3D9',
      claw: '#6E3A12',
      edge: '#8A4A14',
      fingers: ['#E24B3B', '#7BC47F', '#4FA8BF'],
    },
    bonus: { carryPlus: 1 },
  },
  /* ---------- самая дорогая ---------- */
  {
    id: 'leopard',
    name: 'Леопардовая',
    desc: 'Королевский зверь: пятнистая роскошь и вся мощь сразу!',
    bonusLabel: '+5 сек · радиус +15% · мин −1 · больше золота',
    price: 2500,
    palette: {
      fur: '#E9C46A',
      furShade: '#D1A94E',
      pad: '#F6E3C0',
      beans: '#FFF7E0',
      claw: '#3A2A10',
      edge: '#6B4E1B',
      spots: '#3B2B12',
    },
    bonus: { grabR: 1.15, timePlus: 5, cornCut: 1, goldenAdd: 0.04 },
  },
  {
    id: 'neon',
    name: 'Неоновая',
    desc: 'Светится в темноте кинозала и мелькает быстрее всех!',
    bonusLabel: 'Скорость лапки +40%',
    price: 2100,
    palette: {
      fur: '#FF3DA6',
      furShade: '#D91E86',
      pad: '#4FFFF0',
      beans: '#E6FFFB',
      claw: '#7A0F52',
      edge: '#8E135E',
      fingers: ['#4FFFF0', '#FFE94A', '#8C5BFF'],
    },
    bonus: { speed: 1.4 },
  },
  {
    id: 'goldenpaw',
    name: 'Золотая лапка',
    desc: 'Легендарный артефакт: золото липнет к ней, как попкорн к маслу!',
    bonusLabel: 'Золота +10% и вместимость +1',
    price: 3200,
    palette: {
      fur: '#FFD24A',
      furShade: '#E0AE2C',
      pad: '#FFF0B8',
      beans: '#FFFBEB',
      claw: '#8A6410',
      edge: '#A37813',
      spots: '#FFF0B8',
    },
    bonus: { goldenAdd: 0.1, carryPlus: 1 },
  },
  /* ---------- артефакты за монетки 🪙 (выпадают из сундучков и лихорадки) ---------- */
  {
    id: 'double',
    name: 'Двойная лапка',
    desc: 'Двурукая лапка-чудо: гребёт шире и уносит больше зерна за раз!',
    bonusLabel: 'Вместимость +1 зерно · радиус +10%',
    price: 400,
    currency: 'coins',
    palette: {
      fur: '#9B6BB3',
      furShade: '#7E4F96',
      pad: '#E7C7F5',
      beans: '#F8ECFF',
      claw: '#4A2A5E',
      edge: '#5E3A72',
    },
    bonus: { carryPlus: 1, grabR: 1.1 },
  },
  {
    id: 'ghost',
    name: 'Призрачная шапка',
    desc: 'Полупрозрачная лапка в волшебном колпаке — мины проходят сквозь неё мимо!',
    bonusLabel: '50% шанс: мина не отнимет очко',
    price: 650,
    currency: 'coins',
    palette: {
      fur: '#DCE3F5',
      furShade: '#BCC8E8',
      pad: '#9FB4E8',
      beans: '#F2F6FF',
      claw: '#5A6BA8',
      edge: '#6C7BB0',
      hat: true,
    },
    bonus: { guard: 0.5 },
  },
  {
    id: 'magic',
    name: 'Волшебная лапка',
    desc: 'Из меха сыплются звёздочки шлейфом, а золото липнет к ней само!',
    bonusLabel: 'Шлейф звёзд · золота +6% · проворнее',
    price: 900,
    currency: 'coins',
    palette: {
      fur: '#4A5FBF',
      furShade: '#38499A',
      pad: '#FFD86B',
      beans: '#FFF3C4',
      claw: '#1E2A66',
      edge: '#2A3780',
    },
    bonus: { stars: true, goldenAdd: 0.06, speed: 1.15 },
  },
]

export const PAW_MAP: Record<PawId, PawDef> = Object.fromEntries(
  PAWS.map((p) => [p.id, p]),
) as Record<PawId, PawDef>

export const DEFAULT_PAW: PawId = 'classic'
