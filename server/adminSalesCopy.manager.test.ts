import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_SALES_COPY_SECTIONS } from "../shared/publicSalesCopyEditor";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("gerenciador da página pública", () => {
  it("mantém as 21 seções na ordem pública", () => {
    expect(PUBLIC_SALES_COPY_SECTIONS).toHaveLength(21);
    expect(PUBLIC_SALES_COPY_SECTIONS.map(section => section.publicOrder)).toEqual(Array.from({ length: 21 }, (_, index) => index + 1));
    expect(PUBLIC_SALES_COPY_SECTIONS[0]?.id).toBe("hero");
    expect(PUBLIC_SALES_COPY_SECTIONS[20]?.id).toBe("offer");
  });

  it("usa a própria página pública como editor visual responsivo", () => {
    const admin = read("client/src/pages/AdminSalesImages.tsx");
    const css = read("client/src/pages/AdminVisualSalesEditor.css");

    expect(admin).toContain('src={withAppBase("/?visual-editor=1")}');
    expect(admin).toContain('title="Editor visual da página pública"');
    expect(admin).toContain('"desktop"');
    expect(admin).toContain('"tablet"');
    expect(admin).toContain('"mobile"');
    expect(admin).toContain("Testar interação");
    expect(admin).toContain("contentEditable = \"true\"");
    expect(admin).toContain("Salvar");
    expect(admin).toContain("Descartar");
    expect(admin).toContain("Salvar imagem");
    expect(admin).toContain("PointerEvent");
    expect(admin).toContain("dataset.visualDraggable");
    expect(admin).toContain("PUBLIC_SALES_COPY_SECTIONS");
    expect(css).toContain(".visual-editor-toolbar");
    expect(css).toContain("@media(max-width:560px)");
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
