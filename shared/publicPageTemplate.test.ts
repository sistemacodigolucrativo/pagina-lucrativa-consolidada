import { describe, expect, it } from "vitest";
import {
  DEFAULT_PUBLIC_PAGE_TEMPLATE,
  getPublicPageTemplateDefinition,
  normalizePublicPageTemplate,
  PUBLIC_PAGE_TEMPLATES,
  PUBLIC_PAGE_TEMPLATE_REGISTRY,
} from "./publicPageTemplate";

describe("public page template registry", () => {
  it("has metadata for every persisted template id", () => {
    expect(Object.keys(PUBLIC_PAGE_TEMPLATE_REGISTRY)).toEqual(
      PUBLIC_PAGE_TEMPLATES
    );
  });

  it("keeps invalid values on the official template", () => {
    expect(normalizePublicPageTemplate("premium")).toBe("premium");
    expect(normalizePublicPageTemplate("unknown")).toBe(
      DEFAULT_PUBLIC_PAGE_TEMPLATE
    );
    expect(getPublicPageTemplateDefinition(null)).toEqual({
      id: "official",
      ...PUBLIC_PAGE_TEMPLATE_REGISTRY.official,
    });
  });
});