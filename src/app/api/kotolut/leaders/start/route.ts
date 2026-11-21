/**
 * Открытие забега Кото-Лут — первый шаг защищённого лидерборда.
 *
 * POST /api/kotolut/leaders/start { device }
 *        → { ok, runId, token, startedAt }
 *
 * Клиент вызывает один раз при старте рейда (beginPlay) и возвращает
 * runId + token в POST /api/kotolut/leaders на реперной волне.
 * Токен — HMAC_SHA256 от (runId + серверное время старта) с секретом
 * LEADERBOARD_SECRET: подделать результат без секрета нельзя,
 * повторно использовать runId — нельзя (одноразовость на уровне базы).
 *
 * Реперные точки: клиент сдаёт результат на каждой 5-й волне, сервер
 * закрывает забег и клиент тут же открывает следующий. Поэтому
 * лимиты стартов щедрые (забег ≈ 5 волн ≈ пара минут честной игры).
 *
 * Без базы — { ok:false }: игра просто играет офлайн и ничего не замечает.
 */

import { NextResponse } from 'next/server'
import { startKotoRun } from '@/lib/kotolut-db'
import {
  cleanDevice,
  DEVICE_STARTS_PER_HOUR,
  ipHashOf,
  rateLimit,
  STARTS_PER_HOUR,
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

export async function POST(req: Request) {
  let body: Record<string, unknown> | null = null
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, online: false }, { status: 400, headers: CORS })
  }

  const device = cleanDevice(body.device)
  if (!device) {
    return NextResponse.json({ ok: false }, { status: 400, headers: CORS })
  }

  const ipHash = ipHashOf(req)
  if (
    !rateLimit(`koto_start_dev:${device}`, DEVICE_STARTS_PER_HOUR, HOUR_MS, 1500) ||
    !rateLimit(`koto_start_ip:${ipHash}`, STARTS_PER_HOUR, HOUR_MS)
  ) {
    return NextResponse.json({ ok: false, reason: 'rate' }, { status: 429, headers: CORS })
  }

  const result = await startKotoRun(device, ipHash)
  if (!result.ok) {
    return NextResponse.json({ ok: false, online: false }, { headers: CORS })
  }

  return NextResponse.json(result, { headers: CORS })
}
