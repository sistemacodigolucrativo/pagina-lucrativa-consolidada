import { describe, expect, it } from "vitest";
import { buildAcademyCoursesFromMaterials } from "./academyService";
import { normalizeAcademyMetadata, type AcademyMaterialSummary } from "@shared/academy";

function material(overrides: Partial<AcademyMaterialSummary>): AcademyMaterialSummary {
  return {
    id: 1,
    title: "Material",
    summary: null,
    status: "published",
    sourceId: "source",
    sourceFile: "material.pdf",
    sourcePath: "/manus-storage/academy/material.pdf",
    htmlContent: "<html></html>",
    contentType: "application/pdf",
    pdfUrl: "/manus-storage/academy/material.pdf",
    pdfPath: null,
    publishedAt: null,
    updatedAt: null,
    metadata: normalizeAcademyMetadata({ courseTitle: "Curso Teste", courseSlug: "curso-teste", lessonOrder: 1 }),
    needsCourse: false,
    ...overrides,
  };
}

describe("academyService", () => {
  it("agrupa materiais publicados por curso e respeita a ordem", () => {
    const courses = buildAcademyCoursesFromMaterials([
      material({ id: 2, title: "Segunda aula", metadata: normalizeAcademyMetadata({ courseTitle: "Curso Teste", courseSlug: "curso-teste", lessonOrder: 2 }) }),
      material({ id: 1, title: "Primeira aula", metadata: normalizeAcademyMetadata({ courseTitle: "Curso Teste", courseSlug: "curso-teste", lessonOrder: 1 }) }),
    ]);
    expect(courses).toHaveLength(1);
    expect(courses[0]).toMatchObject({ title: "Curso Teste", routeKey: "curso-teste", materialCount: 2, progressPercent: 0 });
    expect(courses[0].materials.map(item => item.title)).toEqual(["Primeira aula", "Segunda aula"]);
  });

  it("não entrega rascunho, arquivado ou publicado sem curso para o membro", () => {
    const courses = buildAcademyCoursesFromMaterials([
      material({ id: 1, status: "draft" }),
      material({ id: 2, status: "archived" }),
      material({ id: 3, status: "published", metadata: normalizeAcademyMetadata(null), needsCourse: true }),
    ]);
    expect(courses).toEqual([]);
  });
});
