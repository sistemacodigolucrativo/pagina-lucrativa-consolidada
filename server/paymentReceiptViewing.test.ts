import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("visualização e acompanhamento de comprovantes", () => {
  it("mantém controles explícitos de zoom e fechamento no visualizador de comprovante", async () => {
    const source = await readFile(path.join(root, "client/src/pages/MemberAffiliateOrders.tsx"), "utf8");
    expect(source).toContain('aria-label="Controles de zoom do comprovante"');
    expect(source).toContain('aria-label="Aumentar zoom"');
    expect(source).toContain('aria-label="Diminuir zoom"');
    expect(source).toContain('aria-label="Fechar visualização do comprovante"');
  });

  it("remove o card externo duplicado do estado de pagamento aprovado", async () => {
    const source = await readFile(path.join(root, "client/src/pages/ApplicationTracking.tsx"), "utf8");
    const approvedState = source.slice(source.indexOf('if (result && state === "approved")'), source.indexOf('if (result && state)'));
    expect(approvedState).toContain('className="w-full max-w-xl"');
    expect(approvedState).not.toContain('className="access-card"');
    expect(approvedState).toContain("Pagamento aprovado");
    expect(approvedState).toContain("Seu acesso ao Método Código Lucrativo foi liberado para personalização.");
    expect(approvedState).toContain("← Voltar para o Método Código Lucrativo");
    expect(approvedState).not.toContain("Voltar à estrutura");
  });
});
