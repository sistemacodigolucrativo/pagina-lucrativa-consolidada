# Auditoria comparativa — Página Lucrativa 2026

## Referência pública — coleta inicial

- URL observada: `https://www.paginalucrativa.com.br/`.
- Navegação observada: **Início**, **Depoimentos**, **Personalizar** e **Escritório Virtual**.
- A hero informa a oportunidade de ter uma página online, receber pagamentos de R$50 diretamente e manter 100% do lucro; o CTA recorrente é **Faça parte**.
- A página pública apresenta uma extensa sequência editorial sobre trabalho digital, oportunidade, autonomia, escritório virtual, pagamentos diretos, renda pela internet e recuperação do investimento na primeira venda.
- Há formulário de pedido, vídeos incorporados e um rodapé próprio da referência.

## Depoimentos e dados de terceiros

- A referência exibe imagens/gifs de depoimentos, vídeos com usuários e uma relação de “Últimos cadastrados” contendo nomes de pessoas. A seção pública de depoimentos inclui três incorporações de vídeo da própria marca, uma para apresentação do empreendedor digital, outra sobre a ideia/proposta e outra com usuários.
- Esses itens são conteúdo gerado por terceiros ou dados pessoais. A equivalência a ser implementada deve limitar-se à **estrutura visual e à posição do bloco**, salvo se o usuário fornecer material próprio e autorização expressa para cada depoimento/foto.
- Não serão criados, inventados ou incluídos nomes, avaliações, retratos, listagens de cadastrados ou depoimentos atribuídos a clientes.

Em particular, a Página Lucrativa 2026 já pode manter um bloco de vídeos da marca em posição equivalente. As imagens animadas de supostos pagamentos e os relatos pessoais devem permanecer ausentes até que sejam fornecidos arquivos próprios autorizados, pois copiá-los ou recriá-los transformaria conteúdo de terceiros em prova social da nova página.

## Verificação da versão publicada

O endereço de prévia `http://18.119.174.102:3101/` respondeu com o título esperado e expôs a copy completa no DOM, mas a renderização observada no navegador permaneceu vazia sobre fundo escuro. A inspeção de console não retornou exceções; portanto, isso não deve ser interpretado como divergência de conteúdo até a investigação específica de CSS e do carregamento visual externo.

A inspeção de layout mostrou que a landing `sales-page reference-page` está renderizada com cerca de 12 mil pixels de altura. O primeiro filho do `#root` é uma seção vazia, sem altura, deixada pelo contêiner de desenvolvimento; esse artefato não contém o conteúdo da landing. Após a estabilização do carregamento, a captura externa exibiu corretamente o cabeçalho, a hero, a imagem e os CTAs da landing.

Para a validação de perfis, foi incluída a rota `/acesso`, com formulário visualmente integrado à identidade editorial. As credenciais não são exibidas na tela e a sessão de demonstração tem duração limitada; isso permite testar os dois escritórios sem copiar a autenticação ou os dados privados da referência.

O perfil administrativo de demonstração foi validado no navegador. Após a autenticação, a rota `/admin` exibiu o escritório de Administração, a navegação de gestão e conteúdo, o nome do perfil de demonstração e os estados vazios legítimos de pedidos e cursos.

A sessão administrativa permaneceu ativa durante a inspeção do painel. Para testar o membro comum de forma isolada, a sessão será substituída diretamente por uma nova autenticação na rota de acesso local.

O perfil de membro de demonstração também foi autenticado com sucesso e direcionado para `/membros`. A página expôs o escritório virtual, o aviso operacional, os indicadores vazios legítimos e a sequência de módulos de divulgação, captação e estudo. A primeira captura mostrou o skeleton de carregamento enquanto as consultas eram resolvidas; o conteúdo textual retornado confirma que a sessão e a rota foram aplicadas corretamente.

O isolamento de privilégios foi verificado: com a sessão de membro comum ativa, a rota `/admin` permaneceu acessível apenas até a moldura visual e exibiu o aviso de área exclusiva, sem retornar os dados operacionais administrativos.

O modo de demonstração passou a usar o cookie `pl_demo_session`, separado da sessão Manus. A suíte automatizada valida a prioridade da sessão local, o fallback para Manus, o `authSource` e o logout seletivo. A validação com uma sessão Manus real permanece dependente de uma sessão ativa do proprietário no navegador, pois não há credenciais Manus armazenadas ou solicitadas para este projeto.

Na prévia do workspace, a sessão de membro de demonstração permaneceu ativa e o menu de perfil expõe a ação de saída. A validação navegável confirmou a tela do membro; a confirmação com uma sessão Manus real não foi iniciada para não requisitar credenciais externas adicionais.

A entrada pública de demonstração foi confirmada em `http://18.119.174.102:3101/acesso`. A tela descreve o uso de verificação, informa que a sessão é temporária e não usa o login Manus, e apresenta campos de usuário e senha para os dois perfis locais.

## Próxima coleta

- A área de membros redirecionou para a tela de login, com campos de e-mail e senha, recuperação de acesso, vídeo orientativo e rodapé.
- O acesso foi aceito e retornou um menu autenticado com módulos de perfil, assinatura, página inicial, mensagem especial, depoimento, dados, doação, divulgação, e-mails, extrato e ganhos, patrocinador, indicados, produtos, blog, classificados, histórico, cursos, perguntas frequentes, convites, downloads, cartão/certificado, rankings, cursos e suporte.
- O inventário não registrou ou copiará e-mails, identificadores de indicação, valores pessoais, dados de patrocinador, contatos de interesse ou outros dados privados exibidos pela conta.

## Área de membros — página inicial autenticada

O painel de referência possui um cabeçalho de área pessoal, indicadores resumidos e uma barra lateral agrupada por finalidade. Os indicadores representam visitas do mês, pontos promocionais, clientes, clientes VIP, prospectos e ganhos totais; a implementação não deve copiar os números da conta de referência.

A navegação começa com perfil, plano/assinatura, página inicial, mensagem especial, depoimento, perfil e dados. Em seguida, agrupa ações em **Comece por aqui**, **Seus e-mails no sistema**, **Ferramentas administrativas**, **Complemento** e **Área de estudo**. Os grupos incluem divulgação, e-mails, extrato, patrocinador, indicados, produtos, blog, classificados, histórico, cursos, perguntas frequentes, convites, downloads, certificado, rankings, artigos, automação de mensagens, encurtador e trilhas de cursos.

Na área principal, a referência apresenta um aviso de manutenção de atividade, uma saudação ao membro, links de divulgação e blocos de ação relacionados a captação, ganhos e formação. A cópia visualmente equivalente pode ser construída sem expor o nome, os links de indicação, e-mails, contagens ou valores reais vistos na sessão.

## Área de membros — alcance implementado

| Grupo ou módulo | Estado da implementação | Tratamento de dados |
|---|---|---|
| Página inicial, campanha, ganhos, produtos, cursos e perfil | Painéis com hierarquia, cards, aviso de atividade, listagens, estados de carregamento, falha e vazio. | Apenas dados da conta autenticada no novo sistema. |
| Comece por aqui, e-mails, patrocinador, rede, blog, classificados, histórico, FAQ, convites, materiais, certificados, artigos, automações, rankings e bônus | Navegação e telas orientativas com a finalidade observada na referência. | Não são importados contatos, ganhos, nomes, rankings ou dados da conta auditada. |
| Trilhas de cursos | A navegação reproduz as categorias visíveis; cada rota é preparada para conteúdo autorizado. | Cursos, vídeos e arquivos dependem de publicação própria pela administração. |
| Depoimentos, últimos cadastrados e comprovantes visuais | Deliberadamente não reproduzidos como conteúdo. | Não serão copiados, simulados ou atribuídos a clientes; somente material próprio autorizado poderá ser publicado. |
