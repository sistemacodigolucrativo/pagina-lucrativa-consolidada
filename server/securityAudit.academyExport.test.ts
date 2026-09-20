import { describe, expect, it } from "vitest";
import { buildAcademyManifest } from "../scripts/export-academy-content.mjs";

function row(sourceId: string, coursePublished: boolean | undefined, lessonOrder: number) {
  const metadata = { usage: "both", courseTitle: "Curso", courseSlug: "curso", coursePublished, moduleTitle: "Módulo", moduleOrder: 1, lessonOrder };
  return { sourceId, title: sourceId, summary: "Curadoria", status: "published", htmlContent: `<meta name="codigo-lucrativo-academy" content="${encodeURIComponent(JSON.stringify(metadata))}">` };
}

describe("MED-04: exportação preserva publicação da Academia", () => {
  it("curso despublicado continua despublicado no manifesto exportado", () => {
    const manifest = buildAcademyManifest([row("second", false, 2), row("first", true, 1)]);
    expect(manifest.courses[0]).toMatchObject({ slug: "curso", published: false });
    expect(manifest.courses[0].modules[0].lessons.map((lesson: any) => lesson.sourceId)).toEqual(["first", "second"]);
    expect(manifest.courses[0].modules[0].lessons[0].summary).toBe("Curadoria");
  });
  it("publicado por padrão mantém compatibilidade e ignora materiais sem curso", () => {
    const manifest = buildAcademyManifest([row("default", undefined, 1), { htmlContent: "<p>Library</p>" }]);
    expect(manifest.courses).toHaveLength(1);
    expect(manifest.courses[0].published).toBe(true);
  });
});
