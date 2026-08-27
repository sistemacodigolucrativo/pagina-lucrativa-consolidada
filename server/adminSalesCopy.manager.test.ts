import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_SALES_COPY_SECTIONS } from "../shared/publicSalesCopyEditor";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("gerenciador da página pública", () => {
  it("mantém as 22 seções na ordem pública", () => {
    expect(PUBLIC_SALES_COPY_SECTIONS).toHaveLength(22);
    expect(PUBLIC_SALES_COPY_SECTIONS.map(section => section.publicOrder)).toEqual(Array.from({ length: 22 }, (_, index) => index + 1));
    expect(PUBLIC_SALES_COPY_SECTIONS[0]?.id).toBe("hero");
    expect(PUBLIC_SALES_COPY_SECTIONS[21]?.id).toBe("offer");
  });

  it("mantém edição individual, upload reaproveitado e layout mobile", () => {
    const admin = read("client/src/pages/AdminSalesImages.tsx");
    expect(admin).toContain("Salvar alterações");
    expect(admin).toContain("Selecionar imagem");
    expect(admin).toContain("Enviar imagem");
    expect(admin).toContain("min-h-11 w-full");
    expect(admin).toContain("sm:w-auto");
    expect(admin).toContain("px-3 py-5 sm:p-8");
    expect(admin).toContain("PUBLIC_SALES_COPY_SECTIONS.map");
  });

  it("expõe e aplica a copy persistida sem alterar o schema", () => {
    const server = read("server/_core/publicSalesCopyConfig.ts");
    const runtime = read("client/src/components/PublicSalesCopyRuntime.tsx");
    expect(server).toContain("PUBLIC_SALES_COPY_CATEGORY");
    expect(server).toContain("getAdminContent");
    expect(runtime).toContain("/api/public-sales-copy");
    expect(runtime).toContain("MutationObserver");
  });
});
