import { describe, expect, it } from "vitest";
import Home from "../client/src/pages/Home";
import {
  resolvePublicSalesTemplate,
  PUBLIC_SALES_TEMPLATE_REGISTRY,
} from "../client/src/pages/PublicSalesTemplateRegistry";

describe("public sales template registry", () => {
  it("shares the existing Home component across all registered templates", () => {
    expect(PUBLIC_SALES_TEMPLATE_REGISTRY.official.component).toBe(Home);
    expect(PUBLIC_SALES_TEMPLATE_REGISTRY.premium.component).toBe(Home);
    expect(PUBLIC_SALES_TEMPLATE_REGISTRY.journey.component).toBe(Home);
  });

  it("applies each visual wrapper and defaults unknown ids to official", () => {
    expect(resolvePublicSalesTemplate("official").wrapper).toBeNull();
    expect(resolvePublicSalesTemplate("premium").wrapper).toEqual({
      className: "public-sales-premium-preview real-public-sales-preview",
      dataPublicTemplate: "premium",
    });
    expect(resolvePublicSalesTemplate("journey").wrapper).toEqual({
      className: "public-sales-journey-template",
      dataPublicTemplate: "journey",
    });
    expect(resolvePublicSalesTemplate("unknown").id).toBe("official");
  });
});