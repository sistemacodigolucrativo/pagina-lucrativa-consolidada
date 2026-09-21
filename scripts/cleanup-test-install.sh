#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="${APP_NAME:-pagina-lucrativa}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/home/ubuntu/servicos/pagina-lucrativa}"
SERVICE_NAME="${SERVICE_NAME:-pagina-lucrativa.service}"
MYSQL_DATABASE="${MYSQL_DATABASE:-pagina_lucrativa}"
MYSQL_USER="${MYSQL_USER:-pagina_lucrativa}"
DEPLOY_USER="${DEPLOY_USER:-pagina-deploy}"
CONFIRM_FLAG="${1:-}"

EXPECTED_APP_NAME="pagina-lucrativa"
EXPECTED_DEPLOY_ROOT="/home/ubuntu/servicos/pagina-lucrativa"
EXPECTED_SERVICE_NAME="pagina-lucrativa.service"
EXPECTED_MYSQL_DATABASE="pagina_lucrativa"
EXPECTED_MYSQL_USER="pagina_lucrativa"
EXPECTED_DEPLOY_USER="pagina-deploy"

log() { printf '[cleanup-test] %s\n' "$*"; }
fail() { printf '[cleanup-test] ERRO: %s\n' "$*" >&2; exit 1; }

as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  else
    sudo -n "$@"
  fi
}

[[ "${ALLOW_DESTRUCTIVE_TEST_CLEANUP:-}" == "1" ]] || \
  fail "Defina ALLOW_DESTRUCTIVE_TEST_CLEANUP=1 para confirmar que esta VPS e de teste."
[[ "$CONFIRM_FLAG" == "--i-understand-this-is-test-only" ]] || \
  fail "Informe --i-understand-this-is-test-only para executar a limpeza destrutiva de teste."
[[ "$APP_NAME" == "$EXPECTED_APP_NAME" ]] || \
  fail "APP_NAME fora do escopo permitido para cleanup de teste: $APP_NAME"
[[ "$DEPLOY_ROOT" == "$EXPECTED_DEPLOY_ROOT" ]] || \
  fail "DEPLOY_ROOT fora do escopo permitido para cleanup de teste: $DEPLOY_ROOT"
[[ "$SERVICE_NAME" == "$EXPECTED_SERVICE_NAME" ]] || \
  fail "SERVICE_NAME fora do escopo permitido para cleanup de teste: $SERVICE_NAME"
[[ "$MYSQL_DATABASE" == "$EXPECTED_MYSQL_DATABASE" ]] || \
  fail "MYSQL_DATABASE fora do escopo permitido para cleanup de teste: $MYSQL_DATABASE"
[[ "$MYSQL_USER" == "$EXPECTED_MYSQL_USER" ]] || \
  fail "MYSQL_USER fora do escopo permitido para cleanup de teste: $MYSQL_USER"
[[ "$DEPLOY_USER" == "$EXPECTED_DEPLOY_USER" ]] || \
  fail "DEPLOY_USER fora do escopo permitido para cleanup de teste: $DEPLOY_USER"

log "Parando/removendo servico $SERVICE_NAME"
if systemctl list-unit-files "$SERVICE_NAME" >/dev/null 2>&1; then
  as_root systemctl stop "$SERVICE_NAME" >/dev/null 2>&1 || true
  as_root systemctl disable "$SERVICE_NAME" >/dev/null 2>&1 || true
fi
as_root rm -f "/etc/systemd/system/$SERVICE_NAME"
as_root systemctl daemon-reload

log "Removendo configuracao Nginx do projeto"
as_root rm -f "/etc/nginx/sites-enabled/$APP_NAME" "/etc/nginx/sites-available/$APP_NAME"
if command -v nginx >/dev/null 2>&1; then
  as_root nginx -t
  as_root systemctl reload nginx >/dev/null 2>&1 || true
fi

log "Removendo sudoers/autodeploy do projeto"
as_root rm -f "/etc/sudoers.d/$APP_NAME-deploy"
if id "$DEPLOY_USER" >/dev/null 2>&1; then
  as_root userdel -r "$DEPLOY_USER" >/dev/null 2>&1 || true
fi
if getent group "$DEPLOY_USER" >/dev/null 2>&1; then
  as_root groupdel "$DEPLOY_USER" >/dev/null 2>&1 || true
fi

log "Removendo banco e usuario MySQL/MariaDB de teste"
if command -v mysql >/dev/null 2>&1; then
  as_root mysql <<SQL
DROP DATABASE IF EXISTS \`$MYSQL_DATABASE\`;
DROP USER IF EXISTS '$MYSQL_USER'@'localhost';
FLUSH PRIVILEGES;
SQL
fi

log "Removendo diretorio de deploy de teste"
as_root rm -rf "$DEPLOY_ROOT"

log "Limpeza de teste concluida"
