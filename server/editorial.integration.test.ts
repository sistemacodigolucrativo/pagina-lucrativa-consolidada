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

  it("valida recursos da Biblioteca de Recursos com link Google Drive", () => {
    const procedure = procedures["admin.createContent"] as { _def: { inputs: Array<{ parse: (input: unknown) => unknown }> } };
    expect(procedure._def.inputs[0].parse({
      kind: "material",
      title: "Automação de divulgação",
      summary: "Recurso externo",
      body: "Tutorial completo",
      resourceCategory: "Automação",
      resourceType: "Ferramenta",
      resourceUrl: "https://drive.google.com/file/d/abc/view",
      status: "published",
    })).toMatchObject({ kind: "material", resourceCategory: "Automação", resourceType: "Ferramenta" });
    expect(() => procedure._def.inputs[0].parse({ kind: "material", title: "Automação", status: "published", resourceUrl: "https://example.com/file.zip" })).toThrow("Use uma URL HTTPS válida do Google Drive.");
    expect(() => procedure._def.inputs[0].parse({ kind: "material", title: "Automação", status: "published", resourceUrl: "javascript:alert(1)" })).toThrow();
    expect(procedure._def.inputs[0].parse({ kind: "material", title: "Automação", status: "draft" })).toMatchObject({ kind: "material", status: "draft" });
  });

  it("renderiza Biblioteca de Recursos sem alterar demais publicações", async () => {
    const member = await readFile(path.join(root, "client/src/pages/MemberPublications.tsx"), "utf8");
    const admin = await readFile(path.join(root, "client/src/pages/AdminPublications.tsx"), "utf8");
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const migration = await readFile(path.join(root, "drizzle/migrations/0026_add_managed_content_resource_fields.sql"), "utf8");

    expect(schema).toContain('resourceUrl: varchar("resourceUrl"');
    expect(schema).toContain('resourceCategory: varchar("resourceCategory"');
    expect(schema).toContain('resourceType: varchar("resourceType"');
    expect(migration).toContain("ADD COLUMN `resourceUrl`");
    expect(admin).toContain("Novo recurso");
    expect(admin).toContain("Use uma URL HTTPS válida do Google Drive.");
    expect(admin).toContain("Link do Google Drive");
    expect(admin).toContain("O arquivo precisa estar compartilhado no Google Drive");
    expect(member).toContain("Recursos disponibilizados para apoiar sua divulgação e sua rotina.");
    expect(member).toContain("Recursos disponíveis");
    expect(member).toContain("Ver detalhes");
    expect(member).toContain("Acessar recurso");
    expect(member).toContain('target="_blank"');
    expect(member).toContain('item.kind === "faq"');
  });

  it("apresenta article como Material de divulgação sem renomear o contrato técnico", async () => {
    const member = await readFile(path.join(root, "client/src/pages/MemberPublications.tsx"), "utf8");
    const admin = await readFile(path.join(root, "client/src/pages/AdminPublications.tsx"), "utf8");
    const operations = await readFile(path.join(root, "client/src/pages/AdminOperations.tsx"), "utf8");
    const navigation = await readFile(path.join(root, "shared/memberOfficeContent.ts"), "utf8");
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const legacyRedirect = await readFile(path.join(root, "client/src/pages/MemberLegacyRedirect.tsx"), "utf8");

    expect(navigation).toContain('label: "Material de divulgação", path: "/membros/artigos"');
    expect(member).toContain('title: "Material de divulgação"');
    expect(member).toContain("Materiais prontos para divulgação");
    expect(admin).toContain('<option value="article">Material de divulgação</option>');
    expect(operations).toContain('<option value="article">Material de divulgação</option>');
    expect(app).toContain('path="/membros/artigos" component={MemberPublications}');
    expect(legacyRedirect).toContain('"/membros/blog": "/membros/artigos"');
  });
});
