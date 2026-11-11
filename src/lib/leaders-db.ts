/**
 * Онлайн-лидерборд POPCORN PAWS на Prisma.
 *
 * База: локально SQLite (file:./db/custom.db), в проде Supabase Postgres —
 * схема в prisma/schema.prisma переносимая, отличается только provider
 * и DATABASE_URL. Без доступной базы все функции возвращают null/false:
 * API честно отвечает { online: false } и игра продолжает вести
 * локальный список на устройстве.
 *
 * Защита от накрутки описана в src/lib/leaderboard-guard.ts
 * (HMAC-токен забега + одноразовость + тайминги + rate-limit).
 */

import { db } from '@/lib/db'
import { MAX_RUN_MS, MIN_RUN_MS, verifyRunToken } from '@/lib/leaderboard-guard'

export interface OnlineLeader {
  name: string
  score: number
  level: number
  date: number
}

export interface WorldStats {
  /** Сколько раз игру запускали (открыли сайт) */
  launches: number
  /** Сколько забегов завершилось (записаны в таблицу) */
  runs: number
  /** Сколько уникальных устройств играло */
  players: number
}

/* ---------- чтение топа и статистики ---------- */

export async function fetchTopLeaders(limit = 20): Promise<OnlineLeader[] | null> {
  try {
    const rows = await db.leaderSubmission.findMany({
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      take: limit,
      select: { nick: true, score: true, level: true, createdAt: true },
    })
    return rows.map((r) => ({
      name: r.nick,
      score: r.score,
      level: r.level,
      date: r.createdAt.getTime(),
    }))
  } catch (err) {
    console.error('[leaders] fetch failed:', err)
    return null
  }
}

export async function fetchWorldStats(): Promise<WorldStats | null> {
  try {
    const [counters, groups] = await Promise.all([
      db.leaderStat.findMany({ where: { key: { in: ['launches', 'runs'] } } }),
      db.leaderSubmission.groupBy({ by: ['device'] }),
    ])
    const get = (k: string) => Number(counters.find((c) => c.key === k)?.value ?? 0)
    return { launches: get('launches'), runs: get('runs'), players: groups.length }
  } catch (err) {
    console.error('[leaders] fetchWorldStats failed:', err)
    return null
  }
}

/** +1 к счётчику (запуск игры, завершённый забег); возвращает новое значение или null без базы */
export async function bumpStat(key: string): Promise<number | null> {
  try {
    const s = await db.leaderStat.upsert({
      where: { key },
      create: { key, value: 1 },
      update: { value: { increment: 1 } },
    })
    return Number(s.value)
  } catch (err) {
    console.error('[leaders] bumpStat failed:', err)
    return null
  }
}

/* ---------- защищённый цикл забега ---------- */

export interface OpenRun {
  runId: string
  startedAt: number
}

/** Открыть забег: строка LeaderRun (nonce) + HMAC-токен, одноразовый */
export async function startLeaderRun(device: string, ipHash: string): Promise<OpenRun | null> {
  try {
    const run = await db.leaderRun.create({ data: { device, ipHash } })
    return { runId: run.id, startedAt: run.startedAt.getTime() }
  } catch (err) {
    console.error('[leaders] start failed:', err)
    return null
  }
}

export interface SubmitArgs {
  runId: string
  /** HMAC-токен из /api/leaders/start (подпись runId + серверного времени старта) */
  token: unknown
  device: string
  nick: string
  score: number
  level: number
}

export type SubmitReason = 'no-run' | 'replay' | 'too-fast' | 'expired' | 'db'

export interface SubmitResult {
  ok: boolean
  reason?: SubmitReason
  /** Место игрока по личному рекорду после зачёта (1 = лидер) */
  rank?: number
  best?: number
}

/**
 * Зачесть забег с полной проверкой защиты:
 *   1) токен: HMAC(runId + серверное время старта) — подделка или чужой runId
 *      дают один и тот же ответ «no-run», чтобы не подсказывать взлому;
 *   2) тайминги: слишком быстрый результат отклоняется, зависший (3 ч) истекает;
 *   3) одноразовость: atomic UPDATE ... WHERE status='open' в транзакции —
 *      двойной submit того же runId невозможен даже при гонке.
 */
export async function submitLeaderRun(a: SubmitArgs): Promise<SubmitResult> {
  let run
  try {
    run = await db.leaderRun.findUnique({
      where: { id: a.runId },
      select: { id: true, device: true, status: true, startedAt: true },
    })
  } catch (err) {
    console.error('[leaders] submit lookup failed:', err)
    return { ok: false, reason: 'db' }
  }
  /* Не существует / чужой device / неверная подпись — неотличимо друг от друга */
  if (!run || run.device !== a.device || !verifyRunToken(run.id, run.startedAt.getTime(), a.token)) {
    return { ok: false, reason: 'no-run' }
  }
  if (run.status !== 'open') return { ok: false, reason: 'replay' }

  const now = Date.now()
  const elapsed = now - run.startedAt.getTime()
  if (elapsed < MIN_RUN_MS) return { ok: false, reason: 'too-fast' }
  if (elapsed > MAX_RUN_MS) {
    await expireRun(run.id)
    return { ok: false, reason: 'expired' }
  }

  try {
    await db.$transaction(async (tx) => {
      const claimed = await tx.leaderRun.updateMany({
        where: { id: run.id, status: 'open' },
        data: { status: 'submitted', score: a.score, level: a.level, endedAt: new Date(now) },
      })
      if (claimed.count === 0) throw new Error('REPLAY')

      await tx.leaderSubmission.create({
        data: { runId: run.id, device: a.device, nick: a.nick, score: a.score, level: a.level },
      })

      const p = await tx.leaderPlayer.findUnique({ where: { device: a.device } })
      if (!p) {
        await tx.leaderPlayer.create({
          data: { device: a.device, nick: a.nick, bestScore: a.score, bestLevel: a.level, runs: 1 },
        })
      } else {
        await tx.leaderPlayer.update({
          where: { device: a.device },
          data: {
            nick: a.nick,
            runs: { increment: 1 },
            bestScore: Math.max(p.bestScore, a.score),
            bestLevel: Math.max(p.bestLevel, a.level),
          },
        })
      }
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'REPLAY') return { ok: false, reason: 'replay' }
    console.error('[leaders] submit failed:', err)
    return { ok: false, reason: 'db' }
  }

  /* Счётчик завершённых забегов + место игрока (некритично, если упадёт) */
  await bumpStat('runs')
  const rank = await playerRank(a.device)
  return { ok: true, rank: rank?.rank, best: rank?.best }
}

/** Истечь просроченный забег (записать, чтобы не висел open) */
export async function expireRun(runId: string): Promise<void> {
  try {
    await db.leaderRun.updateMany({
      where: { id: runId, status: 'open' },
      data: { status: 'expired', endedAt: new Date() },
    })
  } catch (err) {
    console.error('[leaders] expire failed:', err)
  }
}

export interface PlayerRank {
  rank: number
  best: number
}

/** Место игрока по личному рекорду: 1 + сколько игроков строже */
export async function playerRank(device: string): Promise<PlayerRank | null> {
  try {
    const p = await db.leaderPlayer.findUnique({
      where: { device },
      select: { bestScore: true },
    })
    if (!p || p.bestScore <= 0) return null
    const better = await db.leaderPlayer.count({
      where: { bestScore: { gt: p.bestScore } },
    })
    return { rank: better + 1, best: p.bestScore }
  } catch (err) {
    console.error('[leaders] rank failed:', err)
    return null
  }
}
