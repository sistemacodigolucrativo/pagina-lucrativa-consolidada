# Relatorio - Bootstrap de Conteudo Padrao

## Resumo

Foi implementado um fluxo oficial e versionado para sincronizar conteudo padrao da Biblioteca de e-books a partir do repositorio, sem depender da VPS atual como unica fonte. O fluxo usa manifestos/assets versionados e e idempotente por `sourceId`.

## Base

- Branch de trabalho: `feat/packaged-content-bootstrap`
- Commit base: `0e8b6e3e1a2cafdafd9cae0228386601c2dd121e`
- Main remota no inicio desta rodada: `0e8b6e3e1a2cafdafd9cae0228386601c2dd121e`

## Implementado

- Criado `scripts/sync-packaged-content.mjs` com dry-run por padrao e escrita somente com `--apply`.
- Criado `scripts/export-academy-content.mjs` para exportar cursos da Academia existentes no banco para manifesto revisavel.
- Criado `content-seeds/academy-courses.json` como manifesto versionado dos cursos padrao.
- Criada documentacao `docs/CONTENT_BOOTSTRAP.md`.
- Atualizados `README.md` e `ebook-import/README.md` para apontar o fluxo oficial.
- Atualizados testes estruturais para cobrir o novo bootstrap.

## Banco da VPS

Comandos executados usando o `.env` de producao:

```bash
DOTENV_CONFIG_PATH=/home/ubuntu/servicos/pagina-lucrativa/.env node scripts/sync-packaged-content.mjs --dry-run
DOTENV_CONFIG_PATH=/home/ubuntu/servicos/pagina-lucrativa/.env node scripts/sync-packaged-content.mjs --apply
```

Resultado:

- E-books no manifesto: 87
- E-books no banco: 88
- SourceIds sincronizados: 87
- Categorias canonicas mapeadas: 87
- Correcoes de categoria pendentes: 0
- Inserts planejados: 0
- Updates planejados: 0
- Updates aplicados: 0
- Linhas fora do manifesto: 1
- Backup criado nesta rodada: nao, porque `--apply` nao encontrou alteracoes planejadas

Distribuicao final:

- Captacao e funis: 3
- Conteudo e criativos: 18
- Desenvolvimento pessoal e financeiro: 12
- E-mail e relacionamento: 3
- Ferramentas e modelos: 7
- Marca e posicionamento: 2
- Marketing de rede: 6
- Negocio digital: 6
- Produto digital: 23
- SEO e descoberta: 2
- Trafego e divulgacao: 1
- Vendas e conversao: 4

## Academia

O export atual da VPS encontrou 1 curso: `curso-de-teste`, com 1 modulo e 1 aula/material. Ele nao foi promovido para `content-seeds/academy-courses.json` porque aparenta ser conteudo operacional/teste, nao conteudo padrao do sistema.

Manifesto padrao versionado nesta rodada:

- Cursos: 0
- Modulos: 0
- Aulas/materiais: 0

## Validacoes

Executado com sucesso:

```bash
pnpm check
pnpm exec vitest run server/ebookLibraryPdf.integration.test.ts server/packagedEbooks.integration.test.ts
pnpm test
pnpm build
git diff --check
E2E_BASE_URL=http://127.0.0.1:3117 PLAYWRIGHT_CHROME_PATH=/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome pnpm exec playwright test tests/published-site.spec.ts -g "curso publicado|leitor integrado|botao Ampliar"
```

Observacao: a primeira tentativa E2E falhou porque `/usr/bin/chromium` nao existia. Foi instalado somente o Chromium do Playwright e o recorte aplicavel passou.

## Riscos e pendencias

- O ZIP `/home/ubuntu/O_CODIGO_LUCRATIVO_BIBLIOTECA_RECURSOS_ORGANIZADA.zip` nao foi reimportado, porque os 87 e-books padrao ja estavam versionados em `ebook-import/` e sincronizados no banco.
- O banco contem 1 e-book/material fora do manifesto (`curso-de-teste`), preservado e ignorado pelo sync.
- Nao ha cursos padrao reais versionados para Academia nesta rodada; o mecanismo esta pronto, mas o manifesto permanece vazio ate haver curso padrao aprovado.
- O deploy automatico deve ser acompanhado apos push da branch.
