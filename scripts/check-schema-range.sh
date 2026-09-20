#!/usr/bin/env bash
set -Eeuo pipefail
BASE_SHA="${1:-}"
TARGET_SHA="${2:-}"
reject() { echo 'Intervalo ausente/inválido ou alteração de schema: exige revisão operacional separada.' >&2; exit 1; }
[[ "$BASE_SHA" =~ ^[0-9a-f]{40}$ && "$TARGET_SHA" =~ ^[0-9a-f]{40}$ ]] || reject
git cat-file -e "${BASE_SHA}^{commit}" 2>/dev/null || reject
git cat-file -e "${TARGET_SHA}^{commit}" 2>/dev/null || reject
git merge-base --is-ancestor "$BASE_SHA" "$TARGET_SHA" || reject
# Also reject changes made and reverted in intermediate commits.
CHANGED="$(git log --format= --name-only "$BASE_SHA..$TARGET_SHA" -- drizzle drizzle.config.ts)"
[[ -z "$CHANGED" ]] || reject
git diff --quiet "$BASE_SHA" "$TARGET_SHA" -- drizzle drizzle.config.ts || reject
echo 'Intervalo completo validado: sem alteração de schema.'
