# Plano de Remoção — Financeiro Legado e Venda Manual do Admin

**Projeto:** Página Lucrativa
**Branch:** `ManusIA-Edit`
**Documento de entrada:** `plano-03-remover-financeiro-legado-admin.md`
**Documento de auditoria:** `docs/auditoria-remocao-financeiro-admin.md`

## Decisão funcional

Remover o módulo administrativo global de Financeiro baseado em lançamentos manuais. Isso inclui a criação de `Venda manual`, `Ajuste`, registros de comissão e alterações administrativas no histórico legado.

Preservar a fonte atual de ganhos do membro, que deriva de `applications.ownerUserId`, `paymentStatus` e `offerAmountCents`. Preservar também campanhas, `campaignConversions`, aplicações, pagamentos, comprovantes, ativação, tabela `transactions` e registros existentes.

A rota antiga `/admin/financeiro` será mantida apenas como redirecionamento legado ao Dashboard. Ela não carregará `AdminTransactions` e não terá consulta ou mutação financeira.

## Escopo de alteração

| Arquivo ou área | Ação |
|---|---|
| `client/src/lib/adminNavigation.ts` | Remover o item Financeiro. |
| `client/src/App.tsx` | Remover o import de `AdminTransactions` e redirecionar `/admin/financeiro` para a rota legada. |
| `client/src/pages/AdminTransactions.tsx` | Excluir a tela de lançamentos administrativos. |
| `client/src/pages/AdminOffice.tsx` | Remover volume financeiro e qualquer consulta dependente de `transactions`. |
| `server/routers.ts` | Remover `admin.transactions`, `admin.financeMembers`, `admin.createTransaction` e `admin.updateTransaction`. Preservar `member.finance`, campanhas e aplicações. |
| `server/db.ts` | Remover funções exclusivas do Financeiro Admin e o sincronismo manual de transação para conversão. Preservar `getMemberFinance`, campanhas e dados históricos. |
| `scripts/seed-demo.ts` | Parar de criar ou atualizar transações fictícias de venda/ajuste. Preservar a contagem histórica se ela for apenas observacional. |
| `client/src/pages/AdminOperations.tsx` | Reutilizar como rota legada e atualizar a mensagem. |
| testes | Atualizar expectativas antigas e criar garantias de remoção e preservação. |
| `docs/` | Registrar auditoria, plano, implementação e validação final. |

## Salvaguardas obrigatórias

A mudança não pode:

- apagar a tabela `transactions`;
- apagar registros de `transactions` ou `campaignConversions`;
- remover `applications` ou seus valores de adesão;
- alterar `getMemberFinance` ou a fonte de Ganhos e extrato;
- remover `member.finance`, campanhas, analytics ou conversões;
- quebrar métricas de leads e aplicações;
- criar uma carteira, saldo interno, saque ou repasse novo;
- apenas renomear `Venda manual` para esconder o legado;
- manter import morto ou endpoint administrativo sem consumidor;
- fazer replace global de termos financeiros em textos que descrevem o produto corretamente.

## Tratamento da sincronização de conversões

A função `syncTransactionCampaignConversion()` existe apenas para transformar transações administrativas `sale` e `commission` em conversões manuais. Depois que os escritores administrativos forem removidos, ela ficará sem chamadores atuais.

A função pode ser removida sem apagar conversões já persistidas, porque as métricas consultam `campaignConversions` diretamente. Conversões reais de aplicação continuam sendo registradas pelo fluxo de `applications` através de `recordCampaignConversion()`.

## Tratamento do seed

O seed não deve recriar conceitos que foram removidos da experiência atual. O bloco de transações fictícias será retirado. Dados de aplicações, campanhas, cliques, leads, tickets, depoimentos e pontos serão preservados, salvo se alguma dependência real for comprovada durante a auditoria.

## Critérios de aceite

| Critério | Verificação |
|---|---|
| Menu Financeiro removido | `adminMenu` não contém `/admin/financeiro`. |
| Rota antiga segura | `/admin/financeiro` aponta para a rota legada e redireciona ao Dashboard. |
| Tela removida | `AdminTransactions.tsx` não existe e não possui consumidores. |
| Dashboard independente | `AdminOffice` não consulta `transactions` nem mostra volume legado. |
| Contratos removidos | Os quatro endpoints `admin.*` financeiros não existem. |
| Backend limpo | Funções exclusivas e sincronismo sem consumidor são removidos. |
| Ganhos preservados | `member.finance`, `getMemberFinance` e `MemberEarnings` permanecem. |
| Campanhas preservadas | Analytics e conversões continuam consultando `campaignConversions`. |
| Histórico preservado | Schema e dados históricos não sofrem remoção. |
| Seed atualizado | Não cria venda manual, comissão ou ajuste fictício. |
| Sem imports mortos | TypeScript e busca de referências não detectam dependências órfãs. |
| Qualidade | `pnpm check`, `pnpm test`, `pnpm build` e `git diff --check` passam. |

## Matriz de testes

Serão verificados o menu, o redirecionamento, a ausência da tela e dos endpoints, a independência do Dashboard, a preservação de `member.finance`, a origem de ganhos em `applications`, a continuidade das rotas de campanha e a manutenção do schema.

Os testes estruturais serão identificados como tais. A validação de valores reais de ganhos e histórico dependerá de um banco de homologação populado, que não está disponível no workspace.

## Ordem de execução

Primeiro será concluída a auditoria de dependências. Depois serão aplicadas as alterações de frontend, router, backend e seed, seguidas pelos testes e pela documentação das correções. O build e a revisão do diff serão realizados antes de qualquer commit. Somente com as validações aprovadas a branch será enviada ao GitHub.
