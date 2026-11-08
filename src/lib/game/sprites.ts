/**
 * Процедурные пиксельные спрайты для игры.
 * Каждый спрайт строится на маленькой сетке пикселей и рисуется
 * с imageSmoothingEnabled = false — получается честный 8-битный вид.
 */

export interface Sprite {
  canvas: HTMLCanvasElement
  w: number
  h: number
}

type Grid = (string | null)[][]

function createGrid(cols: number, rows: number): Grid {
  return Array.from({ length: rows }, () => Array<string | null>(cols).fill(null))
}

/** Заливает круг цветом (все пиксели) */
function paintCircle(g: Grid, cx: number, cy: number, r: number, color: string): void {
  const rows = g.length
  const cols = g[0].length
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue
      if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) g[y][x] = color
    }
  }
}

/** Кладёт цвет только поверх уже закрашенных пикселей (тень/блик) */
function tintCircle(g: Grid, cx: number, cy: number, r: number, color: string): void {
  const rows = g.length
  const cols = g[0].length
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue
      if (g[y][x] && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) g[y][x] = color
    }
  }
}

/** Автоматическая пиксельная обводка вокруг силуэта */
function outlineGrid(g: Grid, color: string): void {
  const rows = g.length
  const cols = g[0].length
  const toOutline: Array<[number, number]> = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (g[y][x]) continue
      let near = false
      for (let dy = -1; dy <= 1 && !near; dy++) {
        for (let dx = -1; dx <= 1 && !near; dx++) {
          const ny = y + dy
          const nx = x + dx
          if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && g[ny][nx]) near = true
        }
      }
      if (near) toOutline.push([x, y])
    }
  }
  for (const [x, y] of toOutline) g[y][x] = color
}

function renderGrid(g: Grid): Sprite {
  const rows = g.length
  const cols = g[0].length
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  const c = canvas.getContext('2d')!
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = g[y][x]
      if (color) {
        c.fillStyle = color
        c.fillRect(x, y, 1, 1)
      }
    }
  }
  return { canvas, w: cols, h: rows }
}

/* ================= Попкорн ================= */

export function makePopcornSprite(golden = false): Sprite {
  const g = createGrid(14, 14)
  const body = golden ? '#FFE9A8' : '#FFFDF4'
  const shade = golden ? '#EFB83C' : '#F7D97B'
  const shine = golden ? '#FFFBEB' : '#FFF0C9'
  const edge = golden ? '#9A6A12' : '#B8863B'

  // Пышные «облачка»
  paintCircle(g, 7, 6.4, 3.9, body)
  paintCircle(g, 4.2, 8.6, 2.7, body)
  paintCircle(g, 9.8, 8.6, 2.7, body)
  paintCircle(g, 7, 3.8, 2.6, body)
  // Тень снизу-справа
  tintCircle(g, 9.4, 9.2, 2.7, shade)
  tintCircle(g, 10.2, 5.2, 1.2, shade)
  // Блик сверху-слева
  tintCircle(g, 5, 4.2, 1.6, shine)
  tintCircle(g, 6.6, 7.4, 1.1, shine)

  outlineGrid(g, edge)
  return renderGrid(g)
}

/* ================= Бумажный стаканчик ================= */

export function makeCupSprite(): Sprite {
  const cols = 24
  const rows = 26
  const g = createGrid(cols, rows)
  const red = '#E24B3B'
  const white = '#FFF6EC'
  const dark = '#C43A2A'
  const edge = '#572014'

  for (let y = 0; y < rows; y++) {
    const t = y / (rows - 1)
    const w = Math.round(cols - 9 * t) // сужение книзу: 24 → 15
    const x0 = Math.floor((cols - w) / 2)
    for (let x = x0; x < x0 + w; x++) {
      let col: string
      if (y <= 1) {
        col = white // белый ободок
      } else if (y >= rows - 2) {
        col = dark // тёмное дно
      } else {
        const rel = (x - x0) / w
        const idx = Math.floor(rel * 7)
        col = idx % 2 === 0 ? red : white
        if (y === 2) col = idx % 2 === 0 ? dark : white // тень под ободком
      }
      g[y][x] = col
    }
  }
  outlineGrid(g, edge)
  return renderGrid(g)
}

/* ================= Лапка куницы ================= */

export function makePawSprite(): Sprite {
  const g = createGrid(16, 16)
  const fur = '#A2673D'
  const padPink = '#E89A6B'
  const beans = '#F6DCA8'
  const claw = '#5C3A1E'

  // Основная подушечка
  paintCircle(g, 8, 10, 4.4, fur)
  // Три пальца
  paintCircle(g, 4.6, 5.6, 2.2, fur)
  paintCircle(g, 8, 4.4, 2.4, fur)
  paintCircle(g, 11.4, 5.6, 2.2, fur)
  // Мех между пальцами и ладонью
  paintCircle(g, 6.2, 7.2, 1.7, fur)
  paintCircle(g, 9.8, 7.2, 1.7, fur)
  // Коготки
  paintCircle(g, 4.6, 3.0, 0.9, claw)
  paintCircle(g, 8, 1.7, 0.9, claw)
  paintCircle(g, 11.4, 3.0, 0.9, claw)
  // Подушечка и «бобышки»
  paintCircle(g, 8, 10.8, 2.9, padPink)
  paintCircle(g, 4.6, 5.4, 1.1, beans)
  paintCircle(g, 8, 4.2, 1.2, beans)
  paintCircle(g, 11.4, 5.4, 1.1, beans)
  // Тень на мехе
  tintCircle(g, 10.4, 12.6, 2.3, '#8A5330')

  outlineGrid(g, '#4E2C14')
  return renderGrid(g)
}

/* ================= Блёстка для золотого зерна ================= */

export function makeSparkleSprite(): Sprite {
  const g = createGrid(7, 7)
  const bright = '#FFFFFF'
  const gold = '#FFE066'
  for (let i = 0; i < 7; i++) {
    g[3][i] = i === 3 ? bright : gold
    g[i][3] = i === 3 ? bright : gold
  }
  g[2][2] = gold
  g[4][2] = gold
  g[2][4] = gold
  g[4][4] = gold
  return renderGrid(g)
}

/* ================= Отрисовка ================= */

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  s: Sprite,
  cx: number,
  cy: number,
  scale: number,
  opts?: { rot?: number; alpha?: number; sx?: number; sy?: number },
): void {
  const { rot = 0, alpha = 1, sx = 1, sy = 1 } = opts ?? {}
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(cx, cy)
  if (rot) ctx.rotate(rot)
  ctx.scale(sx, sy)
  ctx.drawImage(s.canvas, (-s.w * scale) / 2, (-s.h * scale) / 2, s.w * scale, s.h * scale)
  ctx.restore()
}

/** Плавное появление с перелётом (easeOutBack) */
export function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  const p = Math.min(1, Math.max(0, t))
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
}

export function easeOutQuad(t: number): number {
  const p = Math.min(1, Math.max(0, t))
  return 1 - (1 - p) * (1 - p)
}
