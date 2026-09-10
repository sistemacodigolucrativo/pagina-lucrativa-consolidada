import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { Activity, BarChart3, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

type Period = "7d" | "30d" | "90d" | "all";

type OperationResponse = {
  period: Period;
  since: string | null;
  totals: {
    members: number;
    campaigns: number;
    activeCampaigns: number;
    campaignClicks: number;
    mainLinkClicks: number;
    conversions: number;
    contacts: number;
    invitations: number;
    applications: number;
    orphanedApplications: number;
    confirmedApplications: number;
  };
  campaigns: Array<{
    id: number;
    userId: number;
    name: string;
    slug: string;
    destinationUrl: string;
    source: string | null;
    medium: string | null;
    status: "active" | "paused" | "archived";
    clicks: number;
    leads: number;
    createdAt: string;
    updatedAt: string;
    memberName: string | null;
    memberEmail: string | null;
    memberSlug: string | null;
    periodClicks: number;
    periodConversions: number;
    periodContacts: number;
  }>;
  recentConversions: Array<{
    id: number;
    campaignId: number;
    userId: number;
    conversionType: "lead" | "application" | "order" | "sale" | "commission";
    status: "active" | "reversed";
    valueCents: number;
    entityType: string;
    entityId: number | null;
    occurredAt: string;
  }>;
  generatedAt: string;
};

async function loadOperation(period: Period) {
  const response = await fetch(withAppBase("/api/admin/operation?period=" + encodeURIComponent(period)), { credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : "Falha ao carregar operacao.");
  }
  return response.json() as Promise<OperationResponse>;
}

export default function AdminOperation() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<OperationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh(nextPeriod = period) {
    setLoading(true);
    setError(null);
    try {
      setData(await loadOperation(nextPeriod));
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Falha ao carregar operacao.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh(period);
  }, [period]);

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Operação comercial</span>
            <h1 className="text-3xl font-semibold text-white">Operação</h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300">Visao administrativa das campanhas, trafego, contatos, conversoes e pedidos gerados pelos membros.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["7d", "30d", "90d", "all"] as Period[]).map(option => (
              <button key={option} type="button" onClick={() => setPeriod(option)} className={"h-10 rounded-lg border px-3 text-sm " + (period === option ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100" : "border-white/15 text-zinc-200")}>{option === "all" ? "Tudo" : option}</button>
            ))}
            <button type="button" onClick={() => void refresh()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-sm text-white"><RefreshCcw className="size-4" />Atualizar</button>
          </div>
        </header>

        {loading ? (
          <p className="text-sm text-zinc-400">Carregando operacao...</p>
        ) : error ? (
          <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">{error}</p>
        ) : data ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-400">Cliques de campanhas</span><strong className="mt-1 block text-2xl text-white">{data.totals.campaignClicks}</strong><span className="text-xs text-zinc-500">{data.totals.activeCampaigns} campanha(s) ativa(s)</span></article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-400">Cliques link principal</span><strong className="mt-1 block text-2xl text-white">{data.totals.mainLinkClicks}</strong><span className="text-xs text-zinc-500">tracking de afiliado publico</span></article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-400">Conversoes</span><strong className="mt-1 block text-2xl text-white">{data.totals.conversions}</strong><span className="text-xs text-zinc-500">{data.totals.contacts} contato(s)</span></article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-400">Pedidos no periodo</span><strong className="mt-1 block text-2xl text-white">{data.totals.applications}</strong><span className="text-xs text-zinc-500">{data.totals.orphanedApplications} sem afiliado</span></article>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2 text-white"><BarChart3 className="size-5 text-emerald-300" /><h2 className="font-medium">Campanhas dos membros</h2></div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="py-3 pr-4">Campanha</th>
                      <th className="py-3 pr-4">Membro</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Cliques periodo</th>
                      <th className="py-3 pr-4">Conversoes</th>
                      <th className="py-3 pr-4">Contatos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {data.campaigns.map(item => (
                      <tr key={item.id} className="align-top">
                        <td className="py-4 pr-4"><strong className="block text-white">{item.name}</strong><span className="block text-xs text-zinc-500">{item.slug}</span></td>
                        <td className="py-4 pr-4 text-zinc-300">{item.memberName ?? item.memberSlug ?? item.memberEmail ?? "Membro sem perfil"}</td>
                        <td className="py-4 pr-4 text-zinc-300">{item.status}</td>
                        <td className="py-4 pr-4 text-zinc-200">{item.periodClicks}<span className="block text-xs text-zinc-500">total legado {item.clicks}</span></td>
                        <td className="py-4 pr-4 text-zinc-200">{item.periodConversions}</td>
                        <td className="py-4 pr-4 text-zinc-200">{item.periodContacts}<span className="block text-xs text-zinc-500">leads legado {item.leads}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2 text-white"><Activity className="size-5 text-emerald-300" /><h2 className="font-medium">Conversoes recentes</h2></div>
              <div className="space-y-3">
                {data.recentConversions.length ? data.recentConversions.map(item => (
                  <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <strong className="text-white">{item.conversionType}</strong>
                    <p className="mt-1 text-xs text-zinc-500">Campanha #{item.campaignId} · usuario #{item.userId} · {new Date(item.occurredAt).toLocaleString("pt-BR")}</p>
                  </article>
                )) : <p className="text-sm text-zinc-400">Nenhuma conversao encontrada no periodo.</p>}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </DashboardLayout>
  );
}
