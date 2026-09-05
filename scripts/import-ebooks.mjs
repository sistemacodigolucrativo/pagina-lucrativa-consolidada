import { readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const importRoot = process.env.EBOOK_IMPORT_ROOT || path.resolve(process.cwd(), "ebook-import");
const mysqlSocket = process.env.MYSQL_SOCKET || "/run/mysqld/mysqld.sock";
const mysqlUser = process.env.MYSQL_USER || "ubuntu";
const mysqlDatabase = process.env.MYSQL_DATABASE || "pagina_lucrativa";
const manifestPath = path.join(importRoot, "ebook-manifest.tsv");
const manifest = await readFile(manifestPath, "utf8");
const rows = manifest.split(/\r?\n/).slice(1).filter(Boolean).map(line => {
  const [sourceId, title, sourceFile, sourcePath] = line.split("\t");
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
const connection = await mysql.createConnection({ socketPath: mysqlSocket, user: mysqlUser, database: mysqlDatabase });
try {
  for (const row of rows) {
    const title = displayTitle(row.title, row.sourceFile);
    const summary = `PDF atualizado no layout Tech Futuristic do Código Lucrativo: ${title}.`;
    await connection.execute(
      `INSERT INTO ebooks (sourceId, sourceFile, sourcePath, title, summary, htmlContent, status, createdBy, publishedAt)
       VALUES (?, ?, ?, ?, ?, '', 'published', 1, NOW())
       ON DUPLICATE KEY UPDATE sourceFile = VALUES(sourceFile), sourcePath = VALUES(sourcePath), title = VALUES(title), summary = VALUES(summary), htmlContent = '', status = 'published', publishedAt = COALESCE(publishedAt, NOW())`,
      [row.sourceId, row.sourceFile, row.sourcePath, title, summary],
    );
  }
  console.log(`Importados ou atualizados ${rows.length} e-books em PDF.`);
} finally {
  await connection.end();
}
