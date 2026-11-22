/**
 * API счётчиков «POPCORN PAWS»: запуски, забеги, время в игре, пользователи.
 *
 * POST /api/sessions { device? } → { ok, stats? } — фиксирует один запуск
 * игры (фронт вызывает один раз при открытии страницы). device — анонимный
 * deviceId из localStorage: по нему считается «новый пользователь»
 * (уникальные устройства в таблице LeaderVisit).
 * GET  /api/sessions → { online, stats? } — текущая мировая статистика
 * (launches / runs / playSecs / visitors / players).
 *
 * Без базы (DATABASE_URL) отвечает { online: false } — счётчики просто
 * не растут, игра продолжает работать офлайн.
 */

import { NextResponse } from 'next/server'
import { bumpStat, fetchWorldStats, recordVisit, type WorldStats } from '@/lib/leaders-db'
import { cleanDevice } from '@/lib/leaderboard-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const stats = await fetchWorldStats()
  if (!stats) {
    return NextResponse.json({ online: false })
  }
  return NextResponse.json({ online: true, stats })
}

export async function POST(req: Request) {
  /* deviceId необязателен: без него просто +1 запуск, без записи визита */
  let device: string | null = null
  try {
    const body = (await req.json()) as Record<string, unknown>
    device = cleanDevice(body.device)
  } catch {
    /* пустое тело — разрешено (совместимость со старым клиентом) */
  }

  const launches = await bumpStat('launches')
  if (launches === null) {
    // Без базы — не ошибка клиента: игра работает офлайн, счётчик просто не растёт.
    return NextResponse.json({ ok: false, online: false })
  }
  if (device) {
    await recordVisit(device)
  }
  const stats = await fetchWorldStats()
  return NextResponse.json({
    ok: true,
    online: true,
    stats: (stats as WorldStats | null) ?? undefined,
  })
}
