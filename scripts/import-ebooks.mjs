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
const rows = manifest.split(/\r?\n/).slice(1).filter(Boolean).map(line => {
  const [sourceId, title, sourceFile, sourcePath] = line.split("\t");
  if (!sourceId || !sourceFile || !sourcePath) throw new Error(`Linha inválida no manifesto de e-books: ${line}`);
  return { sourceId, title, sourceFile, sourcePath };
});

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
    const summary = `PDF atualizado no layout Tech Futuristic do Código Lucrativo: ${title}.`;
    await connection.execute(
      `INSERT INTO ebooks (sourceId, sourceFile, sourcePath, title, summary, htmlContent, status, createdBy, publishedAt)
       VALUES (?, ?, ?, ?, ?, '', 'published', 1, NOW())
       ON DUPLICATE KEY UPDATE sourceFile = VALUES(sourceFile), sourcePath = VALUES(sourcePath), publishedAt = COALESCE(publishedAt, NOW())`,
      [row.sourceId, row.sourceFile, row.sourcePath, title, summary],
    );
  }
  console.log(`Sincronizados ${rows.length} e-books em PDF sem sobrescrever a curadoria administrativa existente.`);
} finally {
  await connection.end();
}
