export const PUBLIC_PAGE_TEMPLATE_CATEGORY = "public-sales-layout";
export const PUBLIC_PAGE_TEMPLATE_RESOURCE = "template";

export const PUBLIC_PAGE_TEMPLATES = ["official", "premium"] as const;
export type PublicPageTemplate = (typeof PUBLIC_PAGE_TEMPLATES)[number];

export const PUBLIC_PAGE_TEMPLATE_REGISTRY = {
  official: {
    label: "Template Oficial",
    description: "Apresentação padrão da página pública de vendas.",
  },
  premium: {
    label: "Template Premium",
    description:
      "Apresentação premium da mesma página, com conteúdo e funcionalidades compartilhados.",
  },
} as const satisfies Record<
  PublicPageTemplate,
  { label: string; description: string }
>;

export const DEFAULT_PUBLIC_PAGE_TEMPLATE: PublicPageTemplate = "official";

export function normalizePublicPageTemplate(
  value: unknown
): PublicPageTemplate {
  return typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PUBLIC_PAGE_TEMPLATE_REGISTRY, value)
    ? (value as PublicPageTemplate)
    : DEFAULT_PUBLIC_PAGE_TEMPLATE;
}

export function getPublicPageTemplateDefinition(value: unknown) {
  const id = normalizePublicPageTemplate(value);
  return { id, ...PUBLIC_PAGE_TEMPLATE_REGISTRY[id] };
}

export function parsePublicPageTemplateConfig(
  body: string | null | undefined
): PublicPageTemplate {
  if (!body) return DEFAULT_PUBLIC_PAGE_TEMPLATE;
  try {
    const parsed = JSON.parse(body) as {
      activeTemplate?: unknown;
      template?: unknown;
    };
    return normalizePublicPageTemplate(
      parsed.activeTemplate ?? parsed.template
    );
  } catch {
    return DEFAULT_PUBLIC_PAGE_TEMPLATE;
  }
}
