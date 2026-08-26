# Relatório técnico — Sistema global de toasts de atividade pública

**Projeto:** `pagina-lucrativa-consolidada`  
**Data:** 26 de agosto de 2026  
**Escopo:** notificações discretas e temporizadas nas páginas públicas

## 1. Decisão de transparência

O projeto não possui, no modelo público auditado, uma fonte de eventos de compra reais com autorização explícita para divulgar nome e cidade. O schema possui dados pessoais de usuários e perfis, mas esses campos não devem ser reutilizados como prova social pública sem base de consentimento e sem uma regra clara de exposição.

Por esse motivo, a implementação não afirma que uma pessoa “acabou de adquirir” a Página Lucrativa. O aviso usa o texto **“está conhecendo a Página Lucrativa”**, exibe o rótulo **“Atividade ilustrativa”** e inclui a nota **“Demonstração ilustrativa — não representa uma compra real.”**. Assim, a variação de nomes e cidades atende ao objetivo visual e de navegação sem transformar dados sintéticos em alegações factuais de compra.

Para futuramente exibir compras reais, será necessária uma fonte de eventos aprovada, com critérios de recência, minimização de dados, consentimento e regra de anonimização ou publicação autorizada.

## 2. Arquitetura implementada

A implementação é centralizada e não foi duplicada nas páginas.

| Arquivo | Responsabilidade |
|---|---|
| `shared/publicSocialProof.ts` | Fonte centralizada das combinações ilustrativas, intervalos, limite de histórico, seleção sem repetição excessiva, formatação e identificação transparente. |
| `client/src/components/PublicSocialProofToast.tsx` | Componente global que agenda, exibe, oculta e reprograma os avisos durante a navegação. |
| `client/src/App.tsx` | Montagem única do componente dentro do `WouterRouter`, para acompanhar o layout compartilhado. |
| `client/src/index.css` | Visual premium, acessibilidade visual, responsividade, animação reduzida e posição segura acima do botão de chat. |
| `shared/publicSocialProof.test.ts` | Testes de política de rotas, limites, variação, histórico anti-repetição e transparência da cópia. |
| `server/publicHeader.responsive.test.ts` | Contrato da montagem única no roteador e da proteção de rotas privadas. |
| `e2e/tests/published-site.spec.ts` | Teste E2E em mobile e desktop, com múltiplos ciclos acelerados e mudança entre páginas. |

## 3. Rotas cobertas

O componente permite exibição na raiz pública, acesso/login, personalização, acompanhamento e rotas públicas de pedido, além das páginas institucionais, termos, privacidade, regras comerciais e contato.

Ele não exibe avisos em `/membros`, `/membros/*`, `/admin`, `/admin/*`, `/preview`, `/404` ou caminhos não reconhecidos. A checagem ocorre no componente global por meio de `isPublicSocialProofRoute`, evitando qualquer aviso visível em áreas administrativas ou privadas.

## 4. Ciclo e randomização

A primeira exibição ocorre após um intervalo aleatório entre **9 e 17 segundos**. Depois que o aviso desaparece, o próximo intervalo é sorteado entre **18 e 42 segundos**. Cada aviso permanece visível por **7 segundos** e desaparece automaticamente.

A lista possui dez combinações de nome e cidade. O componente mantém as três últimas combinações exibidas e tenta selecionar outra combinação antes de permitir qualquer repetição. A mudança de rota reinicia o ciclo e remove imediatamente um aviso que estivesse ativo, evitando que a mensagem de uma página permaneça em outra.

## 5. UX, acessibilidade e conflitos com elementos flutuantes

O toast usa `role="status"`, `aria-live="polite"` e `aria-atomic="true"`. Ele não recebe interação do ponteiro (`pointer-events: none`), não bloqueia formulários, botões ou a navbar e respeita `prefers-reduced-motion`.

No desktop, fica no canto inferior direito, acima do botão circular de Chat de membros. No mobile, largura, margem lateral e distância inferior são reduzidas para a viewport, mantendo o toast acima do chat. A validação visual confirmou que os elementos flutuantes não se sobrepõem no preview.

## 6. Validações

| Validação | Resultado |
|---|---|
| `pnpm check` | Aprovado. |
| `pnpm test` | Aprovado: 60 arquivos e 192 testes. |
| `pnpm build` | Aprovado. O aviso de chunk grande é informativo e não bloqueou o build. |
| Teste E2E do toast | Aprovado: 1 teste cobrindo 390px e 1280px, múltiplos ciclos e rotas públicas/privadas. |
| Testes unitários de política | Aprovados: rotas públicas, exclusão de áreas privadas, limites de atraso, variação e não repetição. |
| Preview visual | Toast observado no preview com rótulo transparente e sem sobreposição com o Chat de membros. |
| `git diff --check` | Aprovado. |

## 7. Preview e publicação

O preview do workspace é:

<https://3001-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer/>

O fluxo combinado será seguido após a conferência: commit no workspace, push para a `main` remota e publicação do mesmo commit na VPS. O ambiente `/dev` não será recriado.
