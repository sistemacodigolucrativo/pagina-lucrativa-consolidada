import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.env.PROJECT_ROOT || process.cwd();

async function fileExists(relativePath: string) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("Academia com leitor integrado", () => {
  it("mantém o vínculo persistente de curso, rota e e-book", async () => {
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const data = await readFile(path.join(root, "server/db.ts"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(schema).toContain('routeKey: varchar("routeKey", { length: 160 }).notNull()');
    expect(schema).toContain('ebookId: int("ebookId")');
    expect(data).toContain("getMemberCourseByRouteKey");
    expect(data).toContain("getAcademyEbookCourses");
    expect(data).toContain("ACADEMY_EBOOK_COURSE_ID_OFFSET");
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
    expect(memberCourses).toContain("courseEbooks");
    expect(memberCourses).toContain("activeEbook");
    expect(memberCourses).toContain("htmlContent={activeEbook.htmlContent}");
    expect(memberCourses).toContain("pdfUrl={activeEbook.pdfUrl ?? null}");
    expect(reader).toContain("function PdfCanvasReader");
    expect(reader).toContain("srcDoc={htmlContent}");
    expect(reader).toContain('sandbox="allow-same-origin"');
    expect(reader).toContain('data-reader-mode={isFullscreen ? "fullscreen" : "embedded"}');
    expect(memberCourses).toContain("Abrir material");
  });

  it("mantém a curadoria administrativa em um único fluxo canônico", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const adminEbooks = await readFile(path.join(root, "client/src/pages/AdminEbooks.tsx"), "utf8");
    const adminNavigation = await readFile(path.join(root, "client/src/lib/adminNavigation.ts"), "utf8");

    expect(await fileExists("client/src/pages/AdminCourses.tsx")).toBe(false);
    expect(app).not.toContain("function AdminEbooksRedirect()");
    expect(app).not.toContain('<Redirect to="/admin/academia" replace />');
    expect(app).toContain('path="/admin/ebooks" component={AdminEbooks}');
    expect(app).toContain('path="/admin/academia" component={AdminEbooks}');
    expect(adminNavigation).toContain('label: "Academia", path: "/admin/academia"');
    expect(adminNavigation).toContain('label: "Biblioteca de e-books", path: "/admin/ebooks"');
    expect(adminEbooks).toContain("Materiais publicados com destino Academia aparecem agrupados por curso");
    expect(adminEbooks).toContain("Publicados sem curso");
    expect(adminEbooks).toContain("inferAcademyMetadataFromPath");
    expect(adminEbooks).not.toContain("E-book avulso");
    expect(adminEbooks).not.toContain("Curso e biblioteca");
  });
});
