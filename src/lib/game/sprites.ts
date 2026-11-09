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

/** Заливает прямоугольник включительно (координаты пиксельные) */
function fillRect(g: Grid, x0: number, y0: number, x1: number, y1: number, color: string): void {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = color
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

/* ================= Лапка куницы (большая и длинная, с пушистой лапой) ================= */

/** Палитра окраса лапки (магазин скинов) */
export interface PawPalette {
  fur: string
  furShade: string
  pad: string
  beans: string
  claw: string
  edge: string
  /** Три пальца разного цвета (радужная лапка) */
  fingers?: [string, string, string]
  /** Пятнышки по шерсти (леопардовая лапка) */
  spots?: string
}

const PAW_DEFAULT: PawPalette = {
  fur: '#A2673D',
  furShade: '#8A5330',
  pad: '#E89A6B',
  beans: '#F6DCA8',
  claw: '#5C3A1E',
  edge: '#4E2C14',
}

export function makePawSprite(pal: Partial<PawPalette> = {}): Sprite {
  const p: PawPalette = { ...PAW_DEFAULT, ...pal }
  const g = createGrid(18, 22)

  // Пушистая лапа/рука снизу (длинная)
  paintCircle(g, 9, 18, 4.6, p.fur)
  paintCircle(g, 9, 20.5, 4.0, p.fur)
  paintCircle(g, 6.4, 16.4, 2.6, p.fur)
  paintCircle(g, 11.6, 16.4, 2.6, p.fur)
  // Основная подушечка
  paintCircle(g, 9, 11.5, 4.8, p.fur)
  // Три пальца
  paintCircle(g, 5, 6.2, 2.3, p.fur)
  paintCircle(g, 9, 4.8, 2.5, p.fur)
  paintCircle(g, 13, 6.2, 2.3, p.fur)
  // Мех между пальцами и ладонью
  paintCircle(g, 6.8, 8.4, 1.8, p.fur)
  paintCircle(g, 11.2, 8.4, 1.8, p.fur)
  // Коготки
  paintCircle(g, 5, 3.4, 0.9, p.claw)
  paintCircle(g, 9, 1.9, 0.9, p.claw)
  paintCircle(g, 13, 3.4, 0.9, p.claw)
  // Подушечка и «бобышки»
  paintCircle(g, 9, 12.2, 3.1, p.pad)
  paintCircle(g, 5, 6, 1.15, p.beans)
  paintCircle(g, 9, 4.6, 1.25, p.beans)
  paintCircle(g, 13, 6, 1.15, p.beans)
  // Тень на мехе справа и на лапе
  tintCircle(g, 11.6, 14.2, 2.6, p.furShade)
  tintCircle(g, 10.8, 19.4, 2.4, p.furShade)
  // Пятнистый окрас (леопард) — только по уже закрашенной шерсти
  if (p.spots) {
    const dots: Array<[number, number, number]> = [
      [6.2, 9.8, 0.95],
      [11.8, 12.4, 1.05],
      [7.4, 16.8, 0.85],
      [11.2, 16.2, 0.85],
      [9.2, 8.2, 0.7],
      [12.4, 19.6, 0.85],
    ]
    for (const [dx, dy, dr] of dots) tintCircle(g, dx, dy, dr, p.spots)
  }
  // Радужные пальцы — перекрашиваем поверх и возвращаем «бобышки»
  if (p.fingers) {
    paintCircle(g, 5, 6.2, 2.3, p.fingers[0])
    paintCircle(g, 9, 4.8, 2.5, p.fingers[1])
    paintCircle(g, 13, 6.2, 2.3, p.fingers[2])
    paintCircle(g, 5, 6, 1.15, p.beans)
    paintCircle(g, 9, 4.6, 1.25, p.beans)
    paintCircle(g, 13, 6, 1.15, p.beans)
  }

  outlineGrid(g, p.edge)
  return renderGrid(g)
}

/* ================= Зерно-мина (ловушка, минус балл) — красно-белое, ЯРКОЕ ================= */

export function makeCornSprite(): Sprite {
  const g = createGrid(12, 12)
  const body = '#E5342E' // ярко-красный — сигнал опасности
  const dark = '#9E1512' // тёмно-красная тень
  const white = '#FFF6EC'
  const edge = '#570606' // тёмно-красная обводка

  // Овальное зерно
  paintCircle(g, 6, 5.4, 3.6, body)
  paintCircle(g, 6, 7.4, 3.1, body)
  // Тень снизу-справа
  tintCircle(g, 7.8, 8.4, 2.4, dark)
  // Белые «предупреждающие» полосы и блики
  tintCircle(g, 4.6, 4.0, 1.5, white)
  g[6][3] = white
  g[6][4] = white
  g[7][3] = white
  g[3][7] = white

  outlineGrid(g, edge)
  return renderGrid(g)
}

/* ================= Сундучок с перками (закрытый / открытый) ================= */

export function makeChestSprite(open = false): Sprite {
  const g = createGrid(18, 17)
  const wood = '#B07A3F'
  const woodLight = '#C98F4F'
  const woodDark = '#8A5330'
  const band = '#6B421F'
  const gold = '#FFE066'
  const goldPale = '#FFF7C2'
  const goldDark = '#D99A1B'
  const edge = '#4A2A12'

  if (!open) {
    // Крышка (полукруглая сверху)
    fillRect(g, 4, 1, 13, 1, woodDark)
    fillRect(g, 3, 2, 14, 2, wood)
    fillRect(g, 2, 3, 15, 5, wood)
    fillRect(g, 2, 6, 15, 6, woodDark) // стык крышки
    // Корпус
    fillRect(g, 1, 7, 16, 15, wood)
    fillRect(g, 1, 7, 16, 8, woodLight) // блик сверху корпуса
    // Металлические полосы по краям
    fillRect(g, 2, 7, 3, 15, band)
    fillRect(g, 14, 7, 15, 15, band)
    // Замок по центру
    fillRect(g, 8, 7, 9, 11, gold)
    g[9][8] = edge
    g[9][9] = edge
    g[10][8] = goldDark
    g[10][9] = goldDark
  } else {
    // Открытая крышка, откинутая назад
    fillRect(g, 3, 0, 14, 0, woodDark)
    fillRect(g, 2, 1, 15, 2, wood)
    // Светящееся нутро
    fillRect(g, 2, 3, 15, 5, gold)
    fillRect(g, 4, 3, 7, 4, goldPale)
    g[3][10] = goldPale
    g[5][12] = goldPale
    g[5][5] = goldDark
    // Корпус
    fillRect(g, 1, 6, 16, 15, wood)
    fillRect(g, 1, 6, 16, 7, woodLight)
    fillRect(g, 2, 6, 3, 15, band)
    fillRect(g, 14, 6, 15, 15, band)
    // Передняя накладка замка
    fillRect(g, 8, 6, 9, 9, gold)
    g[8][8] = goldDark
    g[8][9] = goldDark
  }

  outlineGrid(g, edge)
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

/* ================= Голубь-воришка (2 кадра взмаха) ================= */

export function makePigeonSprite(flap = false): Sprite {
  const g = createGrid(18, 15)
  const body = '#8E9AA6'
  const dark = '#5F6B76'
  const belly = '#E8E4DC'
  const beak = '#F2A24B'
  const eye = '#22150C'
  const wing = '#77828D'
  const neck = '#6FA08A'

  // Хвост
  fillRect(g, 14, 8, 17, 10, dark)
  // Крыло (за телом): вверх при взмахе, вниз в исходном
  if (flap) {
    paintCircle(g, 11, 3.4, 2.9, wing)
    tintCircle(g, 12.6, 2.6, 1.6, body)
  } else {
    paintCircle(g, 11, 11.2, 2.7, wing)
    tintCircle(g, 12.8, 12.0, 1.5, body)
  }
  // Тело
  paintCircle(g, 10, 8.5, 4.2, body)
  // Светлое брюшко
  tintCircle(g, 8.4, 10.4, 2.5, belly)
  // Голова
  paintCircle(g, 4.6, 5.4, 2.5, dark)
  // Зелёный отлив на шее
  tintCircle(g, 6.6, 7.2, 1.2, neck)
  // Клюв
  fillRect(g, 1, 5, 3, 6, beak)
  // Глаз
  g[5][4] = eye

  outlineGrid(g, '#3A424B')
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
