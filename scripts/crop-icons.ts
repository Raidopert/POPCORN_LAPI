/**
 * УМНАЯ нарезка спрайт-листов 0.0.83: детект полос иконок по пикселям
 * (модель не держит точную сетку 5×5 — ряды плавают), квадратный кроп
 * по найденным границам → 256×256 в public/inventory/<id>.png.
 * Запуск: bun scripts/crop-icons.ts
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const SRC = '/tmp/paws-sheets'
const OUT = path.join(process.cwd(), 'public', 'inventory')

interface Cell {
  id: string
  sheet: string
  row: number
  col: number
}

interface Band {
  start: number
  end: number
}

const SIZE = 1024

/** Полосы содержимого по одной оси: непрерывные отрезки строк/столбцов
 *  с достаточным числом «не-фоновых» пикселей */
function findBands(scores: number[], minScore: number, minSize: number, mergeGap: number): Band[] {
  const raw: Band[] = []
  let start = -1
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] >= minScore) {
      if (start < 0) start = i
    } else if (start >= 0) {
      raw.push({ start, end: i - 1 })
      start = -1
    }
  }
  if (start >= 0) raw.push({ start, end: scores.length - 1 })
  /* Слить близкие полосы (тонкие зазоры) */
  const merged: Band[] = []
  for (const b of raw) {
    const last = merged[merged.length - 1]
    if (last && b.start - last.end <= mergeGap) last.end = b.end
    else merged.push({ ...b })
  }
  return merged.filter((b) => b.end - b.start + 1 >= minSize)
}

async function sheetAnalysis(sheetPath: string): Promise<{
  rowBands: Band[]
  colBandsByRow: Band[][]
  cells: Array<{ x0: number; y0: number; x1: number; y1: number }>
}> {
  const { data, info } = await sharp(sheetPath).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width
  const H = info.height
  /* Фон: усреднить углы */
  const corner = (x: number, y: number): [number, number, number] => {
    const i = (y * W + x) * 3
    return [data[i], data[i + 1], data[i + 2]]
  }
  const c1 = corner(4, 4)
  const c2 = corner(W - 5, 4)
  const c3 = corner(4, H - 5)
  const bg = [
    (c1[0] + c2[0] + c3[0]) / 3,
    (c1[1] + c2[1] + c3[1]) / 3,
    (c1[2] + c2[2] + c3[2]) / 3,
  ]
  const isFg = (x: number, y: number): boolean => {
    const i = (y * W + x) * 3
    const d =
      Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2])
    return d > 90
  }
  /* Оценка по строкам (шаг 2) */
  const rowScore: number[] = new Array(H).fill(0)
  for (let y = 0; y < H; y += 2) {
    let n = 0
    for (let x = 0; x < W; x += 2) if (isFg(x, y)) n++
    rowScore[y] = n
    if (y + 1 < H) rowScore[y + 1] = n
  }
  const rowBands = findBands(rowScore, Math.round(W * 0.02), 40, 10)
  /* Для каждой полосы — столбцы */
  const colBandsByRow: Band[][] = []
  const cells: Array<{ x0: number; y0: number; x1: number; y1: number }> = []
  for (const rb of rowBands) {
    const colScore: number[] = new Array(W).fill(0)
    for (let x = 0; x < W; x += 2) {
      let n = 0
      for (let y = rb.start; y <= rb.end; y += 2) if (isFg(x, y)) n++
      colScore[x] = n
      if (x + 1 < W) colScore[x + 1] = n
    }
    const cb = findBands(colScore, Math.max(4, Math.round((rb.end - rb.start) * 0.04)), 40, 8)
    colBandsByRow.push(cb)
    for (const c of cb) {
      cells.push({ x0: c.start, y0: rb.start, x1: c.end, y1: rb.end })
    }
  }
  return { rowBands, colBandsByRow, cells }
}

/** Квадратный кроп вокруг найденной границы с полем, → 256×256 */
async function cropBox(sheetPath: string, box: { x0: number; y0: number; x1: number; y1: number }, outPath: string): Promise<void> {
  const pad = 8
  let w = box.x1 - box.x0 + 1 + pad * 2
  let h = box.y1 - box.y0 + 1 + pad * 2
  let left = Math.max(0, box.x0 - pad)
  let top = Math.max(0, box.y0 - pad)
  w = Math.min(w, SIZE - left)
  h = Math.min(h, SIZE - top)
  /* Квадрат с центром на содержимом */
  const side = Math.max(w, h)
  const cx = left + w / 2
  const cy = top + h / 2
  left = Math.max(0, Math.min(SIZE - side, Math.round(cx - side / 2)))
  top = Math.max(0, Math.min(SIZE - side, Math.round(cy - side / 2)))
  const s = Math.min(side, SIZE - left, SIZE - top)
  const buf = await sharp(sheetPath)
    .extract({ left, top, width: s, height: s })
    .resize(256, 256)
    .png()
    .toBuffer()
  fs.writeFileSync(outPath, buf)
}

/** Геометрический запасной вариант (пятые доли холста) */
async function cropGeometric(sheetPath: string, row: number, col: number, rows: number, outPath: string): Promise<void> {
  const cell = SIZE / 5
  const inset = Math.round(cell * 0.1)
  const left = Math.round(col * cell) + inset
  const top = Math.round((row * SIZE) / rows) + inset
  const s = Math.floor(cell) - inset * 2
  const buf = await sharp(sheetPath)
    .extract({ left, top, width: s, height: s })
    .resize(256, 256)
    .png()
    .toBuffer()
  fs.writeFileSync(outPath, buf)
}

async function main(): Promise<void> {
  const manifestPath = path.join(SRC, 'manifest.json')
  if (!fs.existsSync(manifestPath)) {
    console.error('NO MANIFEST')
    process.exit(1)
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as { cells: Cell[]; single: string }

  /* Уникальные листы и число рядов на лист (максимум row+1 по клеткам) */
  const sheets = new Map<string, number>()
  for (const c of manifest.cells) sheets.set(c.sheet, Math.max(sheets.get(c.sheet) ?? 0, c.row + 1))

  /* Анализ листов кеш */
  const analysis = new Map<string, Awaited<ReturnType<typeof sheetAnalysis>>>()
  for (const [sheet, rows] of sheets) {
    const p = path.join(SRC, `${sheet}.png`)
    if (!fs.existsSync(p)) continue
    analysis.set(sheet, await sheetAnalysis(p))
    const a = analysis.get(sheet)!
    console.log(`${sheet}: rowBands=${a.rowBands.length} (need ${rows})`)
  }

  let n = 0
  const missing: string[] = []
  for (const c of manifest.cells) {
    const sheetPath = path.join(SRC, `${c.sheet}.png`)
    if (!fs.existsSync(sheetPath) || !analysis.has(c.sheet)) {
      missing.push(c.id)
      continue
    }
    const a = analysis.get(c.sheet)!
    const rowsNeed = sheets.get(c.sheet)!
    /* Полоса строки: ближайшая по ожидаемому центру.
       Если найденных полос МЕНЬШЕ нужного (ряды слились) — геометрический
       фолбэк: общий bbox контента делится на rowsNeed равных рядов */
    if (a.rowBands.length < rowsNeed) {
      const x0 = Math.min(...a.colBandsByRow.flatMap((cb) => (cb.length ? [cb[0].start] : [SIZE])))
      const x1 = Math.max(...a.colBandsByRow.flatMap((cb) => (cb.length ? [cb[cb.length - 1].end] : [0])))
      const y0 = Math.min(...a.rowBands.map((b) => b.start))
      const y1 = Math.max(...a.rowBands.map((b) => b.end))
      const rowH = (y1 - y0 + 1) / rowsNeed
      const slice = (x1 - x0 + 1) / 5
      const inset = 0.06
      const box = {
        x0: Math.round(x0 + slice * (c.col + inset)),
        y0: Math.round(y0 + rowH * (c.row + inset)),
        x1: Math.round(x0 + slice * (c.col + 1 - inset)) - 1,
        y1: Math.round(y0 + rowH * (c.row + 1 - inset)) - 1,
      }
      await cropBox(sheetPath, box, path.join(OUT, `${c.id}.png`))
      n++
      continue
    }
    const expectedCenter = ((c.row + 0.5) / rowsNeed) * SIZE
    const bandIdx = a.rowBands
      .map((b, i) => ({ i, dist: Math.abs((b.start + b.end) / 2 - expectedCenter) }))
      .sort((x, y) => x.dist - y.dist)[0]?.i
    if (bandIdx === undefined) {
      await cropGeometric(sheetPath, c.row, c.col, rowsNeed, path.join(OUT, `${c.id}.png`))
      n++
      continue
    }
    const colBands = a.colBandsByRow[bandIdx] ?? []
    /* Полоса столбца: c-я по порядку (или ближайшая по ожидаемому центру) */
    let box: { x0: number; y0: number; x1: number; y1: number } | undefined
    if (colBands.length >= 5) {
      const b = colBands[Math.min(c.col, colBands.length - 1)]
      if (b) box = { x0: b.start, y0: a.rowBands[bandIdx].start, x1: b.end, y1: a.rowBands[bandIdx].end }
    } else if (colBands.length > 0) {
      /* Полосы столбцов слились — режем полосу строки на 5 равных долей */
      const rb = a.rowBands[bandIdx]
      const x0 = colBands[0].start
      const x1 = colBands[colBands.length - 1].end
      const slice = (x1 - x0 + 1) / 5
      box = {
        x0: Math.round(x0 + slice * c.col),
        y0: rb.start,
        x1: Math.round(x0 + slice * (c.col + 1)) - 1,
        y1: rb.end,
      }
    }
    if (box) {
      await cropBox(sheetPath, box, path.join(OUT, `${c.id}.png`))
      n++
    } else {
      await cropGeometric(sheetPath, c.row, c.col, rowsNeed, path.join(OUT, `${c.id}.png`))
      n++
    }
  }

  /* Одиночная вершина */
  if (manifest.single) {
    const singlePath = path.join(SRC, `${manifest.single}.png`)
    if (fs.existsSync(singlePath)) {
      await sharp(singlePath).resize(256, 256).png().toFile(path.join(OUT, `${manifest.single}.png`))
      n++
    } else missing.push(manifest.single)
  }

  console.log(`SMART-CROPPED ${n} icons -> ${OUT}`)
  if (missing.length > 0) {
    console.log(`MISSING (${missing.length}): ${missing.join(', ')}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
