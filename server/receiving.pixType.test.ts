import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Tipo da chave PIX", () => {
  it("renderiza seletor e mantém opção para valores legados", () => {
    const source = readFileSync(path.join(process.cwd(), "client/src/pages/MemberReceiving.tsx"), "utf8");
    expect(source).toContain("const pixTypeOptions");
    expect(source).toContain("<select value={form.pixType || \"\"}");
    expect(source).toContain("CPF");
    expect(source).toContain("CNPJ");
    expect(source).toContain("E-mail");
    expect(source).toContain("Celular");
    expect(source).toContain("Chave aleatória");
    expect(source).toContain("Valor salvo:");
    expect(source).not.toContain("Tipo da chave PIX<input");
  });

  it("apresenta a regra mínima de recebimento sem a explicação antiga", () => {
    const source = readFileSync(path.join(process.cwd(), "client/src/pages/MemberReceiving.tsx"), "utf8");

    expect(source).toContain("Configure pelo menos um método de recebimento.");
    expect(source).toContain("obrigatório para que você possa receber os valores gerados pelas suas divulgações");
    expect(source).not.toContain("Concentre aqui os meios e dados utilizados para receber valores");
    expect(source).not.toContain("Separação de dados:");
  });
});
