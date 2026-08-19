import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();
describe("gestão de solicitações públicas", () => {
  it("gera um código rastreável e exige código mais e-mail na consulta pública", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(db).toContain("const trackingCode = `PL-${randomUUID()");
    expect(db).toContain("getApplicationTracking");
    expect(db).toContain("eq(applications.trackingCode, trackingCode)");
    expect(router).toContain("lookup: publicProcedure.input");
  });
  it("restringe a atualização de status e retorno à administração", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(router).toContain("updateApplication: adminProcedure.input");
    expect(router).toContain('z.enum(["pending", "contacted", "approved", "archived"])');
  });
  it("registra o acompanhamento público e a gestão administrativa nas rotas", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const home = await readFile(path.join(root, "client/src/pages/Home.tsx"), "utf8");
    const confirmation = await readFile(path.join(root, "client/src/pages/ApplicationConfirmation.tsx"), "utf8");
    expect(app).toContain('path="/pedido/acompanhar" component={ApplicationTracking}');
    expect(app).toContain('path="/admin/pedidos" component={AdminApplications}');
    expect(home).toContain("data.trackingCode");
    expect(confirmation).toContain("Acompanhar solicitação");
  });
});
