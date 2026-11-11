/**
 * API мирового лидерборда POPCORN PAWS (Prisma + защита от накрутки).
 *
 * GET  /api/leaders[?device=<deviceId>]
 *        → { online, leaders: [{ name, score, level, date }], stats?, me?: { rank, best } }
 *      Топ-20 мира + мировая статистика; при ?device= ещё и место игрока.
 *
 * POST /api/leaders { device, name, score, level, runId, token }
 *        → { ok, rank?, best? } — зачесть завершённый забег.
 *
 * Защита от накрутки (см. src/lib/leaderboard-guard.ts и leaders-db.ts):
 *   1) runId + HMAC-токен, выданные сервером в /api/leaders/start;
 *   2) одноразовость runId (atomic UPDATE WHERE status='open');
 *   3) тайминги: слишком быстрый / зависший забег отклоняется;
 *   4) потолок очков по уровню (scoreCap) + абсолютный потолок;
 *   5) rate-limit: IP и устройство, скользящее окно в памяти.
 *
 * Без доступной базы GET вернёт online:false — игра играет на локальном
 * списке устройства, ничего не ломается.
 */

import { NextResponse } from 'next/server'
import {
  fetchTopLeaders,
  fetchWorldStats,
  playerRank,
  submitLeaderRun,
} from '@/lib/leaders-db'
import {
  cleanDevice,
  cleanNick,
  cleanScoreLevel,
  DEVICE_SUBMIT_GAP_MS,
  DEVICE_STARTS_PER_HOUR,
  ipHashOf,
  rateLimit,
  STARTS_PER_HOUR,
  SUBMITS_PER_HOUR,
} from '@/lib/leaderboard-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HOUR_MS = 60 * 60 * 1000

export async function GET(req: Request) {
  const leaders = await fetchTopLeaders(20)
  if (!leaders) {
    return NextResponse.json({ online: false, leaders: [] })
  }
  const stats = await fetchWorldStats()
  /* Место игрока по личному рекорду (необязательный параметр) */
  let me: { rank: number; best: number } | undefined
  const device = cleanDevice(new URL(req.url).searchParams.get('device'))
  if (device) {
    const rank = await playerRank(device)
    if (rank) me = { rank: rank.rank, best: rank.best }
  }
  return NextResponse.json({
    online: true,
    leaders,
    stats: stats ?? undefined,
    me: me ?? undefined,
  })
}

export async function POST(req: Request) {
  let body: Record<string, unknown> | null = null
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  /* Санитизация входа: device из безопасного алфавита, очки в разумных пределах */
  const device = cleanDevice(body.device)
  const clean = cleanScoreLevel(body.score, body.level)
  const runId = typeof body.runId === 'string' ? body.runId : ''
  if (!device || !clean || !runId || typeof body.token !== 'string') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  /* Rate-limit по IP-хэшу и устройству (в памяти инстанса) */
  const ip = ipHashOf(req)
  if (
    !rateLimit(`sub:${ip}`, SUBMITS_PER_HOUR, HOUR_MS) ||
    !rateLimit(`devsub:${device}`, DEVICE_STARTS_PER_HOUR, HOUR_MS, DEVICE_SUBMIT_GAP_MS)
  ) {
    return NextResponse.json({ ok: false, reason: 'rate' }, { status: 429 })
  }

  /* Полная проверка защиты + зачёт (токен, тайминги, одноразовость) */
  const out = await submitLeaderRun({
    runId,
    token: body.token,
    device,
    nick: cleanNick(body.name),
    score: clean.score,
    level: clean.level,
  })

  if (out.ok) {
    return NextResponse.json({ ok: true, rank: out.rank, best: out.best })
  }
  const status = out.reason === 'replay' ? 409 : out.reason === 'db' ? 503 : 403
  return NextResponse.json({ ok: false, reason: out.reason ?? 'db' }, { status })
}
