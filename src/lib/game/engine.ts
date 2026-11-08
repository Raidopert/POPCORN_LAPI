/**
 * Игровой движок «Кошачий попкорнный Беспредел» — рогалик-режим.
 * Canvas + requestAnimationFrame, независим от React.
 *
 * Игра бесконечна: каждый уровень = 60 секунд и норма (квота) попкорна.
 * Выполнил норму → уровень пройден, сундучок с перком, дальше сложнее.
 * Не успел → конец забега. Перки меняют правила одного уровня.
 */

import { audio } from './audio'
import { quotaFor, type PerkId } from './perks'
import {
  makePopcornSprite,
  makeCupSprite,
  makePawSprite,
  makeSparkleSprite,
  makeCornSprite,
  drawSprite,
  easeOutBack,
  easeOutQuad,
  type Sprite,
} from './sprites'

export interface EngineStats {
  score: number
  timeLeft: number
  duration: number
  level: number
  quota: number
  collected: number
  carrying: number
  paused: boolean
}

export interface LevelResult {
  level: number
  score: number
  bonus: number
}

export interface EndResult {
  score: number
  level: number
}

export interface EngineCallbacks {
  onStats?(s: EngineStats): void
  onLevelComplete?(r: LevelResult): void
  onEnd?(r: EndResult): void
}

type PieceKind = 'popcorn' | 'golden' | 'corn'

interface FieldPiece {
  x: number
  y: number
  rot: number
  kind: PieceKind
  phase: number
  spawn: number
  /** угол дрейфа для перка «Скользкий пол» */
  dA: number
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

const LEVEL_SECONDS = 60
const LEVEL_SECONDS_PERK = 75 // перк «Кошачьи часы»
const CARRY_MAX = 3
const SPAWN_DUR = 0.35
const CORN_MAX = 12 // максимум мин одновременно на поле
const CLEAR_DELAY = 0.5 // пауза до «уровень пройден», чтобы зёрна долетели

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
  private raf = 0
  private lastTs = 0
  private destroyed = false

  private W = 0
  private H = 0
  private dpr = 1
  private u = 1

  phase: 'idle' | 'playing' | 'clear' | 'ended' = 'idle'
  paused = false

  private timeLeft = 0
  private duration = LEVEL_SECONDS
  private score = 0
  private lvl = 1
  private perk: PerkId | null = null
  private quota = 10
  private collected = 0
  private wave = 1
  private waveSize = 7
  private cornChance = 0.12
  private goldenChance = 0.12
  private baseWaveDelay = 0.82
  private waveDelay = -1
  private pendingClear = -1
  private debugFast = false

  private pieces: FieldPiece[] = []
  private carried: Carried[] = []
  private flying: Flying[] = []
  private particles: Particle[] = []
  private texts: FloatText[] = []
  private paw = { x: 0, y: 0, tx: 0, ty: 0, seen: false, pulse: 0, hurt: 0 }
  private cup = { x: 0, y: 0, squash: 0 }
  private banner = { text: '', t: 99 }
  private lastSec = -1
  private audioStage = -1
  private lastStatsKey = ''

  private cupScale = 5
  private cupH = 0

  private sp: {
    popcorn: Sprite
    golden: Sprite
    corn: Sprite
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
      corn: makeCornSprite(),
      cup: makeCupSprite(),
      paw: makePawSprite(),
      sparkle: makeSparkleSprite(),
    }
    this.lastTs = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  destroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.raf)
  }

  /* ================= публичное API ================= */

  /** Новый забег: счёт с нуля, уровень 1 без перка */
  startRun(opts: { fast?: boolean } = {}): void {
    this.debugFast = !!opts.fast
    this.score = 0
    this.startLevel(1, null)
  }

  /** Следующий уровень забега (счёт сохраняется) */
  startLevel(level: number, perk: PerkId | null): void {
    this.lvl = level
    this.perk = perk
    this.duration = perk === 'timeplus' ? LEVEL_SECONDS_PERK : LEVEL_SECONDS
    this.quota = this.debugFast ? 3 : quotaFor(level, perk === 'doublepoints')
    this.collected = 0
    this.wave = 1
    this.waveSize = Math.min(16, 7 + Math.floor(level * 0.8))
    this.cornChance = Math.min(0.3, 0.12 + (level - 1) * 0.02)
    if (perk === 'cornrain') this.cornChance = Math.min(0.5, this.cornChance * 2)
    this.goldenChance = perk === 'goldenvein' ? 0.26 : 0.12
    this.baseWaveDelay = Math.max(0.35, 0.82 - (level - 1) * 0.04)

    this.phase = 'playing'
    this.paused = false
    this.timeLeft = this.duration
    this.pendingClear = -1
    this.pieces = []
    this.carried = []
    this.flying = []
    this.particles = []
    this.texts = []
    this.waveDelay = -1
    this.lastSec = Math.ceil(this.timeLeft)
    this.banner = { text: `УРОВЕНЬ ${level}`, t: 0 }
    audio.setIntensity(0)
    audio.setMusicLevel(level >= 3 ? 1 : 0)
    this.audioStage = 0
    if (!this.paw.seen) {
      this.paw.x = this.cup.x
      this.paw.y = this.H * 0.4
      this.paw.tx = this.paw.x
      this.paw.ty = this.paw.y
    }
    this.paw.hurt = 0
    audio.play('wave')
    this.spawnWave()
    this.emitStats(true)
  }

  setPaused(p: boolean): void {
    if (this.phase !== 'playing') return
    this.paused = p
    this.emitStats(true)
  }

  /** Координаты в системе игрового поля (трансформации экрана считает компонент) */
  setPointer(x: number, y: number, lift = 0): void {
    if (this.phase !== 'playing' || this.paused) return
    this.paw.tx = x
    this.paw.ty = y - lift * this.u
    this.paw.seen = true
  }

  /* ================= размеры ================= */

  /** Размер игрового поля в CSS-пикселях (задаёт компонент с учётом перков) */
  handleResize(w: number, h: number): void {
    if (w === 0 || h === 0) return

    const oldW = this.W
    const oldH = this.H
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.W = w
    this.H = h
    this.canvas.width = Math.round(w * this.dpr)
    this.canvas.height = Math.round(h * this.dpr)
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
    let cornOnField = this.pieces.filter((p) => p.kind === 'corn').length
    for (let i = 0; i < this.waveSize; i++) {
      const kind = this.decideKind(cornOnField)
      if (kind === 'corn') cornOnField++
      this.spawnPiece(i, kind)
    }
  }

  private decideKind(cornOnField: number): PieceKind {
    const r = Math.random()
    if (r < this.cornChance && cornOnField < CORN_MAX) return 'corn'
    return Math.random() < this.goldenChance ? 'golden' : 'popcorn'
  }

  private spawnPiece(index: number, kind: PieceKind): void {
    const u = this.u
    const mX = 46 * u
    const top = 80 + 16 * u
    const bottom = this.H - 46 * u
    let x = this.W / 2
    let y = this.H / 2
    for (let tries = 0; tries < 40; tries++) {
      x = mX + Math.random() * (this.W - mX * 2)
      y = top + Math.random() * Math.max(10, bottom - top)
      const dc = Math.hypot(x - this.cup.x, y - this.cup.y)
      if (dc <= 135 * u) continue
      // не даём зёрнам застрять в кластере — маршрут всегда проходим
      let crowded = false
      for (const q of this.pieces) {
        if (Math.hypot(x - q.x, y - q.y) < 40 * u) {
          crowded = true
          break
        }
      }
      if (!crowded) break
    }
    this.pieces.push({
      x,
      y,
      rot: (Math.random() - 0.5) * 0.7,
      kind,
      phase: Math.random() * Math.PI * 2,
      spawn: SPAWN_DUR + index * 0.045,
      dA: Math.random() * Math.PI * 2,
    })
  }

  /* ================= перки-механики ================= */

  /** «Скользкий пол»: зёрна катаются по полу */
  private driftPieces(dt: number): void {
    const u = this.u
    const sp = 17 * u
    const mX = 34 * u
    const top = 90
    const bottom = this.H - 42 * u
    for (const p of this.pieces) {
      p.dA += (Math.random() - 0.5) * dt * 2.4
      p.x += Math.cos(p.dA) * sp * dt
      p.y += Math.sin(p.dA) * sp * dt
      if (p.x < mX) {
        p.x = mX
        p.dA = Math.PI - p.dA
      }
      if (p.x > this.W - mX) {
        p.x = this.W - mX
        p.dA = Math.PI - p.dA
      }
      if (p.y < top) {
        p.y = top
        p.dA = -p.dA
      }
      if (p.y > bottom) {
        p.y = bottom
        p.dA = -p.dA
      }
    }
  }

  /** «Магнитная лапа»: попкорн сам тянется к лапке */
  private magnetPull(dt: number): void {
    const u = this.u
    const r = 115 * u
    const k = Math.min(1, dt * 3.4)
    for (const p of this.pieces) {
      if (p.kind === 'corn' || p.spawn > 0.12) continue
      const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y)
      if (d < r && d > 1) {
        p.x += (this.paw.x - p.x) * k
        p.y += (this.paw.y - p.y) * k
      }
    }
  }

  /* ================= обновление ================= */

  private update(dt: number): void {
    const u = this.u

    // Плавное следование лапки за пальцем/курсором («Тяжёлая лапа» — вдвое медленнее)
    if (!this.paw.seen) {
      this.paw.tx = this.cup.x + Math.sin(performance.now() * 0.001) * 80 * u
      this.paw.ty = this.H * 0.35
    }
    const k = 1 - Math.exp(-dt * (this.perk === 'slowpaw' ? 6.5 : 14))
    this.paw.x += (this.paw.tx - this.paw.x) * k
    this.paw.y += (this.paw.ty - this.paw.y) * k
    this.paw.x = Math.max(22 * u, Math.min(this.W - 22 * u, this.paw.x))
    this.paw.y = Math.max(70, Math.min(this.H - 20 * u, this.paw.y))

    if (this.perk === 'drift') this.driftPieces(dt)
    if (this.perk === 'magnet') this.magnetPull(dt)

    // Радиус подбора зависит от перка лапки
    const grabR = (this.perk === 'bigpaw' ? 58 : this.perk === 'smallpaw' ? 34 : 44) * u

    // Подбор попкорна / ловушка-кукуруза
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i]
      if (p.spawn > 0.12) continue
      const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y)
      if (p.kind === 'corn') {
        // Кукуруза — мина: задел = минус балл
        if (d < 38 * u) {
          this.pieces.splice(i, 1)
          this.score = Math.max(0, this.score - 1)
          this.paw.hurt = 1
          this.texts.push({
            x: this.paw.x,
            y: this.paw.y - 34 * u,
            text: '-1',
            color: '#FF6B5E',
            t: 0,
            dur: 0.9,
            size: 24 * u,
          })
          this.crumbs(p.x, p.y, '#E8960C', 7)
          audio.play('penalty')
        }
        continue
      }
      if (d < grabR && this.carried.length < CARRY_MAX) {
        this.pieces.splice(i, 1)
        this.carried.push({ golden: p.kind === 'golden', grabT: 0 })
        this.paw.pulse = 1
        this.crumbs(p.x, p.y, p.kind === 'golden' ? '#FFE066' : '#FFF3D6', 6)
        audio.play(p.kind === 'golden' ? 'golden' : 'pickup')
      }
    }

    // Высыпание в стаканчик
    if (this.carried.length > 0) {
      const dc = Math.hypot(this.paw.x - this.cup.x, this.paw.y - this.cup.y)
      if (dc < 78 * u) {
        let base = 0
        let hasGold = false
        for (const c of this.carried) {
          base += c.golden ? 5 : 1
          hasGold = hasGold || c.golden
        }
        const mult = this.perk === 'doublepoints' ? 2 : 1
        const sum = base * mult
        this.collected += this.carried.length
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

    // Вся волна собрана → следующая. Кукуруза-мины НЕ мешает: считаем только попкорн
    const hasPopcorn = this.pieces.some((p) => p.kind !== 'corn')
    if (
      this.waveDelay < 0 &&
      !hasPopcorn &&
      this.carried.length === 0 &&
      this.flying.length === 0
    ) {
      this.waveDelay = this.baseWaveDelay
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

    // Норма выполнена → короткая пауза (зёрна долетают) → уровень пройден
    if (this.pendingClear < 0 && this.collected >= this.quota) {
      this.pendingClear = CLEAR_DELAY
    }
    if (this.pendingClear >= 0) {
      this.pendingClear -= dt
      if (this.pendingClear <= 0) {
        this.levelComplete()
        return
      }
    }

    // Музыка зависит от оставшегося времени: >30с база, ≤30с +25%, ≤15с +40%, ≤5с 240 BPM
    const stage = this.timeLeft > 30 ? 0 : this.timeLeft > 15 ? 1 : this.timeLeft > 5 ? 2 : 3
    if (stage !== this.audioStage) {
      this.audioStage = stage
      audio.setIntensity(stage)
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
    this.paw.hurt = Math.max(0, this.paw.hurt - dt * 2.2)
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

  private levelComplete(): void {
    this.phase = 'clear'
    const bonus = Math.ceil(this.timeLeft)
    this.score += bonus
    audio.stopMusic()
    audio.play('levelwin')
    this.emitStats(true)
    this.cb.onLevelComplete?.({ level: this.lvl, score: this.score, bonus })
  }

  private end(): void {
    this.phase = 'ended'
    audio.stopMusic()
    audio.play('gameover')
    this.emitStats(true)
    this.cb.onEnd?.({ score: this.score, level: this.lvl })
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
    if (this.phase === 'playing' && !this.paused) {
      try {
        this.update(dt)
      } catch (err) {
        // Сбой кадра не должен замораживать игру — логируем и продолжаем
        console.error('[popcorn] update error:', err)
      }
    }
    this.render(ts)
    this.emitStats(false)
    this.raf = requestAnimationFrame(this.loop)
  }

  private emitStats(force: boolean): void {
    if (!this.cb.onStats) return
    const sec = Math.ceil(this.timeLeft)
    const key = `${this.score}|${this.lvl}|${this.quota}|${this.collected}|${this.carried.length}|${sec}|${this.paused}`
    if (!force && key === this.lastStatsKey) return
    this.lastStatsKey = key
    this.cb.onStats({
      score: this.score,
      timeLeft: this.timeLeft,
      duration: this.duration,
      level: this.lvl,
      quota: this.quota,
      collected: this.collected,
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
    if (this.perk === 'fog' && this.phase === 'playing') this.drawFog()

    if (this.phase === 'ended' || this.phase === 'clear') {
      ctx.fillStyle = 'rgba(24, 10, 4, 0.35)'
      ctx.fillRect(0, 0, this.W, this.H)
    }
  }

  /** «Попкорнный туман»: ступенчатые кольца темноты вокруг лапки (8-битный стиль) */
  private drawFog(): void {
    const { ctx } = this
    const u = this.u
    const rings: Array<[number, number]> = [
      [150, 0.86],
      [120, 0.8],
      [95, 0.66],
      [72, 0.45],
      [52, 0.22],
    ]
    for (const [r, a] of rings) {
      ctx.fillStyle = `rgba(12, 6, 2, ${a})`
      ctx.beginPath()
      ctx.rect(0, 0, this.W, this.H)
      ctx.arc(this.paw.x, this.paw.y, r * u, 0, Math.PI * 2)
      ctx.fill('evenodd')
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

    // «Шапка» попкорна растёт вместе с выполнением нормы
    const progress = this.quota > 0 ? this.collected / this.quota : 0
    const puffs = Math.min(PUFF_POS.length, Math.ceil(progress * PUFF_POS.length))
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
      // Мины-зерна статичны (никаких прыжков) — попкорн слегка «дышит»
      const bobAmp = p.kind === 'corn' ? 0 : 2.5
      const bob = Math.sin(ts * 0.004 + p.phase) * bobAmp * u
      const y = p.y + bob
      const pop = p.spawn > 0 ? easeOutBack(1 - p.spawn / (SPAWN_DUR + 0.5)) : 1
      const base = p.kind === 'corn' ? 2.3 : 2.6
      const scale = base * u * Math.max(0.05, pop)

      // Тень
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'
      ctx.beginPath()
      ctx.ellipse(p.x, p.y + 9 * u, 12 * u * pop, 4 * u * pop, 0, 0, Math.PI * 2)
      ctx.fill()

      const sprite = p.kind === 'corn' ? this.sp.corn : p.kind === 'golden' ? this.sp.golden : this.sp.popcorn
      drawSprite(ctx, sprite, p.x, y, scale, { rot: p.rot })
      if (p.kind === 'golden') {
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

    // Тряска при штрафе + сильная дрожь перка «Нервная лапа»
    const shake = Math.sin(ts * 0.055) * 5 * this.paw.hurt
    const shiver = this.perk === 'shaky'
    const jx = shiver ? Math.sin(ts * 0.021) * 9 * u + Math.sin(ts * 0.047) * 6 * u : 0
    const jy = shiver ? Math.cos(ts * 0.017) * 7 * u + Math.sin(ts * 0.053) * 4 * u : 0
    const px = this.paw.x + shake + jx
    const py = this.paw.y + jy

    // Тень лапки
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.beginPath()
    ctx.ellipse(px, py + 28 * u, 26 * u, 7 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    const basePaw = this.perk === 'bigpaw' ? 4.8 : this.perk === 'smallpaw' ? 2.9 : 3.8
    const s = basePaw * u * (1 + 0.13 * this.paw.pulse)
    drawSprite(ctx, this.sp.paw, px, py, s)

    // Зёрна в лапке (стопкой над подушечкой)
    this.carried.forEach((c, i) => {
      const wig = Math.sin(ts * 0.012 + i * 2) * 1.6 * u
      const y = py - 32 * u - i * 15 * u + (1 - c.grabT) * 10 * u
      drawSprite(ctx, c.golden ? this.sp.golden : this.sp.popcorn, px + wig, y, 2.3 * u, {
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
      ctx.font = `600 ${t.size}px "Handjet", system-ui, sans-serif`
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
    ctx.font = `700 ${size}px "Handjet", system-ui, sans-serif`
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
