# PROMPT TÉCNICO — SISTEMA DE EDIÇÃO VISUAL REAL DA PÁGINA PÚBLICA DE VENDAS / CÓDIGO LUCRATIVO

Atue como especialista em arquitetura frontend, React/TypeScript, UI builder, drag and drop, resize, edição visual persistente, responsividade, segurança, acessibilidade e integração entre painel administrativo e página pública.

## Projeto

Código Lucrativo.

## Escopo

Implementar localmente um novo modo de edição visual real para a Página Pública de Vendas, reaproveitando a estrutura já existente da página e do painel administrativo.

A implementação deve evoluir o sistema atual, não reconstruir a página pública do zero.

## Restrição operacional obrigatória

Esta modificação deve ser aplicada somente no ambiente local de desenvolvimento.

Não enviar alterações para o repositório remoto.
Não fazer `git push`.
Não alterar a branch `main` remota.
Não criar branch remota.
Não abrir pull request.
Não sobrescrever código remoto.

Se for necessário versionar algo, no máximo criar commit local e informar o hash local, sem enviar para o GitHub.

Está autorizado apenas enviar para produção quando for necessário validar o comportamento real no ambiente de produção.

Se o envio para produção depender obrigatoriamente de push para o repositório remoto, não executar. Informar o impedimento técnico antes de prosseguir.

## Objetivo

Substituir ou evoluir o mecanismo atual do menu administrativo “Configurar seções” para um sistema de edição visual real por toggle.

Hoje, o painel administrativo possui um editor interno de seções/textos, com visualização própria, arrastar/soltar e edição dentro do painel. Esse editor não representa fielmente a página pública real em desktop, tablet e mobile.

O novo comportamento desejado é:

1. O administrador acessa o painel administrativo.
2. Entra no menu “Configurar seções” ou equivalente.
3. Seleciona o template ativo da Página Pública de Vendas, por exemplo “Template Premium”.
4. Salva o template ativo.
5. Ativa um toggle chamado “Modo de edição visual” ou nome equivalente.
6. Com o toggle ativo, a própria Página Pública de Vendas real passa a ficar editável quando acessada por um administrador autenticado.
7. O administrador acessa o link real da página pública, por exemplo `https://ocodigolucrativo.site`.
8. A página é exibida exatamente como o visitante veria, porém com recursos administrativos de edição sobrepostos.
9. O administrador pode editar textos, arrastar, reposicionar, duplicar, deletar, aumentar e diminuir elementos.
10. Ao salvar, as alterações são persistidas globalmente no sistema, não apenas localmente no navegador.
11. Ao descartar, todas as alterações pendentes são revertidas.

## Diagnóstico obrigatório antes de implementar

Antes de codificar, localizar e entender:

1. O menu atual “Configurar seções” ou equivalente real no código.
2. O editor atual de template/seções.
3. A página pública real.
4. O sistema atual de seleção de template ativo.
5. Onde textos, seções e configurações são persistidos.
6. Como o conteúdo hardcoded e o conteúdo salvo em banco/configuração são combinados.
7. Se existe fallback para conteúdo original.
8. Se existe sobreposição entre conteúdo salvo e conteúdo original.
9. Como desktop, tablet e mobile são definidos atualmente.
10. Quais bibliotecas já existem para drag and drop, resize, edição inline, form state ou validação.
11. Quais componentes devem ser editáveis e quais não devem.
12. Quais componentes possuem texto com múltiplas cores, spans, gradientes ou destaques internos.

Não iniciar por tentativa e erro.
Não substituir componentes funcionais sem necessidade.
Não remover o editor atual sem garantir substituição segura.
Se necessário, manter o editor antigo temporariamente como fallback até validação completa.

## Requisito central de arquitetura

Não transformar a página inteira em um canvas absoluto rígido.

Se o layout atual for baseado em grid/flex, preservar essa natureza.

Preferir salvar estrutura semântica e responsiva:

- ordem;
- seção;
- coluna;
- alinhamento;
- dimensão controlada;
- visibilidade;
- conteúdo editável;
- overrides por breakpoint;
- metadados do componente.

Evitar salvar coordenadas absolutas globais como regra principal, pois isso tende a destruir responsividade.

Usar posicionamento absoluto apenas quando for tecnicamente necessário e confinado ao container correto.

## Modelo de dados recomendado

Cada elemento editável deve possuir identificador estável.

Salvar alterações por:

- template;
- breakpoint/contexto: desktop, tablet, mobile;
- seção;
- componente;
- instância;
- propriedade alterada.

O sistema deve conseguir diferenciar:

- conteúdo original;
- conteúdo editado;
- layout original;
- layout editado;
- elemento duplicado;
- elemento ocultado/removido;
- override específico de breakpoint.

Não salvar apenas HTML bruto.
Não salvar apenas uma string simples quando o componente depende de estrutura interna para manter cores, spans ou destaques.

Quando houver texto segmentado, usar um modelo estruturado, por exemplo:

- segmento normal;
- segmento destacado;
- segmento com cor específica;
- segmento com gradiente;
- segmento com peso diferente.

A edição deve alterar o conteúdo textual sem destruir o modelo visual.

## Toggle de edição visual

No painel administrativo, dentro do menu “Configurar seções” ou equivalente:

- manter a seleção de template ativo;
- permitir selecionar o template, por exemplo “Template Premium”;
- permitir salvar o template ativo;
- adicionar toggle de modo de edição visual;
- persistir o estado do toggle no backend ou mecanismo seguro já existente;
- quando desativado, a página pública funciona normalmente;
- quando ativado, apenas administradores autenticados veem ferramentas de edição;
- visitantes comuns nunca veem ferramentas administrativas.

O toggle não pode ser ativado por visitante comum via query string, localStorage, cookie manipulável ou estado puramente frontend.

## Página pública em modo editável

Com o modo de edição ativado:

- desktop edita desktop;
- tablet edita tablet;
- mobile edita mobile;
- o breakpoint real da viewport deve ser respeitado;
- alterações feitas em um contexto responsivo não devem destruir automaticamente os outros contextos;
- quando necessário, criar overrides por breakpoint;
- a página deve continuar parecendo a página pública real, com camada administrativa sobreposta.

## Ferramentas de edição necessárias

Cada elemento editável deve permitir, quando aplicável:

- editar texto;
- arrastar;
- reposicionar;
- redimensionar;
- duplicar;
- deletar/ocultar;
- salvar;
- descartar.

Nem todo elemento precisa de todos os controles.
Aplicar ações conforme a natureza do componente.

Exemplos:

- texto: editar conteúdo;
- imagem: trocar imagem, reposicionar, redimensionar;
- card: mover, duplicar, ocultar, redimensionar;
- botão: editar texto, link, mover, redimensionar;
- seção: reordenar blocos internos quando seguro.

## Boas práticas obrigatórias para drag and drop

Implementar uma camada de interação previsível e consistente.

Requisitos:

- usar Pointer Events quando adequado;
- capturar o ponteiro durante drag/resize com `setPointerCapture` quando aplicável;
- liberar captura no final da interação;
- usar activation constraints para evitar iniciar drag por clique acidental;
- diferenciar clique, seleção de texto, edição inline, drag e resize;
- não iniciar drag enquanto o usuário estiver editando texto;
- não iniciar edição inline enquanto o usuário estiver arrastando;
- evitar seleção de texto involuntária durante drag;
- usar handles explícitos quando necessário;
- limitar o drag ao container/seção correta;
- impedir overflow horizontal;
- preservar responsividade;
- validar colisão/drop zone antes de aceitar nova posição;
- exibir preview/ghost durante o drag;
- só persistir após drop e salvar explícito;
- não persistir a cada pixel movimentado;
- não bloquear scroll natural indevidamente;
- em touch, controlar `touch-action` somente nos handles necessários;
- usar throttling via `requestAnimationFrame` para medições e overlay durante scroll/drag/resize;
- limpar listeners ao desmontar componentes.

Se o projeto já possuir biblioteca adequada, reaproveitar. Se não possuir, avaliar biblioteca leve e compatível com React, acessibilidade e responsividade.

Não adicionar dependência pesada sem justificar.

## Boas práticas obrigatórias para resize

O redimensionamento deve:

- usar alças visuais nos cantos e/ou laterais;
- respeitar tamanho mínimo e máximo;
- respeitar proporção de imagem quando necessário;
- impedir distorção involuntária;
- preservar grid/flex quando aplicável;
- salvar largura/altura por contexto responsivo;
- permitir cancelar antes de salvar;
- atualizar overlay sem duplicação visual;
- não gerar overflow horizontal;
- não quebrar texto interno;
- não deformar botões/cards.

As alças devem ser visíveis apenas no modo de edição e no elemento selecionado.

## Correção obrigatória do bug de borda/seleção duplicada

Há bug conhecido: ao clicar/selecionar um texto e rolar a página, o texto mantém a borda de seleção, mas aparece uma borda secundária que também rola junto com a página.

Esse comportamento deve ser tratado como problema estrutural da camada de overlay/seleção.

Requisitos para corrigir:

- manter uma única fonte de verdade para o elemento selecionado;
- renderizar apenas uma borda/outline ativa por elemento selecionado;
- não criar outline duplicado no DOM do componente e também na camada overlay;
- escolher uma estratégia única: outline no próprio elemento OU overlay administrativo separado;
- se usar overlay separado, ele deve ser posicionado com base em `getBoundingClientRect()`;
- o overlay deve ser recalculado em scroll, resize, zoom, mudança de conteúdo e mudança de breakpoint;
- usar `position: fixed` para overlay baseado em viewport ou estratégia equivalente consistente;
- não salvar posição de overlay como se fosse posição do componente;
- não deixar clones/fantasmas antigos após scroll;
- remover borda/overlay ao desfocar, descartar, trocar seleção ou sair do modo de edição;
- garantir cleanup de listeners;
- validar que scroll vertical não gera segunda borda;
- validar que scroll horizontal, se existir, não desloca o overlay indevidamente;
- validar que resize da janela não deixa borda fora do componente;
- validar que elementos dentro de containers com transform, scale ou overflow continuam com overlay correto.

O overlay administrativo não pode interferir no layout público.

## Preservação de layout e estilo

Ao editar texto, preservar:

- fonte;
- tamanho;
- peso;
- cor;
- cores parciais;
- gradientes;
- spans destacados;
- quebras;
- alinhamento;
- line-height;
- espaçamento;
- proporção;
- estilo visual do componente.

Se um título possui palavras em cores diferentes dentro do mesmo container, editar o texto não pode remover essa composição visual.

Se a edição textual exigir alteração em trechos com múltiplas cores ou spans, implementar uma estratégia que preserve os estilos segmentados ou permita editar cada segmento mantendo sua formatação.

Ao editar botões, cards, imagens ou outros elementos, preservar:

- formato;
- cor;
- tamanho visual;
- borda;
- raio;
- sombra;
- padding;
- alinhamento;
- comportamento responsivo;
- ações existentes;
- links existentes, salvo quando houver edição explícita do link.

A edição não deve deformar o componente nem substituir o estilo original por estilo genérico.

## Auditoria obrigatória do mecanismo atual de sobrescrita

O sistema atual aparentemente trabalha com uma versão original/hardcoded da página e salva personalizações no banco ou em camada de configuração por cima da versão original.

Esse comportamento precisa ser auditado porque já foi observado que ao editar determinados textos, principalmente textos com mais de uma cor, destaque ou segmentação visual, o conteúdo salvo pode perder a formatação original.

Exemplo:

- texto original possui duas cores;
- administrador edita o texto;
- após salvar, o texto aparece com uma única cor;
- a versão salva pode sobrepor ou conflitar com a versão original;
- isso pode gerar duplicidade visual, perda de estilo, sobreposição de conteúdo ou inconsistência entre texto original e texto editado.

Antes de expandir o editor, identificar e corrigir:

- substituição de HTML por texto plano;
- perda de spans;
- perda de cor parcial;
- duplicidade entre conteúdo original e conteúdo salvo;
- fallback visual incorreto;
- sobreposição de camadas;
- conflito entre hardcoded e banco;
- merge incorreto entre template e configuração.

## Persistência

As alterações devem ser salvas globalmente no sistema.

Não salvar apenas em localStorage.
Não salvar apenas no estado do frontend.
Não salvar apenas na sessão do navegador.

Persistir no banco ou mecanismo de configuração existente, preferencialmente reaproveitando a arquitetura atual de templates/configuração.

O salvamento deve registrar:

- template editado;
- breakpoint/contexto editado;
- componente alterado;
- posição;
- tamanho;
- texto;
- segmentos de texto quando houver estilos parciais;
- visibilidade;
- duplicação;
- exclusão/ocultação;
- ordem dos elementos;
- metadados necessários para reconstruir o layout.

## Salvar e descartar

Ao detectar a primeira alteração na página pública editável, exibir controle fixo com:

- Salvar;
- Descartar.

Esse controle deve ser visível apenas no modo administrativo de edição.

Salvar deve:

- validar alterações;
- persistir globalmente;
- atualizar a página pública;
- manter o layout final conforme editado;
- exibir feedback claro.

Descartar deve:

- remover alterações pendentes;
- restaurar o estado anterior salvo;
- limpar overlays, seleção, ghosts e estados temporários;
- não deixar resíduos no estado local.

## Controle de alterações

Implementar:

- estado de alterações pendentes;
- aviso ao tentar sair com alterações não salvas;
- botão de descartar claro;
- feedback de salvamento;
- feedback de erro;
- bloqueio de salvamento se houver inconsistência crítica;
- controle de transação;
- rollback em caso de erro.

Recomendado implementar histórico mínimo de undo/redo local antes de salvar, se não aumentar demais o escopo.

## Segurança

O modo de edição deve estar disponível somente para administradores autenticados.

Não expor endpoints de edição para usuários comuns.
Não permitir ativação por query string, localStorage ou manipulação simples do frontend.
Validar permissão no backend antes de salvar qualquer alteração.

Endpoints devem validar:

- autenticação;
- autorização;
- template permitido;
- estrutura do payload;
- elementos editáveis permitidos;
- campos permitidos;
- limites de tamanho;
- integridade do layout;
- conteúdo textual seguro;
- ausência de scripts.

Sanitizar qualquer conteúdo rico.
Evitar XSS.
Nunca confiar apenas no frontend.

## Acessibilidade

Mesmo sendo ferramenta administrativa, o editor deve manter acessibilidade mínima.

Requisitos:

- controles de edição devem ser botões reais quando possível;
- elementos customizados focáveis devem possuir foco visível;
- operação por teclado deve existir para ações essenciais;
- drag and drop deve ter alternativa por teclado quando viável;
- leitores de tela não devem receber ruído visual desnecessário;
- overlays decorativos devem usar `aria-hidden` quando apropriado;
- mensagens de salvar/erro devem ser anunciáveis quando necessário;
- não depender apenas de cor para indicar seleção ou erro.

## Componentes editáveis iniciais

Tornar editáveis, quando seguro:

- títulos;
- subtítulos;
- parágrafos;
- botões;
- cards;
- imagens;
- blocos informativos;
- seções;
- prova social;
- FAQ;
- bloco final de conversão;
- footer, se fizer sentido.

## Duplicar e deletar

Duplicar:

- criar nova instância baseada no original;
- preservar estilo e comportamento;
- gerar identificador único;
- permitir edição separada;
- persistir no layout salvo.

Deletar:

- preferir ocultar/remover via configuração, não apagar o componente original do código;
- permitir restauração futura se já existir estrutura;
- evitar remoção destrutiva sem rollback.

## Template ativo

O sistema deve respeitar o template ativo selecionado.

Se o template ativo for “Template Premium”, as edições devem ser aplicadas ao Template Premium.

Não aplicar alterações de um template em outro sem intenção explícita.

O payload de salvamento deve estar associado ao template correto.

## Responsividade

A edição deve considerar:

- desktop;
- tablet;
- mobile.

Se o administrador editar no desktop, salvar regras para desktop.
Se editar no mobile, salvar regras para mobile.
Se editar no tablet, salvar regras para tablet.

A implementação deve evitar que uma edição feita no mobile destrua a composição desktop e vice-versa.

Quando possível, estruturar o sistema com configurações globais e overrides por breakpoint.

## Performance

O editor não pode degradar a página pública quando desativado.

Requisitos:

- carregar ferramentas administrativas apenas para admin e quando necessário;
- evitar listeners globais permanentes quando o modo estiver desligado;
- limpar observers/listeners ao sair do modo de edição;
- usar `ResizeObserver`, scroll listeners e medições com cuidado;
- usar `requestAnimationFrame` para atualizar overlays em interações frequentes;
- evitar re-renderizações globais a cada movimento;
- não persistir no backend durante cada pixel de drag/resize;
- separar estado temporário de interação do estado persistido.

## Testes preventivos obrigatórios

Testar antes de considerar concluído:

1. Texto simples sem destaque.
2. Texto com duas cores.
3. Texto com palavra destacada.
4. Texto com negrito parcial.
5. Texto com gradiente.
6. Texto com span interno.
7. Texto com quebra de linha.
8. Texto com ícone junto ao texto.
9. Texto em botão.
10. Texto em card.
11. Texto no hero.
12. Texto no FAQ.
13. Texto em fundo escuro.
14. Texto em fundo claro.
15. Texto centralizado.
16. Texto alinhado à esquerda.
17. Edição no desktop.
18. Edição no tablet.
19. Edição no mobile.
20. Edição seguida de salvar.
21. Edição seguida de descartar.
22. Edição, salvar e recarregar.
23. Edição, salvar e abrir em outro navegador.
24. Edição, salvar e acessar como visitante comum.
25. Nova edição em texto já editado.
26. Duplicação de elemento com texto formatado.
27. Resize de elemento com texto formatado.
28. Reposicionamento de elemento com texto formatado.
29. Exclusão/ocultação de elemento editado.
30. Restauração/fallback, se houver.
31. Selecionar elemento e rolar página.
32. Selecionar elemento e redimensionar janela.
33. Selecionar elemento dentro de container com transform/overflow.
34. Arrastar sem gerar segunda borda.
35. Resize sem deixar ghost antigo.
36. Alternar toggle ligado/desligado.
37. Sair da página com alteração pendente.
38. Visitante comum nunca ver controles.

## Validação visual

Validar em:

Desktop:

- 1280 px;
- 1366 px;
- 1440 px;
- 1536 px;
- 1920 px.

Mobile:

- Android comum;
- iOS/Safari quando possível;
- largura reduzida.

Tablet:

- largura intermediária.

Verificar:

- edição inline;
- drag and drop;
- resize;
- duplicação;
- exclusão;
- salvar;
- descartar;
- persistência após reload;
- persistência em outro navegador;
- preservação de estilos;
- preservação de cores parciais;
- ausência de overflow;
- ausência de quebra para visitante comum;
- modo de edição visível somente para admin;
- ausência do bug de borda duplicada ao rolar.

## Validação em produção

Após implementação local e validação básica, está autorizado enviar para produção somente para validação real, desde que isso não exija push para o repositório remoto.

Se a produção depende de GitHub/main/branch remota, parar e informar.

Em produção, validar:

- toggle ativa/desativa corretamente;
- página pública real entra em modo editável apenas para admin;
- visitante comum não vê ferramentas de edição;
- salvar persiste;
- descartar reverte;
- edição funciona no dispositivo real;
- layout público continua íntegro.

## Documentação obrigatória

Registrar em Markdown:

- arquivos alterados;
- componentes envolvidos;
- como o modo de edição funciona;
- como o toggle é salvo;
- como o template ativo é respeitado;
- como a persistência foi feita;
- quais ações são suportadas;
- quais componentes são editáveis;
- como foi resolvido o bug de borda duplicada;
- limitações conhecidas;
- validações executadas;
- pendências.

## Critérios de aceite

A implementação só pode ser considerada concluída se:

1. O painel administrativo possuir toggle funcional para modo de edição.
2. A página pública real entrar em modo editável apenas para administrador.
3. O layout real da página for usado como base, não uma simulação dentro do painel.
4. Textos puderem ser editados preservando estilo, cores, fonte e proporção.
5. Textos com múltiplas cores continuarem com múltiplas cores após salvar.
6. Elementos puderem ser arrastados e reposicionados.
7. Elementos puderem ser redimensionados por alças visuais.
8. Elementos puderem ser duplicados e ocultados/excluídos quando aplicável.
9. Salvar persistir globalmente no sistema.
10. Descartar reverter alterações pendentes.
11. Edições respeitarem desktop/tablet/mobile conforme o dispositivo usado.
12. Visitantes comuns não visualizarem controles administrativos.
13. Não existir borda/outline duplicado ao selecionar e rolar a página.
14. Não houver ghost visual antigo após drag/resize/scroll.
15. Nenhuma alteração for enviada ao repositório remoto.
16. Produção for usada apenas para validação real, se tecnicamente possível sem push remoto.

## Fontes técnicas consultadas para boas práticas

- MDN — Pointer Events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- MDN — Element.setPointerCapture(): https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- MDN — HTML Drag and Drop API / Drag operations: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations
- dnd kit — Accessibility: https://dndkit.com/legacy/guides/accessibility/
- dnd kit — useDraggable: https://dndkit.com/legacy/api-documentation/draggable/use-draggable/
- dnd kit — GitHub README: https://github.com/clauderic/dnd-kit
- W3C WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- W3C WAI-ARIA Practices: https://www.w3.org/WAI/standards-guidelines/aria/

## Importante

Implementar com cautela. Esta é uma mudança arquitetural sensível.

Antes de codificar, fazer diagnóstico do editor atual, da persistência de template, da página pública e dos componentes existentes.

Não começar por tentativa e erro.
Não reescrever a página.
Não quebrar o template ativo.
Não destruir responsividade.
Não misturar edição administrativa com experiência pública do visitante.
