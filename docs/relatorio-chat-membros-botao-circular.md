# Relatório — botão flutuante Chat de membros

## Objetivo

Transformar o botão flutuante `Chat de membros` em um botão circular com aparência de balão de conversa, preservando o funcionamento interno existente e o posicionamento flutuante em desktop e mobile.

## Estado encontrado

O botão já era renderizado na `Home` dentro de `.member-chat-fab-wrap`, com o ícone `MessageCircle`, o rótulo textual `Chat de membros`, o estado `aria-disabled="true"` e o título `Chat de membros — em breve`. Não havia handler de abertura de chat nem procedure associada a esse botão; portanto, a alteração correta era visual, sem criar uma nova funcionalidade.

## Alterações aplicadas

A primeira versão circular continha uma pequena cauda decorativa. Após a confirmação visual, essa extensão foi removida para que o botão fique **100% redondo**, sem pseudo-elemento ou prolongamento geométrico.

| Arquivo | Alteração |
|---|---|
| `client/src/pages/Home.tsx` | Mantido o mesmo botão, `aria-label`, `aria-disabled`, título e wrapper flutuante. Removido somente o rótulo visual lateral e ampliado o ícone `MessageCircle` para o centro do botão circular. |
| `client/src/index.css` | Alterado o botão para dimensões circulares de `64 x 64 px` no desktop e `58 x 58 px` no mobile, com `border-radius: 50%`, gradiente e sombra. A cauda decorativa foi removida. |
| `client/src/index.css` | Mantidos o posicionamento `fixed`, o espaçamento inferior e a adaptação do wrapper para telas pequenas. |
| `server/publicHeader.responsive.test.ts` | Atualizadas as asserções para proteger a forma circular, o ícone, a responsividade e o estado atual sem comportamento de chat. |
| `docs/relatorio-chat-membros-botao-circular.md` | Este relatório. |

## Funcionalidade preservada

Nenhuma procedure, rota, API, hook, regra de negócio ou fluxo interno do Chat de membros foi alterado. O botão continua sendo uma ação visual em estado `em breve`, como antes. A mudança não transforma o botão em um chat funcional nem altera sua disponibilidade.

## Validação automatizada

| Verificação | Resultado |
|---|---|
| `pnpm check` | Aprovado |
| `pnpm test` | Aprovado — 58 arquivos e 183 testes |
| `pnpm build` | Aprovado |
| `git diff --check` | Aprovado |
| Playwright desktop `1280 x 800` | Aprovado — `64 x 64 px`, `border-radius: 50%`, posição `fixed` |
| Playwright Pixel 5 `393 x 851` | Aprovado — `58 x 58 px`, `border-radius: 50%`, posição `fixed` e pseudo-elemento inexistente |
| Ícone | Um `svg` `MessageCircle` presente em cada viewport |
| Estado funcional | `aria-disabled="true"` e título `Chat de membros — em breve` preservados |
| Rótulo antigo | Classe `.member-chat-fab-label` removida |

A inspeção visual e o Playwright confirmaram um botão totalmente circular verde-claro, sem cauda ou pseudo-elemento, com ícone de balão escuro, permanecendo sobre o conteúdo no canto inferior direito.

## Estado de entrega

A alteração está somente no workspace local da branch `ManusIA-Edit`. Nenhum commit ou push foi realizado nesta etapa. O preview permanece disponível em:

https://3000-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer/

## Referências internas

- `client/src/pages/Home.tsx`
- `client/src/index.css`
- `server/publicHeader.responsive.test.ts`
- `/home/ubuntu/e2e-chat-button-check.py`
