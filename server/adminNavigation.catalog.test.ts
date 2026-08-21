import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const adminNavigationSource = readFileSync(new URL("../client/src/lib/adminNavigation.ts", import.meta.url), "utf8");

describe("navegação administrativa", () => {
  it("não expõe a curadoria de produtos removida", () => {
    expect(adminNavigationSource).not.toContain('path: "/admin/produtos"');
    expect(adminNavigationSource).not.toContain('label: "Catálogo"');
    expect(appSource).not.toContain('component={AdminProducts}');
  });

  it("normaliza catálogos locais administrativos no layout compartilhado", () => {
    const layoutSource = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");
    expect(adminNavigationSource).toContain("export function isAdminNavigation");
    expect(layoutSource).toContain('import { adminMenu, isAdminNavigation } from "@/lib/adminNavigation"');
    expect(layoutSource).toContain("isAdminNavigation(menuItems)");
    expect(layoutSource).toContain("? adminMenu");
  });
});
