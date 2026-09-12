import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, FileText, GraduationCap, PlusCircle, Save, UploadCloud, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type EbookStatus = "draft" | "published" | "archived";
type AcademyUsage = "library" | "course" | "both";
type AcademyLevel = "fundamentos" | "pratica" | "avancado";
type PdfUpload = { dataUrl: string; contentType: "application/pdf"; originalName: string; size: number };
type AcademyMetadata = {
  usage: AcademyUsage;
  courseTitle?: string;
  courseSlug?: string;
  courseCategory?: string;
  libraryCategory?: string;
  courseOrder?: number;
  moduleTitle?: string;
  moduleOrder?: number;
  lessonOrder?: number;
  level?: AcademyLevel;
};
type EbookForm = {
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary: string;
  htmlContent: string;
  status: EbookStatus;
  pdfUpload: PdfUpload | null;
  usage: AcademyUsage;
  libraryCategory: string;
  academyCourseTitle: string;
  academyCategory: string;
  academyOrder: string;
  academyLevel: AcademyLevel;
};

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const ACADEMY_METADATA_NAME = "codigo-lucrativo-academy";
const levelLabel = { fundamentos: "Fundamentos", pratica: "Prática", avancado: "Avançado" } as const;
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function titleFromPdfName(filename: string) {
  return filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyCourseTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "curso";
}

function titleFromCourseSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map(part => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ") || "Curso";
}

function inferAcademyMetadataFromPath(sourcePath: string | null | undefined): AcademyMetadata | null {
  if (!sourcePath) return null;
  let decodedPath = sourcePath;
  try {
    decodedPath = decodeURIComponent(sourcePath);
  } catch {
    decodedPath = sourcePath;
  }

  const courseSlug = decodedPath.match(/(?:^|\/)ebooks\/cursos\/([^\/?#]+)/i)?.[1];
  if (!courseSlug) return null;
  const normalizedSlug = slugifyCourseTitle(courseSlug);
  return {
    usage: "course",
    courseTitle: titleFromCourseSlug(normalizedSlug),
    courseSlug: normalizedSlug,
    courseCategory: "Academia",
    lessonOrder: 0,
    level: "fundamentos",
  };
}

function normalizeAcademyMetadata(value: unknown): AcademyMetadata | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Partial<AcademyMetadata>;
  const usage: AcademyUsage = data.usage === "course" || data.usage === "both" ? data.usage : "library";
  const libraryCategory = typeof data.libraryCategory === "string" ? data.libraryCategory.trim() : "";
  const courseTitle = typeof data.courseTitle === "string" ? data.courseTitle.trim() : "";
  const courseCategory = typeof data.courseCategory === "string" ? data.courseCategory.trim() : "";
  const courseOrder = Number.isFinite(Number(data.courseOrder)) ? Math.max(0, Math.round(Number(data.courseOrder))) : 0;
  const moduleTitle = typeof data.moduleTitle === "string" ? data.moduleTitle.trim() : "";
  const moduleOrder = Number.isFinite(Number(data.moduleOrder)) ? Math.max(0, Math.round(Number(data.moduleOrder))) : 0;
  const lessonOrder = Number.isFinite(Number(data.lessonOrder)) ? Math.max(0, Math.round(Number(data.lessonOrder))) : 0;
  const level: AcademyLevel = data.level === "pratica" || data.level === "avancado" ? data.level : "fundamentos";
  if (usage === "library") return { usage, libraryCategory };
  if (!courseTitle) return { usage, libraryCategory };
  return {
    usage,
    libraryCategory,
    courseTitle,
    courseSlug: typeof data.courseSlug === "string" && data.courseSlug.trim() ? data.courseSlug.trim() : slugifyCourseTitle(courseTitle),
    courseCategory,
    courseOrder,
    moduleTitle,
    moduleOrder,
    lessonOrder,
    level,
  };
}

function extractAcademyMetadata(htmlContent: string | null | undefined, sourcePath?: string | null): AcademyMetadata {
  const inferredFromPath = inferAcademyMetadataFromPath(sourcePath);
  const tag = htmlContent?.match(new RegExp(`<meta\\s+[^>]*name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i"))?.[0];
  const encoded = tag?.match(/\scontent=["']([^"']+)["']/i)?.[1];
  if (!encoded) return inferredFromPath ?? { usage: "library" };
  try {
    const metadata = normalizeAcademyMetadata(JSON.parse(decodeURIComponent(encoded)));
    return metadata?.usage === "course" || metadata?.usage === "both" ? metadata : inferredFromPath ?? metadata ?? { usage: "library" };
  } catch {
    return inferredFromPath ?? { usage: "library" };
  }
}

function buildAcademyMetadata(form: EbookForm): AcademyMetadata {
  const courseTitle = form.academyCourseTitle.trim();
  const lessonOrder = form.academyOrder ? Math.max(0, Math.round(Number(form.academyOrder))) : 0;
  if (form.usage === "library") {
    return {
      usage: "library",
      libraryCategory: form.libraryCategory.trim(),
    };
  }
  const academy: AcademyMetadata = {
    usage: form.usage,
    libraryCategory: form.libraryCategory.trim(),
    courseTitle,
    courseSlug: slugifyCourseTitle(courseTitle),
    courseCategory: form.academyCategory.trim(),
    lessonOrder,
    level: form.academyLevel,
  };
  return academy;
}

function createPdfFallbackHtml(title: string, filename = "ebook.pdf", academy: AcademyMetadata = { usage: "library" }) {
  const safeTitle = escapeHtml(title.trim() || "Material em PDF");
  const safeFilename = escapeHtml(filename.trim() || "ebook.pdf");
  const encodedAcademy = encodeURIComponent(JSON.stringify(academy));
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="${ACADEMY_METADATA_NAME}" content="${encodedAcademy}"><title>${safeTitle}</title></head><body><main><h1>${safeTitle}</h1><p>Este material foi publicado em PDF: ${safeFilename}.</p></main></body></html>`;
}

const newForm = (usage: AcademyUsage = "course"): EbookForm => ({
  sourceId: "",
  sourceFile: "",
  sourcePath: "",
  title: "",
  summary: "",
  htmlContent: createPdfFallbackHtml(usage === "library" ? "Novo e-book" : "Novo material", "ebook.pdf", { usage, libraryCategory: usage === "course" ? "" : "Negócio digital" }),
  status: "draft",
  pdfUpload: null,
  usage,
  libraryCategory: usage === "course" ? "" : "Negócio digital",
  academyCourseTitle: "",
  academyCategory: "Fundamentos",
  academyOrder: "",
  academyLevel: "fundamentos",
});

function readPdfFile(file: File) {
  return new Promise<PdfUpload>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o PDF selecionado."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Não foi possível ler o PDF selecionado."));
        return;
      }
      resolve({ dataUrl: reader.result, contentType: "application/pdf", originalName: file.name, size: file.size });
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminEbooks() {
  const utils = trpc.useUtils();
  const [location, setLocation] = useLocation();
  const isLibraryAdmin = location.startsWith("/admin/ebooks");
  const libraryCreateMode = location === "/admin/ebooks/novo";
  const libraryEditMatch = location.match(/^\/admin\/ebooks\/(\d+)\/editar$/);
  const libraryEditId = libraryEditMatch ? Number(libraryEditMatch[1]) : null;
  const isLibraryFormScreen = isLibraryAdmin && (libraryCreateMode || libraryEditId !== null);
  const defaultUsage: AcademyUsage = isLibraryAdmin ? "library" : "course";
  const ebooks = trpc.admin.academy.list.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(() => libraryEditId);
  const detail = trpc.admin.academy.detail.useQuery({ id: selectedId ?? 0 }, { enabled: selectedId !== null });
  const [form, setForm] = useState<EbookForm>(() => newForm(defaultUsage));
  const [formOpen, setFormOpen] = useState(() => !isLibraryAdmin);

  useEffect(() => {
    if (selectedId !== null) return;
    setForm(current => (current.usage === defaultUsage ? current : newForm(defaultUsage)));
  }, [defaultUsage, selectedId]);

  useEffect(() => {
    if (!isLibraryAdmin) {
      setFormOpen(true);
      return;
    }
    setSelectedId(libraryEditId);
    setFormOpen(isLibraryFormScreen);
    if (libraryCreateMode) setForm(newForm("library"));
  }, [isLibraryAdmin, isLibraryFormScreen, libraryCreateMode, libraryEditId]);

  useEffect(() => {
    if (!detail.data) return;
    const academy = extractAcademyMetadata(detail.data.htmlContent, detail.data.sourcePath);
    setForm({
      sourceId: detail.data.sourceId,
      sourceFile: detail.data.sourceFile,
      sourcePath: detail.data.sourcePath,
      title: detail.data.title,
      summary: detail.data.summary || "",
      htmlContent: detail.data.htmlContent || createPdfFallbackHtml(detail.data.title, detail.data.sourceFile, academy),
      status: detail.data.status as EbookStatus,
      pdfUpload: null,
      usage: academy.usage,
      libraryCategory: academy.libraryCategory || "Negócio digital",
      academyCourseTitle: academy.courseTitle || "",
      academyCategory: academy.courseCategory || "Fundamentos",
      academyOrder: academy.lessonOrder ? String(academy.lessonOrder) : "",
      academyLevel: academy.level || "fundamentos",
    });
  }, [detail.data]);

  const courseMaterials = useMemo(() => (ebooks.data ?? []).filter(ebook => {
    const academy = extractAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent, ebook.sourcePath);
    return academy.usage !== "library" && academy.courseTitle;
  }), [ebooks.data]);
  const libraryMaterials = useMemo(() => (ebooks.data ?? []).filter(ebook => {
    const academy = extractAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent, ebook.sourcePath);
    return academy.usage === "library" || academy.usage === "both";
  }), [ebooks.data]);
  const pendingCourseMaterials = useMemo(
    () => (ebooks.data ?? []).filter(ebook => {
      const academy = extractAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent, ebook.sourcePath);
      return ebook.status === "published" && academy.usage !== "library" && !academy.courseTitle;
    }),
    [ebooks.data],
  );
  const courseOptions = useMemo(() => {
    const names = new Set<string>();
    courseMaterials.forEach(ebook => {
      const academy = extractAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent, ebook.sourcePath);
      if (academy.courseTitle) names.add(academy.courseTitle);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [courseMaterials]);

  const courseGroups = useMemo(() => {
    const groups = new Map<string, { slug: string; title: string; category: string; level: AcademyLevel; items: Array<{ ebook: (typeof courseMaterials)[number]; academy: AcademyMetadata }> }>();

    courseMaterials.forEach(ebook => {
      const academy = extractAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent, ebook.sourcePath);
      const title = academy.courseTitle?.trim();
      if (!title) return;
      const key = academy.courseSlug || slugifyCourseTitle(title);
      const current = groups.get(key) || { slug: key, title, category: academy.courseCategory || "Curso", level: academy.level || "fundamentos", items: [] };
      current.items.push({ ebook, academy });
      groups.set(key, current);
    });

    return Array.from(groups.values())
      .map(course => ({
        ...course,
        items: course.items.sort((a, b) => (a.academy.lessonOrder || 0) - (b.academy.lessonOrder || 0) || a.ebook.title.localeCompare(b.ebook.title, "pt-BR")),
      }))
      .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
  }, [courseMaterials]);

  function handleCourseTitleChange(value: string) {
    const normalized = value.trim().toLocaleLowerCase("pt-BR");
    const selectedCourse = courseGroups.find(course => course.title.trim().toLocaleLowerCase("pt-BR") === normalized);
    setForm(current => ({
      ...current,
      academyCourseTitle: value,
      ...(selectedCourse
        ? {
            academyCategory: selectedCourse.category === "Curso" ? current.academyCategory : selectedCourse.category,
            academyLevel: selectedCourse.level,
          }
        : {}),
    }));
  }

  const refresh = async () => {
    await utils.admin.ebooks.invalidate();
    await utils.admin.academy.list.invalidate();
    await utils.member.ebooks.invalidate();
    await utils.member.academy.listCourses.invalidate();
    await utils.member.courses.invalidate();
    if (selectedId) {
      await utils.admin.ebook.invalidate({ id: selectedId });
      await utils.admin.academy.detail.invalidate({ id: selectedId });
    }
  };

  const create = trpc.admin.academy.createMaterial.useMutation({
    onSuccess: () => {
      void refresh();
      setSelectedId(null);
      setForm(newForm(defaultUsage));
      if (isLibraryAdmin) {
        setFormOpen(false);
        setLocation("/admin/ebooks");
      }
      toast.success(isLibraryAdmin ? "E-book criado." : "Material da Academia criado.");
    },
    onError: error => toast.error(error.message),
  });
  const update = trpc.admin.academy.updateMaterial.useMutation({
    onSuccess: () => {
      void refresh();
      if (isLibraryAdmin) setLocation("/admin/ebooks");
      toast.success("Material atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  const pending = create.isPending || update.isPending;
  const currentPdfUrl = detail.data?.pdfUrl ?? null;
  const hasExistingPdf = Boolean(currentPdfUrl);

  const closeForm = () => {
    setSelectedId(null);
    setForm(newForm(defaultUsage));
    if (isLibraryAdmin) {
      setFormOpen(false);
      setLocation("/admin/ebooks");
    }
  };

  const openNewForm = () => {
    if (isLibraryAdmin) {
      setLocation("/admin/ebooks/novo");
      return;
    }
    setSelectedId(null);
    setForm(newForm(defaultUsage));
    setFormOpen(true);
  };

  const openExisting = (id: number) => {
    if (isLibraryAdmin) {
      setLocation(`/admin/ebooks/${id}/editar`);
      return;
    }
    setSelectedId(id);
    setFormOpen(true);
  };

  async function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Selecione um arquivo PDF.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error("O PDF deve ter no máximo 25 MB.");
      return;
    }
    try {
      const pdfUpload = await readPdfFile(file);
      setForm(current => {
        const title = current.title.trim() || titleFromPdfName(file.name) || "Novo PDF";
        const sourceId = current.sourceId.trim() || `pdf-${Date.now()}`;
        const academy = buildAcademyMetadata({ ...current, title });
        return {
          ...current,
          sourceId,
          sourceFile: file.name,
          title,
          htmlContent: createPdfFallbackHtml(title, file.name, academy),
          pdfUpload,
        };
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler o PDF selecionado.");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      toast.error("Informe o título do PDF.");
      return;
    }
    if (!form.pdfUpload && !hasExistingPdf) {
      toast.error("Selecione um arquivo PDF antes de salvar.");
      return;
    }
    const targetsLibrary = form.usage === "library" || form.usage === "both";
    const targetsCourse = form.usage === "course" || form.usage === "both";
    if (targetsLibrary && !form.libraryCategory.trim()) {
      toast.error("Informe a categoria da Biblioteca.");
      return;
    }
    if (targetsCourse && !form.academyCourseTitle.trim()) {
      toast.error("Informe o curso da Academia.");
      return;
    }
    const orderNumber = form.academyOrder ? Number(form.academyOrder) : 0;
    if (Number.isNaN(orderNumber) || orderNumber < 0 || orderNumber > 999) {
      toast.error("Informe uma ordem válida para o material.");
      return;
    }

    const academy = buildAcademyMetadata(form);
    const sourceId = form.sourceId.trim() || `pdf-${Date.now()}`;
    const sourceFile = form.pdfUpload?.originalName || form.sourceFile.trim() || `${title}.pdf`;
    const payload = {
      sourceId,
      sourceFile,
      sourcePath: form.sourcePath.trim() || "Upload PDF",
      title,
      summary: form.summary.trim() || null,
      htmlContent: createPdfFallbackHtml(title, sourceFile, academy),
      status: form.status,
      pdfUpload: form.pdfUpload,
    };

    if (selectedId) update.mutate({ id: selectedId, ...payload });
    else create.mutate(payload);
  }

  const libraryPageTitle = libraryCreateMode ? "Novo e-book" : libraryEditId !== null ? "Editar e-book" : "Biblioteca de e-books";
  const libraryPageDescription = libraryCreateMode
    ? "Cadastre o novo PDF em uma tela dedicada, preservando as regras da Biblioteca e da Academia."
    : libraryEditId !== null
      ? "Edite somente o e-book selecionado em uma tela dedicada e retorne à listagem ao concluir."
      : "Controle e-books independentes da Biblioteca e materiais que também podem aparecer na Academia.";

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:space-y-7 sm:p-8">
        <header className={isLibraryAdmin ? "space-y-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5" : "space-y-2"}>
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">{isLibraryAdmin ? "Biblioteca de e-books" : "Academia"}</span>
          <h1 className="break-words text-2xl font-semibold text-white sm:text-3xl">{isLibraryAdmin ? libraryPageTitle : "Academia"}</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            {isLibraryAdmin ? libraryPageDescription : "Publique cursos em PDF, organize os materiais em sequência e entregue tudo no leitor da Academia."}
          </p>
        </header>

        <section className={isLibraryAdmin ? "grid min-w-0 gap-5" : "grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start"}>
          <aside className={isLibraryAdmin ? (isLibraryFormScreen ? "hidden" : "order-2 min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-3") : "order-2 min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-3 lg:order-1"}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <h2 className="text-sm font-semibold text-white">{isLibraryAdmin ? "E-books cadastrados" : "Cursos cadastrados"}</h2>
                <p className="text-xs text-zinc-500">
                  {isLibraryAdmin
                    ? `${libraryMaterials.length} PDFs na Biblioteca`
                    : `${courseMaterials.length} PDFs cadastrados${pendingCourseMaterials.length ? ` · ${pendingCourseMaterials.length} pendentes` : ""}`}
                </p>
              </div>
              <button type="button" onClick={openNewForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-3 py-2 text-xs font-semibold text-black transition hover:bg-emerald-200">
                <PlusCircle className="size-4" />
                {isLibraryAdmin ? "Novo e-book" : "Novo material"}
              </button>
            </div>

            <div className="max-h-none space-y-3 overflow-visible lg:max-h-[72vh] lg:overflow-y-auto lg:pr-1">
              {ebooks.isLoading ? (
                <p className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-400">{isLibraryAdmin ? "Carregando e-books..." : "Carregando cursos..."}</p>
              ) : isLibraryAdmin ? (
                libraryMaterials.length ? (
                  <div className="space-y-2">
                    {libraryMaterials.map(ebook => {
                      const academy = extractAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent, ebook.sourcePath);
                      return (
                        <button
                          type="button"
                          key={ebook.id}
                          onClick={() => openExisting(ebook.id)}
                          className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition hover:border-emerald-300/50 ${selectedId === ebook.id ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-zinc-950/70"}`}
                        >
                          <FileText className="mt-0.5 size-4 shrink-0 text-emerald-200" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-5 text-white [overflow-wrap:anywhere]">{ebook.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                              {ebook.status === "published" ? "Publicado" : ebook.status === "draft" ? "Rascunho" : "Arquivado"} · {academy.libraryCategory || "Sem categoria"}{academy.usage === "both" ? " · Academia" : ""}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-white/15 bg-black/25 p-4 text-sm leading-6 text-zinc-400">
                    Nenhum e-book da Biblioteca cadastrado ainda. Comece criando o primeiro material PDF.
                  </p>
                )
              ) : courseGroups.length || pendingCourseMaterials.length ? (
                <>
                  {courseGroups.map(course => (
                    <section key={course.slug} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-5 text-white [overflow-wrap:anywhere]">{course.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-wider text-emerald-200">{course.category}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[11px] text-zinc-400">
                          {course.items.length} {course.items.length === 1 ? "PDF" : "PDFs"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {course.items.map(({ ebook, academy }, index) => {
                          const position = academy.lessonOrder || index + 1;
                          return (
                            <button
                              type="button"
                              key={ebook.id}
                              onClick={() => openExisting(ebook.id)}
                              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition hover:border-emerald-300/50 ${selectedId === ebook.id ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-zinc-950/70"}`}
                            >
                              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-xs font-semibold text-emerald-200">
                                {position}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium leading-5 text-white [overflow-wrap:anywhere]">{ebook.title}</p>
                                <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                                  {ebook.status === "published" ? "Publicado" : ebook.status === "draft" ? "Rascunho" : "Arquivado"} · {academy.level ? levelLabel[academy.level] : "Fundamentos"}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  {pendingCourseMaterials.length ? (
                    <section className="rounded-xl border border-amber-300/25 bg-amber-300/5 p-3">
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-amber-100">Publicados sem curso</p>
                        <p className="mt-1 text-xs leading-5 text-amber-100/70">Esses PDFs estão publicados, mas só aparecem para o membro depois que você definir o curso.</p>
                      </div>
                      <div className="space-y-2">
                        {pendingCourseMaterials.map(ebook => (
                          <button
                            type="button"
                            key={ebook.id}
                            onClick={() => openExisting(ebook.id)}
                            className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition hover:border-amber-300/50 ${selectedId === ebook.id ? "border-amber-300/70 bg-amber-300/10" : "border-white/10 bg-zinc-950/70"}`}
                          >
                            <FileText className="mt-0.5 size-4 shrink-0 text-amber-200" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-5 text-white [overflow-wrap:anywhere]">{ebook.title}</p>
                              <p className="mt-1 text-xs uppercase tracking-wider text-amber-100/70">Publicado · curso não definido</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </>
              ) : (
                <p className="rounded-xl border border-dashed border-white/15 bg-black/25 p-4 text-sm leading-6 text-zinc-400">
                  Nenhum curso publicado ainda. Comece criando o primeiro material de curso em PDF.
                </p>
              )}
            </div>
          </aside>

          <div className={isLibraryAdmin ? "contents" : "order-1 space-y-5 lg:order-2"}>
            {(!isLibraryAdmin || formOpen) ? <form onSubmit={submit} className={`${isLibraryAdmin ? "order-3 " : ""}space-y-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-medium text-white">{selectedId ? "Editar material" : isLibraryAdmin ? "Novo e-book PDF" : "Novo material PDF"}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
                    Defina onde o PDF será exibido, envie o arquivo e mantenha status, categoria e vínculo coerentes para o membro.
                  </p>
                </div>
                {(selectedId || (isLibraryAdmin && formOpen)) && (
                  <button type="button" onClick={closeForm} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:border-white/30 hover:text-white">
                    {isLibraryAdmin ? <ArrowLeft className="size-4" /> : <X className="size-4" />}
                    {isLibraryAdmin ? "Voltar para e-books" : selectedId ? "Fechar edição" : "Fechar formulário"}
                  </button>
                )}
              </div>

              <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <label className="text-sm text-zinc-200">
                    Destino
                    <select value={form.usage} onChange={event => setForm({ ...form, usage: event.target.value as AcademyUsage })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">
                      <option value="library">Biblioteca</option>
                      <option value="course">Academia</option>
                      <option value="both">Biblioteca e Academia</option>
                    </select>
                  </label>
                  {(form.usage === "library" || form.usage === "both") && (
                    <label className="text-sm text-zinc-200">
                      Categoria da Biblioteca
                      <input value={form.libraryCategory} onChange={event => setForm({ ...form, libraryCategory: event.target.value })} placeholder="Ex.: Negócio digital" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                      <span className="mt-1 block text-xs leading-5 text-zinc-500">Usada como fonte principal para organizar a Biblioteca de e-books do membro.</span>
                    </label>
                  )}
                </div>
              </section>

              {(form.usage === "course" || form.usage === "both") && (
              <section className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">
                <div className="mb-4 flex items-center gap-2 text-white">
                  <GraduationCap className="size-5 text-emerald-300" />
                  <h3 className="font-medium">Dados do curso</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
                  <label className="text-sm text-zinc-200">
                    Curso
                    <input required list="academy-course-options" value={form.academyCourseTitle} onChange={event => handleCourseTitleChange(event.target.value)} placeholder="Ex.: Engatinhando no MKT" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                    <datalist id="academy-course-options">
                      {courseOptions.map(course => <option key={course} value={course} />)}
                    </datalist>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">Digite um novo curso ou escolha um existente para adicionar PDFs à sequência.</span>
                  </label>
                  <label className="text-sm text-zinc-200">
                    Ordem
                    <input type="number" min={0} max={999} value={form.academyOrder} onChange={event => setForm({ ...form, academyOrder: event.target.value })} placeholder="1" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                  </label>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-zinc-200">
                    Categoria
                    <input value={form.academyCategory} onChange={event => setForm({ ...form, academyCategory: event.target.value })} placeholder="Ex.: Iniciantes" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                  </label>
                  <label className="text-sm text-zinc-200">
                    Nível
                    <select value={form.academyLevel} onChange={event => setForm({ ...form, academyLevel: event.target.value as AcademyLevel })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">
                      <option value="fundamentos">Fundamentos</option>
                      <option value="pratica">Prática</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </label>
                </div>
              </section>
              )}

              <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                  <label className="text-sm text-zinc-200">
                    Título do PDF
                    <input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                  </label>
                  <label className="text-sm text-zinc-200">
                    Status
                    <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as EbookStatus })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </label>
                </div>

                {form.status !== "published" ? (
                  <p className="rounded-lg border border-amber-300/25 bg-amber-300/5 px-3 py-2 text-xs leading-5 text-amber-100">
                    Este material está como {form.status === "draft" ? "rascunho" : "arquivado"} e não aparece para membros.
                  </p>
                ) : (
                  <p className="rounded-lg border border-emerald-300/20 bg-emerald-300/5 px-3 py-2 text-xs leading-5 text-emerald-100">
                    Publicado: este PDF aparece nos destinos selecionados quando tiver os dados obrigatórios preenchidos.
                  </p>
                )}

                <label className="block text-sm text-zinc-200">
                  Arquivo PDF
                  <span className="mt-1 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300/35 bg-emerald-300/5 px-4 py-5 text-center transition hover:border-emerald-300/70 hover:bg-emerald-300/10">
                    <UploadCloud className="mb-2 size-7 text-emerald-300" />
                    <span className="max-w-full text-sm font-semibold text-white [overflow-wrap:anywhere]">{form.pdfUpload?.originalName || (hasExistingPdf ? "PDF atual mantido" : "Selecionar PDF")}</span>
                    <span className="mt-1 text-xs leading-5 text-zinc-400">Apenas .pdf, até 25 MB.</span>
                  </span>
                  <input type="file" accept=".pdf,application/pdf" onChange={handlePdfChange} className="sr-only" />
                </label>

                {currentPdfUrl ? (
                  <a href={currentPdfUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/50 hover:text-emerald-100 sm:w-auto">
                    <ExternalLink className="size-4" />
                    Ver PDF atual
                  </a>
                ) : null}
              </section>

              <label className="block text-sm text-zinc-200">
                Resumo para os membros
                <textarea value={form.summary} onChange={event => setForm({ ...form, summary: event.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
              </label>

              <button disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:opacity-60 sm:w-auto">
                <Save className="size-4" />
                {pending ? "Salvando..." : selectedId ? "Salvar material" : form.status === "published" ? "Publicar material" : "Salvar rascunho"}
              </button>
            </form> : null}

            <section className={isLibraryAdmin ? (isLibraryFormScreen ? "hidden" : "order-1 min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5") : "min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5"}>
              <div className="mb-3 flex items-center gap-2 text-white">
                <FileText className="size-5 text-emerald-300" />
                <h2 className="font-medium">{isLibraryAdmin ? "Regras de exibição" : "Padrão da Academia"}</h2>
              </div>
              <p className="text-sm leading-6 text-zinc-300">
                {isLibraryAdmin
                  ? "PDFs com destino Biblioteca aparecem em /membros/ebooks. Materiais com destino Academia continuam agrupados por curso em /membros/academia."
                  : "Materiais publicados com destino Academia aparecem agrupados por curso no painel do membro. PDFs publicados sem curso ficam como pendência administrativa."}
              </p>
            </section>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
