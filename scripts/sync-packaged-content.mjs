import { resolveDatabaseConfig } from "../shared/databaseConfig.mjs";
import mysql from "mysql2/promise";
import "dotenv/config";
import { open, readFile, realpath } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { createContentBackup, resolveContentBackupDir } from "./lib/content-sync-backup.mjs";
import path from "node:path";
import process from "node:process";

const metadataName = "codigo-lucrativo-academy";

function parseTsv(text) {
  const [headerLine, ...lines] = text.split(/\r?\n/);
  const header = headerLine.split("\t");
  const headerIndex = new Map(header.map((name, index) => [name, index]));
  return lines.filter(Boolean).map(line => {
    const columns = line.split("\t");
    const value = name => columns[headerIndex.get(name)] ?? "";
    return {
      sourceId: value("id"),
      title: value("title"),
      sourceFile: value("source_file"),
      sourcePath: value("source_path"),
      htmlFile: value("html_file"),
      usage: value("usage"),
      libraryCategory: value("libraryCategory"),
      courseTitle: value("courseTitle"),
      courseSlug: value("courseSlug"),
      courseCategory: value("courseCategory"),
      courseOrder: value("courseOrder"),
      moduleTitle: value("moduleTitle"),
      moduleOrder: value("moduleOrder"),
      lessonOrder: value("lessonOrder"),
      level: value("level"),
      summary: value("summary"),
    };
  });
}

function loadCanonicalCategories(source) {
  return new Map([...source.matchAll(/"([0-9a-f]{16})"\s*:\s*"([^"]+)"/g)].map(match => [match[1], match[2]]));
}


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

function textValue(value) {
  return String(value ?? "").trim();
}

function academyLevel(value) {
  return value === "pratica" || value === "avancado" ? value : "fundamentos";
}

function cleanMetadata(metadata) {
  return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined && value !== ""));
}

function sourcePathSegments(value) {
  return value.split(/[\\/]+/).map(segment => segment.trim()).filter(Boolean);
}

function displayTitle(title, sourceFile) {
  if (title && title.toLowerCase() !== "source") return title;
  return sourceFile.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
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

function writeMetadata(htmlContent, metadata, title) {
  const encoded = encodeURIComponent(JSON.stringify(cleanMetadata(metadata)));
  const tag = `<meta name="${metadataName}" content="${encoded}">`;
  const matcher = new RegExp(`<meta\\s+[^>]*name=["']${metadataName}["'][^>]*>`, "i");
  const html = htmlContent ?? "";
  if (matcher.test(html)) return html.replace(matcher, tag);
  const safeTitle = title.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, `<head$1>${tag}`);
  if (html.trim()) return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${tag}<title>${safeTitle}</title></head><body>${html}</body></html>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${tag}<title>${safeTitle}</title></head><body><main><h1>${safeTitle}</h1></main></body></html>`;
}

function metadataFromManifest(row, canonicalCategory, academyBySourceId) {
  const academy = academyBySourceId.get(row.sourceId);
  const manifestUsage = academy?.usage || row.usage;
  const usage = manifestUsage === "course" || manifestUsage === "both" ? manifestUsage : "library";
  const courseTitle = academy?.courseTitle || row.courseTitle || "";
  return cleanMetadata({
    usage,
    libraryCategory: canonicalCategory || row.libraryCategory || undefined,
    courseTitle: usage !== "library" ? courseTitle || undefined : undefined,
    courseSlug: usage !== "library" ? academy?.courseSlug || row.courseSlug || (courseTitle ? slugify(courseTitle) : undefined) : undefined,
    courseCategory: usage !== "library" ? academy?.courseCategory || row.courseCategory || undefined : undefined,
    courseOrder: usage !== "library" ? numericValue(academy?.courseOrder ?? row.courseOrder) : undefined,
    moduleTitle: usage !== "library" ? academy?.moduleTitle || row.moduleTitle || undefined : undefined,
    moduleOrder: usage !== "library" ? numericValue(academy?.moduleOrder ?? row.moduleOrder) : undefined,
    lessonOrder: usage !== "library" ? numericValue(academy?.lessonOrder ?? row.lessonOrder) ?? 0 : undefined,
    level: usage !== "library" ? academy?.level === "pratica" || academy?.level === "avancado" ? academy.level : row.level === "pratica" || row.level === "avancado" ? row.level : "fundamentos" : undefined,
    coursePublished: usage !== "library" ? academy?.coursePublished ?? true : undefined,
  });
}

function equivalentMetadata(current, expected) {
  const keys = new Set([...Object.keys(current ?? {}), ...Object.keys(expected)]);
  for (const key of keys) {
    if ((current?.[key] ?? undefined) !== (expected[key] ?? undefined)) return false;
  }
  return true;
}

async function assertPdfExists(row, pdfRoot) {
  if (!/^[0-9a-f]{16}$/.test(row.sourceId) || !row.sourceFile) throw new Error("Registro inválido no manifesto de e-books.");
  if (!row.sourcePath.toLowerCase().endsWith(".pdf")) throw new Error(`Fonte nao e PDF para ${row.sourceId}: ${row.sourcePath}`);
  const resolved = path.resolve(pdfRoot, row.sourceId, ...sourcePathSegments(row.sourcePath));
  const relative = path.relative(path.join(pdfRoot, row.sourceId), await realpath(resolved));
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Caminho de PDF invalido para ${row.sourceId}`);
  const file = await open(resolved, "r");
  try {
    const signature = Buffer.alloc(5);
    await file.read(signature, 0, 5, 0);
    if (signature.toString("ascii") !== "%PDF-") throw new Error(`Arquivo empacotado nao e PDF valido para ${row.sourceId}`);
  } finally { await file.close(); }
}

function assertUniqueEbookManifestRows(rows) {
  const sourceIds = new Set();
  const pdfLinks = new Set();
  const duplicateSourceIds = [];
  const duplicatePdfLinks = [];

  for (const row of rows) {
    if (sourceIds.has(row.sourceId)) duplicateSourceIds.push(row.sourceId);
    sourceIds.add(row.sourceId);

    const pdfLink = `${row.sourceId}/${sourcePathSegments(row.sourcePath).join("/")}`;
    if (pdfLinks.has(pdfLink)) duplicatePdfLinks.push(pdfLink);
    pdfLinks.add(pdfLink);
  }

  if (duplicateSourceIds.length) throw new Error(`sourceId duplicado no ebook-manifest.tsv: ${duplicateSourceIds.join(", ")}`);
  if (duplicatePdfLinks.length) throw new Error(`PDF duplicado no ebook-manifest.tsv: ${duplicatePdfLinks.join(", ")}`);
}

function normalizeAcademyManifest(raw, knownSourceIds) {
  if (!raw || !Array.isArray(raw.courses)) throw new Error("Manifesto da Academia inválido: courses deve ser uma lista.");
  const entries = [];
  const coursesOutput = [];
  const usedCourseSlugs = new Set();
  const usedSourceIds = new Map();
  const courses = Array.isArray(raw?.courses) ? raw.courses : [];
  for (const [courseIndex, course] of courses.entries()) {
    const courseTitle = textValue(course?.title);
    if (!courseTitle) throw new Error(`Curso padrao sem title no indice ${courseIndex}.`);
    const courseSlug = textValue(course?.slug) || slugify(courseTitle);
    if (usedCourseSlugs.has(courseSlug)) throw new Error(`courseSlug duplicado no manifesto da Academia: ${courseSlug}`);
    usedCourseSlugs.add(courseSlug);
    const courseCategory = textValue(course?.category) || "Academia";
    const courseOrder = numericValue(course?.courseOrder ?? course?.order) ?? courseIndex + 1;
    const level = academyLevel(course?.level);
    const coursePublished = course?.published !== false;
    const modules = Array.isArray(course.modules) ? course.modules : [];
    if (!modules.length) throw new Error(`Curso padrao sem modulos: ${courseSlug}`);
    const modulesOutput = [];
    const usedModuleKeys = new Set();
    for (const [moduleIndex, module] of modules.entries()) {
      const moduleTitle = textValue(module?.title) || "Modulo unico";
      const moduleOrder = numericValue(module?.moduleOrder ?? module?.order) ?? moduleIndex + 1;
      const moduleKey = `${moduleOrder}:${moduleTitle}`;
      if (usedModuleKeys.has(moduleKey)) throw new Error(`Modulo duplicado em ${courseSlug}: ${moduleKey}`);
      usedModuleKeys.add(moduleKey);
      const lessons = Array.isArray(module.lessons) ? module.lessons : [];
      if (!lessons.length) throw new Error(`Modulo sem aulas em ${courseSlug}: ${moduleKey}`);
      const lessonsOutput = [];
      const usedLessonOrders = new Set();
      for (const [lessonIndex, lesson] of lessons.entries()) {
        const sourceId = textValue(lesson?.sourceId);
        if (!sourceId) throw new Error(`Aula sem sourceId em ${courseSlug}/${moduleKey}.`);
        if (!knownSourceIds.has(sourceId)) throw new Error(`sourceId da Academia nao existe no ebook-manifest.tsv: ${sourceId}`);
        if (usedSourceIds.has(sourceId)) throw new Error(`sourceId repetido na Academia: ${sourceId} em ${usedSourceIds.get(sourceId)} e ${courseSlug}`);
        const lessonOrder = numericValue(lesson?.lessonOrder ?? lesson?.order) ?? lessonIndex + 1;
        if (usedLessonOrders.has(lessonOrder)) throw new Error(`lessonOrder duplicado em ${courseSlug}/${moduleKey}: ${lessonOrder}`);
        usedLessonOrders.add(lessonOrder);
        usedSourceIds.set(sourceId, courseSlug);
        const usage = lesson.usage === "course" ? "course" : "both";
        entries.push({
          sourceId,
          usage,
          courseTitle,
          courseSlug,
          courseCategory,
          courseOrder,
          moduleTitle,
          moduleOrder,
          lessonOrder,
          level,
          coursePublished,
        });
        lessonsOutput.push({ sourceId, lessonOrder, usage });
      }
      modulesOutput.push({ title: moduleTitle, moduleOrder, lessons: lessonsOutput });
    }
    coursesOutput.push({ title: courseTitle, slug: courseSlug, category: courseCategory, level, courseOrder, modules: modulesOutput });
  }
  const stats = {
    totalVersionedCourses: coursesOutput.length,
    totalVersionedModules: coursesOutput.reduce((sum, course) => sum + course.modules.length, 0),
    totalVersionedLessons: coursesOutput.reduce((sum, course) => sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0), 0),
  };
  return {
    bySourceId: new Map(entries.map(entry => [entry.sourceId, entry])),
    courses: coursesOutput,
    stats,
  };
}

export async function runContentSync({
  apply = false, check = false, validateOnly = false,
  projectRoot = process.cwd(), env = process.env, connect = mysql.createConnection,
} = {}) {
  if ([apply, check, validateOnly].filter(Boolean).length > 1) throw new Error("Modos de sync incompatíveis.");
  const mode = apply ? "apply" : validateOnly ? "validate-only" : check ? "check" : "dry-run";
  const ebookImportRoot = env.EBOOK_IMPORT_ROOT || path.resolve(projectRoot, "ebook-import");
  const ebookManifestPath = path.join(ebookImportRoot, "ebook-manifest.tsv");
  const academyManifestPath = env.ACADEMY_MANIFEST_PATH || path.resolve(projectRoot, "content-seeds/academy-courses.json");
  const catalogPath = path.resolve(projectRoot, "shared/ebookLibraryCatalog.ts");
  const pdfRoot = await realpath(path.resolve(ebookImportRoot, "fontes_importados"));
  const [ebookManifestText, catalogSource, academyManifestText] = await Promise.all([
    readFile(ebookManifestPath, "utf8"),
    readFile(catalogPath, "utf8"),
    readFile(academyManifestPath, "utf8"),
  ]);

  const manifestRows = parseTsv(ebookManifestText);
  if (!manifestRows.length) throw new Error("Manifesto de e-books vazio.");
  assertUniqueEbookManifestRows(manifestRows);
  const canonicalCategories = loadCanonicalCategories(catalogSource);
  const academyManifest = JSON.parse(academyManifestText);
  const academyManifestData = normalizeAcademyManifest(academyManifest, new Set(manifestRows.map(row => row.sourceId)));
  const academyBySourceId = academyManifestData.bySourceId;
  await Promise.all(manifestRows.map(row => assertPdfExists(row, pdfRoot)));
  if (validateOnly) return { mode, totalManifestEbooks: manifestRows.length, ...academyManifestData.stats };
  const config = resolveDatabaseConfig(env);
  if (apply) await resolveContentBackupDir(env, projectRoot);

  const db = await connect(config.connection);
  let transactionOpen = false;
  try {
    if (apply) {
      const [tables] = await db.execute("SELECT ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ebooks'");
      if (tables[0]?.engine?.toUpperCase() !== "INNODB") throw new Error("Apply exige tabela ebooks InnoDB para rollback transacional.");
    }
    await db.execute(apply ? "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE" : "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await db.execute(apply ? "START TRANSACTION" : "START TRANSACTION READ ONLY");
    transactionOpen = true;
    const [existingRows] = await db.execute("SELECT id, sourceId, sourceFile, sourcePath, title, summary, htmlContent, status, publishedAt FROM ebooks ORDER BY id" + (apply ? " FOR UPDATE" : ""));
    const knownSourceIds = new Set(manifestRows.map(row => row.sourceId));
    const existingIds = new Set();
    for (const row of existingRows) {
      if (knownSourceIds.has(row.sourceId) && existingIds.has(row.sourceId)) throw new Error("sourceId duplicado no banco; reconciliar antes do sync.");
      existingIds.add(row.sourceId);
    }
    const existingBySourceId = new Map(existingRows.map(row => [row.sourceId, row]));
    const plannedInserts = [];
    const plannedUpdates = [];
    const seen = new Set();
    const duplicateSourceIds = [];
    const distribution = new Map();
    let mappedCategories = 0;
    let categoryCorrections = 0;
    let academyMaterials = 0;

    for (const row of manifestRows) {
      if (seen.has(row.sourceId)) duplicateSourceIds.push(row.sourceId);
      seen.add(row.sourceId);
      const canonicalCategory = canonicalCategories.get(row.sourceId) || row.libraryCategory;
      if (canonicalCategory) {
        mappedCategories++;
        distribution.set(canonicalCategory, (distribution.get(canonicalCategory) || 0) + 1);
      }
      const expectedMetadata = metadataFromManifest(row, canonicalCategory, academyBySourceId);
      if (expectedMetadata.usage === "course" || expectedMetadata.usage === "both") academyMaterials++;
      const title = displayTitle(row.title, row.sourceFile);
      const current = existingBySourceId.get(row.sourceId);
      const summary = current?.summary?.trim() ? current.summary : row.summary?.trim() || `PDF empacotado da biblioteca Codigo Lucrativo: ${title}.`;
      const fallbackHtml = writeMetadata("", expectedMetadata, title);

      if (!current) {
        plannedInserts.push({ ...row, title, summary, htmlContent: fallbackHtml });
        continue;
      }

      const currentMetadata = readMetadata(current.htmlContent || "");
      // Preserve extra admin metadata; replace only fields owned by the manifests.
      const reconciledMetadata = { ...(currentMetadata ?? {}) };
      for (const key of ["usage", "libraryCategory", "courseTitle", "courseSlug", "courseCategory", "courseOrder", "moduleTitle", "moduleOrder", "lessonOrder", "level", "coursePublished"]) delete reconciledMetadata[key];
      Object.assign(reconciledMetadata, expectedMetadata);
      const metadataDiffers = !equivalentMetadata(currentMetadata, reconciledMetadata);
      const currentCategory = currentMetadata?.libraryCategory || "";
      if (canonicalCategory && currentCategory !== canonicalCategory) categoryCorrections++;
      const nextHtmlContent = metadataDiffers ? writeMetadata(current.htmlContent || "", reconciledMetadata, title) : current.htmlContent;
      const needsUpdate =
        metadataDiffers ||
        current.sourceFile !== row.sourceFile ||
        current.sourcePath !== row.sourcePath ||
        current.title !== title ||
        (current.summary || "") !== summary ||
        current.status !== "published" ||
        !current.publishedAt;

      if (needsUpdate) {
        plannedUpdates.push({
          id: current.id,
          sourceId: row.sourceId,
          sourceFile: row.sourceFile,
          sourcePath: row.sourcePath,
          title,
          summary,
          htmlContent: nextHtmlContent,
        });
      }
    }

    let backupPath = null;
    if (apply && (plannedInserts.length || plannedUpdates.length)) {
      backupPath = await createContentBackup(existingRows.filter(row => seen.has(row.sourceId)), plannedInserts.map(row => row.sourceId), { env, projectRoot });
      for (const row of plannedInserts) {
        await db.execute(
          `INSERT INTO ebooks (sourceId, sourceFile, sourcePath, title, summary, htmlContent, status, createdBy, publishedAt)
           VALUES (?, ?, ?, ?, ?, ?, 'published', NULL, NOW())`,
          [row.sourceId, row.sourceFile, row.sourcePath, row.title, row.summary, row.htmlContent],
        );
      }
      for (const row of plannedUpdates) {
        await db.execute(
          "UPDATE ebooks SET sourceFile = ?, sourcePath = ?, title = ?, summary = ?, htmlContent = ?, status = 'published', publishedAt = COALESCE(publishedAt, NOW()) WHERE id = ?",
          [row.sourceFile, row.sourcePath, row.title, row.summary, row.htmlContent, row.id],
        );
      }
    }

    if (apply) await db.commit();
    else await db.rollback();
    transactionOpen = false;
    const result = {
      mode,
      databaseMode: config.mode,
      hasChanges: Boolean(plannedInserts.length || plannedUpdates.length),
      totalManifestEbooks: manifestRows.length,
      totalDatabaseEbooks: existingRows.length + (apply ? plannedInserts.length : 0),
      totalSourceIdsSynced: manifestRows.length,
      totalCanonicalCategories: canonicalCategories.size,
      totalMappedCategories: mappedCategories,
      totalCategoryCorrections: categoryCorrections,
      totalPlannedInserts: plannedInserts.length,
      totalPlannedUpdates: plannedUpdates.length,
      totalUpdated: apply ? plannedInserts.length + plannedUpdates.length : 0,
      totalIgnoredDatabaseRows: existingRows.filter(row => !seen.has(row.sourceId)).length,
      totalDuplicateSourceIds: duplicateSourceIds.length,
      duplicateSourceIds,
      totalVersionedCourses: academyManifestData.stats.totalVersionedCourses,
      totalVersionedModules: academyManifestData.stats.totalVersionedModules,
      totalVersionedLessons: academyManifestData.stats.totalVersionedLessons,
      totalVersionedAcademyMaterials: academyMaterials,
      totalVersionedAcademySourceIds: academyBySourceId.size,
      backupPath,
      finalLibraryDistribution: Object.fromEntries([...distribution.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))),
    };
    return result;
  } finally {
    try { if (transactionOpen) await db.rollback(); }
    finally { await db.end(); }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({ options: {
      apply: { type: "boolean" }, "dry-run": { type: "boolean" },
      check: { type: "boolean" }, "validate-only": { type: "boolean" },
    } });
    if (Object.values(values).filter(Boolean).length > 1) throw new Error("Selecione apenas um modo de sync.");
    const result = await runContentSync({ apply: values.apply, check: values.check, validateOnly: values["validate-only"] });
    console.log(JSON.stringify(result, null, 2));
    if (values.check && result.hasChanges) process.exitCode = 3;
  } catch (error) {
    // Driver errors may contain SQL/data or connection secrets. Only print our safe errors.
    const message = error instanceof Error && !error.code && !error.sql ? error.message : "Falha de configuração, arquivo ou banco; confira o ambiente e os manifestos.";
    console.error(`[Content sync] ${message}`);
    process.exitCode = 1;
  }
}
