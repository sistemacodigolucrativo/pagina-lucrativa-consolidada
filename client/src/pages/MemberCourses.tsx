import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import ResponsiveEbookFrame, { type EbookReaderProgress } from "@/components/ResponsiveEbookFrame";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpenCheck, GraduationCap, LayoutDashboard, LoaderCircle, PlayCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const courses = trpc.member.academy.listCourses.useQuery();
  const routeKey = location === "/membros/academia" ? null : location.replace(/^\/membros\/curso\//, "").replace(/^\/membros\//, "");
  const currentCourse = trpc.member.academy.courseByRouteKey.useQuery({ routeKey: routeKey || "curso" }, { enabled: Boolean(routeKey) });
  const [activeEbookId, setActiveEbookId] = useState<number | null>(null);
  const lastPersistedProgressRef = useRef("");

  const course = currentCourse.data as (typeof currentCourse.data & { ebooks?: CourseEbook[]; ebookCount?: number }) | null | undefined;
  const courseEbooks = useMemo(() => {
    if (!course) return [] as CourseEbook[];
    if (Array.isArray(course.ebooks) && course.ebooks.length) return course.ebooks;
    return course.ebook ? [course.ebook as CourseEbook] : [];
  }, [course]);
  const courseEbookKey = courseEbooks.map(ebook => ebook.id).join(",");
  const activeEbook = courseEbooks.find(ebook => ebook.id === activeEbookId) ?? courseEbooks[0] ?? null;

  const readingProgress = trpc.member.ebookReadingProgress.useQuery(
    { ebookId: activeEbook?.id ?? 0 },
    { enabled: Boolean(activeEbook?.id) },
  );
  const updateReadingProgress = trpc.member.updateEbookReadingProgress.useMutation({
    onSuccess: () => {
      void utils.member.ebookReadingHistory.invalidate();
      if (activeEbook?.id) void utils.member.ebookReadingProgress.invalidate({ ebookId: activeEbook.id });
      void utils.member.academy.listCourses.invalidate();
      void utils.member.academy.courseByRouteKey.invalidate();
      void utils.member.courses.invalidate();
      void utils.member.course.invalidate();
    },
  });

  const handleReadingProgress = useCallback((progress: EbookReaderProgress) => {
    if (!activeEbook?.id) return;
    const key = `${activeEbook.id}:${progress.currentPage}:${progress.totalPages}`;
    if (lastPersistedProgressRef.current === key) return;
    lastPersistedProgressRef.current = key;
    updateReadingProgress.mutate({
      ebookId: activeEbook.id,
      currentPage: progress.currentPage,
      totalPages: progress.totalPages,
    });
  }, [activeEbook?.id, updateReadingProgress]);

  useEffect(() => {
    if (!routeKey || !courseEbooks.length) return;
    if (!activeEbook || !courseEbooks.some(ebook => ebook.id === activeEbook.id)) {
      setActiveEbookId(courseEbooks[0].id);
    }
  }, [activeEbook, courseEbookKey, courseEbooks, routeKey]);

  useEffect(() => {
    lastPersistedProgressRef.current = "";
  }, [activeEbook?.id]);

  if (routeKey) {
    return (
      <DashboardLayout menuItems={menu} title="Escritório Virtual">
        <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-8">
          <button type="button" onClick={() => setLocation("/membros/academia")} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-300/40 hover:text-emerald-100">
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
                <h1 className="mt-2 text-2xl font-semibold text-white [overflow-wrap:anywhere] sm:text-3xl">{course.title}</h1>
                {course.summary && <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">{course.summary}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-zinc-400">Progresso do curso: <strong className="text-emerald-200">{course.progressPercent}%</strong></span>
                  <span className="text-sm text-zinc-500">{courseEbooks.length} {courseEbooks.length === 1 ? "material" : "materiais"}</span>
                  <span className="text-xs text-zinc-500">Calculado automaticamente a partir da leitura dos materiais.</span>
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
                  <ResponsiveEbookFrame
                    title={`Leitor de ${activeEbook.title}`}
                    htmlContent={activeEbook.htmlContent}
                    pdfUrl={activeEbook.pdfUrl ?? null}
                    initialPage={readingProgress.data?.currentPage ?? 1}
                    onProgressChange={handleReadingProgress}
                  />
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
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:space-y-7 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Academia de execução</span>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Aprenda e aplique</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Selecione um curso publicado. O progresso é calculado automaticamente conforme você avança pelas páginas de cada material.</p>
        </header>
        {courses.isLoading ? <p className="text-sm text-zinc-400">Carregando cursos...</p> : courses.isError ? (
          <section className="rounded-2xl border border-red-300/25 bg-red-300/5 p-5 text-sm leading-6 text-red-100 sm:p-7">
            Não foi possível carregar a Academia agora. Erro: {courses.error.message}
          </section>
        ) : courses.data?.length ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {courses.data.map(course => (
              <article key={course.id} className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-emerald-200">{course.category || "Formação"} · {levelLabel[course.level]}</span>
                    <h2 className="mt-2 text-xl font-semibold text-white [overflow-wrap:anywhere]">{course.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">{course.summary || "Material de estudo disponível na Academia."}</p>
                  </div>
                  <GraduationCap className="size-6 shrink-0 text-emerald-300" />
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between text-sm"><span className="text-zinc-400">Progresso individual</span><strong className="text-emerald-200">{course.progressPercent}%</strong></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${course.progressPercent}%` }} /></div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setLocation(`/membros/curso/${course.routeKey}`)} className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-black sm:w-auto"><PlayCircle className="size-4" />Abrir material de execução</button>
                    <span className="text-xs text-zinc-500 sm:ml-auto">{"ebookCount" in course && course.ebookCount ? `${course.ebookCount} materiais` : course.durationMinutes ? `${course.durationMinutes} min` : "Duração a definir"}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : <section className="rounded-2xl border border-dashed border-white/15 bg-zinc-950/40 p-5 text-sm leading-6 text-zinc-300 sm:p-7">Nenhum curso publicado está disponível no momento. Para aparecer aqui, o curso precisa estar como Publicado e ter pelo menos um PDF vinculado.</section>}
      </main>
    </DashboardLayout>
  );
}
