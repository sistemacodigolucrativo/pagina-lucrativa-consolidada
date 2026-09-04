import { describe, expect, it } from "vitest";
import { auditPackagedEbook, normalizeImportedEbookTitle, sanitizeEbookHtml } from "./ebookQuality";

const longHtml = `<html><body>${"conteúdo útil para leitura ".repeat(40)}</body></html>`;

describe("auditoria de qualidade dos e-books", () => {
  it("normaliza títulos importados com caracteres quebrados", () => {
    expect(normalizeImportedEbookTitle({
      sourceId: "dcd29a74b61b3dd4",
      title: "source",
      sourceFile: "10_Maneiras_De_Escrever_Anuâ• Ð‘ncios_Mais_Eficientes.pdf",
    })).toBe("10 Maneiras De Escrever Anúncios Mais Eficientes");

    expect(normalizeImportedEbookTitle({
      sourceId: "ea8406506d5192c9",
      title: "MÃ©todos para Ganhar Dinheiro na Internet",
      sourceFile: "Metodos_para_Ganhar_Dinheiro_na_Internet.rar",
    })).toBe("Métodos para Ganhar Dinheiro na Internet");
  });

  it("bloqueia arquivos auxiliares de script que não são e-books", () => {
    const quality = auditPackagedEbook({
      sourceId: "05c521555a7e5e3c",
      title: "sitenoar",
      sourceFile: "Script_Ptc.zip",
      sourcePath: "Site PTC/sitenoar.html",
      htmlFile: "05c521555a7e5e3c.html",
      htmlContent: longHtml,
    });

    expect(quality.isPublishable).toBe(false);
    expect(quality.blockers.map(issue => issue.code)).toContain("non-ebook-asset");
  });

  it("bloqueia conversões pequenas demais ou sem texto suficiente", () => {
    const quality = auditPackagedEbook({
      sourceId: "abc123",
      title: "Material Quebrado",
      sourceFile: "material.pdf",
      sourcePath: "source.pdf",
      htmlFile: "abc123.html",
      htmlContent: "<html><body>ok</body></html>",
    });

    expect(quality.isPublishable).toBe(false);
    expect(quality.blockers.map(issue => issue.code)).toContain("incomplete-html");
  });

  it("neutraliza links quebrados ou inseguros e preserva links externos válidos", () => {
    const html = `<html><body>
      <a href="file:///tmp/planilha.xls">arquivo local</a>
      <a href="./missing.html">relativo quebrado</a>
      <a href="https://example.com">externo</a>
      ${"texto de estudo ".repeat(80)}
    </body></html>`;

    const quality = auditPackagedEbook({
      sourceId: "def456",
      title: "Material com links",
      sourceFile: "material.pdf",
      sourcePath: "source.pdf",
      htmlFile: "def456.html",
      htmlContent: html,
    });
    const sanitized = sanitizeEbookHtml(html);

    expect(quality.isPublishable).toBe(true);
    expect(quality.warnings.map(issue => issue.code)).toContain("broken-link");
    expect(sanitized).not.toContain("file:///tmp/planilha.xls");
    expect(sanitized).not.toContain("./missing.html");
    expect(sanitized).toContain("https://example.com");
  });

  it("sinaliza referências legadas e datas antigas sem remover material útil", () => {
    const quality = auditPackagedEbook({
      sourceId: "google-plus",
      title: "Google + Exposto",
      sourceFile: "Google_+_Exposto.pdf",
      sourcePath: "source.pdf",
      htmlFile: "google-plus.html",
      htmlContent: `<html><body>Copyright 2017. ${"conteúdo sobre campanhas e comunidade ".repeat(80)}</body></html>`,
    });

    expect(quality.isPublishable).toBe(true);
    expect(quality.warnings.map(issue => issue.code)).toEqual(expect.arrayContaining(["legacy-reference", "old-date-reference"]));
  });
});
