import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { Award, RefreshCcw, Save, Trophy } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PointStatus = "pending" | "posted" | "void";

type PerformanceResponse = {
  totals: {
    postedPoints: number;
    pendingPoints: number;
    voidPoints: number;
    entries: number;
    membersWithPoints: number;
  };
  members: Array<{
    id: number;
    name: string | null;
    email: string | null;
    slug: string | null;
    postedPoints: number;
    pendingPoints: number;
    entries: number;
  }>;
  entries: Array<{
    id: number;
    userId: number;
    amount: number;
    reason: string;
    status: PointStatus;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    memberName: string | null;
    memberEmail: string | null;
    memberSlug: string | null;
  }>;
  generatedAt: string;
};

const statusLabels: Record<PointStatus, string> = {
  pending: "Em analise",
  posted: "Confirmado",
  void: "Anulado",
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(withAppBase(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : "Falha no modulo de pontos.");
  }
  return response.json() as Promise<T>;
}

export default function AdminPerformance() {
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<PointStatus>("posted");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchJson<PerformanceResponse>("/api/admin/performance"));
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Falha ao carregar pontos.");
    } finally {
      setLoading(false);
    }
  }

  async function submitPoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await fetchJson("/api/admin/performance", {
        method: "POST",
        body: JSON.stringify({ userId: Number(selectedUserId), amount: Number(amount), reason, status }),
      });
      toast.success("Lancamento de pontos registrado.");
      setAmount("");
      setReason("");
      setStatus("posted");
      await refresh();
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Falha ao lancar pontos.");
    } finally {
      setSaving(false);
    }
  }

  async function updateEntryStatus(entryId: number, nextStatus: PointStatus) {
    setSaving(true);
    try {
      await fetchJson("/api/admin/performance/" + entryId + "/status", {
        method: "POST",
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success("Status do lancamento atualizado.");
      await refresh();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Falha ao atualizar status.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filteredEntries = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data?.entries ?? [];
    return (data?.entries ?? []).filter(entry => [
      entry.reason,
      entry.memberName ?? "",
      entry.memberEmail ?? "",
      entry.memberSlug ?? "",
      String(entry.userId),
    ].some(value => value.toLowerCase().includes(term)));
  }, [data?.entries, query]);

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Operação comercial</span>
            <h1 className="text-3xl font-semibold text-white">Pontos e performance</h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300">Gerencie lançamentos de pontos que o membro visualiza no painel de desempenho.</p>
          </div>
          <button type="button" onClick={() => void refresh()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-sm text-white"><RefreshCcw className="size-4" />Atualizar</button>
        </header>

        {loading ? (
          <p className="text-sm text-zinc-400">Carregando performance...</p>
        ) : error ? (
          <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">{error}</p>
        ) : data ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-400">Pontos confirmados</span><strong className="mt-1 block text-2xl text-white">{data.totals.postedPoints}</strong></article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-400">Pontos pendentes</span><strong className="mt-1 block text-2xl text-white">{data.totals.pendingPoints}</strong></article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-400">Membros pontuados</span><strong className="mt-1 block text-2xl text-white">{data.totals.membersWithPoints}</strong></article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-400">Lançamentos</span><strong className="mt-1 block text-2xl text-white">{data.totals.entries}</strong></article>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
              <form onSubmit={submitPoint} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-white"><Award className="size-5 text-emerald-300" /><h2 className="font-medium">Novo lançamento</h2></div>
                <div className="space-y-4">
                  <label className="block text-sm text-zinc-300">Membro<select required value={selectedUserId} onChange={event => setSelectedUserId(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white"><option value="">Selecione um membro</option>{data.members.map(member => <option key={member.id} value={member.id}>{member.name ?? member.slug ?? member.email ?? "Membro #" + member.id}</option>)}</select></label>
                  <label className="block text-sm text-zinc-300">Quantidade<input required type="number" value={amount} onChange={event => setAmount(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white" /></label>
                  <label className="block text-sm text-zinc-300">Status<select value={status} onChange={event => setStatus(event.target.value as PointStatus)} className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white"><option value="posted">Confirmado</option><option value="pending">Em análise</option><option value="void">Anulado</option></select></label>
                  <label className="block text-sm text-zinc-300">Motivo<textarea required value={reason} onChange={event => setReason(event.target.value)} rows={4} maxLength={320} className="mt-2 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white" /></label>
                  <button disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 text-sm font-semibold text-black disabled:opacity-50"><Save className="size-4" />Salvar pontos</button>
                </div>
              </form>

              <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-white"><Trophy className="size-5 text-emerald-300" /><h2 className="font-medium">Ranking operacional</h2></div>
                <div className="space-y-3">
                  {data.members.filter(member => member.entries > 0).slice(0, 10).map(member => (
                    <article key={member.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <strong className="text-white">{member.name ?? member.slug ?? "Membro #" + member.id}</strong>
                        <span className="text-sm text-emerald-200">{member.postedPoints} pontos</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{member.email ?? member.slug ?? "Sem identificador"} · {member.pendingPoints} pendente(s)</p>
                    </article>
                  ))}
                </div>
              </section>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-medium text-white">Extrato global</h2>
                <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar membro ou motivo" className="h-10 w-full rounded-lg border border-white/15 bg-black px-3 text-sm text-white sm:max-w-sm" />
              </div>
              <div className="space-y-3">
                {filteredEntries.length ? filteredEntries.map(entry => (
                  <article key={entry.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <strong className="text-white">{entry.reason}</strong>
                        <p className="mt-1 text-xs text-zinc-500">{entry.memberName ?? entry.memberSlug ?? entry.memberEmail ?? "Membro #" + entry.userId} · {new Date(entry.createdAt).toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={entry.amount >= 0 ? "text-emerald-300" : "text-rose-300"}>{entry.amount >= 0 ? "+" : ""}{entry.amount} pontos</span>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300">{statusLabels[entry.status]}</span>
                        {(["posted", "pending", "void"] as PointStatus[]).filter(next => next !== entry.status).map(next => (
                          <button key={next} type="button" disabled={saving} onClick={() => void updateEntryStatus(entry.id, next)} className="rounded-lg border border-white/15 px-2 py-1 text-xs text-zinc-200 disabled:opacity-50">{statusLabels[next]}</button>
                        ))}
                      </div>
                    </div>
                  </article>
                )) : <p className="text-sm text-zinc-400">Nenhum lançamento encontrado.</p>}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </DashboardLayout>
  );
}
