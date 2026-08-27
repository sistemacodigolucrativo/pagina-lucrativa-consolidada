import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { LifeBuoy, Save, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type TicketStatus = "open" | "answered" | "closed";
type TicketFilter = "all" | TicketStatus;

const statusLabels: Record<TicketStatus, string> = {
  open: "Aberto",
  answered: "Respondido",
  closed: "Encerrado",
};

export default function AdminSupport() {
  const utils = trpc.useUtils();
  const tickets = trpc.admin.tickets.useQuery();
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [query, setQuery] = useState("");
  const updateTicket = trpc.admin.updateTicket.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.tickets.invalidate(), utils.member.tickets.invalidate()]);
      toast.success("Solicitação de suporte atualizada.");
    },
    onError: error => toast.error(error.message),
  });
  const allTickets = tickets.data ?? [];
  const counts = useMemo(() => ({
    all: allTickets.length,
    open: allTickets.filter(item => item.status === "open").length,
    answered: allTickets.filter(item => item.status === "answered").length,
    closed: allTickets.filter(item => item.status === "closed").length,
  }), [allTickets]);
  const visibleTickets = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allTickets.filter(item => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!term) return true;
      return [item.subject, item.message, item.adminResponse ?? ""].some(value => value.toLowerCase().includes(term));
    });
  }, [allTickets, filter, query]);

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Relacionamento</span>
          <h1 className="text-3xl font-semibold text-white">Suporte</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Acompanhe o ciclo completo das solicitações enviadas pelos membros: abertas, respondidas e encerradas.</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["all", "open", "answered", "closed"] as TicketFilter[]).map(status => (
            <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-2xl border p-4 text-left transition ${filter === status ? "border-emerald-300/40 bg-emerald-300/10" : "border-white/10 bg-zinc-950/60"}`}>
              <span className="text-xs uppercase tracking-wider text-zinc-400">{status === "all" ? "Todos" : statusLabels[status]}</span>
              <strong className="mt-1 block text-2xl text-white">{counts[status]}</strong>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-white"><LifeBuoy className="size-5 text-emerald-300" /><h2 className="font-medium">Solicitações de suporte</h2></div>
            <label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-500" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar assunto ou mensagem" className="h-10 w-full rounded-lg border border-white/15 bg-black pl-9 pr-3 text-sm text-white" /></label>
          </div>
          {tickets.isLoading ? (
            <p className="text-sm text-zinc-400">Carregando solicitações...</p>
          ) : tickets.isError ? (
            <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">Não foi possível carregar as solicitações. Tente novamente.</p>
          ) : visibleTickets.length ? (
            <div className="space-y-4">
              {visibleTickets.map(item => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div><span className="text-xs uppercase tracking-wider text-emerald-200">{statusLabels[item.status]}</span><h3 className="mt-1 font-medium text-white">{item.subject}</h3></div>
                    <p className="text-xs text-zinc-500">Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}</p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{item.message}</p>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_auto]">
                    <label className="text-sm text-zinc-300">Resposta administrativa<textarea value={responses[item.id] ?? item.adminResponse ?? ""} onChange={event => setResponses(current => ({ ...current, [item.id]: event.target.value }))} maxLength={8000} className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="Escreva a resposta para o membro." /></label>
                    <label className="text-sm text-zinc-300">Status<select defaultValue={item.status} id={`support-status-${item.id}`} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-white"><option value="open">Aberto</option><option value="answered">Respondido</option><option value="closed">Encerrado</option></select></label>
                    <button type="button" onClick={() => {
                      const select = document.getElementById(`support-status-${item.id}`) as HTMLSelectElement | null;
                      const status = (select?.value ?? item.status) as TicketStatus;
                      const adminResponse = responses[item.id] ?? item.adminResponse ?? null;
                      if (status === "answered" && !adminResponse?.trim()) return void toast.error("Escreva uma resposta antes de marcar o ticket como respondido.");
                      updateTicket.mutate({ id: item.id, status, adminResponse });
                    }} disabled={updateTicket.isPending} className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 lg:w-auto"><Save className="size-4" />Salvar</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">Nenhuma solicitação corresponde aos filtros atuais.</p>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
