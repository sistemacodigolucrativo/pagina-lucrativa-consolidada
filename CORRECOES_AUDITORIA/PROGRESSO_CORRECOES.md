# Progresso das correções da auditoria

Última atualização: 2026-09-20T11:04:45+00:00
Repositório: sistemacodigolucrativo/pagina-lucrativa-consolidada
Branch de trabalho: fix/auditoria-qualidade-aceitavel
SHA base da main no início: c2ab114d8be7328b7a64eb60d1afb96841f2179c

## Escopo e limites

Auditoria recebida preservada integralmente em AUDITORIA_RECEBIDA.md. A main remota é a fonte primária. Clone limpo criado nesta sessão; nenhuma alteração de terceiros encontrada. Não executar deploy, migrations, alteração de schema ou escrita na VPS. Não fazer merge na main. Acesso de leitura e escrita via GitHub confirmado; branch remota criada na SHA base.

## Plano e critérios de validação

1. Confirmar os 15 achados no código fixado na SHA base.
2. Fechar contas demo em produção e exposição de controles internos, com testes negativos de autorização.
3. Corrigir hashing e CSRF; preservar login real e validar credenciais legadas.
4. Tornar configuração de banco, backups, sync e guard de schema explícitos e seguros; testar sem banco de produção.
5. Avaliar médios, executar pnpm install --frozen-lockfile, pnpm check, pnpm test e pnpm build.
6. Salvar cada bloco em commit incluindo este arquivo e publicar na branch. Inspeção da VPS e validação operacional ficam pendentes sem acesso/autorização.

## Estado de execução

- Base original: pnpm check aprovado; 75 arquivos / 281 testes aprovados.
- pnpm 10.4.1 instalado e usado, lockfile preservado; pnpm global 11 incompatível. Node local 24.19.0, CI 22.
- Críticos publicados: 8505c3c38f38690dd34852d0948799f9ffd01ef1.
- Bloco segurança: 80 arquivos / 313 testes aprovados; typecheck final do bloco aprovado. Falhas intermediárias: teste de logout ainda esperava SameSite=None (atualizado para contrato Lax); TS18047 control possivelmente null no log de purge (condição corrigida). Ambas foram introduzidas/reveladas pelo ajuste desta branch, não falhas da base.
- Publicações pela conexão GitHub, pois Git CLI não possui credencial. Nenhum force, merge ou alteração da main.
- Próximo passo: banco/sync/backups/CI e avaliação dos médios. Nenhuma operação na VPS.

## Achados

### CRIT-01

ID: CRIT-01
Status: Corrigido
Gravidade: Critico
Área: Seguranca administrativa / autenticacao
Arquivo(s) auditado(s): server/demoAuth.ts; server/_core/context.ts; server/_core/trpc.ts; server/_core/adminMemberManagement.ts; server/_core/adminCommercialOperations.ts; server/_core/manualDeploy.ts
Problema confirmado?: Sim, por leitura e testes: a base aceitava contas demo fixas sem distinção de produção.
Evidência no código atual: Base: server/demoAuth.ts resolveDemoAccount/resolveDemoSession; contexto e 6 módulos REST confiavam no payload. Falta de JWT_SECRET caía em chave constante. Branch: authConfig.ts exige opt-in, impede demo em produção e valida segredo; resolveDemoSession consulta usuário/permissão no banco e vincula sessão à credencial.
Correção aplicada: Demo impossível em produção; login real no banco somente com ENABLE_LOCAL_AUTH=true; segredo validado no startup; sessão real revogada após senha alterada/usuário excluído; permissão atual do banco; hashes omitidos do usuário devolvido; falha ao consultar bloqueio em produção nega acesso.
Arquivos alterados: server/demoAuth.ts; server/_core/authConfig.ts, context.ts, index.ts, adminCommercialOperations.ts, adminContentManagement.ts, adminMemberManagement.ts, adminRelationshipMaintenance.ts, manualDeploy.ts, storageProxy.ts; .env.example; scripts/prepare-workspace.sh; testes de autenticação.
Testes executados: pnpm check; vitest run securityAudit.auth, securityAudit.content, demoAuth, context.auth, functionalPersistence.
Resultado dos testes: Typecheck aprovado; 19 testes aprovados, incluindo negativos de produção e consulta simulada ao banco. Não houve login em VPS.
Pendências: Antes de implantação autorizada, configurar segredo aleatório e ENABLE_LOCAL_AUTH=true para contas reais; confirmar administrador real não-demo no banco. Sessões reais antigas exigirão novo login. Não há provedor OAuth ativo no entrypoint; não foi inventado um provedor.
Próximo passo: Validar acesso administrativo real em ambiente controlado antes de deploy.
Commit relacionado: Bloco fix: bloquear autenticacao demo em producao e isolar conteudo interno; SHA consultável no histórico deste arquivo.

### CRIT-02

ID: CRIT-02
Status: Corrigido
Gravidade: Critico
Área: Privacidade / conteudo interno / permissoes
Arquivo(s) auditado(s): server/db.ts; server/routers.ts; server/_core/adminMemberManagement.ts
Problema confirmado?: Sim. getPublishedContent filtrava apenas published e retornava member-admin-control.
Evidência no código atual: Base: server/db.ts getPublishedContent; adminMemberManagement.ts saveControl grava published. Branch: filtro SQL e filtro defensivo em memória excluem todas as quatro categorias internas conhecidas; createdBy não é retornado.
Correção aplicada: Política compartilhada de categorias internas e tipos permitidos; preservados materiais, artigos, FAQ e avisos públicos comuns.
Arquivos alterados: server/db.ts; server/memberContentPolicy.ts; server/_core/adminContentManagement.ts; server/securityAudit.content.test.ts.
Testes executados: Teste executa getPublishedContent com resultado de driver simulado contendo controles, configurações, rascunhos e conteúdos comuns.
Resultado dos testes: Somente os 2 conteúdos públicos esperados retornaram; nenhum registro interno nem createdBy. Typecheck aprovado.
Pendências: Confirmar resultado com dados da VPS em validação operacional autorizada.
Próximo passo: Manter categorias internas futuras na política compartilhada.
Commit relacionado: Mesmo bloco de correção dos críticos; consultar git log deste arquivo.

### HIGH-01

ID: HIGH-01
Status: Corrigido
Gravidade: Alto
Área: Senhas / recuperacao de conta
Arquivo(s) auditado(s): server/credentialHash.ts; server/criticalFlowFixes.ts; server/db.ts
Problema confirmado?: Sim. SHA-256 simples em senha, resposta de recuperação e seed.
Evidência no código atual: Base credentialHash.ts hashPassword; db.ts autenticação/cadastro/recuperação; criticalFlowFixes.ts; seed-demo.ts. Branch usa formato scrypt versionado com salt individual, custo e fila limitada.
Correção aplicada: scrypt assíncrono N=16384/r=8/p=5; migração condicional no login correto; gravação moderna em cadastro/troca/recuperação; seed moderno somente fora de produção; recuperação pública não atende admin.
Arquivos alterados: server/credentialHash.ts, db.ts, criticalFlowFixes.ts, demoAuth.ts; scripts/seed-demo.ts; testes de credenciais e recuperação.
Testes executados: Suíte pnpm test; typecheck; salt/Unicode/espaços, custo malformado, login legado válido/inválido e atualização concorrente com driver simulado.
Resultado dos testes: 313 testes aprovados na suíte e typecheck aprovado. Formato <255 caracteres; nenhuma migration.
Pendências: Hashes legados reais só serão migrados conforme login/recuperação; não houve acesso ou atualização no banco da VPS.
Próximo passo: Verificar migração gradual de contas reais em validação autorizada; planejar substituição de perguntas secretas.
Commit relacionado: Bloco fix: proteger credenciais, mutacoes e auditoria administrativa; consultar histórico.

### HIGH-02

ID: HIGH-02
Status: Corrigido
Gravidade: Alto
Área: Seguranca web / CSRF
Arquivo(s) auditado(s): server/_core/cookies.ts; server/routers.ts; server/_core/adminMemberManagement.ts; server/_core/adminCommercialOperations.ts; server/_core/adminContentManagement.ts; server/_core/manualDeploy.ts
Problema confirmado?: Sim. Cookies SameSite=None sob HTTPS e ausência de guarda de origem no entrypoint.
Evidência no código atual: server/_core/index.ts registra csrfProtection antes de parsers e rotas, cobrindo REST e tRPC com prefixo; csrf.ts compara origem configurada, cookies.ts fixa Lax.
Correção aplicada: Todas as requisições mutáveis exigem Origin/Referer válido; bloqueio de origem ausente/nula/cross-site; produção exige PUBLIC_APP_ORIGIN HTTPS exata; cookie Secure em produção.
Arquivos alterados: server/_core/csrf.ts, cookies.ts, index.ts; server/routers.ts; .env.example; testes CSRF/cookies/logout.
Testes executados: HTTP real local para POST/DELETE/PATCH/PUT; prefixo /dev; origem exata, sufixo malicioso, protocolo errado, nula, ausente, Referer e Host encaminhado.
Resultado dos testes: 13 cenários HTTP aprovados; handlers não executados nas tentativas recusadas; suíte 313/313.
Pendências: Configurar PUBLIC_APP_ORIGIN do domínio real e validar navegador atrás do proxy antes de deploy.
Próximo passo: Verificação operacional autorizada.
Commit relacionado: Mesmo bloco de segurança.

### HIGH-03

ID: HIGH-03
Status: Corrigido no código; comprovação de paridade na VPS bloqueada
Gravidade: Alto
Área: Banco de dados / sincronizacao de conteudo
Arquivo(s) auditado(s): .github/workflows/deploy-vps.yml; scripts/deploy-vps.sh; scripts/sync-packaged-content.mjs; server/academyCanonical.ts
Problema confirmado?: Sim, desacoplamento no código confirmado. Divergência real do banco da VPS não foi afirmada: não houve acesso autorizado ao ambiente.
Evidência no código atual: deploy-vps.sh não chamava sync; ensurePackagedLibraryEbooks fazia inserções durante leituras e só atualizava sourceId em duplicatas. Sync aceitava ausência do manifesto da Academia como lista vazia e sobrescrevia resumo curado.
Correção aplicada: Sync exporta fluxo testável, oferece --validate-only sem banco e --check READ ONLY com saída 3 em divergência. Manifestos/PDFs obrigatórios e duplicidade no banco bloqueiam. Apply exige InnoDB, backup privado, leitura FOR UPDATE e transação SERIALIZABLE; rollback em erro, sem DDL. Preserva resumo e corpo HTML curados/metadados extras. Deploy verifica --check antes de ativar e depois, usa ambiente persistente e health de banco. Leitura de membro não insere conteúdo em produção.
Arquivos alterados: scripts/sync-packaged-content.mjs; scripts/deploy-vps.sh; scripts/manual-deploy-worker.sh; server/academyCanonical.ts; server/securityAudit.sync.test.ts; docs/CONTENT_BOOTSTRAP.md; este progresso.
Testes executados: pnpm exec vitest run server/securityAudit.sync.test.ts server/securityAudit.backup.test.ts server/packagedEbooks.integration.test.ts server/ebookLibraryPdf.integration.test.ts server/adminManualDeploy.integration.test.ts server/publicHeroTitleDeploy.integration.test.ts; node scripts/sync-packaged-content.mjs --validate-only; bash -n scripts/deploy-vps.sh scripts/manual-deploy-worker.sh; git diff --check.
Resultado dos testes: Correção do registro deste campo em 5cc5e4b: a rodada ampla NÃO passou integralmente. Foram 24 aprovados e 1 falho em 6 arquivos. Falha: server/ebookLibraryPdf.integration.test.ts esperava string ebook-category-sync- e contrato antigo do sync; causada pela mudança desta etapa, não preexistente. Os 6 testes funcionais do sync e 3 do backup passaram. --validate-only nos arquivos reais retornou 88 e-books, 11 cursos, 17 módulos e 30 aulas (corrige a contagem antiga 16/29 da auditoria). Bash e diff válidos. Sem banco real/deploy.
Pendências: Somente responsável autorizado pode conferir env do serviço/deploy, banco/schema real, dry-run da candidata, exportações e janela de sync; depois aprovar apply, exigir check zerado e validar health/conteúdo em VPS. O gate pode bloquear o próximo deploy até essa preparação. Rollback de código não reverte um sync previamente aprovado.
Próximo passo: Ajustar assert textual obsoleto ao contrato atual, corrigir documentação pela contagem real e repetir a rodada; seguir HIGH-06 e médios.
Commit relacionado: fix: bloquear ativacao com conteudo divergente e tornar sync transacional; SHA no checkpoint seguinte.

### HIGH-04

ID: HIGH-04
Status: Corrigido no código; validação operacional pendente
Gravidade: Alto
Área: Backup / rollback operacional
Arquivo(s) auditado(s): scripts/sync-packaged-content.mjs; scripts/deploy-vps.sh; .github/workflows/deploy-vps.yml
Problema confirmado?: Sim: packaged sync e category sync salvavam backups relativos dentro do projeto e sem modo privado explícito.
Evidência no código atual: scripts/lib/content-sync-backup.mjs resolve destino real, recusa releases/storage e symlinks que levam a eles, exige diretório 0700. Chamado pelos dois scripts antes de apply.
Correção aplicada: CONTENT_SYNC_BACKUP_DIR absoluto obrigatório em produção; JSON v2 com linhas anteriores e sourceIds de inserções planejadas; arquivo único 0600 aberto com wx e sincronizado em disco antes de DML. Diretório inválido impede conexão no apply.
Arquivos alterados: scripts/lib/content-sync-backup.mjs; scripts/sync-packaged-content.mjs; scripts/sync-ebook-library-categories.mjs; .env.example; server/securityAudit.backup.test.ts; este progresso. Procedimento operacional detalhado será salvo no commit HIGH-03.
Testes executados: pnpm exec vitest run server/securityAudit.backup.test.ts (incluído nas execuções focadas); node --check dos scripts; git diff --check.
Resultado dos testes: 3/3 testes de arquivos reais temporários aprovados: recusa de caminhos inseguros/symlinks/permissões, backups únicos e persistência após remover a release. Sem banco real.
Pendências: Provisionar diretório privado persistente na VPS, conferir usuário do processo, espaço, retenção e exercitar restauração revisada. Nenhuma ação na VPS autorizada/executada.
Próximo passo: Concluir transação e gate de sync de HIGH-03; validar operação na VPS somente após autorização.
Commit relacionado: fix: persistir backups privados fora das releases; SHA no checkpoint seguinte.

### HIGH-05

ID: HIGH-05
Status: Corrigido no código; validação operacional pendente
Gravidade: Alto
Área: Banco de dados / configuracao de ambiente
Arquivo(s) auditado(s): server/db.ts; scripts/sync-packaged-content.mjs; drizzle.config.ts
Problema confirmado?: Sim. getDb inferia socket pela existência do arquivo; sync/export/category sync faziam fallback e import usava socket diretamente.
Evidência no código atual: shared/databaseConfig.mjs centraliza a escolha: DATABASE_URL explícita, ou ALLOW_VPS_SOCKET_DB=true. REMOTE_DATABASE_URL permanece apenas como compatibilidade de desenvolvimento. Startup de produção valida configuração antes de servir rotas.
Correção aplicada: Removido fallback implícito em servidor e quatro scripts de conteúdo; erro de configuração não inclui credenciais; /api/healthz executa SELECT 1 e retorna apenas saúde/modo, 503 na falha.
Arquivos alterados: shared/databaseConfig.mjs e .d.mts; server/db.ts; server/_core/env.ts, index.ts, databaseHealth.ts; scripts/sync-packaged-content.mjs, export-academy-content.mjs, sync-ebook-library-categories.mjs, import-ebooks.mjs; .env.example; server/securityAudit.database.test.ts; este progresso.
Testes executados: pnpm install --frozen-lockfile; pnpm check; pnpm exec vitest run server/securityAudit.database.test.ts server/securityAudit.backup.test.ts server/securityAudit.credentials.test.ts server/securityAudit.content.test.ts.
Resultado dos testes: Instalação concluída com pnpm 10.4.1, sem mudar lockfile; aviso de scripts de build de dependências ignorados. Typecheck aprovado. 17/17 testes aprovados em 4 arquivos; 9 cenários específicos de configuração/HTTP. Consultas com driver simulado, não banco real.
Pendências: Configurar DATABASE_URL ou opt-in de socket no ambiente real, inclusive processo de deploy. Ainda não verificado na VPS, cujo acesso está proibido nesta etapa.
Próximo passo: Concluir gate de conteúdo e validação global; validar conexão real apenas em etapa operacional autorizada.
Commit relacionado: fix: exigir selecao explicita do banco; SHA registrado no checkpoint seguinte.

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
Resultado dos testes: 21/21 aprovados em 5 arquivos, incluindo 3 cenários de guard com repositórios/artefatos temporários. YAML e shell válidos. Os testes não executam scripts de deploy contra VPS; o teste existente do worker usa executor substituto em diretório temporário. GitHub Actions real não acionado, pois inclui deploy proibido nesta etapa.
Pendências: Validar base real e regras operacionais antes de futura implantação autorizada. Dispatch agora exige SHA ativa. Alteração de schema permanece proibida; nenhum bypass foi adicionado.
Próximo passo: Avaliar todos os médios e consolidar suíte/build, mantendo limitações operacionais explícitas.
Commit relacionado: fix: validar intervalo de schema e publicar a SHA conferida; SHA no checkpoint seguinte.

### HIGH-07

ID: HIGH-07
Status: Corrigido
Gravidade: Alto
Área: Administracao / pagamentos / dados privados
Arquivo(s) auditado(s): server/_core/adminCommercialOperations.ts; server/_core/storageProxy.ts; server/_core/adminMemberManagement.ts
Problema confirmado?: Sim. REST administrativo e tRPC aceitavam sessão demo sem CSRF e sem autenticação recente/log persistente abrangente.
Evidência no código atual: Guardas administrativas REST chamam enforceAdminMutation; adminProcedure exige beginAdminMutation nas mutações; arquivo privado de auditoria escrito antes da ação; contexto consulta permissão atual no banco.
Correção aplicada: Autenticação recente de 15 minutos e trilha privada para mutações; exclusão agendada registra ator; listagem GET deixa de disparar purge; acesso a comprovante verifica bloqueio do membro.
Arquivos alterados: server/_core/adminAudit.ts, trpc.ts, adminMemberManagement.ts, adminCommercialOperations.ts, adminContentManagement.ts, adminRelationshipMaintenance.ts, manualDeploy.ts, index.ts; server/demoAuth.ts; .env.example; .gitignore; teste admin.
Testes executados: Log real em diretório temporário: início/fim, ator, ausência de cookie/email; recusa de sessão vencida/ausente e de produção sem diretório persistente; suíte completa.
Resultado dos testes: 3 cenários focados aprovados; suíte 313/313; typecheck aprovado após correção de nulidade.
Pendências: Configurar SECURITY_AUDIT_DIR privado fora de release e storage; reconciliar eventos started sem final se processo cair. A trilha em arquivo não participa atomicamente da transação SQL.
Próximo passo: Confirmar permissões, retenção de logs e novo login administrativo no ambiente autorizado.
Commit relacionado: Mesmo bloco de segurança; não houve execução financeira/deploy real.

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
Commit relacionado: test: alinhar validacao do catalogo e documentacao operacional; SHA no checkpoint seguinte.

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
Pendências: A suíte geral será executada no fechamento.
Próximo passo: Validar conjunto completo antes de publicar a branch.
Commit relacionado: test: alinhar validacao do catalogo e documentacao operacional; SHA no checkpoint seguinte.

### MED-03

ID: MED-03
Status: Pendente
Gravidade: Medio
Área: Integridade relacional / banco
Arquivo(s) auditado(s): drizzle/schema.ts; server/db.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: O schema modela muitas relacoes por colunas de id, mas nao ha evidencias de chaves estrangeiras fortes no schema Drizzle para varias tabelas operacionais.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### MED-04

ID: MED-04
Status: Pendente
Gravidade: Medio
Área: Conteudo administrativo / fonte da verdade
Arquivo(s) auditado(s): server/academyCanonical.ts; server/routers.ts; scripts/export-academy-content.mjs; scripts/sync-packaged-content.mjs
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: Ha caminhos administrativos que alteram metadados de conteudo no banco, enquanto o projeto trata manifestos versionados como fonte operacional.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### MED-05

ID: MED-05
Status: Pendente
Gravidade: Medio
Área: Exposicao de informacao operacional
Arquivo(s) auditado(s): server/_core/deployStatus.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: O status de deploy e SHA podem ser consultados publicamente.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### MED-06

ID: MED-06
Status: Pendente
Gravidade: Medio
Área: Biblioteca publica / status de imagens
Arquivo(s) auditado(s): server/db.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: A consulta de imagens da secao publica retorna registros sem filtro evidente de status ativo.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.


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
Correção aplicada: Remoção da chave da árvore atual e regras preventivas no .gitignore. Histórico não reescrito.
Arquivos alterados: attached_assets/Maquinas-50GB_1789167740877.pem (removido); .gitignore; este progresso.
Testes executados: Validação local do tipo da chave sem exibir bytes; verificação de remoção e git diff --check.
Resultado dos testes: Chave RSA confirmada. Arquivo removido; integridade do diff verificada antes do commit.
Pendências: Revogar/rotacionar a chave nos serviços onde foi autorizada, verificar acessos e cópias/artefatos antigos. A remoção da árvore NÃO revoga a credencial nem remove versões históricas.
Próximo passo: Responsável autorizar e executar tratamento da credencial fora desta etapa; manter bloqueio de liberação operacional até evidência de revogação ou prova de que não é usada.
Commit relacionado: fix: remover chave privada versionada; SHA registrado no próximo checkpoint.

Nota de correção de evidência: o texto inicial do commit 5cc5e4b registrou incorretamente aprovação integral e contagem 16/29 antes de incorporar o resultado da rodada ampla. Corrigido explicitamente nesta continuidade: 24 passaram/1 falhou e contagem real 17 módulos/30 aulas. O histórico não foi reescrito; não houve execução na VPS.
