# Plano de Remoção — Divulgação do Admin

**Projeto:** Página Lucrativa
**Branch:** `ManusIA-Edit`
**Documento de entrada:** `plano-04-remover-divulgacao-admin.md`
**Documento de auditoria:** `docs/auditoria-remocao-divulgacao-admin.md`

## Decisão funcional

Remover do Admin o módulo global de Divulgação, que lista e altera contatos captados por membros. A ação não remove o domínio Divulgação do sistema. A Central de Divulgação continuará sendo a área operacional do membro.

A rota antiga `/admin/divulgacao` será tratada como rota legada segura, sem carregar a tela removida. A mensagem deve explicar que a operação continua nos fluxos específicos do membro e do público e redirecionar ao Dashboard.

## Escopo de alteração

| Arquivo ou área | Ação |
|---|---|
| `client/src/lib/adminNavigation.ts` | Remover o item `Divulgação` e seu ícone, sem tocar na Central do membro. |
| `client/src/App.tsx` | Remover o import de `AdminOutreach` e redirecionar `/admin/divulgacao` para `AdminOperations`. |
| `client/src/pages/AdminOutreach.tsx` | Excluir após confirmar que não existem consumidores legítimos. |
| `client/src/pages/AdminOffice.tsx` | Remover query, contador, card e atalho global de contatos. Preservar outras métricas. |
| `server/routers.ts` | Remover `admin.contacts` e `admin.updateContact`; preservar `member.contacts`, `member.invitations`, campanhas e analytics. |
| `server/db.ts` | Remover `getAdminContacts` e `updateAdminContact`; preservar `getMemberContacts`, `createMemberContact`, `updateMemberContact`, `recordMemberActivity` e auditoria. |
| `client/src/pages/AdminOperations.tsx` | Reutilizar como rota legada sem operação de contatos. |
| testes | Atualizar expectativas da navegação e criar garantias de remoção/preservação. |
| `docs/` | Registrar auditoria, plano e correções efetivamente aplicadas. |

## Salvaguardas obrigatórias

A mudança não pode:

- remover `member.campaigns`, `member.analytics`, `member.conversions`, `member.contacts` ou `member.invitations`;
- remover campanhas, links rastreáveis, eventos, conversões, contatos ou consentimentos;
- impedir o membro de criar ou atualizar seus próprios contatos;
- apagar atividades históricas ou logs de auditoria;
- remover `AdminCommunications` ou confundir comunicações preparadas com Divulgação;
- substituir a Central do membro por um novo CRM global;
- apagar a tabela `memberContacts` ou alterar seu schema;
- deixar import morto, procedure órfã ou atalho global escondido;
- remover a rota legada sem tratamento, criando uma página quebrada.

## Separação de autorização

A operação do membro deve continuar limitada pelo `ctx.user.id`. `getMemberContacts`, `createMemberContact` e `updateMemberContact` só podem ler ou alterar contatos pertencentes à conta autenticada. A remoção do Admin não deve enfraquecer essa proteção.

Os logs históricos de `admin_contact_update` permanecem preservados como dados. A remoção apenas elimina o caminho que poderia criar novos eventos desse tipo.

## Critérios de aceite

| Critério | Verificação |
|---|---|
| Divulgação ausente do menu Admin | `adminMenu` não contém `Divulgação` nem `/admin/divulgacao`. |
| Tela Admin removida | `AdminOutreach.tsx` não existe e não há import consumidor. |
| Rota antiga segura | `/admin/divulgacao` usa rota legada e redireciona ao Dashboard. |
| Dashboard independente | `AdminOffice` não consulta `admin.contacts`, não calcula `capturedContacts` e não exibe atalho global. |
| Endpoints globais removidos | `admin.contacts` e `admin.updateContact` não existem. |
| Operação do membro preservada | `member.contacts`, `createContact` e `updateContact` permanecem. |
| Campanhas preservadas | `member.campaigns`, tracking e links permanecem. |
| Métricas preservadas | `member.analytics`, leads e conversões permanecem. |
| Comunicações preservadas | `member.invitations` e `AdminCommunications` permanecem. |
| Consentimento preservado | `captureContactInput` continua exigindo `consent: true`. |
| Auditoria preservada | `getAdminActivities` e registros existentes permanecem. |
| Dados preservados | Sem alteração destrutiva em `memberContacts` ou tabelas de tracking. |
| Qualidade | `pnpm check`, `pnpm test`, `pnpm build` e `git diff --check` passam. |

## Matriz de testes

Serão testadas a ausência da entrada de navegação, a ausência física da tela, o redirecionamento da rota legada, a remoção dos contratos globais e a independência do Dashboard. Também serão protegidos os contratos do membro, a validação de consentimento, o vínculo do contato à campanha do usuário, a atualização limitada ao próprio contato, as conversões e as comunicações preparadas.

Os testes de contrato e inspeção estrutural serão identificados como tais. A confirmação de que contatos reais continuam no banco depende de ambiente de homologação populado e não será simulada como fato.

## Ordem de execução

Primeiro será concluída a auditoria e esta decisão será registrada. Em seguida serão removidos menu, rota operacional, tela, query, mutation e funções exclusivamente administrativas. Depois serão atualizados os testes e escrito o registro das correções. O check, a suíte completa, o build, o diff e o preview serão verificados antes do commit e do push.
