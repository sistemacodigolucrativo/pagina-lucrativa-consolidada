import { resolveDatabaseConfig } from "../shared/databaseConfig.mjs";
import mysql from "mysql2/promise";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const apply = process.argv.includes("--apply");
const mode = apply ? "apply" : "dry-run";
const metadataName = "codigo-lucrativo-academy";

function loadCanonicalCategories(source) {
  return new Map([...source.matchAll(/"([0-9a-f]{16})"\s*:\s*"([^"]+)"/g)].map(match => [match[1], match[2]]));
}

function readMetadata(htmlContent) {
  const tag = htmlContent?.match(new RegExp(`<meta\\s+[^>]*name=["']${metadataName}["'][^>]*>`, "i"))?.[0];
  const encoded = tag?.match(/\scontent=["']([^"']+)["']/i)?.[1];
  if (!encoded) return { metadata: null, hasMetadata: false };
  try {
    return { metadata: JSON.parse(decodeURIComponent(encoded)), hasMetadata: true };
  } catch {
    return { metadata: null, hasMetadata: true };
  }
}

function canonicalMetadata(current, canonicalCategory) {
  const metadata = current && typeof current === "object" ? { ...current } : {};
  metadata.usage = metadata.usage === "both" ? "both" : "library";
  metadata.libraryCategory = canonicalCategory;
  return metadata;
}

function writeMetadata(htmlContent, metadata) {
  const encoded = encodeURIComponent(JSON.stringify(metadata));
  const tag = `<meta name="${metadataName}" content="${encoded}">`;
  const matcher = new RegExp(`<meta\\s+[^>]*name=["']${metadataName}["'][^>]*>`, "i");
  const html = htmlContent ?? "";
  if (matcher.test(html)) return html.replace(matcher, tag);
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, `<head$1>${tag}`);
  if (html.trim()) return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${tag}</head><body>${html}</body></html>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${tag}</head><body></body></html>`;
}

function connectionConfig() {
  return resolveDatabaseConfig().connection;
}

async function createBackup(rows) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  const backupDir = path.resolve(process.cwd(), "backups");
  await mkdir(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `ebook-category-sync-${stamp}.json`);
  await writeFile(backupPath, JSON.stringify(rows.map(row => ({
    id: row.id,
    sourceId: row.sourceId,
    title: row.title,
    htmlContent: row.htmlContent,
  })), null, 2));
  return backupPath;
}

const catalogSource = await readFile(path.resolve(process.cwd(), "shared/ebookLibraryCatalog.ts"), "utf8");
const canonicalCategories = loadCanonicalCategories(catalogSource);
const db = await mysql.createConnection(connectionConfig());

try {
  const [rows] = await db.execute("SELECT id, sourceId, title, htmlContent FROM ebooks ORDER BY id");
  const planned = [];
  let mapped = 0;
  let divergent = 0;
  let missingMetadata = 0;
  let correct = 0;
  let ignored = 0;
  const distribution = new Map();

  for (const row of rows) {
    const canonicalCategory = canonicalCategories.get(row.sourceId);
    if (!canonicalCategory) {
      ignored++;
      continue;
    }

    mapped++;
    distribution.set(canonicalCategory, (distribution.get(canonicalCategory) || 0) + 1);
    const { metadata, hasMetadata } = readMetadata(row.htmlContent || "");
    if (!metadata) missingMetadata++;
    const nextMetadata = canonicalMetadata(metadata, canonicalCategory);
    const currentCategory = typeof metadata?.libraryCategory === "string" ? metadata.libraryCategory : "";
    const currentUsage = metadata?.usage === "both" ? "both" : metadata?.usage === "library" ? "library" : "";
    const isCorrect = currentCategory === canonicalCategory && (currentUsage === "library" || currentUsage === "both");

    if (isCorrect && hasMetadata) {
      correct++;
      continue;
    }

    divergent++;
    planned.push({
      ...row,
      canonicalCategory,
      currentCategory,
      nextHtmlContent: writeMetadata(row.htmlContent || "", nextMetadata),
    });
  }

  let backupPath = null;
  if (apply && planned.length) {
    backupPath = await createBackup(planned);
    for (const row of planned) {
      await db.execute("UPDATE ebooks SET htmlContent = ? WHERE id = ?", [row.nextHtmlContent, row.id]);
    }
  }

  const result = {
    mode,
    totalAnalyzed: rows.length,
    totalCanonicalSourceIds: canonicalCategories.size,
    totalMapped: mapped,
    totalDivergent: divergent,
    totalUpdated: apply ? planned.length : 0,
    totalIgnored: ignored,
    totalMissingMetadata: missingMetadata,
    totalAlreadyCorrect: correct,
    backupPath,
    finalDistribution: Object.fromEntries([...distribution.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))),
  };
  console.log(JSON.stringify(result, null, 2));
} finally {
  await db.end();
}
