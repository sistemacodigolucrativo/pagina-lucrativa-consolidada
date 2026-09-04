import { readFile } from "node:fs/promises";
import path from "node:path";
import { auditPackagedEbook, buildEbookSummary, normalizeImportedEbookTitle, sanitizeEbookHtml } from "./ebookQuality";

type PackagedEbook = {
  id: number;
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary: string;
  htmlContent: string;
  status: "published";
  createdBy: null;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  qualityIssues: string[];
  qualityWarnings: string[];
};

type ManifestRow = {
  sourceId: string;
  title: string;
  sourceFile: string;
  sourcePath: string;
  htmlFile: string;
};

let packagedEbooksPromise: Promise<PackagedEbook[]> | null = null;

function importRoot() {
  return process.env.EBOOK_IMPORT_ROOT || path.resolve(process.cwd(), "ebook-import");
}

function parseManifestRows(manifestText: string) {
  return manifestText
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map<ManifestRow>(line => {
      const [sourceId, title, sourceFile, sourcePath, htmlFile] = line.split("\t");
      if (!sourceId || !sourceFile || !sourcePath || !htmlFile) throw new Error(`Linha inválida no manifesto de e-books: ${line}`);
      return { sourceId, title, sourceFile, sourcePath, htmlFile };
    });
}

async function loadPackagedEbooks() {
  const root = importRoot();
  const manifestText = await readFile(path.join(root, "ebook-manifest.tsv"), "utf8");
  const rows = parseManifestRows(manifestText);
  const publishedAt = new Date(0);
  const packagedEbooks = await Promise.all(rows.map(async (row, index) => {
    const rawHtmlContent = await readFile(path.join(root, "html-output", row.htmlFile), "utf8");
    const title = normalizeImportedEbookTitle(row);
    const quality = auditPackagedEbook({ ...row, title, htmlContent: rawHtmlContent });

    if (!quality.isPublishable) return null;

    return {
      id: index + 1,
      sourceId: row.sourceId,
      sourceFile: row.sourceFile,
      sourcePath: row.sourcePath,
      title,
      summary: buildEbookSummary(title, quality),
      htmlContent: sanitizeEbookHtml(rawHtmlContent),
      status: "published" as const,
      createdBy: null,
      publishedAt,
      createdAt: publishedAt,
      updatedAt: publishedAt,
      qualityIssues: quality.issues.map(issue => issue.code),
      qualityWarnings: quality.warnings.map(issue => issue.code),
    } satisfies PackagedEbook;
  }));

  return packagedEbooks.filter((ebook): ebook is PackagedEbook => ebook !== null);
}

export async function getPackagedEbooks() {
  if (!packagedEbooksPromise) {
    packagedEbooksPromise = loadPackagedEbooks().catch(error => {
      packagedEbooksPromise = null;
      throw error;
    });
  }
  return packagedEbooksPromise;
}

export async function getPackagedEbook(ebookId: number) {
  const ebooks = await getPackagedEbooks();
  return ebooks.find(ebook => ebook.id === ebookId) ?? null;
}
