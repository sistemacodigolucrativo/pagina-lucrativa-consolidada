import { describe, expect, it } from "vitest";
import { receivingPreferenceInput } from "./routers";

describe("contrato de recebimento", () => {
  it("normaliza uma chave PIX de e-mail antes da persistência", () => {
    const result = receivingPreferenceInput.parse({ method: "pix", receivingKey: " CONTATO@EXAMPLE.COM ", holderName: "Titular" });
    expect(result.receivingKey).toBe("contato@example.com");
  });

  it("rejeita chamadas diretas com chave PIX ausente ou incompatível", () => {
    expect(() => receivingPreferenceInput.parse({ method: "pix", receivingKey: null })).toThrow();
    expect(() => receivingPreferenceInput.parse({ method: "pix", receivingKey: "chave-invalida" })).toThrow();
  });

  it("mantém identificador livre e limitado para formas não PIX", () => {
    expect(receivingPreferenceInput.parse({ method: "bank_transfer", receivingKey: "Agência 0001 / conta 00002-3" }).receivingKey).toBe("Agência 0001 / conta 00002-3");
  });
});
