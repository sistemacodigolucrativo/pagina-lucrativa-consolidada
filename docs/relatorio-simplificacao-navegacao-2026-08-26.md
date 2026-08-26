# Relatório técnico — Simplificação da navegação principal

**Projeto:** `pagina-lucrativa-consolidada`  
**Branch de trabalho:** `main` local, sem commit ou push nesta etapa  
**Data:** 26 de agosto de 2026

## 1. Escopo executado

Foi implementado o plano de ação encaminhado pelo usuário para simplificar exclusivamente a navegação principal da landing page. A alteração foi feita de forma cirúrgica sobre a implementação existente da navbar, sem reescrever o componente do zero e sem alterar backend, banco de dados, autenticação, pedidos ou regras comerciais.

As seções da landing page, os conteúdos textuais, os vídeos, as âncoras, as rotas internas e os links do rodapé foram preservados. A remoção de itens ocorreu apenas nas listas que alimentam a navegação principal.

## 2. Arquivos modificados

| Arquivo | Alteração |
|---|---|
| `client/src/pages/Home.tsx` | Simplificação das listas de navegação, alteração dos rótulos e inclusão do CTA destacado `Quero começar`. |
| `client/src/index.css` | Estilos do CTA, foco visível, ajustes de espaçamento desktop, menu mobile, altura dinâmica do menu e proteção de âncoras sob a navbar sticky. |
| `server/publicHeader.responsive.test.ts` | Atualização dos contratos estruturais da navbar e verificação de preservação das seções, rotas e Institucional no rodapé. |
| `e2e/tests/published-site.spec.ts` | Novo teste E2E da navbar em desktop e mobile, incluindo ordem, destinos, CTA, sticky, abertura, fechamento e âncora. |
| `docs/relatorio-simplificacao-navegacao-2026-08-26.md` | Este relatório técnico. |

## 3. Estrutura final da navegação

A lista comercial agora contém exatamente os quatro itens previstos no plano:

| Rótulo exibido | Destino |
|---|---|
| Como funciona | `#como-funciona` |
| O que você recebe | `#o-que-recebe` |
| Resultados | `#depoimentos` |
| Dúvidas | `#faq` |

A lista utilitária contém apenas:

| Rótulo exibido | Destino |
|---|---|
| Acompanhar pedido | `/pedido/acompanhar` |
| Entrar | `/acesso` |

O CTA **Quero começar** foi separado das listas, recebeu a classe visual `nav-cta`, continua apontando para `#f` e possui tratamento visual próprio para não parecer um link comum.

## 4. Itens retirados somente da navegação principal

Os itens **Início**, **Conheça a estrutura**, **Vídeos**, **Para quem é** e **Institucional** foram retirados somente do menu principal. Também foram alterados apenas os rótulos de menu **Depoimentos** para **Resultados** e **Perguntas frequentes** para **Dúvidas**.

A seção inicial continua existindo e a marca continua apontando para `#inicio`. As seções de estrutura, vídeos e perfil ideal continuam renderizadas na landing page. A seção de prova social continua em `#depoimentos`, a FAQ continua em `#faq` e a página Institucional continua preservada no array de links do footer em `/institucional`.

## 5. Comportamento responsivo e acessibilidade

No desktop, a navbar mantém a identidade visual existente e organiza os quatro itens comerciais, o divisor, os dois utilitários e o CTA em uma única hierarquia. Foi acrescentado um ajuste de espaçamento para resoluções intermediárias entre 901 e 1080 pixels, reduzindo a chance de quebra ou overflow horizontal.

No mobile e tablet, o menu hambúrguer existente continua sendo usado. A ordem renderizada é comercial, divisor, utilitários e CTA. O menu continua limitado à altura disponível, permite rolagem vertical interna e usa `100dvh` com fallback para `100vh`. A seleção de qualquer link chama o fechamento já existente do menu.

A navbar continua `sticky` no topo. Foram adicionados `scroll-padding-top` para evitar que âncoras fiquem escondidas sob a barra fixa. Também foi reforçado o foco visível de links, CTA e botão hambúrguer, mantendo elementos nativos `nav`, `a`, `button`, `aria-label` e `aria-expanded`.

## 6. Validações técnicas

| Validação | Resultado |
|---|---|
| `pnpm check` | Aprovado, sem erros TypeScript. |
| `pnpm test` | Aprovado: 59 arquivos de teste e 186 testes. |
| `pnpm build` | Aprovado: Vite e bundle do servidor concluídos. O aviso de chunk acima de 500 kB já era de otimização do build e não impediu a conclusão. |
| `git diff --check` | Aprovado, sem erros de whitespace. |
| E2E focalizado da navbar | Aprovado: 1 teste, cobrindo desktop, mobile, ordem, destinos, CTA, sticky, abertura, fechamento e âncora `#faq`. |

A suíte E2E ampla existente também foi iniciada contra o preview local. A execução geral contém testes legados de fluxos administrativos e caminhos específicos de produção, alguns dos quais falham ou ficam bloqueados por condições independentes da navbar, como rota legada ausente no preview e modal de onboarding interceptando ações. O teste novo da navbar foi isolado e executado corretamente, com resultado **1 passed**.

## 7. Estado de publicação

As alterações estão somente no workspace local `/home/ubuntu/pagina-lucrativa-consolidada`. Não foi realizado commit, push para o GitHub ou deploy na VPS. O fluxo acordado será mantido: primeiro o usuário verifica o preview; somente após aprovação será criado o commit aprovado, enviado para a `main` remota e publicado exatamente o mesmo commit na produção.

## 8. Preview

O preview do workspace foi atualizado e validado visualmente em:

<https://3001-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer/>

A versão exibida já apresenta a nova navegação com **Como funciona**, **O que você recebe**, **Resultados**, **Dúvidas**, **Acompanhar pedido**, **Entrar** e o CTA destacado **Quero começar**.
