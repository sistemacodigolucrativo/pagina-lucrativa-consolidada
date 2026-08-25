import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("navegação administrativa contextual", () => {
  it("mantém uma entrada única para catálogo e inclui a supervisão de comunicações", () => {
    const navigation = read("client/src/lib/adminNavigation.ts");
    expect(navigation).toContain('label: "Comunicações", path: "/admin/comunicacoes"');
    expect(navigation).toContain('label: "Dashboard", path: "/admin"');
    expect(navigation).toContain('label: "Divulgação", path: "/admin/divulgacao"');
    expect(navigation).toContain('label: "Suporte", path: "/admin/suporte"');
    expect(navigation).toContain('label: "Auditoria", path: "/admin/auditoria"');
    expect(navigation).toContain('label: "Configurações", path: "/admin/configuracoes"');
    expect(navigation).not.toContain('label: "Operação"');
    expect(navigation).not.toContain('label: "Central de manutenção"');
    expect(navigation).not.toContain('label: "Relatos"');
    expect(navigation).not.toContain('label: "Pontuação"');
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

  it("mantém Publicações como CMS oficial e separa suporte, divulgação e auditoria", () => {
    const app = read("client/src/App.tsx");
    const legacyOperations = read("client/src/pages/AdminOperations.tsx");
    expect(app).toContain('path="/admin/publicacoes" component={AdminPublications}');
    expect(app).toContain('path="/admin/divulgacao" component={AdminOutreach}');
    expect(app).toContain('path="/admin/suporte" component={AdminSupport}');
    expect(app).toContain('path="/admin/auditoria" component={AdminAudit}');
    expect(app).toContain('path="/admin/configuracoes" component={AdminSettings}');
    expect(legacyOperations).toContain('setLocation("/admin")');
    expect(legacyOperations).not.toContain("createContent");
    expect(legacyOperations).not.toContain("updateContentStatus");
  });
});
