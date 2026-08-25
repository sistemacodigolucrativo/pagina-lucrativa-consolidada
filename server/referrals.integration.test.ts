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
    const adminReferrals = readFileSync(resolve(root, "client/src/pages/AdminReferrals.tsx"), "utf8");
    const adminOffice = readFileSync(resolve(root, "client/src/pages/AdminOffice.tsx"), "utf8");
    expect(schema).toContain('mysqlTable("referralLinks"');
    expect(schema).toContain("referredUserId");
    expect(router).toContain("referrals: protectedProcedure");
    expect(router).toContain("referralLinks: adminProcedure.query");
    expect(router).not.toContain("setReferralLink: adminProcedure");
    expect(db).toContain("application.ownerUserId, referredUserId: userId");
    expect(db).toContain("activeCount");
    expect(db).toContain("sponsorCount");
    expect(db).toContain("referredCount");
    expect(adminReferrals).toContain("Esta tela é somente consultiva.");
    expect(adminReferrals).toContain("O administrador não cria vínculos manualmente");
    expect(adminReferrals).toContain("data?.activeCount");
    expect(adminReferrals).not.toContain("createReferral");
    expect(adminReferrals).not.toContain("Vincular indicação");
    expect(adminOffice).toContain("Consulte vínculos de indicação criados pelo fluxo de adesão.");
    expect(app).toContain('path="/membros/rede"');
    expect(app).toContain('path="/admin/membros"');
  });
});
