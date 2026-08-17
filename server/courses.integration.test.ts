import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("catálogo de cursos", () => {
  it("mantém o progresso associado ao membro e somente para cursos publicados", async () => {
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    expect(db).toContain("getMemberCourses");
    expect(db).toContain("eq(courseProgress.userId, userId)");
    expect(db).toContain("updateMemberCourseProgress");
    expect(db).toContain("eq(courses.isPublished, 1)");
    expect(schema).toContain("courseUserUnique");
  });

  it("restringe a curadoria de cursos à administração", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(router).toContain("courses: protectedProcedure.query(({ ctx }) => getMemberCourses(ctx.user.id))");
    expect(router).toContain("updateCourseProgress: protectedProcedure.input");
    expect(router).toContain("courses: adminProcedure.query(() => getAdminCourses())");
    expect(router).toContain("createCourse: adminProcedure.input(courseInput)");
    expect(router).toContain("updateCoursePublication: adminProcedure.input");
  });

  it("encaminha academia, rotas de cursos e administração às páginas funcionais", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    expect(app).toContain('path="/membros/academia" component={MemberCourses}');
    expect(app).toContain('path="/membros/curso-google-ads" component={MemberCourses}');
    expect(app).toContain('path="/membros/filmes" component={MemberCourses}');
    expect(app).toContain('path="/admin/academia" component={AdminCourses}');
  });
});
