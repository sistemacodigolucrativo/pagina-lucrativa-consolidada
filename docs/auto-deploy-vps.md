# Auto deploy seguro — GitHub → VPS

## Arquitetura real de produção

A `main` é a fonte oficial. A VPS não mantém checkout Git e não usa Docker para esta aplicação. Produção usa releases imutáveis, symlink `current`, `systemd` (`pagina-lucrativa.service`), Node em `current/dist/index.js`, porta interna `3101` e Nginx como proxy de `ocodigolucrativo.site`.

Raiz esperada: `/home/ubuntu/servicos/pagina-lucrativa`.

O release funcional anterior ao auto deploy permanece preservado no SHA `c68a10195a963e13f79f34d7c53270066f58ba23`, também referenciado pela branch `backup/pre-auto-deploy-2026-08-26`.

## Fluxo

1. Push em `main`.
2. GitHub Actions bloqueia mudanças automáticas de schema/migration e executa `pnpm check`, `pnpm test` e `pnpm build`.
3. Somente após sucesso, o checkout exato de `github.sha` é empacotado sem `.git`, `node_modules`, `dist` ou `.env`.
4. Artefato e `scripts/deploy-vps.sh` são enviados para área temporária da VPS via SSH/SCP.
5. O script cria um novo diretório em `releases/`, instala dependências e gera o build na própria VPS.
6. Antes de ativar, executa smoke test isolado em porta temporária.
7. O symlink `current` é trocado atomicamente para o novo release.
8. `pagina-lucrativa.service` é reiniciado por `sudo -n` com permissão sudoers restrita ao restart desse serviço.
9. O script valida `http://127.0.0.1:3101/` e o endpoint público HTTPS.
10. Se houver falha após a troca, `current` volta para o release anterior, o mesmo serviço é reiniciado e a versão anterior permanece disponível.

O deploy não altera Nginx, unit do systemd, bancos ou serviços PWEB paralelos.

## Secrets necessários

- `VPS_HOST` — IP/hostname da VPS.
- `VPS_PORT` — porta SSH; opcional, padrão 22.
- `VPS_USER` — usuário de deploy.
- `VPS_SSH_KEY` — chave privada exclusiva do Actions.
- `VPS_DEPLOY_PATH` — raiz `/home/ubuntu/servicos/pagina-lucrativa`.
- `VPS_KNOWN_HOSTS` — entrada verificada de host key da VPS para `StrictHostKeyChecking=yes`.

Enquanto esses dados não estiverem completos, o workflow valida o projeto e não altera a produção.

## Contrato da VPS

O usuário de deploy precisa conseguir:

- criar releases em `$VPS_DEPLOY_PATH/releases`;
- criar arquivos temporários em `/tmp`;
- executar `node`, `curl` e `tar`;
- executar `pnpm` **10.4.1** de forma não interativa;
- trocar o symlink `$VPS_DEPLOY_PATH/current`;
- executar exclusivamente `sudo -n /usr/bin/systemctl restart pagina-lucrativa.service` sem senha.

### pnpm

A VPS deve ser preparada uma única vez com pnpm `10.4.1` disponível para o usuário de deploy. Não instalar dependências globais de forma improvisada durante cada deploy. Depois da instalação controlada, valide o caminho absoluto com `command -v pnpm` e a versão com `pnpm --version`.

O script aceita `PNPM_BIN=/caminho/absoluto/pnpm` quando a sessão SSH não interativa não herdar o mesmo PATH da sessão interativa. O executável apontado precisa existir e reportar exatamente `10.4.1`; caso contrário, o deploy para antes de alterar `current`.

### systemd / sudoers

Não conceder sudo irrestrito ao usuário/chave de deploy. Criar uma regra em `/etc/sudoers.d/` usando `visudo -f` que autorize somente o comando necessário para esta aplicação:

`/usr/bin/systemctl restart pagina-lucrativa.service`

A regra deve usar `NOPASSWD` apenas para esse comando. Antes do primeiro deploy, validar com `sudo -n -l /usr/bin/systemctl restart pagina-lucrativa.service` e confirmar que nenhum privilégio adicional foi concedido por causa desta preparação.

Não criar `.env` artificialmente. As variáveis de produção permanecem sob o contrato já existente do systemd.

## Banco de dados

Deploy automático não executa migrations. Mudanças em `drizzle/`, `drizzle.config.ts` ou `drizzle/schema.ts` bloqueiam a automação e exigem backup/revisão manual antes da implantação.

## Rollback

O script registra o destino anterior de `current`. Se a versão nova falhar depois de ativada, restaura atomicamente esse symlink, executa o mesmo restart restrito de `pagina-lucrativa.service` e mantém o release anterior intacto.

O release inicial conhecido como funcional (`20260826-unified-c68a101`) não deve ser removido. A VPS também possui backup pré-auto-deploy criado durante a auditoria do ambiente.

## Preparação final

1. Preparar pnpm 10.4.1 para o usuário de deploy e registrar seu caminho absoluto.
2. Criar a regra sudoers mínima para restart de `pagina-lucrativa.service` e validar com `visudo`/`sudo -n`.
3. Criar identidade SSH exclusiva para Actions, instalando somente a chave pública em `authorized_keys`.
4. A chave privada vai diretamente para `VPS_SSH_KEY`, nunca para arquivos versionados.
5. Cadastrar os seis Secrets.
6. Se o pnpm não estiver no PATH não interativo, expor `PNPM_BIN` ao processo de deploy com o caminho absoluto validado antes de executar o script.
7. Executar o primeiro deploy de forma controlada, acompanhando Actions, systemd, health check local e HTTPS público.
