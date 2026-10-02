# Mapeamento — Layout da Página Pública de Vendas

## Objetivo

Mapear os arquivos da branch `main` que participam diretamente da renderização, configuração, edição, persistência e responsividade da Página Pública de Vendas.

## Fluxo atual resumido

`main.tsx` instala os providers e runtimes globais.

`App.tsx` define a rota `/` para `PublicHome` e a rota `/admin/imagens` para `AdminSalesSectionsPage`.

`PublicHome.tsx` consulta `usePublicSalesCopy()` e decide se a página será renderizada com wrapper premium ou sem wrapper.

`Home.tsx` contém a estrutura principal da Página Pública de Vendas.

`PublicSalesCopyRuntime.tsx` carrega copy pública, template ativo, layout visual e modo de edição visual. Também aplica alterações visuais em runtime.

`AdminSalesImages.tsx` concentra a interface administrativa de seleção de template, modo visual, iframe de prévia, edição de texto, imagens e layout.

## Arquivos principais

| Arquivo | Responsabilidade atual | Observação técnica |
|---|---|---|
| `client/src/main.tsx` | Monta React, TRPC, QueryClient, `PublicSalesCopyProvider`, `PublicSalesCopyRuntime` e `PublicMobileCompactHeaderRuntime`. | Qualquer nova arquitetura de template deve continuar passando por esse ponto sem duplicar providers. |
| `client/src/App.tsx` | Define as rotas públicas, administrativas e de membros. | A rota `/` carrega `PublicHome`; `/admin/imagens` carrega `AdminSalesSectionsPage`; `/preview` existe como rota separada. |
| `client/src/pages/PublicHome.tsx` | Decide o wrapper visual da página pública com base em `pageTemplate`. | Atualmente o template premium é um wrapper CSS sobre o mesmo `Home`, não um template independente real. |
| `client/src/pages/Home.tsx` | Estrutura real da Página Pública de Vendas. | Contém hero, faixa do apresentador, banner, card informativo, estrutura digital, prova social, pacote, blocos editoriais, FAQ, CTA final e footer. |
| `client/src/pages/PreviewPublicSales.css` | Camada visual do template premium. | Hoje funciona como skin visual; deve evoluir para parte de um template registrado, sem virar fonte de conteúdo. |
| `client/src/index.css` | CSS global e parte relevante dos estilos da aplicação. | Deve ser auditado para separar estilos globais de estilos específicos da página pública. |
| `client/src/home-spacing-fixes.css` | Correções pontuais de espaçamento da home. | Deve ser incorporado ou substituído por tokens/layout do template para evitar acúmulo de patches. |
| `client/src/public-mobile-compact-header.css` | Ajustes do cabeçalho compacto mobile. | Deve respeitar a política nova: mobile real é diferente de “modo desktop no Chrome mobile”. |
| `client/src/components/PublicMobileCompactHeaderRuntime.tsx` | Ativa classe compacta em mobile/tablet com base em `max-width: 900px` e scroll. | Precisa ser integrado à nova resolução de modo visual para não afetar indevidamente desktop em navegador mobile. |
| `client/src/components/PublicSalesCopyRuntime.tsx` | Runtime de conteúdo, template ativo, layout visual, editor visual e persistência pendente. | É o ponto mais sensível da arquitetura atual; mistura runtime público, editor administrativo e aplicação de layout. |
| `client/src/pages/AdminSalesSectionsPage.tsx` | Agrega `AdminSalesImages` e `AdminFaqManager`. | É a entrada administrativa atual equivalente ao menu de configuração visual da página. |
| `client/src/pages/AdminSalesImages.tsx` | Seleção de template, modo de edição visual, iframe, breakpoints, edição de textos, imagens e layout flutuante. | Deve ser reestruturado para operar sobre contrato de template, não sobre seletores frágeis. |
| `client/src/pages/AdminVisualSalesEditor.css` | Estilos da interface administrativa do editor visual. | Deve permanecer separado dos estilos públicos. |
| `shared/publicPageTemplate.ts` | Define templates disponíveis: `official` e `premium`. | Deve evoluir para registry/manifesto de templates. |
| `shared/publicVisualEditor.ts` | Schema do editor visual: template, breakpoint, elementos, posição, tamanho, ordem, duplicação, texto e ocultação. | Base boa para persistência, mas precisa ser desacoplada de seletores instáveis. |
| `shared/publicSalesCopyEditor.ts` | Define seções, campos, seletores e valores padrão da copy pública. | Deve virar contrato canônico de conteúdo compartilhado entre templates. |
| `server/routers.ts` | Expõe rotas TRPC públicas e administrativas. | O admin usa `content`, `createContent`, `updateContent`; o público usa imagens e prova social. |
| `server/db.ts` | Camada de persistência e acesso ao banco. | Usa `managedContent` e `publicSalesSectionImages` para conteúdo/configuração da página pública. |
| `package.json` | Dependências e scripts. | Não há biblioteca específica de drag and drop dedicada; o editor atual usa lógica própria com pointer events. |

## Estrutura pública atual

A página pública real está centralizada em `Home.tsx`.

Elementos principais:

- cabeçalho e navegação;
- faixa do apresentador/referral;
- hero;
- banner visual principal;
- card informativo de confiança;
- seção “Pronta para operar”;
- resumo “Método e estrutura / Operação organizada”;
- seção “Você recebe o método...”;
- prova social/depoimentos;
- blocos editoriais explicativos;
- seção “Para quem é / Para quem não é”;
- dúvidas/objeções;
- CTA final;
- footer.

## Estado atual do sistema de template

O sistema atual possui seleção entre `official` e `premium`, mas o template premium não é um template plug and play completo.

Atualmente:

- `PublicHome.tsx` consulta `pageTemplate`;
- se `pageTemplate === "premium"`, envolve `Home` com classes CSS premium;
- o conteúdo e a estrutura continuam vindo do mesmo `Home.tsx`;
- `PreviewPublicSales.css` altera a apresentação visual;
- não existe ainda um contrato de template independente com manifesto, assets, seções e suporte formal por breakpoint.

## Riscos encontrados no modelo atual

1. Conteúdo e layout estão acoplados em `Home.tsx`.
2. O template premium depende de CSS sobre a mesma árvore de componentes.
3. O editor visual depende de seletores e estrutura DOM específica.
4. Alterações em `Home.tsx` podem quebrar editor, copy, layout visual e template premium ao mesmo tempo.
5. O modo “desktop no Chrome mobile” pode cair em comportamento intermediário, diferente do desktop real.
6. Correções de layout estão distribuídas entre múltiplos CSS, dificultando previsibilidade.
7. O runtime público e o runtime de edição administrativa compartilham muita responsabilidade no mesmo componente.

## Direção técnica recomendada

Separar a Página Pública em quatro camadas:

1. Conteúdo canônico compartilhado.
2. Template visual plug and play.
3. Layout persistido por template e breakpoint.
4. Funcionalidades comerciais permanentes.

O conteúdo deve ser único e reaproveitado por todos os templates.

O template deve apenas definir apresentação visual, composição, grid, tokens e componentes de exibição.

As funcionalidades de pedido, tracking, indicação, prova social, FAQ, CTA e métricas não devem ser duplicadas dentro dos templates.
