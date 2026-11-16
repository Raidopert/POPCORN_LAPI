/**
 * АЛЬТЕРНАТИВНЫЙ ВВОД (v0.0.63): клавиатура, геймпад (Xbox 360 / PS4) и
 * ТВ-пульт (Android TV) — поверх существующей touch/мышь-модели.
 *
 * Идея: движку всё равно, откуда летят координаты лапки — модуль ведёт
 * «виртуальный курсор» и скармливает его движку тем же setPointer(), что
 * и тач/мышь. Собирается всё в одном месте:
 *
 *   КЛАВИАТУРА: стрелки/WASD (+ своя доп. клавиша) — двигать лапку,
 *               Shift — ускорение, Space/Enter — действие (снежок в бою
 *               с Малышом), Esc/P — пауза-назад.
 *   ГЕЙМПАД:    стик (левый или правый — выбор в настройках) или
 *               крестовина — лапка, A/✕ (или своя кнопка) — действие,
 *               Start/Options (Back/Share) — пауза-назад (Gamepad API
 *               событий не шлёт — опрашиваем каждый кадр).
 *   ТВ-ПУЛЬТ:   крестовина = стрелки, «ОК» = Enter, «Назад» = Esc
 *               (key GoBack/BrowserBack/keyCode 4/10009). В меню стрелки
 *               ходят фокусом по кнопкам, Enter нажимает сфокусированную.
 *
 * v0.0.63 — НАРЕЗКА БЕЗ «ПИЛЫ» A-D: на клавиатуре/пульте/крестовине держишь
 * направление — лапка сама добавляет поперечный зигзаг (авто-нарезка,
 * отключается в настройках), а на геймпаде режет сам стик — аналоговая
 * скорость по отклонению. Настройки читаются прямо из стора settings.ts
 * (localStorage + событие SETTINGS_EVENT) — меню не нужно ничего прокидывать.
 *
 * В геймплее стрелки двигают лапку; в меню/оверлеях — ходят по кнопкам
 * (focusInDirection): работает и на десктопе, где стрелки фокус не гоняют.
 */

import {
  DEFAULT_KEY_CODES,
  DEFAULT_PAD_ACTION,
  DEFAULT_PAD_BACK,
  loadSettings,
  SETTINGS_EVENT,
} from './settings'

export type AltDir = 'up' | 'down' | 'left' | 'right'

/** Минимальный срез движка, нужный модулю (структурно совместим с PopcornEngine) */
export interface AltEngineLike {
  phase: string
  paused: boolean
  W: number
  H: number
  paw: { x: number; y: number }
  setPointer(x: number, y: number, lift?: number): void
  tapFire(x: number, y: number): void
}

export interface AltInputOptions {
  getEngine(): AltEngineLike | null
  /** Кэшированная рамка игрового поля (main) в координатах вьюпорта */
  getRect(): DOMRect | null
  /** true, когда идёт геймплей и лапка должна слушаться стрелок/стика */
  isPlaying(): boolean
  /** Esc/P/Back/Start — «назад»: закрыть оверлей, пауза, продолжить */
  onUiBack(): void
}

/** Базовая скорость лапки, px/s в пересчёте на u (u — масштаб движка) */
const BASE_SPEED = 470
/** Множитель ускорения по Shift */
const BOOST = 1.7
/** Частота поперечного зигзага авто-нарезки, Гц */
const CHOP_HZ = 2.3
/** Сила бокового взмаха относительно прямого хода (0..1) */
const CHOP_LAT = 0.95

/* ----------------------------------------------------------------------
   Флаг «идёт захват клавиши в настройках» — пока он поднят, alt-input не
   реагирует на клавиатуру/кнопки, чтобы привязка не двигала лапку.
   Экспортируемый сеттер вызывает экран настроек.
   ---------------------------------------------------------------------- */
let bindCapture = 0
export function setBindCapture(active: boolean): void {
  bindCapture = Math.max(0, bindCapture + (active ? 1 : -1))
}

export function attachAltInput(opts: AltInputOptions): () => void {
  /** Зажатые направления + 'boost'; чистится при blur, чтобы не «залипало» */
  const held = new Set<AltDir | 'boost'>()
  /** Виртуальный курсор в координатах движка */
  let vpX = 0
  let vpY = 0
  let vpInit = false
  let padTapPrev = false
  let padBackPrev = false
  let rafId = 0
  let lastT = 0
  /** Фаза поперечного зигзага авто-нарезки (клеится только при движении) */
  let chopPhase = 0

  /* ---------- живой снимок «УПРАВЛЕНИЕ» из настроек ---------- */
  interface Ctrl {
    speed: number
    invX: boolean
    invY: boolean
    stick: 'left' | 'right'
    dz: number
    chop: boolean
    keys: Record<string, string | null>
    pad: { action: number | null; back: number | null }
  }
  const readCtrl = (): Ctrl => {
    const s = loadSettings()
    return {
      speed: s.cursorSpeed,
      invX: s.invertX,
      invY: s.invertY,
      stick: s.padStick,
      dz: s.deadzone,
      chop: s.chop,
      keys: s.keys as unknown as Record<string, string | null>,
      pad: s.padBtn,
    }
  }
  let ctrl = readCtrl()
  /** Доп. клавиши: code → действие (поверх стандартных) */
  const extraCodes = new Map<string, string>()
  const rebuildExtra = (): void => {
    extraCodes.clear()
    for (const [act, code] of Object.entries(ctrl.keys)) {
      if (code) extraCodes.set(code, act)
    }
  }
  rebuildExtra()
  const onSettingsEvent = (): void => {
    ctrl = readCtrl()
    rebuildExtra()
    held.clear() // смена привязок не должна оставлять «зажатые» старые клавиши
  }
  window.addEventListener(SETTINGS_EVENT, onSettingsEvent)

  /** Масштаб движка — та же формула, что в engine.layout() */
  const uOf = (eng: AltEngineLike): number =>
    Math.max(0.7, Math.min(1.5, Math.min(eng.W, eng.H) / 420))

  /** Действие из доп. привязки (v0.0.63) */
  const actFromExtra = (e: KeyboardEvent): string | null =>
    extraCodes.get(e.code) ?? null

  /** Направление из стандартных клавиш — по e.code, независимо от раскладки.
      Старые ТВ-пульты и WebView шлют только keyCode или только e.key без
      e.code (проверено CDP: code пуст, keyCode 0) — дублируем по обоим */
  const dirFromDefault = (e: KeyboardEvent): AltDir | null => {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        return 'up'
      case 'ArrowDown':
      case 'KeyS':
        return 'down'
      case 'ArrowLeft':
      case 'KeyA':
        return 'left'
      case 'ArrowRight':
      case 'KeyD':
        return 'right'
    }
    /* e.key: стрелки одинаковы на всех раскладках — WASD здесь не дублируем
       (на русской раскладке это ЦФЫВ, физические клавиши уже покрыты code) */
    switch (e.key) {
      case 'ArrowUp':
        return 'up'
      case 'ArrowDown':
        return 'down'
      case 'ArrowLeft':
        return 'left'
      case 'ArrowRight':
        return 'right'
    }
    switch (e.keyCode) {
      case 38:
        return 'up'
      case 40:
        return 'down'
      case 37:
        return 'left'
      case 39:
        return 'right'
    }
    return null
  }

  /** Space / Enter — «действие» в геймплее (в меню Enter жмёт кнопку нативно).
     key-фолбэк и keyCode 13/32 — «ОК» старых ТВ-пультов и WebView без e.code */
  const isActionKey = (e: KeyboardEvent): boolean =>
    e.code === 'Space' ||
    e.code === 'Enter' ||
    e.key === ' ' ||
    e.key === 'Enter' ||
    e.key === 'Spacebar' ||
    e.keyCode === 13 ||
    e.keyCode === 32

  /** «Назад»: Esc, P, ТВ-кнопка Back (GoBack/BrowserBack/keyCode 4/10009) */
  const isBackKey = (e: KeyboardEvent): boolean =>
    e.code === 'Escape' ||
    e.code === 'KeyP' ||
    e.key === 'Escape' ||
    e.keyCode === 27 ||
    e.key === 'GoBack' ||
    e.key === 'BrowserBack' ||
    e.keyCode === 4 ||
    e.keyCode === 10009

  /** Не перехватываем ввод, пока игрок печатает имя в таблице лидеров */
  const isTypingTarget = (e: KeyboardEvent): boolean => {
    const t = e.target as HTMLElement | null
    if (!t) return false
    return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable
  }

  /** Меню: фокус на ближайшую видимую кнопку в направлении (ТВ-пульт/клавиатура).
      Если фокуса нет — берём кнопку ближе к центру экрана */
  const focusInDirection = (dir: AltDir): void => {
    const buttons = Array.from(
      document.querySelectorAll('button:not([disabled])'),
    ) as HTMLButtonElement[]
    const visible = buttons.filter((b) => b.getClientRects().length > 0)
    if (visible.length === 0) return
    const centerOf = (el: Element): [number, number] => {
      const r = el.getBoundingClientRect()
      return [r.left + r.width / 2, r.top + r.height / 2]
    }
    const active = document.activeElement as HTMLElement | null
    if (!active || !visible.includes(active as HTMLButtonElement)) {
      /* Фокуса нет: сначала главная кнопка меню (data-primary — «ИГРАТЬ»),
         иначе ближайшая к центру экрана */
      const primary = document.querySelector('button[data-primary]:not([disabled])')
      if (primary) {
        primary.focus()
        return
      }
      let best: HTMLElement | null = null
      let bestD = Infinity
      const vw = window.innerWidth / 2
      const vh = window.innerHeight / 2
      for (const b of visible) {
        const [cx, cy] = centerOf(b)
        const d = Math.hypot(cx - vw, cy - vh)
        if (d < bestD) {
          bestD = d
          best = b
        }
      }
      best?.focus()
      return
    }
    const [bx, by] = centerOf(active)
    let best: HTMLElement | null = null
    let bestScore = Infinity
    for (const b of visible) {
      if (b === active) continue
      const [cx, cy] = centerOf(b)
      const dx = cx - bx
      const dy = cy - by
      let primary = 0
      let cross = 0
      if (dir === 'right' && dx > 4) {
        primary = dx
        cross = Math.abs(dy)
      } else if (dir === 'left' && dx < -4) {
        primary = -dx
        cross = Math.abs(dy)
      } else if (dir === 'down' && dy > 4) {
        primary = dy
        cross = Math.abs(dx)
      } else if (dir === 'up' && dy < -4) {
        primary = -dy
        cross = Math.abs(dx)
      } else {
        continue
      }
      const score = primary + cross * 2.6
      if (score < bestScore) {
        bestScore = score
        best = b
      }
    }
    best?.focus()
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (bindCapture > 0 || isTypingTarget(e)) return
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      held.add('boost')
      return
    }
    /* v0.0.63: доп. привязка приоритетнее стандартных клавиш */
    const extra = actFromExtra(e)
    if (extra === 'back') {
      if (e.repeat) return
      e.preventDefault()
      opts.onUiBack()
      return
    }
    if (extra === 'action') {
      if (!opts.isPlaying()) return
      if (e.repeat) return
      e.preventDefault()
      fireAction()
      return
    }
    if (extra) {
      applyDir(extra as AltDir, e)
      return
    }
    if (isBackKey(e)) {
      if (e.repeat) return
      e.preventDefault()
      opts.onUiBack()
      return
    }
    const dir = dirFromDefault(e)
    if (dir) {
      applyDir(dir, e)
      return
    }
    if (isActionKey(e) && opts.isPlaying()) {
      if (e.repeat) return
      e.preventDefault() // не даём Space «кликнуть» HUD-кнопку, оставшуюся в фокусе
      fireAction()
    }
  }

  /** Общая обработка направления: в геймплее — зажать, в меню — фокус */
  const applyDir = (dir: AltDir, e: KeyboardEvent): void => {
    if (!opts.isPlaying()) {
      /* Меню/оверлей: крестовина ТВ-пульта ходит по кнопкам */
      if (e.repeat) return
      e.preventDefault()
      focusInDirection(dir)
      return
    }
    e.preventDefault()
    held.add(dir)
    if (!vpInit) {
      const eng = opts.getEngine()
      if (eng) {
        vpX = eng.paw.x
        vpY = eng.paw.y
        vpInit = true
      }
    }
  }

  /** «Действие» в геймплее: снежок в бою с Малышом */
  const fireAction = (): void => {
    const eng = opts.getEngine()
    if (!eng) return
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    eng.tapFire(vpInit ? vpX : eng.paw.x, vpInit ? vpY : eng.paw.y)
  }

  const onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      held.delete('boost')
      return
    }
    const extra = actFromExtra(e)
    if (extra && extra !== 'action' && extra !== 'back') {
      held.delete(extra as AltDir)
      return
    }
    const dir = dirFromDefault(e)
    if (dir) held.delete(dir)
  }

  /** Синхронизация виртуального курсора с мышью/тачем: чередование
      «мышь ↔ клавиши» без рывков — курсор всегда там, где последний ввод */
  const onPointerMove = (e: PointerEvent): void => {
    const r = opts.getRect()
    if (!r) return
    vpX = e.clientX - r.left
    vpY = e.clientY - r.top
    vpInit = true
  }

  const onBlur = (): void => {
    held.clear()
  }

  /** Опрос геймпадов + интеграция движения лапки (раз в кадр) */
  const poll = (t: number): void => {
    rafId = requestAnimationFrame(poll)
    const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016)
    lastT = t

    /* Аналоговый стик (выбирается в настройках: левый или правый) */
    let axX = 0
    let axY = 0
    /* Цифровые направления: клавиши и крестовина геймпада */
    let dpX = 0
    let dpY = 0
    let tap = false
    let back = false
    if (typeof navigator.getGamepads === 'function') {
      let pads: (Gamepad | null)[] = []
      try {
        pads = navigator.getGamepads()
      } catch {
        pads = []
      }
      const axIdx = ctrl.stick === 'right' ? [2, 3] : [0, 1]
      for (const gp of pads) {
        if (!gp) continue
        const rawX = gp.axes[axIdx[0]] ?? 0
        const rawY = gp.axes[axIdx[1]] ?? 0
        /* v0.0.63: мёртвая зона из настроек + инверсия осей стика */
        const mag = Math.hypot(rawX, rawY)
        if (mag > ctrl.dz) {
          axX = rawX * (ctrl.invX ? -1 : 1)
          axY = rawY * (ctrl.invY ? -1 : 1)
        }
        const btn = (i: number): boolean => !!gp.buttons[i]?.pressed
        /* Крестовина: 12 вверх, 13 вниз, 14 влево, 15 вправо (standard mapping) */
        if (btn(12)) dpY = -1
        if (btn(13)) dpY = 1
        if (btn(14)) dpX = -1
        if (btn(15)) dpX = 1
        /* v0.0.63: действие/назад — своя кнопка или standard mapping */
        const actIdx = ctrl.pad.action ?? DEFAULT_PAD_ACTION
        tap = tap || btn(actIdx)
        back = back || (ctrl.pad.back != null ? btn(ctrl.pad.back) : DEFAULT_PAD_BACK.some(btn))
      }
    }
    if (tap && !padTapPrev && opts.isPlaying()) fireAction()
    if (back && !padBackPrev) opts.onUiBack()
    padTapPrev = tap
    padBackPrev = back

    /* Скорость: клавиши/крестовина — полная по 8 направлениям;
       стик — по отклонению. Скорость множится на настройку курсора */
    let vx = 0
    let vy = 0
    let digital = false
    let dirX = 0
    let dirY = 0
    const eng0 = opts.getEngine()
    const u = eng0 ? uOf(eng0) : 1
    if (held.size > 0) {
      let kx = 0
      let ky = 0
      if (held.has('left')) kx -= 1
      if (held.has('right')) kx += 1
      if (held.has('up')) ky -= 1
      if (held.has('down')) ky += 1
      const kl = Math.hypot(kx, ky) || 1
      const speed = BASE_SPEED * u * ctrl.speed * (held.has('boost') ? BOOST : 1)
      vx = (kx / kl) * speed
      vy = (ky / kl) * speed
      digital = true
      dirX = kx / kl
      dirY = ky / kl
    } else if (dpX || dpY) {
      /* Крестовина геймпада — цифровой ввод, как клавиши */
      const dl = Math.hypot(dpX, dpY) || 1
      const speed = BASE_SPEED * u * ctrl.speed
      vx = (dpX / dl) * speed
      vy = (dpY / dl) * speed
      digital = true
      dirX = dpX / dl
      dirY = dpY / dl
    } else if (axX || axY) {
      const sl = Math.hypot(axX, axY) || 1
      const norm = Math.min(1, Math.max(0, (sl - ctrl.dz) / (1 - ctrl.dz)))
      const speed = BASE_SPEED * u * ctrl.speed * norm
      vx = (axX / sl) * speed
      vy = (axY / sl) * speed
    }

    /* v0.0.63: АВТО-НАРЕЗКА — на цифровом вводе (клавиатура/пульт/крестовина)
       держишь направление, лапка сама добавляет поперечный зигзаг.
       Поперёк движения = взмах «пилой»: зёрна режутся одной зажатой клавишей,
       чередовать A/D не нужно. Стик не трогаем — там аналоговая плавность */
    if (ctrl.chop && digital && opts.isPlaying() && (vx || vy)) {
      chopPhase += dt * CHOP_HZ * Math.PI * 2
      const sway = Math.sin(chopPhase) * CHOP_LAT
      const speed = BASE_SPEED * u * ctrl.speed * (held.has('boost') ? BOOST : 1)
      vx += -dirY * sway * speed
      vy += dirX * sway * speed
    } else {
      /* Стоим — фаза сбрасывается, следующий заход начинается с ровного взмаха */
      chopPhase = 0
    }

    if (!vx && !vy) return
    const eng = opts.getEngine()
    if (!eng || !opts.isPlaying()) return
    if (!vpInit) {
      vpX = eng.paw.x
      vpY = eng.paw.y
      vpInit = true
    }
    const uu = uOf(eng)
    vpX = Math.max(6, Math.min(eng.W - 6, vpX + vx * dt))
    vpY = Math.max(46, Math.min(eng.H - 42 * uu, vpY + vy * dt))
    eng.setPointer(vpX, vpY)
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('blur', onBlur)
  rafId = requestAnimationFrame(poll)

  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('blur', onBlur)
    window.removeEventListener(SETTINGS_EVENT, onSettingsEvent)
    cancelAnimationFrame(rafId)
  }
}
