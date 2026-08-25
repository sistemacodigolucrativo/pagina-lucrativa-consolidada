import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
describe("fluxo de indicações", () => {
  it("mantém a entidade, leitura administrativa e vínculo automático sem criação manual", () => {
    const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
    const router = readFileSync(resolve(root, "server/routers.ts"), "utf8");
    const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
    const db = readFileSync(resolve(root, "server/db.ts"), "utf8");
    expect(schema).toContain('mysqlTable("referralLinks"');
    expect(schema).toContain("referredUserId");
    expect(router).toContain("referrals: protectedProcedure");
    expect(router).toContain("referralLinks: adminProcedure.query");
    expect(router).not.toContain("setReferralLink: adminProcedure");
    expect(db).toContain("application.ownerUserId, referredUserId: userId");
    expect(app).toContain('path="/membros/rede"');
    expect(app).toContain('path="/admin/membros"');
  });
});
