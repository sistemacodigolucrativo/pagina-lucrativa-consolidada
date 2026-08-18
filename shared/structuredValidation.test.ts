import { describe, expect, it } from "vitest";
import { formatCurrencyInput, normalizePixKey, parseCurrencyBR, parseIntegerInput, sanitizeCurrencyInput, sanitizeIntegerInput, validateHttpUrl, validatePixKey } from "./structuredValidation";

describe("structuredValidation", () => {
  it("higieniza moeda em reais e preserva apenas duas casas decimais", () => {
    expect(sanitizeCurrencyInput("R$ 1.234,567")).toBe("1,23");
    expect(parseCurrencyBR("1,20")).toBe(120);
    expect(parseCurrencyBR("0")).toBe(0);
    expect(parseCurrencyBR("12,345")).toBe(null);
    expect(formatCurrencyInput(1234)).toBe("12,34");
  });

  it("aceita somente inteiros compatíveis com o tipo do campo", () => {
    expect(sanitizeIntegerInput("12abc34")).toBe("1234");
    expect(sanitizeIntegerInput("-12a", true)).toBe("-12");
    expect(parseIntegerInput("-12")).toBe(-12);
    expect(parseIntegerInput("12,5")).toBe(null);
    expect(parseIntegerInput("1e4")).toBe(null);
  });

  it("restringe URLs públicas aos protocolos HTTP e HTTPS", () => {
    expect(validateHttpUrl("https://example.com/oferta")).toBe(true);
    expect(validateHttpUrl("http://example.com")).toBe(true);
    expect(validateHttpUrl("ftp://example.com")).toBe(false);
    expect(validateHttpUrl("example.com")).toBe(false);
  });

  it("normaliza e valida os tipos aceitos de chave PIX", () => {
    expect(normalizePixKey(" CONTATO@EXAMPLE.COM ")).toBe("contato@example.com");
    expect(validatePixKey("contato@example.com")).toBe(true);
    expect(validatePixKey("73999999999")).toBe(true);
    expect(validatePixKey("529.982.247-25")).toBe(true);
    expect(validatePixKey("chave-invalida")).toBe(false);
  });
});
