#!/usr/bin/env bash
set -Eeuo pipefail

TARGET_SHA="${1:-}"
DEPLOY_ROOT="${2:-}"
ARTIFACT_PATH="${3:-}"
HEALTHCHECK_URL="${4:-http://127.0.0.1:3101/}"
SERVICE_NAME="${SERVICE_NAME:-pagina-lucrativa.service}"
SMOKE_PORT="${SMOKE_PORT:-3199}"
PUBLIC_HEALTHCHECK_URL="${PUBLIC_HEALTHCHECK_URL:-https://ocodigolucrativo.site/}"
PNPM_BIN="${PNPM_BIN:-}"
DEPLOY_INVOCATION="${DEPLOY_INVOCATION:-auto}"

log() { printf '[deploy] %s\n' "$*"; }
fail() { printf '[deploy] ERRO: %s\n' "$*" >&2; exit 1; }

[[ -n "$TARGET_SHA" ]] || fail "Informe o SHA alvo."
[[ "$TARGET_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "SHA alvo inválido."
[[ -n "$DEPLOY_ROOT" && "$DEPLOY_ROOT" = /* ]] || fail "DEPLOY_ROOT deve ser absoluto."
[[ -f "$ARTIFACT_PATH" ]] || fail "Artefato não encontrado: $ARTIFACT_PATH"

STATUS_FILE="${DEPLOY_STATUS_FILE:-$DEPLOY_ROOT/deploy-status.json}"
write_deploy_status() {
  local status="$1"
  local progress="$2"
  local stage="$3"
  local tmp="${STATUS_FILE}.tmp"
  mkdir -p "$(dirname "$STATUS_FILE")"
  printf '{"status":"%s","progress":%s,"stage":"%s","sha":"%s","updatedAt":"%s"}\n' \
    "$status" "$progress" "$stage" "$TARGET_SHA" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp"
  mv -f "$tmp" "$STATUS_FILE"
}

for cmd in tar node curl systemctl readlink ln date sudo flock cp chmod nohup setsid; do
  command -v "$cmd" >/dev/null 2>&1 || fail "$cmd não está disponível."
done

LOCK_FILE="$DEPLOY_ROOT/deploy.lock"
exec 9>"$LOCK_FILE"
log "Aguardando exclusividade do processo de deploy"
flock -w 1200 9 || fail "Outro deploy permaneceu em execução por mais de 20 minutos."

if [[ "$DEPLOY_INVOCATION" == "manual" ]]; then
  CURRENT_SHA_FILE="$DEPLOY_ROOT/current/.deployed-sha"
  [[ -f "$CURRENT_SHA_FILE" ]] || fail "Release atual não possui identificação de SHA."
  CURRENT_DEPLOYED_SHA="$(tr -d '[:space:]' < "$CURRENT_SHA_FILE")"
  [[ "$CURRENT_DEPLOYED_SHA" == "$TARGET_SHA" ]] || fail "A produção mudou enquanto o deploy manual aguardava. Solicite novamente a partir da versão atual."
fi

write_deploy_status "deploying" 5 "Preparando publicação"

# A preparação da VPS deve disponibilizar pnpm 10.4.1 ao usuário de deploy.
# Aceita caminho absoluto via PNPM_BIN para não depender do PATH de uma sessão SSH não interativa.
if [[ -z "$PNPM_BIN" ]]; then
  PNPM_BIN="$(command -v pnpm || true)"
fi
[[ -n "$PNPM_BIN" && -x "$PNPM_BIN" ]] || fail "pnpm não está disponível. Prepare pnpm 10.4.1 na VPS ou defina PNPM_BIN com caminho absoluto executável."
PNPM_VERSION="$($PNPM_BIN --version)"
[[ "$PNPM_VERSION" == "10.4.1" ]] || fail "Versão pnpm incompatível: $PNPM_VERSION (esperada 10.4.1)."
write_deploy_status "deploying" 12 "Ambiente validado"

restart_service() {
  # Requer sudoers NOPASSWD restrito exclusivamente ao restart deste serviço.
  sudo -n /usr/bin/systemctl restart "$SERVICE_NAME"
}

# Falha antes de criar/ativar release se a permissão restrita ainda não estiver pronta.
sudo -n -l /usr/bin/systemctl restart "$SERVICE_NAME" >/dev/null 2>&1 || \
  fail "Permissão sudoers restrita para reiniciar $SERVICE_NAME não está configurada."

RELEASES_DIR="$DEPLOY_ROOT/releases"
CURRENT_LINK="$DEPLOY_ROOT/current"
SHORT_SHA="${TARGET_SHA:0:8}"
RELEASE_NAME="$(date -u +%Y%m%dT%H%M%SZ)-$SHORT_SHA"
NEW_RELEASE="$RELEASES_DIR/$RELEASE_NAME"
PREVIOUS_RELEASE=""
SWITCHED=0

mkdir -p "$RELEASES_DIR"
if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK")"
  [[ -d "$PREVIOUS_RELEASE" ]] || fail "O symlink current aponta para um release inválido."
else
  fail "Symlink current não encontrado em $CURRENT_LINK."
fi

rollback() {
  local code=$?
  trap - ERR INT TERM
  write_deploy_status "failed" 100 "Falha no deploy; versão anterior preservada" || true
  if [[ "$SWITCHED" -eq 1 && -n "$PREVIOUS_RELEASE" ]]; then
    printf '[deploy] Falha após ativação. Restaurando release anterior: %s\n' "$PREVIOUS_RELEASE" >&2
    ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK.rollback"
    mv -Tf "$CURRENT_LINK.rollback" "$CURRENT_LINK"
    restart_service || true
    for _ in $(seq 1 30); do
      curl --fail --silent --show-error --max-time 5 "$HEALTHCHECK_URL" >/dev/null 2>&1 && break
      sleep 2
    done
  fi
  exit "$code"
}
trap rollback ERR INT TERM

write_deploy_status "deploying" 20 "Criando novo release"
log "Criando release $NEW_RELEASE"
mkdir "$NEW_RELEASE"
tar -xzf "$ARTIFACT_PATH" -C "$NEW_RELEASE"
printf '%s\n' "$TARGET_SHA" > "$NEW_RELEASE/.deployed-sha"

cd "$NEW_RELEASE"
[[ -f package.json && -f pnpm-lock.yaml ]] || fail "Artefato não contém package.json/pnpm-lock.yaml."

write_deploy_status "deploying" 35 "Instalando dependências"
log "Instalando dependências do release com pnpm $PNPM_VERSION"
"$PNPM_BIN" install --frozen-lockfile
write_deploy_status "deploying" 55 "Gerando build de produção"
log "Gerando build de produção"
"$PNPM_BIN" build
[[ -f dist/index.js ]] || fail "Build não gerou dist/index.js."

write_deploy_status "deploying" 70 "Validando nova versão"
log "Smoke test isolado na porta $SMOKE_PORT"
SMOKE_LOG="$NEW_RELEASE/.smoke.log"
NODE_ENV=production PORT="$SMOKE_PORT" node dist/index.js >"$SMOKE_LOG" 2>&1 &
SMOKE_PID=$!
cleanup_smoke() { kill "$SMOKE_PID" >/dev/null 2>&1 || true; wait "$SMOKE_PID" >/dev/null 2>&1 || true; }
SMOKE_OK=0
for _ in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 "http://127.0.0.1:$SMOKE_PORT/" >/dev/null 2>&1; then SMOKE_OK=1; break; fi
  if ! kill -0 "$SMOKE_PID" >/dev/null 2>&1; then break; fi
  sleep 2
done
cleanup_smoke
[[ "$SMOKE_OK" -eq 1 ]] || fail "Smoke test do novo release falhou. Consulte $SMOKE_LOG."

write_deploy_status "deploying" 82 "Ativando nova versão"
log "Ativando release de forma atômica"
ln -sfn "$NEW_RELEASE" "$CURRENT_LINK.next"
mv -Tf "$CURRENT_LINK.next" "$CURRENT_LINK"
SWITCHED=1
restart_service

write_deploy_status "deploying" 92 "Validando aplicação publicada"
log "Validando aplicação em $HEALTHCHECK_URL"
HEALTH_OK=0
for _ in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 "$HEALTHCHECK_URL" >/dev/null 2>&1; then HEALTH_OK=1; break; fi
  sleep 2
done
[[ "$HEALTH_OK" -eq 1 ]] || fail "Health check local falhou após ativação."

if [[ -n "$PUBLIC_HEALTHCHECK_URL" ]]; then
  write_deploy_status "deploying" 97 "Confirmando endpoint público"
  log "Validando endpoint público"
  curl --fail --silent --show-error --max-time 15 "$PUBLIC_HEALTHCHECK_URL" >/dev/null
fi

start_manual_deploy_worker() {
  [[ "$DEPLOY_INVOCATION" != "manual" ]] || return 0
  local worker_source="$NEW_RELEASE/scripts/manual-deploy-worker.sh"
  [[ -f "$worker_source" ]] || {
    log "Worker de deploy manual não está presente neste release; autodeploy permanece ativo."
    return 0
  }

  local stable_worker="$DEPLOY_ROOT/manual-deploy-worker.sh"
  local worker_pid_file="$DEPLOY_ROOT/manual-deploy-worker.pid"
  local worker_log="$DEPLOY_ROOT/manual-deploy-worker.log"
  local old_pid=""

  cp "$worker_source" "$stable_worker"
  chmod 750 "$stable_worker"

  if [[ -f "$worker_pid_file" ]]; then
    old_pid="$(tr -dc '0-9' < "$worker_pid_file" || true)"
    if [[ -n "$old_pid" ]] && kill -0 "$old_pid" >/dev/null 2>&1; then
      kill "$old_pid" >/dev/null 2>&1 || true
      for _ in $(seq 1 20); do
        kill -0 "$old_pid" >/dev/null 2>&1 || break
        sleep 0.1
      done
    fi
  fi

  (
    exec 9>&-
    exec nohup setsid env \
      DEPLOY_ROOT="$DEPLOY_ROOT" \
      SERVICE_NAME="$SERVICE_NAME" \
      HEALTHCHECK_URL="$HEALTHCHECK_URL" \
      PUBLIC_HEALTHCHECK_URL="$PUBLIC_HEALTHCHECK_URL" \
      PNPM_BIN="$PNPM_BIN" \
      bash "$stable_worker"
  ) >>"$worker_log" 2>&1 < /dev/null &
  local worker_pid=$!
  printf '%s\n' "$worker_pid" > "$worker_pid_file"
  log "Worker de deploy manual ativo (PID $worker_pid)."
}

trap - ERR INT TERM
SWITCHED=0
rm -f "$ARTIFACT_PATH"
write_deploy_status "completed" 100 "Deploy concluído"
start_manual_deploy_worker
log "Deploy concluído: $TARGET_SHA"
log "Release anterior preservado: $PREVIOUS_RELEASE"
