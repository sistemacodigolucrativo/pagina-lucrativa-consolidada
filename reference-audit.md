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

## Inventário autorizado de ferramentas e conteúdos — 17/08/2026

**Fonte autenticada:** `https://www.paginalucrativa.com.br/usuarios.php?p=pagina-inicial&t=pagina`.

O Escritório Virtual de referência expõe grupos funcionais de perfil e assinatura; mensagens e senha especial; configuração de dados; orientação de divulgação; e-mails e convites; extrato e ganhos; patrocinador e indicados; venda de produtos; blog, classificados e histórico; cursos, FAQ e convites; downloads de produtos, cartão/certificado e rankings; artigos e automações de marketing; área de estudo; cursos especializados; encurtador de URL; bônus de armazenamento e saída.

A tela inicial também reúne indicadores pessoais, links de divulgação, orientações de ganho, convite por e-mail, canais de contato, vídeos e ranking. Esses dados específicos não serão copiados; somente os modelos de navegação, ferramentas e conteúdos que o titular autorizou serão reconstruídos.

O inventário individual de e-books e seus arquivos será coletado a seguir por meio das rotas autenticadas de produtos e downloads. O usuário confirmou titularidade em 17/08/2026, autorizando a conversão integral das obras em HTML editável.

### Downloads autorizados

A seção `baixar-produtos` lista **60 itens**, distribuídos entre os identificadores `arquivo_id=1` e `arquivo_id=60` da rota autenticada `download.php`. Os títulos incluem materiais de anúncios, negócios online, programas de afiliados, produtos digitais, renda automática, e-commerce, palavras-chave, marketing de rede, finanças, importação, SEO, leitura, páginas de captura, vídeos, tráfego, negociação e vendas.

Os arquivos são disponibilizados como PDF ou em pacotes ZIP/RAR. A extração será feita com sessão temporária autorizada, limitada a esses materiais e sem coletar quaisquer dados de perfil, doadores, indicadores ou contatos da referência.

O primeiro arquivo, `arquivo_id=1`, respondeu pela sessão autenticada com `200`, download forçado e aproximadamente 520 KB, confirmando que a coleta precisa usar a sessão web autorizada. O primeiro download foi solicitado apenas para validar esse fluxo; não houve execução do arquivo.

Os identificadores `2` a `20` foram solicitados sequencialmente pela mesma sessão autenticada. A coleta segue por lotes e cada arquivo será tratado somente como conteúdo de entrada para extração e conversão em HTML; pacotes ZIP/RAR não serão executados.

Os lotes restantes, `arquivo_id=21` a `60`, também foram solicitados pela sessão autenticada. O inventário de downloads autorizados está completo e a próxima etapa é somente extrair textos e estruturas de documentos, sem executar quaisquer arquivos, scripts ou binários encontrados nos pacotes.

O menu autenticado de referência expõe, entre outras, as ferramentas de divulgação, mensagens de senha especial, depoimento, edição de perfil, dados pessoais, doação, e-mails por origem, extrato e ganhos, patrocinador, indicados, venda de produtos, blog, classificados, histórico, cursos, perguntas frequentes, convites, downloads, cartão/certificado, ranking, artigos, robô de mensagens, encurtador e área de estudo. O catálogo autorizado contém 60 downloads: 47 documentos PDF diretos ou internos, documentos Word/RTF, páginas HTML/TXT de apoio e alguns pacotes de software. Os itens de software e scripts serão mantidos fora do leitor de e-books e não serão executados.

## Auditoria funcional aprofundada — coleta em andamento

Na página inicial autenticada, a área oficial expõe ações diretamente acionáveis para perfil, assinatura, mensagem especial, depoimento, dados, doação, divulgação, captura de contatos, extratos, patrocinador, indicados, produtos, blog, classificados, histórico, convites, downloads, certificado, rankings, cursos, artigos, automação de mensagens, encurtador, bônus e suporte. A coleta subsequente examinará o propósito e as entradas ou saídas de cada fluxo, sem registrar nomes, links pessoais, contatos, saldos ou outros dados da conta autorizada.

O navegador forneceu o conjunto de rótulos e controles da página autenticada, mas a extração de `href` no contexto de console retornou uma coleção vazia. Assim, os próximos fluxos serão auditados pelos próprios elementos visíveis e pelas telas de destino, preservando o princípio de minimização de dados.

Após novo login autorizado, a página inicial confirmou que o painel combina: indicadores individuais; aviso de atividade periódica; links pessoais de divulgação; uma explicação dos caminhos de receita; convite por e-mail com múltiplos campos; envio de ideia ou contato; canais de suporte; pedido de inclusão em grupo; conteúdo em vídeo; e ranking público. Para a nova aplicação, indicadores, ranking, lista de contatos, identificadores de indicação, valores, nome, telefone e dados de pagamento observados na conta **não** serão importados. As funções candidatas a reconstrução são o cadastro e a manutenção de links próprios, campanhas de convite com consentimento, registro de solicitações de suporte, materiais publicados, cursos, produtos e acompanhamento administrativo.

A nova captura da página inicial confirmou, além dos grupos de navegação já inventariados, que o fluxo de entrada é operacional: o membro é conduzido por aviso de atividade, conteúdo introdutório, links próprios, convite de contatos, suporte e materiais. A reconstrução deverá preservar as funções úteis — campanhas, captação com consentimento, catálogos, cursos, solicitações e acompanhamento — substituindo rankings, dados financeiros, listagens de pessoas e referências pessoais por dados reais exclusivamente inseridos e mantidos no novo painel administrativo.

A rota de orientação de divulgação expõe os links próprios de divulgação, materiais orientativos e destinos externos de canais digitais. Ela reforça a necessidade de um módulo de **campanhas e links** no novo painel, permitindo ao administrador publicar os materiais e ao membro consultar, copiar e acompanhar seus próprios links sem importar endereços da conta auditada. A sessão de referência expira ao alternar para algumas rotas; essa limitação será tratada com novo login autorizado e não impede o mapeamento de propósito dos módulos.

A sessão renovada confirmou que a expiração decorre da navegação entre módulos, não de falha de credencial. O roteiro de auditoria passa a renovar a sessão antes de cada tela individual, registrando apenas os campos, ações e regras necessários para o desenho funcional do novo sistema.

Na página inicial, foram confirmados ainda três fluxos operacionais que devem ser reconstruídos com controles próprios: painel de indicadores da atividade individual; gestão de links de divulgação em múltiplos destinos; e convite de contatos em lote. A nova versão deve oferecer esses recursos com dados da própria operação, registro de consentimento para convites, logs de envio e sem reproduzir listas, valores, identificadores ou informações de terceiros observadas na referência.
