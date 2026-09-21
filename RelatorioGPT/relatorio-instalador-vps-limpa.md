# Relatorio Tecnico — Instalador VPS Limpa

## 1. Resumo executivo

Foi auditado e atualizado o instalador VPS do projeto Codigo Lucrativo / Pagina Lucrativa Consolidada para refletir o estado atual do projeto em uma VPS Ubuntu limpa.

O instalador original ja conseguia instalar o projeto, mas possuia lacunas de seguranca, idempotencia, documentacao e operacao controlada. As correcoes foram aplicadas de forma cirurgica, sem alterar aplicacao, schema, pagamentos, paineis ou regras de negocio.

## 2. Ambiente testado

- VPS de teste: `3.141.97.135`
- Hostname: `ip-172-31-44-12`
- Sistema: Ubuntu 24.04.4 LTS
- Kernel: `6.17.0-1017-aws`
- Arquitetura: `x86_64`
- Memoria: 3.8 GiB
- Disco raiz: 48 GB total, 43 GB livre apos instalacao
- Usuario usado: `ubuntu`
- Diretorio de desenvolvimento: `/home/ubuntu/workspaces/pagina-lucrativa-consolidada`
- Diretorio instalado: `/home/ubuntu/servicos/pagina-lucrativa`
- Servico systemd: `pagina-lucrativa.service`

## 3. Base Git

- Repositorio: `https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada.git`
- Branch de trabalho: `fix/vps-installer-audit`
- Commit base analisado: `c2ab114d8be7328b7a64eb60d1afb96841f2179c`
- Commit inicial do patch testado na VPS: `f6a5ec5c4c92c45098ef51e23a50c429034eb47e`
- Commit enviado ao remoto antes deste relatorio: `3a18dd426695331214934a5dbc6381a4d7e37902`

## 4. Arquivos auditados

- `scripts/install-vps.sh`
- `scripts/deploy-vps.sh`
- `scripts/sync-packaged-content.mjs`
- `scripts/sync-ebook-library-categories.mjs`
- `scripts/export-academy-content.mjs`
- `.github/workflows/deploy-vps.yml`
- `docs/auto-deploy-vps.md`
- `docs/CONTENT_BOOTSTRAP.md`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- `drizzle.config.ts`
- `drizzle/`
- `.env.example`

## 5. Problemas encontrados

1. O instalador nao possuia pre-flight suficiente para Ubuntu, espaco em disco, porta interna, SSL e arquivos obrigatorios.
2. O instalador misturava comportamento padrao e opcional sem flags claras para migrations, testes, Nginx e seed de conteudo.
3. O `.env` era preservado, mas nao validava explicitamente variaveis minimas obrigatorias.
4. O fluxo de conteudo padrao nao estava integrado ao instalador de forma controlada.
5. Existia uma chave publica padrao embutida para autodeploy, o que torna o contrato operacional menos explicito.
6. Nao existia script seguro para limpar a VPS de teste e repetir a instalacao.
7. Durante teste real foi encontrado bug de idempotencia: apos cleanup parcial, o grupo `pagina-deploy` poderia permanecer sem usuario correspondente, quebrando `useradd`.
8. A documentacao de instalacao limpa em VPS nao estava completa o suficiente para outro operador repetir o processo.

## 6. Alteracoes realizadas

- Atualizado `scripts/install-vps.sh`:
  - adicionadas flags `--apply-migrations`, `--skip-migrations`, `--seed-default-content`, `--no-seed`, `--run-tests`, `--no-nginx`, `--enable-ssl`, `--disable-autodeploy` e `--help`;
  - adicionada rotina de pre-flight;
  - adicionada validacao minima de `.env`;
  - adicionada execucao opcional e explicita de `sync-packaged-content.mjs`;
  - removida chave publica padrao embutida de `DEPLOY_PUBLIC_KEY`;
  - corrigido caso de grupo `pagina-deploy` pre-existente.

- Criado `scripts/cleanup-test-install.sh`:
  - remove somente instalacao de teste do projeto;
  - exige `ALLOW_DESTRUCTIVE_TEST_CLEANUP=1`;
  - exige flag `--i-understand-this-is-test-only`;
  - remove servico, Nginx do projeto, usuario/grupo de deploy, banco/usuario de teste e diretorio de deploy.

- Criado `docs/VPS_INSTALLATION.md`:
  - documenta requisitos, variaveis, instalacao limpa, flags, seed, autodeploy, validacao, rollback e cleanup de teste.

- Atualizado `README.md`:
  - adicionada referencia ao novo guia de instalacao VPS.

## 7. Testes executados

- `bash -n scripts/install-vps.sh`: passou.
- `bash -n scripts/deploy-vps.sh`: passou.
- `bash -n scripts/cleanup-test-install.sh`: passou.
- `git diff --check`: passou.
- `pnpm install --frozen-lockfile`: passou.
- `pnpm check`: passou.
- `pnpm test`: passou, 75 arquivos e 281 testes.
- `pnpm build`: passou.
- Instalacao limpa na VPS de teste: passou.
- Segunda execucao do instalador sobre instalacao existente: passou.
- Instalacao com `--seed-default-content`: passou.
- Falhas controladas:
  - cleanup sem confirmacao: falhou com mensagem clara;
  - opcao desconhecida: falhou com mensagem clara;
  - `--enable-ssl` sem dominio/e-mail: falhou antes de alterar o sistema.

## 8. Instalacao limpa

A instalacao limpa configurou:

- Node.js 22;
- pnpm 10.4.1;
- MariaDB/MySQL local;
- banco `pagina_lucrativa`;
- migrations Drizzle;
- build de producao;
- release atomico em `/home/ubuntu/servicos/pagina-lucrativa/releases`;
- symlink `current`;
- systemd `pagina-lucrativa.service`;
- Nginx em HTTP por IP;
- contrato de autodeploy sem chave publica embutida.

Validacoes:

- `systemctl is-active pagina-lucrativa.service`: `active`
- `http://127.0.0.1:3101/`: HTTP 200
- `http://127.0.0.1/`: HTTP 200
- `http://3.141.97.135/`: HTTP 200
- logs recentes do servico: sem erro critico encontrado.

## 9. Conteudo padrao

O teste com `--seed-default-content` executou `dry-run` e `apply` do sync versionado.

Resultado:

- e-books versionados sincronizados: 88;
- cursos versionados: 11;
- modulos versionados: 17;
- aulas/materiais versionados: 30;
- backup JSON do sync criado no release de teste;
- nenhum segredo exposto.

## 10. Idempotencia

A segunda execucao do instalador:

- preservou `.env` existente;
- nao duplicou Nginx;
- nao quebrou systemd;
- executou migrations sem criar erro;
- criou novo release valido;
- manteve a aplicacao respondendo com HTTP 200.

## 11. Logs gerados na VPS de teste

Os logs ficaram na VPS de teste em `/home/ubuntu/install-logs/`.

Arquivos principais:

- `install-current-20260921-171750.log`
- `cleanup-test-20260921-172445.log`
- `install-patched-clean-20260921-172445.log`
- `cleanup-test-20260921-172557.log`
- `install-patched-clean-20260921-172557.log`
- `install-patched-idempotent-20260921-172655.log`
- `failure-controls-20260921-172749.log`
- `install-patched-seed-20260921-172758.log`

Os logs brutos nao foram versionados para evitar incluir saidas operacionais extensas ou acidentalmente sensiveis.

## 12. Seguranca

- Nenhum `.env` real foi commitado.
- Nenhuma senha/token/chave foi colocada no relatorio.
- Nenhuma chave publica padrao fica embutida no instalador.
- `.env` existente e preservado.
- O cleanup destrutivo exige confirmacao dupla e escopo de teste.
- O app roda via usuario configurado, nao como root.
- Nginx e systemd foram validados.

## 13. Pendencias

- Dominio real e HTTPS/Certbot foram validados posteriormente na VPS de teste, conforme secao 16.
- GitHub Actions com esta branch ainda depende de PR/merge ou execucao do fluxo remoto conforme politica do projeto.
- `DEPLOY_PUBLIC_KEY` precisa ser informado pelo operador quando quiser preparar autodeploy real.

## 14. Conclusao

O instalador foi atualizado, documentado e validado em VPS Ubuntu limpa por IP/HTTP. A instalacao ficou funcional com app, banco, migrations, build, systemd, Nginx, seed opcional e idempotencia.

O projeto ficou pronto para instalacao reproduzivel em outra VPS limpa, exceto pela validacao especifica de dominio real e HTTPS.

## 15. Validacao final de robustez

Data da validacao final: 2026-09-21.

Correcoes finais aplicadas:

- O pre-flight inicial deixou de exigir `openssl` e `tar` antes da instalacao de pacotes.
- A etapa de pacotes passou a validar explicitamente comandos instalados: `curl`, `git`, `openssl`, `tar`, `unzip`, `nginx` quando habilitado, e cliente MySQL/MariaDB.
- A validacao de `.env` passou a rejeitar `DATABASE_URL`, `JWT_SECRET` e `LOCAL_STORAGE_DIR` quando ausentes ou vazios.
- O cleanup destrutivo de teste passou a bloquear execucao quando `APP_NAME`, `DEPLOY_ROOT`, `SERVICE_NAME`, `MYSQL_DATABASE`, `MYSQL_USER` ou `DEPLOY_USER` estiverem fora dos valores esperados do projeto de teste.

Validacoes executadas:

- `bash -n scripts/install-vps.sh`: passou.
- `bash -n scripts/cleanup-test-install.sh`: passou.
- `git diff --check`: passou.
- Trava do cleanup testada com `MYSQL_DATABASE` fora do escopo: falhou corretamente antes de qualquer acao destrutiva.
- Execucao idempotente de `bash scripts/install-vps.sh`: passou.
- `systemctl is-active pagina-lucrativa.service`: `active`.
- `sudo nginx -t`: passou.
- `curl --fail http://127.0.0.1:3101/`: passou.
- `curl --fail http://127.0.0.1/`: passou.
- `curl -I http://3.141.97.135/`: HTTP 200.

Observacao:

- `nginx -t` sem sudo na VPS de teste falhou por permissao ao acessar `/run/nginx.pid`; a validacao correta foi executada com `sudo -n nginx -t`.
- Cleanup destrutivo completo nao foi executado nesta rodada final porque nao havia necessidade operacional.
- Instalacao limpa completa nao foi repetida nesta rodada final; foi validada execucao idempotente sobre a instalacao de teste existente.
- Nenhum ajuste foi feito em autodeploy, producao, dominio ou HTTPS.

## 16. Validacao HTTPS em dominio apontado para a VPS de teste

Data da validacao: 2026-09-21.

Contexto:

- O dominio `ocodigolucrativo.site` foi apontado para a VPS de teste.
- Antes do ajuste, HTTP respondia, mas HTTPS retornava erro 521 pela Cloudflare porque a VPS nao escutava na porta 443.

Correcoes aplicadas ao instalador:

- `--enable-ssl` passou a aceitar `LETSENCRYPT_NO_EMAIL=1` para VPS descartavel de teste quando nao houver e-mail operacional.
- O health check final do Nginx passou a validar `https://$DOMAIN/` quando SSL estiver habilitado, em vez de exigir `http://127.0.0.1/`, que pode retornar 404 apos o Certbot configurar server block e redirect por dominio.
- O instalador passou a oferecer seletor interativo para dominio/HTTPS quando executado em terminal interativo, mantendo variaveis/flags para automacao nao interativa.

Comando executado na VPS de teste:

```bash
DOMAIN=ocodigolucrativo.site LETSENCRYPT_NO_EMAIL=1 bash scripts/install-vps.sh --enable-ssl
```

Resultado:

- Certbot instalado.
- Certificado Let's Encrypt emitido para `ocodigolucrativo.site`.
- Nginx configurado com HTTPS.
- Porta 443 aberta.
- `pagina-lucrativa.service`: `active`.
- `sudo nginx -t`: passou.
- `curl --fail http://127.0.0.1:3101/`: passou.
- `curl -I http://ocodigolucrativo.site/`: HTTP 301 para HTTPS.
- `curl -I https://ocodigolucrativo.site/`: HTTP 200.

Observacao:

- A emissao sem e-mail deve ser tratada como opcao operacional para VPS de teste. Em producao, recomenda-se usar `LETSENCRYPT_EMAIL`.
