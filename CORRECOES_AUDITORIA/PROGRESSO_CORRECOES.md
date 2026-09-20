# Progresso das correções da auditoria

Última atualização: 2026-09-20T02:40:34+00:00
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

- Base original: pnpm check aprovado; pnpm test: 75 arquivos, 281 testes aprovados (sem banco real).
- Instalação inicial com pnpm 11.19.0 falhou por incompatibilidade com overrides do package.json. Reexecutada com pnpm 10.4.1 fixado: sucesso, lockfile preservado. Node local 24.19.0; workflow usa Node 22.
- Críticos implementados: pnpm check aprovado; 5 arquivos / 19 testes focados aprovados.
- Registro inicial publicado no GitHub: 95d8b3671c6c8d9790104dde73a92199b27b9d80. Git push via terminal sem credencial; publicação feita pela conexão GitHub autenticada, sem force.
- Próximo passo: HIGH-01/HIGH-02, depois controles operacionais. VPS, migrations e deploy não executados.

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
Status: Pendente
Gravidade: Alto
Área: Senhas / recuperacao de conta
Arquivo(s) auditado(s): server/credentialHash.ts; server/criticalFlowFixes.ts; server/db.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: Senhas e respostas de seguranca usam SHA-256 simples, sem salt individual e sem fator de custo.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### HIGH-02

ID: HIGH-02
Status: Pendente
Gravidade: Alto
Área: Seguranca web / CSRF
Arquivo(s) auditado(s): server/_core/cookies.ts; server/routers.ts; server/_core/adminMemberManagement.ts; server/_core/adminCommercialOperations.ts; server/_core/adminContentManagement.ts; server/_core/manualDeploy.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: Mutacoes autenticadas por cookie nao apresentam protecao CSRF evidente, e os cookies podem usar SameSite=None quando a requisicao e segura.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### HIGH-03

ID: HIGH-03
Status: Pendente
Gravidade: Alto
Área: Banco de dados / sincronizacao de conteudo
Arquivo(s) auditado(s): .github/workflows/deploy-vps.yml; scripts/deploy-vps.sh; scripts/sync-packaged-content.mjs; server/academyCanonical.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: O deploy de codigo nao garante que o banco da VPS seja sincronizado com manifestos, PDFs e Academia versionados.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### HIGH-04

ID: HIGH-04
Status: Pendente
Gravidade: Alto
Área: Backup / rollback operacional
Arquivo(s) auditado(s): scripts/sync-packaged-content.mjs; scripts/deploy-vps.sh; .github/workflows/deploy-vps.yml
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: O backup gerado pelo sync de conteudo fica em um diretorio relativo ao projeto, com risco de estar dentro da release ativa e ser removido em limpeza futura.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### HIGH-05

ID: HIGH-05
Status: Pendente
Gravidade: Alto
Área: Banco de dados / configuracao de ambiente
Arquivo(s) auditado(s): server/db.ts; scripts/sync-packaged-content.mjs; drizzle.config.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: Parte do codigo aceita fallback para banco MySQL via socket local quando DATABASE_URL nao esta definido.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### HIGH-06

ID: HIGH-06
Status: Pendente
Gravidade: Alto
Área: CI/CD / migrations / schema
Arquivo(s) auditado(s): .github/workflows/deploy-vps.yml
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: A protecao contra alteracoes de schema no deploy verifica apenas o diff do ultimo commit.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### HIGH-07

ID: HIGH-07
Status: Pendente
Gravidade: Alto
Área: Administracao / pagamentos / dados privados
Arquivo(s) auditado(s): server/_core/adminCommercialOperations.ts; server/_core/storageProxy.ts; server/_core/adminMemberManagement.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: Operacoes financeiras e administrativas destrutivas dependem da mesma autenticacao fragil e sem CSRF ja apontada.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### MED-01

ID: MED-01
Status: Pendente
Gravidade: Medio
Área: Documentacao / operacao de conteudo
Arquivo(s) auditado(s): README.md; docs/CONTENT_BOOTSTRAP.md; server/packagedEbooks.integration.test.ts; ebook-import/ebook-manifest.tsv
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: A documentacao ainda informa 87 e-books, enquanto o estado real testado e versionado esta em 88.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### MED-02

ID: MED-02
Status: Pendente
Gravidade: Medio
Área: Testes / manutencao
Arquivo(s) auditado(s): server/packagedEbooks.integration.test.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: Testes usam numeros fixos para total de materiais.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

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

