import { describe, expect, it } from "vitest";
import { accountInput } from "./routers";

describe("dados privados da conta", () => {
  it("normaliza o nome e descarta qualquer tentativa de alterar o e-mail", () => {
    const result = accountInput.parse({ name: "  Pessoa de Teste ", email: " OUTRO@EXAMPLE.COM " });
    expect(result.name).toBe("Pessoa de Teste");
    expect(result).not.toHaveProperty("email");
  });

  it("não usa o contrato de atualização da conta para validar ou persistir e-mail", () => {
    for (const email of ["pessoa", "pessoa@", "pessoa@example", "pessoa example.com"]) {
      const result = accountInput.parse({ name: "Pessoa de Teste", email });
      expect(result).not.toHaveProperty("email");
    }
  });

  it("rejeita nome de identificação incompleto", () => {
    expect(() => accountInput.parse({ name: "A", email: "pessoa@example.com" })).toThrow();
  });
});
