import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { LifeBuoy, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TicketStatus = "open" | "answered" | "closed";

const statusLabels: Record<TicketStatus, string> = {
  open: "Aberto",
  answered: "Respondido",
  closed: "Encerrado",
};

export default function AdminSupport() {
  const utils = trpc.useUtils();
  const tickets = trpc.admin.tickets.useQuery();
  const [responses, setResponses] = useState<Record<number, string>>({});
  const updateTicket = trpc.admin.updateTicket.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.tickets.invalidate(), utils.member.tickets.invalidate()]);
      toast.success("Solicitação de suporte atualizada.");
    },
    onError: error => toast.error(error.message),
  });

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Relacionamento</span>
          <h1 className="text-3xl font-semibold text-white">Suporte</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Responda às solicitações enviadas pelos membros em Fale conosco.</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-white">
            <LifeBuoy className="size-5 text-emerald-300" />
            <h2 className="font-medium">Solicitações de suporte</h2>
          </div>
          {tickets.isLoading ? (
            <p className="text-sm text-zinc-400">Carregando solicitações...</p>
          ) : tickets.data?.length ? (
            <div className="space-y-4">
              {tickets.data.map(item => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-emerald-200">{statusLabels[item.status]}</span>
                      <h3 className="mt-1 font-medium text-white">{item.subject}</h3>
                      <p className="text-sm text-zinc-500">{new Date(item.updatedAt).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{item.message}</p>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_auto]">
                    <label className="text-sm text-zinc-300">
                      Resposta administrativa
                      <textarea
                        value={responses[item.id] ?? item.adminResponse ?? ""}
                        onChange={event => setResponses(current => ({ ...current, [item.id]: event.target.value }))}
                        className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
                        placeholder="Escreva a resposta para o membro."
                      />
                    </label>
                    <label className="text-sm text-zinc-300">
                      Status
                      <select
                        defaultValue={item.status}
                        id={`support-status-${item.id}`}
                        className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-white"
                      >
                        <option value="open">Aberto</option>
                        <option value="answered">Respondido</option>
                        <option value="closed">Encerrado</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const select = document.getElementById(`support-status-${item.id}`) as HTMLSelectElement | null;
                        updateTicket.mutate({
                          id: item.id,
                          status: (select?.value ?? item.status) as TicketStatus,
                          adminResponse: responses[item.id] ?? item.adminResponse ?? null,
                        });
                      }}
                      disabled={updateTicket.isPending}
                      className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                    >
                      <Save className="size-4" />
                      Salvar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">Nenhum ticket aberto.</p>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
