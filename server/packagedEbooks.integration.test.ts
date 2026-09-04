import { describe, expect, it } from "vitest";
import { getPackagedEbook, getPackagedEbooks } from "./staticEbooks";

describe("biblioteca de e-books empacotada", () => {
  it("carrega somente materiais publicáveis do manifesto versionado", async () => {
    const ebooks = await getPackagedEbooks();

    expect(ebooks.length).toBeGreaterThan(35);
    expect(ebooks.length).toBeLessThan(52);
    expect(ebooks.every(ebook => ebook.status === "published")).toBe(true);
    expect(ebooks.every(ebook => ebook.htmlContent.length >= 5000)).toBe(true);
    expect(new Set(ebooks.map(ebook => ebook.sourceId)).size).toBe(ebooks.length);
    expect(ebooks.some(ebook => ebook.sourceFile === "Script_Ptc.zip")).toBe(false);
    expect(ebooks.some(ebook => /[âÐ•]/.test(ebook.title))).toBe(false);
  });

  it("localiza o material pelo ID estável usado pela biblioteca", async () => {
    const first = await getPackagedEbook(1);
    expect(first).not.toBeNull();
    expect(first?.title).toBe("10 Maneiras De Escrever Anúncios Mais Eficientes");
    expect(first?.htmlContent.toLowerCase()).toContain("<html");
    expect(await getPackagedEbook(0)).toBeNull();
  });

  it("não publica IDs que correspondem a arquivos auxiliares ou incompletos", async () => {
    expect(await getPackagedEbook(25)).toBeNull();
  });

  it("mantém aviso de revisão automática em materiais com links problemáticos ou referências antigas", async () => {
    const ebooks = await getPackagedEbooks();
    const reviewed = ebooks.filter(ebook => ebook.qualityWarnings.length > 0);

    expect(reviewed.length).toBeGreaterThan(0);
    expect(reviewed.some(ebook => ebook.summary.includes("Revisão automática"))).toBe(true);
  });
});
