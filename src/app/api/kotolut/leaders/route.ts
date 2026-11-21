/**
 * Мировой лидерборд КОТО-ЛУТа.
 *
 * GET  /api/kotolut/leaders[?device=<deviceId>]
 *        → { online, leaders: [{ name, wave, bosses, date }], stats?, me?: { rank, best } }
 *      Топ-20 мира + мировая статистика; при ?device= ещё и место игрока.
 *      Каждый слуга двора — ровно одна строка, только максимальная волна.
 *
 * POST /api/kotolut/leaders { device, name, wave, bosses, xp, maxLvl, playtime, runId, token }
 *        → { ok, rank?, best? } — зачесть реперную точку (каждая 5-я волна).
 *
 * CORS открыт (игра живёт и на raidopert.ru, и на зеркале Pages):
 * публичные данные, без кук — * безопасен. Защита от накрутки —
 * см. src/lib/kotolut-db.ts и src/lib/leaderboard-guard.ts.
 */

import { NextResponse } from 'next/server'
import {
  fetchKotoStats,
  fetchKotoTop,
  kotoPlayerRank,
  submitKotoRun,
} from '@/lib/kotolut-db'
import {
  cleanDevice,
  cleanNick,
  DEVICE_SUBMIT_GAP_MS,
  ipHashOf,
  rateLimit,
  SUBMITS_PER_HOUR,
} from '@/lib/leaderboard-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HOUR_MS = 60 * 60 * 1000

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(req: Request) {
  const leaders = await fetchKotoTop(20)
  if (!leaders) {
    return NextResponse.json({ online: false, leaders: [] }, { headers: CORS })
  }
  const stats = await fetchKotoStats()
  let me: { rank: number; best: number } | undefined
  const device = cleanDevice(new URL(req.url).searchParams.get('device'))
  if (device) {
    const rank = await kotoPlayerRank(device)
    if (rank) me = { rank: rank.rank, best: rank.best }
  }
  return NextResponse.json(
    { online: true, leaders, stats: stats ?? undefined, me: me ?? undefined },
    { headers: CORS },
  )
}

export async function POST(req: Request) {
  let body: Record<string, unknown> | null = null
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, reason: 'body' }, { status: 400, headers: CORS })
  }

  const device = cleanDevice(body.device)
  if (!device) {
    return NextResponse.json({ ok: false, reason: 'device' }, { status: 400, headers: CORS })
  }

  const ipHash = ipHashOf(req)
  /* rate-limit: устройство и IP, скользящее окно */
  if (
    !rateLimit(`koto_sub_dev:${device}`, SUBMITS_PER_HOUR, HOUR_MS, DEVICE_SUBMIT_GAP_MS) ||
    !rateLimit(`koto_sub_ip:${ipHash}`, SUBMITS_PER_HOUR * 2, HOUR_MS)
  ) {
    return NextResponse.json({ ok: false, reason: 'rate' }, { status: 429, headers: CORS })
  }

  const num = (v: unknown, max: number) =>
    Math.max(0, Math.min(Math.floor(Number(v) || 0), max))

  const result = await submitKotoRun({
    device,
    name: cleanNick(body.name) || 'Слуга Рыбца',
    wave: num(body.wave, 500),
    bosses: num(body.bosses, 2500),
    xp: num(body.xp, 2_500_000),
    maxLvl: num(body.maxLvl, 300),
    playtime: num(body.playtime, 60 * 24 * 3600),
    runId: typeof body.runId === 'string' ? body.runId.slice(0, 64) : '',
    token: typeof body.token === 'string' ? body.token.slice(0, 128) : '',
  })

  return NextResponse.json(result, { headers: CORS })
}
