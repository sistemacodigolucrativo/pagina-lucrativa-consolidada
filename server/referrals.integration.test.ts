import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
describe("fluxo de indicações", () => {
  it("mantém a entidade, os contratos protegidos e as rotas de membro/administração", () => {
    const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
    const router = readFileSync(resolve(root, "server/routers.ts"), "utf8");
    const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
    expect(schema).toContain('mysqlTable("referralLinks"');
    expect(schema).toContain("referredUserId");
    expect(router).toContain("referrals: protectedProcedure");
    expect(router).toContain("setReferralLink: adminProcedure");
    expect(app).toContain('path="/membros/rede"');
    expect(app).toContain('path="/admin/membros"');
  });
});
