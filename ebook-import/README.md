# Biblioteca de e-books empacotada

Este diretório contém os materiais autorizados fornecidos para a biblioteca de membros.

- `ebook-manifest.tsv`: manifesto canônico com 52 registros publicados, IDs estáveis e nomes dos HTMLs.
- `html-output/`: 52 páginas HTML completas usadas pelo leitor responsivo.
- `fontes_importados/`: cópia das 441 fontes encontradas no pacote entregue, incluindo 47 PDFs e recursos auxiliares.
- `fontes-importados-manifest.tsv`: índice das fontes preservadas, usado para localizar PDFs reais e não vazios quando houver correspondência confiável.

Os PDFs de `fontes_importados/` com correspondência identificável são servidos pela aplicação em `/ebook-files` e usados como fonte principal de leitura. Os HTMLs do `html-output/` continuam existindo como fallback compatível para materiais sem PDF confiável ou para conteúdos que não vieram de PDF. Arquivos executáveis ou de script não são executados pelo projeto.

O importador de banco é `scripts/import-ebooks.mjs`. Quando o banco está disponível, ele pode publicar os mesmos registros usando `EBOOK_IMPORT_ROOT` ou o diretório `ebook-import` padrão do projeto. Quando o banco não está populado no ambiente de preview, o backend utiliza o conteúdo empacotado como fallback somente leitura para que a biblioteca continue disponível.
