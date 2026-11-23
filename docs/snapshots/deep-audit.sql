-- ============================================================
-- ПОЛНЫЙ АУДИТ мировой базы POPCORN PAWS — SQL-пак для ручного
-- запуска: Supabase → SQL Editor → New query → вставить → Run.
-- Только чтение (SELECT), ничего не меняет.
-- Есть и компактный вариант одним запросом — см. deep-audit-oneliner.sql
-- ============================================================

-- A. Аккаунты котиков: объём и максимум
SELECT 'A. LeaderPlayer' AS section, COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE "bestScore" > 0)::int AS scored,
       COUNT(*) FILTER (WHERE "bestScore" = 0)::int AS zero,
       COALESCE(MAX("bestScore"), 0)::int AS max_score,
       COALESCE(SUM(runs), 0)::int AS runs_sum,
       MIN("createdAt") AS first_player, MAX("updatedAt") AS last_activity
FROM "LeaderPlayer";

-- B. Нарушения потолка очков (15000 + 10000×уровень)
SELECT 'B. Нарушения потолка' AS section, nick, device, "bestScore", "bestLevel"
FROM "LeaderPlayer"
WHERE "bestScore" > 15000 + "bestLevel" * 10000
ORDER BY "bestScore" DESC;
-- ожидается: 0 строк

-- C. Дубли ников (без учёта регистра)
SELECT 'C. Дубли ников' AS section, LOWER(TRIM(nick)) AS n, COUNT(*)::int AS c,
       array_agg(nick ORDER BY "bestScore" DESC) AS names
FROM "LeaderPlayer" GROUP BY 1 HAVING COUNT(*) > 1 ORDER BY c DESC;

-- D. Журнал забегов: объём, диапазон, окна
SELECT 'D. LeaderSubmission' AS section, COUNT(*)::int AS total,
       COUNT(DISTINCT device)::int AS devices,
       COALESCE(MAX(score), 0)::int AS max_score,
       MIN("createdAt") AS first_run, MAX("createdAt") AS last_run
FROM "LeaderSubmission";

-- E. Дрейф рекорда: bestScore ≠ MAX(score) из журнала
SELECT 'E. Дрейф рекорда' AS section, p.device, p.nick,
       p."bestScore" AS best, COALESCE(MAX(s.score), 0)::int AS journal_max
FROM "LeaderPlayer" p LEFT JOIN "LeaderSubmission" s ON s.device = p.device
GROUP BY p.device, p.nick, p."bestScore"
HAVING p."bestScore" <> COALESCE(MAX(s.score), 0)
ORDER BY p."bestScore" DESC LIMIT 30;
-- ожидается: только строки best=0 (имя закреплено, забегов не было)

-- F. Бурсты: >18 забегов одного устройства за час
SELECT 'F. Бурсты' AS section, device, date_trunc('hour', "createdAt") AS h,
       COUNT(*)::int AS c, MAX(score)::int AS max_score
FROM "LeaderSubmission" GROUP BY 1, 2 HAVING COUNT(*) > 18 ORDER BY c DESC LIMIT 20;
-- ожидается: 0 строк (24 старта/час — серверный лимит)

-- G. Прорывы защиты на уровне БД: забеги короче 15 сек и очки выше потолка
SELECT 'G1. submitted < 15 сек' AS section, COUNT(*)::int AS violations
FROM "LeaderRun"
WHERE status = 'submitted' AND "endedAt" IS NOT NULL
  AND "endedAt" - "startedAt" < interval '15 seconds';
-- ожидается 0
SELECT 'G2. очки выше потолка' AS section, COUNT(*)::int AS violations
FROM "LeaderSubmission"
WHERE score > 15000 + level * 10000;
-- ожидается 0

-- H. Висячие open-забеги LeaderRun + сводка статусов
SELECT 'H. LeaderRun статусы' AS section, status, COUNT(*)::int AS c
FROM "LeaderRun" GROUP BY status;
SELECT 'H. висячие open > 3ч' AS section, device, "startedAt",
       EXTRACT(EPOCH FROM (now() - "startedAt"))/3600 AS hours_open
FROM "LeaderRun" WHERE status = 'open' AND "startedAt" < now() - interval '3 hours'
ORDER BY "startedAt" DESC LIMIT 30;

-- I. Счётчики vs фактические COUNT
SELECT 'I. LeaderStat' AS section, key, value::text AS value FROM "LeaderStat";
SELECT 'I. журнал (COUNT)' AS section, COUNT(*)::int AS submissions FROM "LeaderSubmission";
SELECT 'I. посетители' AS section, COUNT(*)::int AS visitors FROM "LeaderVisit";

-- K. Кото-лут: сводка + дубли имён
SELECT 'K. KotoLeader' AS section, COUNT(*)::int AS total,
       COALESCE(MAX(wave), 0)::int AS top_wave,
       COALESCE(SUM(bosses), 0)::int AS bosses_sum,
       COALESCE(MAX(playtime), 0)::int AS max_playtime
FROM "KotoLeader";
SELECT 'K. дубли имён' AS section, name, COUNT(*)::int AS c
FROM "KotoLeader" GROUP BY name HAVING COUNT(*) > 1;

-- L. Кото-лут: зависшие open-забеги KotoRun (>7 суток)
SELECT 'L. KotoRun зависшие' AS section, COUNT(*)::int AS c
FROM "KotoRun" WHERE status = 'open' AND "startedAt" < now() - interval '7 days';
