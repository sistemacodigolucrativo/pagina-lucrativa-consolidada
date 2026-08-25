# Auditoria — Remoção do Financeiro Legado do Admin

**Projeto:** Página Lucrativa
**Branch:** `ManusIA-Edit`
**Base da auditoria:** commit `2b3bb7f`
**Objetivo:** retirar do painel administrativo o módulo de lançamentos financeiros manuais sem apagar histórico, adesões, ganhos do membro ou métricas de campanhas.

## Decisão de domínio

O módulo `/admin/financeiro` é uma operação administrativa legada. A tela permite criar vendas manuais e ajustes, editar status e consultar a tabela `transactions`. Ela própria informa que não existe carteira interna, saldo custodiado ou repasse pela plataforma.

O domínio atual de ganhos do membro é diferente. `getMemberFinance()` consulta diretamente `applications` filtrando por `ownerUserId`, usa `paymentStatus` e soma `offerAmountCents` para os valores confirmados. O painel `Ganhos e extrato` não depende de `transactions`.

A remoção deve atingir a experiência administrativa e os contratos exclusivos de lançamentos manuais. A tabela `transactions` e os registros existentes serão preservados nesta etapa, sem migration destrutiva.

## Grafo de dependências encontrado

| Camada | Uso encontrado | Classificação | Decisão |
|---|---|---|---|
| Admin navigation | `Financeiro → /admin/financeiro` | ATUAL, legado | Remover do menu. |
| Rota admin | `AdminTransactions` em `/admin/financeiro` | ATUAL, legado | Substituir por redirecionamento legado ao Dashboard. |
| Tela admin | `AdminTransactions.tsx` | ATUAL, legado | Remover, pois só consome os contratos administrativos legados. |
| Admin API | `admin.transactions`, `admin.financeMembers`, `admin.createTransaction`, `admin.updateTransaction` | ATUAL, legado | Remover se não houver consumidores após a remoção da tela. |
| Backend admin | `getAdminTransactions`, `getFinanceMembers`, `createAdminTransaction`, `updateAdminTransaction` | DEPENDÊNCIA do módulo removido | Remover junto dos contratos. |
| Dashboard admin | `grossVolumeCents` baseado em `transactions` | ATUAL, legado | Remover para que o Dashboard não dependa do Financeiro legado. |
| Ganhos do membro | `member.finance`, `getMemberFinance`, `MemberEarnings` | ATUAL | Preservar. A fonte é `applications`. |
| Dashboard do membro | `confirmedApplicationValueCents` | ATUAL | Preservar. Deriva de adesões confirmadas. |
| Campanhas | `campaignConversions` e analytics | ATUAL | Preservar métricas e conversões já registradas. |
| Sincronismo transação-campanha | `syncTransactionCampaignConversion` | LEGADA | Remover após eliminar os únicos chamadores administrativos, sem apagar conversões existentes. |
| Schema | `transactions` e enums `sale`, `commission`, `adjustment`, `withdrawal` | HISTÓRICO | Preservar nesta fase; migration separada somente após nova auditoria. |
| Seed demo | Bloco que insere transações fictícias `sale`/`adjustment` | SEED, legado | Remover a geração de transações fictícias; preservar outros dados de demo. |
| Documentação | Inventário e auditorias anteriores mencionam Financeiro legado | DOCUMENTAÇÃO | Atualizar somente o que descreve o estado atual, mantendo histórico da decisão. |

## Conversões de campanha

O fluxo real de aplicações já registra uma conversão `application` quando existe atribuição válida de campanha. As métricas de campanhas consultam `campaignConversions`, incluindo conversões de leads, aplicações e registros históricos.

O único código que transforma uma transação administrativa em conversão `sale` ou `commission` é `syncTransactionCampaignConversion()`, chamado pelas funções de criação e atualização manual de transações. Como essas funções pertencem exclusivamente ao módulo administrativo removido, o sincronismo não possui consumidor atual depois da remoção.

Remover a função não apaga linhas já existentes em `campaignConversions`. As métricas continuam lendo a tabela e os registros históricos permanecem disponíveis. A tabela `transactions` também continua preservada para eventual migration ou consulta histórica futura.

## Ganhos do membro

`getMemberFinance()` não usa a tabela `transactions`. Ele filtra `applications.ownerUserId`, calcula confirmados por `paymentStatus === "confirmed"`, soma `offerAmountCents` e conta `receipt_received` como aguardando análise. Portanto, a remoção do Admin Financeiro não deve alterar Ganhos e extrato.

A página `/membros/ganhos` e o resumo em `/membros` continuam operacionais, protegidos por `protectedProcedure` e limitados ao usuário autenticado.

## Seeds e dados de demonstração

O seed atual cria dados fictícios de `applications`, campanhas, leads, tickets, depoimentos, pontos e também do módulo Financeiro legado. A geração de transações administrativas fictícias não deve continuar, porque recriaria a venda manual e o ajuste como conceitos operacionais atuais.

A tabela e eventuais registros já existentes não serão apagados pelo seed. A mudança é prospectiva: novas execuções do seed não devem criar ou atualizar lançamentos financeiros manuais.

## Riscos e limites

O maior risco seria remover `transactions` ou `campaignConversions` do schema, pois existem registros históricos e telas de campanhas que consultam `campaignConversions`. Por isso, esta tarefa remove a superfície administrativa e os escritores manuais, mas não executa migration destrutiva.

A auditoria confirma a separação pelo código e pelos contratos. A conferência dos valores reais depende de banco de homologação populado, que não está disponível no workspace.

## Resultado esperado

O painel Admin não terá menu, rota operacional, tela, API ou ação para criar venda manual, comissão, ajuste ou histórico financeiro legado. A rota antiga será tratada de forma segura, sem página morta.

O membro continuará vendo ganhos e extrato derivados de adesões reais em `applications`. Campanhas continuarão consultando suas conversões. Histórico em `transactions` e `campaignConversions` será preservado.
