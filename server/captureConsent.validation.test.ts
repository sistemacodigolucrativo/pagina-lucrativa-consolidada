import { describe, expect, it } from "vitest";
import { captureContactInput, invitationInput } from "./routers";

describe("validações de captação consentida", () => {
  it("aceita contato apenas com consentimento explícito", () => {
    expect(captureContactInput.parse({ name: "Contato de teste", email: "contato@example.com", source: "teste autorizado", consent: true }).consent).toBe(true);
    expect(() => captureContactInput.parse({ name: "Contato de teste", email: "contato@example.com", source: "teste autorizado", consent: false })).toThrow();
  });
  it("restringe o convite a canais manuais previstos", () => {
    expect(invitationInput.parse({ channel: "link" }).channel).toBe("link");
    expect(() => invitationInput.parse({ channel: "disparo-automatico" })).toThrow();
  });
});
