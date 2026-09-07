import { describe, expect, it } from "vitest";
import {
  extractAcademyMetadataFromHtml,
  injectAcademyMetadataIntoHtml,
  isAcademyMaterialVisibleToMember,
  normalizeAcademyMetadata,
  slugifyAcademyCourseTitle,
} from "./academy";

describe("shared/academy", () => {
  it("normaliza slug, metadata e status canônicos", () => {
    expect(slugifyAcademyCourseTitle("Código Lucrativo: Aula 01")).toBe("codigo-lucrativo-aula-01");
    expect(normalizeAcademyMetadata({ courseTitle: "Funil de Vendas", lessonOrder: 2 })).toMatchObject({
      usage: "course",
      courseTitle: "Funil de Vendas",
      courseSlug: "funil-de-vendas",
      category: "Academia",
      level: "fundamentos",
      lessonOrder: 2,
    });
  });

  it("salva e recupera metadata de Academia no HTML fallback", () => {
    const html = injectAcademyMetadataIntoHtml("<main>PDF</main>", {
      courseTitle: "Oferta Validada",
      category: "Vendas",
      level: "pratica",
      lessonOrder: 3,
    });
    expect(html).toContain('name="codigo-lucrativo-academy"');
    expect(extractAcademyMetadataFromHtml(html)).toMatchObject({
      courseTitle: "Oferta Validada",
      courseSlug: "oferta-validada",
      category: "Vendas",
      level: "pratica",
      lessonOrder: 3,
    });
  });

  it("mostra ao membro somente material publicado com curso definido", () => {
    const metadata = normalizeAcademyMetadata({ courseTitle: "Tráfego", courseSlug: "trafego" });
    expect(isAcademyMaterialVisibleToMember({ status: "published", metadata })).toBe(true);
    expect(isAcademyMaterialVisibleToMember({ status: "draft", metadata })).toBe(false);
    expect(isAcademyMaterialVisibleToMember({ status: "archived", metadata })).toBe(false);
    expect(isAcademyMaterialVisibleToMember({ status: "published", metadata: normalizeAcademyMetadata(null) })).toBe(false);
  });
});
