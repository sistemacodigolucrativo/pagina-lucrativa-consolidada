import { describe, expect, it } from "vitest";
import { isPublicConversionRoute } from "./publicRoutes";

describe("public conversion routes", () => {
  it("allows the public landing and public information pages", () => {
    for (const path of [
      "/",
      "/acesso",
      "/personalizar",
      "/institucional",
      "/termos-de-uso",
      "/politica-de-privacidade",
      "/regras-comerciais",
      "/perguntas-frequentes",
      "/contato?source=footer",
    ]) expect(isPublicConversionRoute(path)).toBe(true);
  });

  it("excludes private, administrative, preview and unknown routes", () => {
    for (const path of [
      "/membros",
      "/membros/ebooks",
      "/admin",
      "/admin/preview",
      "/preview",
      "/pedido/acompanhar",
      "/pedido/ABC/pagamento",
      "/404",
      "/nao-existe",
    ]) expect(isPublicConversionRoute(path)).toBe(false);
  });
});
