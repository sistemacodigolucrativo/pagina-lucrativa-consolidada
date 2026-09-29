export const PUBLIC_PAGE_TEMPLATE_CATEGORY = "public-sales-layout";
export const PUBLIC_PAGE_TEMPLATE_RESOURCE = "template";

export const PUBLIC_PAGE_TEMPLATES = ["official", "premium"] as const;
export type PublicPageTemplate = (typeof PUBLIC_PAGE_TEMPLATES)[number];

export const DEFAULT_PUBLIC_PAGE_TEMPLATE: PublicPageTemplate = "official";

export function normalizePublicPageTemplate(
  value: unknown
): PublicPageTemplate {
  return value === "premium" ? "premium" : DEFAULT_PUBLIC_PAGE_TEMPLATE;
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
