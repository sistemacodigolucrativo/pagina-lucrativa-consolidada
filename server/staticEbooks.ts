import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getStudioEbookTitle, isGoodStudioEbook, rewriteEbookInStudioLayout } from "./ebookStudioLayout";

export const PACKAGED_EBOOK_FILE_ROUTE = "/ebook-files";

type EbookContentType = "application/pdf" | "text/html";

type PackagedEbook = {
  id: number;
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary: string;
  htmlContent: string;
  contentType: EbookContentType;
  pdfPath: string | null;
  pdfUrl: string | null;
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

function sourcePathSegments(sourcePath: string) {
  return sourcePath.split(/[\\/]+/).map(segment => segment.trim()).filter(Boolean);
}

function toPosixPath(value: string) {
  return value.split(path.sep).join("/");
}

function isPdfSource(sourcePath: string) {
  return sourcePath.toLowerCase().endsWith(".pdf");
}

function publicPdfUrl(sourceId: string, sourcePath: string) {
  const encodedSegments = [sourceId, ...sourcePathSegments(sourcePath)].map(segment => encodeURIComponent(segment));
  return `${PACKAGED_EBOOK_FILE_ROUTE}/${encodedSegments.join("/")}`;
}

async function resolvePdfSource(root: string, row: ManifestRow) {
  if (!isPdfSource(row.sourcePath)) return null;

  const pdfRoot = path.resolve(root, "fontes_importados");
  const resolvedPath = path.resolve(pdfRoot, row.sourceId, ...sourcePathSegments(row.sourcePath));
  const relativeToPdfRoot = path.relative(pdfRoot, resolvedPath);
  if (relativeToPdfRoot.startsWith("..") || path.isAbsolute(relativeToPdfRoot)) return null;

  const pdfStat = await stat(resolvedPath).catch(() => null);
  if (!pdfStat?.isFile() || pdfStat.size <= 0) return null;

  return {
    pdfPath: toPosixPath(path.relative(root, resolvedPath)),
    pdfUrl: publicPdfUrl(row.sourceId, row.sourcePath),
  };
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
    const originalHtmlContent = await readFile(path.join(root, "html-output", row.htmlFile), "utf8");
    const title = getStudioEbookTitle(row.sourceId, displayTitle(row.title, row.sourceFile));
    const hasStudioLayout = isGoodStudioEbook(row.sourceId);
    const pdfSource = await resolvePdfSource(root, row);
    const htmlContent = rewriteEbookInStudioLayout({
      sourceId: row.sourceId,
      sourceFile: row.sourceFile,
      sourcePath: row.sourcePath,
      title,
      htmlContent: originalHtmlContent,
    });
    return {
      id: index + 1,
      sourceId: row.sourceId,
      sourceFile: row.sourceFile,
      sourcePath: row.sourcePath,
      title,
      summary: pdfSource
        ? `PDF original disponível para leitura no painel: ${title}.`
        : hasStudioLayout
          ? `Material de estudo reformulado no layout Tech Futuristic do Código Lucrativo: ${title}.`
          : `Material de estudo publicado e empacotado no projeto: ${title}.`,
      htmlContent,
      contentType: pdfSource ? "application/pdf" as const : "text/html" as const,
      pdfPath: pdfSource?.pdfPath ?? null,
      pdfUrl: pdfSource?.pdfUrl ?? null,
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
