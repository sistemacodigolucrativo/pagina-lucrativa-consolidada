# Instalacao em VPS Ubuntu

Este documento descreve o fluxo atual para instalar o Codigo Lucrativo / Pagina Lucrativa Consolidada em uma VPS Ubuntu limpa.

## Escopo

O instalador `scripts/install-vps.sh` prepara a primeira instalacao da aplicacao. O deploy incremental de codigo continua sendo responsabilidade de `scripts/deploy-vps.sh` e do workflow `.github/workflows/deploy-vps.yml`.

O instalador nao deve ser usado para sobrescrever uma producao sem revisao. Em producao existente, preserve `.env`, banco e diretorios persistentes antes de qualquer execucao.

## Requisitos minimos

- Ubuntu 22.04 ou 24.04.
- Usuario com `sudo` sem senha para instalacao.
- 2 GB livres em disco, minimo tecnico validado pelo script.
- Porta interna livre, por padrao `3101`.
- Porta 80 livre se `ENABLE_NGINX=1`.
- Acesso de rede para apt, NodeSource e registry npm.

## Stack instalada

O instalador valida ou instala:

- `ca-certificates`
- `curl`
- `git`
- `openssl`
- `tar`
- `unzip`
- `build-essential`
- Node.js 22
- Corepack
- pnpm `10.4.1`
- MariaDB/MySQL local quando nao existe cliente/servidor compativel
- Nginx quando habilitado
- Certbot somente com `--enable-ssl`

## Variaveis principais

Configure por variaveis de ambiente quando quiser sobrescrever os padroes:

```bash
APP_NAME=pagina-lucrativa
DEPLOY_ROOT=/home/ubuntu/servicos/pagina-lucrativa
SERVICE_NAME=pagina-lucrativa.service
SERVICE_USER=ubuntu
PORT=3101
DOMAIN=
MYSQL_DATABASE=pagina_lucrativa
MYSQL_USER=pagina_lucrativa
MYSQL_PASSWORD=
MYSQL_ROOT_PASSWORD=
JWT_SECRET=
DEPLOY_PUBLIC_KEY=
```

Segredos nunca devem ser passados para logs ou versionados. Se `.env` ja existir em `DEPLOY_ROOT`, ele e preservado e validado, nao sobrescrito.

## Instalacao limpa

No clone do repositorio:

```bash
git clone https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada.git
cd pagina-lucrativa-consolidada
bash scripts/install-vps.sh
```

O comportamento padrao:

- cria diretorios persistentes em `/home/ubuntu/servicos/pagina-lucrativa`;
- cria `.env` se ele ainda nao existir;
- cria banco e usuario MariaDB/MySQL locais;
- aplica migrations Drizzle;
- instala dependencias com `pnpm install --frozen-lockfile`;
- executa `pnpm check`;
- executa `pnpm build`;
- publica um release local;
- cria o servico `pagina-lucrativa.service`;
- configura Nginx em HTTP por IP;
- valida `http://127.0.0.1:3101/` e `http://127.0.0.1/`.

## Opcoes do instalador

```bash
bash scripts/install-vps.sh --help
bash scripts/install-vps.sh --skip-migrations
bash scripts/install-vps.sh --run-tests
bash scripts/install-vps.sh --seed-default-content
bash scripts/install-vps.sh --no-nginx
bash scripts/install-vps.sh --enable-ssl
bash scripts/install-vps.sh --disable-autodeploy
```

### Migrations

Por padrao o instalador executa:

```bash
pnpm exec drizzle-kit migrate
```

Use `--skip-migrations` quando estiver preparando somente arquivos/servico e as migrations forem tratadas manualmente. Em producao existente, faca backup do banco antes de permitir migrations.

### HTTPS

Para configurar Nginx com Certbot e abrir HTTPS na porta 443, o dominio precisa apontar para a VPS e responder em HTTP antes da emissao do certificado.

Com e-mail:

```bash
DOMAIN=ocodigolucrativo.site LETSENCRYPT_EMAIL=admin@example.com bash scripts/install-vps.sh --enable-ssl
```

Em VPS descartavel de teste, quando nao houver e-mail operacional, e possivel registrar o certificado sem e-mail:

```bash
DOMAIN=ocodigolucrativo.site LETSENCRYPT_NO_EMAIL=1 bash scripts/install-vps.sh --enable-ssl
```

Depois de ativar SSL, valide:

```bash
sudo nginx -t
curl -I https://ocodigolucrativo.site/
```

### Conteudo padrao

O conteudo padrao da Biblioteca e Academia nao e aplicado automaticamente. Para popular uma VPS nova com os manifestos versionados:

```bash
bash scripts/install-vps.sh --seed-default-content
```

Esse modo executa, dentro do release:

```bash
node scripts/sync-packaged-content.mjs --dry-run
node scripts/sync-packaged-content.mjs --apply
```

O script de sync e idempotente e usa `sourceId` para evitar duplicidades.

## Autodeploy

Quando `ENABLE_AUTODEPLOY=1`, o instalador prepara:

- usuario `pagina-deploy`;
- permissao restrita para reiniciar apenas `pagina-lucrativa.service`;
- `authorized_keys` do usuario de deploy.

Por seguranca, nenhuma chave publica e embutida por padrao. Informe `DEPLOY_PUBLIC_KEY` com a chave publica do GitHub Actions quando quiser preparar o acesso SSH.

## Comandos de validacao

Depois da instalacao:

```bash
systemctl is-active pagina-lucrativa.service
systemctl status pagina-lucrativa.service --no-pager
journalctl -u pagina-lucrativa.service -n 100 --no-pager
curl --fail http://127.0.0.1:3101/
curl --fail http://127.0.0.1/
```

## Deploy incremental

O deploy de releases de codigo usa `scripts/deploy-vps.sh`, chamado pelo GitHub Actions. Ele espera a VPS ja preparada pelo instalador:

- `DEPLOY_ROOT` existente;
- `current` apontando para release valido;
- pnpm `10.4.1` disponivel;
- sudoers restrito para restart;
- systemd e Nginx ja configurados.

O deploy incremental nao executa migrations e nao altera Nginx ou `.env`.

## Rollback

`scripts/deploy-vps.sh` preserva o release anterior e restaura o symlink `current` automaticamente se uma falha ocorrer depois da ativacao. Para rollback manual, aponte `current` para um release anterior conhecido e reinicie o servico:

```bash
ln -sfn /home/ubuntu/servicos/pagina-lucrativa/releases/RELEASE_ANTERIOR /home/ubuntu/servicos/pagina-lucrativa/current.next
mv -Tf /home/ubuntu/servicos/pagina-lucrativa/current.next /home/ubuntu/servicos/pagina-lucrativa/current
sudo systemctl restart pagina-lucrativa.service
```

## Cleanup somente para VPS de teste

Para repetir instalacoes em uma VPS limpa de teste, existe:

```bash
ALLOW_DESTRUCTIVE_TEST_CLEANUP=1 bash scripts/cleanup-test-install.sh --i-understand-this-is-test-only
```

Esse script remove servico, Nginx do projeto, usuario de deploy, banco/usuario MariaDB do projeto e `DEPLOY_ROOT`. Ele possui travas e deve ser usado somente em ambiente descartavel.

## Diagnostico de falhas comuns

- Porta interna ocupada: defina `PORT` ou pare o processo que ocupa a porta.
- `.env` incompleto: confira presenca de `DATABASE_URL`, `JWT_SECRET` e `LOCAL_STORAGE_DIR`, sem imprimir valores secretos.
- Build falhando: rode `pnpm check` e `pnpm build` dentro do release/cloned repo.
- Banco indisponivel: confirme `systemctl status mariadb` ou `mysql`.
- Nginx conflitando: revise `/etc/nginx/sites-enabled/default` e configs existentes antes de ativar o site.
