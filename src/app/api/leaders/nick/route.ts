/**
 * Закрепление уникального имени котика — «аккаунта» мирового лидерборда.
 *
 * POST /api/leaders/nick { device, name }
 *   → 200 { ok: true }                 — имя закреплено за устройством
 *   → 409 { ok: false, taken: true }   — имя уже носит другой котик:
 *                                        диалог ника попросит придумать другое
 *   → 503 { ok: false, offline: true } — база недоступна: клиент сохраняет
 *                                        имя локально, игра продолжается офлайн
 *
 * Имя живёт в LeaderPlayer.nick. Один котик = одна строка мирового топа,
 * и пишется только его максимальный рекорд (см. fetchTopLeaders).
 * Коллизии от офлайн-переименований/старых данных развязывает
 * отображение с суффиксом «•тег» — таблица всегда с уникальными именами.
 *
 * Rate-limit: NICKS_PER_HOUR на IP-хэш и устройство (защита от перебора имён).
 */

import { NextResponse } from 'next/server'
import { claimNick } from '@/lib/leaders-db'
import { cleanDevice, cleanNick, ipHashOf, rateLimit, verifyVKParams } from '@/lib/leaderboard-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HOUR_MS = 60 * 60 * 1000
/** Попыток закрепления имени с одного IP/устройства в час */
const NICKS_PER_HOUR = 30

export async function POST(req: Request) {
  let body: Record<string, unknown> | null = null
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const device = cleanDevice(body.device)
  if (!device || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  /* Подпись параметров запуска VK (п. 1.2.2 правил VK): битая подпись — 403 */
  if (!verifyVKParams(body.vk)) {
    return NextResponse.json({ ok: false, reason: 'sign' }, { status: 403 })
  }

  const ip = ipHashOf(req)
  if (
    !rateLimit(`nick:${ip}`, NICKS_PER_HOUR, HOUR_MS) ||
    !rateLimit(`nickdev:${device}`, NICKS_PER_HOUR, HOUR_MS)
  ) {
    return NextResponse.json({ ok: false, reason: 'rate' }, { status: 429 })
  }

  const out = await claimNick(device, cleanNick(body.name))
  if (out.offline) return NextResponse.json({ ok: false, offline: true }, { status: 503 })
  if (out.taken) return NextResponse.json({ ok: false, taken: true }, { status: 409 })
  return NextResponse.json({ ok: true })
}
