import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("AdminOffice — pedidos recentes em telas estreitas", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminOffice.tsx"), "utf8");

  it("mantém a data dentro do bloco de conteúdo no mobile e no fim da linha no desktop", () => {
    expect(source).toContain('className="min-w-0"');
    expect(source).toContain("office-list-mobile-date");
    expect(source).toContain("office-list-desktop-date");
    expect(source).toContain("sm:hidden");
    expect(source).toContain("hidden sm:block");
  });
});
