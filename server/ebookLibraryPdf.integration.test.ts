import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PACKAGED_EBOOK_LIBRARY_CATEGORIES } from "../shared/ebookLibraryCatalog";

const root = process.env.PROJECT_ROOT || process.cwd();

type ManifestRow = { sourceId: string; title: string; sourceFile: string; sourcePath: string; libraryCategory: string };

async function readManifestRows() {
  const manifest = await readFile(path.join(root, "ebook-import/ebook-manifest.tsv"), "utf8");
  return manifest
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map<ManifestRow>(line => {
      const [sourceId, title, sourceFile, sourcePath, , , libraryCategory] = line.split("\t");
      return { sourceId, title, sourceFile, sourcePath, libraryCategory };
    });
}

describe("Acervo de materiais de estudo em PDF", () => {
  it("mantém os e-books empacotados como PDFs reais e categorizados", async () => {
    const rows = await readManifestRows();
    expect(rows).toHaveLength(87);
    expect(Object.keys(PACKAGED_EBOOK_LIBRARY_CATEGORIES)).toHaveLength(87);

    const categories = new Set(rows.map(row => row.libraryCategory));
    expect(categories).toEqual(new Set([
      "Negócio digital",
      "Marca e posicionamento",
      "Produto digital",
      "Conteúdo e criativos",
      "SEO e descoberta",
      "Captação e funis",
      "E-mail e relacionamento",
      "Tráfego e divulgação",
      "Vendas e conversão",
      "Marketing de rede",
      "Ferramentas e modelos",
      "Desenvolvimento pessoal e financeiro",
    ]));

    for (const row of rows) {
      expect(row.sourcePath.toLowerCase().endsWith(".pdf")).toBe(true);
      expect(PACKAGED_EBOOK_LIBRARY_CATEGORIES[row.sourceId as keyof typeof PACKAGED_EBOOK_LIBRARY_CATEGORIES]).toBe(row.libraryCategory);
      const pdf = await readFile(path.join(root, "ebook-import/fontes_importados", row.sourceId, row.sourcePath));
      expect(pdf.subarray(0, 5).toString("ascii"), row.title).toBe("%PDF-");
    }
  });

  it("sincroniza o catálogo pelo backend sem exigir credenciais de banco no script de deploy", async () => {
    const rows = await readManifestRows();
    const importer = await readFile(path.join(root, "scripts/import-ebooks.mjs"), "utf8");
    const deploy = await readFile(path.join(root, "scripts/deploy-vps.sh"), "utf8");
    const canonical = await readFile(path.join(root, "server/academyCanonical.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const syncScript = await readFile(path.join(root, "scripts/sync-ebook-library-categories.mjs"), "utf8");
    const packagedSync = await readFile(path.join(root, "scripts/sync-packaged-content.mjs"), "utf8");
    const academyManifest = await readFile(path.join(root, "content-seeds/academy-courses.json"), "utf8");
    const contentBootstrapDocs = await readFile(path.join(root, "docs/CONTENT_BOOTSTRAP.md"), "utf8");

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
    expect(canonical).toContain("if (!libraryCategory) return ebook;");
    expect(canonical).toContain('usage: ebook.academy?.usage ?? "library"');

    expect(db).toContain('import { getPackagedEbookLibraryCategory } from "../shared/ebookLibraryCatalog"');
    expect(db).toContain("function withCanonicalPackagedLibraryCategory");
    expect(db).toContain('usage: metadata.usage === "both" ? "both" as const : "library" as const');
    expect(db).toContain("libraryCategory: canonicalCategory");
    expect(db).toContain("withCanonicalPackagedLibraryCategory(withEbookAcademyMetadata");
    expect(db).toContain("export async function getAdminEbooks()");
    expect(db).toContain("export async function getAdminEbook(ebookId: number)");

    expect(syncScript).toContain('const apply = process.argv.includes("--apply")');
    expect(syncScript).toContain('const mode = apply ? "apply" : "dry-run"');
    expect(syncScript).toContain("metadata.usage = metadata.usage === \"both\" ? \"both\" : \"library\"");
    expect(syncScript).toContain("metadata.libraryCategory = canonicalCategory");
    expect(syncScript).toContain("UPDATE ebooks SET htmlContent = ? WHERE id = ?");
    expect(syncScript).toContain("ebook-category-sync-");

    expect(packagedSync).toContain('const mode = apply ? "apply" : "dry-run"');
    expect(packagedSync).toContain("ebook-manifest.tsv");
    expect(packagedSync).toContain("shared/ebookLibraryCatalog.ts");
    expect(packagedSync).toContain("content-seeds/academy-courses.json");
    expect(packagedSync).toContain("ON DUPLICATE KEY UPDATE sourceId = VALUES(sourceId)");
    expect(packagedSync).toContain("packaged-content-sync-");
    expect(packagedSync).toContain("totalSourceIdsSynced");
    expect(packagedSync).toContain("totalVersionedModules");
    expect(packagedSync).toContain("totalVersionedLessons");
    expect(packagedSync).toContain("totalVersionedAcademyMaterials");
    expect(packagedSync).toContain("status = 'published'");

    const academy = JSON.parse(academyManifest) as {
      courses: Array<{
        slug: string;
        modules: Array<{ lessons: Array<{ sourceId: string; usage: string }> }>;
      }>;
    };
    const academyLessons = academy.courses.flatMap(course => course.modules.flatMap(module => module.lessons));
    expect(academy.courses).toHaveLength(11);
    expect(academy.courses.map(course => course.slug)).toEqual([
      "preparacao-mentalidade-execucao",
      "negocio-digital-pronto-para-operar",
      "marca-e-posicionamento",
      "produto-digital-oferta-inicial",
      "conteudo-criativos-autoridade",
      "captacao-e-funis",
      "email-e-relacionamento",
      "vendas-e-conversao",
      "seo-descoberta-organica",
      "trafego-e-divulgacao",
      "marketing-de-rede-e-escala",
    ]);
    expect(academy.courses.reduce((sum, course) => sum + course.modules.length, 0)).toBe(16);
    expect(academyLessons).toHaveLength(29);
    expect(new Set(academyLessons.map(lesson => lesson.sourceId)).size).toBe(29);
    expect(academyLessons.every(lesson => rows.some(row => row.sourceId === lesson.sourceId))).toBe(true);
    expect(academyLessons.every(lesson => lesson.usage === "both")).toBe(true);
    expect(contentBootstrapDocs).toContain("node scripts/sync-packaged-content.mjs --dry-run");
    expect(contentBootstrapDocs).toContain("node scripts/sync-packaged-content.mjs --apply");
  });
});
