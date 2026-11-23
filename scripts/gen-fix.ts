/**
 * Докачка 0.0.83: замена проблемных sheet-06/sheet-09 на мелкие листы
 * (1–3 ряда — модель держит их надёжно), исправление манифеста.
 * Запуск ПОСЛЕ gen-sheets.ts: bun scripts/gen-fix.ts
 */

import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'
import { lootItemId } from '../src/lib/game/loot-catalog'

const SRC = '/tmp/paws-sheets'

const STYLE =
  'Flat 2D cartoon mobile game asset style, warm cream beige background, thick dark brown outlines, soft warm pastel colors, cute cozy look. Each icon centered in its own grid cell, small gaps between cells, icons never touch cell borders. No text, no letters, no captions, no labels, no numbers, no grid lines, no watermarks of any kind.'

interface Cell {
  id: string
  sheet: string
  row: number
  col: number
}

interface RowSpec {
  /** id предметов ряда (по колонкам слева направо) */
  ids: string[]
  /** Визуальное описание ряда */
  desc: string
}

interface FixSheet {
  name: string
  rows: RowSpec[]
}

const FIX_SHEETS: FixSheet[] = [
  {
    name: 'sheet-06b',
    rows: [
      {
        ids: [
          'magic-sweet-cookie', 'magic-sweet-marshmallow', 'magic-sweet-donut', 'magic-sweet-confection', 'magic-sweet-leopard',
        ],
        desc: 'Row 1 (dessert charms, 5 variants from cheap to luxurious): 1) cookie charm 2) marshmallow charm 3) donut charm 4) fancy layered cake charm 5) luxury leopard-spotted cake charm',
      },
    ],
  },
  {
    name: 'sheet-09a',
    rows: [
      {
        ids: [
          'pad-magnet-fridge', 'pad-magnet-field', 'pad-magnet-storm', 'pad-magnet-polarity', 'pad-magnet-leopard',
        ],
        desc: 'Row 1 (five rounded-square cushion pillows with magnet motifs, absolutely NO animals, NO cats): 1) grey cushion pillow with fridge magnet emblem 2) pink cushion pillow with swirl field emblem 3) beige cushion pillow with storm magnet emblem 4) purple cushion pillow with polarity emblem 5) luxury leopard-spotted cushion pillow with golden magnet emblem',
      },
      {
        ids: [
          'pad-velvet-plush', 'pad-velvet-royal', 'pad-velvet-midnight', 'pad-velvet-crowned', 'pad-velvet-leopard',
        ],
        desc: 'Row 2 (five rounded-square velvet cushion pillows, absolutely NO animals, NO cats, just pillows): 1) lilac plush velvet cushion pillow 2) pink royal velvet cushion pillow 3) deep purple midnight velvet cushion pillow 4) violet cushion pillow with tiny gold crown emblem 5) luxury leopard-spotted velvet cushion pillow',
      },
    ],
  },
  {
    name: 'sheet-09b',
    rows: [
      {
        ids: [
          'perf-forest-rain', 'perf-forest-moss', 'perf-forest-cedar', 'perf-forest-myst', 'perf-forest-leopard',
        ],
        desc: 'Row 1 (forest perfume bottles, 5 variants from cheap to luxurious): 1) rain forest perfume bottle with green leaf 2) moss perfume bottle 3) cedar perfume bottle 4) mystic fog perfume bottle 5) luxury leopard-spotted perfume bottle',
      },
      {
        ids: [
          'perf-gour-cocoa', 'perf-gour-mocha', 'perf-gour-praline', 'perf-gour-truffle', 'perf-gour-leopard',
        ],
        desc: 'Row 2 (gourmet perfume bottles, 5 variants from cheap to luxurious): 1) cocoa perfume bottle 2) mocha perfume bottle 3) praline perfume bottle 4) truffle perfume bottle 5) luxury leopard-spotted perfume bottle',
      },
      {
        ids: [
          'perf-bloom-lilac', 'perf-bloom-peony', 'perf-bloom-jasmine', 'perf-bloom-gardenia', 'perf-bloom-leopard',
        ],
        desc: 'Row 3 (flower perfume bottles, 5 variants from cheap to luxurious): 1) lilac perfume bottle 2) peony perfume bottle 3) jasmine perfume bottle 4) gardenia perfume bottle 5) luxury leopard-spotted perfume bottle',
      },
    ],
  },
]

async function genSheet(zai: Awaited<ReturnType<typeof ZAI.create>>, fix: FixSheet): Promise<boolean> {
  const out = path.join(SRC, `${fix.name}.png`)
  if (fs.existsSync(out) && fs.statSync(out).size > 10000) {
    console.log(`SKIP ${fix.name} (already exists)`)
    return true
  }
  const rows = fix.rows.length
  const prompt = `Sheet of game item icons arranged in a perfect grid with EXACTLY ${rows} row${rows > 1 ? 's' : ''} and EXACTLY 5 columns (one icon per cell, every row fully filled with 5 icons). ${STYLE}.\n${fix.rows.map((r) => r.desc).join('\n')}`
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await zai.images.generations.create({ prompt, size: '1024x1024' })
      const b64 = res.data?.[0]?.base64
      if (!b64) throw new Error('empty base64')
      fs.writeFileSync(out, Buffer.from(b64, 'base64'))
      console.log(`OK ${fix.name}`)
      return true
    } catch (e) {
      console.error(`FAIL ${fix.name} attempt ${attempt}: ${e instanceof Error ? e.message : String(e)}`)
      await new Promise((r) => setTimeout(r, 2500 * attempt))
    }
  }
  return false
}

async function main(): Promise<void> {
  const manifestPath = path.join(SRC, 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as { cells: Cell[]; single: string }
  /* Убрать клетки сломанных листов */
  manifest.cells = manifest.cells.filter((c) => c.sheet !== 'sheet-06' && c.sheet !== 'sheet-09')
  /* Добавить клетки новых мелких листов */
  for (const fix of FIX_SHEETS) {
    fix.rows.forEach((row, r) => {
      row.ids.forEach((id, c) => manifest.cells.push({ id, sheet: fix.name, row: r, col: c }))
    })
  }
  const zai = await ZAI.create()
  let failed = 0
  for (const fix of FIX_SHEETS) {
    const ok = await genSheet(zai, fix)
    if (!ok) failed++
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`DONE fix sheets: failed=${failed} cells=${manifest.cells.length}`)
  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
