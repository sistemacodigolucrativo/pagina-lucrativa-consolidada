# Bootstrap de Conteudo Padrao

Este projeto trata o GitHub como fonte da verdade para os conteudos padrao da Biblioteca e da Academia.

## Fontes versionadas

- `ebook-import/ebook-manifest.tsv`: lista canonica dos e-books empacotados.
- `shared/ebookLibraryCatalog.ts`: categorias canonicas da Biblioteca.
- `ebook-import/fontes_importados/*/source.pdf`: PDFs versionados/empacotados usados pelo leitor.
- `content-seeds/academy-courses.json`: manifesto dos cursos padrao da Academia.

Dados de usuarios, pagamentos, afiliados, progresso de leitura, progresso de curso, tickets, metricas e configuracoes individuais nao entram em seed global.

## Conteudo padrao atual

- E-books empacotados: 87.
- Cursos padrao da Academia: 11.
- Modulos padrao da Academia: 16.
- Aulas/materiais padrao da Academia: 29.

Os cursos seguem a progressao: fundamentos, negocio digital, marca, produto, conteudo, funis, SEO, e-mail, trafego, vendas e escala. Cada aula da Academia aponta para um `sourceId` existente no manifesto de e-books. Materiais usados em curso ficam com `usage: "both"` para continuarem disponiveis tambem na Biblioteca.

## VPS nova

Depois de clonar o repositorio, instalar dependencias, configurar `.env` e aplicar o schema/migrations existentes, rode:

```bash
node scripts/sync-packaged-content.mjs --dry-run
node scripts/sync-packaged-content.mjs --apply
```

O script usa `DATABASE_URL` quando existir. Se ela nao estiver configurada, usa o socket local da VPS:

```text
/run/mysqld/mysqld.sock
user: ubuntu
database: pagina_lucrativa
```

## Idempotencia

O sync pode ser executado mais de uma vez. A chave de e-book e `sourceId`; cursos da Academia sao descritos por `courseSlug`, modulos por `moduleTitle/moduleOrder` e aulas/materiais por `lessonOrder` e `sourceId`.

Em registros ja existentes, o script atualiza o conteudo empacotado para os valores canonicos do repositorio: `sourceFile`, `sourcePath`, `title`, `summary`, `status`, `publishedAt` e o metadata `codigo-lucrativo-academy`. Quando ja existe corpo HTML, o script troca apenas o `<meta>` controlado e preserva o restante do HTML. Novos e-books padrao entram como `published`.

O script valida antes de escrever:

- `sourceId` unico no manifesto de e-books.
- PDF empacotado existente e com assinatura `%PDF-`.
- `sourceId` de cada aula da Academia presente no manifesto de e-books.
- `courseSlug` unico.
- `moduleTitle/moduleOrder` unico dentro do curso.
- `lessonOrder` unico dentro do modulo.

## Backup e rollback

Antes de `--apply`, o script gera backup JSON em:

```text
backups/packaged-content-sync-YYYYMMDD-HHMMSS.json
```

Rollback manual: use o backup para restaurar `htmlContent`, `sourceFile`, `sourcePath`, `title`, `summary`, `status` e `publishedAt` dos registros afetados.

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

O `--apply` cria backup JSON antes de atualizar os registros empacotados afetados. O deploy normal continua publicando apenas o codigo; este bootstrap deve ser executado como etapa operacional controlada.
