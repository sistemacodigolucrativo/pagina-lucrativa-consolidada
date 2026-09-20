# Progresso das correções da auditoria

Última atualização: 2026-09-20T02:31:47+00:00
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

- Auditoria lida integralmente; 2 críticos, 7 altos, 6 médios.
- Main remota consultada e clonada; branch de trabalho criada localmente e no GitHub.
- Testes ainda não executados; instalação pendente.
- Próximo passo: confirmar CRIT-01 e CRIT-02, levantar a linha de base dos testes e implementar as correções mínimas.

## Achados

### CRIT-01

ID: CRIT-01
Status: Pendente
Gravidade: Critico
Área: Seguranca administrativa / autenticacao
Arquivo(s) auditado(s): server/demoAuth.ts; server/_core/context.ts; server/_core/trpc.ts; server/_core/adminMemberManagement.ts; server/_core/adminCommercialOperations.ts; server/_core/manualDeploy.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: O caminho real de autenticacao usado pelo contexto da aplicacao ainda depende de sessao local/demo, incluindo uma conta administrativa local fixa.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

### CRIT-02

ID: CRIT-02
Status: Pendente
Gravidade: Critico
Área: Privacidade / conteudo interno / permissoes
Arquivo(s) auditado(s): server/db.ts; server/routers.ts; server/_core/adminMemberManagement.ts
Problema confirmado?: Ainda não confrontado integralmente.
Evidência no código atual: Pendente; descrição recebida não é confirmação.
Correção aplicada: Nenhuma.
Arquivos alterados: Nenhum arquivo funcional.
Testes executados: Nenhum.
Resultado dos testes: Não executados.
Pendências: Confrontar o problema descrito: Registros internos de controle administrativo podem ser expostos pelo endpoint de conteudo publicado dos membros.
Próximo passo: Ler o fluxo e suas dependências; confirmar com evidência e teste aplicável.
Commit relacionado: Registro inicial no commit que adiciona este arquivo; consultar git log -- CORRECOES_AUDITORIA/PROGRESSO_CORRECOES.md.

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

