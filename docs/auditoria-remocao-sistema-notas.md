# Auditoria prévia — remoção do sistema de notas

## Escopo identificado

A funcionalidade de notas é um componente global e exclusivamente local ao navegador. Ela é implementada por `client/src/components/GlobalNotes.tsx`, montada uma única vez no shell de `client/src/App.tsx` e estilizada pelo bloco `.global-notes*` de `client/src/index.css`.

O componente mantém estado React para abertura do painel, rascunho, feedback e notas recentes. Persiste dados diretamente em `window.localStorage` sob a chave `pagina-lucrativa.global-notes.v1`, indexando as notas por caminho da página. Não há comunicação com tRPC, backend, storage externo ou banco de dados.

A cobertura específica está em `server/globalNotes.integration.test.ts`. O teste verifica a montagem no shell, a chave de `localStorage`, os controles de acessibilidade e as classes CSS responsivas.

## Dependências confirmadas

| Área | Dependência exclusiva encontrada | Tratamento |
|---|---|---|
| Interface | `GlobalNotes.tsx`, botão flutuante, painel, textarea, ações de salvar/copiar/limpar | Remover arquivo e montagem |
| Shell | Import e `<GlobalNotes />` em `App.tsx` | Remover import e elemento |
| Estilos | Classes `.global-notes`, `.global-notes-toggle`, `.global-notes-panel`, `.global-notes-field`, `.global-notes-actions`, `.global-notes-recent` e media query associada | Remover bloco CSS inteiro |
| Testes | `server/globalNotes.integration.test.ts` | Remover teste exclusivo |
| Rotas | Nenhuma rota própria; o recurso é global | Nenhuma rota não relacionada será alterada |
| tRPC/API | Nenhuma procedure ou contrato específico | Nenhuma API será alterada |
| Banco/schema/migrations | Nenhuma tabela, coluna ou migration específica | Nenhum banco será alterado |
| Seeds/permissões/hooks | Nenhuma referência exclusiva fora do componente | Nenhum seed ou controle de acesso será alterado |

## Falsos positivos preservados

As expressões `consentNote`, `adminNote` e `actionNote` pertencem a regras de negócio distintas: consentimento de contatos, moderação de depoimentos e orientação operacional. Elas não são o sistema global de notas e permanecerão intactas. Também não será removida a expressão textual genérica `anotação` em documentos editoriais nem a referência externa `telegram-notes-bot.service` no arquivo de inspeção de VPS, pois não fazem parte da aplicação.

## Plano de remoção

A remoção segura consiste em retirar o import e a montagem do componente, excluir o componente e o teste exclusivos e eliminar somente o bloco CSS identificado. Em seguida serão executados scans de referências, TypeScript, testes, build, verificação de whitespace e preview. Nenhum commit será criado nesta etapa sem autorização posterior.

## Remoção executada

A montagem global foi removida de `client/src/App.tsx`; `client/src/components/GlobalNotes.tsx` e `server/globalNotes.integration.test.ts` foram excluídos; e o bloco `.global-notes*` foi removido de `client/src/index.css`.

Nenhuma procedure, rota, tabela, coluna, migration, seed, permissão ou serviço de backend foi encontrado para remoção. Os campos de negócio `consentNote`, `adminNote` e `actionNote` foram preservados deliberadamente.

O valor antigo de `localStorage` sob `pagina-lucrativa.global-notes.v1`, caso exista no navegador de um usuário, tornou-se inerte porque não há mais código que o leia ou grave. Nenhum dado de banco foi alterado.

## Validação final

A validação executada após a remoção passou em `pnpm check`, `pnpm test` com 58 arquivos e 182 testes, `pnpm build` e `git diff --check`. O scan de identificadores exclusivos não encontrou referências fora do teste de regressão intencional `server/notesRemoval.integration.test.ts`.

O Playwright também passou em desktop `1280 x 800` e emulação `Pixel 5` `393 x 851`. Em ambos os cenários o preview respondeu HTTP 200, não apresentou os textos do sistema global, não apresentou classes `global-notes` e não encontrou a chave ativa `pagina-lucrativa.global-notes.v1` no `localStorage`.

A anotação privada de depoimentos continua disponível por ser uma regra de negócio diferente. A remoção foi feita somente no workspace; não houve commit, push ou alteração de banco.
