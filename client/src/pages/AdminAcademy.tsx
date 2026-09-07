import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpenCheck, Eye, EyeOff, FileText, LoaderCircle, PlusCircle, Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminEbooks from "./AdminEbooks";

const ACADEMY_METADATA_NAME = "codigo-lucrativo-academy";
const COURSE_ORDER_MARKER = "codigo-lucrativo-academy-course-order";

type AcademyLevel = "fundamentos" | "pratica" | "avancado";
type AcademyMetadata = {
  usage?: "library" | "course" | "both";
  courseTitle?: string;
  courseSlug?: string;
  courseCategory?: string;
  libraryCategory?: string;
  lessonOrder?: number;
  courseOrder?: number;
  level?: AcademyLevel;
  coursePublished?: boolean;
  [key: string]: unknown;
};

type AdminEbook = {
  id: number;
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary?: string | null;
  htmlContent?: string | null;
  status: "draft" | "published" | "archived";
};

type StoredCourse = {
  id: number;
  title: string;
  routeKey: string;
  summary: string | null;
  category: string | null;
  durationMinutes: number;
  level: AcademyLevel;
  ebookId: number | null;
  isPublished: number;
};

type CourseView = {
  key: string;
  id: number | null;
  slug: string;
  title: string;
  category: string;
  level: AcademyLevel;
  order: number;
  published: boolean;
  storedCourse: StoredCourse | null;
  items: Array<{ ebook: AdminEbook; metadata: AcademyMetadata }>;
};

type CourseForm = {
  title: string;
  order: string;
  category: string;
  level: AcademyLevel;
};

type CourseEditorState = {
  courseId: number | null;
  slug: string;
  originalTitle: string;
  creating: boolean;
};

type MaterialEditorState =
  | { mode: "create"; course: CourseView }
  | { mode: "edit"; course: CourseView; ebookId: number; title: string }
  | null;

const levelLabel: Record<AcademyLevel, string> = {
  fundamentos: "Fundamentos",
  pratica: "Prática",
  avancado: "Avançado",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "curso";
}

function normalizedTitle(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function readAcademyMetadata(htmlContent?: string | null, sourcePath?: string | null): AcademyMetadata | null {
  const tag = htmlContent?.match(new RegExp(`<meta\\s+[^>]*name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i"))?.[0];
  const encoded = tag?.match(/\scontent=["']([^"']+)["']/i)?.[1];
  if (encoded) {
    try {
      const parsed = JSON.parse(decodeURIComponent(encoded)) as AcademyMetadata;
      if (parsed && typeof parsed === "object") {
        if (parsed.coursePublished === undefined) parsed.coursePublished = true;
        return parsed;
      }
    } catch {
      // Metadado legado pode ser inferido pelo caminho abaixo.
    }
  }

  const decodedPath = (() => {
    try {
      return decodeURIComponent(sourcePath ?? "");
    } catch {
      return sourcePath ?? "";
    }
  })();
  const courseSlug = decodedPath.match(/(?:^|\/)ebooks\/cursos\/([^\/?#]+)/i)?.[1];
  if (!courseSlug) return null;
  const normalized = slugify(courseSlug);
  return {
    usage: "course",
    courseSlug: normalized,
    courseTitle: normalized.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
    courseCategory: "Academia",
    lessonOrder: 0,
    level: "fundamentos",
    coursePublished: true,
  };
}

function writeAcademyMetadata(htmlContent: string, metadata: AcademyMetadata) {
  const encoded = encodeURIComponent(JSON.stringify(metadata));
  const tag = `<meta name="${ACADEMY_METADATA_NAME}" content="${encoded}">`;
  const matcher = new RegExp(`<meta\\s+[^>]*name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i");
  if (matcher.test(htmlContent)) return htmlContent.replace(matcher, tag);
  if (/<head[^>]*>/i.test(htmlContent)) return htmlContent.replace(/<head([^>]*)>/i, `<head$1>${tag}`);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${tag}</head><body>${htmlContent}</body></html>`;
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

function statusLabel(status: AdminEbook["status"]) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Rascunho";
  return "Arquivado";
}

function setNativeValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
  const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function AcademyMaterialEditor({ editor, onClose }: { editor: Exclude<MaterialEditorState, null>; onClose: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const prepareEditor = () => {
      if (cancelled) return;
      const root = document.querySelector<HTMLElement>("[data-academy-material-adapter]");
      if (!root) return;

      if (editor.mode === "edit") {
        const labels = Array.from(root.querySelectorAll<HTMLElement>("aside button p"));
        const label = labels.find(item => item.textContent?.trim() === editor.title.trim());
        const button = label?.closest("button");
        if (button) {
          button.click();
          window.setTimeout(() => {
            if (!cancelled) setReady(true);
          }, 150);
          return;
        }
      } else {
        const form = root.querySelector<HTMLFormElement>("form");
        const courseInput = form?.querySelector<HTMLInputElement>('input[list="academy-course-options"]');
        const categoryInput = form?.querySelector<HTMLInputElement>('input[placeholder="Ex.: Iniciantes"]');
        const courseSection = courseInput?.closest("section");
        const levelSelect = courseSection?.querySelector<HTMLSelectElement>("select");
        if (courseInput && categoryInput && levelSelect) {
          setNativeValue(courseInput, editor.course.title);
          setNativeValue(categoryInput, editor.course.category);
          setNativeValue(levelSelect, editor.course.level);
          window.setTimeout(() => {
            if (!cancelled) setReady(true);
          }, 100);
          return;
        }
      }

      attempts += 1;
      if (attempts < 60) timer = window.setTimeout(prepareEditor, 100);
      else setReady(true);
    };

    timer = window.setTimeout(prepareEditor, 0);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [editor]);

  return (
    <div data-academy-material-adapter>
      <style>{`
        [data-academy-material-adapter] main > header { display: none !important; }
        [data-academy-material-adapter] main > section { display: block !important; }
        [data-academy-material-adapter] main > section > aside { display: none !important; }
        [data-academy-material-adapter] main > section > div {
          margin-left: auto !important;
          margin-right: auto !important;
          max-width: 64rem !important;
        }
        [data-academy-material-adapter] main > section > div > section:last-child { display: none !important; }
        [data-academy-material-adapter] form > section:nth-of-type(1),
        [data-academy-material-adapter] form > section:nth-of-type(2) { display: none !important; }
      `}</style>

      {!ready ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 px-5 py-4 text-sm text-zinc-300 shadow-2xl">
            <LoaderCircle className="size-4 animate-spin text-emerald-300" />
            {editor.mode === "edit" ? "Abrindo material para edição..." : "Preparando novo material..."}
          </div>
        </div>
      ) : null}

      <div className="fixed left-1/2 top-3 z-[105] w-[min(92vw,42rem)] -translate-x-1/2 rounded-xl border border-emerald-300/20 bg-zinc-950/95 px-4 py-3 text-center text-sm text-zinc-300 shadow-xl backdrop-blur">
        <span className="font-semibold text-white">{editor.mode === "edit" ? "Editar material" : "Adicionar material"}</span>
        <span className="mx-2 text-zinc-600">·</span>
        {editor.course.title}
      </div>

      <AdminEbooks />

      <button
        type="button"
        onClick={onClose}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-3 z-[110] inline-flex items-center gap-2 rounded-xl border border-white/15 bg-zinc-950/95 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur transition hover:border-emerald-300/50 hover:text-emerald-100 sm:left-5"
      >
        <ArrowLeft className="size-4" />
        Voltar para o curso
      </button>
    </div>
  );
}

export default function AdminAcademy() {
  const utils = trpc.useUtils();
  const ebooksQuery = trpc.admin.academy.list.useQuery();
  const storedCoursesQuery = trpc.admin.courses.useQuery();
  const createCourse = trpc.admin.createCourse.useMutation();
  const updateCourse = trpc.admin.updateCourse.useMutation();
  const updateMaterial = trpc.admin.academy.updateMaterial.useMutation();
  const updatePublication = trpc.admin.academy.updateCoursePublication.useMutation();

  const [courseEditor, setCourseEditor] = useState<CourseEditorState | null>(null);
  const [courseForm, setCourseForm] = useState<CourseForm>({ title: "", order: "", category: "Fundamentos", level: "fundamentos" });
  const [materialEditor, setMaterialEditor] = useState<MaterialEditorState>(null);

  const courses = useMemo<CourseView[]>(() => {
    const ebooks = (ebooksQuery.data ?? []) as AdminEbook[];
    const storedCourses = (storedCoursesQuery.data ?? []) as StoredCourse[];
    const groups = new Map<string, CourseView>();

    for (const ebook of ebooks) {
      const metadata = readAcademyMetadata(ebook.htmlContent, ebook.sourcePath);
      if (!metadata || (metadata.usage !== "course" && metadata.usage !== "both") || !metadata.courseTitle?.trim()) continue;
      const slug = metadata.courseSlug?.trim() || slugify(metadata.courseTitle);
      const current = groups.get(slug) ?? {
        key: `academy:${slug}`,
        id: null,
        slug,
        title: metadata.courseTitle.trim(),
        category: metadata.courseCategory?.trim() || "Academia",
        level: metadata.level === "pratica" || metadata.level === "avancado" ? metadata.level : "fundamentos",
        order: Number.isFinite(Number(metadata.courseOrder)) ? Math.max(0, Math.round(Number(metadata.courseOrder))) : 0,
        published: true,
        storedCourse: null,
        items: [],
      };
      if (metadata.coursePublished === false) current.published = false;
      current.items.push({ ebook, metadata });
      groups.set(slug, current);
    }

    const unmatchedGroups = new Set(groups.keys());
    const result: CourseView[] = [];

    for (const stored of storedCourses) {
      const titleKey = normalizedTitle(stored.title);
      const match = Array.from(groups.values()).find(group => normalizedTitle(group.title) === titleKey);
      if (match) {
        unmatchedGroups.delete(match.slug);
        result.push({
          ...match,
          key: `course:${stored.id}`,
          id: stored.id,
          title: stored.title,
          category: stored.category?.trim() || match.category,
          level: stored.level,
          order: readCourseOrder(stored.summary),
          storedCourse: stored,
          items: [...match.items].sort((a, b) => (a.metadata.lessonOrder ?? 0) - (b.metadata.lessonOrder ?? 0) || a.ebook.title.localeCompare(b.ebook.title, "pt-BR")),
        });
      } else {
        result.push({
          key: `course:${stored.id}`,
          id: stored.id,
          slug: slugify(stored.title),
          title: stored.title,
          category: stored.category?.trim() || "Academia",
          level: stored.level,
          order: readCourseOrder(stored.summary),
          published: false,
          storedCourse: stored,
          items: [],
        });
      }
    }

    for (const slug of unmatchedGroups) {
      const group = groups.get(slug);
      if (!group) continue;
      result.push({
        ...group,
        items: [...group.items].sort((a, b) => (a.metadata.lessonOrder ?? 0) - (b.metadata.lessonOrder ?? 0) || a.ebook.title.localeCompare(b.ebook.title, "pt-BR")),
      });
    }

    return result.sort((a, b) => {
      const orderA = a.order > 0 ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = b.order > 0 ? b.order : Number.MAX_SAFE_INTEGER;
      return orderA - orderB || a.title.localeCompare(b.title, "pt-BR");
    });
  }, [ebooksQuery.data, storedCoursesQuery.data]);

  const selectedCourse = useMemo(() => {
    if (!courseEditor || courseEditor.creating) return null;
    if (courseEditor.courseId !== null) return courses.find(course => course.id === courseEditor.courseId) ?? null;
    return courses.find(course => course.slug === courseEditor.slug) ?? null;
  }, [courseEditor, courses]);

  const openCourse = (course: CourseView) => {
    setCourseEditor({ courseId: course.id, slug: course.slug, originalTitle: course.title, creating: false });
    setCourseForm({
      title: course.title,
      order: course.order ? String(course.order) : "",
      category: course.category,
      level: course.level,
    });
  };

  const startNewCourse = () => {
    setCourseEditor({ courseId: null, slug: "", originalTitle: "", creating: true });
    setCourseForm({ title: "", order: "", category: "Fundamentos", level: "fundamentos" });
  };

  const closeCourse = () => {
    setCourseEditor(null);
    setCourseForm({ title: "", order: "", category: "Fundamentos", level: "fundamentos" });
  };

  const refreshAcademy = async () => {
    await Promise.all([
      utils.admin.courses.invalidate(),
      utils.admin.academy.list.invalidate(),
      utils.admin.overview.invalidate(),
      utils.member.academy.listCourses.invalidate(),
      utils.member.courses.invalidate(),
      utils.member.ebooks.invalidate(),
    ]);
  };

  async function syncCourseMaterials(course: CourseView | null, title: string, category: string, level: AcademyLevel, order: number) {
    if (!course?.items.length) return;
    const courseSlug = slugify(title);

    for (const { ebook, metadata } of course.items) {
      const htmlContent = writeAcademyMetadata(ebook.htmlContent ?? "", {
        ...metadata,
        courseTitle: title,
        courseSlug,
        courseCategory: category,
        courseOrder: order,
        level,
      });
      await updateMaterial.mutateAsync({
        id: ebook.id,
        sourceId: ebook.sourceId,
        sourceFile: ebook.sourceFile,
        sourcePath: ebook.sourcePath,
        title: ebook.title,
        summary: ebook.summary ?? null,
        htmlContent,
        status: ebook.status,
        pdfUpload: null,
      });
    }
  }

  async function saveCourse(event: FormEvent) {
    event.preventDefault();
    const title = courseForm.title.trim();
    const category = courseForm.category.trim();
    const order = courseForm.order.trim() ? Number(courseForm.order) : 0;
    if (title.length < 3) {
      toast.error("Informe o nome do curso.");
      return;
    }
    if (!category) {
      toast.error("Informe a categoria do curso.");
      return;
    }
    if (!Number.isInteger(order) || order < 0 || order > 999) {
      toast.error("Informe uma ordem válida para o curso.");
      return;
    }

    const sourceCourse = selectedCourse;
    const stored = sourceCourse?.storedCourse ?? null;
    const payload = {
      title,
      summary: writeCourseOrder(stored?.summary, order),
      category,
      durationMinutes: stored?.durationMinutes ?? 0,
      level: courseForm.level,
      ebookId: stored?.ebookId ?? null,
      isPublished: Boolean(stored?.isPublished),
    };

    try {
      let courseId = courseEditor?.courseId ?? null;
      if (courseId !== null) {
        await updateCourse.mutateAsync({ id: courseId, ...payload });
      } else {
        const created = await createCourse.mutateAsync({ ...payload, isPublished: false, ebookId: null });
        courseId = created.id;
      }

      await syncCourseMaterials(sourceCourse, title, category, courseForm.level, order);
      await refreshAcademy();
      setCourseEditor({ courseId, slug: slugify(title), originalTitle: title, creating: false });
      toast.success(courseEditor?.creating ? "Curso criado. Agora você pode adicionar materiais." : "Curso atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o curso.");
    }
  }

  async function toggleCoursePublication(course: CourseView) {
    if (!course.items.length) {
      toast.error("Adicione ao menos um material antes de publicar o curso.");
      return;
    }
    try {
      await updatePublication.mutateAsync({ courseSlug: course.slug, isPublished: !course.published });
      await refreshAcademy();
      toast.success(course.published ? "Curso ocultado da Academia." : "Curso publicado na Academia.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível alterar a publicação do curso.");
    }
  }

  if (materialEditor) {
    return <AcademyMaterialEditor editor={materialEditor} onClose={() => setMaterialEditor(null)} />;
  }

  const pendingSave = createCourse.isPending || updateCourse.isPending || updateMaterial.isPending;

  if (courseEditor) {
    const currentCourse = selectedCourse;
    const canAddMaterial = Boolean(currentCourse?.id);

    return (
      <DashboardLayout menuItems={adminMenu} title="Administração">
        <main className="mx-auto w-full max-w-5xl space-y-7 p-4 sm:p-8">
          <header className="space-y-4 border-b border-white/10 pb-6">
            <button type="button" onClick={closeCourse} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white">
              <ArrowLeft className="size-4" />
              Voltar para Academia
            </button>
            <div>
              <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Academia</span>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{courseEditor.creating ? "Novo Curso" : courseForm.title || "Editar curso"}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Primeiro salve as informações do curso. Depois, os materiais são adicionados e editados dentro dele.
              </p>
            </div>
          </header>

          <form onSubmit={saveCourse} className="space-y-5 border-b border-white/10 pb-7">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
              <label className="text-sm text-zinc-200">
                Nome do curso
                <input required value={courseForm.title} onChange={event => setCourseForm(current => ({ ...current, title: event.target.value }))} placeholder="Ex.: Engatinhando no MKT" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white" />
              </label>
              <label className="text-sm text-zinc-200">
                Ordem
                <input type="number" min={0} max={999} value={courseForm.order} onChange={event => setCourseForm(current => ({ ...current, order: event.target.value }))} placeholder="1" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-zinc-200">
                Categoria
                <input required value={courseForm.category} onChange={event => setCourseForm(current => ({ ...current, category: event.target.value }))} placeholder="Ex.: Fundamentos" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white" />
              </label>
              <label className="text-sm text-zinc-200">
                Nível
                <select value={courseForm.level} onChange={event => setCourseForm(current => ({ ...current, level: event.target.value as AcademyLevel }))} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white">
                  <option value="fundamentos">Fundamentos</option>
                  <option value="pratica">Prática</option>
                  <option value="avancado">Avançado</option>
                </select>
              </label>
            </div>

            <button disabled={pendingSave} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:opacity-60 sm:w-auto">
              {pendingSave ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              {pendingSave ? "Salvando..." : courseEditor.creating ? "Salvar Curso" : "Salvar alterações"}
            </button>
          </form>

          {!courseEditor.creating ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Materiais do curso</h2>
                  <p className="mt-1 text-sm text-zinc-400">{currentCourse?.items.length ?? 0} {(currentCourse?.items.length ?? 0) === 1 ? "material cadastrado" : "materiais cadastrados"}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {currentCourse?.items.length ? (
                    <button type="button" disabled={updatePublication.isPending} onClick={() => void toggleCoursePublication(currentCourse)} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${currentCourse.published ? "border-amber-300/30 text-amber-100 hover:bg-amber-300/10" : "border-emerald-300/30 text-emerald-100 hover:bg-emerald-300/10"}`}>
                      {currentCourse.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {currentCourse.published ? "Ocultar curso" : "Publicar curso"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={!canAddMaterial}
                    onClick={() => currentCourse && setMaterialEditor({ mode: "create", course: currentCourse })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <PlusCircle className="size-4" />
                    Adicionar Material
                  </button>
                </div>
              </div>

              {!canAddMaterial ? (
                <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-sm leading-6 text-amber-100/80">
                  Salve este curso antes de adicionar novos materiais.
                </p>
              ) : null}

              {currentCourse?.items.length ? (
                <div className="divide-y divide-white/10 border-y border-white/10">
                  {currentCourse.items.map(({ ebook, metadata }, index) => (
                    <button
                      type="button"
                      key={ebook.id}
                      onClick={() => setMaterialEditor({ mode: "edit", course: currentCourse, ebookId: ebook.id, title: ebook.title })}
                      className="flex w-full items-center gap-3 px-1 py-4 text-left transition hover:bg-white/[0.025] sm:px-3"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-xs font-semibold text-emerald-200">
                        {metadata.lessonOrder || index + 1}
                      </span>
                      <FileText className="size-4 shrink-0 text-zinc-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white [overflow-wrap:anywhere]">{ebook.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{statusLabel(ebook.status)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="border-y border-dashed border-white/15 py-8 text-center">
                  <FileText className="mx-auto size-7 text-zinc-600" />
                  <p className="mt-3 text-sm text-zinc-400">Este curso ainda não possui materiais.</p>
                  <p className="mt-1 text-xs text-zinc-600">Use “Adicionar Material” depois de salvar o curso.</p>
                </div>
              )}

              <div className="flex items-start gap-3 border-t border-white/10 pt-5 text-sm leading-6 text-zinc-400">
                <BookOpenCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                <p><span className="font-medium text-zinc-200">Publicação dos cursos:</span> o curso só é disponibilizado para membros quando possui materiais publicados e o controle acima estiver em “publicado”.</p>
              </div>
            </section>
          ) : null}
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-6xl space-y-7 p-4 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Academia</span>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Academia</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            Crie o curso primeiro e, depois de salvá-lo, abra o curso para adicionar e organizar os materiais em PDF.
          </p>
        </header>

        <section className="border-b border-white/10 pb-6">
          <button type="button" onClick={startNewCourse} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-200 sm:w-auto">
            <PlusCircle className="size-4" />
            Novo Curso
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-1 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Cursos cadastrados</h2>
              <p className="mt-1 text-sm text-zinc-400">Clique em um curso para editar as informações e gerenciar seus materiais.</p>
            </div>
            <span className="text-xs text-zinc-500">{courses.length} {courses.length === 1 ? "curso" : "cursos"}</span>
          </div>

          {ebooksQuery.isLoading || storedCoursesQuery.isLoading ? (
            <p className="flex items-center gap-2 py-8 text-sm text-zinc-400"><LoaderCircle className="size-4 animate-spin" />Carregando cursos...</p>
          ) : courses.length ? (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {courses.map(course => (
                <div key={course.key} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => openCourse(course)} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white [overflow-wrap:anywhere]">{course.title}</p>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400">{course.items.length} {course.items.length === 1 ? "material" : "materiais"}</span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                      {course.order ? `Ordem ${course.order} · ` : ""}{course.category} · {levelLabel[course.level]} · {course.items.length ? (course.published ? "Publicado" : "Oculto") : "Sem materiais"}
                    </p>
                  </button>
                  <button type="button" onClick={() => openCourse(course)} className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-emerald-300/40 hover:text-emerald-100">
                    Abrir curso
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-y border-dashed border-white/15 py-10 text-center">
              <BookOpenCheck className="mx-auto size-8 text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-400">Nenhum curso cadastrado ainda.</p>
              <p className="mt-1 text-xs text-zinc-600">Comece pelo botão “Novo Curso”.</p>
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
