import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const router = readFileSync(resolve(root, "server/routers.ts"), "utf8");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");

describe("módulo de desempenho", () => {
  it("mantém o extrato de pontos persistente e indexado por membro", () => {
    expect(schema).toContain('mysqlTable("pointEntries"');
    expect(schema).toContain('point_entries_user_idx');
    expect(schema).toContain('mysqlEnum("status", ["pending", "posted", "void"])');
  });
  it("expõe somente leitura individual ao membro sem curadoria administrativa manual", () => {
    expect(router).toContain('performance: protectedProcedure.query(({ ctx }) => getMemberPerformance(ctx.user.id))');
    expect(router).not.toContain('performance: adminProcedure.query(() => getAdminPerformance())');
    expect(router).not.toContain('createPointEntry: adminProcedure');
    expect(router).not.toContain('updatePointEntry: adminProcedure');
  });
  it("registra componentes e rotas sem referências ausentes", () => {
    expect(app).toContain('import MemberPerformance from "./pages/MemberPerformance"');
    expect(app).toContain('path="/membros/pontos" component={MemberPerformance}');
    expect(app).not.toContain('AdminPerformance');
    expect(app).not.toContain('path="/admin/pontos"');
  });
});
