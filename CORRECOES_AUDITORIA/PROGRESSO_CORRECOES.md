# Progresso das correções da auditoria

Última atualização: 2026-09-21T12:38:08+00:00
Repositório: sistemacodigolucrativo/pagina-lucrativa-consolidada
Branch de trabalho: fix/auditoria-qualidade-aceitavel
SHA base da main no início: c2ab114d8be7328b7a64eb60d1afb96841f2179c

## Escopo e limites

Auditoria integral preservada em AUDITORIA_RECEBIDA.md. Esta continuidade parte da branch fix/auditoria-qualidade-aceitavel em 1ffbc55, usando o progresso existente e confrontando apenas pendências/regressões confirmadas. A main é somente referência de base. Clone limpo separado; cópia antiga com alterações de terceiros preservada. Não executar deploy, migrations, alteração de schema, acesso à VPS ou merge na main. Publicação autorizada exclusivamente na branch de trabalho.

## Estado atual — relatório recebido em 21/09/2026

- Relatório de outra IA na VPS 201 recebido do usuário e preservado em [RELATORIO_VPS_RECEBIDO_2026-09-21.md](RELATORIO_VPS_RECEBIDO_2026-09-21.md). Este assistente não acessou a VPS nem repetiu consultas ao banco real.
- Segundo essa fonte: serviço ativo em c2ab114d, Node 22.23.2, DATABASE_URL efetiva, banco MySQL/MariaDB 10.11 acessível e dois administradores local_demo. A branch corrigida ainda não estava implantada no momento relatado. Paridade de conteúdo, schema/grants completos e administrador real não foram comprovados.
- Configuração relatada da VPS não permite ativar a candidata com segurança: PUBLIC_APP_ORIGIN e SECURITY_AUDIT_DIR ausentes, contas administrativas demo recusadas pela nova política e backups dentro da release. JWT presente não equivale a segredo adequado.
- Corrigida a interpretação do relatório: REMOTE_DATABASE_URL é somente desenvolvimento; socket opt-in é condicional e DEPLOY_RUNTIME_ENV_FILE tem padrão. CONTENT_SYNC_BACKUP_DIR é exigida no apply; ENABLE_LOCAL_AUTH habilita login, não é um guard de startup. Detalhes em DECISOES_E_OPERACAO.md.
- Corrigida a ordem de operação: dry-run/check da candidata antes de ativar; eventual apply somente separado/autorizado; health e novo check após ativação. Não reexecutar correções já prontas por estarem ausentes da release antiga.
- Pendência local Node 22 encerrada: em ambiente isolado, Node 22.23.2 e pnpm 10.4.1 executaram instalação frozen, typecheck, 341 testes em 87 arquivos, build e validate-only com sucesso. Sem banco real. O código executável da branch e o lockfile não mudaram.
- Nesta atualização, alterações somente em três documentos de continuidade. Preparação da VPS, alteração de contas/configuração/permissões, tratamento da chave, sync com escrita, deploy e merge permanecem sem autorização para este assistente.

## Estado da etapa de 20/09/2026 (histórico)

- Retomada concluída sem reaplicar CRIT-01/02 e HIGH-01/02/07. Estado anterior: typecheck e 313 testes em 80 arquivos aprovados.
- HIGH-03/04/05/06 corrigidos no código. Evidência operacional da VPS permanece bloqueada por ausência de autorização: paridade de dados, diretórios/ambiente, restauração e execução do workflow não foram comprovadas.
- MED-01/02/05/06 corrigidos; MED-03 avaliado com diagnóstico de leitura e bloqueio de schema/dados reais; MED-04 parcialmente corrigido com exportação da publicação e procedimento operacional documentado.
- CRIT-03 adicional: chave privada retirada da árvore e impedida no pacote/CI; revogação/rotação e tratamento do histórico continuam bloqueados. A etapa não libera produção.
- Validação final local: instalação frozen, typecheck, 341 testes / 87 arquivos e build aprovados. Avisos e falha intermediária constam no fechamento abaixo.
- Dez commits funcionais publicados e conferidos na branch até f3b0859dbb1db7c43450c74c5f0766202f75e63d. As árvores publicadas são idênticas às testadas. Este fechamento acompanha a publicação final da documentação; a SHA final é informada na entrega da sessão.
- Main remota reconferida sem alterações: c2ab114d8be7328b7a64eb60d1afb96841f2179c. Nenhum deploy, migration, alteração de schema, acesso à VPS ou banco real.

## Plano original (histórico anterior à retomada em 1ffbc55)

1. Confirmar os 15 achados no código fixado na SHA base.
2. Fechar contas demo em produção e exposição de controles internos, com testes negativos de autorização.
3. Corrigir hashing e CSRF; preservar login real e validar credenciais legadas.
4. Tornar configuração de banco, backups, sync e guard de schema explícitos e seguros; testar sem banco de produção.
5. Avaliar médios, executar pnpm install --frozen-lockfile, pnpm check, pnpm test e pnpm build.
6. Salvar cada bloco em commit incluindo este arquivo e publicar na branch. Inspeção da VPS e validação operacional ficam pendentes sem acesso/autorização.

## Estado histórico recebido em 1ffbc55

- Base original: pnpm check aprovado; 75 arquivos / 281 testes aprovados.
- pnpm 10.4.1 instalado e usado, lockfile preservado; pnpm global 11 incompatível. Node local 24.19.0, CI 22.
- Críticos publicados: 8505c3c38f38690dd34852d0948799f9ffd01ef1.
- Bloco segurança: 80 arquivos / 313 testes aprovados; typecheck final do bloco aprovado. Falhas intermediárias: teste de logout ainda esperava SameSite=None (atualizado para contrato Lax); TS18047 control possivelmente null no log de purge (condição corrigida). Ambas foram introduzidas/reveladas pelo ajuste desta branch, não falhas da base.
- Publicações pela conexão GitHub, pois Git CLI não possui credencial. Nenhum force, merge ou alteração da main.
- Próximo passo: banco/sync/backups/CI e avaliação dos médios. Nenhuma operação na VPS.

## Achados

### CRIT-01

ID: CRIT-01
Status: Corrigido no código; versão antiga e administradores demo relatados na VPS
Gravidade: Critico
Área: Seguranca administrativa / autenticacao
Arquivo(s) auditado(s): server/demoAuth.ts; server/_core/context.ts; server/_core/trpc.ts; server/_core/adminMemberManagement.ts; server/_core/adminCommercialOperations.ts; server/_core/manualDeploy.ts
Problema confirmado?: Sim, por leitura e testes: a base aceitava contas demo fixas sem distinção de produção.
Evidência no código atual: Base: server/demoAuth.ts resolveDemoAccount/resolveDemoSession; contexto e 6 módulos REST confiavam no payload. Falta de JWT_SECRET caía em chave constante. Branch: authConfig.ts exige opt-in, impede demo em produção e valida segredo; resolveDemoSession consulta usuário/permissão no banco e vincula sessão à credencial.
Correção aplicada: Demo impossível em produção; login real no banco somente com ENABLE_LOCAL_AUTH=true; segredo validado no startup; sessão real revogada após senha alterada/usuário excluído; permissão atual do banco; hashes omitidos do usuário devolvido; falha ao consultar bloqueio em produção nega acesso.
Arquivos alterados: server/demoAuth.ts; server/_core/authConfig.ts, context.ts, index.ts, adminCommercialOperations.ts, adminContentManagement.ts, adminMemberManagement.ts, adminRelationshipMaintenance.ts, manualDeploy.ts, storageProxy.ts; .env.example; scripts/prepare-workspace.sh; testes de autenticação.
Testes executados: pnpm check; vitest run securityAudit.auth, securityAudit.content, demoAuth, context.auth, functionalPersistence.
Resultado dos testes: Typecheck aprovado; 19 testes aprovados, incluindo negativos de produção e consulta simulada ao banco. Não houve login em VPS.
Pendências: Relatório externo recebido em 21/09/2026 informa release c2ab114d e somente dois administradores, ambos local_demo. Preparar identidade administrativa real sob autorização específica, sem converter demos cegamente nem liberar exceção de produção; ENABLE_LOCAL_AUTH=true não elimina a recusa de demos. Validar JWT e acesso em ambiente controlado. Este assistente não consultou a VPS.
Próximo passo: Definir com o responsável a identidade administrativa real e um procedimento autorizado que preserve dados/referências, antes da ativação da candidata.
Commit relacionado: 8505c3c38f38690dd34852d0948799f9ffd01ef1

### CRIT-02

ID: CRIT-02
Status: Corrigido no código; não implantado segundo relatório externo
Gravidade: Critico
Área: Privacidade / conteudo interno / permissoes
Arquivo(s) auditado(s): server/db.ts; server/routers.ts; server/_core/adminMemberManagement.ts
Problema confirmado?: Sim. getPublishedContent filtrava apenas published e retornava member-admin-control.
Evidência no código atual: Base: server/db.ts getPublishedContent; adminMemberManagement.ts saveControl grava published. Branch: filtro SQL e filtro defensivo em memória excluem todas as quatro categorias internas conhecidas; createdBy não é retornado.
Correção aplicada: Política compartilhada de categorias internas e tipos permitidos; preservados materiais, artigos, FAQ e avisos públicos comuns.
Arquivos alterados: server/db.ts; server/memberContentPolicy.ts; server/_core/adminContentManagement.ts; server/securityAudit.content.test.ts.
Testes executados: Teste executa getPublishedContent com resultado de driver simulado contendo controles, configurações, rascunhos e conteúdos comuns.
Resultado dos testes: Somente os 2 conteúdos públicos esperados retornaram; nenhum registro interno nem createdBy. Typecheck aprovado.
Pendências: Relatório de 21/09 informa release antiga e ausência do filtro novo. Não foram fornecidos resultados com dados reais para esta política; validar saída pública em etapa operacional autorizada.
Próximo passo: Manter categorias internas futuras na política compartilhada.
Commit relacionado: 8505c3c38f38690dd34852d0948799f9ffd01ef1

### HIGH-01

ID: HIGH-01
Status: Corrigido no código; migração de credenciais reais ainda não comprovada
Gravidade: Alto
Área: Senhas / recuperacao de conta
Arquivo(s) auditado(s): server/credentialHash.ts; server/criticalFlowFixes.ts; server/db.ts
Problema confirmado?: Sim. SHA-256 simples em senha, resposta de recuperação e seed.
Evidência no código atual: Base credentialHash.ts hashPassword; db.ts autenticação/cadastro/recuperação; criticalFlowFixes.ts; seed-demo.ts. Branch usa formato scrypt versionado com salt individual, custo e fila limitada.
Correção aplicada: scrypt assíncrono N=16384/r=8/p=5; migração condicional no login correto; gravação moderna em cadastro/troca/recuperação; seed moderno somente fora de produção; recuperação pública não atende admin.
Arquivos alterados: server/credentialHash.ts, db.ts, criticalFlowFixes.ts, demoAuth.ts; scripts/seed-demo.ts; testes de credenciais e recuperação.
Testes executados: Suíte pnpm test; typecheck; salt/Unicode/espaços, custo malformado, login legado válido/inválido e atualização concorrente com driver simulado.
Resultado dos testes: 313 testes aprovados na suíte e typecheck aprovado. Formato <255 caracteres; nenhuma migration.
Pendências: Hashes reais não inspecionados/migrados por este assistente. Relatório de 21/09 informa administradores local_demo e não testa login; release corrigida não implantada. Não afirmar adoção de scrypt no banco real sem evidência.
Próximo passo: Verificar migração gradual de contas reais em validação autorizada; planejar substituição de perguntas secretas.
Commit relacionado: d70c3ab9ad4f8b3704495a9de5b2f7c6fa1b1f13

### HIGH-02

ID: HIGH-02
Status: Corrigido no código; ausência na versão instalada relatada externamente
Gravidade: Alto
Área: Seguranca web / CSRF
Arquivo(s) auditado(s): server/_core/cookies.ts; server/routers.ts; server/_core/adminMemberManagement.ts; server/_core/adminCommercialOperations.ts; server/_core/adminContentManagement.ts; server/_core/manualDeploy.ts
Problema confirmado?: Sim. Cookies SameSite=None sob HTTPS e ausência de guarda de origem no entrypoint.
Evidência no código atual: server/_core/index.ts registra csrfProtection antes de parsers e rotas, cobrindo REST e tRPC com prefixo; csrf.ts compara origem configurada, cookies.ts fixa Lax.
Correção aplicada: Todas as requisições mutáveis exigem Origin/Referer válido; bloqueio de origem ausente/nula/cross-site; produção exige PUBLIC_APP_ORIGIN HTTPS exata; cookie Secure em produção.
Arquivos alterados: server/_core/csrf.ts, cookies.ts, index.ts; server/routers.ts; .env.example; testes CSRF/cookies/logout.
Testes executados: HTTP real local para POST/DELETE/PATCH/PUT; prefixo /dev; origem exata, sufixo malicioso, protocolo errado, nula, ausente, Referer e Host encaminhado.
Resultado dos testes: 13 cenários HTTP aprovados; handlers não executados nas tentativas recusadas; suíte 313/313.
Pendências: Relatório recebido informa PUBLIC_APP_ORIGIN ausente e CSRF/cookie antigos na release c2ab114d. Origem HTTPS exata é obrigatória no startup da candidata; validar navegador/proxy e negativas de autorização após preparação e autorização operacional. Nenhuma requisição mutável foi executada por este assistente.
Próximo passo: Definir configuração da origem pública e validação controlada; não ativar a candidata com a configuração incompleta relatada.
Commit relacionado: d70c3ab9ad4f8b3704495a9de5b2f7c6fa1b1f13

### HIGH-03

ID: HIGH-03
Status: Corrigido no código; divergência de versão relatada na VPS; paridade de conteúdo pendente
Gravidade: Alto
Área: Banco de dados / sincronizacao de conteudo
Arquivo(s) auditado(s): .github/workflows/deploy-vps.yml; scripts/deploy-vps.sh; scripts/sync-packaged-content.mjs; server/academyCanonical.ts
Problema confirmado?: Desacoplamento de código confirmado na auditoria. Relatório externo de 21/09 informa VPS em c2ab114d versus branch e9383934; divergência dos dados de conteúdo ainda não foi medida.
Evidência no código atual: deploy-vps.sh não chamava sync; ensurePackagedLibraryEbooks fazia inserções durante leituras e só atualizava sourceId em duplicatas. Sync aceitava ausência do manifesto da Academia como lista vazia e sobrescrevia resumo curado.
Correção aplicada: Sync com --validate-only e --check READ ONLY (saída 3 em divergência), manifestos/PDFs obrigatórios e recusa de duplicatas no banco. Apply InnoDB transacional/SERIALIZABLE/FOR UPDATE com backup privado anterior ao DML e curadoria preservada. Gate antes/depois da ativação, arquivo de ambiente persistente e health SELECT 1. Leituras em produção não inserem e-books. Na revisão final, fail() passou de exit 1 para return 1, permitindo disparar trap ERR/rollback nas falhas de health.
Arquivos alterados: scripts/sync-packaged-content.mjs; scripts/deploy-vps.sh; scripts/manual-deploy-worker.sh; server/academyCanonical.ts; server/securityAudit.sync.test.ts; server/securityAudit.schema.test.ts (regressão do rollback); docs/CONTENT_BOOTSTRAP.md; este progresso.
Testes executados: pnpm exec vitest run server/securityAudit.sync.test.ts server/securityAudit.backup.test.ts server/packagedEbooks.integration.test.ts server/ebookLibraryPdf.integration.test.ts server/adminManualDeploy.integration.test.ts server/publicHeroTitleDeploy.integration.test.ts; node scripts/sync-packaged-content.mjs --validate-only; bash -n scripts/deploy-vps.sh scripts/manual-deploy-worker.sh; git diff --check.
Resultado dos testes: Validação final: pnpm check e pnpm build aprovados; pnpm test com 87 arquivos / 341 testes aprovados. Sync/backup testados com arquivos reais temporários e driver simulado; --validate-only nos PDFs/manifestos reais: 88 e-books, 11 cursos, 17 módulos e 30 aulas. Falha intermediária de assert textual obsoleto foi corrigida e reexecutada (ver histórico abaixo). Nenhum deploy, sync ou banco real utilizado.
Pendências: Fixar candidata, conferir schema/engine/instância real, exportar/revisar curadoria e executar dry-run/check da candidata antes da ativação. Eventual apply exige autorização específica e backup persistente. A ordem sugerida no relatório externo (deploy antes de dry-run/check) foi corrigida no procedimento; relatório não comprova paridade de conteúdo.
Próximo passo: Preparação operacional autorizada, conta real/configuração/diretórios, validação da candidata e --check sem diferenças ANTES da ativação; depois health/check novamente. Rollback de código não reverte dados previamente alterados.
Commit relacionado: acf4dc16a31d181416f3ac0f0ae8260212e3ca37; f3b0859dbb1db7c43450c74c5f0766202f75e63d

### HIGH-04

ID: HIGH-04
Status: Corrigido no código; backup inadequado na release relatado externamente
Gravidade: Alto
Área: Backup / rollback operacional
Arquivo(s) auditado(s): scripts/sync-packaged-content.mjs; scripts/deploy-vps.sh; .github/workflows/deploy-vps.yml
Problema confirmado?: Sim: packaged sync e category sync salvavam backups relativos dentro do projeto e sem modo privado explícito.
Evidência no código atual: scripts/lib/content-sync-backup.mjs resolve destino real, recusa releases/storage e symlinks que levam a eles, exige diretório 0700. Chamado pelos dois scripts antes de apply.
Correção aplicada: CONTENT_SYNC_BACKUP_DIR absoluto obrigatório em produção; JSON v2 com linhas anteriores e sourceIds de inserções planejadas; arquivo único 0600 aberto com wx e sincronizado em disco antes de DML. Diretório inválido impede conexão no apply.
Arquivos alterados: scripts/lib/content-sync-backup.mjs; scripts/sync-packaged-content.mjs; scripts/sync-ebook-library-categories.mjs; .env.example; server/securityAudit.backup.test.ts; docs/CONTENT_BOOTSTRAP.md; este progresso.
Testes executados: pnpm exec vitest run server/securityAudit.backup.test.ts (incluído nas execuções focadas); node --check dos scripts; git diff --check.
Resultado dos testes: 3/3 testes de arquivos reais temporários aprovados: recusa de caminhos inseguros/symlinks/permissões, backups únicos e persistência após remover a release. Sem banco real.
Pendências: Relatório externo encontra backups dentro da release c2ab114d com diretório 2755 e CONTENT_SYNC_BACKUP_DIR ausente. Faltam dono/executor definido, diretório persistente privado, retenção, espaço e restauração revisada. Preservar backups existentes até plano autorizado; exposição HTTP e permissões de cada arquivo não foram demonstradas.
Próximo passo: Planejar/provisionar backup 0700/0600 fora de release/storage sob autorização; alinhar executor do sync com o proprietário, sem ampliar permissões para contornar separação ubuntu/pagina-deploy.
Commit relacionado: 1fb1ba40439540cb8f8d401193111c5dc02c855d

### HIGH-05

ID: HIGH-05
Status: Corrigido no código; conexão via URL relatada; validação completa da candidata pendente
Gravidade: Alto
Área: Banco de dados / configuracao de ambiente
Arquivo(s) auditado(s): server/db.ts; scripts/sync-packaged-content.mjs; drizzle.config.ts
Problema confirmado?: Sim. getDb inferia socket pela existência do arquivo; sync/export/category sync faziam fallback e import usava socket diretamente.
Evidência no código atual: shared/databaseConfig.mjs centraliza a escolha: DATABASE_URL explícita, ou ALLOW_VPS_SOCKET_DB=true. REMOTE_DATABASE_URL permanece apenas como compatibilidade de desenvolvimento. Startup de produção valida configuração antes de servir rotas.
Correção aplicada: Removido fallback implícito em servidor e quatro scripts de conteúdo; erro de configuração não inclui credenciais; /api/healthz executa SELECT 1 e retorna apenas saúde/modo, 503 na falha.
Arquivos alterados: shared/databaseConfig.mjs e .d.mts; server/db.ts; server/_core/env.ts, index.ts, databaseHealth.ts; scripts/sync-packaged-content.mjs, export-academy-content.mjs, sync-ebook-library-categories.mjs, import-ebooks.mjs; .env.example; server/securityAudit.database.test.ts; este progresso.
Testes executados: pnpm install --frozen-lockfile; pnpm check; pnpm exec vitest run server/securityAudit.database.test.ts server/securityAudit.backup.test.ts server/securityAudit.credentials.test.ts server/securityAudit.content.test.ts.
Resultado dos testes: Instalação concluída com pnpm 10.4.1, sem mudar lockfile; aviso de scripts de build de dependências ignorados. Typecheck aprovado. 17/17 testes aprovados em 4 arquivos; 9 cenários específicos de configuração/HTTP. Consultas com driver simulado, não banco real.
Pendências: Relatório externo confirma DATABASE_URL no processo e consulta de leitura em MySQL/MariaDB 10.11; não comprova nome esperado do schema, grants completos, engine nem execução da candidata. ALLOW_VPS_SOCKET_DB e REMOTE_DATABASE_URL ausentes não são falhas com DATABASE_URL. DEPLOY_RUNTIME_ENV_FILE é override opcional; padrão coincide com .env persistente relatado.
Próximo passo: Preservar a seleção por URL e confirmar adequação/formato/schema e acesso por serviço/executor de deploy. Conferir JWT, PUBLIC_APP_ORIGIN e SECURITY_AUDIT_DIR antes do startup da candidata; não habilitar socket por ausência indevidamente tratada como requisito.
Commit relacionado: efa0ed997f0ea07652d60cf4e3497c9df7d1fd8a

### HIGH-06

ID: HIGH-06
Status: Corrigido no código; execução do workflow de deploy não autorizada
Gravidade: Alto
Área: CI/CD / migrations / schema
Arquivo(s) auditado(s): .github/workflows/deploy-vps.yml
Problema confirmado?: Sim. Workflow comparava HEAD^ HEAD, ignorava falhas de diff e não preservava a ref de workflow_dispatch no checkout do deploy.
Evidência no código atual: scripts/check-schema-range.sh confere SHA completa/base disponível/ancestralidade e todo histórico/diff do intervalo. A SHA resolvida na validação é output consumido pelo checkout, artefato e deploy. check-release-schema.mjs confere schema contra release efetivamente ativa.
Correção aplicada: Push usa before -> SHA validada; dispatch exige deployed_sha, reconferida na VPS quando futuramente executado. Base desconhecida/schema divergente bloqueiam. Detecção cobre commits intermediários e reversões; comparação adicional de arquivos com release ativa cobre deploys anteriormente pulados/falhos. Validação offline de conteúdo no CI e bloqueio de chaves privadas. Tar exclui chaves/backups/logs privados.
Arquivos alterados: .github/workflows/deploy-vps.yml; scripts/check-schema-range.sh; scripts/check-release-schema.mjs; scripts/deploy-vps.sh; scripts/manual-deploy-worker.sh; server/securityAudit.schema.test.ts; CORRECOES_AUDITORIA/DECISOES_E_OPERACAO.md; este progresso.
Testes executados: pnpm exec vitest run server/securityAudit.schema.test.ts server/ebookLibraryPdf.integration.test.ts server/packagedEbooks.integration.test.ts server/securityAudit.sync.test.ts server/adminManualDeploy.integration.test.ts; parser YAML; bash -n em todos os blocos run e scripts alterados; node --check scripts/check-release-schema.mjs; git diff --check.
Resultado dos testes: Rodada focada: 21/21 em 5 arquivos; após complemento de rollback, suíte completa: 341/341 em 87 arquivos, incluindo 4 testes no arquivo schema. YAML e shell válidos. Nenhum workflow de deploy acionado; testes isolados não executam SSH/systemctl/VPS.
Pendências: Relatório externo informa SHA ativa c2ab114d; reconfirmar imediatamente antes de um futuro deploy e confrontar schema real. Workflow real não executado. Validação local com Node 22.23.2 concluída em 21/09; isso não equivale a aprovação do workflow nem validação da VPS.
Próximo passo: Manter bloqueio de schema/base desconhecida e usar SHA imutável validada; nenhuma autorização de merge/deploy foi acrescentada pelo recebimento do relatório.
Commit relacionado: 14c6355c3f5b2e46cf5655504f9f664f65adfcf1

### HIGH-07

ID: HIGH-07
Status: Corrigido no código; configuração operacional de auditoria ausente no relato da VPS
Gravidade: Alto
Área: Administracao / pagamentos / dados privados
Arquivo(s) auditado(s): server/_core/adminCommercialOperations.ts; server/_core/storageProxy.ts; server/_core/adminMemberManagement.ts
Problema confirmado?: Sim. REST administrativo e tRPC aceitavam sessão demo sem CSRF e sem autenticação recente/log persistente abrangente.
Evidência no código atual: Guardas administrativas REST chamam enforceAdminMutation; adminProcedure exige beginAdminMutation nas mutações; arquivo privado de auditoria escrito antes da ação; contexto consulta permissão atual no banco.
Correção aplicada: Autenticação recente de 15 minutos e trilha privada para mutações; exclusão agendada registra ator; listagem GET deixa de disparar purge; acesso a comprovante verifica bloqueio do membro.
Arquivos alterados: server/_core/adminAudit.ts, trpc.ts, adminMemberManagement.ts, adminCommercialOperations.ts, adminContentManagement.ts, adminRelationshipMaintenance.ts, manualDeploy.ts, index.ts; server/demoAuth.ts; .env.example; .gitignore; teste admin.
Testes executados: Log real em diretório temporário: início/fim, ator, ausência de cookie/email; recusa de sessão vencida/ausente e de produção sem diretório persistente; suíte completa.
Resultado dos testes: 3 cenários focados aprovados; suíte 313/313; typecheck aprovado após correção de nulidade.
Pendências: Relatório recebido informa SECURITY_AUDIT_DIR ausente, serviço ubuntu e arquivos de deploy pagina-deploy. Definir diretório privado persistente acessível ao executor correto, retenção e reconciliação de started sem final. Não houve teste real de mutação/autenticação recente; relatório e testes locais não demonstram escrita real de auditoria.
Próximo passo: Confirmar permissões, retenção de logs e novo login administrativo no ambiente autorizado.
Commit relacionado: d70c3ab9ad4f8b3704495a9de5b2f7c6fa1b1f13

### MED-01

ID: MED-01
Status: Corrigido
Gravidade: Medio
Área: Documentacao / operacao de conteudo
Arquivo(s) auditado(s): README.md; docs/CONTENT_BOOTSTRAP.md; server/packagedEbooks.integration.test.ts; ebook-import/ebook-manifest.tsv
Problema confirmado?: Sim; README/docs diziam 87 e-books e 16 módulos/29 aulas. A auditoria recebida também estava desatualizada nos totais da Academia.
Evidência no código atual: --validate-only nos manifestos e PDFs da branch: 88 e-books, 11 cursos, 17 módulos e 30 aulas; o glossário acrescenta módulo/aula e os testes existentes já esperavam 17/30.
Correção aplicada: Atualizadas contagens operacionais com base nos arquivos reais, além das instruções de banco, gate, backup e rollback.
Arquivos alterados: README.md; docs/CONTENT_BOOTSTRAP.md; este progresso.
Testes executados: node scripts/sync-packaged-content.mjs --validate-only; testes de catálogo e integridade empacotada.
Resultado dos testes: Validação de arquivos sem banco aprovada; 21/21 na rodada schema/conteúdo que inclui ambos os testes de catálogo.
Pendências: As contagens documentadas devem ser revisadas ao alterar manifestos; não são contagens observadas na VPS.
Próximo passo: Manter --validate-only no CI e incluir contagens na revisão de mudanças de conteúdo.
Commit relacionado: 2799d341b6a29e7f68498aca1ffd002d341e4e98

### MED-02

ID: MED-02
Status: Corrigido
Gravidade: Medio
Área: Testes / manutencao
Arquivo(s) auditado(s): server/packagedEbooks.integration.test.ts
Problema confirmado?: Sim; packagedEbooks.integration.test.ts fixava 88 em dois asserts.
Evidência no código atual: Teste agora lê o TSV independentemente e compara conjuntos completos de sourceIds/quantidade, exige manifesto não vazio e sem duplicatas, mantendo os materiais críticos e contrato PDF.
Correção aplicada: Contagem derivada do manifesto e assert de correspondência integral. Ajustado o teste textual legado para backup compartilhado/transação; os comportamentos são cobertos pelos testes de sync/backup.
Arquivos alterados: server/packagedEbooks.integration.test.ts; server/ebookLibraryPdf.integration.test.ts; este progresso.
Testes executados: pnpm exec vitest run server/securityAudit.schema.test.ts server/ebookLibraryPdf.integration.test.ts server/packagedEbooks.integration.test.ts server/securityAudit.sync.test.ts server/adminManualDeploy.integration.test.ts.
Resultado dos testes: 21/21 aprovados em 5 arquivos. Falha anterior nesta etapa: assert textual esperava ebook-category-sync- e fluxo antigo. Causa: nova implementação; expectativa atualizada preservando exigência de backup e ampliando teste comportamental. Não era falha preexistente.
Pendências: Nenhuma pendência local deste achado; suíte completa aprovada no fechamento (87 arquivos / 341 testes).
Próximo passo: Preservar comparação integral com o manifesto e verificações dos materiais críticos nas futuras alterações.
Commit relacionado: 2799d341b6a29e7f68498aca1ffd002d341e4e98

### MED-03

ID: MED-03
Status: Avaliado; diagnóstico implementado; schema e inspeção real bloqueados
Gravidade: Medio
Área: Integridade relacional / banco
Arquivo(s) auditado(s): drizzle/schema.ts; server/db.ts
Problema confirmado?: Ausência de FKs declaradas para relações relevantes confirmada no schema versionado; ausência de FKs/órfãos no banco vivo não foi verificada.
Evidência no código atual: drizzle/schema.ts define IDs e índices, enquanto purgeMember faz limpeza manual. courseProgress.courseId usa IDs de cursos, grupos sintéticos e leitura codificada de e-books; FK direta para courses seria incorreta.
Correção aplicada: Verificador de 19 relações/variantes críticas com READ ONLY, apenas contagens, falha explícita em diagnóstico incompleto e separação das faixas de curso/progresso. Sem correção automática de dados ou schema.
Arquivos alterados: scripts/check-relational-integrity.mjs; server/securityAudit.integrity.test.ts; docs/CONTENT_BOOTSTRAP.md (2799d34); este progresso.
Testes executados: pnpm exec vitest run server/securityAudit.publicSurface.test.ts server/securityAudit.integrity.test.ts server/securityAudit.academyExport.test.ts.
Resultado dos testes: 6/6 aprovados em 3 arquivos; 2 cenários do verificador com driver simulado confirmam read-only, contagens, faixas de IDs e cleanup em falha. Nenhuma consulta à VPS.
Pendências: Relatório comprova somente consulta de versão/banco e agregação de administradores; não verifica FKs ou referências órfãs. Ausência do script no release antigo não prova inconsistência nem justifica elevar automaticamente a gravidade. Diagnóstico real, reconciliação de IDs sintéticos e eventual schema continuam dependentes de autorização específica.
Próximo passo: Revisar resultados reais antes de decidir sobre FKs; nunca apagar automaticamente dados financeiros/progresso.
Commit relacionado: 139bbee25f70c7439e271d0557dfa6fdbea338a6

### MED-04

ID: MED-04
Status: Avaliado e parcialmente corrigido; disciplina operacional pendente
Gravidade: Medio
Área: Conteudo administrativo / fonte da verdade
Arquivo(s) auditado(s): server/academyCanonical.ts; server/routers.ts; scripts/export-academy-content.mjs; scripts/sync-packaged-content.mjs
Problema confirmado?: Sim. updateAcademyCoursePublication grava coursePublished no meta HTML do banco; sync usa manifestos. Exportador não preservava published, perdendo a despublicação ao promover o export.
Evidência no código atual: Publicação no painel ainda altera o estado do banco. O novo export inclui published e segue a regra do leitor: qualquer aula despublicada mantém o grupo despublicado.
Correção aplicada: Exportação de publicação corrigida e feita em READ ONLY. Documentada matriz de fonte da verdade: estrutura/publicação canônica deve ser exportada, revisada e commitada; resumo/HTML curado e metadados extras preservados no sync. Não foram inventadas tabelas de overrides.
Arquivos alterados: scripts/export-academy-content.mjs; server/securityAudit.academyExport.test.ts; scripts/sync-packaged-content.mjs (acf4dc1); docs/CONTENT_BOOTSTRAP.md (2799d34); este progresso.
Testes executados: Suíte focada de 3 arquivos dos médios; node --check scripts/export-academy-content.mjs; testes de curadoria/idempotência no sync.
Resultado dos testes: 6/6 testes dos médios aprovados, incluindo 2 de exportação. Grupo despublicado permanece false, ordem e curadoria preservadas; materiais sem curso ignorados. Driver real e painel da VPS não utilizados.
Pendências: O painel não cria export/commit automaticamente. Operador deve seguir o fluxo documentado antes de autorizar sync; a adesão real não foi comprovada. Mudanças de título/arquivo/categoria exigem também revisão do TSV/catálogo, não só JSON da Academia.
Próximo passo: Confrontar eventual curadoria da VPS com o Git em etapa autorizada e aprovar a política operacional; não executar sync automático para resolver divergência.
Commit relacionado: e0b60207b8f177209b16fa17c671fb8b4825c67c

### MED-05

ID: MED-05
Status: Corrigido
Gravidade: Medio
Área: Exposicao de informacao operacional
Arquivo(s) auditado(s): server/_core/deployStatus.ts
Problema confirmado?: Sim. /api/deploy-status retornava SHA/stage sem autenticação.
Evidência no código atual: Rota e variante com prefixo agora resolvem a sessão pelo autenticador existente e exigem papel admin atual antes de ler/retornar estado; respostas sem cache.
Correção aplicada: 403 para visitante/membro; 503 sanitizado em falha; administrador mantém o contrato detalhado usado pelo componente existente.
Arquivos alterados: server/_core/deployStatus.ts; server/securityAudit.publicSurface.test.ts; este progresso.
Testes executados: pnpm exec vitest run server/securityAudit.publicSurface.test.ts server/securityAudit.integrity.test.ts server/securityAudit.academyExport.test.ts.
Resultado dos testes: 6/6 na rodada; teste HTTP local confirma visitante/membro recusados, admin autorizado e ausência de detalhes em erro. Sessão/driver simulados; autenticação real já coberta pela suíte de segurança existente.
Pendências: Confirmar visualização do status por administrador real no ambiente de homologação/VPS quando autorizado.
Próximo passo: Validar acesso por administrador real em ambiente autorizado; não reabrir a rota pública para contornar falhas de sessão.
Commit relacionado: 0070b6c89e336f01ed7b02bf0f51e617cdf5a71c

### MED-06

ID: MED-06
Status: Corrigido preservando o contrato de remoção da Home
Gravidade: Medio
Área: Biblioteca publica / status de imagens
Arquivo(s) auditado(s): server/db.ts
Problema confirmado?: Parcialmente: API devolvia URL/metadados de imagens removidas, mas a Home já ocultava essas imagens ao ver status removed.
Evidência no código atual: Home.tsx resolveSectionImage retorna null para removed. Filtrar a linha inteira reativaria a imagem padrão do pacote. Essa recomendação da auditoria exigiu adaptação ao código real.
Correção aplicada: SQL retorna URL apenas de active; removed devolve somente sectionId/status/imageUrl null. Removidos originalName, contentType e updatedAt da projeção pública. Consulta admin mantém histórico completo.
Arquivos alterados: server/db.ts; server/securityAudit.publicSurface.test.ts; este progresso.
Testes executados: Suíte focada dos médios; teste usa projeção SQL real/driver simulado e verifica retorno público/admin.
Resultado dos testes: 6/6 na rodada; imagem ativa visível, URL removida ausente, marcador removed preservado, dados administrativos omitidos da API pública e histórico mantido no admin.
Pendências: Não houve inspeção visual no domínio real; esta correção não apaga fisicamente arquivos previamente públicos no storage.
Próximo passo: Validar comportamento final com dados reais em etapa autorizada; preservar o marcador de remoção ao evoluir a API.
Commit relacionado: 0070b6c89e336f01ed7b02bf0f51e617cdf5a71c


## Continuidade em 2026-09-20 — retomada em 1ffbc55

- Os quatro arquivos de continuidade foram lidos integralmente. AUDITORIA_RECEBIDA.md é a versão integral (356 linhas); AUDITORIA_QUALIDADE_ACEITAVEL.md contém apenas referência. O anexo AUDITORIA_QUALIDADE_ACEITAVEL-1.md não foi localizado entre os arquivos disponíveis; não se presume que seu conteúdo tenha sido comparado.
- Branch remota confirmada em 1ffbc55bbbe89c8a2a1f9174b986369f1ed16e97; main em c2ab114d8be7328b7a64eb60d1afb96841f2179c. Clone novo e limpo da branch autorizada. A cópia local antiga com modificações de terceiros foi preservada.
- Corrigidos anteriormente: CRIT-01, CRIT-02 (8505c3c) e HIGH-01, HIGH-02, HIGH-07 (d70c3ab). Não reaplicados. Último resultado registrado: typecheck e 80 arquivos / 313 testes aprovados.
- Retomada por HIGH-03: confirmados sync desacoplado do deploy, fallback de banco e backup relativo. Dependências HIGH-04/HIGH-05 serão resolvidas antes do gate de conteúdo. Estratégia: dry-run verificável obrigatório antes de ativação, sem apply automático, transação/backup em sync expressamente solicitado e preservação de curadoria.
- HIGH-06: confirmado HEAD^ HEAD e divergência adicional entre checkout de validação e checkout/artefato de workflow_dispatch. Planejado fixar SHA e validar todo o intervalo; base de deploy desconhecida deve bloquear, não liberar.
- Validação planejada: configuração inválida deve impedir conexão; caminhos privados/fora de releases devem ser obrigatórios para backup; dry-run nunca escreve; falha no apply deve reverter transação; divergências devem impedir ativação; CI deve bloquear schema mesmo em commit anterior; rotas públicas não devem fornecer detalhes de deploy/imagens removidas.
- Nenhum deploy, migration, alteração de schema, acesso à VPS ou escrita em banco real executado. Instalação com pnpm 10.4.1 iniciada; resultados serão registrados após execução.

### CRIT-03 — achado adicional confirmado durante a continuidade

ID: CRIT-03
Status: Mitigado no código; bloqueado operacionalmente
Gravidade: Critico
Área: Credencial privada versionada / operação
Arquivo(s) auditado(s): attached_assets/Maquinas-50GB_1789167740877.pem; .gitignore
Problema confirmado?: Sim, arquivo rastreado no commit inicial contém chave privada RSA aceita por node:crypto.createPrivateKey. Conteúdo não exibido nem utilizado para acesso.
Evidência no código atual: Chave privada presente na árvore de 1ffbc55; pacote tar do deploy incluía attached_assets. Não se sabe se a chave está ativa ou em quais sistemas foi autorizada.
Correção aplicada: Chave removida da árvore atual; regras no .gitignore, bloqueio de cabeçalhos de chave privada no CI e exclusão de chaves/backups/logs privados do pacote de deploy. Histórico remoto não reescrito. Após autorização explícita do usuário, apagada também a cópia local ignorada pelo Git; ausência reconfirmada na árvore remota.
Arquivos alterados: attached_assets/Maquinas-50GB_1789167740877.pem (removido); .gitignore; .github/workflows/deploy-vps.yml; este progresso.
Testes executados: Tipo validado localmente sem exibir bytes; varredura de todos os blobs novos antes da publicação; comparação das árvores locais/remotas; verificação de ausência do arquivo no disco, índice e árvore remota; git check-ignore; varredura de cabeçalhos privados rastreados; git diff --check.
Resultado dos testes: Nenhum blob novo contém chave privada; o blob removido já pertence ao commit remoto inicial e não estava nos objetos pendentes. Chave ausente da árvore publicada e do diretório de trabalho após a exclusão autorizada. A chave não foi utilizada nem exibida; histórico anterior permanece acessível.
Pendências: Revogação/rotação e inspeção de cópias/artefatos antigos continuam sem comprovação também no relatório externo de 21/09. A árvore Git c2ab114d inclui o caminho da chave; sua presença física atual na VPS não foi verificada. Remoção na branch não remove versões históricas nem revoga credencial. Não recuperar/usar a chave para testar acesso.
Próximo passo: Responsável autorizar e executar tratamento da credencial fora desta etapa; manter bloqueio de liberação operacional até evidência de revogação ou prova de que não é usada.
Commit relacionado: 63df8da9b556af1e18182e68c9897863dde4a4c3; prevenção no CI em 14c6355c3f5b2e46cf5655504f9f664f65adfcf1

Nota de correção de evidência: o texto inicial do commit acf4dc1 registrou incorretamente aprovação integral e contagem 16/29 antes de incorporar o resultado da rodada ampla. Corrigido explicitamente nesta continuidade: 24 passaram/1 falhou e contagem real 17 módulos/30 aulas. O histórico não foi reescrito; não houve execução na VPS.

## Complemento confirmado de HIGH-03 — propagação de falha no deploy

- Evidência: `fail()` no deploy usava `exit 1`, que encerra o shell sem disparar o trap ERR. Falha pós-ativação de health podia, portanto, pular o rollback definido no próprio script.
- Correção cirúrgica: `return 1` preserva código de erro e deixa `set -e`/trap ERR encaminhar ao rollback.
- Teste real de Bash isolado usa somente a declaração de fail() extraída do arquivo; erro simulado retorna 1 e dispara trap, sem executar deploy-vps.sh, systemctl, SSH ou VPS.
- Validação após a mudança: suíte completa 87 arquivos / 341 testes aprovada. O typecheck e build haviam passado no mesmo código TypeScript; esta mudança adicional afeta apenas shell/teste. `bash -n` aprovado.
- Startup do artefato compilado em NODE_ENV=production, sem DATABASE_URL/socket opt-in: recusado com exit 1 antes de abrir listener. Nenhuma tentativa de conexão real.


## Fechamento da continuidade em 2026-09-20

### Validação executada

Ambiente: Node 24.19.0 e pnpm 10.4.1; pnpm global 11 era incompatível e não foi usado. CI continua configurado para Node 22; Node 22 não foi executado localmente. DATABASE_URL, REMOTE_DATABASE_URL e ALLOW_VPS_SOCKET_DB foram retiradas do ambiente das verificações; os cenários de banco utilizam driver simulado. Não houve conexão a banco real.

| Comando/verificação | Resultado real |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit 0; concluído em 6m39s; lockfile preservado. Aviso de scripts de build de @tailwindcss/oxide e esbuild ignorados; build posterior funcionou sem liberar permissões adicionais. |
| `pnpm check` | Exit 0; TypeScript sem erros. |
| `pnpm test` | Exit 0; 87 arquivos e 341 testes aprovados após a correção final de rollback. |
| `pnpm build` | Exit 0; Vite e esbuild concluídos. Aviso de chunks acima de 500 kB: bundle JS 1.728,16 kB (gzip 434,48 kB). Não foi feita refatoração de bundles nem suprimido o aviso. |
| `node scripts/sync-packaged-content.mjs --validate-only` | Exit 0; manifestos/PDFs reais: 88 e-books, 11 cursos, 17 módulos e 30 aulas. Sem banco. |
| `bash -n scripts/deploy-vps.sh scripts/manual-deploy-worker.sh scripts/check-schema-range.sh` | Exit 0; também validados os blocos shell extraídos do YAML. |
| Parse de `.github/workflows/deploy-vps.yml` | YAML válido; evento push continua limitado a main. Nenhum workflow de deploy acionado. |
| Startup compilado com `NODE_ENV=production`, sem URL/socket opt-in | Exit 1 esperado: DATABASE_URL obrigatória; processo recusou iniciar antes de abrir listener. Teste negativo aprovado, sem conexão. |
| `git diff --check` e comparação de árvores locais/remotas | Sem erro; conteúdo publicado idêntico ao testado em cada um dos dez commits. |
| Diff de `drizzle/`, `drizzle.config.ts` e `pnpm-lock.yaml` desde 1ffbc55 | Vazio; schema e lockfile preservados. |

O build/typecheck foram executados antes do complemento final de rollback; após esse complemento, que altera apenas shell e teste, foram repetidos a suíte completa e bash -n. Drivers simulados não comprovam comportamento/permissões de um MySQL real. Browser, proxy, systemd, restauração e Node 22 ainda exigem validação em ambiente autorizado.

### Falha intermediária e correção

- Comando: `pnpm exec vitest run server/securityAudit.sync.test.ts server/securityAudit.backup.test.ts server/packagedEbooks.integration.test.ts server/ebookLibraryPdf.integration.test.ts server/adminManualDeploy.integration.test.ts server/publicHeroTitleDeploy.integration.test.ts`.
- Resultado inicial: 24 testes aprovados e 1 falhou; assert textual em ebookLibraryPdf.integration.test.ts ainda esperava `ebook-category-sync-` e o fluxo antigo de backup.
- Causa: mudança desta etapa para o helper compartilhado e transação; não era falha preexistente na base.
- Correção: contrato textual atualizado, mantendo exigência de backup e verificando comportamento de persistência/transação em testes próprios.
- Próximo passo recomendado: atendido; rodada focada subsequente e suíte completa passaram. A nota acima preserva a correção do registro prematuro no histórico, sem ocultar o erro de evidência.

### Publicação e rastreabilidade

A primeira tentativa via Git CLI foi rejeitada pela revisão automática sob alegação de envio da chave no histórico. A verificação posterior provou, sem mostrar seu conteúdo, que a chave já existia no commit remoto 1ffbc55, estava ausente da árvore nova e não integrava os objetos novos a enviar; nenhum blob novo continha chave privada. A tentativa seguinte foi permitida, mas falhou por ausência de credencial HTTPS do Git CLI (`could not read Username`).

Os commits foram então publicados pela conexão GitHub, com atualização fast-forward apenas de fix/auditoria-qualidade-aceitavel, sem force, e conferência de igualdade das árvores de cada commit. Os hashes remotos diferem dos hashes locais iniciais por autoria/data do mecanismo de publicação; o conteúdo de cada árvore é idêntico. O clone foi alinhado à branch publicada somente após confirmar árvore e diretório de trabalho limpos. Nenhum histórico remoto foi reescrito.

| Commit publicado | Alteração |
| --- | --- |
| `63df8da9b556af1e18182e68c9897863dde4a4c3` | fix: remover chave privada versionada |
| `efa0ed997f0ea07652d60cf4e3497c9df7d1fd8a` | fix: exigir selecao explicita do banco |
| `1fb1ba40439540cb8f8d401193111c5dc02c855d` | fix: persistir backups privados fora das releases |
| `acf4dc16a31d181416f3ac0f0ae8260212e3ca37` | fix: verificar conteudo antes da ativacao e tornar sync transacional |
| `14c6355c3f5b2e46cf5655504f9f664f65adfcf1` | fix: validar intervalo de schema e publicar a SHA conferida |
| `2799d341b6a29e7f68498aca1ffd002d341e4e98` | test: alinhar validacao do catalogo e documentacao operacional |
| `139bbee25f70c7439e271d0557dfa6fdbea338a6` | feat: diagnosticar integridade relacional sem escrita |
| `e0b60207b8f177209b16fa17c671fb8b4825c67c` | fix: preservar publicacao na exportacao da academia |
| `0070b6c89e336f01ed7b02bf0f51e617cdf5a71c` | fix: restringir status de deploy e sanitizar imagens removidas |
| `f3b0859dbb1db7c43450c74c5f0766202f75e63d` | fix: propagar falhas do deploy ao rollback |

### Arquivos alterados nesta etapa

Lista completa em relação à retomada 1ffbc55 (35 arquivos, incluindo a remoção da chave):

- `.env.example`.
- `.github/workflows/deploy-vps.yml`.
- `.gitignore`.
- `CORRECOES_AUDITORIA/DECISOES_E_OPERACAO.md`.
- `CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md`.
- `README.md`.
- `attached_assets/Maquinas-50GB_1789167740877.pem` (removido).
- `docs/CONTENT_BOOTSTRAP.md`.
- `scripts/check-relational-integrity.mjs`.
- `scripts/check-release-schema.mjs`.
- `scripts/check-schema-range.sh`.
- `scripts/deploy-vps.sh`.
- `scripts/export-academy-content.mjs`.
- `scripts/import-ebooks.mjs`.
- `scripts/lib/content-sync-backup.mjs`.
- `scripts/manual-deploy-worker.sh`.
- `scripts/sync-ebook-library-categories.mjs`.
- `scripts/sync-packaged-content.mjs`.
- `server/_core/databaseHealth.ts`.
- `server/_core/deployStatus.ts`.
- `server/_core/env.ts`.
- `server/_core/index.ts`.
- `server/academyCanonical.ts`.
- `server/db.ts`.
- `server/ebookLibraryPdf.integration.test.ts`.
- `server/packagedEbooks.integration.test.ts`.
- `server/securityAudit.academyExport.test.ts`.
- `server/securityAudit.backup.test.ts`.
- `server/securityAudit.database.test.ts`.
- `server/securityAudit.integrity.test.ts`.
- `server/securityAudit.publicSurface.test.ts`.
- `server/securityAudit.schema.test.ts`.
- `server/securityAudit.sync.test.ts`.
- `shared/databaseConfig.d.mts`.
- `shared/databaseConfig.mjs`.

### Pendências e condição de continuidade

- **CRIT-03, bloqueio crítico:** responsável precisa revogar/rotacionar a chave onde estiver autorizada, verificar acessos/cópias/artefatos antigos e decidir tratamento do histórico. Remover do Git atual não revoga uma credencial. Não usar a chave para testar acesso.
- **HIGH-03/04/05/06, comprovação operacional bloqueada:** confirmar SHA ativa, banco/schema, configuração compartilhada entre serviço/deploy, segredo/origem/login real/logs privados já exigidos na etapa anterior; provisionar backup privado persistente, revisar dry-run/exportações e testar restauração. Somente então considerar autorização de sync/apply e deploy. O gate pode bloquear deploy enquanto houver divergência; não há apply automático.
- **MED-03:** diagnóstico real somente com acesso autorizado de leitura; reconciliação de dados e eventual desenho de FKs dependem de autorização de schema. IDs sintéticos de courseProgress exigem tratamento específico, não FK direta indiscriminada.
- **MED-04:** o painel ainda não exporta/commita automaticamente; seguir a matriz de fonte da verdade antes de qualquer sync aprovado, incluindo revisão do TSV para títulos/categorias/arquivos de e-books.
- **Validação restante naquela etapa:** Node 22 foi posteriormente concluído localmente em 21/09, conforme atualização acima. Workflow real, autenticação, health, conteúdo e rollback na VPS continuam pendentes; asserções locais e build não demonstram seu estado operacional.

Todos os críticos e altos estão corrigidos no código ou têm bloqueio/evidência explícitos acima; os seis médios foram avaliados. Nenhuma autorização operacional foi presumida. O próximo trabalho é resolver os bloqueios documentados, sem reiniciar a auditoria e sem reaplicar as correções já publicadas.


## Complemento — exclusão do arquivo autorizada pelo usuário

- Pedido: apagar `attached_assets/Maquinas-50GB_1789167740877.pem` e aplicar a correção.
- Estado conferido antes da ação: o arquivo já estava removido do índice e da árvore publicada da branch (remoção em 63df8da); havia uma cópia local ignorada pelo Git. Branch local/remota em 6de1284, sem modificações pendentes.
- Ação: apagada somente essa cópia local; mantidas as regras de .gitignore, o bloqueio de chaves privadas no CI e a exclusão de *.pem/*.key do pacote de deploy. Conteúdo da chave não exibido nem utilizado.
- Validação: ausência no disco, índice e árvore Git publicada; regra de ignore vigente; nenhum cabeçalho de chave privada nos arquivos rastreados; git diff --check aprovado.
- Nesta continuação, apenas o registro de progresso é alterado no Git, pois a remoção versionada já estava publicada. Instalação, typecheck, suíte e build não repetidos: nenhum código executável ou dependência foi alterado. Mantidos os resultados anteriores de 341 testes aprovados.
- Limite: apagar o arquivo não comprova revogação da credencial. Nenhuma alteração da main, reescrita do histórico, ação na VPS, deploy ou migration executada.


## Complemento de 21/09/2026 — relatório operacional e Node 22

### Origem das evidências

O usuário forneceu relatório de outra IA conectada à VPS, com data do exame em 21/09/2026 (Brasília). Preservado em RELATORIO_VPS_RECEBIDO_2026-09-21.md, inclusive as classificações/ordem originais. A análise das divergências entre esse texto e os requisitos do código está em DECISOES_E_OPERACAO.md. Não houve inspeção independente da VPS por este assistente, nem envio de instruções diretamente ao outro executor.

A branch foi reconferida em e9383934a6c460a62f466dbfb0dca66269ee2274 antes das alterações documentais. O relato da versão antiga e da configuração incompleta não é evidência de regressão da branch corrigida. Não foram alterados código executável, schema, package.json ou pnpm-lock.yaml nesta continuação.

### Verificações locais realmente executadas com Node 22.23.2

A versão informada no relatório foi obtida em diretório de ferramentas isolado, fora do projeto e da VPS. A versão do executável foi conferida antes dos comandos. pnpm 10.4.1 selecionado por PATH; variáveis de conexão removidas do ambiente e ausência de .env local verificada. A instalação frozen reaproveitou node_modules, sem alterar o lockfile; não se tratou de uma instalação limpa em máquina nova.

| Comando | Resultado observado |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit 0; lockfile já em dia e preservado; dependências já presentes; 757 ms. |
| `pnpm check` | Exit 0; sem erro de TypeScript. |
| `pnpm test` | Exit 0; 87 arquivos / 341 testes aprovados; 6,83 s. |
| `pnpm build` | Exit 0; Vite e esbuild concluídos; aviso de bundle JS acima de 500 kB, sem supressão. |
| `node scripts/sync-packaged-content.mjs --validate-only` | Exit 0; 88 e-books, 11 cursos, 17 módulos e 30 aulas; sem banco. |
| `git diff --check` e revisão do escopo documental | Sem erro; nenhum arquivo executável/schema/dependência alterado. |

Avisos observados: EnvHttpProxyAgent experimental no runtime desta sessão, scripts de dependências @tailwindcss/oxide e esbuild ignorados pelo pnpm, aviso de atualização disponível do gerenciador e tamanho dos bundles. Não foram alteradas versões do projeto, liberados scripts adicionais ou reduzidas proteções para passar. Nenhuma falha nas execuções Node 22 desta etapa.

Esses resultados encerram a pendência de validação local com Node 22. Não validam MariaDB real, configuração efetiva do serviço, instalação limpa do artefato no servidor, login real, proxy, permissões ou rollback na VPS. O workflow existente contém deploy e não foi acionado.

### Próximo trabalho concreto

1. Fazer o responsável definir a identidade administrativa real e um procedimento de preparação que preserve dados/referências; não promover ou renomear demos automaticamente.
2. Validar/configurar JWT, origem pública, login local e diretórios privados sob autorização. Preservar a conexão por DATABASE_URL se confirmada adequada; as variáveis opcionais não devem ser introduzidas por engano.
3. Confirmar schema/engine/grants e conteúdo com a candidata, antes de ativação. Eventual escrita de sync deve ter autorização própria, backup e revisão de curadoria.
4. Autorizar separadamente a implantação da SHA validada somente depois de satisfeitos esses pré-requisitos, incluindo tratamento do risco de credencial e plano de retorno. Validar saúde e acesso administrativo após ativação.

Receber o relatório não autoriza executar essas mudanças. As pendências operacionais continuam explícitas nos respectivos achados e as correções já publicadas foram preservadas.

Validação documental intermediária: `git diff --cached --check` retornou exit 2 por oito linhas com espaços finais usados como quebra de Markdown no relatório recém-adicionado. Causa desta atualização documental, sem relação com o código/testes ou com a VPS. Normalizadas as quebras para linhas em branco; reexecução de git diff --cached --check aprovada com exit 0 antes do commit.
