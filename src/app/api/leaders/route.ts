/**
 * API онлайн-лидерборда «Кошачьего попкорнного Беспредела».
 * GET  /api/leaders → { online, leaders: [{ name, score, level, date }] }
 * POST /api/leaders { name, score, level } → { ok }
 *
 * Без подключённой базы (DATABASE_URL) GET вернёт online:false —
 * игра при этом спокойно играет на локальном списке устройства.
 */

import { NextResponse } from 'next/server'
import { fetchTopLeaders, insertScore, sanitizeScore } from '@/lib/leaders-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const leaders = await fetchTopLeaders(20)
  if (!leaders) {
    return NextResponse.json({ online: false, leaders: [] })
  }
  return NextResponse.json({ online: true, leaders })
}

export async function POST(req: Request) {
  let body: unknown = null
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const clean = sanitizeScore(body)
  if (!clean) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const ok = await insertScore(clean)
  return NextResponse.json({ ok }, { status: ok ? 200 : 503 })
}
