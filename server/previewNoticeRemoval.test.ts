import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("remoção definitiva do banner de preview", () => {
  it("não mantém controle remoto e oculta o marcador do runtime", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const viteConfig = await readFile(path.join(root, "vite.config.ts"), "utf8");
    const packageJson = await readFile(path.join(root, "package.json"), "utf8");

    expect(app).not.toContain("hideExternalPreviewNotice");
    expect(app).not.toContain("PreviewerModeAlert");
    expect(viteConfig).not.toContain("vitePluginManusRuntime");
    expect(packageJson).not.toContain("vite-plugin-manus-runtime");
    expect(router).not.toContain("platformSettings");
    expect(router).not.toContain("updatePlatformSettings");
    expect(db).not.toContain("hideExternalPreviewNotice");
    expect(schema).not.toContain('export const platformSettings');
    await expect(access(path.join(root, "client/src/pages/AdminSettings.tsx"))).rejects.toThrow();
  });
});
