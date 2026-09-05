import { describe, expect, it } from "vitest";
import { PACKAGED_EBOOK_FILE_ROUTE, getPackagedEbook, getPackagedEbooks } from "./staticEbooks";

describe("biblioteca de e-books empacotada", () => {
  it("carrega os 29 PDFs atualizados do manifesto versionado", async () => {
    const ebooks = await getPackagedEbooks();
    expect(ebooks).toHaveLength(29);
    expect(ebooks.every(ebook => ebook.status === "published")).toBe(true);
    expect(ebooks.every(ebook => ebook.contentType === "application/pdf")).toBe(true);
    expect(ebooks.every(ebook => ebook.htmlContent === "")).toBe(true);
    expect(new Set(ebooks.map(ebook => ebook.sourceId)).size).toBe(29);
  });

  it("localiza o material pelo ID estável usado pela biblioteca", async () => {
    const first = await getPackagedEbook(1);
    expect(first).not.toBeNull();
    expect(first?.title).toBe("30 Truques Para Maximizar Conversões");
    expect(first?.contentType).toBe("application/pdf");
    expect(first?.pdfUrl).toBe(`${PACKAGED_EBOOK_FILE_ROUTE}/1d8e16d1223794d3/source.pdf`);
    expect(await getPackagedEbook(0)).toBeNull();
  });

  it("usa PDF real como fonte única dos materiais empacotados", async () => {
    const ebooks = await getPackagedEbooks();

    expect(ebooks.every(ebook => ebook.pdfUrl?.startsWith(`${PACKAGED_EBOOK_FILE_ROUTE}/`))).toBe(true);
    expect(ebooks.every(ebook => ebook.pdfUrl?.endsWith(".pdf"))).toBe(true);
    expect(ebooks.every(ebook => ebook.pdfPath?.startsWith("fontes_importados/"))).toBe(true);
    expect(ebooks.every(ebook => ebook.summary.includes("PDF atualizado no layout Tech Futuristic"))).toBe(true);
  });

  it("não depende mais dos HTMLs convertidos como fallback do pacote estático", async () => {
    const ebooks = await getPackagedEbooks();

    expect(ebooks.every(ebook => ebook.htmlContent.length === 0)).toBe(true);
    expect(ebooks.some(ebook => ebook.contentType === "text/html")).toBe(false);
  });
});
