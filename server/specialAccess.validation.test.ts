import { describe, expect, it } from "vitest";
import { applicationPersonalizationSchema } from "../shared/applications";

describe("applicationPersonalizationSchema", () => {
  const valid = {
    publicCode: "abc123def456",
    name: "Maria Silva",
    whatsapp: "11987654321",
    facebookUrl: "https://facebook.com/maria",
    instagramUrl: "https://instagram.com/maria",
    password: "pagina123",
  };

  it("aceita dados públicos iniciais e senha no fluxo por pedido", () => {
    expect(applicationPersonalizationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita WhatsApp inválido, URL sem protocolo e senha fraca", () => {
    expect(applicationPersonalizationSchema.safeParse({ ...valid, whatsapp: "119" }).success).toBe(false);
    expect(applicationPersonalizationSchema.safeParse({ ...valid, facebookUrl: "facebook.com/maria" }).success).toBe(false);
    expect(applicationPersonalizationSchema.safeParse({ ...valid, password: "123456" }).success).toBe(false);
  });
});
