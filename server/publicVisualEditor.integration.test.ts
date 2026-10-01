import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_VISUAL_EDITOR_CATEGORY,
  PUBLIC_VISUAL_EDITOR_MODE_RESOURCE,
  createEmptyPublicVisualLayout,
  parsePublicVisualLayout,
  parsePublicVisualMode,
  publicVisualLayoutResource,
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
    expect(runtime).toContain("beforeunload");
    expect(runtime).toContain("Duplicar");
    expect(runtime).toContain("Excluir");
  });
});
