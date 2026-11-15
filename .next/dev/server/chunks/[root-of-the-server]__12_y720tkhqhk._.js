module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/sessions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaders$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/leaders-db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaderboard$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/leaderboard-guard.ts [app-route] (ecmascript)");
;
;
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
async function GET() {
    const stats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaders$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchWorldStats"])();
    if (!stats) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            online: false
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        online: true,
        stats
    });
}
async function POST(req) {
    /* deviceId необязателен: без него просто +1 запуск, без записи визита */ let device = null;
    try {
        const body = await req.json();
        device = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaderboard$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDevice"])(body.device);
    } catch  {
    /* пустое тело — разрешено (совместимость со старым клиентом) */ }
    const launches = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaders$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bumpStat"])('launches');
    if (launches === null) {
        // Без базы — не ошибка клиента: игра работает офлайн, счётчик просто не растёт.
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            online: false
        });
    }
    if (device) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaders$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordVisit"])(device);
    }
    const stats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaders$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchWorldStats"])();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        online: true,
        stats: stats ?? undefined
    });
}
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
/**
 * Подстройка строки подключения под Supabase Transaction pooler.
 *
 * Transaction pooler (порт 6543) — это PgBouncer в transaction mode:
 * серверные prepared statements через него ломаются («prepared statement
 * s0 already exists»), поэтому Prisma нужен флаг pgbouncer=true.
 * Заодно выставляем serverless-рекомендации, если игрок их не задал:
 *   connection_limit=1 — по одному соединению на инстанс (Vercel),
 *   sslmode=require    — шифрование обязательно.
 * Строка правится чисто текстово: пароль может содержать спецсимволы,
 * которые URL-парсер перекодировал бы. Локальный SQLite и Docker-Postgres
 * (порт 5432, не pooler.supabase.com) не трогаются вовсе.
 */ function normalizePostgresUrl(raw) {
    const url = raw.trim();
    if (!/^postgres(ql)?:/i.test(url)) return url;
    if (!/pooler\.supabase\.com/i.test(url)) return url;
    let out = url;
    const sep = out.includes('?') ? '&' : '?';
    if (!/[?&]pgbouncer=/.test(out)) out += `${sep}pgbouncer=true`;
    if (!/[?&]connection_limit=/.test(out)) out += `${sep}connection_limit=1`;
    if (!/[?&]sslmode=/.test(out)) out += `${sep}sslmode=require`;
    return out;
}
const rawUrl = (process.env.DATABASE_URL ?? '').trim();
const dbUrl = normalizePostgresUrl(rawUrl);
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"](dbUrl && dbUrl !== rawUrl ? {
    datasources: {
        db: {
            url: dbUrl
        }
    }
} : undefined);
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[project]/src/lib/leaderboard-guard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ABSOLUTE_SCORE_CAP",
    ()=>ABSOLUTE_SCORE_CAP,
    "DEVICE_STARTS_PER_HOUR",
    ()=>DEVICE_STARTS_PER_HOUR,
    "DEVICE_SUBMIT_GAP_MS",
    ()=>DEVICE_SUBMIT_GAP_MS,
    "MAX_RUN_MS",
    ()=>MAX_RUN_MS,
    "MIN_RUN_MS",
    ()=>MIN_RUN_MS,
    "STARTS_PER_HOUR",
    ()=>STARTS_PER_HOUR,
    "SUBMITS_PER_HOUR",
    ()=>SUBMITS_PER_HOUR,
    "cleanDevice",
    ()=>cleanDevice,
    "cleanNick",
    ()=>cleanNick,
    "cleanScoreLevel",
    ()=>cleanScoreLevel,
    "ipHashOf",
    ()=>ipHashOf,
    "rateLimit",
    ()=>rateLimit,
    "scoreCap",
    ()=>scoreCap,
    "signRun",
    ()=>signRun,
    "verifyRunToken",
    ()=>verifyRunToken
]);
/**
 * Защита лидерборда от накрутки (простейшая, но честная связка):
 *
 * 1. HMAC-токен забега — сервер выдаёт его в /api/leaders/start,
 *    клиент обязан вернуть при submit. Подделать без секрета нельзя,
 *    replay (второй submit того же runId) отклоняется одноразовостью
 *    строки LeaderRun (atomic UPDATE ... WHERE status='open').
 * 2. Тайминги: результат не может прийти раньше MIN_RUN_MS после старта
 *    (реальный забег физически дольше) и позже MAX_RUN_MS.
 * 3. Разумность счёта: потолок scoreCap(level). Реальные максимумы честной
 *    игры: золотое зерно +50 × комбо ×5 × перк «Двойной улов» ×2 ×
 *    древо «Урожай» ×1.5 × перки-квота ×1.56 — до ~1000 очков с зерна
 *    и ~10–40k за уровень на высоких уровнях, поэтому потолок щедрый:
 *    15000 + 10000×L (абсолютный — 1 млн). Накрутка всё равно упирается
 *    в HMAC-токен и тайминги.
 * 4. Rate-limit в памяти инстанса (скользящее окно) на IP-хэш и
 *    deviceId: спам start/submit режется до обращения к базе.
 *
 * Секрет — env LEADERBOARD_SECRET (в dev есть fallback).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const MIN_RUN_MS = 15_000;
const MAX_RUN_MS = 3 * 60 * 60 * 1000;
const STARTS_PER_HOUR = 40;
const DEVICE_STARTS_PER_HOUR = 24;
const SUBMITS_PER_HOUR = 30;
const DEVICE_SUBMIT_GAP_MS = 10_000;
const ABSOLUTE_SCORE_CAP = 1_000_000;
function secret() {
    return process.env.LEADERBOARD_SECRET || 'popcorn-paws-dev-secret';
}
function signRun(runId, startedAtMs) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])('sha256', secret()).update(`${runId}.${startedAtMs}`).digest('hex');
}
function verifyRunToken(runId, startedAtMs, token) {
    if (typeof token !== 'string') return false;
    const a = Buffer.from(signRun(runId, startedAtMs), 'hex');
    let b;
    try {
        b = Buffer.from(token, 'hex');
    } catch  {
        return false;
    }
    return a.length === b.length && (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(a, b);
}
function ipHashOf(req) {
    const h = req.headers;
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip')?.trim() || 'local';
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(`${ip}.${secret()}`).digest('hex').slice(0, 24);
}
/* ---------- rate-limit: скользящее окно в памяти ---------- */ const buckets = new Map();
function rateLimit(key, max, windowMs, minGapMs = 0) {
    const now = Date.now();
    const arr = (buckets.get(key) ?? []).filter((t)=>now - t < windowMs);
    if (arr.length >= max) {
        buckets.set(key, arr);
        return false;
    }
    if (minGapMs > 0 && arr.length > 0 && now - arr[arr.length - 1] < minGapMs) {
        buckets.set(key, arr);
        return false;
    }
    arr.push(now);
    buckets.set(key, arr);
    if (buckets.size > 10_000) {
        for (const [k, v] of buckets){
            if (v.every((t)=>now - t >= windowMs)) buckets.delete(k);
        }
    }
    return true;
}
function cleanDevice(raw) {
    if (typeof raw !== 'string') return null;
    const d = raw.trim().slice(0, 64);
    return /^[A-Za-z0-9_-]{8,64}$/.test(d) ? d : null;
}
function cleanNick(raw) {
    let name = typeof raw === 'string' ? raw : '';
    name = name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24);
    return name || 'Котик';
}
function scoreCap(level) {
    return Math.min(ABSOLUTE_SCORE_CAP, 15_000 + level * 10_000);
}
function cleanScoreLevel(score, level) {
    const s = Math.floor(Number(score));
    const l = Math.floor(Number(level));
    if (!Number.isFinite(s) || s < 0 || s > ABSOLUTE_SCORE_CAP) return null;
    if (!Number.isFinite(l) || l < 1 || l > 999) return null;
    if (s > scoreCap(l)) return null;
    return {
        score: s,
        level: l
    };
}
}),
"[project]/src/lib/leaders-db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bumpStat",
    ()=>bumpStat,
    "claimNick",
    ()=>claimNick,
    "expireRun",
    ()=>expireRun,
    "fetchTopLeaders",
    ()=>fetchTopLeaders,
    "fetchWorldStats",
    ()=>fetchWorldStats,
    "playerRank",
    ()=>playerRank,
    "recordVisit",
    ()=>recordVisit,
    "startLeaderRun",
    ()=>startLeaderRun,
    "submitLeaderRun",
    ()=>submitLeaderRun
]);
/**
 * Онлайн-лидерборд POPCORN PAWS на Prisma.
 *
 * База: локально SQLite (file:./db/custom.db), в проде Supabase Postgres —
 * схема в prisma/schema.prisma переносимая, отличается только provider
 * и DATABASE_URL. Без доступной базы все функции возвращают null/false:
 * API честно отвечает { online: false } и игра продолжает вести
 * локальный список на устройстве.
 *
 * Мировая таблица (0.0.47): строится из LeaderPlayer — «аккаунта» котика.
 * Каждый котик появляется в топе РОВНО ОДИН раз, и пишется только его
 * МАКСИМАЛЬНЫЙ рекорд (дубли забегов живут в LeaderSubmission, но в
 * таблицу не попадают). Имя котика уникально: закрепляется через
 * claimNick (POST /api/leaders/nick), а коллизии от офлайн-переименований
 * и старых данных развязывает суффикс «•тег» при отображении.
 *
 * Защита от накрутки описана в src/lib/leaderboard-guard.ts
 * (HMAC-токен забега + одноразовость + тайминги + rate-limit).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaderboard$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/leaderboard-guard.ts [app-route] (ecmascript)");
;
;
/* ---------- автосоздание таблиц (Supabase: нулевая настройка) ---------- */ /**
 * Идемпотентный DDL, дословно повторяющий prisma/schema.prisma
 * (диалект Postgres: quoted identifiers, TIMESTAMP(3), BIGINT).
 *
 * Выполняется один раз на процесс сервера при первом обращении к базе:
 * на Vercel достаточно задать DATABASE_URL → redeploy → первый же
 * запрос сам создаст все таблицы и индексы. Ни SQL-редактор Supabase,
 * ни prisma db push вручную запускать не нужно.
 *
 * Локальный SQLite сюда не попадает: там таблицы создаёт `bun run db:push`.
 * Правка схемы: обнови prisma/schema.prisma и этот массив ОДНОВРЕМЕННО.
 */ const POSTGRES_DDL = [
    `CREATE TABLE IF NOT EXISTS "LeaderPlayer" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "nick" TEXT NOT NULL DEFAULT 'Котик',
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "bestLevel" INTEGER NOT NULL DEFAULT 0,
    "bestAt" TIMESTAMP(3),
    "runs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeaderPlayer_pkey" PRIMARY KEY ("id")
  )`,
    /* миграция уже существующей прод-таблицы (CREATE IF NOT EXISTS её не трогает) */ `ALTER TABLE "LeaderPlayer" ADD COLUMN IF NOT EXISTS "bestAt" TIMESTAMP(3)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "LeaderPlayer_device_key" ON "LeaderPlayer"("device")`,
    `CREATE INDEX IF NOT EXISTS "LeaderPlayer_bestScore_idx" ON "LeaderPlayer"("bestScore")`,
    `CREATE TABLE IF NOT EXISTS "LeaderRun" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "ipHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "score" INTEGER,
    "level" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "LeaderRun_pkey" PRIMARY KEY ("id")
  )`,
    `CREATE INDEX IF NOT EXISTS "LeaderRun_ipHash_startedAt_idx" ON "LeaderRun"("ipHash", "startedAt")`,
    `CREATE INDEX IF NOT EXISTS "LeaderRun_device_status_idx" ON "LeaderRun"("device", "status")`,
    `CREATE TABLE IF NOT EXISTS "LeaderSubmission" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaderSubmission_pkey" PRIMARY KEY ("id")
  )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "LeaderSubmission_runId_key" ON "LeaderSubmission"("runId")`,
    `CREATE INDEX IF NOT EXISTS "LeaderSubmission_score_idx" ON "LeaderSubmission"("score")`,
    `CREATE INDEX IF NOT EXISTS "LeaderSubmission_device_idx" ON "LeaderSubmission"("device")`,
    `CREATE TABLE IF NOT EXISTS "LeaderStat" (
    "key" TEXT NOT NULL,
    "value" BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT "LeaderStat_pkey" PRIMARY KEY ("key")
  )`,
    `CREATE TABLE IF NOT EXISTS "LeaderVisit" (
    "device" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeaderVisit_pkey" PRIMARY KEY ("device")
  )`
];
let ensurePromise = null;
function isPostgresUrl() {
    return /^postgres(ql)?:/i.test((process.env.DATABASE_URL ?? '').trim());
}
/**
 * Создать таблицы в Postgres (один раз на процесс; при ошибке —
 * повтор на следующем запросе). Вызывается перед каждой операцией
 * с базой внутри существующих try/catch: неудача старта даёт
 * обычный offline-режим, игра не падает.
 */ function ensureTables() {
    if (!isPostgresUrl()) return Promise.resolve();
    if (!ensurePromise) {
        ensurePromise = (async ()=>{
            for (const sql of POSTGRES_DDL)await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$executeRawUnsafe(sql);
            console.log('[leaders] ensureTables: таблицы Postgres готовы');
        })().catch((err)=>{
            ensurePromise = null; // разрешаем повторную попытку на следующем запросе
            throw err;
        });
    }
    return ensurePromise;
}
/* ---------- чтение топа и статистики ---------- */ /**
 * Короткий стабильный тег устройства (4 символа base36): различает
 * одинаковые ники в топе, не раскрывая deviceId.
 */ function devTag(device) {
    let h = 5381;
    for(let i = 0; i < device.length; i++)h = (h << 5) + h + device.charCodeAt(i) >>> 0;
    return h.toString(36).padStart(4, '0').slice(0, 4);
}
async function fetchTopLeaders(limit = 20) {
    try {
        await ensureTables();
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderPlayer.findMany({
            where: {
                bestScore: {
                    gt: 0
                }
            },
            orderBy: [
                {
                    bestScore: 'desc'
                },
                {
                    updatedAt: 'asc'
                }
            ],
            take: limit,
            select: {
                nick: true,
                bestScore: true,
                bestLevel: true,
                bestAt: true,
                updatedAt: true,
                device: true
            }
        });
        /* Группируем ники без учёта регистра: коллизия → суффикс у всех носителей */ const dup = new Map();
        for (const r of rows){
            const k = r.nick.trim().toLowerCase();
            dup.set(k, (dup.get(k) ?? 0) + 1);
        }
        return rows.map((r)=>{
            const k = r.nick.trim().toLowerCase();
            const name = (dup.get(k) ?? 0) > 1 ? `${r.nick}•${devTag(r.device)}` : r.nick;
            return {
                name,
                score: r.bestScore,
                level: r.bestLevel,
                date: (r.bestAt ?? r.updatedAt).getTime()
            };
        });
    } catch (err) {
        console.error('[leaders] fetch failed:', err);
        return null;
    }
}
async function fetchWorldStats() {
    try {
        await ensureTables();
        const [counters, groups, visits] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderStat.findMany({
                where: {
                    key: {
                        in: [
                            'launches',
                            'runs',
                            'playsecs'
                        ]
                    }
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderSubmission.groupBy({
                by: [
                    'device'
                ]
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderVisit.count()
        ]);
        const get = (k)=>Number(counters.find((c)=>c.key === k)?.value ?? 0);
        return {
            launches: get('launches'),
            runs: get('runs'),
            players: groups.length,
            playSecs: get('playsecs'),
            visitors: visits
        };
    } catch (err) {
        console.error('[leaders] fetchWorldStats failed:', err);
        return null;
    }
}
async function bumpStat(key, delta = 1) {
    try {
        await ensureTables();
        const s = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderStat.upsert({
            where: {
                key
            },
            create: {
                key,
                value: Math.max(1, Math.floor(delta))
            },
            update: {
                value: {
                    increment: Math.max(0, Math.floor(delta))
                }
            }
        });
        return Number(s.value);
    } catch (err) {
        console.error('[leaders] bumpStat failed:', err);
        return null;
    }
}
async function recordVisit(device) {
    try {
        await ensureTables();
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderVisit.findUnique({
            where: {
                device
            }
        });
        if (existing) {
            /* lastAt обновится сам (@updatedAt) */ await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderVisit.update({
                where: {
                    device
                },
                data: {
                    lastAt: new Date()
                }
            });
            return false;
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderVisit.create({
            data: {
                device
            }
        });
        return true;
    } catch (err) {
        console.error('[leaders] recordVisit failed:', err);
        return false;
    }
}
async function claimNick(device, nick) {
    try {
        await ensureTables();
        const mine = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderPlayer.findUnique({
            where: {
                device
            }
        });
        if (mine?.nick === nick) return {
            ok: true
        };
        const owner = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderPlayer.findFirst({
            where: {
                nick
            }
        });
        if (owner && owner.device !== device) return {
            ok: false,
            taken: true
        };
        if (mine) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderPlayer.update({
                where: {
                    device
                },
                data: {
                    nick
                }
            });
        } else {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderPlayer.create({
                data: {
                    device,
                    nick
                }
            });
        }
        return {
            ok: true
        };
    } catch (err) {
        console.error('[leaders] claimNick failed:', err);
        return {
            ok: false,
            offline: true
        };
    }
}
async function startLeaderRun(device, ipHash) {
    try {
        await ensureTables();
        const run = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderRun.create({
            data: {
                device,
                ipHash
            }
        });
        return {
            runId: run.id,
            startedAt: run.startedAt.getTime()
        };
    } catch (err) {
        console.error('[leaders] start failed:', err);
        return null;
    }
}
async function submitLeaderRun(a) {
    let run;
    try {
        await ensureTables();
        run = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderRun.findUnique({
            where: {
                id: a.runId
            },
            select: {
                id: true,
                device: true,
                status: true,
                startedAt: true
            }
        });
    } catch (err) {
        console.error('[leaders] submit lookup failed:', err);
        return {
            ok: false,
            reason: 'db'
        };
    }
    /* Не существует / чужой device / неверная подпись — неотличимо друг от друга */ if (!run || run.device !== a.device || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaderboard$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyRunToken"])(run.id, run.startedAt.getTime(), a.token)) {
        return {
            ok: false,
            reason: 'no-run'
        };
    }
    if (run.status !== 'open') return {
        ok: false,
        reason: 'replay'
    };
    const now = Date.now();
    const elapsed = now - run.startedAt.getTime();
    if (elapsed < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaderboard$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MIN_RUN_MS"]) return {
        ok: false,
        reason: 'too-fast'
    };
    if (elapsed > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$leaderboard$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_RUN_MS"]) {
        await expireRun(run.id);
        return {
            ok: false,
            reason: 'expired'
        };
    }
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
            const claimed = await tx.leaderRun.updateMany({
                where: {
                    id: run.id,
                    status: 'open'
                },
                data: {
                    status: 'submitted',
                    score: a.score,
                    level: a.level,
                    endedAt: new Date(now)
                }
            });
            if (claimed.count === 0) throw new Error('REPLAY');
            await tx.leaderSubmission.create({
                data: {
                    runId: run.id,
                    device: a.device,
                    nick: a.nick,
                    score: a.score,
                    level: a.level
                }
            });
            /* Аккаунт котика: хранится ТОЛЬКО максимальный рекорд (bestAt — когда
         он поставлен; bestScore: 0-строки в топ не попадают) */ const p = await tx.leaderPlayer.findUnique({
                where: {
                    device: a.device
                }
            });
            if (!p) {
                await tx.leaderPlayer.create({
                    data: {
                        device: a.device,
                        nick: a.nick,
                        bestScore: a.score,
                        bestLevel: a.level,
                        bestAt: a.score > 0 ? new Date(now) : null,
                        runs: 1
                    }
                });
            } else {
                const isRecord = a.score > p.bestScore && a.score > 0;
                await tx.leaderPlayer.update({
                    where: {
                        device: a.device
                    },
                    data: {
                        nick: a.nick,
                        runs: {
                            increment: 1
                        },
                        bestScore: Math.max(p.bestScore, a.score),
                        bestLevel: Math.max(p.bestLevel, a.level),
                        ...isRecord ? {
                            bestAt: new Date(now)
                        } : {}
                    }
                });
            }
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'REPLAY') return {
            ok: false,
            reason: 'replay'
        };
        console.error('[leaders] submit failed:', err);
        return {
            ok: false,
            reason: 'db'
        };
    }
    /* Счётчики завершённых забегов и игрового времени + место игрока (некритично) */ await bumpStat('runs');
    /* Игровое время: клиентские секунды чистой игры, зажатые таймингом забега */ const playSecs = Math.max(0, Math.min(Math.floor(Number(a.secs) || 0), Math.floor(elapsed / 1000) + 5));
    if (playSecs > 0) await bumpStat('playsecs', playSecs);
    const rank = await playerRank(a.device);
    return {
        ok: true,
        rank: rank?.rank,
        best: rank?.best
    };
}
async function expireRun(runId) {
    try {
        await ensureTables();
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderRun.updateMany({
            where: {
                id: runId,
                status: 'open'
            },
            data: {
                status: 'expired',
                endedAt: new Date()
            }
        });
    } catch (err) {
        console.error('[leaders] expire failed:', err);
    }
}
async function playerRank(device) {
    try {
        await ensureTables();
        const p = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderPlayer.findUnique({
            where: {
                device
            },
            select: {
                bestScore: true
            }
        });
        if (!p || p.bestScore <= 0) return null;
        const better = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].leaderPlayer.count({
            where: {
                bestScore: {
                    gt: p.bestScore
                }
            }
        });
        return {
            rank: better + 1,
            best: p.bestScore
        };
    } catch (err) {
        console.error('[leaders] rank failed:', err);
        return null;
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__12_y720tkhqhk._.js.map