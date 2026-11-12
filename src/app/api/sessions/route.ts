/**
 * API счётчика запусков «POPCORN PAWS».
 *
 * POST /api/sessions → { ok, stats? } — фиксирует один запуск игры
 * (фронт вызывает один раз при открытии страницы).
 * GET /api/sessions → { online, stats? } — текущая мировая статистика.
 *
 * Без базы (DATABASE_URL) отвечает { online: false } — счётчик просто
 * не растёт, игра продолжает работать офлайн.
 */

import { NextResponse } from 'next/server'
import { bumpStat, fetchWorldStats, type WorldStats } from '@/lib/leaders-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const stats = await fetchWorldStats()
  if (!stats) {
    return NextResponse.json({ online: false })
  }
  return NextResponse.json({ online: true, stats })
}

export async function POST() {
  const launches = await bumpStat('launches')
  if (launches === null) {
    // Без базы — не ошибка клиента: игра работает офлайн, счётчик просто не растёт.
    return NextResponse.json({ ok: false, online: false })
  }
  const stats = await fetchWorldStats()
  return NextResponse.json({
    ok: true,
    online: true,
    stats: (stats as WorldStats | null) ?? undefined,
  })
}
