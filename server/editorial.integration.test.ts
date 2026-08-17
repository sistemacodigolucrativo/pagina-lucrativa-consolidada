import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("central editorial", () => {
  const procedures = appRouter._def.procedures;

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
});
