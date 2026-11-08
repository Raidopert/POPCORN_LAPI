/**
 * Игровой движок «Марта и Попкорн».
 * Canvas + requestAnimationFrame, независим от React.
 */

import { audio } from './audio'
import {
  makePopcornSprite,
  makeCupSprite,
  makePawSprite,
  makeSparkleSprite,
  drawSprite,
  easeOutBack,
  easeOutQuad,
  type Sprite,
} from './sprites'

export interface EngineStats {
  score: number
  timeLeft: number
  wave: number
  carrying: number
  paused: boolean
}

export interface EngineResult {
  score: number
  waves: number
}

export interface EngineCallbacks {
  onStats?(s: EngineStats): void
  onEnd?(r: EngineResult): void
}

interface FieldPiece {
  x: number
  y: number
  rot: number
  golden: boolean
  phase: number
  spawn: number
}

interface Carried {
  golden: boolean
  grabT: number
}

interface Flying {
  x0: number
  y0: number
  golden: boolean
  t: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  t: number
  ttl: number
  color: string
  size: number
}

interface FloatText {
  x: number
  y: number
  text: string
  color: string
  t: number
  dur: number
  size: number
}

const GAME_SECONDS = 60
const CARRY_MAX = 3
const WAVE_DELAY = 0.8
const SPAWN_DUR = 0.35

/** Смещения «шапки» попкорна над стаканчиком (в единицах спрайта) */
const PUFF_POS: Array<[number, number]> = [
  [-14, -7],
  [0, -10],
  [14, -7],
  [-7, -13],
  [7, -13],
  [0, -16],
  [-15, 0],
  [15, 0],
]

export class PopcornEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private cb: EngineCallbacks
  private ro: ResizeObserver | null = null
  private raf = 0
  private lastTs = 0
  private destroyed = false

  private W = 0
  private H = 0
  private dpr = 1
  private u = 1

  phase: 'idle' | 'playing' | 'ended' = 'idle'
  paused = false

  private timeLeft = 0
  private score = 0
  private wave = 0
  private pieces: FieldPiece[] = []
  private carried: Carried[] = []
  private flying: Flying[] = []
  private particles: Particle[] = []
  private texts: FloatText[] = []
  private paw = { x: 0, y: 0, tx: 0, ty: 0, seen: false, pulse: 0 }
  private cup = { x: 0, y: 0, squash: 0 }
  private banner = { text: '', t: 99 }
  private waveDelay = -1
  private lastSec = -1
  private lastStatsKey = ''

  private cupScale = 5
  private cupH = 0

  private sp: {
    popcorn: Sprite
    golden: Sprite
    cup: Sprite
    paw: Sprite
    sparkle: Sprite
  }

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.cb = cb
    this.sp = {
      popcorn: makePopcornSprite(false),
      golden: makePopcornSprite(true),
      cup: makeCupSprite(),
      paw: makePawSprite(),
      sparkle: makeSparkleSprite(),
    }
    this.canvas.addEventListener('pointerdown', this.onPointer)
    this.canvas.addEventListener('pointermove', this.onPointer)
    this.resize()
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize())
      if (this.canvas.parentElement) this.ro.observe(this.canvas.parentElement)
    }
    this.lastTs = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  destroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.raf)
    this.ro?.disconnect()
    this.canvas.removeEventListener('pointerdown', this.onPointer)
    this.canvas.removeEventListener('pointermove', this.onPointer)
  }

  /* ================= публичное API ================= */

  start(): void {
    this.phase = 'playing'
    this.paused = false
    this.timeLeft = GAME_SECONDS
    this.score = 0
    this.wave = 1
    this.pieces = []
    this.carried = []
    this.flying = []
    this.particles = []
    this.texts = []
    this.waveDelay = -1
    this.lastSec = GAME_SECONDS
    this.banner = { text: 'ВОЛНА 1', t: 0 }
    if (!this.paw.seen) {
      this.paw.x = this.cup.x
      this.paw.y = this.H * 0.4
      this.paw.tx = this.paw.x
      this.paw.ty = this.paw.y
    }
    audio.play('wave')
    this.spawnWave()
    this.emitStats(true)
  }

  setPaused(p: boolean): void {
    if (this.phase !== 'playing') return
    this.paused = p
    this.emitStats(true)
  }

  /* ================= ввод ================= */

  private onPointer = (e: PointerEvent): void => {
    if (this.phase !== 'playing' || this.paused) return
    const r = this.canvas.getBoundingClientRect()
    const lift = e.pointerType === 'touch' ? 64 * this.u : 0
    this.paw.tx = e.clientX - r.left
    this.paw.ty = e.clientY - r.top - lift
    this.paw.seen = true
  }

  /* ================= размеры ================= */

  private resize(): void {
    const el = this.canvas.parentElement
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    if (w === 0 || h === 0) return

    const oldW = this.W
    const oldH = this.H
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.W = w
    this.H = h
    this.canvas.width = Math.round(w * this.dpr)
    this.canvas.height = Math.round(h * this.dpr)
    this.canvas.style.width = `${w}px`
    this.canvas.style.height = `${h}px`
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.ctx.imageSmoothingEnabled = false

    this.u = Math.max(0.7, Math.min(1.5, Math.min(w, h) / 420))

    if (oldW > 0 && oldH > 0 && (oldW !== w || oldH !== h)) {
      const kx = w / oldW
      const ky = h / oldH
      for (const p of this.pieces) {
        p.x *= kx
        p.y *= ky
      }
      this.paw.x *= kx
      this.paw.y *= ky
      this.paw.tx *= kx
      this.paw.ty *= ky
    }

    this.cupScale = 4.6 * this.u
    this.cupH = 26 * this.cupScale
    this.cup.x = w / 2
    this.cup.y = h - this.cupH / 2 - 12 * this.u
  }

  /* ================= волны ================= */

  private spawnWave(): void {
    const count = Math.min(15, 8 + this.wave)
    for (let i = 0; i < count; i++) this.spawnPiece(i)
  }

  private spawnPiece(index: number): void {
    const u = this.u
    const mX = 46 * u
    const top = 80 + 16 * u
    const bottom = this.H - 46 * u
    let x = this.W / 2
    let y = this.H / 2
    for (let tries = 0; tries < 30; tries++) {
      x = mX + Math.random() * (this.W - mX * 2)
      y = top + Math.random() * Math.max(10, bottom - top)
      const dc = Math.hypot(x - this.cup.x, y - this.cup.y)
      if (dc > 135 * u) break
    }
    this.pieces.push({
      x,
      y,
      rot: (Math.random() - 0.5) * 0.7,
      golden: Math.random() < 0.12,
      phase: Math.random() * Math.PI * 2,
      spawn: SPAWN_DUR + index * 0.045,
    })
  }

  /* ================= обновление ================= */

  private update(dt: number): void {
    const u = this.u

    // Плавное следование лапки за пальцем/курсором
    if (!this.paw.seen) {
      this.paw.tx = this.cup.x + Math.sin(performance.now() * 0.001) * 80 * u
      this.paw.ty = this.H * 0.35
    }
    const k = 1 - Math.exp(-dt * 14)
    this.paw.x += (this.paw.tx - this.paw.x) * k
    this.paw.y += (this.paw.ty - this.paw.y) * k
    this.paw.x = Math.max(22 * u, Math.min(this.W - 22 * u, this.paw.x))
    this.paw.y = Math.max(70, Math.min(this.H - 20 * u, this.paw.y))

    // Подбор попкорна
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i]
      if (p.spawn > 0.12) continue
      const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y)
      if (d < 40 * u && this.carried.length < CARRY_MAX) {
        this.pieces.splice(i, 1)
        this.carried.push({ golden: p.golden, grabT: 0 })
        this.paw.pulse = 1
        this.crumbs(p.x, p.y, p.golden ? '#FFE066' : '#FFF3D6', 6)
        audio.play(p.golden ? 'golden' : 'pickup')
      }
    }

    // Высыпание в стаканчик
    if (this.carried.length > 0) {
      const dc = Math.hypot(this.paw.x - this.cup.x, this.paw.y - this.cup.y)
      if (dc < 78 * u) {
        let sum = 0
        let hasGold = false
        for (const c of this.carried) {
          sum += c.golden ? 5 : 1
          hasGold = hasGold || c.golden
        }
        this.carried.forEach((c, i) => {
          this.flying.push({
            x0: this.paw.x + (i - 1) * 8 * u,
            y0: this.paw.y - 20 * u - i * 10 * u,
            golden: c.golden,
            t: 0,
          })
        })
        this.carried = []
        this.score += sum
        this.cup.squash = 1
        this.texts.push({
          x: this.cup.x,
          y: this.cup.y - this.cupH * 0.8,
          text: `+${sum}`,
          color: hasGold ? '#FFC93C' : '#FFFFFF',
          t: 0,
          dur: 0.9,
          size: 26 * u,
        })
        audio.play('deposit')
      }
    }

    // Летящие в стаканчик зёрна
    for (let i = this.flying.length - 1; i >= 0; i--) {
      const f = this.flying[i]
      f.t += dt / 0.3
      if (f.t >= 1) {
        this.flying.splice(i, 1)
        this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.5, '#FFF6EC', 3)
      }
    }

    // Волна собрана → следующая
    if (
      this.waveDelay < 0 &&
      this.pieces.length === 0 &&
      this.carried.length === 0 &&
      this.flying.length === 0
    ) {
      this.waveDelay = WAVE_DELAY
    }
    if (this.waveDelay >= 0) {
      this.waveDelay -= dt
      if (this.waveDelay <= 0) {
        this.waveDelay = -1
        this.wave++
        this.banner = { text: `ВОЛНА ${this.wave}`, t: 0 }
        audio.play('wave')
        this.spawnWave()
      }
    }

    // Таймер
    this.timeLeft -= dt
    const sec = Math.max(0, Math.ceil(this.timeLeft))
    if (sec !== this.lastSec) {
      this.lastSec = sec
      if (sec <= 5 && sec > 0) audio.play('tick')
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0
      this.end()
      return
    }

    // Косметика
    this.paw.pulse = Math.max(0, this.paw.pulse - dt * 5)
    this.cup.squash = Math.max(0, this.cup.squash - dt * 4)
    this.banner.t += dt
    for (const p of this.pieces) p.spawn = Math.max(0, p.spawn - dt)
    for (const c of this.carried) c.grabT = Math.min(1, c.grabT + dt * 8)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.t += dt
      p.vy += 900 * u * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.t >= p.ttl) this.particles.splice(i, 1)
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i]
      t.t += dt
      if (t.t >= t.dur) this.texts.splice(i, 1)
    }
  }

  private end(): void {
    this.phase = 'ended'
    audio.stopMusic()
    audio.play('gameover')
    this.emitStats(true)
    this.cb.onEnd?.({ score: this.score, waves: this.wave })
  }

  private crumbs(x: number, y: number, color: string, n: number): void {
    const u = this.u
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = (60 + Math.random() * 120) * u
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60 * u,
        t: 0,
        ttl: 0.35 + Math.random() * 0.25,
        color,
        size: (2 + Math.random() * 2.5) * u,
      })
    }
  }

  /* ================= цикл ================= */

  private loop = (ts: number): void => {
    if (this.destroyed) return
    const dt = Math.min(0.05, (ts - this.lastTs) / 1000)
    this.lastTs = ts
    if (this.phase === 'playing' && !this.paused) this.update(dt)
    this.render(ts)
    this.emitStats(false)
    this.raf = requestAnimationFrame(this.loop)
  }

  private emitStats(force: boolean): void {
    if (!this.cb.onStats) return
    const sec = Math.ceil(this.timeLeft)
    const key = `${this.score}|${this.wave}|${this.carried.length}|${sec}|${this.paused}`
    if (!force && key === this.lastStatsKey) return
    this.lastStatsKey = key
    this.cb.onStats({
      score: this.score,
      timeLeft: this.timeLeft,
      wave: this.wave,
      carrying: this.carried.length,
      paused: this.paused,
    })
  }

  /* ================= отрисовка ================= */

  private render(ts: number): void {
    const { ctx } = this
    ctx.clearRect(0, 0, this.W, this.H)
    if (this.phase === 'idle') return

    this.drawCup()
    this.drawPieces(ts)
    this.drawFlying()
    this.drawParticles()
    this.drawPaw(ts)
    this.drawTexts()
    this.drawBanner()

    if (this.phase === 'ended') {
      ctx.fillStyle = 'rgba(24, 10, 4, 0.35)'
      ctx.fillRect(0, 0, this.W, this.H)
    }
  }

  private drawCup(): void {
    const { ctx } = this
    const s = this.cupScale
    const sq = this.cup.squash
    const sx = 1 + 0.08 * sq
    const sy = 1 - 0.1 * sq

    // Тень
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.beginPath()
    ctx.ellipse(
      this.cup.x,
      this.cup.y + (this.cupH / 2) * sy + 5 * this.u,
      48 * this.u * sx,
      10 * this.u,
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    // «Шапка» попкорна за стаканчиком
    const puffs = Math.min(PUFF_POS.length, Math.floor(this.score / 6))
    const mouthY = this.cup.y - 13 * s * sy
    for (let i = 0; i < puffs; i++) {
      const [ox, oy] = PUFF_POS[i]
      drawSprite(ctx, this.sp.popcorn, this.cup.x + ox * s * 0.85, mouthY + oy * s * 0.75, s * 0.52, {
        rot: i * 0.7,
      })
    }

    // Корпус стаканчика
    drawSprite(ctx, this.sp.cup, this.cup.x, this.cup.y, s, { sx, sy })
  }

  private drawPieces(ts: number): void {
    const { ctx } = this
    const u = this.u
    for (const p of this.pieces) {
      const bob = Math.sin(ts * 0.004 + p.phase) * 2.5 * u
      const y = p.y + bob
      const pop = p.spawn > 0 ? easeOutBack(1 - p.spawn / (SPAWN_DUR + 0.5)) : 1
      const scale = 2.6 * u * Math.max(0.05, pop)

      // Тень
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'
      ctx.beginPath()
      ctx.ellipse(p.x, p.y + 9 * u, 12 * u * pop, 4 * u * pop, 0, 0, Math.PI * 2)
      ctx.fill()

      drawSprite(ctx, p.golden ? this.sp.golden : this.sp.popcorn, p.x, y, scale, { rot: p.rot })
      if (p.golden) {
        drawSprite(ctx, this.sp.sparkle, p.x + 10 * u, y - 11 * u, 1.15 * u, {
          rot: ts * 0.004,
          alpha: 0.95,
        })
      }
    }
  }

  private drawFlying(): void {
    const { ctx } = this
    const u = this.u
    const tx = this.cup.x
    const ty = this.cup.y - 10 * this.cupScale
    for (const f of this.flying) {
      const q = easeOutQuad(f.t)
      const x = f.x0 + (tx - f.x0) * q
      const y = f.y0 + (ty - f.y0) * q - Math.sin(q * Math.PI) * 30 * u
      drawSprite(ctx, f.golden ? this.sp.golden : this.sp.popcorn, x, y, 2.6 * u * (1 - 0.45 * q), {
        rot: q * 3,
      })
    }
  }

  private drawPaw(ts: number): void {
    const { ctx } = this
    const u = this.u
    if (!this.paw.seen && this.phase === 'idle') return

    // Тень лапки
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.beginPath()
    ctx.ellipse(this.paw.x, this.paw.y + 22 * u, 22 * u, 6.5 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    const s = 3.1 * u * (1 + 0.13 * this.paw.pulse)
    drawSprite(ctx, this.sp.paw, this.paw.x, this.paw.y, s)

    // Зёрна в лапке (стопкой над подушечкой)
    this.carried.forEach((c, i) => {
      const wig = Math.sin(ts * 0.012 + i * 2) * 1.6 * u
      const y = this.paw.y - 22 * u - i * 13 * u + (1 - c.grabT) * 10 * u
      drawSprite(ctx, c.golden ? this.sp.golden : this.sp.popcorn, this.paw.x + wig, y, 2.15 * u, {
        rot: Math.sin(ts * 0.006 + i) * 0.12,
      })
    })
  }

  private drawParticles(): void {
    const { ctx } = this
    for (const p of this.particles) {
      ctx.globalAlpha = 1 - p.t / p.ttl
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1
  }

  private drawTexts(): void {
    const { ctx } = this
    for (const t of this.texts) {
      const q = t.t / t.dur
      const alpha = q < 0.15 ? q / 0.15 : 1 - Math.max(0, (q - 0.55) / 0.45)
      const y = t.y - 42 * this.u * q
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.font = `700 ${t.size}px "Pixelify Sans", system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineWidth = Math.max(3, t.size * 0.16)
      ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)'
      ctx.strokeText(t.text, t.x, y)
      ctx.fillStyle = t.color
      ctx.fillText(t.text, t.x, y)
      ctx.restore()
    }
  }

  private drawBanner(): void {
    if (this.banner.t > 1.5) return
    const { ctx } = this
    const t = this.banner.t
    const alpha = t < 0.2 ? t / 0.2 : t > 1.1 ? Math.max(0, (1.5 - t) / 0.4) : 1
    const pop = 1 + Math.max(0, 1 - t / 0.25) * 0.5
    const size = 34 * this.u * pop
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `700 ${size}px "Pixelify Sans", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = Math.max(4, size * 0.18)
    ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)'
    ctx.strokeText(this.banner.text, this.W / 2, this.H * 0.3)
    ctx.fillStyle = '#FFE066'
    ctx.fillText(this.banner.text, this.W / 2, this.H * 0.3)
    ctx.restore()
  }
}
