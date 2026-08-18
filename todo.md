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

- [x] Conferir o branch principal e o último commit remoto do repositório Página Lucrativa.
- [x] Enviar qualquer alteração final que não esteja sincronizada e confirmar o resultado ao usuário.
- [x] Confirmar ao usuário a sincronização final do branch `main` no commit remoto `0d03bb8`.

# Ferramentas e e-books do painel de membros

- [x] Confirmar a titularidade ou a autorização explícita para copiar integralmente os e-books de referência em formato HTML.
- [x] Inventariar as sessões, ferramentas e e-books disponíveis na área de membros de referência usando a conta autorizada.
- [ ] Implementar as ferramentas observáveis e autorizadas no painel de membros da Página Lucrativa 2026.
- [x] Criar leitores HTML e uma gestão administrativa para listar, editar e publicar cada e-book autorizado.
- [x] Validar as novas funcionalidades diretamente na VPS e sincronizar a versão final no repositório remoto Página Lucrativa.

# Domínio público da Página Lucrativa

- [x] Verificar DNS, certificados e a configuração Nginx atual de ocodigolucrativo.site na VPS.
- [ ] Configurar `www.ocodigolucrativo.site/paginalucrativa` como proxy da Página Lucrativa na porta 3101, sem alterar a raiz ou o miniapp existente.
- [ ] Validar HTTP, HTTPS e as rotas de assets pela nova URL antes da entrega.

# Mídia da landing de referência

- [ ] Inventariar imagens, vídeos e posicionamentos da landing de referência, distinguindo materiais autorizados de dados de terceiros.
- [ ] Integrar as imagens e vídeos autorizados nos blocos correspondentes da Página Lucrativa 2026.
- [ ] Validar a reprodução de mídia e o comportamento responsivo diretamente na VPS.
- [ ] Adaptar o roteamento do cliente ao prefixo `/paginalucrativa` para eliminar a página 404 na URL pública solicitada.

# Autenticação única por usuário e senha

- [ ] Remover da interface os convites, redirecionamentos e controles relacionados ao login Manus.
- [ ] Manter somente a sessão local por usuário e senha, com permissões distintas de administrador e membro.
- [ ] Validar diretamente na VPS o login, o logout e as restrições de rota após a simplificação.

# Auditoria funcional dos painéis

- [ ] Auditar, com a conta autorizada, todos os fluxos disponíveis no painel oficial de membros e na administração relacionada.
- [ ] Mapear cada item do menu atual para uma função utilizável, uma regra de acesso e uma fonte de dados administrável.
- [ ] Substituir itens meramente estruturais por fluxos reais de membro, com estados vazios, validações e retornos de sucesso ou erro.
- [ ] Criar as telas e os procedimentos administrativos necessários para manter conteúdos, recursos e permissões disponibilizados aos membros.
- [ ] Cobrir os fluxos implementados com testes automatizados e validar os caminhos críticos diretamente na VPS.
# Módulo de e-books HTML autorizados
- [x] Criar a tabela persistente de e-books, incluindo conteúdo HTML, metadados, estado de publicação e arquivamento.
- [x] Disponibilizar procedimentos protegidos para leitura de e-books publicados e gestão administrativa completa.
- [x] Construir a estante de leitura do membro e o leitor HTML responsivo.
- [x] Criar a manutenção administrativa para listar, editar, publicar e arquivar e-books.
- [x] Importar o manifesto de 52 e-books HTML convertidos e validar a integridade do catálogo.
- [x] Cobrir o módulo de e-books com testes automatizados, ativar a versão na VPS e sincronizar o GitHub.

# Marco 3 — Catálogo de produtos administrável
- [x] Implementar catálogo de produtos com cadastro no membro, revisão administrativa, publicação e arquivamento.
- [x] Sincronizar o marco de catálogo de produtos validado com o GitHub.
- [x] Implementar gestão administrativa de solicitações públicas, com atualização de status e acompanhamento pelo solicitante.
- [x] Sincronizar o marco de solicitações públicas validado com o GitHub.
- [x] Implementar lançamentos financeiros do membro e manutenção administrativa com controles de acesso.
- [ ] Sincronizar o marco financeiro validado com o GitHub.
- [ ] Central editorial de publicações: conectar blog, artigos, materiais, bônus e FAQ do membro à manutenção administrativa.

- [x] Implementar catálogo de cursos administrável, progresso do membro e curadoria administrativa na VPS
- [x] Sincronizar o marco de cursos validado com o GitHub no commit daa785b.
- [ ] Implementar rede de indicações privada, patrocinador e manutenção administrativa de vínculos na VPS.

## Marco 8 — Rede de indicações privada

- [x] Implementar patrocinador e rede de indicados com visibilidade restrita à relação direta do membro.
- [x] Criar manutenção administrativa de vínculos e estados de indicação.
- [x] Validar na VPS criação, listagem, atualização administrativa, bloqueio 403 para membro e limpeza dos dados de teste.
- [x] Sincronizar o marco de rede de indicações validado com o GitHub no commit 1509a95.

## Marco 9 — Comunicação preparada e administrável

- [ ] Implementar preparos persistentes de comunicação do membro para os canais de e-mail e WhatsApp, sem simular entregas externas.
- [ ] Criar supervisão administrativa dos preparos, estados e arquivamento.
- [ ] Validar propriedade, restrição de papéis, publicação e limpeza de registros temporários diretamente na VPS.
- [ ] Sincronizar o marco de comunicação validado com o GitHub.

# Marco 10 — Pontuação e desempenho transparente
- [x] Implementar pontuação individual com lançamentos administráveis e critérios registrados.
- [x] Criar visualização de desempenho do membro sem expor dados de terceiros.
- [x] Criar manutenção administrativa de pontos, validar permissões e limpar o lançamento temporário diretamente na VPS.
- [x] Sincronizar o marco de pontuação validado com o GitHub.

# Responsividade e fluxo de acesso e personalização
- [x] Auditar em celular, tablet e computador a rota de acesso e personalização, incluindo a tela de mensagem e senha especial.
- [x] Substituir blocos meramente orientativos por ações coerentes com o fluxo de acesso e personalização do membro, quando aplicável.
- [x] Corrigir hierarquia, quebras de texto, espaçamentos e navegação responsiva identificados na validação visual.
- [x] Validar os ajustes diretamente na VPS nos três breakpoints e registrar a evidência antes de sincronizar o próximo marco.

# Correção prioritária de runtime
- [x] Corrigir referência ausente MemberReferrals que impede o carregamento do bundle publicado.
- [x] Compilar, ativar e validar a página publicada e as rotas de indicações na VPS.
- [x] Sincronizar a correção de runtime validada com o GitHub no commit b644ab6.

# Relatos próprios com curadoria administrativa
- [x] Criar envio privado de relato próprio com confirmação de autoria e estados de acompanhamento para o membro.
- [x] Criar a fila administrativa de curadoria, com aprovação, rejeição, arquivamento e anotação interna.
- [x] Validar permissões, rotas, suíte automatizada, compilação e serviço diretamente na VPS, sem gerar dados de relato fictícios.
- [x] Sincronizar o marco de relatos próprios validado com o repositório privado.
