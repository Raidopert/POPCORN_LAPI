/**
 * Процедурные пиксельные спрайты для игры.
 * Каждый спрайт строится на маленькой сетке пикселей и рисуется
 * с imageSmoothingEnabled = false — получается честный 8-битный вид.
 */

export interface Sprite {
  /** HTML-канвас или OffscreenCanvas (где поддерживается — он дешевле) */
  canvas: HTMLCanvasElement | OffscreenCanvas
  w: number
  h: number
  /** Гладкий векторный спрайт: канвас отрисован в высоком разрешении,
      при выводе включаем сглаживание (у пиксельных — выключено) */
  smooth?: boolean
}

/**
 * Создать канвас для пререндера. Если браузер умеет OffscreenCanvas —
 * используем его: рисование в такой канвас может уходить в фоновый поток,
 * а главное — он не участвует в DOM-компоновке страницы.
 * (Старые Android/iOS спокойно падают обратно на обычный canvas.)
 */
function mkCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      return new OffscreenCanvas(w, h)
    } catch {
      /* очень старый Safari: конструктор есть, а работать не умеет */
    }
  }
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
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
  const canvas = mkCanvas(cols, rows)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!c) return { canvas, w: cols, h: rows }
  c.imageSmoothingEnabled = false
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

/* ================= Свечение (glow) для ценных зёрен ================= */

/**
 * Мягкий радиальный ореол под золотое зерно. Пререндерится ОДИН раз:
 * рисовать radial-gradient каждый кадр — дорого, а готовый спрайт
 * поверх зерна с globalCompositeOperation='lighter' — почти бесплатно.
 */
export function makeGlowSprite(color = '#FFE066'): Sprite {
  const S = 48
  const canvas = mkCanvas(S, S)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (c) {
    const g = c.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2)
    g.addColorStop(0, color)
    g.addColorStop(0.45, color + '55') /* 8-битный hex-alpha: полупрозрачно */
    g.addColorStop(1, color + '00')
    c.fillStyle = g
    c.fillRect(0, 0, S, S)
  }
  return { canvas, w: S, h: S }
}

/* ================= Попкорн (4 варианта зёрен с разной ценностью) ================= */

export type PopcornVariant = 'white' | 'golden' | 'caramel' | 'butter'

export function makePopcornSprite(variant: PopcornVariant = 'white'): Sprite {
  const pal = {
    white: { body: '#FFFDF4', shade: '#F7D97B', shine: '#FFF0C9', edge: '#B8863B' },
    golden: { body: '#FFDF6B', shade: '#EFB83C', shine: '#FFFBEB', edge: '#9A6A12' },
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
  /** Три/четыре пальца разного цвета (радужная, неоновая) */
  fingers?: [string, string, string, string]
  /** Пятнышки по шерсти (леопардовая лапка) */
  spots?: string
  /** Волшебный колпак поверх среднего пальца (призрачная шапка) */
  hat?: boolean
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

  // Волшебный колпак (призрачная шапка): острый треугольник с кантами
  if (p.hat) {
    const hatMain = '#8AA0D8'
    const hatDark = '#66739F'
    fillRect(g, 11, 0, 13, 0, hatDark) // острая верхушка
    fillRect(g, 10, 1, 14, 1, hatMain)
    fillRect(g, 9, 2, 15, 2, hatMain)
    fillRect(g, 8, 3, 16, 3, hatDark)
    fillRect(g, 7, 4, 17, 4, hatMain) // поля
    fillRect(g, 7, 5, 17, 5, hatDark) // кант
    g[1][12] = '#F2F6FF' // блик
  }

  outlineGrid(g, p.edge)
  return renderGrid(g)
}

/* ================= Зерно-мина (ловушка, минус баллы) — ШИПАСТАЯ БОМБА.
   Раньше была просто красной ягодкой и не читалась как опасность:
   теперь это круглая мина с шипами, злыми глазами и оскалом ================= */

export function makeCornSprite(colorblind = false): Sprite {
  const g = createGrid(14, 14)
  // Обычный режим: красная мина. Режим дальтоников: сине-оранжевая
  // палитра — красный-зелёный контраст заменён на сине-жёлтый
  const body = colorblind ? '#3D7BFF' : '#E5342E' // яркий сигнал опасности
  const dark = colorblind ? '#274F99' : '#9E1512' // тёмная тень
  const spike = colorblind ? '#12275C' : '#570606' // шипы
  const white = '#FFF6EC'
  const edge = colorblind ? '#0A1540' : '#3A0303' // тёмная обводка

  // Шипы: 4 по сторонам света + 4 по диагоналям — классическая морская мина
  fillRect(g, 6, 0, 7, 1, spike) // верх
  fillRect(g, 6, 12, 7, 13, spike) // низ
  fillRect(g, 0, 6, 1, 7, spike) // лево
  fillRect(g, 12, 6, 13, 7, spike) // право
  g[1][2] = spike
  g[2][1] = spike
  g[1][11] = spike
  g[2][12] = spike
  g[12][2] = spike
  g[11][1] = spike
  g[11][12] = spike
  g[12][11] = spike

  // Круглый корпус
  paintCircle(g, 6.5, 6.5, 4.7, body)
  // Тень снизу-справа
  tintCircle(g, 8.4, 8.4, 3.4, dark)
  // Блик сверху-слева
  tintCircle(g, 4.4, 4.0, 1.4, white)

  // Злые глаза: белки с косым разрезом и тёмными зрачками
  g[5][4] = white
  g[5][5] = white
  g[6][4] = white
  g[6][5] = dark // зрачок косо вниз-внутрь
  g[5][9] = white
  g[5][8] = white
  g[6][9] = white
  g[6][8] = dark
  // Сердитые брови
  g[4][3] = dark
  g[4][4] = dark
  g[4][9] = dark
  g[4][10] = dark
  // Оскал с опущенными уголками
  fillRect(g, 4, 9, 9, 9, dark)
  g[8][3] = dark
  g[8][10] = dark

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

/* ================= Соска 🍼 (перк «Соски-малышки») ================= */

/** Детская соска: розовое кольцо-держатель + белый круглый наконечник.
    Крупнее обычного зерна, ловится легко, но и стоит дороже (+40). */
export function makeNippleSprite(): Sprite {
  const g = createGrid(14, 14)
  const ring = '#FF8FB8' // розовое кольцо
  const ringDark = '#D96A96'
  const ringLight = '#FFC2D9'
  const knob = '#FFFDF4' // белый наконечник
  const knobShade = '#F0DFC8'
  const edge = '#8A4A5E'

  // Кольцо-держатель: широкая «бублик»-дуга снизу
  paintCircle(g, 7, 9.4, 4.4, ring)
  paintCircle(g, 7, 9.0, 2.1, '#FCEFF2') // дырка бублика
  tintCircle(g, 9.6, 11.4, 2.2, ringDark)
  tintCircle(g, 4.6, 7.2, 1.6, ringLight)

  // Наконечник: белый овал сверху, чуть смещён вверх
  paintCircle(g, 7, 4.6, 3.3, knob)
  tintCircle(g, 5.6, 3.4, 1.5, '#FFFFFF')
  tintCircle(g, 8.6, 6.0, 1.8, knobShade)

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

/* ================= ГЛАДКАЯ ВЕКТОРНАЯ ОТРИСОВКА (supersampling) =================
   Игрок просил убрать видимую пиксельность и угловатость у лапки, зёрен
   и мин. Решение: те же силуэты и логические размеры (вся игровая
   математика — хитбоксы, радиусы подбора — не меняется), но арт строится
   векторно на канвасе 4×–6× логического размера и выводится вниз со
   сглаживанием: кривые Безье, радиальные градиенты, мягкий объём. */

/** Путь-силуэт из кругов (union — перекрытия не создают швов) */
function circlesPath(list: Array<[number, number, number]>, k: number, inflate = 0): Path2D {
  const p = new Path2D()
  for (const [x, y, r] of list) {
    const rr = (r + inflate) * k
    p.moveTo(x * k + rr, y * k)
    p.arc(x * k, y * k, rr, 0, Math.PI * 2)
  }
  return p
}

/** Радиальный градиент с мягким затуханием (для света/тени внутри клипа) */
function softSpot(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
): void {
  const g = c.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color)
  g.addColorStop(1, color.slice(0, 7) + '00')
  c.fillStyle = g
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  c.fill()
}

/* ---------- Зерно попкорна: пухлое облачко с объёмом и бликами ---------- */

export function makeSmoothPopcornSprite(variant: PopcornVariant = 'white'): Sprite {
  const S = 56
  const k = S / 14
  const canvas = mkCanvas(S, S)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!c) return { canvas, w: 14, h: 14, smooth: true }
  const pal = {
    white: { body: '#FFFDF4', shade: '#F7D97B', shine: '#FFF0C9', edge: '#B8863B' },
    golden: { body: '#FFDF6B', shade: '#EFB83C', shine: '#FFFBEB', edge: '#9A6A12' },
    caramel: { body: '#FFC98A', shade: '#D97E2E', shine: '#FFE9CB', edge: '#9A5615' },
    butter: { body: '#FFED9C', shade: '#F0C235', shine: '#FFFBDC', edge: '#A87B14' },
  }[variant]
  const blobs: Array<[number, number, number]> = [
    [7, 6.4, 3.9],
    [4.2, 8.6, 2.7],
    [9.8, 8.6, 2.7],
    [7, 3.8, 2.6],
  ]

  /* Обводка-силуэт: каждый круг чуть шире тёмным, поверх — основная заливка */
  c.fillStyle = pal.edge
  c.fill(circlesPath(blobs, k, 0.55))
  c.fillStyle = pal.body
  const body = circlesPath(blobs, k)
  c.fill(body)

  /* Объём: свет сверху-слева, тень снизу-справа — мягкие пятна в клипе */
  c.save()
  c.clip(body)
  softSpot(c, 10.6, 10.6, 5.4 * k, pal.shade + 'B4')
  softSpot(c, 4.9, 4.5, 3.4 * k, pal.shine + 'F0')
  softSpot(c, 6.6, 7.8, 1.6 * k, pal.shine + 'C0')
  if (variant === 'golden') softSpot(c, 8.6, 4.4, 1.8 * k, '#FFFBEB' + 'D0')
  /* Складки-«пушинки»: пара дуг, чтобы облако не было стерильным */
  c.strokeStyle = 'rgba(120, 70, 10, 0.10)'
  c.lineWidth = 0.5 * k
  c.lineCap = 'round'
  c.beginPath()
  c.arc(7 * k, 7.2 * k, 4.4 * k, Math.PI * 0.35, Math.PI * 0.75)
  c.stroke()
  c.beginPath()
  c.arc(5.4 * k, 6 * k, 2.2 * k, Math.PI * 0.9, Math.PI * 1.5)
  c.stroke()
  /* Карамельная поливка: волнистая дуга через верх + капли */
  if (variant === 'caramel') {
    c.strokeStyle = '#C8741F'
    c.lineWidth = 1.55 * k
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(3.4 * k, 5.2 * k)
    c.bezierCurveTo(5 * k, 1.6 * k, 9 * k, 1.6 * k, 10.6 * k, 5.2 * k)
    c.stroke()
    c.lineWidth = 1.1 * k
    c.beginPath()
    c.moveTo(5.6 * k, 4.6 * k)
    c.lineTo(5.6 * k, 6.2 * k)
    c.moveTo(8.6 * k, 4.6 * k)
    c.lineTo(8.6 * k, 5.8 * k)
    c.stroke()
  }
  /* Масляное: жирные белые капли */
  if (variant === 'butter') {
    c.fillStyle = '#FFFFFF'
    c.beginPath()
    c.ellipse(4.9 * k, 6.8 * k, 1.25 * k, 0.85 * k, -0.5, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(9.7 * k, 4.7 * k, 0.95 * k, 0.65 * k, 0.4, 0, Math.PI * 2)
    c.fill()
  }
  c.restore()
  return { canvas, w: 14, h: 14, smooth: true }
}

/* ---------- БОЛЬШАЯ ПОПКОРНИНА: редкий жирный приз на поле ----------
   Крупное пухлое облако в глазури с блёстками: читается издалека и
   отличается от обычных зёрен и золота. Три сорта глазури:
   КАРАМЕЛЬНАЯ (как была), ВИШНЁВАЯ (красная) и самая редкая —
   ВИНОГРАДНАЯ (фиолетовая). Сорт только меняет палитру. ---------- */

export type BigKind = 'caramel' | 'cherry' | 'grape'

const BIG_PALETTES: Record<
  BigKind,
  { body: string; shade: string; shine: string; edge: string; drizzle: string }
> = {
  /* карамельно-золотая классика */
  caramel: { body: '#FFD98A', shade: '#E39B36', shine: '#FFF6DC', edge: '#A06514', drizzle: '#D88A22' },
  /* вишнёвая глазурь: тёплый красный с ягодным отливом */
  cherry: { body: '#FF8A78', shade: '#D0422E', shine: '#FFDCD2', edge: '#8C1F16', drizzle: '#A8261A' },
  /* виноградная глазурь: насыщенный фиолет с сиреневыми бликами */
  grape: { body: '#C9A0F0', shade: '#8A5CC8', shine: '#F0DCFF', edge: '#52307E', drizzle: '#6A3FA0' },
}

/** Спрайты кэшируются: сортов три, каждая 96×96 — строится один раз */
const bigSpriteCache: Partial<Record<BigKind, Sprite>> = {}

export function makeBigPopcornSprite(kind: BigKind = 'caramel'): Sprite {
  const hit = bigSpriteCache[kind]
  if (hit) return hit
  const pal = BIG_PALETTES[kind]
  const S = 96
  const k = S / 30
  const canvas = mkCanvas(S, S)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!c) return { canvas, w: 30, h: 30, smooth: true }
  /* Шесть пузырей: пухлое облако-кластер, заметно крупнее любого зерна */
  const blobs: Array<[number, number, number]> = [
    [15, 12.6, 7.6],
    [8.4, 17.2, 5.4],
    [21.6, 17.2, 5.4],
    [15, 6.9, 4.9],
    [5.9, 11.8, 4.1],
    [24.1, 11.8, 4.1],
    [11.5, 21.3, 4.3],
    [18.5, 21.3, 4.3],
  ]

  /* Силуэт: чуть шире тёмным, поверх — основная заливка */
  c.fillStyle = pal.edge
  c.fill(circlesPath(blobs, k, 0.6))
  c.fillStyle = pal.body
  const body = circlesPath(blobs, k)
  c.fill(body)

  /* Объём внутри клипа: тень снизу, блики сверху-слева, карамельная поливка */
  c.save()
  c.clip(body)
  softSpot(c, 19, 21, 13 * k, pal.shade + 'B0')
  softSpot(c, 9.5, 7.5, 8.5 * k, pal.shine + 'F0')
  softSpot(c, 16.5, 11, 4 * k, pal.shine + 'C8')
  softSpot(c, 6.5, 15.5, 2.6 * k, '#FFFBEB' + 'D0')
  /* Складки-«пушинки», чтобы облако не было стерильным */
  c.strokeStyle = 'rgba(120, 70, 10, 0.12)'
  c.lineWidth = 0.7 * k
  c.lineCap = 'round'
  c.beginPath()
  c.arc(15 * k, 14 * k, 9.6 * k, Math.PI * 0.3, Math.PI * 0.72)
  c.stroke()
  c.beginPath()
  c.arc(10.5 * k, 12 * k, 4.6 * k, Math.PI * 0.85, Math.PI * 1.5)
  c.stroke()
  c.beginPath()
  c.arc(20 * k, 13.5 * k, 3.8 * k, Math.PI * 1.1, Math.PI * 1.8)
  c.stroke()
  /* Поливка сорта: волна через верх + капли */
  c.strokeStyle = pal.drizzle
  c.lineWidth = 1.7 * k
  c.beginPath()
  c.moveTo(6.2 * k, 10.4 * k)
  c.bezierCurveTo(9 * k, 3.4 * k, 21 * k, 3.4 * k, 23.8 * k, 10.4 * k)
  c.stroke()
  c.lineWidth = 1.15 * k
  c.beginPath()
  c.moveTo(10.8 * k, 9.2 * k)
  c.lineTo(10.8 * k, 12.4 * k)
  c.moveTo(15 * k, 8.2 * k)
  c.lineTo(15 * k, 10.6 * k)
  c.moveTo(19.2 * k, 9.2 * k)
  c.lineTo(19.2 * k, 12 * k)
  c.stroke()
  /* Пара вшитых блёсток-звёздочек */
  c.strokeStyle = '#FFFFFF'
  c.lineWidth = 0.55 * k
  c.beginPath()
  c.moveTo(8.6 * k, 6.6 * k)
  c.lineTo(8.6 * k, 9.4 * k)
  c.moveTo(7.2 * k, 8 * k)
  c.lineTo(10 * k, 8 * k)
  c.stroke()
  c.globalAlpha = 0.8
  c.beginPath()
  c.moveTo(21.4 * k, 6.2 * k)
  c.lineTo(21.4 * k, 8.4 * k)
  c.moveTo(20.3 * k, 7.3 * k)
  c.lineTo(22.5 * k, 7.3 * k)
  c.stroke()
  c.restore()
  const out: Sprite = { canvas, w: 30, h: 30, smooth: true }
  bigSpriteCache[kind] = out
  return out
}

/* ---------- Соска: гладкий белый наконечник + розовое колечко ---------- */

export function makeSmoothNippleSprite(): Sprite {
  const S = 56
  const k = S / 14
  const canvas = mkCanvas(S, S)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!c) return { canvas, w: 14, h: 14, smooth: true }
  const ring = '#FF8FB8'
  const ringLight = '#FFC2D9'
  const knob = '#FFFDF4'
  const edge = '#8A4A5E'

  /* Обводка колечка: толстый тёмный тор */
  c.strokeStyle = edge
  c.lineWidth = 2.9 * k
  c.beginPath()
  c.arc(7 * k, 9.4 * k, 3.25 * k, 0, Math.PI * 2)
  c.stroke()
  /* Наконечник: тёмный блин чуть шире, поверх — белый с объёмом */
  c.fillStyle = edge
  c.beginPath()
  c.arc(7 * k, 4.6 * k, 3.75 * k, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = knob
  c.beginPath()
  c.arc(7 * k, 4.6 * k, 3.3 * k, 0, Math.PI * 2)
  c.fill()
  softSpot(c, 8.7 * k, 6.2 * k, 2 * k, '#F0DFC8' + 'C8')
  softSpot(c, 5.7 * k, 3.3 * k, 1.5 * k, '#FFFFFF')
  /* Розовое кольцо поверх обводки + блик дугой */
  c.strokeStyle = ring
  c.lineWidth = 2.3 * k
  c.beginPath()
  c.arc(7 * k, 9.4 * k, 3.25 * k, 0, Math.PI * 2)
  c.stroke()
  c.strokeStyle = ringLight
  c.lineWidth = 0.9 * k
  c.lineCap = 'round'
  c.beginPath()
  c.arc(7 * k, 9.4 * k, 3.25 * k, Math.PI * 0.72, Math.PI * 1.25)
  c.stroke()
  return { canvas, w: 14, h: 14, smooth: true }
}

/* ---------- Лапка КОШКА × КУНИЦА, v0.0.35 — реалистичный мех.
   Канва 192×240 (×8 к логическим 24×30). Шубка живая:
   — подшёрсток: ~250 изогнутых шерстинок трёх тонов, течение
     меха от запястья к пальцам (как у настоящей зверюшки);
   — остевые волоски куницы: редкие длинные, рвут гладкость;
   — пухлые клочья по бокам поверх контура — пушистый силуэт;
   — контур тонкий и чёткий (не «плюшевая» обводка);
   — коготки серповидные с корнем под пальцем и бликом;
   — подушечка и бобышки с объёмом и specular.
   Палитра скинов, леопардовые пятна, радужные пальцы и
   волшебный колпак полностью сохранены ---------- */

export function makeSmoothPawSprite(pal: Partial<PawPalette> = {}): Sprite {
  const p: PawPalette = { ...PAW_DEFAULT, ...pal }
  const light = p.furLight ?? p.pad
  const W = 192
  const H = 240
  const k = W / 24
  const canvas = mkCanvas(W, H)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!c) return { canvas, w: 24, h: 30, smooth: true }
  const x = (v: number): number => v * k
  const y = (v: number): number => v * k

  /* Детерминированный «рандом» меха: одна и та же шубка при каждом рендере */
  let seed = 0x2f6e2b1
  const rnd = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  /* Шерстинка: изогнутое «пёрышко» с острым кончиком.
     hx,hy — корень (лог. ед.), ang — направление роста, len — длина,
     w — полуширина корня, bend — изгиб по перпендикуляру */
  const hair = (
    hx: number,
    hy: number,
    ang: number,
    len: number,
    w: number,
    color: string,
    bend: number,
  ): void => {
    const ex = hx + Math.cos(ang) * len
    const ey = hy + Math.sin(ang) * len
    const px = -Math.sin(ang)
    const py = Math.cos(ang)
    const cx = hx + Math.cos(ang) * len * 0.5 + px * bend
    const cy = hy + Math.sin(ang) * len * 0.5 + py * bend
    c.fillStyle = color
    c.beginPath()
    c.moveTo(x(hx + px * w), y(hy + py * w))
    c.quadraticCurveTo(x(cx + px * w * 0.4), y(cy + py * w * 0.4), x(ex), y(ey))
    c.quadraticCurveTo(x(cx - px * w * 0.4), y(cy - py * w * 0.4), x(hx - px * w), y(hy - py * w))
    c.closePath()
    c.fill()
  }

  /* Серповидный коготок: корень под кончиком пальца, изгиб наружу */
  const sickle = (
    rx: number,
    ry: number,
    tx: number,
    ty: number,
    w: number,
    bend: number,
    color: string,
  ): void => {
    const dx = tx - rx
    const dy = ty - ry
    const L = Math.hypot(dx, dy) || 1
    const ux = dx / L
    const uy = dy / L
    const px = -uy
    const py = ux
    const cx = (rx + tx) / 2 + px * bend
    const cy = (ry + ty) / 2 + py * bend
    c.fillStyle = color
    c.beginPath()
    c.moveTo(x(rx + px * w), y(ry + py * w))
    c.quadraticCurveTo(x(cx + px * w * 0.55), y(cy + py * w * 0.55), x(tx), y(ty))
    c.quadraticCurveTo(x(cx - px * w * 0.55), y(cy - py * w * 0.55), x(rx - px * w), y(ry - py * w))
    c.closePath()
    c.fill()
  }

  /* Силуэт: запястье + бахрома + пясть + перепонки + 4 вытянутых пальца + коготки */
  const FUR: Array<[number, number, number]> = [
    /* запястье: узкая колонна, меховые клочья по бокам */
    [12, 24.4, 4.4],
    [12, 27.4, 4.2],
    [12, 29.5, 3.3],
    [7.6, 23.0, 1.5],
    [16.6, 23.4, 1.6],
    [8.9, 26.6, 1.25],
    [15.5, 27.0, 1.3],
    [6.5, 25.7, 1.0],
    [17.7, 26.1, 1.05],
    /* пясть */
    [12, 16.2, 5.3],
    [8.4, 17.9, 2.3],
    [15.6, 17.9, 2.3],
    /* пушистые перепонки между пальцами */
    [7.9, 13.2, 1.5],
    [11.5, 12.2, 1.6],
    [15.3, 13.4, 1.5],
    /* мосты шерсти между пальцами: не «сосиски», а живая лапа */
    [7.5, 10.8, 1.2],
    [12.0, 9.9, 1.25],
    [16.3, 10.6, 1.15],
    /* боковые клочья на пястье */
    [6.6, 15.2, 0.9],
    [17.4, 15.4, 0.9],
    [7.0, 19.6, 1.0],
    [17.0, 19.8, 1.0],
    /* 4 пальца: по два кружка каждый — тонкие, дугой, средний длиннее */
    [5.7, 11.0, 1.7],
    [5.5, 9.3, 1.5],
    [9.4, 8.8, 1.8],
    [9.3, 6.9, 1.6],
    [13.5, 8.4, 1.85],
    [13.7, 6.3, 1.7],
    [17.6, 10.1, 1.7],
    [18.1, 8.5, 1.5],
  ]
  const CLAWS: Array<[number, number, number]> = [
    [4.7, 6.6, 0.8],
    [8.95, 4.25, 0.85],
    [13.75, 3.7, 0.9],
    [19.0, 6.15, 0.8],
  ]
  const silhouette = circlesPath([...FUR, ...CLAWS], k)

  /* Чёткий тёмный контур: узкое кольцо вместо прежней «жирной» обводки */
  c.fillStyle = p.edge
  c.fill(circlesPath([...FUR, ...CLAWS], k, 0.52))
  /* База: шерсть */
  c.fillStyle = p.fur
  c.fill(silhouette)

  /* Шубка: всё только внутри силуэта */
  c.save()
  c.clip(silhouette)

  /* Контурное кольцо изнутри — БЕЗ швов: полупрозрачный тёмный слой
     чуть шире шубки; заливка-объединение не рисует стыки кружков */
  c.globalAlpha = 0.5
  c.fillStyle = p.edge
  c.fill(circlesPath([...FUR, ...CLAWS], k, 0.3))
  c.globalAlpha = 1

  /* Световая база шубки: непрозрачная, перерисовывает внутренность —
     остаётся только тонкое тёмное кольцо [0.10..0.30] */
  const furBase = c.createRadialGradient(x(9.6), y(12.5), 1.6 * k, x(12), y(17), 14 * k)
  furBase.addColorStop(0, light + 'E0')
  furBase.addColorStop(0.42, p.fur)
  furBase.addColorStop(1, p.furShade)
  c.fillStyle = furBase
  c.fill(silhouette)

  /* Точка внутри силуэта — посев шерстинок без «летающего меха» */
  const inSil = (sx: number, sy: number): boolean => {
    for (const [fx, fy, fr] of FUR) {
      if (Math.hypot(sx - fx, sy - fy) < fr * 0.95) return true
    }
    return false
  }
  const rndInSil = (): [number, number] => {
    for (;;) {
      const sx = 3.2 + rnd() * 17.6
      const sy = 4.6 + rnd() * 25.4
      if (inSil(sx, sy)) return [sx, sy]
    }
  }

  /* Подшёрсток: жирные изогнутые шерстинки. Тёмных больше и они шире
     (плотный подшёрсток), светлых меньше и они уже (пряные блики) —
     так мех не превращается в полосатую «зебру» */
  const UP = -Math.PI / 2
  for (let i = 0; i < 170; i++) {
    const [hx, hy] = rndInSil()
    const r = rnd()
    const isLight = r < (hx < 12 ? 0.48 : 0.2)
    const isDark = !isLight && r > 1 - ((hx > 12.4 ? 0.48 : 0.26) + (hy > 21 ? 0.24 : 0))
    const tone = isLight ? light + 'D4' : isDark ? p.furShade + 'B4' : p.fur + '8C'
    const wBase = isLight ? 0.18 + rnd() * 0.12 : 0.26 + rnd() * 0.18
    if (hy < 11.8) {
      /* пальцы: шерсть по оси пальца к кончику */
      const fi = hx < 7.2 ? 0 : hx < 11.4 ? 1 : hx < 15.6 ? 2 : 3
      const fa = UP + [-0.22, -0.14, -0.02, 0.24][fi]
      hair(hx, hy, fa + (rnd() - 0.5) * 0.6, 1.1 + rnd() * 1.0, wBase * 0.85, tone, (rnd() - 0.5) * 0.8)
    } else if (hy < 21.4) {
      /* пясть: веер вверх от центра */
      hair(hx, hy, UP + (hx - 12) * 0.12 + (rnd() - 0.5) * 0.5, 2.0 + rnd() * 1.6, wBase, tone, (rnd() - 0.5) * 1.0)
    } else {
      /* запястье: уверенный поток вверх */
      hair(hx, hy, UP + (hx - 12) * 0.08 + (rnd() - 0.5) * 0.44, 2.2 + rnd() * 1.6, wBase, tone, (rnd() - 0.5) * 0.8)
    }
  }
  /* Остевые волоски куницы: редкие длинные на запястье — «дикая» шубка */
  for (let i = 0; i < 22; i++) {
    const [hx, hy] = rndInSil()
    if (hy < 19) continue
    const tone = rnd() < 0.5 ? light + 'B8' : p.furShade + 'A8'
    hair(hx, hy, UP + (hx - 12) * 0.05 + (rnd() - 0.5) * 0.2, 4.2 + rnd() * 2.0, 0.12 + rnd() * 0.08, tone, (rnd() - 0.5) * 0.9)
  }

  /* Глубина: щели между пальцами, тень под пястьем, вес запястья */
  softSpot(c, x(8.4), y(11.2), 1.0 * k, p.furShade + '7C')
  softSpot(c, x(12.6), y(10.2), 1.0 * k, p.furShade + '7C')
  softSpot(c, x(16.4), y(11.4), 0.95 * k, p.furShade + '74')
  softSpot(c, x(8.8), y(13.8), 1.15 * k, p.furShade + '70')
  softSpot(c, x(12.4), y(12.8), 1.15 * k, p.furShade + '70')
  softSpot(c, x(16.0), y(13.9), 1.15 * k, p.furShade + '70')
  softSpot(c, x(14.6), y(18.6), 5.5 * k, p.furShade + '72')
  softSpot(c, x(13.6), y(26.2), 5 * k, p.furShade + '66')
  /* Контровой свет: мягкие светлые пятна вдоль верхне-левого края —
     без stroke() по пути из кружков: он рисовал швы между ними */
  softSpot(c, x(7.6), y(10.8), 3.0 * k, light + '66')
  softSpot(c, x(6.4), y(15.8), 2.6 * k, light + '5A')
  softSpot(c, x(9.4), y(7.8), 2.0 * k, light + '66')
  /* Пятнистый окрас (леопард) */
  if (p.spots) {
    const dots: Array<[number, number, number]> = [
      [8.6, 13.0, 1.15],
      [15.2, 15.8, 1.2],
      [9.6, 21.6, 1.05],
      [14.4, 21.0, 1.05],
      [12.0, 11.8, 0.85],
      [16.0, 25.4, 1.0],
      [7.6, 17.6, 0.95],
    ]
    c.fillStyle = p.spots
    for (const [dx, dy, dr] of dots) {
      c.beginPath()
      c.arc(x(dx), y(dy), dr * k, 0, Math.PI * 2)
      c.fill()
    }
  }
  /* Радужные/неоновые пальцы — перекрашиваем все 4, «бобышки» вернутся ниже */
  if (p.fingers) {
    const toes: Array<[number, number, number, string]> = [
      [5.7, 11.0, 1.7, p.fingers[0]],
      [5.5, 9.3, 1.5, p.fingers[0]],
      [9.4, 8.8, 1.8, p.fingers[1]],
      [9.3, 6.9, 1.6, p.fingers[1]],
      [13.5, 8.4, 1.85, p.fingers[2]],
      [13.7, 6.3, 1.7, p.fingers[2]],
      [17.6, 10.1, 1.7, p.fingers[3]],
      [18.1, 8.5, 1.5, p.fingers[3]],
    ]
    for (const [tx, ty, tr, col] of toes) {
      c.fillStyle = col
      c.beginPath()
      c.arc(x(tx), y(ty), tr * k, 0, Math.PI * 2)
      c.fill()
    }
  }

  /* Подушечка-сердечко: ОДИН непрерывный градиент на весь профиль —
     заливка общей фигуры без колец на стыках мочек */
  const padPath = new Path2D()
  for (const [px, py, pr] of [
    [10.1, 15.4, 1.65],
    [13.9, 15.4, 1.65],
    [12.0, 17.2, 3.0],
  ] as Array<[number, number, number]>) {
    padPath.moveTo(x(px + pr), y(py))
    padPath.arc(x(px), y(py), pr * k, 0, Math.PI * 2)
  }
  const padGrad = c.createRadialGradient(x(10.8), y(15.2), 0.3 * k, x(12.0), y(17.0), 3.8 * k)
  padGrad.addColorStop(0, '#FFFFFF' + '70')
  padGrad.addColorStop(0.3, p.pad)
  padGrad.addColorStop(0.7, p.pad + 'B4')
  padGrad.addColorStop(1, p.furShade + '00')
  c.fillStyle = padGrad
  c.fill(padPath)
  softSpot(c, x(12.3), y(19.9), 2.4 * k, p.furShade + '4C')

  /* «Бобышки»: 4 объёмные капли в середине пальцев — светлый верх,
     розоватый низ (как у живой кошки), микро-тень под каждой */
  const beans: Array<[number, number, number]> = [
    [5.7, 10.0, 0.72],
    [9.3, 7.6, 0.75],
    [13.7, 7.1, 0.78],
    [18.0, 9.2, 0.72],
  ]
  for (const [bx, by, br] of beans) {
    softSpot(c, x(bx), y(by + 0.15), br * 1.3 * k, p.furShade + '44')
    const beanGrad = c.createRadialGradient(
      x(bx - 0.18),
      y(by - 0.22),
      0.04 * k,
      x(bx),
      y(by),
      br * 1.2 * k,
    )
    beanGrad.addColorStop(0, '#FFFFFF' + 'E6')
    beanGrad.addColorStop(0.3, '#FFFFFF' + '5E')
    beanGrad.addColorStop(0.52, p.beans)
    beanGrad.addColorStop(0.85, p.beans + '8C')
    beanGrad.addColorStop(1, p.pad + '00')
    c.fillStyle = beanGrad
    c.beginPath()
    c.arc(x(bx), y(by), br * 1.08 * k, 0, Math.PI * 2)
    c.fill()
  }

  /* Коготки: серповидные, корень уходит под кончик пальца,
     изгиб наружу — когти куницы, приготовившейся к прыжку */
  const clawDefs: Array<{ tip: [number, number, number]; to: [number, number]; bend: number }> = [
    { tip: [5.5, 9.3, 1.5], to: [4.5, 6.3], bend: -0.34 },
    { tip: [9.3, 6.9, 1.6], to: [8.85, 3.85], bend: -0.12 },
    { tip: [13.7, 6.3, 1.7], to: [13.85, 3.3], bend: 0.12 },
    { tip: [18.1, 8.5, 1.5], to: [19.3, 5.8], bend: 0.34 },
  ]
  for (const { tip, to, bend } of clawDefs) {
    const [tx2, ty2, tr2] = tip
    const dx2 = to[0] - tx2
    const dy2 = to[1] - ty2
    const L2 = Math.hypot(dx2, dy2) || 1
    const ux2 = dx2 / L2
    const uy2 = dy2 / L2
    const rx2 = tx2 + ux2 * tr2 * 0.62
    const ry2 = ty2 + uy2 * tr2 * 0.62
    sickle(rx2, ry2, to[0], to[1], 0.52, bend, p.claw)
    /* корень чуть темнее — коготь выходит из-под меха */
    softSpot(c, x(rx2), y(ry2), 0.8 * k, p.edge + '66')
    /* блик у острия */
    softSpot(c, x(to[0] - ux2 * 0.4), y(to[1] - uy2 * 0.4), 0.5 * k, '#FFF6EC' + 'D2')
  }
  c.restore()

  /* Пухлые клочья поверх контура: рвут силуэт — живой мех, не «тапок» */
  const TUFTS: Array<[number, number, number]> = [
    /* запястье: бока и низ */
    [7.3, 22.8, -2.1],
    [6.3, 24.9, -2.85],
    [6.7, 27.1, 3.05],
    [8.4, 29.1, 2.45],
    [16.9, 23.0, -1.05],
    [17.9, 25.2, -0.2],
    [17.4, 27.5, 0.45],
    [15.7, 29.3, 1.05],
    /* пясть: бока */
    [6.9, 16.4, -2.5],
    [6.3, 18.6, -3.05],
    [17.3, 16.6, -0.6],
    [17.9, 18.9, 0.05],
    /* перепонки и макушка пястья между пальцами */
    [7.5, 12.3, -1.9],
    [11.1, 11.2, -1.62],
    [15.1, 12.5, -1.3],
    [9.0, 10.4, -1.8],
    [13.1, 10.0, -1.48],
    [16.4, 11.3, -1.1],
  ]
  for (const [tux, tuy, tua] of TUFTS) {
    const ang = tua + (rnd() - 0.5) * 0.3
    const tone = rnd() < 0.62 ? p.fur : rnd() < 0.55 ? light + 'D8' : p.furShade + 'D0'
    hair(tux, tuy, ang, 1.1 + rnd() * 0.9, 0.2 + rnd() * 0.1, tone, (rnd() - 0.5) * 0.5)
    hair(tux, tuy, ang + (rnd() - 0.5) * 0.5, 0.7 + rnd() * 0.5, 0.14, p.fur + 'F0', (rnd() - 0.5) * 0.4)
  }
  /* Внутренняя линия контура уже наложена в начале (кольцо без швов) */

  /* Волшебный колпак: гладкий конус с кантом и бликом — сидит на среднем пальце */
  if (p.hat) {
    const hatMain = '#8AA0D8'
    const hatDark = '#66739F'
    c.save()
    c.strokeStyle = '#4A5578'
    c.lineWidth = 0.5 * k
    c.lineJoin = 'round'
    c.fillStyle = hatDark
    c.beginPath()
    c.ellipse(x(13.2), y(4.9), x(4.6), y(0.95), 0, 0, Math.PI * 2)
    c.fill()
    c.stroke()
    const grad = c.createLinearGradient(x(9), 0, x(17), 0)
    grad.addColorStop(0, hatMain)
    grad.addColorStop(0.55, hatMain)
    grad.addColorStop(1, hatDark)
    c.fillStyle = grad
    c.beginPath()
    c.moveTo(x(13.2), y(0.4))
    c.bezierCurveTo(x(12.2), y(1.4), x(10.9), y(2.4), x(9.3), y(4.0))
    c.lineTo(x(17.0), y(4.0))
    c.bezierCurveTo(x(15.5), y(2.4), x(14.2), y(1.4), x(13.2), y(0.4))
    c.closePath()
    c.fill()
    c.stroke()
    softSpot(c, x(12.4), y(1.6), 0.9 * k, '#F2F6FF' + 'D0')
    c.restore()
  }

  return { canvas, w: 24, h: 30, smooth: true }
}

/* ================= v0.0.35: ПРИМЕРКА ЛАПКИ — 4 милых варианта =================
   Запрос игрока: «милая куничье-кошачья с коготками». Урок прошлой итерации:
   сотни шерстинок превращают лапку в «кашу» — теперь стиль строится на
   ЧИСТЫХ формах: единый пухлый силуэт, чёткий тонкий контур (метод
   «раздувания» — контур ложится идеально ровно, без швов между кружками),
   мягкие градиенты объёма, крупные блестящие бобышки, сердечко-подушечка
   и аккуратные серповидные коготки. Мех читается лёгкими штрихами
   и пухлыми клочьями по краю, а не «шубой» из волос.
   Палитры скинов, радужные пальцы, леопардовые пятна и волшебный
   колпак полностью поддерживаются. */

export const PAW_STYLE_COUNT = 4

/** Зона кремового «нагрудника»: ладонь+запястье (куница) или кончики пальцев */
type BellyZone = 'palm' | 'fingers' | null

interface CuteCfg {
  /** основной мех / свет (верх-лево) / тень (низ-право) */
  fur: string
  furHi: string
  furLo: string
  /** цвет нагрудника и его блик */
  belly: string
  bellyHi: string
  bellyZone: BellyZone
  /** подушечка-сердечко и бобышки */
  pad: string
  beans: string
  /** коготки: тело / острие */
  claw: string
  clawTip: string
  /** контур */
  edge: string
  /** толщина контура (лог. ед. раздувания) */
  edgeW: number
  /** пухлость пальцев и разлёт */
  toeR: number
  spread: number
  /** видимая длина коготка ЗА краем меха (коготь выглядывает из-под шерсти) */
  clawLen: number
  clawW: number
  /** перемычки шерсти между пальцами (гладкая лапка) */
  bridges: boolean
  /** клочья пуха на силуэте */
  tufts: number
  /** внутренних штрихов шерсти (0 — гладкая плюшевая) */
  strokes: number
}

const CUTE_CFGS: CuteCfg[] = [
  /* 1 «ПУХЛЯШКА» — плюшевый чиби: тёплый мёд, крупные розовые бобышки,
     крошечные кремовые коготки, толстенькие пальчики, чистый силуэт */
  {
    fur: '#B9824A',
    furHi: '#EDC28A',
    furLo: '#8E5A2C',
    belly: '#F4E0BC',
    bellyHi: '#FFF2D8',
    bellyZone: null,
    pad: '#F2A0A8',
    beans: '#F5A9B2',
    claw: '#F6E7CE',
    clawTip: '#DDBA8E',
    edge: '#3A2210',
    edgeW: 0.5,
    toeR: 1.06,
    spread: 0,
    clawLen: 1.7,
    clawW: 0.56,
    bridges: false,
    tufts: 0,
    strokes: 0,
  },
  /* 2 «КУНИЧКА» — настоящий окрас куницы: тёплая спинка и кремовый
     «нагрудник» на ладони, ловкие ivory-коготки, шустрые клочья по бокам */
  {
    fur: '#A56A33',
    furHi: '#DCA75F',
    furLo: '#7A4A20',
    belly: '#F4E5C6',
    bellyHi: '#FFF7E2',
    bellyZone: 'palm',
    pad: '#EFA292',
    beans: '#F4B0A0',
    claw: '#F5ECD8',
    clawTip: '#C9A96E',
    edge: '#33200E',
    edgeW: 0.44,
    toeR: 1.0,
    spread: 0.08,
    clawLen: 1.8,
    clawW: 0.58,
    bridges: true,
    tufts: 0,
    strokes: 10,
  },
  /* 3 «КОШЕЧКА» — мягкий персиковый пух: пушистый край, коготки выглядывают
     наполовину, крупное розовое сердечко-подушечка */
  {
    fur: '#DDB088',
    furHi: '#F7DCB4',
    furLo: '#A97448',
    belly: '#F6E8CC',
    bellyHi: '#FFF2DA',
    bellyZone: null,
    pad: '#F0A2AE',
    beans: '#F0A2AE',
    claw: '#F4E6D6',
    clawTip: '#D9AE94',
    edge: '#46301C',
    edgeW: 0.44,
    toeR: 1.0,
    spread: 0.18,
    clawLen: 1.5,
    clawW: 0.52,
    bridges: true,
    tufts: 0,
    strokes: 14,
  },
  /* 4 «ОХОТНИЦА» — лапка приготовилась к прыжку: пальцы растопырены,
     серповидные коготки полной длины, кремовые кончики, тёмный шатён */
  {
    fur: '#8C5A2E',
    furHi: '#C08A50',
    furLo: '#5E3A18',
    belly: '#EFE0C0',
    bellyHi: '#FFF6DE',
    bellyZone: 'fingers',
    pad: '#EF9E92',
    beans: '#F2B0A0',
    claw: '#F2E8D0',
    clawTip: '#B98B4C',
    edge: '#2E1B0C',
    edgeW: 0.44,
    toeR: 0.98,
    spread: 0.2,
    clawLen: 1.9,
    clawW: 0.64,
    bridges: true,
    tufts: 0,
    strokes: 8,
  },
]

/**
 * Лапка «кошка × куница» в одном из 4 стилей. Логические 24×30,
 * канва 192×240 (k=8) — при отрисовке в игре сжимается, контур остаётся чётким.
 * pal из магазина скинов перекрашивает мех/когти; пальцы, пятна и колпак — работают.
 */
export function makeCutePawSprite(style: number, pal: Partial<PawPalette> = {}): Sprite {
  const idx = ((style % PAW_STYLE_COUNT) + PAW_STYLE_COUNT) % PAW_STYLE_COUNT
  const base = CUTE_CFGS[idx]
  const cfg: CuteCfg = {
    ...base,
    fur: pal.fur ?? base.fur,
    furHi: pal.furLight ?? base.furHi,
    furLo: pal.furShade ?? base.furLo,
    belly: base.bellyZone === 'palm' ? (pal.furLight ?? base.belly) : base.belly,
    pad: pal.pad ?? base.pad,
    beans: pal.beans ?? base.beans,
    claw: pal.claw ?? base.claw,
    edge: pal.edge ?? base.edge,
  }
  const W = 192
  const H = 240
  const k = W / 24
  const canvas = mkCanvas(W, H)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!c) return { canvas, w: 24, h: 30, smooth: true }
  const X = (v: number): number => v * k

  /* Детерминированный «рандом» — одна и та же шубка при каждом рендере */
  let seed = 0x9e3779b9 ^ ((idx + 1) * 0x85ebca6b)
  const rnd = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  /* Закрытая «шерстинка/клочок»: изогнутый листик с острым кончиком */
  const hairPath = (
    hx: number,
    hy: number,
    ang: number,
    len: number,
    w: number,
    bend: number,
  ): Path2D => {
    const ex = hx + Math.cos(ang) * len
    const ey = hy + Math.sin(ang) * len
    const px = -Math.sin(ang)
    const py = Math.cos(ang)
    const cx = hx + Math.cos(ang) * len * 0.5 + px * bend
    const cy = hy + Math.sin(ang) * len * 0.5 + py * bend
    const p = new Path2D()
    p.moveTo(X(hx + px * w), X(hy + py * w))
    p.quadraticCurveTo(X(cx + px * w * 0.4), X(cy + py * w * 0.4), X(ex), X(ey))
    p.quadraticCurveTo(X(cx - px * w * 0.4), X(cy - py * w * 0.4), X(hx - px * w), X(hy - py * w))
    p.closePath()
    return p
  }

  const hair = (
    hx: number,
    hy: number,
    ang: number,
    len: number,
    w: number,
    color: string,
    bend: number,
  ): void => {
    c.fillStyle = color
    c.fill(hairPath(hx, hy, ang, len, w, bend))
  }

  /* РОВНЫЙ КОНТУР без швов: «раздувание» — фигура заливается контурным
     цветом в 12 направлениях, поверх идёт чистая заливка. Тонкое кольцо
     получается идеально равномерным по всей фигуре */
  const dilate = (
    g: CanvasRenderingContext2D,
    path: Path2D,
    d: number,
    color: string,
    dirs = 12,
  ): void => {
    g.fillStyle = color
    for (let i = 0; i < dirs; i++) {
      const a = (i * Math.PI * 2) / dirs
      g.save()
      g.translate(Math.cos(a) * d, Math.sin(a) * d)
      g.fill(path)
      g.restore()
    }
    g.fill(path)
  }

  /* ---------- Геометрия: запястье, пясть, 4 пухлых пальца ---------- */
  const s = cfg.spread
  const toes = [
    { cx: 5.9 - s * 0.9, cy: 11.4, r: 1.8 * cfg.toeR },
    { cx: 9.7 - s * 0.35, cy: 9.2, r: 2.0 * cfg.toeR },
    { cx: 14.3 + s * 0.35, cy: 9.2, r: 2.0 * cfg.toeR },
    { cx: 18.1 + s * 0.9, cy: 11.4, r: 1.8 * cfg.toeR },
  ]
  const SIL: Array<[number, number, number]> = [
    /* запястье: мягкая колонна с пухом по бокам */
    [12, 24.2, 2.5],
    [12, 26.6, 2.3],
    [12, 28.6, 2.0],
    [12, 29.7, 1.7],
    [9.2, 23.4, 0.95],
    [14.8, 23.4, 0.95],
    [8.6, 26.0, 0.75],
    [15.4, 26.0, 0.75],
    [9.9, 28.5, 0.65],
    [14.1, 28.5, 0.65],
    /* переход пясть→запястье: без пережатой «талии» */
    [12, 21.9, 2.55],
    [9.8, 21.0, 1.5],
    [14.2, 21.0, 1.5],
    /* пясть */
    [12, 16.4, 5.1],
    [8.9, 17.9, 2.2],
    [15.1, 17.9, 2.2],
    [9.3, 14.4, 2.4],
    [14.7, 14.4, 2.4],
  ]
  if (cfg.bridges) {
    SIL.push([7.7, 12.4, 1.1], [12, 11.4, 1.25], [16.3, 12.4, 1.1])
  }
  for (const t of toes) {
    /* пухлый пальчик: круг + чуть вытянутый верх (не «сосиска») */
    SIL.push([t.cx, t.cy, t.r], [t.cx, t.cy - 1.25, t.r * 0.9])
  }
  const sil = circlesPath(SIL, k)

  /* Жёсткая маска-союз кружков */
  const hard = mkCanvas(W, H)
  const hc = hard.getContext('2d') as CanvasRenderingContext2D | null
  if (!hc) return { canvas, w: 24, h: 30, smooth: true }
  hc.fillStyle = '#000'
  hc.fill(sil)

  /* ГЛАДКИЙ СИЛУЭТ «метаболлами»: blur смягчает стыки кружков в цельную
     фигуру, contrast возвращает резкий край; затем ЖЁСТКАЯ отсечка альфы —
     контур получается идеально чётким, без мягкого «ореола».
     Без поддержки filter остаётся обычный союз кружков */
  const blurPx = (0.5 * k).toFixed(1)
  const hasFilter = typeof c.filter === 'string'
  const blob = mkCanvas(W, H)
  const bc = blob.getContext('2d') as CanvasRenderingContext2D | null
  if (!bc) return { canvas, w: 24, h: 30, smooth: true }
  bc.save()
  if (hasFilter) bc.filter = `blur(${blurPx}px) contrast(24)`
  bc.drawImage(hard, 0, 0)
  bc.restore()
  if (hasFilter) {
    /* порог альфы: всё, что полупрозрачно — прочь. Канва маленькая,
       это делается один раз при создании спрайта */
    const img = bc.getImageData(0, 0, W, H)
    const dd = img.data
    for (let i = 3; i < dd.length; i += 4) dd[i] = dd[i] > 110 ? 255 : 0
    bc.putImageData(img, 0, 0)
  }
  c.drawImage(blob, 0, 0)

  /** Слой-копия силуэта, залитая цветом/градиентом (source-in) */
  const tinted = (fill: string | CanvasGradient): HTMLCanvasElement | OffscreenCanvas => {
    const t = mkCanvas(W, H)
    const tc = t.getContext('2d') as CanvasRenderingContext2D | null
    if (!tc) return t
    tc.drawImage(blob, 0, 0)
    tc.globalCompositeOperation = 'source-in'
    tc.fillStyle = fill
    tc.fillRect(0, 0, W, H)
    return t
  }

  /* Меховая база: свет падает сверху-слева (рисуется ПОСЛЕ контура) */
  const furGrad = c.createRadialGradient(X(9.8), X(11.8), 1.5 * k, X(12.2), X(17.5), 13 * k)
  furGrad.addColorStop(0, cfg.furHi)
  furGrad.addColorStop(0.48, cfg.fur)
  furGrad.addColorStop(1, cfg.furLo)

  /* ---------- Коготки: выглядывают ИЗ-ПОД верхнего края меха.
     Слой когтей (с контуром) стирается по гладкому силуэту — остаётся
     только выглядывающий кончик; контур ляжет ПОВЕРХ основания когтя,
     мех закроет корень — коготь аккуратно «выползает» из-под шёрстки ---------- */
  {
    const clCanvas = mkCanvas(W, H)
    const cc = clCanvas.getContext('2d') as CanvasRenderingContext2D | null
    if (cc) {
      const tilts = [-0.34, -0.12, 0.12, 0.34]
      toes.forEach((t, i) => {
        if (cfg.clawLen <= 0) return
        const tilt = tilts[i]
        const ux = Math.sin(tilt)
        const uy = -Math.cos(tilt)
        const px = -uy
        const py = ux
        const topY = t.cy - 1.25 - t.r * 0.9
        const B = { x: t.cx + ux * 0.3, y: topY + 0.75 }
        const L = 0.75 + cfg.clawLen
        const T = { x: B.x + ux * L, y: B.y + uy * L }
        const bend = tilt * 0.45
        const C = { x: B.x + ux * L * 0.5 + px * bend, y: B.y + uy * L * 0.5 + py * bend }
        const bw = cfg.clawW
        const clawP = new Path2D()
        clawP.moveTo(X(B.x + px * bw), X(B.y + py * bw))
        clawP.quadraticCurveTo(X(C.x + px * bw * 0.5), X(C.y + py * bw * 0.5), X(T.x), X(T.y))
        clawP.quadraticCurveTo(X(C.x - px * bw * 0.5), X(C.y - py * bw * 0.5), X(B.x - px * bw), X(B.y - py * bw))
        clawP.closePath()
        dilate(cc, clawP, 0.2 * k, cfg.edge, 8)
        const cg = cc.createLinearGradient(X(B.x), X(B.y), X(T.x), X(T.y))
        cg.addColorStop(0, cfg.claw)
        cg.addColorStop(0.75, cfg.claw)
        cg.addColorStop(1, cfg.clawTip)
        cc.fillStyle = cg
        cc.fill(clawP)
      })
      /* часть когтей ПОД мехом — прочь: остаются только выглядывающие кончики */
      cc.globalCompositeOperation = 'destination-out'
      if (hasFilter) cc.filter = `blur(${blurPx}px) contrast(24)`
      cc.drawImage(hard, 0, 0)
      cc.filter = 'none'
      cc.globalCompositeOperation = 'source-over'
      c.drawImage(clCanvas, 0, 0)
    }
  }

  /* ЧЁТКИЙ КОНТУР: 12 смещённых копий контурного слоя + центр —
     кольцо ложится идеально ровно по всей фигуре */
  const dOut = cfg.edgeW * k
  const edgeLayer = tinted(cfg.edge)
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12
    c.drawImage(edgeLayer, Math.cos(a) * dOut, Math.sin(a) * dOut)
  }
  c.drawImage(edgeLayer, 0, 0)

  /* Мех поверх контура: остаётся только тонкое ровное кольцо */
  c.drawImage(tinted(furGrad), 0, 0)

  /* ---------- Объём внутри силуэта ---------- */
  c.save()
  c.globalCompositeOperation = 'source-atop'

  /* Кремовый нагрудник куницы: мягкое пятно на ладони и запястье */
  if (cfg.bellyZone === 'palm') {
    const bellyList: Array<[number, number, number]> = [
      [12, 19.6, 3.9],
      [12, 22.4, 3.4],
      [12, 25.2, 2.8],
      [12, 27.8, 2.1],
      [9.6, 21.6, 1.7],
      [14.4, 21.6, 1.7],
      [10.1, 24.6, 1.5],
      [13.9, 24.6, 1.5],
    ]
    const lg = c.createLinearGradient(0, X(14.6), 0, X(17.6))
    lg.addColorStop(0, cfg.belly + '00')
    lg.addColorStop(0.6, cfg.belly + 'AC')
    lg.addColorStop(1, cfg.belly)
    c.fillStyle = lg
    c.fill(circlesPath(bellyList, k))
    softSpot(c, X(12), X(23.8), 5 * k, cfg.bellyHi + 'A0')
  }

  /* Кремовые кончики пальцев охотницы */
  if (cfg.bellyZone === 'fingers') {
    for (const t of toes) {
      const tip = { x: t.cx, y: t.cy - 1.25, r: t.r * 0.9 }
      c.fillStyle = cfg.belly
      c.beginPath()
      c.arc(X(tip.x), X(tip.y), tip.r * 0.78 * k, 0, Math.PI * 2)
      c.fill()
      softSpot(c, X(tip.x), X(tip.y), tip.r * 1.1 * k, cfg.furLo + '3C')
    }
  }

  /* Радужные/неоновые пальцы скина */
  if (pal.fingers) {
    toes.forEach((t, i) => {
      const col = pal.fingers![i % 4]
      c.fillStyle = col
      c.beginPath()
      c.arc(X(t.cx), X(t.cy), t.r * 0.95 * k, 0, Math.PI * 2)
      c.fill()
      c.beginPath()
      c.arc(X(t.cx), X(t.cy - 1.25), t.r * 0.9 * 0.9 * k, 0, Math.PI * 2)
      c.fill()
    })
  }

  /* Леопардовые пятна скина */
  if (pal.spots) {
    const dots: Array<[number, number, number]> = [
      [8.6, 13.0, 1.05],
      [15.2, 15.8, 1.1],
      [9.6, 21.6, 1.0],
      [14.4, 21.0, 1.0],
      [12.0, 12.6, 0.8],
      [16.0, 25.4, 0.95],
      [7.6, 17.6, 0.9],
    ]
    c.globalAlpha = 0.85
    c.fillStyle = pal.spots
    for (const [dx, dy, dr] of dots) {
      c.beginPath()
      c.arc(X(dx), X(dy), dr * k, 0, Math.PI * 2)
      c.fill()
    }
    c.globalAlpha = 1
  }

  /* Щёлочки между пальцами: отдельные пальчики читаются лучше */
  {
    const ca = cfg.bridges ? '40' : '58'
    softSpot(c, X(7.8), X(11.9), 0.8 * k, cfg.furLo + ca)
    softSpot(c, X(12), X(10.9), 0.8 * k, cfg.furLo + ca)
    softSpot(c, X(16.2), X(11.9), 0.8 * k, cfg.furLo + ca)
  }

  /* Тень веса справа-снизу + контровой свет слева-сверху */
  softSpot(c, X(15.6), X(19.6), 6 * k, cfg.furLo + '54')
  softSpot(c, X(13.8), X(26.4), 5 * k, cfg.furLo + '4C')
  softSpot(c, X(7.9), X(10.8), 2.8 * k, cfg.furHi + '8C')
  softSpot(c, X(6.7), X(15.8), 2.4 * k, cfg.furHi + '78')
  for (const t of toes) {
    softSpot(c, X(t.cx - 0.3), X(t.cy - 1.0), t.r * 0.62 * k, cfg.furHi + '8C')
  }

  /* Лёгкие штрихи шерсти: направление роста — от запястья к пальцам */
  if (cfg.strokes > 0) {
    const UP = -Math.PI / 2
    const marks: Array<[number, number]> = [
      [8.2, 13.2],
      [10.6, 12.4],
      [13.3, 12.2],
      [15.8, 13.3],
      [7.4, 16.4],
      [16.6, 16.5],
      [8.0, 20.2],
      [16.0, 20.3],
      [9.8, 23.4],
      [14.2, 23.6],
      [10.4, 26.0],
      [13.6, 26.2],
      [6.6, 15.0],
      [17.4, 15.2],
      [12.0, 14.6],
      [12.0, 22.6],
    ]
    for (let i = 0; i < Math.min(cfg.strokes, marks.length); i++) {
      const [hx, hy] = marks[i]
      const tone = hx < 12 ? cfg.furHi + 'A6' : cfg.furLo + '96'
      hair(hx, hy, UP + (hx - 12) * 0.1 + (rnd() - 0.5) * 0.4, 0.7 + rnd() * 0.5, 0.15, tone, (rnd() - 0.5) * 0.5)
    }
  }

  /* ---------- Бобышки: розовые капли с мягким бликом (в центре пальчика) ---------- */
  toes.forEach((t, i) => {
    const bx = t.cx
    const by = t.cy - 0.2
    const br = t.r * 0.46 + (i === 1 || i === 2 ? 0.05 : 0)
    softSpot(c, X(bx), X(by + 0.24), br * 1.55 * k, cfg.furLo + '48')
    c.globalAlpha = 0.3
    c.fillStyle = cfg.edge
    c.beginPath()
    c.arc(X(bx), X(by), br * 1.14 * k, 0, Math.PI * 2)
    c.fill()
    c.globalAlpha = 1
    const bg = c.createRadialGradient(X(bx - 0.18), X(by - 0.26), 0.04 * k, X(bx), X(by), br * 1.16 * k)
    bg.addColorStop(0, '#FFFFFFD9')
    bg.addColorStop(0.3, '#FFFFFF5E')
    bg.addColorStop(0.6, cfg.beans)
    bg.addColorStop(0.9, cfg.beans + 'A6')
    bg.addColorStop(1, cfg.beans + '00')
    c.fillStyle = bg
    c.beginPath()
    c.arc(X(bx), X(by), br * 1.08 * k, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#FFFFFF8C'
    c.beginPath()
    c.arc(X(bx - 0.2), X(by - 0.28), 0.18 * k, 0, Math.PI * 2)
    c.fill()
  })

  /* ---------- Подушечка-сердечко (компактная — не занимает всю пясть) ---------- */
  const padPath = new Path2D()
  for (const [qx, qy, qr] of [
    [10.6, 15.4, 1.25],
    [13.4, 15.4, 1.25],
    [12.0, 17.1, 2.2],
  ] as Array<[number, number, number]>) {
    padPath.moveTo(X(qx + qr), X(qy))
    padPath.arc(X(qx), X(qy), qr * k, 0, Math.PI * 2)
  }
  c.globalAlpha = 0.45
  dilate(c, padPath, 0.2 * k, cfg.edge)
  c.globalAlpha = 1
  const padGrad = c.createRadialGradient(X(11.1), X(15.4), 0.25 * k, X(12.0), X(16.9), 2.5 * k)
  padGrad.addColorStop(0, '#FFFFFF8C')
  padGrad.addColorStop(0.4, cfg.pad)
  padGrad.addColorStop(0.82, cfg.pad + 'C0')
  padGrad.addColorStop(1, cfg.pad + '00')
  c.fillStyle = padGrad
  c.fill(padPath)
  softSpot(c, X(12.2), X(19.6), 1.8 * k, cfg.furLo + '40')

  c.restore()

  /* ---------- Волшебный колпак скина ---------- */
  if (pal.hat) {
    const hatMain = '#8AA0D8'
    const hatDark = '#66739F'
    c.save()
    c.strokeStyle = '#4A5578'
    c.lineWidth = 0.5 * k
    c.lineJoin = 'round'
    c.fillStyle = hatDark
    c.beginPath()
    c.ellipse(X(13.4), X(5.0), X(4.6), X(0.95), 0, 0, Math.PI * 2)
    c.fill()
    c.stroke()
    const grad = c.createLinearGradient(X(9), 0, X(17), 0)
    grad.addColorStop(0, hatMain)
    grad.addColorStop(0.55, hatMain)
    grad.addColorStop(1, hatDark)
    c.fillStyle = grad
    c.beginPath()
    c.moveTo(X(13.4), X(0.4))
    c.bezierCurveTo(X(12.4), X(1.4), X(11.1), X(2.4), X(9.5), X(4.1))
    c.lineTo(X(17.2), X(4.1))
    c.bezierCurveTo(X(15.7), X(2.4), X(14.4), X(1.4), X(13.4), X(0.4))
    c.closePath()
    c.fill()
    c.stroke()
    softSpot(c, X(12.6), X(1.6), 0.9 * k, '#F2F6FFD0')
    c.restore()
  }

  return { canvas, w: 24, h: 30, smooth: true }
}

/* ---------- Зерно-мина: красно-белая ЗВЕЗДА с чёрным контуром.
   4 варианта отрисовки (переключаются через ?mine=1..4):
   0 «Вспышка» — 9-конечная, красный градиент + белое ядро,
   1 «Уголёк» — 8-конечная, раскалённое белое сердце,
   2 «Морская» — гладкая сфера с шипами (классика),
   3 «Злюка» — 9-конечная с мордочкой (наследие старой мины).
   Дальтоник: сине-белая палитра с тёмно-синим контуром. ---------- */

export const MINE_VARIANTS = 4

interface MinePal {
  body1: string
  body2: string
  body3: string
  core: string
  edge: string
}

const MINE_NORMAL: MinePal = {
  body1: '#FF6A5A',
  body2: '#E5342E',
  body3: '#9E1512',
  core: '#FFF6EC',
  edge: '#120303',
}

const MINE_CB: MinePal = {
  body1: '#6FA0FF',
  body2: '#3D7BFF',
  body3: '#274F99',
  core: '#FFFFFF',
  edge: '#0A1540',
}

/** Звезда: points вершин, внешний/внутренний радиус, поворот (рад) */
function starPath(
  c: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points: number,
  rot: number,
): void {
  c.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = rot + (i * Math.PI) / points
    const px = cx + Math.cos(a) * r
    const py = cy + Math.sin(a) * r
    if (i === 0) c.moveTo(px, py)
    else c.lineTo(px, py)
  }
  c.closePath()
}

export function makeMineSprite(kind: number, colorblind = false): Sprite {
  const S = 96
  const k = S / 14
  const canvas = mkCanvas(S, S)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!c) return { canvas, w: 14, h: 14, smooth: true }
  const pal = colorblind ? MINE_CB : MINE_NORMAL
  const cx = 7 * k
  const cy = 7 * k
  const kindIdx = ((kind % MINE_VARIANTS) + MINE_VARIANTS) % MINE_VARIANTS

  const bodyGrad = (r: number): CanvasGradient => {
    const g = c.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.15, cx, cy, r)
    g.addColorStop(0, pal.body1)
    g.addColorStop(0.55, pal.body2)
    g.addColorStop(1, pal.body3)
    return g
  }
  /* Мягкое светящееся гало за звездой — «маленькая, но яркая» */
  softSpot(c, cx, cy, 6.9 * k, (colorblind ? '#7FB2FF' : '#FF5A4E') + '3C')

  if (kindIdx === 2) {
    /* Морская мина: 8 шипов-конусов + гладкая сфера */
    c.fillStyle = pal.body3
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8
      const tx = cx + Math.cos(a) * 6.7 * k
      const ty = cy + Math.sin(a) * 6.7 * k
      const b1a = a - 0.26
      const b1b = a + 0.26
      c.beginPath()
      c.moveTo(cx + Math.cos(b1a) * 3.7 * k, cy + Math.sin(b1a) * 3.7 * k)
      c.lineTo(tx, ty)
      c.lineTo(cx + Math.cos(b1b) * 3.7 * k, cy + Math.sin(b1b) * 3.7 * k)
      c.closePath()
      c.fill()
      c.save()
      c.strokeStyle = pal.edge
      c.lineWidth = 0.5 * k
      c.stroke()
      c.restore()
    }
    c.fillStyle = pal.edge
    c.beginPath()
    c.arc(cx, cy, 4.95 * k, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = bodyGrad(4.6 * k)
    c.beginPath()
    c.arc(cx, cy, 4.6 * k, 0, Math.PI * 2)
    c.fill()
    softSpot(c, cx - 1.7 * k, cy - 1.8 * k, 1.9 * k, '#FFFFFF' + 'E8')
    softSpot(c, cx + 1.9 * k, cy + 2 * k, 1.7 * k, pal.body3 + 'B0')
  } else {
    const points = kindIdx === 1 ? 8 : 9
    const inner = kindIdx === 1 ? 3.7 : 3.05
    const outer = 6.55
    const rot = -Math.PI / 2 + (kindIdx === 1 ? Math.PI / 8 : 0)
    /* Тёмная подложка чуть шире — читаемый чёрный контур */
    starPath(c, cx, cy, (outer + 0.62) * k, (inner + 0.5) * k, points, rot)
    c.fillStyle = pal.edge
    c.fill()
    starPath(c, cx, cy, outer * k, inner * k, points, rot)
    c.fillStyle = bodyGrad(outer * k)
    c.fill()
    /* Раскалённое ядро: белое сердце звезды */
    const coreR = kindIdx === 1 ? 2.9 : 2.5
    const cg = c.createRadialGradient(cx, cy, 0, cx, cy, coreR * k)
    cg.addColorStop(0, '#FFFFFF')
    cg.addColorStop(0.5, pal.core)
    cg.addColorStop(1, pal.core + '00')
    c.fillStyle = cg
    c.beginPath()
    c.arc(cx, cy, coreR * k, 0, Math.PI * 2)
    c.fill()
    if (kindIdx === 3) {
      /* Злюка: мордочка на белом ядре — косые глаза, оскал */
      const ink = '#1A0505'
      c.fillStyle = ink
      for (const ex of [-1.15, 1.15]) {
        c.beginPath()
        c.arc(cx + ex * k, cy + 0.1 * k, 0.62 * k, 0, Math.PI * 2)
        c.fill()
      }
      c.fillStyle = pal.core
      c.beginPath()
      c.arc(cx - 1.28 * k, cy + 0.22 * k, 0.18 * k, 0, Math.PI * 2)
      c.arc(cx + 1.02 * k, cy + 0.22 * k, 0.18 * k, 0, Math.PI * 2)
      c.fill()
      c.strokeStyle = ink
      c.lineWidth = 0.42 * k
      c.lineCap = 'round'
      c.beginPath()
      c.moveTo(cx - 1.8 * k, cy - 1.1 * k)
      c.lineTo(cx - 0.5 * k, cy - 0.55 * k)
      c.moveTo(cx + 1.8 * k, cy - 1.1 * k)
      c.lineTo(cx + 0.5 * k, cy - 0.55 * k)
      c.stroke()
      c.beginPath()
      c.arc(cx, cy + 0.7 * k, 1.25 * k, Math.PI * 0.15, Math.PI * 0.85)
      c.stroke()
    }
  }

  /* Яркие искорки: крохотные белые звёздочки-точки по краям */
  c.fillStyle = '#FFFFFF'
  for (const [gx, gy, gr] of [
    [10.6, 3.6, 0.55],
    [3.4, 9.6, 0.4],
    [11.2, 9.8, 0.3],
  ]) {
    c.beginPath()
    c.arc(gx * k, gy * k, gr * k, 0, Math.PI * 2)
    c.fill()
  }
  return { canvas, w: 14, h: 14, smooth: true }
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
  ctx.imageSmoothingEnabled = s.smooth === true
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
