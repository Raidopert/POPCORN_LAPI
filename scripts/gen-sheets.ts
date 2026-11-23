/**
 * Генератор спрайт-листов иконок лута 0.0.83.
 * Каждый лист — сетка 5×5 (ряд = одна семья предметов из loot-catalog).
 * Листы сохраняются в /tmp/paws-sheets/, манифест ячеек — рядом (manifest.json).
 * Запуск: bun scripts/gen-sheets.ts
 */

import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'
import { LOOT_FAMILIES, lootItemId, type LootFamily } from '../src/lib/game/loot-catalog'

/* ── Визуальные описания предметов семьи (порядок = порядок вариантов) ── */
const ROWS: Record<string, string[]> = {
  ribbon: ['simple red ribbon pet collar', 'mint-green ribbon pet collar', 'royal purple ribbon pet collar with tiny gold crown charm', 'golden brocade ribbon pet collar with ornate pattern', 'luxury leopard-spotted ribbon pet collar with gold buckle'],
  bell: ['clay bell for pet collar', 'brass bell for pet collar', 'crystal bell for pet collar', 'star-shaped golden bell for pet collar', 'luxury leopard-spotted bell with gold collar strap'],
  band: ['polka-dot pet bandana', 'checkered plaid pet bandana', 'flame-pattern pet bandana', 'fiery phoenix-pattern pet bandana', 'luxury leopard-spotted pet bandana with gold trim'],
  sea: ['pink seashell pet collar', 'pearl necklace style pet collar', 'coral branch pet collar', 'deep abyss pearl pet collar with dark shell', 'luxury leopard-spotted pet collar with golden shells'],
  winter: ['knitted scarf collar for pet', 'wool scarf collar for pet', 'frosty ice scarf collar with snowflakes', 'blizzard scarf collar with swirling snow', 'luxury leopard-spotted scarf collar for pet'],
  space: ['comet-tail pet collar with sparkles', 'nebula mist pet collar with galaxy fog', 'orbital astronaut pet collar with little helmet charm', 'galactic core pet collar with spiral galaxy', 'luxury leopard-spotted space pet collar'],
  woven: ['grass-woven friendship bracelet', 'colorful thread friendship bracelet', 'silk bracelet', 'golden woven bracelet', 'luxury leopard-spotted woven bracelet'],
  fruit: ['apple bead bracelet', 'cherry bead bracelet', 'mango bead bracelet', 'dragonfruit bead bracelet', 'luxury leopard-spotted fruit bead bracelet'],
  sport: ['step-counter sports bracelet', 'pulse heart-rate sports band', 'record-breaking champion wristband', 'trophy sports wristband', 'luxury leopard-spotted sports wristband'],
  pirate: ['rope pirate bracelet', 'hook charm pirate bracelet', 'gold doubloon pirate bracelet', 'pirate flagship bracelet with skull flag', 'luxury leopard-spotted pirate bracelet'],
  coral: ['coral branch bracelet', 'rose-coral bracelet', 'reef coral bracelet with tiny fish', 'deep-sea coral bracelet', 'luxury leopard-spotted coral bracelet'],
  star: null as unknown as string[], // две семьи с id star (bra/crown) — описания ниже
  flower: ['daisy flower wreath crown', 'clover flower wreath crown', 'rose flower wreath crown', 'lotus flower wreath crown', 'luxury leopard-spotted flower wreath crown'],
  berry: ['strawberry berry wreath crown', 'lingonberry berry wreath crown', 'blackcurrant berry wreath crown', 'royal jam jar berry wreath crown', 'luxury leopard-spotted berry wreath crown'],
  ice: ['snowy ice crown', 'frosty ice crown with icicles', 'crystal ice crown', 'glacier ice crown', 'luxury leopard-spotted ice crown'],
  autumn: ['autumn leaf wreath crown', 'oak leaf wreath crown with acorns', 'amber leaf crown', 'harvest wheat and pumpkin crown', 'luxury leopard-spotted autumn crown'],
  gem: ['quartz gemstone ring', 'topaz gemstone ring', 'garnet gemstone ring', 'amethyst gemstone ring', 'luxury leopard-spotted gemstone ring'],
  candy: ['marmalade candy ring', 'lollipop candy ring', 'caramel candy ring', 'toffee candy ring', 'luxury leopard-spotted candy ring'],
  pearl: ['pearl ring', 'rose pearl ring', 'black pearl ring', 'abyssal dark pearl ring', 'luxury leopard-spotted pearl ring'],
  meteor: ['meteor chip ring', 'iron meteorite ring', 'meteor core ring', 'quasar meteor ring', 'luxury leopard-spotted meteorite ring'],
  clock: ['second-hand clockwork ring', 'bronze clockwork ring', 'gear clockwork ring', 'eternal glowing clockwork ring', 'luxury leopard-spotted clockwork ring'],
  soda: ['lemonade soda can', 'berry soda can', 'cola can', 'thunder energy soda can with lightning', 'luxury leopard-spotted soda can'],
  jam: ['apple jam jar', 'raspberry jam jar', 'royal jam jar with crown label', 'amber jam jar', 'luxury leopard-spotted jam jar'],
  brew: ['herbal potion bottle', 'moon potion bottle', 'shadow potion bottle', 'ghost potion bottle', 'luxury leopard-spotted potion bottle'],
  cocoa: ['milk cocoa jar', 'spiced cocoa jar with cinnamon', 'espresso cocoa jar', 'velvet cocoa jar', 'luxury leopard-spotted cocoa jar'],
  juice: ['fresh juice cup', 'orange juice cup', 'pomegranate juice cup', 'golden nectar juice cup', 'luxury leopard-spotted juice cup'],
  ocean: ['salty ocean jar with sand', 'tide wave jar', 'pearl ocean jar', 'deep-sea ocean jar', 'luxury leopard-spotted ocean jar'],
  critter: ['little mouse charm', 'little hedgehog charm', 'little owl charm', 'little fox charm', 'luxury leopard-spotted animal charm'],
  sweet: ['cookie charm', 'marshmallow charm', 'donut charm', 'fancy cake charm', 'luxury leopard-spotted cake charm'],
  sky: ['cloud charm', 'rainbow charm', 'sun charm', 'aurora borealis charm', 'luxury leopard-spotted sky charm'],
  popcorn: ['popcorn kernel charm', 'caramel popcorn charm', 'buttered popcorn charm', 'golden popcorn box charm', 'luxury leopard-spotted popcorn charm'],
  firefly: ['spark firefly charm', 'lantern firefly charm', 'ghost firefly charm', 'eclipse firefly charm', 'luxury leopard-spotted firefly charm'],
  beach: ['whispering seashell charm', 'wave charm', 'starfish charm', 'tide wave charm with sand', 'luxury leopard-spotted seashell charm'],
  capt: ['cadet sports sweatband wristband', 'captain flag sports sweatband', 'storm captain sports sweatband', 'admiral gold sports sweatband', 'luxury leopard-spotted captain sweatband'],
  glow: ['soft glow wristband', 'neon glow wristband', 'laser glow wristband', 'sunrise glow wristband', 'luxury leopard-spotted glow wristband'],
  nano: ['carbon nano wristband', 'titanium nano wristband', 'quantum nano wristband', 'singularity nano wristband', 'luxury leopard-spotted nano wristband'],
  retro: ['wool retro wristband', 'striped retro wristband', 'vinyl retro wristband', 'arcade retro wristband', 'luxury leopard-spotted retro wristband'],
  felt: ['soft felt cushion pad for cat paw', 'dense felt cushion pad for cat paw', 'ember felt cushion pad for cat paw', 'meteor felt cushion pad for cat paw', 'luxury leopard-spotted felt cushion pad for cat paw'],
  rubber: ['matte rubber cushion pad for cat paw', 'grippy rubber cushion pad for cat paw', 'thunder rubber cushion pad for cat paw', 'typhoon rubber cushion pad for cat paw', 'luxury leopard-spotted rubber cushion pad for cat paw'],
  magnet: ['fridge magnet cushion pad for cat paw', 'magnetic field cushion pad for cat paw', 'magnetic storm cushion pad for cat paw', 'polarity magnet cushion pad for cat paw', 'luxury leopard-spotted magnet cushion pad for cat paw'],
  velvet: ['plush velvet cushion pad for cat paw', 'royal velvet cushion pad for cat paw', 'midnight velvet cushion pad for cat paw', 'crowned velvet cushion pad for cat paw', 'luxury leopard-spotted velvet cushion pad for cat paw'],
  forest: ['rain forest perfume bottle', 'moss perfume bottle', 'cedar perfume bottle', 'mystic fog perfume bottle', 'luxury leopard-spotted perfume bottle'],
  gour: ['cocoa perfume bottle', 'mocha perfume bottle', 'praline perfume bottle', 'truffle perfume bottle', 'luxury leopard-spotted perfume bottle'],
  bloom: ['lilac perfume bottle', 'peony perfume bottle', 'jasmine perfume bottle', 'gardenia perfume bottle', 'luxury leopard-spotted perfume bottle'],
  fiesta: ['confetti perfume bottle', 'streamer perfume bottle', 'firework perfume bottle', 'carnival perfume bottle', 'luxury leopard-spotted perfume bottle'],
  ozone: ['surf perfume bottle', 'sea breeze perfume bottle', 'deep ocean perfume bottle', 'storm perfume bottle', 'luxury leopard-spotted perfume bottle'],
  frost: ['air frost perfume bottle', 'pine frost perfume bottle', 'crystal frost perfume bottle', 'blizzard frost perfume bottle', 'luxury leopard-spotted perfume bottle'],
}

/* Особые семьи с одинаковым id у разных видов: star-браслеты и star-венцы */
const STAR_BRA = ['star bead bracelet', 'orbital ring bead bracelet', 'twinkling star bracelet', 'supernova star bracelet with burst', 'luxury leopard-spotted star bracelet']
const STAR_CROWN = ['stardust star crown', 'comet star crown', 'constellation star crown', 'galaxy star crown', 'luxury leopard-spotted star crown']

function rowDescs(f: LootFamily): string[] {
  if (f.kind === 'bracelet' && f.id === 'star') return STAR_BRA
  if (f.kind === 'crown' && f.id === 'star') return STAR_CROWN
  const row = ROWS[f.id]
  /* Семья clock — 6 вариантов: шестой (золотая вершина) идёт одиночной
     иконкой, на листе только первые 5 клеток */
  const need = Math.min(f.variants.length, 5)
  if (!row || row.length < need) {
    throw new Error(`No ROWS for family ${f.kind}/${f.id} (need ${need})`)
  }
  return row
}

/** Порядок семей по листам (по видам — визуально однородные листы) */
const SHEET_PLAN: LootFamily[][] = (() => {
  const byKind = (k: string): LootFamily[] => LOOT_FAMILIES.filter((f) => f.kind === k)
  const collars = byKind('collar')
  const bras = byKind('bracelet')
  const crowns = byKind('crown')
  const rings = byKind('ring')
  const jars = byKind('jar')
  const magics = byKind('magic')
  const wrists = byKind('wrist')
  const pads = byKind('pads')
  const perfs = byKind('perfume')
  return [
    [collars[0], collars[1], collars[2], collars[3], collars[4]],
    [collars[5], bras[0], bras[1], bras[2], bras[3]],
    [bras[4], bras[5], crowns[0], crowns[1], crowns[2]],
    [crowns[3], crowns[4], rings[0], rings[1], rings[2]],
    [rings[3], rings[4], jars[0], jars[1], jars[2]],
    [jars[3], jars[4], jars[5], magics[0], magics[1]],
    [magics[2], magics[3], magics[4], magics[5], wrists[0]],
    [wrists[1], wrists[2], wrists[3], pads[0], pads[1]],
    [pads[2], pads[3], perfs[0], perfs[1], perfs[2]],
    [perfs[3], perfs[4], perfs[5]],
  ]
})()

const OUT_DIR = '/tmp/paws-sheets'
const STYLE =
  'Flat 2D cartoon mobile game asset style, warm cream beige background, thick dark brown outlines, soft warm pastel colors, cute cozy look. Each icon centered in its own grid cell, small gaps between cells, icons never touch cell borders. No text, no letters, no captions, no labels, no numbers, no grid lines, no watermarks of any kind.'

interface Cell {
  id: string
  sheet: string
  row: number
  col: number
}

async function genSheet(zai: Awaited<ReturnType<typeof ZAI.create>>, name: string, families: LootFamily[], manifest: Cell[]): Promise<boolean> {
  const lines: string[] = []
  families.forEach((f, r) => {
    const descs = rowDescs(f)
    const items = f.variants
      .slice(0, 5)
      .map((vr, i) => `${i + 1}) ${descs[i]}`)
      .join(', ')
    lines.push(`Row ${r + 1} (single item type, ${Math.min(f.variants.length, 5)} variants from cheap to luxurious): ${items}`)
    f.variants.slice(0, 5).forEach((vr, c) => {
      manifest.push({ id: lootItemId(f.kind, f.id, vr.suffix), sheet: name, row: r, col: c })
    })
  })
  const rows = families.length
  const prompt = `Sheet of game item icons arranged in a perfect grid with EXACTLY ${rows} rows and EXACTLY 5 columns (one icon per cell, ALL ${rows} rows fully filled, never skip a row, never merge rows). ${STYLE}.\n${lines.join('\n')}`
  const out = path.join(OUT_DIR, `${name}.png`)
  if (fs.existsSync(out) && fs.statSync(out).size > 10000) {
    console.log(`SKIP ${name} (already exists)`)
    return true
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await zai.images.generations.create({ prompt, size: '1024x1024' })
      const b64 = res.data?.[0]?.base64
      if (!b64) throw new Error('empty base64')
      fs.writeFileSync(out, Buffer.from(b64, 'base64'))
      console.log(`OK ${name} (${families.length} rows, ${manifest.length} cells so far)`)
      return true
    } catch (e) {
      console.error(`FAIL ${name} attempt ${attempt}: ${e instanceof Error ? e.message : String(e)}`)
      await new Promise((r) => setTimeout(r, 2500 * attempt))
    }
  }
  return false
}

async function genSingle(zai: Awaited<ReturnType<typeof ZAI.create>>, id: string, desc: string): Promise<boolean> {
  const prompt = `Single game item icon centered on plain background: ${desc}. ${STYLE}`
  const out = path.join(OUT_DIR, `${id}.png`)
  if (fs.existsSync(out) && fs.statSync(out).size > 10000) {
    console.log(`SKIP single ${id}`)
    return true
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await zai.images.generations.create({ prompt, size: '1024x1024' })
      const b64 = res.data?.[0]?.base64
      if (!b64) throw new Error('empty base64')
      fs.writeFileSync(out, Buffer.from(b64, 'base64'))
      console.log(`OK single ${id}`)
      return true
    } catch (e) {
      console.error(`FAIL single ${id} attempt ${attempt}: ${e instanceof Error ? e.message : String(e)}`)
      await new Promise((r) => setTimeout(r, 2500 * attempt))
    }
  }
  return false
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const zai = await ZAI.create()
  const manifest: Cell[] = []
  let failed = 0
  for (let i = 0; i < SHEET_PLAN.length; i++) {
    const ok = await genSheet(zai, `sheet-${String(i + 1).padStart(2, '0')}`, SHEET_PLAN[i], manifest)
    if (!ok) failed++
  }
  /* Золотая вершина часовых колец — одиночная иконка */
  const goldOk = await genSingle(
    zai,
    'ring-clock-leopard-gold',
    'luxurious golden clockwork ring with leopard spots and a golden paw emblem, apex treasure item',
  )
  if (!goldOk) failed++
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify({ cells: manifest, single: 'ring-clock-leopard-gold' }, null, 2))
  console.log(`DONE. sheets=${SHEET_PLAN.length} failed=${failed} cells=${manifest.length}+1`)
  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
