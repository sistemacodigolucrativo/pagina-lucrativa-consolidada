import { describe, expect, it } from "vitest";
import { memberOfficeModuleCount, memberOfficeNavigation } from "../shared/memberOfficeContent";

describe("memberOfficeNavigation", () => {
  it("keeps the audited office groups and unique internal routes", () => {
    const labels = memberOfficeNavigation.map(group => group.label);
    const paths = memberOfficeNavigation.flatMap(group => group.items.map(item => item.path));

    expect(labels).toEqual([
      "Minha conta",
      "Comece por aqui",
      "Comunicação",
      "Minha operação",
      "Conteúdos e materiais",
      "Academia",
    ]);
    expect(memberOfficeModuleCount).toBe(51);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(expect.arrayContaining([
      "/membros/mensagem-especial",
      "/membros/operacao",
      "/membros/campanhas",
      "/membros/curso-google-ads",
      "/membros/filmes",
      "/membros/fale-conosco",
      "/membros/curso-capas-3d",
      "/membros/curso-dominio-estrategico",
    ]));
  });

  it("does not seed private account values or customer testimonials", () => {
    const serializedNavigation = JSON.stringify(memberOfficeNavigation).toLowerCase();

    expect(serializedNavigation).not.toContain("@live.com");
    expect(serializedNavigation).not.toContain("depoimento de cliente");
    expect(serializedNavigation).not.toContain("r$ 100,00");
  });
});
