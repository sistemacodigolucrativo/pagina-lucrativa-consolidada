# Relatório de integração dos e-books — 26/08/2026

## Escopo

O pacote `ebooks_pagina_lucrativa_20260826.zip` foi recebido e validado antes da integração. O arquivo apresentou integridade válida, sem entradas de caminho transversal. O SHA-256 do pacote é `c0388de5a202199ef8b39a1c56d0871dde10aadb715100892ac3b8762a53b18f`.

## Conteúdo incorporado

| Conteúdo | Quantidade | Destino no projeto |
|---|---:|---|
| HTMLs da biblioteca de membros | 52 | `ebook-import/html-output/` |
| Fontes preservadas | 441 | `ebook-import/fontes_importados/` |
| PDFs entre as fontes | 47 | `ebook-import/fontes_importados/` |
| README original | 1 | `ebook-import/LEIA-ME-pacote-original.txt` |
| Manifesto das fontes com SHA-256 | 1 | `ebook-import/fontes-importados-manifest.tsv` |

Os HTMLs recebidos foram associados aos 52 IDs já existentes no `ebook-manifest.tsv`, preservando o contrato do banco, os nomes estáveis dos arquivos e os links internos entre materiais. Cinquenta HTMLs eram idênticos aos arquivos que já estavam versionados; dois foram atualizados pela cópia recebida, mantendo a estrutura do catálogo.

## Disponibilização na biblioteca

Foi criado `server/staticEbooks.ts`, que lê o manifesto e os HTMLs versionados sem executar seu conteúdo. Quando há e-books publicados no banco, o banco continua sendo a fonte prioritária. Quando o banco não está configurado ou não possui e-books publicados, o backend utiliza os 52 materiais empacotados como fallback somente leitura. Assim, a biblioteca continua disponível no preview e em ambientes que ainda não receberam a carga SQL.

O importador `scripts/import-ebooks.mjs` passou a usar, por padrão, o diretório `ebook-import` do próprio projeto, mantendo `EBOOK_IMPORT_ROOT` para instalações externas. Com banco configurado, o importador continua apto a publicar os registros no MySQL.

## Segurança e preservação

Nenhum arquivo recebido foi executado. As fontes foram preservadas em um diretório interno do projeto que não é `client/public` e não é servido diretamente pela aplicação. Arquivos antigos com extensões como `.exe`, `.php`, `.cgi` e `.js` permanecem como fontes arquivadas e rastreáveis, mas não fazem parte do código executado pelo servidor. O leitor utiliza o HTML por meio do iframe sandboxed já existente.

## Validação inicial

O check TypeScript passou após a integração. O teste específico da biblioteca verifica 52 materiais publicados, IDs únicos, HTML não vazio e leitura pelo ID estável. A suíte completa, o build, a verificação E2E e a publicação na `main` devem ser executados antes do envio final.
