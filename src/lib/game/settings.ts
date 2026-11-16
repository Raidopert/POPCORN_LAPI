/**
 * Настройки игрока «POPCORN PAWS».
 * Хранятся в localStorage одним JSON-объектом, применяются
 * к движку (сложность/качество/тряска/вибрация/дальтоник/голубь),
 * к интерфейсу (язык) и к обёртке (яркость/контраст/ориентация).
 */

import { detectLang, type Lang } from './i18n'

export type Difficulty = 'easy' | 'normal' | 'hard'
export type Quality = 'low' | 'medium' | 'high'
export type Orientation = 'portrait' | 'landscape' | 'auto'
/** Какой стик геймпада двигает лапку (v0.0.63) */
export type PadStick = 'left' | 'right'

/* ======================================================================
   v0.0.63: УПРАВЛЕНИЕ — настройки ввода для клавиатуры / геймпада / пульта.
   Идея «играть на любом устройстве»: тач и мышь работают всегда,
   клавиатура/стик/крестовина — через alt-input, а здесь игрок подгоняет
   их под себя: скорость курсора, мёртвая зона, инверсия, авто-нарезка,
   выбор стика и доп. привязки клавиш/кнопок.
   ====================================================================== */

/** Действия, которые можно назначить клавише или кнопке геймпада */
export type BindAction = 'up' | 'down' | 'left' | 'right' | 'action' | 'back'

/** Дополнительная привязка клавиатуры: null = только стандартные клавиши */
export interface KeyBindings {
  up: string | null
  down: string | null
  left: string | null
  right: string | null
  action: string | null
  back: string | null
}

/** Дополнительная привязка кнопок геймпада (индекс standard mapping) */
export interface PadBindings {
  action: number | null
  back: number | null
}

/** Стандартные клавиши (доп. привязка добавляется ПОВЕРХ них —
    чтобы случайно не отломать WASD/стрелки у ТВ-пульта) */
export const DEFAULT_KEY_CODES: Record<BindAction, string[]> = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  action: ['Space', 'Enter'],
  back: ['Escape', 'KeyP'],
}

/** Стандартные кнопки геймпада (standard mapping): A/✕ — действие,
    Start/Options и Back/Share — пауза/назад */
export const DEFAULT_PAD_ACTION = 0
export const DEFAULT_PAD_BACK = [9, 8]

/** Человекочитаемое имя клавиши из KeyboardEvent.code */
export function keyLabel(code: string): string {
  const short: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Space: 'Space',
    Enter: 'Enter',
    Escape: 'Esc',
    ShiftLeft: 'LShift',
    ShiftRight: 'RShift',
    ControlLeft: 'LCtrl',
    ControlRight: 'RCtrl',
    AltLeft: 'LAlt',
    AltRight: 'RAlt',
    Backquote: '`',
    Comma: ',',
    Period: '.',
    Slash: '/',
    Semicolon: ';',
    Quote: "'",
    BracketLeft: '[',
    BracketRight: ']',
    Minus: '-',
    Equal: '=',
    Tab: 'Tab',
    CapsLock: 'Caps',
    NumpadAdd: 'Num+',
    NumpadSubtract: 'Num-',
    NumpadEnter: 'NumEnter',
  }
  if (short[code]) return short[code]
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  if (code.startsWith('Numpad')) return 'Num' + code.slice(6)
  return code
}

/** Человекочитаемое имя кнопки геймпада по индексу standard mapping */
export function padLabel(i: number): string {
  const names = [
    'A / ✕',
    'B / ◯',
    'X / □',
    'Y / △',
    'LB',
    'RB',
    'LT',
    'RT',
    'Back',
    'Start',
    'LS',
    'RS',
    '↑',
    '↓',
    '←',
    '→',
    'Home',
  ]
  return names[i] ?? `#${i}`
}

export interface GameSettings {
  /** Язык интерфейса: ru / en / de / es */
  lang: Lang
  /** Сложность: норма, мины и время уровня */
  difficulty: Difficulty
  /** Качество: частицы, DPR-потолок, лишние эффекты */
  quality: Quality
  /** Ориентация экрана во время игры */
  orientation: Orientation
  /** Проклятья в сундучках */
  perksCurse: boolean
  /** Бонусные перки в сундучках */
  perksBonus: boolean
  /** Голубь-воришка */
  pigeon: boolean
  /** Тряска экрана при минах */
  shake: boolean
  /** Вибрация на телефоне */
  vibration: boolean
  /** Громкость музыки 0..1 */
  volumeMusic: number
  /** Громкость звуков/эффектов 0..1 */
  volumeSfx: number
  /** Режим для дальтоников: сине-оранжевые мины с меткой */
  colorblind: boolean
  /** CRT-развёртка (ретро-сканлайны поверх экрана, чистый CSS — почти бесплатно) */
  crt: boolean
  /** Яркость 0.6..1.4 */
  brightness: number
  /** Контраст 0.6..1.6 */
  contrast: number

  /* --- v0.0.63: управление (клавиатура / геймпад / пульт) --- */
  /** Скорость виртуального курсора (лапки): множитель 0.5..2 */
  cursorSpeed: number
  /** Инверсия стика по горизонтали */
  invertX: boolean
  /** Инверсия стика по вертикали */
  invertY: boolean
  /** Какой стик двигает лапку: левый или правый */
  padStick: PadStick
  /** Мёртвая зона стика 0.05..0.45 */
  deadzone: number
  /** Авто-нарезка: держишь направление — лапка пилит зигзагом сама
      (клавиатура, ТВ-пульт, крестовина геймпада) */
  chop: boolean
  /** Доп. клавиши клавиатуры (null — только стандартные) */
  keys: KeyBindings
  /** Кнопки геймпада (null — standard mapping) */
  padBtn: PadBindings
}

export const DEFAULT_SETTINGS: GameSettings = {
  lang: 'ru',
  difficulty: 'normal',
  quality: 'medium',
  orientation: 'auto',
  perksCurse: true,
  perksBonus: true,
  pigeon: true,
  shake: true,
  vibration: true,
  volumeMusic: 1,
  volumeSfx: 1,
  colorblind: false,
  crt: false,
  brightness: 1,
  contrast: 1,
  cursorSpeed: 1,
  invertX: false,
  invertY: false,
  padStick: 'left',
  deadzone: 0.22,
  chop: true,
  keys: { up: null, down: null, left: null, right: null, action: null, back: null },
  padBtn: { action: null, back: null },
}

const SETTINGS_KEY = 'popcorn-settings'
export const SETTINGS_EVENT = 'popcorn-settings-update'
export { SETTINGS_KEY }

function clamp(v: number, min: number, max: number, fallback: number): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

/** Доп. клавиши: принимаем только правдоподобные KeyboardEvent.code */
function parseKeys(v: unknown): KeyBindings {
  const def: KeyBindings = { up: null, down: null, left: null, right: null, action: null, back: null }
  if (!v || typeof v !== 'object') return def
  const o = v as Record<string, unknown>
  const out = { ...def }
  for (const act of Object.keys(def) as Array<keyof KeyBindings>) {
    const code = o[act]
    if (typeof code === 'string' && code.length >= 1 && code.length <= 40) out[act] = code
  }
  return out
}

/** Кнопки геймпада: целые индексы 0..17 standard mapping.
    ВАЖНО: null/undefined остаются null — Number(null)=0 превращал бы
    «сброшено» в «кнопка A» (баг рендера жёлтых капсул) */
function parsePad(v: unknown): PadBindings {
  const def: PadBindings = { action: null, back: null }
  if (!v || typeof v !== 'object') return def
  const o = v as Record<string, unknown>
  const num = (x: unknown): number | null => {
    if (x == null) return null
    const n = Number(x)
    return Number.isInteger(n) && n >= 0 && n <= 17 ? n : null
  }
  return { action: num(o.action), back: num(o.back) }
}

/** Разобрать JSON настроек (недостающие поля — дефолтные) */
export function parseSettingsRaw(raw: string): GameSettings {
  const base: GameSettings = { ...DEFAULT_SETTINGS }
  try {
    if (!raw) return base
    const o = JSON.parse(raw) as Record<string, unknown>
    return {
      lang: (['ru', 'en', 'de', 'es'] as const).includes(o.lang as Lang)
        ? (o.lang as Lang)
        : base.lang,
      difficulty: (['easy', 'normal', 'hard'] as const).includes(o.difficulty as Difficulty)
        ? (o.difficulty as Difficulty)
        : 'normal',
      quality: (['low', 'medium', 'high'] as const).includes(o.quality as Quality)
        ? (o.quality as Quality)
        : 'medium',
      orientation: (['portrait', 'landscape', 'auto'] as const).includes(
        o.orientation as Orientation,
      )
        ? (o.orientation as Orientation)
        : 'auto',
      perksCurse: o.perksCurse !== false,
      perksBonus: o.perksBonus !== false,
      pigeon: o.pigeon !== false,
      shake: o.shake !== false,
      vibration: o.vibration !== false,
      volumeMusic: clamp(o.volumeMusic as number, 0, 1, 1),
      volumeSfx: clamp(o.volumeSfx as number, 0, 1, 1),
      colorblind: o.colorblind === true,
      crt: o.crt === true,
      brightness: clamp(o.brightness as number, 0.6, 1.4, 1),
      contrast: clamp(o.contrast as number, 0.6, 1.6, 1),

      /* --- v0.0.63: управление --- */
      cursorSpeed: clamp(o.cursorSpeed as number, 0.5, 2, 1),
      invertX: o.invertX === true,
      invertY: o.invertY === true,
      padStick: o.padStick === 'right' ? 'right' : 'left',
      deadzone: clamp(o.deadzone as number, 0.05, 0.45, 0.22),
      chop: o.chop !== false,
      keys: parseKeys(o.keys),
      padBtn: parsePad(o.padBtn),
    }
  } catch {
    /* битый JSON — отдаём дефолты */
    return base
  }
}

/** Прочитать настройки из localStorage (первый запуск определяет язык браузера) */
export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  const raw = window.localStorage.getItem(SETTINGS_KEY)
  if (raw) return parseSettingsRaw(raw)
  // Нет сохранённых настроек — определяем язык интерфейса по браузеру
  return { ...parseSettingsRaw(raw ?? ''), lang: detectLang() }
}

/** Сохранить настройки и разослать событие подписчикам */
export function saveSettings(s: GameSettings): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    window.dispatchEvent(new Event(SETTINGS_EVENT))
  } catch {
    /* переполнение приватного режима — игнорируем */
  }
}
