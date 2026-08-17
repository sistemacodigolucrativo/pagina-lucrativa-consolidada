import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BookOpenCheck, CheckCircle2, GraduationCap, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: GraduationCap, label: "Academia", path: "/membros/academia", group: "Crescimento" },
  { icon: BookOpenCheck, label: "Biblioteca de e-books", path: "/membros/ebooks", group: "Crescimento" },
];

const levelLabel = { fundamentos: "Fundamentos", pratica: "Prática", avancado: "Avançado" } as const;

export default function MemberCourses() {
  const utils = trpc.useUtils();
  const courses = trpc.member.courses.useQuery();
  const updateProgress = trpc.member.updateCourseProgress.useMutation({
    onSuccess: () => { void utils.member.courses.invalidate(); void utils.member.academy.invalidate(); toast.success("Progresso atualizado."); },
    onError: error => toast.error(error.message),
  });
  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Área de estudo</span><h1 className="text-3xl font-semibold text-white">Academia Página Lucrativa</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Escolha um curso publicado pela administração e registre o avanço da sua aprendizagem. O progresso é individual e fica salvo no seu Escritório Virtual.</p></header>{courses.isLoading ? <p className="text-sm text-zinc-400">Carregando cursos...</p> : courses.data?.length ? <section className="grid gap-4 lg:grid-cols-2">{courses.data.map(course => <article key={course.id} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-start justify-between gap-3"><div><span className="text-xs uppercase tracking-wider text-amber-200">{course.category || "Formação"} · {levelLabel[course.level]}</span><h2 className="mt-2 text-xl font-semibold text-white">{course.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-300">{course.summary || "Conteúdo em organização pela equipe."}</p></div><GraduationCap className="size-6 shrink-0 text-amber-300" /></div><div className="mt-5 border-t border-white/10 pt-4"><div className="flex items-center justify-between text-sm"><span className="text-zinc-400">Progresso individual</span><strong className="text-amber-200">{course.progressPercent}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${course.progressPercent}%` }} /></div><div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" disabled={updateProgress.isPending || course.progressPercent >= 100} onClick={() => updateProgress.mutate({ courseId: course.id, progressPercent: Math.min(100, course.progressPercent + 20) })} className="rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50">{course.progressPercent >= 100 ? "Concluído" : "Avançar 20%"}</button><button type="button" disabled={updateProgress.isPending || course.progressPercent === 100} onClick={() => updateProgress.mutate({ courseId: course.id, progressPercent: 100 })} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"><CheckCircle2 className="size-4" />Marcar concluído</button><span className="ml-auto text-xs text-zinc-500">{course.durationMinutes ? `${course.durationMinutes} min` : "Duração a definir"}</span></div></div></article>)}</section> : <section className="rounded-2xl border border-dashed border-white/15 bg-zinc-950/40 p-7 text-sm leading-6 text-zinc-300">Nenhum curso está publicado no momento. A administração pode organizar e liberar novos conteúdos pela Academia.</section>}</main></DashboardLayout>;
}
