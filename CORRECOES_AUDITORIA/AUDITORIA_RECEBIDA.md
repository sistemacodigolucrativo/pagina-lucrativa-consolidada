# AUDITORIA DE QUALIDADE ACEITAVEL

Projeto auditado: `sistemacodigolucrativo/pagina-lucrativa-consolidada`  
Branch auditada: `main`  
Data da auditoria: 2026-09-20  

## 1. Resumo executivo

O projeto esta **quase aceitavel, mas ainda nao aceitavel para uso real sem correcoes minimas**.

O estado atual mostra uma base organizada, com validacao em GitHub Actions, build, testes, deploy atomico por release, rollback por symlink, health check, PDFs reais empacotados, manifestos versionados e script de sincronizacao com `dry-run`, backup e validacoes de integridade.

O principal problema nao e falta de estrutura. O risco esta em pontos de seguranca e operacao que podem comprometer uso real:

- autenticacao administrativa baseada em fluxo local/demo ainda presente no caminho de producao;
- hash de senha e resposta secreta com SHA-256 simples;
- ausencia aparente de protecao CSRF para mutacoes autenticadas por cookie;
- conteudo interno de controle administrativo podendo ser exposto via endpoint de conteudo publicado;
- sincronizacao de conteudo empacotado separada do deploy, permitindo divergencia entre `main` e banco da VPS;
- fallback silencioso de banco por socket local quando `DATABASE_URL` nao existe;
- backup do sync salvo dentro do diretorio do projeto/release, com risco de perda em limpeza de releases.

A Academia e a biblioteca de e-books estao em bom estado estrutural: ha manifestos, testes, PDFs reais, `sourceId` canonico e conteudo em PDF como fonte principal. O problema operacional continua sendo garantir que o banco da VPS acompanhe exatamente o que esta versionado.

## 2. Estado atual real do projeto

### Estrutura e stack

- Aplicacao Node/Express com tRPC, React/Vite, Drizzle e MySQL.
- Branch principal: `main`.
- Scripts principais:
  - `pnpm check`
  - `pnpm test`
  - `pnpm build`
  - `pnpm db:push`
- Deploy automatizado em `.github/workflows/deploy-vps.yml`.
- Deploy real executado por `scripts/deploy-vps.sh`.

### Deploy

O deploy atual tem pontos fortes reais:

- validacao antes do deploy com typecheck, testes e build;
- empacotamento excluindo `.git`, `node_modules`, `dist` e arquivos `.env`;
- instalacao em release nova;
- build e smoke test antes de trocar o symlink;
- troca atomica por symlink;
- restart controlado do servico systemd;
- health check local e publico;
- rollback automatico se falhar apos troca de release;
- limpeza de temporarios no workflow.

O ponto fraco e que o deploy nao sincroniza automaticamente os conteudos empacotados com o banco da VPS.

### Banco e conteudo versionado

Arquivos reais confrontados:

- `drizzle/schema.ts`
- `server/db.ts`
- `server/academyCanonical.ts`
- `scripts/sync-packaged-content.mjs`
- `content-seeds/academy-courses.json`
- `ebook-import/ebook-manifest.tsv`
- `ebook-import/fontes-importados-manifest.tsv`
- `shared/ebookLibraryCatalog.ts`

Estado observado:

- a Academia possui 11 cursos, 16 modulos e 29 aulas;
- a biblioteca empacotada possui 88 e-books conforme teste atual;
- os e-books usam PDFs reais sob `ebook-import/fontes_importados`;
- o glossario operacional existe como material real e possui PDF empacotado;
- ha teste confirmando que o conteudo principal dos e-books empacotados e PDF, nao HTML antigo.

### Limitacoes desta auditoria

Esta auditoria foi feita por leitura e confronto da branch `main`. Nao foram executados migrations, deploy, push, alteracao de schema ou sincronizacao em VPS.

Nao houve inspecao direta do banco vivo da VPS. Portanto, qualquer divergencia real entre VPS e `main` deve ser tratada como risco operacional a ser confirmado com `dry-run`, health check e verificacao pos-deploy.

## 3. Pontos criticos encontrados

```text
ID: CRIT-01
Gravidade: Critico
Area: Seguranca administrativa / autenticacao
Arquivo(s): server/demoAuth.ts; server/_core/context.ts; server/_core/trpc.ts; server/_core/adminMemberManagement.ts; server/_core/adminCommercialOperations.ts; server/_core/manualDeploy.ts
Problema: O caminho real de autenticacao usado pelo contexto da aplicacao ainda depende de sessao local/demo, incluindo uma conta administrativa local fixa.
Evidencia: server/demoAuth.ts define contas locais, incluindo username "admin" com role "admin"; server/_core/context.ts resolve o usuario a partir de DEMO_SESSION_COOKIE_NAME; adminProcedure autoriza apenas com ctx.user.role === "admin"; os endpoints REST administrativos repetem a mesma validacao por cookie demo/local.
Impacto real: Se a autenticacao local/demo estiver habilitada em producao, ou se a credencial/hash fixa for conhecida, fraca ou reaproveitada, um atacante pode obter acesso administrativo. Esse acesso permite alterar conteudo, bloquear ou excluir membros, revisar recibos, acessar dados privados e disparar deploy manual.
Correção mínima recomendada: Desabilitar contas demo/local em producao por padrao; exigir JWT_SECRET forte em startup de producao; exigir provedor real de autenticacao para admin; manter login local apenas atras de flag explicita como ENABLE_LOCAL_AUTH=true; remover ou invalidar a conta admin demo em producao; adicionar teste que falhe se NODE_ENV=production permitir conta demo administrativa.
Risco se ignorar: Comprometimento total do painel administrativo e dos dados sensiveis do sistema.
```

```text
ID: CRIT-02
Gravidade: Critico
Area: Privacidade / conteudo interno / permissoes
Arquivo(s): server/db.ts; server/routers.ts; server/_core/adminMemberManagement.ts
Problema: Registros internos de controle administrativo podem ser expostos pelo endpoint de conteudo publicado dos membros.
Evidencia: server/_core/adminMemberManagement.ts grava estados internos em managedContent com resourceCategory "member-admin-control" e status "published". server/db.ts possui getPublishedContent() retornando todos os managedContent com status "published", sem filtrar categorias internas. server/routers.ts expoe member.content para qualquer usuario autenticado.
Impacto real: Um membro autenticado pode receber registros internos de bloqueio, exclusao programada, ids de usuario, updatedBy e metadados administrativos que nao deveriam fazer parte do conteudo visivel ao membro.
Correção mínima recomendada: Separar controles administrativos em tabela propria ou, no minimo, filtrar getPublishedContent() para retornar apenas categorias/kinds explicitamente publicos. Excluir sempre resourceCategory interno, especialmente "member-admin-control", de qualquer rota de conteudo de membro.
Risco se ignorar: Vazamento de informacoes internas de administracao e enfraquecimento da separacao entre dados operacionais e conteudo visivel.
```

## 4. Pontos de alta prioridade

```text
ID: HIGH-01
Gravidade: Alto
Area: Senhas / recuperacao de conta
Arquivo(s): server/credentialHash.ts; server/criticalFlowFixes.ts; server/db.ts
Problema: Senhas e respostas de seguranca usam SHA-256 simples, sem salt individual e sem fator de custo.
Evidencia: server/credentialHash.ts implementa hashPassword(password) com createHash("sha256").digest("hex"); hashSecurityAnswer reaproveita hashPassword com prefixo textual; authenticateLocalUser compara esses hashes diretamente.
Impacto real: Em caso de vazamento do banco, senhas e respostas secretas podem ser quebradas rapidamente por ataque offline. Isso compromete login, recuperacao de conta e contas administrativas locais.
Correção mínima recomendada: Migrar para Argon2id, bcrypt ou scrypt com salt individual e custo adequado. Manter compatibilidade temporaria: validar hash legado uma vez e regravar no formato novo no login ou na redefinicao de senha.
Risco se ignorar: Tomada recorrente de contas apos qualquer exposicao do banco ou backup.
```

```text
ID: HIGH-02
Gravidade: Alto
Area: Seguranca web / CSRF
Arquivo(s): server/_core/cookies.ts; server/routers.ts; server/_core/adminMemberManagement.ts; server/_core/adminCommercialOperations.ts; server/_core/adminContentManagement.ts; server/_core/manualDeploy.ts
Problema: Mutacoes autenticadas por cookie nao apresentam protecao CSRF evidente, e os cookies podem usar SameSite=None quando a requisicao e segura.
Evidencia: server/_core/cookies.ts define SameSite como "none" quando secure e "lax" caso contrario. Nao foi encontrado middleware/token CSRF ou validacao de Origin/Referer para rotas sensiveis. Rotas administrativas e de membro executam alteracoes, exclusoes, revisoes de recibo e deploy manual com base apenas no cookie de sessao.
Impacto real: Um usuario admin ou membro logado pode ser induzido a abrir uma pagina maliciosa que dispare chamadas autenticadas contra o sistema, causando exclusoes, alteracoes financeiras, atualizacao de dados de recebimento ou disparo indevido de operacoes administrativas.
Correção mínima recomendada: Adicionar protecao CSRF para todas as mutacoes cookie-authenticated, com token por sessao ou double-submit cookie; validar Origin/Referer em rotas sensiveis; usar SameSite=Lax/Strict salvo necessidade real de contexto cross-site; exigir confirmacao/reauth para operacoes destrutivas.
Risco se ignorar: Execucao de acoes administrativas ou financeiras sem intencao do usuario autenticado.
```

```text
ID: HIGH-03
Gravidade: Alto
Area: Banco de dados / sincronizacao de conteudo
Arquivo(s): .github/workflows/deploy-vps.yml; scripts/deploy-vps.sh; scripts/sync-packaged-content.mjs; server/academyCanonical.ts
Problema: O deploy de codigo nao garante que o banco da VPS seja sincronizado com manifestos, PDFs e Academia versionados.
Evidencia: O workflow executa validacao, empacota e chama scripts/deploy-vps.sh. O deploy nao chama scripts/sync-packaged-content.mjs. A documentacao orienta ciclo manual. server/academyCanonical.ts possui ensurePackagedLibraryEbooks(), mas esse mecanismo insere ausentes e, em duplicidade, atualiza apenas sourceId, nao metadados, status, sourcePath ou htmlContent.
Impacto real: Um e-book ou aula pode existir na main e no pacote do deploy, mas nao aparecer corretamente na VPS. Tambem pode haver titulo, resumo, ordem, status ou relacao Academia/biblioteca diferentes entre banco e GitHub.
Correção mínima recomendada: Amarrar o ciclo pos-deploy a uma etapa obrigatoria: executar dry-run no ambiente da VPS, falhar se houver divergencia inesperada, aplicar sync com backup quando aprovado e rodar novo dry-run zerado e health check. Alternativamente, automatizar a sync apos deploy com backup persistente e criterio de parada claro.
Risco se ignorar: Conteudo publicado no GitHub nao chegar ao usuario final, ou banco da VPS permanecer diferente da branch main.
```

```text
ID: HIGH-04
Gravidade: Alto
Area: Backup / rollback operacional
Arquivo(s): scripts/sync-packaged-content.mjs; scripts/deploy-vps.sh; .github/workflows/deploy-vps.yml
Problema: O backup gerado pelo sync de conteudo fica em um diretorio relativo ao projeto, com risco de estar dentro da release ativa e ser removido em limpeza futura.
Evidencia: scripts/sync-packaged-content.mjs usa backupDir = path.resolve(projectRoot, "backups"). O deploy trabalha com releases e limpeza de releases antigas. Se o sync for executado a partir de current/release, o backup fica preso ao ciclo de releases.
Impacto real: Uma sincronizacao incorreta pode sobrescrever dados e o backup esperado para rollback pode desaparecer em uma limpeza de releases ou troca operacional.
Correção mínima recomendada: Gravar backups em caminho persistente fora das releases, por exemplo DEPLOY_ROOT/storage/backups/packaged-content, ou permitir CONTENT_SYNC_BACKUP_DIR obrigatorio em producao. Documentar e validar esse caminho antes de aplicar sync.
Risco se ignorar: Perda da principal evidencia/rota de reversao apos alteracao de conteudo no banco.
```

```text
ID: HIGH-05
Gravidade: Alto
Area: Banco de dados / configuracao de ambiente
Arquivo(s): server/db.ts; scripts/sync-packaged-content.mjs; drizzle.config.ts
Problema: Parte do codigo aceita fallback para banco MySQL via socket local quando DATABASE_URL nao esta definido.
Evidencia: server/db.ts tenta conectar em /run/mysqld/mysqld.sock com user "ubuntu" e database "pagina_lucrativa" quando DATABASE_URL nao existe. scripts/sync-packaged-content.mjs tambem possui fallback semelhante. drizzle.config.ts falha sem DATABASE_URL, mas a aplicacao e o sync podem seguir por caminho implicito.
Impacto real: Em producao ou manutencao na VPS, um erro de variavel de ambiente pode fazer a aplicacao ou script operar contra um banco nao pretendido, mascarando falhas de configuracao e gerando divergencia dificil de diagnosticar.
Correção mínima recomendada: Em NODE_ENV=production, falhar startup e scripts se DATABASE_URL nao existir, salvo flag explicita como ALLOW_VPS_SOCKET_DB=true. Registrar no health check qual modo de conexao esta ativo, sem expor segredo.
Risco se ignorar: Sync, deploy ou aplicacao podem ler/escrever no banco errado.
```

```text
ID: HIGH-06
Gravidade: Alto
Area: CI/CD / migrations / schema
Arquivo(s): .github/workflows/deploy-vps.yml
Problema: A protecao contra alteracoes de schema no deploy verifica apenas o diff do ultimo commit.
Evidencia: O workflow usa git diff --name-only HEAD^ HEAD -- drizzle drizzle.config.ts drizzle/schema.ts. Em push com multiplos commits, uma alteracao de schema em commit anterior pode nao aparecer nesse diff final.
Impacto real: Uma mudanca de schema pode chegar ao deploy automatico sem bloqueio, mesmo que a intencao seja exigir operacao manual com backup e migracao controlada.
Correção mínima recomendada: No evento push, comparar github.event.before contra github.sha. No workflow_dispatch, comparar contra a SHA implantada ou exigir aprovacao manual quando arquivos de schema mudarem. Manter a proibicao de deploy automatico para schema/migrations.
Risco se ignorar: Deploy com codigo incompatiel com banco atual ou migration insegura passando pelo fluxo automatico.
```

```text
ID: HIGH-07
Gravidade: Alto
Area: Administracao / pagamentos / dados privados
Arquivo(s): server/_core/adminCommercialOperations.ts; server/_core/storageProxy.ts; server/_core/adminMemberManagement.ts
Problema: Operacoes financeiras e administrativas destrutivas dependem da mesma autenticacao fragil e sem CSRF ja apontada.
Evidencia: server/_core/adminCommercialOperations.ts permite listar pedidos, revisar recibos e excluir aplicacoes/recibos/tokens por rotas administrativas. server/_core/adminMemberManagement.ts permite editar, bloquear e excluir membros. server/_core/storageProxy.ts protege payment-receipts por sessao, mas essa protecao depende da robustez da sessao.
Impacto real: Com uma sessao admin comprometida ou acionada por CSRF, e possivel manipular recibos, apagar pedidos, excluir membros e acessar dados privados como email, WhatsApp, detalhes de aplicacao e recibos.
Correção mínima recomendada: Corrigir autenticacao admin, adicionar CSRF e exigir confirmacao/reauth para exclusao de pedido, exclusao de membro, revisao de recibo e deploy manual. Adicionar log de auditoria persistente para essas acoes.
Risco se ignorar: Perda de dados operacionais, alteracao indevida de status financeiro e exposicao de comprovantes.
```

## 5. Pontos medios

```text
ID: MED-01
Gravidade: Medio
Area: Documentacao / operacao de conteudo
Arquivo(s): README.md; docs/CONTENT_BOOTSTRAP.md; server/packagedEbooks.integration.test.ts; ebook-import/ebook-manifest.tsv
Problema: A documentacao ainda informa 87 e-books, enquanto o estado real testado e versionado esta em 88.
Evidencia: README.md e docs/CONTENT_BOOTSTRAP.md citam 87 e-books. server/packagedEbooks.integration.test.ts espera 88 e-books e valida o glossario operacional como PDF empacotado.
Impacto real: Operadores podem interpretar um dry-run ou contagem de catalogo como divergente quando, na verdade, a documentacao esta desatualizada.
Correção mínima recomendada: Atualizar a documentacao operacional para 88 e-books, mantendo os numeros atuais da Academia: 11 cursos, 16 modulos e 29 aulas.
Risco se ignorar: Confusao em checklist pos-deploy e validacao manual de conteudo.
```

```text
ID: MED-02
Gravidade: Medio
Area: Testes / manutencao
Arquivo(s): server/packagedEbooks.integration.test.ts
Problema: Testes usam numeros fixos para total de materiais.
Evidencia: O teste espera exatamente 88 e-books e tambem valida sourceIds especificos.
Impacto real: O teste ajuda a detectar mudancas acidentais, mas se o catalogo crescer de forma legitima, a atualizacao exige lembrar de ajustar numeros fixos manualmente.
Correção mínima recomendada: Calcular a quantidade esperada a partir de ebook-import/ebook-manifest.tsv e manter asserts especificos apenas para materiais criticos, como glossario operacional e e-books indispensaveis.
Risco se ignorar: Quebra recorrente de CI em evolucoes legitimas de catalogo, ou atualizacao apressada de teste sem revisao de integridade.
```

```text
ID: MED-03
Gravidade: Medio
Area: Integridade relacional / banco
Arquivo(s): drizzle/schema.ts; server/db.ts
Problema: O schema modela muitas relacoes por colunas de id, mas nao ha evidencias de chaves estrangeiras fortes no schema Drizzle para varias tabelas operacionais.
Evidencia: Tabelas como transactions, applications, applicationPaymentReceipts, applicationAccessTokens, courseProgress, campaigns e managedContent referenciam usuarios, aplicacoes ou cursos por ids, enquanto exclusoes em server/db.ts e modulos admin fazem limpeza manual em varias tabelas.
Impacto real: Um erro em script, manutencao manual ou falha parcial de exclusao pode deixar registros orfaos ou inconsistentes.
Correção mínima recomendada: Antes de criar migrations, adicionar verificador de integridade operacional em modo read-only. Em ciclo planejado com backup, evoluir o schema com FKs onde fizer sentido ou documentar explicitamente relacoes que continuam sem FK.
Risco se ignorar: Dados orfaos em pagamentos, progresso, campanhas ou membros, dificultando suporte e auditoria futura.
```

```text
ID: MED-04
Gravidade: Medio
Area: Conteudo administrativo / fonte da verdade
Arquivo(s): server/academyCanonical.ts; server/routers.ts; scripts/export-academy-content.mjs; scripts/sync-packaged-content.mjs
Problema: Ha caminhos administrativos que alteram metadados de conteudo no banco, enquanto o projeto trata manifestos versionados como fonte operacional.
Evidencia: server/academyCanonical.ts possui updateAcademyCoursePublication() atualizando metadata em ebooks.htmlContent. scripts/sync-packaged-content.mjs reconcilia o banco com manifestos e seeds versionados. Existe script de exportacao de conteudo da Academia.
Impacto real: Uma alteracao feita no painel pode funcionar na VPS, mas nao existir na main. Em sincronizacao futura, pode ser sobrescrita ou gerar divergencia de dificil explicacao.
Correção mínima recomendada: Definir regra operacional unica: conteudo empacotado deve ser alterado no Git e sincronizado; painel admin deve editar apenas overrides claramente separados. Se o painel continuar alterando conteudo canonico, exigir exportacao e commit como parte do fluxo.
Risco se ignorar: Conteudo diferente entre banco e repositorio, com perda de alteracoes feitas em producao.
```

```text
ID: MED-05
Gravidade: Medio
Area: Exposicao de informacao operacional
Arquivo(s): server/_core/deployStatus.ts
Problema: O status de deploy e SHA podem ser consultados publicamente.
Evidencia: server/_core/deployStatus.ts expoe /api/deploy-status sem autenticacao, retornando status, stage e sha quando disponiveis.
Impacto real: Nao bloqueia uso, mas fornece informacao operacional util para reconhecimento externo, inclusive momentos de deploy e versao ativa.
Correção mínima recomendada: Tornar o endpoint administrativo, ou expor publicamente apenas estado grosseiro de saude sem SHA/stage detalhado.
Risco se ignorar: Facilita correlacao de ataques com janelas de deploy e versoes implantadas.
```

```text
ID: MED-06
Gravidade: Medio
Area: Biblioteca publica / status de imagens
Arquivo(s): server/db.ts
Problema: A consulta de imagens da secao publica retorna registros sem filtro evidente de status ativo.
Evidencia: getPublicSalesSectionImages() seleciona registros de publicSalesSectionImages ordenados por posicao, retornando inclusive status, mas sem filtrar status "active".
Impacto real: Se o frontend nao filtrar corretamente, uma imagem removida ou inativa pode continuar aparecendo na pagina publica.
Correção mínima recomendada: Filtrar no servidor apenas status ativo para rotas publicas. Manter uma consulta administrativa separada para ver historico ou removidos.
Risco se ignorar: Conteudo visual removido pode continuar exposto por API ou reaparecer por mudanca de frontend.
```

## 6. Itens que nao precisam ser mexidos agora

- O deploy por release com symlink, smoke test, health check e rollback e adequado como base operacional.
- O workflow executa typecheck, testes e build antes da publicacao.
- O pacote de deploy exclui `.env`, `.env.*`, `.git`, `node_modules` e `dist`.
- O script `scripts/sync-packaged-content.mjs` tem boa base: dry-run, validacao de PDF, validacao de sourceId, validacao de aulas da Academia e backup antes do apply.
- Os e-books empacotados sao servidos como PDF real e nao dependem de HTML antigo como conteudo principal.
- O teste de e-books confirma 88 materiais, URLs `/ebook-files/<sourceId>/source.pdf`, `contentType` PDF e glossario operacional.
- O proxy de storage protege `payment-receipts/*` por sessao e por dono/admin.
- Tokens de acesso de pagamento possuem HMAC, finalidade, tracking code e expiracao.
- Redirect de campanha limita protocolo e host permitido.
- O deploy manual possui travas uteis: exige admin, confirmacao, worker ativo e SHA atual.
- O bloqueio de deploy automatico para schema existe como intencao correta; precisa apenas comparar o range certo de commits.

## 7. Lista objetiva de correcoes minimas

1. Desabilitar contas demo/local em producao e exigir `JWT_SECRET` forte no startup.
2. Corrigir `getPublishedContent()` para excluir categorias internas, especialmente `member-admin-control`.
3. Migrar hashes de senha e resposta secreta para Argon2id, bcrypt ou scrypt.
4. Adicionar protecao CSRF e validacao de Origin/Referer em todas as mutacoes autenticadas por cookie.
5. Amarrar deploy e sync de conteudo com etapa obrigatoria de `dry-run`, `apply`, novo `dry-run` zerado e health check.
6. Mover backups do sync para diretorio persistente fora de releases.
7. Remover fallback implicito de banco em producao ou exigir flag explicita para socket local.
8. Corrigir o guard de schema no GitHub Actions para comparar todo o range do push.
9. Atualizar documentacao de conteudo de 87 para 88 e-books.
10. Separar claramente conteudo canonico versionado de overrides editados pelo painel admin.

## 8. Ordem recomendada de execucao

1. **Seguranca admin primeiro**
   - desligar admin demo/local em producao;
   - exigir segredo de sessao forte;
   - validar que nenhuma rota admin funciona sem autenticacao real.

2. **Fechar vazamento de conteudo interno**
   - filtrar `getPublishedContent()`;
   - testar que membro comum nao recebe `member-admin-control`.

3. **CSRF e acoes destrutivas**
   - adicionar token CSRF ou validacao robusta de Origin/Referer;
   - cobrir rotas admin REST e mutacoes tRPC;
   - exigir reauth/confirmacao para exclusoes, recibos e deploy manual.

4. **Senha e recuperacao**
   - introduzir hash moderno;
   - migrar hashes legados de forma gradual;
   - revisar fluxo de recuperacao.

5. **Operacao de banco e sync**
   - tornar `DATABASE_URL` obrigatorio em producao;
   - mover backup para storage persistente;
   - formalizar ciclo deploy -> sync -> dry-run zerado -> health check.

6. **CI/CD**
   - corrigir diff de schema no workflow;
   - adicionar validacao que detecte mudanca de manifestos/conteudo exigindo sync.

7. **Documentacao operacional**
   - atualizar contagens reais;
   - documentar checklist pos-deploy;
   - documentar como recuperar backup do sync.

## 9. Checklist final para considerar o projeto aceitavel

- [ ] Em producao, login admin demo/local nao existe ou esta explicitamente desabilitado.
- [ ] Startup de producao falha se `JWT_SECRET` estiver ausente ou fraco.
- [ ] Senhas e respostas secretas usam hash com salt e custo.
- [ ] Todas as mutacoes autenticadas por cookie possuem protecao CSRF ou Origin/Referer robusto.
- [ ] Membro comum nao consegue receber registros `member-admin-control` nem outro conteudo interno.
- [ ] Rotas administrativas destrutivas exigem confirmacao forte e deixam log de auditoria.
- [ ] `DATABASE_URL` e obrigatorio em producao, salvo flag operacional explicita.
- [ ] Workflow bloqueia mudanca de schema em todo o range do push.
- [ ] Deploy de codigo possui procedimento obrigatorio de sync de conteudo quando manifestos/seeds mudam.
- [ ] `scripts/sync-packaged-content.mjs --apply` grava backup fora das releases.
- [ ] Apos sync, `dry-run` retorna zero divergencias esperadas.
- [ ] Health check passa apos deploy e apos sync.
- [ ] Documentacao informa 88 e-books, 11 cursos, 16 modulos e 29 aulas.
- [ ] PDFs empacotados continuam validando assinatura `%PDF-`.
- [ ] Todos os `sourceId` usados na Academia existem no manifesto.
- [ ] Nenhum `sourceId` da Academia esta duplicado.
- [ ] Testes cobrem biblioteca, Academia, pagamentos/recibos, admin e fluxos principais.

## 10. Conclusao direta

O projeto esta **quase aceitavel**, mas **ainda nao aceitavel para uso real pleno** enquanto os pontos criticos e altos nao forem corrigidos.

A base de deploy, empacotamento de PDFs, manifestos e testes mostra maturidade suficiente para chegar a um estado confiavel rapidamente. O bloqueio atual esta concentrado em seguranca administrativa, protecao de mutacoes por cookie, separacao entre conteudo publico e registros internos, e disciplina operacional entre deploy e sincronizacao do banco da VPS.

Corrigidos os itens `CRIT-01`, `CRIT-02`, `HIGH-01`, `HIGH-02`, `HIGH-03`, `HIGH-04`, `HIGH-05` e `HIGH-06`, o projeto passa a ficar tecnicamente aceitavel para operacao real, desde que o checklist pos-deploy seja seguido e validado na VPS.
