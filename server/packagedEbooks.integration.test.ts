import { describe, expect, it } from "vitest";
import { GOOD_STUDIO_EBOOK_SOURCE_IDS } from "./ebookStudioLayout";
import { getPackagedEbook, getPackagedEbooks } from "./staticEbooks";

describe("biblioteca de e-books empacotada", () => {
  it("carrega os 52 materiais publicados do manifesto versionado", async () => {
    const ebooks = await getPackagedEbooks();
    expect(ebooks).toHaveLength(52);
    expect(ebooks.every(ebook => ebook.status === "published")).toBe(true);
    expect(ebooks.every(ebook => ebook.htmlContent.length > 100)).toBe(true);
    expect(new Set(ebooks.map(ebook => ebook.sourceId)).size).toBe(52);
  });

  it("localiza o material pelo ID estável usado pela biblioteca", async () => {
    const first = await getPackagedEbook(1);
    expect(first).not.toBeNull();
    expect(first?.title).toBe("10 Maneiras De Escrever Anúncios Mais Eficientes");
    expect(first?.htmlContent.toLowerCase()).toContain("<html");
    expect(await getPackagedEbook(0)).toBeNull();
  });

  it("reescreve somente os e-books aproveitáveis no layout Tech Futuristic", async () => {
    const ebooks = await getPackagedEbooks();
    const rewritten = ebooks.filter(ebook => ebook.htmlContent.includes("codigo-lucrativo-tech-shell"));

    expect(rewritten).toHaveLength(GOOD_STUDIO_EBOOK_SOURCE_IDS.size);
    expect(rewritten).toHaveLength(36);
    expect(rewritten.every(ebook => GOOD_STUDIO_EBOOK_SOURCE_IDS.has(ebook.sourceId))).toBe(true);
    expect(rewritten[0]?.summary).toContain("Tech Futuristic");
  });
});
