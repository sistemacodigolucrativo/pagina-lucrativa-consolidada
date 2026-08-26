# Biblioteca de e-books empacotada

Este diretório contém os materiais autorizados fornecidos para a biblioteca de membros.

- `ebook-manifest.tsv`: manifesto canônico com 52 registros publicados, IDs estáveis e nomes dos HTMLs.
- `html-output/`: 52 páginas HTML completas usadas pelo leitor responsivo.
- `fontes_importados/`: cópia das 441 fontes encontradas no pacote entregue, incluindo 47 PDFs e recursos auxiliares.

Os arquivos em `fontes_importados/` são preservados como material-fonte e não são servidos pela aplicação. Em especial, arquivos com extensões executáveis ou de script não são executados pelo projeto. O leitor usa apenas os HTMLs do `html-output/` por meio de um iframe sandboxed.

O importador de banco é `scripts/import-ebooks.mjs`. Quando o banco está disponível, ele pode publicar os mesmos registros usando `EBOOK_IMPORT_ROOT` ou o diretório `ebook-import` padrão do projeto. Quando o banco não está populado no ambiente de preview, o backend utiliza o conteúdo empacotado como fallback somente leitura para que a biblioteca continue disponível.
