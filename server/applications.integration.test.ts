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
  it("mantém pedidos administrativos em módulo real sem reativar o contrato tRPC antigo", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const navigation = await readFile(path.join(root, "client/src/lib/adminNavigation.ts"), "utf8");
    const adminCommercial = await readFile(path.join(root, "server/_core/adminCommercialOperations.ts"), "utf8");
    expect(router).not.toContain("applications: adminProcedure");
    expect(router).not.toContain("updateApplication: adminProcedure");
    expect(app).not.toContain("AdminApplications");
    expect(app).toContain('import AdminOrders from "./pages/AdminOrders"');
    expect(app).toContain('path="/admin/pedidos" component={AdminOrders}');
    expect(navigation).toContain('label: "Pedidos"');
    expect(navigation).toContain('path: "/admin/pedidos"');
    expect(adminCommercial).toContain('app.get(prefix + "/orders"');
    expect(adminCommercial).toContain('app.post(prefix + "/orders/:id/receipts/:receiptId/review"');
    expect(adminCommercial).toContain("requireAdmin");
    await expect(access(path.join(root, "client/src/pages/AdminApplications.tsx"))).rejects.toThrow();
  });
  it("mantém solicitações atribuídas apenas para pedidos que ainda exigem decisão", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(db).toContain('application.paymentStatus !== "confirmed"');
    expect(db).toContain("shouldHideRejectedApplication");
  });
  it("registra o acompanhamento público e mantém pedidos no backoffice real", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const home = await readFile(path.join(root, "client/src/pages/Home.tsx"), "utf8");
    const confirmation = await readFile(path.join(root, "client/src/pages/ApplicationConfirmation.tsx"), "utf8");
    const adminCommercial = await readFile(path.join(root, "server/_core/adminCommercialOperations.ts"), "utf8");
    expect(app).toContain('path="/pedido/acompanhar" component={ApplicationTracking}');
    expect(app).toContain('path="/admin/pedidos" component={AdminOrders}');
    expect(app).not.toContain('path="/admin/pedidos" component={AdminOperations}');
    expect(home).toContain("data.trackingCode");
    expect(confirmation).toContain("Acompanhar solicitação");
    expect(adminCommercial).toContain("async function handleOrders");
    expect(adminCommercial).toContain("async function handleOrderDetail");
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

  it("mapeia falhas previsíveis da revisão de comprovante sem expor erro interno genérico", async () => {
    const [router, adminCommercial] = await Promise.all([
      readFile(path.join(root, "server/routers.ts"), "utf8"),
      readFile(path.join(root, "server/_core/adminCommercialOperations.ts"), "utf8"),
    ]);
    expect(router).toContain("mapReceiptReviewTrpcError");
    expect(router).toContain('code: "NOT_FOUND"');
    expect(router).toContain('code: "CONFLICT"');
    expect(adminCommercial).toContain("handleReceiptReviewError");
    expect(adminCommercial).toContain("res.status(404).json");
    expect(adminCommercial).toContain("res.status(409).json");
  });

  it("persiste pedido e conversão em uma mesma transação", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(db).toContain("const result = await db.transaction(async tx => {");
    expect(db).toContain("}, tx);");
    expect(db).toContain("onDuplicateKeyUpdate");
  });

  it("resolve afiliado explícito inválido para o afiliado padrão antes de criar o pedido", async () => {
    const criticalFlow = await readFile(path.join(root, "server/criticalFlowFixes.ts"), "utf8");
    expect(criticalFlow).toContain("async function resolveApplicationAffiliate");
    expect(criticalFlow).toContain("const candidateSlug = normalizeNullableSlug(input.affiliateSlug)");
    expect(criticalFlow).toContain("db.select({ slug: memberProfiles.slug })");
    expect(criticalFlow).toContain("affiliateSlugProvided: true");
    expect(criticalFlow).toContain("const defaultAffiliate = await resolveDefaultAffiliateProfile()");
    expect(criticalFlow).toContain("affiliateSlugProvided: false");
    expect(criticalFlow).toContain("return createApplication(await resolveApplicationAffiliate(input), request)");
  });

  it("resolve o administrador global como afiliado padrão quando o pedido não informa afiliado", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const appSchema = await readFile(path.join(root, "shared/applications.ts"), "utf8");
    expect(db).toContain("export async function resolveDefaultAffiliateProfile()");
    expect(db).toContain("!ENV.ownerOpenId");
    expect(db).toContain("eq(users.openId, ENV.ownerOpenId)");
    expect(db).toContain('eq(users.role, "admin")');
    expect(db).toContain("const defaultAffiliate = await resolveDefaultAffiliateProfile()");
    expect(db).not.toContain('where(eq(users.role, "user")).limit(2)');
    expect(appSchema).toContain("affiliateSlugProvided: z.boolean().optional()");
  });

  it("não cria perfil fictício nem escolhe membro aleatório quando o admin não possui memberProfile", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const resolver = db.slice(db.indexOf("export async function resolveDefaultAffiliateProfile"), db.indexOf("export async function getDefaultPublicAffiliateProfile"));
    expect(resolver).toContain(".innerJoin(memberProfiles");
    expect(resolver).toContain("return rows[0] ?? null");
    expect(resolver).not.toContain("insert(memberProfiles)");
    expect(resolver).not.toContain('eq(users.role, "user")');
  });

  it("mantém prioridade do afiliado explícito válido sobre o fallback administrativo", async () => {
    const criticalFlow = await readFile(path.join(root, "server/criticalFlowFixes.ts"), "utf8");
    const resolver = criticalFlow.slice(criticalFlow.indexOf("async function resolveApplicationAffiliate"), criticalFlow.indexOf("export async function createApplicationWithUniqueEmail"));
    expect(resolver).toContain("if (candidateSlug)");
    expect(resolver).toContain("where(eq(memberProfiles.slug, candidateSlug))");
    expect(resolver).toContain("return { ...input, affiliateSlug: rows[0].slug, affiliateSlugProvided: true }");
    expect(resolver.indexOf("where(eq(memberProfiles.slug, candidateSlug))")).toBeLessThan(resolver.indexOf("const defaultAffiliate = await resolveDefaultAffiliateProfile()"));
    expect(resolver).toContain("return { ...input, affiliateSlug: defaultAffiliate.slug, affiliateSlugProvided: false }");
  });

  it("resolve o perfil público padrão da Home quando não há afiliado válido carregado", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const home = await readFile(path.join(root, "client/src/pages/Home.tsx"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(router).toContain("defaultAffiliateProfile: publicProcedure.query");
    expect(db).toContain("export async function getDefaultPublicAffiliateProfile()");
    expect(home).toContain('const hasExplicitAffiliate = affiliateParams?.has("afiliado") ?? false');
    expect(home).toContain("const affiliateLookupPending");
    expect(home).toContain("trpc.public.defaultAffiliateProfile.useQuery(undefined, { enabled: !affiliate.data })");
    expect(home).toContain("const isResolvedExplicitAffiliate");
    expect(home).toContain("const isInvalidExplicitAffiliate");
    expect(home).toContain("const effectiveAffiliate = affiliate.data ?? defaultAffiliate.data");
    expect(home).toContain("affiliateSlug: effectiveAffiliateSlug");
    expect(home).toContain("affiliateSlugProvided: isResolvedExplicitAffiliate");
  });

  it("mantém o perfil público do afiliado como fonte da identidade visual permitida", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const home = await readFile(path.join(root, "client/src/pages/Home.tsx"), "utf8");
    const publicProfile = db.slice(db.indexOf("export async function getPublicAffiliateProfile"), db.indexOf("export async function getMemberTickets"));
    expect(publicProfile).toContain("photoUrl: memberProfiles.photoUrl");
    expect(publicProfile).toContain("whatsapp: memberProfiles.whatsapp");
    expect(publicProfile).toContain("userName: users.name");
    expect(publicProfile).toContain("resolvePublicAffiliateDisplayName(userName, publicProfile.slug)");
    expect(publicProfile).toContain("leftJoin(users");
    expect(publicProfile).not.toContain("innerJoin(users");
    expect(publicProfile).not.toContain("email: users.email");
    expect(db).toContain("formatSlugAsPublicName(slug)");
    expect(db).toContain("GENERIC_PUBLIC_PROFILE_NAMES");
    expect(home).toContain("affiliate-profile-hero");
    expect(home).toContain("affiliate-profile-summary");
    expect(home).toContain("withAppBase(effectiveAffiliate.photoUrl)");
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
    expect(paymentPage).toContain("const showReceiptUpload");
    expect(paymentPage).toContain("Copiar chave PIX");
    expect(paymentPage).toContain("Pagamento via link de checkout");
    expect(paymentPage).not.toContain("Finalize sua ativação.");
    expect(paymentPage).not.toContain("Aprovação imediata");
    expect(db).toContain('selectedPaymentMethod: "PIX"');
    expect(db).toContain("recentHour");
    expect(db).toContain("recentDay");
    expect(db).toContain("pendingRows");
  });

  it("protege a página de pagamento com token e DTO público mínimo", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const paymentPage = await readFile(path.join(root, "client/src/pages/ApplicationPayment.tsx"), "utf8");
    const publicPayment = db.slice(db.indexOf("export async function getApplicationPaymentPage"), db.indexOf("function parseReceiptDataUrl"));
    expect(router).toContain("paymentPage: publicProcedure.input(paymentAccessInputSchema).mutation");
    expect(router).toContain("uploadReceipt: publicProcedure.input(applicationReceiptUploadSchema)");
    expect(publicPayment).toContain("verifyPaymentAccessToken");
    expect(publicPayment).toContain("Promise<PublicPaymentPage | null>");
    expect(publicPayment).not.toContain("profileRows");
    expect(publicPayment).not.toContain("receipts: receiptRows");
    expect(publicPayment).not.toContain("storageKey");
    expect(paymentPage).toContain("readPaymentAccessToken");
    expect(paymentPage).toContain("paymentAccessToken");
    expect(paymentPage).not.toContain("application.email");
    expect(paymentPage).not.toContain("application.whatsapp");
    expect(paymentPage).not.toContain("paymentPage.useQuery");
  });
});
