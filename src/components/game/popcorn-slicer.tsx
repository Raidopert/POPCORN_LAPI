'use client'

/**
 * «НАРЕЗКА ПОПКОРНА» — бонус-мини-игра в конце уровня.
 *
 * Когда норма выполнена, на экране появляется ГИГАНТСКИЙ взорванный
 * попкорн (белый с жёлтым) — бонусная цель `is_bonus_target`, которая
 * не убивает игрока, а только раздаёт очки. Лапкой (свайпом) нужно
 * водить по ней как можно чаще, пока идёт таймер:
 *
 * 1. Ввод и «разрезание»: ловим ТРЕЙЛ пальца/курсора. Каждый кадр
 *    строится отрезок между предыдущей и текущей точкой касания.
 *    Отрезок пересёк коллайдер — засчитан «тик урона». Один свайп
 *    может дать много тиков: зигзаг через попкорн = серия попаданий.
 *
 * 2. Комбо за темп: тики, между которыми прошло меньше COMBO_GAP
 *    секунд, копят серию. Каждые MULT_STEP тиков множитель растёт
 *    (×1 → ×2 → ×3 → ×4). Пропало больше COMBO_GAP секунд — серия
 *    сгорела, множитель сброшен: надо «держать темп».
 *
 * 3. Крит: случайный шанс (не зависит от точности) добавить +10.
 *
 * 4. Физика разреза: каждый тик откалывает кусочки пуха, трещины
 *    идут по кукурузине; когда пул HP исчерпан — попкорн ВЗРЫВАЕТСЯ:
 *    две половинки разлетаются под гравитацией с импульсом свайпа,
 *    зёрна скачут по полу, +финальный бонус.
 *
 * Технические рамки из гейм-дизайна: хитбокс на 15% БОЛЬШЕ спрайта
 * (игроку кажется, что он «задел» кукурузину даже при лёгком промахе);
 * HUD (таймер, очки, полоска HP, комбо) рисуется на канвасе — без
 * перерисовок React в рантайме.
 */

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { audio } from '@/lib/game/audio'
import type { TranslateFn } from '@/lib/game/i18n'

/* ══════════════ Жёсткие рамки баланса (гейм-дизайн) ══════════════ */

/** Сколько секунд идёт нарезка */
const SLICE_SECONDS = 7
/** Пул HP бонусной цели: столько тиков урона она выдерживает */
const POPCORN_HP = 26
/** Хитбокс на 15% больше спрайта — «задел» даже при лёгком промахе */
const HITBOX_MUL = 1.15
/** Серия живёт, пока между тиками меньше этого (сброс комбо по ТЗ) */
const COMBO_GAP = 1.5
/** Антидребезг: минимальная пауза между тиками одного свайпа */
const TICK_COOLDOWN = 0.055
/** Очки за базовый тик урона */
const BASE_POINTS = 4
/** Крит: случайный шанс (не зависит от точности) */
const CRIT_CHANCE = 0.12
const CRIT_BONUS = 10
/** Финальный бонус за ВЗРЫВ (уложился до конца таймера) */
const BURST_BONUS = 30
/** Каждые столько тиков серии множитель растёт на +1 */
const MULT_STEP = 4
/** Потолок множителя комбо */
const MAX_MULT = 4
const INTRO_SECONDS = 1.15
const BURST_SECONDS = 1.5
/* ── Награды в стиле Fruit Ninja ──
   Золотые зёрна-бонусы пролетают через экран дважды за нарезку: срез
   даёт жирные очки и МОНЕТКИ (обычные тики монеток не дают). Итог
   нарезки конвертируется в карманные монетки + оценка звёздами. */
/** Сколько золотых зёрен за одну нарезку */
const GOLDEN_COUNT = 2
/** Очки и монетки за срез одного золотого */
const GOLDEN_POINTS = 50
const GOLDEN_COINS = 10
/** Радиус золотого в долях радиуса попкорна */
const GOLDEN_R = 0.17
/** Моменты спавна золотых (секунды от начала нарезки) */
const GOLDEN_SPAWN_AT = [1.4, 4.2]
/** Пороги звёзд результата: очки нарезки (типичный слабый прогон ~90-150) */
const STAR_CUTS = [120, 220, 330]
/** Конверсия очков нарезки в монетки (1🪙 за каждые 12 очков, мин. 5) */
const COINS_PER_POINT = 1 / 12
const MIN_SLICER_COINS = 5

/* ══════════════ Типы и вспомогательная математика ══════════════ */

type Stage = 'intro' | 'slice' | 'burst' | 'results'

interface TrailPt {
  x: number
  y: number
  t: number
}

/** Кусочек пуха / жёлтое зёрнышко — скачет по полу с гравитацией */
interface Chunk {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  vr: number
  t: number
  ttl: number
  kernel: boolean
}

/** Половинка взорванной кукурузины: летит с импульсом разреза */
interface Half {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  side: -1 | 1
}

/** Золотое зерно-бонус (Fruit Ninja): плывёт через экран по синусоиде */
interface Golden {
  x: number
  y0: number
  vx: number
  t: number
  r: number
}

interface FloatTxt {
  x: number
  y: number
  vy: number
  text: string
  crit: boolean
  t: number
}

interface Spark {
  x: number
  y: number
  t: number
}

/** Антидребезг-движение: отрезок короче столько пикселей тик не даёт.
    Лечит фарм зажатием: палец лежит на месте — сегменты нулевые — очков нет. */
const MIN_MOVE = 13

/** Ближайшая точка отрезка A→B к центру C не дальше радиуса r —
    свайп «прошёл по» коллайдеру (вход, выход или движение внутри). */
function segCircleNear(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  r: number,
): boolean {
  const dx = bx - ax
  const dy = by - ay
  const l2 = dx * dx + dy * dy
  let k = 0
  if (l2 > 1e-9) {
    k = ((cx - ax) * dx + (cy - ay) * dy) / l2
    k = Math.max(0, Math.min(1, k))
  }
  const px = ax + dx * k - cx
  const py = ay + dy * k - cy
  return px * px + py * py <= r * r
}

/* ══════════════ Компонент ══════════════ */

interface SlicerProps {
  t: TranslateFn
  /** Номер пройденного уровня (для плашки «УРОВЕНЬ N») */
  level: number
  /** Итог: бонусные очки уходят в счёт забега, монетки — в кошелёк */
  onDone: (total: number, rewards?: { coins?: number }) => void
}

export function PopcornSlicer({ t, level, onDone }: SlicerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Stage>('intro')
  const [result, setResult] = useState<{
    total: number
    swipes: number
    maxMult: number
    coins: number
    stars: number
  } | null>(null)

  /* Строки и колбэк — через ref, чтобы игровой цикл не перезапускался */
  const tRef = useRef(t)
  useEffect(() => {
    tRef.current = t
  }, [t])
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  /* ════ Игровое состояние: один мутабельный объект в ref ════ */
  const gRef = useRef<{
    stage: Stage
    stageT: number
    W: number
    H: number
    u: number
    cx: number
    cy: number
    R: number
    hp: number
    ticks: number
    total: number
    combo: number
    mult: number
    maxMult: number
    lastTickAt: number
    lastPlopAt: number
    timeLeft: number
    exploded: boolean
    wobble: number
    hitFlash: number
    burstFlash: number
    comboPopT: number
    down: boolean
    pid: number
    px: number
    py: number
    trail: TrailPt[]
    chunks: Chunk[]
    halves: Half[]
    goldens: Golden[]
    goldSpawned: number
    goldCoins: number
    floats: FloatTxt[]
    sparks: Spark[]
    lobes: Array<{ ox: number; oy: number; r: number }>
    kernels: Array<{ ox: number; oy: number; r: number }>
    ridges: Array<{ x: number; y: number; r: number; a0: number; a1: number }>
    cracks: Array<Array<[number, number]>>
  } | null>(null)

  /* ════ Игровой цикл: рисование + физика + ввод обработан в слушателях ════ */
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const g = (gRef.current ??= {
      stage: 'intro' as Stage,
      stageT: 0,
      W: 0,
      H: 0,
      u: 1,
      cx: 0,
      cy: 0,
      R: 80,
      hp: POPCORN_HP,
      ticks: 0,
      total: 0,
      combo: 0,
      mult: 1,
      maxMult: 1,
      lastTickAt: -9,
      lastPlopAt: -9,
      timeLeft: SLICE_SECONDS,
      exploded: false,
      wobble: 0,
      hitFlash: 0,
      burstFlash: 0,
      comboPopT: -9,
      down: false,
      pid: -1,
      px: 0,
      py: 0,
      trail: [],
      chunks: [],
      halves: [],
      goldens: [],
      goldSpawned: 0,
      goldCoins: 0,
      floats: [],
      sparks: [],
      lobes: [],
      kernels: [],
      ridges: [],
      cracks: [],
    })

    /* DEV-отладка: состояние слайсера из консоли (window.__slicerDbg()) */
    ;(window as unknown as { __slicerDbg?: () => string; __slicerG?: unknown }).__slicerDbg = () =>
      `stage=${g.stage} stageT=${g.stageT.toFixed(2)} timeLeft=${g.timeLeft.toFixed(2)} hp=${g.hp} ticks=${g.ticks} total=${g.total} R=${g.R.toFixed(1)} cx=${g.cx} cy=${g.cy} u=${g.u} lobes=${g.lobes.length} kernels=${g.kernels.length} ridges=${g.ridges.length} cracks=${g.cracks.length} chunks=${g.chunks.length} halves=${g.halves.length} floats=${g.floats.length} W=${g.W} H=${g.H} down=${g.down}`
    ;(window as unknown as { __slicerDbg?: () => string; __slicerG?: unknown }).__slicerG = g

    /* ── Геометрия гигантской кукурузины: генерируется один раз.
          Все координаты — в ДОЛЯХ радиуса R (0..1), масштабируются при рисовании ── */
    const buildPopcorn = (): void => {
      const rnd = Math.random
      g.lobes = []
      g.kernels = []
      g.ridges = []
      g.cracks = []
      const nL = 10 + Math.floor(rnd() * 4)
      for (let i = 0; i < nL; i++) {
        const a = (i / nL) * Math.PI * 2 + rnd() * 0.7
        const d = 0.18 + rnd() * 0.5
        g.lobes.push({
          ox: Math.cos(a) * d,
          oy: Math.sin(a) * d * 0.92,
          r: 0.3 + rnd() * 0.26,
        })
      }
      /* Центральная макушка покрупнее */
      g.lobes.push({ ox: 0.04, oy: -0.3, r: 0.42 })
      g.lobes.push({ ox: -0.26, oy: 0.22, r: 0.38 })
      g.lobes.push({ ox: 0.28, oy: 0.24, r: 0.36 })
      /* Жёлтые зёрнышки выглядывают между белыми пузырями */
      for (let i = 0; i < 3; i++) {
        const a = rnd() * Math.PI * 2
        const d = 0.45 + rnd() * 0.35
        g.kernels.push({ ox: Math.cos(a) * d, oy: Math.sin(a) * d, r: 0.1 + rnd() * 0.08 })
      }
      /* Пушные «гребешки» — текстура взорванного зерна */
      for (let i = 0; i < 7; i++) {
        const a = rnd() * Math.PI * 2
        const d = 0.15 + rnd() * 0.5
        g.ridges.push({
          x: Math.cos(a) * d,
          y: Math.sin(a) * d,
          r: 0.1 + rnd() * 0.12,
          a0: rnd() * Math.PI * 2,
          a1: rnd() * Math.PI + Math.PI,
        })
      }
      /* Трещины: ломаные от края к центру, открываются по мере урона */
      for (let i = 0; i < 7; i++) {
        const a = rnd() * Math.PI * 2
        const pts: Array<[number, number]> = []
        let rr = 0.95
        let aa = a
        for (let k = 0; k < 4; k++) {
          pts.push([Math.cos(aa) * rr, Math.sin(aa) * rr])
          rr *= 0.72
          aa += (rnd() - 0.5) * 1.1
        }
        g.cracks.push(pts)
      }
    }

    /* ── Размер канваса: DPR + единица масштаба ── */
    const resize = (): void => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(2.5, window.devicePixelRatio || 1)
      g.W = Math.max(1, rect.width)
      g.H = Math.max(1, rect.height)
      canvas.width = Math.round(g.W * dpr)
      canvas.height = Math.round(g.H * dpr)
      canvas.style.width = `${g.W}px`
      canvas.style.height = `${g.H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.u = Math.max(0.75, Math.min(g.W, g.H) / 430)
      g.cx = g.W / 2
      g.cy = g.H * 0.46
      g.R = Math.min(g.W, g.H) * 0.21
      buildPopcorn()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    /* ── Спавн кусочков при тике урона ── */
    const spawnChunks = (x: number, y: number, n: number, kernel: boolean): void => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = (90 + Math.random() * 200) * g.u
        g.chunks.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 160 * g.u,
          r: (3.5 + Math.random() * 4.5) * g.u,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 12,
          t: 0,
          ttl: 0.8 + Math.random() * 0.5,
          kernel,
        })
      }
      if (g.chunks.length > 90) g.chunks.splice(0, g.chunks.length - 90)
    }

    /* ── Тик урона: комбо, множитель, крит, очки ── */
    const tick = (hx: number, hy: number, now: number): void => {
      g.combo = now - g.lastTickAt <= COMBO_GAP ? g.combo + 1 : 1
      g.lastTickAt = now
      const mult = Math.min(MAX_MULT, 1 + Math.floor((g.combo - 1) / MULT_STEP))
      if (mult > g.mult) {
        g.mult = mult
        g.comboPopT = now
        if (mult > g.maxMult) g.maxMult = mult
      }
      const crit = Math.random() < CRIT_CHANCE
      const gained = BASE_POINTS * g.mult + (crit ? CRIT_BONUS : 0)
      g.total += gained
      g.ticks++
      g.hp--
      g.wobble = 1
      g.hitFlash = 0.22
      const S = tRef.current
      g.floats.push({
        x: hx,
        y: hy - 14 * g.u,
        vy: -70 * g.u,
        text: crit ? `${S('slicer.crit')} +${gained}` : `+${gained}`,
        crit,
        t: 0,
      })
      if (g.floats.length > 14) g.floats.shift()
      g.sparks.push({ x: hx, y: hy, t: 0 })
      spawnChunks(hx, hy, crit ? 5 : 3, false)
      if (now - g.lastPlopAt >= 0.07) {
        g.lastPlopAt = now
        audio.play('plop')
      }
      if (g.hp <= 0) doBurst(now, true)
    }

    /** Золотое зерно срезано (Fruit Ninja): жирные очки + монетки в кошелёк */
    const hitGolden = (hx: number, hy: number, idx: number): void => {
      const gr = g.goldens[idx]
      if (!gr) return
      g.goldens.splice(idx, 1)
      g.total += GOLDEN_POINTS
      g.goldCoins += GOLDEN_COINS
      g.floats.push({
        x: hx,
        y: hy - 14 * g.u,
        vy: -70 * g.u,
        text: `✨ +${GOLDEN_POINTS}`,
        crit: true,
        t: 0,
      })
      g.sparks.push({ x: hx, y: hy, t: 0 })
      spawnChunks(hx, hy, 8, true)
      audio.play('plopGold')
    }

    /* ── ВЗРЫВ: половинки разлетаются с импульсом, зёрна скачут ── */
    const doBurst = (now: number, exploded: boolean): void => {
      if (g.stage !== 'slice') return
      g.stage = 'burst'
      g.stageT = 0
      g.exploded = exploded
      g.burstFlash = 0.5
      if (exploded) {
        g.total += BURST_BONUS
        const S = tRef.current
        g.floats.push({
          x: g.cx,
          y: g.cy - g.R * 0.4,
          vy: -60 * g.u,
          text: S('slicer.burst', { n: BURST_BONUS }),
          crit: true,
          t: 0,
        })
        audio.play('fever')
      }
      audio.play('plopGold')
      spawnChunks(g.cx, g.cy, 16, true)
      spawnChunks(g.cx, g.cy, 10, false)
      /* Импульс разреза: половинки гарантированно разлетаются в стороны */
      const ix = (150 + Math.random() * 100) * g.u
      const iy = -(180 + Math.random() * 140) * g.u
      g.halves.push({
        x: g.cx,
        y: g.cy,
        vx: ix,
        vy: iy,
        rot: 0,
        vr: (2 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1),
        side: -1,
      })
      g.halves.push({
        x: g.cx,
        y: g.cy,
        vx: -ix,
        vy: iy,
        rot: 0,
        vr: (2 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1),
        side: 1,
      })
      setStage('burst')
    }

    /* ── Ввод: трейл пальца/курсора → отрезки → пересечения ── */
    const toLocal = (e: PointerEvent): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const perfNow = (): number => performance.now() / 1000
    const onDown = (e: PointerEvent): void => {
      e.preventDefault()
      const p = toLocal(e)
      g.down = true
      g.pid = e.pointerId
      g.px = p.x
      g.py = p.y
      g.trail.push({ x: p.x, y: p.y, t: perfNow() })
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        /* старые браузеры без capture — не страшно */
      }
    }
    const onMove = (e: PointerEvent): void => {
      if (!g.down || e.pointerId !== g.pid) return
      const now = perfNow()
      const p = toLocal(e)
      const ax = g.px
      const ay = g.py
      g.px = p.x
      g.py = p.y
      g.trail.push({ x: p.x, y: p.y, t: now })
      if (g.trail.length > 40) g.trail.shift()
      /* Детекция пересечения отрезком ПОПКОРНА: хитбокс на 15% шире спрайта.
          Сегменты короче MIN_MOVE не считаем — зажатие на месте не фармит */
      const mdx = p.x - ax
      const mdy = p.y - ay
      const enough = mdx * mdx + mdy * mdy >= MIN_MOVE * MIN_MOVE
      const cooled = now - g.lastTickAt >= TICK_COOLDOWN
      /* Золотые зёрна проверяем ПЕРВЫМИ: их срез не тратит тик попкорна */
      if (g.stage === 'slice' && enough && cooled) {
        for (let i = g.goldens.length - 1; i >= 0; i--) {
          const gr = g.goldens[i]
          if (!gr) continue
          const gy = gr.y0 + Math.sin(gr.t * 3.2) * 30 * g.u
          if (segCircleNear(ax, ay, p.x, p.y, gr.x, gy, gr.r * 1.3)) {
            hitGolden((ax + p.x) / 2, (ay + p.y) / 2, i)
            break
          }
        }
      }
      if (
        g.stage === 'slice' &&
        enough &&
        cooled &&
        segCircleNear(ax, ay, p.x, p.y, g.cx, g.cy, g.R * HITBOX_MUL)
      ) {
        const mx = (ax + p.x) / 2
        const my = (ay + p.y) / 2
        tick(mx, my, now)
      }
    }
    const onUp = (e: PointerEvent): void => {
      if (e.pointerId !== g.pid) return
      g.down = false
      g.pid = -1
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    let raf = 0
    let last = perfNow()

    /* ════ Рисование ════ */

    /** Гигантский попкорн: белые пузыри-доли, жёлтые зёрнышки, пух, трещины */
    const drawPopcorn = (cx: number, cy: number, R: number, now: number, damage: number): void => {
      const u = g.u
      ctx.save()
      ctx.translate(cx, cy)
      /* Мягкий жёлтый ореол под кукурузиной — она «светится» теплом */
      const glow = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.55)
      glow.addColorStop(0, 'rgba(255, 214, 92, 0.4)')
      glow.addColorStop(0.65, 'rgba(255, 214, 92, 0.12)')
      glow.addColorStop(1, 'rgba(255, 214, 92, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(0, 0, R * 1.55, 0, Math.PI * 2)
      ctx.fill()
      /* Тень на «полу» */
      ctx.fillStyle = 'rgba(10, 5, 2, 0.3)'
      ctx.beginPath()
      ctx.ellipse(0, R * 1.12, R * 0.85, R * 0.18, 0, 0, Math.PI * 2)
      ctx.fill()
      /* Покачивание при попаданиях + лёгкое дыхание */
      const w = g.wobble
      ctx.rotate(Math.sin(now * 0.9) * 0.025 + w * (Math.sin(now * 40) * 0.05))
      ctx.scale(1 + w * 0.07, 1 - w * 0.07)
      /* Жёлтые зёрнышки выглядывают между белыми пузырями (рисуем первыми — они «внутри») */
      for (const k of g.kernels) {
        const kx = k.ox * R
        const ky = k.oy * R
        const kr = k.r * R
        const kg = ctx.createRadialGradient(kx, ky, kr * 0.15, kx, ky, kr)
        kg.addColorStop(0, '#FFDF7E')
        kg.addColorStop(1, '#F0B93C')
        ctx.fillStyle = kg
        ctx.beginPath()
        ctx.arc(kx, ky, kr, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#D9A441'
        ctx.lineWidth = Math.max(1, 1.6 * u)
        ctx.stroke()
      }
      /* Белые «взорванные» доли (координаты долей — в долях R) */
      for (const l of g.lobes) {
        const lx = l.ox * R
        const ly = l.oy * R
        const lr = l.r * R
        const lg = ctx.createRadialGradient(
          lx - lr * 0.35,
          ly - lr * 0.4,
          lr * 0.1,
          lx,
          ly,
          lr,
        )
        lg.addColorStop(0, '#FFFEFA')
        lg.addColorStop(0.55, '#FFF4D8')
        lg.addColorStop(1, '#F7D678')
        ctx.fillStyle = lg
        ctx.beginPath()
        ctx.arc(lx, ly, lr, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#E0A83C'
        ctx.lineWidth = Math.max(1.5, 2.2 * u)
        ctx.stroke()
      }
      /* Пушные гребешки — текстура взорванного зерна */
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = Math.max(1.2, 2 * u)
      for (const r of g.ridges) {
        ctx.beginPath()
        ctx.arc(r.x * R, r.y * R, r.r * R, r.a0, r.a1)
        ctx.stroke()
      }
      /* Трещины: по мере урона их всё больше */
      const nC = Math.floor(damage * g.cracks.length)
      ctx.strokeStyle = '#C98A2B'
      ctx.lineWidth = Math.max(1.5, 2.4 * u)
      for (let i = 0; i < nC; i++) {
        const pts = g.cracks[i]
        if (!pts) continue
        ctx.beginPath()
        ctx.moveTo(pts[0][0] * R, pts[0][1] * R)
        for (let k = 1; k < pts.length; k++) {
          const pt = pts[k]
          ctx.lineTo(pt[0] * R, pt[1] * R)
        }
        ctx.stroke()
      }
      /* Вспышка от попадания */
      if (g.hitFlash > 0) {
        ctx.globalAlpha = Math.min(1, g.hitFlash / 0.22) * 0.4
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(0, 0, R * 1.02, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      ctx.restore()
    }

    /** Половинка: та же кукурузина, обрезанная плоскостью разреза */
    const drawHalf = (h: Half, now: number): void => {
      ctx.save()
      ctx.translate(h.x, h.y)
      ctx.rotate(h.rot)
      ctx.beginPath()
      const far = g.R * 2.2
      if (h.side < 0) ctx.rect(-far, -far, far, far * 2)
      else ctx.rect(0, -far, far, far * 2)
      ctx.clip()
      drawPopcorn(0, 0, g.R, now, 1)
      /* Срез: светлая линия по плоскости разреза */
      ctx.strokeStyle = 'rgba(255, 251, 235, 0.95)'
      ctx.lineWidth = Math.max(2, 3 * g.u)
      ctx.beginPath()
      ctx.moveTo(0, -g.R * 1.1)
      ctx.lineTo(0, g.R * 1.1)
      ctx.stroke()
      ctx.restore()
    }

    const drawChunk = (c: Chunk): void => {
      const alpha = c.t > c.ttl - 0.25 ? Math.max(0, (c.ttl - c.t) / 0.25) : 1
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(c.x, c.y)
      ctx.rotate(c.rot)
      const grad = ctx.createRadialGradient(-c.r * 0.3, -c.r * 0.3, c.r * 0.1, 0, 0, c.r)
      if (c.kernel) {
        grad.addColorStop(0, '#FFDF7E')
        grad.addColorStop(1, '#F0B93C')
      } else {
        grad.addColorStop(0, '#FFFEFA')
        grad.addColorStop(1, '#F7D678')
      }
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(0, 0, c.r, 0, Math.PI * 2)
      ctx.fill()
      if (!c.kernel) {
        ctx.strokeStyle = '#E0A83C'
        ctx.lineWidth = Math.max(1, 1.4 * g.u)
        ctx.stroke()
      }
      ctx.restore()
    }

    const pixelFont = (size: number): string =>
      `700 ${Math.round(size)}px "Handjet", system-ui, sans-serif`

    /** Текст с тёмной обводкой — как баннеры в движке */
    const outlineText = (
      text: string,
      x: number,
      y: number,
      size: number,
      fill: string,
      align: CanvasTextAlign = 'center',
    ): void => {
      ctx.font = pixelFont(size)
      ctx.textAlign = align
      ctx.textBaseline = 'middle'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = 'rgba(20, 8, 2, 0.85)'
      ctx.lineWidth = Math.max(3, size * 0.22)
      ctx.strokeText(text, x, y)
      ctx.fillStyle = fill
      ctx.fillText(text, x, y)
    }

    /* ════ Главный цикл ════ */
    const frame = (): void => {
      raf = requestAnimationFrame(frame)
      try {
        step()
      } catch (err) {
        ;(window as unknown as { __slicerErr?: unknown }).__slicerErr = String(err)
      }
    }

    const step = (): void => {
      const now = perfNow()
      let dt = now - last
      last = now
      if (dt > 0.05) dt = 0.05 // прыжок таба — не даём физике улететь
      g.stageT += dt
      const u = g.u
      const S = tRef.current

      /* ── Переходы стадий ── */
      if (g.stage === 'intro' && g.stageT >= INTRO_SECONDS) {
        g.stage = 'slice'
        g.stageT = 0
        audio.play('fever')
        setStage('slice')
      } else if (g.stage === 'slice') {
        g.timeLeft -= dt
        /* Сброс комбо: больше COMBO_GAP без нарезки — серия сгорела */
        if (g.mult > 1 && now - g.lastTickAt > COMBO_GAP) {
          g.combo = 0
          g.mult = 1
        }
        /* ЗОЛОТЫЕ ЗЁРНА (Fruit Ninja): спавн по графику нарезки, плывут через экран */
        while (
          g.goldSpawned < GOLDEN_COUNT &&
          SLICE_SECONDS - g.timeLeft >= (GOLDEN_SPAWN_AT[g.goldSpawned] ?? 99)
        ) {
          const dir = g.goldSpawned % 2 === 0 ? 1 : -1
          g.goldens.push({
            x: dir > 0 ? -24 * u : g.W + 24 * u,
            y0: g.H * (0.2 + Math.random() * 0.16),
            vx: dir * (70 + Math.random() * 40) * u,
            t: 0,
            r: g.R * GOLDEN_R,
          })
          g.goldSpawned++
        }
        for (let i = g.goldens.length - 1; i >= 0; i--) {
          const gr = g.goldens[i]
          if (!gr) continue
          gr.t += dt
          gr.x += gr.vx * dt
          if (gr.t > 4.5 || gr.x < -50 * u || gr.x > g.W + 50 * u) g.goldens.splice(i, 1)
        }
        if (g.timeLeft <= 0) {
          g.timeLeft = 0
          doBurst(now, false)
        }
      } else if (g.stage === 'burst' && g.stageT >= BURST_SECONDS) {
        g.stage = 'results'
        g.stageT = 0
        setStage('results')
        setResult({
          total: g.total,
          swipes: g.ticks,
          maxMult: g.maxMult,
          /* Награды Fruit Ninja: конверсия очков в монетки (мин. 5) + золото по 10 */
          coins:
            g.goldCoins + Math.max(MIN_SLICER_COINS, Math.round(g.total * COINS_PER_POINT)),
          stars:
            g.total >= STAR_CUTS[2] ? 3 : g.total >= STAR_CUTS[1] ? 2 : g.total >= STAR_CUTS[0] ? 1 : 0,
        })
      }

      /* ── Физика кусочков: гравитация, пол, отскок ──
         Слоу-мо: первый полсекунды взрыва растянуты (×0.35) — разлёт
         половинок читается «кинематографично», потом время догоняет */
      const pdt = g.stage === 'burst' && g.stageT < 0.5 ? dt * 0.35 : dt
      for (let i = g.chunks.length - 1; i >= 0; i--) {
        const c = g.chunks[i]
        if (!c) continue
        c.t += pdt
        c.vy += 1500 * u * pdt
        c.x += c.vx * pdt
        c.y += c.vy * pdt
        c.rot += c.vr * pdt
        const floor = g.H - 14 * u
        if (c.y > floor && c.vy > 0) {
          c.y = floor
          c.vy *= -0.42
          c.vx *= 0.72
          if (Math.abs(c.vy) < 40 * u) c.vy = 0
        }
        if (c.t >= c.ttl) g.chunks.splice(i, 1)
      }
      /* ── Половинки: гравитация + вращение (улетают за экран) ── */
      for (const h of g.halves) {
        h.vy += 1400 * u * pdt
        h.x += h.vx * pdt
        h.y += h.vy * pdt
        h.rot += h.vr * pdt
      }
      /* ── Затухания ── */
      g.wobble *= Math.exp(-dt * 6.5)
      if (g.hitFlash > 0) g.hitFlash -= dt
      if (g.burstFlash > 0) g.burstFlash -= dt * 1.6
      for (let i = g.floats.length - 1; i >= 0; i--) {
        const f = g.floats[i]
        if (!f) continue
        f.t += dt
        f.y += f.vy * dt
        if (f.t > 0.9) g.floats.splice(i, 1)
      }
      for (let i = g.sparks.length - 1; i >= 0; i--) {
        const s = g.sparks[i]
        if (!s) continue
        s.t += dt
        if (s.t > 0.18) g.sparks.splice(i, 1)
      }
      while (g.trail.length > 0 && now - (g.trail[0]?.t ?? now) > 0.22) g.trail.shift()

      /* ════ Отрисовка ════ */
      ctx.clearRect(0, 0, g.W, g.H)

      /* Попкорн или половинки */
      if (g.stage === 'burst' || g.stage === 'results') {
        for (const h of g.halves) drawHalf(h, now)
      } else {
        const bob = Math.sin(now * 1.6) * 4 * u
        drawPopcorn(g.cx, g.cy + bob, g.R, now, g.ticks / POPCORN_HP)
      }
      for (const c of g.chunks) drawChunk(c)

      /* Золотые зёрна-бонусы (Fruit Ninja): сияющий комочек плывёт по синусоиде */
      for (const gr of g.goldens) {
        const gy = gr.y0 + Math.sin(gr.t * 3.2) * 30 * u
        const pulse = 1 + Math.sin(gr.t * 9) * 0.08
        ctx.save()
        ctx.translate(gr.x, gy)
        const halo = ctx.createRadialGradient(0, 0, gr.r * 0.2, 0, 0, gr.r * 2.2)
        halo.addColorStop(0, 'rgba(255, 214, 92, 0.55)')
        halo.addColorStop(1, 'rgba(255, 214, 92, 0)')
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(0, 0, gr.r * 2.2 * pulse, 0, Math.PI * 2)
        ctx.fill()
        const core = ctx.createRadialGradient(-gr.r * 0.3, -gr.r * 0.35, gr.r * 0.1, 0, 0, gr.r)
        core.addColorStop(0, '#FFF6D0')
        core.addColorStop(0.55, '#FFC93C')
        core.addColorStop(1, '#E5A31F')
        ctx.fillStyle = core
        ctx.beginPath()
        ctx.arc(0, 0, gr.r * pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#D98E1B'
        ctx.lineWidth = Math.max(1.4, 2 * u)
        ctx.stroke()
        ctx.strokeStyle = 'rgba(255, 246, 208, 0.9)'
        ctx.lineWidth = Math.max(1, 1.6 * u)
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + gr.t * 2.4
          ctx.beginPath()
          ctx.moveTo(Math.cos(a) * gr.r * 1.25, Math.sin(a) * gr.r * 1.25)
          ctx.lineTo(Math.cos(a) * gr.r * 1.8, Math.sin(a) * gr.r * 1.8)
          ctx.stroke()
        }
        ctx.restore()
      }

      /* Искры от попаданий: 4 коротких луча */
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.lineWidth = Math.max(1.5, 2 * u)
      for (const s of g.sparks) {
        const k = 1 - s.t / 0.18
        const rr = g.R * 0.14 + s.t * 260 * u
        ctx.globalAlpha = k
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + s.t * 6
          ctx.beginPath()
          ctx.moveTo(s.x + Math.cos(a) * rr * 0.5, s.y + Math.sin(a) * rr * 0.5)
          ctx.lineTo(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      /* Трейл лапки: янтарный ореол + белая сердцевина, сужается к хвосту */
      if (g.trail.length > 1) {
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < g.trail.length; i++) {
            const a = g.trail[i - 1]
            const b = g.trail[i]
            if (!a || !b) continue
            const age = now - b.t
            const k = Math.max(0, 1 - age / 0.22)
            if (pass === 0) {
              ctx.strokeStyle = `rgba(255, 214, 92, ${0.4 * k})`
              ctx.lineWidth = Math.max(2, 13 * u * k)
            } else {
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.92 * k})`
              ctx.lineWidth = Math.max(1, 5.5 * u * k)
            }
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      /* Лапка-курсор: 🐾 качается у точки касания */
      if (g.down) {
        ctx.save()
        ctx.translate(g.px, g.py)
        ctx.rotate(Math.sin(now * 9) * 0.18)
        ctx.font = `${Math.round(24 * u)}px system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🐾', 0, 0)
        ctx.restore()
      }

      /* Всплывающие очки */
      for (const f of g.floats) {
        const k = f.t < 0.12 ? f.t / 0.12 : Math.max(0, 1 - (f.t - 0.12) / 0.78)
        ctx.globalAlpha = k
        outlineText(f.text, f.x, f.y, (f.crit ? 21 : 17) * u, f.crit ? '#FFC93C' : '#FFFFFF')
        ctx.globalAlpha = 1
      }

      /* Вспышка взрыва */
      if (g.burstFlash > 0) {
        ctx.fillStyle = `rgba(255, 244, 214, ${Math.min(0.75, g.burstFlash)})`
        ctx.fillRect(0, 0, g.W, g.H)
        const ringK = 1 - Math.min(1, g.burstFlash / 0.5)
        ctx.strokeStyle = `rgba(255, 214, 92, ${0.7 * (1 - ringK)})`
        ctx.lineWidth = Math.max(3, 8 * u)
        ctx.beginPath()
        ctx.arc(g.cx, g.cy, g.R * (0.8 + ringK * 2.4), 0, Math.PI * 2)
        ctx.stroke()
      }

      /* ════ HUD (канвас, без React-перерисовок) ════ */
      if (g.stage === 'intro') {
        /* Заставка: большой заголовок + подсказка */
        const k = Math.min(1, g.stageT / 0.35)
        ctx.globalAlpha = k
        outlineText(S('slicer.title'), g.cx, g.cy - g.R * 1.7, 26 * u * (0.7 + 0.3 * k), '#FFC93C')
        const hint = S('slicer.hint')
        ctx.font = `600 ${Math.round(13 * u)}px system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = 'rgba(20, 8, 2, 0.8)'
        ctx.lineWidth = 3
        const lines = wrapHint(hint, g.W * 0.82)
        lines.forEach((ln, i) => {
          ctx.strokeText(ln, g.cx, g.cy + g.R * 1.55 + i * 17 * u)
          ctx.fillStyle = '#FFF4D8'
          ctx.fillText(ln, g.cx, g.cy + g.R * 1.55 + i * 17 * u)
        })
        ctx.globalAlpha = 1
      } else {
        /* Заголовок сверху + таймер-полоска */
        if (g.stage === 'slice') {
          outlineText(S('slicer.title'), g.cx, 16 * u, 15 * u, '#FFE9B0')
          const bw = Math.min(g.W * 0.6, 300 * u)
          const bh = 8 * u
          const bx = g.cx - bw / 2
          const by = 30 * u
          ctx.fillStyle = 'rgba(24, 10, 4, 0.9)'
          roundRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u, 5 * u)
          ctx.fill()
          ctx.fillStyle = '#3A2410'
          roundRect(bx, by, bw, bh, 4 * u)
          ctx.fill()
          const frac = Math.max(0, g.timeLeft / SLICE_SECONDS)
          const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0)
          grad.addColorStop(0, frac < 0.3 ? '#E5342E' : '#FFC93C')
          grad.addColorStop(1, frac < 0.3 ? '#FF6B4A' : '#FFDF7E')
          ctx.fillStyle = grad
          roundRect(bx, by, Math.max(0, bw * frac), bh, 4 * u)
          ctx.fill()
        }
        /* Очки: правый верхний угол */
        outlineText(`+${g.total}`, g.W - 14 * u, 26 * u, 26 * u, '#FFC93C', 'right')
        /* Уровень: левый верхний угол */
        outlineText(`🍿${level}`, 14 * u, 26 * u, 20 * u, '#FFF4D8', 'left')
        /* Комбо: пружинная плашка над кукурузиной */
        if (g.stage === 'slice' && g.mult >= 2) {
          const pop = Math.max(0, 1 - (now - g.comboPopT) / 0.3)
          const size = (20 + pop * 10) * u
          outlineText(
            S('slicer.combo', { n: g.mult }),
            g.cx,
            g.cy - g.R * 1.28,
            size,
            pop > 0.5 ? '#FFDF7E' : '#FFC93C',
          )
        }
        /* Полоска HP кукурузины (как у голубя-воришки) */
        if (g.stage === 'slice') {
          const bw = 150 * u
          const bh = 8 * u
          const bx = g.cx - bw / 2
          const by = g.cy + g.R * 1.22
          ctx.fillStyle = 'rgba(24, 10, 4, 0.9)'
          roundRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u, 5 * u)
          ctx.fill()
          ctx.fillStyle = '#3A2410'
          roundRect(bx, by, bw, bh, 4 * u)
          ctx.fill()
          const frac = Math.max(0, g.hp / POPCORN_HP)
          ctx.fillStyle = frac > 0.5 ? '#7ED957' : frac > 0.25 ? '#FFC93C' : '#E5342E'
          roundRect(bx, by, bw * frac, bh, 4 * u)
          ctx.fill()
        }
      }
    }
    raf = requestAnimationFrame(frame)

    /** Перенос строки подсказки по словам (canvas без wordwrap) */
    const wrapHint = (text: string, maxW: number): string[] => {
      ctx.font = `600 ${Math.round(13 * g.u)}px system-ui, sans-serif`
      const words = text.split(' ')
      const lines: string[] = []
      let cur = ''
      for (const w of words) {
        const next = cur ? `${cur} ${w}` : w
        if (ctx.measureText(next).width > maxW && cur) {
          lines.push(cur)
          cur = w
        } else {
          cur = next
        }
      }
      if (cur) lines.push(cur)
      return lines.slice(0, 3)
    }

    /** Скруглённый прямоугольник (path-only, заливка снаружи) */
    const roundRect = (x: number, y: number, w: number, h: number, r: number): void => {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, Math.max(0.1, Math.min(r, w / 2, h / 2)))
      ctx.arcTo(x + w, y + h, x, y + h, Math.max(0.1, Math.min(r, w / 2, h / 2)))
      ctx.arcTo(x, y + h, x, y, Math.max(0.1, Math.min(r, w / 2, h / 2)))
      ctx.arcTo(x, y, x + w, y, Math.max(0.1, Math.min(r, w / 2, h / 2)))
      ctx.closePath()
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [])

  /* ════ Обёртка-оверлей + карточка результата ════ */
  return (
    <motion.div
      ref={wrapRef}
      key="slicer"
      className="absolute inset-0 z-30 overflow-hidden bg-black/70 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      aria-label={t('slicer.aria')}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Карточка результата: появляется после взрыва */}
      {stage === 'results' && result && (
        <motion.div
          className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full max-w-xs rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
            initial={{ scale: 0.85, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div aria-hidden className="text-3xl">
              🍿
            </div>
            <h2 className="mt-1 font-pixel text-base font-bold text-[#B33A26] sm:text-lg">
              {t('slicer.resultTitle')}
            </h2>
            <p className="mt-1 font-pixel text-2xl font-bold text-[#3f6b28] tabular-nums">
              +{result.total}
            </p>
            {/* Звёзды результата (Fruit Ninja): 1–3 по очкам нарезки */}
            <div aria-hidden className="mt-0.5 text-xl leading-none tracking-[0.2em]">
              <span className="text-amber-500">{'★'.repeat(result.stars)}</span>
              <span className="text-[#d9c6a8]">{'★'.repeat(3 - result.stars)}</span>
            </div>
            <p className="mt-1 font-ui text-[11px] font-medium text-[#8a5330]">
              {t('slicer.swipes', { n: result.swipes })} ·{' '}
              {t('slicer.maxcombo', { n: result.maxMult })}
            </p>
            <p className="mt-1 font-pixel text-sm font-bold text-[#8a5a16]">
              {t('slicer.reward', { n: result.coins })}
            </p>
            <button
              type="button"
              aria-label={t('slicer.take')}
              onClick={() => {
                audio.play('chest')
                onDoneRef.current(result.total, { coins: result.coins })
              }}
              className="mt-3 min-h-11 w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2.5 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
            >
              {t('slicer.take')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
