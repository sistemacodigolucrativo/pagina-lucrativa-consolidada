#!/usr/bin/env bash

set -Eeuo pipefail

# Replit-compatible workspace bootstrapper.
#
# Usage:
#   bash scripts/prepare-workspace.sh
#
# Optional environment variables:
#   REPO_URL       Git repository URL (defaults to the project repository)
#   APP_DIR        Destination directory (defaults to ./pagina-lucrativa-consolidada)
#   BRANCH         Branch to clone/pull (defaults to the repository default branch)
#   PNPM_VERSION   pnpm version used by Corepack (defaults to the package manager version)
#   PORT           Preview port (defaults to 5000)
#   DEMO_PREVIEW   Use the no-database demo mode (defaults to 1)
#   RUN_CHECK      Run pnpm check after installing (defaults to 1)
#   START_PREVIEW  Start the development server after setup (defaults to 1)

REPO_URL="${REPO_URL:-https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada.git}"
APP_DIR="${APP_DIR:-pagina-lucrativa-consolidada}"
BRANCH="${BRANCH:-}"
PNPM_VERSION="${PNPM_VERSION:-10.4.1}"
PORT="${PORT:-5000}"
DEMO_PREVIEW="${DEMO_PREVIEW:-1}"
RUN_CHECK="${RUN_CHECK:-1}"
START_PREVIEW="${START_PREVIEW:-1}"

log() {
  printf '\n[workspace-setup] %s\n' "$*"
}

fail() {
  printf '[workspace-setup] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatório não encontrado: $1"
}

resolve_app_dir() {
  if [[ "$APP_DIR" = /* ]]; then
    printf '%s' "$APP_DIR"
  else
    printf '%s/%s' "$PWD" "$APP_DIR"
  fi
}

APP_PATH="$(resolve_app_dir)"

require_command git

if [[ -e "$APP_PATH" && ! -d "$APP_PATH/.git" ]]; then
  fail "O destino já existe, mas não é um repositório Git: ${APP_PATH}"
fi

if [[ -d "$APP_PATH/.git" ]]; then
  log "Repositório existente encontrado em ${APP_PATH}"
  git -C "$APP_PATH" fetch --prune origin

  if [[ -n "$BRANCH" ]]; then
    git -C "$APP_PATH" checkout "$BRANCH"
    git -C "$APP_PATH" pull --ff-only origin "$BRANCH"
  else
    git -C "$APP_PATH" pull --ff-only
  fi
else
  log "Clonando ${REPO_URL}"
  if [[ -n "$BRANCH" ]]; then
    git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$APP_PATH"
  else
    git clone "$REPO_URL" "$APP_PATH"
  fi
fi

cd "$APP_PATH"

if ! command -v node >/dev/null 2>&1; then
  fail "Node.js não está disponível. Configure o módulo Node.js 20 no workspace antes de executar este script."
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  fail "Node.js 20 ou superior é necessário; encontrado Node.js ${NODE_MAJOR}."
fi

if ! command -v pnpm >/dev/null 2>&1; then
  require_command corepack
  log "Ativando pnpm ${PNPM_VERSION} via Corepack"
  corepack enable
  corepack prepare "pnpm@${PNPM_VERSION}" --activate
fi

PNPM_MAJOR="$(pnpm --version | cut -d. -f1)"
if [[ "$PNPM_MAJOR" -lt 10 ]]; then
  fail "pnpm 10 ou superior é necessário; encontrado pnpm $(pnpm --version)."
fi

[[ -f package.json ]] || fail "package.json não foi encontrado após a clonagem."
[[ -f pnpm-lock.yaml ]] || fail "pnpm-lock.yaml não foi encontrado; a instalação reproduzível não pode continuar."

log "Instalando dependências do projeto pelo lockfile"
pnpm install --frozen-lockfile

if [[ "$RUN_CHECK" == "1" ]]; then
  log "Executando a checagem TypeScript"
  pnpm check
fi

log "Workspace preparado em ${APP_PATH}"
log "MySQL não é instalado localmente: o modo demo usa DEMO_PREVIEW=1 sem banco."
log "Para o modo real, configure DATABASE_URL e os demais segredos no ambiente do Replit."

if [[ "$START_PREVIEW" == "1" ]]; then
  log "Iniciando preview na porta ${PORT}"
  exec env DEMO_PREVIEW="$DEMO_PREVIEW" PORT="$PORT" pnpm dev
fi

log "Configuração concluída sem iniciar o servidor."