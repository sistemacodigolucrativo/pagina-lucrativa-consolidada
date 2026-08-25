import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("formulários operacionais responsivos", () => {
  it("empilha a grade operacional no celular e preserva duas colunas nas telas maiores", async () => {
    const css = await readFile(path.join(root, "client/src/index.css"), "utf8");
    expect(css).toContain(".office-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(css).toContain("@media (max-width: 650px)");
    expect(css).toContain(".office-form-grid { grid-template-columns: minmax(0, 1fr); gap: 14px; }");
  });

  it("protege campos longos para não comprimirem data, status, retorno e lançamentos", async () => {
    const css = await readFile(path.join(root, "client/src/index.css"), "utf8");
    const finance = await readFile(path.join(root, "client/src/pages/AdminTransactions.tsx"), "utf8");
    expect(css).toContain(".office-form-grid input, .office-form-grid select, .office-form-grid textarea { box-sizing: border-box; width: 100%; min-width: 0;");
    expect(css).toContain(".office-form-grid .office-form-full, .office-form-grid > .application-error { grid-column: 1 / -1; }");
    expect(finance).toContain('className="office-form-grid"');
  });
});
