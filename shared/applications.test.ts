import { describe, expect, it } from "vitest";
import { applicationInputSchema, applicationStatusLabel } from "./applications";

describe("applicationInputSchema", () => {
  it("accepts a complete public application", () => {
    const result = applicationInputSchema.safeParse({
      fullName: "Pessoa Interessada",
      email: " PESSOA@EXAMPLE.COM ",
      whatsapp: "73999999999",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("pessoa@example.com");
  });

  it("aceita somente 10 ou 11 dígitos numéricos no WhatsApp", () => {
    for (const whatsapp of ["7399999999", "73999999999"]) {
      expect(applicationInputSchema.safeParse({ fullName: "Pessoa Interessada", email: "pessoa@example.com", whatsapp }).success).toBe(true);
    }
    for (const whatsapp of ["739999999", "739999999999", "(73) 99999-9999", "7399999999a"]) {
      expect(applicationInputSchema.safeParse({ fullName: "Pessoa Interessada", email: "pessoa@example.com", whatsapp }).success).toBe(false);
    }
  });

  it("rejects an incomplete application and keeps status labels explicit", () => {
    const result = applicationInputSchema.safeParse({ fullName: "A", email: "sem-email", whatsapp: "123" });

    expect(result.success).toBe(false);
    expect(applicationStatusLabel.pending).toBe("Novo pedido");
  });
});
