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
    expect(navigation).not.toContain('label: "Divulgação"');
    expect(navigation).not.toContain('path: "/admin/divulgacao"');
    expect(navigation).toContain('label: "Suporte", path: "/admin/suporte"');
    expect(navigation).toContain('label: "Auditoria", path: "/admin/auditoria"');
    expect(navigation).toContain('label: "Configurações", path: "/admin/configuracoes"');
    expect(navigation).not.toContain('label: "Pedidos"');
    expect(navigation).not.toContain('path: "/admin/pedidos"');
    expect(navigation).not.toContain('label: "Financeiro"');
    expect(navigation).not.toContain('path: "/admin/financeiro"');
    expect(navigation).not.toContain('label: "Operação"');
    expect(navigation).not.toContain('label: "Central de manutenção"');
    expect(navigation).not.toContain('label: "Relatos"');
    expect(navigation).not.toContain('label: "Pontuação"');
    expect(navigation).not.toContain('path: "/admin/produtos"');
    expect(navigation).not.toContain('label: "Catálogo"');
  });

  it("aplica a navegação administrativa aos módulos ativos", () => {
    for (const page of ["AdminCommunications.tsx"]) {
      const source = read(`client/src/pages/${page}`);
      expect(source).toContain('import { adminMenu } from "@/lib/adminNavigation"');
      expect(source).toContain("menuItems={adminMenu}");
    }
  });

  it("mantém Publicações como CMS oficial e separa suporte, divulgação e auditoria", () => {
    const app = read("client/src/App.tsx");
    const legacyOperations = read("client/src/pages/AdminOperations.tsx");
    const adminOffice = read("client/src/pages/AdminOffice.tsx");
    expect(app).toContain('path="/admin/publicacoes" component={AdminPublications}');
    expect(app).toContain('path="/admin/divulgacao" component={AdminOperations}');
    expect(app).not.toContain('component={AdminOutreach}');
    expect(app).toContain('path="/admin/suporte" component={AdminSupport}');
    expect(app).toContain('path="/admin/auditoria" component={AdminAudit}');
    expect(app).toContain('path="/admin/configuracoes" component={AdminSettings}');
    expect(app).toContain('path="/admin/pedidos" component={AdminOperations}');
    expect(app).toContain('path="/admin/financeiro" component={AdminOperations}');
    expect(app).not.toContain('component={AdminTransactions}');
    expect(app).not.toContain('component={AdminApplications}');
    expect(legacyOperations).toContain("Módulo administrativo removido");
    expect(legacyOperations).toContain('setLocation("/admin")');
    expect(legacyOperations).not.toContain("createContent");
    expect(legacyOperations).not.toContain("updateContentStatus");
    expect(adminOffice).not.toContain("trpc.admin.contacts");
    expect(adminOffice).not.toContain("capturedContacts");
    expect(adminOffice).not.toContain("/admin/divulgacao");
  });
});
