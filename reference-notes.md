# Mapa funcional da referência — Página pública

## Página principal

A referência usa uma estrutura de **três colunas** em desktop: uma faixa lateral de atividade recente, um conteúdo central focado na proposta comercial e uma lateral de suporte via WhatsApp. A navegação principal reúne as entradas equivalentes a início, depoimentos, personalização e escritório virtual.

O centro da página combina a identificação do empreendedor responsável, uma mensagem de oportunidade, prova social de base de usuários, blocos educativos, CTAs repetidos e vídeos incorporados. O fluxo comercial culmina em um formulário de pedido, com campos básicos de contato e uma etapa de confirmação. Há também elementos de suporte direto e uma área de feed com registros recentes.

## Decisões para a nova implementação

A nova Página Lucrativa 2026 preservará sua identidade **carvão, marfim e dourado**, sem reproduzir a estética, imagens, textos ou dados de pessoas da referência. A semelhança será funcional: dashboard com atividade, navegação de produto, proposta comercial, jornada de aquisição, páginas de conteúdo e suporte contextual.

## Entrada da área autenticada

A rota de membros redireciona para uma tela de login de "Escritório Virtual". O fluxo inclui campos de e-mail e senha, recuperação de acesso por e-mail, navegação pública persistente e um vídeo explicativo. A nova versão deverá oferecer uma entrada de membros com recuperação de acesso e redirecionamento protegido para o dashboard, mas usando a identidade visual própria da Página Lucrativa 2026.

O primeiro envio das credenciais redirecionou para a rota do painel, mas a página não renderizou no navegador automatizado. A navegação será retomada diretamente pela rota autenticada para confirmar se a sessão foi criada e, caso necessário, o fluxo será mapeado por rotas públicas complementares.

A inspeção do formulário mostrou que o botão de acesso executa o envio de um formulário chamado `flogin` por JavaScript e a página carrega bibliotecas de reCAPTCHA. Isso explica a necessidade de verificar se há uma etapa silenciosa de validação antes de concluir a autenticação. A arquitetura nova deve usar autenticação com mensagens claras de erro e estados de carregamento, em vez de depender de redirecionamento opaco no navegador.

O formulário autentica por `POST` para `logar.php` e, na sessão autorizada, o endpoint respondeu com redirecionamento para a página inicial dos usuários. Isso confirma que a área de membros possui um fluxo de sessão convencional e poderá ser mapeada pela rota autenticada após a criação do cookie de sessão.

## Módulos observados no painel de membros

A página inicial autenticada expõe uma navegação extensa que pode ser agrupada em: **conta** (perfil, dados, patrocinador, senha), **operação comercial** (links de divulgação, e-mails capturados, extrato de ganhos, indicados, histórico de visitas e vendas), **conteúdo e crescimento** (cursos, artigos, blog, downloads, materiais de marketing e ferramentas de encurtamento), **comunidade e suporte** (depoimentos, classificados, convite de amigos, FAQ e suporte) e **progresso** (pontos, níveis, rankings, cartão e certificado). Também há fluxo de doação e uma oferta de assinatura VIP.

A versão nova deve reorganizar essa quantidade de entradas em uma sidebar por grupos, uma visão geral com métricas e próximos passos, uma central de treinamento e páginas próprias para aquisição, rede de indicação, materiais e configurações. Os dados reais da conta de referência não serão copiados para a nova interface.

## Conteúdo da página inicial autenticada

O dashboard de referência apresenta, em uma única página, um resumo de perfil e plano, indicadores operacionais, links de divulgação em múltiplos domínios, explicação das fontes de receita, atalhos para venda de produtos e cursos, convite por e-mail, orientação de divulgação em redes sociais, comunidade via WhatsApp, geração de materiais em vídeo e ranking mensal de visitas. 

Para a nova Página Lucrativa 2026, esses recursos serão traduzidos em blocos independentes: **Visão geral**, **Links & campanhas**, **Ganhos**, **Produtos**, **Academia**, **Rede & convites**, **Materiais de divulgação**, **Comunidade**, **Ranking** e **Configurações**. Métricas e nomes serão apresentados apenas como dados demonstrativos claramente identificados, nunca como registros da conta ou da comunidade de referência.

## Detalhes de perfil e agrupamento de navegação

A página de perfil confirma uma barra lateral por seções — início, captação, ferramentas administrativas, complemento e área de estudo — acompanhada de indicadores resumidos no topo. O perfil permite imagem, uma descrição profissional, WhatsApp e endereço de website, com esses dados refletidos em uma presença pública do membro.

A nova versão terá um perfil em **Configurações**, com foto, biografia, contato e link público, e exibirá os indicadores em cards de leitura rápida na visão geral. A navegação lateral repetirá a organização por grupos, porém reduzindo a fragmentação em páginas e consolidando as tarefas de cada objetivo em hubs funcionais.

## Ganhos e catálogo

O extrato de referência usa uma tabela simples com descrição, data e valor, seguida de total consolidado. A nova tela de **Ganhos** deverá transformar esse padrão em saldo disponível, receita do período, gráfico de evolução, filtros e tabela de transações, preservando a transparência do registro financeiro.

A área comercial traz um catálogo de produtos digitais com categorias, preço e ação para promovê-los, além de entradas para cadastro de produto, descrição, prospecção, recebimento e ativação de compradores. Na nova plataforma, esse conjunto será organizado no hub **Produtos**, com catálogo, vitrine do membro, links de promoção e configurações de recebimento. Nenhum produto, preço, nome ou material da referência será copiado.
