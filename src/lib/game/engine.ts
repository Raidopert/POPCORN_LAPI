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
import { tFor, type Lang, type TranslateFn } from './i18n'
import type { Difficulty, Quality } from './settings'

export interface EngineStats {
  score: number
  timeLeft: number
  duration: number
  level: number
  quota: number
  collected: number
  carrying: number
  carryMax: number
  paused: boolean
  /** Комбо: серия удачных сдач подряд (сбрасывается миной или голубем) */
  streak: number
  /** Текущий множитель комбо ×1..×5 */
  comboMult: number
  /** Золотых зёрен поймано за забег (для достижений) */
  goldenCount: number
  /** Прогнано голубей за забег (для достижений) */
  pigeonShooed: number
  /** Сейчас идёт «Лихорадка» (бонусный уровень) или её итоговая пауза */
  fever: boolean
  /** Очки, заработанные в текущей/только что закончившейся лихорадке */
  feverGained: number
  /** Номер текущей волны внутри уровня — для HTML-индикатора поверх тумана */
  wave: number
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

/** Итог «Лихорадки»: gained — заработанные очки (0, если схватил мину) */
export interface FeverResult {
  gained: number
  success: boolean
  next: number
}

export interface EngineCallbacks {
  onStats?(s: EngineStats): void
  onLevelComplete?(r: LevelResult): void
  onEnd?(r: EndResult): void
  onFeverEnd?(r: FeverResult): void
}

export type PieceKind = 'popcorn' | 'caramel' | 'butter' | 'golden' | 'corn'

/** Очки за зёрна: белое +1 · карамель +2 · масляное +3 · золотое +5 */
export const KIND_POINTS: Record<Exclude<PieceKind, 'corn'>, number> = {
  popcorn: 1,
  caramel: 2,
  butter: 3,
  golden: 5,
}

/** Относительный размер зерна на поле: чем ценнее — тем мельче.
    Белое +1 — крупное и заметное, золотое +5 — крохотное, но яркое */
const KIND_SCALE: Record<Exclude<PieceKind, 'corn'>, number> = {
  popcorn: 1,
  caramel: 0.84,
  butter: 0.72,
  golden: 0.58,
}

const FEVER_SECONDS = 3
/** Шанс, что на лихорадке среди зёрен спрячется одна мина-штраф */
const FEVER_MINE_CHANCE = 0.3

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
  kind: Exclude<PieceKind, 'corn'>
  grabT: number
}

interface Flying {
  x0: number
  y0: number
  kind: Exclude<PieceKind, 'corn'>
  t: number
}

/** Голубь-воришка: влетает, висит над стаканчиком и таскает попкорн.
    У него есть полоска жизни: чтобы прогнать, нужно НАНЕСТИ УДАРЫ лапкой —
    на первых уровнях хватает трёх, дальше воришка крепчает */
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
  /** Здоровье воришки: каждое касание лапкой — минус одно деление */
  hp: number
  maxHp: number
  /** Сколько зёрен успел украсть: при победе вернутся в стаканчик */
  stolen: number
  /** Кулдаун между ударами и вспышка после попадания */
  hitCd: number
  flash: number
  /** Импульс-отлёт после удара (вздрагивает и отлетает) */
  kx: number
  ky: number
  /** Повержен: улетает кувырком, выронив всё украденное */
  downed: boolean
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
const PIGEON_FIRST_AT = 11 // голубь прилетает на этом отрезке уровня (с 3-го уровня)
const PIGEON_PECK_EVERY = 2.2 // раз в сколько секунд голубь таскает зерно
const PIGEON_RESPAWN = [18, 30] // диапазон возврата после прогона, секунд
const PIGEON_HIT_CD = 0.3 // минимальная пауза между ударами лапкой — равномерная серия
const PIGEON_HIT_R = 50 // радиус касания лапкой (в единицах u)
const PIGEON_KO_BONUS = 5 // очки за поверженного воришку
const MINE_SHOCK_SECONDS = 1 // сколько секунд лапка «опешила» после мины
const MINE_SCORE_PENALTY = 5 // сколько очков сгорает при касании мины
const REVIVE_SECONDS = 15 // «девятая жизнь»: столько секунд даёт второй шанс

/** Настройки игрового процесса, управляемые из меню настроек */
export interface EngineOptions {
  difficulty: Difficulty
  quality: Quality
  /** Тряска экрана при минах и голубе */
  shake: boolean
  /** Вибрация на телефоне */
  vibration: boolean
  /** Режим дальтоников: сине-оранжевые мины с меткой */
  colorblind: boolean
  /** Голубь-воришка включён */
  pigeon: boolean
}

const DEFAULT_OPTIONS: EngineOptions = {
  difficulty: 'normal',
  quality: 'medium',
  shake: true,
  vibration: true,
  colorblind: false,
  pigeon: true,
}

/** Точки наполнения ВНУТРИ стаканчика (в единицах спрайта от центра, спрайт 48×54).
 *  Зёрна рисуются «за бумажной стенкой» — их не путают с попкорном на поле. */
const CUP_FILL_POS: Array<[number, number]> = [
  [-8, 14.8],
  [8, 14.8],
  [-13, 5.2],
  [1, 6.4],
  [13.6, 4.4],
  [-6.8, -5.2],
  [8.4, -6.4],
  [0, -15.2],
]

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
  /** Шанс карамельного зерна (+2): растёт с уровнем */
  private caramelChance = 0.04
  /** Шанс масляного зерна (+3): с 3-го уровня */
  private butterChance = 0
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
  /* --- «Лихорадка»: рандомный бонусный уровень на 3 секунды --- */
  private fever: { gained: number; startScore: number; next: number; coinT: number } | null = null
  private feverMine = false
  /** Пауза-итог после лихорадки, затем сразу следующий уровень */
  private feverAfter = -1
  private feverNextLvl = 0
  private lastFeverGained = 0
  /* --- таймер шлейфа звёзд волшебной лапки --- */
  private starT = 0
  /* --- «Шок» лапки после мины: замирает на секунду, ничего не берёт --- */
  private stun = 0

  private cupScale = 5
  private cupH = 0
  /** Уровень столешницы: стаканчик стоит на деревянном столике, а не висит в воздухе */
  private tableY = 0

  /* --- настройки из меню (сложность/качество/тряска/вибрация/дальтоник/голубь) --- */
  private opts: EngineOptions = { ...DEFAULT_OPTIONS }
  /** Язык внутриигровых надписей (баннеры, всплывающие тексты) */
  private L: TranslateFn = tFor('ru')

  /* --- анимация наполнения стаканчика: возраст каждого зёрнышка в кадре --- */
  private fillPop: number[] = []
  private lastFill = 0
  /** Свечение-искра над стаканчиком после сданного золотого зерна */
  private cupGlow = 0
  /** Тряска экрана (настройка «Тряска») */
  private shakeT = 0
  private shakeAmp = 0

  private sp: {
    popcorn: Sprite
    caramel: Sprite
    butter: Sprite
    golden: Sprite
    corn: Sprite
    cornCB: Sprite
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
      popcorn: makePopcornSprite('white'),
      caramel: makePopcornSprite('caramel'),
      butter: makePopcornSprite('butter'),
      golden: makePopcornSprite('golden'),
      corn: makeCornSprite(false),
      cornCB: makeCornSprite(true),
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

  /** Настройки из меню: сложность, качество, тряска, вибрация, дальтоник, голубь */
  setOptions(o: Partial<EngineOptions>): void {
    this.opts = { ...this.opts, ...o }
  }

  /** Язык внутриигровых надписей (баннеры «УРОВЕНЬ 2», «УКРАЛ!», «КОМБО ×3»…) */
  setLang(lang: Lang): void {
    this.L = tFor(lang)
  }

  /** Новый забег: счёт с нуля, уровень 1 (старт-апгрейд может дать бонусный перк) */
  startRun(opts: { fast?: boolean; perk?: PerkId | null } = {}): void {
    this.debugFast = !!opts.fast
    this.score = 0
    this.streak = 0
    this.goldenCount = 0
    this.pigeonsRun = 0
    this.lifeUsed = false
    this.fever = null
    this.feverAfter = -1
    this.startLevel(1, opts.perk ?? null)
  }

  /** Следующий уровень забега (счёт сохраняется) */
  startLevel(level: number, perk: PerkId | null): void {
    this.lvl = level
    this.perk = perk
    /* Сложность из настроек: лёгкая (+10 сек), сложная (−10 сек) */
    const diffTime = this.opts.difficulty === 'easy' ? 10 : this.opts.difficulty === 'hard' ? -10 : 0
    this.duration =
      Math.max(
        40,
        (perk === 'timeplus' ? LEVEL_SECONDS_PERK : LEVEL_SECONDS) +
          (this.pawBonus.timePlus ?? 0) +
          diffTime,
      )
    this.quota = this.debugFast ? 3 : quotaFor(level, perk === 'doublepoints')
    /* Сложность: лёгкая — норма ×0.8, сложная — ×1.2 */
    if (!this.debugFast && this.opts.difficulty !== 'normal') {
      this.quota = Math.max(3, Math.round(this.quota * (this.opts.difficulty === 'easy' ? 0.8 : 1.2)))
    }
    this.collected = 0
    this.wave = 1
    /* Ступень сложности каждые 5 уровней: пропорционально больше попкорна
       и мин на волне — за отведённое время нужно собирать всё больше, но без безумия */
    const step = Math.floor((level - 1) / 5)
    this.popPerWave = Math.min(26, 10 + step * 3)
    this.cornPerWave = Math.min(11, 3 + step)
    if (perk === 'cornrain') this.cornPerWave = Math.min(14, this.cornPerWave * 2)
    /* Лапка-оберег от мин: меньше кукурузы в каждой волне */
    this.cornPerWave = Math.max(0, this.cornPerWave - (this.pawBonus.cornCut ?? 0))
    /* Сложность: лёгкая — на мину меньше, сложная — на мину больше */
    if (this.opts.difficulty === 'easy') this.cornPerWave = Math.max(0, this.cornPerWave - 1)
    if (this.opts.difficulty === 'hard') this.cornPerWave = Math.min(15, this.cornPerWave + 1)
    this.goldenChance = perk === 'goldenvein' ? 0.26 : Math.min(0.3, 0.12 + (this.pawBonus.goldenAdd ?? 0))
    /* Разнообразие зёрен: карамель и масло появляются с ростом уровня */
    this.caramelChance = Math.min(0.2, 0.04 + (this.lvl - 1) * 0.014)
    this.butterChance = this.lvl >= 3 ? Math.min(0.1, 0.015 + (this.lvl - 3) * 0.007) : 0
    this.baseWaveDelay = Math.max(0.4, 0.8 - (level - 1) * 0.03)

    this.phase = 'playing'
    this.paused = false
    this.timeLeft = this.duration
    this.pendingClear = -1
    this.fever = null
    this.feverMine = false
    this.feverAfter = -1
    this.starT = 0
    this.stun = 0
    this.pieces = []
    this.carried = []
    this.flying = []
    this.particles = []
    this.texts = []
    this.waveDelay = -1
    this.lastSec = Math.ceil(this.timeLeft)
    this.banner = { text: this.L('banner.level', { n: level }), t: 0 }
    audio.setIntensity(0)
    audio.setMusicLevel(level >= 3 ? 1 : 0)
    this.audioStage = 0
    this.shieldLeft = perk === 'shield' ? 1 : 0
    /* Голубь-воришка: с 3-го уровня прилетает через ~11 секунд (можно отключить в настройках) */
    this.pigeon = null
    this.pigeonTimer =
      this.opts.pigeon && level >= 3 ? PIGEON_FIRST_AT + Math.random() * 4 : -1
    /* Наполнение стаканчика сбрасывается: анимация зёрен заново */
    this.fillPop = []
    this.lastFill = 0
    this.cupGlow = 0
    this.shakeT = 0
    this.shakeAmp = 0
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

  /** «ЛИХОРАДКА» — рандомный бонусный уровень: 3 секунды, весь экран в зёрнах
      без мин (изредка прячется одна мина-штраф). Очки капают в счёт; если
      схватить мину — всё заработанное в лихорадке сгорает. После итога
      забег сразу продолжается со следующего уровня, без сундучка. */
  startFever(nextLevel: number): void {
    if (this.phase !== 'clear' && this.phase !== 'playing') return
    this.perk = null
    this.phase = 'playing'
    this.paused = false
    this.duration = FEVER_SECONDS
    this.timeLeft = FEVER_SECONDS
    this.quota = 999999
    this.collected = 0
    this.fever = { gained: 0, startScore: this.score, next: nextLevel, coinT: 0 }
    this.feverMine = Math.random() < FEVER_MINE_CHANCE
    this.feverAfter = -1
    this.lastFeverGained = 0
    this.pieces = []
    this.carried = []
    this.flying = []
    this.particles = []
    this.texts = []
    this.pigeon = null
    this.pigeonTimer = -1
    this.waveDelay = -1
    this.pendingClear = -1
    this.stun = 0
    this.fillPop = []
    this.lastFill = 0
    this.cupGlow = 0
    this.shakeT = 0
    this.shakeAmp = 0
    this.banner = { text: this.L('banner.fever'), t: 0 }
    this.lastSec = Math.ceil(this.timeLeft)
    audio.setIntensity(3)
    audio.play('fever')
    this.spawnFeverField()
    this.emitStats(true)
  }

  /** Экран лихорадки: смесь ценных зёрен, изредка — одна мина-штраф */
  private spawnFeverField(): void {
    const kinds: PieceKind[] = []
    for (let i = 0; i < 36; i++) {
      const r = Math.random()
      kinds.push(r < 0.16 ? 'golden' : r < 0.34 ? 'butter' : r < 0.55 ? 'caramel' : 'popcorn')
    }
    if (this.feverMine) kinds[Math.floor(Math.random() * kinds.length)] = 'corn'
    kinds.forEach((kind, i) => this.spawnPiece(i, kind))
  }

  /** Подсыпка зёрен, если экран лихорадки опустел */
  private spawnFeverTop(): void {
    for (let i = 0; i < 6; i++) {
      const r = Math.random()
      this.spawnPiece(i, r < 0.16 ? 'golden' : r < 0.34 ? 'butter' : r < 0.55 ? 'caramel' : 'popcorn')
    }
  }

  /** Итог лихорадки: успех — очки остаются; мина — всё заработанное сгорает */
  private feverEnd(success: boolean): void {
    const f = this.fever
    if (!f) return
    this.fever = null
    this.feverNextLvl = f.next
    this.lastFeverGained = f.gained
    /* Таймер-страховка: пока идёт пауза-итог, время не должно выйти */
    this.timeLeft = 1.2
    this.duration = 1.2
    this.lastSec = Math.ceil(this.timeLeft)
    this.feverAfter = 1.15
    if (success) {
      this.banner = { text: this.L('txt.feverWin', { n: f.gained }), t: 0 }
      audio.play('record')
      this.buzz([30, 40, 30, 40, 90])
      this.crumbs(this.paw.x, this.paw.y, '#FFE066', 12)
    } else {
      this.score = Math.max(0, this.score - f.gained)
      this.streak = 0
      this.banner = { text: this.L('txt.feverBurn'), t: 0 }
      audio.play('penalty')
      this.doShake(9)
      this.buzz([60, 40, 100])
      this.crumbs(this.paw.x, this.paw.y, '#E5342E', 9)
    }
    this.emitStats(true)
    this.cb.onFeverEnd?.({ gained: success ? f.gained : 0, success, next: f.next })
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
    this.pigeon = null
    this.fever = null
    this.feverAfter = -1
    this.banner = { text: '', t: 99 }
    this.shakeT = 0
    this.shakeAmp = 0
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
    this.stun = 0
    this.timeLeft = REVIVE_SECONDS
    this.duration = REVIVE_SECONDS
    this.lastSec = Math.ceil(this.timeLeft)
    this.audioStage = -1
    this.pendingClear = -1
    this.banner = { text: this.L('banner.revive'), t: 0 }
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
       ограничиваем (качество из настроек: низкое — 1.2, высокое — 2) */
    const dprCap =
      this.opts.quality === 'low' ? 1.2 : this.opts.quality === 'high' ? 2 : this.coarse ? 1.6 : 2
    this.dpr = Math.min(window.devicePixelRatio || 1, dprCap)
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

    /* Детальный стаканчик 48×54: пиксели вдвое мельче при том же размере */
    this.cupScale = 2.3 * this.u
    this.cupH = 54 * this.cupScale
    this.cup.x = w / 2
    /* Столик внизу: стаканчик стоит на столешнице, а не висит в воздухе */
    this.tableY = h - 30 * this.u
    this.cup.y = this.tableY - this.cupH / 2
  }

  /* ================= волны ================= */

  private spawnWave(): void {
    /* Точный состав волны: норма зёрен + мины (ступень каждые 5 уровней).
       Внутри «вкусной» нормы — смесь: белое/карамель/масло/золото. */
    const kinds: PieceKind[] = []
    for (let i = 0; i < this.popPerWave; i++) {
      const r = Math.random()
      const cB = this.goldenChance
      const cC = cB + this.caramelChance
      const cM = cC + this.butterChance
      kinds.push(r < cB ? 'golden' : r < cC ? 'caramel' : r < cM ? 'butter' : 'popcorn')
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
    /* Статистика вынесена в панель над полем — верх больше не перекрыт: зёрна
       заспавниваются выше, игровая зона больше */
    const top = 46 + 4 * u
    const bottom = this.H - 52 * u
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
    const top = 50
    const bottom = this.H - 56 * u
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

    /* Пауза-итог лихорадки: показываем результат и сразу идём на следующий
       уровень (сундучок пропускается — так и задумано: было тяжело!) */
    if (this.feverAfter >= 0) {
      this.feverAfter -= dt
      if (this.feverAfter <= 0) {
        this.feverAfter = -1
        this.startLevel(this.feverNextLvl, null)
        return
      }
    }

    // Плавное следование лапки за пальцем/курсором («Тяжёлая лапа» — вдвое медленнее);
    // скины магазина делают лапку проворнее
    if (!this.paw.seen) {
      this.paw.tx = this.cup.x + Math.sin(performance.now() * 0.001) * 80 * u
      this.paw.ty = this.H * 0.35
    }
    if (this.stun > 0) {
      // Шок от мины: лапка «опешила» и застыла на месте — цель запоминается,
      // когда отпустит, лапка догонит палец
    } else {
      const spd = 14 * (this.pawBonus.speed ?? 1)
      const k = 1 - Math.exp(-dt * (this.perk === 'slowpaw' ? spd * 0.46 : spd))
      this.paw.x += (this.paw.tx - this.paw.x) * k
      this.paw.y += (this.paw.ty - this.paw.y) * k
      /* Статистика теперь в панели над полем: лапке доступен весь экран,
         снизу — до столика со стаканчиком */
      this.paw.x = Math.max(22 * u, Math.min(this.W - 22 * u, this.paw.x))
      this.paw.y = Math.max(46, Math.min(this.H - 42 * u, this.paw.y))
    }

    if (this.perk === 'drift') this.driftPieces(dt)
    if (this.perk === 'magnet') this.magnetPull(dt)

    // Голубь-воришка: влетает с 3-го уровня и таскает попкорн из стаканчика
    this.updatePigeon(dt)

    // Радиус подбора зависит от перка лапки и скина из магазина
    const grabR =
      (this.perk === 'bigpaw' ? 58 : this.perk === 'smallpaw' ? 34 : 44) *
      u *
      (this.pawBonus.grabR ?? 1)

    // Подбор попкорна / ловушка-кукуруза. В шоке лапка ничего не берёт
    // и мины не задевает — стоит столбом, пока не отпустит
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i]
      if (this.stun > 0) break // «опешила»: ни подбора, ни новых подрывов
      if (p.spawn > 0.12) continue
      const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y)
      if (p.kind === 'corn') {
        // Кукуруза-мина: чем толще мина, тем шире радиус задевания
        if (d < 38 * u * (0.7 + 0.3 * this.cornScale)) {
          this.pieces.splice(i, 1)
          if (this.fever) {
            // Мина на лихорадке: весь накопленный там бонус сгорает!
            this.feverEnd(false)
            return
          }
          const guard = this.pawBonus.guard ?? 0
          if (guard > 0 && Math.random() < guard) {
            // «Коготки-обереги»: мина обезврежена без штрафа
            this.texts.push({
              x: this.paw.x,
              y: this.paw.y - 34 * u,
              text: this.L('txt.guard'),
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
              text: this.L('txt.shield'),
              color: '#BFF3E6',
              t: 0,
              dur: 0.9,
              size: 22 * u,
            })
            this.crumbs(p.x, p.y, '#BFF3E6', 7)
            audio.play('click')
            this.buzz(20)
          } else {
            // Лапка ударилась о мину: ШОК! Очки горят, всё, что несла,
            // высыпается на пол, а сама лапка секунду стоит столбом
            this.streak = 0 // мина сбрасывает комбо
            this.shockDrop()
            this.stun = MINE_SHOCK_SECONDS
            this.score = Math.max(0, this.score - MINE_SCORE_PENALTY)
            this.paw.hurt = 1.6
            this.doShake(9) // тряска экрана (отключается в настройках)
            this.texts.push({
              x: this.paw.x,
              y: this.paw.y - 40 * u,
              text: this.L('txt.shock', { n: MINE_SCORE_PENALTY }),
              color: '#FF6B5E',
              t: 0,
              dur: 1.1,
              size: 24 * u,
            })
            this.crumbs(p.x, p.y, '#E5342E', 9)
            audio.play('penalty')
            this.buzz([60, 40, 100])
          }
        }
        continue
      }
      if (d < grabR && this.carried.length < this.carryMax) {
        this.pieces.splice(i, 1)
        this.carried.push({ kind: p.kind as Exclude<PieceKind, 'corn'>, grabT: 0 })
        if (p.kind === 'golden') this.goldenCount++
        this.paw.pulse = 1
        this.crumbs(p.x, p.y, p.kind === 'golden' ? '#FFE066' : p.kind === 'caramel' ? '#FFC98A' : p.kind === 'butter' ? '#FFED9C' : '#FFF3D6', 6)
        audio.play(p.kind === 'golden' ? 'golden' : 'pickup')
        this.buzz(p.kind === 'golden' ? 18 : 8)
      }
    }

    // Высыпание в стаканчик (с перком «Двойной стаканчик» — с дальнего подлёта).
    // В шоке лапка не сдаёт — несла в клюв... несла в лапке, уронила на мину
    if (this.carried.length > 0 && this.stun <= 0) {
      const dc = Math.hypot(this.paw.x - this.cup.x, this.paw.y - this.cup.y)
      const dropR = this.perk === 'secondcup' ? 118 * u : 78 * u
      if (dc < dropR) {
        let base = 0
        let hasGold = false
        for (const c of this.carried) {
          base += KIND_POINTS[c.kind]
          hasGold = hasGold || c.kind === 'golden'
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
            kind: c.kind,
            t: 0,
          })
        })
        this.carried = []
        this.score += sum
        this.cup.squash = 1
        if (hasGold) this.cupGlow = 1 // искра над стаканчиком
        this.texts.push({
          x: this.cup.x,
          y: this.cup.y - this.cupH * 0.8,
          text: cm > 1 ? `+${sum} ×${cm}` : `+${sum}`,
          color: hasGold || sum >= 8 || cm > 1 ? '#FFC93C' : '#FFFFFF',
          t: 0,
          dur: 0.9,
          size: 26 * u,
        })
        if (cm > 1) {
          this.texts.push({
            x: this.paw.x,
            y: this.paw.y - 44 * u,
            text: this.L('txt.combo', { n: cm }),
            color: '#FFE066',
            t: 0,
            dur: 1,
            size: 24 * u,
          })
        }
        if (this.fever) {
          this.fever.gained += sum
          audio.play('coin')
        } else {
          audio.play('deposit')
        }
        this.buzz(12)
      }
    }

    // Летящие в стаканчик зёрна: каждое приземление — «плюх» и лёгкий подскок
    for (let i = this.flying.length - 1; i >= 0; i--) {
      const f = this.flying[i]
      f.t += dt / 0.3
      if (f.t >= 1) {
        this.flying.splice(i, 1)
        this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.5, '#FFF6EC', 3)
        // Звук падения зёрнышка на дно (у дорогих — повыше и со искрой)
        audio.play(f.kind === 'golden' || f.kind === 'butter' ? 'plopGold' : 'plop')
        this.cup.squash = Math.min(1, Math.max(this.cup.squash, 0.35))
      }
    }

    /* Наполнение стаканчика: синхронизируем анимацию зёрен с прогрессом нормы */
    const fillN = Math.min(
      CUP_FILL_POS.length,
      this.quota > 0 ? Math.ceil((this.collected / this.quota) * CUP_FILL_POS.length) : 0,
    )
    if (fillN !== this.lastFill) {
      for (let i = this.lastFill; i < fillN; i++) this.fillPop[i] = 0 // новые зёрна — с пружинкой
      this.fillPop.length = Math.max(this.fillPop.length, fillN)
      this.lastFill = fillN
    }

    /* Лихорадка: дождь монеток на фоне и подсыпка зёрен, чтобы экран
       оставался полным до конца трёх секунд */
    if (this.fever) {
      this.fever.coinT -= dt
      if (this.fever.coinT <= 0) {
        this.fever.coinT = 0.13
        this.particles.push({
          x: Math.random() * this.W,
          y: -8,
          vx: (Math.random() - 0.5) * 30 * u,
          vy: (110 + Math.random() * 90) * u,
          t: 0,
          ttl: 2.4,
          color: Math.random() < 0.5 ? '#FFE066' : '#FFC93C',
          size: (3.5 + Math.random() * 2.5) * u,
        })
      }
      let food = 0
      for (const p of this.pieces) if (p.kind !== 'corn') food++
      if (food < 12) this.spawnFeverTop()
    }

    /* Волшебная лапка: шлейф звёздочек сыплется из меха */
    if (this.pawBonus.stars) {
      this.starT -= dt
      if (this.starT <= 0) {
        this.starT = 0.09
        const starColors = ['#FFE066', '#FFF6EC', '#FFC93C']
        this.particles.push({
          x: this.paw.x + (Math.random() - 0.5) * 14 * u,
          y: this.paw.y + 20 * u + (Math.random() - 0.5) * 8 * u,
          vx: (Math.random() - 0.5) * 26 * u,
          vy: 46 * u,
          t: 0,
          ttl: 0.65,
          color: starColors[Math.floor(Math.random() * starColors.length)] ?? '#FFE066',
          size: (2 + Math.random() * 2) * u,
        })
      }
    }

    if (!this.fever && this.feverAfter < 0) {
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
          this.banner = { text: this.L('banner.wave', { n: this.wave }), t: 0 }
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
    }

    // Музыка зависит от оставшегося времени: >30с база, ≤30с +25%, ≤15с +40%, ≤5с 240 BPM.
    // В лихорадке — максимальный накал: бешеный темп под звон автоматов!
    const stage = this.fever
      ? 3
      : this.timeLeft > 30
        ? 0
        : this.timeLeft > 15
          ? 1
          : this.timeLeft > 5
            ? 2
            : 3
    if (stage !== this.audioStage) {
      this.audioStage = stage
      audio.setIntensity(stage)
    }

    // Таймер («Черепаший час» тикает на четверть медленнее)
    this.timeLeft -= dt * (this.perk === 'slowmo' ? 0.75 : 1)
    const sec = Math.max(0, Math.ceil(this.timeLeft))
    if (sec !== this.lastSec) {
      this.lastSec = sec
      if (sec <= 5 && sec > 0 && !this.fever && this.feverAfter < 0) audio.play('tick')
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0
      if (this.fever) {
        // Время лихорадки вышло: всё собранное остаётся в счёте!
        this.feverEnd(true)
        return
      }
      this.end()
      return
    }

    // Косметика
    this.paw.pulse = Math.max(0, this.paw.pulse - dt * 5)
    this.paw.hurt = Math.max(0, this.paw.hurt - dt * 2.2)
    this.stun = Math.max(0, this.stun - dt)
    this.cup.squash = Math.max(0, this.cup.squash - dt * 4)
    this.cupGlow = Math.max(0, this.cupGlow - dt * 1.6)
    this.shakeT = Math.max(0, this.shakeT - dt)
    if (this.shakeT <= 0) this.shakeAmp = 0
    this.banner.t += dt
    for (const p of this.pieces) p.spawn = Math.max(0, p.spawn - dt)
    for (const c of this.carried) c.grabT = Math.min(1, c.grabT + dt * 8)
    for (let i = 0; i < this.fillPop.length; i++) this.fillPop[i] += dt
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

  /** Лёгкая вибрация на телефоне: только по событиям, коротко и не чаще 80 мс.
      Полностью отключается в настройках. */
  private buzz(ms: number | number[]): void {
    try {
      if (!this.opts.vibration) return
      if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
      const now = performance.now()
      if (now - this.lastBuzzAt < 80) return
      this.lastBuzzAt = now
      navigator.vibrate(ms)
    } catch {
      /* вибрация недоступна — не страшно */
    }
  }

  /** Тряска экрана при минах и голубе (отключается в настройках) */
  private doShake(amp: number): void {
    if (!this.opts.shake) return
    this.shakeAmp = Math.max(this.shakeAmp, amp * this.u)
    this.shakeT = 0.3
  }

  /* ================= голубь-воришка ================= */

  /** Полоска здоровья воришки: на первых уровнях хватает ТРЁХ ударов лапкой,
      дальше голубь крепчает (ур. 5 → 4, ур. 9 → 5, потолок 9).
      Сложность из настроек: лёгкая −1, сложная +1 */
  private pigeonMaxHp(): number {
    let hp = Math.min(9, 3 + Math.floor((this.lvl - 1) / 4))
    if (this.opts.difficulty === 'easy') hp = Math.max(2, hp - 1)
    if (this.opts.difficulty === 'hard') hp = Math.min(10, hp + 1)
    return hp
  }

  private spawnPigeon(): void {
    const u = this.u
    const side: 1 | -1 = Math.random() < 0.5 ? -1 : 1
    const maxHp = this.pigeonMaxHp()
    this.pigeon = {
      x: side < 0 ? -50 * u : this.W + 50 * u,
      y: 100 * u + Math.random() * 30 * u,
      state: 'in',
      stateT: 0,
      peckT: PIGEON_PECK_EVERY,
      side,
      hx: this.cup.x - side * 95 * u,
      hy: this.cup.y - 165 * u,
      hp: maxHp,
      maxHp,
      stolen: 0,
      hitCd: 0,
      flash: 0,
      kx: 0,
      ky: 0,
      downed: false,
    }
    this.texts.push({
      x: this.W / 2,
      y: this.H * 0.22,
      text: this.L('txt.pigeon'),
      color: '#C8CFD8',
      t: 0,
      dur: 1.6,
      size: 26 * u,
    })
    audio.play('pigeon')
    this.buzz(30)
    this.doShake(4)
  }

  /** Голубь летит к стаканчику и таскает попкорн; каждое касание лапкой —
      урон. Набьёшь полоску жизни — повален: вернёт украденное и +{{n}} очков */
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
      // 'flee': улетает за тот же борт, откуда прилетел.
      // Поверженный — быстрее, выше и кувырком
      const speed = g.downed ? 430 : 320
      const rise = g.downed ? 150 : 40
      g.x += -g.side * speed * u * dt
      g.y -= rise * u * dt
      if (g.x < -60 * u || g.x > this.W + 60 * u) {
        this.pigeon = null
        this.pigeonTimer = PIGEON_RESPAWN[0] + Math.random() * (PIGEON_RESPAWN[1] - PIGEON_RESPAWN[0])
      }
    }
    /* Отлёт после удара: импульс гаснет, в парении воришка возвращается
       к своей точке над стаканчиком */
    if (g.state !== 'flee') {
      g.x += g.kx * dt
      g.y += g.ky * dt
      const dec = Math.min(1, dt * 5)
      g.kx -= g.kx * dec
      g.ky -= g.ky * dec
      if (g.state === 'hover') {
        g.x += (g.hx - g.x) * Math.min(1, dt * 1.5)
        g.y += (g.hy - g.y) * Math.min(1, dt * 1.5)
      }
    }
    /* УДАР ЛАПКОЙ: каждое касание (или проведение через него) — минус
       одно деление жизни. Короткий кулдаун держит серию ударов равномерной,
       а вздрагивание откидывает голубя — просто держать лапку на нём мало */
    g.hitCd -= dt
    g.flash = Math.max(0, g.flash - dt * 3)
    if (
      g.state !== 'flee' &&
      g.hitCd <= 0 &&
      Math.hypot(this.paw.x - g.x, this.paw.y - g.y) < PIGEON_HIT_R * u
    ) {
      g.hitCd = PIGEON_HIT_CD
      g.hp--
      g.flash = 1
      g.peckT = Math.max(g.peckT, 0.55) // оглушён — мгновение не ворует
      const d = Math.hypot(g.x - this.paw.x, g.y - this.paw.y) || 1
      g.kx = ((g.x - this.paw.x) / d) * 300 * u
      g.ky = ((g.y - this.paw.y) / d) * 300 * u
      this.paw.pulse = 1
      this.crumbs(g.x, g.y, '#E8E4DC', 7) // перья полетели
      if (g.hp <= 0) {
        // ПОВЕРЖЕН! Улетает кувырком, возвращая всё украденное в стаканчик
        g.state = 'flee'
        g.downed = true
        g.stateT = 0
        this.pigeonsRun++
        this.score += PIGEON_KO_BONUS
        if (g.stolen > 0) {
          this.collected += g.stolen
          for (let i = 0; i < g.stolen; i++) {
            this.flying.push({
              x0: g.x + (Math.random() - 0.5) * 36 * u,
              y0: g.y + (Math.random() - 0.5) * 24 * u,
              kind: 'popcorn',
              t: 0,
            })
          }
          g.stolen = 0
        }
        this.texts.push({
          x: g.x,
          y: g.y - 34 * u,
          text: this.L('txt.downed', { n: PIGEON_KO_BONUS }),
          color: '#FFE066',
          t: 0,
          dur: 1.2,
          size: 26 * u,
        })
        audio.play('meow') // кошка своего добилась!
        this.doShake(5)
        this.buzz([30, 30, 60])
      } else {
        this.texts.push({
          x: g.x,
          y: g.y - 34 * u,
          text: this.L('txt.hit'),
          color: '#FFFFFF',
          t: 0,
          dur: 0.55,
          size: 20 * u,
        })
        audio.play('shoo')
        this.buzz(15)
      }
    }
  }

  private pigeonPeck(): void {
    const u = this.u
    if (!this.pigeon) return
    if (this.collected > 0) {
      this.collected--
      if (this.pigeon) this.pigeon.stolen++ // при победе вернём в стаканчик
      this.streak = 0 // воришка сбивает серию
      this.pendingClear = -1 // украденное зерно отменяет близкое «уровень пройден»
      this.cup.squash = 1
      this.doShake(5)
      this.texts.push({
        x: this.cup.x,
        y: this.cup.y - this.cupH * 0.9,
        text: this.L('txt.stole'),
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
        text: this.L('txt.empty'),
        color: '#C8CFD8',
        t: 0,
        dur: 0.8,
        size: 20 * u,
      })
    }
  }

  /** Лапка ударилась о мину: всё, что она несла, высыпается на пол рядом —
      зёрна не пропадают, их можно снова собрать, когда шок отпустит.
      На другие мины зёрна не кладём — не подставляем игрока дважды */
  private shockDrop(): void {
    const u = this.u
    const mX = 40 * u
    const top = 52
    const bottom = this.H - 56 * u
    const dropped = this.carried
    this.carried = []
    for (const c of dropped) {
      let placed = false
      for (let tries = 0; tries < 14 && !placed; tries++) {
        const a = Math.random() * Math.PI * 2
        const r = (36 + Math.random() * 52) * u
        const x = Math.max(mX, Math.min(this.W - mX, this.paw.x + Math.cos(a) * r))
        const y = Math.max(top, Math.min(bottom, this.paw.y + Math.sin(a) * r))
        const onMine = this.pieces.some(
          (q) => q.kind === 'corn' && Math.hypot(x - q.x, y - q.y) < 34 * u,
        )
        if (!onMine) {
          this.pieces.push({
            x,
            y,
            rot: (Math.random() - 0.5) * 0.9,
            kind: c.kind,
            phase: Math.random() * Math.PI * 2,
            spawn: 0.3, // короткая «пружинка» появления
            dA: 0,
          })
          placed = true
        }
      }
      if (!placed) {
        // вокруг сплошь мины — кладём под лапку, пусть будет счастливый билет
        this.pieces.push({
          x: this.paw.x,
          y: Math.max(top, Math.min(bottom, this.paw.y)),
          rot: 0,
          kind: c.kind,
          phase: 0,
          spawn: 0.3,
          dA: 0,
        })
      }
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
    const fever = !!this.fever || this.feverAfter >= 0
    const feverGained = this.fever
      ? this.fever.gained
      : this.feverAfter >= 0
        ? this.lastFeverGained
        : 0
    const key = `${this.score}|${this.lvl}|${this.quota}|${this.collected}|${this.carried.length}|${sec}|${this.paused}|${this.streak}|${this.goldenCount}|${this.pigeonsRun}|${fever}|${feverGained}|${this.wave}`
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
      paused: this.paused,
      streak: this.streak,
      comboMult: this.comboMult,
      goldenCount: this.goldenCount,
      pigeonShooed: this.pigeonsRun,
      fever,
      feverGained,
      wave: this.wave,
    })
  }

  /* ================= отрисовка ================= */

  private render(ts: number): void {
    const { ctx } = this
    ctx.clearRect(0, 0, this.W, this.H)
    if (this.phase === 'idle') return

    /* Виньетка контраста: лёгкое затемнение игровой зоны поверх фоновой
       картинки — светлые зёрна, лапка и курсор читаются на любой комнате,
       включая старые Android с блеклой передачей (жалоба на уровень 10) */
    if (this.phase === 'playing' && !this.paused) {
      ctx.fillStyle = 'rgba(30, 15, 5, 0.16)'
      ctx.fillRect(0, 0, this.W, this.H)
    }

    ctx.save()
    /* Тряска экрана при минах/голубе (настройка «Тряска экрана») */
    if (this.opts.shake && this.shakeT > 0 && this.shakeAmp > 0) {
      const a = this.shakeAmp * (this.shakeT / 0.3)
      ctx.translate((Math.random() - 0.5) * 2 * a, (Math.random() - 0.5) * 2 * a)
    }

    this.drawCup(ts)
    this.drawPieces(ts)
    if (this.pigeon && this.phase === 'playing') this.drawPigeon(ts)
    this.drawFlying()
    this.drawParticles()
    this.drawPaw(ts)
    /* Лихорадка: тёплая золотая дымка на фоне */
    if (this.fever) this.drawFeverFx()
    /* Туман рисуем ДО надписей: баннер «ВОЛНА N» и всплывающие тексты
       читаются сквозь попкорновый туман (раньше туман их накрывал) */
    if (this.perk === 'fog' && this.phase === 'playing') this.drawFog()
    this.drawTexts()
    this.drawBanner()

    if (this.phase === 'ended' || this.phase === 'clear') {
      ctx.fillStyle = 'rgba(24, 10, 4, 0.35)'
      ctx.fillRect(0, 0, this.W, this.H)
    }
    ctx.restore()
  }

  /** Голубь-воришка: пиксельный, с двумя кадрами взмаха, полоской жизни
      над головой и белой вспышкой при ударе лапкой */
  private drawPigeon(ts: number): void {
    const g = this.pigeon
    if (!g) return
    const { ctx } = this
    const u = this.u
    // Взмах крыльев: в полёте часто, в парении — лениво
    const flapMs = g.state === 'hover' ? 260 : 90
    const frame = Math.floor(ts / flapMs) % 2 === 0
    // Тень под голубем — пока он в деле (поверженный уже улетает)
    if (!g.downed) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.beginPath()
      ctx.ellipse(g.x, this.cup.y + 22 * u, 24 * u, 6 * u, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    // Клюв смотрит в сторону движения/стаканчика (спрайт смотрит влево)
    let faceLeft = true
    if (g.state === 'hover') faceLeft = g.x > this.cup.x - 10 * u
    else if (g.state === 'flee') faceLeft = -g.side < 0
    else faceLeft = (Math.sign(g.hx - g.x) || -g.side) < 0
    const dive = g.state === 'hover' ? Math.max(0, Math.sin(g.stateT * 6)) * 5 * u : 0
    // Поверженный улетает кувырком, крутясь через крыло
    const rot = g.downed
      ? ts * 0.028 * -g.side
      : g.state === 'flee'
        ? -0.3
        : Math.sin(ts * 0.003) * 0.06
    drawSprite(ctx, frame ? this.sp.pigeon0 : this.sp.pigeon1, g.x, g.y + dive, 3.1 * u, {
      rot,
      sx: faceLeft ? 1 : -1,
    })

    // Вспышка попадания: белое кольцо вокруг взъерошенного воришки
    if (g.flash > 0) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, g.flash) * 0.8
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = Math.max(2, 2.5 * u)
      ctx.beginPath()
      ctx.arc(g.x, g.y + dive, 36 * u, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // ПОЛОСКА ЖИЗНИ: насечки = сколько ударов ещё выдержит. Прячется,
    // когда воришка уже улетает (повержен или испугался)
    if (g.state !== 'flee') {
      const bw = 46 * u
      const bh = 7 * u
      const bx = g.x - bw / 2
      const by = g.y - 42 * u + dive
      ctx.fillStyle = 'rgba(24, 10, 4, 0.9)'
      ctx.fillRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u)
      ctx.fillStyle = '#3A2410'
      ctx.fillRect(bx, by, bw, bh)
      const frac = Math.max(0, g.hp / g.maxHp)
      ctx.fillStyle = frac > 0.5 ? '#7ED957' : frac > 0.25 ? '#FFC93C' : '#E5342E'
      ctx.fillRect(bx, by, bw * frac, bh)
      ctx.fillStyle = 'rgba(24, 10, 4, 0.55)'
      for (let i = 1; i < g.maxHp; i++) {
        ctx.fillRect(bx + (bw * i) / g.maxHp - u, by, Math.max(1.5, 2 * u), bh)
      }
      if (g.flash > 0) {
        ctx.save()
        ctx.globalAlpha = Math.min(1, g.flash)
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = Math.max(1.5, 1.5 * u)
        ctx.strokeRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u)
        ctx.restore()
      }
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

  /** Деревянный столик + детальный стаканчик с анимацией наполнения.
      Корзина больше не «висит в воздухе»: стоит на столешнице. */
  private drawCup(ts: number): void {
    const { ctx } = this
    const u = this.u
    const s = this.cupScale
    const sq = this.cup.squash
    // «Дыхание» стаканчика: лёгкое покачивание в такт музыке (кроме подскока при сдаче)
    const breathe = 1 + Math.sin(ts * 0.0023) * 0.012
    const sx = 1 + 0.08 * sq
    const sy = breathe - 0.1 * sq

    /* --- столик: ножки и столешница --- */
    const tableY = this.tableY
    ctx.fillStyle = '#8a5330' // ножки
    ctx.fillRect(this.cup.x - 56 * u, tableY + 6 * u, 9 * u, 24 * u)
    ctx.fillRect(this.cup.x + 47 * u, tableY + 6 * u, 9 * u, 24 * u)
    ctx.fillStyle = '#B07A3F' // столешница
    ctx.fillRect(this.cup.x - 66 * u, tableY - 4 * u, 132 * u, 10 * u)
    ctx.fillStyle = '#6B421F' // тёмная кромка столешницы
    ctx.fillRect(this.cup.x - 66 * u, tableY + 4 * u, 132 * u, 3 * u)

    /* --- тень стаканчика на столешнице --- */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)'
    ctx.beginPath()
    ctx.ellipse(this.cup.x, tableY + 2 * u, 46 * u * sx, 5 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    /* --- корпус стаканчика (детальный спрайт 48×54) --- */
    drawSprite(ctx, this.sp.cup, this.cup.x, this.cup.y, s, { sx, sy })

    /* --- наполнение ВНУТРИ стаканчика: растёт вместе с выполнением нормы --- */
    const progress = this.quota > 0 ? this.collected / this.quota : 0
    const fill = Math.min(CUP_FILL_POS.length, Math.ceil(progress * CUP_FILL_POS.length))
    if (fill > 0) {
      ctx.save()
      // Внутренняя трапеция стаканчика — зёрна не выходят за бумажные стенки
      const topY = this.cup.y - 22.4 * s * sy
      const botY = this.cup.y + 22.4 * s * sy
      const halfTop = 20.8 * s * sx
      const halfBot = 12.8 * s * sx
      ctx.beginPath()
      ctx.moveTo(this.cup.x - halfTop, topY)
      ctx.lineTo(this.cup.x + halfTop, topY)
      ctx.lineTo(this.cup.x + halfBot, botY)
      ctx.lineTo(this.cup.x - halfBot, botY)
      ctx.closePath()
      ctx.clip()
      for (let i = 0; i < fill; i++) {
        const [ox, oy] = CUP_FILL_POS[i]
        // Каждое новое зёрнышко «пружинит» при появлении (easeOutBack)
        const age = this.fillPop[i] ?? 1
        const pop = easeOutBack(Math.min(1, age / 0.3))
        drawSprite(
          ctx,
          this.sp.popcorn,
          this.cup.x + ox * s * sx,
          this.cup.y + oy * s * sy,
          s * 0.88 * (0.55 + 0.45 * pop),
          { rot: i * 0.9 + (1 - pop) * 1.1, alpha: Math.min(1, age * 3 + 0.25) * 0.88 },
        )
      }
      // Лёгкая притенённость — зёрна читаются «за стенкой», а не на поле
      ctx.globalAlpha = 0.18
      ctx.fillStyle = '#8a2f1d'
      ctx.fillRect(this.cup.x - halfTop, topY, halfTop * 2, botY - topY)
      ctx.restore()
    }

    /* --- искра над стаканчиком после сданного золотого зерна --- */
    if (this.cupGlow > 0.01) {
      drawSprite(ctx, this.sp.sparkle, this.cup.x + 14 * u, this.cup.y - this.cupH * 0.62, 1.6 * u, {
        rot: ts * 0.006,
        alpha: Math.min(1, this.cupGlow) * 0.95,
      })
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
      // Попкорн мельчает, мины толстеют — ступени каждые 5 уровней.
      // Ценные зёрна мельче: белое +1 крупное, золотое +5 — крохотное
      const base =
        p.kind === 'corn'
          ? 2.3 * this.cornScale
          : 2.6 * this.popScale * KIND_SCALE[p.kind]
      const scale = base * u * Math.max(0.05, pop)

      // Тень (плотнее — зерно заметно на любом фоне, даже на тёмном чердаке)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.24)'
      ctx.beginPath()
      ctx.ellipse(p.x, p.y + 8 * u, 11 * u * pop, 5 * u * pop, 0, 0, Math.PI * 2)
      ctx.fill()

      // Кольцо опасности: пульсирует вокруг каждой мины — «заряжено!» видно
      // краем глаза, ещё до того, как рассмотрел шипы
      if (p.kind === 'corn') {
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.006 + p.phase * 3)
        ctx.save()
        ctx.globalAlpha = 0.2 + 0.18 * pulse
        ctx.strokeStyle = this.opts.colorblind ? '#7FB2FF' : '#FF5A4E'
        ctx.lineWidth = Math.max(1.5, 2 * u)
        ctx.beginPath()
        ctx.arc(p.x, y, (15 + 4 * pulse) * u * this.cornScale, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      const sprite = p.kind === 'corn'
        ? this.opts.colorblind
          ? this.sp.cornCB // дальтоник: сине-оранжевая мина
          : this.sp.corn
        : p.kind === 'golden'
          ? this.sp.golden
          : p.kind === 'caramel'
            ? this.sp.caramel
            : p.kind === 'butter'
              ? this.sp.butter
              : this.sp.popcorn
      drawSprite(ctx, sprite, p.x, y, scale, { rot: p.rot })
      // Режим дальтоников: пульсирующая белая метка над миной
      if (p.kind === 'corn' && this.opts.colorblind) {
        const blink = 0.6 + 0.4 * Math.sin(ts * 0.008 + p.phase)
        ctx.save()
        ctx.globalAlpha = blink
        ctx.font = `700 ${Math.round(15 * u)}px system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        this.applyUpright(ctx, p.x, y - 16 * u)
        ctx.lineWidth = 3 * u
        ctx.strokeStyle = 'rgba(18, 39, 92, 0.95)'
        ctx.strokeText('!', p.x, y - 16 * u)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText('!', p.x, y - 16 * u)
        ctx.restore()
      }
      if (p.kind === 'golden') {
        drawSprite(ctx, this.sp.sparkle, p.x + 10 * u, y - 11 * u, 1.15 * u, {
          rot: ts * 0.004,
          alpha: 0.95,
        })
      }
      // Масляное зерно — скромный блеск, чтобы отличалось на бегу
      if (p.kind === 'butter') {
        drawSprite(ctx, this.sp.sparkle, p.x - 9 * u, y - 10 * u, 0.8 * u, {
          rot: -ts * 0.003,
          alpha: 0.5 + 0.3 * Math.sin(ts * 0.005 + p.phase),
        })
      }
    }
  }

  private drawFlying(): void {
    const { ctx } = this
    const u = this.u
    const tx = this.cup.x
    const ty = this.cup.y - 26 * this.cupScale // горлышко стаканчика
    for (const f of this.flying) {
      const q = easeOutQuad(f.t)
      const x = f.x0 + (tx - f.x0) * q
      const y = f.y0 + (ty - f.y0) * q - Math.sin(q * Math.PI) * 30 * u
      drawSprite(
        ctx,
        f.kind === 'golden'
          ? this.sp.golden
          : f.kind === 'caramel'
            ? this.sp.caramel
            : f.kind === 'butter'
              ? this.sp.butter
              : this.sp.popcorn,
        x,
        y,
        2.6 * u * this.popScale * (KIND_SCALE[f.kind] ?? 1) * (1 - 0.45 * q),
        {
          rot: q * 3,
        },
      )
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
    // Шок от мины: мелкая дрожь «опешившей» лапки, пока не отпустило
    const shockJx = this.stun > 0 ? Math.sin(ts * 0.049) * 3.2 * u : 0
    const shockJy = this.stun > 0 ? Math.cos(ts * 0.037) * 2.4 * u : 0
    const px = this.paw.x + shake + jx + shockJx
    const py = this.paw.y + jy + shockJy

    // Светлое пятно под лапкой: курсор виден на ЛЮБОМ фоне — тёмный чердак,
    // ночной двор, старые Android-браузеры (была жалоба: «курсора не видно»)
    ctx.fillStyle = 'rgba(255, 247, 220, 0.16)'
    ctx.beginPath()
    ctx.ellipse(px, py - 2 * u, 46 * u, 34 * u, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 247, 220, 0.22)'
    ctx.beginPath()
    ctx.ellipse(px, py - 2 * u, 30 * u, 22 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    /* Кольцо зоны подбора: тонкий пунктир, по которому видно «очертания»
       ловли на любом фоне и любом экране (старые Android, тёмные комнаты) */
    if (this.phase === 'playing' && !this.paused) {
      const gr =
        (this.perk === 'bigpaw' ? 58 : this.perk === 'smallpaw' ? 34 : 44) *
        u *
        (this.pawBonus.grabR ?? 1)
      ctx.save()
      ctx.globalAlpha = 0.16 + 0.05 * Math.sin(ts * 0.004)
      ctx.strokeStyle = '#FFF3D0'
      ctx.lineWidth = Math.max(1.5, 1.6 * u)
      ctx.setLineDash([7 * u, 6 * u])
      ctx.beginPath()
      ctx.ellipse(px, py + 4 * u, gr * 1.12, gr * 0.82, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // Тень лапки
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.beginPath()
    ctx.ellipse(px, py + 28 * u, 26 * u, 7 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    const basePaw = this.perk === 'bigpaw' ? 3.6 : this.perk === 'smallpaw' ? 2.17 : 2.85
    const s = basePaw * u * (1 + 0.13 * this.paw.pulse)
    drawSprite(ctx, this.sp.paw, px, py, s)

    // Зёрна в лапке (стопкой над подушечкой)
    this.carried.forEach((c, i) => {
      const wig = Math.sin(ts * 0.012 + i * 2) * 1.6 * u
      const y = py - 30 * u - i * 14 * u * this.popScale + (1 - c.grabT) * 10 * u
      const spr =
        c.kind === 'golden'
          ? this.sp.golden
          : c.kind === 'caramel'
            ? this.sp.caramel
            : c.kind === 'butter'
              ? this.sp.butter
              : this.sp.popcorn
      drawSprite(ctx, spr, px + wig, y, 2.3 * u * this.popScale * (KIND_SCALE[c.kind] ?? 1), {
        rot: Math.sin(ts * 0.006 + i) * 0.12,
      })
    })

    /* Шок от мины: три звёздочки кружатся над лапкой — «голова кругом» */
    if (this.stun > 0) {
      const fade = Math.min(1, this.stun * 2.5)
      for (let i = 0; i < 3; i++) {
        const a = ts * 0.0075 + (i * Math.PI * 2) / 3
        drawSprite(
          ctx,
          this.sp.sparkle,
          px + Math.cos(a) * 24 * u,
          py - 38 * u + Math.sin(a) * 8 * u,
          1.25 * u,
          { rot: ts * 0.012, alpha: fade },
        )
      }
    }
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
      /* Даже в зеркальном мире и на боку всплывающие тексты читаются прямо */
      this.applyUpright(ctx, t.x, y)
      ctx.lineWidth = Math.max(3, t.size * 0.16)
      ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)'
      ctx.strokeText(t.text, t.x, y)
      ctx.fillStyle = t.color
      ctx.fillText(t.text, t.x, y)
      ctx.restore()
    }
  }

  /** «Лихорадка»: тёплая золотая дымка + постоянная крупная надпись
      «ЛИХОРАДКА» с заработанным счётом — игрок всегда понимает, что идёт
      бонусный уровень, даже когда баннер давно погас */
  private drawFeverFx(): void {
    const { ctx } = this
    ctx.fillStyle = 'rgba(255, 196, 60, 0.10)'
    ctx.fillRect(0, 0, this.W, this.H)
    ctx.fillStyle = 'rgba(255, 150, 40, 0.08)'
    ctx.fillRect(0, 0, this.W, 52)
    ctx.fillRect(0, this.H - 52, this.W, 52)

    const f = this.fever
    if (!f) return
    const u = this.u
    const pulse = 1 + Math.sin(performance.now() * 0.009) * 0.06
    const size = 26 * u * pulse
    const y = 74 * u
    ctx.save()
    ctx.globalAlpha = 0.92
    ctx.font = `700 ${size}px "Handjet", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    /* Надпись читается прямо даже в зеркальном мире и на боку */
    this.applyUpright(ctx, this.W / 2, y)
    ctx.lineWidth = Math.max(4, size * 0.18)
    ctx.strokeStyle = 'rgba(46, 18, 6, 0.95)'
    ctx.strokeText(this.L('banner.fever'), this.W / 2, y)
    ctx.fillStyle = '#FFC93C'
    ctx.fillText(this.L('banner.fever'), this.W / 2, y)
    /* Заработанные в лихорадке очки — видно в реальном времени */
    const gSize = 19 * u
    ctx.font = `700 ${gSize}px "Handjet", system-ui, sans-serif`
    ctx.globalAlpha = 0.85
    const gained = `+${f.gained}`
    ctx.lineWidth = Math.max(3, gSize * 0.16)
    ctx.strokeText(gained, this.W / 2, y + gSize * 1.15)
    ctx.fillStyle = '#FFE9B0'
    ctx.fillText(gained, this.W / 2, y + gSize * 1.15)
    ctx.restore()
  }

  /** Компенсация трансформаций экрана (зеркало/повороты): локально обращаем
      трансформацию вокруг точки надписи — буквы всегда читаются прямо */
  private applyUpright(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (this.perk === 'mirror') {
      ctx.translate(x, y)
      ctx.scale(-1, 1)
      ctx.translate(-x, -y)
    } else if (this.perk === 'rot180') {
      ctx.translate(x, y)
      ctx.rotate(Math.PI)
      ctx.translate(-x, -y)
    } else if (this.perk === 'rot90') {
      ctx.translate(x, y)
      ctx.rotate(-Math.PI / 2)
      ctx.translate(-x, -y)
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
    /* Даже в зеркальном мире и на боку надписи баннера читаются прямо */
    this.applyUpright(ctx, this.W / 2, this.H * 0.3)
    ctx.lineWidth = Math.max(4, size * 0.18)
    ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)'
    ctx.strokeText(this.banner.text, this.W / 2, this.H * 0.3)
    ctx.fillStyle = '#FFE066'
    ctx.fillText(this.banner.text, this.W / 2, this.H * 0.3)
    ctx.restore()
  }
}
