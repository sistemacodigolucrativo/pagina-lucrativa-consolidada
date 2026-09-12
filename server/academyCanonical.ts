import { and, desc, eq, gte, lt } from "drizzle-orm";
import { createHash } from "node:crypto";
import { courseProgress, ebooks } from "../drizzle/schema";
import { getPackagedEbookLibraryCategory } from "../shared/ebookLibraryCatalog";
import {
  getAdminOverview as getLegacyAdminOverview,
  getDb,
  getMemberCourses as getLegacyMemberCourses,
  getPublishedEbook as getLegacyPublishedEbook,
  getPublishedEbooks as getLegacyPublishedEbooks,
} from "./db";
import { getPackagedEbooks } from "./staticEbooks";

const ACADEMY_METADATA_NAME = "codigo-lucrativo-academy";
const LEGACY_ACADEMY_COURSE_ID_OFFSET = 900_000_000;
const STABLE_COURSE_ID_OFFSET = 900_000_000;
const STABLE_COURSE_ID_SPAN = 500_000_000;
const EBOOK_READING_PROGRESS_ID_OFFSET = 1_500_000_000;
const EBOOK_READING_PROGRESS_ID_LIMIT = 2_000_000_000;
const PAGE_PACK_FACTOR = 10_000;

type RawAcademyMetadata = {
  usage?: "library" | "course" | "both";
  courseTitle?: string;
  courseSlug?: string;
  courseCategory?: string;
  libraryCategory?: string;
  courseOrder?: number;
  moduleTitle?: string;
  moduleOrder?: number;
  lessonOrder?: number;
  level?: "fundamentos" | "pratica" | "avancado";
  coursePublished?: boolean;
  [key: string]: unknown;
};

type ReadingProgress = {
  ebookId: number;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  lastAccessedAt: Date | null;
};

type StoredCourseProgress = typeof courseProgress.$inferSelect;
type LibraryCategorizedEbook = { sourceId?: string | null; academy?: RawAcademyMetadata | null };

let packagedLibrarySyncPromise: Promise<void> | null = null;

function withPackagedLibraryCategory<T extends LibraryCategorizedEbook>(ebook: T) {
  const libraryCategory = getPackagedEbookLibraryCategory(ebook.sourceId);
  if (!libraryCategory) return ebook;
  return {
    ...ebook,
    academy: {
      ...(ebook.academy ?? {}),
      usage: ebook.academy?.usage ?? "library",
      libraryCategory,
    },
  };
}

async function ensurePackagedLibraryEbooks() {
  if (!packagedLibrarySyncPromise) {
    packagedLibrarySyncPromise = (async () => {
      const db = await getDb();
      if (!db) return;
      const packaged = await getPackagedEbooks();
      for (const ebook of packaged) {
        await db.insert(ebooks).values({
          sourceId: ebook.sourceId,
          sourceFile: ebook.sourceFile,
          sourcePath: ebook.sourcePath,
          title: ebook.title,
          summary: ebook.summary,
          htmlContent: ebook.htmlContent,
          status: "published",
          createdBy: null,
          publishedAt: new Date(),
        }).onDuplicateKeyUpdate({ set: { sourceId: ebook.sourceId } });
      }
    })().catch(error => {
      packagedLibrarySyncPromise = null;
      console.warn("[Ebook Library] Não foi possível sincronizar o acervo PDF empacotado:", error);
    });
  }
  await packagedLibrarySyncPromise;
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96) || "curso";
}

function titleFromSlug(value: string) {
  return value.split("-").filter(Boolean).map(part => part.slice(0, 1).toUpperCase() + part.slice(1)).join(" ") || "Curso";
}

function inferAcademyMetadataFromPath(sourcePath?: string | null): RawAcademyMetadata | null {
  const value = sourcePath?.trim();
  if (!value) return null;
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { decoded = value; }
  const courseSlug = decoded.match(/(?:^|\/)ebooks\/cursos\/([^\/?#]+)/i)?.[1];
  if (!courseSlug) return null;
  const normalized = slugify(courseSlug);
  return { usage: "course", courseSlug: normalized, courseTitle: titleFromSlug(normalized), courseCategory: "Academia", level: "fundamentos", lessonOrder: 0, coursePublished: true };
}

function readAcademyMetadata(htmlContent?: string | null, sourcePath?: string | null): RawAcademyMetadata | null {
  const inferred = inferAcademyMetadataFromPath(sourcePath);
  const tag = htmlContent?.match(new RegExp(`<meta\\s+[^>]*name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i"))?.[0];
  const encoded = tag?.match(/\scontent=["']([^"']+)["']/i)?.[1];
  if (!encoded) return inferred;
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as RawAcademyMetadata;
    if (!parsed || typeof parsed !== "object") return inferred;
    if ((parsed.usage === "course" || parsed.usage === "both") && !parsed.courseSlug && parsed.courseTitle) parsed.courseSlug = slugify(parsed.courseTitle);
    if (parsed.coursePublished === undefined) parsed.coursePublished = true;
    return { ...(inferred ?? {}), ...parsed };
  } catch {
    return inferred;
  }
}

function writeAcademyMetadata(htmlContent: string, metadata: RawAcademyMetadata) {
  const encoded = encodeURIComponent(JSON.stringify(metadata));
  const tag = `<meta name="${ACADEMY_METADATA_NAME}" content="${encoded}">`;
  const matcher = new RegExp(`<meta\\s+[^>]*name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i");
  if (matcher.test(htmlContent)) return htmlContent.replace(matcher, tag);
  if (/<head[^>]*>/i.test(htmlContent)) return htmlContent.replace(/<head([^>]*)>/i, `<head$1>${tag}`);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${tag}</head><body>${htmlContent}</body></html>`;
}

function stableCourseId(routeKey: string) {
  const digest = createHash("sha256").update(routeKey).digest();
  return STABLE_COURSE_ID_OFFSET + (digest.readUInt32BE(0) % STABLE_COURSE_ID_SPAN);
}

function readingProgressRowId(ebookId: number) {
  if (!Number.isInteger(ebookId) || ebookId <= 0 || ebookId >= EBOOK_READING_PROGRESS_ID_LIMIT - EBOOK_READING_PROGRESS_ID_OFFSET) throw new Error("E-book inválido para persistência de leitura.");
  return EBOOK_READING_PROGRESS_ID_OFFSET + ebookId;
}

function ebookIdFromReadingProgressRowId(courseId: number) {
  return courseId - EBOOK_READING_PROGRESS_ID_OFFSET;
}

function encodePageProgress(currentPage: number, totalPages: number) {
  const normalizedTotal = Math.max(1, Math.min(PAGE_PACK_FACTOR - 1, Math.round(totalPages)));
  const normalizedCurrent = Math.max(1, Math.min(normalizedTotal, Math.round(currentPage)));
  return normalizedCurrent * PAGE_PACK_FACTOR + normalizedTotal;
}

function decodePageProgress(encoded: number, ebookId: number, lastAccessedAt: Date | null): ReadingProgress | null {
  if (!Number.isInteger(encoded) || encoded < PAGE_PACK_FACTOR + 1) return null;
  const currentPage = Math.floor(encoded / PAGE_PACK_FACTOR);
  const totalPages = encoded % PAGE_PACK_FACTOR;
  if (currentPage < 1 || totalPages < 1 || currentPage > totalPages) return null;
  return { ebookId, currentPage, totalPages, progressPercent: Math.max(0, Math.min(100, Math.round((currentPage / totalPages) * 100))), lastAccessedAt };
}

function newestProgress(rows: StoredCourseProgress[]) {
  return [...rows].sort((a, b) => (b.lastAccessedAt?.getTime() ?? b.updatedAt.getTime()) - (a.lastAccessedAt?.getTime() ?? a.updatedAt.getTime()))[0] ?? null;
}

export async function getPublishedEbooks() {
  await ensurePackagedLibraryEbooks();
  const published = await getLegacyPublishedEbooks();
  return published.map(ebook => withPackagedLibraryCategory(ebook));
}

export async function getPublishedEbook(ebookId: number) {
  const summaries = await getPublishedEbooks();
  const summary = summaries.find(item => item.id === ebookId);
  if (!summary) return null;
  const detail = await getLegacyPublishedEbook(ebookId);
  if (!detail) return null;
  if ("sourceId" in summary && summary.sourceId && detail.sourceId !== summary.sourceId) return null;
  return withPackagedLibraryCategory(detail);
}

function courseEbooks(course: Awaited<ReturnType<typeof getLegacyMemberCourses>>[number]) {
  const candidate = course as typeof course & { ebooks?: Array<{ id: number; htmlContent?: string | null; sourcePath?: string | null }>; ebook?: { id: number; htmlContent?: string | null; sourcePath?: string | null } | null };
  if (Array.isArray(candidate.ebooks) && candidate.ebooks.length) return candidate.ebooks;
  return candidate.ebook ? [candidate.ebook] : [];
}

function courseIsPublishedAsGroup(course: Awaited<ReturnType<typeof getLegacyMemberCourses>>[number]) {
  const items = courseEbooks(course);
  return Boolean(items.length && items.every(item => readAcademyMetadata(item.htmlContent, item.sourcePath)?.coursePublished !== false));
}

function courseOrderValue(course: Awaited<ReturnType<typeof getLegacyMemberCourses>>[number]) {
  const items = courseEbooks(course);
  const orders = items
    .map(item => readAcademyMetadata(item.htmlContent, item.sourcePath)?.courseOrder)
    .filter((value): value is number => Number.isFinite(Number(value)) && Number(value) > 0);
  return orders.length ? Math.min(...orders) : Number.MAX_SAFE_INTEGER;
}

function courseLevelOrder(course: Awaited<ReturnType<typeof getLegacyMemberCourses>>[number]) {
  const level = course.level;
  if (level === "fundamentos") return 0;
  if (level === "pratica") return 1;
  if (level === "avancado") return 2;
  return 3;
}

async function getReadableEbookIds(userId: number) {
  const [libraryEbooks, academyCourses] = await Promise.all([getPublishedEbooks(), getLegacyMemberCourses(userId)]);
  const ids = new Set(libraryEbooks.map(item => item.id));
  academyCourses.filter(courseIsPublishedAsGroup).forEach(course => courseEbooks(course).forEach(item => ids.add(item.id)));
  return ids;
}

export async function getMemberEbookReadingHistory(userId: number) {
  const db = await getDb();
  if (!db) return [] as ReadingProgress[];
  const [rows, allowed] = await Promise.all([
    db.select().from(courseProgress).where(and(eq(courseProgress.userId, userId), gte(courseProgress.courseId, EBOOK_READING_PROGRESS_ID_OFFSET), lt(courseProgress.courseId, EBOOK_READING_PROGRESS_ID_LIMIT))).orderBy(desc(courseProgress.lastAccessedAt), desc(courseProgress.updatedAt)),
    getReadableEbookIds(userId),
  ]);
  return rows.map(row => decodePageProgress(row.progressPercent, ebookIdFromReadingProgressRowId(row.courseId), row.lastAccessedAt)).filter((item): item is ReadingProgress => Boolean(item && allowed.has(item.ebookId))).slice(0, 20);
}

export async function getMemberEbookReadingProgress(userId: number, ebookId: number) {
  const db = await getDb();
  if (!db) return null;
  const allowed = await getReadableEbookIds(userId);
  if (!allowed.has(ebookId)) return null;
  const rows = await db.select().from(courseProgress).where(and(eq(courseProgress.userId, userId), eq(courseProgress.courseId, readingProgressRowId(ebookId)))).limit(1);
  const row = rows[0];
  return row ? decodePageProgress(row.progressPercent, ebookId, row.lastAccessedAt) : null;
}

export async function updateMemberEbookReadingProgress(userId: number, ebookId: number, currentPage: number, totalPages: number) {
  const allowed = await getReadableEbookIds(userId);
  if (!allowed.has(ebookId)) throw new Error("E-book não encontrado ou indisponível.");
  if (!Number.isInteger(totalPages) || totalPages < 1 || totalPages >= PAGE_PACK_FACTOR) throw new Error("Quantidade de páginas inválida para este leitor.");
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const courseId = readingProgressRowId(ebookId);
  const packed = encodePageProgress(currentPage, totalPages);
  const now = new Date();
  await db.insert(courseProgress).values({ userId, courseId, progressPercent: packed, lastAccessedAt: now }).onDuplicateKeyUpdate({ set: { progressPercent: packed, lastAccessedAt: now } });
  return decodePageProgress(packed, ebookId, now);
}

export async function getMemberCourses(userId: number) {
  const db = await getDb();
  const [legacyCourses, readingHistory, storedCourseRows] = await Promise.all([
    getLegacyMemberCourses(userId),
    getMemberEbookReadingHistory(userId),
    db ? db.select().from(courseProgress).where(and(eq(courseProgress.userId, userId), gte(courseProgress.courseId, STABLE_COURSE_ID_OFFSET), lt(courseProgress.courseId, EBOOK_READING_PROGRESS_ID_OFFSET))) : Promise.resolve([] as StoredCourseProgress[]),
  ]);
  const progressByEbook = new Map(readingHistory.map(item => [item.ebookId, item]));
  const storedById = new Map(storedCourseRows.map(row => [row.courseId, row]));

  return legacyCourses.filter(courseIsPublishedAsGroup).map(course => {
    const items = courseEbooks(course);
    const itemProgress = items.map(item => progressByEbook.get(item.id));
    const hasGranularProgress = itemProgress.some(Boolean);
    const granularPercent = items.length ? Math.round(itemProgress.reduce((sum, progress) => sum + (progress?.progressPercent ?? 0), 0) / items.length) : 0;
    const stableId = stableCourseId(course.routeKey);
    const stableStoredProgress = storedById.get(stableId) ?? null;
    const legacyCandidateRows = items.map(item => storedById.get(LEGACY_ACADEMY_COURSE_ID_OFFSET + item.id)).filter((row): row is StoredCourseProgress => Boolean(row));
    const inheritedLegacyProgress = newestProgress(legacyCandidateRows);
    const fallbackProgress = stableStoredProgress ?? inheritedLegacyProgress;
    const latestGranularAccess = itemProgress.map(progress => progress?.lastAccessedAt ?? null).filter((value): value is Date => value instanceof Date).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
    return {
      ...course,
      id: stableId,
      progressPercent: hasGranularProgress ? granularPercent : fallbackProgress?.progressPercent ?? course.progressPercent,
      lastAccessedAt: latestGranularAccess ?? fallbackProgress?.lastAccessedAt ?? course.lastAccessedAt,
    };
  }).sort((a, b) => {
    const orderA = courseOrderValue(a);
    const orderB = courseOrderValue(b);
    if (orderA !== orderB) return orderA - orderB;
    const levelA = courseLevelOrder(a);
    const levelB = courseLevelOrder(b);
    if (levelA !== levelB) return levelA - levelB;
    return a.title.localeCompare(b.title, "pt-BR");
  });
}

export async function getMemberCourseByRouteKey(userId: number, routeKey: string) {
  const courses = await getMemberCourses(userId);
  return courses.find(course => course.routeKey === routeKey) ?? null;
}

export async function updateMemberCourseProgress(userId: number, courseId: number, progressPercent: number) {
  const courses = await getMemberCourses(userId);
  if (!courses.some(item => item.id === courseId)) throw new Error("Curso não encontrado ou indisponível.");
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const normalized = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const now = new Date();
  await db.insert(courseProgress).values({ userId, courseId, progressPercent: normalized, lastAccessedAt: now }).onDuplicateKeyUpdate({ set: { progressPercent: normalized, lastAccessedAt: now } });
  return { courseId, progressPercent: normalized };
}

export async function updateAcademyCoursePublication(courseSlug: string, isPublished: boolean) {
  const normalizedSlug = slugify(courseSlug);
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const rows = await db.select({ id: ebooks.id, htmlContent: ebooks.htmlContent, sourcePath: ebooks.sourcePath }).from(ebooks);
  const matching = rows.filter(row => {
    const metadata = readAcademyMetadata(row.htmlContent, row.sourcePath);
    if (!metadata || (metadata.usage !== "course" && metadata.usage !== "both")) return false;
    const slug = metadata.courseSlug || (metadata.courseTitle ? slugify(metadata.courseTitle) : "");
    return slug === normalizedSlug;
  });
  if (!matching.length) throw new Error("Curso não encontrado.");
  for (const row of matching) {
    const metadata = readAcademyMetadata(row.htmlContent, row.sourcePath) ?? { usage: "course", courseSlug: normalizedSlug, courseTitle: titleFromSlug(normalizedSlug) };
    await db.update(ebooks).set({ htmlContent: writeAcademyMetadata(row.htmlContent, { ...metadata, coursePublished: isPublished }) }).where(eq(ebooks.id, row.id));
  }
  return { success: true, courseSlug: normalizedSlug, isPublished, materialCount: matching.length } as const;
}

export async function getAdminOverview() {
  const [legacy, courses] = await Promise.all([getLegacyAdminOverview(), getMemberCourses(0)]);
  if (!legacy) return null;
  return { ...legacy, publishedCourseCount: courses.length };
}
