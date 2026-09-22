#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-}"
SERVICE_NAME="${SERVICE_NAME:-pagina-lucrativa.service}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/}"
PUBLIC_HEALTHCHECK_URL="${PUBLIC_HEALTHCHECK_URL:-https://ocodigolucrativo.site/}"
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
SAVED_GITHUB_TOKEN_FILE="$DEPLOY_ROOT/shared/github-token"
DEFAULT_CHECKOUT_DIR="${CHECKOUT_DIR:-/home/ubuntu/workspaces/pagina-lucrativa-consolidada}"
ZERO_SHA="0000000000000000000000000000000000000000"

log() { printf '[manual-deploy-worker] %s\n' "$*"; }

write_heartbeat() {
  local tmp="${HEARTBEAT_FILE}.tmp.$$"
  printf '{"pid":%s,"updatedAt":"%s"}\n' "$$" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp"
  mv -f "$tmp" "$HEARTBEAT_FILE"
}

json_string() {
  node -e 'process.stdout.write(JSON.stringify(process.argv[1] || ""))' "$1"
}

write_deploy_status() {
  local status="$1"
  local progress="$2"
  local stage="$3"
  local sha="${4:-$ZERO_SHA}"
  local tmp="${STATUS_FILE}.tmp.$$"
  printf '{"status":"%s","progress":%s,"stage":%s,"sha":"%s","updatedAt":"%s"}\n' \
    "$status" "$progress" "$(json_string "$stage")" "$sha" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp"
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
  local deploy_ref="$9"
  local tmp="${RESULT_FILE}.tmp.$$"
  node - "$tmp" "$status" "$sha" "$requested_by" "$requested_at" "$started_at" "$finished_at" "$stage" "$exit_code" "$deploy_ref" <<'NODE'
const fs = require("node:fs");
const [file, status, sha, requestedByRaw, requestedAt, startedAt, finishedAt, stage, exitCodeRaw, deployRef] = process.argv.slice(2);
const requestedBy = /^\d+$/.test(requestedByRaw) ? Number(requestedByRaw) : null;
const exitCode = /^-?\d+$/.test(exitCodeRaw) ? Number(exitCodeRaw) : null;
const safeSha = /^[0-9a-f]{40}$/.test(sha) ? sha : "0000000000000000000000000000000000000000";
fs.writeFileSync(file, `${JSON.stringify({
  status,
  sha: safeSha,
  requestedBy,
  requestedAt: requestedAt || null,
  startedAt: startedAt || null,
  finishedAt: finishedAt || null,
  stage: stage || null,
  exitCode,
  deployRef: deployRef || null,
})}\n`);
NODE
  mv -f "$tmp" "$RESULT_FILE"
}

request_meta() {
  node - "$1" <<'NODE'
const fs = require("node:fs");
const file = process.argv[2];
const value = JSON.parse(fs.readFileSync(file, "utf8"));
const deployRef = typeof value.deployRef === "string" && value.deployRef.trim() ? value.deployRef.trim() : "main";
if (!/^[A-Za-z0-9._\/-]{1,160}$/.test(deployRef) || deployRef.includes("..") || deployRef.startsWith("/") || deployRef.endsWith("/")) process.exit(2);
if (!Number.isInteger(value.requestedBy) || value.requestedBy <= 0) process.exit(3);
if (typeof value.requestedAt !== "string" || Number.isNaN(Date.parse(value.requestedAt))) process.exit(4);
const sha = typeof value.sha === "string" && /^[0-9a-f]{40}$/.test(value.sha) ? value.sha : "0000000000000000000000000000000000000000";
const token = typeof value.githubToken === "string" ? value.githubToken.trim() : "";
if (token && (token.length < 20 || token.length > 300 || /\s/.test(token))) process.exit(5);
process.stdout.write(`${sha}\t${deployRef}\t${token}\t${value.requestedBy}\t${value.requestedAt}`);
NODE
}

read_saved_token() {
  if [[ -f "$SAVED_GITHUB_TOKEN_FILE" ]]; then
    tr -d '\r\n' < "$SAVED_GITHUB_TOKEN_FILE"
  fi
}

current_release_dir() {
  readlink -f "$DEPLOY_ROOT/current" 2>/dev/null || true
}

current_deployed_sha() {
  local release
  release="$(current_release_dir)"
  if [[ -n "$release" && -f "$release/.deployed-sha" ]]; then
    tr -d '[:space:]' < "$release/.deployed-sha"
  else
    printf '%s' "$ZERO_SHA"
  fi
}

resolve_target_sha_after_deploy() {
  local sha=""
  if command -v git >/dev/null 2>&1 && [[ -d "$DEFAULT_CHECKOUT_DIR/.git" ]]; then
    sha="$(git -C "$DEFAULT_CHECKOUT_DIR" rev-parse HEAD 2>/dev/null || true)"
  fi
  if [[ ! "$sha" =~ ^[0-9a-f]{40}$ ]]; then
    sha="$(current_deployed_sha)"
  fi
  local release
  release="$(current_release_dir)"
  if [[ "$sha" =~ ^[0-9a-f]{40}$ && -n "$release" && -d "$release" ]]; then
    printf '%s\n' "$sha" > "$release/.deployed-sha" 2>/dev/null || true
  fi
  printf '%s' "${sha:-$ZERO_SHA}"
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

  REQUEST_SHA="$ZERO_SHA"
  DEPLOY_REF="main"
  INLINE_TOKEN=""
  REQUESTED_BY=""
  REQUESTED_AT=""
  META=""
  if ! META="$(request_meta "$PROCESSING_FILE")"; then
    log "Solicitação inválida descartada."
    write_deploy_status "failed" 100 "Solicitação manual inválida" "$ZERO_SHA"
    write_manual_result "failed" "$ZERO_SHA" "" "" "" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "Solicitação manual inválida" "1" ""
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi
  IFS=$'\t' read -r REQUEST_SHA DEPLOY_REF INLINE_TOKEN REQUESTED_BY REQUESTED_AT <<< "$META"

  TOKEN="$INLINE_TOKEN"
  if [[ -z "$TOKEN" ]]; then TOKEN="$(read_saved_token)"; fi
  if [[ -z "$TOKEN" ]]; then
    log "Token GitHub ausente."
    write_deploy_status "failed" 100 "Token GitHub ausente" "$REQUEST_SHA"
    write_manual_result "failed" "$REQUEST_SHA" "$REQUESTED_BY" "$REQUESTED_AT" "" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "Token GitHub ausente" "1" "$DEPLOY_REF"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  CURRENT_RELEASE="$(current_release_dir)"
  if [[ -z "$CURRENT_RELEASE" || ! -d "$CURRENT_RELEASE" ]]; then
    log "Release atual não pôde ser identificado."
    write_deploy_status "failed" 100 "Release atual não identificado" "$REQUEST_SHA"
    write_manual_result "failed" "$REQUEST_SHA" "$REQUESTED_BY" "$REQUESTED_AT" "" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "Release atual não identificado" "1" "$DEPLOY_REF"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  DEPLOY_SCRIPT="$CURRENT_RELEASE/scripts/vps-autodeploy-master.sh"
  if [[ ! -f "$DEPLOY_SCRIPT" ]]; then
    log "Script mestre de deploy não encontrado no release atual."
    write_deploy_status "failed" 100 "Script mestre de deploy não encontrado" "$REQUEST_SHA"
    write_manual_result "failed" "$REQUEST_SHA" "$REQUESTED_BY" "$REQUESTED_AT" "" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "Script mestre de deploy não encontrado" "1" "$DEPLOY_REF"
    rm -f "$PROCESSING_FILE"
    [[ "$RUN_ONCE" == "1" ]] && exit 1
    continue
  fi

  STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  write_deploy_status "deploying" 5 "Deploy manual solicitado para ${DEPLOY_REF}" "$REQUEST_SHA"
  write_manual_result "running" "$REQUEST_SHA" "$REQUESTED_BY" "$REQUESTED_AT" "$STARTED_AT" "" "Executando script mestre de autodeploy" "" "$DEPLOY_REF"

  log "Iniciando autodeploy manual da ref ${DEPLOY_REF}."
  set +e
  GITHUB_TOKEN="$TOKEN" \
    DEPLOY_REF="$DEPLOY_REF" \
    DEPLOY_INVOCATION="panel-manual" \
    RUN_TESTS="${RUN_TESTS:-0}" \
    SERVICE_NAME="$SERVICE_NAME" \
    HEALTHCHECK_URL="$HEALTHCHECK_URL" \
    bash "$DEPLOY_SCRIPT"
  code=$?
  set -e

  FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  TARGET_SHA="$(resolve_target_sha_after_deploy)"
  if [[ "$code" -eq 0 ]]; then
    write_deploy_status "completed" 100 "Deploy manual concluído" "$TARGET_SHA"
    write_manual_result "completed" "$TARGET_SHA" "$REQUESTED_BY" "$REQUESTED_AT" "$STARTED_AT" "$FINISHED_AT" "Deploy manual validado de ponta a ponta" "0" "$DEPLOY_REF"
    log "Deploy manual concluído para ${DEPLOY_REF} (${TARGET_SHA})."
  else
    write_deploy_status "failed" 100 "Deploy manual falhou" "$REQUEST_SHA"
    write_manual_result "failed" "$REQUEST_SHA" "$REQUESTED_BY" "$REQUESTED_AT" "$STARTED_AT" "$FINISHED_AT" "Deploy manual falhou" "$code" "$DEPLOY_REF"
    log "Deploy manual falhou para ${DEPLOY_REF} com código ${code}."
  fi

  unset TOKEN INLINE_TOKEN GITHUB_TOKEN
  rm -f "$PROCESSING_FILE"
  write_heartbeat
  [[ "$RUN_ONCE" == "1" ]] && exit "$code"
  sleep "$POLL_SECONDS"
done
