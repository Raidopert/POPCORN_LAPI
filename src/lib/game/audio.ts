/**
 * 8-битный аудио-движок (чиптюн) на Web Audio API.
 * Никаких внешних файлов: музыка и звуки синтезируются в реальном времени.
 */

export type SfxName =
  | 'pickup'
  | 'golden'
  | 'deposit'
  | 'wave'
  | 'click'
  | 'tick'
  | 'penalty'
  | 'gameover'
  | 'record'
  | 'chest'
  | 'perk'
  | 'levelwin'
  | 'meow'
  | 'pigeon'
  | 'shoo'
  | 'plop'
  | 'plopGold'
  | 'fever'
  | 'coin'

const NOTE_OFFSETS: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
}

/** Частота ноты вида "C5", "F#3" (A4 = 440 Гц) */
function noteFreq(name: string): number {
  const m = /^([A-G]#?)(\d)$/.exec(name)
  if (!m) return 440
  const midi = NOTE_OFFSETS[m[1]] + (parseInt(m[2], 10) + 1) * 12
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/* Мелодия A (спокойная) — 32 шага по 1/8, 4 такта */
const LEAD_A: (string | null)[] = [
  'E5', null, 'E5', 'G5', 'A5', null, 'G5', null,
  'F5', null, 'F5', 'A5', 'C6', null, 'A5', null,
  'G5', null, 'G5', 'B5', 'D6', null, 'B5', 'G5',
  'C6', null, 'G5', 'E5', 'C5', null, null, null,
]

/* Мелодия B (энергичная, без пауз) — для высоких волн */
const LEAD_B: (string | null)[] = [
  'E5', 'G5', 'A5', 'G5', 'E5', 'G5', 'A5', 'B5',
  'F5', 'A5', 'C6', 'A5', 'F5', 'A5', 'C6', 'D6',
  'G5', 'B5', 'D6', 'B5', 'G5', 'B5', 'D6', 'B5',
  'C6', 'D6', 'E6', 'D6', 'C6', null, 'G5', null,
]

/* Бас (треугольная волна) — играем на четвертях */
const BASS: (string | null)[] = [
  'C3', null, 'G2', null, 'C3', null, 'G2', null,
  'F2', null, 'C3', null, 'F2', null, 'C3', null,
  'G2', null, 'D3', null, 'G2', null, 'D3', null,
  'C3', null, 'G2', null, 'C3', null, 'G2', null,
]

/* Темп по уровням напряжённости (от оставшегося времени):
   0 — база 140 · 1 — +25% (175) · 2 — +40% (196) · 3 — финиш 240 BPM */
const TEMPOS = [140, 175, 196, 240]

/* ЗАГЛАВНАЯ ТЕМА МЕНЮ «Попкорн и кот» — тёплая, уютная, 112 BPM.
   Кружевная мелодия в до-мажоре: гуляет по трезвучиям, как кот по подоконнику,
   и завершается мягкой каденцией — тема узнаваема с первых секунд. */
const MENU_TEMPO = 112
const MENU_LEAD: (string | null)[] = [
  'E5', null, 'G5', null, 'C6', null, 'G5', null,
  'A5', null, 'G5', 'E5', null, 'D5', 'E5', null,
  'F5', null, 'A5', null, 'G5', null, 'E5', null,
  'D5', null, 'E5', 'D5', 'C5', null, null, null,
]
const MENU_BASS: (string | null)[] = [
  'C3', null, 'G2', null, 'C3', null, 'G2', null,
  'A2', null, 'E2', null, 'A2', null, 'E2', null,
  'F2', null, 'C3', null, 'F2', null, 'C3', null,
  'G2', null, 'B2', null, 'C3', null, 'G2', null,
]

class ChipTuneAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private noiseBuf: AudioBuffer | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private step = 0
  private nextTime = 0
  private playingMusic = false
  private _muted = false
  /** Громкость музыки и звуков (0..1) — из настроек, применяются к шинам */
  private _volMusic = 1
  private _volSfx = 1
  private level = 0
  private stage = 0
  /** Какая тема играет: игровая (ускоряется) или заглавная меню */
  private mode: 'game' | 'menu' = 'game'

  /** Уровень напряжённости 0–3: темп и мелодия зависят от оставшегося времени */
  setIntensity(level: number): void {
    this.level = Math.max(0, Math.min(3, level))
  }

  /** Сложность забега: с 3-го уровня мелодия энергичнее */
  setMusicLevel(stage: number): void {
    this.stage = stage >= 1 ? 1 : 0
  }

  /** Создаёт/возобновляет AudioContext. Вызывать по жесту пользователя. */
  ensure(): boolean {
    if (typeof window === 'undefined') return false
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return false
      try {
        this.ctx = new AC()
      } catch {
        return false
      }
      this.master = this.ctx.createGain()
      this.master.gain.value = this._muted ? 0 : 0.5
      this.master.connect(this.ctx.destination)

      this.musicBus = this.ctx.createGain()
      this.musicBus.gain.value = 0.55 * this._volMusic
      this.musicBus.connect(this.master)

      this.sfxBus = this.ctx.createGain()
      this.sfxBus.gain.value = 0.9 * this._volSfx
      this.sfxBus.connect(this.master)

      // Белый шум для перкуссии (буфер на 1 секунду)
      const len = this.ctx.sampleRate
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
      const data = this.noiseBuf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return true
  }

  get muted(): boolean {
    return this._muted
  }

  setMuted(m: boolean): void {
    this._muted = m
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.02)
    }
  }

  /** Громкость музыки и звуков по отдельности (0..1). Живой плавный переход без щелчков. */
  setVolumes(music: number, sfx: number): void {
    this._volMusic = Math.max(0, Math.min(1, music))
    this._volSfx = Math.max(0, Math.min(1, sfx))
    if (this.ctx && this.musicBus && this.sfxBus) {
      this.musicBus.gain.setTargetAtTime(0.55 * this._volMusic, this.ctx.currentTime, 0.02)
      this.sfxBus.gain.setTargetAtTime(0.9 * this._volSfx, this.ctx.currentTime, 0.02)
    }
  }

  /**
   * Запуск музыки. mode='menu' — заглавная тема (в меню), mode='game' — игровая.
   * Если музыка уже играет — просто переключаем тему без перезапуска (без щелчка).
   */
  startMusic(mode: 'game' | 'menu' = 'game'): void {
    if (!this.ensure()) return
    if (this.playingMusic) {
      this.mode = mode
      return
    }
    this.playingMusic = true
    this.mode = mode
    this.step = 0
    this.nextTime = (this.ctx as AudioContext).currentTime + 0.08
    this.timer = setInterval(() => this.schedule(), 25)
  }

  /** Играет ли сейчас музыка (любая) */
  get musicPlaying(): boolean {
    return this.playingMusic
  }

  stopMusic(): void {
    this.playingMusic = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private schedule(): void {
    if (!this.ctx || !this.playingMusic) return
    // Защита от «завала» нот: если вкладка была свёрнута и таймер троттилился,
    // nextTime отстаёт от currentTime — при возврате цикл создавал бы тысячи
    // осцилляторов разом и крашил вкладку. Просто перескакиваем пропущенное.
    if (this.nextTime < this.ctx.currentTime - 0.25) {
      this.nextTime = this.ctx.currentTime + 0.05
      this.step = 0
    }
    const bpm = this.mode === 'menu' ? MENU_TEMPO : TEMPOS[this.level]
    const stepDur = 60 / bpm / 2
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      this.playStep(this.step % 32, this.nextTime, stepDur)
      this.nextTime += stepDur
      this.step++
    }
  }

  private playStep(s: number, t: number, dur: number): void {
    const bus = this.musicBus as GainNode
    const m8 = s % 8
    if (this.mode === 'menu') {
      /* Заглавная тема: мягче и суше — барабаны почти неслышны */
      const lead = MENU_LEAD[s]
      if (lead) {
        this.tone('square', noteFreq(lead), t, dur * 0.9, 0.11, bus)
        // Тёплое «эхо» октавой ниже — уютная подложка
        this.tone('triangle', noteFreq(lead) / 2, t, dur * 1.4, 0.07, bus)
      }
      const bass = MENU_BASS[s]
      if (bass) this.tone('triangle', noteFreq(bass), t, dur * 1.8, 0.2, bus)
      if (m8 === 0) this.tone('sine', 150, t, 0.09, 0.4, bus, 42)
      if (m8 === 4) this.noise(t, 0.05, 0.09, 'highpass', 7000, bus)
      return
    }
    const lead = (this.level >= 2 || this.stage >= 1 ? LEAD_B : LEAD_A)[s]
    if (lead) this.tone('square', noteFreq(lead), t, dur * 0.92, 0.15, bus)
    const bass = BASS[s]
    if (bass) this.tone('triangle', noteFreq(bass), t, dur * 1.7, 0.24, bus)
    if (m8 === 0 || m8 === 4) this.tone('sine', 160, t, 0.1, 0.55, bus, 44)
    if (m8 === 2 || m8 === 6) this.noise(t, 0.07, 0.2, 'bandpass', 1800, bus)
    if (m8 % 2 === 0) this.noise(t, 0.03, 0.055, 'highpass', 6800, bus)
  }

  /* ---------- примитивы ---------- */

  private tone(
    type: OscillatorType,
    freq: number,
    t: number,
    dur: number,
    gain: number,
    bus: GainNode,
    slideTo?: number,
  ): void {
    const ctx = this.ctx as AudioContext
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(Math.max(1, freq), t)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g)
    g.connect(bus)
    osc.start(t)
    osc.stop(t + dur + 0.03)
  }

  private noise(
    t: number,
    dur: number,
    gain: number,
    filterType: BiquadFilterType,
    filterFreq: number,
    bus: GainNode,
  ): void {
    const ctx = this.ctx as AudioContext
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    src.loop = true
    const f = ctx.createBiquadFilter()
    f.type = filterType
    f.frequency.value = filterFreq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(f)
    f.connect(g)
    g.connect(bus)
    src.start(t)
    src.stop(t + dur + 0.03)
  }

  /* ---------- звуковые эффекты ---------- */

  play(name: SfxName): void {
    if (!this.ensure()) return
    const ctx = this.ctx as AudioContext
    const bus = this.sfxBus as GainNode
    const t = ctx.currentTime + 0.001

    switch (name) {
      case 'pickup':
        this.tone('square', 620, t, 0.07, 0.22, bus, 980)
        break
      case 'golden':
        this.tone('square', noteFreq('E6'), t, 0.06, 0.22, bus)
        this.tone('square', noteFreq('G6'), t + 0.06, 0.06, 0.22, bus)
        this.tone('square', noteFreq('C7'), t + 0.12, 0.12, 0.22, bus)
        break
      case 'deposit':
        this.tone('sine', 540, t, 0.12, 0.4, bus, 170)
        this.noise(t, 0.07, 0.1, 'bandpass', 3200, bus)
        this.tone('square', noteFreq('C6'), t + 0.05, 0.06, 0.12, bus)
        break
      case 'wave':
        ;['C5', 'E5', 'G5', 'C6'].forEach((n, i) =>
          this.tone('square', noteFreq(n), t + i * 0.07, 0.09, 0.2, bus),
        )
        break
      case 'click':
        this.tone('square', 880, t, 0.05, 0.18, bus)
        break
      case 'tick':
        this.tone('square', 1250, t, 0.045, 0.2, bus)
        break
      case 'penalty':
        this.tone('square', 320, t, 0.2, 0.3, bus, 110)
        this.tone('sawtooth', 180, t + 0.02, 0.15, 0.14, bus, 80)
        break
      case 'gameover':
        ;['C5', 'G4', 'E5', 'C5'].forEach((n, i) =>
          this.tone('square', noteFreq(n), t + i * 0.16, 0.15, 0.22, bus),
        )
        this.tone('triangle', noteFreq('C3'), t + 0.64, 0.4, 0.25, bus)
        break
      case 'record':
        ;['C5', 'E5', 'G5', 'C6', 'E6', 'G6'].forEach((n, i) =>
          this.tone('square', noteFreq(n), t + i * 0.09, 0.1, 0.22, bus),
        )
        ;['C6', 'E6', 'G6', 'C7'].forEach((n) =>
          this.tone('square', noteFreq(n), t + 0.56, 0.5, 0.12, bus),
        )
        break
      case 'chest':
        // Щелчок замка + скрип крышки
        this.tone('square', 220, t, 0.06, 0.26, bus, 150)
        this.noise(t + 0.09, 0.13, 0.16, 'bandpass', 900, bus)
        this.tone('triangle', 330, t + 0.12, 0.12, 0.16, bus, 240)
        break
      case 'perk':
        // Фанфара открытия перка
        ;['C5', 'F5', 'A5', 'C6'].forEach((n, i) =>
          this.tone('square', noteFreq(n), t + i * 0.08, 0.1, 0.22, bus),
        )
        this.tone('triangle', noteFreq('F4'), t + 0.34, 0.3, 0.2, bus)
        break
      case 'levelwin':
        // Победный джингл пройденного уровня
        ;['G5', 'C6', 'E6', 'G6'].forEach((n, i) =>
          this.tone('square', noteFreq(n), t + i * 0.11, 0.14, 0.24, bus),
        )
        ;['C6', 'E6', 'G6', 'C7'].forEach((n) =>
          this.tone('square', noteFreq(n), t + 0.5, 0.4, 0.1, bus),
        )
        break
      case 'meow':
        // «Мяу!» кота-бонуса: два скольжения квадратной волной
        this.tone('square', 740, t, 0.11, 0.18, bus, 1080)
        this.tone('square', 900, t + 0.13, 0.2, 0.18, bus, 430)
        break
      case 'pigeon':
        // «Жух-жуу» голубя: низкое воркование треугольной волной
        this.tone('triangle', 320, t, 0.16, 0.3, bus, 240)
        this.tone('triangle', 280, t + 0.2, 0.24, 0.3, bus, 190)
        break
      case 'shoo':
        // Отгон голубя: резкий взлёт вверх + шорох крыльев
        this.tone('square', 480, t, 0.1, 0.24, bus, 1050)
        this.noise(t + 0.05, 0.22, 0.16, 'bandpass', 2400, bus)
        this.tone('triangle', 700, t + 0.12, 0.18, 0.18, bus, 1500)
        break
      case 'plop':
        // Зёрнышко упало на дно стаканчика: глухой «плюх» + лёгкий шелест бумаги
        this.tone('sine', 300, t, 0.09, 0.32, bus, 120)
        this.noise(t, 0.045, 0.09, 'bandpass', 1500, bus)
        break
      case 'plopGold':
        // Золотое зёрнышко: плюх повыше и звонкая искра
        this.tone('sine', 430, t, 0.09, 0.32, bus, 170)
        this.tone('square', noteFreq('E6'), t + 0.05, 0.08, 0.14, bus)
        this.noise(t, 0.045, 0.09, 'bandpass', 1500, bus)
        break
      case 'fever':
        // «ЛИХОРАДКА»: звон игровых автоматов — джекпот-арпеджио вверх и встряска
        ;['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'].forEach((n, i) =>
          this.tone('square', noteFreq(n), t + i * 0.055, 0.09, 0.2, bus),
        )
        this.noise(t + 0.38, 0.28, 0.1, 'highpass', 6000, bus)
        this.tone('triangle', noteFreq('C7'), t + 0.38, 0.34, 0.12, bus)
        break
      case 'coin':
        // Звенящая монетка лихорадки
        this.tone('square', noteFreq('B6'), t, 0.05, 0.15, bus)
        this.tone('square', noteFreq('E7'), t + 0.05, 0.09, 0.15, bus)
        break
    }
  }
}

/** Синглтон на всё приложение */
export const audio = new ChipTuneAudio()
