# Substituição do repositório — Página Lucrativa

- [x] Inspecionar o branch padrão e o conteúdo atual do repositório de destino.
- [x] Preparar uma cópia independente e publicável da Página Lucrativa atual.
- [x] Remover o conteúdo rastreado do repositório de destino e inserir a nova página.
- [x] Criar e enviar o commit para o branch padrão do repositório privado.
- [x] Confirmar a atualização remota e reportar o resultado ao usuário.

# Reestruturação pela referência autenticada

- [x] Mapear as seções, navegação e interações da página pública de referência.
- [x] Acessar a conta fornecida e documentar a navegação da área de membros.
- [x] Definir os modelos de dados e a arquitetura dos painéis administrativo e de membros.
- [x] Implementar a nova experiência preservando a linguagem visual da Página Lucrativa 2026.
- [x] Validar desktop e mobile e disponibilizar a prévia navegável no workspace.
- [x] Validar a responsividade mobile da rota administrativa e corrigir eventuais problemas antes da entrega.
- [x] Salvar checkpoint e sincronizar a versão validada no repositório privado.

# Correção de equivalência de conteúdo

- [x] Comparar integralmente o conteúdo da landing original com a prévia atual e listar os blocos ausentes.
- [x] Restaurar os textos, seções e hierarquia editorial equivalentes ao material enviado, sem inventar conteúdo de clientes.
- [x] Corrigir o rodapé e o copyright para a identidade e o ano da Página Lucrativa 2026.
- [x] Validar a prévia atualizada e sincronizar a correção com o repositório privado.

# Fidelidade ao site de referência

- [x] Inventariar a copy, a ordem de seções, os CTAs e os destinos de fluxo atuais de paginalucrativa.com.br.
- [x] Confrontar o inventário com a Página Lucrativa 2026 e definir cada ajuste de equivalência necessário.
- [x] Reproduzir os blocos públicos, o fluxo de aplicação e as transições de área observados na referência.
- [x] Validar em desktop e mobile e sincronizar a versão equivalente com o repositório privado.

# Lacunas de fidelidade identificadas

- [x] Substituir os blocos autorais e os números resumidos por copy e hierarquia estritamente equivalentes à referência pública.
- [x] Incluir explicitamente o ano de 2026 no rodapé, preservando a declaração de copyright da Página Lucrativa.
- [x] Documentar e alinhar os destinos de cada CTA, do formulário ao acesso de personalização e ao Escritório Virtual.

# Atualização do repositório e implantação em VPS

- [x] Localizar o repositório da Página Lucrativa no GitHub e confirmar seu branch principal.
- [x] Sincronizar a versão atual validada da Página Lucrativa 2026 no repositório correto.
- [x] Verificar se há conectividade e credenciais SSH autorizadas para 18.119.174.102.
- [x] Preservar o miniapp na raiz da VPS, conforme solicitação posterior do usuário.
- [x] Confirmar a disponibilidade pública da prévia pela porta dedicada.

# Publicação na VPS 18.119.174.102

- [x] Inspecionar sem alterações as portas, serviços, firewall e a raiz web atual da VPS.
- [x] Informar ao usuário o conflito do miniapp já publicado na raiz do IP.
- [x] Preparar o pacote de implantação após a confirmação do ambiente e a autorização para uma porta dedicada.
- [x] Manter a raiz do IP sem alterações para preservar o miniapp existente.
- [x] Verificar o acesso externo à Página Lucrativa pelo IP com porta dedicada.

# Prévia isolada em porta dedicada

- [x] Confirmar uma porta TCP livre e externamente acessível sem alterar o miniapp da raiz.
- [x] Preparar a Página Lucrativa 2026 para executar como serviço isolado de visualização.
- [x] Publicar o serviço na porta selecionada preservando todos os serviços existentes.
- [x] Confirmar o acesso externo pelo IP com a porta e informar o endereço de prévia ao usuário.
- [x] Registrar a inspeção somente leitura do firewall da VPS: UFW inativo, iptables com política INPUT ACCEPT e nenhum conjunto nftables retornado.

# Auditoria comparativa com as páginas de referência

- [x] Coletar evidências atuais da landing pública, da área de membros de referência e da Página Lucrativa 2026 publicada.
- [x] Comparar contexto, sequência de seções, copy, CTAs e fluxos observáveis entre as versões.
- [x] Verificar especificamente a presença e a equivalência visual das imagens de depoimentos, sem reproduzir material de terceiros sem autorização.
- [x] Apresentar as correspondências, divergências e itens deliberadamente não replicados.

# Alinhamento da landing e do painel de membros à referência

- [x] Acessar a área de membros com as credenciais fornecidas e inventariar as telas, blocos, dados e navegação observáveis.
- [x] Confrontar as imagens e os blocos de depoimentos da landing com a referência e classificar o que pode ser reproduzido ou deve ser substituído por material autorizado.
- [x] Ajustar a landing para refletir as equivalências permitidas de estrutura, copy, CTAs e recursos visuais, preservando apenas apresentações oficiais e sem inserir provas sociais de terceiros.
- [x] Implementar no painel de membros o layout, a navegação e os conteúdos observáveis que possam ser legitimamente reproduzidos.
- [x] Reproduzir os blocos permitidos das telas prioritárias do Escritório Virtual, além da navegação, sem incluir dados privados ou provas sociais de terceiros.
- [x] Tratar explicitamente os estados de carregamento, erro e vazio de campanhas, produtos e cursos para não apresentar ausência de dados como resultado definitivo.
- [x] Registrar no inventário de auditoria os módulos efetivamente reproduzidos e os módulos que permanecem fora por dependerem de dados privados ou conteúdo não autorizado.
- [x] Validar as alterações em desktop e mobile, sincronizar a revisão no repositório e atualizar a prévia isolada na VPS.

# Acessos locais de verificação

- [x] Criar uma autenticação local simples, isolada do login Manus, para testes de administrador e membro comum.
- [x] Provisionar uma conta de teste administrativa e uma conta de teste de membro comum com funções distintas.
- [x] Validar no workspace o acesso às rotas `/admin` e `/membros` com as duas contas e confirmar o isolamento de privilégios.
- [x] Sincronizar a autenticação de demonstração no repositório privado e na prévia isolada da VPS, preservando o miniapp existente.
- [x] Validar explicitamente a convivência entre sessão Manus e sessão de demonstração, incluindo entrada, troca e saída sem apagar a sessão principal.
- [x] Não realizar login Manus adicional para validação de coexistência, conforme solicitado pelo usuário; manter a cobertura automatizada de prioridade e logout seletivo.
- [x] Adicionar teste automatizado para a prioridade de `pl_demo_session`, o logout seletivo e a resolução correta de `authSource`.
- [x] Executar e registrar a validação funcional dos dois acessos locais diretamente na VPS, sem usar o workspace como evidência de teste.
- [x] Corrigir a compatibilidade do cookie de demonstração com a prévia HTTP da VPS e repetir os testes de acesso publicados.
- [x] Tornar a sessão de demonstração independente do JWT Manus e do banco de dados, que não estão configurados no serviço isolado da VPS.
- [x] Implementar armazenamento temporário próprio para a sessão de demonstração e removê-la do fluxo de JWT/OAuth Manus.
- [x] Remover a dependência de `upsertUser` e `getUserByOpenId` na autenticação de demonstração e resolver os perfis locais sem banco de dados.

# Arquivo compactado no repositório privado

- [x] Gerar uma cópia compactada da versão final do projeto, sem dependências, arquivos de ambiente ou dados sensíveis.
- [x] Enviar o arquivo compactado ao repositório privado da Página Lucrativa e confirmar o commit correspondente.

# Confirmação final do repositório remoto

- [ ] Conferir o branch principal e o último commit remoto do repositório Página Lucrativa.
- [ ] Enviar qualquer alteração final que não esteja sincronizada e confirmar o resultado ao usuário.
