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
import { PAW_MAP, type PawBonus, type PawId } from './paws'
import {
  makePopcornSprite,
  makeCupSprite,
  makePawSprite,
  makeSparkleSprite,
  makeCornSprite,
  makePigeonSprite,
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
  carryMax: number
  freezeLeft: number
  paused: boolean
  /** Комбо: серия удачных сдач подряд (сбрасывается миной или голубем) */
  streak: number
  /** Текущий множитель комбо ×1..×5 */
  comboMult: number
  /** Золотых зёрен поймано за забег (для достижений) */
  goldenCount: number
  /** Прогнано голубей за забег (для достижений) */
  pigeonShooed: number
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

/** Голубь-воришка: влетает, висит над стаканчиком и таскает попкорн */
interface Pigeon {
  x: number
  y: number
  state: 'in' | 'hover' | 'flee'
  stateT: number
  peckT: number
  /** борт, с которого прилетел: −1 слева, 1 справа */
  side: 1 | -1
  hx: number
  hy: number
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
const SPAWN_DUR = 0.35
const CLEAR_DELAY = 0.5 // пауза до «уровень пройден», чтобы зёрна долетели
const FREEZE_SECONDS = 5 // бонус кота: столько секунд стоит таймер
const CAT_VISIT_SECONDS = 5 // сколько секунд кот ждёт в начале уровня, пока не ткнут в лапку
const PIGEON_FIRST_AT = 11 // голубь прилетает на этом отрезке уровня (с 3-го уровня)
const PIGEON_PECK_EVERY = 2.2 // раз в сколько секунд голубь таскает зерно
const PIGEON_RESPAWN = [18, 30] // диапазон возврата после прогона, секунд
const REVIVE_SECONDS = 15 // «девятая жизнь»: столько секунд даёт второй шанс

/** Точки наполнения ВНУТРИ стаканчика (в единицах спрайта от центра).
 *  Зёрна рисуются «за бумажной стенкой» — их не путают с попкорном на поле. */
const CUP_FILL_POS: Array<[number, number]> = [
  [-4, 7.4],
  [4, 7.4],
  [-6.5, 2.6],
  [0.5, 3.2],
  [6.8, 2.2],
  [-3.4, -2.6],
  [4.2, -3.2],
  [0, -7.6],
]

/** Пиксельный кот-бонус (голова + туловище + хвост), 20×16 клеток.
 *  o — контур · O — шерсть · D — полоски · P — ушки · E — глаза · W — мордочка · N — нос */
const CAT_BODY: string[] = [
  '..oo............oo..',
  '.oPPo..........oPPo.',
  '.oPOooooooooooooPOo.',
  '..oOOOOOOOOOOOOOOo..',
  '..oODDOOOOOOOODDOo..',
  '..oOOOOOOOOOOOOOOo..',
  '..oOOEEOOOOOOEEOOo..',
  '..oOOEEOOOOOOEEOOo..',
  '..oOOOooWWWWooOOOo..',
  '..oOOOOWNNWWOOOOo...',
  '..oOOOOWWWWOOOOOo...',
  '..ooOOOOOOOOOOOOoo..',
  '...oOODDOOOODDOOo...',
  '...oOOOOOOOOOOOOo.oo',
  '...oOOOOOOOOOOOOooDo',
  '....oooooooooooo..o.',
]

const CAT_COLORS: Record<string, string> = {
  o: '#46220C',
  O: '#F0A24A',
  D: '#D97F2B',
  P: '#E8746A',
  E: '#2B1408',
  W: '#FFF3E2',
  N: '#B4552D',
}

export class PopcornEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private cb: EngineCallbacks
  private raf = 0
  private lastTs = 0
  private destroyed = false
  /** Телефон/планшет: меньше частиц и ниже разрешение — ради плавных 60 FPS */
  private coarse = false
  /** Троттлинг вибрации: чаще, чем раз в 80 мс — нельзя (лаги на Android) */
  private lastBuzzAt = 0

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
  private quota = 9
  private collected = 0
  /** Постоянные улучшения из магазина лапок (действуют весь забег и все забеги) */
  private pawBonus: PawBonus = {}
  private wave = 1
  private popPerWave = 10
  private cornPerWave = 3
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

  /* --- комбо: серия удачных сдач без мины --- */
  private streak = 0
  /* --- счётчики забега для достижений --- */
  private goldenCount = 0
  private pigeonsRun = 0
  /* --- голубь-воришка --- */
  private pigeon: Pigeon | null = null
  private pigeonTimer = -1
  /* --- перк «Кошачий щит»: одно прощение мины за уровень --- */
  private shieldLeft = 0
  /* --- постоянный апгрейд «Большой стаканчик» (+вместимость) --- */
  private upgCarry = 0
  /* --- «Девятая жизнь»: второй шанс уже использован в этом забеге? --- */
  private lifeUsed = false

  /* --- кот-помощник и фриз-тайм --- */
  private cat: { t: number; state: 'in' | 'idle' | 'happy' | 'out'; stateT: number } | null = null
  private freezeLeft = 0
  private lastFreezeSec = -1

  private cupScale = 5
  private cupH = 0

  private sp: {
    popcorn: Sprite
    golden: Sprite
    corn: Sprite
    cup: Sprite
    paw: Sprite
    sparkle: Sprite
    pigeon0: Sprite
    pigeon1: Sprite
  }

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: true })!
    this.cb = cb
    this.coarse =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    this.sp = {
      popcorn: makePopcornSprite(false),
      golden: makePopcornSprite(true),
      corn: makeCornSprite(),
      cup: makeCupSprite(),
      paw: makePawSprite(),
      sparkle: makeSparkleSprite(),
      pigeon0: makePigeonSprite(false),
      pigeon1: makePigeonSprite(true),
    }
    this.lastTs = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  destroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.raf)
  }

  /* ================= публичное API ================= */

  /** Скин лапки из магазина: палитра спрайта + постоянные улучшения */
  setPawSkin(id: PawId): void {
    const def = PAW_MAP[id] ?? PAW_MAP.classic
    this.pawBonus = def.bonus
    this.sp.paw = makePawSprite(def.palette)
  }

  /** Постоянные апгрейды магазина (действуют во всех забегах) */
  setUpgrades(u: { carryPlus?: number }): void {
    this.upgCarry = u.carryPlus ?? 0
  }

  /** Новый забег: счёт с нуля, уровень 1 (старт-апгрейд может дать бонусный перк) */
  startRun(opts: { fast?: boolean; perk?: PerkId | null } = {}): void {
    this.debugFast = !!opts.fast
    this.score = 0
    this.streak = 0
    this.goldenCount = 0
    this.pigeonsRun = 0
    this.lifeUsed = false
    this.startLevel(1, opts.perk ?? null)
  }

  /** Следующий уровень забега (счёт сохраняется) */
  startLevel(level: number, perk: PerkId | null): void {
    this.lvl = level
    this.perk = perk
    this.duration =
      (perk === 'timeplus' ? LEVEL_SECONDS_PERK : LEVEL_SECONDS) + (this.pawBonus.timePlus ?? 0)
    this.quota = this.debugFast ? 3 : quotaFor(level, perk === 'doublepoints')
    this.collected = 0
    this.wave = 1
    /* Ступень сложности каждые 5 уровней: пропорционально больше попкорна
       и мин на волне — за 60 секунд нужно собирать всё больше, но без безумия */
    const step = Math.floor((level - 1) / 5)
    this.popPerWave = Math.min(26, 10 + step * 3)
    this.cornPerWave = Math.min(11, 3 + step)
    if (perk === 'cornrain') this.cornPerWave = Math.min(14, this.cornPerWave * 2)
    /* Лапка-оберег от мин: меньше кукурузы в каждой волне */
    this.cornPerWave = Math.max(0, this.cornPerWave - (this.pawBonus.cornCut ?? 0))
    this.goldenChance = perk === 'goldenvein' ? 0.26 : Math.min(0.3, 0.12 + (this.pawBonus.goldenAdd ?? 0))
    this.baseWaveDelay = Math.max(0.4, 0.8 - (level - 1) * 0.03)

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
    this.freezeLeft = 0
    this.lastFreezeSec = -1
    this.shieldLeft = perk === 'shield' ? 1 : 0
    /* Голубь-воришка: с 3-го уровня прилетает через ~11 секунд */
    this.pigeon = null
    this.pigeonTimer = level >= 3 ? PIGEON_FIRST_AT + Math.random() * 4 : -1
    /* Кот-помощник: в начале КАЖДОГО уровня съезжает сверху на своё место —
       первые 5 секунд ткни в лапку, чтобы заморозить таймер и продумать маршрут */
    this.cat = { t: 0, state: 'in', stateT: 0 }
    audio.play('meow')
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

  /** «Конец игры»: мгновенно свернуть забег и вернуться в меню (без экрана результатов).
      Опыт при этом НЕ сгорает — компонент начисляет очки в банк по ходу забега. */
  abort(): void {
    this.phase = 'idle'
    this.paused = false
    this.pieces = []
    this.carried = []
    this.flying = []
    this.particles = []
    this.texts = []
    this.cat = null
    this.freezeLeft = 0
    this.pigeon = null
    this.banner = { text: '', t: 99 }
    audio.stopMusic()
    audio.setIntensity(0)
    this.emitStats(true)
  }

  /** «Девятая жизнь»: один раз за забег продолжить проваленный уровень (+15 секунд).
      Возвращает true, если второй шанс сработал. */
  revive(): boolean {
    if (this.phase !== 'ended' || this.lifeUsed) return false
    this.lifeUsed = true
    this.phase = 'playing'
    this.paused = false
    this.timeLeft = REVIVE_SECONDS
    this.duration = REVIVE_SECONDS
    this.lastSec = Math.ceil(this.timeLeft)
    this.audioStage = -1
    this.pendingClear = -1
    this.banner = { text: 'ВТОРОЙ ШАНС!', t: 0 }
    audio.play('wave')
    this.emitStats(true)
    return true
  }

  /** Использован ли второй шанс в текущем забеге */
  get lifeSpent(): boolean {
    return this.lifeUsed
  }

  /** Координаты в системе игрового поля (трансформации экрана считает компонент) */
  setPointer(x: number, y: number, lift = 0): void {
    if (this.phase !== 'playing' || this.paused) return
    /* Кот-бонус: ткнул в лапку — получил стоп-таймер */
    if (this.cat && this.freezeLeft <= 0 && this.catHit(x, y)) {
      this.startFreeze()
      return
    }
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
    /* На телефонах полноэкранный canvas в DPR 2 съедает кадровый бюджет:
       ограничиваем 1.6 — пиксель-арт от этого только выигрывает */
    this.dpr = Math.min(
      window.devicePixelRatio || 1,
      this.coarse ? 1.6 : 2,
    )
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
    /* Точный состав волны: норма попкорна + мины (ступень каждые 5 уровней) */
    const kinds: PieceKind[] = []
    for (let i = 0; i < this.popPerWave; i++) {
      kinds.push(Math.random() < this.goldenChance ? 'golden' : 'popcorn')
    }
    for (let i = 0; i < this.cornPerWave; i++) kinds.push('corn')
    for (let i = kinds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[kinds[i], kinds[j]] = [kinds[j], kinds[i]]
    }
    kinds.forEach((kind, i) => this.spawnPiece(i, kind))
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

  /* ================= размеры и ступени сложности ================= */

  /** Вместимость лапки: 3 зерна, после 5-го уровня — 4, после 10-го — 5 (+скин, +апгрейд, +перк) */
  private get carryMax(): number {
    const base = this.lvl >= 11 ? 5 : this.lvl >= 6 ? 4 : 3
    return (
      base +
      (this.pawBonus.carryPlus ?? 0) +
      this.upgCarry +
      (this.perk === 'secondcup' ? 2 : 0)
    )
  }

  /** Комбо-множитель: +1 за каждые 6 сдач подряд, потолок ×5 */
  private get comboMult(): number {
    return 1 + Math.min(4, Math.floor(this.streak / 6))
  }

  /** Попкорн каждые 5 уровней немного мельчает — на поле остаётся место */
  private get popScale(): number {
    return Math.max(0.68, 1 - 0.035 * Math.floor((this.lvl - 1) / 5))
  }

  /** Мины-кукурузины каждые 5 уровней, наоборот, толстеют */
  private get cornScale(): number {
    return Math.min(1.5, 1 + 0.09 * Math.floor((this.lvl - 1) / 5))
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

  /* ================= кот-бонус и фриз-тайм ================= */

  /** Геометрия кота в мировых координатах (въезд сверху с пружинкой) */
  private catGeom(): { x: number; y: number; cell: number; slide: number } {
    const cell = 4.4 * this.u
    let slide = 0
    if (this.cat) {
      if (this.cat.state === 'in') {
        slide = (1 - easeOutBack(Math.min(1, this.cat.stateT / 0.55))) * -130 * this.u
      }
      if (this.cat.state === 'out') {
        slide = easeOutQuad(Math.min(1, this.cat.stateT / 0.45)) * -130 * this.u
      }
    }
    return { x: this.W / 2, y: 30 * this.u, cell, slide }
  }

  /** Центры двух лапок кота (точки клика) */
  private catPawPoints(): Array<[number, number]> {
    const g = this.catGeom()
    const ox = g.x - 10 * g.cell
    const oy = g.y + g.slide
    return [
      [ox + 6.2 * g.cell, oy + 15.4 * g.cell],
      [ox + 13.8 * g.cell, oy + 15.4 * g.cell],
    ]
  }

  /** Клик по лапке кота (учитываем зеркальные перки-трансформации) */
  private catHit(x: number, y: number): boolean {
    if (!this.cat || this.cat.state === 'out' || this.cat.state === 'happy') return false
    const r = 4.6 * this.catGeom().cell
    const cands: Array<[number, number]> = [[x, y]]
    if (this.perk === 'rot180') cands.push([this.W - x, this.H - y])
    if (this.perk === 'mirror') cands.push([this.W - x, y])
    return this.catPawPoints().some(([px, py]) =>
      cands.some(([cx, cy]) => Math.hypot(cx - px, cy - py) < r),
    )
  }

  private startFreeze(): void {
    if (!this.cat || this.freezeLeft > 0) return
    this.freezeLeft = FREEZE_SECONDS
    this.lastFreezeSec = FREEZE_SECONDS + 1
    this.cat.state = 'happy'
    this.cat.stateT = 0
    const g = this.catGeom()
    this.crumbs(g.x, g.y + 7 * g.cell, '#FFE066', 12)
    this.crumbs(g.x, g.y + 7 * g.cell, '#BFF3E6', 8)
    this.texts.push({
      x: g.x,
      y: g.y - 8 * g.cell,
      text: 'СТОП-ТАЙМЕР!',
      color: '#BFF3E6',
      t: 0,
      dur: 1.4,
      size: 30 * this.u,
    })
    audio.play('meow')
    audio.setIntensity(0) // музыка затихает, пока игрок думает
    this.audioStage = -1
  }

  /** Обновление кота/фриза. true — мир заморожен, остальной update пропускаем */
  private updateCat(dt: number): boolean {
    if (!this.cat) return false
    this.cat.t += dt
    this.cat.stateT += dt

    if (this.cat.state === 'in' && this.cat.stateT >= 0.55) {
      this.cat.state = 'idle'
      this.cat.stateT = 0
    }

    if (this.freezeLeft <= 0) {
      // Кот ждёт щелчка или уезжает вверх после отработанного фриза
      if (this.cat.state === 'out' && this.cat.stateT >= 0.5) this.cat = null
      else if (
        (this.cat.state === 'idle' || this.cat.state === 'in') &&
        this.cat.t >= CAT_VISIT_SECONDS
      ) {
        // Кот-помощник висит только первые секунды уровня: не ткнул — уехал без бонуса
        this.cat.state = 'out'
        this.cat.stateT = 0
      }
      return false
    }

    /* Фриз: таймер уровня стоит, мир стоит, лапку можно двигать и планировать */
    this.freezeLeft -= dt
    const sec = Math.ceil(Math.max(0, this.freezeLeft))
    if (sec !== this.lastFreezeSec) {
      this.lastFreezeSec = sec
      if (sec > 0) audio.play('tick')
    }
    if (this.freezeLeft <= 0) {
      this.freezeLeft = 0
      this.cat.state = 'out'
      this.cat.stateT = 0
      this.banner = { text: 'ВПЕРЁД!', t: 0 }
      this.audioStage = -1 // пересчитать темп музыки по оставшемуся времени
      audio.play('wave')
      return false // мир оживает в этот же кадр
    }
    // Счастливый кот машет лапками, а в конце отсчёта уезжает вверх
    if (this.cat.state === 'happy' && this.freezeLeft <= 0.45) {
      this.cat.state = 'out'
      this.cat.stateT = 0
    }
    return true
  }

  /* ================= обновление ================= */

  private update(dt: number): void {
    const u = this.u

    // Плавное следование лапки за пальцем/курсором («Тяжёлая лапа» — вдвое медленнее);
    // скины магазина делают лапку проворнее
    if (!this.paw.seen) {
      this.paw.tx = this.cup.x + Math.sin(performance.now() * 0.001) * 80 * u
      this.paw.ty = this.H * 0.35
    }
    const spd = 14 * (this.pawBonus.speed ?? 1)
    const k = 1 - Math.exp(-dt * (this.perk === 'slowpaw' ? spd * 0.46 : spd))
    this.paw.x += (this.paw.tx - this.paw.x) * k
    this.paw.y += (this.paw.ty - this.paw.y) * k
    this.paw.x = Math.max(22 * u, Math.min(this.W - 22 * u, this.paw.x))
    this.paw.y = Math.max(70, Math.min(this.H - 20 * u, this.paw.y))

    // Кот и фриз-тайм: пока таймер заморожен, мир стоит (лапку можно двигать)
    if (this.updateCat(dt)) return

    if (this.perk === 'drift') this.driftPieces(dt)
    if (this.perk === 'magnet') this.magnetPull(dt)

    // Голубь-воришка: влетает с 3-го уровня и таскает попкорн из стаканчика
    this.updatePigeon(dt)

    // Радиус подбора зависит от перка лапки и скина из магазина
    const grabR =
      (this.perk === 'bigpaw' ? 58 : this.perk === 'smallpaw' ? 34 : 44) *
      u *
      (this.pawBonus.grabR ?? 1)

    // Подбор попкорна / ловушка-кукуруза
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i]
      if (p.spawn > 0.12) continue
      const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y)
      if (p.kind === 'corn') {
        // Кукуруза-мина: чем толще мина, тем шире радиус задевания
        if (d < 38 * u * (0.7 + 0.3 * this.cornScale)) {
          this.pieces.splice(i, 1)
          const guard = this.pawBonus.guard ?? 0
          if (guard > 0 && Math.random() < guard) {
            // «Коготки-обереги»: мина обезврежена без штрафа
            this.texts.push({
              x: this.paw.x,
              y: this.paw.y - 34 * u,
              text: 'ОБЕРЕГ!',
              color: '#BFF3E6',
              t: 0,
              dur: 0.9,
              size: 22 * u,
            })
            this.crumbs(p.x, p.y, '#BFF3E6', 6)
            audio.play('click')
          } else if (this.shieldLeft > 0) {
            // «Кошачий щит»: первая мина за уровень прощается
            this.shieldLeft--
            this.texts.push({
              x: this.paw.x,
              y: this.paw.y - 34 * u,
              text: 'ЩИТ!',
              color: '#BFF3E6',
              t: 0,
              dur: 0.9,
              size: 22 * u,
            })
            this.crumbs(p.x, p.y, '#BFF3E6', 7)
            audio.play('click')
            this.buzz(20)
          } else {
            this.streak = 0 // мина сбрасывает комбо
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
            this.buzz(45)
          }
        }
        continue
      }
      if (d < grabR && this.carried.length < this.carryMax) {
        this.pieces.splice(i, 1)
        this.carried.push({ golden: p.kind === 'golden', grabT: 0 })
        if (p.kind === 'golden') this.goldenCount++
        this.paw.pulse = 1
        this.crumbs(p.x, p.y, p.kind === 'golden' ? '#FFE066' : '#FFF3D6', 6)
        audio.play(p.kind === 'golden' ? 'golden' : 'pickup')
        this.buzz(p.kind === 'golden' ? 18 : 8)
      }
    }

    // Высыпание в стаканчик (с перком «Двойной стаканчик» — с дальнего подлёта)
    if (this.carried.length > 0) {
      const dc = Math.hypot(this.paw.x - this.cup.x, this.paw.y - this.cup.y)
      const dropR = this.perk === 'secondcup' ? 118 * u : 78 * u
      if (dc < dropR) {
        let base = 0
        let hasGold = false
        for (const c of this.carried) {
          base += c.golden ? 5 : 1
          hasGold = hasGold || c.golden
        }
        this.streak++
        const cm = this.comboMult
        const mult = (this.perk === 'doublepoints' ? 2 : 1) * cm
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
          text: cm > 1 ? `+${sum} ×${cm}` : `+${sum}`,
          color: hasGold || cm > 1 ? '#FFC93C' : '#FFFFFF',
          t: 0,
          dur: 0.9,
          size: 26 * u,
        })
        if (cm > 1) {
          this.texts.push({
            x: this.paw.x,
            y: this.paw.y - 44 * u,
            text: `КОМБО ×${cm}`,
            color: '#FFE066',
            t: 0,
            dur: 1,
            size: 24 * u,
          })
        }
        audio.play('deposit')
        this.buzz(12)
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

    // Таймер («Черепаший час» тикает на четверть медленнее)
    this.timeLeft -= dt * (this.perk === 'slowmo' ? 0.75 : 1)
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
    this.buzz([30, 40, 60])
    this.emitStats(true)
    this.cb.onLevelComplete?.({ level: this.lvl, score: this.score, bonus })
  }

  private end(): void {
    this.phase = 'ended'
    audio.stopMusic()
    audio.play('gameover')
    this.buzz([60, 40, 60, 40, 120])
    this.emitStats(true)
    this.cb.onEnd?.({ score: this.score, level: this.lvl })
  }

  private crumbs(x: number, y: number, color: string, n: number): void {
    const u = this.u
    // На телефонах режем количество частиц — слабые GPU скажут спасибо
    const count = this.coarse ? Math.max(3, Math.round(n * 0.65)) : n
    for (let i = 0; i < count; i++) {
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

  /** Лёгкая вибрация на телефоне: только по событиям, коротко и не чаще 80 мс */
  private buzz(ms: number | number[]): void {
    try {
      if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
      const now = performance.now()
      if (now - this.lastBuzzAt < 80) return
      this.lastBuzzAt = now
      navigator.vibrate(ms)
    } catch {
      /* вибрация недоступна — не страшно */
    }
  }

  /* ================= голубь-воришка ================= */

  private spawnPigeon(): void {
    const u = this.u
    const side: 1 | -1 = Math.random() < 0.5 ? -1 : 1
    this.pigeon = {
      x: side < 0 ? -50 * u : this.W + 50 * u,
      y: 100 * u + Math.random() * 30 * u,
      state: 'in',
      stateT: 0,
      peckT: PIGEON_PECK_EVERY,
      side,
      hx: this.cup.x - side * 95 * u,
      hy: this.cup.y - 165 * u,
    }
    this.texts.push({
      x: this.W / 2,
      y: this.H * 0.22,
      text: 'ЖУХ-ЖУХ! ГОЛУБЬ!',
      color: '#C8CFD8',
      t: 0,
      dur: 1.6,
      size: 26 * u,
    })
    audio.play('pigeon')
    this.buzz(30)
  }

  /** Голубь летит к стаканчику и таскает попкорн; ткнуть лапкой — прогнать (+2) */
  private updatePigeon(dt: number): void {
    if (!this.pigeon) {
      if (this.pigeonTimer > 0) {
        this.pigeonTimer -= dt
        if (this.pigeonTimer <= 0) this.spawnPigeon()
      }
      return
    }
    const u = this.u
    const g = this.pigeon
    g.stateT += dt
    if (g.state === 'in') {
      const dx = g.hx - g.x
      const dy = g.hy - g.y
      const d = Math.hypot(dx, dy)
      const step = 150 * u * dt
      if (d <= step) {
        g.x = g.hx
        g.y = g.hy
        g.state = 'hover'
        g.stateT = 0
      } else {
        g.x += (dx / d) * step
        g.y += (dy / d) * step
      }
    } else if (g.state === 'hover') {
      g.y += Math.sin(g.stateT * 6) * 12 * u * dt
      g.peckT -= dt
      if (g.peckT <= 0) {
        g.peckT = PIGEON_PECK_EVERY + Math.random() * 0.8
        this.pigeonPeck()
      }
    } else {
      // 'flee': улетает за тот же борт, откуда прилетел
      g.x += -g.side * 320 * u * dt
      g.y -= 40 * u * dt
      if (g.x < -60 * u || g.x > this.W + 60 * u) {
        this.pigeon = null
        this.pigeonTimer = PIGEON_RESPAWN[0] + Math.random() * (PIGEON_RESPAWN[1] - PIGEON_RESPAWN[0])
      }
    }
    // Лапка коснулась голубя → прогон
    if (g.state !== 'flee' && Math.hypot(this.paw.x - g.x, this.paw.y - g.y) < 52 * u) {
      g.state = 'flee'
      g.stateT = 0
      this.pigeonsRun++
      this.score += 2
      this.texts.push({
        x: g.x,
        y: g.y - 30 * u,
        text: '+2 КЫШ!',
        color: '#BFF3E6',
        t: 0,
        dur: 1.1,
        size: 24 * u,
      })
      this.crumbs(g.x, g.y, '#C8CFD8', 8)
      audio.play('shoo')
      this.buzz(25)
    }
  }

  private pigeonPeck(): void {
    const u = this.u
    if (!this.pigeon) return
    if (this.collected > 0) {
      this.collected--
      this.streak = 0 // воришка сбивает серию
      this.pendingClear = -1 // украденное зерно отменяет близкое «уровень пройден»
      this.cup.squash = 1
      this.texts.push({
        x: this.cup.x,
        y: this.cup.y - this.cupH * 0.9,
        text: 'УКРАЛ!',
        color: '#FF6B5E',
        t: 0,
        dur: 1,
        size: 26 * u,
      })
      this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.4, '#C8CFD8', 6)
      audio.play('penalty')
      this.buzz(40)
    } else {
      this.texts.push({
        x: this.cup.x,
        y: this.cup.y - this.cupH * 0.9,
        text: 'ПУСТО!',
        color: '#C8CFD8',
        t: 0,
        dur: 0.8,
        size: 20 * u,
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
    const key = `${this.score}|${this.lvl}|${this.quota}|${this.collected}|${this.carried.length}|${sec}|${this.paused}|${Math.ceil(this.freezeLeft)}|${this.streak}|${this.goldenCount}|${this.pigeonsRun}`
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
      carryMax: this.carryMax,
      freezeLeft: this.freezeLeft,
      paused: this.paused,
      streak: this.streak,
      comboMult: this.comboMult,
      goldenCount: this.goldenCount,
      pigeonShooed: this.pigeonsRun,
    })
  }

  /* ================= отрисовка ================= */

  private render(ts: number): void {
    const { ctx } = this
    ctx.clearRect(0, 0, this.W, this.H)
    if (this.phase === 'idle') return

    this.drawCup()
    this.drawPieces(ts)
    if (this.pigeon && this.phase === 'playing') this.drawPigeon(ts)
    this.drawFlying()
    this.drawParticles()
    // Фриз-тайм: притемняем поле — большие красные цифры рисует React-оверлей
    if (this.freezeLeft > 0) {
      ctx.fillStyle = 'rgba(12, 18, 14, 0.5)'
      ctx.fillRect(0, 0, this.W, this.H)
    }
    this.drawPaw(ts)
    this.drawTexts()
    this.drawBanner()
    if (this.perk === 'fog' && this.phase === 'playing') this.drawFog()
    if (this.cat && this.phase === 'playing') this.drawCat(ts)

    if (this.phase === 'ended' || this.phase === 'clear') {
      ctx.fillStyle = 'rgba(24, 10, 4, 0.35)'
      ctx.fillRect(0, 0, this.W, this.H)
    }
  }

  /** Кот-бонус: пиксельный рыжий кот с двумя машущими лапками */
  private drawCat(ts: number): void {
    const cat = this.cat
    if (!cat) return
    const { ctx } = this
    const u = this.u
    const g = this.catGeom()
    const ox = g.x - 10 * g.cell
    const idleBob = cat.state === 'idle' ? Math.sin(ts * 0.003) * 2.2 * u : 0
    const oy = g.y + g.slide + idleBob

    // Тело из пиксельной карты
    for (let ry = 0; ry < CAT_BODY.length; ry++) {
      const row = CAT_BODY[ry]
      for (let rx = 0; rx < row.length; rx++) {
        const color = CAT_COLORS[row[rx]]
        if (!color) continue
        ctx.fillStyle = color
        ctx.fillRect(ox + rx * g.cell, oy + ry * g.cell, g.cell + 0.5, g.cell + 0.5)
      }
    }

    // Искры радости вокруг счастливого кота
    if (cat.state === 'happy') {
      drawSprite(ctx, this.sp.sparkle, ox + 2.4 * g.cell, oy + 2.2 * g.cell, 2.4 * u, {
        rot: ts * 0.01,
        alpha: 0.95,
      })
      drawSprite(ctx, this.sp.sparkle, ox + 17.6 * g.cell, oy + 3.1 * g.cell, 2 * u, {
        rot: -ts * 0.008,
        alpha: 0.95,
      })
    }

    // Лапки машут поочерёдно (манэки-нэко)
    const wig = cat.state === 'idle' ? Math.sin(ts * 0.006) * 2.6 * u : 0
    const happyWig = cat.state === 'happy' ? Math.sin(ts * 0.03) * 4.5 * u : 0
    const paws = this.catPawPoints()
    paws.forEach(([px, py], i) => {
      const dy = (i === 0 ? -1 : 1) * (wig + happyWig)
      const w = 3.4 * g.cell
      const h = 4.2 * g.cell
      const x0 = px - w / 2
      const y0 = py - h / 2 + dy
      ctx.fillStyle = CAT_COLORS.o
      ctx.fillRect(x0 - g.cell * 0.22, y0 - g.cell * 0.22, w + g.cell * 0.44, h + g.cell * 0.44)
      ctx.fillStyle = '#F7B96B'
      ctx.fillRect(x0, y0, w, h)
      ctx.fillStyle = CAT_COLORS.D
      ctx.fillRect(x0 + w * 0.28, y0 + h * 0.16, g.cell * 0.42, h * 0.6)
      ctx.fillRect(x0 + w * 0.6, y0 + h * 0.16, g.cell * 0.42, h * 0.6)
    })

    // Подсказка: пульсирующие кольца на лапках и текст
    if (cat.state === 'idle') {
      const pulse = 0.5 + 0.5 * Math.sin(ts * 0.008)
      ctx.lineWidth = 2.5 * u
      ctx.strokeStyle = `rgba(191, 243, 230, ${0.35 + 0.4 * pulse})`
      for (const [px, py] of paws) {
        ctx.beginPath()
        ctx.arc(px, py, (4.6 + 0.9 * pulse) * g.cell, 0, Math.PI * 2)
        ctx.stroke()
      }
      const hint = 'ТКНИ В ЛАПКУ — СТОП-ТАЙМЕР!'
      const size = Math.max(15, 19 * u)
      ctx.font = `700 ${size}px "Handjet", system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = 0.8 + 0.2 * pulse
      ctx.lineWidth = 4 * u
      ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)'
      ctx.strokeText(hint, g.x, oy - 11 * u)
      ctx.fillStyle = '#BFF3E6'
      ctx.fillText(hint, g.x, oy - 11 * u)
      ctx.globalAlpha = 1
    }
  }

  /** Голубь-воришка: пиксельный, с двумя кадрами взмаха */
  private drawPigeon(ts: number): void {
    const g = this.pigeon
    if (!g) return
    const { ctx } = this
    const u = this.u
    // Взмах крыльев: в полёте часто, в парении — лениво
    const flapMs = g.state === 'hover' ? 260 : 90
    const frame = Math.floor(ts / flapMs) % 2 === 0
    // Тень под голубем — когда висит над стаканчиком
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.beginPath()
    ctx.ellipse(g.x, this.cup.y + 22 * u, 24 * u, 6 * u, 0, 0, Math.PI * 2)
    ctx.fill()
    // Клюв смотрит в сторону движения/стаканчика (спрайт смотрит влево)
    let faceLeft = true
    if (g.state === 'hover') faceLeft = g.x > this.cup.x - 10 * u
    else if (g.state === 'flee') faceLeft = -g.side < 0
    else faceLeft = (Math.sign(g.hx - g.x) || -g.side) < 0
    const dive = g.state === 'hover' ? Math.max(0, Math.sin(g.stateT * 6)) * 5 * u : 0
    const rot = g.state === 'flee' ? -0.3 : Math.sin(ts * 0.003) * 0.06
    drawSprite(ctx, frame ? this.sp.pigeon0 : this.sp.pigeon1, g.x, g.y + dive, 3.1 * u, {
      rot,
      sx: faceLeft ? 1 : -1,
    })
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

    // Корпус стаканчика — без «шапки» зёрен сверху: она путала игрока
    // одинаковой текстурой с попкорном, который надо собирать
    drawSprite(ctx, this.sp.cup, this.cup.x, this.cup.y, s, { sx, sy })

    // Наполнение ВНУТРИ стаканчика: растёт вместе с выполнением нормы
    const progress = this.quota > 0 ? this.collected / this.quota : 0
    const fill = Math.min(CUP_FILL_POS.length, Math.ceil(progress * CUP_FILL_POS.length))
    if (fill > 0) {
      ctx.save()
      // Внутренняя трапеция стаканчика — зёрна не выходят за бумажные стенки
      const topY = this.cup.y - 11.2 * s * sy
      const botY = this.cup.y + 11.2 * s * sy
      const halfTop = 10.4 * s * sx
      const halfBot = 6.4 * s * sx
      ctx.beginPath()
      ctx.moveTo(this.cup.x - halfTop, topY)
      ctx.lineTo(this.cup.x + halfTop, topY)
      ctx.lineTo(this.cup.x + halfBot, botY)
      ctx.lineTo(this.cup.x - halfBot, botY)
      ctx.closePath()
      ctx.clip()
      for (let i = 0; i < fill; i++) {
        const [ox, oy] = CUP_FILL_POS[i]
        drawSprite(
          ctx,
          this.sp.popcorn,
          this.cup.x + ox * s * sx,
          this.cup.y + oy * s * sy,
          s * 0.44,
          { rot: i * 0.9, alpha: 0.88 },
        )
      }
      // Лёгкая притенённость — зёрна читаются «за стенкой», а не на поле
      ctx.globalAlpha = 0.18
      ctx.fillStyle = '#8a2f1d'
      ctx.fillRect(this.cup.x - halfTop, topY, halfTop * 2, botY - topY)
      ctx.restore()
    }
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
      // Попкорн мельчает, мины толстеют — ступени каждые 5 уровней
      const base = p.kind === 'corn' ? 2.3 * this.cornScale : 2.6 * this.popScale
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
      drawSprite(ctx, f.golden ? this.sp.golden : this.sp.popcorn, x, y, 2.6 * u * this.popScale * (1 - 0.45 * q), {
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
      const y = py - 30 * u - i * 14 * u * this.popScale + (1 - c.grabT) * 10 * u
      drawSprite(ctx, c.golden ? this.sp.golden : this.sp.popcorn, px + wig, y, 2.3 * u * this.popScale, {
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
