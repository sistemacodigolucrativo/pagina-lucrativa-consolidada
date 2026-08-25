import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Global Notes", () => {
  it("is mounted once at the application shell level", () => {
    const app = read("client/src/App.tsx");

    expect(app).toContain('import GlobalNotes from "./components/GlobalNotes"');
    expect(app).toContain("<GlobalNotes />");
    expect(app.indexOf("<GlobalNotes />")).toBeLessThan(app.indexOf("<AppRoutes />"));
  });

  it("persists notes locally per route with accessible controls", () => {
    const component = read("client/src/components/GlobalNotes.tsx");

    expect(component).toContain("pagina-lucrativa.global-notes.v1");
    expect(component).toContain("window.localStorage");
    expect(component).toContain("useLocation");
    expect(component).toContain("Abrir Global Notes");
    expect(component).toContain("Fechar Global Notes");
    expect(component).toContain('aria-label="Nota desta página"');
    expect(component).toContain("Salvar nota");
    expect(component).toContain("Copiar");
    expect(component).toContain("Limpar");
  });

  it("has a fixed responsive panel without relying on emojis", () => {
    const styles = read("client/src/index.css");
    const component = read("client/src/components/GlobalNotes.tsx");

    expect(styles).toContain(".global-notes");
    expect(styles).toContain(".global-notes-panel");
    expect(styles).toContain("@media (max-width: 760px)");
    expect(component).not.toMatch(/[✅❎ℹ️📝]/u);
  });
});
