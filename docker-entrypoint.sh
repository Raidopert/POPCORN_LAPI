#!/bin/sh
# =============================================================================
# docker-entrypoint.sh — «Кошачий попкорнный Беспредел» (автор Raidopert)
#
# POSIX sh (только /bin/sh, без bash-зависимостей).
# Логика:
#   1. Если задан DATABASE_URL — пытаемся синхронизировать схему Prisma
#      (bunx prisma db push). Ошибка НЕ критична: схема в репозитории
#      объявлена для sqlite, а мировой лидерборд игры и так создаёт свою
#      таблицу leaders автоматически при первом обращении к /api/leaders.
#      Поэтому падение тихо игнорируется (|| echo ...), и игра стартует.
#   2. Запускаем прод-сервер: exec bun run start (это `next start -p 3000`).
# =============================================================================

set -u

echo "[popcorn] «Кошачий попкорнный Беспредел» (Cat Popcorn Mayhem) — pre-alpha 0.0.2"

if [ -n "${DATABASE_URL:-}" ]; then
    echo "[popcorn] DATABASE_URL найден — пробуем синхронизировать схему Prisma (best-effort)..."
    bunx prisma db push --skip-generate --accept-data-loss \
        || echo "[popcorn] prisma db push не удался — НЕ критично, игра всё равно запустится (лидерборд подключится сам)."
else
    echo "[popcorn] DATABASE_URL не задан — стартуем с локальным лидербордом (оффлайн-режим)."
fi

echo "[popcorn] Запуск сервера: next start на порту ${PORT:-3000} ..."
exec bun run start
