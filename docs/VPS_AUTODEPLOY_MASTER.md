# Autodeploy mestre da VPS

Este documento acompanha o script:

```bash
scripts/vps-autodeploy-master.sh
```

O objetivo é padronizar a atualização do projeto Código Lucrativo na VPS sem repetir manualmente clone, rsync, instalação, build, backup, migrations, seeds/syncs e restart.

## Configuração padrão

O script já vem configurado para o projeto atual:

```text
Repositório: sistemacodigolucrativo/pagina-lucrativa-consolidada
Checkout: /home/ubuntu/workspaces/pagina-lucrativa-consolidada
Deploy root: /home/ubuntu/servicos/pagina-lucrativa
Releases: /home/ubuntu/servicos/pagina-lucrativa/releases
Current: /home/ubuntu/servicos/pagina-lucrativa/current
Service: pagina-lucrativa.service
Ref padrão: main
```

Se o repositório for privado, o script pede o token do GitHub no terminal. O token não é gravado no repositório e não é colocado na URL do Git.

## Como usar

Na VPS:

```bash
cd /home/ubuntu/workspaces/pagina-lucrativa-consolidada
git fetch origin feat/vps-autodeploy-master
git checkout feat/vps-autodeploy-master
bash scripts/vps-autodeploy-master.sh
```

O script vai pedir:

```text
Informe o token do GitHub com acesso de leitura ao repositório privado:
```

Informe um token com acesso ao repositório.

## Token recomendado

Use um Fine-grained Personal Access Token do GitHub com acesso ao repositório `sistemacodigolucrativo/pagina-lucrativa-consolidada` e permissão mínima de leitura de conteúdo.

O script precisa apenas buscar o código do repositório. Ele não precisa de permissão para apagar, criar issues ou administrar o repositório.

## O que o script faz

1. Cria lock para impedir dois deploys simultâneos.
2. Confere comandos obrigatórios: `git`, `rsync`, `node`, `pnpm`, `flock`, `mysqldump`, `mysql`.
3. Pede o token do GitHub, se `GITHUB_TOKEN` não estiver definido.
4. Clona ou atualiza o checkout em `/home/ubuntu/workspaces/pagina-lucrativa-consolidada`.
5. Busca a referência configurada em `DEPLOY_REF`, por padrão `main`.
6. Cria uma nova release em `/home/ubuntu/servicos/pagina-lucrativa/releases/<timestamp>-<sha>`.
7. Copia o código com `rsync`, excluindo `.git`, `node_modules`, `.env`, `dist`, cache e coverage.
8. Vincula ou copia o `.env` de forma segura.
9. Executa `pnpm install --frozen-lockfile`.
10. Executa `pnpm check`.
11. Executa `pnpm test` somente se `RUN_TESTS=1`.
12. Executa `pnpm build`.
13. Faz backup lógico do banco com `mysqldump` antes de migrations/syncs.
14. Executa migrations versionadas com `pnpm exec drizzle-kit migrate`.
15. Executa hooks versionados encontrados em:
    - `deploy/pre-activate`
    - `deploy/post-migrate`
    - `scripts/deploy-hooks`
16. Executa scripts conhecidos e idempotentes, quando existirem:
    - `scripts/sync-public-toast-content.mjs`
    - `scripts/sync-packaged-content.mjs`
17. Atualiza o symlink `/home/ubuntu/servicos/pagina-lucrativa/current`.
18. Reinicia o serviço `pagina-lucrativa.service`.
19. Faz healthcheck HTTP.
20. Se o healthcheck falhar, volta o symlink para a release anterior e reinicia o serviço.
21. Remove releases antigas, mantendo as mais recentes.

## Como publicar uma branch específica

Por padrão, o script publica `main`.

Para testar uma branch antes do merge:

```bash
DEPLOY_REF=fix/toast-seeds-publications-filter bash scripts/vps-autodeploy-master.sh
```

Para executar testes automatizados durante o deploy:

```bash
RUN_TESTS=1 bash scripts/vps-autodeploy-master.sh
```

Para usar token sem digitar interativamente:

```bash
GITHUB_TOKEN='SEU_TOKEN' bash scripts/vps-autodeploy-master.sh
```

## Banco de dados

O script tenta conectar ao banco nesta ordem:

1. `DATABASE_URL`
2. `REMOTE_DATABASE_URL`
3. socket local `/run/mysqld/mysqld.sock`

O `.env` esperado deve estar em um destes locais:

```text
/home/ubuntu/servicos/pagina-lucrativa/shared/.env
/home/ubuntu/servicos/pagina-lucrativa/current/.env
```

Preferência recomendada:

```text
/home/ubuntu/servicos/pagina-lucrativa/shared/.env
```

Antes de aplicar migrations ou syncs, o script gera backup em:

```text
/home/ubuntu/servicos/pagina-lucrativa/backups
```

## Migrations

O script não precisa ser editado toda vez que uma migration nova for criada.

Basta versionar as migrations Drizzle no repositório. Durante o deploy, o script roda:

```bash
pnpm exec drizzle-kit migrate
```

Esse comando aplica as migrations versionadas que ainda não foram aplicadas no banco.

## Hooks versionados

Para rotinas adicionais de banco ou ajustes pós-migration, crie arquivos em uma destas pastas:

```text
deploy/pre-activate
deploy/post-migrate
scripts/deploy-hooks
```

Tipos suportados:

```text
.sql
.sh
.mjs
.js
```

Os hooks são executados em ordem alfabética e registrados na tabela:

```text
deployHookRuns
```

Assim, o mesmo hook não roda repetidamente em todo deploy.

Exemplo:

```text
deploy/post-migrate/20260922_fix_toast.sql
```

ou:

```text
scripts/deploy-hooks/20260922_sync_toast.mjs
```

## Scripts sync conhecidos

Além das migrations e hooks, o script detecta e roda automaticamente scripts idempotentes conhecidos:

```text
scripts/sync-public-toast-content.mjs
scripts/sync-packaged-content.mjs
```

Para desativar isso em uma execução específica:

```bash
AUTO_RUN_KNOWN_SYNC_SCRIPTS=0 bash scripts/vps-autodeploy-master.sh
```

## Rollback

O rollback de código é automático se o healthcheck falhar depois do restart.

O script volta o symlink `current` para a release anterior e reinicia o serviço.

Atenção: rollback de banco não é automático. Se uma migration já alterou o banco, use o backup gerado antes da execução apenas se realmente necessário.

## Variáveis úteis

```bash
DEPLOY_REF=main
RUN_TESTS=0
RUN_CHECK=1
RUN_BUILD=1
BACKUP_DATABASE=1
RUN_DRIZZLE_MIGRATIONS=1
RUN_DEPLOY_HOOKS=1
AUTO_RUN_KNOWN_SYNC_SCRIPTS=1
KEEP_RELEASES=6
SERVICE_NAME=pagina-lucrativa.service
HEALTHCHECK_URL=http://127.0.0.1:3000/
```

## Primeiro uso recomendado

Para testar sem mexer na branch `main`, rode:

```bash
DEPLOY_REF=feat/vps-autodeploy-master RUN_TESTS=0 bash scripts/vps-autodeploy-master.sh
```

Depois valide:

```bash
sudo systemctl status pagina-lucrativa --no-pager
curl -I http://127.0.0.1:3000/
readlink -f /home/ubuntu/servicos/pagina-lucrativa/current
ls -lh /home/ubuntu/servicos/pagina-lucrativa/backups | tail
```

## Observações importantes

- Não coloque token fixo dentro do script.
- Não versionar `.env` com segredos.
- Manter migrations no repositório.
- Criar hooks com nomes datados e imutáveis.
- Conferir o backup antes de executar alterações grandes no banco.
- Para deploy normal futuro, depois de aprovado, rode apenas:

```bash
bash scripts/vps-autodeploy-master.sh
```
