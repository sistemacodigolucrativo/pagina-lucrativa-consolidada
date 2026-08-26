# Auto deploy seguro — GitHub → VPS

## Objetivo

A branch `main` é a fonte oficial do código de produção. Cada push em `main` deve passar por validação automática e, quando a integração da VPS estiver configurada, disparar a atualização do ambiente de produção.

## Ponto de restauração inicial

Antes da implantação deste mecanismo foi criada a branch remota:

`backup/pre-auto-deploy-2026-08-26`

Ela preserva o commit:

`c68a10195a963e13f79f34d7c53270066f58ba23`

Esse ponto representa o estado conhecido como funcional antes da introdução do auto deploy.

## Fluxo

1. Push em `main`.
2. GitHub Actions executa `pnpm check`, `pnpm test` e `pnpm build`.
3. Se qualquer validação falhar, a VPS não é alterada.
4. Se as validações passarem e os Secrets da VPS estiverem configurados, o workflow conecta por SSH.
5. A VPS executa `scripts/deploy-vps.sh <SHA>`.
6. O script confirma que a cópia de produção está limpa e que o SHA solicitado é o `origin/main` atual.
7. Mudanças em schema/migrações são bloqueadas para exigir backup e revisão manual do banco.
8. O código é movido para o novo SHA e o container `app` é reconstruído com `docker-compose.vps.yml`.
9. A aplicação é reiniciada e passa por health check HTTP.
10. Se a nova versão falhar depois de tocar o serviço, o script restaura o SHA anterior, reconstrói o container anterior e sobe novamente a versão conhecida.

## Secrets necessários no GitHub

Cadastre no repositório, em Actions Secrets:

- `VPS_HOST` — hostname ou IP da VPS.
- `VPS_PORT` — porta SSH; se omitido, o workflow usa `22`.
- `VPS_USER` — usuário SSH utilizado no deploy.
- `VPS_SSH_KEY` — chave privada exclusiva para o deploy, sem expor a chave no repositório.
- `VPS_DEPLOY_PATH` — caminho absoluto do clone de produção na VPS.

Enquanto esses Secrets não estiverem completos, o workflow executará apenas a etapa de validação e registrará que o deploy foi ignorado com segurança.

## Pré-requisitos da VPS

O diretório indicado por `VPS_DEPLOY_PATH` deve:

- ser um clone deste repositório;
- possuir `origin` apontando para o repositório consolidado;
- conseguir executar `git fetch origin main` sem interação manual;
- possuir Docker e Docker Compose;
- possuir `.env` local de produção, não versionado;
- utilizar `docker-compose.vps.yml` para o serviço de produção;
- não receber alterações manuais permanentes em arquivos versionados.

A autenticação necessária para a VPS fazer `git fetch` de um repositório privado deve ser configurada no próprio servidor (por exemplo, deploy key somente leitura). Nunca coloque credenciais Git no código.

## Banco de dados

O deploy automático deliberadamente NÃO executa `pnpm db:push`.

Se um push modificar `drizzle/`, `drizzle/schema.ts` ou `drizzle.config.ts`, a implantação é interrompida antes de alterar a produção. Nesse cenário:

1. faça backup real do banco;
2. revise as migrations;
3. execute a implantação/migração manualmente;
4. valide os dados e a aplicação.

## Recuperação manual

Para retornar ao estado anterior à implantação do sistema de auto deploy, a referência inicial está preservada em:

`backup/pre-auto-deploy-2026-08-26`

Também é possível restaurar qualquer SHA conhecido diretamente na VPS e reconstruir o container `app`.
