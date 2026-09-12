# Biblioteca de e-books empacotada

Este diretório contém o acervo de e-books autorizado para a biblioteca de membros.

- `ebook-manifest.tsv`: manifesto canônico com 87 registros publicados, IDs estáveis e nomes dos PDFs.
- `fontes_importados/`: PDFs atuais usados como fonte principal de leitura.
- `fontes-importados-manifest.tsv`: índice das fontes preservadas para localização e validação dos PDFs.
- `html-output/`: não é mais a fonte principal do leitor e não deve ser recriado como mecanismo operacional.

Os PDFs empacotados são servidos pela aplicação em `/ebook-files` e usados como fallback somente leitura quando o banco não está disponível ou ainda não possui e-books cadastrados. No fluxo operacional atual, a administração em `/admin/ebooks` deve controlar os e-books independentes da Biblioteca e suas categorias.

O importador de banco é `scripts/import-ebooks.mjs`. Quando o banco está disponível, ele pode publicar os registros usando `EBOOK_IMPORT_ROOT` ou o diretório `ebook-import` padrão do projeto. O manifesto aceita metadados opcionais de Academia/Biblioteca, incluindo `usage`, `libraryCategory`, `courseTitle`, `courseOrder`, `moduleTitle`, `moduleOrder`, `lessonOrder` e `level`, sem exigir migration de banco.

Em setembro de 2026, o pacote `/home/ubuntu/O_CODIGO_LUCRATIVO_BIBLIOTECA_RECURSOS_ORGANIZADA.zip` foi auditado antes da integração. Foram encontrados 90 PDFs: 29 já existiam por SHA-256, 3 eram duplicatas internas do ZIP e 58 foram adicionados como materiais independentes da Biblioteca. Arquivos executáveis ou de script encontrados em pacotes de origem não são executados pelo projeto.
