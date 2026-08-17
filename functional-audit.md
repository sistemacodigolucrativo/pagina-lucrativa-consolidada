# Auditoria Funcional dos Painéis

## Escopo e método

Esta auditoria foi realizada com a conta de membro autorizada fornecida pelo proprietário, nas páginas inicial e de divulgação, junto ao inventário de rotas do escritório oficial. O registro omite credenciais, identificadores, valores, nomes, imagens, rankings e qualquer outro dado de pessoas da referência. A sessão da referência expira durante a troca entre algumas rotas, portanto a matriz abaixo consolida funções confirmadas diretamente e o propósito explícito das rotas autenticadas.

## Diagnóstico do projeto atual

O projeto já possui layout, navegação e consultas de leitura para indicadores, campanhas, produtos, extrato e cursos. Contudo, a maior parte dos destinos do menu ainda é apenas uma orientação visual. O painel administrativo também apresenta apenas indicadores e pedidos recentes; os itens de catálogo e academia não possuem telas nem procedimentos de manutenção.

> **Decisão de produto:** cada item do menu será convertido em uma ação persistente ou agrupado em um domínio funcional equivalente. Itens de classificação pública, depoimentos e dados de terceiros não serão copiados; quando necessário, serão substituídos por dados do próprio membro ou métricas agregadas controladas pela administração.

## Matriz de funcionalidades reais

| Domínio | Itens do escritório de referência | Função do membro | Manutenção administrativa | Dados persistidos |
| --- | --- | --- | --- | --- |
| Perfil e acesso | Editar perfil, meus dados, mensagem especial | Atualizar apresentação, canais e preferências de contato; consultar instruções de acesso | Gerir permissões, estado do membro e mensagens operacionais | perfil, preferências, avisos |
| Divulgação | Saiba como divulgar, links, encurtador, histórico, top visitas | Criar campanhas, copiar links, registrar origens e consultar métricas próprias | Publicar modelos de campanha, destinos permitidos e parâmetros de medição | campanhas, visitas, conversões |
| Captação consentida | E-mails de artigos, interessados, WhatsApp, convidar amigos | Cadastrar contatos com origem, consentimento e status; enviar convite somente por ação explícita; acompanhar histórico | Consultar captações, ajustar regras, gerir mensagens-modelo e exportação autorizada | contatos, consentimentos, convites, logs |
| Catálogo e vitrine | Venda seus produtos, blog, classificados | Criar e administrar os próprios rascunhos, produtos e anúncios; consultar conteúdos publicados | Aprovar/publicar/arquivar itens e gerir blog, categorias e políticas | produtos, anúncios, artigos, categorias |
| Rede e relacionamento | Meu patrocinador, meus indicados | Consultar vínculos autorizados e seus convites convertidos | Atribuir vínculos e moderar estados sem expor a rede completa de terceiros | relacionamentos, indicações |
| Financeiro operacional | Extrato e total de ganhos | Consultar somente o próprio extrato e saldo calculado | Criar lançamentos, ajustes e status de pagamento auditáveis | transações, lançamentos, auditoria |
| Academia e biblioteca | Cursos, área de estudo, baixar produtos, bônus, artigos, filmes | Estudar conteúdos publicados, marcar progresso e abrir materiais liberados | Criar, editar, publicar, ordenar ou despublicar cursos, capítulos, materiais e artigos | cursos, progresso, materiais, publicações |
| E-books e certificados | Curso crie um e-book, cartão e certificado | Ler e-books HTML liberados e consultar certificados próprios | Importar, editar, publicar ou retirar e-books; emitir e gerir modelos de certificado | e-books, edições, certificados |
| Suporte e feedback | Perguntas frequentes, fale conosco, ideia, depoimento | Ler FAQ, abrir solicitação e enviar feedback próprio sujeito a moderação | Criar FAQ, responder/encerrar solicitações e moderar relatos sem publicá-los automaticamente | FAQ, tickets, feedback |
| Pontos e evolução | Pontos e níveis, usuários com pontos, mais lucrativos | Consultar a própria pontuação e regras de nível | Definir regras, conceder ajustes e decidir se métricas agregadas serão exibidas | regras de pontos, eventos, saldos |
| Automação | Robô WhatsApp e Facebook | Consultar orientações e configurar somente integrações próprias quando habilitadas | Publicar instruções e controlar habilitação; nenhuma mensagem automática será criada sem conector e consentimento | configurações, registros de consentimento |

## Fluxos confirmados

1. **Campanhas e links:** a página inicial e a orientação de divulgação apresentam destinos próprios de divulgação e a necessidade de mensurar canais. A reconstrução terá criação, edição, cópia, arquivamento, totalização de cliques e associação de leads próprios.
2. **Convites e captação:** a referência apresenta convites em lote e áreas distintas de contatos. A reconstrução não importará contatos; oferecerá cadastro de contato, origem, consentimento, status e registro do convite. O disparo por e-mail, WhatsApp ou rede social depende de integração específica e não será simulado.
3. **Indicadores individuais:** a referência apresenta visitas, pontos, clientes, prospectos e saldo. A reconstrução mostrará indicadores exclusivamente calculados de registros próprios e lançamentos administrativos rastreáveis.
4. **Conteúdo e estudo:** as rotas de blog, cursos, artigos, downloads, bônus e materiais convergem para uma biblioteca editorial. A administração será a fonte de publicação; o membro terá leitura, busca e progresso.
5. **Operação administrativa:** os atuais itens de administração serão substituídos por listas, filtros, formulários, publicação, mudança de status e ações de arquivamento, com procedimentos protegidos por papel.

## Prioridade de implementação

| Entrega | Resultado verificável |
| --- | --- |
| Base administrativa de conteúdo | Administrador cria e publica cursos, materiais, FAQ, artigos e e-books; membro vê apenas o que foi publicado. |
| Campanhas e captação | Membro cria campanha e registra um contato consentido; administrador consegue revisar os registros. |
| Catálogo e extrato | Membro gerencia seu produto; administrador aprova itens e registra transação que aparece no extrato individual. |
| Suporte e perfil | Membro atualiza o perfil e abre solicitação; administrador gerencia a solicitação. |
| Progresso e certificados | Membro conclui etapas e a administração acompanha o estado para futura emissão de certificado. |

## Limites de segurança e privacidade

Não serão reproduzidos depoimentos, fotos, rankings, cadastros recentes, lista de indicados, resultados financeiros, documentos, telefones ou qualquer outro dado de terceiro da referência. Qualquer automação de mensagens exigirá credenciais próprias, consentimento explícito, conteúdo revisável e uma integração habilitada pelo proprietário.
