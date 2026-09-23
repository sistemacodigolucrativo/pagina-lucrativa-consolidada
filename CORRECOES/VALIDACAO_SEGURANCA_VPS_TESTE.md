# Validação de Segurança — VPS de Teste

- Data/hora UTC: 2026-09-23T16:57:03Z
- VPS validada: 3.141.97.135
- Diretório local: /home/ubuntu/workspaces/pagina-lucrativa-main-update
- Branch: main
- Commit validado: be241283ca452f3770b27974672f027200056d34
- Serviço: pagina-lucrativa.service
- Domínio validado: https://ocodigolucrativo.site/

## Resultado por item

| Item | Status | Evidência resumida | Observação |
|---|---|---|---|
| JWT_SECRET real configurado | Confirmado | EnvironmentFile operacional possui JWT_SECRET presente, tamanho 64, não vazio e não igual aos valores padrão conhecidos. | Valor não foi impresso. |
| ENABLE_DEMO_ACCOUNTS desativado | Confirmado | Variável ausente no EnvironmentFile de produção; tentativas de login hardcoded admin/123 e user/123 retornaram erro de credenciais. | O sistema roda com NODE_ENV=production. |
| DATABASE_URL real configurado | Confirmado operacionalmente | EnvironmentFile possui DATABASE_URL presente; conexão via DATABASE_URL retornou banco pagina_lucrativa com sucesso. | O código ainda contém fallback por socket em server/db.ts, mas o runtime validado usa DATABASE_URL. |
| /ebook-files protegido | Confirmado | Sem cookie: /ebook-files/b330052b46dc2658/source.pdf retornou 401 local e pelo domínio. Com cookie temporário assinado para usuário real do banco: retornou 200 e application/pdf. | Cookie temporário foi usado apenas para validação e não foi registrado. |
| Chave PEM revogada/rotacionada | Falhou | A chave PEM histórica removida do repositório ainda corresponde a entrada presente em /home/ubuntu/.ssh/authorized_keys da VPS de teste. | A chave não está mais versionada nem presente no checkout, mas ainda precisa ser removida/rotacionada no acesso SSH da VPS. |
| Backup feito e validado | Parcialmente confirmado | Backup SQL não vazio mais recente: /home/ubuntu/servicos/pagina-lucrativa/backups/pagina-lucrativa_20260922T052240Z-1bd7e890_before.sql. Restauração em banco temporário via sudo mysql validou 31 tabelas e o banco temporário foi removido. | Backup integral/snapshot da VPS não foi comprovado por arquivo local nesta validação. |
| Nginx não serve diretórios perigosos | Confirmado para URLs testadas | /ebook-import, /attached_assets, /.env, /server/db.ts, /drizzle/*.sql, /package.json, .php, .cgi e .exe retornaram HTML da aplicação, sem conteúdo real sensível. | Alguns caminhos retornam HTTP 200 por fallback SPA, mas não expõem os arquivos solicitados. |
| Build/testes finais | Parcial | pnpm check OK; pnpm build OK; testes específicos da Home pública OK em validação anterior. | pnpm test completo falhou em server/adminOffice.responsive.test.ts por expectativa "disabled aria-disabled" ausente; 75 arquivos passaram e 1 falhou. |

## Comandos executados

- git status --short --branch
- git rev-parse HEAD
- systemctl is-active pagina-lucrativa.service
- Verificação mascarada de EnvironmentFile: JWT_SECRET, ENABLE_DEMO_ACCOUNTS, DATABASE_URL, LOCAL_STORAGE_DIR
- Conexão MySQL via DATABASE_URL com consulta de banco atual
- curl POST /api/trpc/auth.demoLogin com admin/123 e user/123
- curl /ebook-files/b330052b46dc2658/source.pdf sem cookie
- curl /ebook-files/b330052b46dc2658/source.pdf com cookie temporário de usuário real
- Comparação da chave PEM histórica com authorized_keys, sem imprimir chave
- Restauração do backup SQL em banco temporário e remoção do banco temporário
- curl em caminhos públicos potencialmente perigosos
- pnpm check
- pnpm test
- pnpm build

## Pendências

1. Remover/rotacionar a chave SSH antiga que ainda está autorizada em /home/ubuntu/.ssh/authorized_keys.
2. Corrigir ou atualizar o teste server/adminOffice.responsive.test.ts para refletir o comportamento atual esperado do dashboard administrativo.
3. Se for requisito operacional, comprovar snapshot/backup integral da VPS além do backup SQL validado.
4. Avaliar remoção ou proteção por flag do fallback por socket em server/db.ts, pois embora não esteja sendo usado no runtime atual, ainda existe no código.

## Segurança

- Nenhum valor de JWT_SECRET, DATABASE_URL, token, senha, cookie de sessão ou chave privada foi registrado neste relatório.
- Nenhum deploy adicional foi executado nesta validação.
- Nenhuma migration foi executada.
- Nenhum dado do banco principal foi alterado; somente foi criado e removido um banco temporário para validar restauração do backup.
