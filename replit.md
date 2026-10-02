# Instruções do projeto — Código Lucrativo

## Contexto técnico

- A aplicação existente é a fonte de verdade. Preserve sua arquitetura, rotas, autenticação, conteúdo comercial e templates atuais; não substitua templates ou reescreva páginas sem justificativa técnica demonstrável.
- A evolução da Página Pública de Vendas deve ser incremental, mantendo o comportamento padrão atual e permitindo validar cada etapa antes da próxima.
- Na base verificada em 2 de outubro de 2026, `/` é renderizada por `PublicHome` e a composição comercial está concentrada em `Home.tsx`. `official` é o template ativo/default observado; `premium` envolve o mesmo `Home` com uma skin CSS. Evolua essa base sem duplicar a página ou sua lógica comercial.
- A copy pública existente é configurada por `/api/public-sales-copy`; o painel administrativo salva overrides e configuração. O runtime atual também aplica copy e layout visual sobre a página.
- `PublicSalesContentSnapshot` é resolvido a partir do schema compartilhado de copy e dos overrides string válidos no provider. `PublicHome` entrega o mesmo snapshot a `official` e `premium`; preserve a compatibilidade da rota `/preview`, que pode continuar obtendo o snapshot pelo contexto.
- Mantenha os defaults do editor alinhados ao que a página pública já exibe. Quando duas fontes descrevem a mesma lista (por exemplo, objeções), derive uma da outra em vez de manter cópias divergentes.
- Os IDs e rótulos persistidos dos templates vivem em `shared/publicPageTemplate.ts`; o renderer em `PublicSalesTemplateRegistry.tsx` associa esses IDs à apresentação. Hoje, `official` e `premium` usam o mesmo `Home`; somente `premium` aplica o wrapper CSS. Rotas públicas e prévia administrativa devem usar esse renderer.
- O editor já persiste layouts em chaves separadas por template e breakpoint. Preserve esses dados e contratos ao adicionar IDs estáveis ou ajustar breakpoints.
- A regra central dos templates é separar conteúdo de apresentação: templates compartilham os mesmos textos, dados e funcionalidades comerciais. Não copie `Home.tsx` nem duplique a lógica de pedido, referral, tracking, prova social, FAQ, SEO ou segurança.
- Antes de introduzir uma abstração, inspecione os contratos e runtimes existentes. Reutilize-os quando isso for compatível e faça adaptações pequenas, reversíveis e cobertas por validação.

## Regras para a Página Pública de Vendas

- `official` e `premium` são opções existentes; preserve a apresentação de ambas e a seleção administrativa persistida.
- A interface administrativa, a apresentação pública e a lógica comercial devem continuar separadas em suas responsabilidades.
- Layout visual deve continuar seguro e responsivo. Não persista HTML arbitrário nem permita que alterações em um breakpoint/template destruam os demais.
- A composição “desktop no navegador mobile” deve ser explícita e independente das compactações mobile/tablet; mobile normal e tablet devem continuar com apresentações apropriadas.
- Antes de remover estilos, seletores, fallback ou fluxo antigo, confirme que o substituto está implementado e validado.
- Ao concluir cada etapa da Página Pública de Vendas, atualize `docs/REPLIT_AGENT_STATUS.md` com mudanças, decisões, verificações, erros, pendências e o próximo passo exato, deixando contexto suficiente para um Remix futuro continuar sem depender do histórico do chat.

## Validação

- Usar `pnpm check` e `pnpm build` após as etapas de código pertinentes.
- Validar separadamente página pública, experiência administrativa, breakpoints e fluxos comerciais afetados; não declarar cenários não executados como aprovados.
- A prévia pode usar `DEMO_PREVIEW=1`; confirmar o modo de dados antes de qualquer teste que possa gravar no banco remoto.
- Não executar migrations nem alterar dados de produção como parte de uma refatoração visual.
- O projeto usa pnpm e `pnpm-lock.yaml`. Instalação/atualização de pacotes deve seguir o gerenciador de pacotes do workspace e manter manifesto e lockfile coerentes. Não contorne bloqueios de segurança do registry; atualize a dependência direta que traz o pacote vulnerável.
- A baseline inicial tinha assertions de teste dependentes de markup antigo. Se a estrutura renderizada mudar de forma intencional, atualize essas assertions para validar o contrato atual e mantenha verificações de comportamento/ordem.