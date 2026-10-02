import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_VISUAL_EDITOR_CATEGORY,
  PUBLIC_VISUAL_EDITOR_MODE_RESOURCE,
  createEmptyPublicVisualLayout,
  normalizePublicVisualLayoutTargetIds,
  parsePublicVisualLayout,
  parsePublicVisualMode,
  publicVisualElementForTarget,
  publicVisualLayoutResource,
  publicVisualTargetIdentity,
} from "../shared/publicVisualEditor";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("editor visual real da pagina publica", () => {
  it("valida modo e layout persistidos por template e breakpoint", () => {
    expect(PUBLIC_VISUAL_EDITOR_CATEGORY).toBe("public-sales-visual-editor");
    expect(PUBLIC_VISUAL_EDITOR_MODE_RESOURCE).toBe("mode");
    expect(parsePublicVisualMode('{"enabled":true}')).toEqual({
      enabled: true,
    });
    expect(publicVisualLayoutResource("premium", "desktop")).toBe(
      "layout:premium:desktop"
    );

    const layout = createEmptyPublicVisualLayout("premium", "mobile");
    layout.elements["hero.title"] = { x: 12, y: -8, width: 480 };
    expect(parsePublicVisualLayout(JSON.stringify(layout))).toEqual(layout);
    expect(parsePublicVisualLayout('{"version":2}')).toBeNull();
  });

  it("migra IDs posicionais para chaves estáveis sem mudar o contrato v1", () => {
    const target = publicVisualTargetIdentity("package", "block", "item1", 0);
    expect(target).toEqual({
      id: "package.block.item1",
      legacyIds: ["package.block1"],
    });

    const layout = createEmptyPublicVisualLayout("official", "desktop");
    layout.elements["package.block1"] = { x: 12, y: 4 };
    layout.elements[target.id] = { x: 20, y: 8 };
    layout.elements["package.block1#copy-1"] = {
      duplicateOf: "package.block1",
      x: 4,
      y: 6,
    };

    const normalized = normalizePublicVisualLayoutTargetIds(layout, [target]);
    expect(normalized.version).toBe(1);
    expect(normalized.elements["package.block1"]).toBeUndefined();
    expect(normalized.elements[target.id]).toEqual({ x: 20, y: 8 });
    expect(normalized.elements["package.block1#copy-1"]?.duplicateOf).toBe(
      target.id
    );
    expect(publicVisualElementForTarget(layout, target)).toEqual({
      x: 20,
      y: 8,
    });
    expect(layout.elements["package.block1"]).toEqual({ x: 12, y: 4 });
  });

  it("mantém IDs v1 sem chave estável e ignora chaves longas demais", () => {
    expect(publicVisualTargetIdentity("hero", "image", undefined, 0)).toEqual({
      id: "hero.image1",
    });
    expect(
      publicVisualTargetIdentity("hero", "image", "x".repeat(180), 0)
    ).toEqual({ id: "hero.image1" });

    const legacyLayout = createEmptyPublicVisualLayout("official", "mobile");
    legacyLayout.elements["hero.image1"] = { x: -4, y: 9 };
    expect(
      publicVisualElementForTarget(
        legacyLayout,
        publicVisualTargetIdentity("hero", "image", "hero-banner", 0)
      )
    ).toEqual({ x: -4, y: 9 });
  });

  it("carrega a configuracao visual no endpoint publico", () => {
    const endpoint = read("server/_core/publicSalesCopyConfig.ts");

    expect(endpoint).toContain("PUBLIC_VISUAL_EDITOR_CATEGORY");
    expect(endpoint).toContain("parsePublicVisualMode");
    expect(endpoint).toContain("parsePublicVisualLayout");
    expect(endpoint).toContain("visualEditor.layouts");
    expect(endpoint).toContain("res.json({ overrides, floatingLayout, pageTemplate, visualEditor })");
  });

  it("exibe toggle no admin e monta controles apenas para administrador", () => {
    const admin = read("client/src/pages/AdminSalesImages.tsx");
    const runtime = read("client/src/components/PublicSalesCopyRuntime.tsx");

    expect(admin).toContain("Modo de edição visual");
    expect(admin).toContain("saveVisualMode");
    expect(admin).toContain("if (nextEnabled) void saveVisualMode(nextEnabled)");
    expect(admin).toContain('window.location.assign(withAppBase("/?visual-editor=1"))');
    expect(admin).toContain("PUBLIC_VISUAL_EDITOR_MODE_RESOURCE");
    expect(runtime).toContain('session.data?.role === "admin"');
    expect(runtime).toContain("editorEnabled = ready && visualEditor.enabled && isAdmin");
    expect(runtime).toContain("trpc.admin.content.useQuery");
    expect(runtime).toContain("publicVisualLayoutResource");
    expect(runtime).toContain("normalizePublicVisualLayoutTargetIds");
    expect(runtime).toContain("publicVisualTargetIdentity");
    expect(runtime).toContain("beforeunload");
    expect(runtime).toContain("Duplicar");
    expect(runtime).toContain("Excluir");
    const home = read("client/src/pages/Home.tsx");
    expect(home).toContain('data-public-visual-key={item.id}');
    expect(home).toContain(
      'data-public-visual-key={`testimonial-${item.id}`}'
    );
  });
});
