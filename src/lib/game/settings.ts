/**
 * Настройки игрока «Кошачьего попкорнного Беспредела».
 * Хранятся в localStorage одним JSON-объектом, применяются
 * к движку (сложность/качество/тряска/вибрация/дальтоник/голубь),
 * к интерфейсу (язык) и к обёртке (яркость/контраст/ориентация).
 */

import { detectLang, type Lang } from './i18n'

export type Difficulty = 'easy' | 'normal' | 'hard'
export type Quality = 'low' | 'medium' | 'high'
export type Orientation = 'portrait' | 'landscape' | 'auto'

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
}

const SETTINGS_KEY = 'popcorn-settings'
export const SETTINGS_EVENT = 'popcorn-settings-update'
export { SETTINGS_KEY }

function clamp(v: number, min: number, max: number, fallback: number): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
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
