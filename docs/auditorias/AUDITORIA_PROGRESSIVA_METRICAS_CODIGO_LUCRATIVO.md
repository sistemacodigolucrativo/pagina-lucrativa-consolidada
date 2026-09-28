# Diário técnico — Auditoria do Sistema de Métricas — Código Lucrativo

## Etapa 0 — Base e limites da investigação

- Data de início: 28/09/2026, horário de Brasília.
- Repositório: sistemacodigolucrativo/pagina-lucrativa-consolidada.
- Branch consultada: main.
- Commit fixado: 84df97db2429106b6bb2dbc93f62f6a1648eeba3.
- Commit publicado em: 28/09/2026 16:45:21 BRT.
- Método: leitura estática do código e cruzamento de produtores, persistência e consumidores das métricas. Não houve acesso à aplicação de produção, execução de testes reais, banco ou logs.
- Restrições: nenhum arquivo do repositório será alterado; nenhum commit ou PR. A criação dos dois documentos de auditoria é a exceção expressamente solicitada.
- Sintomas relatados, ainda não reproduzidos: aproximadamente 27 cliques, 26 visitantes e 26 sessões em link não divulgado; conversão atribuída ausente ou divergente na aba Conversões.
- Inventário: árvore recursiva do commit retornou 1.270 entradas, sem truncamento. Não foi encontrado AGENTS.md na árvore.
- Arquivos inicialmente localizados: server/db.ts; server/routers.ts; server/_core/campaignRedirect.ts; server/_core/affiliateLinkTracking.ts; server/_core/trackingCookies.ts; drizzle/schema.ts; migrations 0012–0015 e 0024; client/src/pages/MemberOperationCenter.tsx.
- Evidências iniciais: handlers de redirecionamento chamam funções de gravação; middleware de afiliado atua em GET nas rotas de entrada. Ainda falta verificar os filtros de persistência e agregação.
- Hipóteses: tráfego automatizado/interno e divergência entre pedido e campaignConversions; nenhuma causa do caso concreto confirmada.
- Pontos descartados: nenhum nesta etapa.
- Pendências: leitura integral dos caminhos relacionados; rastrear frontend e status do pedido; examinar migrations/testes existentes sem executá-los.
- Próxima etapa: mapear a arquitetura e as fontes das métricas no commit fixado.


## Etapa 1 — Arquitetura, endpoints e fontes de dados

- Arquivos analisados: `server/db.ts:180–515`, `server/routers.ts:112–120,333–413`, `server/_core/index.ts:83–114`, `server/_core/{campaignRedirect,affiliateLinkTracking,trackingCookies}.ts`, `package.json`; inventário de `drizzle` e `client/src`.
- Fluxo localizado: GET de campanha → `resolvePublicMemberCampaignAndRecordClick`/`resolvePublicCampaignAndRecordClick` → `recordCampaignClick` → `campaignClickEvents`, `campaignAttributions` e `campaignLinks.clicks`. GET da entrada → `recordPublicAffiliateLinkClick` → `affiliateLinkClickEvents`.
- Consultas localizadas: `member.analytics` → `getMemberOperationAnalytics`; `member.conversions` → `getMemberOperationConversions`; dashboard → `getMemberOverview`; pedidos → `applications` e `transactions`.
- Evidências confirmadas: o total de visitantes e sessões soma dois COUNT(DISTINCT) independentes, um por tabela; não deduplica a união. `getMemberOperationConversions` exige INNER JOIN com campanha e limita 200 registros; o agregado conta diretamente `campaignConversions`. A exclusão de campanha usa DELETE físico.
- Problemas já identificados: dupla contagem entre link principal e campanha para o mesmo cookie; fontes diferentes entre total e lista de conversões; possível perda da lista após exclusão (dependente de verificar chaves/regras no schema).
- Hipóteses: ausência de conversões do link principal; perda de atribuição depois da sessão; verificar no produtor do cadastro/pagamento.
- Pontos descartados nesta etapa: não foi localizada chamada de tracking no endpoint de leitura `member.analytics`; não há JOIN na soma de cliques que, por si, multiplique linhas.
- Pendências: verificar mecanismos de gravação completos, schema/migrations, frontend, pedidos e estados; não há banco/logs para vincular os sintomas a eventos específicos.
- Próxima etapa: origem dos eventos, identidade, sessão, tráfego interno e proteção contra repetição.

## Etapa 2 — Cliques, visitantes, sessões e origem das requisições

- Arquivos analisados: `server/_core/campaignRedirect.ts:12–107`, `affiliateLinkTracking.ts:16–70`, `trackingCookies.ts:4–44`; `server/db.ts:251–513`; `drizzle/schema.ts:192–295`; migrations `0012`, `0013`, `0014`, `0015`, `0024`; `server/{campaignRedirect,affiliateLinkTracking}.test.ts`; `scripts/seed-demo.ts:21–48,157–199`; `client/src/main.tsx` e `MemberOperationCenter.tsx:35–155`.
- Funções verificadas: handlers de GET/redirect, leitura/criação de cookies, classificação de user-agent, gravação de clique e atribuição, agregação de eventos.
- Evidências confirmadas: todo acesso elegível insere evento sem idempotência/janela; `userAgentCategory=bot` não é excluído pelas queries; não há identificação de autoacesso, administrador, teste ou ambiente nos handlers. `app.get` também atende HEAD segundo documentação oficial do Express, e os handlers de campanha não verificam o método. Não há teste de Purpose/Sec-Purpose.
- Evidências confirmadas de identidade: UUID é criado a cada requisição sem cookie válido; persistência não confirmada antes de contar o visitante. Cookies são host-only; `Path` depende do prefixo. A sessão de 30 minutos só é renovada nos handlers de tracking, não pela atividade no funil. IDs aceitos chegam a 80 caracteres, mas colunas suportam 64; UTM source/medium chegam a 160 para colunas de 96.
- Evidências confirmadas de links: destino é validado somente depois da gravação; `pl_ref=campaign` público elimina completamente o tracking de entrada; rota legada resolve slug sem membro, embora a unicidade seja composta por membro+slug, e redireciona sem normalizar afiliado/marcador.
- Evidência sobre testes internos: seed gera eventos sintéticos com `utmCampaign=demo-seed` e categoria human. Há bloqueio por nome de banco e override explícito; não há evidência de execução desse seed no ambiente relatado. As queries não segregam esses eventos se presentes.
- Problemas: entrada de bots/HEAD/prefetch/autoacessos; repetição de GET contabilizada como clique; soma não deduplicada entre tabelas; inflação de identidade sem cookie; risco de perda de cookies por host/prefixo; destino inválido contado; link legado ambíguo; marcador reutilizável suprime tracking; incompatibilidade de tamanhos de metadados.
- Hipóteses sobre o caso: novas identidades por clientes sem cookies, bots/verificadores, acessos do titular e seed são mecanismos possíveis. Nenhum foi identificado no banco real. Refresh comum com os mesmos cookies aumenta cliques, mas não justifica sozinho 26 visitantes únicos.
- Pontos descartados: não há tracking de clique no render/effect da Central; main.tsx não habilita StrictMode; consultas de revalidação não escrevem eventos. Trocar aba sem nova requisição não chama os handlers. O marcador existente impede a duplicação imediata do redirecionamento moderno na página final, mas não resolve os demais cenários.
- Pesquisa técnica: documentação oficial Express 4 (HEAD em app.get), MySQL COUNT(DISTINCT), MDN cookies e Sec-Purpose. Links e aplicação serão incluídos junto às correções no relatório.
- Pendências: determinar os produtores reais de conversão e transições de status; avaliar detalhe/lista/cache e filtros temporais; comprovar ocorrências em produção exige logs e banco.
- Próxima etapa: conversões, atribuição ao apresentador, cadastro, pagamento, ativação e telas consumidoras.

## Etapa 3 — Conversões, atribuição, status e consumidores

- Arquivos analisados: `server/db.ts:180–224,251–515,606–621,805–830,1004–1042,1678–1812,1905–2043,2143–2177,2477–2584`; `server/criticalFlowFixes.ts:121–155`; `server/routers.ts:333–413`; `shared/applications.ts`; `server/integrityGuards.ts`; `drizzle/schema.ts:276–328,359–380,399–451,499–516`; `client/src/pages/{Home,MemberOperationCenter,MemberOffice,MemberAffiliateOrders,AdminOperation}.tsx`; `client/src/hooks/useMemberGettingStartedProgress.ts`; `client/src/App.tsx`; `server/_core/adminCommercialOperations.ts:267–288,382–470,577–584`; testes versionados de conversões/aplicações/central.
- Produtores de conversão encontrados no fluxo executável: `createApplication` cria tipo application apenas com owner+atribuição por visitor+session; `createMemberContact` cria lead manual apenas com campaignId. Não foi encontrada gravação de conversão em upload/aprovação/ativação/primeiro login. Enum inclui order/sale/commission, mas esses produtores não estão conectados no fluxo corrente.
- Evidência confirmada: pedido do link principal preserva ownerUserId, sem criar campaignAttributions; consequentemente pode não criar campaignConversions. Consultas da Central não conciliam `applications.ownerUserId` nem `referralLinks.sponsorId`. Confirmação de pagamento e ativação não recuperam esse registro ausente.
- Evidência confirmada: atribuição vence em 30 dias, mas exige sessionId de cookie que expira após 30 minutos sem renovação nos demais passos; o pedido não guarda campanha/visita/sessão fora do registro condicional de conversão.
- Evidência confirmada: `campaignAttributions` é atualizado por user+visitor+session e troca campaignId; formulário envia afiliado, não o clique/campanha da aba. Risco de concorrência entre abas e referência histórica mutável. A regra oficial first/last touch ainda não foi demonstrada.
- Evidência confirmada: DELETE de campanha não limpa nem arquiva referências e não há FK nas tabelas de analytics versionadas; agregado continua contando e INNER JOIN da lista esconde conversões órfãs. A atribuição órfã também pode continuar sendo utilizada.
- Evidência confirmada: guardas de e-mail/contato são SELECT seguido de INSERT sem chave única de negócio correspondente; concorrência pode criar entidades distintas e conversões distintas apesar da unicidade por entityId.
- Evidência confirmada no frontend: `createContact`/`deleteCampaign` não invalidam a consulta conversions; estados de carregamento/erro são mostrados como 0 ou ausência. Detalhe filtra campanha depois dos LIMIT globais 50/200. Histórico exclui o link principal contado no total. Taxas misturam contagem de eventos de tipos distintos com visitantes/cliques e denominadores diferentes entre telas.
- Evidência confirmada de onboarding: hook procura confirmed/member_activated em `affiliateApplications`, mas o backend remove pedidos confirmed dessa lista. O fallback da primeira conversão não cobre a conclusão de compra normal.
- Consulta administrativa do mesmo domínio: `handleOperation` soma arrays limitados a 5.000/1.000/500, inclui conversões reversed e retorna recentConversions sem ORDER BY. Isso impede conciliação integral com o painel do membro.
- Nova evidência de tráfego interno: `scripts/deploy-vps.sh:7–10,173–209` e `scripts/install-vps.sh:544–572` executam GET / com curl sem cookie jar. `vps-autodeploy-master.sh:29,378–387` usa o mesmo destino padrão. O middleware atribui domínio puro ao afiliado padrão; curl é classificado human. Mecanismo confirmado; execução e volume no banco relatado continuam não confirmados.
- Documentação cruzada: `docs/afiliado-padrao-admin-global.md` exige distinguir domínio puro de afiliado inválido, mas `resolveApplicationAffiliate` faz fallback para padrão também após slug inválido; alteração de slug em `updateMemberProfile` não mantém alias e links anteriores podem migrar para esse fallback. Não se conclui que isso ocorreu na conta relatada.
- Pontos descartados: `MemberTraffic`/`MemberOperations` antigos não estão montados nas rotas correntes do App; seus contadores legados não serão apresentados como defeitos ativos da Central. A existência de enum sale/commission não demonstra gravação real. Aprovar comprovante não equivale a inserção automática em transactions no fluxo lido.
- Testes existentes foram lidos, não executados. Vários arquivos nomeados integration.test usam readFile/toContain, sem verificar banco, totais ou concorrência; handlers de tracking são testados com mocks.
- Pendências: consolidar achados sem duplicidade, checar referências/linhas, delimitar hipóteses de produção e preparar roteiro de validação futura por achado.
- Próxima etapa: revisão cruzada das evidências, lacunas e relatório final.

## Etapa 4 — Revisão cruzada, achados finais e limites da conclusão

- Arquivos adicionais analisados: `client/src/pages/PublicInfoPage.tsx:102,119`, `Home.tsx:275–314,507,540`; `server/_core/adminCommercialOperations.ts:237–255`; `server/_core/systemRouter.ts`; `drizzle/0000_amusing_matthew_murdock.sql`, `0001_furry_the_renegades.sql`, `0002_volatile_thanos.sql`, `drizzle.config.ts`; trechos de healthchecks em `scripts/{deploy-vps,install-vps,vps-autodeploy-master}.sh`; `docs/afiliado-padrao-admin-global.md`; fontes primárias de Express, MDN, MySQL e TanStack Query.
- Nova evidência confirmada: navegação pelo FAQ/rodapé e retorno via PublicInfoPage perde o parâmetro afiliado. O formulário resolve novamente o padrão, em vez de recuperar o apresentador original. Mapeado no problema 24.
- Nova evidência confirmada: `handleOrderDelete` exclui applications/recibos/tokens, mas deixa conversões da entidade excluída. Acrescentado ao problema 9 sobre órfãos e política histórica.
- Revisão de escopo: consultas administrativas incluídas somente como consumidoras das mesmas métricas. Scripts de deploy incluídos somente como produtores de tráfego interno; não houve auditoria geral de infraestrutura. Componentes antigos sem rota ativa não foram tratados como falhas correntes.
- Conferência documental: 24 achados, 13 de severidade alta e 11 média. Cada um contém os 10 campos exigidos. Relatório contém as cinco seções solicitadas, 86 links diretos de evidência e todos os problemas na ordem recomendada de correção.
- Integridade da base: 168 arquivos de referência coletados tiveram conteúdo conferido contra o hash de blob da árvore do commit; isso valida o material de leitura, não o funcionamento da aplicação. A consulta final da branch main ainda apontava para 84df97db2429106b6bb2dbc93f62f6a1648eeba3.
- Validação realizada: estrutura dos Markdown, presença dos campos, numeração e existência dos arquivos/linhas usados nas referências. Nenhum teste funcional/de integração foi executado. Não houve acesso ao banco, execução de scripts do projeto, visita a links rastreados, commit, PR ou alteração remota.
- Hipóteses mantidas: a origem específica dos 27/26/26 e da conversão relatada depende de logs, IDs e dados reais. O relatório não apresenta um mecanismo possível como causa comprovada do episódio.
- Pontos descartados: duplicação por StrictMode/effects na Central; clique disparado por copiar URL; revalidação analítica gravando cliques; falta generalizada de DISTINCT em cada tabela; multiplicação dos cliques por JOIN; inferir que todas as conversões são vendas; afirmar que seed foi executado em produção; atribuir a uma campanha específica os healthchecks da raiz.

### Cobertura dos pontos obrigatórios

| Ponto | Registro de investigação e problemas relacionados |
| --- | --- |
| 1. Origem dos cliques | Etapas 1–2 e complemento de checks na etapa 3; problemas 1–3, 10–11, 14 e 20 |
| 2. Visitantes únicos | Cookies emitidos/retornados, limites, interseção das tabelas e escopo de host/path; problemas 4–5, 12 e 15 |
| 3. Sessões | Cookie de 30 minutos, renovação limitada, requests sem cookie, concorrência inicial e DISTINCT; problemas 4–5, 8 e 12 |
| 4. Conversões | Cadastro, contato manual, pedido, comprovante, aprovação e ativação; problemas 6–9, 16 e 23 |
| 5. Atribuição | Owner por slug, campanha por visitor+session, múltiplas abas, alias e navegação; problemas 6, 8, 10–13 e 24 |
| 6. Queries/agregações | COUNT, DISTINCT, JOIN, filtros por dono/período/status, LIMIT e taxa; problemas 5–7, 9, 19–22 |
| 7. Frontend | Queries/effects, cache, erros, fontes do dashboard, detalhe e onboarding; problemas 17–20, 22–24 |
| 8. Backend | Gravação, idempotência, validação, elegibilidade e produtores de conversão; problemas 1–3, 6–16 |
| 9. Banco | Schema/migrations, chaves, órfãos, tamanhos e vínculo de entidades; problemas 4–6, 8–10, 13, 15–16 |
| 10. Estados/status | awaiting_payment, receipt_received, rejected, confirmed, access_issued, member_activated, active/reversed; problemas 7, 9, 21 e 23. Primeiro login não tem produtor de conversão no fluxo lido |

- Pendências externas finais: obter URL/ID/período do sintoma; exportação somente leitura de eventos/pedido; logs HTTP e deploy; schema/migrations efetivos; SHA implantado; regra formal de conversão/atribuição; reprodução em homologação.
- Próxima etapa recomendada para outra IA: ler o relatório AUDITORIA_METRICAS_CODIGO_LUCRATIVO.md e coletar as evidências da seção 3 antes de atribuir causa aos números históricos. Aplicar correções somente em uma etapa posterior autorizada; os critérios por problema ainda precisam ser executados.
- Estado da auditoria: investigação estática e relatório concluídos; diagnóstico do episódio em produção permanece limitado pelas pendências registradas.
