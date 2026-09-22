#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Código Lucrativo — Script mestre de deploy da VPS
#
# Uso padrão na VPS:
#   bash scripts/vps-autodeploy-master.sh
#
# O script pede somente o token do GitHub se GITHUB_TOKEN não estiver definido.
# Configurações opcionais por ambiente, se necessário:
#   DEPLOY_REF=main|nome-da-branch|tag
#   RUN_TESTS=1
#   HEALTHCHECK_URL=http://127.0.0.1:3000/
#   SERVICE_NAME=pagina-lucrativa.service

APP_NAME="${APP_NAME:-pagina-lucrativa}"
REPO_SLUG="${REPO_SLUG:-sistemacodigolucrativo/pagina-lucrativa-consolidada}"
REPO_URL="${REPO_URL:-https://github.com/${REPO_SLUG}.git}"
DEPLOY_REF="${DEPLOY_REF:-main}"
WORKSPACE_ROOT="${WORKSPACE_ROOT:-/home/ubuntu/workspaces}"
CHECKOUT_DIR="${CHECKOUT_DIR:-${WORKSPACE_ROOT}/pagina-lucrativa-consolidada}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/home/ubuntu/servicos/pagina-lucrativa}"
RELEASES_DIR="${RELEASES_DIR:-${DEPLOY_ROOT}/releases}"
SHARED_DIR="${SHARED_DIR:-${DEPLOY_ROOT}/shared}"
CURRENT_LINK="${CURRENT_LINK:-${DEPLOY_ROOT}/current}"
SERVICE_NAME="${SERVICE_NAME:-pagina-lucrativa.service}"
PORT="${PORT:-3000}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:${PORT}/}"
BACKUP_DIR="${BACKUP_DIR:-${DEPLOY_ROOT}/backups}"
KEEP_RELEASES="${KEEP_RELEASES:-6}"
RUN_TESTS="${RUN_TESTS:-0}"
RUN_CHECK="${RUN_CHECK:-1}"
RUN_BUILD="${RUN_BUILD:-1}"
BACKUP_DATABASE="${BACKUP_DATABASE:-1}"
RUN_DRIZZLE_MIGRATIONS="${RUN_DRIZZLE_MIGRATIONS:-1}"
RUN_DEPLOY_HOOKS="${RUN_DEPLOY_HOOKS:-1}"
AUTO_RUN_KNOWN_SYNC_SCRIPTS="${AUTO_RUN_KNOWN_SYNC_SCRIPTS:-1}"
LOCK_FILE="${LOCK_FILE:-/tmp/${APP_NAME}-autodeploy.lock}"

ASKPASS_FILE=""
MYSQL_DEFAULTS_FILE=""
PREVIOUS_RELEASE=""
NEW_RELEASE_DIR=""
COMMIT_SHA=""
SHORT_SHA=""
RELEASE_ID=""

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
warn() { printf '[%s] AVISO: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2; }
die() { printf '[%s] ERRO: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2; exit 1; }

cleanup() {
  if [[ -n "${ASKPASS_FILE:-}" && -f "$ASKPASS_FILE" ]]; then rm -f "$ASKPASS_FILE"; fi
  if [[ -n "${MYSQL_DEFAULTS_FILE:-}" && -f "$MYSQL_DEFAULTS_FILE" ]]; then rm -f "$MYSQL_DEFAULTS_FILE"; fi
  unset GITHUB_TOKEN || true
}
trap cleanup EXIT

on_error() {
  local exit_code=$?
  warn "Falha na linha ${BASH_LINENO[0]} ao executar: ${BASH_COMMAND}"
  warn "Código de saída: ${exit_code}"
  if [[ -n "${PREVIOUS_RELEASE:-}" && -e "$PREVIOUS_RELEASE" && -n "${NEW_RELEASE_DIR:-}" ]]; then
    warn "A ativação pode ter falhado. Se o serviço estiver instável, faça rollback para: ${PREVIOUS_RELEASE}"
  fi
  exit "$exit_code"
}
trap on_error ERR

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Comando obrigatório não encontrado: $1"
}

sql_literal() {
  local value="$1"
  value=${value//\\/\\\\}
  value=${value//\'/\'\'}
  printf "'%s'" "$value"
}

preflight() {
  log "Iniciando pré-verificação do ambiente."
  need_cmd git
  need_cmd rsync
  need_cmd node
  need_cmd pnpm
  need_cmd flock
  need_cmd date
  need_cmd find
  need_cmd awk
  need_cmd sed
  need_cmd sha256sum
  if [[ "$BACKUP_DATABASE" == "1" ]]; then need_cmd mysqldump; fi
  if [[ "$RUN_DEPLOY_HOOKS" == "1" ]]; then need_cmd mysql; fi
  if [[ "$RUN_DRIZZLE_MIGRATIONS" == "1" ]]; then need_cmd mysql; fi
  if ! command -v curl >/dev/null 2>&1; then warn "curl não encontrado. Healthcheck HTTP será ignorado."; fi
  mkdir -p "$WORKSPACE_ROOT" "$DEPLOY_ROOT" "$RELEASES_DIR" "$SHARED_DIR" "$BACKUP_DIR"
}

setup_git_auth() {
  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    printf 'Informe o token do GitHub com acesso de leitura ao repositório privado: ' >&2
    read -r -s GITHUB_TOKEN
    printf '\n' >&2
  fi
  [[ -n "${GITHUB_TOKEN:-}" ]] || die "Token do GitHub não informado."

  ASKPASS_FILE=$(mktemp)
  cat > "$ASKPASS_FILE" <<'EOF'
#!/usr/bin/env bash
case "$1" in
  *Username*) printf '%s\n' 'x-access-token' ;;
  *Password*) printf '%s\n' "${GITHUB_TOKEN:?}" ;;
  *) printf '%s\n' "${GITHUB_TOKEN:?}" ;;
esac
EOF
  chmod 700 "$ASKPASS_FILE"
  export GIT_ASKPASS="$ASKPASS_FILE"
  export GIT_TERMINAL_PROMPT=0
}

prepare_checkout() {
  log "Preparando checkout do repositório ${REPO_SLUG}."
  if [[ ! -d "$CHECKOUT_DIR/.git" ]]; then
    rm -rf "$CHECKOUT_DIR"
    git clone "$REPO_URL" "$CHECKOUT_DIR"
  fi

  cd "$CHECKOUT_DIR"
  git remote set-url origin "$REPO_URL"
  git fetch --prune origin "$DEPLOY_REF"
  git checkout -B "deploy/${DEPLOY_REF//\//-}" FETCH_HEAD
  git reset --hard FETCH_HEAD
  git clean -fdx

  COMMIT_SHA=$(git rev-parse HEAD)
  SHORT_SHA=$(git rev-parse --short=8 HEAD)
  RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)-${SHORT_SHA}"
  NEW_RELEASE_DIR="${RELEASES_DIR}/${RELEASE_ID}"

  log "Commit selecionado: ${COMMIT_SHA}"
  log "Release: ${NEW_RELEASE_DIR}"
}

create_release_copy() {
  [[ -n "$NEW_RELEASE_DIR" ]] || die "Diretório da nova release não definido."
  [[ ! -e "$NEW_RELEASE_DIR" ]] || die "Release já existe: $NEW_RELEASE_DIR"

  mkdir -p "$NEW_RELEASE_DIR"
  log "Copiando arquivos com rsync."
  rsync -a --delete \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude '.cache' \
    --exclude 'coverage' \
    "$CHECKOUT_DIR"/ "$NEW_RELEASE_DIR"/

  if [[ -f "$SHARED_DIR/.env" ]]; then
    ln -sfn "$SHARED_DIR/.env" "$NEW_RELEASE_DIR/.env"
    log "Arquivo .env vinculado de ${SHARED_DIR}/.env."
  elif [[ -L "$CURRENT_LINK" && -f "$CURRENT_LINK/.env" ]]; then
    cp -a "$CURRENT_LINK/.env" "$NEW_RELEASE_DIR/.env"
    warn "Arquivo .env copiado da release atual. Recomenda-se manter ${SHARED_DIR}/.env."
  elif [[ -f "$CHECKOUT_DIR/.env" ]]; then
    cp -a "$CHECKOUT_DIR/.env" "$NEW_RELEASE_DIR/.env"
    warn "Arquivo .env copiado do checkout. Confirme se não há segredos versionados indevidamente."
  else
    warn "Nenhum .env encontrado. O build pode funcionar, mas migrações/produção podem falhar."
  fi
}

install_and_validate() {
  cd "$NEW_RELEASE_DIR"
  log "Instalando dependências."
  corepack enable >/dev/null 2>&1 || true
  pnpm install --frozen-lockfile

  if [[ "$RUN_CHECK" == "1" ]]; then
    log "Executando pnpm check."
    pnpm check
  fi

  if [[ "$RUN_TESTS" == "1" ]]; then
    log "Executando pnpm test."
    pnpm test
  else
    log "Testes automáticos ignorados. Para ativar: RUN_TESTS=1."
  fi

  if [[ "$RUN_BUILD" == "1" ]]; then
    log "Executando pnpm build."
    pnpm build
  fi
}

export_db_vars_from_env() {
  cd "$NEW_RELEASE_DIR"
  eval "$(node --input-type=module <<'NODE'
import 'dotenv/config';
import { existsSync } from 'node:fs';
const databaseUrl = process.env.DATABASE_URL || process.env.REMOTE_DATABASE_URL || '';
const socketPath = process.env.DB_SOCKET_PATH || '/run/mysqld/mysqld.sock';
function q(value) { return `'${String(value ?? '').replace(/'/g, `'\\''`)}'`; }
if (databaseUrl) {
  const url = new URL(databaseUrl);
  console.log('export DB_CONNECTION_MODE=url');
  console.log(`export DB_HOST=${q(url.hostname)}`);
  console.log(`export DB_PORT=${q(url.port || '3306')}`);
  console.log(`export DB_USER=${q(decodeURIComponent(url.username))}`);
  console.log(`export DB_PASS=${q(decodeURIComponent(url.password))}`);
  console.log(`export DB_NAME=${q(url.pathname.replace(/^\//, ''))}`);
} else if (existsSync(socketPath)) {
  console.log('export DB_CONNECTION_MODE=socket');
  console.log(`export DB_SOCKET_PATH=${q(socketPath)}`);
  console.log(`export DB_USER=${q(process.env.DB_SOCKET_USER || 'ubuntu')}`);
  console.log(`export DB_NAME=${q(process.env.DB_SOCKET_DATABASE || 'pagina_lucrativa')}`);
  console.log(`export DB_PASS=${q(process.env.DB_SOCKET_PASSWORD || '')}`);
} else {
  console.error('DATABASE_URL/REMOTE_DATABASE_URL ausente e socket local não encontrado.');
  process.exit(1);
}
NODE
)"

  [[ -n "${DB_NAME:-}" ]] || die "Nome do banco não detectado."
}

create_mysql_defaults_file() {
  export_db_vars_from_env
  MYSQL_DEFAULTS_FILE=$(mktemp)
  chmod 600 "$MYSQL_DEFAULTS_FILE"
  {
    printf '[client]\n'
    if [[ "${DB_CONNECTION_MODE:-}" == "url" ]]; then
      printf 'host=%s\n' "$DB_HOST"
      printf 'port=%s\n' "$DB_PORT"
    else
      printf 'socket=%s\n' "$DB_SOCKET_PATH"
    fi
    printf 'user=%s\n' "$DB_USER"
    if [[ -n "${DB_PASS:-}" ]]; then printf 'password=%s\n' "$DB_PASS"; fi
    printf 'default-character-set=utf8mb4\n'
  } > "$MYSQL_DEFAULTS_FILE"
}

mysql_exec() {
  [[ -n "${MYSQL_DEFAULTS_FILE:-}" && -f "$MYSQL_DEFAULTS_FILE" ]] || create_mysql_defaults_file
  mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" --database="$DB_NAME" --batch --raw -e "$1"
}

mysql_run_file() {
  [[ -n "${MYSQL_DEFAULTS_FILE:-}" && -f "$MYSQL_DEFAULTS_FILE" ]] || create_mysql_defaults_file
  mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" --database="$DB_NAME" < "$1"
}

backup_database() {
  [[ "$BACKUP_DATABASE" == "1" ]] || { log "Backup do banco ignorado por BACKUP_DATABASE=0."; return; }
  create_mysql_defaults_file
  local backup_file="${BACKUP_DIR}/${APP_NAME}_${RELEASE_ID}_before.sql"
  log "Gerando backup lógico do banco em: ${backup_file}"
  mysqldump --defaults-extra-file="$MYSQL_DEFAULTS_FILE" \
    --single-transaction \
    --routines \
    --triggers \
    --no-tablespaces \
    "$DB_NAME" > "$backup_file"
  test -s "$backup_file" || die "Backup vazio ou não criado: $backup_file"
  log "Backup criado: $(ls -lh "$backup_file" | awk '{print $5, $9}')"
}

run_drizzle_migrations() {
  [[ "$RUN_DRIZZLE_MIGRATIONS" == "1" ]] || { log "Migrações Drizzle ignoradas."; return; }
  cd "$NEW_RELEASE_DIR"
  [[ -f drizzle.config.ts ]] || { warn "drizzle.config.ts não encontrado. Migrações Drizzle ignoradas."; return; }
  [[ -f .env ]] && set -a && source .env && set +a
  log "Aplicando migrações versionadas do Drizzle."
  pnpm exec drizzle-kit migrate
}

ensure_hook_table() {
  mysql_exec "CREATE TABLE IF NOT EXISTS deployHookRuns (id INT AUTO_INCREMENT PRIMARY KEY, hookKey VARCHAR(512) NOT NULL UNIQUE, hookSha VARCHAR(64) NOT NULL, executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;" >/dev/null
}

hook_has_run() {
  local key="$1"
  local qkey
  qkey=$(sql_literal "$key")
  local total
  total=$(mysql_exec "SELECT COUNT(*) FROM deployHookRuns WHERE hookKey = ${qkey};" | tail -n 1 | tr -d '\r')
  [[ "${total:-0}" != "0" ]]
}

record_hook_run() {
  local key="$1"
  local sha="$2"
  local qkey qsha
  qkey=$(sql_literal "$key")
  qsha=$(sql_literal "$sha")
  mysql_exec "INSERT IGNORE INTO deployHookRuns (hookKey, hookSha) VALUES (${qkey}, ${qsha});" >/dev/null
}

run_one_hook_once() {
  local hook="$1"
  local key="${hook#${NEW_RELEASE_DIR}/}"
  local sha
  sha=$(sha256sum "$hook" | awk '{print $1}')

  if hook_has_run "$key"; then
    log "Hook já executado, ignorando: ${key}"
    return
  fi

  log "Executando hook versionado: ${key}"
  case "$hook" in
    *.sql) mysql_run_file "$hook" ;;
    *.sh) bash "$hook" ;;
    *.mjs) node "$hook" --apply ;;
    *.js) node "$hook" --apply ;;
    *) warn "Tipo de hook não suportado: ${key}"; return ;;
  esac
  record_hook_run "$key" "$sha"
}

run_deploy_hooks() {
  [[ "$RUN_DEPLOY_HOOKS" == "1" ]] || { log "Hooks de deploy ignorados."; return; }
  create_mysql_defaults_file
  ensure_hook_table

  local dirs=("deploy/pre-activate" "deploy/post-migrate" "scripts/deploy-hooks")
  local found=0
  for dir in "${dirs[@]}"; do
    [[ -d "$NEW_RELEASE_DIR/$dir" ]] || continue
    while IFS= read -r hook; do
      found=1
      run_one_hook_once "$hook"
    done < <(find "$NEW_RELEASE_DIR/$dir" -maxdepth 1 -type f \( -name '*.sql' -o -name '*.sh' -o -name '*.mjs' -o -name '*.js' \) | sort)
  done
  [[ "$found" == "1" ]] || log "Nenhum hook versionado encontrado."
}

run_known_sync_scripts() {
  [[ "$AUTO_RUN_KNOWN_SYNC_SCRIPTS" == "1" ]] || { log "Sync scripts conhecidos ignorados."; return; }
  cd "$NEW_RELEASE_DIR"
  local scripts=(
    "scripts/sync-public-toast-content.mjs"
    "scripts/sync-packaged-content.mjs"
  )
  for script in "${scripts[@]}"; do
    [[ -f "$script" ]] || continue
    log "Executando dry-run de ${script}."
    node "$script"
    log "Aplicando ${script} --apply."
    node "$script" --apply
  done
}

restart_service() {
  if systemctl list-unit-files "$SERVICE_NAME" >/dev/null 2>&1 || systemctl status "$SERVICE_NAME" >/dev/null 2>&1; then
    log "Reiniciando systemd service: ${SERVICE_NAME}"
    sudo systemctl restart "$SERVICE_NAME"
    sudo systemctl status "$SERVICE_NAME" --no-pager || true
    return
  fi

  if command -v pm2 >/dev/null 2>&1 && pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    log "Reiniciando PM2 process: ${APP_NAME}"
    pm2 restart "$APP_NAME"
    pm2 status
    return
  fi

  die "Não consegui localizar systemd service ${SERVICE_NAME} nem PM2 process ${APP_NAME}."
}

healthcheck() {
  if ! command -v curl >/dev/null 2>&1; then
    warn "curl ausente; healthcheck ignorado."
    return
  fi
  log "Executando healthcheck: ${HEALTHCHECK_URL}"
  local attempts=10
  local i
  for i in $(seq 1 "$attempts"); do
    if curl -fsS --max-time 8 "$HEALTHCHECK_URL" >/dev/null; then
      log "Healthcheck OK."
      return
    fi
    sleep 3
  done
  return 1
}

activate_release() {
  PREVIOUS_RELEASE=""
  if [[ -L "$CURRENT_LINK" ]]; then PREVIOUS_RELEASE=$(readlink -f "$CURRENT_LINK" || true); fi

  log "Ativando release com symlink atômico."
  ln -sfn "$NEW_RELEASE_DIR" "${CURRENT_LINK}.next"
  mv -Tf "${CURRENT_LINK}.next" "$CURRENT_LINK"

  restart_service

  if ! healthcheck; then
    warn "Healthcheck falhou após ativação. Iniciando rollback de código."
    if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
      ln -sfn "$PREVIOUS_RELEASE" "${CURRENT_LINK}.rollback"
      mv -Tf "${CURRENT_LINK}.rollback" "$CURRENT_LINK"
      restart_service
      die "Deploy revertido para release anterior: ${PREVIOUS_RELEASE}. Migrações de banco não são revertidas automaticamente."
    fi
    die "Healthcheck falhou e não há release anterior para rollback."
  fi
}

prune_old_releases() {
  [[ "$KEEP_RELEASES" =~ ^[0-9]+$ ]] || { warn "KEEP_RELEASES inválido: $KEEP_RELEASES"; return; }
  [[ "$KEEP_RELEASES" -gt 0 ]] || return
  log "Mantendo as ${KEEP_RELEASES} releases mais recentes."
  find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d | sort -r | tail -n +$((KEEP_RELEASES + 1)) | while IFS= read -r old; do
    [[ "$old" == "$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)" ]] && continue
    rm -rf "$old"
    log "Release antiga removida: $old"
  done
}

print_summary() {
  log "Deploy finalizado."
  printf '\nResumo:\n'
  printf '  App: %s\n' "$APP_NAME"
  printf '  Repo: %s\n' "$REPO_SLUG"
  printf '  Ref: %s\n' "$DEPLOY_REF"
  printf '  Commit: %s\n' "$COMMIT_SHA"
  printf '  Release: %s\n' "$NEW_RELEASE_DIR"
  printf '  Current: %s -> %s\n' "$CURRENT_LINK" "$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)"
  printf '  Service: %s\n' "$SERVICE_NAME"
}

main() {
  exec 9>"$LOCK_FILE"
  flock -n 9 || die "Outro deploy já está em execução. Lock: $LOCK_FILE"

  preflight
  setup_git_auth
  prepare_checkout
  create_release_copy
  install_and_validate
  backup_database
  run_drizzle_migrations
  run_deploy_hooks
  run_known_sync_scripts
  activate_release
  prune_old_releases
  print_summary
}

main "$@"
