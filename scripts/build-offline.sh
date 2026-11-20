#!/usr/bin/env bash
# ОФЛАЙН-СБОРКА POPCORN PAWS (v0.0.72) для Windows-установщика и Android-APK.
#
# Что делает:
#   1) временно убирает src/app/api (серверные роуты не живут в статике);
#   2) собирает статический экспорт Next.js (POPCORN_EXPORT=1, distDir=.next-export);
#   3) копирует результат в desktop-build/web (без VK-архивов *.zip).
#
# Лидерборд в такой сборке работает в локальном режиме (online:false →
# локальный топ устройства) — штатная деградация, ничего не ломается.
set -euo pipefail
cd "$(dirname "$0")/.."

STASH=".api-stash"

# страховка: если прошлый запуск оборвался — вернуть api на место
if [ -d "$STASH" ] && [ ! -d src/app/api ]; then
  echo ">> найден незавершённый stash — восстанавливаю src/app/api"
  mv "$STASH" src/app/api
fi

restore() { if [ -d "$STASH" ] && [ ! -d src/app/api ]; then mv "$STASH" src/app/api; fi }
trap restore EXIT

echo ">> прячу src/app/api (на время экспорта)"
mv src/app/api "$STASH"

rm -rf .next-export
echo ">> next build (статический экспорт)…"
POPCORN_EXPORT=1 ./node_modules/.bin/next build

restore

mkdir -p desktop-build
rm -rf desktop-build/web
# Next 16 с кастомным distDir кладёт статический экспорт прямо в него
cp -r .next-export desktop-build/web
rm -f desktop-build/web/*.zip       # VK-архивы в оффлайн-сборке не нужны
rm -rf desktop-build/web/downloads  # установщики (public/downloads) в сборку не пакуем!

echo ">> ОК: desktop-build/web готова"
du -sh desktop-build/web
