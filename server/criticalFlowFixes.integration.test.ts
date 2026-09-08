import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.env.PROJECT_ROOT || process.cwd();

async function source(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8");
}

describe("correções críticas de conta, cadastro e pagamento", () => {
  it("mantém e-mail do membro imutável na interface e no contrato", async () => {
    const [accountPage, routers] = await Promise.all([
      source("client/src/pages/MemberAccount.tsx"),
      source("server/routers.ts"),
    ]);
    const accountContract = routers.match(/export const accountInput = z\.object\(\{([\s\S]*?)\}\)\.superRefine/)?.[1] ?? "";
    expect(accountContract).not.toContain("email:");
    expect(accountPage).toContain("Este e-mail é fixo e não pode ser alterado após o cadastro.");
    expect(accountPage).not.toContain('setField("email"');
  });

  it("confirma senha persistida e recupera conta por e-mail normalizado", async () => {
    const fixes = await source("server/criticalFlowFixes.ts");
    expect(fixes).toContain("hashPassword(newPassword)");
    expect(fixes).toContain("hashesMatch(persisted[0].passwordHash");
    expect(fixes).toContain("LOWER(TRIM(${users.email}))");
    expect(fixes).not.toContain("hashPassword(input.newPassword.trim())");
  });

  it("bloqueia e-mail já usado por conta ou pedido", async () => {
    const fixes = await source("server/criticalFlowFixes.ts");
    expect(fixes).toContain("emailExistsForNewRegistration");
    expect(fixes).toContain("db.select({ id: users.id })");
    expect(fixes).toContain("db.select({ id: applications.id })");
    expect(fixes).toContain("Este e-mail já está cadastrado");
  });

  it("prefill reutiliza WhatsApp do pedido aprovado", async () => {
    const [fixes, page] = await Promise.all([
      source("server/criticalFlowFixes.ts"),
      source("client/src/pages/ApplicationPersonalization.tsx"),
    ]);
    expect(fixes).toContain("whatsapp: applicationRows[0]?.whatsapp");
    expect(page).toContain("access.data?.whatsapp");
    expect(page).toContain("whatsapp: current.whatsapp || whatsapp");
  });

  it("expõe dados bancários e carteiras sem remover PIX", async () => {
    const [fixes, methodsPage, instructionsPage] = await Promise.all([
      source("server/criticalFlowFixes.ts"),
      source("client/src/pages/ApplicationPaymentMethods.tsx"),
      source("client/src/pages/ApplicationPayment.tsx"),
    ]);
    expect(fixes).toContain("pagSeguro:");
    expect(fixes).toContain("paypal:");
    expect(fixes).toContain("banks,");
    expect(methodsPage).toContain("Dados bancários");
    expect(methodsPage).toContain("PagSeguro");
    expect(instructionsPage).toContain('selectedMethod === "pix"');
    expect(instructionsPage).toContain("PaymentReceivingDetails");
    expect(instructionsPage).toContain("overflow-x-hidden");
  });

  it("otimiza foto acima de 1 MB antes do upload", async () => {
    const [profile, imageHelper] = await Promise.all([
      source("client/src/pages/MemberProfile.tsx"),
      source("client/src/lib/profileImage.ts"),
    ]);
    expect(profile).toContain("prepareProfilePhoto(file)");
    expect(profile).not.toContain("A foto deve ter no máximo 1 MB.");
    expect(imageHelper).toContain("TARGET_PROFILE_IMAGE_BYTES");
    expect(imageHelper).toContain('canvas.toBlob');
  });
});
