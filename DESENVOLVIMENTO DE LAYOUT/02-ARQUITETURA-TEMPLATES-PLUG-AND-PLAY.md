# Arquitetura — Templates Plug and Play

## Objetivo

Evoluir a Página Pública de Vendas para um sistema de templates plug and play, responsivo, editável e seguro.

O objetivo não é duplicar páginas. O objetivo é permitir que diferentes apresentações visuais consumam o mesmo conteúdo e as mesmas funcionalidades.

## Princípio central

Conteúdo é uma coisa. Template é outra.

O conteúdo deve ser único e compartilhado.

O template deve controlar apenas a apresentação visual.

Se o texto do hero for alterado, todos os templates devem usar o mesmo texto atualizado.

Se um novo template for ativado, ele deve receber os mesmos dados já cadastrados, sem exigir recadastro manual.

## Arquitetura-alvo

```text
Página Pública de Vendas
├── Conteúdo canônico
│   ├── textos
│   ├── imagens
│   ├── links
│   ├── botões
│   ├── apresentador
│   ├── FAQ
│   ├── prova social
│   └── dados comerciais
│
├── Registry de templates
│   ├── official
│   ├── premium
│   └── futuros templates
│
├── Template ativo
│   ├── desktop
│   ├── tablet
│   └── mobile
│
├── Layout persistido
│   ├── template
│   ├── breakpoint
│   ├── ordem
│   ├── posição
│   ├── tamanho
│   ├── visibilidade
│   └── variações visuais permitidas
│
└── Funcionalidades permanentes
    ├── cadastro/pedido
    ├── indicação/referral
    ├── métricas/tracking
    ├── prova social
    ├── WhatsApp/redes sociais
    ├── SEO
    └── segurança
```

## Estrutura de pastas recomendada

```text
client/src/public-sales/
├── core/
│   ├── PublicSalesPage.tsx
│   ├── PublicSalesProvider.tsx
│   ├── resolvePublicSalesContent.ts
│   ├── resolvePublicSalesMode.ts
│   └── publicSalesTypes.ts
│
├── templates/
│   ├── registry.ts
│   ├── official/
│   │   ├── OfficialTemplate.tsx
│   │   ├── official.template.ts
│   │   └── official.css
│   ├── premium/
│   │   ├── PremiumTemplate.tsx
│   │   ├── premium.template.ts
│   │   └── premium.css
│   └── _shared/
│       ├── PublicSalesButton.tsx
│       ├── PublicSalesHeroMedia.tsx
│       ├── PublicSalesPresenterBar.tsx
│       ├── PublicSalesSocialProof.tsx
│       └── PublicSalesFooter.tsx
│
├── editor/
│   ├── PublicVisualEditorRuntime.tsx
│   ├── PublicVisualSelectionLayer.tsx
│   ├── PublicVisualDragEngine.ts
│   ├── PublicVisualResizeEngine.ts
│   └── PublicVisualPersistence.ts
│
└── styles/
    ├── public-sales-base.css
    ├── public-sales-editor.css
    └── public-sales-desktop-mode.css
```

## Contrato técnico do template

Cada template deve exportar um manifesto.

```ts
export type PublicSalesTemplateManifest = {
  id: PublicPageTemplate;
  label: string;
  version: number;
  component: React.ComponentType<PublicSalesTemplateProps>;
  supportedBreakpoints: Array<"desktop" | "tablet" | "mobile">;
  defaultBreakpoint: "desktop" | "tablet" | "mobile";
  cssScope: string;
  editableSections: PublicSalesEditableSection[];
};
```

Cada template recebe os mesmos dados:

```ts
export type PublicSalesTemplateProps = {
  content: PublicSalesContentSnapshot;
  presenter: PublicPresenterSnapshot | null;
  socialProof: PublicSocialProofSnapshot;
  activeBreakpoint: "desktop" | "tablet" | "mobile";
  layout: PublicVisualLayout | null;
  editorMode: boolean;
};
```

## Conteúdo canônico

Criar um snapshot normalizado para a página pública.

```ts
export type PublicSalesContentSnapshot = {
  hero: {
    kicker: string;
    title: string;
    description: string;
    trust: string;
    primaryCta: string;
    secondaryCta: string;
    heroImage: PublicImage | null;
  };
  structureShowcase: {
    eyebrow: string;
    title: string;
    description: string;
    image: PublicImage | null;
  };
  structureSummary: {
    groups: Array<{
      title: string;
      items: string[];
    }>;
  };
  package: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  socialProof: {
    eyebrow: string;
    title: string;
    description: string;
  };
  editorialSections: PublicEditorialSection[];
  fit: PublicFitSection;
  objections: PublicObjectionSection;
  offer: PublicOfferSection;
  footer: PublicFooterSection;
};
```

Esse snapshot deve ser montado uma vez e entregue ao template ativo.

Nenhum template deve buscar diretamente textos hardcoded sem passar pelo snapshot.

## Regra sobre textos iguais em todos os templates

Os mesmos textos devem alimentar todos os templates.

Exemplo:

- Template Oficial usa `content.hero.title`.
- Template Premium usa `content.hero.title`.
- Futuro Template 3 usa `content.hero.title`.

Nenhum template deve ter uma versão própria do mesmo texto.

Se for necessário um texto exclusivo de um template, ele deve ser tratado como exceção explícita no schema, não como duplicação silenciosa.

## Sistema de registry

Criar um registry de templates.

```ts
export const publicSalesTemplateRegistry = {
  official: officialTemplateManifest,
  premium: premiumTemplateManifest,
} satisfies Record<PublicPageTemplate, PublicSalesTemplateManifest>;
```

Para adicionar um template novo:

1. Criar pasta do template.
2. Criar componente visual.
3. Criar CSS escopado.
4. Criar manifesto.
5. Registrar no registry.
6. Validar contrato.
7. Template aparece no painel administrativo.

## Política de breakpoints

Definir breakpoints canônicos.

```ts
export const PUBLIC_SALES_BREAKPOINTS = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1199 },
  desktop: { min: 1200, max: null },
} as const;
```

Esses breakpoints devem ser usados por:

- renderização pública;
- editor visual;
- persistência de layout;
- validação;
- prévia administrativa;
- modo desktop em navegador mobile.

## Modo desktop real x desktop em navegador mobile

Problema atual observado: a visualização em “modo desktop” do Chrome no celular não fica igual à visualização em um notebook real.

Regra obrigatória:

Quando o usuário solicitar “versão para computador” no navegador mobile, a página deve exibir a composição desktop real, não uma versão intermediária quebrada.

A solução deve criar um resolvedor de modo visual.

```ts
export type PublicSalesPresentationMode =
  | "mobile"
  | "tablet"
  | "desktop"
  | "desktop-on-mobile";
```

Comportamento esperado:

- Mobile normal: usar layout mobile.
- Tablet normal: usar layout tablet.
- Desktop real: usar layout desktop.
- Chrome mobile em modo desktop: usar layout desktop real.

Para `desktop-on-mobile`, a página deve usar a mesma composição do desktop real.

Opções técnicas aceitáveis:

1. Renderizar canvas desktop com largura base fixa, por exemplo 1366px, e permitir escala visual.
2. Forçar `min-width` desktop da página pública quando o navegador estiver em modo desktop mobile.
3. Desativar runtimes mobile/tablet que compactam cabeçalho ou reorganizam seções.
4. Usar classe explícita no `documentElement`, por exemplo `public-sales-desktop-mode`.

A implementação final deve evitar que `max-width: 900px`, compact header, grids mobile ou stacking de tablet afetem o modo desktop em navegador mobile.

## Editor visual

O editor deve operar sobre IDs estáveis, não sobre seletores frágeis.

Cada elemento editável deve ter um identificador canônico.

Exemplo:

```ts
hero.title
hero.description
hero.primaryCta
hero.media
package.description
package.item.1
socialProof.memberCount
```

O template decide onde esse elemento aparece.

O editor altera o elemento lógico, não apenas o DOM atual.

## Persistência

A persistência deve ser separada:

1. Conteúdo textual e imagens.
2. Layout por template e breakpoint.
3. Configuração do template ativo.
4. Modo visual do editor.

Estrutura desejada:

```text
public-sales-copy
public-sales-template
public-sales-layout:{template}:{breakpoint}
public-sales-editor-mode
public-sales-assets
```

## Proibição técnica

Não duplicar textos dentro dos templates.

Não criar template copiando `Home.tsx` inteiro e alterando manualmente.

Não criar uma página diferente para cada template com lógica comercial duplicada.

Não permitir que o editor salve HTML bruto inseguro.

Não permitir que edição visual destrua responsividade.

## Critério de aceite da arquitetura

A arquitetura estará correta quando:

1. Um novo template puder ser registrado sem reescrever a página pública.
2. Todos os templates usarem o mesmo conteúdo canônico.
3. O template ativo puder ser trocado no painel administrativo.
4. Desktop, tablet e mobile tiverem regras claras.
5. Desktop em navegador mobile reproduzir a composição do desktop real.
6. O editor visual persistir layout por template e breakpoint.
7. O sistema comercial continuar funcionando sem duplicação de lógica.
