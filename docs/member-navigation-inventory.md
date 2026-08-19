# Inventário da navegação do Escritório Virtual

## Escopo preservado

O roteamento de membro está centralizado em `client/src/App.tsx`. A reorganização visual deve preservar todas as rotas existentes, inclusive as rotas individuais de cursos, que continuarão acessíveis a partir da Academia ou de links contextuais internos.

| Área | Rotas existentes relevantes |
|---|---|
| Início e operação | `/membros`, `/membros/operacao`, `/membros/como-divulgar`, `/membros/campanhas`, `/membros/convites`, `/membros/fale-conosco` |
| Página, conta e recebimento | `/membros/configuracoes`, `/membros/meus-dados`, `/membros/recebimentos`, `/membros/mensagem-especial` |
| Vendas e rede | `/membros/meus-pedidos`, `/membros/ganhos`, `/membros/rede`, `/membros/patrocinador`, `/membros/produtos` |
| Divulgação e contatos | `/membros/historico`, `/membros/top-visitas`, `/membros/emails-interessados`, `/membros/emails-whatsapp`, `/membros/emails-site`, `/membros/automacoes` |
| Conteúdos e materiais | `/membros/blog`, `/membros/artigos`, `/membros/materiais`, `/membros/bonus`, `/membros/classificados` |
| Academia e biblioteca | `/membros/academia`, `/membros/ebooks`, `/membros/filmes` e as rotas `/membros/curso-*` e `/membros/curso/:courseKey` |
| Desempenho | `/membros/pontos`, `/membros/pontos-niveis`, `/membros/ranking`, `/membros/mais-lucrativos`, `/membros/cartao-certificado` |
| Ajuda e participação | `/membros/perguntas-frequentes`, `/membros/fale-conosco`, `/membros/fazer-depoimento` |

## Catálogo central atual

`shared/memberOfficeContent.ts` é a fonte de dados consumida por `client/src/lib/memberDashboardNavigation.ts`. O catálogo atual possui seis grupos e 51 entradas, com mistura de conta, operação, comunicação, tráfego, conteúdo, gamificação e cursos. O grupo `Minha conta` contém elementos de perfil, dados, recebimento, pedidos, operação e suporte. `Minha operação` mistura ganhos, rede, produtos, blog, classificados, visitas, Academia, ajuda e convites. `Conteúdos e materiais` mistura downloads, e-books, certificados, pontos, artigos, automações, visitas, campanhas e bônus. `Academia` contém critérios de pontos, ranking comparativo, todos os cursos individuais e filmes.

## Menus locais encontrados

Dezoito páginas de membro declaram listas `DashboardMenuItem[]` próprias: `MemberAccount`, `MemberAffiliateOrders`, `MemberCommunications`, `MemberCourses`, `MemberCredentials`, `MemberEarnings`, `MemberOffice`, `MemberOperations`, `MemberPerformance`, `MemberPersonalization`, `MemberProducts`, `MemberProfile`, `MemberPublications`, `MemberReceiving`, `MemberReferrals`, `MemberTestimonial`, `MemberTraffic` e `EbookReader`.

O `DashboardLayout` já possui uma substituição central: quando recebe apenas caminhos `/membros` ou `/membros/*`, `isMemberOfficeNavigation` faz o layout renderizar `memberDashboardMenuItems` em vez do menu local recebido pela página. Isso significa que a experiência visual já pode ser unificada alterando o catálogo central, sem reconstruir os módulos e sem editar cada página por necessidade arquitetural. Os menus locais continuam sendo uma fonte de confusão e deverão ser neutralizados ou documentados como entradas legadas somente quando isso for necessário para impedir redefinições futuras.

## Conflito semântico confirmado

`client/src/App.tsx` direciona `/membros/historico` para `MemberTraffic`, e `MemberTraffic.tsx` utiliza a rota para histórico de visitas e métricas de campanhas. Porém `MemberPerformance.tsx` declara localmente `Histórico de pontos` apontando para `/membros/historico`. Como o DashboardLayout substitui menus de membro, esse label não é a fonte final da sidebar, mas representa uma inconsistência real de nomenclatura que deve ser removida do menu local. O histórico de pontos deverá ser representado por `/membros/pontos` ou `/membros/pontos-niveis`, sem criar rota nova.

## Academia e conteúdo contextual

`MemberCourses.tsx` já possui a navegação contextual `Voltar para a Academia de execução` ao abrir um curso. A tela `/membros/academia` lista cursos publicados e abre o curso por `/membros/curso/:courseKey`. As rotas históricas `/membros/curso-*` continuam registradas no `App.tsx`, mas não devem mais aparecer como destinos globais. `MemberPublications.tsx` também confirma que Blog e Artigos são visualizações editoriais distintas do mesmo componente e podem permanecer como duas entradas próximas dentro de `Conteúdos & Materiais`, sem apagar rotas.

## Decisão de implementação

A primeira intervenção deve concentrar-se em `shared/memberOfficeContent.ts`, `client/src/lib/memberDashboardNavigation.ts` e `client/src/components/DashboardLayout.tsx`, com ajustes mínimos nos menus locais apenas onde eles carregam labels semanticamente incorretos. Não haverá alteração em `App.tsx`, banco, routers, autenticação, páginas funcionais ou contratos de dados, salvo se a validação revelar uma inconsistência de navegação que não possa ser resolvida por agrupamento e nomenclatura.
