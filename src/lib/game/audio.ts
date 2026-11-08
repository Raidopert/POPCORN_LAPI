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
  private level = 0

  /** Уровень напряжённости 0–3: темп и мелодия зависят от оставшегося времени */
  setIntensity(level: number): void {
    this.level = Math.max(0, Math.min(3, level))
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
      this.musicBus.gain.value = 0.55
      this.musicBus.connect(this.master)

      this.sfxBus = this.ctx.createGain()
      this.sfxBus.gain.value = 0.9
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

  startMusic(): void {
    if (!this.ensure() || this.playingMusic) return
    this.playingMusic = true
    this.step = 0
    this.nextTime = (this.ctx as AudioContext).currentTime + 0.08
    this.timer = setInterval(() => this.schedule(), 25)
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
    const bpm = TEMPOS[this.level]
    const stepDur = 60 / bpm / 2
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      this.playStep(this.step % 32, this.nextTime, stepDur)
      this.nextTime += stepDur
      this.step++
    }
  }

  private playStep(s: number, t: number, dur: number): void {
    const bus = this.musicBus as GainNode
    const lead = (this.level >= 2 ? LEAD_B : LEAD_A)[s]
    if (lead) this.tone('square', noteFreq(lead), t, dur * 0.92, 0.15, bus)
    const bass = BASS[s]
    if (bass) this.tone('triangle', noteFreq(bass), t, dur * 1.7, 0.24, bus)
    const m8 = s % 8
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
    }
  }
}

/** Синглтон на всё приложение */
export const audio = new ChipTuneAudio()
