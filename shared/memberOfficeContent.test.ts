import { describe, expect, it } from "vitest";
import { memberOfficeModuleCount, memberOfficeNavigation } from "./memberOfficeContent";

describe("catálogo do Escritório Virtual", () => {
  it("mantém as rotas de recebimento e pedidos próprios disponíveis para qualquer titular", () => {
    const paths = memberOfficeNavigation.flatMap(group => group.items.map(item => item.path));
    expect(memberOfficeModuleCount).toBe(35);
    expect(paths).toContain("/membros/recebimentos");
    expect(paths).toContain("/membros/meus-pedidos");
    expect(paths).toContain("/membros/fale-conosco");
    expect(paths).not.toContain("/membros/curso-capas-3d");
    expect(paths).not.toContain("/membros/curso-dominio-estrategico");
  });
});
