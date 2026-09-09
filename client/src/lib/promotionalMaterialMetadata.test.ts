import { describe, expect, it } from "vitest";
import { composePromotionalMaterialBody, isDirectImageUrl, isHttpsUrl, splitPromotionalMaterialBody } from "./promotionalMaterialMetadata";

describe("promotional material metadata", () => {
  it("preserva conteúdos antigos sem metadados", () => {
    expect(splitPromotionalMaterialBody("Descrição antiga")).toEqual({ body: "Descrição antiga", imageUrl: "" });
  });

  it("grava e recupera a imagem sem expor o marcador no corpo", () => {
    const stored = composePromotionalMaterialBody("Descrição completa", "https://cdn.example.com/banner.jpg");
    expect(stored).toContain("CL_PROMO_META");
    expect(splitPromotionalMaterialBody(stored)).toEqual({
      body: "Descrição completa",
      imageUrl: "https://cdn.example.com/banner.jpg",
    });
  });

  it("aceita links HTTPS diretos de imagem e rejeita páginas genéricas", () => {
    expect(isDirectImageUrl("https://cdn.example.com/banner.PNG?version=2")).toBe(true);
    expect(isDirectImageUrl("https://cdn.example.com/banner.webp#preview")).toBe(true);
    expect(isDirectImageUrl("http://cdn.example.com/banner.jpg")).toBe(false);
    expect(isDirectImageUrl("https://example.com/pagina")).toBe(false);
  });

  it("valida links HTTPS de download", () => {
    expect(isHttpsUrl("https://example.com/download?id=1")).toBe(true);
    expect(isHttpsUrl("http://example.com/download?id=1")).toBe(false);
  });
});
