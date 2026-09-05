import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("Academia com leitor integrado", () => {
  it("mantém o vínculo persistente de curso, rota e e-book", async () => {
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const data = await readFile(path.join(root, "server/db.ts"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(schema).toContain('routeKey: varchar("routeKey", { length: 160 }).notNull()');
    expect(schema).toContain('ebookId: int("ebookId")');
    expect(data).toContain("getMemberCourseByRouteKey");
    expect(data).toContain("Vincule um e-book publicado antes de disponibilizar este curso.");
    expect(router).toContain("course: protectedProcedure.input");
  });

  it("abre a formação no leitor isolado e responsivo, preservando rotas já divulgadas", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const memberCourses = await readFile(path.join(root, "client/src/pages/MemberCourses.tsx"), "utf8");
    const reader = await readFile(path.join(root, "client/src/components/ResponsiveEbookFrame.tsx"), "utf8");
    expect(app).toContain('path="/membros/curso-google-ads" component={MemberCourses}');
    expect(app).toContain('path="/membros/curso/:courseKey" component={MemberCourses}');
    expect(memberCourses).toContain("ResponsiveEbookFrame");
    expect(memberCourses).toContain("htmlContent={course.ebook.htmlContent}");
    expect(reader).toContain("srcDoc={hasPdfSource ? undefined : htmlContent}");
    expect(reader).toContain('sandbox={hasPdfSource ? undefined : "allow-same-origin"}');
    expect(reader).toContain('data-reader-mode={isFullscreen ? "fullscreen" : "embedded"}');
    expect(memberCourses).toContain("Abrir material");
  });

  it("torna a associação editável na curadoria administrativa", async () => {
    const adminCourses = await readFile(path.join(root, "client/src/pages/AdminCourses.tsx"), "utf8");
    expect(adminCourses).toContain("E-book associado");
    expect(adminCourses).toContain("ebookId");
    expect(adminCourses).toContain("Vincule um e-book publicado antes de disponibilizar o curso.");
  });
});
