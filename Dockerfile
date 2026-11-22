# =============================================================================
# «Кошачий попкорнный Беспредел» (Cat Popcorn Mayhem) — автор Raidopert
# Продакшн-образ для локального запуска игры в Docker.
#
# Особенности:
#  - базовый образ oven/bun:1 — это Debian (НЕ alpine): Prisma и драйвер
#    Postgres требуют glibc и стандартные бинарные сборки;
#  - трёхстадийная сборка: deps → builder → runner;
#  - игра работает и БЕЗ базы: без DATABASE_URL включается локальный
#    лидерборд на устройстве игрока (см. DOCKER.md).
#
# Сборка:  docker build -t popcorn-lapi .
# Запуск:  docker run -p 3000:3000 popcorn-lapi
# =============================================================================

# -----------------------------------------------------------------------------
# Стадия 1: deps — установка зависимостей по lockfile (bun.lock существует)
# -----------------------------------------------------------------------------
FROM oven/bun:1 AS deps

WORKDIR /app

# Манифест и lockfile — для воспроизводимой установки.
# prisma/schema.prisma нужен, потому что postinstall-скрипт выполняет
# `prisma generate` и без схемы упадёт.
COPY package.json bun.lock ./
COPY prisma/schema.prisma ./prisma/schema.prisma

# ВАЖНО: здесь НЕ ставим NODE_ENV=production, иначе bun пропустит
# devDependencies (typescript, tailwind и т.д.), нужные для сборки.
RUN bun install --frozen-lockfile

# -----------------------------------------------------------------------------
# Стадия 2: builder — сборка Next.js (next build)
# -----------------------------------------------------------------------------
FROM oven/bun:1 AS builder

WORKDIR /app

# Готовые node_modules из стадии deps
COPY --from=deps /app/node_modules ./node_modules

# Конфиги проекта (только те, что реально нужны для `next build`)
COPY package.json bun.lock next.config.ts tsconfig.json ./
COPY postcss.config.mjs tailwind.config.ts components.json ./

# Исходники и статика
COPY prisma ./prisma
COPY src ./src
COPY public ./public

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Сборка выполняется НА МАШИНЕ ПОЛЬЗОВАТЕЛЯ при `docker build` (не в песочнице)
RUN bun run build

# -----------------------------------------------------------------------------
# Стадия 3: runner — минимальный рантайм
# -----------------------------------------------------------------------------
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Временно переключаемся на root для chmod (в образе oven/bun по умолчанию
# пользователь bun), затем возвращаем non-root.
USER root

COPY --chown=bun:bun docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Полный node_modules (включая next-бинарник и сгенерированный Prisma Client)
COPY --from=deps --chown=bun:bun /app/node_modules ./node_modules

# Артефакты сборки Next.js
COPY --from=builder --chown=bun:bun /app/.next ./.next

# Статика (картинки комнат, иконки, манифест PWA, sw.js)
COPY --chown=bun:bun ./public ./public

# Схема Prisma — нужна entrypoint-скрипту для best-effort `prisma db push`
COPY --from=builder --chown=bun:bun /app/prisma ./prisma

COPY --chown=bun:bun package.json ./

USER bun

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
