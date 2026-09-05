import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const PACKAGED_EBOOK_FILE_ROUTE = "/ebook-files";

type PackagedEbook = {
  id: number;
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary: string;
  htmlContent: string;
  contentType: "application/pdf";
  pdfPath: string;
  pdfUrl: string;
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
  htmlFile?: string;
};

type SourceManifestRow = {
  relativePath: string;
  bytes: number;
  extension: string;
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

function basenameFromImportPath(value: string) {
  const segments = sourcePathSegments(value);
  return segments[segments.length - 1] ?? value;
}

function toPosixPath(value: string) {
  return value.split(path.sep).join("/");
}

function normalizeLookupKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\\x[0-9a-f]{2}/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isGenericSourcePdf(value: string) {
  return normalizeLookupKey(value) === "source pdf";
}

function isPdfSource(sourcePath: string) {
  return sourcePath.toLowerCase().endsWith(".pdf");
}

function publicPdfUrlFromRelativePath(relativePath: string) {
  const encodedSegments = sourcePathSegments(relativePath).map(segment => encodeURIComponent(segment));
  return `${PACKAGED_EBOOK_FILE_ROUTE}/${encodedSegments.join("/")}`;
}

async function readSourceManifest(root: string) {
  const manifestPath = path.join(root, "fontes-importados-manifest.tsv");
  const manifestText = await readFile(manifestPath, "utf8").catch(() => "");
  if (!manifestText) return [] as SourceManifestRow[];

  return manifestText
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map(line => {
      const [relativePath, bytes, extension] = line.split("\t");
      return {
        relativePath,
        bytes: Number(bytes) || 0,
        extension: (extension ?? "").toLowerCase(),
      };
    })
    .filter(row => row.relativePath && row.extension === "pdf" && row.bytes > 0);
}

function buildPdfLookup(sourceRows: SourceManifestRow[]) {
  const byFilename = new Map<string, SourceManifestRow[]>();

  for (const row of sourceRows) {
    const filename = basenameFromImportPath(row.relativePath);
    const key = normalizeLookupKey(filename);
    if (!key || isGenericSourcePdf(filename)) continue;

    const current = byFilename.get(key) ?? [];
    current.push(row);
    byFilename.set(key, current);
  }

  return byFilename;
}

async function resolveRelativePdfSource(root: string, relativePath: string) {
  const pdfRoot = path.resolve(root, "fontes_importados");
  const resolvedPath = path.resolve(pdfRoot, ...sourcePathSegments(relativePath));
  const relativeToPdfRoot = path.relative(pdfRoot, resolvedPath);
  if (relativeToPdfRoot.startsWith("..") || path.isAbsolute(relativeToPdfRoot)) return null;

  const pdfStat = await stat(resolvedPath).catch(() => null);
  if (!pdfStat?.isFile() || pdfStat.size <= 0) return null;

  const normalizedRelativePath = toPosixPath(relativeToPdfRoot);
  return {
    pdfPath: `fontes_importados/${normalizedRelativePath}`,
    pdfUrl: publicPdfUrlFromRelativePath(normalizedRelativePath),
  };
}

function findPdfByKnownFilename(row: ManifestRow, pdfLookup: Map<string, SourceManifestRow[]>) {
  const candidateNames = [
    basenameFromImportPath(row.sourcePath),
    basenameFromImportPath(row.sourceFile),
    `${displayTitle(row.title, row.sourceFile)}.pdf`,
  ];

  for (const candidateName of candidateNames) {
    if (!candidateName || isGenericSourcePdf(candidateName)) continue;

    const matches = pdfLookup.get(normalizeLookupKey(candidateName)) ?? [];
    if (matches.length === 1) return matches[0];
  }

  return null;
}

async function resolvePdfSource(root: string, row: ManifestRow, pdfLookup: Map<string, SourceManifestRow[]>) {
  if (!isPdfSource(row.sourcePath)) return null;

  const sameIdSource = await resolveRelativePdfSource(root, `${row.sourceId}/${sourcePathSegments(row.sourcePath).join("/")}`);
  if (sameIdSource) return sameIdSource;

  const matchedSource = findPdfByKnownFilename(row, pdfLookup);
  if (!matchedSource) return null;

  return resolveRelativePdfSource(root, matchedSource.relativePath);
}

async function loadPackagedEbooks() {
  const root = importRoot();
  const manifestText = await readFile(path.join(root, "ebook-manifest.tsv"), "utf8");
  const sourceRows = await readSourceManifest(root);
  const pdfLookup = buildPdfLookup(sourceRows);
  const rows: ManifestRow[] = manifestText
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map(line => {
      const [sourceId, title, sourceFile, sourcePath, htmlFile] = line.split("\t");
      if (!sourceId || !sourceFile || !sourcePath) throw new Error(`Linha inválida no manifesto de e-books: ${line}`);
      return { sourceId, title, sourceFile, sourcePath, htmlFile };
    });
  const publishedAt = new Date(0);
  return Promise.all(rows.map(async (row, index) => {
    const title = displayTitle(row.title, row.sourceFile);
    const pdfSource = await resolvePdfSource(root, row, pdfLookup);
    if (!pdfSource) throw new Error(`PDF empacotado não encontrado para o e-book: ${title}`);

    return {
      id: index + 1,
      sourceId: row.sourceId,
      sourceFile: row.sourceFile,
      sourcePath: row.sourcePath,
      title,
      summary: `PDF atualizado no layout Tech Futuristic do Código Lucrativo: ${title}.`,
      htmlContent: "",
      contentType: "application/pdf" as const,
      pdfPath: pdfSource.pdfPath,
      pdfUrl: pdfSource.pdfUrl,
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
