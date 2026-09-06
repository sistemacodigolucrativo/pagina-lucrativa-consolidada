import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import ResponsiveEbookFrame from "@/components/ResponsiveEbookFrame";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpenCheck, CheckCircle2, GraduationCap, LayoutDashboard, LoaderCircle, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Visão geral", path: "/membros", group: "Navegação" },
  { icon: GraduationCap, label: "Academia de execução", path: "/membros/academia", group: "Crescimento" },
  { icon: BookOpenCheck, label: "E-books", path: "/membros/ebooks", group: "Crescimento" },
];

const levelLabel = { fundamentos: "Fundamentos", pratica: "Prática", avancado: "Avançado" } as const;

type CourseEbook = {
  id: number;
  title: string;
  summary?: string | null;
  htmlContent: string;
  pdfUrl?: string | null;
};

export default function MemberCourses() {
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const courses = trpc.member.courses.useQuery();
  const routeKey = location === "/membros/academia" ? null : location.replace(/^\/membros\/curso\//, "").replace(/^\/membros\//, "");
  const currentCourse = trpc.member.course.useQuery({ routeKey: routeKey || "curso" }, { enabled: Boolean(routeKey) });
  const [activeEbookId, setActiveEbookId] = useState<number | null>(null);
  const updateProgress = trpc.member.updateCourseProgress.useMutation({
    onSuccess: () => {
      void utils.member.courses.invalidate();
      void utils.member.academy.invalidate();
      void utils.member.course.invalidate();
      toast.success("Progresso atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  const course = currentCourse.data as (typeof currentCourse.data & { ebooks?: CourseEbook[]; ebookCount?: number }) | null | undefined;
  const courseEbooks = useMemo(() => {
    if (!course) return [] as CourseEbook[];
    if (Array.isArray(course.ebooks) && course.ebooks.length) return course.ebooks;
    return course.ebook ? [course.ebook as CourseEbook] : [];
  }, [course]);
  const courseEbookKey = courseEbooks.map(ebook => ebook.id).join(",");
  const activeEbook = courseEbooks.find(ebook => ebook.id === activeEbookId) ?? courseEbooks[0] ?? null;

  useEffect(() => {
    if (!routeKey || !courseEbooks.length) return;
    if (!activeEbook || !courseEbooks.some(ebook => ebook.id === activeEbook.id)) {
      setActiveEbookId(courseEbooks[0].id);
    }
  }, [activeEbook, courseEbookKey, courseEbooks, routeKey]);

  if (routeKey) {
    return (
      <DashboardLayout menuItems={menu} title="Escritório Virtual">
        <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-8">
          <button type="button" onClick={() => setLocation("/membros/academia")} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200 transition hover:text-emerald-100">
            <ArrowLeft className="size-4" />Voltar para a Academia de execução
          </button>
          {currentCourse.isLoading ? (
            <section className="flex min-h-96 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/60 text-sm text-zinc-400">
              <LoaderCircle className="size-4 animate-spin text-emerald-300" />Abrindo material de estudo...
            </section>
          ) : course ? (
            <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60">
              <header className="border-b border-white/10 p-4 sm:p-6">
                <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">{course.category || "Academia de execução"} · {levelLabel[course.level]}</span>
                <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{course.title}</h1>
                {course.summary && <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">{course.summary}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-zinc-400">Progresso: <strong className="text-emerald-200">{course.progressPercent}%</strong></span>
                  <span className="text-sm text-zinc-500">{courseEbooks.length} {courseEbooks.length === 1 ? "material" : "materiais"}</span>
                  <button type="button" disabled={updateProgress.isPending || course.progressPercent >= 100} onClick={() => updateProgress.mutate({ courseId: course.id, progressPercent: Math.min(100, course.progressPercent + 20) })} className="rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50">{course.progressPercent >= 100 ? "Concluído" : "Registrar avanço"}</button>
                  <button type="button" disabled={updateProgress.isPending || course.progressPercent === 100} onClick={() => updateProgress.mutate({ courseId: course.id, progressPercent: 100 })} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"><CheckCircle2 className="size-4" />Concluir leitura</button>
                </div>
              </header>
              {courseEbooks.length > 1 ? (
                <nav className="flex gap-2 overflow-x-auto border-b border-white/10 bg-black/20 p-3" aria-label="Materiais do curso">
                  {courseEbooks.map((ebook, index) => (
                    <button
                      key={ebook.id}
                      type="button"
                      onClick={() => setActiveEbookId(ebook.id)}
                      className={`shrink-0 rounded-lg border px-3 py-2 text-left text-sm transition ${activeEbook?.id === ebook.id ? "border-emerald-300/70 bg-emerald-300/15 text-emerald-100" : "border-white/10 bg-white/5 text-zinc-300 hover:border-emerald-300/40"}`}
                    >
                      <span className="block text-xs text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
                      <span className="block max-w-56 truncate">{ebook.title}</span>
                    </button>
                  ))}
                </nav>
              ) : null}
              <div className="min-w-0 bg-black/20 p-2 sm:p-4">
                {activeEbook ? (
                  <ResponsiveEbookFrame title={`Leitor de ${activeEbook.title}`} htmlContent={activeEbook.htmlContent} pdfUrl={activeEbook.pdfUrl ?? null} />
                ) : (
                  <section className="rounded-xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-300">Nenhum PDF publicado para este curso.</section>
                )}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-emerald-300/30 bg-emerald-300/5 p-6">
              <h1 className="text-xl font-semibold text-white">Material indisponível</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-300">Este curso não está publicado ou não possui um e-book disponível no momento. Volte à Academia para escolher outro material.</p>
            </section>
          )}
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menu} title="Escritório Virtual">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Academia de execução</span>
          <h1 className="text-3xl font-semibold text-white">Aprenda e aplique</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Selecione um curso publicado para estudar no leitor integrado e registrar seu progresso individual no Escritório Virtual.</p>
        </header>
        {courses.isLoading ? <p className="text-sm text-zinc-400">Carregando cursos...</p> : courses.data?.length ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {courses.data.map(course => (
              <article key={course.id} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-200">{course.category || "Formação"} · {levelLabel[course.level]}</span>
                    <h2 className="mt-2 text-xl font-semibold text-white">{course.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{course.summary || "Material de estudo disponível na Academia."}</p>
                  </div>
                  <GraduationCap className="size-6 shrink-0 text-emerald-300" />
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between text-sm"><span className="text-zinc-400">Progresso individual</span><strong className="text-emerald-200">{course.progressPercent}%</strong></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${course.progressPercent}%` }} /></div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setLocation(`/membros/curso/${course.routeKey}`)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-black"><PlayCircle className="size-4" />Abrir material de execução</button>
                    <button type="button" disabled={updateProgress.isPending || course.progressPercent >= 100} onClick={() => updateProgress.mutate({ courseId: course.id, progressPercent: Math.min(100, course.progressPercent + 20) })} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50">{course.progressPercent >= 100 ? "Concluído" : "Avançar 20%"}</button>
                    <span className="ml-auto text-xs text-zinc-500">{"ebookCount" in course && course.ebookCount ? `${course.ebookCount} materiais` : course.durationMinutes ? `${course.durationMinutes} min` : "Duração a definir"}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : <section className="rounded-2xl border border-dashed border-white/15 bg-zinc-950/40 p-7 text-sm leading-6 text-zinc-300">Nenhum curso com material publicado está disponível no momento. A administração pode vincular e publicar novos conteúdos pela Academia de execução.</section>}
      </main>
    </DashboardLayout>
  );
}
