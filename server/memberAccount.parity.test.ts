import { describe, expect, it } from "vitest";
import { accountInput, receivingPreferenceInput } from "./routers";

describe("separação funcional de conta e recebimento", () => {
  it("mantém Meus dados restrito a nome, e-mail e senha", () => {
    const result = accountInput.safeParse({ name: "Membro Código Lucrativo", email: "membro@example.com", newPassword: null, confirmPassword: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty("paypalEmail");
  });

  it("aceita o payload completo de recebimento no contrato correto", () => {
    const result = receivingPreferenceInput.safeParse({
      holderName: "Membro Código Lucrativo",
      method: "pix",
      receivingKey: "membro@example.com",
      instructions: "Recebimento da conta principal",
      paypalEmail: "paypal@example.com",
      paypalEnabled: true,
      pagseguroEmail: "pagseguro@example.com",
      pagseguroEnabled: false,
      bank1Name: "Banco Um",
      bank1Agency: "1234",
      bank1Account: "98765-0",
      bank1Type: "checking",
      bank1Holder: "Membro Código Lucrativo",
      bank2Name: "Banco Dois",
      bank2Agency: "4321",
      bank2Account: "12345-6",
      bank2Type: "savings",
      bank2Holder: "Membro Código Lucrativo",
      pixType: "e-mail",
      pixKey: "membro@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a mismatched new password confirmation", () => {
    const result = accountInput.safeParse({ name: "Membro Código Lucrativo", email: "membro@example.com", newPassword: "nova-senha", confirmPassword: "outra-senha" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(issue => issue.path[0] === "confirmPassword")).toBe(true);
  });
});
