# Matriz de reorganização da navegação do membro

A matriz abaixo define a nova arquitetura global. As rotas são preservadas; somente os labels, os grupos e a ordem de apresentação mudam. Os cursos individuais e `filmes` continuam roteados no `App.tsx`, mas deixam de ser destinos globais.

| Ordem | Rota atual | Label atual | Grupo atual | Novo grupo | Novo label | Função do destino |
|---:|---|---|---|---|---|---|
| 1 | `/membros` | Visão geral | Minha conta | Início | Visão geral | Entrada principal e visão consolidada da operação. |
| 2 | `/membros/como-divulgar` | Saiba como divulgar | Comece por aqui | Início | Primeiros passos | Jornada inicial para entender a estrutura e começar a operar. |
| 3 | `/membros/operacao` | Ferramentas da operação | Minha conta | Início | Minha operação | Central operacional para acessar e organizar a execução. |
| 4 | `/membros/configuracoes` | Meu perfil | Minha conta | Minha página | Minha página e perfil | Personalização da presença pública e do perfil do membro. |
| 5 | `/membros/meus-dados` | Dados da conta | Minha conta | Minha página | Dados da conta | Cadastro privado, nome, e-mail e demais dados da conta. |
| 6 | `/membros/recebimentos` | Preferências de recebimento | Minha conta | Minha página | Dados de recebimento | Meios e preferências financeiras de recebimento. |
| 7 | `/membros/mensagem-especial` | Personalização | Minha conta | Minha página | Mensagem de acesso | Mensagem e instruções relacionadas à ativação e personalização. |
| 8 | `/membros/meus-pedidos` | Pedidos da operação | Minha conta | Vendas & Rede | Meus pedidos | Solicitações e pedidos atribuídos à operação do membro. |
| 9 | `/membros/ganhos` | Meus resultados | Minha operação | Vendas & Rede | Ganhos e extrato | Registros financeiros, lançamentos e resultados da operação. |
| 10 | `/membros/rede` | Minha rede direta | Minha operação | Vendas & Rede | Meus indicados | Relações diretas atribuídas ao membro. |
| 11 | `/membros/convites` | Convites | Minha operação | Vendas & Rede | Convidar pessoas | Acesso à preparação e organização de convites. |
| 12 | `/membros/patrocinador` | Meu apresentador | Minha operação | Vendas & Rede | Meu patrocinador | Relação com a pessoa responsável pela indicação, conforme terminologia oficial. |
| 13 | `/membros/produtos` | Meus produtos | Minha operação | Vendas & Rede | Meus produtos | Produtos próprios e informações para revisão e apresentação. |
| 14 | `/membros/campanhas` | Links & campanhas | Conteúdos e materiais | Divulgação & Contatos | Campanhas e links | Criação e organização de links acompanháveis. |
| 15 | `/membros/historico` | Visitas e histórico | Minha operação | Divulgação & Contatos | Histórico de visitas | Tráfego e histórico de visitas da operação. |
| 16 | `/membros/top-visitas` | Visitas em destaque | Conteúdos e materiais | Divulgação & Contatos | Top de visitas | Conteúdos e campanhas com maior alcance registrado. |
| 17 | `/membros/emails-interessados` | Interessados | Comunicação | Divulgação & Contatos | Contatos — interessados | Contatos interessados captados com consentimento. |
| 18 | `/membros/emails-whatsapp` | WhatsApp | Comunicação | Divulgação & Contatos | Contatos — WhatsApp | Registros relacionados à captação por WhatsApp. |
| 19 | `/membros/emails-site` | Conteúdos do site | Comunicação | Divulgação & Contatos | Comunicações do site | Mensagens e comunicações relacionadas ao site e artigos. |
| 20 | `/membros/automacoes` | Preparar comunicações | Conteúdos e materiais | Divulgação & Contatos | Automações | Preparação de comunicações nos canais realmente suportados. |
| 21 | `/membros/blog` | Artigos e blog | Minha operação | Conteúdos & Materiais | Blog | Publicações editoriais e artigos da Página Lucrativa. |
| 22 | `/membros/artigos` | Artigos e marketing | Conteúdos e materiais | Conteúdos & Materiais | Artigos | Conteúdos editoriais de marketing e execução. |
| 23 | `/membros/materiais` | Biblioteca de recursos | Conteúdos e materiais | Conteúdos & Materiais | Materiais e downloads | Materiais publicados para consulta e uso orientado. |
| 24 | `/membros/bonus` | Bônus | Conteúdos e materiais | Conteúdos & Materiais | Bônus e materiais extras | Recursos adicionais publicados para os membros. |
| 25 | `/membros/classificados` | Vitrine | Minha operação | Conteúdos & Materiais | Classificados | Publicações e oportunidades liberadas pela plataforma. |
| 26 | `/membros/academia` | Academia | Minha operação | Academia | Academia | Porta de entrada para cursos e aprendizagem de execução. |
| 27 | `/membros/ebooks` | E-books | Conteúdos e materiais | Academia | Biblioteca de e-books | Biblioteca de leitura e materiais educacionais. |
| 28 | `/membros/pontos` | Ausente do catálogo | — | Desempenho | Meu desempenho | Visão pessoal de pontos, evolução e indicadores do membro. |
| 29 | `/membros/pontos-niveis` | Critérios de pontos | Academia | Desempenho | Pontos e níveis | Critérios e níveis da evolução do membro. |
| 30 | `/membros/ranking` | Pontos e níveis | Conteúdos e materiais | Desempenho | Ranking de pontos | Classificação baseada em pontos, quando disponível. |
| 31 | `/membros/mais-lucrativos` | Desempenho comparativo (em revisão) | Academia | Desempenho | Ranking de resultados | Classificação de resultados somente quando os dados estiverem disponíveis e adequados. |
| 32 | `/membros/cartao-certificado` | Certificados e cartão | Conteúdos e materiais | Desempenho | Certificados | Certificados e reconhecimento vinculados ao progresso. |
| 33 | `/membros/perguntas-frequentes` | Ajuda e dúvidas | Minha operação | Ajuda | Perguntas frequentes | Respostas oficiais para dúvidas comuns. |
| 34 | `/membros/fale-conosco` | Suporte | Minha conta | Ajuda | Fale conosco | Solicitações e contato com o suporte. |
| 35 | `/membros/fazer-depoimento` | Meu relato | Minha conta | Ajuda | Enviar depoimento | Contribuição voluntária do membro, apresentada no final do grupo. |

## Destinos preservados fora da navegação global

As seguintes rotas continuam válidas e acessíveis por links contextuais, pela Academia ou por compatibilidade histórica, mas não aparecem como itens de primeiro nível no menu global:

| Rota | Tratamento |
|---|---|
| `/membros/curso-google-ads` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-facebook-ads` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-posts-facebook` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-canva` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-negocio` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-autonomo` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-recepcionista` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-ebook` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-importacao` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-excel` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-tiktok-ads` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-captura` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-logotipo` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-capas-videos` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-capas-3d` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/curso-dominio-estrategico` | Permanece registrada; cursos devem ser escolhidos na Academia. |
| `/membros/filmes` | Permanece registrada como conteúdo complementar da Academia. |
| `/membros/curso/:courseKey` | Permanece como rota contextual para cursos publicados. |

## Regras de interação

No desktop, os oito grupos serão apresentados como grupos expansíveis, com o grupo da rota atual aberto e os demais fechados por padrão quando houver estado inicial controlável. No mobile, o mesmo catálogo será usado dentro do drawer, com a categoria expandida para a rota atual. O estado ativo será calculado pela rota exata, sem alterar o path.
