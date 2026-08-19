import { describe, expect, it } from "vitest";
import { formatPhoneBR } from "@shared/contactValidation";
import { formatCpfPixKey, normalizePixKeyByType, validatePixKeyByType } from "@shared/structuredValidation";

describe("validação contextual do tipo de chave PIX", () => {
  it("formata celular com DDD e aceita somente os 11 dígitos", () => {
    expect(formatPhoneBR("11999999999")).toBe("(11) 9 9999-9999");
    expect(normalizePixKeyByType("(11) 9 9999-9999", "celular")).toBe("(11) 9 9999-9999");
    expect(validatePixKeyByType("(11) 9 9999-9999", "celular")).toBe(true);
    expect(validatePixKeyByType("(11) 9 9999-999A", "celular")).toBe(false);
    expect(validatePixKeyByType("1199999999", "celular")).toBe(false);
  });

  it("aceita somente e-mail quando o tipo é E-mail", () => {
    expect(validatePixKeyByType("chave@example.com", "e-mail")).toBe(true);
    expect(normalizePixKeyByType(" CHAVE@EXAMPLE.COM ", "e-mail")).toBe("chave@example.com");
    expect(validatePixKeyByType("chave-example.com", "e-mail")).toBe(false);
    expect(validatePixKeyByType("11999999999", "e-mail")).toBe(false);
  });

  it("formata CPF no padrão 111.111.111-11 e exige onze números", () => {
    expect(formatCpfPixKey("11111111111")).toBe("111.111.111-11");
    expect(normalizePixKeyByType("111.111.111-11", "cpf")).toBe("111.111.111-11");
    expect(validatePixKeyByType("111.111.111-11", "cpf")).toBe(true);
    expect(validatePixKeyByType("111.111.111-1A", "cpf")).toBe(false);
    expect(validatePixKeyByType("111.111.111-111", "cpf")).toBe(false);
  });
});
