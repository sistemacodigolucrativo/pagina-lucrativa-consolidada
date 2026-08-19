import { describe, expect, it } from "vitest";
import { receivingPreferenceInput } from "./routers";

const base = {
  method: "pix" as const,
  receivingKey: "recebimento@example.com",
  paypalEnabled: false,
  pagseguroEnabled: false,
};

describe("contrato tRPC de Tipo da chave PIX", () => {
  it("aceita celular no formato solicitado", () => {
    const result = receivingPreferenceInput.safeParse({ ...base, pixType: "celular", pixKey: "(11) 9 9999-9999" });
    expect(result.success).toBe(true);
  });

  it("aceita CPF com máscara no formato solicitado", () => {
    const result = receivingPreferenceInput.safeParse({ ...base, pixType: "cpf", pixKey: "111.111.111-11" });
    expect(result.success).toBe(true);
  });

  it("rejeita valor que não corresponde ao tipo selecionado", () => {
    const result = receivingPreferenceInput.safeParse({ ...base, pixType: "e-mail", pixKey: "(11) 9 9999-9999" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(issue => issue.path[0] === "pixKey")).toBe(true);
  });
});
