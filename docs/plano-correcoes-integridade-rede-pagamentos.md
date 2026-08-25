# Plano de Correções — Integridade da Rede e dos Pagamentos

**Projeto:** Página Lucrativa
**Branch de trabalho:** `ManusIA-Edit`
**Documento relacionado:** `docs/auditoria-integridade-rede-pagamentos.md`

## Regra de negócio adotada

O patrocinador é definido no pedido e fica vinculado ao membro de forma permanente depois que o pagamento é confirmado e o valor é recebido. Reprocessar uma ativação pode ser idempotente quando o patrocinador é o mesmo, mas nunca pode trocar silenciosamente o patrocinador.

## Correções planejadas

| Ordem | Correção | Estratégia | Critério de aceite |
|---|---|---|---|
| 1 | Imutabilidade do patrocinador | Em duplicidade, manter o `sponsorId` persistido; bloquear divergência. | O vínculo original permanece e uma divergência produz erro sem alteração. |
| 2 | Bloqueio de regressão de pagamento | Rejeitar upload de comprovante para pagamento confirmado ou membro ativado. | `confirmed` não volta para `receipt_received`. |
| 3 | Revisão somente de pendentes | Exigir comprovante `pending` e estado de pedido compatível. | Comprovante aprovado/rejeitado não pode ser revisado novamente. |
| 4 | Operação atômica | Usar transação para as gravações críticas de aprovação e ativação. | Falha intermediária não deixa estados parciais. |
| 5 | Estado de erro no membro | Exibir erro da consulta separadamente do empty state. | Falha da API não aparece como rede vazia. |
| 6 | Testes de regressão | Cobrir contratos de estado, imutabilidade e ausência de ações manuais. | Os cenários críticos ficam protegidos contra regressões. |

## Decisões de implementação

A correção não cria tabela nova, não altera a origem de dados e não permite edição manual de vínculos no painel. `referralLinks` continuará sendo a fonte autoritativa tanto para a visão do membro quanto para a visão administrativa.

A proteção será feita no servidor. Estados visuais e botões desabilitados são complementares, mas não são considerados controle de integridade. A API deve rejeitar qualquer chamada fora da transição permitida, inclusive chamadas diretas ou repetidas.

A operação deverá ser idempotente quando repetida com os mesmos dados: uma segunda confirmação não deve criar outro token ou alterar o patrocinador. Se o mesmo `referredUserId` aparecer com outro `sponsorId`, o sistema deve interromper a operação e preservar o registro existente.

## Estratégia de testes

Os testes deverão verificar o conteúdo e o comportamento esperado nos seguintes cenários:

| Cenário | Resultado esperado |
|---|---|
| Primeiro vínculo do membro | Cria vínculo ativo com o patrocinador do pedido. |
| Reprocessamento com o mesmo patrocinador | Não altera o vínculo e não cria duplicidade. |
| Reprocessamento com patrocinador diferente | Falha com mensagem de conflito e preserva o patrocinador original. |
| Upload antes da confirmação | Aceito conforme o fluxo normal. |
| Upload depois da confirmação | Rejeitado e sem regressão de status. |
| Revisão de comprovante pendente | Permitida uma única vez. |
| Revisão de comprovante já decidido | Rejeitada. |
| Falha de consulta da rede do membro | Exibe estado de erro, não empty state enganoso. |
| Admin sem permissão | Rota administrativa retorna proibição. |
| Admin com permissão | Consulta somente leitura retorna os vínculos existentes. |

## Validação final

A entrega deverá passar por `pnpm check`, `pnpm test` e `pnpm build`. Também será revisado o diff para garantir que apenas arquivos do escopo sejam alterados, que não exista mutação de criação manual no painel e que nenhuma tabela adicional seja criada.

## Ordem de entrega

Primeiro serão aplicadas as proteções de servidor; depois os estados de interface e os testes. Em seguida será feita a revisão do diff e a validação completa. Somente após todas as verificações passarem será criado o commit e enviado para `origin/ManusIA-Edit`.
