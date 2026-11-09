/**
 * API онлайн-лидерборда «Кошачьего попкорнного Беспредела».
 * GET  /api/leaders → { online, leaders: [{ name, score, level, date }], stats?: { launches, runs, players } }
 * POST /api/leaders { name, score, level } → { ok } — каждый завершённый забег фиксируется,
 *   топ-20 отдаётся отдельно, счётчик забегов инкрементится.
 *
 * Без подключённой базы (DATABASE_URL) GET вернёт online:false —
 * игра при этом спокойно играет на локальном списке устройства.
 */

import { NextResponse } from 'next/server'
import {
  bumpStat,
  fetchTopLeaders,
  fetchWorldStats,
  insertScore,
  sanitizeScore,
} from '@/lib/leaders-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const leaders = await fetchTopLeaders(20)
  if (!leaders) {
    return NextResponse.json({ online: false, leaders: [] })
  }
  const stats = await fetchWorldStats()
  return NextResponse.json({ online: true, leaders, stats: stats ?? undefined })
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
  // Каждый завершённый забег фиксируется в мировой статистике
  if (ok) await bumpStat('runs')
  return NextResponse.json({ ok }, { status: ok ? 200 : 503 })
}
