#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-}"
SERVICE_NAME="${SERVICE_NAME:-pagina-lucrativa.service}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3101/}"
PUBLIC_HEALTHCHECK_URL="${PUBLIC_HEALTHCHECK_URL:-https://ocodigolucrativo.site/}"
PNPM_BIN="${PNPM_BIN:-}"
POLL_SECONDS="${MANUAL_DEPLOY_POLL_SECONDS:-2}"
RUN_ONCE="${MANUAL_DEPLOY_WORKER_ONCE:-0}"

[[ -n "$DEPLOY_ROOT" && "$DEPLOY_ROOT" = /* ]] || {
  echo '[manual-deploy-worker] DEPLOY_ROOT absoluto é obrigatório.' >&2
  exit 1
}

REQUEST_FILE="$DEPLOY_ROOT/manual-deploy-request.json"
PROCESSING_FILE="$DEPLOY_ROOT/manual-deploy-processing.json"
HEARTBEAT_FILE="$DEPLOY_ROOT/manual-deploy-worker.json"
STATUS_FILE="$DEPLOY_ROOT/deploy-status.json"

log() { printf '[manual-deploy-worker] %s\n' "$*"; }

write_heartbeat() {
  local tmp="${HEARTBEAT_FILE}.tmp.$$"
  printf '{"pid":%s,"updatedAt":"%s"}\n' "$$" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp"
  mv -f "$tmp" "$HEARTBEAT_FILE"
}

write_worker_failure() {
  local stage="$1"
  local sha="${2:-}"
  local tmp="${STATUS_FILE}.tmp.$$"
  printf '{"status":"failed","progress":100,"stage":"%s","sha":"%s","updatedAt":"%s"}\n' \
    "$stage" "$sha" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp"
  mv -f "$tmp" "$STATUS_FILE"
}

request_sha() {
  node - "$1" <<'NODE'
const fs = require("node:fs");
const file = process.argv[2];
const value = JSON.parse(fs.readFileSync(file, "utf8"));
if (typeof value.sha !== "string" || !/^[0-9a-f]{40}$/.test(value.sha)) process.exit(2);
process.stdout.write(value.sha);
NODE
}

if [[ -f "$PROCESSING_FILE" && ! -f "$REQUEST_FILE" ]]; then
  mv -f "$PROCESSING_FILE" "$REQUEST_FILE"
fi

while true; do
  write_heartbeat

  if [[ ! -f "$REQUEST_FILE" ]]; then
    [[ "$RUN_ONCE" == "1" ]] && exit 0
    sleep "$POLL_SECONDS"
    continue
  fi

  if ! mv "$REQUEST_FILE" "$PROCESSING_FILE" 2>/dev/null; then
    [[ "$RUN_ONCE" == "1" ]] && exit 0
    sleep "$POLL_SECONDS"
    continue
  fi

  SHA=""
  if ! SHA="$(request_sha "$PROCESSING_FILE")"; then
    log "Solicitação inválida descartada."
    write_worker_failure "Solicitação manual inválida"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  CURRENT_RELEASE="$(readlink -f "$DEPLOY_ROOT/current" 2>/dev/null || true)"
  if [[ -z "$CURRENT_RELEASE" || ! -d "$CURRENT_RELEASE" || ! -f "$CURRENT_RELEASE/.deployed-sha" ]]; then
    log "Release atual não pôde ser identificado."
    write_worker_failure "Release atual não identificado" "$SHA"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  CURRENT_SHA="$(tr -d '[:space:]' < "$CURRENT_RELEASE/.deployed-sha")"
  if [[ ! "$CURRENT_SHA" =~ ^[0-9a-f]{40}$ || "$CURRENT_SHA" != "$SHA" ]]; then
    log "SHA solicitado não corresponde ao release atualmente publicado."
    write_worker_failure "Versão solicitada não corresponde à produção" "$SHA"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  DEPLOY_SCRIPT="$CURRENT_RELEASE/scripts/deploy-vps.sh"
  if [[ ! -f "$DEPLOY_SCRIPT" ]]; then
    log "Script real de deploy não encontrado no release atual."
    write_worker_failure "Script real de deploy não encontrado" "$SHA"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  ARTIFACT="/tmp/pagina-lucrativa-manual-${SHA}-$$.tar.gz"
  rm -f "$ARTIFACT"
  log "Preparando nova publicação do SHA $SHA com o mesmo deploy-vps.sh do autodeploy."
  (
    cd "$CURRENT_RELEASE"
    tar \
      --exclude='.git' \
      --exclude='node_modules' \
      --exclude='dist' \
      --exclude='.env' \
      --exclude='.env.*' \
      --exclude='.smoke.log' \
      -czf "$ARTIFACT" .
  )

  if DEPLOY_INVOCATION=manual \
      DEPLOY_STATUS_FILE="$STATUS_FILE" \
      PUBLIC_HEALTHCHECK_URL="$PUBLIC_HEALTHCHECK_URL" \
      PNPM_BIN="$PNPM_BIN" \
      bash "$DEPLOY_SCRIPT" "$SHA" "$DEPLOY_ROOT" "$ARTIFACT" "$HEALTHCHECK_URL"; then
    log "Deploy manual concluído para $SHA."
  else
    code=$?
    log "Deploy manual falhou para $SHA com código $code."
    rm -f "$ARTIFACT"
  fi

  rm -f "$PROCESSING_FILE"
  write_heartbeat
  [[ "$RUN_ONCE" == "1" ]] && exit 0
  sleep "$POLL_SECONDS"
done
