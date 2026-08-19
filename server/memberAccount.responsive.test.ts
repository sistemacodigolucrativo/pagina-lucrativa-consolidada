import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Meus dados separation layout", () => {
  it("keeps only cadastral/security fields and links to receiving", () => {
    const source = readFileSync(path.join(process.cwd(), "client/src/pages/MemberAccount.tsx"), "utf8");
    for (const heading of ["Dados cadastrais", "Alterar senha", "Separação de dados", "Dados de recebimento"]) expect(source).toContain(heading);
    for (const forbidden of ["Email PayPal", "Email PagSeguro", "Dados bancários", "Dados PIX", "paypalEmail", "bank1Name", "pixKey"]) expect(source).not.toContain(forbidden);
    expect(source).toContain("/membros/recebimentos");
    expect(source).toContain("order-1");
    expect(source).toContain("order-2");
  });
});
