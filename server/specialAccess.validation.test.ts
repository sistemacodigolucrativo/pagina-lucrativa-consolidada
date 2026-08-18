import { describe, expect, it } from "vitest";
import { specialAccessInput } from "./routers";

describe("specialAccessInput", () => {
  const valid = { title: "Acesso reservado", message: "Esta é uma mensagem de acesso especial com conteúdo suficiente.", buttonLabel: "Continuar", destinationUrl: "https://www.ocodigolucrativo.site/", password: "senha-segura", status: "published" as const };
  it("aceita uma configuração estruturada", () => expect(specialAccessInput.safeParse(valid).success).toBe(true));
  it("rejeita senha curta, URL sem protocolo e mensagem insuficiente", () => {
    expect(specialAccessInput.safeParse({ ...valid, password: "12345" }).success).toBe(false);
    expect(specialAccessInput.safeParse({ ...valid, destinationUrl: "ocodigolucrativo.site" }).success).toBe(false);
    expect(specialAccessInput.safeParse({ ...valid, message: "curta" }).success).toBe(false);
  });
});
