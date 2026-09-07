import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpenCheck, Eye, EyeOff, FileText, LoaderCircle, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminEbooks from "./AdminEbooks";

const ACADEMY_METADATA_NAME = "codigo-lucrativo-academy";

type AcademyMetadata = {
  usage?: "library" | "course" | "both";
  courseTitle?: string;
  courseSlug?: string;
  courseCategory?: string;
  lessonOrder?: number;
  level?: "fundamentos" | "pratica" | "avancado";
  coursePublished?: boolean;
};

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; ebookId: number; title: string }
  | null;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "curso";
}

function readAcademyMetadata(htmlContent?: string | null, sourcePath?: string | null): AcademyMetadata | null {
  const tag = htmlContent?.match(new RegExp(`<meta\\s+[^>]*name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i"))?.[0];
  const encoded = tag?.match(/\scontent=["']([^"']+)["']/i)?.[1];
  if (encoded) {
    try {
      const parsed = JSON.parse(decodeURIComponent(encoded)) as AcademyMetadata;
      if (parsed && typeof parsed === "object") return parsed;
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

function statusLabel(status: string) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Rascunho";
  return "Arquivado";
}

function AcademyEditorAdapter({ editor, onClose }: { editor: Exclude<EditorState, null>; onClose: () => void }) {
  const [targetSelected, setTargetSelected] = useState(editor.mode === "create");

  useEffect(() => {
    if (editor.mode !== "edit") return;

    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const selectExistingMaterial = () => {
      if (cancelled) return;
      const labels = Array.from(document.querySelectorAll<HTMLElement>("[data-academy-editor-adapter] button p"));
      const label = labels.find(item => item.textContent?.trim() === editor.title.trim());
      const button = label?.closest("button");
      if (button) {
        button.click();
        window.setTimeout(() => {
          if (!cancelled) setTargetSelected(true);
        }, 120);
        return;
      }

      attempts += 1;
      if (attempts < 50) timer = window.setTimeout(selectExistingMaterial, 100);
      else setTargetSelected(true);
    };

    timer = window.setTimeout(selectExistingMaterial, 0);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [editor]);

  return (
    <div data-academy-editor-adapter>
      <style>{`
        [data-academy-editor-adapter] main > section {
          display: block !important;
        }
        [data-academy-editor-adapter] main > section > aside {
          display: none !important;
        }
        [data-academy-editor-adapter] main > section > div {
          margin-left: auto !important;
          margin-right: auto !important;
          max-width: 64rem !important;
        }
        [data-academy-editor-adapter] main > section > div > section:last-child {
          display: none !important;
        }
      `}</style>

      {!targetSelected ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 px-5 py-4 text-sm text-zinc-300 shadow-2xl">
            <LoaderCircle className="size-4 animate-spin text-emerald-300" />
            Abrindo material para edição...
          </div>
        </div>
      ) : null}

      <AdminEbooks />

      <button
        type="button"
        onClick={onClose}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-3 z-[110] inline-flex items-center gap-2 rounded-xl border border-white/15 bg-zinc-950/95 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur transition hover:border-emerald-300/50 hover:text-emerald-100 sm:left-5"
      >
        <ArrowLeft className="size-4" />
        Voltar para materiais
      </button>
    </div>
  );
}

export default function AdminAcademy() {
  const utils = trpc.useUtils();
  const ebooks = trpc.admin.academy.list.useQuery();
  const [editor, setEditor] = useState<EditorState>(null);

  const updatePublication = trpc.admin.academy.updateCoursePublication.useMutation({
    onSuccess: async result => {
      await Promise.all([
        utils.admin.academy.list.invalidate(),
        utils.admin.overview.invalidate(),
        utils.member.academy.listCourses.invalidate(),
        utils.member.courses.invalidate(),
      ]);
      toast.success(result.isPublished ? "Curso publicado na Academia." : "Curso ocultado da Academia.");
    },
    onError: error => toast.error(error.message),
  });

  const { courses, ungroupedMaterials, materialCount } = useMemo(() => {
    const groups = new Map<
      string,
      {
        slug: string;
        title: string;
        category: string;
        published: boolean;
        items: Array<{
          ebook: NonNullable<typeof ebooks.data>[number];
          metadata: AcademyMetadata;
        }>;
      }
    >();
    const ungrouped: Array<NonNullable<typeof ebooks.data>[number]> = [];
    let academyMaterialCount = 0;

    for (const ebook of ebooks.data ?? []) {
      const metadata = readAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent, ebook.sourcePath);
      if (!metadata || (metadata.usage !== "course" && metadata.usage !== "both")) continue;
      academyMaterialCount += 1;

      const courseTitle = metadata.courseTitle?.trim();
      if (!courseTitle) {
        ungrouped.push(ebook);
        continue;
      }

      const slug = metadata.courseSlug?.trim() || slugify(courseTitle);
      const current = groups.get(slug) ?? {
        slug,
        title: courseTitle,
        category: metadata.courseCategory?.trim() || "Academia",
        published: true,
        items: [],
      };
      if (metadata.coursePublished === false) current.published = false;
      current.items.push({ ebook, metadata });
      groups.set(slug, current);
    }

    const sortedCourses = Array.from(groups.values())
      .map(course => ({
        ...course,
        items: course.items.sort(
          (a, b) =>
            (a.metadata.lessonOrder ?? 0) - (b.metadata.lessonOrder ?? 0) ||
            a.ebook.title.localeCompare(b.ebook.title, "pt-BR"),
        ),
      }))
      .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

    return {
      courses: sortedCourses,
      ungroupedMaterials: ungrouped.sort((a, b) => a.title.localeCompare(b.title, "pt-BR")),
      materialCount: academyMaterialCount,
    };
  }, [ebooks.data]);

  if (editor) return <AcademyEditorAdapter editor={editor} onClose={() => setEditor(null)} />;

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-6xl space-y-7 p-4 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Academia</span>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Academia</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            Publique cursos em PDF, organize os materiais em sequência e entregue tudo no leitor da Academia.
          </p>
        </header>

        <section className="space-y-3 border-b border-white/10 pb-6">
          <button
            type="button"
            onClick={() => setEditor({ mode: "create" })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-200 sm:w-auto"
          >
            <PlusCircle className="size-4" />
            Novo Material
          </button>
          <p className="text-xs leading-5 text-zinc-500">
            O formulário de cadastro abre somente quando necessário. Os cursos e materiais existentes permanecem organizados abaixo.
          </p>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Cursos e materiais cadastrados</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {materialCount} {materialCount === 1 ? "material" : "materiais"} em {courses.length} {courses.length === 1 ? "curso" : "cursos"}.
              </p>
            </div>
            <span className="text-xs text-zinc-500">Publicação dos cursos</span>
          </div>

          {ebooks.isLoading ? (
            <div className="flex items-center gap-2 border-b border-white/10 py-5 text-sm text-zinc-400">
              <LoaderCircle className="size-4 animate-spin text-emerald-300" />
              Carregando cursos e materiais...
            </div>
          ) : courses.length || ungroupedMaterials.length ? (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {courses.map(course => (
                <section key={course.slug} className="py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <BookOpenCheck className="size-4 shrink-0 text-emerald-300" />
                        <h3 className="break-words text-base font-semibold text-white">{course.title}</h3>
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400">
                          {course.items.length} {course.items.length === 1 ? "PDF" : "PDFs"}
                        </span>
                      </div>
                      <p className="mt-1 pl-6 text-xs uppercase tracking-wider text-emerald-200">{course.category}</p>
                    </div>

                    <button
                      type="button"
                      disabled={updatePublication.isPending}
                      onClick={() => updatePublication.mutate({ courseSlug: course.slug, isPublished: !course.published })}
                      className={`inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 sm:w-auto ${
                        course.published
                          ? "border-amber-300/30 text-amber-100 hover:bg-amber-300/10"
                          : "border-emerald-300/30 text-emerald-100 hover:bg-emerald-300/10"
                      }`}
                    >
                      {course.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      {course.published ? "Ocultar curso" : "Publicar curso"}
                    </button>
                  </div>

                  <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
                    {course.items.map(({ ebook, metadata }, index) => {
                      const position = metadata.lessonOrder || index + 1;
                      return (
                        <button
                          type="button"
                          key={ebook.id}
                          onClick={() => setEditor({ mode: "edit", ebookId: ebook.id, title: ebook.title })}
                          className="group flex w-full items-center gap-3 px-1 py-3 text-left transition hover:bg-white/[0.03] sm:px-3"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/5 text-xs font-semibold text-emerald-200">
                            {position}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-white transition group-hover:text-emerald-100">{ebook.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                              {statusLabel(ebook.status)} · {metadata.level === "avancado" ? "Avançado" : metadata.level === "pratica" ? "Prática" : "Fundamentos"}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-emerald-200">Editar</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}

              {ungroupedMaterials.length ? (
                <section className="py-5">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-amber-100">Materiais sem curso definido</h3>
                    <p className="mt-1 text-xs leading-5 text-amber-100/70">Complete o vínculo do curso para liberar a entrega correta na Academia.</p>
                  </div>
                  <div className="divide-y divide-white/10 border-y border-amber-300/20">
                    {ungroupedMaterials.map(ebook => (
                      <button
                        type="button"
                        key={ebook.id}
                        onClick={() => setEditor({ mode: "edit", ebookId: ebook.id, title: ebook.title })}
                        className="group flex w-full items-center gap-3 px-1 py-3 text-left transition hover:bg-amber-300/[0.04] sm:px-3"
                      >
                        <FileText className="size-4 shrink-0 text-amber-200" />
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-medium text-white">{ebook.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-wider text-amber-100/60">{statusLabel(ebook.status)} · curso não definido</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-amber-100">Editar</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="border-y border-dashed border-white/15 py-8 text-center">
              <BookOpenCheck className="mx-auto size-7 text-emerald-300" />
              <h3 className="mt-3 text-base font-semibold text-white">Nenhum material cadastrado na Academia</h3>
              <p className="mt-2 text-sm text-zinc-400">Use “Novo Material” para cadastrar o primeiro PDF.</p>
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
