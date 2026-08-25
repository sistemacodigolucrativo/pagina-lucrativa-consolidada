import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Network, ShieldCheck, UsersRound } from "lucide-react";

const menu: DashboardMenuItem[] = [
  { icon: Network, label: "Visão geral", path: "/admin", group: "Administração" },
  { icon: UsersRound, label: "Membros e rede", path: "/admin/membros", group: "Administração" },
];

export default function AdminReferrals() {
  const links = trpc.admin.referralLinks.useQuery();
  return <DashboardLayout menuItems={menu} title="Administração"><main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Governança de relacionamento</span><h1 className="text-3xl font-semibold text-white">Membros e rede</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Consulte os vínculos de indicação criados automaticamente pelo fluxo de adesão e ativação do membro.</p></header><section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><ShieldCheck className="size-5 text-emerald-300" /><h2 className="font-medium">Vínculos cadastrados</h2></div>{links.isLoading ? <p className="mt-4 text-sm text-zinc-400">Carregando vínculos...</p> : links.data?.length ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{links.data.map(link => <article key={link.id} className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-zinc-400">Patrocinador</p><p className="font-medium text-white">{link.sponsorName || `Membro #${link.sponsorId}`}</p></div><span className={link.status === "active" ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200" : "rounded-full bg-zinc-700/50 px-3 py-1 text-xs text-zinc-300"}>{link.status === "active" ? "Ativo" : "Arquivado"}</span></div><div className="mt-3 border-t border-white/10 pt-3"><p className="text-sm text-zinc-400">Indicado</p><p className="font-medium text-white">{link.referredName || `Membro #${link.referredUserId}`}</p></div></article>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Nenhum vínculo criado pelo fluxo de adesão foi encontrado.</p>}</section></main></DashboardLayout>;
}
