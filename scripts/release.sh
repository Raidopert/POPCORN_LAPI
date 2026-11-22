#!/usr/bin/env bash
# v0.0.64: релизный скрипт POPCORN PAWS.
# Каждый релиз оставляет неизменяемый якорь прав: git-тег + GitHub Release
# с zip-архивом исходника (LICENSE/EULA внутри архива автоматически).
#
# Использование:  bash scripts/release.sh v0.0.64 "Заголовок релиза"
# Требования: чистое рабочее дерево; коммит уже сделан.

set -euo pipefail

TAG="${1:?Usage: release.sh v0.0.NN 'Title'}"
TITLE="${2:-POPCORN PAWS $TAG}"

REPO="Raidopert/POPCORN_LAPI"

# 1. Дерево должно быть чистым
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: рабочее дерево не чистое — сначала закоммить." >&2
  exit 1
fi

# 2. Токен из remote URL
REMOTE_URL="$(git remote get-url origin)"
TOKEN="${REMOTE_URL#https://}"
TOKEN="${TOKEN%%@*}"
if [ -z "$TOKEN" ]; then
  echo "ERROR: токен не найден в remote URL." >&2
  exit 1
fi

# 3. Тег (идемпотентно: если уже есть — берём существующий)
if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "Тег $TAG уже существует."
else
  git tag -a "$TAG" -m "$TITLE"
  echo "Тег $TAG создан."
fi

# 4. Пуш ветки и тега
BRANCH="$(git branch --show-current)"
git push origin "$BRANCH" --follow-tags
echo "Pushed $BRANCH + $TAG."

# 5. Zip исходника (без db/dev.log — они не в git)
ZIP="popcorn-paws-${TAG}-source.zip"
git archive --format=zip --prefix="popcorn-paws-${TAG}/" -o "$ZIP" HEAD
echo "Архив: $ZIP ($(du -h "$ZIP" | cut -f1))"

# 6. GitHub Release (идемпотентно: переиспользуем существующий)
RELEASE_JSON=$(curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$REPO/releases" \
  -d "{\"tag_name\":\"$TAG\",\"name\":\"$TITLE\",\"body\":\"Депозит прав: см. LICENSE и EULA.md внутри архива.\\n\\nПолная история: git log $TAG^..$TAG\",\"draft\":false,\"prerelease\":false}" \
  || curl -sf "https://api.github.com/repos/$REPO/releases/tags/$TAG")
RELEASE_ID=$(echo "$RELEASE_JSON" | grep -m1 '"id"' | tr -dc '0-9')
if [ -z "$RELEASE_ID" ]; then
  echo "ERROR: не удалось создать/найти release." >&2
  exit 1
fi
echo "Release id: $RELEASE_ID"

# 7. Загрузка zip-ассета (идемпотентно)
EXISTING=$(curl -sf -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/repos/$REPO/releases/$RELEASE_ID/assets" \
  | grep -c "\"name\": \"$ZIP\"" || true)
if [ "${EXISTING:-0}" = "0" ]; then
  curl -sf -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/zip" \
    --data-binary @"$ZIP" \
    "https://uploads.github.com/repos/$REPO/releases/$RELEASE_ID/assets?name=$ZIP" >/dev/null
  echo "Ассет загружен: $ZIP"
else
  echo "Ассет $ZIP уже в релизе."
fi

rm -f "$ZIP"
echo "ГОТОВО: https://github.com/$REPO/releases/tag/$TAG"
