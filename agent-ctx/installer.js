(() => {
  /* Автосборщик зёрен: ведёт лапку к ближайшему зерну, сдаёт в стаканчик */
  if (window.__bot) clearInterval(window.__bot)
  window.__bot = setInterval(() => {
    const e = window.__popcornEngine
    if (!e || e.phase !== 'playing' || e.paused) return
    if (e.carried.length >= 2) {
      e.setPointer(e.cup.x, e.cup.y - 30)
      return
    }
    let best = null
    let bd = 1e9
    for (const p of e.pieces) {
      if (p.kind === 'corn') continue
      const d = Math.hypot(p.x - e.paw.x, p.y - e.paw.y)
      if (d < bd) {
        bd = d
        best = p
      }
    }
    if (best) e.setPointer(best.x, best.y)
    else if (e.carried.length > 0) e.setPointer(e.cup.x, e.cup.y - 30)
  }, 160)

  /* Автосвайпер: при появлении slice-фазы режет попкорн и пишет результат */
  if (window.__autoSwipe) clearInterval(window.__autoSwipe)
  window.__autoSwipe = setInterval(() => {
    const g = window.__slicerG
    if (!g || g.stage !== 'slice') return
    clearInterval(window.__autoSwipe)
    window.__autoSwipe = null
    const cs = document.querySelectorAll('canvas')
    const c = cs[cs.length - 1]
    const fire = (type, x, y) =>
      c.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 42,
          clientX: x,
          clientY: y,
          bubbles: true,
          cancelable: true,
          pointerType: 'mouse',
          isPrimary: true,
        }),
      )
    const cx = g.cx
    const cy = g.cy
    fire('pointerdown', cx - 70, cy)
    let i = 0
    const iv = setInterval(() => {
      if (g.stage !== 'slice' || i >= 60) {
        clearInterval(iv)
        fire('pointerup', cx, cy)
        window.__swipeResult = {
          moves: i,
          stage: g.stage,
          ticks: g.ticks,
          hp: g.hp,
          total: g.total,
          mult: g.mult,
          maxMult: g.maxMult,
        }
        return
      }
      const dx = (i % 2 === 0 ? 1 : -1) * (30 + (i % 3) * 25)
      const yy = cy + Math.sin(i * 1.3) * 40
      fire('pointermove', cx + dx, yy)
      i++
    }, 60)
  }, 40)
  return 'bot+swiper-installed'
})()
