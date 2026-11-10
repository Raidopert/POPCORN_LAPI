(() => {
  /* Аудит: фиксируем счёт движка в момент slice-фазы и после ЗАБРАТЬ */
  window.__audit = { score0: null, total: null, score1: null }
  if (window.__auditPoll) clearInterval(window.__auditPoll)
  window.__auditPoll = setInterval(() => {
    const g = window.__slicerG
    const e = window.__popcornEngine
    if (!e) return
    if (g && g.stage === 'slice' && window.__audit.score0 === null) {
      window.__audit.score0 = e.score
    }
    if (window.__audit.score0 !== null && window.__audit.total === null && g && g.stage === 'results') {
      const card = document.body.innerText.match(/\+(\d+)\s*\n/)
      window.__audit.total = g.total
    }
    if (window.__audit.total !== null && window.__audit.score1 === null) {
      window.__audit.score1 = e.score
    }
  }, 100)
  return 'audit-installed'
})()
