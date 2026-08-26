# Relatório de reorganização do menu público e menu hambúrguer

**Projeto:** Página Lucrativa  
**Data da validação:** 26 de agosto de 2026  
**Autor:** Manus AI  
**Escopo:** reorganização exclusiva da navegação pública da landing page e do menu hambúrguer.

## 1. Resultado executivo

A navegação pública foi reorganizada para seguir a sequência real das seções editoriais da landing page. Os nove links de conteúdo agora aparecem em ordem física de leitura e foram separados semanticamente das três rotas utilitárias. O item **Preview** deixou de ser renderizado no menu público, sem remoção da rota ou da funcionalidade correspondente.

A implementação preserva o comportamento de fechamento do menu após a seleção, os atributos de acessibilidade existentes, os destinos por âncora e o uso de `withAppBase()` para rotas internas. A validação funcional foi concluída em desktop e mobile, com testes automatizados, build de produção e verificação das páginas com e sem parâmetro de afiliado.

## 2. Implementação realizada

A configuração local de navegação foi mantida em `client/src/pages/Home.tsx`, sem criação de módulo adicional. A navegação editorial ficou definida na seguinte ordem:

| Ordem | Rótulo | Destino |
|---:|---|---|
| 1 | Início | `#inicio` |
| 2 | Depoimentos | `#depoimentos` |
| 3 | O que você recebe | `#o-que-recebe` |
| 4 | Como funciona | `#como-funciona` |
| 5 | Conheça a estrutura | `#estrutura` |
| 6 | Vídeos | `#videos` |
| 7 | Para quem é | `#perfil-ideal` |
| 8 | Perguntas frequentes | `#faq` |
| 9 | Quero começar | `#f` |

As rotas utilitárias foram mantidas em um grupo separado, com divisor visual discreto dentro do mesmo elemento semântico `<nav>`:

| Ordem no grupo utilitário | Rótulo | Destino |
|---:|---|---|
| 1 | Institucional | `/institucional` |
| 2 | Acompanhar pedido | `/pedido/acompanhar` |
| 3 | Entrar | `/acesso` |

O resolvedor `resolveNavigationHref()` mantém âncoras como referências locais e aplica `withAppBase()` às rotas. Dessa forma, os links utilitários continuam compatíveis com o prefixo configurado, incluindo o cenário `/dev`, enquanto os links editoriais permanecem âncoras da própria landing page.

## 3. Responsividade e acessibilidade

O CSS do header foi alterado somente no necessário para comportar os doze itens. Em desktop, os grupos podem quebrar linha de forma controlada, preservando a marca e evitando overflow horizontal. O separador entre conteúdo editorial e ações utilitárias permanece discreto.

Em larguras de até 900 px, o menu é exibido como dropdown vertical, com `max-height: calc(100vh - 105px)`, `overflow-y: auto` e `overscroll-behavior: contain`. Os grupos ficam empilhados e o divisor torna-se horizontal. A regra de espaçamento dos links em telas de até 650 px foi preservada, mantendo áreas de toque adequadas.

A implementação preserva `aria-label="Navegação principal"`, `aria-expanded` no botão hambúrguer, semântica de links nativos e a chamada existente de `closeMenu` em todos os itens renderizados. O teste funcional confirmou que selecionar **Depoimentos** fecha o menu e navega para `#depoimentos`.

## 4. Arquivos efetivamente modificados nesta tarefa

| Arquivo | Alteração |
|---|---|
| `client/src/pages/Home.tsx` | Configuração dos grupos de navegação, ordem editorial, destinos, resolvedor de links e remoção da exposição pública de Preview. |
| `client/src/index.css` | Ajustes mínimos de agrupamento, divisor, quebra controlada e rolagem vertical do menu mobile. |
| `server/publicHeader.responsive.test.ts` | Asserções da ordem, rótulos, destinos, ausência de Preview, âncoras existentes e proteção responsiva. Uma asserção foi alinhada ao resolvedor compartilhado `resolveNavigationHref()`. |
| `docs/relatorio-reorganizacao-menu-publico.md` | Este relatório. |

O arquivo externo `/home/ubuntu/e2e-public-navigation-check.py` foi usado exclusivamente como apoio de validação e permanece fora do projeto. Não foram alterados `client/src/App.tsx` nem `shared/publicSalesSections.ts`; ambos foram consultados para confirmar rotas e a sequência estrutural da landing page.

## 5. Divergência relevante encontrada

O plano determina que a realocação administrativa do Preview pertence a uma alteração separada. No estado existente do workspace, a funcionalidade já estava disponível no contexto administrativo por trabalho anterior. Portanto, nesta tarefa o Preview foi apenas mantido fora do menu público; não houve refatoração da rota, da funcionalidade ou da navegação administrativa.

As âncoras `#como-funciona` e `#estrutura` são atribuídas condicionalmente aos blocos `problem_start` e `product_real` no mapeamento de `contentBlocks`. Essa estrutura foi confirmada como válida e não foi reorganizada, em conformidade com o escopo que proíbe alterar fisicamente as seções da landing page.

## 6. Validações executadas

### Validações automatizadas do projeto

| Comando | Resultado |
|---|---|
| `pnpm check` | Aprovado: TypeScript sem erros. |
| `pnpm test` | Aprovado: 58 arquivos de teste e 184 testes passaram. |
| `pnpm build` | Aprovado: bundle Vite e servidor Express foram gerados em `dist/`. |

O build exibiu apenas avisos não bloqueantes: o bundle principal ultrapassa 500 kB após minificação e o pnpm informou que o campo `pnpm` do `package.json` não é lido pela versão atual. Nenhum aviso impediu a compilação ou está relacionado à reorganização do menu.

### Validação E2E no preview

**Preview validado:** [abrir preview público](https://3000-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer/)

| Cenário | Resultado |
|---|---|
| Home desktop em 1280×800 | HTTP 200; nove links editoriais e três utilitários na ordem esperada; Preview ausente; sem overflow horizontal. |
| Home mobile em 393×851, perfil Pixel 5 | HTTP 200; todos os doze itens acessíveis; sem overflow horizontal; menu vertical com rolagem. |
| Interação do hambúrguer | Menu abriu, exibiu doze links e um divisor; fechou após clicar em Depoimentos; URL final terminou em `#depoimentos`. |
| Âncoras individuais | Os nove links editoriais foram clicados individualmente; cada URL terminou na âncora esperada e o elemento de destino existiu no DOM. |
| Rotas utilitárias | `/institucional`, `/pedido/acompanhar` e `/acesso` responderam HTTP 200 e renderizaram o conteúdo esperado. |
| Home com afiliado | `?afiliado=pagina-lucrativa` respondeu HTTP 200 e renderizou conteúdo não vazio. |
| Home sem afiliado | A Home pública padrão respondeu HTTP 200 e foi validada no cenário desktop/mobile. |

Na medição do menu mobile aberto, o runner registrou `overflowY: auto`, `maxHeight: 622px`, `scrollHeight: 568` e `clientHeight: 568`, confirmando que o menu permanece contido e rolável quando necessário.

## 7. Critérios de aceite

Todos os critérios do plano foram atendidos: Preview não aparece no menu público; os nove destinos editoriais estão na ordem exigida; as três rotas utilitárias permanecem funcionais; desktop e mobile não apresentam overflow horizontal; todos os itens mobile são acessíveis; a seleção fecha o menu; cada âncora foi clicada e validada individualmente; âncoras e rotas possuem destinos válidos; e check, testes, build e E2E passaram.

Não foram modificados formulário, afiliados, patrocinador, backend, banco, APIs, autenticação, chat de membros, rotas administrativas ou a organização física das seções da landing page.

## 8. Navbar fixa durante a rolagem

A regra `.site-header { position: sticky; top: 0; z-index: 50; }` já existia no workspace, mas a validação funcional revelou uma limitação estrutural: o wrapper `.sales-page` utilizava `overflow: hidden`, o que criava um contexto incompatível com a fixação da navbar durante a rolagem da página. O teste foi reproduzido em desktop e confirmou que, no meio e no final do scroll, o header acompanhava o conteúdo em vez de permanecer no topo.

A correção aplicada foi mínima e restrita ao comportamento de overflow: `.sales-page` passou de `overflow: hidden` para `overflow: clip`. Esse valor continua recortando elementos decorativos que ultrapassam os limites visuais, mas não cria um contêiner de rolagem que impeça o `position: sticky` de acompanhar a viewport.

A validação E2E posterior confirmou, em desktop `1280×800` e mobile `393×851`, que o header permaneceu com `top: 0`, `position: sticky` e `z-index: 50` no início, meio e final da página. Não houve overflow horizontal. Também foi confirmado que o menu hambúrguer abre após rolagem, permanece ancorado ao header, fecha ao selecionar **Depoimentos** e navega para `#depoimentos`.

## 9. Controle de escopo

A execução foi realizada diretamente no workspace existente, que permaneceu como fonte de execução. Nenhuma operação de Git foi realizada como parte da implementação da navbar; o envio remoto passou a ser autorizado posteriormente e será registrado no histórico remoto correspondente.
