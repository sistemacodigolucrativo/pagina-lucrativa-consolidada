import { describe, expect, it } from "vitest";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe("Academia canônica com materiais PDF", () => {
  it("centraliza tipos, metadata e regras de visibilidade da Academia", async () => {
    const shared = await readFile(path.join(root, "shared/academy.ts"), "utf8");
    expect(shared).toContain('ACADEMY_METADATA_NAME = "codigo-lucrativo-academy"');
    expect(shared).toContain('academyStatuses = ["draft", "published", "archived"]');
    expect(shared).toContain('academyLevels = ["fundamentos", "pratica", "avancado"]');
    expect(shared).toContain("type AcademyCourseSummary");
    expect(shared).toContain("type AcademyMaterialSummary");
    expect(shared).toContain("slugifyAcademyCourseTitle");
    expect(shared).toContain("normalizeAcademyMetadata");
    expect(shared).toContain("extractAcademyMetadataFromHtml");
    expect(shared).toContain("injectAcademyMetadataIntoHtml");
    expect(shared).toContain("isAcademyMaterialVisibleToMember");
    expect(shared).toContain('normalizeAcademyStatus(material.status) === "published"');
    expect(shared).toContain("Boolean(metadata.courseTitle && metadata.courseSlug)");
  });

  it("move a lógica operacional para academyService sem criar fluxo paralelo em courses", async () => {
    const service = await readFile(path.join(root, "server/academyService.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(service).toContain("buildAcademyCoursesFromMaterials");
    expect(service).toContain("getAdminAcademyMaterials");
    expect(service).toContain("getMemberAcademyCourses");
    expect(service).toContain("getMemberAcademyCourseByRouteKey");
    expect(service).toContain("createAdminAcademyMaterial");
    expect(service).toContain("updateAdminAcademyMaterial");
    expect(service).toContain("setAdminAcademyMaterialStatus");
    expect(service).toContain("updateMemberAcademyProgress");
    expect(service).toContain("storagePut");
    expect(service).toContain('buffer.subarray(0, 5).toString("utf8") !== "%PDF-"');
    expect(db).toContain('await import("./academyService")');
    expect(db).toContain("getMemberAcademyCourses");
    expect(db).toContain("getLegacyAdminCourses");
    expect(db).not.toContain("courseStatusToPersistence");
  });

  it("expõe namespace tRPC canônico e mantém aliases temporários", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(router).toContain("academy: router({");
    expect(router).toContain("listCourses: protectedProcedure.query(({ ctx }) => getMemberAcademyCourses(ctx.user.id))");
    expect(router).toContain("courseByRouteKey: protectedProcedure.input");
    expect(router).toContain("updateProgress: protectedProcedure.input");
    expect(router).toContain("list: adminProcedure.query(() => getAdminAcademyMaterials())");
    expect(router).toContain("detail: adminProcedure.input");
    expect(router).toContain("createMaterial: adminProcedure.input(academyMaterialInput)");
    expect(router).toContain("updateMaterial: adminProcedure.input(academyMaterialInput.extend");
    expect(router).toContain("setMaterialStatus: adminProcedure.input");
    expect(router).toContain("archiveMaterial: adminProcedure.input");
    expect(router).toContain("courses: protectedProcedure.query(({ ctx }) => getMemberAcademyCourses(ctx.user.id))");
    expect(router).toContain("courses: adminProcedure");
  });

  it("preserva rotas públicas usando AdminAcademy e MemberAcademy", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const adminWrapper = await readFile(path.join(root, "client/src/pages/AdminEbooks.tsx"), "utf8");
    const memberWrapper = await readFile(path.join(root, "client/src/pages/MemberCourses.tsx"), "utf8");
    expect(app).toContain('path="/admin/academia" component={AdminAcademy}');
    expect(app).toContain('path="/admin/ebooks" component={AdminAcademyRedirect}');
    expect(app).toContain('path="/membros/academia" component={MemberAcademy}');
    expect(app).toContain('path="/membros/curso/:courseKey" component={MemberAcademy}');
    expect(app).toContain('path="/membros/curso-google-ads" component={MemberAcademy}');
    expect(adminWrapper).toContain('import AdminAcademy from "./AdminAcademy"');
    expect(memberWrapper).toContain('import MemberAcademy from "./MemberAcademy"');
    expect(await fileExists(path.join(root, "client/src/pages/AdminCourses.tsx"))).toBe(false);
  });

  it("deixa a curadoria administrativa com nomenclatura e ações de Academia", async () => {
    const admin = await readFile(path.join(root, "client/src/pages/AdminAcademy.tsx"), "utf8");
    expect(admin).toContain("Cursos e materiais");
    expect(admin).toContain("Publicados sem curso");
    expect(admin).toContain("Curso é o agrupador. Material/PDF é o item editável.");
    expect(admin).toContain("const [editorOpen, setEditorOpen] = useState(false)");
    expect(admin).toContain("function openNewMaterial()");
    expect(admin).toContain("function openMaterial(id: number)");
    expect(admin).toContain("{editorOpen ? (");
    expect(admin).toContain("Salvar material");
    expect(admin).toContain("Publicar material");
    expect(admin).toContain("Arquivar");
    expect(admin).toContain('accept="application/pdf"');
    expect(admin).toContain("slugifyAcademyCourseTitle");
    expect(admin).toContain("getAcademyStatusLabel");
    expect(admin).not.toContain("E-book avulso");
    expect(admin).not.toContain("Curso e biblioteca");
    expect(admin).not.toContain("Publicar ao salvar");
  });

  it("mantém aviso de visibilidade acima da ação Novo material no admin", async () => {
    const admin = await readFile(path.join(root, "client/src/pages/AdminAcademy.tsx"), "utf8");
    const visibilityNoticeIndex = admin.indexOf("Aviso de visibilidade");
    const newMaterialButtonIndex = admin.indexOf("<PlusCircle");
    const newMaterialFormIndex = admin.indexOf("Novo material PDF");
    expect(visibilityNoticeIndex).toBeGreaterThan(-1);
    expect(newMaterialButtonIndex).toBeGreaterThan(-1);
    expect(newMaterialFormIndex).toBeGreaterThan(-1);
    expect(visibilityNoticeIndex).toBeLessThan(newMaterialButtonIndex);
    expect(newMaterialButtonIndex).toBeLessThan(newMaterialFormIndex);
  });

  it("mantém a experiência do membro limpa, agrupada e com leitor oficial", async () => {
    const member = await readFile(path.join(root, "client/src/pages/MemberAcademy.tsx"), "utf8");
    expect(member).toContain("ResponsiveEbookFrame");
    expect(member).toContain("trpc.member.academy.listCourses.useQuery");
    expect(member).toContain("trpc.member.academy.courseByRouteKey.useQuery");
    expect(member).toContain("trpc.member.academy.updateProgress.useMutation");
    expect(member).toContain("Nenhum curso disponível no momento.");
    expect(member).toContain("Material indisponível");
    expect(member).toContain('aria-label="Materiais do curso"');
    expect(member).toContain("pdfUrl={activeMaterial.pdfUrl ?? null}");
    expect(member).toContain("course.progressPercent ?? 0");
    expect(member).not.toMatch(/\{\{COURSE\./i);
    expect(member).not.toMatch(/\{\{course\./i);
    expect(member).not.toContain("Course thumbnail");
    expect(member).not.toContain("Course title");
  });
});
