# Auditoria — Remoção do Módulo Global de Pedidos do Admin

**Projeto:** Página Lucrativa
**Branch de trabalho:** `ManusIA-Edit`
**Base da auditoria:** commit `46caf1c`
**Objetivo:** retirar o módulo operacional global de Pedidos do painel administrativo sem remover pedidos, pagamentos, tracking, comprovantes, ativação ou a operação do membro/patrocinador.

## Regra funcional

O pedido pertence ao membro responsável por meio de `applications.ownerUserId` e `applications.affiliateSlug`. O painel do membro já possui a jornada operacional em `Meus pedidos`, incluindo consulta dos pedidos atribuídos e revisão de comprovantes pendentes. O público utiliza o tracking code para acompanhar o pedido, pagar e enviar comprovante.

A remoção deve atingir apenas a visão genérica administrativa que lista todos os pedidos e permite alterar `application.status` e `adminNote`. Não deve atingir o fluxo de pagamento, confirmação, emissão de acesso, personalização ou vínculo de patrocinador.

## Dependências encontradas

| Camada | Implementação | Decisão |
|---|---|---|
| Navegação admin | `adminMenu` continha `Pedidos → /admin/pedidos`. | Remover o item do menu. |
| Rota admin | `App.tsx` carregava `AdminApplications` em `/admin/pedidos`. | Substituir por redirecionamento legado ao Dashboard, sem carregar a tela antiga. |
| Tela global | `AdminApplications.tsx` listava pedidos e alterava status/notas genéricas. | Remover o arquivo e o contrato de tela. |
| Dashboard admin | `AdminOffice.tsx` consultava `admin.applications`, mostrava contagens, fila e lista de pedidos recentes. | Remover essa operação e manter apenas indicadores que pertencem ao Admin. |
| API admin | `admin.applications` e `admin.updateApplication`. | Remover, pois são CRUD/consulta genérica fora do domínio do membro. |
| Banco admin | `getRecentApplications` e `updateAdminApplication`. | Remover, pois só atendem os contratos administrativos eliminados. |
| Overview admin | `pendingApplicationCount` era calculado a partir de `applications`. | Remover do contrato, pois a fila global de pedidos deixa de existir. |
| Membro | `member.affiliateApplications`, `member.affiliateApplication` e `member.reviewPaymentReceipt`. | Preservar integralmente. |
| Público | `applications.submit`, `applications.lookup`, `applications.paymentPage`, `applications.uploadReceipt`. | Preservar integralmente. |
| Ativação | `public.applicationPersonalizationAccess` e `public.completePersonalization`. | Preservar integralmente. |

## Responsabilidades que permanecem

A revisão de comprovantes não depende do painel global removido. Ela continua no fluxo do membro responsável, protegido por autenticação, validação conjunta de pedido e comprovante e pelas guardas de integridade já aplicadas. A ativação pública continua condicionada ao pagamento confirmado e ao token de acesso ativo.

O tracking público continua resolvendo pelo código e e-mail. A página de pagamento continua exibindo as formas de pagamento e aceitando comprovante apenas em estados permitidos. `applications.ownerUserId`, `applications.affiliateSlug` e a tabela `referralLinks` não serão alterados nesta remoção.

## Risco identificado

O risco é alto se a remoção for feita por busca ampla de `applications`, porque o mesmo domínio contém funções públicas, do membro e de ativação. Por isso, somente os consumidores exclusivos de `admin.applications`, `admin.updateApplication`, `getRecentApplications`, `updateAdminApplication` e `pendingApplicationCount` devem ser removidos.

## Resultado esperado

O Admin não terá mais menu, card, fila ou tela operacional global de Pedidos. A URL antiga `/admin/pedidos` será tratada como rota legada e redirecionará para `/admin`, evitando uma página morta e sem reabrir o módulo removido.

O membro continuará vendo e operando seus pedidos em `/membros/meus-pedidos`. O público continuará criando pedidos, acompanhando o tracking, enviando comprovantes e concluindo a ativação.

## Limites da auditoria

A auditoria confirma a separação pelo código e pelos contratos tRPC. A validação com dados reais de produção continua dependente de ambiente de homologação populado, que não está configurado no workspace local.
