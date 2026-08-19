# Auditoria visual do preview

## Estado do preview

O servidor local em modo de desenvolvimento respondeu com HTTP 200 em `http://127.0.0.1:3000/` e o proxy público respondeu com HTTP 200 via `curl`, entregando o HTML da aplicação com o title “Página Lucrativa | Negócio Digital Pronto para Começar”, os metadados sociais, `#root` e o cliente Vite/HMR.

## Limitação observada

Após a execução do pacote E2E contra o preview público, a navegação visual automatizada pelo navegador recebeu a resposta textual “Too many requests. Please try again later.” Isso caracteriza limitação temporária do proxy de preview, não erro de build: a verificação direta por `curl` continuou entregando HTTP 200 e o HTML esperado.

## E2E

A primeira tentativa não iniciou porque a configuração apontava para `/usr/bin/google-chrome`, inexistente no ambiente. A segunda execução usou o Chromium disponível em `/usr/bin/chromium` e iniciou corretamente, mas os cenários foram afetados pela limitação do proxy após múltiplas navegações. O relatório bruto fica em `/tmp/pagina-lucrativa-e2e-chromium.log`; os testes unitários e de integração permanecem aprovados com 44 arquivos e 113 testes.

## Próxima validação

Depois de reduzir a carga no proxy, repetir os cenários E2E críticos em lotes menores e validar Home desktop, Home mobile, CTA, formulário, login, Escritório Virtual, recebimento, pedidos, Academia e menus.

## Auditoria visual local — 19/08/2026

A Home local foi carregada em `http://127.0.0.1:3000/` com title atualizado, navegação no topo, hero legível, CTA primário “Quero conhecer a estrutura” renderizado como link para `#f`, CTA secundário “Ver como funciona” e formulário de ativação no fim da página. A composição desktop manteve a identidade visual escura, contraste do dourado e cards de estrutura sem overflow aparente no viewport observado.

A página também carrega dois iframes do YouTube histórico. Eles continuam visualmente disponíveis, mas podem aumentar o tempo dos testes E2E por dependerem de conteúdo externo; a copy já identifica os vídeos como históricos e em revisão.

A imagem de banner solicitada pelo usuário ainda não foi aplicada nesta etapa, pois foi programada para depois das validações e da entrega do repositório, conforme a ordem solicitada.

## Auditoria visual pós-banner — 19/08/2026

A Home local agora renderiza a imagem fornecida no topo, ocupando toda a largura disponível, seguida imediatamente pela barra de navegação existente. O controle de fechamento aparece no canto superior esquerdo como um botão circular vermelho com rótulo acessível “Fechar imagem de apresentação”. O hero e o restante da copy continuam abaixo da navegação; o conteúdo indexável também expõe o texto alternativo da imagem.

O comportamento atende à ordem solicitada: banner → navegação → hero. O clique no botão remove o banner do DOM e permite que a navegação passe a ocupar o topo do fluxo, sem alterar rotas, CTA ou mecanismo da Home.

## Teste do fechamento

O botão de fechamento foi acionado no preview local. Após o clique, a imagem e o botão vermelho desapareceram, a barra de navegação passou a ocupar o topo do fluxo e o hero permaneceu funcional. O estado foi confirmado pelo conteúdo e pelos elementos visíveis da página.
