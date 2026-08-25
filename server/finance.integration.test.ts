import { describe, expect, it } from "vitest";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("relatório de adesões do membro", () => {
  it("deriva ganhos de pedidos reais isolados pelo patrocinador", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(db).toContain("export async function getMemberFinance(userId: number)");
    expect(db).toContain("from(applications).where(eq(applications.ownerUserId, userId))");
    expect(db).toContain('entry.paymentStatus === "confirmed"');
    expect(db).toContain('entry.paymentStatus === "receipt_received"');
    expect(db).toContain("confirmedValueCents");
    expect(db).toContain("awaitingReviewCount");
    expect(db).not.toContain("export async function createMemberFinanceEntry");
  });

  it("remove escrita manual financeira do membro", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const page = await readFile(path.join(root, "client/src/pages/MemberEarnings.tsx"), "utf8");
    expect(router).toContain("finance: protectedProcedure.query");
    expect(router).not.toContain("createFinanceEntry");
    expect(page).toContain("Ganhos e extrato de adesões");
    expect(page).toContain("pagamento ocorre diretamente entre comprador e patrocinador");
    expect(page).toContain("confirmedEntries");
    expect(page).toContain("entry.whatsapp");
    expect(page).not.toContain("Ver pedidos");
    expect(page).not.toContain("applicationPaymentStatusLabel");
    expect(page).not.toContain("Registrar venda");
    expect(page).not.toContain("Solicitar saque");
    expect(page).not.toContain("Saldo confirmado");
  });

  it("remove o módulo administrativo de lançamentos sem apagar o histórico", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const adminOffice = await readFile(path.join(root, "client/src/pages/AdminOffice.tsx"), "utf8");
    expect(router).not.toContain("transactions: adminProcedure");
    expect(router).not.toContain("financeMembers: adminProcedure");
    expect(router).not.toContain("createTransaction: adminProcedure");
    expect(router).not.toContain("updateTransaction: adminProcedure");
    expect(db).not.toContain("export async function getAdminTransactions");
    expect(db).not.toContain("export async function getFinanceMembers");
    expect(db).not.toContain("export async function createAdminTransaction");
    expect(db).not.toContain("export async function updateAdminTransaction");
    expect(db).not.toContain("syncTransactionCampaignConversion");
    expect(schema).toContain('export const transactions = mysqlTable("transactions"');
    expect(schema).toContain('type: mysqlEnum("type", ["sale", "commission", "adjustment", "withdrawal"])');
    expect(adminOffice).not.toContain("grossVolumeCents");
    expect(adminOffice).not.toContain("trpc.admin.transactions");
    expect(adminOffice).not.toContain("Volume confirmado");
  });

  it("preserva campanhas e conversões sem manter escritor financeiro manual", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const memberOperation = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(db).toContain("export async function recordCampaignConversion");
    expect(db).toContain('conversionType: "application"');
    expect(db).toContain("from(campaignConversions)");
    expect(memberOperation).toContain("trpc.member.conversions.useQuery");
    expect(memberOperation).toContain("conversionType");
  });

  it("preserva as rotas do membro e mantém a rota financeira antiga como redirecionamento", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const legacy = await readFile(path.join(root, "client/src/pages/AdminOperations.tsx"), "utf8");
    expect(app).toContain('path="/membros/ganhos" component={MemberEarnings}');
    expect(app).toContain('path="/admin/financeiro" component={AdminOperations}');
    expect(app).not.toContain("AdminTransactions");
    expect(legacy).toContain("Módulo administrativo removido");
    await expect(access(path.join(root, "client/src/pages/AdminTransactions.tsx"))).rejects.toThrow();
  });

  it("não recria transações financeiras fictícias no seed da demo", async () => {
    const seed = await readFile(path.join(root, "scripts/seed-demo.ts"), "utf8");
    expect(seed).not.toContain("INSERT INTO transactions");
    expect(seed).not.toContain("UPDATE transactions SET");
    expect(seed).toContain("INSERT INTO applications");
    expect(seed).toContain("INSERT INTO campaignConversions");
  });
});
