import { resolveDatabaseConfig } from "../shared/databaseConfig.mjs";
import mysql from "mysql2/promise";
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const metadataName = "codigo-lucrativo-academy";
const defaultOutput = path.resolve(process.cwd(), "content-seeds/academy-courses.exported.json");
const outputPath = process.argv.includes("--output")
  ? path.resolve(process.cwd(), process.argv[process.argv.indexOf("--output") + 1] || defaultOutput)
  : defaultOutput;

function connectionConfig() {
  return resolveDatabaseConfig().connection;
}

function readMetadata(htmlContent) {
  const tag = htmlContent?.match(new RegExp(`<meta\\s+[^>]*name=["']${metadataName}["'][^>]*>`, "i"))?.[0];
  const encoded = tag?.match(/\scontent=["']([^"']+)["']/i)?.[1];
  if (!encoded) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function buildAcademyManifest(rows) {
  const courseMap = new Map();
  for (const row of rows) {
    const metadata = readMetadata(row.htmlContent || "");
    if (!metadata || (metadata.usage !== "course" && metadata.usage !== "both") || !metadata.courseTitle) continue;
    const slug = metadata.courseSlug || metadata.courseTitle;
    const course = courseMap.get(slug) ?? {
      title: metadata.courseTitle,
      slug,
      category: metadata.courseCategory || "Academia",
      level: metadata.level || "fundamentos",
      courseOrder: Number(metadata.courseOrder) || 0,
      published: true,
      modules: new Map(),
    };
    course.published = course.published && metadata.coursePublished !== false;
    const moduleKey = `${Number(metadata.moduleOrder) || 0}:${metadata.moduleTitle || "Modulo unico"}`;
    const module = course.modules.get(moduleKey) ?? {
      title: metadata.moduleTitle || "Modulo unico",
      moduleOrder: Number(metadata.moduleOrder) || 0,
      lessons: [],
    };
    module.lessons.push({
      title: row.title,
      sourceId: row.sourceId,
      usage: metadata.usage,
      lessonOrder: Number(metadata.lessonOrder) || 0,
      status: row.status,
      summary: row.summary || "",
    });
    course.modules.set(moduleKey, module);
    courseMap.set(slug, course);
  }

  const courses = [...courseMap.values()]
    .sort((a, b) => (a.courseOrder || 999) - (b.courseOrder || 999) || a.title.localeCompare(b.title, "pt-BR"))
    .map(course => ({
      title: course.title,
      slug: course.slug,
      category: course.category,
      level: course.level,
      courseOrder: course.courseOrder,
      published: course.published,
      modules: [...course.modules.values()]
        .sort((a, b) => a.moduleOrder - b.moduleOrder || a.title.localeCompare(b.title, "pt-BR"))
        .map(module => ({
          ...module,
          lessons: module.lessons.sort((a, b) => a.lessonOrder - b.lessonOrder || a.title.localeCompare(b.title, "pt-BR")),
        })),
    }));

  const manifest = {
    version: 1,
    exportedAt: new Date().toISOString(),
    description: "Export gerado a partir do banco atual. Revise antes de promover para content-seeds/academy-courses.json.",
    courses,
  };
  return manifest;
}

async function main() {
const db = await mysql.createConnection(connectionConfig());
try {
  await db.execute("START TRANSACTION READ ONLY");
  const [rows] = await db.execute("SELECT id, sourceId, title, summary, status, htmlContent FROM ebooks ORDER BY id");
  const manifest = buildAcademyManifest(rows);
  const { courses } = manifest;
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({
    outputPath,
    totalCourses: courses.length,
    totalModules: courses.reduce((sum, course) => sum + course.modules.length, 0),
    totalLessons: courses.reduce((sum, course) => sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0), 0),
  }, null, 2));
} finally {
  try { await db.rollback(); } finally { await db.end(); }
}
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => {
    console.error("Exportação não concluída; confira configuração, permissões e caminho de saída.");
    process.exitCode = 1;
  });
}
