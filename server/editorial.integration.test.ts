import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { appRouter } from "./routers";

describe("central editorial", () => {
  const procedures = appRouter._def.procedures;
  const root = process.env.PROJECT_ROOT || process.cwd();

  it("expõe leitura publicada ao membro e manutenção completa à administração", () => {
    expect(procedures["member.content"]).toBeDefined();
    expect(procedures["admin.content"]).toBeDefined();
    expect(procedures["admin.createContent"]).toBeDefined();
    expect(procedures["admin.updateContent"]).toBeDefined();
    expect(procedures["admin.updateContentStatus"]).toBeDefined();
  });

  it("mantém o contrato de edição com campos editoriais e estado de publicação", () => {
    const procedure = procedures["admin.updateContent"] as { _def: { inputs: Array<{ parse: (input: unknown) => unknown }> } };
    expect(procedure._def.inputs[0].parse({ id: 7, kind: "article", title: "Guia de campanha", summary: "Resumo", body: "Corpo", status: "published" })).toMatchObject({ id: 7, kind: "article", status: "published" });
    expect(() => procedure._def.inputs[0].parse({ id: 7, kind: "article", title: "x", status: "published" })).toThrow();
  });

  it("valida recursos da Biblioteca de Recursos com link HTTPS", () => {
    const procedure = procedures["admin.createContent"] as { _def: { inputs: Array<{ parse: (input: unknown) => unknown }> } };
    expect(procedure._def.inputs[0].parse({ kind: "material", title: "Automação de divulgação", summary: "Recurso externo", body: "Tutorial completo", resourceCategory: "Automação", resourceType: "Ferramenta", resourceUrl: "https://example.com/file.zip", status: "published" })).toMatchObject({ kind: "material", resourceCategory: "Automação", resourceType: "Ferramenta" });
    expect(() => procedure._def.inputs[0].parse({ kind: "material", title: "Automação", status: "published", resourceUrl: "http://example.com/file.zip" })).toThrow("Use uma URL HTTPS válida para o recurso.");
    expect(() => procedure._def.inputs[0].parse({ kind: "material", title: "Automação", status: "published", resourceUrl: "javascript:alert(1)" })).toThrow();
    expect(procedure._def.inputs[0].parse({ kind: "material", title: "Automação", status: "draft" })).toMatchObject({ kind: "material", status: "draft" });
  });

  it("mantém Biblioteca de Recursos no mesmo contrato e em gestor dedicado", async () => {
    const member = await readFile(path.join(root, "client/src/pages/MemberPublications.tsx"), "utf8");
    const library = await readFile(path.join(root, "client/src/components/resources/LibraryResourcesPremium.tsx"), "utf8");
    const admin = await readFile(path.join(root, "client/src/pages/AdminPublications.tsx"), "utf8");
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const migration = await readFile(path.join(root, "drizzle/migrations/0026_add_managed_content_resource_fields.sql"), "utf8");
    expect(schema).toContain('resourceUrl: varchar("resourceUrl"');
    expect(schema).toContain('resourceCategory: varchar("resourceCategory"');
    expect(schema).toContain('resourceType: varchar("resourceType"');
    expect(migration).toContain("ADD COLUMN `resourceUrl`");
    expect(admin).toContain('"/admin/biblioteca-recursos": { kind: "material", title: "Biblioteca de Recursos"');
    expect(admin).toContain("Use uma URL HTTPS válida para o recurso.");
    expect(admin).toContain("Link do recurso");
    expect(admin).toContain("normalizeHttpsUrl");
    expect(member).toContain("Recursos disponibilizados para apoiar sua divulgação e sua rotina.");
    expect(member).toContain("LibraryResourcesPremium");
    expect(library).toContain("Recursos disponíveis");
    expect(library).toContain("const ITEMS_PER_PAGE = 10");
    expect(library).toContain("aria-expanded={expanded}");
    expect(library).toContain("Acessar recurso");
    expect(library).toContain('target="_blank"');
    expect(member).toContain('item.kind === "faq"');
  });

  it("unifica Material de divulgação na Biblioteca de Recursos e preserva redirects legados", async () => {
    const member = await readFile(path.join(root, "client/src/pages/MemberPublications.tsx"), "utf8");
    const admin = await readFile(path.join(root, "client/src/pages/AdminPublications.tsx"), "utf8");
    const faqManager = await readFile(path.join(root, "client/src/components/AdminFaqManager.tsx"), "utf8");
    const operations = await readFile(path.join(root, "client/src/pages/AdminOperations.tsx"), "utf8");
    const navigation = await readFile(path.join(root, "shared/memberOfficeContent.ts"), "utf8");
    const adminNavigation = await readFile(path.join(root, "client/src/lib/adminNavigation.ts"), "utf8");
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const legacyRedirect = await readFile(path.join(root, "client/src/pages/MemberLegacyRedirect.tsx"), "utf8");
    expect(navigation).toContain('label: "Biblioteca de Recursos", path: "/membros/materiais"');
    expect(navigation).not.toContain('label: "Material de divulgação"');
    expect(member).not.toContain('title: "Material de divulgação"');
    expect(member).toContain('title: "Biblioteca de Recursos"');
    expect(admin).not.toContain('"/admin/material-divulgacao": { kind: "article"');
    expect(admin).toContain('item.kind === "material" || item.kind === "article"');
    expect(adminNavigation).not.toContain('label: "Material de Divulgação"');
    expect(adminNavigation).toContain('label: "Biblioteca de Recursos", path: "/admin/biblioteca-recursos"');
    expect(adminNavigation).not.toContain('label: "Perguntas Frequentes"');
    expect(adminNavigation).toContain('label: "Configurar Seções", path: "/admin/imagens", group: "Sistema"');
    expect(faqManager).toContain("Perguntas Frequentes");
    expect(faqManager).toContain('item.kind === "faq"');
    expect(operations).toContain('setLocation("/admin")');
    expect(operations).not.toContain("createContent");
    expect(app).toContain('path="/admin/material-divulgacao"');
    expect(app).toContain('to="/admin/biblioteca-recursos"');
    expect(app).toContain('path="/admin/biblioteca-recursos" component={AdminPublications}');
    expect(legacyRedirect).toContain('"/membros/blog": "/membros/materiais"');
    expect(legacyRedirect).toContain('"/membros/artigos": "/membros/materiais"');
    expect(legacyRedirect).toContain('"/membros/bonus": "/membros/materiais"');
  });
});
