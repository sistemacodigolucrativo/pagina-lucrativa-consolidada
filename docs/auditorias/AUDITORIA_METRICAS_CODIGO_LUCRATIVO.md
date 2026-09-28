# Auditoria do Sistema de Métricas — Código Lucrativo

## 1. Escopo auditado

Repositório: [sistemacodigolucrativo/pagina-lucrativa-consolidada](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada). Branch: **main**.

Base fixada: [84df97db2429106b6bb2dbc93f62f6a1648eeba3](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/commit/84df97db2429106b6bb2dbc93f62f6a1648eeba3), publicado em 28/09/2026 às 16:45:21, horário de Brasília. A consulta de encerramento da coleta manteve esse mesmo SHA na main.

Foco exclusivo: métricas da Central de Divulgação, campanhas, links, cliques, visitantes, sessões, conversões e atribuição. Cadastro, comprovantes, aprovação, ativação, consultas administrativas e scripts de deploy foram examinados somente onde produzem, alteram ou consomem esses dados.

Método: leitura estática dos caminhos executáveis, schemas, migrations e testes versionados; pesquisa de documentação primária para as recomendações. **Não foram executados testes, acessos de rastreamento, cadastros ou operações no banco/produção.** Os critérios de validação abaixo são propostas para uma etapa futura, não resultados de testes realizados.

“Confirmado no código” significa que a condição ou sequência descrita foi localizada e cruzada entre produtores e consumidores. A ocorrência e a frequência em produção dependem das evidências indicadas na seção 3. Os aproximadamente **27 cliques / 26 visitantes / 26 sessões** são um relato do usuário, não uma medição reproduzida nesta auditoria.

Foram consolidados **24 problemas e riscos concretos**, sem atribuir ao caso observado causas não demonstradas. O diário separado registra etapas, hipóteses, pontos descartados e pendências em ordem cronológica.

## 2. Problemas encontrados

### PROBLEMA 1 — Verificações automáticas de instalação e deploy geram tráfego atribuído

**Local no sistema:**
Visão geral, Tráfego e dashboard do afiliado padrão.

**Arquivos envolvidos:**

- [scripts/deploy-vps.sh](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/scripts/deploy-vps.sh#L7) — L7, L173.
- [scripts/install-vps.sh](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/scripts/install-vps.sh#L544) — L544.
- [scripts/vps-autodeploy-master.sh](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/scripts/vps-autodeploy-master.sh#L378) — L378.
- [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/affiliateLinkTracking.ts#L19) — L19.
- [server/_core/trackingCookies.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/trackingCookies.ts#L15) — L15.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L1027) — L1027.

**Evidência no código:**
Os scripts fazem GET da raiz com curl, sem cookie jar. O middleware inclui o afiliado padrão mesmo sem parâmetro afiliado, e recordPublicAffiliateLinkClick insere o evento. A expressão de classificação não identifica curl como bot; cada requisição sem cookies recebe novos visitorId e sessionId.

**Comportamento problemático:**
Uma verificação técnica atendida pela aplicação pode acrescentar 1 clique, 1 visitante e 1 sessão ao afiliado padrão, sem divulgação humana. Repetições e novos deploys acumulam registros.

**Impacto:**
Inflação dos totais do responsável padrão e impossibilidade de interpretar esses acessos como audiência real. Não atribui automaticamente esses eventos a uma campanha específica.

**Causa provável:**
O endpoint comercial é usado como verificação técnica e o tracking não distingue essa origem. Causa exata não confirmada apenas pela leitura do código para os 27/26/26 relatados: faltam horários e registros do ambiente.

**Sugestão de correção reaproveitando o que já existe:**
Apontar os checks para o system.health já exposto pelo appRouter, usando seu contrato tRPC e validando ok; manter a rota fora dos handlers comerciais. Segregar os probes já identificáveis em logs e revisar os dados antigos sem apagar tráfego de origem incerta.

**Boas práticas aplicáveis:**
Separação entre tráfego operacional e audiência; não usar uma página que produz eventos como healthcheck. Reaproveitar server/_core/systemRouter.ts.

**Critério de validação após correção:**
Em homologação, fixar os totais e executar os mesmos checks com afiliado padrão configurado. Nenhuma linha deve ser criada nas tabelas de cliques; um acesso humano qualificado ao link deve seguir a política de contagem definida.

**Severidade:**
alta

### PROBLEMA 2 — Bots, HEAD, pré-carregamento e acessos internos entram nas métricas

**Local no sistema:**
Rotas /r/:memberSlug/:campaignSlug, /:campaignSlug e página de entrada.

**Arquivos envolvidos:**

- [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/campaignRedirect.ts#L36) — L36.
- [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/affiliateLinkTracking.ts#L16) — L16.
- [server/_core/trackingCookies.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/trackingCookies.ts#L34) — L34.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L251) — L251, L351.
- [server/_core/index.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/index.ts#L83) — L83.
- [scripts/seed-demo.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/scripts/seed-demo.ts#L41) — L41, L176.

**Evidência no código:**
userAgentCategory é armazenado, mas nenhum filtro de analytics remove bot. Os handlers não avaliam Purpose/Sec-Purpose, usuário autenticado, titular do link ou ambiente. As campanhas usam app.get sem guarda de método; o Express também encaminha HEAD a esse handler. A abertura do link na própria Central usa URL pública normal. O seed ainda insere tráfego sintético como human, com marcador demo-seed, que também não é excluído se estiver no banco consultado.

**Comportamento problemático:**
Inspeções de links, previews, robôs reconhecidos, pré-carregamentos recebidos pelo servidor, titular e administrador podem produzir métricas indistintas. A mera existência de um link não demonstra divulgação externa.

**Impacto:**
Contaminação de cliques, visitantes, sessões e atribuições; o primeiro clique do onboarding também pode ser liberado por tráfego artificial.

**Causa provável:**
Classificação sem política de elegibilidade, ausência de exclusão interna e de filtro HTTP. A execução do seed ou de bots no caso concreto não foi confirmada.

**Sugestão de correção reaproveitando o que já existe:**
Centralizar a elegibilidade antes da gravação usando os helpers existentes: não contar HEAD e requisições explicitamente especulativas; aplicar a classificação bot também nas queries; identificar autoacesso/admin/teste pelo contexto existente. Segregar fixtures pelos marcadores já existentes. Não considerar user-agent, isoladamente, prova de pessoa real.

**Boas práticas aplicáveis:**
Filtragem de tráfego automatizado e interno. Referências: [Express 4 — app.METHOD](https://expressjs.com/en/4x/api/application/#app.METHOD) e [MDN — Sec-Purpose](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Purpose).

**Critério de validação após correção:**
Comparar GET humano, HEAD, UA reconhecido como bot, Sec-Purpose: prefetch, titular logado, administrador e fixture. Somente os eventos elegíveis devem alimentar totais e atribuição; registrar o motivo das exclusões.

**Severidade:**
alta

### PROBLEMA 3 — Cada GET elegível é contabilizado como novo clique, sem deduplicação

**Local no sistema:**
Link principal e acessos repetidos às URLs de campanha.

**Arquivos envolvidos:**

- [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/affiliateLinkTracking.ts#L19) — L19.
- [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/campaignRedirect.ts#L45) — L45.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L351) — L351, L430.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L213) — L213.

**Evidência no código:**
recordCampaignClick sempre insere campaignClickEvents e incrementa campaignLinks.clicks; recordPublicAffiliateLinkClick sempre insere affiliateLinkClickEvents. Não há identificador idempotente, janela de repetição, restrição única do evento ou rate limit no caminho versionado. A unicidade de campaignAttributions não impede novos registros de clique.

**Comportamento problemático:**
Refresh do link principal, reabertura da URL de redirecionamento, retries e requisições paralelas aumentam cliques sem novo gesto de divulgação. Refresh da página final marcada com pl_ref=campaign tem comportamento diferente, descrito no problema 11.

**Impacto:**
O indicador mede requisições admitidas e não uma definição consistente de clique. Repetições podem elevar o numerador sem ampliar a audiência.

**Causa provável:**
A gravação HTTP é tratada como evento de clique definitivo. Não foi localizada proteção equivalente no código da aplicação; eventual proteção externa permanece desconhecida.

**Sugestão de correção reaproveitando o que já existe:**
Definir a unidade do clique e deduplicar no ponto de persistência atual, com campanha/membro, visitante, sessão e uma janela curta ou identificador de evento. Tornar a decisão atômica e incrementar o contador legado somente quando houver novo evento aceito. Rate limit deve complementar a deduplicação.

**Boas práticas aplicáveis:**
Idempotência e distinção entre requisição, visualização e clique. Não deduplicar toda uma sessão se cliques humanos distintos devem continuar sendo contados.

**Critério de validação após correção:**
Na janela definida, repetir a mesma requisição e enviá-la em paralelo: apenas um evento elegível e um incremento. Após a janela, uma interação nova deve seguir a regra documentada. Não usar IP isoladamente como identidade.

**Severidade:**
alta

### PROBLEMA 4 — Visitantes e sessões são contados antes de confirmar persistência da identidade

**Local no sistema:**
Visitantes únicos e sessões de campanhas e link principal.

**Arquivos envolvidos:**

- [server/_core/trackingCookies.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/trackingCookies.ts#L9) — L9.
- [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/campaignRedirect.ts#L45) — L45.
- [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/affiliateLinkTracking.ts#L42) — L42.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L264) — L264.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L213) — L213.

**Evidência no código:**
Sem cookie válido, getOrCreateTrackingCookie emite UUID e o mesmo request já grava um visitante e uma sessão. Não há confirmação de que o cliente devolveu o cookie. A deduplicação usa somente visitorId/sessionId; não usa IP, fingerprint, localStorage ou identidade autenticada. O valor recebido é aceito por formato, sem comprovar que foi emitido pelo servidor.

**Comportamento problemático:**
Clientes que rejeitam/não preservam cookies geram uma nova identidade a cada requisição. Primeiras aberturas simultâneas antes de receber Set-Cookie também podem gerar múltiplos IDs. Quem controla as requisições pode variar os IDs.

**Impacto:**
COUNT(DISTINCT) continua correto sobre IDs, mas não representa necessariamente pessoas ou sessões humanas distintas. Esse mecanismo é compatível com cliques, visitantes e sessões quase iguais, sem comprovar o episódio relatado.

**Causa provável:**
Identidade emitida é tratada como identidade persistida. Causa exata não confirmada apenas pela leitura do código para a proporção 27/26/26.

**Sugestão de correção reaproveitando o que já existe:**
Reaproveitar pl_visitor/pl_session e distinguir identidade provisória de retornada. Confirmar ou reconciliar no fluxo existente antes de afirmar unicidade; validar emissão/formato e combinar isso com a filtragem dos problemas 1–3. Definir o indicador como navegador identificado, sem prometer pessoas únicas entre dispositivos.

**Boas práticas aplicáveis:**
Identidade consistente e declaração dos limites de medição; não substituir cookies por fingerprint invasivo ou IP como chave única.

**Critério de validação após correção:**
Testar com cookie persistente, recusado e duas primeiras requisições simultâneas. O sistema deve separar acessos sem identidade confirmada, sem apresentá-los automaticamente como novas pessoas.

**Severidade:**
média

### PROBLEMA 5 — Totais somam visitantes e sessões distintos de duas tabelas

**Local no sistema:**
Visão geral, Tráfego e métricas agregadas do membro.

**Arquivos envolvidos:**

- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L259) — L259.

**Evidência no código:**
getMemberOperationAnalytics calcula COUNT(DISTINCT visitorId/sessionId) separadamente em campaignClickEvents e affiliateLinkClickEvents e soma os resultados em totals.uniqueVisitors e totals.sessions.

**Comportamento problemático:**
Um navegador que acessa o link principal e uma campanha, mantendo os mesmos cookies no período, vale dois visitantes e duas sessões no total do membro.

**Impacto:**
Totais globais inflados mesmo com cookies persistentes e sem bots. O problema é da união das fontes; não significa que cada campanha, isoladamente, duplique esse visitante.

**Causa provável:**
Soma de cardinalidades de conjuntos com interseção.

**Sugestão de correção reaproveitando o que já existe:**
Unir as duas fontes filtradas por membro/período e aplicar DISTINCT sobre a união, no mesmo getMemberOperationAnalytics. Manter a agregação por campanha e explicitar que únicos por campanha não são aditivos.

**Boas práticas aplicáveis:**
Deduplicação após união de fontes. [MySQL — COUNT(DISTINCT)](https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html#function_count-distinct).

**Critério de validação após correção:**
Fixture com o mesmo visitorId/sessionId nas duas tabelas: total global 1 visitante e 1 sessão. Acrescentar uma segunda identidade: total 2. Cliques devem seguir sua unidade independente.

**Severidade:**
alta

### PROBLEMA 6 — Pedidos atribuídos ao membro podem nunca entrar na aba Conversões

**Local no sistema:**
Link principal, cadastro, pedidos atribuídos e aba Conversões.

**Arquivos envolvidos:**

- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L430) — L430, L1687, L251.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L276) — L276, L359.
- [server/routers.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/routers.ts#L399) — L399.

**Evidência no código:**
O link principal grava apenas affiliateLinkClickEvents. createApplication grava ownerUserId/affiliateSlug, mas só chama recordCampaignConversion quando encontra campaignAttributions pelo dono, visitante e sessão. A Central consulta apenas campaignConversions. campaignId nessa tabela é obrigatório. applications não persiste campanha/visita/sessão e não existe reconciliação de pedidos atribuídos nesse endpoint.

**Comportamento problemático:**
Um pedido por /?afiliado=... pode estar corretamente vinculado ao apresentador e continuar ausente na Central, mesmo após pagamento e ativação. Ausência do cookie, cadastro direto ou dados anteriores ao tracking produzem a mesma lacuna.

**Impacto:**
O membro vê pedido, ganho confirmado ou indicado sem conversão correspondente. O alcance do painel é menor que o solicitado pelo negócio.

**Causa provável:**
A contagem está condicionada à atribuição de campanha, enquanto a atribuição comercial ao membro existe independentemente dela. O ID do pedido relatado não foi fornecido para confirmar este caminho específico.

**Sugestão de correção reaproveitando o que já existe:**
Reaproveitar applications como fonte dos pedidos/conversões do membro e campanha como dimensão opcional. Estender member.analytics/member.conversions para consultar essa fonte com LEFT JOIN no evento de campanha por entityType+entityId; deduplicar por pedido e tipo. Não inventar campanha para link principal. Conciliar histórico somente quando houver vínculo comprovável.

**Boas práticas aplicáveis:**
Fonte única por entidade de negócio, vínculo explícito de pedido e dimensão de campanha opcional; não somar pedidos e seus próprios eventos duas vezes.

**Critério de validação após correção:**
Cadastrar em homologação por link principal e por campanha. Cada pedido deve aparecer uma vez para seu ownerUserId; só o segundo deve receber campanha comprovada. Reprocessamento deve conservar o total.

**Severidade:**
alta

### PROBLEMA 7 — Conversão comercial não acompanha aprovação, rejeição e ativação

**Local no sistema:**
Conversões, aprovação de comprovante e resultados do membro.

**Arquivos envolvidos:**

- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L1713) — L1713, L1905, L1981, L2499, L261.
- [server/_core/adminCommercialOperations.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/adminCommercialOperations.ts#L267) — L267.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L283) — L283.

**Evidência no código:**
A conversão automática encontrada é application, criada enquanto paymentStatus=awaiting_payment, com status active. uploadApplicationPaymentReceipt, reviewPaymentReceipt e completeApplicationPersonalization não criam/atualizam conversão comercial. Não há produtor corrente de order/sale/commission localizado nesses fluxos, embora os tipos existam no enum. O total filtra o status do evento, sem verificar pagamento ou ativação do pedido.

**Comportamento problemático:**
Cadastro pendente ou depois rejeitado permanece no total de eventos application; pagamento confirmado/ativação não acrescentam uma venda nem recuperam o registro ausente. O período da conversão continua sendo o do cadastro.

**Impacto:**
O rótulo Conversões não permite inferir vendas, aprovações ou contas ativadas e diverge de resultados comerciais por membro.

**Causa provável:**
O ciclo analítico termina no cadastro/lead, enquanto o ciclo comercial continua em applications. A regra do marco comercial não está formalizada; não se afirma que contar application como microconversão seja, isoladamente, incorreto.

**Sugestão de correção reaproveitando o que já existe:**
Separar solicitações, pagamentos confirmados e ativações usando os status existentes. Para venda, usar a transição confirmed de reviewPaymentReceipt e a chave de pedido, reaproveitando recordCampaignConversion quando houver campanha; não apagar a microconversão histórica. Definir data e regra de reversão por tipo, incluindo o caminho administrativo que chama a mesma função.

**Boas práticas aplicáveis:**
Eventos distintos por etapa do funil, status e timestamps próprios; confirmação comercial baseada na fonte do pagamento.

**Critério de validação após correção:**
Percorrer cadastro → comprovante → rejeição/reenvio → aprovação → personalização. Conferir separadamente solicitações e vendas, por membro/campanha/período, sem duplicar aprovação reprocessada e sem contabilizar rejeição como venda.

**Severidade:**
alta

### PROBLEMA 8 — A atribuição de 30 dias é limitada pela sessão de 30 minutos

**Local no sistema:**
Cadastro depois de navegação prolongada ou retorno ao site.

**Arquivos envolvidos:**

- [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/campaignRedirect.ts#L45) — L45.
- [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/affiliateLinkTracking.ts#L24) — L24.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L351) — L351, L468, L1700.

**Evidência no código:**
recordCampaignClick define expiresAt em 30 dias. getValidCampaignAttribution exige igualdade simultânea de userId, visitorId e sessionId. pl_session tem Max-Age de 30 minutos e só é renovado nos handlers de tracking; entrada com pl_ref=campaign sai antes dessa renovação. O submit apenas lê cookies.

**Comportamento problemático:**
Após 30 minutos sem passar por um handler que renove a sessão, o mesmo visitante pode perder a atribuição ainda válida. Em nova visita pode receber outra sessão que também não encontra o registro anterior. Atividade no formulário ou pagamento não prolonga a sessão.

**Impacto:**
Subcontagem de conversões por campanha e sessões que não representam a atividade contínua do funil.

**Causa provável:**
Janela de atribuição e ciclo da sessão foram acoplados por uma chave que exige a sessão original.

**Sugestão de correção reaproveitando o que já existe:**
Usar a sessão como contexto da visita, não como requisito exclusivo da atribuição de 30 dias. Consultar atribuição válida por membro+visitante, ordenada por lastOccurredAt segundo política explícita, e persistir o vínculo escolhido ao criar o pedido. Atualizar last activity somente em interações elegíveis do fluxo, sem gerar cliques adicionais.

**Boas práticas aplicáveis:**
Separar expiração de sessão e janela de atribuição. [MDN — escopo e duração de cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies).

**Critério de validação após correção:**
Visita por campanha e cadastro aos 29/31 minutos e em retorno posterior, antes/depois de 30 dias. O resultado deve obedecer à janela documentada, inclusive em atividade contínua e troca de sessão.

**Severidade:**
alta

### PROBLEMA 9 — Exclusões deixam conversões órfãs e totais sem conciliação

**Local no sistema:**
Remoção de campanha/pedido e métricas da Central.

**Arquivos envolvidos:**

- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L251) — L251, L468, L510.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L192) — L192.
- [client/src/pages/MemberOperationCenter.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/MemberOperationCenter.tsx#L429) — L429.
- [server/_core/adminCommercialOperations.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/adminCommercialOperations.ts#L237) — L237.

**Evidência no código:**
deleteMemberCampaign executa DELETE somente em campaignLinks. Os eventos, atribuições e conversões não têm FK/restrição de exclusão no schema examinado. O total lê campaignConversions diretamente; a lista usa INNER JOIN campaignLinks. getValidCampaignAttribution não verifica se a campanha ainda existe. handleOrderDelete remove pedido, recibos e tokens, mas deixa campaignConversions apontando para o applicationId excluído.

**Comportamento problemático:**
Depois de remover uma campanha com histórico, a conversão permanece no total, desaparece da lista e perde o detalhe. Uma atribuição antiga ainda válida pode produzir nova conversão vinculada à campanha já removida. Ao excluir um pedido, sua conversão active continua contabilizada e pode continuar na lista se a campanha existir.

**Impacto:**
Divergência permanente entre cards e listagens, referências inválidas e perda da rastreabilidade para membro e administrador. A origem comercial de um resultado pode ter sido apagada.

**Causa provável:**
Exclusão física da dimensão sem política histórica, combinada com consultas diferentes e validação incompleta da atribuição.

**Sugestão de correção reaproveitando o que já existe:**
Reaproveitar status=archived e archivedAt de campaignLinks para arquivar em vez de excluir. Preservar histórico; definir se uma visita anterior ainda pode converter após arquivamento. Usar LEFT JOIN para registros órfãos já existentes e explicitar campanha indisponível. Impedir novas referências a IDs inexistentes. Para exclusão de pedido, aplicar a política analítica na mesma transação, reutilizando status=reversed para resultados removidos do total ativo, ou snapshot histórico identificado quando retenção de eventos for a regra.

**Boas práticas aplicáveis:**
Integridade referencial e preservação de dimensões históricas; total e lista devem aplicar o mesmo universo.

**Critério de validação após correção:**
Campanha com clique e conversão deve conservar histórico após arquivamento. Total, lista e detalhe devem conciliar. Uma atribuição órfã não pode criar referência inválida; não excluir dados reais no teste. Excluir um pedido somente em fixture deve preservar rastreio e impedir resultado ativo sem origem segundo a política escolhida.

**Severidade:**
alta

### PROBLEMA 10 — Rota legada resolve campanha sem membro e pode duplicar ou desviar a atribuição

**Local no sistema:**
Links /:campaignSlug e rotas públicas de um segmento.

**Arquivos envolvidos:**

- [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/campaignRedirect.ts#L14) — L14, L72.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L397) — L397.
- [server/routers.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/routers.ts#L112) — L112.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L208) — L208.
- [drizzle/0002_volatile_thanos.sql](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/0002_volatile_thanos.sql#L344) — L344.
- [client/src/App.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/App.tsx#L79) — L79.
- [server/_core/index.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/index.ts#L108) — L108.

**Evidência no código:**
A unicidade atual é userId+slug, mas resolvePublicCampaignAndRecordClick consulta só slug e LIMIT 1. O handler legado usa destinationUrl diretamente, sem withCampaignAffiliate e sem pl_ref. O padrão /:campaignSlug também antecede o fallback que serve as rotas do frontend, e não há reserva de nomes como acesso.

**Comportamento problemático:**
Slugs iguais de membros diferentes podem selecionar outra campanha ou falhar conforme a primeira linha. A página final pode registrar também um clique de afiliado ou usar o afiliado padrão/stale do destino. Uma campanha com slug de rota pública pode captar visitas que não eram destinadas à campanha.

**Impacto:**
Cliques e conversões atribuídos ao membro/campanha errados; duplicação entre redirecionamento e página final; contaminação por navegação pública.

**Causa provável:**
Resolver global mantido após a mudança para unicidade por membro e caminho legado com regras diferentes do moderno.

**Sugestão de correção reaproveitando o que já existe:**
Reaproveitar /r/:memberSlug/:campaignSlug como URL canônica. Resolver legado somente quando a associação for inequívoca e fora dos nomes reservados; buscar o membro da campanha e usar a mesma normalização do destino e deduplicação. Não escolher silenciosamente a primeira linha.

**Boas práticas aplicáveis:**
Identificadores sem ambiguidade e mesma política de tracking em aliases.

**Critério de validação após correção:**
Duas campanhas de membros distintos com mesmo slug não podem ser confundidas. Um acesso legado deve produzir um evento elegível e preservar o apresentador correto. Rotas reservadas não devem criar cliques de campanha.

**Severidade:**
alta

### PROBLEMA 11 — Marcador público pl_ref=campaign suprime novos acessos indefinidamente

**Local no sistema:**
Página final do redirecionamento de campanha.

**Arquivos envolvidos:**

- [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/campaignRedirect.ts#L28) — L28.
- [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/affiliateLinkTracking.ts#L24) — L24.
- [client/src/pages/Home.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/Home.tsx#L275) — L275.

**Evidência no código:**
O redirecionamento acrescenta pl_ref=campaign à URL. O middleware retorna antes de criar/renovar cookies e registrar evento sempre que esse texto está presente. Não valida uma atribuição correspondente, uso único ou prazo do marcador.

**Comportamento problemático:**
Ao compartilhar/salvar a URL final, outro navegador pode acessá-la sem ter passado pelo redirect e ficar sem clique, visitante, sessão e atribuição de campanha. Retornos e refresh dessa URL continuam ignorados.

**Impacto:**
Subcontagem de divulgação real e pedidos atribuídos ao membro sem campanha; uma query manipulável determina sozinha a ausência de tracking.

**Causa provável:**
Um marcador durável de URL é tratado como prova de que aquele acesso já foi contado.

**Sugestão de correção reaproveitando o que já existe:**
Substituir o bypass incondicional por deduplicação no servidor ligada ao evento/atribuição e a uma janela curta, usando visitorId/sessionId existentes. O marcador deve, no máximo, orientar essa consulta; entradas novas precisam ser reconhecidas e a URL final não deve carregar supressão permanente. Se a URL final também precisar manter a campanha ao ser compartilhada, transportar uma referência verificável ao clique/campanha e validá-la no servidor; o texto campaign sozinho não identifica qual campanha originou o acesso.

**Boas práticas aplicáveis:**
Idempotência baseada em identidade do evento, não em sinal não verificado do cliente.

**Critério de validação após correção:**
Testar redirect seguido da landing, URL final copiada para outro navegador, retorno posterior e marcador digitado sem redirect. O primeiro fluxo não duplica; os demais não desaparecem silenciosamente.

**Severidade:**
alta

### PROBLEMA 12 — Hosts e prefixos permitidos podem separar os cookies do cadastro

**Local no sistema:**
Redirecionamentos entre domínio raiz/www e URLs com/sem prefixo.

**Arquivos envolvidos:**

- [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/campaignRedirect.ts#L12) — L12.
- [server/_core/trackingCookies.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/trackingCookies.ts#L4) — L4.
- [server/_core/index.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/index.ts#L86) — L86.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L1700) — L1700.

**Evidência no código:**
destinationIsAllowed admite hostname atual, ocodigolucrativo.site e www.ocodigolucrativo.site. Os cookies não têm Domain e usam Path=VITE_DEV_PREFIX quando configurado, embora haja também rotas de tracking/API sem prefixo. Não há transferência do vínculo de atribuição entre hosts ou checagem de compatibilidade de caminho.

**Comportamento problemático:**
Se o redirect sai de um host para outro, os cookies emitidos no primeiro não acompanham o cadastro. Com prefixo configurado, uma URL fora dele também pode não receber os cookies, gerando novas identidades ou perda de conversão.

**Impacto:**
Quebra de rastreabilidade, duplicação de visitante entre hosts e conversão ausente. A ocorrência depende da configuração implantada, não fornecida.

**Causa provável:**
Os destinos aceitos têm escopo mais amplo que os cookies utilizados como vínculo. Causa exata não confirmada apenas pela leitura do código no ambiente do usuário.

**Sugestão de correção reaproveitando o que já existe:**
Normalizar host e base path antes de emitir cookies e gravar o evento. Preferir redirecionamentos relativos no host canônico; ajustar Path ao espaço real servido. Compartilhar Domain entre subdomínios somente se necessário e sob controle da mesma aplicação.

**Boas práticas aplicáveis:**
Consistência de origem e escopo de cookie. [MDN — Domain e Path](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies).

**Critério de validação após correção:**
Matriz raiz/www, URL com/sem prefixo e POST de cadastro: cookie do clique deve chegar ao submit no fluxo suportado, sem criar nova identidade por mudança de host.

**Severidade:**
média

### PROBLEMA 13 — Atribuição é sobrescrita e o formulário não preserva a campanha da própria aba

**Local no sistema:**
Campanhas do mesmo membro abertas na mesma sessão e histórico da conversão.

**Arquivos envolvidos:**

- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L371) — L371, L468, L1700.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L255) — L255.
- [client/src/pages/Home.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/Home.tsx#L301) — L301.
- [shared/applications.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/shared/applications.ts#L5) — L5.

**Evidência no código:**
campaignAttributions tem chave única userId+visitorId+sessionId. Novo clique troca campaignId e metadados na mesma linha. campaignConversions conserva attributionId apontando para essa linha mutável e também grava seu próprio campaignId. O submit envia somente afiliado; não identifica clique/campanha da aba.

**Comportamento problemático:**
Após conversão na campanha A e novo clique em B, a conversão conserva campaignId=A enquanto sua atribuição referenciada passa a B. Se A e B forem abertas antes do submit, o cadastro da aba A usa a última atribuição compartilhada entre abas.

**Impacto:**
Histórico contraditório e impossibilidade de distinguir campanha do formulário de último clique da sessão.

**Causa provável:**
Estado corrente de atribuição e evidência histórica compartilham o mesmo registro. A política first/last touch não está comprovada; o comportamento entre abas é um risco, não prova de violação de regra ainda não definida.

**Sugestão de correção reaproveitando o que já existe:**
Formalizar a política e congelar no pedido/conversão o vínculo decidido no servidor. Reaproveitar os IDs de campaignClickEvents/attribution e campos de campanha existentes; quando houver referência histórica, preservar snapshot ou versão em vez de reinterpretar attributionId após atualização. Validar qualquer identificador transportado pelo formulário.

**Boas práticas aplicáveis:**
Atribuição determinística e histórico imutável; snapshot no momento da conversão.

**Critério de validação após correção:**
Converter em A, acessar B e verificar que a evidência histórica de A não muda. Abrir A/B em abas distintas e enviar em ordens alternadas; o resultado deve seguir a política declarada.

**Severidade:**
alta

### PROBLEMA 14 — Clique e atribuição são gravados antes de validar o destino

**Local no sistema:**
URLs de campanha com destino incompatível ou circular.

**Arquivos envolvidos:**

- [server/_core/campaignRedirect.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/campaignRedirect.ts#L17) — L17, L49, L83.
- [server/routers.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/routers.ts#L112) — L112.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L238) — L238.

**Evidência no código:**
As funções resolvePublic*AndRecordClick executam a gravação antes de destinationIsAllowed. A validação de criação aceita URL HTTP; não restringe o destino à landing da própria aplicação. O teste de destino verifica protocolo/host, não circularidade ou rotas intermediárias.

**Comportamento problemático:**
Destino externo/inválido pode gerar clique e atribuição, embora o redirect seja recusado. Um destino que aponta para a própria rota de campanha, ou um ciclo entre campanhas no mesmo host, pode emitir sucessivos 302 com novos cliques a cada passagem.

**Impacto:**
Métricas de acessos que não chegaram à página de destino e inflação em ciclos; campanha não representa a jornada anunciada.

**Causa provável:**
Validação posterior ao efeito persistente e ausência de regra de destino no service de criação.

**Sugestão de correção reaproveitando o que já existe:**
Resolver e validar campanha/destino antes de gravar, reaproveitando destinationIsAllowed no fluxo atual. Para a UI que usa destino automático, restringir à landing suportada; rejeitar autorreferência, ciclos e destinos de outra campanha quando não necessários.

**Boas práticas aplicáveis:**
Validar antes de produzir efeitos e manter a unidade de evento associada a um destino elegível.

**Critério de validação após correção:**
Destino rejeitado não deve gravar clique/atribuição. Destino circular deve ser recusado na criação/resolução. Um destino válido deve gerar somente o evento definido.

**Severidade:**
média

### PROBLEMA 15 — Validação de cookies e UTMs é incompatível com as colunas

**Local no sistema:**
Persistência do tracking e processamento de cookies.

**Arquivos envolvidos:**

- [server/_core/trackingCookies.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/trackingCookies.ts#L9) — L9, L42.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L217) — L217, L238, L259.
- [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/affiliateLinkTracking.ts#L59) — L59.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L1680) — L1680.

**Evidência no código:**
O helper aceita IDs de até 80 caracteres para colunas varchar(64), e corta todos os UTMs em 160, embora source/medium sejam varchar(96). decodeURIComponent é executado sem tratamento local para encoding inválido, tanto no tracking quanto na leitura de cookie do cadastro.

**Comportamento problemático:**
UTMs de 97–160 caracteres ou IDs de 65–80 podem provocar erro ou truncamento conforme sql_mode. Cookie malformado pode interromper o fluxo. No link principal, erro de gravação é convertido em null e o processamento pode continuar/fazer fallback; no redirect a exceção segue para next(error).

**Impacto:**
Perda silenciosa de eventos, identidade inconsistente ou falha de redirecionamento/cadastro atribuível ao tracking.

**Causa provável:**
Contrato de entrada desalinhado ao schema e decoder sem recuperação por cookie.

**Sugestão de correção reaproveitando o que já existe:**
Validar UUID/tamanho compatível e limites por campo no helper existente; descartar ou regenerar cookie inválido com rastreio do motivo. Tratar falha de analytics sem reatribuir tráfego a outro membro. Padronizar o erro observável e preservar a navegação quando apropriado.

**Boas práticas aplicáveis:**
Validação de metadados antes da persistência e tratamento explícito de falhas de coleta.

**Critério de validação após correção:**
Exercitar limites 64/65/80 para IDs, 96/97/160 para UTMs e encoding inválido. Não deve haver truncamento não informado, troca de proprietário nem total apresentado como se a gravação tivesse ocorrido.

**Severidade:**
média

### PROBLEMA 16 — Cadastros e leads concorrentes podem criar conversões duplicadas

**Local no sistema:**
applications.submit e member.createContact.

**Arquivos envolvidos:**

- [server/criticalFlowFixes.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/criticalFlowFixes.ts#L121) — L121.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L1705) — L1705, L2143.
- [drizzle/schema.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/drizzle/schema.ts#L359) — L359, L499, L292.

**Evidência no código:**
emailExistsForNewRegistration verifica existência antes de createApplication, sem chave única de e-mail/idempotência em applications. createMemberContact faz SELECT da combinação membro/campanha/e-mail e depois INSERT, sem restrição única dessa combinação. O índice de conversão é por entityType+entityId+conversionType.

**Comportamento problemático:**
Duas requisições paralelas podem passar na verificação e gerar dois applicationId/contactId distintos; ambos aceitam suas próprias conversões. Repetições sequenciais e concorrência não têm a mesma garantia.

**Impacto:**
Duplicação de leads/solicitações/conversões e aumento da taxa, mesmo que o evento de conversão por entidade não se repita.

**Causa provável:**
Deduplicação anterior à criação da entidade não é atômica; unicidade por entityId atua tarde demais.

**Sugestão de correção reaproveitando o que já existe:**
Reaproveitar os services e transações, adotando chave idempotente ou unicidade da regra de negócio no banco, após tratar duplicados históricos. Para contatos sem campanha, considerar a semântica de NULL da chave; para pedidos, respeitar a política de permitir ou não nova solicitação do mesmo e-mail.

**Boas práticas aplicáveis:**
Idempotência na entidade de origem e controle de concorrência. [MySQL — leituras com bloqueio](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html). Uma transação com SELECT comum não substitui a restrição de unicidade.

**Critério de validação após correção:**
Executar submits idênticos simultâneos em homologação: uma entidade lógica e uma conversão por tipo. Testar também repetição após timeout e contatos sem campanha.

**Severidade:**
alta

### PROBLEMA 17 — Mutações atualizam o total sem invalidar a lista de conversões

**Local no sistema:**
Registro de contato e remoção de campanha na Central.

**Arquivos envolvidos:**

- [client/src/pages/MemberOperationCenter.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/MemberOperationCenter.tsx#L65) — L65, L100, L325.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L2161) — L2161.

**Evidência no código:**
analytics e conversions são queries separadas, carregadas independentemente da aba. createContact invalida contacts/analytics, mas não conversions, embora crie uma conversão lead. deleteCampaign invalida campaigns/analytics sem invalidar conversions.

**Comportamento problemático:**
O card pode atualizar e a lista continuar com cache anterior até um refetch posterior. Após exclusão, uma linha pode continuar visível temporariamente ou desaparecer apenas na próxima consulta.

**Impacto:**
Divergência visual temporária sobre dados já persistidos, confundida com perda ou atraso da conversão.

**Causa provável:**
Invalidação incompleta das queries afetadas. Revalidação por foco/remontagem pode corrigir a exibição depois; não se afirma que o cache fique incorreto indefinidamente.

**Sugestão de correção reaproveitando o que já existe:**
Incluir utils.member.conversions.invalidate nos mesmos callbacks e manter a atualização coordenada de lista, cards e detalhe. Reaproveitar as queries atuais; não criar polling para encobrir a ausência de invalidação.

**Boas práticas aplicáveis:**
[TanStack Query — invalidação direcionada](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation).

**Critério de validação após correção:**
Com a query de conversões já em cache, criar lead e consultar a aba sem recarregar/focar a janela. Lista e total devem refletir o mesmo resultado assim que a mutação terminar.

**Severidade:**
média

### PROBLEMA 18 — Falha ou carregamento das métricas aparece como zero e ausência de conversões

**Local no sistema:**
Cards, aba Conversões, Tráfego e detalhe da campanha.

**Arquivos envolvidos:**

- [client/src/pages/MemberOperationCenter.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/MemberOperationCenter.tsx#L65) — L65, L250, L313.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L254) — L254, L306.

**Evidência no código:**
A Central usa data?.totals... ?? 0 e data?.length sem ramificação de isLoading/isError para analytics/conversions. Ausência de data resulta em mensagens de nenhuma conversão/campanha. Os services ainda retornam estruturas vazias quando getDb retorna null, possibilidade fora do caminho obrigatório de produção.

**Comportamento problemático:**
Consulta indisponível, sessão sem resposta ou troca de período pode exibir 0/nenhum registro como se fosse resultado real. Com erro em somente uma query, card e lista podem divergir.

**Impacto:**
Diagnóstico falso de conversão não contabilizada e perda de confiança nos números.

**Causa provável:**
Estado da consulta confundido com conjunto vazio.

**Sugestão de correção reaproveitando o que já existe:**
Reaproveitar estados de loading/error e padrões já usados em MemberOffice, exibindo indisponível/tentar novamente. Reservar zero ao sucesso com contagem zero. No backend, propagar indisponibilidade em vez de fabricar retorno analítico vazio.

**Boas práticas aplicáveis:**
Distinguir valor zero, dado ausente e falha de coleta/consulta.

**Critério de validação após correção:**
Simular demora e falhas independentes dos dois endpoints. A tela não deve afirmar zero nem nenhuma conversão até obter resposta válida; deve mostrar o período aplicado.

**Severidade:**
média

### PROBLEMA 19 — Limites globais são aplicados antes do filtro da campanha no detalhe

**Local no sistema:**
Histórico e conversões da campanha; lista geral de conversões.

**Arquivos envolvidos:**

- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L277) — L277, L306.
- [server/routers.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/routers.ts#L335) — L335.
- [client/src/pages/MemberOperationCenter.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/MemberOperationCenter.tsx#L131) — L131, L312.

**Evidência no código:**
recentEvents limita 50 eventos para todo o membro e getMemberOperationConversions limita 200 conversões. O frontend filtra por selectedCampaignId apenas depois de receber essas listas. Os endpoints não recebem campaignId ou cursor e a tela não sinaliza truncamento.

**Comportamento problemático:**
Uma campanha com registros mais antigos pode mostrar lista vazia apesar de ter contagem positiva, se outras campanhas ocuparem a janela global. A lista geral nunca apresenta registros posteriores ao limite.

**Impacto:**
Eventos e conversões existentes ficam ocultos; total e lista não podem ser conciliados integralmente.

**Causa provável:**
Paginação implícita global utilizada como se fosse consulta completa da campanha.

**Sugestão de correção reaproveitando o que já existe:**
Adicionar campaignId opcional, validado contra ctx.user.id, aos endpoints existentes; filtrar antes do LIMIT. Oferecer cursor/paginação e total explícito. Manter o histórico recente como recorte identificado, não como ausência absoluta.

**Boas práticas aplicáveis:**
Filtro antes de paginação e ordenação determinística por occurredAt+id.

**Critério de validação após correção:**
Gerar mais de 50 eventos/200 conversões entre campanhas em homologação. Cada detalhe deve recuperar sua campanha mesmo fora da primeira janela global; todas as páginas devem conciliar com o total.

**Severidade:**
média

### PROBLEMA 20 — Link principal entra nos totais, mas fica fora da decomposição e do histórico

**Local no sistema:**
Visão geral, Tráfego e Histórico de eventos.

**Arquivos envolvidos:**

- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L259) — L259, L430.
- [server/_core/affiliateLinkTracking.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/affiliateLinkTracking.ts#L29) — L29.
- [client/src/pages/MemberOperationCenter.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/MemberOperationCenter.tsx#L250) — L250, L320, L359.

**Evidência no código:**
totals.clicks/uniqueVisitors/sessions incluem affiliateLinkClickEvents, mas campaigns/recentEvents só incluem campaignClickEvents. O retorno não oferece breakdown do link principal. A raiz sem afiliado é registrada para o padrão com a mesma origem default affiliate_link/referral/link-principal do link explícito, salvo UTM informado.

**Comportamento problemático:**
Pode haver total positivo e nenhuma campanha/evento na listagem. Tráfego direto/default parece tráfego de indicação e fica impossível explicar o total pela própria Central. Criar uma campanha nova não reinicia os totais globais do membro.

**Impacto:**
O usuário pode associar números preexistentes/globais ao link recém-criado; o administrador não dispõe da decomposição para investigar a origem.

**Causa provável:**
Cobertura diferente entre agregado e histórico, mais classificação que mistura domínio puro com link explícito. A escolha comercial de afiliado padrão está documentada; o problema é a classificação/explicação das métricas.

**Sugestão de correção reaproveitando o que já existe:**
Estender o mesmo analytics com breakdown principal/campanhas e histórico unificado identificando tipo de link. Preservar em campos de origem existentes a distinção direct/default/affiliate explícito. Não somar visitantes únicos dos breakdowns como se fossem disjuntos.

**Boas práticas aplicáveis:**
Totais auditáveis por origem e universo claramente indicado em cada tela.

**Critério de validação após correção:**
Com eventos apenas do link principal, a Central deve exibir sua origem e histórico. Adicionar campanha e verificar a decomposição dos cliques e a deduplicação global de identidades.

**Severidade:**
média

### PROBLEMA 21 — Visão administrativa calcula totais sobre amostras e inclui conversões revertidas

**Local no sistema:**
/admin/operacao — métricas do mesmo domínio da Central.

**Arquivos envolvidos:**

- [server/_core/adminCommercialOperations.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/_core/adminCommercialOperations.ts#L389) — L389, L583.
- [client/src/pages/AdminOperation.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/AdminOperation.tsx#L59) — L59, L113.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L261) — L261.

**Evidência no código:**
handleOperation busca até 500 campanhas, 5.000 cliques de cada tabela, 1.000 conversões/pedidos e conta arrays em memória. O filtro de conversões não exige status=active, ao contrário da Central. recentConversions usa slice(0,100) de query sem ORDER BY.

**Comportamento problemático:**
Após os limites, totais administrativos param de representar todo o conjunto; campanhas fora do recorte perdem comparabilidade. Eventos reversed aumentam o total administrativo, e a lista chamada recente pode não ser a mais recente.

**Impacto:**
O administrador não consegue reconciliar as métricas do membro e pode concluir incorretamente que seus dados estão errados.

**Causa provável:**
Limites de listagem reutilizados como fonte de totais e regras de status distintas.

**Sugestão de correção reaproveitando o que já existe:**
Reaproveitar as condições de getMemberOperationAnalytics para COUNT/GROUP BY no banco. Paginar somente detalhes; filtrar o mesmo status e ordenar conversões recentes por occurredAt/id. Identificar separadamente pedidos por data de criação e resultados por data do marco definido.

**Boas práticas aplicáveis:**
Agregação sobre o conjunto completo, filtros uniformes por status e ordenação antes de LIMIT.

**Critério de validação após correção:**
Fixture acima de cada limite e com conversões active/reversed. Totais administrativos devem conciliar com a soma definida dos membros e não mudar ao alterar o tamanho da página.

**Severidade:**
média

### PROBLEMA 22 — Taxa de conversão usa eventos heterogêneos e denominadores diferentes

**Local no sistema:**
Taxa no dashboard do membro e nos cards/detalhes de campanha.

**Arquivos envolvidos:**

- [client/src/pages/MemberOffice.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/MemberOffice.tsx#L99) — L99, L165.
- [client/src/pages/MemberOperationCenter.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/MemberOperationCenter.tsx#L44) — L44, L303.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L270) — L270, L2143.

**Evidência no código:**
O dashboard divide todos os eventos ativos de conversão por cliques, em todo o período. A Central divide os mesmos tipos de evento por visitantes, no período selecionado. O numerador inclui lead manual sem visitorId e application; não deduplica uma pessoa que gere ambos. Não existe relação de coorte entre os visitantes do denominador e os eventos do numerador.

**Comportamento problemático:**
A mesma expressão taxa de conversão representa medidas diferentes. Um visitante com lead manual e application pode produzir duas conversões; um lead sem visita pode produzir numerador positivo com denominador zero, exibido como 0,00%.

**Impacto:**
Taxas não comparáveis e interpretação equivocada como percentual de visitantes que compraram.

**Causa provável:**
Contagem de eventos de tipos distintos apresentada como taxa única, sem contrato de métrica e coorte.

**Sugestão de correção reaproveitando o que já existe:**
Escolher e nomear o marco: por exemplo, pedidos confirmados distintos/visitantes elegíveis, com mesmo período ou coorte explicitada. Separar microconversões e contatos manuais. Reaproveitar conversionType/entityId/visitorId e o vínculo de pedido; quando o denominador não for aplicável, mostrar não disponível.

**Boas práticas aplicáveis:**
Numerador e denominador compatíveis; distinção entre eventos, pessoas e pedidos. Percentual de pessoas convertidas exige deduplicar pessoas elegíveis, não somar eventos.

**Critério de validação após correção:**
Fixture com um visitante, lead e pedido; lead manual sem visita; pedido convertido depois do período do clique. As telas devem ter fórmula/nome coerentes e não produzir percentual enganoso.

**Severidade:**
média

### PROBLEMA 23 — Primeira conversão procura pedidos confirmados em uma lista que os exclui

**Local no sistema:**
Primeiros Passos vinculado à Central de Divulgação.

**Arquivos envolvidos:**

- [client/src/hooks/useMemberGettingStartedProgress.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/hooks/useMemberGettingStartedProgress.ts#L43) — L43, L79.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L1735) — L1735, L2574.

**Evidência no código:**
attributedConversion procura paymentStatus=confirmed ou activationStatus=member_activated em member.affiliateApplications. getMemberAffiliateApplications retorna somente pedidos cujo paymentStatus é diferente de confirmed. A ativação normal também exige pagamento confirmed.

**Comportamento problemático:**
Um membro com pedido confirmado/ativado pelo link principal e sem campaignConversion pode continuar sem primeira conversão concluída, apesar do fallback acrescentado no hook.

**Impacto:**
Divergência entre conclusão comercial e indicador de progresso associado às métricas.

**Causa provável:**
Consulta operacional de pedidos pendentes reutilizada para aferir resultado concluído.

**Sugestão de correção reaproveitando o que já existe:**
Reaproveitar confirmedApplicationCount de member.overview ou expor o resultado canônico nos endpoints de analytics/conversions corrigidos. Manter a filtragem da caixa de pedidos independente da métrica de conclusão.

**Boas práticas aplicáveis:**
Consumir a fonte adequada ao estado de negócio; compartilhar o critério de conversão entre telas.

**Critério de validação após correção:**
Pedido de link principal sem campanha, aprovado e ativado: a primeira conversão deve ser reconhecida sem exigir que ele apareça na caixa de pendentes. Rejeitado não deve ser tratado como venda concluída.

**Severidade:**
média

### PROBLEMA 24 — Navegação interna e mudança de slug podem perder o apresentador original

**Local no sistema:**
Links de afiliado/campanha, páginas informativas e formulário de cadastro.

**Arquivos envolvidos:**

- [client/src/pages/Home.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/Home.tsx#L275) — L275, L507.
- [client/src/pages/PublicInfoPage.tsx](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/client/src/pages/PublicInfoPage.tsx#L102) — L102.
- [server/criticalFlowFixes.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/criticalFlowFixes.ts#L131) — L131.
- [server/db.ts](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/server/db.ts#L805) — L805, L1687, L420.
- [docs/afiliado-padrao-admin-global.md](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/blob/84df97db2429106b6bb2dbc93f62f6a1648eeba3/docs/afiliado-padrao-admin-global.md#L9) — L9.

**Evidência no código:**
Home resolve afiliado a partir da query atual. Links para perguntas frequentes/rodapé não preservam afiliado; PublicInfoPage volta para / ou /#f sem ele. resolveApplicationAffiliate usa o padrão quando não resolve o slug. updateMemberProfile altera o slug sem manter alias; /r resolve pelo slug atual. A documentação ainda descreve ausência de atribuição para afiliado explícito inválido, divergindo do wrapper corrente.

**Comportamento problemático:**
Visitante que chega por um membro, abre o FAQ e retorna ao formulário pode enviar o pedido ao padrão. Um link antigo de afiliado após mudança de slug também pode cair nesse fallback; uma URL de campanha antiga pode deixar de resolver.

**Impacto:**
Pedido/conversão deslocado para outro apresentador ou perdido para a campanha original, mesmo com visitorId preservado. Não se confirmou qual dessas jornadas ocorreu na conta relatada.

**Causa provável:**
A origem comercial depende de um parâmetro transitório e de um identificador editável; a atribuição de campanha é consultada somente depois de escolher o owner pela URL/formulário.

**Sugestão de correção reaproveitando o que já existe:**
Preservar a referência validada nos links internos e no submit, e aplicar regra explícita de atribuição antes de usar o padrão. Reaproveitar o contexto de visitante/atribuição existente. Para slug já divulgado, manter compatibilidade por alias controlado ou restringir sua troca; não transferir silenciosamente um afiliado explícito inválido ao padrão.

**Boas práticas aplicáveis:**
Continuidade da atribuição durante navegação e identidade estável do apresentador; documentação alinhada ao fluxo executável.

**Critério de validação após correção:**
Percorrer link do membro → FAQ/termos → CTA → cadastro e conferir o mesmo ownerUserId. Testar link antigo após troca de slug e afiliado inválido; a regra de fallback deve ser explícita e não converter visita de um membro em crédito de outro sem justificativa.

**Severidade:**
alta

## 3. Lacunas que impedem conclusão definitiva

| O que falta | Por que impede concluir | Como confirmar |
| --- | --- | --- |
| URL exata do link, ID da campanha/membro, tela em que os 27/26/26 apareceram e período selecionado | Os totais globais incluem link principal e campanhas; não é possível afirmar que os números pertenciam ao link recém-criado | Obter URL e captura da tela com período; relacionar ao userId/campaignId no banco, sem abrir o link de produção durante a coleta |
| Registros reais das duas tabelas de cliques e logs HTTP/deploy do intervalo | Não permite dizer quantos registros vieram de curl, bots, titular, retries ou visitantes diferentes | Exportação somente leitura por membro/período com ID, campaignId, visitorId, sessionId, occurredAt, userAgentCategory, origem e landingPath; correlacionar com método, user-agent e horários dos logs. Agregar também interseções de IDs entre tabelas |
| ID do pedido/conversão relatado e seu histórico | Não permite escolher entre ausência de campanha, expiração, exclusão, período, erro de consulta ou reatribuição | Comparar applications.ownerUserId/paymentStatus/activationStatus com campaignConversions por entityType=application e entityId, campaignAttributions e campaignLinks; conferir a resposta dos dois endpoints do mesmo membro/período |
| Logs com método e user-agent completo, origem interna e headers de prefetch | As tabelas guardam categoria resumida, não toda a evidência necessária para reclassificar o histórico | Usar logs já existentes, se houver. Ausência de logs não autoriza rotular retrospectivamente todo evento human como humano nem todo ID novo como bot |
| SHA efetivamente implantado, variáveis não secretas de host/prefixo e conexão, regras de proxy/cache | main não demonstra qual versão produziu os números; hosts, Path e cache podem mudar a passagem pelo tracking | Conferência somente leitura do release, VITE_DEV_PREFIX, host canônico, configuração de proxy e nomes/identificação do banco. Não expor credenciais |
| Schema efetivo, migrations aplicadas, versão do banco, sql_mode e timezone da aplicação/conexão | Existem migrations em drizzle e drizzle/migrations; índices antigos e modo SQL podem alterar colisões, erros de tamanho e fronteiras temporais | Consultar histórico de migrations, SHOW CREATE TABLE das tabelas envolvidas e configurações de fuso/mode. Confrontar com o schema do SHA auditado |
| Regra formal de conversão e atribuição | Não está demonstrado se “conversão” significa lead, pedido, pagamento confirmado ou ativação; first/last touch, retorno direto e data comercial também precisam de definição | Registrar unidade, status, janela, desempate entre abas/campanhas, política de tráfego próprio e data de cada indicador; distinguir microconversão de venda |
| Histórico anterior às tabelas de eventos e critérios de exclusão/retenção | Contadores legados não permitem reconstruir visitantes/sessões; pedidos sem vínculo comprovável não permitem inventar campanha passada | Identificar datas de implantação, backups disponíveis e exclusões de campanhas/pedidos. Conciliar entidade por entidade; declarar histórico sem atribuição quando não houver evidência |
| Reprodução controlada com banco e navegador | A leitura identifica defeitos/riscos, mas não mede latência, volume, cache real ou incidência concorrente | Executar os critérios de cada problema em homologação isolada. Os testes campaignConversions.integration.test e parte de memberOperationCenter.integration.test verificam texto com readFile/toContain; testes de handlers usam mocks e não demonstram conciliação no banco |

A evidência histórica disponível pode ser insuficiente para recuperar a origem de todos os acessos antigos. Corrigir a coleta futura não torna os números anteriores automaticamente confiáveis.

## 4. Ordem recomendada de correção

As mudanças devem ficar nos handlers, services, consultas, tabelas e hooks já existentes. Definir os marcos do problema 7 antes de alterar os totais dos problemas 6 e 22. Cada ajuste deve incluir o seu critério de validação em homologação.

| Prioridade | Problema | Motivo da prioridade | Área afetada | Correção sugerida em alto nível |
| --- | --- | --- | --- | --- |
| 1 | 24 — Navegação interna e mudança de slug podem perder o apresentador original | Risco direto de crédito comercial ao apresentador errado. | Links de afiliado/campanha, páginas informativas e formulário de cadastro. | Preservar apresentador em navegação e links antigos; impedir fallback silencioso indevido. |
| 2 | 1 — Verificações automáticas de instalação e deploy geram tráfego atribuído | Fonte automatizada concreta, ativa nos scripts versionados. | Visão geral, Tráfego e dashboard do afiliado padrão. | Mover checks para system.health e separar tráfego técnico. |
| 3 | 2 — Bots, HEAD, pré-carregamento e acessos internos entram nas métricas | Interromper a entrada de tráfego sem interação humana demonstrada. | Rotas /r/:memberSlug/:campaignSlug, /:campaignSlug e página de entrada. | Aplicar elegibilidade de tráfego e exclusões internas antes da persistência/agregação. |
| 4 | 3 — Cada GET elegível é contabilizado como novo clique, sem deduplicação | Impedir duplicação de eventos na entrada e no contador legado. | Link principal e acessos repetidos às URLs de campanha. | Deduplicar atomicamente eventos e incrementos. |
| 5 | 7 — Conversão comercial não acompanha aprovação, rejeição e ativação | Definir o que conta como resultado antes de reconciliar as fontes. | Conversões, aprovação de comprovante e resultados do membro. | Separar solicitação, confirmação e ativação, com status/data próprios. |
| 6 | 6 — Pedidos atribuídos ao membro podem nunca entrar na aba Conversões | Explicação direta, baseada no fluxo, para pedido atribuído ausente. | Link principal, cadastro, pedidos atribuídos e aba Conversões. | Conciliar pedidos por ownerUserId com campanha opcional, sem dupla contagem. |
| 7 | 8 — A atribuição de 30 dias é limitada pela sessão de 30 minutos | Perda de atribuição mesmo dentro da janela declarada no código. | Cadastro depois de navegação prolongada ou retorno ao site. | Desacoplar janela de atribuição do sessionId efêmero. |
| 8 | 9 — Exclusões deixam conversões órfãs e totais sem conciliação | Perda de detalhamento e continuidade de gravação sobre referência excluída. | Remoção de campanha/pedido e métricas da Central. | Arquivar campanhas e tratar conversões de pedidos excluídos na mesma transação. |
| 9 | 10 — Rota legada resolve campanha sem membro e pode duplicar ou desviar a atribuição | Risco de atribuição ao destinatário errado e duplicação por URL ainda exposta. | Links /:campaignSlug e rotas públicas de um segmento. | Restringir legado a resolução inequívoca e aplicar regras do redirect canônico. |
| 10 | 13 — Atribuição é sobrescrita e o formulário não preserva a campanha da própria aba | Preservar o vínculo campanha–pedido antes de reconstruir históricos. | Campanhas do mesmo membro abertas na mesma sessão e histórico da conversão. | Preservar evidência histórica e política determinística de atribuição. |
| 11 | 16 — Cadastros e leads concorrentes podem criar conversões duplicadas | Impedir duplicação comercial na origem, antes da agregação. | applications.submit e member.createContact. | Garantir idempotência/uniquidade nas entidades de origem. |
| 12 | 11 — Marcador público pl_ref=campaign suprime novos acessos indefinidamente | Perda direta de tráfego e atribuição em URLs compartilháveis. | Página final do redirecionamento de campanha. | Trocar bypass permanente por deduplicação contextual. |
| 13 | 5 — Totais somam visitantes e sessões distintos de duas tabelas | Erro determinístico de agregação que independe da origem do tráfego. | Visão geral, Tráfego e métricas agregadas do membro. | Aplicar DISTINCT após união das duas fontes. |
| 14 | 12 — Hosts e prefixos permitidos podem separar os cookies do cadastro | Eliminar perda de atribuição em configurações explicitamente aceitas. | Redirecionamentos entre domínio raiz/www e URLs com/sem prefixo. | Normalizar host/base path antes da emissão de cookies. |
| 15 | 14 — Clique e atribuição são gravados antes de validar o destino | Evitar registros sem navegação válida e loops de contagem. | URLs de campanha com destino incompatível ou circular. | Validar destino e circularidade antes de gravar. |
| 16 | 15 — Validação de cookies e UTMs é incompatível com as colunas | Eliminar perda de eventos causada por entradas aceitas pelo próprio helper. | Persistência do tracking e processamento de cookies. | Alinhar limites ao schema e tratar cookies inválidos. |
| 17 | 17 — Mutações atualizam o total sem invalidar a lista de conversões | Corrigir divergência da interface após operações já concluídas. | Registro de contato e remoção de campanha na Central. | Invalidar lista e agregado juntos. |
| 18 | 18 — Falha ou carregamento das métricas aparece como zero e ausência de conversões | Evitar apresentar falha técnica como resultado do negócio. | Cards, aba Conversões, Tráfego e detalhe da campanha. | Exibir carregamento/indisponibilidade, sem fabricar zero. |
| 19 | 19 — Limites globais são aplicados antes do filtro da campanha no detalhe | Eliminar falsos vazios e registros inacessíveis por truncamento. | Histórico e conversões da campanha; lista geral de conversões. | Filtrar por campanha antes de paginar; expor cursor/total. |
| 20 | 20 — Link principal entra nos totais, mas fica fora da decomposição e do histórico | Permitir distinguir os números da campanha dos números gerais da conta. | Visão geral, Tráfego e Histórico de eventos. | Unificar histórico e explicitar origem do link principal/default. |
| 21 | 21 — Visão administrativa calcula totais sobre amostras e inclui conversões revertidas | Restabelecer uma fonte administrativa útil à conferência do mesmo sistema. | /admin/operacao — métricas do mesmo domínio da Central. | Agregar no banco e uniformizar status/ordenação. |
| 22 | 22 — Taxa de conversão usa eventos heterogêneos e denominadores diferentes | Corrigir a interpretação após definir eventos e fontes canônicas. | Taxa no dashboard do membro e nos cards/detalhes de campanha. | Padronizar unidade, fórmula, período e denominador. |
| 23 | 23 — Primeira conversão procura pedidos confirmados em uma lista que os exclui | Corrigir indicador que atualmente não alcança o estado que tenta verificar. | Primeiros Passos vinculado à Central de Divulgação. | Consultar fonte de resultados confirmados, não caixa de pendentes. |
| 24 | 4 — Visitantes e sessões são contados antes de confirmar persistência da identidade | Evitar transformar ausência de cookies em audiência humana confirmada. | Visitantes únicos e sessões de campanhas e link principal. | Separar identidades provisórias e explicitar limites dos únicos. |

## 5. Conclusão técnica

A confiabilidade está comprometida por coleta sem exclusão suficiente de tráfego técnico/automatizado, repetição de GET, identidades não confirmadas, soma indevida de visitantes/sessões, perda de atribuição e divergências entre fontes, status e listagens.

**Números inflados:** os scripts de healthcheck fornecem um caminho concreto para produzir novas identidades no total do afiliado padrão. Bots/HEAD/prefetch, autoacessos, requisições repetidas e soma de DISTINCT entre tabelas são outros mecanismos presentes. A origem exata de **27/26/26 não foi comprovada**. Refresh comum preservando cookies, sozinho, não explica 26 visitantes únicos. É necessário distinguir o total global da conta do detalhe da campanha.

**Conversões ausentes:** o vínculo do pedido ao apresentador em applications não garante registro em campaignConversions. Link principal, perda do afiliado durante navegação, sessão expirada, host/prefixo incompatível e atribuição perdida podem deixar o pedido fora da Central; aprovação e ativação não recuperam esse registro. Exclusão de campanha, limite aplicado antes do filtro, cache incompleto e erro mostrado como vazio também podem ocultar conversões existentes.

**Prioridades:** preservar o apresentador correto, interromper a contaminação por tráfego interno/automatizado, definir o marco de conversão e conciliar pedidos com os endpoints existentes; depois corrigir janela de atribuição, integridade histórica, deduplicação global e apresentação das consultas. Não há base para corrigir números antigos por estimativa ou atribuir campanhas sem evidência.
