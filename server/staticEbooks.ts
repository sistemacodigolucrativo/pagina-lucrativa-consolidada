import { readFile } from "node:fs/promises";
import path from "node:path";

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

function displayTitle(title: string, sourceFile: string) {
  if (title && title.toLowerCase() !== "source") return title;
  return sourceFile
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadPackagedEbooks() {
  const root = importRoot();
  const manifestText = await readFile(path.join(root, "ebook-manifest.tsv"), "utf8");
  const rows: ManifestRow[] = manifestText
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map(line => {
      const [sourceId, title, sourceFile, sourcePath, htmlFile] = line.split("\t");
      if (!sourceId || !sourceFile || !sourcePath || !htmlFile) throw new Error(`Linha inválida no manifesto de e-books: ${line}`);
      return { sourceId, title, sourceFile, sourcePath, htmlFile };
    });
  const publishedAt = new Date(0);
  return Promise.all(rows.map(async (row, index) => {
    const htmlContent = await readFile(path.join(root, "html-output", row.htmlFile), "utf8");
    const title = displayTitle(row.title, row.sourceFile);
    return {
      id: index + 1,
      sourceId: row.sourceId,
      sourceFile: row.sourceFile,
      sourcePath: row.sourcePath,
      title,
      summary: `Material de estudo publicado e empacotado no projeto: ${title}.`,
      htmlContent,
      status: "published" as const,
      createdBy: null,
      publishedAt,
      createdAt: publishedAt,
      updatedAt: publishedAt,
    };
  }));
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
