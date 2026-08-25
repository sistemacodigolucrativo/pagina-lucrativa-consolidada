# Plano de Remoção — Pedidos do Painel Administrativo

**Projeto:** Página Lucrativa
**Branch:** `ManusIA-Edit`
**Documento de origem:** `docs/auditoria-remocao-pedidos-admin.md`

## Decisão

Remover **Pedidos** como módulo operacional global do painel administrativo. Preservar pedidos, pagamentos, comprovantes, tracking, ativação, `ownerUserId`, `affiliateSlug`, histórico e `Meus pedidos` do membro.

A URL antiga `/admin/pedidos` não deve carregar a tela operacional antiga. Ela será mantida apenas como redirecionamento para `/admin`, para evitar links mortos e preservar uma saída clara para usuários que tenham um favorito antigo.

## Escopo de alteração

| Arquivo ou área | Ação |
|---|---|
| `client/src/lib/adminNavigation.ts` | Remover o item `Pedidos` e o ícone que ficar sem uso. |
| `client/src/App.tsx` | Remover o import de `AdminApplications` e trocar a rota antiga por redirecionamento legado. |
| `client/src/pages/AdminOffice.tsx` | Remover consulta, contagens, fila, card e lista de pedidos globais. |
| `client/src/pages/AdminApplications.tsx` | Excluir a tela que não terá mais consumidor. |
| `server/routers.ts` | Remover somente `admin.applications` e `admin.updateApplication`. Preservar `member.*`, `applications.*` e `public.*`. |
| `server/db.ts` | Remover somente `getRecentApplications`, `updateAdminApplication` e `pendingApplicationCount` do overview. Preservar pagamento, tracking, comprovante e ativação. |
| `client/src/pages/AdminOperations.tsx` | Ajustar a mensagem da rota legada para explicar o redirecionamento do módulo removido. |
| testes | Atualizar contratos administrativos e acrescentar testes de preservação dos fluxos público e do membro. |
| `docs/` | Registrar auditoria, decisão, implementação e validação final. |

## Salvaguardas obrigatórias

A remoção não pode:

- excluir ou alterar a tabela `applications`;
- remover `applications.ownerUserId` ou `applications.affiliateSlug`;
- remover tracking público;
- remover `applications.paymentPage`, `applications.uploadReceipt` ou `applications.lookup`;
- remover `member.affiliateApplications`, `member.affiliateApplication` ou `member.reviewPaymentReceipt`;
- remover `public.applicationPersonalizationAccess` ou `public.completePersonalization`;
- remover pagamentos, comprovantes, confirmação ou ativação;
- alterar a regra de patrocinador imutável;
- criar uma operação administrativa alternativa para substituir o CRUD removido.

## Critérios de aceite

| Critério | Verificação |
|---|---|
| Menu admin sem Pedidos | `adminMenu` não contém `/admin/pedidos`. |
| Rota antiga segura | `/admin/pedidos` redireciona para `/admin` sem carregar `AdminApplications`. |
| Dashboard sem operação de pedidos | `AdminOffice` não consulta `admin.applications` nem mostra fila/lista de pedidos. |
| Contrato admin limpo | `admin.applications` e `admin.updateApplication` não existem. |
| Banco preservado | `applications` e seus campos continuam no schema e nas queries públicas/membro. |
| Fluxo público preservado | Criar pedido, consultar tracking, abrir pagamento e enviar comprovante continuam conectados. |
| Fluxo do membro preservado | `Meus pedidos` continua consultando pedidos atribuídos e revisando comprovantes. |
| Ativação preservada | Confirmação, token e personalização continuam presentes. |
| Segurança preservada | Nenhuma rota pública nova expõe dados administrativos. |
| Qualidade | `pnpm check`, `pnpm test`, `pnpm build` e `git diff --check` passam. |

## Estratégia de teste

Os testes devem combinar contratos estruturais existentes com verificações executáveis das responsabilidades. O resultado deve distinguir o que foi validado por código, o que foi validado pelo build e o que dependeria de banco de homologação populado.

Serão verificados os seguintes cenários: menu admin sem Pedidos; rota antiga sem tela operacional; ausência de referências a `AdminApplications`; preservação das rotas públicas; preservação de `Meus pedidos`; preservação de upload e revisão de comprovante; preservação de ativação; e ausência de alterações no schema.

## Ordem de execução

Primeiro será atualizado o código e os testes. Em seguida serão executados TypeScript, testes e build. Depois será revisado o diff e o preview. Somente com todas as verificações aprovadas será criado o commit e feito o push para `origin/ManusIA-Edit`.
