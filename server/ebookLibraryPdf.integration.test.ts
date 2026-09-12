import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PACKAGED_EBOOK_LIBRARY_CATEGORIES } from "../shared/ebookLibraryCatalog";

const root = process.env.PROJECT_ROOT || process.cwd();

type ManifestRow = { sourceId: string; title: string; sourceFile: string; sourcePath: string };

async function readManifestRows() {
  const manifest = await readFile(path.join(root, "ebook-import/ebook-manifest.tsv"), "utf8");
  return manifest
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map<ManifestRow>(line => {
      const [sourceId, title, sourceFile, sourcePath] = line.split("\t");
      return { sourceId, title, sourceFile, sourcePath };
    });
}

describe("Acervo de materiais de estudo em PDF", () => {
  it("mantém os e-books empacotados como PDFs reais e categorizados", async () => {
    const rows = await readManifestRows();
    expect(rows).toHaveLength(87);
    expect(Object.keys(PACKAGED_EBOOK_LIBRARY_CATEGORIES)).toHaveLength(29);

    for (const row of rows) {
      expect(row.sourcePath.toLowerCase().endsWith(".pdf")).toBe(true);
      const pdf = await readFile(path.join(root, "ebook-import/fontes_importados", row.sourceId, row.sourcePath));
      expect(pdf.subarray(0, 5).toString("ascii"), row.title).toBe("%PDF-");
    }
  });

  it("sincroniza o catálogo pelo backend sem exigir credenciais de banco no script de deploy", async () => {
    const importer = await readFile(path.join(root, "scripts/import-ebooks.mjs"), "utf8");
    const deploy = await readFile(path.join(root, "scripts/deploy-vps.sh"), "utf8");
    const canonical = await readFile(path.join(root, "server/academyCanonical.ts"), "utf8");

    expect(importer).toContain('pdf.subarray(0, 5).toString("ascii") !== "%PDF-"');
    expect(importer).toContain('path.resolve(importRoot, "fontes_importados")');
    expect(importer).toContain("ON DUPLICATE KEY UPDATE sourceFile = VALUES(sourceFile), sourcePath = VALUES(sourcePath)");
    const duplicateUpdate = importer.split("ON DUPLICATE KEY UPDATE")[1] ?? "";
    expect(duplicateUpdate).toContain("htmlContent = COALESCE(NULLIF(htmlContent, ''), VALUES(htmlContent))");
    expect(duplicateUpdate).not.toContain("status =");

    expect(deploy).not.toContain("node scripts/import-ebooks.mjs");
    expect(canonical).toContain('import { getPackagedEbooks } from "./staticEbooks"');
    expect(canonical).toContain("ensurePackagedLibraryEbooks");
    expect(canonical).toContain("await db.insert(ebooks).values");
    expect(canonical).toContain("onDuplicateKeyUpdate({ set: { sourceId: ebook.sourceId } })");
    expect(canonical).toContain("await ensurePackagedLibraryEbooks()");
    expect(canonical).toContain("getPackagedEbookLibraryCategory");
    expect(canonical).toContain("ebook.academy?.libraryCategory?.trim()");
    expect(canonical).toContain('usage: ebook.academy?.usage ?? "library"');
  });
});
