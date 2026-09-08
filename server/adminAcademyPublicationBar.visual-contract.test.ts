import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("contrato visual da barra de publicação da Academia", () => {
  it("usa regras mobile centradas, sem overflow horizontal e com fallback legado", async () => {
    const css = await readFile(path.join(root, "client/src/admin-academy-mobile.css"), "utf8");

    expect(css).toContain(".admin-academy-publication-bar");
    expect(css).toContain("width: 100dvw !important");
    expect(css).toContain("max-width: 100dvw !important");
    expect(css).toContain("overflow-x: clip");
    expect(css).toContain("safe-area-inset-bottom");
    expect(css).toContain("safe-area-inset-left");
    expect(css).toContain("safe-area-inset-right");
    expect(css).toContain(".admin-academy-publication-card");
    expect(css).toContain("max-width: min(calc(100dvw - 1.5rem), 36rem) !important");
    expect(css).toContain("left: 50dvw !important");
    expect(css).toContain(":not(.admin-academy-publication-bar)");
  });

  it("mantém um roteiro automatizado de validação visual com viewports críticos", async () => {
    const script = await readFile(path.join(root, "scripts/visual-checks/admin-academy-publication-bar-contract.mjs"), "utf8");

    expect(script).toContain("mobile-360");
    expect(script).toContain("mobile-390");
    expect(script).toContain("mobile-430");
    expect(script).toContain("tablet-768");
    expect(script).toContain("desktop-1280");
    expect(script).toContain("getBoundingClientRect");
    expect(script).toContain("scrollWidth <= viewport.width");
    expect(script).toContain("cardLeft >= -0.5");
    expect(script).toContain("cardRight <= viewport.width + 0.5");
    expect(script).toContain("centerDelta <= 1");
    expect(script).toContain("buttonHeight >= 44");
    expect(script).toContain("ADMIN_ACADEMY_PUBLICATION_BAR_VISUAL_CONTRACT=ok");
  });
});
