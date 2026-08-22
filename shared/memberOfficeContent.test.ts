import { describe, expect, it } from "vitest";
import { memberOfficeModuleCount, memberOfficeNavigation } from "./memberOfficeContent";

describe("catálogo do Escritório Virtual", () => {
  it("mantém uma navegação enxuta, sem ferramentas duplicadas", () => {
    const paths = memberOfficeNavigation.flatMap(group => group.items.map(item => item.path));
    expect(memberOfficeModuleCount).toBe(17);
    expect(memberOfficeNavigation.flatMap(group => group.items)).toContainEqual({
      icon: "operation",
      label: "Central de Divulgação",
      path: "/membros/operacao",
    });
    expect(paths).toContain("/membros/como-divulgar");
    expect(paths).toContain("/membros/operacao");
    expect(paths).toContain("/membros/recebimentos");
    expect(paths).toContain("/membros/meus-pedidos");
    expect(paths).toContain("/membros/fale-conosco");
    expect(paths).not.toContain("/membros/mensagem-especial");
    expect(paths).not.toContain("/membros/produtos");
    expect(paths).not.toContain("/membros/automacoes");
    expect(paths).not.toContain("/membros/ranking");
    expect(paths).not.toContain("/membros/patrocinador");
  });
});
