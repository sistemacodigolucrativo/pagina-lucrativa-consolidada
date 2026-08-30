# Correções Aplicadas — Remoção de Pedidos do Admin

**Projeto:** Código Lucrativo
**Branch:** `ManusIA-Edit`
**Base:** commit `46caf1c`
**Status:** implementado e validado no workspace

## Resultado executivo

O módulo global operacional de **Pedidos** foi removido do painel administrativo sem remover pedidos do sistema. A tabela `applications`, o tracking público, os pagamentos, os comprovantes, a confirmação, a ativação, `ownerUserId`, `affiliateSlug`, o histórico e `Meus pedidos` do membro foram preservados.

A URL antiga `/admin/pedidos` não carrega mais `AdminApplications.tsx`. Ela utiliza o redirecionamento legado para `/admin`, evitando página morta e evitando reabrir o módulo removido.

## Alterações aplicadas

| Área | Alteração |
|---|---|
| Menu administrativo | Removido `Pedidos → /admin/pedidos` de `client/src/lib/adminNavigation.ts`. |
| Roteamento | Removido o import de `AdminApplications`; `/admin/pedidos` agora aponta para `AdminOperations`, que redireciona ao Dashboard. |
| Tela antiga | Excluído `client/src/pages/AdminApplications.tsx`, pois não restou consumidor legítimo. |
| Dashboard | Removidas consulta, contagens, fila, card, atalho e lista global de pedidos de `AdminOffice.tsx`. |
| Contrato tRPC | Removidos `admin.applications` e `admin.updateApplication`. Os contratos públicos e do membro permanecem. |
| Backend | Removidos `getRecentApplications`, `updateAdminApplication` e `pendingApplicationCount` do overview administrativo. |
| Rota legada | Atualizada a mensagem de `AdminOperations.tsx` para explicar que a operação pertence ao membro responsável. |
| Testes | Atualizados testes de aplicações, navegação, dashboard, responsividade e preservação dos contratos público/membro. |
| Documentação | Criados os documentos de auditoria, plano e correções aplicadas nesta mudança. |

## Fluxos preservados

| Fluxo | Evidência |
|---|---|
| Criar pedido | `applications.submit` continua público. |
| Acompanhar pedido | `applications.lookup` e `/pedido/acompanhar` continuam disponíveis. |
| Abrir pagamento | `applications.paymentPage` continua disponível. |
| Enviar comprovante | `applications.uploadReceipt` continua disponível com as guardas anteriores. |
| Ver pedidos do membro | `member.affiliateApplications` e `member.affiliateApplication` continuam disponíveis. |
| Revisar comprovante | `member.reviewPaymentReceipt` continua no workspace do membro responsável. |
| Ativar membro | `public.applicationPersonalizationAccess` e `public.completePersonalization` continuam disponíveis. |
| Atribuição comercial | `applications.ownerUserId`, `applications.affiliateSlug` e `referralLinks` não foram removidos ou realocados. |

## Segurança e escopo

A remoção não apagou dados, não alterou o schema, não criou tabela substituta, não criou atribuição manual e não removeu controles indispensáveis para aprovação, pagamento ou ativação. O administrador deixou de operar uma fila global genérica; o membro responsável continua sendo o operador do pedido e do comprovante dentro do seu próprio escopo.

A rota legada existe somente para redirecionamento. Ela não consulta `admin.applications`, não altera `application.status` e não mantém qualquer ação global de pedido.

## Validação final

| Verificação | Resultado |
|---|---|
| `pnpm check` | Aprovado sem erros TypeScript. |
| `pnpm test` | Aprovado: 54 arquivos e 172 testes. |
| `pnpm build` | Aprovado; frontend e servidor empacotados. |
| `git diff --check` | Aprovado sem erros de whitespace. |
| Referências administrativas proibidas em produção | Nenhuma encontrada. |
| Referências públicas e do membro | Presentes e preservadas. |
| Preview público | HTTP 200; título da página carregado corretamente. |

O build mantém apenas avisos não bloqueantes já conhecidos: configuração antiga do pnpm e bundle JavaScript acima de 500 kB.

## Documentação relacionada

- `docs/auditoria-remocao-pedidos-admin.md`: dependências, responsabilidades e risco antes da remoção.
- `docs/plano-remocao-pedidos-admin.md`: decisão funcional, salvaguardas e critérios de aceite.
- `docs/correcoes-aplicadas-remocao-pedidos-admin.md`: este registro da implementação e validação.

## Limitação

A validação local comprova os contratos, a compilação e os testes automatizados. A conferência com pedidos, pagamentos, comprovantes e vínculos reais depende de um banco de homologação populado, que não está disponível no workspace.
