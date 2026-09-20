# Bootstrap de Conteudo Padrao

Este projeto trata o GitHub como fonte da verdade para os conteudos padrao da Biblioteca e da Academia.

## Fontes versionadas

- `ebook-import/ebook-manifest.tsv`: lista canonica dos e-books empacotados.
- `shared/ebookLibraryCatalog.ts`: categorias canonicas da Biblioteca.
- `ebook-import/fontes_importados/*/source.pdf`: PDFs versionados/empacotados usados pelo leitor.
- `content-seeds/academy-courses.json`: manifesto dos cursos padrao da Academia.

Dados de usuarios, pagamentos, afiliados, progresso de leitura, progresso de curso, tickets, metricas e configuracoes individuais nao entram em seed global.

## Conteudo padrao atual

- E-books empacotados: 88.
- Cursos padrao da Academia: 11.
- Modulos padrao da Academia: 17.
- Aulas/materiais padrao da Academia: 30.

Os cursos seguem a progressao: fundamentos, negocio digital, marca, produto, conteudo, funis, SEO, e-mail, trafego, vendas e escala. Cada aula da Academia aponta para um `sourceId` existente no manifesto de e-books. Materiais usados em curso ficam com `usage: "both"` para continuarem disponiveis tambem na Biblioteca.

## VPS nova

Depois de clonar o repositorio, instalar dependencias, configurar `.env` e aplicar o schema/migrations existentes, rode:

```bash
node scripts/sync-packaged-content.mjs --dry-run
node scripts/sync-packaged-content.mjs --apply
```

O servidor e os scripts usam a mesma seleção explícita de banco: `DATABASE_URL`, ou `ALLOW_VPS_SOCKET_DB=true` com `MYSQL_SOCKET`, `MYSQL_USER` e `MYSQL_DATABASE` conferidos pelo operador. Produção não aceita `REMOTE_DATABASE_URL` como substituto. Ausência de configuração bloqueia a execução. O socket nunca é escolhido apenas por existir no disco.

## Idempotencia

O sync pode ser executado mais de uma vez. A chave de e-book e `sourceId`; cursos da Academia sao descritos por `courseSlug`, modulos por `moduleTitle/moduleOrder` e aulas/materiais por `lessonOrder` e `sourceId`.

Em registros ja existentes, o script atualiza o conteudo empacotado para os valores canonicos do repositorio: `sourceFile`, `sourcePath`, `title`, `status`, `publishedAt` e o metadata `codigo-lucrativo-academy`. Quando ja existe corpo HTML, o script troca apenas o `<meta>` controlado e preserva o restante do HTML. Resumo existente não vazio e corpo HTML são curadoria preservada; o resumo versionado preenche apenas registros novos/vazios. Metadados extras fora dos campos canônicos também são preservados. Novos e-books padrao entram como `published`, sem inventar um administrador `createdBy=1`.

O script valida antes de escrever:

- `sourceId` unico no manifesto de e-books.
- PDF empacotado existente e com assinatura `%PDF-`.
- `sourceId` de cada aula da Academia presente no manifesto de e-books.
- `courseSlug` unico.
- `moduleTitle/moduleOrder` unico dentro do curso.
- `lessonOrder` unico dentro do modulo.

## Backup e rollback

Em produção, `CONTENT_SYNC_BACKUP_DIR` deve apontar para diretório absoluto privado (0700), fora de todas as releases e do storage servido pela aplicação. Exemplo: `/var/lib/pagina-lucrativa/content-backups`. Diretório inseguro, symlink para release/storage ou ausência da variável bloqueiam `--apply` antes de conectar. Não use `DEPLOY_ROOT/storage/backups`: esse storage pode ser acessível pelo proxy HTTP.

Backups JSON v2 têm nomes únicos, criação exclusiva e permissão 0600. O arquivo é sincronizado em disco antes da primeira escrita. Contém `rows` anteriores e `plannedInsertedSourceIds`; não contém URL/credenciais de conexão. A release pode ser removida sem apagar o backup.

O apply exige InnoDB, usa transação SERIALIZABLE e lê os registros com `FOR UPDATE`. Falha antes do commit reverte todas as escritas. Não são executados DDL ou migrations. Mantenha edições administrativas de conteúdo suspensas durante a janela revisada de sync; locks podem atrasar temporariamente essas edições.

Rollback após commit é uma operação separada, expressamente autorizada: copie primeiro o estado atual, confronte o backup com alterações posteriores, restaure apenas os registros afetados e avalie individualmente os IDs inseridos. Não exclua automaticamente linhas com progresso/referências. Backups antigos eram uma lista simples; v2 usa `rows`. Nunca publique backups no Git. Rollback do symlink de código não reverte o banco.

## Exportacao da Academia atual

Se uma VPS possuir cursos padrao criados somente no banco, gere um export revisavel:

```bash
node scripts/export-academy-content.mjs --output content-seeds/academy-courses.exported.json
```

Revise o arquivo antes de substituir `content-seeds/academy-courses.json`. Nao promova cursos de teste, conteudos de usuarios ou curadoria local para seed global.

## Validacao

Depois de qualquer ajuste nos manifestos/scripts, rode:

```bash
pnpm check
pnpm test
pnpm build
git diff --check
node scripts/sync-packaged-content.mjs --dry-run
```

O dry-run informa os totais de e-books do manifesto, e-books no banco, `sourceIds` sincronizados, categorias corrigiveis, cursos/modulos/aulas versionados, materiais de Academia e operacoes planejadas. Ele nao altera usuarios, progresso, pagamentos, afiliados, tickets, metricas ou configuracoes individuais.

Em VPS de producao, aplique apenas depois de conferir o dry-run:

```bash
node scripts/sync-packaged-content.mjs --apply
```

O `--apply` cria backup JSON antes de atualizar os registros empacotados afetados. O deploy verifica `--check` antes de ativar e após a ativação, e nunca executa `--apply`. Divergência bloqueia a ativação; na verificação posterior, aciona o rollback de código. O estado real da VPS ainda precisa ser validado em janela autorizada.

## Gate obrigatório e operação revisada

- `--validate-only`: confere manifestos, sourceIds e assinatura dos PDFs, sem conexão com banco; usado pelo CI.
- `--dry-run` (padrão): transação READ ONLY, relatório, sem escrita de dados ou backup.
- `--check`: mesmo relatório de leitura; sai com 0 quando não há mudanças e 3 quando há divergência. Outros erros saem com 1.
- `--apply`: somente por comando autorizado separado; backup persistente e transação. Não autoriza schema, migrations ou deploy.

Em uma implantação futura autorizada: validar a release candidata, conferir a SHA e o schema em relação à release ativa, provisionar as configurações persistentes, fazer dry-run da candidata, revisar/exportar curadoria administrativa e aprovar o sync. Após apply, executar `--check` novamente e exigir zero inserções/atualizações. Só então a ativação pode continuar; verificar `/api/healthz` local/público e os conteúdos esperados no navegador. Se os metadados novos forem incompatíveis com o código ativo, planejar manutenção e rollback do banco antes do apply.

O deploy carrega o arquivo persistente `DEPLOY_ROOT/.env` com `node --env-file`, sem executar o conteúdo como shell. Pode ser indicado outro caminho absoluto via `DEPLOY_RUNTIME_ENV_FILE`. Esse arquivo e as variáveis herdadas precisam corresponder à configuração do serviço systemd; conferir também eventuais overrides `EBOOK_IMPORT_ROOT`/`ACADEMY_MANIFEST_PATH`. O processo de smoke deve conseguir ler os segredos e gravar o diretório de auditoria, sem relaxar permissões para passar na checagem.

`--check` confirma os campos canônicos definidos pelo sync; não comprova ausência de órfãos, validade de credenciais, renderização visual, igualdade de resumos curados ou equivalência de todo o banco. A aplicação em produção deixa de inserir e-books ao atender leituras de membros.


## Curadoria administrativa e fonte da verdade (MED-04)

| Campo | Regra operacional |
| --- | --- |
| sourceId, arquivo/caminho PDF, título e categoria canônica | Alterar no manifesto/catálogo/PDF do Git, revisar e sincronizar. |
| Estrutura, ordem, uso Biblioteca/Academia e publicação do curso | Fonte canônica no manifesto da Academia. Alteração temporária pelo painel exige exportação revisada e commit antes de novo sync. |
| Resumo existente e corpo HTML fora do meta canônico | Curadoria local preservada pelo sync. Para virar conteúdo padrão, revisar e transportar expressamente para a fonte versionada adequada. |
| Metadados extras fora dos campos canônicos | Preservados no sync; não são automaticamente promovidos a manifesto. |

A interface ainda permite alterar publicação/metadados canônicos no banco. Isso não realiza commit nem exportação automaticamente. O operador deve suspender edições, exportar, comparar com Git, revisar IDs/status e versionar as mudanças aceitas antes de autorizar apply. O export passa a conservar `published: false`; basta uma aula do grupo despublicada para exportar o curso como despublicado, como no comportamento de leitura da Academia.

O export da Academia cobre a estrutura e a publicação de cursos. Títulos/arquivos/categorias da Biblioteca continuam exigindo revisão de `ebook-manifest.tsv` e `shared/ebookLibraryCatalog.ts`; não basta copiar cegamente o JSON exportado. O gate `--check` identifica divergências canônicas, mas não garante que uma alteração administrativa tenha sido promovida corretamente ao Git.

## Verificação relacional antes de qualquer evolução de schema (MED-03)

Existe um diagnóstico de leitura, a ser executado somente em ambiente autorizado com credencial de consulta:

```bash
node scripts/check-relational-integrity.mjs
```

Ele usa transação READ ONLY, retorna apenas contagens de referências sem pai em 19 relações/variantes críticas e não emite DDL/DML. Sai com 2 quando encontra referências pendentes, 1 em erro/incompletude e 0 quando as relações examinadas não apresentam referências faltantes. Nenhum código de saída atesta a integridade total do banco.

`courseProgress.courseId` tem múltiplos significados: curso legado, grupo sintético da Academia ou ID codificado de leitura de e-book. A faixa de grupos 900000000–1499999999 exige reconciliação com slugs; não se deve criar FK ingênua para `courses.id`. Referências históricas de autoria podem exigir preservação em vez de exclusão. Antes de FKs, examinar os dados reais, definir política por relação, obter autorização explícita de schema, backup e plano de rollback. Nada disso foi executado nesta etapa.
