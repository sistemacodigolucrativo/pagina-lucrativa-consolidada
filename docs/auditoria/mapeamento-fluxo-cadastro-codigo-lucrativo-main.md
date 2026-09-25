# Mapeamento do Fluxo de Cadastro — Código Lucrativo

**Repositório:** [sistemacodigolucrativo/pagina-lucrativa-consolidada](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada)  
**Branch analisada:** `main`  
**Revisão fixada:** [`42dbf93c43bbc9896512b0264d5a09f8263b0787`](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/commit/42dbf93c43bbc9896512b0264d5a09f8263b0787)  
**Commit:** 24/09/2026 às 02:17:37 UTC — `Merge branch fix/vps-installer-audit`.  
**Data da análise:** 25/09/2026.  
**Método:** leitura estática de código obtido pelo GitHub. Nenhum teste, formulário, pagamento, cadastro, aprovação ou rejeição foi executado. Nenhum arquivo do projeto ou banco foi alterado.

## 1. Objetivo do mapeamento

Orientar uma IA de teste sobre o fluxo navegável existente na revisão acima, desde o link de indicação até o primeiro login após ativação, incluindo a conferência do pagamento pelo apresentador.

Este documento **não é um relatório de testes executados**. “Esperado pelo código” significa comportamento previsto na implementação, não funcionamento comprovado no navegador ou na VPS. Divergências estáticas e lacunas estão identificadas para validação posterior, sem correções propostas ou aplicadas.

A distinção central é: **enviar o formulário cria um pedido em `applications`; aprovar o comprovante libera personalização; concluir a personalização cria/configura a conta em `users` e o vínculo em `referralLinks`.** Aprovação, por si só, não conclui o cadastro da senha nem inicia sessão.

Fontes: [server/routers.ts · L399](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/routers.ts#L399); [server/db.ts · L1664](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1664); [server/db.ts · L1958](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1958); [server/db.ts · L2455](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L2455).

## 2. Escopo analisado

- Página pública, CTAs, link direto, indicação e origem por campanha.
- Dados, validações e envio do pedido; pagamento, comprovante e acompanhamento.
- Atribuição ao apresentador, consulta do pedido, aprovação e rejeição.
- Personalização liberada, criação da conta, primeiro login e conferência pontual do vínculo.
- Operação administrativa exclusivamente sobre os mesmos pedidos, como caminho alternativo encontrado.
- Variantes para execução futura e dependências de banco, ambiente e navegador.

Ficam fora desta etapa a auditoria geral das áreas de membros/administração, os demais módulos e qualquer execução prática.

**Convenções de navegação**

`{BASE_URL}` é o domínio e, se aplicável, o prefixo da instalação que a IA de teste receberá. O domínio de produção efetivamente instalado não foi confirmado. As rotas abaixo usam a raiz lógica da aplicação. `withAppBase` e `WouterRouter base={DEV_PREFIX}` acrescentam `VITE_DEV_PREFIX` quando configurado.

| Identificador | Origem | Uso e distinção |
|---|---|---|
| `afiliado` / `affiliateSlug` | URL pública / `memberProfiles.slug` | Identifica o apresentador; não é senha. |
| `trackingCode` | Servidor: `PL-` + 12 caracteres hexadecimais em maiúsculas | Identifica o pedido; acompanhado do e-mail permite consulta. |
| `paymentAccessToken` | Servidor, assinado, validade de 30 minutos | Permite ler pagamento e enviar comprovante; fica no `sessionStorage`. |
| `publicCode` | Gerado na aprovação, 16 caracteres hexadecimais | Vai em `/personalizar?codigo=...`; não é o `trackingCode`. |
| `applicationAccessTokens.tokenHash/encryptedToken` | Aprovação | Registro interno de acesso; o formulário atual não pede uma “senha especial” separada. |
| Senha de acesso | Escolhida na personalização | Utilizada com o e-mail do pedido em `/acesso`. |

## 3. Arquivos e rotas localizados no projeto

Os links abaixo apontam para a revisão fixada, evitando que uma atualização posterior da `main` altere a evidência. Arquivos genéricos de UI/CSS e módulos sem participação direta não foram transformados em etapas de cadastro.

| Arquivo | Tipo | Função no fluxo | Rota/Endpoint relacionado | Observação |
|---|---|---|---|---|
| [client/src/App.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/App.tsx) | Rotas React | AppRoutes registra as páginas públicas e as telas diretamente relacionadas. | /, /pedido/*, /personalizar, /acesso, /membros/meus-pedidos, /admin/pedidos | As duas rotas de pagamento usam ApplicationPayment. |
| [client/src/pages/Home.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/Home.tsx) | Página / hook | Home, submitApplication, JoinButton; resolve apresentador e envia pedido. | /; applications.submit; public.affiliateProfile; public.defaultAffiliateProfile | Formulário na seção #f. |
| [client/src/components/VioletaNeonActivationCard.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/VioletaNeonActivationCard.tsx) | Formulário | Campos Nome completo, E-mail e WhatsApp; botão de envio. | /#f | Preço visual fixo de R$ 50,00. |
| [client/src/components/PublicConversionCta.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/PublicConversionCta.tsx) | CTA | CTA flutuante e scrollToActivationSection. | /#f | Aparece após #o-que-recebe atingir o topo e antes de #f ficar visível. |
| [shared/publicRoutes.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/publicRoutes.ts) | Classificação de rotas | isPublicConversionRoute usado pelo CTA. | / e outras páginas públicas | O CTA ainda exige location === '/'. |
| [client/src/components/PublicSalesCopyRuntime.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/PublicSalesCopyRuntime.tsx) | Configuração visual | PublicSalesCopyProvider/usePublicSalesCopy carregam textos configuráveis. | GET /api/public-sales-copy | Texto de seções pode depender do banco. |
| [server/_core/publicSalesCopyConfig.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/publicSalesCopyConfig.ts) | Endpoint público | registerPublicSalesCopyConfig monta overrides de managedContent. | GET /api/public-sales-copy | Dados efetivos não consultados. |
| [shared/affiliateAttribution.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/affiliateAttribution.ts) | Normalização | normalizeAffiliateSlug: minúsculas, trim e formato de 3–96 caracteres. | ?afiliado= | Sem persistência de slug no navegador neste helper. |
| [shared/contactValidation.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/contactValidation.ts) | Schema / normalização | normalizeEmail, normalizePhone, normalizedEmailZodSchema e phoneZodSchema. | Cadastro, consulta e personalização | Há diferença entre sanitização na UI e validação da API. |
| [client/src/components/PhoneInput.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/PhoneInput.tsx) | Campo compartilhado | Máscara, limite de 11 dígitos e validade customizada. | /#f; /personalizar | Não remove prefixo internacional 55. |
| [shared/structuredValidation.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/structuredValidation.ts) | Validação | httpUrlZodSchema, validateHttpUrl, normalizeHttpUrl. | /personalizar | Somente protocolos HTTP/HTTPS; não restringe domínio social. |
| [shared/applications.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/applications.ts) | Schemas / tipos / rótulos | ApplicationInput, PublicPaymentPage, ApplicationReceiptUpload, ApplicationPersonalizationInput e seus schemas. | applications.*; public.completePersonalization | Enums e OFFER_AMOUNT_CENTS = 5000. |
| [client/src/pages/ApplicationPayment.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationPayment.tsx) | Pagamento atual | ApplicationPayment, handleReceipt, handleTrackOrder. | /pedido/:trackingCode/pagamento e /pagamento/instrucoes | Upload automático ao selecionar arquivo válido. |
| [client/src/components/PaymentReceivingDetails.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/PaymentReceivingDetails.tsx) | Dados de pagamento | Exibe bancos, PagSeguro, PayPal e outra forma. | Tela de pagamento | Dados vêm do apresentador atribuído. |
| [client/src/lib/applicationPaymentAccess.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/lib/applicationPaymentAccess.ts) | Armazenamento de acesso | savePaymentAccessToken/readPaymentAccessToken/clearPaymentAccessToken. | Pagamento e acompanhamento | sessionStorage por código; token não vai na URL. |
| [client/src/pages/ApplicationTracking.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationTracking.tsx) | Acompanhamento | ApplicationTracking, submit e consulta por código + e-mail. | /pedido/acompanhar; applications.lookup | Entrega token renovado e link de personalização após aprovação. |
| [client/src/pages/ApplicationConfirmation.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationConfirmation.tsx) | Rota alternativa | ApplicationConfirmation; ramo de comprovante e fallback. | /pedido/confirmacao?codigo=...&comprovante=1 | Não é o destino do submit nem do upload atuais. |
| [client/src/pages/ApplicationPaymentMethods.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationPaymentMethods.tsx) | Implementação alternativa | Fluxo antigo com seleção prévia de arquivo e redirecionamento à confirmação. | Declara uso de /pedido/:trackingCode/pagamento | Não está importado/registrado em AppRoutes; não usar como fluxo atual. |
| [client/src/pages/ApplicationPersonalization.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationPersonalization.tsx) | Ativação final | ApplicationPersonalization/submit; dados públicos, senha e recuperação. | /personalizar?codigo=... | E-mail fixado pelo pedido; sem login automático. |
| [client/src/pages/DemoLogin.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/DemoLogin.tsx) | Login | DemoLogin/onSubmit acessa a conta criada. | /acesso; auth.demoLogin | Nome técnico demoLogin também atende contas locais reais. |
| [server/demoAuth.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/demoAuth.ts) | Autenticação | demoLoginInputSchema, resolveDemoAccount, createDemoSession/resolveDemoSession. | auth.demoLogin; cookie de sessão | username limitado a 64 caracteres. |
| [server/credentialHash.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/credentialHash.ts) | Hash | hashPassword e hashesMatch. | Personalização e login | Senha e resposta secreta são protegidas por hash. |
| [client/src/_core/hooks/useAuth.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/_core/hooks/useAuth.ts) | Sessão da UI | useAuth consulta auth.me. | Áreas autenticadas | Não é criação de conta. |
| [client/src/pages/MemberOffice.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/MemberOffice.tsx) | Origem do link | buildAffiliateLink/copyAffiliateLink, cartão Seu link de indicação. | /membros; member.overview | Copiar link usa withAppBase. |
| [client/src/pages/MemberProfile.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/MemberProfile.tsx) | Dependência do apresentador | Identificador público e perfil que alimentam o link. | /membros/configuracoes; member.profile/updateProfile | Lido somente quanto à origem do slug e dados públicos. |
| [client/src/pages/MemberReceiving.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/MemberReceiving.tsx) | Dependência do pagamento | Dados de recebimento do apresentador. | /membros/recebimentos; member.receiving/updateReceiving | Configuração prévia; não integra o formulário do comprador. |
| [client/src/pages/MemberAffiliateOrders.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/MemberAffiliateOrders.tsx) | Análise pelo apresentador | openOrder, openReceiptViewer e mutation review. | /membros/meus-pedidos; member.affiliateApplications/affiliateApplication/reviewPaymentReceipt | Aceitar, Visualizar e Recusar. |
| [client/src/components/DashboardLayout.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/DashboardLayout.tsx) | Navegação / notificações | Sino, leitura de notificação e acesso autenticado. | member.notifications/markNotificationRead | Consulta de notificações a cada 30 s na área de membros. |
| [client/src/lib/memberDashboardNavigation.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/lib/memberDashboardNavigation.ts) | Menu | memberDashboardMenuItems deriva itens de memberOfficeNavigation. | Rotas de membros relacionadas | Apenas orientação de navegação. |
| [shared/memberOfficeContent.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/memberOfficeContent.ts) | Catálogo de menu | Rótulos Meus pedidos, Ganhos e extrato e Minha rede. | /membros/meus-pedidos, /membros/ganhos, /membros/rede | Não é lógica de aprovação. |
| [client/src/pages/MemberEarnings.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/MemberEarnings.tsx) | Resultado direto | Exibe adesões confirmadas e total informativo. | /membros/ganhos; member.finance | Não representa saldo ou repasse automático. |
| [client/src/pages/MemberReferrals.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/MemberReferrals.tsx) | Vínculo final | Meu apresentador e indicações diretas. | /membros/rede; member.referrals | Vínculo criado ao concluir personalização. |
| [client/src/pages/AdminOrders.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/AdminOrders.tsx) | Operação administrativa restrita ao pedido | loadOrders/loadDetail/reviewReceipt. | /admin/pedidos; /api/admin/orders* | Caminho alternativo de análise; não foi auditado o painel inteiro. |
| [server/_core/adminCommercialOperations.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/adminCommercialOperations.ts) | REST administrativo | handleOrders, handleOrderDetail, handleReceiptReview. | /api/admin/orders; /:id; /:id/receipts/:receiptId/review | Reutiliza reviewPaymentReceipt; exige admin. |
| [server/routers.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/routers.ts) | tRPC | appRouter; routers applications/public/member/auth; mapReceiptReviewTrpcError. | /api/trpc/<procedure> | Encadeamento efetivo usa wrappers de criticalFlowFixes. |
| [server/criticalFlowFixes.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/criticalFlowFixes.ts) | Regra de cadastro / enriquecimento | createApplicationWithUniqueEmail, resolveApplicationAffiliate, getApplicationPaymentPageComplete, getApplicationPersonalizationAccessPrefilled. | applications.submit/paymentPage; public.applicationPersonalizationAccess | Não confundir função importada com função efetivamente chamada. |
| [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts) | Persistência / transições | createApplication; consultas; uploadApplicationPaymentReceipt; reviewPaymentReceipt; completeApplicationPersonalization. | Procedures citadas nas seções 5–7 | Contém atribuição, token de 30 min, ocultação de rejeitados e vínculo. |
| [server/integrityGuards.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/integrityGuards.ts) | Regras de transição | assertReceiptUploadAllowed, assertReceiptReviewAllowed, assertSponsorImmutable. | Upload, decisão e ativação | Protege estado e patrocinador. |
| [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/drizzle/schema.ts) | Modelos / tipos inferidos | applications, applicationPaymentReceipts, applicationAccessTokens, users, memberProfiles, referralLinks, memberNotifications, receivingPreferences, memberPaymentLinks, userSecurityRecovery. | Banco | Schema versionado; aplicação na VPS não confirmada. |
| [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/affiliateLinkTracking.ts) | Entrada pública | registerAffiliateLinkTracking registra clique e origem. | GET /?afiliado=... | Visitar a página pode gravar métricas; não houve visita nesta análise. |
| [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/campaignRedirect.ts) | Redirecionamento | registerCampaignRedirectRoutes; withCampaignAffiliate. | GET /r/:memberSlug/:campaignSlug e /:campaignSlug | Campanha é variante, não substitui a regra de responsável. |
| [server/_core/trackingCookies.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/trackingCookies.ts) | Origem de campanha | Cookies pl_visitor/pl_session e metadados UTM. | Entrada pública e /r/* | Auxilia atribuição de conversão. |
| [server/_core/index.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/index.ts) | Servidor | Registra tRPC, REST, rastreamento e storage. | /api/trpc, /api/admin/orders*, /manus-storage/* | Sem inicialização/execução nesta análise. |
| [server/_core/context.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/context.ts) | Contexto autenticado | createContext resolve sessão e bloqueio administrativo. | Procedures autenticadas | O apresentador bloqueado não recebe ctx.user utilizável. |
| [server/_core/trpc.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/trpc.ts) | Guards tRPC | protectedProcedure e adminProcedure. | member.* e admin.* | Revisão do membro exige usuário autenticado; propriedade é conferida no DB. |
| [server/_core/adminMemberManagement.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/adminMemberManagement.ts) | Dependência de permissão | isMemberAdministrativelyBlocked. | createContext | Somente bloqueio/exclusão pendente e efeito sobre responsável foram considerados. |
| [server/_core/env.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/env.ts) | Configuração | OWNER_OPEN_ID, JWT_SECRET, DATABASE_URL e storage. | Resolver padrão e tokens | Nenhum valor de ambiente da VPS foi lido. |
| [server/storage.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/storage.ts) | Armazenamento de comprovante | storagePut gera chave e URL protegida. | /manus-storage/payment-receipts/... | Backend local ou Forge conforme configuração. |
| [server/_core/storageProxy.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/storageProxy.ts) | Visualização de comprovante | canReadStorageKey e registerStorageProxy. | GET /manus-storage/* | Dono pelo prefixo da chave ou admin; anônimo negado. |
| [client/src/main.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/main.tsx) | Transporte | httpBatchLink, SuperJSON, credentials include. | /api/trpc | Pedidos lógicos podem aparecer agrupados no Network. |
| [client/src/lib/trpc.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/lib/trpc.ts) | Tipos do cliente | createTRPCReact<AppRouter>. | Procedures tRPC | Tipos derivados do router. |
| [client/src/lib/devPath.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/lib/devPath.ts) | Prefixo | DEV_PREFIX/withAppBase. | Rotas e chamadas de API | Verificar VITE_DEV_PREFIX no ambiente. |
| [client/src/lib/clipboard.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/lib/clipboard.ts) | Ação de copiar | copyTextToClipboard. | Copiar indicação, código e PIX | Resultado depende das permissões/contexto do navegador. |
| [drizzle/migrations/0004_add_application_tracking.sql](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/drizzle/migrations/0004_add_application_tracking.sql) | Migração | trackingCode, adminNote, updatedAt e índice único do código. | applications | Execução não verificada. |
| [drizzle/migrations/0006_add_referral_links.sql](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/drizzle/migrations/0006_add_referral_links.sql) | Migração | Vínculo sponsorId/referredUserId. | referralLinks e atribuição | Execução não verificada. |
| [drizzle/migrations/0016_add_application_payment_flow.sql](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/drizzle/migrations/0016_add_application_payment_flow.sql) | Migração | Estados, valor, métodos, comprovantes, notificações e acessos. | Tabelas do fluxo de pagamento | Execução não verificada. |
| [drizzle/migrations/0017_add_application_access_encrypted_token.sql](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/drizzle/migrations/0017_add_application_access_encrypted_token.sql) | Migração | encryptedToken. | applicationAccessTokens | Não é o token público de pagamento. |
| [drizzle/migrations/0025_add_user_security_recovery.sql](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/drizzle/migrations/0025_add_user_security_recovery.sql) | Migração | Pergunta/resposta secreta protegida. | userSecurityRecovery | Dependência da conclusão da personalização. |

**Modelos que sustentam o percurso:** `applications` guarda pedido/responsável/estados; `applicationPaymentReceipts` guarda comprovantes e revisão; `applicationAccessTokens` guarda liberação; `users` guarda conta/senha; `memberProfiles` guarda slug e dados públicos; `referralLinks` guarda apresentador do membro; `userSecurityRecovery` guarda recuperação; `memberNotifications` guarda aviso interno. Origem de campanha usa `campaignLinks`, `campaignClickEvents`, `campaignAttributions`, `campaignConversions` e `affiliateLinkClickEvents`. Não foi encontrado um modelo separado de “lead de cadastro” no caminho de `applications.submit`.

## 4. Mapa geral do fluxo navegável

### Etapa 1 — Acesso pelo link de indicação

- Ator: cadastrante.
- Ação: cola `{BASE_URL}/?afiliado={slug}` no navegador.
- Tela esperada: página `Home`.
- Parâmetros esperados na URL: `afiliado`; opcionalmente UTM. `ref`, `referral`, `apresentador` e `origem` não são lidos como aliases de indicação pelo código de `Home`.
- Dados preservados: slug na query da página; cookies de métricas quando o servidor os emite.
- Comportamento técnico esperado: normaliza slug, consulta `public.affiliateProfile` e resolve padrão quando necessário.
- Próxima etapa: conferir a identidade pública antes de enviar dados.

### Etapa 2 — Visualização da página pública

- Ator: cadastrante.
- Ação: lê oferta e identidade do apresentador.
- Tela esperada: página de vendas, com oferta de ativação de R$ 50,00 no formulário.
- Elementos visíveis: perfil do apresentador quando resolvido, botão “Ver perfil”, seções da oferta e formulário.
- Botões disponíveis: “Quero ativar minha estrutura”, “Ver como funciona”, “Ver perfil”, “Entrar”; navegação pública.
- Dados carregados: perfil explícito/padrão, imagens e prova social, além de textos configuráveis.
- Possíveis decisões do usuário: continuar até `#f`, consultar perfil, sair da página ou ir ao login.
- Próxima etapa: abrir a seção de ativação. Link sem indicação ou inválido pode seguir com o administrador padrão, se resolvido.

### Etapa 3 — Abertura e preenchimento do formulário

- Ator: cadastrante.
- Ação: clica “Quero ativar minha estrutura”.
- Tela esperada: a mesma página, seção `#f`, cartão “Solicite sua ativação”.
- Elementos visíveis: Nome completo, E-mail e WhatsApp; aviso sobre uso dos dados.
- Botões disponíveis: botão de envio com o mesmo texto do CTA.
- Dados preservados: query de indicação permanece ao mudar somente o fragmento para `#f`.
- Comportamento técnico esperado: validação HTML e do `PhoneInput`; aguarda consulta do apresentador explícito quando ainda estiver carregando.
- Próxima etapa: enviar pedido. Não há campo de senha, CPF, endereço, cartão ou checkbox de termos neste formulário.

### Etapa 4 — Envio e registro do pedido

- Ator: cadastrante.
- Ação: envia formulário.
- Tela esperada: botão “Enviando pedido...” durante a mutation.
- Endpoint: `applications.submit`.
- Dados enviados: `fullName`, `email`, `whatsapp`, `affiliateSlug`, `affiliateSlugProvided`.
- Comportamento técnico esperado: valida schema, impede e-mail previamente encontrado em usuário ou pedido, resolve responsável e insere pedido.
- Resultado esperado: `{ id, trackingCode, paymentAccessToken }`; `status=pending`, `paymentStatus=awaiting_payment`, `activationStatus=not_started`.
- Próxima etapa: salva token na sessão da aba e navega para `/pedido/{trackingCode}/pagamento`. O fluxo atual não passa pela confirmação intermediária.

### Etapa 5 — Carregamento do pagamento

- Ator: cadastrante.
- Ação: chega à página de pagamento.
- Tela esperada: “Finalize seu pagamento de ativação”, comprador, apresentador, código, valor e métodos configurados.
- Endpoint: `applications.paymentPage`, com código e token.
- Dados carregados: preferências e links do `ownerUserId` gravado no pedido.
- Botões disponíveis: escolher método quando houver mais de um; copiar código; copiar PIX quando disponível; abrir checkout; acompanhar.
- Possíveis decisões: pagar por método manual, abrir checkout externo, acompanhar ou retornar à página pública.
- Próxima etapa: envio de comprovante, para opções com upload. Sem token, aparece “Confirmar meus dados”, levando ao acompanhamento.

### Etapa 6 — Forma de pagamento escolhida

- Ator: cadastrante.
- Ação: escolhe PIX, dados bancários, PagSeguro, PayPal, outra forma ou checkout, conforme disponibilidade.
- Tela esperada: dados do responsável para a opção selecionada.
- Comportamento técnico esperado: seleção é estado React local; não existe mutation para gravar a escolha nessa etapa.
- Variante manual: pagamento ocorre fora do sistema; retorna para enviar comprovante.
- Variante checkout: “Pagar com {label}” abre `paymentUrl` em nova aba; upload fica oculto enquanto `checkout` estiver selecionado.
- Próxima etapa: manual → etapa 7; checkout → continuidade depende de operação externa não demonstrada no encadeamento atual. Não presumir confirmação automática.

### Etapa 7 — Envio do comprovante

- Ator: cadastrante.
- Ação: clica “Enviar comprovante” e escolhe arquivo.
- Tela esperada: envio começa automaticamente; não existe botão separado de confirmação do upload no componente atual.
- Endpoint: `applications.uploadReceipt`.
- Resultado esperado: comprovante `pending`, pagamento `receipt_received` e notificação interna ao apresentador.
- Mensagem prevista: “Comprovante enviado. O responsável recebeu sua solicitação.”
- Próxima etapa: permanece no pagamento; o componente recarrega os dados e oferece “Acompanhar pedido”.

### Etapa 8 — Acompanhamento e recebimento pelo apresentador

- Ator: cadastrante e apresentador, em sessões distintas.
- Ação do cadastrante: abre `/pedido/acompanhar?codigo={trackingCode}`, informa o mesmo e-mail e clica “Acompanhar pedido”.
- Tela esperada: “Comprovante recebido”, pagamento em análise e acesso ainda não liberado.
- Endpoint: `applications.lookup`; não há `refetchInterval` declarado nessa tela.
- Ação do apresentador: acessa “Meus pedidos” em `/membros/meus-pedidos`, por menu ou notificação.
- Dados exibidos ao apresentador: linha com nome, e-mail, código e status; modal com código e comprovante.
- Próxima etapa: revisar comprovante e aceitar ou recusar. Sem comprovante, os botões de decisão ficam desabilitados.

### Etapa 9 — Aprovação do comprovante

- Ator: apresentador.
- Ação: abre o pedido, visualiza comprovante e clica “Aceitar”.
- Endpoint: `member.reviewPaymentReceipt`, com `status: "approved"`.
- Comportamento técnico esperado: valida propriedade do pedido/comprovante e estado pendente, grava revisão e emite acesso ativo.
- Resultado: pagamento `confirmed`, ativação `access_issued`, pedido `approved`; modal fecha e aparece “Pedido atualizado.”.
- Consequência navegável: pedido confirmado sai da lista “Meus pedidos”; o total/histórico confirmado pode ser consultado em “Ganhos e extrato”.
- Próxima etapa: cadastrante consulta novamente o acompanhamento e abre “Personalizar meu Código Lucrativo”.

### Etapa 10 — Rejeição e retorno ao pagamento

- Ator: apresentador; depois cadastrante.
- Ação: apresentador clica “Recusar”.
- Endpoint: o mesmo de revisão, com `status: "rejected"`.
- Resultado: comprovante `rejected`, pagamento `rejected`, ativação `not_started`, pedido `contacted`.
- Tela do cadastrante após nova consulta: “Pagamento não aprovado”; botão “Ir para meios de pagamento”.
- Possíveis decisões: retornar e enviar novo comprovante no mesmo pedido; procurar responsável quando contato estiver disponível.
- Próxima etapa: voltar às etapas 5–8. O código não libera conta/senha pela rejeição. Após 48 horas, rejeitado pode desaparecer da lista/detalhe do apresentador por filtro, sem exclusão do pedido.

### Etapa 11 — Personalização após aprovação

- Ator: cadastrante.
- Ação: abre `/personalizar?codigo={publicCode}`.
- Tela esperada: “Configure seu Código Lucrativo.”.
- Dados carregados: nome e WhatsApp pré-preenchidos; e-mail de login somente leitura.
- Campos: nome público, WhatsApp, Facebook/Instagram opcionais, senha/confirmação, pergunta secreta, resposta/confirmação.
- Botão: “Configurar e cadastrar senha”.
- Endpoint: `public.completePersonalization`.
- Resultado: conta/perfil/recuperação/vínculo gravados em transação; token de personalização `used`; ativação `member_activated`.
- Próxima etapa: tela “Agora acesse seu Escritório Virtual.” com “Ir para login”.

### Etapa 12 — Primeiro login e verificação do vínculo

- Ator: novo membro.
- Ação: abre `/acesso`, preenche “Usuário” com e-mail do pedido e usa a senha escolhida.
- Endpoint: `auth.demoLogin`.
- Resultado esperado: sessão criada e navegação para `/membros` para conta `user`.
- Verificação pontual: `/membros/rede` deve identificar o apresentador; o apresentador deve visualizar o novo vínculo na própria rede.
- Encerramento do escopo: comprovação futura de primeiro acesso e vínculo, sem auditoria dos demais módulos.

Fontes do percurso: [client/src/pages/Home.tsx · L293](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/Home.tsx#L293); [client/src/pages/ApplicationPayment.tsx · L35](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationPayment.tsx#L35); [client/src/pages/ApplicationTracking.tsx · L19](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationTracking.tsx#L19); [client/src/pages/MemberAffiliateOrders.tsx · L10](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/MemberAffiliateOrders.tsx#L10); [client/src/pages/ApplicationPersonalization.tsx · L20](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationPersonalization.tsx#L20).

## 5. Fluxo detalhado do lado do cadastrante

### 5.1 Entrada, indicação e preservação

O link copiado em `MemberOffice` usa origem atual + `withAppBase("/?afiliado=...")`. Já o link mostrado em `MemberAffiliateOrders` concatena `window.location.origin + "/?afiliado=..."` sem `withAppBase`. Em instalação com prefixo, comparar os dois endereços.

Regras da indicação:

1. `URLSearchParams.get("afiliado")` pega o valor e `normalizeAffiliateSlug` aplica trim, minúsculas e `^[a-z0-9-]{3,96}$`.
2. Slug normalizado dispara `public.affiliateProfile`; até resolver, o envio é interrompido com “Aguarde a validação do apresentador antes de enviar o pedido.”.
3. Perfil explícito encontrado prevalece. Sem perfil explícito resolvido, a UI usa `public.defaultAffiliateProfile` quando disponível.
4. Com parâmetro explicitamente inválido/não encontrado, há ramo visual “Apresentador informado não encontrado” e texto sobre responsável padrão, além da possibilidade de exibir o perfil padrão. A condição precisa ser observada na tela porque o banner de perfil e o aviso possuem condições próprias.
5. O servidor revalida o slug recebido; candidato encontrado em `memberProfiles` é usado. Caso contrário, tenta o padrão.
6. O padrão exige `OWNER_OPEN_ID`, usuário com esse `openId` e `role=admin`, além de perfil associado. Não basta supor que exista um slug fixo chamado “codigo-lucrativo”.
7. `applications.ownerUserId` e `applications.affiliateSlug` fixam o responsável do pedido. A escolha do método e a consulta de pagamento usam esse responsável, não um novo parâmetro de afiliado.
8. Não foi encontrada gravação do slug em `localStorage/sessionStorage` no fluxo de `Home`. Links internos para `/` em telas posteriores não reaplicam `?afiliado`. Ao voltar à raiz por esses links, um novo pedido pode seguir a regra do padrão; o pedido já criado continua associado pelo banco.

`affiliateSlugProvided` não é um campo do usuário nem uma prova de origem imutável: o wrapper normaliza/recalcula esse valor e `createApplication` considera também a presença do slug. Não há coluna dedicada para guardar esse booleano.

**Campanhas/origem:** `/r/{memberSlug}/{campaignSlug}` resolve campanha ativa e destino permitido; quando o destino é uma landing reconhecida, acrescenta/substitui `afiliado` e `pl_ref=campaign`, com redirect 302. A rota legada `/{campaignSlug}` redireciona ao destino armazenado sem essa injeção. `utm_source`, `utm_medium`, `utm_campaign` e `utm_content` alimentam métricas. `pl_ref=campaign` evita o registro duplicado do clique principal; não é o identificador do apresentador.

Os cookies `pl_visitor` e `pl_session` têm durações de 365 dias e 30 minutos; a conversão do pedido consulta atribuição válida para o mesmo responsável, visitante e sessão. O registro de atribuição de campanha expira em 30 dias. Isso acrescenta origem analítica sem substituir `ownerUserId`.

Fontes: [client/src/pages/Home.tsx · L274](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/Home.tsx#L274); [server/criticalFlowFixes.ts · L131](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/criticalFlowFixes.ts#L131); [server/db.ts · L1026](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1026); [server/_core/campaignRedirect.ts · L28](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/campaignRedirect.ts#L28); [server/db.ts · L467](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L467).

### 5.2 Campos do formulário público

As mensagens nativas de `required`, `minLength`, `type=email` e `type=url` dependem do navegador. Quando o schema não define texto personalizado, não se deve inventar uma mensagem em português: registrar a mensagem efetivamente retornada/exibida. As regras de servidor continuam aplicáveis se a validação HTML for contornada.

### Campo: Nome completo

- Local: `Home` → seção `#f` → `VioletaNeonActivationCard`.
- Tipo esperado: Texto (`input` sem `type` explícito).
- Obrigatório: sim.
- Validação identificada no código: HTML: `required` e `minLength=3`, sem `maxLength`. API: `trim()`, mínimo 3, máximo 180. Não exige duas palavras nem proíbe números/símbolos; não comprime espaços internos.
- Mensagem de erro prevista: “Informe seu nome completo.” para mínimo no schema; máximo usa mensagem padrão do Zod; vazio/mínimo podem ser bloqueados antes pelo navegador.
- Como o dado é enviado: `fullName: String(FormData.get('fullName') ?? '')`; trim ocorre no schema.
- Onde o dado é armazenado ou processado: `applications.fullName`; pré-preenche personalização. O nome público final vai para `users.name`.
- Variantes que a IA de teste deverá testar:
  - nome completo válido, composto e com acentos: compatíveis com a regra;
  - apenas primeiro nome com ≥3 caracteres: não há rejeição específica;
  - vazio, 1–2 caracteres e somente espaços: verificar bloqueio/erro;
  - números e caracteres especiais com comprimento válido: schema não os proíbe;
  - 180 e 181 caracteres: conferir limite somente no servidor;
  - espaços antes/depois: removidos no servidor; múltiplos espaços internos: preservados.

### Campo: E-mail

- Local: Formulário público de ativação.
- Tipo esperado: `input type=email`, controlado.
- Obrigatório: sim.
- Validação identificada no código: HTML: `required`, `maxLength=320`, validade de e-mail. UI chama `normalizeEmail` ao digitar e antes do envio: remove TODOS os espaços e converte para minúsculas. API faz trim/minúsculas, rejeita espaços restantes, aplica `.email()` e máximo 320.
- Mensagem de erro prevista: “O e-mail não pode conter espaços.”; “Informe um e-mail válido.”; “O e-mail deve ter no máximo 320 caracteres.”; duplicidade: “Este e-mail já está cadastrado. Use o acesso existente ou informe outro e-mail.”.
- Como o dado é enviado: `email` normalizado; não há validação de posse por código enviado ao endereço nesse fluxo.
- Onde o dado é armazenado ou processado: `applications.email`; na personalização passa a `users.email` e não é editável pela tela.
- Variantes que a IA de teste deverá testar:
  - válido, sem @, sem domínio, caracteres inválidos e vazio;
  - maiúsculas: devem normalizar para minúsculas;
  - espaços externos/internos na UI: observar remoção, não esperar a mesma rejeição de payload bruto;
  - e-mail já existente em `users` ou em QUALQUER pedido, inclusive rejeitado;
  - comprimentos 64 e 65, e até 320 quando sintaticamente válido: comparar cadastro com primeiro login;
  - e-mails iguais variando caixa/espaços: busca de duplicidade usa `LOWER(TRIM(...))`.

### Campo: WhatsApp / Telefone

- Local: Formulário público; componente `PhoneInput`.
- Tipo esperado: Telefone brasileiro armazenado como string só de dígitos.
- Obrigatório: sim.
- Validação identificada no código: HTML `type=tel`, `inputMode=numeric`, `required`; `setCustomValidity` exige 10 ou 11 dígitos. UI bloqueia teclas não numéricas sem modificadores, remove não dígitos e TRUNCA a 11. API exige regex de 10–11 dígitos, sem sanitizar payload bruto.
- Máscara identificada: `formatPhoneBR`; exemplo visual de 11 dígitos `(11) 9 8765-4321`. Para 10 dígitos, a função mantém a separação do primeiro dígito local, não uma validação semântica do número.
- Mensagem de erro prevista: “Informe um telefone com DDD e 10 ou 11 dígitos numéricos.”; mensagem inline após blur se inválido.
- Como o dado é enviado: `whatsapp: normalizePhone(applicationContact.whatsapp)`.
- Onde o dado é armazenado ou processado: `applications.whatsapp`; pré-preenche personalização; valor final também vai para `memberProfiles.whatsapp`.
- Variantes que a IA de teste deverá testar:
  - número válido de 10 e de 11 dígitos com DDD;
  - sem DDD; curto; vazio e somente espaços: avaliar comprimento resultante;
  - número longo: a UI corta em 11; API com >11 dígitos deve rejeitar;
  - letras e caracteres especiais digitados/colados: observar bloqueio ou descarte;
  - com máscara e sem máscara: comparar dígitos enviados;
  - código do país `+55`: NÃO há remoção especial do 55; colagem pode cortar dígitos finais e ainda passar;
  - colar número completo substituindo tudo ou em seleção parcial;
  - DDD/número inexistente mas com 10–11 dígitos: não há verificação de existência/WhatsApp ativo.

Fontes dos campos públicos: [client/src/components/VioletaNeonActivationCard.tsx · L36](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/VioletaNeonActivationCard.tsx#L36); [shared/applications.ts · L5](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/applications.ts#L5); [shared/contactValidation.ts · L33](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/contactValidation.ts#L33); [client/src/components/PhoneInput.tsx · L10](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/PhoneInput.tsx#L10).

### 5.3 Envio, payload e criação

Payload lógico enviado por `Home.submitApplication` — placeholders abaixo representam dados de teste futuros:

```json
{
  "fullName": "<nome informado>",
  "email": "<email normalizado>",
  "whatsapp": "<10 ou 11 digitos>",
  "affiliateSlug": "<slug efetivo ou null>",
  "affiliateSlugProvided": true
}
```

`affiliateSlugProvided` é `true` somente quando a UI resolveu indicação explícita; pode ser `false` no fallback. Ambos os campos técnicos são calculados, não inputs editáveis na tela.

| Campo técnico | Validação/processamento | Persistência |
|---|---|---|
| `affiliateSlug` | Opcional/nulo; trim, minúsculas, regex letras ASCII/números/hífen, 3–96. Wrapper consulta existência e recorre ao padrão. | Slug resolvido em `applications.affiliateSlug`. |
| `affiliateSlugProvided` | Booleano opcional; wrapper pode recalculá-lo. | Não há coluna própria; influencia resolução. |
| `ownerUserId` | Derivado do perfil encontrado no servidor; não vem do payload da UI. | `applications.ownerUserId`. |
| `offerAmountCents` | Definido pelo servidor como 5000. | `applications.offerAmountCents`. |
| `trackingCode` | Gerado no servidor. | Pedido; migração 0004 declara índice único. |

Encadeamento efetivo: `appRouter.applications.submit` → `applicationInputSchema` → `createApplicationWithUniqueEmail` → `emailExistsForNewRegistration` → `resolveApplicationAffiliate` → `createApplication`.

A verificação de e-mail ocorre **antes** da transação de inserção e o schema lido declara índice comum, não único, em `applications.email`. Portanto, a proteção lógica contra repetição sequencial está identificada; exclusão mútua para requisições simultâneas não deve ser considerada comprovada.

Resposta lógica de sucesso:

```json
{
  "id": "<numero do pedido>",
  "trackingCode": "PL-<12 caracteres hexadecimais>",
  "paymentAccessToken": "<token assinado>"
}
```

No frontend: `savePaymentAccessToken` usa a chave `pagina-lucrativa:payment-access:{CODIGO_EM_MAIUSCULAS}`; então `setLocation` abre o pagamento. Não há toast de “cadastro concluído” no sucesso desse formulário. Em erro, a mensagem de `application.error.message` aparece em parágrafo com `role=alert`, sem redirecionamento.

Erros adicionais do caminho:

- “O banco de dados não está disponível no momento.”
- “O link de afiliado informado é inválido e não existe um responsável padrão configurado para este cadastro.”
- “Nenhum responsável válido foi encontrado para este cadastro. Configure um afiliado padrão antes de receber novos pedidos.”

O texto de link inválido aplica-se ao candidato que chega ao servidor. Como a UI pode substituir candidato inválido por `null` ou pelo padrão, a mensagem visual exata depende desse payload.

Fontes: [server/criticalFlowFixes.ts · L121](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/criticalFlowFixes.ts#L121); [server/criticalFlowFixes.ts · L151](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/criticalFlowFixes.ts#L151); [server/db.ts · L1664](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1664).

### 5.4 Pagamento, métodos e comprovante

`applications.paymentPage` é uma **mutation usada para leitura**, com `{ trackingCode, paymentAccessToken }`. O retorno é `PublicPaymentPage`, enriquecido com `receiving`: nome do comprador, valor, estados, nome do responsável, PIX, links habilitados e demais dados bancários.

Métodos disponíveis, nesta ordem antes de aplicar preferência: PIX; transferência; PagSeguro; PayPal; outra forma; checkout. A preferência do apresentador vai à frente se estiver entre os métodos disponíveis. A interface omite o seletor quando só existe uma opção.

### Campo: Forma de pagamento

- Local: Página `ApplicationPayment`.
- Tipo esperado: Botões de seleção; estado `selectedMethod`.
- Obrigatório: não existe campo de envio obrigatório; primeira opção disponível é selecionada automaticamente.
- Validação identificada no código: Somente métodos derivados dos dados retornados são apresentados. Nenhuma forma configurada produz aviso específico.
- Mensagem de erro prevista: “Nenhuma forma de pagamento está configurada para este pedido. Acompanhe seu pedido ou aguarde orientação do responsável.”.
- Como o dado é enviado: A seleção NÃO é enviada no upload. `applications.uploadReceipt` grava `selectedPaymentMethod: 'PIX'` independentemente da opção manual selecionada.
- Onde o dado é armazenado ou processado: Seleção no estado React; registro fixo em `applications.selectedPaymentMethod` quando o comprovante é enviado.
- Variantes que a IA de teste deverá testar:
  - apenas PIX; apenas transferência; múltiplas formas; nenhuma forma;
  - preferida disponível e preferida sem dados suficientes;
  - PagSeguro/PayPal habilitados com e-mail; desabilitados ou sem e-mail;
  - checkout isolado e checkout combinado com método manual;
  - troca de método e refresh: seleção é recalculada;
  - comprovante de transferência e outro método: conferir divergência do campo gravado como PIX.

### Campo: Comprovante de pagamento

- Local: `ApplicationPayment` → “Já pagou? Envie seu comprovante”.
- Tipo esperado: Um arquivo JPEG, PNG, WEBP ou PDF, convertido em data URL base64.
- Obrigatório: sim para chegar à análise manual por este percurso; não é exigido para criar o pedido.
- Validação identificada no código: UI limita MIME e tamanho ≤5×1024×1024 bytes. Schema limita `dataUrl` a 7.200.000 caracteres, MIME por enum e nome a 255. Servidor confere prefixo data URL, bytes não vazios, limite de 5 MiB e assinatura binária correspondente ao MIME.
- Mensagem de erro prevista: “Envie JPG, PNG, WEBP ou PDF.”; “O comprovante deve ter no máximo 5 MB.”; “Arquivo inválido.”; leitura local: “Não foi possível ler o arquivo.”. Erros de leitura local não têm um catch explícito em `handleReceipt`; observar apresentação real.
- Como o dado é enviado: `{ trackingCode, paymentAccessToken, dataUrl, contentType, originalName }`; seleção válida dispara envio imediatamente.
- Onde o dado é armazenado ou processado: Arquivo por `storagePut` em `payment-receipts/{ownerUserId}/{applicationId}/...`; metadados em `applicationPaymentReceipts`. Nome original sanitizado para ASCII, números, ponto, hífen, sublinhado e espaços.
- Variantes que a IA de teste deverá testar:
  - JPEG, PNG, WEBP e PDF válidos; arquivo vazio; extensão falsa/MIME divergente;
  - 5 MiB exatos e acima do limite; tipo não aceito;
  - cancelar seletor; trocar arquivo; upload interrompido;
  - segundo envio enquanto existe comprovante pendente: deve bloquear;
  - reenviar depois de rejeição: deve permitir no mesmo pedido;
  - reenviar após confirmação ou ativação: deve bloquear;
  - nome de arquivo com acentos, símbolos e mais de 255 caracteres;
  - limite de 3 envios em uma hora e 10 em 24 horas, com rejeições controladas entre envios;
  - arquivo visto pelo responsável correto e acesso negado a outra conta/anônimo.

Payload de upload:

```json
{
  "trackingCode": "<codigo do pedido>",
  "paymentAccessToken": "<token vigente da sessao>",
  "dataUrl": "data:<mime permitido>;base64,<conteudo>",
  "contentType": "image/png",
  "originalName": "<nome do arquivo>"
}
```

Condições do servidor: pedido deve pertencer ao token, ter responsável, estar em `awaiting_payment` ou `rejected`, com ativação `not_started`; não pode existir comprovante pendente. A atualização condicional do pedido protege contra estado alterado durante a operação. A transação grava comprovante, status e notificação; o armazenamento do arquivo depende de serviço externo/disco.

Resposta: `{ id: number, status: "pending" }`. Toast: “Comprovante enviado. O responsável recebeu sua solicitação.”. A tela refaz `paymentPage` e permanece na mesma rota; passa a exibir “Comprovante recebido — aguardando análise”.

Erros de estado/acesso previstos incluem:

- “Acesso inválido ou expirado. Abra novamente o acompanhamento do pedido.”
- “Pedido não encontrado ou sem responsável definido.”
- “Este pagamento já foi confirmado e não aceita novo comprovante.”
- “Já existe um comprovante aguardando análise para este pedido.” ou “Já existe um comprovante aguardando análise.”
- “O pedido não está em um estado que permita o envio de comprovante.”
- “Limite de comprovantes atingido. Tente novamente mais tarde.”
- “Limite diário de comprovantes atingido. Tente novamente amanhã.”
- “O estado do pedido mudou; atualize a página antes de enviar outro comprovante.”

**Pontos diretamente inferidos do código, ainda não observados em execução:**

- Com token ausente, há tela “Acesso de pagamento não disponível.” e “Confirmar meus dados”.
- Com token presente, mas inválido/expirado, o backend pode retornar `null`. A condição `payment.isPending || (paymentAccessToken && !payment.data)` mantém o carregador antes de alcançar “Pedido não encontrado.”. Erro de API sem dados também cai nesse carregador.
- Checkout abre URL externa; não passa código/token no link por construção dessa tela e oculta upload. Não foi localizada confirmação automática de checkout ou webhook nos handlers percorridos.
- Para métodos manuais diferentes de PIX, o upload existe, mas o servidor grava “PIX” no campo de método. Essa divergência afeta o registro, não muda o endpoint acionado.

Fontes: [client/src/pages/ApplicationPayment.tsx · L96](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationPayment.tsx#L96); [server/db.ts · L1882](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1882); [server/integrityGuards.ts · L11](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/integrityGuards.ts#L11); [server/criticalFlowFixes.ts · L158](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/criticalFlowFixes.ts#L158).

### 5.5 Acompanhamento do pedido

“Acompanhar pedido” na tela de pagamento tenta copiar o código e, após 450 ms, abre `/pedido/acompanhar?codigo=...`. O e-mail não segue pela URL e precisa ser informado.

### Campo: Código do pedido

- Local: `/pedido/acompanhar`; pode vir pré-preenchido de `?codigo=`.
- Tipo esperado: Texto como `PL-XXXXXXXXXXXX`.
- Obrigatório: sim.
- Validação identificada no código: HTML apenas `required`; UI converte para maiúsculas e faz trim ao enviar. API exige string de 6–24 caracteres; consulta normaliza para maiúsculas. Não há regex obrigando o prefixo PL no schema da consulta.
- Mensagem de erro prevista: Se a query lançar erro: “Não localizamos um pedido com estes dados. Confira se o código e o e-mail foram digitados corretamente, ou se este pedido realmente existe.”. Se retornar `null`, a UI não mostra essa mensagem: permanece no formulário.
- Como o dado é enviado: Query `applications.lookup` com `{ trackingCode, email }`.
- Onde o dado é armazenado ou processado: Comparado a `applications.trackingCode`; não cria pedido.
- Variantes que a IA de teste deverá testar:
  - código correto; minúsculas; espaços externos;
  - vazio, 5, 6, 24 e 25 caracteres;
  - código inexistente com comprimento válido: observar ausência de mensagem para `null`;
  - código de outro pedido com e-mail incorreto; código correto e e-mail correto;
  - refresh: código continua na URL, mas consulta/e-mail não são persistidos pelo componente.

### Campo: E-mail utilizado no pedido

- Local: Formulário de acompanhamento.
- Tipo esperado: `input type=email`.
- Obrigatório: sim.
- Validação identificada no código: `required`, `maxLength=320`; mesma sanitização de e-mail na UI e `normalizedEmailZodSchema` no servidor.
- Mensagem de erro prevista: Mesma mensagem genérica de consulta somente em `lookup.error`; `null` não é tratado como erro visual.
- Como o dado é enviado: `email` em `applications.lookup`.
- Onde o dado é armazenado ou processado: Filtro simultâneo por código e `applications.email`.
- Variantes que a IA de teste deverá testar:
  - e-mail do pedido, de outro pedido, vazio e inválido;
  - maiúsculas e espaços;
  - pedido aprovado, pendente e rejeitado com a mesma combinação original;
  - consulta em outra aba/dispositivo para obter novo token.

A resposta da consulta inclui código, datas, valor, três estados, último comprovante, token de pagamento renovado, `sponsorContact`, `nextAction` e `access` quando houver token de personalização ativo.

| Condição | Tela prevista | Próxima ação |
|---|---|---|
| `awaiting_payment` / demais não confirmados sem recibo | “Aguardando pagamento” | “Ir para meios de pagamento”. |
| `receipt_received` ou último recibo `pending` | “Comprovante recebido” | Aguardar conferência; nova consulta posterior. |
| `rejected` | “Pagamento não aprovado” | “Ir para meios de pagamento”; novo comprovante no mesmo pedido. |
| `confirmed` + token de personalização ativo | “Pagamento aprovado” | “Personalizar meu Código Lucrativo”. |
| `confirmed` + token já usado | “Pagamento aprovado” | O ramo não mostra botão de personalização nem atalho explícito para login; acessar `/acesso`. |
| Código + e-mail sem correspondência | API retorna `null` | Formulário permanece; mensagem de não localizado não é acionada. |

Não há polling explícito em `ApplicationTracking`. O comportamento de reconsulta por foco/montagem depende da configuração padrão do React Query. Para validar mudança de estado, não presumir atualização em tempo real: voltar à rota/recarregar e consultar com código/e-mail.

O contato do patrocinador pode aparecer após “4 horas úteis” sem confirmação, contadas desde o último comprovante ou desde a criação se não houver comprovante. **A implementação soma horas em dias de segunda a sexta pelo UTC, incluindo períodos noturnos; não há horário comercial nem calendário de feriados.** O contato usa `mailto:` e `https://wa.me/{digits}`; não envia mensagem automaticamente. O WhatsApp público também pode estar disponível no modal do perfil desde o início; a regra de quatro horas é específica do acompanhamento.

Fontes: [client/src/pages/ApplicationTracking.tsx · L25](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationTracking.tsx#L25); [server/db.ts · L1751](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1751); [server/db.ts · L1796](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1796).

### 5.6 Personalização e criação da conta

A rota usa `codigo` como `publicCode`, com trim/minúsculas. A query `public.applicationPersonalizationAccess` exige 8–48 caracteres alfanuméricos minúsculos; o código produzido pela aprovação tem 16. Sem código: “Link inválido”. Query com erro/sem acesso: “Acesso indisponível”.

`getApplicationPersonalizationAccessPrefilled` retorna `publicCode`, `fullName`, `email`, `activationStatus` e `whatsapp`. O nome/WhatsApp preenchem estados ainda vazios. Abrir a tela **não** grava `personalization_started` no código percorrido.

### Campo: Nome público

- Local: `/personalizar`.
- Tipo esperado: Texto, pré-preenchido pelo nome do pedido.
- Obrigatório: sim.
- Validação identificada no código: HTML mínimo 2/máximo 180. Frontend e schema fazem trim e mínimo 2; não exigem sobrenome nem restringem números/símbolos.
- Mensagem de erro prevista: Frontend: “Informe seu nome com pelo menos 2 caracteres.”. Schema: “Informe seu nome.” para mínimo; máximo padrão.
- Como o dado é enviado: `name: form.name.trim()`.
- Onde o dado é armazenado ou processado: `users.name`; gera slug por `slugFromName(name,userId)` e salva `memberProfiles.slug`. Não altera `applications.fullName`.
- Variantes que a IA de teste deverá testar:
  - pré-preenchido e alterado;
  - vazio, só espaços, 1, 2, 180 e 181 caracteres;
  - acentos, nome composto, números/símbolos e espaços internos;
  - nome final diferente do pedido: conferir quais áreas mostram cada nome.

### Campo: WhatsApp da personalização

- Local: `/personalizar`.
- Tipo esperado: Telefone, pré-preenchido do pedido.
- Obrigatório: sim.
- Validação identificada no código: Mesmo PhoneInput com corte em 11 dígitos; frontend `validatePhoneBR`; API `phoneZodSchema`.
- Máscara identificada: a mesma de `PhoneInput` descrita no formulário público.
- Mensagem de erro prevista: Campo compartilhado: “Informe um telefone com DDD e 10 ou 11 dígitos numéricos.”; submit: “Informe um WhatsApp com DDD e 10 ou 11 dígitos.”.
- Como o dado é enviado: `whatsapp` normalizado para dígitos.
- Onde o dado é armazenado ou processado: `memberProfiles.whatsapp`; `applications.whatsapp` permanece o original.
- Variantes que a IA de teste deverá testar:
  - pré-preenchido; editar para outro número;
  - 10/11 dígitos; sem DDD; vazio; letras; máscara; colagem e +55;
  - conferir diferença entre contato do pedido e perfil final.

### Campo: E-mail de login (somente leitura)

- Local: Resumo da personalização.
- Tipo esperado: Texto exibido; não é input.
- Obrigatório: derivado do pedido; não há preenchimento.
- Validação identificada no código: Servidor usa o e-mail de `applications`; não aceita substituição pelo payload de personalização. Se outra conta com o mesmo e-mail e openId diferente existir, impede conclusão.
- Mensagem de erro prevista: “Já existe uma conta com este e-mail. Use outro e-mail ou solicite suporte.”. A própria tela não oferece troca do e-mail.
- Como o dado é enviado: Não vai em `completePersonalization`; servidor obtém do pedido aprovado.
- Onde o dado é armazenado ou processado: `users.email`, normalizado.
- Variantes que a IA de teste deverá testar:
  - correspondência exata com pedido;
  - pedido de outra pessoa não pode ser confundido ao usar outro link;
  - conflito de e-mail criado entre pedido e personalização, em cenário preparado.

### Campo: Facebook

- Local: Redes sociais opcionais em `/personalizar`.
- Tipo esperado: `input type=url`.
- Obrigatório: não.
- Validação identificada no código: HTML máximo 512. Frontend aceita vazio ou URL HTTP/HTTPS; API `httpUrlZodSchema.max(512).optional().nullable()`. Não exige domínio específico da rede.
- Mensagem de erro prevista: Frontend: “Informe uma URL válida iniciada por http:// ou https://.”. API: “Informe uma URL válida.” ou “Use uma URL iniciada por http:// ou https://.”; limite efetivo 512.
- Como o dado é enviado: `facebookUrl`: URL com trim quando há string, ou `null` quando vazia.
- Onde o dado é armazenado ou processado: `memberProfiles.facebookUrl`; `cleanOptional` normaliza vazio.
- Variantes que a IA de teste deverá testar:
  - vazio; URL válida da rede; HTTP e HTTPS;
  - sem protocolo; texto livre; protocolo diferente; 512/513 caracteres;
  - domínio de outra plataforma: schema não restringe;
  - somente espaços: front ignora validação por trim, mas pode enviar string vazia em vez de null; observar erro.

### Campo: Instagram

- Local: Redes sociais opcionais em `/personalizar`.
- Tipo esperado: `input type=url`.
- Obrigatório: não.
- Validação identificada no código: HTML máximo 512. Frontend aceita vazio ou URL HTTP/HTTPS; API `httpUrlZodSchema.max(512).optional().nullable()`. Não exige domínio específico da rede.
- Mensagem de erro prevista: Frontend: “Informe uma URL válida iniciada por http:// ou https://.”. API: “Informe uma URL válida.” ou “Use uma URL iniciada por http:// ou https://.”; limite efetivo 512.
- Como o dado é enviado: `instagramUrl`: URL com trim quando há string, ou `null` quando vazia.
- Onde o dado é armazenado ou processado: `memberProfiles.instagramUrl`; `cleanOptional` normaliza vazio.
- Variantes que a IA de teste deverá testar:
  - vazio; URL válida da rede; HTTP e HTTPS;
  - sem protocolo; texto livre; protocolo diferente; 512/513 caracteres;
  - domínio de outra plataforma: schema não restringe;
  - somente espaços: front ignora validação por trim, mas pode enviar string vazia em vez de null; observar erro.

### Campo: Senha de acesso

- Local: `/personalizar`.
- Tipo esperado: Password, alternável para texto por Mostrar/Ocultar senha.
- Obrigatório: sim.
- Validação identificada no código: 6–128 caracteres; ao menos uma letra ASCII `[A-Za-z]` e um número `\d`; espaços não são removidos. Indicadores visuais acompanham mínimo, letra, número e confirmação.
- Mensagem de erro prevista: “A senha deve ter pelo menos 6 caracteres.”; “A senha deve conter pelo menos uma letra.”; “A senha deve conter pelo menos um número.”.
- Como o dado é enviado: `password` sem trim.
- Onde o dado é armazenado ou processado: Hash scrypt com salt em `users.passwordHash`; `loginMethod='password'`.
- Variantes que a IA de teste deverá testar:
  - 5/6/128/129 caracteres;
  - somente letras; somente números; letra+numero;
  - acentos sem nenhuma letra ASCII; símbolos e espaços;
  - mostrar/ocultar; conferir senha preservada no login.

### Campo: Confirmar senha

- Local: `/personalizar`.
- Tipo esperado: Password ou texto junto ao controle de visibilidade.
- Obrigatório: sim.
- Validação identificada no código: HTML 6–128; igualdade exata com senha no frontend.
- Mensagem de erro prevista: “A confirmação da senha não confere.”.
- Como o dado é enviado: NÃO é enviada para `completePersonalization`.
- Onde o dado é armazenado ou processado: Somente estado React e validação local.
- Variantes que a IA de teste deverá testar:
  - igual; diferente por caixa; diferente por espaço; vazio;
  - alterar senha depois de confirmar;
  - observar ausência desse campo no payload.

### Campo: Pergunta secreta

- Local: Recuperação de acesso em `/personalizar`.
- Tipo esperado: Select com cinco opções.
- Obrigatório: sim.
- Validação identificada no código: UI exige seleção. API exige texto com trim, 6–240 caracteres; não valida pertencimento às cinco opções por enum.
- Mensagem de erro prevista: “Escolha uma pergunta secreta.”.
- Como o dado é enviado: `securityQuestion` com trim.
- Onde o dado é armazenado ou processado: `userSecurityRecovery.securityQuestion`.
- Variantes que a IA de teste deverá testar:
  - sem seleção e cada uma das cinco opções;
  - retornar ao formulário após erro sem perder seleção;
  - em inspeção de contrato futura autorizada, texto fora da lista: distinguir regra da UI da API.

Opções efetivamente exibidas:

1. Qual era o nome do seu primeiro animal de estimação?
2. Qual era o apelido que você tinha na infância?
3. Qual foi o nome da sua primeira escola?
4. Qual é o nome de uma pessoa importante da sua infância?
5. Qual palavra pessoal você escolheu para recuperação?

### Campo: Resposta secreta

- Local: Recuperação de acesso em `/personalizar`.
- Tipo esperado: Password.
- Obrigatório: sim.
- Validação identificada no código: HTML/API 3–180; trim no submit. Servidor normaliza trim, múltiplos espaços para um e minúsculas antes de gerar hash.
- Mensagem de erro prevista: “Informe uma resposta secreta com pelo menos 3 caracteres.”.
- Como o dado é enviado: `securityAnswer` com trim; nunca a confirmação.
- Onde o dado é armazenado ou processado: `userSecurityRecovery.securityAnswerHash`; não em texto puro.
- Variantes que a IA de teste deverá testar:
  - 2/3/180/181 caracteres; vazio; somente espaços;
  - acentos, números, espaços repetidos e caixa diferente;
  - confirmar que o retorno da personalização não contém a resposta.

### Campo: Confirmar resposta

- Local: Recuperação de acesso em `/personalizar`.
- Tipo esperado: Password.
- Obrigatório: sim.
- Validação identificada no código: HTML 3–180; frontend compara as duas respostas com trim, mantendo distinção de caixa e espaços internos nessa comparação.
- Mensagem de erro prevista: “A confirmação da resposta não confere.”.
- Como o dado é enviado: Não enviada.
- Onde o dado é armazenado ou processado: Somente estado/validação frontend.
- Variantes que a IA de teste deverá testar:
  - igual; diferente; diferenças só nos espaços externos;
  - diferenças de caixa ou espaços internos: frontend considera diferentes;
  - vazio e alteração da resposta após confirmação.

Payload lógico da personalização:

```json
{
  "publicCode": "<codigo de personalizacao>",
  "name": "<nome publico>",
  "whatsapp": "<digitos>",
  "facebookUrl": null,
  "instagramUrl": null,
  "password": "<senha escolhida>",
  "securityQuestion": "<pergunta selecionada>",
  "securityAnswer": "<resposta>"
}
```

`publicCode` vem da URL, não é um campo editável. O endpoint não pede `trackingCode`, `paymentAccessToken`, e-mail, confirmação da senha nem confirmação da resposta.

A transação exige token `active`, pagamento `confirmed`, ativação `access_issued` ou `personalization_started` e responsável definido. Cria usuário `role=user`, `openId=application:{publicCode}`; pode atualizar um usuário desse mesmo openId/e-mail no ramo previsto. Grava perfil, recuperação e vínculo ao `ownerUserId`; impede trocar patrocinador já existente. Consome token (`used`, `usedAt`) e muda ativação para `member_activated`.

Resposta: `{ success: true, email, slug }`. Toast: “Código Lucrativo configurado.”. Tela: “Agora acesse seu Escritório Virtual.”, e-mail e botão “Ir para login”. Não há cookie de login emitido por `completePersonalization`.

Erros diretos relevantes: “Acesso inválido ou expirado.”; “Pedido não encontrado ou ainda não aprovado.”; conflito de e-mail; “Este membro já possui outro patrocinador registrado; o vínculo não pode ser alterado.”; “Este acesso já foi utilizado; solicite um novo acesso se necessário.”; conflito de estado da ativação. A UI exibe `toast.error(error.message)`; erros locais mostram “Corrija os campos indicados antes de continuar.”.

O modelo tem `expiresAt`, mas as funções atuais de consulta/conclusão de personalização não verificam essa coluna, e a aprovação não define validade. Não confundir isso com os 30 minutos do token de pagamento.

Fontes: [client/src/pages/ApplicationPersonalization.tsx · L58](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationPersonalization.tsx#L58); [shared/applications.ts · L100](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/applications.ts#L100); [server/db.ts · L2455](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L2455); [server/db.ts · L718](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L718).

### 5.7 Primeiro login, limite do escopo

### Campo: Usuário (e-mail no primeiro login)

- Local: `/acesso`.
- Tipo esperado: Texto (`Input`), rótulo “Usuário”.
- Obrigatório: sim.
- Validação identificada no código: Frontend `required`; schema `username`: trim, mínimo 1, máximo 64. Resolução transforma para minúsculas e autentica conta local por e-mail.
- Mensagem de erro prevista: “Informe o usuário.” para vazio; máximo padrão do Zod; credenciais inválidas: “Usuário ou senha inválidos.”.
- Como o dado é enviado: `{ username, password }` em `auth.demoLogin`.
- Onde o dado é armazenado ou processado: Consulta `users`, valida `passwordHash`, emite cookie de sessão.
- Variantes que a IA de teste deverá testar:
  - e-mail cadastrado e não cadastrado; caixa alta; espaços externos;
  - comprimento 64 e 65: incompatibilidade com máximo 320 do cadastro;
  - credenciais do cadastrante e do apresentador em sessões separadas.

### Campo: Senha (login)

- Local: `/acesso`.
- Tipo esperado: Password, botão Mostrar/Ocultar.
- Obrigatório: sim.
- Validação identificada no código: Frontend `required`; API string 1–128; comparação com hash.
- Mensagem de erro prevista: “Informe a senha.” ou “Usuário ou senha inválidos.”.
- Como o dado é enviado: `password` no mesmo payload de login.
- Onde o dado é armazenado ou processado: Verificação por `hashesMatch`; cookie `pl_demo_session` ou `pl_demo_session_dev`, com duração de 12 h no handler.
- Variantes que a IA de teste deverá testar:
  - senha criada, incorreta e vazia;
  - mesma senha com espaço extra;
  - primeiro acesso após personalização versus tentativa antes de criá-la.

Após sucesso, a UI invalida `auth.me` e navega para `/membros` se `role=user`, ou `/admin` se `role=admin`. A validação futura termina no primeiro acesso e vínculo direto; recuperação de senha e demais funcionalidades da área privada não são uma auditoria desta etapa.

Fontes: [client/src/pages/DemoLogin.tsx · L23](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/DemoLogin.tsx#L23); [server/demoAuth.ts · L9](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/demoAuth.ts#L9); [server/routers.ts · L319](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/routers.ts#L319).

## 6. Fluxo detalhado do lado do apresentador

### Origem do link e pré-condições

O apresentador acessa `/membros`, localiza “Seu link de indicação” e clica “Copiar link”. O slug vem de `member.overview.profile.slug`, originado em `memberProfiles`. O mesmo identificador pode ser consultado em `/membros/configuracoes`. Nesta etapa não foi alterado perfil nem configurado recebimento.

A associação existe em dois momentos distintos:

| Momento | Associação | Onde conferir |
|---|---|---|
| Pedido enviado | `applications.ownerUserId` → ID do apresentador; `affiliateSlug` → slug resolvido | Meus pedidos; detalhe administrativo do mesmo pedido. |
| Personalização concluída | `referralLinks.sponsorId` → apresentador e `referredUserId` → novo membro | Minha rede, nas duas contas. |

A existência de pedido não significa que o comprador já esteja na rede de membros. A aprovação isolada também não insere `referralLinks`.

### Etapa A — Recebimento da solicitação pelo apresentador

- Ator: apresentador autenticado.
- Origem da solicitação: pedido criado por `applications.submit`, atribuído ao seu ID.
- Tela onde aparece: `/membros/meus-pedidos`, título “Solicitações atribuídas”.
- Dados exibidos: na lista, nome, e-mail, código e rótulo do pagamento. O modal “Análise do pedido” prioriza código e arquivo; não renderiza ali um resumo completo de nome/e-mail/WhatsApp, embora a API devolva os dados do pedido.
- Status inicial: `pending / awaiting_payment / not_started`; sem comprovante, “Nenhum comprovante enviado ainda.”.
- Ações disponíveis: abrir linha; fechar análise; com comprovante, “Visualizar”; “Aceitar” e “Recusar” apenas quando o comprovante escolhido estiver `pending`.
- Arquivos/componentes envolvidos: `MemberAffiliateOrders`, `DashboardLayout`, `getMemberAffiliateApplications`, `getMemberAffiliateApplication`.
- Endpoints envolvidos: `member.affiliateApplications`, `member.affiliateApplication({id})`; notificações por `member.notifications`.

**Aviso interno:** só foi identificado no upload do comprovante, não no simples envio do formulário. Insere `memberNotifications` com tipo `payment_receipt_received`, título “Novo comprovante recebido”, nome/e-mail/WhatsApp e `entityId=application.id`. O sino consulta a cada 30 segundos, retorna até 20 itens e seu contador é calculado nesses itens. Clicar na notificação chama `member.markNotificationRead({id})`, refaz notificações e navega para a lista; não abre automaticamente um pedido pelo ID.

**Visualização:** imagens têm miniatura, ampliação e zoom de 75% a 300%; PDF abre `fileUrl` em nova aba. A URL protegida é servida por `/manus-storage/payment-receipts/...`.

**Atualização:** a listagem de pedidos não declara polling. Após mudança externa, recarregar/refazer a consulta para obter evidência atual; a invalidação automática explicitamente implementada ocorre após a própria revisão.

### Etapa B — Aprovação da solicitação

- Ator: apresentador proprietário do pedido.
- Ação: abre pedido, confere comprovante e aceita.
- Botão/controle: “Aceitar”. Não há confirmação adicional nessa ação.
- Endpoint acionado: `POST /api/trpc/member.reviewPaymentReceipt` (mutation tRPC).
- Payload esperado: `{ applicationId: number, receiptId: number, status: "approved" }`.
- Mudança de status esperada: comprovante `pending → approved`; pagamento `receipt_received → confirmed`; ativação `not_started → access_issued`; pedido `pending/contacted → approved`. Cria token `active` se ainda não houver um.
- Consequência para o cadastrante: próxima consulta correta mostra “Pagamento aprovado” e link de personalização; ainda precisa cadastrar senha e entrar.
- Consequência para o apresentador: toast “Pedido atualizado.”, fecha modal, invalida lista/detalhe/notificações; pedido confirmado é filtrado da lista. `member.finance` passa a contar o pedido confirmado no extrato e somar seu valor. Não foi encontrado repasse, saldo interno ou criação de usuário nessa aprovação.
- Pontos que a IA de teste deverá validar: propriedade, arquivo correto, clique duplo, concorrência com outra sessão/admin, token único ativo, atualização do acompanhamento e ausência de acesso completo antes da personalização.

O servidor consulta pedido por `id + ownerUserId`, comprovante por `id + applicationId + ownerUserId + status=pending`, exige pagamento `receipt_received` e usa updates condicionais com checagem de `affectedRows`. Grava `reviewedAt` e `reviewedBy`. A emissão do acesso e a transição ocorrem na mesma transação.

### Etapa C — Rejeição da solicitação

- Ator: apresentador proprietário.
- Ação: abre o pedido e recusa o comprovante.
- Botão/controle: “Recusar”. Não há confirmação adicional nem campo de motivo.
- Endpoint acionado: `POST /api/trpc/member.reviewPaymentReceipt`.
- Payload esperado: `{ applicationId: number, receiptId: number, status: "rejected" }`.
- Mudança de status esperada: comprovante `pending → rejected`; pagamento `receipt_received → rejected`; ativação fica `not_started`; status comercial fica `contacted`, e não um hipotético `applications.status=rejected`.
- Consequência para o cadastrante: “Pagamento não aprovado” no acompanhamento; pode voltar e enviar outro comprovante. Não é criado usuário nem emitido acesso nessa recusa.
- Consequência para o apresentador: toast “Pedido atualizado.”, fecha modal; item rejeitado permanece por até 48 horas após `reviewedAt`, depois é ocultado por filtro na lista e no detalhe.
- Pontos que a IA de teste deverá validar: sem acesso liberado, mensagem, reenvio no mesmo pedido, restauração de visibilidade ao receber novo comprovante e preservação do responsável.

A ocultação usa tempo corrido (`48 * 60 * 60 * 1000`), não horas úteis; não é um job de exclusão e não muda status. O endpoint público de consulta não aplica essa ocultação. O comprador deve reutilizar código/e-mail para reenviar: novo formulário com o mesmo e-mail encontra duplicidade, mesmo se o pedido anterior estiver rejeitado.

### Permissões, limites e notificações da decisão

- `protectedProcedure` exige sessão; `createContext` retira usuário comum bloqueado ou com exclusão pendente.
- Conhecer `applicationId` e `receiptId` não basta para um membro revisar pedido de outro: a função filtra por seu `ctx.user.id`.
- Pedido de outro responsável/inexistente: “Pedido não encontrado.”, mapeado a `NOT_FOUND`.
- Comprovante já decidido/inexistente: “Comprovante não encontrado ou já analisado.”, mapeado a `CONFLICT`.
- Demais conflitos previstos incluem revisão concorrente e mudança do estado do pedido. Não foi executada tentativa para provar essas proteções em runtime.
- Não foi localizada notificação automática por e-mail/WhatsApp ao comprador após aprovação ou rejeição. O caminho demonstrado é a consulta do acompanhamento.
- Não existe motivo de rejeição no schema da mutation nem na tabela de comprovantes. `applications.adminNote` existe, mas essa revisão não recebe nem preenche esse campo.
- O frontend habilita os botões pelo status do comprovante; o servidor ainda exige estado coerente do pedido. Portanto, botão visível não substitui validação no backend.
- Consulta pública de perfil/resolução do slug não usa o mesmo filtro de bloqueio administrativo encontrado em `createContext`. Um perfil de apresentador bloqueado pode ser encontrado pelo código público; eventual pedido atribuído a ele exigirá tratamento operacional/admin. Confirmar somente com cenário de teste preparado.

### Caminho administrativo encontrado, limitado ao mesmo pedido

Em `/admin/pedidos`, o administrador pode clicar “Exibir fila de pedidos”, buscar nome/e-mail/WhatsApp/código, filtrar pagamento e abrir o detalhe. O detalhe mostra dados do comprador, três estados, apresentador, comprovantes e número de tokens. “Abrir arquivo”, “Aprovar” e “Recusar” são as ações de conferência.

A decisão usa `POST /api/admin/orders/{id}/receipts/{receiptId}/review`, com `{status:"approved"|"rejected"}`. O handler exige `role=admin`, obtém o responsável real do pedido e reutiliza `reviewPaymentReceipt(ownerUserId, input, admin.id)`. Assim, o administrador pode revisar pedidos de diferentes apresentadores por esse caminho; isso não concede essa capacidade ao endpoint de membro. Pedido sem responsável retorna conflito.

Também existe “Excluir”/`DELETE /api/admin/orders/{id}`, que remove pedido, comprovantes e tokens vinculados, com confirmação na UI. **Excluir é uma operação distinta de recusar** e não integra o roteiro de aprovação/rejeição. Foi apenas identificada; não foi executada nem incluída como teste obrigatório.

Fontes: [client/src/pages/MemberAffiliateOrders.tsx · L19](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/MemberAffiliateOrders.tsx#L19); [server/db.ts · L1712](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1712); [server/db.ts · L1958](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1958); [client/src/components/DashboardLayout.tsx · L188](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/DashboardLayout.tsx#L188); [server/_core/adminCommercialOperations.ts · L259](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/adminCommercialOperations.ts#L259).

## 7. Mapa de rotas e endpoints

### 7.1 Rotas navegáveis

| Tipo | Rota/Endpoint | Método | Ator | Função | Dados enviados | Resposta esperada |
|---|---|---|---|---|---|---|
| Página pública | `/` | Navegação GET | Cadastrante | Oferta/cadastro com padrão | Sem indicação | Home; depende de responsável padrão. |
| Indicação | `/?afiliado={slug}` | Navegação GET | Cadastrante | Resolver apresentador | Slug; UTM opcionais | Home com perfil explícito ou fallback. |
| Âncora | `/?afiliado={slug}#f` | Navegação no documento | Cadastrante | Abrir formulário | Mesma query | Seção de ativação. |
| Campanha | `/r/:memberSlug/:campaignSlug` | GET | Cadastrante | Resolver campanha/métricas | Slugs; UTM | 302 ao destino permitido; landing recebe indicação e pl_ref. |
| Campanha legada | `/:campaignSlug` | GET | Cadastrante | Resolver slug de campanha | Slug | 302 ao destino armazenado se resolvido/permitido; senão segue outros handlers. |
| Pagamento | `/pedido/:trackingCode/pagamento` | Navegação GET | Cadastrante | Pagamento/upload | Código na rota; token no sessionStorage | ApplicationPayment. |
| Alias de pagamento | `/pedido/:trackingCode/pagamento/instrucoes` | Navegação GET | Cadastrante | Mesmo componente atual | Idem | Mesma interface, não uma etapa separada obrigatória. |
| Consulta | `/pedido/acompanhar?codigo=...` | Navegação GET | Cadastrante | Formulário código/e-mail | Código opcional | ApplicationTracking. |
| Personalização | `/personalizar?codigo={publicCode}` | Navegação GET | Cadastrante aprovado | Criar perfil/senha | Código público de acesso | Formulário ou acesso indisponível. |
| Confirmação alternativa | `/pedido/confirmacao?codigo=...&comprovante=1` | Navegação GET | Cadastrante | Ramo de confirmação existente | Query | Não é destino do fluxo atual; requer validação própria. |
| Login | `/acesso` | Navegação GET | Ambos | Autenticar | Credenciais no formulário | DemoLogin. |
| Origem do link/primeiro acesso | `/membros` | Navegação GET autenticada | Apresentador/novo membro | Copiar indicação ou confirmar primeiro acesso | Sessão | MemberOffice. |
| Perfil de origem | `/membros/configuracoes` | Navegação GET autenticada | Apresentador | Consultar/configurar slug público | Sessão | MemberProfile; dependência prévia. |
| Recebimento | `/membros/recebimentos` | Navegação GET autenticada | Apresentador | Dados que alimentam pagamento | Sessão | MemberReceiving; dependência prévia. |
| Decisão | `/membros/meus-pedidos` | Navegação GET autenticada | Apresentador | Lista/modal/revisão | Sessão | MemberAffiliateOrders. |
| Resultado da aprovação | `/membros/ganhos` | Navegação GET autenticada | Apresentador | Conferir adesão confirmada | Sessão | MemberEarnings. |
| Vínculo final | `/membros/rede` | Navegação GET autenticada | Ambos, depois da ativação | Conferir apresentador/indicado | Sessão | MemberReferrals. |
| Alternativa operacional | `/admin/pedidos` | Navegação GET autenticada | Administrador | Consulta e decisão do mesmo pedido | Sessão admin | AdminOrders. |

### 7.2 APIs do percurso

O cliente usa `httpBatchLink` em `/api/trpc` com SuperJSON e `credentials: include`. A tabela mostra o **nome completo da procedure** no caminho e o payload lógico, sem confundi-lo com o envelope de transporte. Queries usam GET e mutations POST nesse cliente padrão; chamadas podem estar agrupadas com `batch=1`. `applications.paymentPage`, embora leia dados, foi declarada como mutation.

| Tipo | Rota/Endpoint | Método | Ator | Função | Dados enviados | Resposta esperada |
|---|---|---|---|---|---|---|
| tRPC query pública | `/api/trpc/public.affiliateProfile` | GET | Cadastrante | Buscar perfil explícito | `{slug}` | Perfil público ou null. |
| tRPC query pública | `/api/trpc/public.defaultAffiliateProfile` | GET | Cadastrante | Resolver padrão | Nenhum | Perfil público do admin OWNER_OPEN_ID ou null. |
| tRPC mutation pública | `/api/trpc/applications.submit` | POST | Cadastrante | Criar pedido | Payload §5.3 | id, trackingCode, paymentAccessToken. |
| tRPC mutation pública | `/api/trpc/applications.paymentPage` | POST | Cadastrante | Ler pagamento com token | `{trackingCode,paymentAccessToken}` | PublicPaymentPage + receiving, ou null. |
| tRPC mutation pública | `/api/trpc/applications.uploadReceipt` | POST | Cadastrante | Enviar comprovante | Payload §5.4 | `{id,status:"pending"}`. |
| tRPC query pública | `/api/trpc/applications.lookup` | GET | Cadastrante | Consultar status/renovar token | `{trackingCode,email}` | Estados, token, nextAction, contato/link, ou null. |
| tRPC query pública | `/api/trpc/public.applicationPersonalizationAccess` | GET | Cadastrante | Validar código para formulário | `{code:publicCode}` | publicCode, fullName, email, activationStatus, whatsapp; ou null. |
| tRPC mutation pública | `/api/trpc/public.completePersonalization` | POST | Cadastrante | Concluir conta/vínculo | Payload §5.6 | `{success:true,email,slug}`. |
| tRPC mutation pública | `/api/trpc/auth.demoLogin` | POST | Ambos | Autenticar conta | `{username,password}` | `{role}` e cookie. |
| tRPC query pública | `/api/trpc/auth.me` | GET | Ambos | Consultar sessão | Cookie, quando houver | Usuário ou null. |
| tRPC query protegida | `/api/trpc/member.overview` | GET | Apresentador | Obter perfil para indicação | Sessão | Perfil, totais e pedidos recentes. |
| tRPC query protegida | `/api/trpc/member.profile` | GET | Apresentador | Slug/perfil | Sessão | Perfil ou null. |
| tRPC query protegida | `/api/trpc/member.affiliateApplications` | GET | Apresentador | Listar próprios pedidos | Sessão | Pedidos com metadados de comprovante/acesso; filtros de confirmado/48 h. |
| tRPC query protegida | `/api/trpc/member.affiliateApplication` | GET | Apresentador | Detalhe próprio | `{id}` + sessão | application, receipts, activeAccess, accessHistory; ou null. |
| tRPC mutation protegida | `/api/trpc/member.reviewPaymentReceipt` | POST | Apresentador | Aprovar OU rejeitar | `{applicationId,receiptId,status}` | `{success:true}`; erros de autorização/propriedade/estado. |
| tRPC query protegida | `/api/trpc/member.notifications` | GET | Apresentador | Avisos internos | Sessão | `{unreadCount,items}`. |
| tRPC mutation protegida | `/api/trpc/member.markNotificationRead` | POST | Apresentador | Marcar aviso da própria conta | `{id}` + sessão | Registro da notificação encontrado. |
| tRPC query protegida | `/api/trpc/member.finance` | GET | Apresentador | Efeito da aprovação | Sessão | entries, confirmedCount, confirmedValueCents, awaitingReviewCount. |
| tRPC query protegida | `/api/trpc/member.referrals` | GET | Ambos | Conferir vínculo final | Sessão | sponsor, referrals, activeCount, archivedCount. |
| REST protegido | `/manus-storage/payment-receipts/{ownerId}/{applicationId}/{arquivo}` | GET | Dono/admin | Visualizar comprovante | Cookie e chave na URL | Arquivo ou 307 para URL assinada; 403/404/502 em falhas pertinentes. |
| REST admin | `/api/admin/orders` | GET | Admin | Consultar fila | `q`, `paymentStatus`, `ownerUserId` opcionais; cookie | items, totals, generatedAt; limite base de 500 pedidos. |
| REST admin | `/api/admin/orders/:id` | GET | Admin | Detalhar pedido | ID + sessão | Pedido, receipts e accessTokens; 404 se não localizado. |
| REST admin | `/api/admin/orders/:id/receipts/:receiptId/review` | POST | Admin | Aprovar/rejeitar pelo caminho administrativo | `{status:"approved" ou "rejected"}` | `{success:true,receipt:{success:true}}`. |
| REST admin, identificado | `/api/admin/orders/:id` | DELETE | Admin | Exclusão, distinta da rejeição | ID + sessão | `{ok:true,id}`; fora do roteiro obrigatório. |

### 7.3 Dependências de apresentação e configuração

| Tipo | Rota/Endpoint | Método | Ator | Função | Dados enviados | Resposta esperada |
|---|---|---|---|---|---|---|
| REST público | `/api/public-sales-copy` | GET | Cadastrante | Textos/layout configuráveis | Nenhum | overrides e floatingLayout; fallback vazio. |
| tRPC query pública | `/api/trpc/public.salesSectionImages` | GET | Cadastrante | Imagens da oferta | Nenhum | Imagens/estados por seção. |
| tRPC query pública | `/api/trpc/public.salesSocialProof` | GET | Cadastrante | Dados visuais da oferta | Nenhum | Indicadores e depoimentos publicados. |
| tRPC mutation protegida | `/api/trpc/member.updateProfile` | POST | Apresentador | Preparar slug/perfil usado na indicação | `profileInput`, incluindo slug | Perfil persistido; não chamada no cadastro do comprador. |
| tRPC query protegida | `/api/trpc/member.receiving` | GET | Apresentador | Consultar dados de recebimento | Sessão | Preferências ou null. |
| tRPC mutation protegida | `/api/trpc/member.updateReceiving` | POST | Apresentador | Preparar métodos manuais | `receivingPreferenceInput`: titular, método, chave, instruções, PIX, bancos e emails de provedores | Preferências persistidas. |
| tRPC query protegida | `/api/trpc/member.paymentLinks` | GET | Apresentador | Links externos cadastrados | Sessão | Lista de links. |
| tRPC mutation protegida | `/api/trpc/member.updatePaymentLinks` | POST | Apresentador | Configurar links externos | `{links:[{id?,label,paymentUrl,isEnabled,sortOrder}]}`, máximo 10 | Lista após atualização. UI de gestão desses links não identificada nas telas de recebimento percorridas. |

Essas configurações são pré-condições do cenário; este documento não orienta uma auditoria dos respectivos formulários completos. Não há endpoint separado “aprovar cadastro”/“rejeitar cadastro”: a decisão real mapeada revisa o **comprovante** e altera o pedido.

Fontes: [server/routers.ts · L310](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/routers.ts#L310); [server/_core/index.ts · L85](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/index.ts#L85); [client/src/main.tsx · L21](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/main.tsx#L21); [server/_core/adminCommercialOperations.ts · L575](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/_core/adminCommercialOperations.ts#L575).

## 8. Estados possíveis do cadastro

Os estados pertencem a objetos diferentes. Não devem ser condensados em um único “status do cadastro”.

| Status | Significado | Quem altera | Quando ocorre | Próxima etapa |
|---|---|---|---|---|
| `applications.status=pending` | “Novo pedido” | Inserção/default do banco | Envio inicial | Pagar/enviar comprovante. |
| `applications.status=contacted` | “Contato iniciado” no dicionário | Revisão rejeitada | Recusa do comprovante | Reenvio possível; nome do status não prova contato humano. |
| `applications.status=approved` | “Aprovado” | Revisão aprovada e conclusão da personalização | Pagamento aceito | Personalizar; depois primeiro login. |
| `applications.status=archived` | “Arquivado” | Não localizado no percurso público/revisão lido | Enum existente; sem transição neste caminho | Confirmar eventual uso legado/operacional. |
| `paymentStatus=not_started` | “Pagamento não iniciado” | Não localizado no percurso atual | Enum existente; createApplication grava awaiting_payment | Confirmar registros legados. |
| `paymentStatus=awaiting_payment` | “Aguardando pagamento” | createApplication | Pedido criado | Enviar comprovante. |
| `paymentStatus=receipt_received` | “Comprovante recebido” | uploadApplicationPaymentReceipt | Upload aceito | Apresentador analisar. |
| `paymentStatus=confirmed` | “Pagamento confirmado” | reviewPaymentReceipt com approved | Aceite do comprovante | Personalização disponível. |
| `paymentStatus=rejected` | “Comprovante rejeitado” | reviewPaymentReceipt com rejected | Recusa | Novo comprovante no mesmo pedido. |
| `activationStatus=not_started` | “Acesso não liberado” | Criação e rejeição | Antes de aprovação | Aguardar aceite. |
| `activationStatus=access_issued` | “Personalização liberada” | Revisão aprovada | Token emitido/ativo | Abrir personalização. |
| `activationStatus=personalization_started` | “Personalização iniciada” | Escrita não localizada no percurso atual | Enum e estado aceito por completeApplicationPersonalization | Pode concluir se registro já estiver assim; abrir formulário não o grava. |
| `activationStatus=member_activated` | “Membro ativado” | completeApplicationPersonalization | Conta/perfil/vínculo concluídos | Login. |
| `activationStatus=cancelled` | “Cancelado” | Escrita não localizada neste percurso | Enum existente | Não inventar tela/botão de cancelamento. |
| `applicationPaymentReceipts.status=pending` | Comprovante aguardando revisão | Upload | Arquivo persistido | Aceitar/recusar. |
| `applicationPaymentReceipts.status=approved` | Comprovante aceito | Apresentador/admin | Revisão | Terminal para esse comprovante. |
| `applicationPaymentReceipts.status=rejected` | Comprovante recusado | Apresentador/admin | Revisão | Terminal para esse comprovante; reenvio cria outro registro. |
| `applicationAccessTokens.status=active` | Liberação utilizável | Aprovação | Token emitido | Personalizar. |
| `applicationAccessTokens.status=used` | Liberação consumida | Personalização | Conta concluída | Não reutilizar link. |
| `applicationAccessTokens.status=revoked` | Liberação revogada | Escrita não localizada no caminho de revisão/personalização | Enum existente | Consulta de acesso ativo não o aceita. |
| `referralLinks.status=active` | Vínculo direto ativo | Personalização | Criação/reativação do vínculo compatível | Aparece na rede. |
| `referralLinks.status=archived` | Vínculo arquivado | Fora do caminho público analisado | Enum/consulta de rede | Histórico; não equivale a recusa de pagamento. |

Não há status de usuário “ativo/inativo” em `users` no schema lido. Bloqueio administrativo é tratado por controle separado. “Erro”, “carregando” e `nextAction=pay/wait_review/retry_receipt/personalize` são condições/valores derivados da interface/API, não novos estados persistidos do pedido.

**Sequências confirmáveis pela leitura**

| Momento | Pedido | Pagamento | Ativação | Último comprovante | Token de personalização |
|---|---|---|---|---|---|
| Pedido novo | pending | awaiting_payment | not_started | inexistente | inexistente |
| Primeiro upload | pending | receipt_received | not_started | pending | inexistente |
| Rejeição | contacted | rejected | not_started | rejected | não emitido pela rejeição |
| Reenvio | contacted | receipt_received | not_started | novo pending | não emitido pelo upload |
| Aprovação | approved | confirmed | access_issued | approved | active |
| Personalização concluída | approved | confirmed | member_activated | approved | used |

Fontes: [drizzle/schema.ts · L359](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/drizzle/schema.ts#L359); [shared/applications.ts · L55](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/shared/applications.ts#L55); [server/db.ts · L1958](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1958); [server/db.ts · L2455](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L2455).

## 9. Pontos de decisão do fluxo

| Condição | Caminho A | Caminho B | Comportamento esperado pelo código | Variantes para a IA de teste |
|---|---|---|---|---|
| Indicação explícita | Slug válido/encontrado | Ausente, malformado ou não encontrado | Explícito prevalece; nos demais, tenta padrão | Válido; vazio; espaços/caixa; formato inválido; slug inexistente; padrão presente/ausente. |
| Perfil explícito ainda carregando | Aguarda resposta | Usuário tenta enviar | Envio interrompido por toast enquanto loading | Rede lenta; falha da query; submit imediatamente ao abrir. |
| Responsável resolvido | Pedido atribuído | Nenhum responsável válido | Submit falha sem criar pedido no caminho normal | OWNER_OPEN_ID/perfil compatível e ausente; verificar erro. |
| Apresentador bloqueado | Perfil ainda pode resolver publicamente | Sessão privada bloqueada | Resolução pública e acesso privado usam regras distintas | Cenário preparado com bloqueio; operação administrativa do pedido. |
| Formulário válido | Mutation enviada | HTML/campo inválido | UI bloqueia nativamente ou API retorna validação | Variantes de todos os campos; Enter e clique. |
| E-mail pré-existente | Não encontrado | Encontrado em users/applications | Só o primeiro segue; rejeitado anterior também impede novo pedido com mesmo e-mail | Repetição sequencial e concorrente; caixa/espaços; pedidos em diferentes estados. |
| Token de pagamento | Vigente e compatível | Ausente, expirado ou de outro pedido | Sem token: recuperação; inválido/presente: null do servidor e possível carregador contínuo | Mesma aba, nova aba, nova sessão, 30 min, código alterado. |
| Métodos configurados | Um ou vários | Nenhum | Auto-seleção ou seletor; nenhum produz aviso | PIX, bancos, e-mails de provedores, checkout e preferência. |
| Método manual vs checkout | Upload visível | Upload oculto | Manual segue análise; checkout só abre URL externa no caminho identificado | Checkout exclusivo; retorno da nova aba; troca para método manual. |
| Comprovante válido | Arquivo/estado aceitos | Tipo/tamanho/assinatura/estado inválidos | Grava pending ou retorna erro sem transição válida | Limites, MIME, arquivo vazio, acesso expirado. |
| Comprovante pendente | Existe | Não existe e pedido pode reenviar | Segundo upload bloqueado; após rejeição pode criar novo | Duplo clique/seleção; rejeição/reenvio; concorrência. |
| Permissão de revisão | Dono autenticado | Outro membro ou anônimo | Dono revisa; demais não passam guard/filtro | Outra conta, sem cookie, IDs de outro pedido. |
| Papel administrativo | Admin via REST | Membro via REST | Admin pode revisar pedido alheio pelo responsável original; membro recebe 403 | Mesmo pedido pelas duas sessões autorizadas; confirmar reviewedBy. |
| Comprovante já decidido | Ainda pending e pedido receipt_received | Já aprovado/rejeitado ou estado mudou | Apenas primeiro estado coerente aceita atualização | Aprovar duas vezes; recusar após aceitar; aceitar recibo rejeitado sem reenvio. |
| Decisão do apresentador | Aceitar | Recusar | Aceite libera personalização; recusa libera caminho de reenvio | Conferir todos os estados e ausência/criação de token. |
| Rejeição antiga | Menos de 48 h | 48 h ou mais | Filtro oculta após limite; dado não é excluído | Cenário temporal preparado; consulta pública e novo upload. |
| Consulta código/e-mail | Correspondência | Null/erro | Resultado libera ações; null e erro têm tratamento visual diferente | Código errado; e-mail errado; falha de rede; inexistente. |
| Espera sem confirmação | Antes de 4 h contadas pela função | Depois de 4 h | Contato surge apenas após condição; contagem usa dias úteis em UTC | Noite; sexta/fim de semana; último comprovante reinicia referência. |
| Personalização | Token active + pedido confirmado | Código incorreto, usado ou revogado | Formulário ou indisponível; expiresAt não verificado nas funções lidas | Sem código; código de pedido confundido com publicCode; reutilização. |
| Conclusão da conta | Dados válidos e e-mail livre/mesmo openId | Campo inválido, e-mail conflita ou vínculo incompatível | Transação conclui ou falha | Confirmações, duplicidade tardia, duas abas. |
| Primeiro login | E-mail/senha aceitos | Erro de credenciais/limite/bloqueio | Sessão e /membros, ou erro | E-mail >64; senha com espaços; conta ainda não personalizada. |

As condições e ramificações acima descrevem regras concretas; não constituem resultado de teste. Em estados legados/incoerentes, registrar o comportamento observado sem inventar uma migração automática de estado.

## 10. Variantes de teste recomendadas para a IA de teste

**Execução futura.** Usar ambiente, contas, e-mails e arquivos disponibilizados para os testes. Cada criação bem-sucedida consome um e-mail novo no fluxo atual; reutilizar código/e-mail para reenvio de comprovante. Manter sessões de cadastrante, apresentador A, apresentador B e, quando necessário, administrador separadas.

Cada caso deve registrar: URL/ator, entrada, ação, payload lógico, resposta, tela/mensagem e estados antes/depois. Não registrar senha, resposta secreta ou tokens íntegros em evidências compartilhadas.

### 10.1 Link de indicação

- **L01 — Válido:** copiar do cartão do apresentador; comparar slug, perfil público, responsável do pagamento e dono do pedido.
- **L02 — Sem parâmetro:** abrir raiz; esperar padrão resolvido ou erro de configuração no submit.
- **L03 — Parâmetro vazio/malformado/inexistente:** observar aviso e fallback; um slug inexistente com sintaxe válida é diferente de payload inválido rejeitado pelo schema.
- **L04 — Maiúsculas/espaços/hífen:** observar normalização e regras de 3–96 caracteres.
- **L05 — Parâmetros repetidos:** abrir duas ocorrências de `afiliado`; `URLSearchParams.get` usa o primeiro; comparar com rastreamento do servidor, que só aceita query como string.
- **L06 — Reload/nova aba/voltar/avançar:** conferir identidade e query; não presumir preservação quando voltar por link explícito à raiz.
- **L07 — CTAs:** testar cabeçalho, botões de conteúdo e flutuante; todos devem levar a `#f` sem trocar apresentador.
- **L08 — Dois apresentadores:** usar A em uma aba e B em outra; verificar atribuição independente pelo payload/owner.
- **L09 — Campanha:** usar link existente `/r/A/campanha`; observar 302 e `afiliado=A&pl_ref=campaign`; conferir origem sem atribuição a outro usuário.
- **L10 — Prefixo:** se houver `VITE_DEV_PREFIX`, comparar link copiado na visão geral com link mostrado em Meus pedidos.
- **L11 — Perfil indisponível/bloqueado:** distinguir falha da consulta, perfil não encontrado e bloqueio da conta privada, em massa preparada.

### 10.2 Formulário de cadastro

- **F01 — Nome completo:** executar todas as variantes do campo no §5.2; incluir 2/3/180/181 caracteres. Não esperar rejeição automática de primeiro nome ou dígitos, pois ela não está codificada.
- **F02 — E-mail:** válido, vazio, sem @, sem domínio, espaços, símbolos inválidos, maiúsculas e já cadastrado. Conferir valor sanitizado que realmente saiu da UI.
- **F03 — Limite de e-mail:** comparar 64/65 e comprimentos maiores aceitos pelo schema com primeiro login; o objetivo é evidenciar a diferença de contrato.
- **F04 — WhatsApp:** 10/11 dígitos, sem DDD, curto/longo, letras, espaços, símbolos, com/sem máscara e colagem com `+55`. Comparar entrada e dígitos transmitidos para detectar truncamento.
- **F05 — Operação por teclado/celular:** foco, rótulos, teclado numérico, erros e botão de envio visíveis; menu e CTA não devem impedir preenchimento.
- **F06 — Refresh:** os valores são estado de componente/DOM, sem rascunho persistido implementado. Registrar eventual restauração nativa do navegador separadamente.
- **F07 — Campos ausentes:** não procurar CPF, endereço, senha ou aceite de termos no formulário inicial; confirmar somente os três campos mapeados.

### 10.3 Envio do cadastro

- **E01 — Válido:** retornar um pedido, token e rota de pagamento; ainda sem usuário criado.
- **E02 — Vazios/inválidos:** observar se a chamada nem ocorre ou se retorna validação; não aceitar sucesso visual sem resposta correspondente.
- **E03 — Duplicidade:** enviar novamente e-mail de pedido pendente, aprovado, rejeitado e de conta existente; esperar erro lógico de duplicidade.
- **E04 — Duplo clique/Enter concorrente:** verificar desabilitação durante `isPending` e eventual criação duplicada; não pressupor índice único de e-mail.
- **E05 — Rede interrompida durante submit:** confirmar se houve pedido criado antes de tentar novamente; validar mensagem/duplicidade e caminho de recuperação pelo código.
- **E06 — Voltar após sucesso e reenviar:** mesmo e-mail deve ser tratado como existente; pedido original deve manter dono e código.
- **E07 — Sessão de pagamento:** recarregar mesma aba; abrir endereço em outra sessão; confirmar recuperação por código/e-mail sem token na URL.
- **E08 — Token:** ausente, expirado após 30 min e incompatível com código; verificar tela de recuperação versus carregador contínuo previsto estaticamente.
- **E09 — Comprovante:** executar as variantes do §5.4, incluindo limite, arquivo vazio e assinatura divergente.
- **E10 — Sem métodos/checkout exclusivo:** verificar se há caminho navegável para concluir análise. Não interpretar abertura de checkout como confirmação do pagamento.
- **E11 — Método não PIX:** upload por transferência/PayPal/PagSeguro/outra forma; verificar o valor fixo “PIX” gravado.
- **E12 — Retorno inexistente:** consultar código/e-mail sintaticamente válidos sem pedido; verificar ausência de mensagem no ramo `null`.

### 10.4 Aprovação pelo apresentador

- **A01 — Solicitação própria válida:** abrir linha correta; visualizar imagem/PDF; aceitar; verificar revisão e liberação.
- **A02 — Sem comprovante:** botões de decisão desabilitados.
- **A03 — Já aprovada:** segunda revisão não deve ser aceita; registro deve sair da fila normal e aparecer no extrato confirmado.
- **A04 — Comprovante rejeitado:** não aceitar o mesmo recibo novamente. Para nova aprovação, reenviar comprovante e decidir o novo registro.
- **A05 — Outra conta/anônimo:** consultas e revisão fora do escopo devem ser negadas; usar somente IDs da massa de teste fornecida.
- **A06 — Concorrência:** duas sessões do dono, ou dono/admin no mesmo comprovante; verificar uma decisão final coerente, sem tokens duplicados.
- **A07 — Efeito no comprador:** consultar novamente acompanhamento; abrir personalização; cadastrar senha; só depois validar primeiro login.
- **A08 — Notificações:** comprovante deve notificar o dono; não esperar e-mail/WhatsApp automático de aprovação.
- **A09 — Histórico:** valor confirmado em extrato; dado não deve ser tratado como saldo disponível para saque.
- **A10 — Administrador:** se este caminho fizer parte do cenário, repetir com REST acionado por `/admin/pedidos`; confirmar ID do administrador em `reviewedBy` e dono original preservado.

### 10.5 Rejeição pelo apresentador

- **R01 — Solicitação própria válida:** recusar e consultar acompanhamento do comprador.
- **R02 — Motivo:** marcar “não aplicável”: campo, payload e armazenamento de motivo não foram encontrados nessa decisão.
- **R03 — Confirmação adicional:** não prevista; verificar que um clique envia a mutation.
- **R04 — Já aprovada:** não permitir nova rejeição do mesmo comprovante.
- **R05 — Sem acesso:** não deve existir conta/senha criada pela recusa nem token emitido por ela.
- **R06 — Reenvio:** mesmo pedido, código, e-mail e apresentador; novo comprovante pending; posteriormente aceitar o novo.
- **R07 — Mesmo e-mail no formulário inicial:** deve encontrar duplicidade; recuperação deve ocorrer pelo acompanhamento, não novo cadastro.
- **R08 — 48 horas:** em cenário temporal preparado, confirmar ocultação no lado do apresentador e manutenção do pedido consultável pelo comprador; novo upload deve permitir reaparecimento.
- **R09 — Sem motivo informado:** não esperar erro de motivo obrigatório, pois esse requisito não existe no código.

### 10.6 Coerência entre áreas

- **C01 — Solicitação:** dados iniciais correspondem à lista/API do apresentador; WhatsApp está na notificação, sem exigir que apareça no modal onde não é renderizado.
- **C02 — Dono:** slug e owner devem apontar para o mesmo apresentador esperado, inclusive após fallback e campanha.
- **C03 — Aprovação:** `approved / confirmed / access_issued` antes da personalização; conta ainda não concluída.
- **C04 — Rejeição:** `contacted / rejected / not_started`; não confundir “Contato iniciado” com aprovação.
- **C05 — Ativação:** conta, perfil, recuperação e `referralLinks` coerentes; token usado; `member_activated`.
- **C06 — Rede:** no comprador, “Meu apresentador”; no apresentador, novo membro em “Indicações diretas”.
- **C07 — Recebimento:** dados bancários/PIX pertencem ao owner correto; valores da oferta e pedido coincidem.
- **C08 — Arquivo:** imagem/PDF abre para dono/admin; outro usuário/anônimo não recebe o comprovante pelo proxy.
- **C09 — Reconsulta:** estado novo deve ser visto após consulta efetiva, sem presumir atualização instantânea.
- **C10 — Variação de nome/WhatsApp:** alteração na personalização muda usuário/perfil, mas não substitui automaticamente os valores históricos de `applications`.

### 10.7 Personalização e primeiro acesso

- **P01 — Acesso:** sem código, código inválido, `trackingCode` usado no lugar do `publicCode`, token usado/revogado e pedido não confirmado.
- **P02 — Todos os campos:** executar as variantes do §5.6; nome/WhatsApp pré-preenchidos e e-mail somente leitura.
- **P03 — Redes opcionais:** vazias, válidas, protocolo inválido, domínio diferente e somente espaços.
- **P04 — Senha/confirmação:** regras de letra ASCII/número/comprimento, divergência e mostrar/ocultar.
- **P05 — Recuperação:** cada pergunta, resposta curta, confirmação com caixa/espaços diferentes; não expor valores secretos.
- **P06 — Clique duplo/duas abas:** apenas uma ativação deve consumir o token; validar transação e conflitos.
- **P07 — Conflito tardio de e-mail:** conta pré-existente criada entre pedido e conclusão deve impedir apropriação.
- **P08 — Login:** usar e-mail e senha escolhidos; comparar limite 64; tentar antes de personalizar.
- **P09 — Link reutilizado/retorno:** acesso de personalização indisponível após uso; acompanhamento pode mostrar “Pagamento aprovado” sem botão; navegar diretamente ao login.
- **P10 — Validade:** distinguir token de pagamento de 30 min do acesso de personalização, cuja coluna expiresAt não é verificada no percurso lido.

## 11. Lacunas ou pontos não encontrados no código

A primeira tabela trata de ambiente e mecanismos não confirmados; a seguinte separa divergências visíveis na leitura que precisam de reprodução.

| Ponto não confirmado | Por que não foi confirmado | Como a IA de teste deve validar |
|---|---|---|
| Domínio, prefixo e revisão realmente publicados | Foi consultada a main fixada, sem acessar VPS/site | Obter BASE_URL e versão instalada; comparar com o commit de referência. |
| Banco real e migrações aplicadas | Schema/migrations foram lidos, sem conexão ao banco | Em etapa própria, confirmar tabelas/colunas/índices existentes e correspondência dos registros de teste. |
| Identidade do apresentador padrão | Depende de OWNER_OPEN_ID e registro admin/perfil | Obter configuração autorizada e comparar perfil público/owner do pedido sem indicação. |
| Valores atuais de PIX, bancos e links externos | Vêm de receivingPreferences/memberPaymentLinks | Conferir dados devolvidos por paymentPage com o apresentador preparado. |
| Textos/imagens efetivamente renderizados | Há configuração pública no banco e comportamento responsivo | Registrar tela no desktop/celular e distinguir texto configurado de fallback. |
| Efetivação de pagamento fora da plataforma | O código mapeado confere comprovante manual; não consulta a instituição financeira | Usar procedimento financeiro de teste definido pelo responsável; não inferir pagamento pela mera presença de arquivo. |
| Continuidade automática do checkout externo | Handler atual só abre link; não foi localizado callback/webhook associado no encadeamento | Verificar integração externa e retorno/status; se ausente, registrar o bloqueio desse caminho. |
| Aviso automático ao comprador | Revisão não chama envio de e-mail/WhatsApp no percurso lido | Observar consulta de status; confirmar separadamente eventual automação externa existente. |
| Entrega real de WhatsApp | Código monta links wa.me; não implementa envio nesses passos | Conferir formato/número de destino e abertura, sem pressupor mensagem entregue. |
| UI de edição dos links de checkout | Procedures existem; editor não identificado nas telas de recebimento lidas | Localizar operação autorizada ou dados pré-configurados, sem inventar menu. |
| Restauração de formulário/nova aba | Não há rascunho persistido; comportamento nativo varia | Comparar mesma aba, nova sessão, histórico e autofill, registrando o navegador. |
| Leitura local/armazenamento de arquivos | Depende de permissões, proxy e backend local/Forge | Upload de arquivo controlado e visualização pelo dono/admin no ambiente de teste. |
| Liberação visual/propagação sem refresh | Não há polling de pedido/consulta declarado | Reconsultar e comparar; registrar se foco/montagem provocou refetch. |
| Transições para archived, cancelled, personalization_started e revoked | Enums existem, mas escrita não foi localizada no caminho principal lido | Confirmar registros legados/operação específica antes de atribuir ação de UI. |
| Processamento concorrente no banco real | Não houve teste nem inspeção dos índices implantados | Casos controlados de duplicidade/revisão/ativação simultâneas e leitura posterior dos registros. |
| Data efetiva de expiração da personalização | Coluna existe, mas não é verificada nas funções lidas | Se houver registros com expiresAt, comparar comportamento com política operacional documentada. |
| Comportamento da rota de confirmação alternativa | Não é usada pelo fluxo atual; lê query a partir de useLocation, diferentemente das telas que usam window.location.search | Abrir rota diretamente em teste; não tratá-la como confirmação confiável só pelo texto. |
| Cobertura de telas não relacionadas | Deliberadamente fora do escopo | Não expandir este roteiro para academia, conteúdo ou administração geral. |

**Pontos de atenção sustentados pelo código, sem reprodução nesta etapa**

| Ponto | Evidência estática | Validação prioritária posterior |
|---|---|---|
| Carregador sem saída no pagamento | `!payment.data` com token presente é tratado como loading antes do ramo de não encontrado | Token expirado/inválido; API null/erro. |
| Consulta inexistente sem erro visual | `lookup.error` exibe aviso; retorno null não | Código/e-mail válidos sintaticamente sem correspondência. |
| Cadastro versus login | Schema de e-mail 320; username de login 64 | Jornada completa com e-mail válido >64. |
| País no telefone | Normalização remove não dígitos e corta em 11, sem remover 55 | Colagem +55 e comparação byte a byte dos dígitos enviados. |
| Método gravado incorretamente para não PIX | Upload escreve selectedPaymentMethod = PIX | Comprovante de transferência/outra forma. |
| Checkout sem upload nem confirmação local | showReceiptUpload exclui checkout; link não dispara revisão | Jornada exclusivamente por checkout configurado. |
| Duplicidade concorrente de e-mail | Consulta de existência antes da inserção; índice comum no schema de applications.email | Envios simultâneos com mesmo e-mail e conferência de quantidade. |
| Padrão indisponível apesar do texto de fallback | Aviso público promete padrão; existência real depende de ENV e banco | Link inválido com padrão ausente. |
| Estado final no acompanhamento | Qualquer confirmed retorna ramo aprovado; token used produz access=null | Voltar ao acompanhamento após ativação e verificar orientação para login. |
| Prazo de contato | hasBusinessHoursElapsed usa dias úteis em UTC sem faixa horária | Noite, virada de dia e fim de semana. |
| Prefixo do link pessoal | Meus pedidos não usa withAppBase na montagem do link | Instalação com VITE_DEV_PREFIX. |
| Acesso do apresentador bloqueado | Lookup público não checa bloqueio; ctx.user privado checa | Massa preparada com apresentador bloqueado, sem usar conta alheia. |

Referências das divergências: [client/src/pages/ApplicationPayment.tsx · L120](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationPayment.tsx#L120); [client/src/pages/ApplicationTracking.tsx · L110](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/pages/ApplicationTracking.tsx#L110); [server/demoAuth.ts · L9](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/demoAuth.ts#L9); [client/src/components/PhoneInput.tsx · L22](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/client/src/components/PhoneInput.tsx#L22); [server/db.ts · L1908](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1908); [server/criticalFlowFixes.ts · L151](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/criticalFlowFixes.ts#L151); [server/db.ts · L1796](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/42dbf93c43bbc9896512b0264d5a09f8263b0787/server/db.ts#L1796).

## 12. Roteiro final para a IA de teste

**Este roteiro é para a próxima etapa. Nada abaixo foi executado neste mapeamento.** O percurso principal utiliza dados/contas/arquivos de teste fornecidos e a instalação definida pelo responsável. Registre falhas e interrompa o ramo afetado quando a pré-condição não existir, sem inventar botão, endpoint ou resultado.

1. Obter `BASE_URL`, identificação da revisão instalada, conta do apresentador A, conta B para isolamento, e-mails únicos para compradores e comprovantes controlados. Ter conta admin somente se a variante operacional for executada.
2. Abrir sessão do apresentador A em `{BASE_URL}/acesso`; preencher “Usuário” e “Senha”; clicar “Entrar na conta”.
3. Abrir `{BASE_URL}/membros`. Se o onboarding cobrir a tela, usar “Dispensar” para alcançar a visão geral.
4. Localizar “Seu link de indicação”, copiar pelo botão “Copiar link” e registrar o endereço/slug. Se não houver link, registrar pré-condição ausente; a tela indica “Configurar identificador”.
5. Conferir, apenas como pré-condição do cenário, se o apresentador possui método de recebimento válido em `/membros/recebimentos`. Não substituir dados reais durante o roteiro.
6. Em sessão separada de cadastrante, colar exatamente o link copiado.
7. Confirmar carregamento de `Home`, perfil público do apresentador A e query `afiliado`. Se necessário, abrir “Ver perfil” para conferir identidade e fechar o modal.
8. Clicar no CTA “Quero ativar minha estrutura”. Verificar rolagem à seção `#f` e preservação da indicação.
9. Preencher **Nome completo**, **E-mail único de teste** e **WhatsApp com DDD**. Conferir os dígitos finais do telefone e o e-mail normalizado.
10. Enviar uma vez pelo botão “Quero ativar minha estrutura”; observar “Enviando pedido...”.
11. No Network, registrar a chamada lógica `applications.submit`, dados sanitizados, `affiliateSlug` e resposta. Proteger o token nas evidências.
12. Confirmar navegação para `/pedido/{trackingCode}/pagamento`, sem exigir passagem por `/pedido/confirmacao`.
13. Guardar código do pedido e e-mail. Conferir token na sessão da aba sem copiar seu conteúdo integral para relatório.
14. Na tela “Finalize seu pagamento de ativação”, conferir comprador, valor, código, apresentador e dados de recebimento. O owner deve corresponder a A.
15. Escolher um método manual disponível. A etapa financeira segue o procedimento autorizado para o cenário; não considerar escolha/cópia de chave como pagamento confirmado.
16. Clicar “Enviar comprovante” e selecionar arquivo controlado. A seleção inicia upload automaticamente; não procurar um segundo botão de confirmação.
17. Registrar `applications.uploadReceipt`, resposta `pending`, toast de comprovante enviado e card de análise. Confirmar que a tela permanece em pagamento.
18. Clicar “Acompanhar pedido”; confirmar rota com `?codigo=`. Informar o mesmo e-mail e clicar “Acompanhar pedido”.
19. Confirmar “Comprovante recebido”, pagamento `receipt_received`, acesso `not_started` e ausência de personalização liberada.
20. Na sessão do apresentador A, abrir sino ou menu **Meus pedidos** → `/membros/meus-pedidos`. Recarregar a consulta se necessário.
21. Localizar a linha pelo código e conferir nome/e-mail/status. Na notificação, conferir nome/e-mail/WhatsApp e destino correto.
22. Abrir a linha, confirmar o código no modal e usar “Visualizar”. Para imagem, testar ampliação/voltar; para PDF, verificar nova aba.
23. Clicar **Aceitar** uma vez. Confirmar mutation com IDs do pedido/comprovante corretos e `status=approved`.
24. Registrar “Pedido atualizado.” e fechamento do modal. Confirmar saída da fila normal de Meus pedidos; isso é comportamento de filtro, não exclusão.
25. Abrir **Ganhos e extrato** → `/membros/ganhos`, refazer consulta e conferir o pedido confirmado.
26. Na sessão do cadastrante, reabrir/recarregar `/pedido/acompanhar?codigo={trackingCode}`, preencher e-mail novamente quando solicitado e consultar.
27. Confirmar “Pagamento aprovado” e clicar **Personalizar meu Código Lucrativo**. Registrar que `codigo` agora é um `publicCode`, diferente de PL-...
28. Na personalização, conferir nome/WhatsApp pré-preenchidos e e-mail de login. Ajustar nome público/WhatsApp somente conforme a massa de teste; preencher ou deixar vazias as duas redes opcionais.
29. Definir senha válida, confirmar senha, escolher pergunta secreta, preencher resposta e confirmação. Não usar a senha de exemplo da interface como credencial compartilhada do teste.
30. Clicar **Configurar e cadastrar senha**; registrar `public.completePersonalization` sem expor segredos.
31. Confirmar toast “Código Lucrativo configurado.” e tela “Agora acesse seu Escritório Virtual.”. Registrar `member_activated`/token usado se a etapa de inspeção de banco estiver disponível.
32. Clicar **Ir para login**, informar e-mail do pedido em “Usuário” e senha escolhida; clicar “Entrar na conta”.
33. Confirmar primeiro acesso em `/membros`. Encerrar inspeção geral do painel aqui.
34. Fazer somente a verificação direta em **Minha rede** → `/membros/rede`: o novo membro deve ver A como apresentador; na sessão A, o novo membro deve aparecer nas indicações diretas após reconsulta.
35. Reabrir o link de personalização consumido e registrar “Acesso indisponível”. Reconsultar o acompanhamento e observar o ramo confirmado sem link ativo.
36. Repetir a criação com **outro e-mail** para o cenário de rejeição; enviar comprovante e abrir o pedido correto na sessão A.
37. Clicar **Recusar**, sem procurar campo de motivo inexistente. Registrar payload `rejected` e resultado.
38. No acompanhamento do segundo comprador, consultar novamente: esperar “Pagamento não aprovado”, acesso não liberado e **Ir para meios de pagamento**.
39. Voltar ao pagamento pelo botão, enviar novo comprovante no **mesmo pedido** e confirmar novo registro pending, mesma indicação e retorno à fila de A.
40. Na sessão A, abrir esse novo comprovante e aceitar. Conferir que a aprovação é do recibo novo, não reversão do rejeitado; seguir personalização para confirmar recuperação completa.
41. Executar isolamento com B e sessão sem login usando somente registros da massa de teste: pedidos/arquivos de A não devem ser acessíveis para decisão por B.
42. Executar os casos de duplicidade, clique duplo, concorrência e revisão de comprovante já decidido da seção 10, em registros próprios do cenário.
43. Executar sessão sem token, token expirado e consulta inexistente; registrar o tratamento real de carregador/erro/recuperação.
44. Executar variantes de campos da seção 10.2 e personalização da 10.7, priorizando telefone com +55, espaços e e-mail >64 caracteres no primeiro login.
45. Executar raiz sem indicação, parâmetro inválido e ausência do padrão em cenários preparados; conferir o responsável real atribuído, sem assumir que o aviso visual comprova configuração.
46. Executar variantes de recebimento: nenhuma opção, múltiplas formas, forma não PIX e checkout exclusivo. Documentar onde o fluxo não consegue avançar.
47. Quando houver campanha preparada, abrir `/r/{memberSlug}/{campaignSlug}`; registrar redirect, parâmetros e associação final; não criar campanha como substituto de uma pré-condição ausente.
48. Para a alternativa administrativa, acessar apenas `/admin/pedidos`, **Exibir fila de pedidos**, localizar pedido de teste, abrir arquivo e usar **Aprovar/Recusar** em cenários distintos. Não usar **Excluir** como rejeição.
49. Avaliar janelas de quatro horas e 48 horas em massa temporal preparada; não ficar aguardando esses períodos como requisito para todo teste.
50. Repetir os caminhos principais em desktop e celular, observando CTA, teclado, mensagens, upload, modal/PDF e navegação de retorno.
51. Entregar evidências por caso: esperado pelo código, observado, divergência, rota/endpoint, ator e código do pedido. Separar problema reproduzido, condição não testada e dependência de ambiente.

## 13. Conclusão do mapeamento

O fluxo é **claramente rastreável no código da main analisada**. O cadastrante tem sequência definida de pedido, pagamento/comprovante, acompanhamento, personalização e login. O apresentador possui lista de pedidos atribuídos e revisão manual do comprovante, com checagens de propriedade e estado no backend.

A aprovação libera a personalização; a conta e o vínculo direto só são concluídos ao cadastrar os dados finais e a senha. A rejeição não encerra definitivamente o pedido: permite novo comprovante, mantém o e-mail ocupado e oculta o item do apresentador após 48 horas enquanto continuar rejeitado.

Dependem de teste real: navegação/renderização, normalização dos campos, erros, upload/visualização, atualização entre sessões, concorrência, primeiro login e isolamento de contas. Dependem de confirmação no ambiente/banco: revisão instalada, migrações, apresentador padrão, métodos de recebimento, arquivos persistidos e integrações externas.

**Prioridades para a IA de teste:** indicação correta até o vínculo final; aprovação/rejeição sem troca de responsável; token expirado e consulta sem resultado; telefone com código do país; e-mail aceito no cadastro e recusado pelo limite do login; checkout sem continuidade demonstrada; duplicidade concorrente; consumo único da personalização.

Nenhum funcionamento em produção foi declarado validado por este documento. O resultado entregue é o mapeamento e o roteiro técnico solicitado, baseado na revisão fixada.

