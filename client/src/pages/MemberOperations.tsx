import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BookOpenText, CircleHelp, LayoutDashboard, Link2, Save, Send, UserRoundPen } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: Link2, label: "Central de operação", path: "/membros/operacao", group: "Navegação" },
];

function PanelTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">{eyebrow}</span><h1 className="text-3xl font-semibold text-white">{title}</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">{description}</p></header>;
}

export default function MemberOperations() {
  const utils = trpc.useUtils();
  const campaigns = trpc.member.campaigns.useQuery();
  const profile = trpc.member.profile.useQuery();
  const tickets = trpc.member.tickets.useQuery();
  const content = trpc.member.content.useQuery();
  const [campaign, setCampaign] = useState({ name: "", slug: "", destinationUrl: "" });
  const [profileForm, setProfileForm] = useState({ slug: "", bio: "", whatsapp: "", websiteUrl: "" });
  const [ticket, setTicket] = useState({ subject: "", message: "" });

  useEffect(() => {
    if (profile.data) setProfileForm({ slug: profile.data.slug, bio: profile.data.bio ?? "", whatsapp: profile.data.whatsapp ?? "", websiteUrl: profile.data.websiteUrl ?? "" });
  }, [profile.data]);

  const createCampaign = trpc.member.createCampaign.useMutation({
    onSuccess: async () => { setCampaign({ name: "", slug: "", destinationUrl: "" }); await utils.member.campaigns.invalidate(); toast.success("Link de campanha criado."); },
    onError: error => toast.error(error.message),
  });
  const deleteCampaign = trpc.member.deleteCampaign.useMutation({ onSuccess: async () => { await utils.member.campaigns.invalidate(); toast.success("Campanha removida."); }, onError: error => toast.error(error.message) });
  const saveProfile = trpc.member.updateProfile.useMutation({ onSuccess: async () => { await utils.member.profile.invalidate(); await utils.member.overview.invalidate(); toast.success("Perfil atualizado."); }, onError: error => toast.error(error.message) });
  const createTicket = trpc.member.createTicket.useMutation({ onSuccess: async () => { setTicket({ subject: "", message: "" }); await utils.member.tickets.invalidate(); toast.success("Solicitação enviada à administração."); }, onError: error => toast.error(error.message) });

  function submitCampaign(event: FormEvent) { event.preventDefault(); createCampaign.mutate(campaign); }
  function submitProfile(event: FormEvent) { event.preventDefault(); saveProfile.mutate({ ...profileForm, bio: profileForm.bio || null, whatsapp: profileForm.whatsapp || null, websiteUrl: profileForm.websiteUrl || null }); }
  function submitTicket(event: FormEvent) { event.preventDefault(); createTicket.mutate(ticket); }

  return <DashboardLayout menuItems={menu} title="Escritório de membros"><main className="mx-auto w-full max-w-6xl space-y-10 p-5 sm:p-8">
    <PanelTitle eyebrow="Operação do membro" title="Central de operação" description="Aqui você mantém seu perfil, cria links de divulgação e acompanha solicitações. Cada ação é gravada na sua conta e pode ser acompanhada pela administração." />

    <section className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submitProfile} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><UserRoundPen size={18} className="text-amber-300" /><h2 className="font-medium">Perfil público</h2></div><p className="text-sm text-zinc-400">Defina os dados que identificam sua presença profissional.</p>
        <label className="block text-sm text-zinc-200">Identificador público<input required value={profileForm.slug} onChange={e => setProfileForm({ ...profileForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="seu-nome" /></label>
        <label className="block text-sm text-zinc-200">Apresentação<textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="Explique em poucas linhas o que você oferece." /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm text-zinc-200">WhatsApp<input value={profileForm.whatsapp} onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="(00) 00000-0000" /></label><label className="block text-sm text-zinc-200">Website<input type="url" value={profileForm.websiteUrl} onChange={e => setProfileForm({ ...profileForm, websiteUrl: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="https://" /></label></div>
        <button disabled={saveProfile.isPending} className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"><Save size={16} />{saveProfile.isPending ? "Salvando..." : "Salvar perfil"}</button>
      </form>
      <form onSubmit={submitCampaign} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><Link2 size={18} className="text-amber-300" /><h2 className="font-medium">Novo link de divulgação</h2></div><p className="text-sm text-zinc-400">Crie links rastreáveis para organizar suas campanhas.</p>
        <label className="block text-sm text-zinc-200">Nome da campanha<input required value={campaign.name} onChange={e => setCampaign({ ...campaign, name: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="Campanha de apresentação" /></label>
        <label className="block text-sm text-zinc-200">Identificador do link<input required value={campaign.slug} onChange={e => setCampaign({ ...campaign, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="apresentacao" /></label>
        <label className="block text-sm text-zinc-200">Destino<input required type="url" value={campaign.destinationUrl} onChange={e => setCampaign({ ...campaign, destinationUrl: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="https://" /></label>
        <button disabled={createCampaign.isPending} className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"><Link2 size={16} />{createCampaign.isPending ? "Criando..." : "Criar campanha"}</button>
      </form>
    </section>

    <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><h2 className="mb-4 text-lg font-medium text-white">Campanhas da sua conta</h2>{campaigns.isLoading ? <p className="text-sm text-zinc-400">Carregando campanhas...</p> : campaigns.data?.length ? <div className="space-y-3">{campaigns.data.map(item => <article key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center"><div><h3 className="font-medium text-white">{item.name}</h3><p className="text-sm text-zinc-400">/{item.slug} · {item.destinationUrl}</p><p className="mt-1 text-xs text-amber-200">{item.clicks} cliques · {item.leads} contatos registrados</p></div><button onClick={() => deleteCampaign.mutate({ id: item.id })} disabled={deleteCampaign.isPending} className="rounded-lg border border-red-300/40 px-3 py-2 text-sm text-red-200">Remover</button></article>)}</div> : <p className="text-sm text-zinc-400">Ainda não há campanhas. Use o formulário acima para criar a primeira.</p>}</section>

    <section className="grid gap-6 lg:grid-cols-2"><form onSubmit={submitTicket} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><CircleHelp size={18} className="text-amber-300" /><h2 className="font-medium">Solicitar suporte</h2></div><label className="block text-sm text-zinc-200">Assunto<input required value={ticket.subject} onChange={e => setTicket({ ...ticket, subject: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="Como podemos ajudar?" /></label><label className="block text-sm text-zinc-200">Mensagem<textarea required value={ticket.message} onChange={e => setTicket({ ...ticket, message: e.target.value })} className="mt-1 min-h-28 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="Descreva o contexto para que a equipe possa responder." /></label><button disabled={createTicket.isPending} className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"><Send size={16} />{createTicket.isPending ? "Enviando..." : "Enviar solicitação"}</button></form>
      <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><h2 className="mb-4 text-lg font-medium text-white">Minhas solicitações</h2>{tickets.isLoading ? <p className="text-sm text-zinc-400">Carregando solicitações...</p> : tickets.data?.length ? <div className="space-y-3">{tickets.data.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-3"><div className="flex items-start justify-between gap-3"><h3 className="font-medium text-white">{item.subject}</h3><span className="text-xs uppercase tracking-wider text-amber-200">{item.status}</span></div><p className="mt-1 text-sm text-zinc-400">{item.message}</p>{item.adminResponse && <p className="mt-3 border-l-2 border-amber-300 pl-3 text-sm text-zinc-200">{item.adminResponse}</p>}</article>)}</div> : <p className="text-sm text-zinc-400">Nenhuma solicitação aberta.</p>}</div></section>

    <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><BookOpenText size={18} className="text-amber-300" /><h2 className="font-medium">Conteúdos publicados</h2></div>{content.data?.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{content.data.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-4"><span className="text-xs uppercase tracking-wider text-amber-200">{item.kind}</span><h3 className="mt-1 font-medium text-white">{item.title}</h3><p className="mt-1 text-sm text-zinc-400">{item.summary || item.body || "Conteúdo disponível."}</p></article>)}</div> : <p className="mt-3 text-sm text-zinc-400">A administração ainda não publicou materiais nesta categoria.</p>}</section>
  </main></DashboardLayout>;
}
