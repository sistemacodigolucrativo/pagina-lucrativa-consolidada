#!/usr/bin/env bash
set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.vps.yml}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/}"
TARGET_SHA="${1:-}"
DEPLOY_TOUCHED_SERVICE=0

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy] ERRO: %s\n' "$*" >&2
  exit 1
}

command -v git >/dev/null 2>&1 || fail "git não está instalado."
command -v docker >/dev/null 2>&1 || fail "docker não está instalado."
docker compose version >/dev/null 2>&1 || fail "docker compose não está disponível."

[[ -n "$TARGET_SHA" ]] || fail "Informe o SHA alvo como primeiro argumento."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "O diretório atual não é um repositório Git."
[[ -f "$COMPOSE_FILE" ]] || fail "Arquivo $COMPOSE_FILE não encontrado."

if [[ -n "$(git status --porcelain)" ]]; then
  fail "A cópia de produção possui alterações locais. O deploy foi interrompido para evitar perda de dados."
fi

OLD_SHA="$(git rev-parse HEAD)"
log "Versão atual: $OLD_SHA"
log "Atualizando referências do origin/main..."
git fetch --prune origin main
ORIGIN_MAIN_SHA="$(git rev-parse origin/main)"

if [[ "$TARGET_SHA" != "$ORIGIN_MAIN_SHA" ]]; then
  fail "O SHA solicitado ($TARGET_SHA) não corresponde ao origin/main atual ($ORIGIN_MAIN_SHA)."
fi

if [[ "$OLD_SHA" == "$TARGET_SHA" ]]; then
  log "A VPS já está na versão solicitada. Nenhuma ação necessária."
  exit 0
fi

# Alterações de schema/migração não são aplicadas automaticamente. Exigem backup de banco e revisão manual.
DB_CHANGES="$(git diff --name-only "$OLD_SHA" "$TARGET_SHA" -- drizzle drizzle.config.ts drizzle/schema.ts || true)"
if [[ -n "$DB_CHANGES" ]]; then
  printf '%s\n' "$DB_CHANGES" >&2
  fail "Foram detectadas alterações de banco/migração. Faça backup do banco e uma implantação manual revisada."
fi

rollback() {
  local exit_code=$?
  trap - ERR
  printf '[deploy] Falha detectada. Restaurando %s...\n' "$OLD_SHA" >&2
  git reset --hard "$OLD_SHA" >/dev/null
  if [[ "$DEPLOY_TOUCHED_SERVICE" -eq 1 ]]; then
    docker compose -f "$COMPOSE_FILE" build app
    docker compose -f "$COMPOSE_FILE" up -d app
  fi
  printf '[deploy] Rollback concluído para %s.\n' "$OLD_SHA" >&2
  exit "$exit_code"
}
trap rollback ERR

log "Movendo working tree para $TARGET_SHA..."
git reset --hard "$TARGET_SHA"

log "Construindo nova imagem da aplicação..."
docker compose -f "$COMPOSE_FILE" build app

log "Subindo nova versão da aplicação..."
DEPLOY_TOUCHED_SERVICE=1
docker compose -f "$COMPOSE_FILE" up -d app

log "Executando health check em $HEALTHCHECK_URL..."
HEALTH_OK=0
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 "$HEALTHCHECK_URL" >/dev/null 2>&1; then
    HEALTH_OK=1
    break
  fi
  sleep 2
done

if [[ "$HEALTH_OK" -ne 1 ]]; then
  fail "A nova versão não respondeu ao health check."
fi

trap - ERR
log "Deploy concluído com sucesso: $TARGET_SHA"
