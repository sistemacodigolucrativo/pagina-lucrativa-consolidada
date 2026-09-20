import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PACKAGED_EBOOK_FILE_ROUTE, getPackagedEbook, getPackagedEbooks } from "./staticEbooks";

describe("biblioteca de e-books empacotada", () => {
  it("carrega os PDFs atualizados do manifesto versionado", async () => {
    const ebooks = await getPackagedEbooks();
    const lines = (await readFile(path.resolve(process.env.EBOOK_IMPORT_ROOT || "ebook-import", "ebook-manifest.tsv"), "utf8")).trim().split(/\r?\n/);
    const idColumn = lines.shift()!.split("\t").indexOf("id");
    expect(idColumn).toBeGreaterThanOrEqual(0);
    const expectedIds = lines.filter(Boolean).map(line => line.split("\t")[idColumn]);
    expect(expectedIds.length).toBeGreaterThan(0);
    expect(new Set(expectedIds).size).toBe(expectedIds.length);
    expect(ebooks).toHaveLength(expectedIds.length);
    expect(ebooks.map(ebook => ebook.sourceId).sort()).toEqual([...expectedIds].sort());
    expect(ebooks.every(ebook => ebook.status === "published")).toBe(true);
    expect(ebooks.every(ebook => ebook.contentType === "application/pdf")).toBe(true);
    expect(ebooks.every(ebook => ebook.htmlContent.includes("codigo-lucrativo-academy"))).toBe(true);
    expect(new Set(ebooks.map(ebook => ebook.sourceId)).size).toBe(expectedIds.length);
  });

  it("localiza o material pelo ID estável usado pela biblioteca", async () => {
    const first = await getPackagedEbook(1);
    expect(first).not.toBeNull();
    expect(first?.title).toBe("30 Truques Para Maximizar Conversões");
    expect(first?.contentType).toBe("application/pdf");
    expect(first?.pdfUrl).toBe(`${PACKAGED_EBOOK_FILE_ROUTE}/1d8e16d1223794d3/source.pdf`);
    expect(await getPackagedEbook(0)).toBeNull();
  });

  it("inclui o glossário operacional como material empacotado", async () => {
    const ebooks = await getPackagedEbooks();
    const glossary = ebooks.find(ebook => ebook.sourceId === "a7f2c9e31b6d4a80");

    expect(glossary).not.toBeUndefined();
    expect(glossary?.title).toBe("Termos essenciais para começar");
    expect(glossary?.pdfUrl).toBe(`${PACKAGED_EBOOK_FILE_ROUTE}/a7f2c9e31b6d4a80/source.pdf`);
  });

  it("usa PDF real como fonte única dos materiais empacotados", async () => {
    const ebooks = await getPackagedEbooks();

    expect(ebooks.every(ebook => ebook.pdfUrl?.startsWith(`${PACKAGED_EBOOK_FILE_ROUTE}/`))).toBe(true);
    expect(ebooks.every(ebook => ebook.pdfUrl?.endsWith(".pdf"))).toBe(true);
    expect(ebooks.every(ebook => ebook.pdfPath?.startsWith("fontes_importados/"))).toBe(true);
    expect(ebooks.every(ebook => ebook.summary.length > 10)).toBe(true);
  });

  it("não depende mais dos HTMLs convertidos como fallback do pacote estático", async () => {
    const ebooks = await getPackagedEbooks();

    expect(ebooks.every(ebook => ebook.htmlContent.includes("codigo-lucrativo-academy"))).toBe(true);
    expect(ebooks.some(ebook => ebook.contentType === "text/html")).toBe(false);
  });
});
