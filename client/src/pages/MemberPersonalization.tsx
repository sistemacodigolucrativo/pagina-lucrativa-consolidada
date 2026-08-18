import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { KeyRound, LayoutDashboard, MessageSquareText, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: MessageSquareText, label: "Mensagem e acesso", path: "/membros/mensagem-especial", group: "Personalização" },
  { icon: KeyRound, label: "Meus dados", path: "/membros/meus-dados", group: "Personalização" },
];

export default function MemberPersonalization() {
  const utils = trpc.useUtils();
  const profile = trpc.member.profile.useQuery();
  const tickets = trpc.member.tickets.useQuery();
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const requests = useMemo(() => (tickets.data ?? []).filter(ticket => ticket.subject.startsWith("Personalização:")), [tickets.data]);
  const createRequest = trpc.member.createTicket.useMutation({
    onSuccess: async () => {
      setMessage("");
      setConfirmed(false);
      await utils.member.tickets.invalidate();
      toast.success("Solicitação de personalização registrada para a administração.");
    },
    onError: error => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text) return toast.error("Escreva a mensagem que deseja preparar.");
    if (!confirmed) return toast.error("Confirme que a solicitação não inclui senha ou dados sensíveis.");
    createRequest.mutate({
      subject: "Personalização: mensagem e orientação de acesso",
      message: `Mensagem solicitada para personalização:\n${text}\n\nA conta solicitou instruções de acesso seguro. Nenhuma senha foi registrada neste chamado.`,
    });
  }

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Acesso e personalização</span><h1 className="text-3xl font-semibold text-white">Mensagem e acesso especial</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Prepare a mensagem que acompanhará a personalização da sua página e envie a solicitação para acompanhamento administrativo. O retorno fica registrado na sua própria conta.</p></header><section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]"><form onSubmit={submit} className="space-y-4 rounded-2xl border border-amber-300/25 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><MessageSquareText className="size-5 text-amber-300" /><h2 className="font-medium">Preparar mensagem</h2></div><label className="block text-sm leading-6 text-zinc-200">Mensagem para a sua página<textarea required maxLength={2000} value={message} onChange={event => setMessage(event.target.value)} placeholder="Ex.: Escreva aqui a orientação ou a mensagem que deseja revisar para o acesso de personalização." className="mt-1 min-h-40 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none ring-amber-300/50 focus:ring-2" /></label><label className="flex items-start gap-3 text-sm leading-6 text-zinc-300"><input required type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1 size-4" />Confirmo que não inseri senha atual, credencial, documento ou outro dado sensível nesta solicitação.</label><button type="submit" disabled={createRequest.isPending} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:opacity-60"><Send className="size-4" />{createRequest.isPending ? "Registrando..." : "Enviar para análise"}</button></form><section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><ShieldCheck className="size-5 text-amber-300" /><h2 className="font-medium">Orientação de acesso seguro</h2></div><p className="text-sm leading-6 text-zinc-300">Para proteger sua conta, uma senha não é exibida nem gravada nesta área. Quando precisar de orientação para acesso ou atualização de dados, use o registro ao lado. A administração responde no histórico abaixo.</p><div className="rounded-xl border border-white/10 bg-black/25 p-4"><span className="text-xs uppercase tracking-wider text-amber-200">Sua página</span><p className="mt-2 break-all text-sm text-white">{profile.data?.slug ? `/${profile.data.slug}` : "Configure seu identificador no Escritório Virtual."}</p><a href="/membros/meus-dados" className="mt-3 inline-flex text-sm font-medium text-amber-200 underline-offset-4 hover:underline">Atualizar meus dados</a></div><p className="text-xs leading-5 text-zinc-500">As respostas administrativas e o status do chamado permanecem vinculados somente à sua conta.</p></section></section><section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Acompanhamento</span><h2 className="mt-1 text-lg font-medium text-white">Solicitações de personalização</h2></div><span className="text-xs uppercase tracking-wider text-zinc-500">{requests.length} registros</span></div>{tickets.isLoading ? <p className="text-sm text-zinc-400">Carregando solicitações...</p> : requests.length ? <div className="space-y-3">{requests.map(ticket => <article key={ticket.id} className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs uppercase tracking-wider text-amber-200">{ticket.status}</span><h3 className="mt-1 font-medium text-white">{ticket.subject}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{ticket.message}</p></div><time className="text-xs text-zinc-500">{new Date(ticket.updatedAt).toLocaleString("pt-BR")}</time></div>{ticket.adminResponse ? <div className="mt-4 border-l-2 border-amber-300 pl-3"><span className="text-xs uppercase tracking-wider text-amber-200">Resposta da administração</span><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{ticket.adminResponse}</p></div> : <p className="mt-4 text-sm text-zinc-500">Aguardando análise da administração.</p>}</article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Você ainda não registrou uma solicitação de personalização. Use o formulário acima quando precisar preparar uma mensagem ou receber orientação de acesso.</p>}</section></main></DashboardLayout>;
}
