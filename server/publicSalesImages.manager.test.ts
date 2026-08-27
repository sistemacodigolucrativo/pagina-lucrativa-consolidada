import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PUBLIC_SALES_SECTIONS } from "../shared/publicSalesSections";
import { PUBLIC_SALES_COPY_SECTIONS } from "../shared/publicSalesCopyEditor";

const adminPageSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminSalesImages.tsx"), "utf8");
const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const navigationSource = readFileSync(resolve(process.cwd(), "client/src/lib/adminNavigation.ts"), "utf8");
const previewSource = readFileSync(resolve(process.cwd(), "client/src/pages/Preview.tsx"), "utf8");
const cssSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("public sales section image manager", () => {
  it("defines unique stable section IDs for every public block", () => {
    const ids = PUBLIC_SALES_SECTIONS.map(section => section.id);
    expect(ids.length).toBe(13);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("hero_operation");
    expect(ids).toContain("state_desired");
    expect(ids).toContain("comparison");
    expect(ids).toContain("opportunity_indication");
    expect(ids).toContain("not_just_course");
    expect(PUBLIC_SALES_COPY_SECTIONS).toHaveLength(22);
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "problem_start")?.defaultImage).toBe("/problem-start.png");
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "state_desired")?.defaultImage).toBe("/state-desired.png");
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "mechanism")?.defaultImage).toBe("/mechanism.png");
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "product_real")?.defaultImage).toBe("/product-real.png");
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "activation_journey")?.defaultImage).toBe("/activation-journey.png");
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "behind_structure")?.defaultImage).toBe("/behind-structure.png");
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "comparison")?.defaultImage).toBe("/comparison.png");
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "digital_asset")?.defaultImage).toBe("/digital-asset.png");
    expect(PUBLIC_SALES_SECTIONS.find(section => section.id === "proof_matters")?.defaultImage).toBe("/proof-matters.png");
  });

  it("preserves image upload and confirmation inside the WYSIWYG editor", () => {
    expect(adminPageSource).toContain("trpc.admin.upsertPublicSalesSectionImage.useMutation");
    expect(adminPageSource).toContain("trpc.admin.content.useQuery()");
    expect(adminPageSource).toContain("trpc.admin.createContent.useMutation()");
    expect(adminPageSource).toContain("trpc.admin.updateContent.useMutation()");
    expect(adminPageSource).toContain('accept="image/jpeg,image/png,image/gif"');
    expect(adminPageSource).toContain("file.size > 4 * 1024 * 1024");
    expect(adminPageSource).toContain("target.element.src = reader.result");
    expect(adminPageSource).toContain("Salvar imagem");
    expect(adminPageSource).toContain("Descartar");
    expect(adminPageSource).toContain("utils.admin.publicSalesSectionImages.invalidate()");
    expect(adminPageSource).toContain("utils.public.salesSectionImages.invalidate()");
    expect(adminPageSource).not.toContain("onCrop");
    expect(adminPageSource).not.toContain("onDrop");
  });

  it("provides five isolated preview models for the state-desired section", () => {
    expect(previewSource).toContain('const stateSection = PUBLIC_SALES_SECTIONS.find(section => section.id === "state_desired")!');
    expect((previewSource.match(/Modelo 0[1-5]/g) ?? []).length).toBe(5);
    expect(previewSource).toContain("preview-model-01");
    expect(previewSource).toContain("preview-model-02");
    expect(previewSource).toContain("preview-model-03");
    expect(previewSource).toContain("preview-model-04");
    expect(previewSource).toContain("preview-model-05");
    expect(previewSource).toContain("não altera a Home pública");
    expect(cssSource).toContain(".preview-portfolio-page");
    expect(cssSource).toContain(".preview-model-05-stage");
  });

  it("registers the admin route and navigation entry", () => {
    expect(appSource).toContain('import AdminSalesImages from "@/pages/AdminSalesImages";');
    expect(appSource).toContain('<Route path="/admin/imagens" component={AdminSalesImages} />');
    expect(appSource).toContain('<Route path="/preview" component={Preview} />');
    expect(navigationSource).toContain('label: "Imagens do Sistema"');
    expect(navigationSource).toContain('path: "/admin/imagens"');
    expect(navigationSource).toContain('group: "Sistema"');
  });

  it("uses admin-protected procedures and persistent storage helpers", () => {
    expect(routerSource).toContain("publicSalesSectionImages: adminProcedure.query");
    expect(routerSource).toContain("upsertPublicSalesSectionImage: adminProcedure.input");
    expect(routerSource).toContain("removePublicSalesSectionImage: adminProcedure.input");
    expect(dbSource).toContain("storagePut(`public-sales/${sectionId}/");
    expect(dbSource).toContain("publicSalesSectionImages");
    expect(dbSource).toContain('status: \"removed\"');
  });
});
