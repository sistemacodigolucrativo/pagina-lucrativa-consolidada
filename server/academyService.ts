import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { courses, courseProgress, ebooks } from "../drizzle/schema";
import { getDb } from "./db";
import { getPackagedEbook, getPackagedEbooks } from "./staticEbooks";
import { storagePut } from "./storage";
import {
  ACADEMY_PDF_MAX_BYTES,
  extractAcademyMetadataFromHtml,
  injectAcademyMetadataIntoHtml,
  isAcademyMaterialVisibleToMember,
  normalizeAcademyMetadata,
  normalizeAcademyStatus,
  slugifyAcademyCourseTitle,
  type AcademyCourseSummary,
  type AcademyLevel,
  type AcademyMaterialSummary,
  type AcademyMetadata,
  type AcademyStatus,
} from "@shared/academy";

type EbookLike = {
  id: number;
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary: string | null;
  htmlContent: string;
  status: string;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  contentType?: "application/pdf" | "text/html";
  pdfUrl?: string | null;
  pdfPath?: string | null;
};

const ebookListFields = {
  id: ebooks.id,
  sourceId: ebooks.sourceId,
  sourceFile: ebooks.sourceFile,
  sourcePath: ebooks.sourcePath,
  title: ebooks.title,
  summary: ebooks.summary,
  htmlContent: ebooks.htmlContent,
  status: ebooks.status,
  publishedAt: ebooks.publishedAt,
  createdAt: ebooks.createdAt,
  updatedAt: ebooks.updatedAt,
};

type AcademyMaterialInput = {
  title: string;
  summary?: string | null;
  status: AcademyStatus;
  courseTitle?: string | null;
  courseSlug?: string | null;
  category?: string | null;
  level?: AcademyLevel;
  lessonOrder?: number;
  pdfDataUrl?: string | null;
  originalName?: string | null;
};

function htmlFallback(title: string, metadata: AcademyMetadata) {
  return injectAcademyMetadataIntoHtml(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title></head><body><main><h1>${title}</h1><p>Material PDF disponível no leitor da Academia.</p></main></body></html>`,
    metadata,
  );
}

function isPdfDataUrl(value: string) {
  return /^data:application\/pdf;base64,[A-Za-z0-9+/=\s]+$/.test(value);
}

function decodePdfDataUrl(value: string) {
  if (!isPdfDataUrl(value)) throw new Error("Envie um arquivo PDF válido.");
  const base64 = value.replace(/^data:application\/pdf;base64,/, "").replace(/\s/g, "");
  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength > ACADEMY_PDF_MAX_BYTES) throw new Error("O PDF deve ter no máximo 25 MB.");
  if (buffer.subarray(0, 5).toString("utf8") !== "%PDF-") throw new Error("O arquivo enviado não possui assinatura PDF válida.");
  return buffer;
}

function materialFromEbook(ebook: EbookLike): AcademyMaterialSummary {
  const metadata = normalizeAcademyMetadata(extractAcademyMetadataFromHtml(ebook.htmlContent || ""));
  return {
    id: ebook.id,
    title: ebook.title,
    summary: ebook.summary ?? null,
    status: normalizeAcademyStatus(ebook.status),
    sourceId: ebook.sourceId,
    sourceFile: ebook.sourceFile,
    sourcePath: ebook.sourcePath,
    htmlContent: ebook.htmlContent || "",
    contentType: ebook.contentType ?? (ebook.sourcePath.toLowerCase().endsWith(".pdf") ? "application/pdf" : "text/html"),
    pdfUrl: ebook.pdfUrl ?? (ebook.sourcePath.startsWith("/manus-storage/") ? ebook.sourcePath : null),
    pdfPath: ebook.pdfPath ?? null,
    publishedAt: ebook.publishedAt ?? null,
    updatedAt: ebook.updatedAt ?? null,
    metadata,
    needsCourse: normalizeAcademyStatus(ebook.status) === "published" && !metadata.courseTitle,
  };
}

function sortMaterials(a: AcademyMaterialSummary, b: AcademyMaterialSummary) {
  const byOrder = a.metadata.lessonOrder - b.metadata.lessonOrder;
  if (byOrder !== 0) return byOrder;
  return a.title.localeCompare(b.title, "pt-BR");
}

function courseIdFromSlug(slug: string) {
  let hash = 0;
  for (const char of slug) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash) + 100000;
}

export function buildAcademyCoursesFromMaterials(materials: AcademyMaterialSummary[], progressByCourse = new Map<number, { progressPercent: number; lastAccessedAt: Date | null }>()): AcademyCourseSummary[] {
  const grouped = new Map<string, AcademyMaterialSummary[]>();
  for (const material of materials) {
    if (!isAcademyMaterialVisibleToMember(material)) continue;
    const slug = material.metadata.courseSlug;
    grouped.set(slug, [...(grouped.get(slug) ?? []), material]);
  }
  return Array.from(grouped.entries()).map(([slug, courseMaterials]) => {
    const sorted = [...courseMaterials].sort(sortMaterials);
    const first = sorted[0];
    const id = courseIdFromSlug(slug);
    const progress = progressByCourse.get(id);
    return {
      id,
      title: first.metadata.courseTitle,
      routeKey: slug,
      summary: first.summary,
      category: first.metadata.category,
      level: first.metadata.level,
      status: "published" as const,
      materialCount: sorted.length,
      moduleCount: sorted.length,
      lessonCount: sorted.length,
      progressPercent: progress?.progressPercent ?? 0,
      lastAccessedAt: progress?.lastAccessedAt ?? null,
      materials: sorted,
    };
  }).sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
}

export async function getAdminAcademyMaterials() {
  const db = await getDb();
  if (!db) return (await getPackagedEbooks()).map(materialFromEbook);
  const rows = await db.select(ebookListFields).from(ebooks).orderBy(desc(ebooks.updatedAt));
  return rows.map(materialFromEbook);
}

export async function getAdminAcademyMaterial(id: number) {
  const db = await getDb();
  if (!db) return getPackagedEbook(id).then(ebook => ebook ? materialFromEbook(ebook) : null);
  const rows = await db.select(ebookListFields).from(ebooks).where(eq(ebooks.id, id)).limit(1);
  return rows[0] ? materialFromEbook(rows[0]) : null;
}

export async function getMemberAcademyCourses(userId: number) {
  const db = await getDb();
  if (!db) return buildAcademyCoursesFromMaterials((await getPackagedEbooks()).map(materialFromEbook));
  const [materials, progressRows] = await Promise.all([
    getAdminAcademyMaterials(),
    db.select().from(courseProgress).where(eq(courseProgress.userId, userId)),
  ]);
  const progressByCourse = new Map(progressRows.map(row => [row.courseId, row]));
  return buildAcademyCoursesFromMaterials(materials, progressByCourse);
}

export async function getMemberAcademyCourseByRouteKey(userId: number, routeKey: string) {
  const courses = await getMemberAcademyCourses(userId);
  return courses.find(course => course.routeKey === routeKey) ?? null;
}

export async function createAdminAcademyMaterial(input: AcademyMaterialInput & { createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const courseTitle = input.courseTitle?.trim() || "";
  if (input.status === "published" && !courseTitle) throw new Error("Informe o curso antes de publicar o material.");
  const metadata = normalizeAcademyMetadata({ courseTitle, courseSlug: input.courseSlug || slugifyAcademyCourseTitle(courseTitle), category: input.category ?? undefined, level: input.level, lessonOrder: input.lessonOrder });
  let sourcePath = `Academia/${input.originalName || `${randomUUID()}.pdf`}`;
  let sourceFile = input.originalName || "material.pdf";
  if (input.pdfDataUrl) {
    const buffer = decodePdfDataUrl(input.pdfDataUrl);
    const stored = await storagePut(`academy/${randomUUID()}.pdf`, buffer, "application/pdf");
    sourcePath = stored.url;
    sourceFile = input.originalName || "material.pdf";
  }
  const htmlContent = htmlFallback(input.title.trim(), metadata);
  const result = await db.insert(ebooks).values({
    sourceId: `academy-${randomUUID()}`,
    sourceFile,
    sourcePath,
    title: input.title.trim(),
    summary: input.summary?.trim() || null,
    htmlContent,
    status: input.status,
    createdBy: input.createdBy,
    publishedAt: input.status === "published" ? new Date() : null,
  });
  return getAdminAcademyMaterial(Number(result[0].insertId));
}

export async function updateAdminAcademyMaterial(id: number, input: AcademyMaterialInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const current = await getAdminAcademyMaterial(id);
  if (!current) throw new Error("Material não encontrado.");
  const courseTitle = input.courseTitle?.trim() || "";
  if (input.status === "published" && !courseTitle) throw new Error("Informe o curso antes de publicar o material.");
  const metadata = normalizeAcademyMetadata({ courseTitle, courseSlug: input.courseSlug || slugifyAcademyCourseTitle(courseTitle), category: input.category ?? undefined, level: input.level, lessonOrder: input.lessonOrder });
  let sourcePath = current.sourcePath;
  let sourceFile = current.sourceFile;
  if (input.pdfDataUrl) {
    const buffer = decodePdfDataUrl(input.pdfDataUrl);
    const stored = await storagePut(`academy/${randomUUID()}.pdf`, buffer, "application/pdf");
    sourcePath = stored.url;
    sourceFile = input.originalName || current.sourceFile;
  }
  await db.update(ebooks).set({
    sourceFile,
    sourcePath,
    title: input.title.trim(),
    summary: input.summary?.trim() || null,
    htmlContent: htmlFallback(input.title.trim(), metadata),
    status: input.status,
    publishedAt: input.status === "published" ? new Date() : null,
  }).where(eq(ebooks.id, id));
  return getAdminAcademyMaterial(id);
}

export async function setAdminAcademyMaterialStatus(id: number, status: AcademyStatus) {
  const current = await getAdminAcademyMaterial(id);
  if (!current) throw new Error("Material não encontrado.");
  return updateAdminAcademyMaterial(id, {
    title: current.title,
    summary: current.summary,
    status,
    courseTitle: current.metadata.courseTitle,
    courseSlug: current.metadata.courseSlug,
    category: current.metadata.category,
    level: current.metadata.level,
    lessonOrder: current.metadata.lessonOrder,
  });
}

export async function updateMemberAcademyProgress(userId: number, courseId: number, progressPercent: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const coursesForMember = await getMemberAcademyCourses(userId);
  if (!coursesForMember.some(course => course.id === courseId)) throw new Error("Curso não encontrado ou indisponível.");
  const normalized = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const now = new Date();
  await db.insert(courseProgress).values({ userId, courseId, progressPercent: normalized, lastAccessedAt: now }).onDuplicateKeyUpdate({ set: { progressPercent: normalized, lastAccessedAt: now } });
  return { courseId, progressPercent: normalized };
}

export async function getLegacyAdminCourses() {
  const academyCourses = buildAcademyCoursesFromMaterials(await getAdminAcademyMaterials());
  const db = await getDb();
  if (!db) return academyCourses;
  const legacyCourses = await db.select().from(courses).where(eq(courses.isPublished, 1)).orderBy(desc(courses.updatedAt));
  return legacyCourses.map(course => ({
    id: course.id,
    title: course.title,
    routeKey: course.routeKey,
    summary: course.summary,
    category: course.category || "Academia",
    level: course.level,
    status: "published" as const,
    materialCount: course.ebookId ? 1 : 0,
    moduleCount: course.ebookId ? 1 : 0,
    lessonCount: course.ebookId ? 1 : 0,
    progressPercent: 0,
    lastAccessedAt: null,
    materials: [],
  }));
}
