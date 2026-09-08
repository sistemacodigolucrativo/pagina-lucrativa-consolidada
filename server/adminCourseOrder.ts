import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { courses, ebooks } from "../drizzle/schema";
import { getDb } from "./db";

const COURSE_ORDER_MARKER = "codigo-lucrativo-academy-course-order";
const COURSE_ORDER_LOCK_NAME = "pagina_lucrativa_admin_course_order";

type CourseLevel = "fundamentos" | "pratica" | "avancado";

export type AdminCourseInput = {
  title: string;
  summary?: string | null;
  category?: string | null;
  durationMinutes: number;
  level: CourseLevel;
  ebookId: number | null;
  isPublished: boolean;
};

function createCourseRouteKey(title: string) {
  const stem = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "curso";
  return `${stem}-${randomUUID().slice(0, 8)}`;
}

function readCourseOrder(summary?: string | null) {
  const match = summary?.match(new RegExp(`<!--${COURSE_ORDER_MARKER}:(\\d{1,3})-->`, "i"));
  const value = match ? Number(match[1]) : 0;
  return Number.isFinite(value) ? Math.max(0, Math.min(999, Math.round(value))) : 0;
}

function writeCourseOrder(summary: string | null | undefined, order: number) {
  const matcher = new RegExp(`\\s*<!--${COURSE_ORDER_MARKER}:\\d{1,3}-->`, "gi");
  const clean = (summary ?? "").replace(matcher, "").trim();
  return `${clean}${clean ? "\n" : ""}<!--${COURSE_ORDER_MARKER}:${order}-->`;
}

function nextAvailableCourseOrder(rows: Array<{ summary: string | null }>) {
  const usedOrders = new Set(
    rows
      .map(row => readCourseOrder(row.summary))
      .filter(order => order > 0),
  );

  for (let order = 1; order <= 999; order += 1) {
    if (!usedOrders.has(order)) return order;
  }

  throw new Error("Não há posições de ordem disponíveis para novos cursos.");
}

async function assertCourseEbook(executor: any, ebookId: number | null, mustBePublished: boolean) {
  if (!ebookId) {
    if (mustBePublished) throw new Error("Vincule um e-book publicado antes de disponibilizar este curso.");
    return;
  }

  const result = await executor.select({ id: ebooks.id, status: ebooks.status }).from(ebooks).where(eq(ebooks.id, ebookId)).limit(1);
  if (!result[0]) throw new Error("O e-book selecionado não existe.");
  if (mustBePublished && result[0].status !== "published") throw new Error("Selecione um e-book publicado para disponibilizar este curso.");
}

export async function createAdminCourseWithAutomaticOrder(input: AdminCourseInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  return db.transaction(async tx => {
    await tx.execute(sql`SELECT GET_LOCK(${COURSE_ORDER_LOCK_NAME}, 10)`);

    try {
      await assertCourseEbook(tx, input.ebookId, input.isPublished);
      const existingCourses = await tx.select({ summary: courses.summary }).from(courses);
      const order = nextAvailableCourseOrder(existingCourses);
      const summary = writeCourseOrder(input.summary, order);
      const result = await tx.insert(courses).values({
        title: input.title.trim(),
        routeKey: createCourseRouteKey(input.title),
        summary,
        category: input.category?.trim() || null,
        durationMinutes: input.durationMinutes,
        level: input.level,
        ebookId: input.ebookId,
        isPublished: input.isPublished ? 1 : 0,
      });

      return { id: Number(result[0].insertId), order };
    } finally {
      await tx.execute(sql`SELECT RELEASE_LOCK(${COURSE_ORDER_LOCK_NAME})`);
    }
  });
}
