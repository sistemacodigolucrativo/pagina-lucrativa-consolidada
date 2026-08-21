import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("navegação administrativa contextual", () => {
  it("mantém uma entrada única para catálogo e inclui a supervisão de comunicações", () => {
    const navigation = read("client/src/lib/adminNavigation.ts");
    expect(navigation).toContain('label: "Comunicações", path: "/admin/comunicacoes"');
    expect(navigation).not.toContain('path: "/admin/produtos"');
    expect(navigation).not.toContain('label: "Catálogo"');
  });

  it("aplica a navegação administrativa aos módulos de pedidos, financeiro e comunicações", () => {
    for (const page of ["AdminApplications.tsx", "AdminTransactions.tsx", "AdminCommunications.tsx"]) {
      const source = read(`client/src/pages/${page}`);
      expect(source).toContain('import { adminMenu } from "@/lib/adminNavigation"');
      expect(source).toContain("menuItems={adminMenu}");
    }
  });
});
