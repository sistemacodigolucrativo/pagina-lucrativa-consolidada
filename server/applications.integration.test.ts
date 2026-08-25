import { describe, expect, it } from "vitest";
import { access, readFile } from "node:fs/promises";
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
  it("remove o contrato operacional global de pedidos da administração", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const navigation = await readFile(path.join(root, "client/src/lib/adminNavigation.ts"), "utf8");
    expect(router).not.toContain("applications: adminProcedure");
    expect(router).not.toContain("updateApplication: adminProcedure");
    expect(app).not.toContain("AdminApplications");
    expect(navigation).not.toContain('label: "Pedidos"');
    await expect(access(path.join(root, "client/src/pages/AdminApplications.tsx"))).rejects.toThrow();
  });
  it("mantém solicitações atribuídas apenas para pedidos que ainda exigem decisão", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(db).toContain('application.paymentStatus !== "confirmed"');
    expect(db).toContain("shouldHideRejectedApplication");
  });
  it("registra o acompanhamento público e mantém a rota admin antiga como redirecionamento", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const home = await readFile(path.join(root, "client/src/pages/Home.tsx"), "utf8");
    const confirmation = await readFile(path.join(root, "client/src/pages/ApplicationConfirmation.tsx"), "utf8");
    const legacy = await readFile(path.join(root, "client/src/pages/AdminOperations.tsx"), "utf8");
    expect(app).toContain('path="/pedido/acompanhar" component={ApplicationTracking}');
    expect(app).toContain('path="/admin/pedidos" component={AdminOperations}');
    expect(home).toContain("data.trackingCode");
    expect(confirmation).toContain("Acompanhar solicitação");
    expect(legacy).toContain("Módulo administrativo removido");
  });

  it("preserva os contratos público e do membro para pedido, pagamento e ativação", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(router).toContain("affiliateApplications: protectedProcedure");
    expect(router).toContain("affiliateApplication: protectedProcedure");
    expect(router).toContain("reviewPaymentReceipt: protectedProcedure");
    expect(router).toContain("applications: router({");
    expect(router).toContain("submit: publicProcedure");
    expect(router).toContain("lookup: publicProcedure");
    expect(router).toContain("paymentPage: publicProcedure");
    expect(router).toContain("uploadReceipt: publicProcedure");
    expect(router).toContain("completePersonalization: publicProcedure");
  });

  it("não usa patrocinador fallback quando o pedido informa afiliado explícito inválido", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(db).toContain("if (!owner[0] && !affiliateSlug)");
    expect(db).toContain("affiliateSlug: owner[0]?.slug ?? null");
    expect(db).toContain("ownerUserId: owner[0]?.userId ?? null");
  });

  it("mantém o perfil público do afiliado como fonte da identidade visual permitida", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const home = await readFile(path.join(root, "client/src/pages/Home.tsx"), "utf8");
    const publicProfile = db.slice(db.indexOf("export async function getPublicAffiliateProfile"), db.indexOf("export async function getMemberTickets"));
    expect(publicProfile).toContain("photoUrl: memberProfiles.photoUrl");
    expect(publicProfile).toContain("whatsapp: memberProfiles.whatsapp");
    expect(publicProfile).toContain("COALESCE");
    expect(publicProfile).toContain("leftJoin(users");
    expect(publicProfile).not.toContain("innerJoin(users");
    expect(publicProfile).not.toContain("email: users.email");
    expect(home).toContain("affiliate-profile-hero");
    expect(home).toContain("affiliate-profile-summary");
    expect(home).toContain("withAppBase(affiliate.data.photoUrl)");
    expect(home).toContain("affiliate-profile-avatar-fallback");
    expect(home).toContain("Ver perfil");
  });

  it("organiza a página de pagamento em jornada linear sem alterar comprovante PIX", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const confirmation = await readFile(path.join(root, "client/src/pages/ApplicationConfirmation.tsx"), "utf8");
    const paymentPage = await readFile(path.join(root, "client/src/pages/ApplicationPayment.tsx"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");

    expect(app).toContain('path="/pedido/:trackingCode/pagamento" component={ApplicationPayment}');
    expect(confirmation).toContain("if (code) return <ApplicationPayment />");
    expect(paymentPage).toContain("Finalize seu pagamento");
    expect(paymentPage).toContain("Resumo do pedido");
    expect(paymentPage).toContain("1. Escolha como pagar");
    expect(paymentPage).toContain("2. Pague com PIX");
    expect(paymentPage).toContain("2. Pague pelo checkout");
    expect(paymentPage).toContain("Já pagou? Envie seu comprovante");
    expect(paymentPage).toContain("hasSubmittedReceipt");
    expect(paymentPage).toContain("canRetryRejectedReceipt");
    expect(paymentPage).not.toContain("Enviar outro comprovante");
    expect(paymentPage).toContain("Acompanhe seu pedido");
    expect(paymentPage).toContain("Detalhes do comprador");
    expect(paymentPage).toContain("selectedMethod === \"pix\"");
    expect(paymentPage).toContain("selectedMethod === \"checkout\"");
    expect(paymentPage).toContain("const showReceiptUpload = selectedMethod === \"pix\" && Boolean(pixKey)");
    expect(paymentPage).toContain("Copiar chave PIX");
    expect(paymentPage).toContain("Pagamento via link de checkout");
    expect(paymentPage).not.toContain("Finalize sua ativação.");
    expect(paymentPage).not.toContain("Aprovação imediata");
    expect(db).toContain('selectedPaymentMethod: "PIX"');
  });
});
