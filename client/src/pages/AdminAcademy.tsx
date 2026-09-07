import AdminEbooks from "./AdminEbooks";
import { trpc } from "@/lib/trpc";
import { BookOpenCheck, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

const ACADEMY_METADATA_NAME = "codigo-lucrativo-academy";

type AcademyMetadata = {
  usage?: "library" | "course" | "both";
  courseTitle?: string;
  courseSlug?: string;
  coursePublished?: boolean;
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
    try { return decodeURIComponent(sourcePath ?? ""); } catch { return sourcePath ?? ""; }
  })();
  const courseSlug = decodedPath.match(/(?:^|\/)ebooks\/cursos\/([^\/?#]+)/i)?.[1];
  if (!courseSlug) return null;
  const normalized = slugify(courseSlug);
  return { usage: "course", courseSlug: normalized, courseTitle: normalized.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" "), coursePublished: true };
}

function AcademyCoursePublicationDock() {
  const utils = trpc.useUtils();
  const ebooks = trpc.admin.academy.list.useQuery();
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

  const courses = useMemo(() => {
    const groups = new Map<string, { slug: string; title: string; materialCount: number; published: boolean }>();
    for (const ebook of ebooks.data ?? []) {
      const metadata = readAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent, ebook.sourcePath);
      if (!metadata || (metadata.usage !== "course" && metadata.usage !== "both") || !metadata.courseTitle) continue;
      const slug = metadata.courseSlug?.trim() || slugify(metadata.courseTitle);
      const current = groups.get(slug) ?? { slug, title: metadata.courseTitle, materialCount: 0, published: true };
      current.materialCount += 1;
      if (metadata.coursePublished === false) current.published = false;
      groups.set(slug, current);
    }
    return Array.from(groups.values()).sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
  }, [ebooks.data]);

  return (
    <aside className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-3 z-[90] w-[min(92vw,24rem)] rounded-2xl border border-emerald-300/25 bg-zinc-950/95 shadow-2xl backdrop-blur sm:right-5">
      <details>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white">
          <span className="inline-flex items-center gap-2"><BookOpenCheck className="size-4 text-emerald-300" />Publicação dos cursos</span>
          <span className="rounded-full bg-emerald-300/10 px-2 py-0.5 text-xs text-emerald-200">{courses.filter(course => course.published).length}/{courses.length}</span>
        </summary>
        <div className="max-h-[55dvh] space-y-2 overflow-y-auto border-t border-white/10 p-3">
          <p className="px-1 text-xs leading-5 text-zinc-400">O status abaixo controla o curso inteiro. Os PDFs continuam com seus próprios estados de rascunho/publicação.</p>
          {ebooks.isLoading ? <p className="flex items-center gap-2 rounded-xl border border-white/10 p-3 text-xs text-zinc-400"><LoaderCircle className="size-4 animate-spin" />Carregando cursos...</p> : courses.length ? courses.map(course => (
            <article key={course.slug} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="break-words text-sm font-medium text-white">{course.title}</p><p className="mt-1 text-xs text-zinc-500">{course.materialCount} {course.materialCount === 1 ? "material" : "materiais"} · {course.published ? "curso publicado" : "curso oculto"}</p></div>
                <button
                  type="button"
                  disabled={updatePublication.isPending}
                  onClick={() => updatePublication.mutate({ courseSlug: course.slug, isPublished: !course.published })}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${course.published ? "border-amber-300/30 text-amber-100 hover:bg-amber-300/10" : "border-emerald-300/30 text-emerald-100 hover:bg-emerald-300/10"}`}
                >
                  {course.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {course.published ? "Ocultar" : "Publicar"}
                </button>
              </div>
            </article>
          )) : <p className="rounded-xl border border-dashed border-white/15 p-3 text-xs leading-5 text-zinc-400">Nenhum curso agrupado foi encontrado.</p>}
        </div>
      </details>
    </aside>
  );
}

export default function AdminAcademy() {
  return <><AdminEbooks /><AcademyCoursePublicationDock /></>;
}
