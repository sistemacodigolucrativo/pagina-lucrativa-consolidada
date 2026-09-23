# Validação de Segurança — VPS de Teste

- Data/hora UTC: 2026-09-23T17:31:21Z
- VPS validada: 3.141.97.135
- Diretório local: /home/ubuntu/workspaces/pagina-lucrativa-main-update
- Branch: main
- Commit base no início desta rodada: ce0d265d0c12733374d0711638a8e77bf247bc04
- Commit com correções aplicado na main: 3ba5b5a49541b25991793a8665217af6eeaf195c
- Serviço: pagina-lucrativa.service
- Domínio validado: https://ocodigolucrativo.site/

## Resultado por item

| Item | Status | Evidência resumida | Observação |
|---|---|---|---|
| JWT_SECRET real configurado | Confirmado | EnvironmentFile operacional possui JWT_SECRET presente, tamanho 64, não vazio e não igual aos valores padrão conhecidos. | Valor não foi impresso. |
| ENABLE_DEMO_ACCOUNTS desativado | Confirmado | Variável ausente no EnvironmentFile de produção; tentativas de login hardcoded admin/123 e user/123 retornaram erro de credenciais. | O sistema roda com NODE_ENV=production. |
| DATABASE_URL real configurado | Confirmado operacionalmente | EnvironmentFile possui DATABASE_URL presente; conexão via DATABASE_URL retornou banco pagina_lucrativa com sucesso. | Valor não foi impresso. |
| Fallback por socket em produção | Corrigido | server/db.ts agora falha imediatamente em produção sem DATABASE_URL e só permite socket quando ENV.isProduction é falso. | Coberto por server/databaseConfig.test.ts. |
| /ebook-files protegido | Confirmado | Sem cookie: /ebook-files/b330052b46dc2658/source.pdf retornou 401 local e pelo domínio. Com cookie temporário assinado para usuário real do banco: retornou 200 e application/pdf. | Cookie temporário foi usado apenas para validação e não foi registrado. |
| Chave PEM revogada/rotacionada | Corrigido | Nova chave SSH segura foi criada fora do repositório, testada com login OK; a fingerprint da chave antiga foi removida do authorized_keys; login com a chave antiga retornou status 255. | Conteúdo das chaves não foi registrado. |
| Backup feito e validado | Confirmado | Backup SQL não vazio foi restaurado em banco temporário com 31 tabelas; backup integral da VPS foi criado e validado por listagem tar e checksum. | Backup integral: /home/ubuntu/servicos/pagina-lucrativa/backups/vps-integral-20260923T172926Z.tar.gz; manifesto: /home/ubuntu/servicos/pagina-lucrativa/backups/vps-integral-20260923T172926Z.manifest.txt. |
| Nginx não serve diretórios perigosos | Confirmado para URLs testadas | /ebook-import, /attached_assets, /.env, /server/db.ts, /drizzle/*.sql, /package.json, .php, .cgi e .exe retornaram HTML da aplicação, sem conteúdo real sensível. | Alguns caminhos retornam HTTP 200 por fallback SPA, mas não expõem os arquivos solicitados. |
| Build/testes finais | Confirmado | pnpm check OK; pnpm test OK com 77 arquivos e 288 testes; pnpm build OK; git diff --check OK. | O aviso de chunk grande do Vite permanece apenas informativo. |

## Correções aplicadas nesta rodada

1. Rotação do acesso SSH da VPS de teste.
2. Atualização do teste server/adminOffice.responsive.test.ts para refletir o estado atual do dashboard administrativo.
3. Bloqueio de fallback por socket MySQL em produção no server/db.ts.
4. Criação do teste server/databaseConfig.test.ts.
5. Criação de backup integral operacional da VPS de teste.

## Comandos principais executados

- ssh-keygen para nova chave ed25519, fora do repositório.
- Remoção da fingerprint da chave antiga em /home/ubuntu/.ssh/authorized_keys.
- Teste de login SSH com chave nova: OK.
- Teste de login SSH com chave antiga usando IdentitiesOnly: bloqueado.
- Restauração do backup SQL em banco temporário e remoção do banco temporário.
- Criação de backup integral tar.gz com release ativa, .env, storage, Nginx, systemd e backups SQL.
- pnpm check.
- pnpm test.
- pnpm build.
- git diff --check.

## Publicação na VPS de teste

- Build aplicada no serviço pagina-lucrativa.service: Sim
- Serviço reiniciado: Sim
- Status do serviço após restart: active
- Validação local http://127.0.0.1:3101/: HTTP 200
- Validação domínio https://ocodigolucrativo.site/: HTTP 200
- Backup do dist anterior: /home/ubuntu/servicos/pagina-lucrativa/backups/dist-before-security-hardening-20260923T173149Z.tar.gz

## Pendências

- O backup integral foi validado por listagem/checksum, mas não foi restaurado integralmente em outra VPS nesta rodada.
- O código ainda mantém fallback por socket para desenvolvimento/teste, por compatibilidade local; em produção ele não é mais permitido sem DATABASE_URL.

## Segurança

- Nenhum valor de JWT_SECRET, DATABASE_URL, token, senha, cookie de sessão ou chave privada foi registrado neste relatório.
- Nenhuma migration foi executada.
- Nenhum dado do banco principal foi alterado; somente foi criado e removido um banco temporário para validar restauração do backup SQL.
