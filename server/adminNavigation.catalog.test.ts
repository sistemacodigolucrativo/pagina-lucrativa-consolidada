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

  it("normaliza catálogos locais administrativos no layout compartilhado", () => {
    const layoutSource = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");
    expect(adminNavigationSource).toContain("export function isAdminNavigation");
    expect(layoutSource).toContain('import { adminMenu, isAdminNavigation } from "@/lib/adminNavigation"');
    expect(layoutSource).toContain("isAdminNavigation(menuItems)");
    expect(layoutSource).toContain("? adminMenu");
  });
});
