import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { CircleHelp, MessageCircleMore, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: CircleHelp, label: "Fale conosco", path: "/membros/fale-conosco", group: "Ajuda" },
  { icon: MessageCircleMore, label: "Enviar agradecimento", path: "/membros/fazer-depoimento", group: "Ajuda" },
];

export default function MemberSupport() {
  const [form, setForm] = useState({ subject: "", message: "" });
  const utils = trpc.useUtils();
  const tickets = trpc.member.tickets.useQuery();
  const createTicket = trpc.member.createTicket.useMutation({
    onSuccess: async () => {
      setForm({ subject: "", message: "" });
      await utils.member.tickets.invalidate();
      toast.success("Solicitação enviada.");
    },
    onError: error => toast.error(error.message),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    createTicket.mutate(form);
  };

  return (
    <DashboardLayout menuItems={menu} title="Escritório Virtual">
      <main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Ajuda</span>
          <h1 className="text-3xl font-semibold text-white">Fale conosco</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Abra e acompanhe solicitações relacionadas ao funcionamento da sua estrutura. Esta página contém somente recursos de suporte.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="flex items-center gap-2 text-white"><CircleHelp className="size-5 text-emerald-300" /><h2 className="font-medium">Nova solicitação</h2></div>
            <label className="block text-sm text-zinc-200">Assunto<input required minLength={4} maxLength={180} value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="Descreva o assunto" /></label>
            <label className="block text-sm text-zinc-200">Mensagem<textarea required minLength={10} maxLength={8000} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className="mt-1 min-h-40 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="Explique o que precisa de ajuda." /></label>
            <button disabled={createTicket.isPending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"><Send className="size-4" />Enviar solicitação</button>
          </form>

          <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="mb-4 flex items-center gap-2 text-white"><MessageCircleMore className="size-5 text-emerald-300" /><h2 className="font-medium">Minhas solicitações</h2></div>
            {tickets.isLoading ? <p className="text-sm text-zinc-400">Carregando...</p> : tickets.data?.length ? <div className="space-y-3">{tickets.data.map(ticket => <article key={ticket.id} className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium text-white">{ticket.subject}</h3><p className="mt-1 text-sm leading-6 text-zinc-400">{ticket.message}</p></div><span className={`rounded-full px-3 py-1 text-xs ${ticket.status === "open" ? "bg-amber-300/10 text-amber-200" : "bg-emerald-300/10 text-emerald-200"}`}>{ticket.status === "open" ? "Aberta" : "Encerrada"}</span></div>{ticket.adminResponse ? <div className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-300/5 p-3"><p className="text-xs uppercase tracking-wider text-emerald-200">Resposta</p><p className="mt-1 text-sm leading-6 text-zinc-300">{ticket.adminResponse}</p></div> : null}<p className="mt-3 text-xs text-zinc-500">Atualizada em {new Date(ticket.updatedAt).toLocaleString("pt-BR")}</p></article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">Você ainda não abriu nenhuma solicitação.</p>}
          </section>
        </section>
      </main>
    </DashboardLayout>
  );
}
