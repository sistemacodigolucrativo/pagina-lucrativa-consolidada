# Mapa Funcional Item a Item — Escritório e Administração

## Premissas de acesso

| Papel | Escopo |
| --- | --- |
| Membro | Lê e altera somente os próprios dados, conteúdos, campanhas, contatos, solicitações e progresso. |
| Administrador | Mantém conteúdos globais, regras, estados de publicação e lançamentos; pode revisar dados operacionais sem se passar pelo membro. |
| Visitante | Acessa apenas landing e formulário público; não vê dados de operação. |

> A conta autorizada disponível é de membro. Não foi fornecida uma credencial separada de administração da referência, e a sessão observada não expõe rota administrativa oficial. A auditoria administrativa foi, portanto, fechada pela comparação entre as responsabilidades funcionais observadas no escritório e as rotas administrativas já existentes no projeto. A nova administração será mais explícita: cada domínio abaixo terá uma fonte de dados e um procedimento de manutenção próprios.

## Escritório

| Rota atual | Função de membro que será implantada | Fonte de dados | Manutenção administrativa |
| --- | --- | --- | --- |
| `/membros` | Indicadores próprios, atalhos e avisos publicados | perfil, campanhas, contatos, transações, avisos | avisos, regras de indicador |
| `/membros/mensagem-especial` | Ler aviso ou instrução operacional direcionada | avisos operacionais | criar, publicar, arquivar e priorizar aviso |
| `/membros/fazer-depoimento` | Enviar feedback privado para moderação; sem publicação automática | feedback | revisar, responder, arquivar ou aprovar texto autorizado |
| `/membros/configuracoes` | Atualizar bio, canais e preferências | perfil, preferências | moderar estado da conta e campos permitidos |
| `/membros/meus-dados` | Atualizar dados de contato e consentimentos | perfil, preferências, consentimentos | visualizar somente quando necessário ao suporte |
| `/membros/como-divulgar` | Ler guias, copiar campanhas e consultar boas práticas | artigos e modelos de campanha publicados | criar, editar, ordenar e publicar guias/modelos |

## Captação, convites e comunicação consentida

| Rota atual | Função de membro que será implantada | Fonte de dados | Manutenção administrativa |
| --- | --- | --- | --- |
| `/membros/emails-site` | Registrar contato originado de página ou artigo próprio | contatos, origem da captação | revisar regras de origem e exportação autorizada |
| `/membros/emails-interessados` | Gerir contatos que demonstraram interesse, com estágio e anotações | contatos, estágios, notas | configurar estágios e políticas de retenção |
| `/membros/emails-whatsapp` | Registrar contato captado por canal de WhatsApp, com consentimento | contatos, consentimentos, origem | revisar consentimento e políticas do canal |
| `/membros/convites` | Criar convite individual, registrar consentimento e status; disparo depende de integração | convites, logs, contatos | gerir modelos, limites e logs; ativar integração apenas com credenciais próprias |

## Gestão financeira, relacionamento e tráfego

| Rota atual | Função de membro que será implantada | Fonte de dados | Manutenção administrativa |
| --- | --- | --- | --- |
| `/membros/ganhos` | Consultar extrato, saldo e lançamentos próprios | transações | incluir ajuste/lancamento com justificativa e auditoria |
| `/membros/patrocinador` | Consultar o vínculo de patrocínio autorizado | relacionamentos | atribuir, corrigir ou encerrar vínculo |
| `/membros/rede` | Consultar apenas indicações convertidas ligadas ao próprio membro | relacionamentos, convites | moderar vínculo e visibilidade |
| `/membros/historico` | Consultar visitas e eventos das próprias campanhas | eventos de campanha | definir retenção e métricas permitidas |
| `/membros/top-visitas` | Ver a própria posição ou métrica agregada, quando habilitada | métricas agregadas | habilitar, desabilitar e definir critério sem dados de terceiros |
| `/membros/campanhas` | Criar, editar, arquivar e copiar links rastreáveis | campanhas, eventos, conversões | gerir destinos permitidos e parâmetros de rastreio |

## Catálogo, publicações e suporte

| Rota atual | Função de membro que será implantada | Fonte de dados | Manutenção administrativa |
| --- | --- | --- | --- |
| `/membros/produtos` | Criar, editar e submeter produto próprio para publicação | produtos | aprovar, recusar, publicar, arquivar e categorizar |
| `/membros/blog` | Ler artigos publicados e submeter proposta de conteúdo, quando habilitada | artigos, propostas | criar, editar, publicar, ordenar e arquivar artigos |
| `/membros/classificados` | Criar anúncio próprio sujeito a revisão | classificados | aprovar, publicar, expirar e arquivar anúncios |
| `/membros/perguntas-frequentes` | Pesquisar FAQ e abrir ticket quando não houver resposta | FAQ, tickets | gerir perguntas, respostas, categorias e status do ticket |

## Biblioteca, formação e materiais

| Rota atual | Função de membro que será implantada | Fonte de dados | Manutenção administrativa |
| --- | --- | --- | --- |
| `/membros/academia` | Listar cursos publicados e continuar estudos | cursos, progresso | criar, editar, publicar, ordenar e arquivar cursos |
| `/membros/materiais` | Consultar materiais liberados por categoria | materiais | cadastrar, editar, publicar e retirar materiais |
| `/membros/bonus` | Consultar materiais adicionais liberados | materiais, regras de acesso | definir elegibilidade e publicação |
| `/membros/artigos` | Ler biblioteca de artigos de marketing publicados | artigos | curar, editar, publicar e categorizar |
| `/membros/cartao-certificado` | Consultar cartão ou certificado próprio elegível | certificados, progresso | configurar modelos e emitir/revogar certificado |
| `/membros/pontos-niveis` | Consultar saldo próprio, eventos e regras de nível | eventos de ponto, regras | criar regras e ajustes rastreáveis |
| `/membros/ranking` | Consultar próprio progresso; ranking coletivo é opcional e agregado | pontos próprios, métricas agregadas | definir critérios e opt-in; sem listas de terceiros por padrão |
| `/membros/mais-lucrativos` | Consultar própria evolução; comparativo público somente agregado | métricas agregadas | habilitar política de visibilidade |
| `/membros/filmes` | Acessar vídeos motivacionais publicados | materiais de vídeo | manter catálogo, ordem e publicação |

## Cursos individuais

Cada rota abaixo será uma visualização parametrizada da mesma entidade `course`, com capítulo, progresso individual e conteúdo publicado. A administração manterá título, resumo, nível, capítulos, ordem e publicação.

| Rota atual | Identificador editorial |
| --- | --- |
| `/membros/curso-google-ads` | `google-ads` |
| `/membros/curso-facebook-ads` | `facebook-ads` |
| `/membros/curso-posts-facebook` | `posts-facebook` |
| `/membros/curso-canva` | `canva` |
| `/membros/curso-negocio` | `negocio-digital` |
| `/membros/curso-autonomo` | `autonomo-digital` |
| `/membros/curso-recepcionista` | `recepcionista` |
| `/membros/curso-ebook` | `crie-ebook` |
| `/membros/curso-importacao` | `importacao` |
| `/membros/curso-excel` | `mestre-excel` |
| `/membros/curso-tiktok-ads` | `tiktok-ads` |
| `/membros/curso-captura` | `pagina-captura` |
| `/membros/curso-logotipo` | `criacao-logotipo` |
| `/membros/curso-capas-videos` | `capas-videos` |

## Recursos agrupados e uso futuro

| Rota atual | Implementação responsável |
| --- | --- |
| `/membros/automacoes` | Central de instruções, integrações habilitadas e consentimentos; não haverá automação fictícia ou disparo sem conector. |
| `/membros/fazer-depoimento` | Feedback privado e moderável, em substituição a depoimento público sem consentimento. |
| `/membros/ranking`, `/membros/top-visitas`, `/membros/mais-lucrativos` | Painéis individuais e agregados, preservando privacidade e evitando reprodução de listas de pessoas da referência. |

## Painel administrativo do projeto

| Rota de administração | Manutenção que será exposta |
| --- | --- |
| `/admin` | indicadores de operação, fila de pendências e atalhos por domínio |
| `/admin/membros` | membros, perfis, permissões, patrocínio, pontos, indicações e tickets |
| `/admin/pedidos` | solicitações públicas, produtos submetidos, anúncios, feedback e convites a revisar |
| `/admin/catalogo` | materiais, artigos, FAQ, avisos, bônus e e-books |
| `/admin/academia` | cursos, capítulos, publicação, progresso e certificados |
| `/admin/operacao` *(rota prevista)* | campanhas, contatos consentidos, regras de dados, eventos e lançamentos financeiros |

O menu administrativo atual expõe `/admin`, `/admin/membros`, `/admin/pedidos`, `/admin/catalogo` e `/admin/academia`. A rota `/admin/operacao` é uma expansão prevista para centralizar dados operacionais e deverá ser adicionada ao menu e ao roteamento durante a implementação. Este mapa cobre todas as rotas exportadas em `shared/memberOfficeContent.ts` e será usado como critério de aceite das telas, procedimentos, regras de acesso e testes automatizados.
