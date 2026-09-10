import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const router = readFileSync(resolve(root, "server/routers.ts"), "utf8");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const adminCommercial = readFileSync(resolve(root, "server/_core/adminCommercialOperations.ts"), "utf8");

describe("módulo de desempenho", () => {
  it("mantém o extrato de pontos persistente e indexado por membro", () => {
    expect(schema).toContain('mysqlTable("pointEntries"');
    expect(schema).toContain("point_entries_user_idx");
    expect(schema).toContain('mysqlEnum("status", ["pending", "posted", "void"])');
  });
  it("expõe leitura individual ao membro sem permitir escrita manual pelo membro", () => {
    expect(router).toContain('performance: protectedProcedure.query(({ ctx }) => getMemberPerformance(ctx.user.id))');
    expect(router).not.toContain("createPointEntry: protectedProcedure");
    expect(router).not.toContain("updatePointEntry: protectedProcedure");
  });
  it("expõe curadoria administrativa protegida para pontos e performance", () => {
    expect(app).toContain('import AdminPerformance from "./pages/AdminPerformance"');
    expect(app).toContain('path="/admin/pontos" component={AdminPerformance}');
    expect(adminCommercial).toContain('app.get(prefix + "/performance", wrap(handlePerformance))');
    expect(adminCommercial).toContain('app.post(prefix + "/performance", wrap(handleCreatePointEntry))');
    expect(adminCommercial).toContain('app.post(prefix + "/performance/:entryId/status", wrap(handleUpdatePointEntryStatus))');
    expect(adminCommercial).toContain("await requireAdmin(req, res)");
  });
  it("registra componentes e rotas do membro sem referências ausentes", () => {
    expect(app).toContain('import MemberPerformance from "./pages/MemberPerformance"');
    expect(app).toContain('path="/membros/pontos" component={MemberPerformance}');
  });
});
