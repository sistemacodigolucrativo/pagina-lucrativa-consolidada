import { describe, expect, it } from "vitest";
import { accountInput } from "./routers";

describe("dados privados da conta", () => {
  it("normaliza o e-mail cadastral antes da persistência", () => {
    const result = accountInput.parse({ name: "  Pessoa de Teste ", email: " PESSOA@EXAMPLE.COM " });
    expect(result).toEqual({ name: "Pessoa de Teste", email: "pessoa@example.com" });
  });

  it("rejeita e-mail sem domínio, sem arroba ou com espaço interno", () => {
    for (const email of ["pessoa", "pessoa@", "pessoa@example", "pessoa example.com"]) {
      expect(() => accountInput.parse({ name: "Pessoa de Teste", email })).toThrow();
    }
  });

  it("rejeita nome de identificação incompleto", () => {
    expect(() => accountInput.parse({ name: "A", email: "pessoa@example.com" })).toThrow();
  });
});
