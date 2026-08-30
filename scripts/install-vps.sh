#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="${APP_NAME:-pagina-lucrativa}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/home/ubuntu/servicos/pagina-lucrativa}"
SERVICE_NAME="${SERVICE_NAME:-pagina-lucrativa.service}"
SERVICE_USER="${SERVICE_USER:-ubuntu}"
SERVICE_GROUP="${SERVICE_GROUP:-$SERVICE_USER}"
PORT="${PORT:-3101}"
HOST="${HOST:-127.0.0.1}"
DOMAIN="${DOMAIN:-}"
ENABLE_NGINX="${ENABLE_NGINX:-1}"
ENABLE_SSL="${ENABLE_SSL:-0}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"
PNPM_VERSION="${PNPM_VERSION:-10.4.1}"
RUN_TESTS="${RUN_TESTS:-0}"
RUN_DB_PUSH="${RUN_DB_PUSH:-1}"
MYSQL_DATABASE="${MYSQL_DATABASE:-pagina_lucrativa}"
MYSQL_USER="${MYSQL_USER:-pagina_lucrativa}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
JWT_SECRET="${JWT_SECRET:-}"
VITE_APP_ID="${VITE_APP_ID:-pagina-lucrativa}"
OWNER_OPEN_ID="${OWNER_OPEN_ID:-owner}"
LOCAL_STORAGE_DIR="${LOCAL_STORAGE_DIR:-$DEPLOY_ROOT/storage}"
PUBLIC_HEALTHCHECK_URL="${PUBLIC_HEALTHCHECK_URL:-}"
ENABLE_AUTODEPLOY="${ENABLE_AUTODEPLOY:-1}"
DEPLOY_USER="${DEPLOY_USER:-pagina-deploy}"
DEPLOY_PUBLIC_KEY="${DEPLOY_PUBLIC_KEY:-no-agent-forwarding,no-port-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIZYhyaX0ZgkB7QGMJOY00J6wKQkoGT+X8kGvKWxqJyg github-actions-pagina-lucrativa}"
PNPM_BIN_FOR_DEPLOY="${PNPM_BIN_FOR_DEPLOY:-}"

RELEASES_DIR="$DEPLOY_ROOT/releases"
CURRENT_LINK="$DEPLOY_ROOT/current"
ENV_FILE="$DEPLOY_ROOT/.env"

log() { printf '[install] %s\n' "$*"; }
fail() { printf '[install] ERRO: %s\n' "$*" >&2; exit 1; }

as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  else
    sudo -n "$@"
  fi
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 nao encontrado."
}

random_secret() {
  openssl rand -hex 32
}

sql_escape() {
  printf '%s' "$1" | sed "s/'/''/g"
}

require_clone_root() {
  [[ -f package.json && -f pnpm-lock.yaml && -d server && -d client ]] || \
    fail "Execute este instalador na raiz do clone do Pagina Lucrativa."
}

install_system_packages() {
  log "Validando pacotes do sistema"
  need_cmd sudo
  as_root apt-get update

  local packages=(ca-certificates curl git openssl tar build-essential nginx)
  if command -v mysql >/dev/null 2>&1 || command -v mariadb >/dev/null 2>&1; then
    log "Cliente de banco ja existe; preservando variante instalada."
  else
    packages+=(mariadb-server)
  fi

  as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y "${packages[@]}"

  if [[ "$ENABLE_SSL" == "1" ]]; then
    as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx
  fi
}

install_node_and_pnpm() {
  log "Validando Node.js 22 e pnpm $PNPM_VERSION"
  if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" != "22" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | as_root bash -
    as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
  fi

  as_root corepack enable
  as_root corepack prepare "pnpm@$PNPM_VERSION" --activate
  as_root corepack install -g "pnpm@$PNPM_VERSION"

  local corepack_pnpm
  corepack_pnpm="$(command -v pnpm || true)"
  [[ -n "$corepack_pnpm" ]] || fail "pnpm nao ficou disponivel apos corepack."
  [[ "$("$corepack_pnpm" --version)" == "$PNPM_VERSION" ]] || \
    fail "pnpm em versao inesperada: $("$corepack_pnpm" --version). Esperada: $PNPM_VERSION."
}

prepare_database_service() {
  log "Validando servico de banco"
  if systemctl list-unit-files mysql.service >/dev/null 2>&1; then
    as_root systemctl enable --now mysql
  elif systemctl list-unit-files mariadb.service >/dev/null 2>&1; then
    as_root systemctl enable --now mariadb
  else
    as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server
    as_root systemctl enable --now mariadb
  fi
  command -v mysql >/dev/null 2>&1 || fail "Cliente mysql/mariadb nao esta disponivel."
}

prepare_directories() {
  log "Preparando diretorios persistentes"
  as_root install -d -m 755 -o "$SERVICE_USER" -g "$SERVICE_GROUP" "$DEPLOY_ROOT"
  as_root install -d -m 755 -o "$SERVICE_USER" -g "$SERVICE_GROUP" "$RELEASES_DIR"
  as_root install -d -m 750 -o "$SERVICE_USER" -g "$SERVICE_GROUP" "$LOCAL_STORAGE_DIR"
}

prepare_env() {
  log "Validando arquivo de ambiente"
  if [[ -f "$ENV_FILE" ]]; then
    log ".env existente preservado: $ENV_FILE"
    return
  fi

  [[ -n "$MYSQL_PASSWORD" ]] || MYSQL_PASSWORD="$(random_secret)"
  [[ -n "$JWT_SECRET" ]] || JWT_SECRET="$(random_secret)"

  umask 077
  {
    printf 'NODE_ENV=production\n'
    printf 'PORT=%s\n' "$PORT"
    printf 'DATABASE_URL=mysql://%s:%s@127.0.0.1:3306/%s\n' "$MYSQL_USER" "$MYSQL_PASSWORD" "$MYSQL_DATABASE"
    printf 'JWT_SECRET=%s\n' "$JWT_SECRET"
    printf 'VITE_APP_ID=%s\n' "$VITE_APP_ID"
    printf 'OWNER_OPEN_ID=%s\n' "$OWNER_OPEN_ID"
    printf 'OAUTH_SERVER_URL=\n'
    printf 'VITE_OAUTH_PORTAL_URL=\n'
    printf 'BUILT_IN_FORGE_API_URL=\n'
    printf 'BUILT_IN_FORGE_API_KEY=\n'
    printf 'VITE_FRONTEND_FORGE_API_URL=\n'
    printf 'VITE_FRONTEND_FORGE_API_KEY=\n'
    printf 'LOCAL_STORAGE_DIR=%s\n' "$LOCAL_STORAGE_DIR"
  } > "$ENV_FILE"
  as_root chown "$SERVICE_USER:$SERVICE_GROUP" "$ENV_FILE"
  as_root chmod 600 "$ENV_FILE"
}

prepare_database() {
  log "Preparando banco e usuario da aplicacao"
  if [[ -z "$MYSQL_PASSWORD" && -f "$ENV_FILE" ]]; then
    MYSQL_PASSWORD="$(sed -n 's|^DATABASE_URL=mysql://[^:]*:\([^@]*\)@.*$|\1|p' "$ENV_FILE" | head -1)"
  fi
  [[ -n "$MYSQL_PASSWORD" ]] || fail "MYSQL_PASSWORD nao encontrado."

  local db user pass
  db="$(sql_escape "$MYSQL_DATABASE")"
  user="$(sql_escape "$MYSQL_USER")"
  pass="$(sql_escape "$MYSQL_PASSWORD")"

  if [[ -n "$MYSQL_ROOT_PASSWORD" ]]; then
    mysql -uroot "-p$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`$db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$user'@'localhost' IDENTIFIED BY '$pass';
ALTER USER '$user'@'localhost' IDENTIFIED BY '$pass';
GRANT ALL PRIVILEGES ON \`$db\`.* TO '$user'@'localhost';
FLUSH PRIVILEGES;
SQL
  else
    as_root mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`$db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$user'@'localhost' IDENTIFIED BY '$pass';
ALTER USER '$user'@'localhost' IDENTIFIED BY '$pass';
GRANT ALL PRIVILEGES ON \`$db\`.* TO '$user'@'localhost';
FLUSH PRIVILEGES;
SQL
  fi
}

install_release() {
  log "Instalando release local"
  local sha release_name release_dir pnpm_bin
  sha="$(git rev-parse HEAD)"
  release_name="$(date -u +%Y%m%dT%H%M%SZ)-${sha:0:8}"
  release_dir="$RELEASES_DIR/$release_name"
  pnpm_bin="$(command -v pnpm)"

  mkdir -p "$release_dir"
  tar \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.env' \
    --exclude='.env.*' \
    -cf - . | tar -xf - -C "$release_dir"
  printf '%s\n' "$sha" > "$release_dir/.deployed-sha"
  as_root chown -R "$SERVICE_USER:$SERVICE_GROUP" "$release_dir"

  as_root sudo -u "$SERVICE_USER" env HOME="/home/$SERVICE_USER" bash -lc "cd '$release_dir' && '$pnpm_bin' install --frozen-lockfile"

  if [[ "$RUN_DB_PUSH" == "1" ]]; then
    as_root sudo -u "$SERVICE_USER" env HOME="/home/$SERVICE_USER" bash -lc "set -a; . '$ENV_FILE'; set +a; cd '$release_dir' && '$pnpm_bin' exec drizzle-kit migrate"
  fi

  as_root sudo -u "$SERVICE_USER" env HOME="/home/$SERVICE_USER" bash -lc "cd '$release_dir' && '$pnpm_bin' check"
  if [[ "$RUN_TESTS" == "1" ]]; then
    as_root sudo -u "$SERVICE_USER" env HOME="/home/$SERVICE_USER" bash -lc "cd '$release_dir' && '$pnpm_bin' test"
  fi
  as_root sudo -u "$SERVICE_USER" env HOME="/home/$SERVICE_USER" bash -lc "cd '$release_dir' && '$pnpm_bin' build"
  [[ -f "$release_dir/dist/index.js" ]] || fail "Build nao gerou dist/index.js."

  ln -sfn "$release_dir" "$CURRENT_LINK.next"
  mv -T "$CURRENT_LINK.next" "$CURRENT_LINK"
  as_root chown -h "$SERVICE_USER:$SERVICE_GROUP" "$CURRENT_LINK"
}

configure_systemd() {
  log "Configurando systemd"
  local tmp
  tmp="$(mktemp)"
  cat > "$tmp" <<EOF
[Unit]
Description=Pagina Lucrativa
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_GROUP
WorkingDirectory=$CURRENT_LINK
EnvironmentFile=$ENV_FILE
Environment=NODE_ENV=production
Environment=PORT=$PORT
ExecStart=/usr/bin/node $CURRENT_LINK/dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
  as_root install -m 644 -o root -g root "$tmp" "/etc/systemd/system/$SERVICE_NAME"
  as_root systemctl daemon-reload
  as_root systemctl enable "$SERVICE_NAME"
  as_root systemctl restart "$SERVICE_NAME"
}

configure_autodeploy_contract() {
  [[ "$ENABLE_AUTODEPLOY" == "1" ]] || return
  log "Preparando contrato do autodeploy existente"

  if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
    as_root useradd --create-home --shell /bin/bash "$DEPLOY_USER"
  fi

  as_root usermod -a -G "$DEPLOY_USER" "$SERVICE_USER"
  as_root usermod -a -G "$SERVICE_GROUP" "$DEPLOY_USER"
  as_root chown "$SERVICE_USER:$DEPLOY_USER" "$DEPLOY_ROOT"
  as_root chown "$SERVICE_USER:$DEPLOY_USER" "$RELEASES_DIR"
  as_root chmod 2775 "$DEPLOY_ROOT" "$RELEASES_DIR"
  as_root chown -h "$SERVICE_USER:$DEPLOY_USER" "$CURRENT_LINK"
  as_root chown "$SERVICE_USER:$DEPLOY_USER" "$ENV_FILE"
  as_root chmod 640 "$ENV_FILE"

  local status_file="$DEPLOY_ROOT/deploy-status.json"
  if [[ ! -f "$status_file" ]]; then
    printf '{"status":"completed","progress":100,"stage":"Instalacao base validada","updatedAt":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$status_file"
  fi
  as_root chown "$DEPLOY_USER:$DEPLOY_USER" "$status_file"
  as_root chmod 664 "$status_file"

  local ssh_dir="/home/$DEPLOY_USER/.ssh"
  as_root install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$ssh_dir"
  as_root touch "$ssh_dir/authorized_keys"
  as_root chown "$DEPLOY_USER:$DEPLOY_USER" "$ssh_dir/authorized_keys"
  as_root chmod 600 "$ssh_dir/authorized_keys"

  if [[ -n "$DEPLOY_PUBLIC_KEY" ]]; then
    if ! as_root grep -qxF "$DEPLOY_PUBLIC_KEY" "$ssh_dir/authorized_keys"; then
      printf '%s\n' "$DEPLOY_PUBLIC_KEY" | as_root tee -a "$ssh_dir/authorized_keys" >/dev/null
    fi
  else
    log "DEPLOY_PUBLIC_KEY nao informado; authorized_keys foi preparado, mas a chave publica existente do GitHub Actions ainda precisa ser adicionada."
  fi

  local sudoers_tmp
  sudoers_tmp="$(mktemp)"
  printf '%s ALL=(root) NOPASSWD: /usr/bin/systemctl restart %s\n' "$DEPLOY_USER" "$SERVICE_NAME" > "$sudoers_tmp"
  as_root install -m 440 -o root -g root "$sudoers_tmp" "/etc/sudoers.d/$APP_NAME-deploy"
  as_root visudo -cf "/etc/sudoers.d/$APP_NAME-deploy" >/dev/null

  local pnpm_bin
  pnpm_bin="${PNPM_BIN_FOR_DEPLOY:-$(command -v pnpm)}"
  as_root sudo -u "$DEPLOY_USER" env HOME="/home/$DEPLOY_USER" bash -lc "corepack prepare 'pnpm@$PNPM_VERSION' --activate >/dev/null"
  as_root sudo -u "$DEPLOY_USER" env HOME="/home/$DEPLOY_USER" bash -lc "cd '/home/$DEPLOY_USER' && '$pnpm_bin' --version | grep -qx '$PNPM_VERSION'"
  as_root sudo -u "$DEPLOY_USER" sudo -n -l /usr/bin/systemctl restart "$SERVICE_NAME" >/dev/null
}

configure_nginx() {
  [[ "$ENABLE_NGINX" == "1" ]] || return
  log "Configurando Nginx"
  local server_name conf tmp
  server_name="${DOMAIN:-_}"
  conf="/etc/nginx/sites-available/$APP_NAME"
  tmp="$(mktemp)"
  cat > "$tmp" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $server_name;

    location / {
        proxy_pass http://$HOST:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
  as_root install -m 644 -o root -g root "$tmp" "$conf"
  as_root ln -sfn "$conf" "/etc/nginx/sites-enabled/$APP_NAME"
  for default_link in /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.disabled-by-"$APP_NAME"; do
    if [[ -L "$default_link" && "$(readlink "$default_link")" == "/etc/nginx/sites-available/default" ]]; then
      as_root unlink "$default_link"
    fi
  done
  if [[ -e /etc/nginx/sites-enabled/default && ! -L /etc/nginx/sites-enabled/default ]]; then
    fail "Nao alterei /etc/nginx/sites-enabled/default porque nao e symlink. Revise manualmente para evitar conflito de Nginx."
  fi
  as_root nginx -t
  as_root systemctl enable --now nginx
  as_root systemctl reload nginx

  if [[ "$ENABLE_SSL" == "1" ]]; then
    [[ -n "$DOMAIN" ]] || fail "DOMAIN e obrigatorio para ENABLE_SSL=1."
    [[ -n "$LETSENCRYPT_EMAIL" ]] || fail "LETSENCRYPT_EMAIL e obrigatorio para ENABLE_SSL=1."
    as_root certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$LETSENCRYPT_EMAIL" --redirect
  fi
}

validate_installation() {
  log "Validando aplicacao"
  as_root systemctl is-active --quiet "$SERVICE_NAME"
  local app_ready=0
  for _ in $(seq 1 30); do
    if curl --fail --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
      app_ready=1
      break
    fi
    sleep 2
  done
  [[ "$app_ready" == "1" ]] || fail "Aplicacao nao respondeu em http://127.0.0.1:$PORT/."
  if [[ "$ENABLE_NGINX" == "1" ]]; then
    local nginx_ready=0
    for _ in $(seq 1 10); do
      if curl --fail --silent --show-error --max-time 5 "http://127.0.0.1/" >/dev/null 2>&1; then
        nginx_ready=1
        break
      fi
      sleep 1
    done
    [[ "$nginx_ready" == "1" ]] || fail "Nginx nao respondeu em http://127.0.0.1/."
  fi
  if [[ -n "$PUBLIC_HEALTHCHECK_URL" ]]; then
    curl --fail --silent --show-error --max-time 15 "$PUBLIC_HEALTHCHECK_URL" >/dev/null
  fi
  log "Instalacao validada"
}

main() {
  require_clone_root
  install_system_packages
  install_node_and_pnpm
  prepare_database_service
  prepare_directories
  prepare_env
  prepare_database
  install_release
  configure_systemd
  configure_autodeploy_contract
  configure_nginx
  validate_installation
}

main "$@"
