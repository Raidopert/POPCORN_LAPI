/* Репродукция submitKotoRun по шагам — ищем падающую строку */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const device = 'qa-device-local'
const runId = 'test-' + Date.now()

async function step(label, fn) {
  try {
    const r = await fn()
    console.log('OK  ', label, JSON.stringify(r)?.slice(0, 120))
    return r
  } catch (e) {
    console.log('FAIL', label, '→', e.message?.slice(0, 300))
    console.log('     code:', e.code, '| meta:', JSON.stringify(e.meta)?.slice(0, 200))
    process.exit(1)
  }
}

const startedAt = new Date()
await step('kotoRun.create', () =>
  db.kotoRun.create({ data: { id: runId, device, ipHash: 'x', startedAt } }),
)
const run = await step('kotoRun.findUnique', () =>
  db.kotoRun.findUnique({ where: { id: runId } }),
)
console.log('     run.startedAt =', run.startedAt, '| typeof getTime:', typeof run.startedAt?.getTime)
await step('kotoRun.updateMany(consume)', () =>
  db.kotoRun.updateMany({
    where: { id: runId, device, status: 'open' },
    data: { status: 'closed', wave: 2, endedAt: new Date() },
  }),
)
await step('kotoLeader.findUnique', () =>
  db.kotoLeader.findUnique({ where: { device }, select: { wave: true } }),
)
await step('kotoLeader.upsert', () =>
  db.kotoLeader.upsert({
    where: { device },
    create: { device, name: 'Рыбец-QA', wave: 2, bosses: 1, xp: 30, maxLvl: 1, playtime: 120 },
    update: { name: 'Рыбец-QA', wave: 2, bosses: 1, xp: 30, maxLvl: 1, playtime: 120 },
  }),
)
await step('kotoLeader.count', () =>
  db.kotoLeader.count({ where: { wave: { gt: 2 } } }),
)
console.log('ВСЁ ОК локально')
process.exit(0)
