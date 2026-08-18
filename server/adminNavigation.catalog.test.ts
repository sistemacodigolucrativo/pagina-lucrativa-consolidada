import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const adminOfficeSource = readFileSync(new URL("../client/src/pages/AdminOffice.tsx", import.meta.url), "utf8");

describe("navegação administrativa", () => {
  it("direciona Catálogo para a manutenção de produtos com rota registrada", () => {
    expect(adminOfficeSource).toContain('label: "Catálogo", path: "/admin/produtos"');
    expect(adminOfficeSource).not.toContain('path: "/admin/catalogo"');
    expect(appSource).toContain('<Route path="/admin/produtos" component={AdminProducts} />');
  });
});
