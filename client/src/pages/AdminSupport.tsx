import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  LifeBuoy,
  MessageSquareReply,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type TicketStatus = "open" | "answered" | "closed";

const statusLabels: Record<TicketStatus, string> = {
  open: "Aberto",
  answered: "Respondido",
  closed: "Encerrado",
};

const statusStyles: Record<TicketStatus, string> = {
  open: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  answered: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  closed: "border-zinc-500/30 bg-zinc-700/30 text-zinc-200",
};

function StatusIcon({ status }: { status: TicketStatus }) {
  if (status === "open")
    return <Clock3 className="size-4" aria-hidden="true" />;
  if (status === "answered")
    return <MessageSquareReply className="size-4" aria-hidden="true" />;
  return <CheckCircle2 className="size-4" aria-hidden="true" />;
}

export default function AdminSupport() {
  const utils = trpc.useUtils();
  const [location, setLocation] = useLocation();
  const isClosedScreen = location === "/admin/suporte/encerrados";
  const tickets = trpc.admin.tickets.useQuery();
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [query, setQuery] = useState("");
  const updateTicket = trpc.admin.updateTicket.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.admin.tickets.invalidate(),
        utils.member.tickets.invalidate(),
      ]);
      toast.success("Solicitação de suporte atualizada.");
    },
    onError: error => toast.error(error.message),
  });

  const deleteTicket = trpc.admin.deleteTicket.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.admin.tickets.invalidate(),
        utils.member.tickets.invalidate(),
      ]);
      toast.success("Ticket excluído definitivamente.");
    },
    onError: error => toast.error(error.message),
  });
  const allTickets = tickets.data ?? [];
  const activeTickets = useMemo(
    () => allTickets.filter(item => item.status !== "closed"),
    [allTickets]
  );
  const closedTickets = useMemo(
    () => allTickets.filter(item => item.status === "closed"),
    [allTickets]
  );
  const counts = useMemo(
    () => ({
      active: activeTickets.length,
      open: allTickets.filter(item => item.status === "open").length,
      answered: allTickets.filter(item => item.status === "answered").length,
      closed: closedTickets.length,
    }),
    [activeTickets.length, allTickets, closedTickets.length]
  );
  const visibleTickets = useMemo(() => {
    const term = query.trim().toLowerCase();
    const source = isClosedScreen ? closedTickets : activeTickets;
    return source.filter(item => {
      if (!term) return true;
      return [item.subject, item.message, item.adminResponse ?? ""].some(
        value => value.toLowerCase().includes(term)
      );
    });
  }, [activeTickets, closedTickets, isClosedScreen, query]);

  function toggleExpanded(id: number) {
    setExpandedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">
            Relacionamento
          </span>
          <h1 className="text-3xl font-semibold text-white">
            {isClosedScreen ? "Tickets encerrados" : "Suporte"}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            {isClosedScreen
              ? "Consulte tickets encerrados. Eles permanecem nesta área por 90 dias após o encerramento e depois são removidos automaticamente."
              : "Acompanhe tickets ativos em barrinhas compactas. Tickets encerrados ficam separados em uma tela própria."}
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setLocation("/admin/suporte")}
            className={`rounded-2xl border p-4 text-left transition ${!isClosedScreen ? "border-emerald-300/40 bg-emerald-300/10" : "border-white/10 bg-zinc-950/60"}`}
          >
            <span className="text-xs uppercase tracking-wider text-zinc-400">
              Ativos
            </span>
            <strong className="mt-1 block text-2xl text-white">
              {counts.active}
            </strong>
          </button>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <span className="text-xs uppercase tracking-wider text-zinc-400">
              Abertos
            </span>
            <strong className="mt-1 block text-2xl text-white">
              {counts.open}
            </strong>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
            <span className="text-xs uppercase tracking-wider text-zinc-400">
              Respondidos
            </span>
            <strong className="mt-1 block text-2xl text-white">
              {counts.answered}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => setLocation("/admin/suporte/encerrados")}
            className={`rounded-2xl border p-4 text-left transition ${isClosedScreen ? "border-emerald-300/40 bg-emerald-300/10" : "border-white/10 bg-zinc-950/60"}`}
          >
            <span className="text-xs uppercase tracking-wider text-zinc-400">
              Encerrados
            </span>
            <strong className="mt-1 block text-2xl text-white">
              {counts.closed}
            </strong>
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-white">
              <LifeBuoy className="size-5 text-emerald-300" />
              <h2 className="font-medium">
                {isClosedScreen
                  ? "Arquivo de tickets encerrados"
                  : "Tickets ativos"}
              </h2>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-500" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar assunto ou mensagem"
                className="h-10 w-full rounded-lg border border-white/15 bg-black pl-9 pr-3 text-sm text-white"
              />
            </label>
          </div>
          {tickets.isLoading ? (
            <p className="text-sm text-zinc-400">Carregando solicitações...</p>
          ) : tickets.isError ? (
            <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">
              Não foi possível carregar as solicitações. Tente novamente.
            </p>
          ) : visibleTickets.length ? (
            <div className="space-y-2">
              {visibleTickets.map(item => {
                const expanded = expandedIds.has(item.id);
                const detailsId = `support-ticket-details-${item.id}`;
                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-white/10 bg-black/25"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      aria-expanded={expanded}
                      aria-controls={detailsId}
                      className="flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/60 sm:px-4"
                    >
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[item.status]}`}
                      >
                        <StatusIcon status={item.status} />
                        {statusLabels[item.status]}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                        {item.subject}
                      </span>
                      <span className="hidden shrink-0 text-xs text-zinc-500 sm:inline">
                        {new Date(item.updatedAt).toLocaleString("pt-BR")}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-200">
                        {expanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                        <span className="hidden sm:inline">
                          {expanded ? "Recolher" : "Expandir"}
                        </span>
                      </span>
                    </button>
                    {expanded ? (
                      <div
                        id={detailsId}
                        className="border-t border-white/10 px-3 pb-4 pt-4 sm:px-4 sm:pb-5"
                      >
                        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                          {item.message}
                        </p>
                        {item.adminResponse ? (
                          <div className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-300/5 p-3">
                            <p className="text-xs uppercase tracking-wider text-emerald-200">
                              Resposta atual
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                              {item.adminResponse}
                            </p>
                          </div>
                        ) : null}
                        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_auto_auto]">
                          <label className="text-sm text-zinc-300">
                            Resposta administrativa
                            <textarea
                              value={
                                responses[item.id] ?? item.adminResponse ?? ""
                              }
                              onChange={event =>
                                setResponses(current => ({
                                  ...current,
                                  [item.id]: event.target.value,
                                }))
                              }
                              maxLength={8000}
                              className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
                              placeholder="Escreva a resposta para o membro."
                            />
                          </label>
                          <label className="text-sm text-zinc-300">
                            Ação manual
                            <select
                              defaultValue={
                                item.status === "closed" ? "closed" : "auto"
                              }
                              id={`support-status-${item.id}`}
                              className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-white"
                            >
                              <option value="auto">Status automático</option>
                              <option value="closed">Encerrado</option>
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const select = document.getElementById(
                                `support-status-${item.id}`
                              ) as HTMLSelectElement | null;
                              const status = (select?.value ?? "auto") as
                                | TicketStatus
                                | "auto";
                              const adminResponse =
                                responses[item.id] ??
                                item.adminResponse ??
                                null;
                              updateTicket.mutate({
                                id: item.id,
                                status,
                                adminResponse,
                              });
                            }}
                            disabled={updateTicket.isPending}
                            className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 lg:w-auto"
                          >
                            <Save className="size-4" />
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !window.confirm(
                                  "Excluir este ticket definitivamente?"
                                )
                              )
                                return;
                              deleteTicket.mutate({ id: item.id });
                            }}
                            disabled={deleteTicket.isPending}
                            className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/10 disabled:opacity-60 lg:w-auto"
                          >
                            <Trash2 className="size-4" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">
              {isClosedScreen
                ? "Nenhum ticket encerrado dentro do prazo de 90 dias."
                : "Nenhum ticket ativo corresponde aos filtros atuais."}
            </p>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
