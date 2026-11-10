'use client'

/**
 * MartenScene — «живая куница» для главного меню
 * «Кошачьего попкорнного Беспредела».
 *
 * Полностью процедурная canvas-сцена без внешних зависимостей (импортируется
 * только react; аудио и i18n не используются):
 *  - уютная комната: тёплая стена (градиент), деревянный пол с досками, плинтус;
 *  - декор комнаты богатеет вместе со стадией роста stage 0..6;
 *  - куница — конечный автомат состояний idle / walk / bat / happy:
 *    ходьба с лапами в противофазе, удары лапой по зерну, двойной подскок
 *    с сердечками, моргание, пышный хвост с бегущей синусоидой;
 *  - 3 зерна попкорна с физикой: гравитация, отскоки с затуханием, вращение,
 *    переспавн за краем экрана;
 *  - тап по кунице → happy + сердечки, тап по полу → куница идёт к точке.
 *
 * Один rAF-цикл, dt капается до 50 мс, пауза рендера при document.hidden,
 * DPR-масштабирование (кап 2) через ResizeObserver, полная очистка в cleanup.
 */

import { useEffect, useRef } from 'react'

/* ────────────────────────────── Типы ────────────────────────────── */

type MartenState = 'idle' | 'walk' | 'bat' | 'happy'
type ChaseMode = 'kernel' | 'point'
type ParticleKind = 'heart' | 'confetti'
type GarlandMode = 'flags' | 'paws' | 'gold'

interface Marten {
  x: number // позиция лап на полу (CSS px)
  dir: 1 | -1 // направление взгляда
  state: MartenState
  timer: number // таймер idle до нового решения
  targetX: number // цель ходьбы
  chaseMode: ChaseMode // к зерну или к точке тапа
  chaseIdx: number // индекс зерна-цели
  walkPhase: number // фаза шага (лапы в противофазе)
  tailPhase: number // фаза бегущей волны хвоста
  blinkTimer: number // отсчёт до следующего моргания
  blinkT: number // <0 — не моргает, иначе прогресс моргания
  blink: number // 0..1 открытость глаза
  batT: number // таймер удара лапой
  struck: boolean // импульс зерну уже применён
  strikeIdx: number // индекс зерна-цели удара
  happyT: number // таймер радости
}

interface Kernel {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vrot: number
  seed: number // индивидуальная форма и дрейф
}

interface Particle {
  kind: ParticleKind
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  phase: number // индивидуальная фаза покачивания
  rot: number
  vrot: number
  color: string
}

interface MartenSceneProps {
  /** Стадия роста куницы 0..6 — управляет размером зверя и декором комнаты */
  stage: number
  /** Куница ушла в путешествие — в комнате только зёрна и декор */
  away?: boolean
  className?: string
  /** a11y подпись canvas */
  ariaLabel?: string
}

/* ──────────────────────────── Утилиты ──────────────────────────── */

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))
const rand = (min: number, max: number): number => min + Math.random() * (max - min)
const dirOf = (dx: number): 1 | -1 => (dx >= 0 ? 1 : -1)

/** Детерминированный псевдорандом — статичный декор не мерцает между кадрами */
const prand = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Безопасный выбор цвета из палитры по индексу */
const pickColor = (arr: string[], i: number): string => arr[i % arr.length] ?? '#FFD166'

/* ── геометрия куницы по стадии роста ── */

const stageNorm = (stage: number): number => clamp(stage, 0, 6) / 6
/** масштаб зверя: 0.55 (котёнок) … 1.15 (взрослая куница) */
const martenScale = (stage: number): number => 0.55 + 0.1 * clamp(stage, 0, 6)
/** длина корпуса в локальных единицах (растёт со стадией) */
const bodyLenOf = (stage: number): number => 88 + 34 * stageNorm(stage)

/* ── палитры и мелкие константы ── */

const GARLAND_COLORS: string[] = ['#E24B3B', '#F2A24B', '#FFD166', '#7FB069']
const CONFETTI_COLORS: string[] = ['#FFD166', '#F2A24B', '#E24B3B', '#7FB069', '#FFE066']

/** Лепестки пухлого зерна попкорна: [offsetX, offsetY, радиус] */
const KERNEL_LOBES: Array<[number, number, number]> = [
  [-4.6, 0.6, 5.6],
  [4.6, 0.6, 5.6],
  [0, -4, 6],
  [0, 0.6, 4.8],
]

/** Усы: [наклон рад, длина как доля headR] */
const WHISKERS: Array<[number, number]> = [
  [-0.3, 0.85],
  [0.05, 1],
  [0.42, 0.8],
]

/* ─────────────────────────── Компонент ─────────────────────────── */

export default function MartenScene({ stage, away = false, className, ariaLabel }: MartenSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef(stage)
  const awayRef = useRef(away)

  // стадия и «отъезд» меняются без перезапуска анимационного эффекта
  useEffect(() => {
    stageRef.current = stage
  }, [stage])
  useEffect(() => {
    awayRef.current = away
  }, [away])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /* ────────────── Размеры / DPR / общее состояние ────────────── */

    let w = 1
    let h = 1
    let dpr = 1
    let inited = false
    let rafId = 0
    let lastTime = performance.now()
    let visible = !document.hidden
    let time = 0

    const floorY = (): number => h * 0.64 // граница стены и пола
    const gy = (): number => floorY() + (h - floorY()) * 0.42 // уровень пола под лапами

    /* ────────────── Состояние сцены ────────────── */

    const marten: Marten = {
      x: 160,
      dir: 1,
      state: 'idle',
      timer: 2.2,
      targetX: 160,
      chaseMode: 'point',
      chaseIdx: 0,
      walkPhase: 0,
      tailPhase: 0,
      blinkTimer: 2.4,
      blinkT: -1,
      blink: 1,
      batT: 0,
      struck: false,
      strikeIdx: -1,
      happyT: 0,
    }

    const kernels: Kernel[] = [0, 1, 2].map((i: number) => ({
      x: 120 + i * 60,
      y: 60,
      vx: 0,
      vy: 0,
      rot: prand(i * 3.7) * Math.PI,
      vrot: 0,
      seed: Math.floor(prand(i * 9.1) * 1000),
    }))

    const particles: Particle[] = []
    let confettiTimer = 1

    /** Допустимые границы ходьбы с учётом хвоста и морды */
    const walkBounds = (): [number, number] => {
      const s = martenScale(stageRef.current)
      const bl = bodyLenOf(stageRef.current)
      const minX = (0.9 * bl + 6) * s
      const maxX = w - (0.86 * bl + 6) * s
      if (maxX <= minX + 8) return [w / 2 - 5, w / 2 + 5] // очень узкий канвас
      return [minX, maxX]
    }

    /* ────────────── Resize / DPR-буфер ────────────── */

    const resize = (): void => {
      const rect = canvas.getBoundingClientRect()
      const nw = Math.max(1, Math.round(rect.width))
      const nh = Math.max(1, Math.round(rect.height))
      const ndpr = Math.min(window.devicePixelRatio || 1, 2) // кап DPR = 2
      if (nw === w && nh === h && ndpr === dpr) return
      w = nw
      h = nh
      dpr = ndpr
      canvas.width = Math.round(w * dpr) // перенастройка буфера
      canvas.height = Math.round(h * dpr)
      if (inited) {
        const [b0, b1] = walkBounds()
        marten.x = clamp(marten.x, b0, b1)
        for (const k of kernels) k.x = clamp(k.x, 8, Math.max(9, w - 8))
      }
    }

    /* ────────────── Взаимодействие (тап) ────────────── */

    /** Сердечки при радости: 4–6 частиц вверх с затуханием */
    const spawnHearts = (): void => {
      const s = martenScale(stageRef.current)
      const baseY = gy() - 34 * s
      const count = 4 + Math.floor(Math.random() * 3) // 4–6
      for (let i = 0; i < count && particles.length < 90; i++) {
        const life = rand(0.9, 1.5)
        particles.push({
          kind: 'heart',
          x: marten.x + rand(-16, 16),
          y: baseY + rand(-10, 6),
          vx: rand(-16, 16),
          vy: -rand(42, 80),
          life,
          maxLife: life,
          size: rand(5, 9),
          phase: rand(0, Math.PI * 2),
          rot: 0,
          vrot: 0,
          color: '#E24B3B',
        })
      }
    }

    const handleTap = (px: number, py: number): void => {
      if (awayRef.current) return // куница в походе — тапы ни к чему
      const st = stageRef.current
      const s = martenScale(st)
      const bl = bodyLenOf(st) * s
      // щедрый эллипс попадания вокруг куницы
      const rx = bl * 0.62 + 10
      const ry = 42 * s + 12
      const nx = (px - marten.x) / rx
      const ny = (py - (gy() - 32 * s)) / ry
      if (nx * nx + ny * ny <= 1) {
        // тап по кунице → радость (двойной подскок + сердечки)
        marten.state = 'happy'
        marten.happyT = 0
        spawnHearts()
      } else {
        // тап по комнате → идём к точке тапа
        const [b0, b1] = walkBounds()
        marten.state = 'walk'
        marten.chaseMode = 'point'
        marten.targetX = clamp(px, b0, b1)
        marten.struck = false
      }
    }

    /* ────────────── Конечный автомат куницы ────────────── */

    const nearestKernelIdx = (): number => {
      let best = 0
      let bestD = Infinity
      for (let i = 0; i < kernels.length; i++) {
        const d = Math.abs(kernels[i].x - marten.x)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      return best
    }

    const startBat = (idx: number): void => {
      marten.state = 'bat'
      marten.batT = 0
      marten.struck = false
      marten.strikeIdx = idx
      marten.dir = dirOf(kernels[idx].x - marten.x)
    }

    /** Импульс зерну от удара лапой: отлёт от куницы с вращением */
    const strikeKernel = (): void => {
      const k = kernels[marten.strikeIdx]
      if (!k) return
      const dir = dirOf(k.x - marten.x)
      k.vx = dir * rand(100, 170)
      k.vy = -rand(120, 210)
      k.vrot = dir * rand(5, 11)
    }

    const updateMarten = (dt: number): void => {
      const st = stageRef.current
      const s = martenScale(st)
      const bl = bodyLenOf(st) * s
      const speed = 92 * s // крупная куница ходит бодрее
      const reach = bl * 0.58 // дистанция удара лапой

      // хвост шевелится и глаз моргает во всех состояниях
      marten.tailPhase += dt * (marten.state === 'walk' ? 8 : 5)
      if (marten.blinkT >= 0) {
        marten.blinkT += dt
        if (marten.blinkT >= 0.24) {
          marten.blinkT = -1
          marten.blinkTimer = rand(2.2, 6)
        }
      } else {
        marten.blinkTimer -= dt
        if (marten.blinkTimer <= 0) marten.blinkT = 0
      }
      marten.blink = marten.blinkT >= 0 ? 1 - Math.sin(clamp(marten.blinkT / 0.24, 0, 1) * Math.PI) : 1

      const [minX, maxX] = walkBounds()

      switch (marten.state) {
        case 'idle': {
          // сидит: дышит, виляет хвостом, моргает; через ≈2.5–5.5 c решает новое действие
          marten.timer -= dt
          if (marten.timer <= 0) {
            const idx = nearestKernelIdx()
            const k = kernels[idx]
            if (Math.abs(k.x - marten.x) <= reach) {
              startBat(idx) // зерно под носом — бить сразу
            } else {
              marten.state = 'walk'
              marten.chaseMode = 'kernel'
              marten.chaseIdx = idx
              marten.struck = false
            }
          }
          break
        }
        case 'walk': {
          if (marten.chaseMode === 'kernel') {
            // догоняем выбранное зерно (оно могло сдвинуться)
            const k = kernels[marten.chaseIdx]
            marten.targetX = k.x
            if (Math.abs(k.x - marten.x) <= reach) {
              startBat(marten.chaseIdx)
              break
            }
          }
          const dx = marten.targetX - marten.x
          const arrived =
            Math.abs(dx) < 8 ||
            (marten.x <= minX + 0.5 && dx < 0) ||
            (marten.x >= maxX - 0.5 && dx > 0)
          if (arrived) {
            // дошли: если рядом зерно — бьём, иначе отдыхаем
            const idx = nearestKernelIdx()
            const k = kernels[idx]
            if (Math.abs(k.x - marten.x) <= reach) {
              startBat(idx)
            } else {
              marten.state = 'idle'
              marten.timer = rand(2.5, 5.5)
            }
            break
          }
          marten.dir = dirOf(dx)
          marten.x = clamp(marten.x + marten.dir * speed * dt, minX, maxX)
          marten.walkPhase += dt * 10.5
          break
        }
        case 'bat': {
          // подскок и взмах: на пике взмаха зерно получает импульс
          marten.batT += dt
          if (!marten.struck && marten.batT >= 0.32) {
            marten.struck = true
            strikeKernel()
          }
          if (marten.batT >= 0.64) {
            marten.state = 'idle'
            marten.timer = rand(2.5, 5.5)
          }
          break
        }
        case 'happy': {
          // двойной подскок с сердечками
          marten.happyT += dt
          if (marten.happyT >= 1.35) {
            marten.state = 'idle'
            marten.timer = rand(2.5, 5.5)
          }
          break
        }
      }
    }

    /* ────────────── Физика зёрен попкорна ────────────── */

    const updateKernels = (dt: number): void => {
      const ground = gy()
      for (const k of kernels) {
        k.vy += 430 * dt // гравитация
        k.vx += (prand(k.seed) - 0.5) * 26 * dt // лёгкий горизонтальный дрейф
        k.x += k.vx * dt
        k.y += k.vy * dt
        k.rot += k.vrot * dt
        k.vrot *= Math.exp(-0.9 * dt)
        if (k.y >= ground) {
          k.y = ground
          if (k.vy > 30) {
            // отскок с затуханием
            k.vy = -k.vy * 0.45
            k.vx *= 0.75
            k.vrot *= 0.6
          } else {
            // лёг на пол — трение
            k.vy = 0
            k.vx *= Math.exp(-3.2 * dt)
            k.vrot *= Math.exp(-6 * dt)
          }
        }
        // улетело за край — переспавн с противоположной стороны
        if (k.x < -26) {
          k.x = w + 20
          k.y = ground - rand(30, 90)
          k.vx = -rand(35, 70)
          k.vy = 0
          k.vrot = -rand(3, 7)
        } else if (k.x > w + 26) {
          k.x = -20
          k.y = ground - rand(30, 90)
          k.vx = rand(35, 70)
          k.vy = 0
          k.vrot = rand(3, 7)
        }
      }
    }

    /* ────────────── Частицы: сердечки и конфетти ────────────── */

    const updateParticles = (dt: number): void => {
      // фоновые конфетти-искры, плавающие вверх (stage >= 6)
      if (stageRef.current >= 6) {
        confettiTimer -= dt
        if (confettiTimer <= 0 && particles.length < 90) {
          confettiTimer = rand(0.25, 0.7)
          const life = rand(3.5, 6)
          particles.push({
            kind: 'confetti',
            x: rand(0, w),
            y: h + 8,
            vx: rand(-9, 9),
            vy: -rand(16, 38),
            life,
            maxLife: life,
            size: rand(2, 3.6),
            phase: rand(0, Math.PI * 2),
            rot: rand(0, Math.PI),
            vrot: rand(-3, 3),
            color: pickColor(CONFETTI_COLORS, Math.floor(prand(time * 7.31) * 9973)),
          })
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life -= dt
        if (p.kind === 'heart') {
          p.vy -= 12 * dt // ускоряется вверх
          p.vx += Math.sin(time * 4 + p.phase) * 22 * dt
        } else {
          p.vy -= 5 * dt
          p.vx += Math.sin(time * 2 + p.phase) * 14 * dt
          p.rot += p.vrot * dt
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.life <= 0 || p.y < -14 || p.x < -20 || p.x > w + 20) particles.splice(i, 1)
      }
    }

    /** Вертикальное смещение прыжка (≤0; 0 — на земле) */
    const hopOffsetOf = (m: Marten): number => {
      if (m.state === 'bat') {
        if (m.batT < 0.3) return -Math.sin((m.batT / 0.3) * Math.PI) * 14
        return 0
      }
      if (m.state === 'happy') {
        const t = m.happyT
        const h1 = t < 0.55 ? Math.sin((t / 0.55) * Math.PI) : 0
        const h2 = t > 0.62 && t < 1.2 ? Math.sin(((t - 0.62) / 0.58) * Math.PI) : 0
        return -(h1 + h2) * 16
      }
      return 0
    }

    /* ────────────── Отрисовка: комната ────────────── */

    const drawRoom = (): void => {
      const fy = floorY()
      // тёплая стена: вертикальный градиент
      const grad = ctx.createLinearGradient(0, 0, 0, fy)
      grad.addColorStop(0, '#FFF0D8')
      grad.addColorStop(1, '#F3DFBC')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, fy)
      // деревянный пол с досками
      ctx.fillStyle = '#C98F4F'
      ctx.fillRect(0, fy, w, h - fy)
      const rowH = 22
      const rows = Math.ceil((h - fy) / rowH) + 1
      for (let i = 0; i < rows; i++) {
        const top = fy + i * rowH
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)' // чередование оттенка досок
          ctx.fillRect(0, top, w, rowH)
        }
        ctx.fillStyle = '#B07A3F'
        ctx.fillRect(0, top + rowH - 1.5, w, 1.5) // горизонтальный стык
        const s1 = prand(i * 7.31 + 2) * w // вертикальные стыки
        ctx.fillRect(s1 - 1, top, 2, rowH)
        const s2 = (prand(i * 5.13 + 9) * w + w * 0.5) % w
        ctx.fillRect(s2 - 1, top, 2, rowH)
      }
      // плинтус
      ctx.fillStyle = '#F8E9CC'
      ctx.fillRect(0, fy - 10, w, 10)
      ctx.fillStyle = '#DDBE8F'
      ctx.fillRect(0, fy - 2.5, w, 2.5)
    }

    /** Провисающая нитка с флажками / лапками / золотом, лёгкое покачивание */
    const drawGarland = (x0: number, x1: number, baseY: number, sag: number, mode: GarlandMode): void => {
      const cx = (x0 + x1) / 2
      const cy = baseY + sag * 2 // контрольная точка даёт провис ≈ sag
      ctx.strokeStyle = 'rgba(122, 87, 49, 0.75)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x0, baseY)
      ctx.quadraticCurveTo(cx, cy, x1, baseY)
      ctx.stroke()
      const n = 9
      for (let i = 1; i <= n; i++) {
        const u = i / (n + 1)
        const v = 1 - u
        const px = v * v * x0 + 2 * u * v * cx + u * u * x1
        const py = v * v * baseY + 2 * u * v * cy + u * u * baseY
        const sway = Math.sin(time * 1.7 + i * 1.25) * 0.09
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(sway)
        if (mode === 'paws') {
          // отпечаток лапы: 1 большой + 3 малых кружочка, чередование цветов
          ctx.fillStyle = i % 2 === 0 ? '#E24B3B' : '#F2A24B'
          ctx.beginPath()
          ctx.arc(0, 5.2, 3.4, 0, Math.PI * 2)
          ctx.moveTo(-1.8, 0.6)
          ctx.arc(-3.6, 0.6, 1.8, 0, Math.PI * 2)
          ctx.moveTo(1.8, -0.4)
          ctx.arc(0, -0.4, 1.8, 0, Math.PI * 2)
          ctx.moveTo(5.4, 0.6)
          ctx.arc(3.6, 0.6, 1.8, 0, Math.PI * 2)
          ctx.fill()
        } else {
          const sz = 8.5
          ctx.fillStyle = mode === 'gold' ? '#FFE066' : pickColor(GARLAND_COLORS, i)
          ctx.beginPath()
          ctx.moveTo(-sz, 0)
          ctx.lineTo(sz, 0)
          ctx.lineTo(0, sz * 1.6)
          ctx.closePath()
          ctx.fill()
          if (mode === 'gold') {
            // блик на золотом флажке
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
            ctx.lineWidth = 1.6
            ctx.beginPath()
            ctx.moveTo(-sz * 0.45, 2)
            ctx.lineTo(-sz * 0.12, sz * 1.05)
            ctx.stroke()
          }
        }
        ctx.restore()
      }
    }

    /* ────────────── Отрисовка: декор пола по стадиям ────────────── */

    /** Золотая монета: кружочек с бликом и лёгким мерцанием */
    const drawCoin = (x: number, y: number, ph: number): void => {
      ctx.save()
      ctx.globalAlpha = 0.85 + 0.15 * Math.sin(time * 2.2 + ph)
      ctx.fillStyle = '#FFE066'
      ctx.strokeStyle = '#D9A93C'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.ellipse(x, y, 7.2, 6.2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.strokeStyle = 'rgba(217, 169, 60, 0.6)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.ellipse(x, y, 4.6, 3.8, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.arc(x - 1.5, y - 1.5, 4.4, Math.PI * 1.05, Math.PI * 1.5)
      ctx.stroke()
      ctx.restore()
    }

    /** Мигающий плюсик-искра */
    const drawSparkle = (x: number, y: number, size: number, alpha: number): void => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = '#FFF3C4'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x - size, y)
      ctx.lineTo(x + size, y)
      ctx.moveTo(x, y - size)
      ctx.lineTo(x, y + size)
      ctx.stroke()
      ctx.restore()
    }

    const drawFloorDecor = (): void => {
      const st = stageRef.current
      const fy = floorY()
      const fh = h - fy
      const cx = w * 0.5
      const rx = clamp(w * 0.2, 60, 120)
      const cy = fy + fh * 0.52 // центр ковра на полу
      const ry = rx * 0.34

      if (st >= 2) {
        // леопардовый ковёр: эллипс с каймой и тёмными пятнами
        ctx.fillStyle = '#8A5330'
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx + 5, ry + 2.5, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#D9A05B'
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.fill()
        for (let i = 0; i < 12; i++) {
          const a = prand(i * 11.3 + 2) * Math.PI * 2
          const rr = Math.sqrt(prand(i * 13.7 + 5)) * 0.72
          const sxp = cx + Math.cos(a) * rr * rx
          const syp = cy + Math.sin(a) * rr * ry * 0.8
          const sr = 2.6 + prand(i * 17.9 + 7) * 3.2
          ctx.fillStyle = 'rgba(138, 83, 48, 0.85)'
          ctx.beginPath()
          ctx.ellipse(sxp, syp, sr, sr * 0.8, a, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (st >= 5) {
        // корона с зубцами и самоцветом на ковре
        ctx.save()
        ctx.translate(cx - rx * 0.42, cy - ry * 0.3)
        ctx.rotate(-0.08)
        ctx.fillStyle = '#FFD166'
        ctx.strokeStyle = '#E2B13C'
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(-11, 0)
        ctx.lineTo(-11, -8)
        ctx.lineTo(-5.5, -2.5)
        ctx.lineTo(0, -10)
        ctx.lineTo(5.5, -2.5)
        ctx.lineTo(11, -8)
        ctx.lineTo(11, 0)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#E24B3B'
        ctx.beginPath()
        ctx.arc(0, -3.2, 2.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      if (st >= 3) {
        // клубок пряжи с нитяными дугами и хвостиком нити
        const yx = Math.max(18, cx - rx - 54)
        const yy = cy + 10
        ctx.save()
        ctx.beginPath()
        ctx.arc(yx, yy, 13, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = '#E2725B'
        ctx.fillRect(yx - 13, yy - 13, 26, 26)
        ctx.lineWidth = 2
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = i % 2 === 0 ? '#C9584A' : '#F0937F'
          ctx.beginPath()
          ctx.ellipse(yx, yy, 13, 4.5 + i * 2.4, 0.5 + i * 0.7, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
        ctx.strokeStyle = '#E2725B'
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(yx + 12, yy - 6)
        ctx.quadraticCurveTo(yx + 26, yy - 14 + Math.sin(time * 2) * 2, yx + 34, yy - 4)
        ctx.stroke()
        // игрушечная мышь с хвостиком-ниткой
        const mxp = Math.min(w - 18, cx + rx + 32)
        const myp = cy + 4
        ctx.strokeStyle = '#C9B8A6'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(mxp + 8, myp - 1)
        ctx.quadraticCurveTo(mxp + 18, myp - 6 + Math.sin(time * 3) * 2.5, mxp + 24, myp + 1)
        ctx.stroke()
        ctx.fillStyle = '#B7A99A'
        ctx.beginPath()
        ctx.ellipse(mxp, myp, 9, 6.2, -0.15, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(mxp - 4, myp - 6.4, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#3E2A18'
        ctx.beginPath()
        ctx.arc(mxp + 5.5, myp - 2.4, 1.1, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#E8A0A0'
        ctx.beginPath()
        ctx.arc(mxp + 9.4, myp - 1.4, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
      if (st >= 4) {
        // рыбья подушечка с глазом и плавником
        const fx = Math.min(w - 20, cx + rx + 56)
        const fyp = cy + 18
        ctx.save()
        ctx.translate(fx, fyp)
        ctx.rotate(-0.12)
        ctx.fillStyle = '#F4A259'
        ctx.beginPath()
        ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#E88F3C'
        ctx.beginPath()
        ctx.moveTo(-2, -8.5)
        ctx.lineTo(5, -14)
        ctx.lineTo(7, -7)
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(14, 0)
        ctx.lineTo(21, -5)
        ctx.lineTo(21, 5)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#FFF6E8'
        ctx.beginPath()
        ctx.arc(-8, -2.5, 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#3E2A18'
        ctx.beginPath()
        ctx.arc(-8.6, -2.5, 1.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      if (st >= 2) {
        // монеты рядом с ковром (+2 на stage >= 4)
        drawCoin(cx - rx - 16, cy + 2, 0)
        drawCoin(cx + rx + 14, cy - 4, 1.7)
        if (st >= 4) {
          drawCoin(cx - rx - 34, cy + 18, 3.1)
          drawCoin(cx + rx + 24, cy + 18, 4.4)
        }
      }
      if (st >= 5) {
        // кучка монет столбиком и мигающие плюсики-искры
        const px = cx + rx * 0.5
        const py = cy + ry * 0.42
        for (let i = 0; i < 4; i++) {
          drawCoin(px + (i % 2 === 0 ? -2 : 2.4), py - i * 6.4, i * 1.3)
        }
        for (let i = 0; i < 3; i++) {
          const a = 0.35 + 0.65 * Math.max(0, Math.sin(time * 2.6 + i * 2.1))
          drawSparkle(px - 10 + i * 9, py - 20 - (i % 2) * 7, 4.2, a)
        }
      }
      if (st >= 6) {
        // кубок-трофей рядом с ковром
        const tx = Math.max(18, cx - rx - 74)
        ctx.save()
        ctx.translate(tx, cy + 2)
        ctx.fillStyle = '#FFD166'
        ctx.strokeStyle = '#E2B13C'
        ctx.lineWidth = 1.6
        // чаша
        ctx.beginPath()
        ctx.moveTo(-9, -18)
        ctx.lineTo(9, -18)
        ctx.quadraticCurveTo(9, -6, 0, -4)
        ctx.quadraticCurveTo(-9, -6, -9, -18)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        // ручки
        ctx.beginPath()
        ctx.arc(-11, -14, 4, Math.PI * 0.6, Math.PI * 1.5)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(11, -14, 4, -Math.PI * 0.5, Math.PI * 0.4)
        ctx.stroke()
        // ножка и основание
        ctx.fillRect(-2.2, -4, 4.4, 6)
        ctx.strokeRect(-2.2, -4, 4.4, 6)
        ctx.fillRect(-7, 2, 14, 3.4)
        ctx.strokeRect(-7, 2, 14, 3.4)
        // блик
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(-5, -15.5)
        ctx.lineTo(-5, -8)
        ctx.stroke()
        ctx.restore()
      }
    }

    /* ────────────── Отрисовка: зерно попкорна ────────────── */

    /** Пухлое 3-лепестковое облачко: белое с жёлтой тенью */
    const drawKernel = (k: Kernel): void => {
      const sc = 0.9 + prand(k.seed) * 0.3
      ctx.save()
      ctx.translate(k.x, k.y)
      ctx.rotate(k.rot)
      ctx.scale(sc, sc)
      ctx.fillStyle = 'rgba(242, 193, 78, 0.85)' // жёлтая тень-подложка
      for (const [ox, oy, r] of KERNEL_LOBES) {
        ctx.beginPath()
        ctx.arc(ox, oy + 2, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#FFFFFF' // белые лепестки
      for (const [ox, oy, r] of KERNEL_LOBES) {
        ctx.beginPath()
        ctx.arc(ox, oy, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.strokeStyle = 'rgba(238, 217, 160, 0.9)' // лёгкие складки
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(-3.5, -1, 3.4, 0.4, 2.4)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(3, 0.5, 3, 3.5, 5.6)
      ctx.stroke()
      ctx.restore()
    }

    /* ────────────── Отрисовка: куница ────────────── */

    const drawMartenShadow = (): void => {
      const st = stageRef.current
      const s = martenScale(st)
      const bl = bodyLenOf(st)
      const air = clamp(-hopOffsetOf(marten) / 60, 0, 0.45) // тень сжимается в прыжке
      ctx.fillStyle = 'rgba(90, 58, 28, 0.16)'
      ctx.beginPath()
      ctx.ellipse(marten.x, gy() + 3, bl * 0.44 * s * (1 - air), 4.2 * s * (1 - air), 0, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawMarten = (): void => {
      const st = stageRef.current
      const sn = stageNorm(st)
      const s = martenScale(st)
      const bl = bodyLenOf(st)
      const bh = 30
      const headR = (bl * (0.5 - 0.15 * sn)) / 2 // у котёнка голова пропорционально крупнее
      const rearX = -bl * 0.48
      const frontX = bl * 0.4
      const walking = marten.state === 'walk'
      const breath = 1 + 0.025 * Math.sin(time * 2.1) // дыхание в покое
      const bob = walking ? Math.abs(Math.sin(marten.walkPhase)) * 1.5 : 0.5 * Math.sin(time * 2.1)
      const hop = hopOffsetOf(marten)

      ctx.save()
      ctx.translate(marten.x, gy() + hop)
      ctx.scale(marten.dir * s, s) // масштаб роста + разворот по направлению

      // взмах передней лапой в состоянии bat
      let batSwing = 0
      let batLift = 0
      if (marten.state === 'bat') {
        const p = (marten.batT - 0.3) / 0.24
        if (p > 0 && p < 1) {
          const k = Math.sin(p * Math.PI)
          batSwing = k * 19
          batLift = k * 6
        }
      }

      // лапка: линия от бедра до стопы; пары ходят в противофазе
      const drawLeg = (hx: number, hy: number, phase: number, far: boolean, extraSwing: number, extraLift: number): void => {
        const sw = (walking ? Math.sin(marten.walkPhase + phase) * 7 : 0) + extraSwing
        const lift = walking ? Math.max(0, -Math.cos(marten.walkPhase + phase)) * 2.6 : 0
        const footX = hx + sw
        const footY = -lift - extraLift
        ctx.strokeStyle = far ? '#8A5330' : '#5C3A22'
        ctx.lineWidth = 4.6
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(hx, hy)
        ctx.lineTo(footX, footY)
        ctx.stroke()
        ctx.fillStyle = far ? '#8A5330' : '#5C3A22'
        ctx.beginPath()
        ctx.arc(footX, footY, 2.7, 0, Math.PI * 2)
        ctx.fill()
      }

      /* — ПУШИСТЫЙ ХВОСТ с бегущей синусоидой (2 прохода: тень + шерсть) — */
      const tailBaseX = rearX + 4
      const tailBaseY = -bh * 0.5
      const tailLen = bl * 0.52
      const segs = 9
      const step = tailLen / segs
      const wagAmp = marten.state === 'happy' ? 0.3 : walking ? 0.22 : 0.14
      for (let pass = 0; pass < 2; pass++) {
        for (let i = segs; i >= 0; i--) {
          const t = i / segs
          const ang = Math.PI + 0.72 + Math.sin(t * 2.8 - marten.tailPhase) * wagAmp * t
          const px = tailBaseX + Math.cos(ang) * step * i
          const py = tailBaseY + Math.sin(ang) * step * i + (pass === 0 ? 1.4 : 0)
          const r = bh * 0.3 - (bh * 0.3 - 3.4) * t // сужение к кончику
          ctx.fillStyle = pass === 0 ? 'rgba(138, 83, 48, 0.9)' : t > 0.7 ? '#F6DCA8' : '#A2673D'
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      /* — дальние лапки — */
      drawLeg(rearX + 8, -bh * 0.34, 0, true, 0, 0)
      drawLeg(frontX - 10, -bh * 0.32, Math.PI, true, 0, 0)

      /* — КОРПУС: дуга спины, круп, грудь, кремовое брюшко — */
      ctx.save()
      ctx.translate(0, -bob)
      ctx.fillStyle = '#A2673D'
      ctx.beginPath()
      ctx.arc(rearX + 14, -bh * 0.52, bh * 0.46, 0, Math.PI * 2) // круп
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(0, -bh * 0.52, bl * 0.46, bh * 0.46 * breath, -0.05, 0, Math.PI * 2) // торс
      ctx.fill()
      ctx.beginPath()
      ctx.arc(frontX - 2, -bh * 0.48, bh * 0.4, 0, Math.PI * 2) // грудь
      ctx.fill()
      ctx.strokeStyle = 'rgba(138, 83, 48, 0.45)' // контур спины (тень)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(0, -bh * 0.52, bl * 0.46, bh * 0.46 * breath, -0.05, Math.PI * 1.05, Math.PI * 1.95)
      ctx.stroke()
      ctx.fillStyle = '#F6DCA8' // брюшко
      ctx.beginPath()
      ctx.ellipse(2, -bh * 0.34, bl * 0.33, bh * 0.17, 0, 0, Math.PI * 2)
      ctx.fill()

      /* — ГОЛОВА: уши, мордочка, нос, глаз, усы — */
      const headX = frontX + headR * 0.52
      const headY = -bh * 0.72 + Math.sin(time * 2.1) * 0.6 + (walking ? Math.sin(marten.walkPhase) * 0.9 : 0)
      ctx.fillStyle = '#8A5330' // дальнее ухо
      ctx.beginPath()
      ctx.arc(headX - headR * 0.5, headY - headR * 0.72, headR * 0.27, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#A2673D' // ближнее ухо
      ctx.beginPath()
      ctx.arc(headX - headR * 0.16, headY - headR * 0.86, headR * 0.34, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#E8C08F' // внутренняя часть ушка
      ctx.beginPath()
      ctx.arc(headX - headR * 0.2, headY - headR * 0.8, headR * 0.18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#A2673D' // череп
      ctx.beginPath()
      ctx.arc(headX, headY, headR, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#F6DCA8' // светлая мордочка
      ctx.beginPath()
      ctx.ellipse(headX + headR * 0.68, headY + headR * 0.32, headR * 0.62, headR * 0.5, 0.1, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#4A2E17' // нос
      ctx.beginPath()
      ctx.arc(headX + headR * 1.14, headY + headR * 0.2, headR * 0.17, 0, Math.PI * 2)
      ctx.fill()
      const ex = headX + headR * 0.3
      const ey = headY - headR * 0.02
      if (marten.state === 'happy') {
        // счастливый прищур дугой + улыбка
        ctx.strokeStyle = '#2E1D12'
        ctx.lineWidth = 2.2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(ex, ey + headR * 0.06, headR * 0.17, Math.PI * 1.15, Math.PI * 1.85)
        ctx.stroke()
        ctx.strokeStyle = '#4A2E17'
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.arc(headX + headR * 0.8, headY + headR * 0.42, headR * 0.24, 0.3, Math.PI - 0.5)
        ctx.stroke()
      } else {
        // глаз с морганием и бликом
        ctx.fillStyle = '#2E1D12'
        ctx.beginPath()
        ctx.ellipse(ex, ey, headR * 0.15, headR * 0.17 * Math.max(0.1, marten.blink), 0, 0, Math.PI * 2)
        ctx.fill()
        if (marten.blink > 0.6) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
          ctx.beginPath()
          ctx.arc(ex - headR * 0.05, ey - headR * 0.06, headR * 0.05, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      // усы: 3 тонкие линии
      ctx.strokeStyle = 'rgba(74, 46, 23, 0.5)'
      ctx.lineWidth = 1
      const wsx = headX + headR * 0.9
      const wsy = headY + headR * 0.4
      for (const [wa, wl] of WHISKERS) {
        const len = headR * wl
        ctx.beginPath()
        ctx.moveTo(wsx, wsy)
        ctx.lineTo(wsx + Math.cos(wa) * len, wsy + Math.sin(wa) * len)
        ctx.stroke()
      }
      ctx.restore() // конец корпуса

      /* — ближние лапки (передняя бьёт по зерну в состоянии bat) — */
      drawLeg(rearX + 16, -bh * 0.3, Math.PI, false, 0, 0)
      drawLeg(frontX - 3, -bh * 0.28, 0, false, batSwing, batLift)

      ctx.restore()
    }

    /* ────────────── Отрисовка: частицы ────────────── */

    const drawParticles = (kind: ParticleKind): void => {
      for (const p of particles) {
        if (p.kind !== kind) continue
        const lifeK = clamp(p.life / p.maxLife, 0, 1)
        ctx.save()
        if (p.kind === 'heart') {
          ctx.globalAlpha = lifeK
          ctx.translate(p.x, p.y)
          const sc = p.size / 4.4
          ctx.scale(sc, sc)
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(-1.9, -1.6, 2.1, 0, Math.PI * 2)
          ctx.moveTo(4, -1.6)
          ctx.arc(1.9, -1.6, 2.1, 0, Math.PI * 2)
          ctx.moveTo(-3.9, -0.6)
          ctx.lineTo(0, 4.2)
          ctx.lineTo(3.9, -0.6)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.globalAlpha = 0.55 * lifeK
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size * 0.75, p.size, p.size * 1.5)
        }
        ctx.restore()
      }
    }

    /* ────────────── Настройка и запуск ────────────── */

    resize()
    const [b0, b1] = walkBounds()
    marten.x = clamp(w * 0.5, b0, b1)
    marten.targetX = marten.x
    for (let i = 0; i < kernels.length; i++) {
      const k = kernels[i]
      k.x = clamp(w * (0.22 + 0.28 * i) + (prand(k.seed) - 0.5) * 24, 20, Math.max(21, w - 20))
      k.y = gy() - rand(30, 110) // зёрна падают и подпрыгивают при старте
    }
    inited = true

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onVisibility = (): void => {
      visible = !document.hidden
      if (visible) lastTime = performance.now() // без скачка dt после паузы
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onPointerDown = (e: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect()
      handleTap(e.clientX - rect.left, e.clientY - rect.top)
    }
    canvas.addEventListener('pointerdown', onPointerDown)

    /* ────────────── Единственный rAF-цикл ────────────── */

    const frame = (now: number): void => {
      rafId = requestAnimationFrame(frame)
      if (!visible) {
        lastTime = now // пауза рендера при скрытой вкладке
        return
      }
      let dt = (now - lastTime) / 1000
      lastTime = now
      if (dt <= 0) return
      if (dt > 0.05) dt = 0.05 // кап 50 мс
      time += dt

      if (!awayRef.current) updateMarten(dt)
      updateKernels(dt)
      updateParticles(dt)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawRoom()
      const st = stageRef.current
      // гирлянды на стене по стадиям
      if (st >= 1) drawGarland(w * 0.06, w * 0.94, 16, 19 + Math.sin(time * 0.9) * 2, 'flags')
      if (st >= 4) drawGarland(w * 0.12, w * 0.88, 54, 12 + Math.sin(time * 1.05 + 1.3) * 1.6, 'paws')
      if (st >= 6) drawGarland(w * 0.04, w * 0.96, 8, 22 + Math.sin(time * 0.8) * 2.2, 'gold')
      drawFloorDecor()
      drawParticles('confetti') // фоновые конфетти-искры
      if (!awayRef.current) {
        drawMartenShadow()
        drawMarten()
      }
      for (const k of kernels) drawKernel(k)
      drawParticles('heart')
    }
    rafId = requestAnimationFrame(frame)

    /* ────────────── Полная очистка ────────────── */

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className ? `block ${className}` : 'block h-44 w-full'}
      style={{ touchAction: 'none', cursor: 'pointer' }}
      role="img"
      aria-label={ariaLabel ?? 'Живая куница в уютной комнате: растёт с прогрессом и играет с зёрнами попкорна'}
    />
  )
}
