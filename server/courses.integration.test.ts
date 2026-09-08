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
  it("mantém legado em quarentena e usa identidade canônica estável", async () => {
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const data = await readFile(path.join(root, "server/db.ts"), "utf8");
    const canonical = await readFile(path.join(root, "server/academyCanonical.ts"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(schema).toContain('routeKey: varchar("routeKey", { length: 160 }).notNull()');
    expect(schema).toContain('ebookId: int("ebookId")');
    expect(data).toContain("getAcademyEbookCourses");
    expect(canonical).toContain("getMemberCourseByRouteKey");
    expect(canonical).toContain("stableCourseId");
    expect(canonical).toContain('createHash("sha256")');
    expect(canonical).not.toContain("buildAcademyCourseId(first.id)");
    expect(router).toContain("course: protectedProcedure.input");
  });

  it("abre a formação no leitor e persiste progresso real por página", async () => {
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
    expect(memberCourses).toContain("ebookReadingProgress");
    expect(memberCourses).toContain("updateEbookReadingProgress");
    expect(memberCourses).not.toContain("Avançar 20%");
    expect(reader).toContain("function PdfCanvasReader");
    expect(reader).toContain("onProgressChange");
    expect(reader).toContain("initialPage");
    expect(reader).toContain('sandbox="allow-same-origin"');
    expect(memberCourses).toContain("Abrir material");
  });

  it("mantém editor reutilizado e adiciona publicação real do curso", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const adminEbooks = await readFile(path.join(root, "client/src/pages/AdminEbooks.tsx"), "utf8");
    const adminAcademy = await readFile(path.join(root, "client/src/pages/AdminAcademy.tsx"), "utf8");
    const adminNavigation = await readFile(path.join(root, "client/src/lib/adminNavigation.ts"), "utf8");

    expect(await fileExists("client/src/pages/AdminCourses.tsx")).toBe(false);
    expect(app).not.toContain("function AdminEbooksRedirect()");
    expect(app).not.toContain('<Redirect to="/admin/academia" replace />');
    expect(app).toContain('path="/admin/ebooks" component={AdminEbooks}');
    expect(app).toContain('path="/admin/academia" component={AdminAcademy}');
    expect(adminNavigation).toContain('label: "Academia", path: "/admin/academia"');
    expect(adminNavigation).toContain('label: "Biblioteca de e-books", path: "/admin/ebooks"');
    expect(adminEbooks).toContain("Materiais publicados com destino Academia aparecem agrupados por curso");
    expect(adminEbooks).toContain("Publicados sem curso");
    expect(adminAcademy).toContain("Publicação dos cursos");
    expect(adminAcademy).toContain("updateCoursePublication");
  });

  it("mantém materiais recolhidos, publicação flutuante e ordem automática", async () => {
    const adminAcademy = await readFile(path.join(root, "client/src/pages/AdminAcademy.tsx"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const adminCourseOrder = await readFile(path.join(root, "server/adminCourseOrder.ts"), "utf8");
    const mobileCss = await readFile(path.join(root, "client/src/admin-academy-mobile.css"), "utf8");

    expect(adminAcademy).toContain("materialsVisible");
    expect(adminAcademy).toContain("Visualizar Materiais");
    expect(adminAcademy).toContain("Ocultar Materiais");
    expect(adminAcademy).toContain("Adicionar Material");
    expect(adminAcademy).toContain("Publicação do curso");
    expect(adminAcademy).toContain("admin-academy-publication-bar");
    expect(adminAcademy).toContain("bottom-[calc(env(safe-area-inset-bottom)+0.75rem)]");
    expect(adminAcademy).toContain("nextCourseOrder");
    expect(adminAcademy).toContain("Math.max(courses.length, maxStoredOrder) + 1");
    expect(adminAcademy).toContain("readOnly");
    expect(adminAcademy).toContain("Definida automaticamente.");
    expect(adminAcademy).toContain('setMaterialEditor({ mode: "create", course: createdCourseForMaterial })');
    expect(router).toContain("createAdminCourseWithAutomaticOrder");
    expect(adminCourseOrder).toContain("GET_LOCK");
    expect(adminCourseOrder).toContain("nextAvailableCourseOrder");
    expect(adminCourseOrder).toContain("writeCourseOrder(input.summary, order)");
    expect(mobileCss).toContain(".admin-academy-publication-bar");
    expect(mobileCss).toContain("max-width: 100dvw");
    expect(mobileCss).toContain("safe-area-inset-bottom");
  });
});
