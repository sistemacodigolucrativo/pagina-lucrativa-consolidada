# Relatório — Preview no painel administrativo

## Objetivo

Retirar a opção `Preview` do menu público/hambúrguer da Home e disponibilizá-la como ferramenta administrativa no grupo `Sistema`, junto de `Auditoria`, sem eliminar a funcionalidade nem alterar seu destino `/preview`.

## Mapeamento prévio

A rota existente foi confirmada em `client/src/App.tsx`:

```tsx
<Route path="/preview" component={Preview} />
```

O link público estava em `client/src/pages/Home.tsx`, dentro da navegação principal. A navegação administrativa é centralizada em `client/src/lib/adminNavigation.ts` e o agrupamento por `group` é renderizado pelo `DashboardLayout`.

A página `client/src/pages/Preview.tsx` era independente do `DashboardLayout`. Por isso, somente adicionar um link administrativo não seria suficiente para caracterizá-la como ferramenta do painel. A página foi envolvida pelo mesmo `DashboardLayout` usado pelas demais telas Admin, recebendo `adminMenu`, título `Administração` e subtítulo `Sistema`.

## Alterações aplicadas

| Arquivo | Alteração |
|---|---|
| `client/src/pages/Home.tsx` | Removido apenas o link `Preview` da navbar pública e do menu hambúrguer. Os demais links permaneceram. |
| `client/src/lib/adminNavigation.ts` | Adicionado `Preview` com caminho `/preview` e grupo `Sistema`, junto de `Auditoria`. |
| `client/src/pages/Preview.tsx` | Mantido o conteúdo visual e o destino `/preview`; adicionada a moldura administrativa `DashboardLayout`, com o mesmo menu do Admin. |
| `server/publicHeader.responsive.test.ts` | Atualizada a expectativa para garantir que Preview não aparece na navegação pública. |
| `server/adminNavigation.context.test.ts` | Adicionada cobertura para grupo `Sistema`, rota preservada e uso do `DashboardLayout` administrativo. |
| `docs/relatorio-movimentacao-preview-admin.md` | Este relatório. |

## Comportamento de acesso

A rota `/preview` continua com o mesmo destino. Como a página agora usa `DashboardLayout` com `adminMenu`, o guard existente do layout exige sessão Admin: visitantes não autenticados são encaminhados para `/acesso`, e usuários sem papel administrativo não recebem a ferramenta.

## Validações

| Validação | Resultado |
|---|---|
| `pnpm check` | Aprovado |
| `pnpm test` | Aprovado — 58 arquivos e 183 testes |
| `pnpm build` | Aprovado |
| `git diff --check` | Aprovado |
| Playwright público desktop `1280 x 800` | Preview não aparece na navbar; zero links para `/preview` |
| Playwright público Pixel 5 `393 x 851` | Preview não aparece na navbar nem no menu móvel aberto |
| Playwright rota `/preview` sem sessão | Redireciona para `/acesso`; conteúdo privado não é exposto |

## Estado

A alteração foi aplicada somente no workspace local da branch `ManusIA-Edit`. Nenhum commit ou push foi realizado nesta etapa. A rota `/preview` e o conteúdo de Preview não foram apagados.

## Referências internas

- `client/src/pages/Home.tsx`
- `client/src/lib/adminNavigation.ts`
- `client/src/pages/Preview.tsx`
- `client/src/components/DashboardLayout.tsx`
- `server/publicHeader.responsive.test.ts`
- `server/adminNavigation.context.test.ts`
- `/home/ubuntu/e2e-preview-navigation-check.py`
