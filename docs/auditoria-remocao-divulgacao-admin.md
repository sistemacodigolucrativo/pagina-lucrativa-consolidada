# Auditoria — Remoção da Divulgação do Admin

**Projeto:** Código Lucrativo
**Branch:** `ManusIA-Edit`
**Base da auditoria:** commit `0ced064`
**Objetivo:** remover a supervisão administrativa global de contatos captados, preservando a Central de Divulgação do membro e todos os dados operacionais relacionados.

## Decisão de domínio

O módulo `/admin/divulgacao` é uma supervisão global de contatos pertencentes às operações individuais dos membros. A tela consulta todos os registros de `memberContacts`, permite alterar seu status e invalida consultas do Admin e do membro. Essa responsabilidade não deve permanecer como CRM global no painel administrativo.

A Central de Divulgação do membro é um domínio diferente. Ela permite que o membro crie campanhas, consulte tráfego, acompanhe conversões, crie e atualize seus próprios contatos, prepare comunicações e consulte atividades. Esses contratos continuam sendo necessários e devem permanecer protegidos pelo usuário autenticado.

## Mapa de dependências

| Camada | Uso | Classificação | Decisão |
|---|---|---|---|
| Menu Admin | `Divulgação → /admin/divulgacao` | Administrativo global | Remover do menu. |
| Rota Admin | `AdminOutreach` em `/admin/divulgacao` | Administrativo global | Substituir por rota legada segura. |
| Tela Admin | `client/src/pages/AdminOutreach.tsx` | Administrativo global | Excluir após retirar consumidores. |
| API Admin | `admin.contacts` | Administrativo global | Remover. |
| API Admin | `admin.updateContact` | Administrativo global | Remover para impedir alteração global de status. |
| Backend Admin | `getAdminContacts` e `updateAdminContact` | Administrativo global | Remover. |
| Dashboard Admin | Consulta, contador e atalho global de contatos | Administrativo global | Remover. |
| Contatos do membro | `member.contacts`, `createContact`, `updateContact` | Operação do membro | Preservar. |
| Campanhas | `member.campaigns`, links e tracking | Operação do membro | Preservar. |
| Analytics | `member.analytics` e eventos de tráfego | Operação do membro | Preservar. |
| Conversões | `member.conversions` e `campaignConversions` | Operação do membro | Preservar. |
| Comunicações | `member.invitations` e `AdminCommunications` | Responsabilidade distinta | Preservar. |
| Auditoria | `getAdminActivities` e histórico de atividades | Segurança/auditoria | Preservar registros históricos. |
| Schema | `memberContacts`, consentimento e tracking | Dados operacionais | Não alterar nem apagar. |

## Privacidade e responsabilidade

Os registros de contato possuem nome, e-mail, WhatsApp, origem e nota de consentimento. O membro que captou o contato deve ser o responsável por atualizá-lo. A procedure `member.updateContact` exige que o contato pertença ao `userId` autenticado antes de alterar status ou origem.

A remoção do módulo Admin não apaga contatos e não impede o membro de alterar seus próprios registros. Ela apenas elimina a leitura e a alteração global pelo administrador.

## Campanhas, tracking e conversões

A criação de contato pelo membro valida a campanha pertencente à conta, grava o contato com `captureType` coerente, incrementa leads e registra a conversão `lead`. Analytics consulta eventos de campanha e links de afiliado, e as conversões são lidas de `campaignConversions`.

Nenhuma dessas funções depende de `getAdminContacts` ou `updateAdminContact`. Portanto, remover os contratos administrativos não deve alterar campanhas, tracking, leads, analytics ou conversões.

## Comunicações

`AdminCommunications` não é o módulo Divulgação. Ele supervisiona comunicações preparadas pelo membro e não dispara mensagens externas. Seus contratos administrativos são `admin.invitations` e `admin.updateInvitation`, distintos dos contatos globais removidos. Essa área deve permanecer disponível.

## Auditoria e histórico

`getAdminActivities` consulta a trilha geral de atividades. Os registros históricos de alterações administrativas de contato, caso existam, devem permanecer no banco. O código novo não deve gerar mais eventos `admin_contact_update`, pois a ação administrativa será removida; isso não exige migration ou limpeza histórica.

## Dashboard

O Dashboard atual consulta `admin.contacts`, calcula `capturedContacts`, exibe o indicador `Contatos captados` e oferece o atalho `Divulgação`. Todos esses elementos pertencem ao módulo removido. O Dashboard pode continuar usando métricas de membros, conteúdo, cursos, tickets e depoimentos, sem consultar contatos globais.

## Riscos e limites

O principal risco é remover contratos compartilhados por engano. A auditoria confirma que os contratos do membro são separados dos contratos Admin. O segundo risco é confundir Divulgação com Comunicações; a auditoria confirma que Comunicações possui responsabilidade distinta e deve ser preservada.

A validação de dados existentes depende de banco populado. A mudança proposta é não destrutiva e não remove linhas de `memberContacts`, `memberActivities`, `campaignConversions`, `campaignLinks` ou eventos de tracking.

## Resultado esperado

O Admin não terá menu, tela, contador, atalho, query ou mutation para operar globalmente contatos captados pelos membros. As rotas e contratos do membro, as campanhas, o consentimento, o tracking, as métricas, as conversões, as comunicações e os logs de auditoria permanecerão disponíveis.
