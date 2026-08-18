import { describe, expect, it } from "vitest";
import { captureContactInput, invitationInput } from "./routers";

describe("validações de captação consentida", () => {
  it("aceita contato apenas com consentimento explícito", () => {
    expect(captureContactInput.parse({ name: "Contato de teste", email: "contato@example.com", source: "teste autorizado", consent: true }).consent).toBe(true);
    expect(() => captureContactInput.parse({ name: "Contato de teste", email: "contato@example.com", source: "teste autorizado", consent: false })).toThrow();
  });
  it("normaliza o e-mail e rejeita WhatsApp fora do contrato numérico", () => {
    const result = captureContactInput.parse({ name: "Contato de teste", email: " CONTATO@EXAMPLE.COM ", whatsapp: "73999999999", source: "teste autorizado", consent: true });
    expect(result.email).toBe("contato@example.com");
    expect(() => captureContactInput.parse({ name: "Contato de teste", email: "contato@example.com", whatsapp: "(73) 99999-9999", source: "teste autorizado", consent: true })).toThrow();
    expect(() => captureContactInput.parse({ name: "Contato de teste", email: "contato@example.com", whatsapp: "7399999999a", source: "teste autorizado", consent: true })).toThrow();
  });
  it("restringe o convite a canais manuais previstos", () => {
    expect(invitationInput.parse({ channel: "link" }).channel).toBe("link");
    expect(() => invitationInput.parse({ channel: "disparo-automatico" })).toThrow();
  });
});
