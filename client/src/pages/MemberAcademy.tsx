import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import ResponsiveEbookFrame from "@/components/ResponsiveEbookFrame";
import { trpc } from "@/lib/trpc";
import { getAcademyLevelLabel } from "@shared/academy";
import { ArrowLeft, BookOpenCheck, CheckCircle2, GraduationCap, LayoutDashboard, LoaderCircle, PlayCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Visão geral", path: "/membros", group: "Navegação" },
  { icon: GraduationCap, label: "Academia de execução", path: "/membros/academia", group: "Crescimento" },
  { icon: BookOpenCheck, label: "E-books", path: "/membros/ebooks", group: "Crescimento" },
];

function formatCount(value: number | null | undefined, singular: string, plural: string) {
  const count = Math.max(0, value ?? 0);
  return `${count} ${count === 1 ? singular : plural}`;
}

function EmptyAcademyState() {
  return <section className="rounded-2xl border border-dashed border-white/15 bg-zinc-950/40 p-7 text-sm leading-6 text-zinc-300">Nenhum curso disponível no momento.</section>;
}

function AcademyErrorState() {
  return <section className="rounded-2xl border border-red-300/30 bg-red-500/10 p-6 text-sm leading-6 text-red-100">Não foi possível carregar a Academia. Atualize a página para tentar novamente.</section>;
}

export default function MemberAcademy() {
  const [location, setLocation] = useLocation();
  const routeKey = location === "/membros/academia" ? null : location.replace(/^\/membros\/curso\//, "").replace(/^\/membros\//, "");
  const utils = trpc.useUtils();
  const courses = trpc.member.academy.listCourses.useQuery(undefined, { enabled: !routeKey });
  const currentCourse = trpc.member.academy.courseByRouteKey.useQuery({ routeKey: routeKey || "curso" }, { enabled: Boolean(routeKey) });
  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);
  const activeMaterial = useMemo(() => {
    const course = currentCourse.data;
    if (!course?.materials.length) return null;
    return course.materials.find(material => material.id === activeMaterialId) ?? course.materials[0];
  }, [activeMaterialId, currentCourse.data]);
  const updateProgress = trpc.member.academy.updateProgress.useMutation({
    onSuccess: () => {
      void utils.member.academy.listCourses.invalidate();
      void utils.member.courses.invalidate();
      void utils.member.academy.courseByRouteKey.invalidate();
      toast.success("Progresso atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  if (routeKey) {
    const course = currentCourse.data;
    const progressPercent = Math.max(0, course?.progressPercent ?? 0);
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
          ) : currentCourse.isError ? <AcademyErrorState /> : course && activeMaterial ? (
            <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60">
              <header className="border-b border-white/10 p-4 sm:p-6">
                <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">{course.category || "Academia"} · {getAcademyLevelLabel(course.level)}</span>
                <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{course.title}</h1>
                {course.summary ? <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">{course.summary}</p> : null}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-zinc-400">Progresso: <strong className="text-emerald-200">{progressPercent}%</strong></span>
                  <span className="text-sm text-zinc-500">{formatCount(course.materialCount, "material", "materiais")}</span>
                  <button type="button" disabled={updateProgress.isPending || progressPercent >= 100} onClick={() => updateProgress.mutate({ courseId: course.id, progressPercent: Math.min(100, progressPercent + 20) })} className="rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50">{progressPercent >= 100 ? "Concluído" : "Registrar avanço"}</button>
                  <button type="button" disabled={updateProgress.isPending || progressPercent === 100} onClick={() => updateProgress.mutate({ courseId: course.id, progressPercent: 100 })} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"><CheckCircle2 className="size-4" />Concluir leitura</button>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Materiais do curso">
                  {course.materials.map(material => (
                    <button key={material.id} type="button" onClick={() => setActiveMaterialId(material.id)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${activeMaterial.id === material.id ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-black/20 text-zinc-400"}`}>
                      Aula {material.metadata.lessonOrder || 0} · {material.title}
                    </button>
                  ))}
                </div>
              </header>
              <div className="min-w-0 bg-black/20 p-2 sm:p-4">
                <ResponsiveEbookFrame title={`Leitor de ${activeMaterial.title}`} htmlContent={activeMaterial.htmlContent} pdfUrl={activeMaterial.pdfUrl ?? null} />
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-emerald-300/30 bg-emerald-300/5 p-6">
              <h1 className="text-xl font-semibold text-white">Material indisponível</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-300">Este curso não está publicado ou não possui material disponível no momento. Volte à Academia para escolher outro conteúdo.</p>
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
        {courses.isLoading ? <p className="text-sm text-zinc-400">Carregando cursos...</p> : courses.isError ? <AcademyErrorState /> : courses.data?.length ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {courses.data.map(course => (
              <article key={course.id} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-emerald-200">{course.category || "Academia"} · {getAcademyLevelLabel(course.level)}</span>
                    <h2 className="mt-2 text-xl font-semibold text-white">{course.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{course.summary || "Material de estudo disponível na Academia."}</p>
                    <p className="mt-3 text-xs text-zinc-500">{formatCount(course.materialCount, "material", "materiais")} · Progresso {course.progressPercent ?? 0}%</p>
                  </div>
                  <GraduationCap className="size-6 shrink-0 text-emerald-300" />
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${course.progressPercent ?? 0}%` }} /></div>
                  <button type="button" onClick={() => setLocation(`/membros/curso/${course.routeKey}`)} className="mt-4 inline-flex items-center gap-1 rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-black"><PlayCircle className="size-4" />Abrir curso</button>
                </div>
              </article>
            ))}
          </section>
        ) : <EmptyAcademyState />}
      </main>
    </DashboardLayout>
  );
}
