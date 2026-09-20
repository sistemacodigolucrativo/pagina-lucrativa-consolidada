#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-}"
SERVICE_NAME="${SERVICE_NAME:-pagina-lucrativa.service}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3101/api/healthz}"
PUBLIC_HEALTHCHECK_URL="${PUBLIC_HEALTHCHECK_URL:-https://ocodigolucrativo.site/api/healthz}"
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
RESULT_FILE="$DEPLOY_ROOT/manual-deploy-result.json"

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

write_manual_result() {
  local status="$1"
  local sha="$2"
  local requested_by="$3"
  local requested_at="$4"
  local started_at="$5"
  local finished_at="$6"
  local stage="$7"
  local exit_code="$8"
  local tmp="${RESULT_FILE}.tmp.$$"
  node - "$tmp" "$status" "$sha" "$requested_by" "$requested_at" "$started_at" "$finished_at" "$stage" "$exit_code" <<'NODE'
const fs = require("node:fs");
const [file, status, sha, requestedByRaw, requestedAt, startedAt, finishedAt, stage, exitCodeRaw] = process.argv.slice(2);
const requestedBy = /^\d+$/.test(requestedByRaw) ? Number(requestedByRaw) : null;
const exitCode = /^-?\d+$/.test(exitCodeRaw) ? Number(exitCodeRaw) : null;
fs.writeFileSync(file, `${JSON.stringify({
  status,
  sha,
  requestedBy,
  requestedAt: requestedAt || null,
  startedAt: startedAt || null,
  finishedAt: finishedAt || null,
  stage: stage || null,
  exitCode,
})}\n`);
NODE
  mv -f "$tmp" "$RESULT_FILE"
}

request_meta() {
  node - "$1" <<'NODE'
const fs = require("node:fs");
const file = process.argv[2];
const value = JSON.parse(fs.readFileSync(file, "utf8"));
if (typeof value.sha !== "string" || !/^[0-9a-f]{40}$/.test(value.sha)) process.exit(2);
if (!Number.isInteger(value.requestedBy) || value.requestedBy <= 0) process.exit(3);
if (typeof value.requestedAt !== "string" || Number.isNaN(Date.parse(value.requestedAt))) process.exit(4);
process.stdout.write(`${value.sha}\t${value.requestedBy}\t${value.requestedAt}`);
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
  REQUESTED_BY=""
  REQUESTED_AT=""
  META=""
  if ! META="$(request_meta "$PROCESSING_FILE")"; then
    log "Solicitação inválida descartada."
    write_worker_failure "Solicitação manual inválida"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi
  IFS=$'\t' read -r SHA REQUESTED_BY REQUESTED_AT <<< "$META"

  CURRENT_RELEASE="$(readlink -f "$DEPLOY_ROOT/current" 2>/dev/null || true)"
  if [[ -z "$CURRENT_RELEASE" || ! -d "$CURRENT_RELEASE" || ! -f "$CURRENT_RELEASE/.deployed-sha" ]]; then
    log "Release atual não pôde ser identificado."
    write_worker_failure "Release atual não identificado" "$SHA"
    write_manual_result "failed" "$SHA" "$REQUESTED_BY" "$REQUESTED_AT" "" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "Release atual não identificado" "1"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  CURRENT_SHA="$(tr -d '[:space:]' < "$CURRENT_RELEASE/.deployed-sha")"
  if [[ ! "$CURRENT_SHA" =~ ^[0-9a-f]{40}$ || "$CURRENT_SHA" != "$SHA" ]]; then
    log "SHA solicitado não corresponde ao release atualmente publicado."
    write_worker_failure "Versão solicitada não corresponde à produção" "$SHA"
    write_manual_result "failed" "$SHA" "$REQUESTED_BY" "$REQUESTED_AT" "" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "Versão solicitada não corresponde à produção" "1"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  DEPLOY_SCRIPT="$CURRENT_RELEASE/scripts/deploy-vps.sh"
  if [[ ! -f "$DEPLOY_SCRIPT" ]]; then
    log "Script real de deploy não encontrado no release atual."
    write_worker_failure "Script real de deploy não encontrado" "$SHA"
    write_manual_result "failed" "$SHA" "$REQUESTED_BY" "$REQUESTED_AT" "" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "Script real de deploy não encontrado" "1"
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
      --exclude='*.pem' \
      --exclude='*.key' \
      --exclude='backups' \
      --exclude='.local-audit' \
      --exclude='.smoke.log' \
      -czf "$ARTIFACT" .
  )

  STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  write_manual_result "running" "$SHA" "$REQUESTED_BY" "$REQUESTED_AT" "$STARTED_AT" "" "Executando o deploy-vps.sh real" ""

  if DEPLOY_INVOCATION=manual \
      DEPLOY_STATUS_FILE="$STATUS_FILE" \
      PUBLIC_HEALTHCHECK_URL="$PUBLIC_HEALTHCHECK_URL" \
      PNPM_BIN="$PNPM_BIN" \
      bash "$DEPLOY_SCRIPT" "$SHA" "$DEPLOY_ROOT" "$ARTIFACT" "$HEALTHCHECK_URL"; then
    FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    write_manual_result "completed" "$SHA" "$REQUESTED_BY" "$REQUESTED_AT" "$STARTED_AT" "$FINISHED_AT" "Deploy manual validado de ponta a ponta" "0"
    log "Deploy manual concluído para $SHA."
  else
    code=$?
    FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    write_manual_result "failed" "$SHA" "$REQUESTED_BY" "$REQUESTED_AT" "$STARTED_AT" "$FINISHED_AT" "Deploy manual falhou" "$code"
    log "Deploy manual falhou para $SHA com código $code."
    rm -f "$ARTIFACT"
  fi

  rm -f "$PROCESSING_FILE"
  write_heartbeat
  [[ "$RUN_ONCE" == "1" ]] && exit 0
  sleep "$POLL_SECONDS"
done
