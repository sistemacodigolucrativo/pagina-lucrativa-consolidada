import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_HERO_TITLE, splitPublicHeroTitle } from "../shared/publicHeroTitle";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Hero público — paleta estável após Configurar Seções", () => {
  it("preserva as duas cores da identidade mesmo quando o título vem do editor", () => {
    const editor = read("shared/publicSalesCopyEditor.ts");
    const runtime = read("client/src/components/PublicSalesCopyRuntime.tsx");
    const fixes = read("client/src/home-spacing-fixes.css");
    const main = read("client/src/main.tsx");

    expect(editor).toContain(PUBLIC_HERO_TITLE);
    expect(runtime).toContain("splitPublicHeroTitle(title)");
    expect(runtime).toContain('accentNode.className = "public-hero-title-accent"');
    expect(fixes).toContain(".public-hero-title-accent");
    expect(fixes).toContain("color: var(--gold);");
    expect(fixes).toContain("color: var(--gold-bright);");
    expect(main.indexOf('import "./home-spacing-fixes.css"')).toBeGreaterThan(main.indexOf('import "./index.css"'));

    expect(splitPublicHeroTitle(PUBLIC_HERO_TITLE)).toEqual({
      accent: "Receba o Método Código Lucrativo pronto para começar",
      remainder: "— com estrutura consolidada para ativar e operar.",
    });
  });

  it("não mostra o fallback antigo antes de resolver a copy persistida", () => {
    const runtime = read("client/src/components/PublicSalesCopyRuntime.tsx");
    const fixes = read("client/src/home-spacing-fixes.css");
    expect(runtime).toContain("ready: false");
    expect(runtime).toContain("ready: true");
    expect(runtime).toContain('element.classList.add("public-hero-title-ready")');
    expect(fixes).toContain("visibility: hidden;");
    expect(fixes).toContain("> h1.public-hero-title-ready");
    expect(fixes).toContain("visibility: visible;");
  });

  it("reutiliza os tokens existentes da paleta em vez de criar novas cores", () => {
    const base = read("client/src/index.css");
    const fixes = read("client/src/home-spacing-fixes.css");
    expect(base).toContain("--gold: #03D660;");
    expect(base).toContain("--gold-bright: #ABF6D0;");
    expect(fixes).not.toMatch(/#[0-9a-fA-F]{3,8}/);
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
