# VPS database sanitized package — pagina_lucrativa

Pacote sanitizado gerado a partir do dump funcional da VPS.

## Origem

Dump recebido: `codigo-lucrativo-pagina_lucrativa-20260919-221841.sql`.

## O que foi incluído

- Estrutura sanitizada do banco, sem linhas reais.
- Seed público seguro de `managedContent`.
- Definição isolada da tabela `ebookReadingProgress`.
- Arquivo compactado `sanitized_db_package.zip` com o pacote completo.

## O que foi removido

Não foram versionados dados reais de usuários, tokens, sessões, senhas/hashes, comprovantes, dados financeiros, eventos, cliques, progresso de leitura, perfis de membros, convites, tickets ou registros administrativos individuais.

## Observação operacional

Este pacote é referência segura para revisão e reconstrução. Não deve ser aplicado diretamente em produção sem validação. Se `ebookReadingProgress` for realmente necessária, ela deve ser convertida em schema/migration formal do Drizzle antes de uso definitivo.
