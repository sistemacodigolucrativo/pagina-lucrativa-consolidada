import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
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

  it("mantém histórico administrativo sem permitir novas comissões ou saques", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const adminPage = await readFile(path.join(root, "client/src/pages/AdminTransactions.tsx"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(router).toContain('type: z.enum(["sale", "adjustment"])');
    expect(router).not.toContain('z.enum(["sale", "commission", "adjustment"])');
    expect(adminPage).not.toContain('"Comissão"');
    expect(adminPage).not.toContain('"Saque"');
    expect(adminPage).toContain("creatableTypeLabel");
    expect(adminPage).not.toContain("aprove solicitações de saque");
    expect(db).toContain("syncTransactionCampaignConversion");
    expect(db).toContain('transaction.status === "void" ? "reversed" : "active"');
  });

  it("registra as rotas financeiras de membro e administração", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    expect(app).toContain('path="/membros/ganhos" component={MemberEarnings}');
    expect(app).toContain('path="/admin/financeiro" component={AdminTransactions}');
  });
});
