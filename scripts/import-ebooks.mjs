import { readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const importRoot = process.env.EBOOK_IMPORT_ROOT || path.resolve(process.cwd(), "ebook-import");
const pdfRoot = path.resolve(importRoot, "fontes_importados");
const mysqlSocket = process.env.MYSQL_SOCKET || "/run/mysqld/mysqld.sock";
const mysqlUser = process.env.MYSQL_USER || "ubuntu";
const mysqlDatabase = process.env.MYSQL_DATABASE || "pagina_lucrativa";
const manifestPath = path.join(importRoot, "ebook-manifest.tsv");
const manifest = await readFile(manifestPath, "utf8");
const [headerLine, ...manifestLines] = manifest.split(/\r?\n/);
const header = headerLine.split("\t");
const headerIndex = new Map(header.map((name, index) => [name, index]));
const valueAt = (columns, name, fallbackIndex) => columns[headerIndex.get(name) ?? fallbackIndex] ?? "";
const rows = manifestLines.filter(Boolean).map(line => {
  const columns = line.split("\t");
  const sourceId = valueAt(columns, "id", 0);
  const title = valueAt(columns, "title", 1);
  const sourceFile = valueAt(columns, "source_file", 2);
  const sourcePath = valueAt(columns, "source_path", 3);
  if (!sourceId || !sourceFile || !sourcePath) throw new Error(`Linha inválida no manifesto de e-books: ${line}`);
  return {
    sourceId,
    title,
    sourceFile,
    sourcePath,
    usage: valueAt(columns, "usage", 5),
    libraryCategory: valueAt(columns, "libraryCategory", 6),
    courseTitle: valueAt(columns, "courseTitle", 7),
    courseSlug: valueAt(columns, "courseSlug", 8),
    courseCategory: valueAt(columns, "courseCategory", 9),
    courseOrder: valueAt(columns, "courseOrder", 10),
    moduleTitle: valueAt(columns, "moduleTitle", 11),
    moduleOrder: valueAt(columns, "moduleOrder", 12),
    lessonOrder: valueAt(columns, "lessonOrder", 13),
    level: valueAt(columns, "level", 14),
    summary: valueAt(columns, "summary", 15),
  };
});

const ACADEMY_METADATA_NAME = "codigo-lucrativo-academy";

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function numericValue(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : undefined;
}

function academyMetadata(row) {
  const usage = row.usage === "course" || row.usage === "both" ? row.usage : "library";
  const metadata = {
    usage,
    libraryCategory: row.libraryCategory || undefined,
  };
  if (usage !== "library") {
    metadata.courseTitle = row.courseTitle || undefined;
    metadata.courseSlug = row.courseSlug || (row.courseTitle ? slugify(row.courseTitle) : undefined);
    metadata.courseCategory = row.courseCategory || undefined;
    metadata.courseOrder = numericValue(row.courseOrder);
    metadata.moduleTitle = row.moduleTitle || undefined;
    metadata.moduleOrder = numericValue(row.moduleOrder);
    metadata.lessonOrder = numericValue(row.lessonOrder) ?? 0;
    metadata.level = row.level === "pratica" || row.level === "avancado" ? row.level : "fundamentos";
  }
  return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined && value !== ""));
}

function fallbackHtml(title, row) {
  const safeTitle = title.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
  const encodedMetadata = encodeURIComponent(JSON.stringify(academyMetadata(row)));
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="${ACADEMY_METADATA_NAME}" content="${encodedMetadata}"><title>${safeTitle}</title></head><body><main><h1>${safeTitle}</h1></main></body></html>`;
}

function displayTitle(title, sourceFile) {
  if (title && title.toLowerCase() !== "source") return title;
  return sourceFile
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sourcePathSegments(value) {
  return value.split(/[\\/]+/).map(segment => segment.trim()).filter(Boolean);
}

async function assertRealPackagedPdf(row) {
  if (!row.sourcePath.toLowerCase().endsWith(".pdf")) throw new Error(`Fonte não é PDF para ${row.sourceId}: ${row.sourcePath}`);
  const resolvedPath = path.resolve(pdfRoot, row.sourceId, ...sourcePathSegments(row.sourcePath));
  const relativePath = path.relative(pdfRoot, resolvedPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) throw new Error(`Caminho de PDF inválido para ${row.sourceId}.`);

  const pdf = await readFile(resolvedPath);
  if (pdf.length < 5 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error(`Arquivo empacotado inválido ou não-PDF para ${row.sourceId}: ${resolvedPath}`);
  }
}

await Promise.all(rows.map(assertRealPackagedPdf));

const connection = await mysql.createConnection({ socketPath: mysqlSocket, user: mysqlUser, database: mysqlDatabase });
try {
  for (const row of rows) {
    const title = displayTitle(row.title, row.sourceFile);
    const summary = row.summary?.trim() || `PDF atualizado no layout Tech Futuristic do Código Lucrativo: ${title}.`;
    await connection.execute(
      `INSERT INTO ebooks (sourceId, sourceFile, sourcePath, title, summary, htmlContent, status, createdBy, publishedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'published', 1, NOW())
       ON DUPLICATE KEY UPDATE sourceFile = VALUES(sourceFile), sourcePath = VALUES(sourcePath), summary = COALESCE(NULLIF(summary, ''), VALUES(summary)), htmlContent = COALESCE(NULLIF(htmlContent, ''), VALUES(htmlContent)), publishedAt = COALESCE(publishedAt, NOW())`,
      [row.sourceId, row.sourceFile, row.sourcePath, title, summary, fallbackHtml(title, row)],
    );
  }
  console.log(`Sincronizados ${rows.length} e-books em PDF sem sobrescrever a curadoria administrativa existente.`);
} finally {
  await connection.end();
}
