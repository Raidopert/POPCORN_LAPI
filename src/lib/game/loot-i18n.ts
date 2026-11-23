/**
 * i18n ЛУТА 0.0.83 «БОЛЬШОЙ СКЛАД» — программная генерация item.* ключей
 * для 241 нового предмета (имя / бонус / описание) и ключей UI комплектов.
 *
 * Имена собираются композитно: `${существительное} «${титул}»` — титул
 * в кавычках не склоняется, поэтому одна форма работает во всех 4 языках.
 * Бонусы генерируются из fx-каналов (одинаковая формула для всех предметов).
 * Описания — флейвор семьи из loot-catalog.
 *
 * Словарь сливается с основным T в tFor() (i18n.ts): сначала основной,
 * потом этот — старые рукописные ключи всегда приоритетнее.
 */

import { LOOT_EXTRA_DEFS, LOOT_FAMILIES, SET_DEFS, lootItemId, type L4, type LootFamily, type LootVariant } from './loot-catalog'
import type { InvFx, ItemKind } from './inventory'

export type LootRow = readonly [string, string, string, string]

/* ════════════════ Существительные по видам ════════════════ */

const KIND_NOUN: Record<ItemKind, L4> = {
  collar: ['Ошейник', 'Collar', 'Halsband', 'Collar'],
  bracelet: ['Браслет', 'Bracelet', 'Armband', 'Pulsera'],
  crown: ['Венец', 'Crown', 'Krone', 'Corona'],
  ring: ['Кольцо', 'Ring', 'Ring', 'Anillo'],
  jar: ['Баночка', 'Jar', 'Glas', 'Frasco'],
  magic: ['Талисман', 'Charm', 'Talisman', 'Amuleto'],
  wrist: ['Напульсник', 'Wristband', 'Schweißband', 'Muñequera'],
  pads: ['Накладки', 'Pads', 'Polster', 'Almohadillas'],
  perfume: ['Духи', 'Perfume', 'Parfüm', 'Perfume'],
}

const QUOTES: ReadonlyArray<[string, string]> = [
  ['«', '»'], // ru
  ['"', '"'], // en
  ['„', '“'], // de
  ['"', '"'], // es
]

/** Имя предмета: Ошейник «Алый» / Collar "Scarlet" / Halsband „Scharlach“ */
function lootName(kind: ItemKind, adj: L4): L4 {
  const noun = KIND_NOUN[kind]
  return [0, 1, 2, 3].map((i) => `${noun[i]} ${QUOTES[i][0]}${adj[i]}${QUOTES[i][1]}`) as unknown as L4
}

/* ════════════════ Генератор текста бонуса из fx ════════════════ */

const pct = (mult: number): number => Math.round((mult - 1) * 100)

const FX_TEXT: Partial<Record<keyof InvFx, (v: number) => L4>> = {
  coins: (v) => [`+${pct(v)}% к монеткам`, `+${pct(v)}% coins`, `+${pct(v)}% Münzen`, `+${pct(v)}% monedas`],
  xp: (v) => [`+${pct(v)}% к опыту`, `+${pct(v)}% XP`, `+${pct(v)}% EP`, `+${pct(v)}% EXP`],
  gems: (v) => [`+${pct(v)}% к алмазам`, `+${pct(v)}% diamonds`, `+${pct(v)}% Diamanten`, `+${pct(v)}% diamantes`],
  luck: (v) => [
    `удача ×${v.toFixed(2).replace(/0$/, '')}: редкий лут чаще`,
    `luck ×${v.toFixed(2).replace(/0$/, '')}: rarer loot`,
    `Glück ×${v.toFixed(2).replace(/0$/, '')}: seltenere Beute`,
    `suerte ×${v.toFixed(2).replace(/0$/, '')}: botín más raro`,
  ],
  pigeonSlow: (v) => [
    `голуби-воришки −${Math.round(v * 100)}% скорости`,
    `thief pigeons −${Math.round(v * 100)}% slower`,
    `Taubendiebe −${Math.round(v * 100)}% langsamer`,
    `palomas ladronas −${Math.round(v * 100)}% más lentas`,
  ],
  theftDown: (v) => [
    `воры крадут на ${Math.round(v * 100)}% меньше`,
    `thieves steal ${Math.round(v * 100)}% less`,
    `Diebe stehlen ${Math.round(v * 100)}% weniger`,
    `ladrones roban ${Math.round(v * 100)}% menos`,
  ],
  feverPlus: (v) => [`Лихорадка +${v} сек`, `Fever +${v} s`, `Fieber +${v} s`, `Fiebre +${v} s`],
  goldenUp: (v) => [
    `золотые зёрна ×${v} чаще`,
    `golden kernels ×${v} more often`,
    `Goldkörner ×${v} öfter`,
    `granos dorados ×${v} más a menudo`,
  ],
  heartsPlus: (v) => [`+${v} ❤ к максимуму забега`, `+${v} ❤ to run max`, `+${v} ❤ zum Lauf-Maximum`, `+${v} ❤ al máximo de la carrera`],
  pawSpeed: (v) => [
    `скорость лапки +${Math.round(v * 100)}%`,
    `paw speed +${Math.round(v * 100)}%`,
    `Pfotentempo +${Math.round(v * 100)}%`,
    `velocidad de pata +${Math.round(v * 100)}%`,
  ],
  mineBrake: (v) => [
    `торможение у мин −${Math.round(v * 100)}%`,
    `braking near mines −${Math.round(v * 100)}%`,
    `Bremsen an Minen −${Math.round(v * 100)}%`,
    `frenado en minas −${Math.round(v * 100)}%`,
  ],
  dropRange: (v) => [
    `радиус сдачи +${Math.round((v - 1) * 100)}%`,
    `drop-in radius +${Math.round((v - 1) * 100)}%`,
    `Abgaberadius +${Math.round((v - 1) * 100)}%`,
    `radio de entrega +${Math.round((v - 1) * 100)}%`,
  ],
  comboPlus: (v) => [`потолок комбо +${v}`, `combo ceiling +${v}`, `Combo-Limit +${v}`, `límite de combo +${v}`],
}

/** Текст бонуса волшебного предмета: каналы fx через запятую */
export function fxBonusText(fx: InvFx): L4 {
  const parts: Array<L4> = []
  const order: Array<keyof InvFx> = [
    'coins', 'xp', 'gems', 'luck', 'pigeonSlow', 'theftDown', 'feverPlus',
    'goldenUp', 'heartsPlus', 'pawSpeed', 'mineBrake', 'dropRange', 'comboPlus',
  ]
  for (const key of order) {
    const v = fx[key]
    if (typeof v === 'number' && v !== 0 && FX_TEXT[key]) parts.push(FX_TEXT[key]!(v))
  }
  return [0, 1, 2, 3].map((i) => parts.map((p) => p[i]).join(', ')) as unknown as L4
}

/** Бонус базовых видов (ошейник/браслет/венец) — по полю bonus */
function baseBonusText(kind: ItemKind, bonus: number): L4 {
  const n = Math.round(bonus * 100)
  switch (kind) {
    case 'collar':
      return [
        `+${n}% к монеткам: сундучки, попкорнины и золото`,
        `+${n}% coins: chests, big popcorn and gold`,
        `+${n}% Münzen: Truhen, großes Popcorn und Gold`,
        `+${n}% monedas: cofres, palomitas grandes y oro`,
      ]
    case 'bracelet':
      return [
        `+${n}% к опыту: сундучки и награда за этап`,
        `+${n}% XP: chests and stage reward`,
        `+${n}% EP: Truhen und Etappen-Belohnung`,
        `+${n}% EXP: cofres y recompensa de etapa`,
      ]
    case 'crown':
      return [
        `+${n}% к алмазам путешествий NANA`,
        `+${n}% NANA travel diamonds`,
        `+${n}% NANA-Reisediamanten`,
        `+${n}% diamantes de viajes de NANA`,
      ]
    default:
      return ['', '', '', '']
  }
}

/* ════════════════ Сборка словаря ════════════════ */

const table: Record<string, LootRow> = {}

/* Семьи по id предмета — для adj и флейвора */
const familyByItem = new Map<string, { fam: LootFamily; vr: LootVariant }>()
for (const f of LOOT_FAMILIES) {
  for (const vr of f.variants) {
    familyByItem.set(lootItemId(f.kind, f.id, vr.suffix), { fam: f, vr })
  }
}

for (const def of LOOT_EXTRA_DEFS) {
  const hit = familyByItem.get(def.id)
  if (!hit) continue
  const isBase = def.kind === 'collar' || def.kind === 'bracelet' || def.kind === 'crown'
  table[`item.${def.id}.name`] = lootName(def.kind, hit.vr.adj)
  /* бонус берём из РЕЗОЛВНУТОГО def (fx уже применены из семьи/вида) */
  table[`item.${def.id}.bonus`] = isBase ? baseBonusText(def.kind, def.bonus) : fxBonusText(def.fx ?? {})
  table[`item.${def.id}.desc`] = hit.fam.flavor
}

/* Ключи комплектов: имя / бонус / описание */
for (const s of SET_DEFS) {
  table[`set.${s.id}.name`] = s.name
  table[`set.${s.id}.bonus`] = s.bonus
  table[`set.${s.id}.desc`] = s.desc
}

/* Ключи UI комплектов */
table['inv.sets'] = ['КОМПЛЕКТЫ', 'SETS', 'SETS', 'CONJUNTOS']
table['inv.setsHint'] = [
  'Собери весь комплект — эпический бонус останется навсегда',
  'Collect a full set — its epic bonus stays forever',
  'Sammle ein ganzes Set — der epische Bonus bleibt für immer',
  'Reúne un set completo: su épico bonus queda para siempre',
]
table['inv.setProgress'] = [
  '{{n}}/{{m}} собрано',
  '{{n}}/{{m}} collected',
  '{{n}}/{{m}} gesammelt',
  '{{n}}/{{m}} reunidas',
]
table['inv.setDoneBadge'] = ['СОБРАН ✓', 'COMPLETE ✓', 'VOLLSTÄNDIG ✓', 'COMPLETO ✓']
table['toast.setDone'] = [
  '🏆 Комплект «{{name}}» собран! {{bonus}}',
  '🏆 Set "{{name}}" complete! {{bonus}}',
  '🏆 Set „{{name}}“ komplett! {{bonus}}',
  '🏆 ¡Set "{{name}}" completo! {{bonus}}',
]

/** Словарь лута 0.0.83 — сливается в tFor() после основного T */
export const LOOT_I18N: Record<string, LootRow> = table
