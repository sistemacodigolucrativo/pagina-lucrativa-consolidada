import { describe, expect, it } from "vitest";
import { normalizeAffiliateSlug } from "./affiliateAttribution";

describe("normalizeAffiliateSlug", () => {
  it("normaliza um identificador válido usado no link público", () => {
    expect(normalizeAffiliateSlug("  Admin-Pagina  ")).toBe("admin-pagina");
  });

  it("recusa valores que não podem atribuir pedidos", () => {
    expect(normalizeAffiliateSlug("admin pagina")).toBeNull();
    expect(normalizeAffiliateSlug("ab")).toBeNull();
    expect(normalizeAffiliateSlug(null)).toBeNull();
  });
});
