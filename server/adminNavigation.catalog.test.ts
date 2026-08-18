import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const adminNavigationSource = readFileSync(new URL("../client/src/lib/adminNavigation.ts", import.meta.url), "utf8");

describe("navegação administrativa", () => {
  it("direciona Catálogo para a manutenção de produtos com rota registrada", () => {
    expect(adminNavigationSource).toContain('label: "Catálogo", path: "/admin/produtos"');
    expect(adminNavigationSource).not.toContain('path: "/admin/catalogo"');
    expect(appSource).toContain('<Route path="/admin/produtos" component={AdminProducts} />');
  });
});
