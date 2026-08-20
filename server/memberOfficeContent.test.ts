import { describe, expect, it } from "vitest";
import { memberOfficeModuleCount, memberOfficeNavigation } from "../shared/memberOfficeContent";

describe("memberOfficeNavigation", () => {
  const labelsFromNavigation = () => memberOfficeNavigation.map(group => group.label);
  const itemsFor = (groupLabel: string) => memberOfficeNavigation.find(group => group.label === groupLabel)?.items.map(item => item.path) ?? [];
  it("keeps the audited office groups and unique internal routes", () => {
    const labels = memberOfficeNavigation.map(group => group.label);
    const paths = memberOfficeNavigation.flatMap(group => group.items.map(item => item.path));

    expect(labels).toEqual([
      "Início",
      "Minha página",
      "Vendas & Rede",
      "Divulgação & Contatos",
      "Conteúdos & Materiais",
      "Academia",
      "Desempenho",
      "Ajuda",
    ]);
    expect(memberOfficeModuleCount).toBe(29);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(expect.arrayContaining([
      "/membros/mensagem-especial",
      "/membros/operacao",
      "/membros/pontos",
      "/membros/ebooks",
      "/membros/fale-conosco",
    ]));
    expect(paths).not.toContain("/membros/curso-capas-3d");
    expect(paths).not.toContain("/membros/curso-dominio-estrategico");
  });

  it("organizes the member journey in the recommended order", () => {
    expect(labelsFromNavigation()).toEqual([
      "Início",
      "Minha página",
      "Vendas & Rede",
      "Divulgação & Contatos",
      "Conteúdos & Materiais",
      "Academia",
      "Desempenho",
      "Ajuda",
    ]);
    expect(itemsFor("Vendas & Rede")).toEqual([
      "/membros/meus-pedidos",
      "/membros/ganhos",
      "/membros/rede",
      "/membros/convites",
      "/membros/patrocinador",
      "/membros/produtos",
    ]);
    expect(itemsFor("Divulgação & Contatos")).toEqual([
      "/membros/automacoes",
    ]);
  });

  it("does not seed private account values or customer testimonials", () => {
    const serializedNavigation = JSON.stringify(memberOfficeNavigation).toLowerCase();

    expect(serializedNavigation).not.toContain("@live.com");
    expect(serializedNavigation).not.toContain("depoimento de cliente");
    expect(serializedNavigation).not.toContain("r$ 100,00");
  });
});
