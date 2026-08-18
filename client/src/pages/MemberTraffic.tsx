import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BarChart3, History, LayoutDashboard, MousePointerClick, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: History, label: "Histórico de visitas", path: "/membros/historico", group: "Análise" },
  { icon: TrendingUp, label: "Top 10 visitas", path: "/membros/top-visitas", group: "Análise" },
];

export default function MemberTraffic() {
  const [location] = useLocation();
  const campaigns = trpc.member.campaigns.useQuery();
  const ordered = useMemo(() => [...(campaigns.data ?? [])].sort((a, b) => (b.clicks - a.clicks) || (b.leads - a.leads) || a.name.localeCompare(b.name)), [campaigns.data]);
  const totalClicks = useMemo(() => ordered.reduce((total, campaign) => total + campaign.clicks, 0), [ordered]);
  const totalLeads = useMemo(() => ordered.reduce((total, campaign) => total + campaign.leads, 0), [ordered]);
  const isTop = location === "/membros/top-visitas";
  const visibleCampaigns = isTop ? ordered.slice(0, 10) : ordered;
  const title = isTop ? "Top 10 visitas" : "Histórico de visitas";
  const detail = isTop ? "Veja as campanhas próprias com maior alcance. O ranking considera somente os seus links e nunca expõe dados de outros membros." : "Acompanhe os cliques e contatos gerados por cada campanha da sua própria operação.";

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Análise própria</span><h1 className="text-3xl font-semibold text-white">{title}</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">{detail}</p></header><section className="grid gap-4 sm:grid-cols-3"><article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><span className="text-xs uppercase tracking-wider text-zinc-500">Campanhas</span><strong className="mt-2 block text-3xl text-white">{ordered.length}</strong><p className="mt-1 text-sm text-zinc-400">Links próprios cadastrados</p></article><article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><span className="text-xs uppercase tracking-wider text-zinc-500">Visitas registradas</span><strong className="mt-2 block text-3xl text-amber-200">{totalClicks}</strong><p className="mt-1 text-sm text-zinc-400">Soma de cliques das campanhas</p></article><article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><span className="text-xs uppercase tracking-wider text-zinc-500">Contatos associados</span><strong className="mt-2 block text-3xl text-white">{totalLeads}</strong><p className="mt-1 text-sm text-zinc-400">Registros vinculados aos links</p></article></section><section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5"><div className="flex items-center gap-2 text-white"><BarChart3 className="size-5 text-amber-300" /><h2 className="font-medium">{isTop ? "Campanhas com maior alcance" : "Desempenho por campanha"}</h2></div><a href="/membros/operacao" className="text-sm font-medium text-amber-200 underline-offset-4 hover:underline">Criar ou editar campanha</a></div>{campaigns.isLoading ? <p className="p-5 text-sm text-zinc-400">Carregando métricas...</p> : visibleCampaigns.length ? <div className="divide-y divide-white/10">{visibleCampaigns.map((campaign, index) => <article key={campaign.id} className="grid gap-3 p-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:p-5"><div className="flex size-9 items-center justify-center rounded-full bg-amber-300/10 text-sm font-semibold text-amber-200">{isTop ? index + 1 : <MousePointerClick className="size-4" />}</div><div className="min-w-0"><h3 className="truncate font-medium text-white">{campaign.name}</h3><p className="mt-1 break-all text-sm text-zinc-400">/{campaign.slug}</p></div><div className="flex gap-5 text-sm sm:text-right"><span><strong className="block text-white">{campaign.clicks}</strong><small className="text-zinc-500">visitas</small></span><span><strong className="block text-amber-200">{campaign.leads}</strong><small className="text-zinc-500">contatos</small></span></div></article>)}</div> : <div className="p-7 text-sm leading-6 text-zinc-300"><p className="font-medium text-white">Ainda não há campanhas para analisar.</p><p className="mt-1 text-zinc-400">Crie um link de divulgação no Escritório Virtual. As métricas aparecerão aqui quando suas campanhas receberem atividade.</p></div>}</section></main></DashboardLayout>;
}
