import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();
describe("lançamentos financeiros", () => {
  it("mantém o lançamento do membro restrito a vendas e saques pendentes", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(db).toContain("createMemberFinanceEntry");
    expect(db).toContain('input.type === "withdrawal" ? -Math.abs(input.amountCents)');
    expect(db).toContain('status: "pending"');
    expect(router).toContain('createFinanceEntry: protectedProcedure.input');
    expect(router).toContain('z.enum(["sale", "withdrawal"])');
  });
  it("restringe consulta, criação e aprovação financeira à administração quando apropriado", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(router).toContain("transactions: adminProcedure.query");
    expect(router).toContain("createTransaction: adminProcedure.input");
    expect(router).toContain("updateTransaction: adminProcedure.input");
    expect(router).toContain('z.enum(["pending", "posted", "void"])');
  });
  it("registra as rotas financeiras de membro e administração", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    expect(app).toContain('path="/membros/ganhos" component={MemberEarnings}');
    expect(app).toContain('path="/admin/financeiro" component={AdminTransactions}');
  });
});
