import { describe, expect, it } from "vitest";
import { GOOD_STUDIO_EBOOK_SOURCE_IDS, STUDIO_READER_MARKER } from "./ebookStudioLayout";
import { PACKAGED_EBOOK_FILE_ROUTE, getPackagedEbook, getPackagedEbooks } from "./staticEbooks";

describe("biblioteca de e-books empacotada", () => {
  it("carrega os 52 materiais publicados do manifesto versionado", async () => {
    const ebooks = await getPackagedEbooks();
    expect(ebooks).toHaveLength(52);
    expect(ebooks.every(ebook => ebook.status === "published")).toBe(true);
    expect(ebooks.every(ebook => ebook.htmlContent.length > 100)).toBe(true);
    expect(ebooks.every(ebook => ebook.contentType === "application/pdf" || ebook.contentType === "text/html")).toBe(true);
    expect(new Set(ebooks.map(ebook => ebook.sourceId)).size).toBe(52);
  });

  it("localiza o material pelo ID estável usado pela biblioteca", async () => {
    const first = await getPackagedEbook(1);
    expect(first).not.toBeNull();
    expect(first?.title).toBe("10 Maneiras De Escrever Anúncios Mais Eficientes");
    expect(first?.htmlContent.toLowerCase()).toContain("<html");
    expect(await getPackagedEbook(0)).toBeNull();
  });

  it("prioriza PDFs reais quando há correspondência identificável no manifesto de fontes", async () => {
    const ebooks = await getPackagedEbooks();
    const pdfBacked = ebooks.filter(ebook => ebook.contentType === "application/pdf");
    const htmlBacked = ebooks.filter(ebook => ebook.contentType === "text/html");
    const segredo = ebooks.find(ebook => ebook.sourcePath === "osegredo.pdf");

    expect(pdfBacked.length).toBeGreaterThanOrEqual(4);
    expect(htmlBacked.length).toBeGreaterThan(0);
    expect(segredo?.contentType).toBe("application/pdf");
    expect(segredo?.pdfUrl).toMatch(new RegExp(`^${PACKAGED_EBOOK_FILE_ROUTE}/[a-z0-9]+/osegredo\\.pdf$`));
    expect(pdfBacked.every(ebook => ebook.pdfUrl?.startsWith(`${PACKAGED_EBOOK_FILE_ROUTE}/`))).toBe(true);
    expect(pdfBacked.every(ebook => ebook.pdfUrl?.endsWith(".pdf"))).toBe(true);
    expect(pdfBacked.every(ebook => ebook.pdfPath?.startsWith("fontes_importados/"))).toBe(true);
    expect(htmlBacked.every(ebook => ebook.pdfUrl === null && ebook.pdfPath === null)).toBe(true);
  });

  it("reescreve somente os e-books aproveitáveis no layout Tech Futuristic como HTML de fallback", async () => {
    const ebooks = await getPackagedEbooks();
    const rewritten = ebooks.filter(ebook => ebook.htmlContent.includes(STUDIO_READER_MARKER));

    expect(rewritten).toHaveLength(GOOD_STUDIO_EBOOK_SOURCE_IDS.size);
    expect(rewritten).toHaveLength(36);
    expect(rewritten.every(ebook => GOOD_STUDIO_EBOOK_SOURCE_IDS.has(ebook.sourceId))).toBe(true);
    expect(rewritten[0]?.htmlContent).toContain("TECH FUTURISTIC");
    expect(rewritten[0]?.htmlContent).toContain("INDEX_MANIFEST");
    expect(rewritten[0]?.htmlContent).toContain("CHAPTER_01 // PART_I");
    expect(rewritten[0]?.htmlContent).toContain("CHAPTER_02 // PART_II");
    expect(rewritten[0]?.htmlContent).toContain("CHAPTER_03 // PART_III");
    expect(rewritten[0]?.htmlContent).toContain("cl-original-viewport");
    expect(rewritten[0]?.htmlContent).toContain("cta-final");
  });
});
