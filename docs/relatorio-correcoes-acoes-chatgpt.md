# Relatório de correções — ações sugeridas pelo ChatGPT

**Projeto:** Página Lucrativa
**Branch de trabalho:** `ManusIA-Edit`
**Base confrontada:** `2d7b5250cf3b0b6f0bc3bd6311d1b6bdc862bb1f` (`Remove global admin outreach module`)
**Data:** 25 de agosto de 2026
**Status:** alterações aplicadas somente no workspace local; **nenhum commit foi criado e nada foi enviado ao repositório remoto**.

## 1. Parecer executivo

As recomendações recebidas foram confrontadas com a implementação real, e as correções técnicas de maior prioridade foram aplicadas. O maior problema confirmado era o contrato público de pagamento: o servidor aceitava somente o tracking code e serializava objetos completos de aplicação, recebimento e comprovantes. Esse fluxo foi substituído por um token de acesso assinado, uma operação POST e um DTO público mínimo.

Também foram aplicados limites persistentes para upload de comprovantes, correção do seed para impedir troca silenciosa de patrocinador ou ownership, transação de aplicação com sua conversão de campanha, transação de contato com lead/conversão/atividade e deduplicação funcional por conta, campanha e e-mail normalizado.

> **Importante:** o workspace ainda contém alterações não commitadas. O HEAD local e `origin/ManusIA-Edit` continuam no commit `2d7b525`; portanto, as correções existem somente no preview e no diretório de trabalho atual até uma futura decisão de commit.

## 2. Matriz de confronto das recomendações

| Item | Recomendação | Resultado | Observação |
|---|---|---|---|
| SEC-01 | Proteger `paymentPage` e reduzir retorno ao DTO mínimo | **Aplicado** | Token assinado, POST tRPC e allowlist de dados públicos. |
| SEC-02 | Proteger upload com o mesmo token e limites persistentes | **Aplicado** | Token vinculado ao pedido; limites de 3/h, 10/24h e um pendente. |
| DATA-01 | Impedir que o seed sobrescreva patrocinador/ownership | **Aplicado** | Divergência agora interrompe o seed com erro explícito. |
| DATA-02 | Tornar aplicação e conversão atômicas/idempotentes | **Aplicado** | Inserção e conversão estão na mesma transação; conversão usa unicidade existente. |
| DATA-03 | Tornar contato, lead, conversão e atividade atômicos/idempotentes | **Aplicado parcialmente** | Transação e deduplicação sequencial aplicadas; unicidade física/concurrency-proof ainda depende de auditoria e migração. |
| OPS-01 | Criar exceção Admin específica para pagamentos | **Não aplicado** | A recomendação reconhece decisão de produto; não foi reintroduzido CRUD global de pedidos. |
| STOR-01 | Excluir arquivo se a transação SQL falhar | **Não aplicado deliberadamente** | O skill de storage do projeto informa que a camada gerenciada não expõe delete; não foi criado endpoint incompatível. |
| DATA-04 | Adicionar FKs em `referralLinks` | **Não aplicado deliberadamente** | Não há banco local disponível para auditar órfãos antes de gerar/aplicar migration. |
| TEST-01 | Criar integração real com MySQL descartável/homologação | **Parcialmente aplicado** | Foram adicionados testes do token e contratos estruturais; a suíte real de banco continua pendente porque não há `DATABASE_URL` nem socket MySQL no workspace. |

## 3. Correções aplicadas

### 3.1 SEC-01 — acesso seguro e DTO mínimo da página de pagamento

A procedure `applications.paymentPage` deixou de ser uma query GET baseada somente no tracking code. O contrato agora é uma mutation POST que recebe `trackingCode` e `paymentAccessToken`. Isso impede que a credencial apareça na URL, no histórico do navegador ou em logs de query GET.

Em `server/db.ts`, foram adicionadas as funções `createPaymentAccessToken()` e `verifyPaymentAccessToken()`. O token é assinado com HMAC-SHA256 usando `JWT_SECRET`/segredo de sessão já existente, contém propósito explícito `application-payment`, `applicationId`, tracking code e expiração de 30 minutos. Em produção, a ausência de `JWT_SECRET` provoca erro em vez de usar a chave local de fallback.

Em `shared/applications.ts`, foi criado `PublicPaymentPage` e o schema `paymentAccessInputSchema`. O retorno de `getApplicationPaymentPage()` agora seleciona somente os campos necessários: nome do comprador, valor, estados, nome do responsável, PIX permitido e links de checkout. Foram removidos do payload público o e-mail e WhatsApp completos do comprador, `ownerUserId`, `affiliateSlug`, `adminNote`, perfil completo, e-mail do responsável, dados bancários, PayPal/PagSeguro, `storageKey`, `fileUrl`, histórico bruto de comprovantes e dados de revisão.

A UI foi ajustada em `ApplicationPayment.tsx`, `ApplicationPaymentMethods.tsx` e `ApplicationConfirmation.tsx`. O nome do comprador continua visível, mas os dados de contato privados foram removidos. O fluxo guarda o token em `sessionStorage` por código de pedido através de `client/src/lib/applicationPaymentAccess.ts`; o token não é colocado na URL. O resultado do envio inicial em `Home.tsx` salva o token antes do redirecionamento, e `ApplicationTracking.tsx` o salva depois de uma consulta válida por código mais e-mail.

Quando a rota pública é aberta apenas com tracking code, a interface agora exibe **“Acesso de pagamento não disponível”** e orienta o usuário a confirmar código e e-mail no acompanhamento. Essa proteção foi verificada no preview público.

### 3.2 SEC-02 — autorização e limites para comprovantes

`applications.uploadReceipt` passou a exigir `trackingCode`, `paymentAccessToken`, arquivo e metadados. O backend valida assinatura, propósito, tracking code e `applicationId` antes de carregar o pedido ou aceitar o arquivo. O fluxo só então aplica `assertReceiptUploadAllowed()`.

Antes de `storagePut()`, a transação consulta `applicationPaymentReceipts` e bloqueia as seguintes situações: três uploads no intervalo de uma hora, dez uploads no intervalo de 24 horas ou qualquer comprovante pendente existente. A consulta usa timestamps persistidos no banco, não contador em memória, e a transição condicional da aplicação mantém proteção contra concorrência básica.

A UI de upload envia o mesmo token de sessão usado para carregar a página. Depois de comprovante confirmado, o upload deixa de ser oferecido. O estado agora trabalha com `latestReceiptStatus`, pois o DTO público não retorna os comprovantes completos.

### 3.3 DATA-01 — seed sem troca de patrocinador ou ownership

`upsertApplication()` em `scripts/seed-demo.ts` deixou de usar `ON DUPLICATE KEY UPDATE` para `ownerUserId` e `affiliateSlug`. O seed primeiro localiza o pedido por tracking code. Se não existir, insere. Se existir, compara ownership e afiliado; divergência interrompe a execução com mensagem explícita.

Em reexecuções compatíveis, somente campos demonstrativos mutáveis são atualizados. Um pedido já confirmado não é rebaixado para estado anterior. O loop de `referralLinks` também foi alterado: o patrocinador existente é comparado e preservado; divergência interrompe o seed. Nunca mais há `sponsorId = VALUES(sponsorId)`.

### 3.4 DATA-02 — aplicação e conversão na mesma transação

`createApplication()` agora resolve a atribuição válida e executa a inserção em `applications` e a conversão de campanha dentro de uma única transação Drizzle. Se a conversão falhar, a criação do pedido também sofre rollback.

`recordCampaignConversion()` passou a aceitar um executor opcional, permitindo reutilizar o executor transacional. O insert aproveita a unicidade já existente em `campaignConversions` para `(entityType, entityId, conversionType)` e trata reprocessamentos retornando a conversão existente quando a operação resulta em conflito.

O resultado de `createApplication()` agora inclui o token de pagamento para que o navegador possa continuar diretamente para a página protegida.

### 3.5 DATA-03 — contato, lead, conversão e atividade

`createMemberContact()` agora executa validação da campanha, deduplicação, inserção do contato, incremento de `campaignLinks.leads`, conversão de lead e atividade na mesma transação. A gravação da atividade passou a aceitar executor transacional, evitando escrita fora da transação principal.

A deduplicação funcional usa `userId + campaignId + e-mail normalizado`; para contatos manuais, considera `campaignId IS NULL`. Quando um contato equivalente já existe, a função retorna o ID existente e `created: false`, sem incrementar leads nem criar conversão ou atividade duplicada.

A fonte analítica de conversões continua sendo `campaignConversions`; o contador legado `campaignLinks.leads` permanece como cache operacional e é incrementado somente no caminho de criação efetiva. A criação de uma restrição UNIQUE física não foi feita neste momento porque não há banco disponível para auditar duplicidades existentes e preparar migration com segurança.

### 3.6 Testes adicionados e atualizados

Foi criado `server/applicationPaymentAccess.test.ts`, cobrindo token válido, vínculo com pedido, propósito, tracking code, adulteração e expiração. `server/seed.integrity.test.ts` protege o seed contra regressão para sobrescrita de patrocinador e ownership.

`server/applications.integration.test.ts` foi ampliado para verificar token, DTO mínimo, POST, limites persistentes e transação. `server/campaignConversions.integration.test.ts` foi ajustado para o novo fluxo transacional e deduplicado. As asserções antigas foram atualizadas sem reintroduzir contratos removidos.

## 4. Recomendações não aplicadas e motivo técnico

### 4.1 OPS-01 — exceção administrativa

Não foi criada uma nova fila Admin de exceções porque isso depende de decisão operacional do negócio. A remoção de Pedidos Admin não foi revertida. Se for necessário suporte para fraude, patrocinador inativo ou disputa, a implementação futura deve ser limitada a busca por tracking code, leitura mínima, motivo obrigatório, trilha de auditoria e nenhuma alteração de patrocinador, ownership ou criação de pedido.

### 4.2 STOR-01 — exclusão compensatória

Não foi criado `storageDelete()`. A documentação de storage do próprio projeto informa que a camada gerenciada não expõe endpoint de exclusão. Adicionar um helper parcial somente para o storage local criaria falsa sensação de cobertura, pois o preview gerenciado continuaria sem rollback físico. O risco de objeto órfão permanece documentado e exige decisão de infraestrutura ou rotina de reconciliação compatível com o provedor.

### 4.3 DATA-04 — foreign keys

O schema ainda não recebeu FKs em `referralLinks`. Não há `DATABASE_URL` nem socket MySQL local disponível no workspace, portanto não foi possível executar a consulta de órfãos recomendada. A migration deve ser preparada somente depois de auditar patrocinadores e indicados inexistentes e definir a política de exclusão restritiva.

### 4.4 TEST-01 — banco real

A suíte atual prova contratos, tipos, token, estados e invariantes por inspeção estrutural, mas não substitui uma suíte com MySQL real. Os testes de banco devem ser executados em ambiente descartável ou homologação com dados autorizados, cobrindo concorrência, rollback após falha, retries, upload, aprovação, ativação e integridade de referências.

## 5. Validações executadas

| Validação | Resultado |
|---|---|
| `pnpm check` | **Passou** — TypeScript sem erros. |
| `pnpm test` | **Passou** — 57 arquivos e 182 testes. |
| `pnpm build` | **Passou** — Vite e bundle Express concluídos. |
| `git diff --check` | **Passou** — sem erro de whitespace. |
| Busca de usos legados `paymentPage.useQuery`, payload `receiving` completo e `application` completo | **Sem ocorrência em produção**; a única ocorrência é a asserção negativa do teste. |
| Preview inicial | **HTTP 200** e página inicial renderizada. |
| Rota de pagamento apenas com tracking code | **Bloqueada visualmente** com orientação para confirmar código e e-mail. |

O build ainda emite o aviso já conhecido de bundle acima de 500 kB; isso não foi introduzido como falha funcional desta rodada. O pnpm também continua avisando que campos antigos de configuração foram ignorados.

## 6. Estado do workspace e do remoto

O workspace contém alterações intencionais nos arquivos de backend, frontend, tipos, seed e testes, além dos novos arquivos `client/src/lib/applicationPaymentAccess.ts`, `server/applicationPaymentAccess.test.ts`, `server/seed.integrity.test.ts` e este relatório.

Não foi executado `git commit`, `git push` ou qualquer alteração no remoto. O estado remoto permanece:

- Branch: [`ManusIA-Edit`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-versao-finalizada/tree/ManusIA-Edit)
- HEAD remoto auditado: [`2d7b525`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-versao-finalizada/commit/2d7b5250cf3b0b6f0bc3bd6311d1b6bdc862bb1f)
- Preview temporário: `https://3000-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer`

## 7. Próximos passos antes de um eventual commit

A validação do usuário deve priorizar a jornada de pedido novo, redirecionamento para pagamento, bloqueio de acesso somente com código, consulta por código mais e-mail, reabertura de pagamento dentro da sessão, upload de comprovante e tentativa de reupload após os limites.

Antes de um eventual commit, recomenda-se validar em ambiente com banco autorizado a auditoria de órfãos em `referralLinks`, o comportamento concorrente da deduplicação de contatos e a estratégia de limpeza de storage. Também deve ser tomada a decisão de produto sobre exceções administrativas, sem reintroduzir o antigo módulo global de Pedidos.

## Referências

[1]: [Branch `ManusIA-Edit`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-versao-finalizada/tree/ManusIA-Edit)
[2]: [HEAD auditado — commit `2d7b525`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-versao-finalizada/commit/2d7b5250cf3b0b6f0bc3bd6311d1b6bdc862bb1f)
[3]: [`server/db.ts`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-versao-finalizada/blob/2d7b5250cf3b0b6f0bc3bd6311d1b6bdc862bb1f/server/db.ts)
[4]: [`server/routers.ts`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-versao-finalizada/blob/2d7b5250cf3b0b6f0bc3bd6311d1b6bdc862bb1f/server/routers.ts)
[5]: [`shared/applications.ts`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-versao-finalizada/blob/2d7b5250cf3b0b6f0bc3bd6311d1b6bdc862bb1f/shared/applications.ts)
[6]: [`scripts/seed-demo.ts`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-versao-finalizada/blob/2d7b5250cf3b0b6f0bc3bd6311d1b6bdc862bb1f/scripts/seed-demo.ts)
[7]: [Notas de validação do preview](sandbox:/home/ubuntu/preview-validation-notes.md)
