/**
 * АЛЬТЕРНАТИВНЫЙ ВВОД (v0.0.62): клавиатура, геймпад (Xbox 360 / PS4) и
 * ТВ-пульт (Android TV) — поверх существующей touch/мышь-модели.
 *
 * Идея: движку всё равно, откуда летят координаты лапки — модуль ведёт
 * «виртуальный курсор» и скармливает его движку тем же setPointer(), что
 * и тач/мышь. Собирается всё в одном месте:
 *
 *   КЛАВИАТУРА: стрелки/WASD — двигать лапку (Shift — ускорение),
 *               Space/Enter — действие (снежок в бою с Малышом),
 *               Esc/P — пауза-назад.
 *   ГЕЙМПАД:    левый стик или крестовина — лапка, A/✕ — действие,
 *               Start/Options (и Back/Share) — пауза-назад (Gamepad API
 *               событий не шлёт — опрашиваем каждый кадр).
 *   ТВ-ПУЛЬТ:   крестовина = стрелки, «ОК» = Enter, «Назад» = Esc
 *               (key GoBack/BrowserBack/keyCode 4/10009). В меню стрелки
 *               ходят фокусом по кнопкам, Enter нажимает сфокусированную.
 *
 * В геймплее стрелки двигают лапку; в меню/оверлеях — ходят по кнопкам
 * (focusInDirection): работает и на десктопе, где стрелки фокус не гоняют.
 */

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

/** Мёртвая зона стика, чтобы лапка не ползла на «подведённом» стике */
const DEADZONE = 0.22
/** Базовая скорость лапки, px/s в пересчёте на u (u — масштаб движка) */
const BASE_SPEED = 470
/** Множитель ускорения по Shift */
const BOOST = 1.7

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

  /** Масштаб движка — та же формула, что в engine.layout() */
  const uOf = (eng: AltEngineLike): number =>
    Math.max(0.7, Math.min(1.5, Math.min(eng.W, eng.H) / 420))

  /** Направление из клавиатуры/ТВ-пульта — по e.code, независимо от раскладки.
      Старые ТВ-пульты шлют только keyCode — дублируем по нему */
  const dirFromEvent = (e: KeyboardEvent): AltDir | null => {
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

  /** Space / Enter — «действие» в геймплее (в меню Enter жмёт кнопку нативно) */
  const isActionKey = (e: KeyboardEvent): boolean =>
    e.code === 'Space' || e.code === 'Enter' || e.keyCode === 13 || e.keyCode === 32

  /** «Назад»: Esc, P, ТВ-кнопка Back (GoBack/BrowserBack/keyCode 4/10009) */
  const isBackKey = (e: KeyboardEvent): boolean =>
    e.code === 'Escape' ||
    e.code === 'KeyP' ||
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
    if (isTypingTarget(e)) return
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      held.add('boost')
      return
    }
    if (isBackKey(e)) {
      if (e.repeat) return
      e.preventDefault()
      opts.onUiBack()
      return
    }
    const dir = dirFromEvent(e)
    if (dir) {
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
      return
    }
    if (isActionKey(e)) {
      if (!opts.isPlaying()) return
      if (e.repeat) return
      e.preventDefault() // не даём Space «кликнуть» HUD-кнопку, оставшуюся в фокусе
      const eng = opts.getEngine()
      if (!eng) return
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      eng.tapFire(vpInit ? vpX : eng.paw.x, vpInit ? vpY : eng.paw.y)
    }
  }

  const onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      held.delete('boost')
      return
    }
    const dir = dirFromEvent(e)
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

    let stickX = 0
    let stickY = 0
    let tap = false
    let back = false
    if (typeof navigator.getGamepads === 'function') {
      let pads: (Gamepad | null)[] = []
      try {
        pads = navigator.getGamepads()
      } catch {
        pads = []
      }
      for (const gp of pads) {
        if (!gp) continue
        const ax = gp.axes[0] ?? 0
        const ay = gp.axes[1] ?? 0
        if (Math.abs(ax) > DEADZONE) stickX = ax
        if (Math.abs(ay) > DEADZONE) stickY = ay
        const btn = (i: number): boolean => !!gp.buttons[i]?.pressed
        /* Крестовина: 12 вверх, 13 вниз, 14 влево, 15 вправо (standard mapping) */
        if (btn(12)) stickY = -1
        if (btn(13)) stickY = 1
        if (btn(14)) stickX = -1
        if (btn(15)) stickX = 1
        tap = tap || btn(0) // A (Xbox) / ✕ (PS4)
        back = back || btn(9) || btn(8) // Start/Options / Back/Share
      }
    }
    if (tap && !padTapPrev && opts.isPlaying()) {
      const eng = opts.getEngine()
      if (eng) eng.tapFire(vpInit ? vpX : eng.paw.x, vpInit ? vpY : eng.paw.y)
    }
    if (back && !padBackPrev) opts.onUiBack()
    padTapPrev = tap
    padBackPrev = back

    /* Скорость: клавиши — полная по 8 направлениям; стик — по отклонению */
    let vx = 0
    let vy = 0
    if (held.size > 0) {
      let kx = 0
      let ky = 0
      if (held.has('left')) kx -= 1
      if (held.has('right')) kx += 1
      if (held.has('up')) ky -= 1
      if (held.has('down')) ky += 1
      const kl = Math.hypot(kx, ky) || 1
      const eng = opts.getEngine()
      const u = eng ? uOf(eng) : 1
      const speed = BASE_SPEED * u * (held.has('boost') ? BOOST : 1)
      vx = (kx / kl) * speed
      vy = (ky / kl) * speed
    } else if (stickX || stickY) {
      const eng = opts.getEngine()
      const u = eng ? uOf(eng) : 1
      const sl = Math.hypot(stickX, stickY) || 1
      const norm = Math.min(1, Math.max(0, (sl - DEADZONE) / (1 - DEADZONE)))
      const speed = BASE_SPEED * u * norm
      vx = (stickX / sl) * speed
      vy = (stickY / sl) * speed
    }
    if (!vx && !vy) return
    const eng = opts.getEngine()
    if (!eng || !opts.isPlaying()) return
    if (!vpInit) {
      vpX = eng.paw.x
      vpY = eng.paw.y
      vpInit = true
    }
    const u = uOf(eng)
    vpX = Math.max(6, Math.min(eng.W - 6, vpX + vx * dt))
    vpY = Math.max(46, Math.min(eng.H - 42 * u, vpY + vy * dt))
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
    cancelAnimationFrame(rafId)
  }
}
