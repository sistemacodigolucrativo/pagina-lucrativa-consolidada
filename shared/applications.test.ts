import { describe, expect, it } from "vitest";
import { applicationInputSchema, applicationStatusLabel } from "./applications";

describe("applicationInputSchema", () => {
  it("accepts a complete public application", () => {
    const result = applicationInputSchema.safeParse({
      fullName: "Pessoa Interessada",
      email: "pessoa@example.com",
      whatsapp: "73999999999",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an incomplete application and keeps status labels explicit", () => {
    const result = applicationInputSchema.safeParse({ fullName: "A", email: "sem-email", whatsapp: "123" });

    expect(result.success).toBe(false);
    expect(applicationStatusLabel.pending).toBe("Novo pedido");
  });
});
