import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { getMemberCommunicationContext, type CommunicationChannel } from "@shared/memberCommunicationRoutes";
import { Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: Share2, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: Mail, label: "E-mails Site e Artigos", path: "/membros/emails-site", group: "Divulgação" },
  { icon: Mail, label: "E-mails Interessados", path: "/membros/emails-interessados", group: "Divulgação" },
  { icon: MessageCircle, label: "WhatsApp", path: "/membros/emails-whatsapp", group: "Divulgação" },
];

const channelLabel: Record<CommunicationChannel, string> = {
  link: "Link de divulgação",
  email: "E-mail",
  whatsapp: "WhatsApp",
};

function getPathname() {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

export default function MemberCommunications() {
  const pathname = getPathname();
  const context = getMemberCommunicationContext(pathname);
  const utils = trpc.useUtils();
  const contacts = trpc.member.contacts.useQuery();
  const invitations = trpc.member.invitations.useQuery();
  const [channel, setChannel] = useState<CommunicationChannel>(context.defaultChannel);
  const [contactId, setContactId] = useState("");
  const [message, setMessage] = useState("");
  const activeContacts = useMemo(() => (contacts.data ?? []).filter(contact => contact.status !== "archived"), [contacts.data]);

  useEffect(() => {
    setChannel(context.defaultChannel);
    setContactId("");
    setMessage("");
  }, [context.defaultChannel, pathname]);

  const create = trpc.member.createInvitation.useMutation({
    onSuccess: () => {
      void utils.member.invitations.invalidate();
      void utils.member.activities.invalidate();
      setMessage("");
      toast.success("Preparação registrada. Nenhum envio externo foi realizado.");
    },
    onError: error => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const selected = activeContacts.find(contact => String(contact.id) === contactId);
    if (channel !== "link" && !selected) return toast.error("Escolha um contato consentido para preparar a comunicação.");
    if (channel === "email" && !selected?.email) return toast.error("O contato selecionado não possui e-mail.");
    if (channel === "whatsapp" && !selected?.whatsapp) return toast.error("O contato selecionado não possui WhatsApp.");
    create.mutate({ contactId: contactId ? Number(contactId) : null, channel, message: message.trim() || null });
  }

  return (
    <DashboardLayout menuItems={menu} title="Escritório Virtual">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-amber-300">{context.eyebrow}</span>
          <h1 className="text-3xl font-semibold text-white">{context.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">{context.description}</p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="flex items-center gap-2 text-white">
              <Send className="size-5 text-amber-300" />
              <h2 className="font-medium">{context.formTitle}</h2>
            </div>
            <label className="block text-sm text-zinc-200">
              Canal
              <select value={channel} onChange={event => setChannel(event.target.value as CommunicationChannel)} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">
                <option value="link">Link de divulgação</option>
                <option value="email">E-mail</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <label className="block text-sm text-zinc-200">
              Contato consentido {channel === "link" ? "(opcional)" : ""}
              <select value={contactId} onChange={event => setContactId(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">
                <option value="">{channel === "link" ? "Sem contato específico" : "Selecione um contato"}</option>
                {activeContacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name} · {channel === "whatsapp" ? (contact.whatsapp || "sem WhatsApp") : contact.email}</option>)}
              </select>
            </label>
            <label className="block text-sm text-zinc-200">
              {context.messageLabel}
              <textarea value={message} maxLength={4000} onChange={event => setMessage(event.target.value)} placeholder={context.messagePlaceholder} className="mt-1 min-h-36 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
            </label>
            <button disabled={create.isPending} className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
              {create.isPending ? "Registrando..." : "Registrar preparo"}
            </button>
          </form>

          <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-white">Preparos recentes</h2>
              <span className="text-xs uppercase tracking-wider text-zinc-500">{invitations.data?.length ?? 0} registros</span>
            </div>
            {invitations.isLoading ? <p className="text-sm text-zinc-400">Carregando preparos...</p> : invitations.data?.length ? <div className="space-y-3">{invitations.data.map(invitation => {
              const contact = activeContacts.find(item => item.id === invitation.contactId);
              return <article key={invitation.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-amber-200">{channelLabel[invitation.channel as CommunicationChannel]} · {invitation.status === "prepared" ? "Preparado" : "Cancelado"}</p>
                    <h3 className="mt-1 font-medium text-white">{contact ? contact.name : "Preparação sem contato específico"}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{invitation.message || "Sem texto adicional registrado."}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{new Date(invitation.createdAt).toLocaleString("pt-BR")}</span>
                </div>
              </article>;
            })}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Ainda não há preparos registrados. Cadastre primeiro um contato consentido no Escritório Virtual e crie sua comunicação.</p>}
          </section>
        </section>
      </main>
    </DashboardLayout>
  );
}
