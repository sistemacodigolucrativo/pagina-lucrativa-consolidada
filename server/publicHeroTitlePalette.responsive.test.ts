import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Hero público — paleta estável após Configurar Seções", () => {
  it("mantém a copy do editor como texto e a cor como responsabilidade do estilo estrutural", () => {
    const home = read("client/src/pages/Home.tsx");
    const editor = read("shared/publicSalesCopyEditor.ts");
    const fixes = read("client/src/home-spacing-fixes.css");
    const main = read("client/src/main.tsx");

    expect(editor).toContain('f("title", "Título", "Receba o Método Código Lucrativo pronto para começar — com estrutura consolidada para ativar e operar.", "textarea", "h1")');
    expect(home).toContain("overrides.hero?.title");
    expect(fixes).toContain(".reference-page .sales-hero .sales-hero-copy > h1,");
    expect(fixes).toContain(".reference-page .sales-hero .sales-hero-copy > h1 span");
    expect(fixes).toContain("color: var(--gold-bright);");
    expect(main.indexOf('import "./home-spacing-fixes.css"')).toBeGreaterThan(main.indexOf('import "./index.css"'));
  });

  it("usa o mesmo token de cor com e sem o span do fallback", () => {
    const base = read("client/src/index.css");
    const fixes = read("client/src/home-spacing-fixes.css");
    expect(base).toContain("--gold-bright: #ABF6D0;");
    expect(base).toContain(".sales-page h1 span, .sales-page h2 span { color: var(--gold);");
    expect(fixes).toContain("h1 span {\n  color: var(--gold-bright);");
  });

  it("preserva o comportamento responsivo existente em desktop, tablet e mobile", () => {
    const base = read("client/src/index.css");
    const fixes = read("client/src/home-spacing-fixes.css");
    expect(base).toContain("font-size: clamp(45px, 5.25vw, 70px)");
    expect(base).toContain("@media (max-width: 900px)");
    expect(base).toContain("@media (max-width: 650px)");
    expect(base).toContain("font-size: clamp(36px, 10.2vw, 46px)");
    expect(fixes).toContain("@media (max-width: 900px)");
    expect(fixes).toContain("@media (max-width: 560px)");
  });
});
