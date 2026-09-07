export const ACADEMY_METADATA_NAME = "codigo-lucrativo-academy";
export const ACADEMY_PDF_MAX_BYTES = 25 * 1024 * 1024;
export const academyStatuses = ["draft", "published", "archived"] as const;
export const academyLevels = ["fundamentos", "pratica", "avancado"] as const;

export type AcademyStatus = (typeof academyStatuses)[number];
export type AcademyLevel = (typeof academyLevels)[number];
export type AcademyMaterialUsage = "course";

export type AcademyMetadata = {
  usage: AcademyMaterialUsage;
  courseTitle: string;
  courseSlug: string;
  category: string;
  level: AcademyLevel;
  lessonOrder: number;
};

export type AcademyMaterialSummary = {
  id: number;
  title: string;
  summary: string | null;
  status: AcademyStatus;
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  htmlContent: string;
  contentType?: "application/pdf" | "text/html";
  pdfUrl?: string | null;
  pdfPath?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  metadata: AcademyMetadata;
  needsCourse: boolean;
};

export type AcademyCourseSummary = {
  id: number;
  title: string;
  routeKey: string;
  summary: string | null;
  category: string;
  level: AcademyLevel;
  status: AcademyStatus;
  materialCount: number;
  moduleCount: number;
  lessonCount: number;
  progressPercent: number;
  lastAccessedAt: Date | string | null;
  materials: AcademyMaterialSummary[];
};

const levelLabels: Record<AcademyLevel, string> = {
  fundamentos: "Fundamentos",
  pratica: "Prática",
  avancado: "Avançado",
};

const statusLabels: Record<AcademyStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export function slugifyAcademyCourseTitle(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return slug || "curso";
}

export function titleFromAcademyCourseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Curso";
}

export function normalizeAcademyStatus(status: string | null | undefined): AcademyStatus {
  if (status === "published" || status === "archived" || status === "draft") return status;
  return "draft";
}

export function normalizeAcademyLevel(level: string | null | undefined): AcademyLevel {
  if (level === "pratica" || level === "avancado" || level === "fundamentos") return level;
  return "fundamentos";
}

export function normalizeAcademyMetadata(input: Partial<AcademyMetadata> | null | undefined): AcademyMetadata {
  const courseTitle = input?.courseTitle?.trim() || "";
  const courseSlug = input?.courseSlug?.trim() || (courseTitle ? slugifyAcademyCourseTitle(courseTitle) : "");
  return {
    usage: "course",
    courseTitle,
    courseSlug,
    category: input?.category?.trim() || "Academia",
    level: normalizeAcademyLevel(input?.level),
    lessonOrder: Math.max(0, Math.round(Number(input?.lessonOrder ?? 0) || 0)),
  };
}

export function buildAcademyMetadata(input: Partial<AcademyMetadata>) {
  const metadata = normalizeAcademyMetadata(input);
  return JSON.stringify(metadata);
}

export function extractAcademyMetadataFromHtml(html: string) {
  const pattern = new RegExp(`<meta[^>]+name=["']${ACADEMY_METADATA_NAME}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const match = html.match(pattern);
  if (!match?.[1]) return normalizeAcademyMetadata(null);
  try {
    return normalizeAcademyMetadata(JSON.parse(decodeURIComponent(match[1])) as Partial<AcademyMetadata>);
  } catch {
    try {
      return normalizeAcademyMetadata(JSON.parse(match[1]) as Partial<AcademyMetadata>);
    } catch {
      return normalizeAcademyMetadata(null);
    }
  }
}

export function injectAcademyMetadataIntoHtml(html: string, metadataInput: Partial<AcademyMetadata>) {
  const metadata = encodeURIComponent(buildAcademyMetadata(metadataInput));
  const tag = `<meta name="${ACADEMY_METADATA_NAME}" content="${metadata}">`;
  if (html.match(new RegExp(`<meta[^>]+name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i"))) {
    return html.replace(new RegExp(`<meta[^>]+name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i"), tag);
  }
  if (html.includes("</head>")) return html.replace("</head>", `${tag}</head>`);
  return `<!doctype html><html lang="pt-BR"><head>${tag}<meta charset="utf-8"><title>Material</title></head><body>${html}</body></html>`;
}

export function isAcademyMaterialPublished(material: { status?: string | null }) {
  return normalizeAcademyStatus(material.status) === "published";
}

export function isAcademyMaterialVisibleToMember(material: { status?: string | null; metadata?: Partial<AcademyMetadata> | null }) {
  const metadata = normalizeAcademyMetadata(material.metadata);
  return isAcademyMaterialPublished(material) && Boolean(metadata.courseTitle && metadata.courseSlug);
}

export function getAcademyStatusLabel(status: string | null | undefined) {
  return statusLabels[normalizeAcademyStatus(status)];
}

export function getAcademyLevelLabel(level: string | null | undefined) {
  return levelLabels[normalizeAcademyLevel(level)];
}
