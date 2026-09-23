import { describe, expect, it } from "vitest";
import { accountInput } from "./routers";

describe("dados privados da conta", () => {
  it("normaliza nome e e-mail da conta", () => {
    const result = accountInput.parse({ name: "  Pessoa de Teste ", email: " OUTRO@EXAMPLE.COM " });
    expect(result.name).toBe("Pessoa de Teste");
    expect(result.email).toBe("outro@example.com");
  });

  it("valida o e-mail antes de permitir atualização da conta", () => {
    for (const email of ["pessoa", "pessoa@", "pessoa@example", "pessoa example.com"]) {
      expect(() => accountInput.parse({ name: "Pessoa de Teste", email })).toThrow();
    }
  });

  it("rejeita nome de identificação incompleto", () => {
    expect(() => accountInput.parse({ name: "A", email: "pessoa@example.com" })).toThrow();
  });
});
