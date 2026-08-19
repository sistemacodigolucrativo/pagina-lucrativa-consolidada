import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Award, ChartNoAxesCombined, History, Trophy } from "lucide-react";

const menu: DashboardMenuItem[] = [
  { icon: ChartNoAxesCombined, label: "Meu desempenho", path: "/membros/pontos", group: "Resultados" },
  { icon: History, label: "Pontos e níveis", path: "/membros/pontos-niveis", group: "Resultados" },
];

function statusLabel(status: "pending" | "posted" | "void") {
  return status === "posted" ? "Confirmado" : status === "pending" ? "Em análise" : "Anulado";
}

function levelFor(points: number) {
  if (points >= 1000) return "Avançado";
  if (points >= 300) return "Em desenvolvimento";
  return "Fundamentos";
}

export default function MemberPerformance() {
  const performance = trpc.member.performance.useQuery();
  const points = performance.data?.postedPoints ?? 0;
  const entries = performance.data?.entries ?? [];

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Resultados individuais</span><h1 className="text-3xl font-semibold text-white">Meu desempenho</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Acompanhe o extrato de pontos confirmado pela operação. Esta área mostra somente os seus próprios registros, sem rankings nominais ou dados de outros membros.</p></header><section className="grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5"><div className="flex items-center justify-between text-amber-100"><span className="text-sm">Pontos confirmados</span><Trophy className="size-5" /></div><strong className="mt-3 block text-4xl font-semibold text-white">{points}</strong></article><article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center justify-between text-zinc-300"><span className="text-sm">Nível atual</span><Award className="size-5 text-amber-300" /></div><strong className="mt-3 block text-xl font-semibold text-white">{levelFor(points)}</strong></article><article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center justify-between text-zinc-300"><span className="text-sm">Registros no extrato</span><History className="size-5 text-amber-300" /></div><strong className="mt-3 block text-4xl font-semibold text-white">{entries.length}</strong></article></section><section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="mb-4"><h2 className="font-medium text-white">Extrato de pontos</h2><p className="mt-1 text-sm text-zinc-400">Lançamentos pendentes ainda não compõem o total confirmado.</p></div>{performance.isLoading ? <p className="text-sm text-zinc-400">Carregando desempenho...</p> : entries.length ? <div className="space-y-3">{entries.map(entry => <article key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 p-4"><div><p className="font-medium text-white">{entry.reason}</p><p className="mt-1 text-xs text-zinc-500">{new Date(entry.createdAt).toLocaleString("pt-BR")} · {statusLabel(entry.status)}</p></div><strong className={entry.amount >= 0 ? "text-emerald-300" : "text-rose-300"}>{entry.amount >= 0 ? "+" : ""}{entry.amount} pontos</strong></article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Ainda não há pontos registrados. A administração poderá lançar critérios e pontos conforme a operação do programa.</p>}</section></main></DashboardLayout>;
}
