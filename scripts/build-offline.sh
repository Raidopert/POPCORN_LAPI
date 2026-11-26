#!/usr/bin/env bash
# ОФЛАЙН-СБОРКА POPCORN PAWS (v0.0.72) для Windows-установщика и Android-APK.
#
# Что делает:
#   1) временно прячет src/app/api и все app/route.ts (серверные и
#      redirect-роуты не живут в статическом экспорте: Next падает на
#      «Failed to collect page data»);
#   2) собирает статический экспорт Next.js (POPCORN_EXPORT=1, distDir=.next-export);
#   3) копирует результат в desktop-build/web (без VK-архивов *.zip).
#
# Лидерборд в такой сборке работает в локальном режиме (online:false →
# локальный топ устройства) — штатная деградация, ничего не ломается.
set -euo pipefail
cd "$(dirname "$0")/.."

STASH=".api-stash"

# страховка: если прошлый запуск оборвался — вернуть всё на место
restore() {
  if [ -d "$STASH/api" ] && [ ! -d src/app/api ]; then mv "$STASH/api" src/app/api; fi
  if [ -d "$STASH/app" ]; then
    (cd "$STASH/app" && find . -type f -print0) | while IFS= read -r -d '' f; do
      dest="src/app/${f#./}"
      if [ ! -e "$dest" ]; then
        mkdir -p "$(dirname "$dest")"
        mv "$STASH/app/$f" "$dest"
      fi
    done
    rm -rf "$STASH/app"
  fi
  rmdir "$STASH" 2>/dev/null || true
}

# прячем api-каталог и все route.ts целиком (с сохранением путей)
stash() {
  rm -rf "$STASH"
  mkdir -p "$STASH/app"
  if [ -d src/app/api ]; then mv src/app/api "$STASH/api"; fi
  find src/app -mindepth 2 -name 'route.ts' -print0 | while IFS= read -r -d '' f; do
    rel="${f#src/app/}"
    mkdir -p "$STASH/app/$(dirname "$rel")"
    mv "$f" "$STASH/app/$rel"
  done
}

restore   # на случай незавершённого прошлого запуска
trap restore EXIT

stash
echo ">> спрятано: src/app/api и все route.ts (на время экспорта)"

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
