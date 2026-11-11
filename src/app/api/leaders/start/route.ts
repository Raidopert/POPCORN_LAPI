/**
 * Открытие забега на сервере — первый шаг защищённого лидерборда.
 *
 * POST /api/leaders/start { device }
 *        → { ok, runId, token, startedAt }
 *
 * Клиент вызывает один раз при старте забега (фаза playing) и возвращает
 * runId + token в POST /api/leaders при завершении. Токен — HMAC_SHA256
 * от (runId + серверное время старта) с секретом LEADERBOARD_SECRET:
 * подделать результат без секрета нельзя, повторно использовать runId —
 * нельзя (одноразовость на уровне базы).
 *
 * Rate-limit: STARTS_PER_HOUR на IP-хэш и DEVICE_STARTS_PER_HOUR на
 * устройство. Без базы — { ok:false, online:false }: забег просто
 * локальный, игра ничего не замечает.
 */

import { NextResponse } from 'next/server'
import { startLeaderRun } from '@/lib/leaders-db'
import {
  cleanDevice,
  DEVICE_STARTS_PER_HOUR,
  ipHashOf,
  rateLimit,
  signRun,
  STARTS_PER_HOUR,
} from '@/lib/leaderboard-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HOUR_MS = 60 * 60 * 1000

export async function POST(req: Request) {
  let body: Record<string, unknown> | null = null
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, online: false }, { status: 400 })
  }
  const device = cleanDevice(body.device)
  if (!device) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const ip = ipHashOf(req)
  if (
    !rateLimit(`start:${ip}`, STARTS_PER_HOUR, HOUR_MS) ||
    !rateLimit(`devstart:${device}`, DEVICE_STARTS_PER_HOUR, HOUR_MS)
  ) {
    return NextResponse.json({ ok: false, reason: 'rate' }, { status: 429 })
  }

  const run = await startLeaderRun(device, ip)
  if (!run) {
    return NextResponse.json({ ok: false, online: false }, { status: 503 })
  }
  return NextResponse.json({
    ok: true,
    runId: run.runId,
    token: signRun(run.runId, run.startedAt),
    startedAt: run.startedAt,
  })
}
