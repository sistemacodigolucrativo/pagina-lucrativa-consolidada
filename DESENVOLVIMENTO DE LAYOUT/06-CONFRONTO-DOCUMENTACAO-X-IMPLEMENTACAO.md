# Confronto — Documentação x Implementação Atual

## Objetivo

Confrontar a documentação da pasta `DESENVOLVIMENTO DE LAYOUT` com o estado atual da branch `main` após as atualizações aplicadas.

Este documento lista somente pontos que ainda necessitam de atenção. Itens que já estão coerentes com a documentação não foram repetidos.

## Escopo analisado

Base documental:

- `00-INDICE.md`
- `01-MAPEAMENTO-LAYOUT-PAGINA-PUBLICA.md`
- `02-ARQUITETURA-TEMPLATES-PLUG-AND-PLAY.md`
- `03-PLANO-DE-ACAO.md`
- `04-ROADMAP.md`
- `05-CHECKLIST-DE-VALIDACAO.md`

Arquivos de implementação observados:

- `client/src/pages/PublicHome.tsx`
- `client/src/pages/PublicSalesTemplateRegistry.tsx`
- `client/src/pages/Home.tsx`
- `client/src/pages/AdminSalesImages.tsx`
- `client/src/components/PublicSalesCopyRuntime.tsx`
- `client/src/components/PublicMobileCompactHeaderRuntime.tsx`
- `client/src/lib/publicSalesPresentation.ts`
- `shared/publicPageTemplate.ts`
- `shared/publicSalesContent.ts`
- `shared/publicSalesPresentation.ts`
- `shared/publicVisualEditor.ts`
- CSS público, CSS premium, CSS journey, CSS global e CSS administrativo relacionados

## Limitação da análise

A análise foi feita por leitura estática do código no GitHub. Não foi executado build, typecheck, teste automatizado nem validação visual em navegador real.

---

## 1. Registry de templates existe, mas ainda não é plug and play completo

### Situação encontrada

A implementação já possui `PublicSalesTemplateRegistry.tsx` e `shared/publicPageTemplate.ts`, com templates `official`, `premium` e `journey`.

Porém os templates ainda usam o mesmo componente base `Home` e variam principalmente por wrapper/CSS.

Isso resolve parte da seleção de template, mas ainda não entrega um sistema plug and play completo como descrito na documentação.

### Por que ainda precisa de atenção

A documentação prevê templates com contrato próprio, manifesto, escopo CSS, breakpoints suportados e seções editáveis. A implementação atual ainda está próxima de um modelo de skin visual sobre a mesma árvore.

### Correção recomendada

Criar uma camada real de templates em estrutura própria, por exemplo:

```text
client/src/public-sales/
├── core/
├── templates/
│   ├── registry.ts
│   ├── official/
│   ├── premium/
│   └── journey/
├── editor/
└── styles/
```

Cada template deve possuir manifesto próprio:

```ts
export type PublicSalesTemplateManifest = {
  id: PublicPageTemplate;
  label: string;
  description: string;
  component: React.ComponentType<PublicSalesTemplateProps>;
  cssScope: string;
  supportedBreakpoints: Array<"desktop" | "tablet" | "mobile">;
  editableSections: PublicSalesEditableSection[];
};
```

Manter `Home` temporariamente como adaptador de compatibilidade é aceitável, desde que fique explícito que ele será substituído gradualmente por componentes de template.

---

## 2. Snapshot de conteúdo ainda está parcial

### Situação encontrada

Foi criado `shared/publicSalesContent.ts`, com `PublicSalesContentSnapshot`, `resolvePublicSalesContent()`, valores por seção, itens derivados de package, fit e objections.

Isso é avanço importante.

Porém o snapshot ainda é genérico e parcial. A página `Home.tsx` continua concentrando dados e regras que deveriam estar no contrato público:

- navegação pública;
- textos de botões;
- footer;
- slides do carrossel;
- dados do apresentador;
- imagens resolvidas por seção;
- prova social;
- estado de login;
- oferta/formulário;
- parte dos fallbacks visuais.

### Por que ainda precisa de atenção

A documentação estabelece que os templates devem receber o mesmo conteúdo canônico e apenas decidir como exibir esse conteúdo.

Enquanto `Home.tsx` continuar misturando conteúdo, dados dinâmicos, fallback, estrutura e apresentação, novos templates ainda dependerão de copiar ou reaproveitar a mesma árvore.

### Correção recomendada

Expandir o contrato para dois níveis:

1. `PublicSalesContentSnapshot`: conteúdo editável e estático normalizado.
2. `PublicSalesRuntimeData`: dados dinâmicos carregados em runtime.

Exemplo:

```ts
export type PublicSalesPageData = {
  content: PublicSalesContentSnapshot;
  presenter: PublicPresenterSnapshot | null;
  sectionImages: PublicSectionImageMap;
  socialProof: PublicSocialProofSnapshot;
  session: PublicSessionSnapshot;
  actions: PublicSalesActions;
};
```

Depois disso, `Home`/templates devem receber `PublicSalesPageData` e parar de buscar diretamente textos/fallbacks internos sempre que possível.

---

## 3. Modo desktop no Chrome mobile ainda pode cair em breakpoint tablet

### Situação encontrada

Existe `shared/publicSalesPresentation.ts` com o modo `desktop-on-mobile`.

Porém o cálculo atual define `visualBreakpoint` antes de detectar `desktop-on-mobile`.

Com isso, em um celular usando “versão para computador”, se o viewport CSS ficar entre `901px` e `980px`, o modo pode ser `desktop-on-mobile`, mas o `visualBreakpoint` continua `tablet`.

### Por que ainda precisa de atenção

A documentação exige que “desktop mobile” reproduza a composição do desktop real. Se o modo é `desktop-on-mobile`, o breakpoint visual não deve continuar como tablet.

### Correção recomendada

Alterar `resolvePublicSalesPresentation()` para forçar desktop quando detectar `desktop-on-mobile`.

Exemplo:

```ts
if (isDesktopOnMobile) {
  return {
    mode: "desktop-on-mobile",
    visualBreakpoint: "desktop",
    compactHeader: false,
  };
}
```

Além disso:

- aplicar classe/atributo no `documentElement`;
- impedir CSS mobile/tablet nesse modo;
- criar regra de layout desktop com `min-width` ou canvas desktop controlado;
- validar lado a lado com notebook real.

---

## 4. Separação de CSS ainda está incompleta

### Situação encontrada

Ainda existem estilos públicos e de template distribuídos em arquivos como:

- `client/src/index.css`
- `client/src/home-spacing-fixes.css`
- `client/src/pages/PreviewPublicSales.css`
- `client/src/pages/PublicSalesJourneyTemplate.css`
- `client/src/public-mobile-compact-header.css`
- `client/src/pages/AdminVisualSalesEditor.css`

O template `premium` ainda depende de `PreviewPublicSales.css`. O template `journey` já possui CSS próprio, mas ainda dentro de `pages/`.

### Por que ainda precisa de atenção

A documentação pede separação clara entre:

- CSS base público;
- CSS específico de cada template;
- CSS do editor visual;
- CSS administrativo.

Enquanto isso estiver misturado, há risco de um template interferir no outro ou de patches globais quebrarem responsividade.

### Correção recomendada

Reorganizar estilos para uma estrutura controlada:

```text
client/src/public-sales/styles/public-sales-base.css
client/src/public-sales/templates/official/official.css
client/src/public-sales/templates/premium/premium.css
client/src/public-sales/templates/journey/journey.css
client/src/public-sales/editor/public-sales-editor.css
```

Regras:

- CSS global só para base compartilhada.
- CSS de template sempre escopado pelo wrapper do template.
- CSS administrativo nunca deve afetar visitante comum.
- `home-spacing-fixes.css` deve ser incorporado ao layout base ou removido depois da migração.

---

## 5. Editor visual ainda pode perder formatação rica de texto

### Situação encontrada

O editor visual usa `contenteditable="plaintext-only"` em `PublicSalesCopyRuntime.tsx`.

Também existe lógica que altera `textContent` ou troca apenas o nó de texto interno.

### Por que ainda precisa de atenção

A documentação exige preservar textos com:

- duas cores;
- spans internos;
- destaques parciais;
- hierarquia visual;
- títulos com palavra destacada;
- botões e cards sem perda de estrutura.

Com `plaintext-only`, a edição tende a remover estrutura inline e reduzir o conteúdo a texto plano.

### Correção recomendada

Substituir edição puramente plaintext por modelo seguro de rich text limitado.

Opções aceitáveis:

1. Schema de segmentos:

```ts
type PublicRichTextSegment = {
  text: string;
  mark?: "accent" | "strong" | "muted";
};
```

2. AST limitado com sanitização rígida.
3. Editor por campos estruturados, preservando spans conhecidos.

Não salvar HTML bruto livre. Salvar estrutura controlada e renderizar com componentes React.

---

## 6. Editor visual ainda depende demais de seletores e DOM atual

### Situação encontrada

`PublicSalesCopyRuntime.tsx` melhorou a identidade dos elementos usando `data-public-visual-key` e IDs estáveis/legados.

Mesmo assim, a descoberta dos elementos editáveis ainda depende de:

- `PUBLIC_SALES_COPY_SECTIONS`;
- `sectionSelector`;
- seletores de campo;
- classes como `.package-grid > article`, `.objection-grid > article`, `.testimonial-card`, `.sales-actions`.

Além disso, `AdminSalesImages.tsx` ainda contém editor antigo no iframe, baseado em clique direto, seletores e alteração de texto/imagem.

### Por que ainda precisa de atenção

A documentação pede editor visual baseado em contrato de template, não em estrutura DOM frágil.

Se um template mudar a árvore visual, esses seletores podem deixar elementos sem edição ou editar o alvo errado.

### Correção recomendada

Mover a definição de editáveis para o manifesto do template.

Exemplo:

```ts
editableSections: [
  {
    id: "hero",
    elements: [
      { id: "hero.title", kind: "text", capability: ["editText"] },
      { id: "hero.media", kind: "image", capability: ["replace", "move", "resize"] },
    ],
  },
]
```

O template deve renderizar os elementos com IDs lógicos. O editor deve ler esses IDs, não tentar descobrir tudo por classe CSS.

O editor antigo do iframe em `AdminSalesImages.tsx` deve ser depreciado ou limitado a fallback temporário.

---

## 7. Persistência de elementos flutuantes ainda está separada do layout visual principal

### Situação encontrada

Há dois modelos paralelos:

1. `FLOATING_LAYOUT_CATEGORY = "public-sales-layout"` e `resourceType = "floating"` em `AdminSalesImages.tsx`.
2. `PUBLIC_VISUAL_EDITOR_CATEGORY = "public-sales-visual-editor"` com layouts por template/breakpoint em `shared/publicVisualEditor.ts`.

Além disso, `applyFloatingLayout()` em `PublicSalesCopyRuntime.tsx` reseta `fab` e `cta`, mas o editor administrativo ainda trata esses itens como arrastáveis no iframe.

### Por que ainda precisa de atenção

A documentação pede persistência por template e breakpoint. O layout flutuante separado pode gerar divergência entre o que o admin tenta mover e o que o runtime público realmente aplica.

### Correção recomendada

Unificar elementos flutuantes dentro do layout visual por template/breakpoint.

Exemplo de IDs:

```text
floating.toast
floating.cta
floating.fab
```

Decidir uma regra clara:

- se `cta` e `fab` não devem ser movidos, remover esses controles do editor;
- se devem ser movidos, aplicar a posição salva no runtime público de forma consistente.

Não manter dois sistemas de persistência concorrentes.

---

## 8. Preview desktop do admin ainda não garante equivalência com notebook real

### Situação encontrada

No editor administrativo, o iframe usa:

- mobile: `430px`;
- tablet: `820px`;
- desktop: `100%` do container.

### Por que ainda precisa de atenção

A documentação exige validação em desktop real, principalmente notebook de 15 polegadas/Chrome desktop, e também comparação com Chrome mobile em modo desktop.

Um iframe desktop em `100%` do espaço administrativo não garante que a prévia esteja em `1280`, `1366`, `1440`, `1536` ou `1920`.

### Correção recomendada

Adicionar perfis explícitos de visualização:

```text
Desktop 1280
Desktop 1366
Desktop 1440
Desktop 1536
Desktop 1920
Tablet 820
Mobile 430
Desktop mobile / Chrome Android
```

O admin deve permitir comparar o layout em largura fixa controlada. O modo “desktop” genérico pode continuar, mas não deve ser o único critério de validação.

---

## 9. Novo template `journey` foi adicionado antes da arquitetura estar totalmente consolidada

### Situação encontrada

O template `journey` foi adicionado ao registry e possui CSS próprio.

### Por que ainda precisa de atenção

Ele ainda utiliza `Home` como componente base, portanto é um skin visual novo, não um template plug and play completo.

Isso não está errado como etapa intermediária, mas precisa ser tratado como transição para não mascarar a pendência estrutural.

### Correção recomendada

Classificar o `journey` como template de transição.

Depois da consolidação:

- criar pasta própria `templates/journey/`;
- extrair componente `JourneyTemplate.tsx`;
- mover CSS para `journey.css`;
- criar manifesto completo;
- declarar quais elementos são editáveis;
- validar desktop/tablet/mobile independentemente.

---

## 10. Checklist de validação ainda não possui evidência anexada

### Situação encontrada

Existe checklist documental, mas não há relatório de execução comprovando:

- `pnpm check`;
- `pnpm build`;
- teste em desktop real;
- teste em Chrome mobile com “versão para computador”;
- teste tablet;
- teste mobile;
- teste de troca de template;
- teste do editor visual;
- teste de preservação de formatação textual.

### Por que ainda precisa de atenção

A documentação define que a evolução só pode ser considerada concluída após validação funcional, visual e técnica.

### Correção recomendada

Criar um relatório de validação após execução real:

```text
DESENVOLVIMENTO DE LAYOUT/07-RELATORIO-DE-VALIDACAO.md
```

Esse relatório deve conter:

- ambiente testado;
- commit testado;
- comandos executados;
- resultados;
- prints ou links de evidência visual;
- problemas encontrados;
- aprovação/reprovação por bloco do checklist.

---

## Prioridade recomendada de correção

1. Corrigir `desktop-on-mobile` para forçar breakpoint desktop.
2. Consolidar manifesto real de template.
3. Expandir `PublicSalesContentSnapshot` para conteúdo/dados públicos completos.
4. Separar CSS por base/template/editor.
5. Resolver perda de formatação rica no editor.
6. Unificar persistência de layout visual e elementos flutuantes.
7. Remover dependência de seletores frágeis no editor.
8. Adicionar perfis reais de prévia desktop no admin.
9. Formalizar o template `journey` como template real.
10. Executar e documentar validação completa.

## Conclusão técnica

A atualização avançou em pontos importantes: existe snapshot inicial de conteúdo, registry de templates, terceiro template, IDs visuais mais estáveis e resolvedor de apresentação.

Ainda assim, a implementação permanece em fase intermediária. O sistema ainda não atingiu completamente o modelo plug and play descrito na documentação, principalmente por ainda depender de `Home` como árvore central, CSS distribuído, editor parcialmente baseado em seletores e snapshot de conteúdo incompleto.
