import { describe, expect, it } from "vitest";
import { formatPhoneBR, normalizedEmailZodSchema, normalizeEmail, normalizePhone, validatePhoneBR } from "./contactValidation";

describe("contactValidation", () => {
  it("higieniza e formata o telefone sem aceitar excesso", () => {
    expect(normalizePhone("(73) 9 9999-9999abc")).toBe("73999999999");
    expect(formatPhoneBR("73999999999")).toBe("(73) 9 9999-9999");
    expect(formatPhoneBR("739999999999")).toBe("(73) 9 9999-9999");
  });

  it("reconhece apenas 10 ou 11 dígitos e normaliza o e-mail", () => {
    expect(validatePhoneBR("7399999999")).toBe(true);
    expect(validatePhoneBR("73999999999")).toBe(true);
    expect(validatePhoneBR("739999999")).toBe(false);
    expect(validatePhoneBR("739999999999")).toBe(false);
    expect(normalizeEmail("  PESSOA@EXAMPLE.COM ")).toBe("pessoa@example.com");
  });

  it("remove espaços externos, elimina espaços acidentais no campo e rejeita espaços no contrato", () => {
    expect(normalizeEmail("  PESSOA @EXAMPLE.COM ")).toBe("pessoa@example.com");
    expect(normalizedEmailZodSchema.parse(" PESSOA@EXAMPLE.COM ")).toBe("pessoa@example.com");
    expect(() => normalizedEmailZodSchema.parse("pessoa @example.com")).toThrow();
  });
});
