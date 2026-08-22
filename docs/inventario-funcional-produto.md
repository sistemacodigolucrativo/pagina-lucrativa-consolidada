# Inventário funcional do produto

## Objetivo

Este inventário foi elaborado antes da alteração da copy para separar o que pode ser prometido como benefício real do que é condicional, parcial, administrativo ou inadequado para a comunicação comercial. A fonte de verdade é o código do projeto local, especialmente `client/src/App.tsx`, `client/src/pages/Home.tsx`, `client/src/pages/MemberOffice.tsx`, `shared/memberOfficeContent.ts`, `server/routers.ts`, `server/db.ts` e `drizzle/schema.ts`.

## Critério de classificação

| Classe | Significado |
|---|---|
| **A — Funcional e pronta para ser prometida** | Existe interface utilizável, procedimento/consulta correspondente, persistência ou fluxo demonstrável e benefício compreensível para o membro. |
| **B — Funcional, mas precisa ser explicada corretamente** | Existe funcionalidade real, porém depende de publicação administrativa, conferência, dados próprios, ação manual ou condição que não pode ser omitida. |
| **C — Parcial ou em desenvolvimento** | Há navegação, orientação ou parte do fluxo, mas a operação ainda não sustenta uma promessa ampla ou automática. |
| **D — Administrativa** | Existe e é útil para a gestão da plataforma, mas não deve ser apresentado como benefício direto de compra do membro. |
| **E — Não utilizar na copy** | A afirmação é desproporcional, não comprovada no código, incompatível com o funcionamento real ou depende de prova externa ainda não validada. |

## Inventário recurso → classificação → benefício seguro

| Recurso verificado | Evidência no projeto | Classe | Benefício comercial seguro |
|---|---|---:|---|
| Formulário público de pedido | `Home.tsx`, `server/routers.ts`, `applications` em `drizzle/schema.ts` | A | Solicite a ativação da sua estrutura e receba um código para acompanhar o pedido. |
| Código de acompanhamento | `createApplication`, `getApplicationTracking`, `ApplicationTracking.tsx` | A | Acompanhe o andamento do pedido usando código e e-mail. |
| Perfil público do membro | `memberProfiles`, `public.affiliateProfile`, `MemberOperations.tsx`, `Home.tsx` | A | Personalize sua presença digital com identificador, apresentação, foto e canais autorizados. |
| Link pessoal de indicação | `memberProfiles.slug`, `MemberAffiliateOrders.tsx`, `Home.tsx` | A | Compartilhe um endereço próprio para apresentar a estrutura e vincular pedidos originados por ele. |
| Campanhas e links próprios | `campaignLinks`, `member.createCampaign`, `MemberOperations.tsx` | B | Crie e organize links próprios para separar canais e acompanhar a origem da divulgação. A comunicação não deve chamar isso de tráfego automático. |
| Cliques e contatos associados a campanhas | Campos `clicks`/`leads`, `MemberTraffic.tsx` | B | Consulte as métricas registradas das suas campanhas. A implementação atual não comprova, por si só, que todo clique externo seja incrementado automaticamente. |
| Dashboard do Escritório Virtual | `getMemberOverview`, `MemberOffice.tsx` | A | Centralize visão geral, campanhas, pedidos atribuídos, adesões confirmadas, tickets e acompanhamento da sua operação. |
| Dados de recebimento | `receivingPreferences`, `MemberReceiving.tsx`, `member.updateReceiving` | B | Organize PIX, PayPal, PagSeguro e dados bancários para sua operação. A tela apenas armazena preferências; não processa pagamentos nem movimenta dinheiro. |
| Extrato e ganhos | `applications.ownerUserId`, `MemberEarnings.tsx`, `getMemberFinance` | B | Acompanhe adesões atribuídas, pagamentos confirmados diretamente pelo patrocinador e comprovantes aguardando análise. O módulo não é carteira nem processador de pagamentos. |
| Registros financeiros legados | `transactions`, `AdminTransactions.tsx`, `syncTransactionCampaignConversion` | B | Preserve histórico administrativo e conversões manuais antigas. Não apresentar como fluxo de venda ou saque do membro. |
| Pedidos atribuídos ao link | `applications.ownerUserId`, `affiliateSlug`, `MemberAffiliateOrders.tsx` | A | Veja as solicitações originadas pelo seu link pessoal e seus respectivos status. Pedido não é sinônimo de venda ou ganho. |
| Rede, patrocinador e indicados diretos | `referralLinks`, `getMemberReferrals`, `MemberReferrals.tsx` | A | Consulte vínculos diretos da sua rede com privacidade e rastreabilidade. Não prometer crescimento automático nem remuneração pela simples existência da rede. |
| Academia de cursos | `courses`, `getMemberCourses`, `MemberCourses.tsx` | B | Aprenda enquanto executa sua operação, com cursos publicados, resumos, níveis, duração e progresso individual. A disponibilidade depende de curso e e-book publicados. |
| Leitor de e-books | `ebooks`, `getPublishedEbooks`, `EbookReader.tsx` | B | Acesse uma biblioteca de e-books publicados diretamente no navegador. A quantidade e o conteúdo dependem da publicação administrativa. |
| Conteúdos, artigos, materiais, bônus e FAQs | `managedContent`, `MemberPublications.tsx`, `server/routers.ts` | B | Consulte uma biblioteca de recursos publicados para apoiar divulgação e execução. Não prometer quantidade fixa sem inventário do banco. |
| Vitrine pessoal de produtos | `products`, `MemberProducts.tsx`, revisão administrativa | B | Cadastre produtos próprios, organize sua vitrine e envie itens para revisão. Não prometer checkout, vendas ou publicação imediata. |
| Contatos consentidos | `memberContacts`, `MemberOperations.tsx`, `createMemberContact` | A | Organize contatos da sua própria operação com origem, consentimento e status. Não prometer importação de listas ou captação automática. |
| Convites preparados | `memberInvitations`, `MemberCommunications.tsx`, `createMemberInvitation` | B | Prepare convites e registre o canal previsto. O sistema não envia e-mails, WhatsApp ou mensagens externas automaticamente. |
| Comunicação assistida | `shared/memberCommunicationRoutes.ts`, `MemberCommunications.tsx` | B | Estruture mensagens para envio manual a contatos consentidos. Não chamar de automação autônoma. |
| Histórico de atividades | `memberActivities`, `MemberOperations.tsx` | A | Mantenha um histórico das ações registradas na sua operação. |
| Página de acesso especial | `specialAccessPages`, `MemberPersonalization.tsx`, `SpecialAccessPublic.tsx` | B | Configure uma página pública com mensagem, senha, destino e contagem de acessos. Depende de senha e publicação; não é uma área de membros completa por si só. |
| Cartão digital | `MemberCredentials.tsx` | B | Gere e imprima um cartão digital associado ao seu identificador. |
| Certificado de curso | `MemberCredentials.tsx`, progresso individual | B | Gere um certificado de conclusão para cursos publicados e concluídos pela própria conta. Não prometer certificação profissional ou validade externa. |
| Pontos e níveis | `pointEntries`, `MemberPerformance.tsx` | B | Acompanhe pontos confirmados, nível derivado e extrato individual. Depende de lançamentos administrativos; não prometer ranking ou recompensa financeira. |
| Ranking e usuários mais lucrativos | `MemberOffice.tsx`, `MemberPerformance.tsx`, `memberOfficeContent.ts` | C | A navegação existe, mas a própria implementação limita exposição de terceiros e não comprova ranking público de lucratividade. Não usar como argumento comercial nesta fase. |
| Suporte | `supportTickets`, `MemberOperations.tsx`, `server/routers.ts` | A | Abra solicitações e acompanhe respostas administrativas dentro do Escritório Virtual. |
| Administração e curadoria | `admin` router, páginas `Admin*`, status de produtos/cursos/conteúdos/depoimentos | D | Não apresentar como benefício de compra; usar apenas para explicar que determinados conteúdos e publicações dependem de revisão. |
| Autenticação e conta | `users`, `DemoLogin`, `MemberAccount`, procedimentos `auth` | A | Acesse uma conta individual para operar sua estrutura e proteger seus dados. |

## Funcionalidades que não devem entrar na copy atual

| Afirmação encontrada ou implícita | Motivo para remoção ou reescrita |
|---|---|
| “Receba pagamentos de R$ 50,00” como headline principal | Reduz o produto a uma transferência financeira e não explica a estrutura. O código mostra pedido, atribuição e lançamentos, não garantia de pagamento. |
| “A Página já está pronta, é sua, e o lucro também” | Confunde acesso à estrutura com lucro automático. O código exige operação, divulgação, vendas e conferência. |
| “Lucra 100%” | Não há base suficiente no schema/routers para uma promessa universal de margem ou recebimento integral. |
| “Recupere seu investimento já na primeira venda” | Resultado financeiro não é garantido pelo funcionamento técnico. Deve ser substituído por possibilidade condicionada a venda real. |
| “A página trabalha enquanto você dorme” ou “ganha 24 horas” | A página pode ficar disponível online, mas isso não prova geração automática de renda. |
| “Sucesso absoluto”, “+ de 63.231 usuários”, “desde 2011”, “mais de 60 mil usuários” | São alegações presentes na copy atual, porém a origem verificável não foi encontrada no código auditado. Só podem voltar mediante prova documental ou fonte externa validada. |
| “Automação de WhatsApp e Facebook” sem ressalva | O funcionamento real prepara e registra mensagens; não dispara comunicação externa automaticamente. |
| “Centenas de produtos”, “milhares de materiais” ou quantidade fixa de cursos/e-books | O conteúdo é condicionado a registros publicados no banco; não há quantidade confirmada para uso comercial. |
| “Pagamento único” sem explicar fluxo | O formulário registra pedido e o status é administrado. O preço e a forma de pagamento devem ser apresentados apenas conforme regra comercial efetivamente vigente, com instrução clara sobre o que acontece depois. |

## Recursos que exigem auditoria adicional antes da promessa

A implementação atual oferece base suficiente para reposicionar o produto, mas três pontos devem ser tratados como condicionais até validação adicional: o incremento automático de cliques e contatos nas campanhas; a existência de conteúdo publicado no banco de produção; e a comprovação documental das alegações históricas e quantitativas da Home. A nova copy deverá privilegiar recursos estruturais já comprovados e usar linguagem como “quando publicado”, “conforme sua operação” e “para acompanhamento”, sempre que o resultado depender de dados ou revisão administrativa.

## Síntese da Fase 01

O produto não é apenas uma landing page. O código demonstra um ecossistema com conta individual, perfil público, link de indicação, pedido rastreável, Escritório Virtual, campanhas, vitrine de produtos, extrato, preferências de recebimento, rede, cursos, e-books, conteúdos, suporte e recursos de personalização. Ao mesmo tempo, a operação não deve ser vendida como processador de pagamentos, automação autônoma ou gerador automático de renda. A promessa segura é entregar uma infraestrutura digital já desenvolvida para personalizar, aprender, divulgar e acompanhar uma operação comercial própria.
