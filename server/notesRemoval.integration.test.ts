import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

 describe("remoção do sistema global de notas", () => {
  it("não monta nem estiliza o sistema de notas", () => {
    const app = read("client/src/App.tsx");
    const styles = read("client/src/index.css");

    expect(app).not.toContain("GlobalNotes");
    expect(app).not.toContain("global-notes");
    expect(styles).not.toContain("global-notes");
    expect(existsSync(resolve(root, "client/src/components/GlobalNotes.tsx"))).toBe(false);
  });

  it("não mantém teste ou contrato exclusivo da funcionalidade removida", () => {
    const router = read("server/routers.ts");
    const db = read("server/db.ts");
    const schema = read("drizzle/schema.ts");

    expect(router).not.toContain("globalNotes");
    expect(db).not.toContain("globalNotes");
    expect(schema).not.toContain("globalNotes");
    expect(existsSync(resolve(root, "server/globalNotes.integration.test.ts"))).toBe(false);
  });
});
