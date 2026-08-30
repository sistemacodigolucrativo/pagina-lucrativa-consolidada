# Correções Aplicadas — Integridade da Rede e dos Pagamentos

**Projeto:** Código Lucrativo
**Branch:** `ManusIA-Edit`
**Commit de origem:** `1a5a488`
**Status:** correções aplicadas e validadas localmente

## Resumo executivo

Foram aplicadas correções de integridade no fluxo de cadastro, pagamento, comprovante, ativação e rede. A implementação mantém `referralLinks` como fonte única dos relacionamentos, não cria vínculos manuais no painel e impede que uma relação comercial já registrada seja trocada silenciosamente.

A regra central ficou protegida no servidor: o reprocessamento com o mesmo patrocinador continua idempotente; o reprocessamento com patrocinador diferente é bloqueado; e as operações críticas de pagamento e ativação passaram a usar transações para evitar estados parciais.

## Correções aplicadas

| ID | Correção | Implementação |
|---|---|---|
| C-01 | Patrocinador imutável | A ativação consulta o vínculo existente por `referredUserId`, valida o patrocinador com `assertSponsorImmutable` e nunca atualiza `sponsorId` em caso de duplicidade. |
| C-02 | Reenvio após confirmação bloqueado | O servidor rejeita upload quando o pagamento está confirmado, o acesso foi emitido, o membro foi ativado ou já existe comprovante aguardando análise. A interface só oferece nova tentativa após rejeição. |
| C-03 | Revisão única de comprovante | A revisão procura somente comprovantes `pending` e exige pedido em `receipt_received`. Atualizações condicionais impedem dupla decisão concorrente. |
| C-04 | Aprovação atômica | A mudança do comprovante, emissão do token e atualização do pedido ocorrem dentro da mesma transação. |
| C-05 | Ativação atômica | Criação ou atualização do usuário, perfil, recuperação, vínculo, consumo do token e conclusão do pedido ocorrem dentro da mesma transação. |
| C-06 | Estado de erro no membro | `MemberReferrals.tsx` diferencia falha da API de ausência real de vínculos e oferece ação para tentar novamente. |
| C-07 | Cobertura de regressão | Foram adicionados testes executáveis para imutabilidade, estados de comprovante e revisão única, além de asserções estruturais para proteger o contrato. |

## Arquivos alterados

| Arquivo | Finalidade |
|---|---|
| `server/db.ts` | Guardas de estado, upload transacional, revisão transacional e ativação com patrocinador imutável. |
| `server/integrityGuards.ts` | Regras puras e reutilizáveis de imutabilidade e transições. |
| `server/integrityGuards.test.ts` | Testes unitários das regras de integridade. |
| `server/referrals.integration.test.ts` | Proteção do contrato estrutural da rede, das transações e do estado de erro. |
| `client/src/pages/MemberReferrals.tsx` | Tratamento explícito de erro e tentativa novamente. |
| `client/src/pages/ApplicationPayment.tsx` | Alinhamento da interface para permitir reenvio somente após rejeição. |
| `server/applications.integration.test.ts` | Proteção do contrato da jornada de pagamento e do reenvio após rejeição. |
| `docs/auditoria-integridade-rede-pagamentos.md` | Registro dos problemas encontrados antes da correção. |
| `docs/plano-correcoes-integridade-rede-pagamentos.md` | Registro das recomendações e critérios de aceite. |
| `docs/correcoes-aplicadas-integridade-rede-pagamentos.md` | Este documento, com as correções efetivamente aplicadas. |

## Comportamento final do fluxo

```text
link/campanha
  → pedido com ownerUserId definido
  → envio de comprovante permitido apenas em estado elegível
  → revisão única de comprovante pendente
  → confirmação transacional e emissão de acesso
  → personalização transacional
  → referralLinks criado uma vez
  → reprocessamento com mesmo patrocinador é idempotente
  → patrocinador diferente é bloqueado sem alterar o vínculo
```

## Testes executados

| Comando | Resultado |
|---|---|
| `pnpm check` | Passou sem erros TypeScript. |
| `pnpm test -- server/integrityGuards.test.ts server/referrals.integration.test.ts` | Passou; a suíte executou 54 arquivos e 171 testes. |
| `pnpm test` | Passou; 54 arquivos e 171 testes aprovados. |
| `pnpm build` | Passou; frontend e servidor foram empacotados. |
| `git diff --check` | Passou sem erros de whitespace. |

O build mantém dois avisos não bloqueantes já conhecidos: o pnpm ignora campos antigos de configuração do `package.json`, e o bundle JavaScript principal supera 500 kB. Esses avisos não impediram a compilação.

## Critérios de aceite atendidos

A branch mantém o módulo administrativo, não cria uma segunda tabela, não oferece criação manual de vínculo, preserva histórico arquivado, usa a mesma fonte `referralLinks` para membro e administração, protege o servidor e a interface contra regressões de status e adiciona cobertura de teste para as novas regras.

## Limitação remanescente

A validação foi feita no workspace sem um banco de homologação populado com dados reais. Portanto, os testes comprovam as regras de código e as transições protegidas, mas a conferência visual de vínculos reais, valores recebidos e histórico de produção ainda deve ser feita em ambiente de homologação antes do deploy definitivo.
