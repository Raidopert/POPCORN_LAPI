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

/* ================= Попкорн (4 варианта зёрен с разной ценностью) ================= */

export type PopcornVariant = 'white' | 'golden' | 'caramel' | 'butter'

export function makePopcornSprite(variant: PopcornVariant = 'white'): Sprite {
  const pal = {
    white: { body: '#FFFDF4', shade: '#F7D97B', shine: '#FFF0C9', edge: '#B8863B' },
    golden: { body: '#FFE9A8', shade: '#EFB83C', shine: '#FFFBEB', edge: '#9A6A12' },
    caramel: { body: '#FFC98A', shade: '#D97E2E', shine: '#FFE9CB', edge: '#9A5615' },
    butter: { body: '#FFED9C', shade: '#F0C235', shine: '#FFFBDC', edge: '#A87B14' },
  }[variant]
  const g = createGrid(14, 14)

  // Пышные «облачка»
  paintCircle(g, 7, 6.4, 3.9, pal.body)
  paintCircle(g, 4.2, 8.6, 2.7, pal.body)
  paintCircle(g, 9.8, 8.6, 2.7, pal.body)
  paintCircle(g, 7, 3.8, 2.6, pal.body)
  // Тень снизу-справа
  tintCircle(g, 9.4, 9.2, 2.7, pal.shade)
  tintCircle(g, 10.2, 5.2, 1.2, pal.shade)
  // Блик сверху-слева
  tintCircle(g, 5, 4.2, 1.6, pal.shine)
  tintCircle(g, 6.6, 7.4, 1.1, pal.shine)
  // Карамелька: поливка-дуга через верхушку
  if (variant === 'caramel') {
    tintCircle(g, 6.5, 2.4, 2.3, '#C8741F')
    tintCircle(g, 4.4, 3.6, 1.1, '#C8741F')
    tintCircle(g, 8.6, 3.6, 1.1, '#C8741F')
  }
  // Масляное: жирный белый блик-капля
  if (variant === 'butter') {
    tintCircle(g, 4.8, 6.6, 1.1, '#FFFFFF')
    tintCircle(g, 9.6, 4.6, 0.9, '#FFFFFF')
  }

  outlineGrid(g, pal.edge)
  return renderGrid(g)
}

/* ================= Бумажный стаканчик (детальный, 48×54 — пиксели вдвое мельче) ================= */

export function makeCupSprite(): Sprite {
  const cols = 48
  const rows = 54
  const g = createGrid(cols, rows)
  const red = '#E24B3B'
  const redLight = '#F2685A' // блик слева
  const redDark = '#C43A2A' // тень справа
  const redCrease = '#D94432' // смятие бумаги
  const cream = '#FFF6EC'
  const creamDark = '#F0DFC8'
  const rimShadow = '#E3C9B4' // тень под ободком
  const base = '#C43A2A'
  const baseDark = '#A32E20'
  const edge = '#572014'

  /* Трапеция: ширина 44 сверху → 26 снизу */
  const halfSpan = (y: number): { x0: number; x1: number } => {
    const t = y / (rows - 1)
    const w = Math.round(44 - 18 * t)
    const x0 = Math.floor((cols - w) / 2)
    return { x0, x1: x0 + w - 1 }
  }

  for (let y = 0; y < rows; y++) {
    const { x0, x1 } = halfSpan(y)
    for (let x = x0; x <= x1; x++) {
      const rel = (x - x0) / Math.max(1, x1 - x0) // 0 слева → 1 справа
      let col: string
      if (y === 0) {
        col = '#FFFFFF' // верхняя кромка ободка
      } else if (y <= 3) {
        col = cream // белый ободок
        if (y === 3 && rel > 0.06 && rel < 0.94) col = rimShadow
      } else if (y >= rows - 4) {
        col = y >= rows - 2 ? baseDark : base // тёмное дно
      } else if (y >= 27 && y <= 40) {
        // кремовая лента с логотипом
        col = rel < 0.12 ? redLight : rel > 0.86 ? redDark : cream
        if (col === cream && rel > 0.78) col = creamDark
      } else {
        const abs = x - 2
        const stripe = Math.floor(abs / 7) % 2 === 0
        col = stripe ? red : cream
        // объём цилиндра: свет слева, тень справа
        if (rel < 0.12) col = stripe ? redLight : cream
        else if (rel > 0.84) col = stripe ? redDark : creamDark
        // сгибы бумаги на верхней половине
        if ((y === 21 || y === 22) && stripe) col = redCrease
        if ((y === 21 || y === 22) && !stripe) col = creamDark
        // «открытое горлышко»: тень первых рядов под ободком
        if ((y === 4 || y === 5) && rel > 0.06 && rel < 0.94) {
          col = stripe ? redDark : rimShadow
        }
      }
      g[y][x] = col
    }
  }

  // Логотип: три пухлых попкорн-облачка на ленте
  paintCircle(g, 24, 31.5, 3.4, '#FFFDF4')
  paintCircle(g, 19.2, 34.2, 2.7, '#FFFDF4')
  paintCircle(g, 28.8, 34.2, 2.7, '#FFFDF4')
  tintCircle(g, 26, 33.4, 2.4, '#F7D97B')
  tintCircle(g, 20.6, 35.4, 1.7, '#F7D97B')
  tintCircle(g, 30, 35.4, 1.7, '#F7D97B')
  tintCircle(g, 23.2, 29.8, 1.3, '#FFF3D6')

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
  /** Светлая шерсть (блик слева); по умолчанию — цвет подушечки */
  furLight?: string
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

/**
 * Лапка куницы 24×30 — удвоенная детализация против прежней 18×22:
 * клочья меха на запястье, светло-теневой объём, блики на коготках,
 * микро-тени у «бобышек» и пушистые перепонки между пальцами.
 */
export function makePawSprite(pal: Partial<PawPalette> = {}): Sprite {
  const p: PawPalette = { ...PAW_DEFAULT, ...pal }
  const light = p.furLight ?? p.pad
  const g = createGrid(24, 30)

  // Пушистая рука/запястье снизу (длинное) + клочья меха по бокам
  paintCircle(g, 12, 24.5, 5.6, p.fur)
  paintCircle(g, 12, 27.6, 5.0, p.fur)
  paintCircle(g, 8.4, 22.2, 3.0, p.fur)
  paintCircle(g, 15.6, 22.2, 3.0, p.fur)
  paintCircle(g, 6.6, 25.4, 1.8, p.fur)
  paintCircle(g, 17.4, 25.4, 1.8, p.fur)
  paintCircle(g, 12, 29.4, 3.7, p.fur)
  // Основная пясть
  paintCircle(g, 12, 15.5, 6.0, p.fur)
  // Три пальца
  paintCircle(g, 6.4, 8.2, 3.0, p.fur)
  paintCircle(g, 12, 6.0, 3.2, p.fur)
  paintCircle(g, 17.6, 8.2, 3.0, p.fur)
  // Пушистые перепонки между пальцами и пястью
  paintCircle(g, 8.8, 11.0, 2.3, p.fur)
  paintCircle(g, 15.2, 11.0, 2.3, p.fur)

  // Объём: свет слева-сверху, тень справа
  tintCircle(g, 8.4, 14.2, 2.6, light)
  tintCircle(g, 10.4, 8.6, 1.6, light)
  tintCircle(g, 15.0, 18.2, 3.6, p.furShade)
  tintCircle(g, 13.8, 25.4, 3.2, p.furShade)
  tintCircle(g, 19.0, 10.6, 1.6, p.furShade)
  // Складка меха между пальцами
  tintCircle(g, 8.8, 12.4, 1.0, p.furShade)
  tintCircle(g, 15.2, 12.4, 1.0, p.furShade)

  // Коготки с белыми бликами
  paintCircle(g, 6.4, 4.4, 1.15, p.claw)
  paintCircle(g, 12, 2.4, 1.2, p.claw)
  paintCircle(g, 17.6, 4.4, 1.15, p.claw)
  tintCircle(g, 6.0, 4.0, 0.5, '#FFF6EC')
  tintCircle(g, 11.6, 2.0, 0.5, '#FFF6EC')
  tintCircle(g, 17.2, 4.0, 0.5, '#FFF6EC')

  // Подушечка и «бобышки» + микро-тени под ними
  paintCircle(g, 12, 16.4, 3.8, p.pad)
  tintCircle(g, 13.4, 18.2, 2.0, p.furShade)
  paintCircle(g, 6.6, 8.0, 1.5, p.beans)
  paintCircle(g, 12, 5.8, 1.6, p.beans)
  paintCircle(g, 17.4, 8.0, 1.5, p.beans)
  tintCircle(g, 7.3, 8.7, 0.8, p.furShade)
  tintCircle(g, 12.8, 6.5, 0.85, p.furShade)
  tintCircle(g, 18.1, 8.7, 0.8, p.furShade)

  // Пятнистый окрас (леопард) — только по уже закрашенной шерсти
  if (p.spots) {
    const dots: Array<[number, number, number]> = [
      [8.0, 12.6, 1.25],
      [15.8, 15.6, 1.3],
      [9.6, 21.4, 1.1],
      [14.6, 20.8, 1.1],
      [12.0, 10.6, 0.9],
      [16.4, 25.6, 1.1],
      [7.6, 17.0, 1.0],
    ]
    for (const [dx, dy, dr] of dots) tintCircle(g, dx, dy, dr, p.spots)
  }
  // Радужные пальцы — перекрашиваем поверх и возвращаем «бобышки»
  if (p.fingers) {
    paintCircle(g, 6.4, 8.2, 3.0, p.fingers[0])
    paintCircle(g, 12, 6.0, 3.2, p.fingers[1])
    paintCircle(g, 17.6, 8.2, 3.0, p.fingers[2])
    paintCircle(g, 6.6, 8.0, 1.5, p.beans)
    paintCircle(g, 12, 5.8, 1.6, p.beans)
    paintCircle(g, 17.4, 8.0, 1.5, p.beans)
  }

  outlineGrid(g, p.edge)
  return renderGrid(g)
}

/* ================= Зерно-мина (ловушка, минус балл) — красно-белое, ЯРКОЕ ================= */

export function makeCornSprite(colorblind = false): Sprite {
  const g = createGrid(12, 12)
  // Обычный режим: красное зерно-мина. Режим дальтоников: сине-оранжевая
  // палитра — красный-зелёный контраст заменён на сине-жёлтый
  const body = colorblind ? '#3D7BFF' : '#E5342E' // яркий сигнал опасности
  const dark = colorblind ? '#274F99' : '#9E1512' // тёмная тень
  const white = '#FFF6EC'
  const edge = colorblind ? '#12275C' : '#570606' // тёмная обводка

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
