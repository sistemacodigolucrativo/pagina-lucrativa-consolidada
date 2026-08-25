# Auditoria de Integridade da Rede e dos Pagamentos

**Projeto:** Página Lucrativa
**Branch:** `ManusIA-Edit`
**Commit-base:** `1a5a488` — `Melhora visao administrativa da rede`
**Data da auditoria:** 25/08/2026
**Status:** problemas identificados antes da aplicação das correções

## Objetivo

Esta auditoria verifica se o fluxo de cadastro, definição do patrocinador, pagamento, revisão do comprovante, ativação do membro e criação do vínculo de rede preserva a regra comercial definida para o projeto:

> Depois que o cadastro é concluído, o pagamento é confirmado e o valor é recebido pelo patrocinador, o patrocinador do membro não pode ser trocado.

A análise foi limitada ao fluxo existente. Não foi criada uma segunda tabela, não foi introduzida uma associação alternativa e não foi utilizado dado artificial.

## Fluxo analisado

```text
link/campanha → pedido → ownerUserId/patrocinador → comprovante → confirmação → acesso → ativação → referralLinks permanente
```

A aplicação define o patrocinador no momento da criação do pedido, usando o perfil do afiliado informado. Na ativação, utiliza `applications.ownerUserId` para criar o registro em `referralLinks`. O painel administrativo consulta a mesma tabela usada pelo painel do membro.

## Problemas encontrados

| ID | Severidade | Local | Problema | Consequência |
|---|---|---|---|---|
| P-01 | Crítica | `server/db.ts`, ativação | O `onDuplicateKeyUpdate` atualiza `sponsorId` quando já existe um vínculo para o indicado. | Um reprocessamento com patrocinador divergente pode trocar silenciosamente a origem comercial. |
| P-02 | Crítica | `server/db.ts`, upload de comprovante | O servidor aceita novo comprovante sem bloquear pedidos com pagamento confirmado ou membro já ativado. | Um pedido confirmado pode regredir para `receipt_received`, mantendo potencialmente um acesso ativo. |
| P-03 | Alta | `server/db.ts`, revisão de comprovante | A revisão não exige que o comprovante esteja `pending` nem que a transição atual seja válida. | Um comprovante antigo pode ser aprovado ou rejeitado novamente por chamada direta. |
| P-04 | Alta | `server/db.ts`, aprovação/ativação | Atualizações de comprovante, token, usuário, perfil, vínculo e pedido são feitas em operações separadas. | Falha intermediária pode deixar estados financeiros e de acesso divergentes. |
| P-05 | Média | `client/src/pages/MemberReferrals.tsx` | A tela do membro trata carregamento e ausência de dados, mas não apresenta estado explícito para erro da consulta. | Falha da API pode parecer uma rede vazia ou zerada. |
| P-06 | Média | `server/referrals.integration.test.ts` | O teste de referrals verifica principalmente strings presentes ou ausentes nos arquivos. | A suíte não comprova igualdade de dados membro/admin nem transições reais no banco. |

## Evidências técnicas

### P-01 — patrocinador não está imutável

Em `completeApplicationPersonalization`, o vínculo é inserido com `sponsorId: application.ownerUserId`, mas o tratamento de duplicidade também define `sponsorId` novamente. Como `referralLinks.referredUserId` possui índice único, uma segunda ativação do mesmo indicado entra nesse caminho de duplicidade. O comportamento correto é manter o patrocinador original; se o novo patrocinador for diferente, a operação deve ser bloqueada e registrada para investigação.

### P-02 — possível regressão após pagamento confirmado

`uploadApplicationPaymentReceipt` localiza o pedido pelo código, cria outro comprovante e define `paymentStatus` como `receipt_received` sem verificar se o pagamento já está `confirmed` ou se o acesso já foi ativado. A ocultação do formulário na interface não substitui a proteção do servidor.

### P-03 — revisão repetida de comprovante

`reviewPaymentReceipt` confirma a propriedade do pedido e do comprovante, mas não verifica se o comprovante continua pendente nem se o pedido está em uma situação compatível com a decisão. A regra precisa ser aplicada no backend, pois a interface pode ser contornada ou ficar desatualizada.

### P-04 — falta de atomicidade

A aprovação altera o comprovante, em seguida pode emitir um token e depois atualiza o pedido. A ativação também grava usuário, perfil, recuperação, vínculo, token e pedido em etapas separadas. Sem uma transação, uma interrupção pode confirmar uma parte do fluxo e deixar outra parte pendente.

### P-05 — erro silencioso no painel do membro

`MemberReferrals.tsx` apresenta `isLoading` e depois usa os dados disponíveis. Não há ramo específico para `network.error`. O painel administrativo já possui uma mensagem de erro, portanto o painel do membro deve adotar o mesmo padrão.

### P-06 — cobertura insuficiente

Os testes existentes confirmam que determinadas funções, rotas e textos existem e que algumas ações não aparecem na interface. Eles não executam um banco de teste para provar: vínculo ativo, vínculo arquivado, patrocinador imutável, reprocessamento idempotente, tentativa de troca, reenvio após confirmação, revisão de comprovante não pendente e atomicidade.

## Critérios para considerar a correção concluída

A correção será considerada concluída quando o código atender simultaneamente aos seguintes critérios:

1. O patrocinador original for preservado em qualquer reprocessamento do mesmo indicado.
2. Uma tentativa de reprocessamento com patrocinador diferente for bloqueada sem alterar o vínculo existente.
3. Um pagamento confirmado ou membro ativado não puder receber novo comprovante que faça o status regredir.
4. Somente comprovantes pendentes puderem ser revisados.
5. Aprovação e ativação forem idempotentes e protegidas contra estado intermediário inconsistente.
6. O painel do membro diferenciar ausência real de vínculos de falha da API.
7. Os testes cobrirem os cenários de integridade descritos neste documento.
8. `pnpm check`, `pnpm test` e `pnpm build` passarem sem falhas.

## Limites da auditoria

O workspace não possui um banco de homologação configurado com dados reais do projeto. Por isso, a auditoria identifica os riscos no código e valida o comportamento estrutural, mas não afirma que os dados de produção foram corrigidos ou reconciliados. A validação com dados reais deverá ocorrer em ambiente de homologação antes do uso produtivo.
