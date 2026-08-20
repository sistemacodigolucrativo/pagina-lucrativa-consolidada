import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { PhoneInput } from "@/components/PhoneInput";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { normalizeEmail } from "@shared/contactValidation";
import { BarChart3, ClipboardList, Copy, History, Link2, MousePointerClick, Plus, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Period = "7d" | "30d" | "90d" | "all";
type ContactStatus = "new" | "contacted" | "qualified" | "archived";

const menu: DashboardMenuItem[] = [
  { icon: BarChart3, label: "Minha operação", path: "/membros/operacao", group: "Navegação" },
  { icon: Link2, label: "Minha página e perfil", path: "/membros/configuracoes", group: "Minha página" },
  { icon: UsersRound, label: "Minha rede", path: "/membros/rede", group: "Vendas & rede" },
];

const tabs = [
  { key: "overview", label: "Visão geral", path: "/membros/operacao" },
  { key: "campaigns", label: "Campanhas", path: "/membros/operacao/campanhas" },
  { key: "traffic", label: "Tráfego", path: "/membros/operacao/trafego" },
  { key: "conversions", label: "Conversões", path: "/membros/operacao/conversoes" },
  { key: "contacts", label: "Contatos", path: "/membros/operacao/contatos" },
  { key: "history", label: "Histórico", path: "/membros/operacao/historico" },
] as const;

const fieldClass = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white";

function campaignUrl(profileSlug: string | undefined, slug: string) {
  const path = profileSlug ? `/r/${encodeURIComponent(profileSlug)}/${encodeURIComponent(slug)}` : `/${encodeURIComponent(slug)}`;
  return typeof window === "undefined" ? path : `${window.location.origin}${withAppBase(path)}`;
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("pt-BR");
}

export default function MemberOperationCenter() {
  const [location] = useLocation();
  const pathname = location.split("?")[0];
  const activeTab = tabs.find(tab => tab.path === pathname)?.key ?? "overview";
  const [period, setPeriod] = useState<Period>("30d");
  const [campaignForm, setCampaignForm] = useState({ name: "", slug: "", destinationUrl: "" });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", whatsapp: "", source: "", campaignId: "", consentNote: "", consent: false });
  const [invitation, setInvitation] = useState({ contactId: "", channel: "link" as "link" | "email" | "whatsapp", message: "" });
  const utils = trpc.useUtils();
  const profile = trpc.member.profile.useQuery();
  const analytics = trpc.member.analytics.useQuery({ period });
  const campaigns = trpc.member.campaigns.useQuery();
  const conversions = trpc.member.conversions.useQuery({ period });
  const contacts = trpc.member.contacts.useQuery();
  const invitations = trpc.member.invitations.useQuery();

  const profileSlug = profile.data?.slug;
  const referralUrl = typeof window !== "undefined" && profileSlug ? `${window.location.origin}${withAppBase(`/?afiliado=${encodeURIComponent(profileSlug)}`)}` : "";
  useEffect(() => {
    if (referralUrl) setCampaignForm(current => ({ ...current, destinationUrl: referralUrl }));
  }, [referralUrl]);

  const createCampaign = trpc.member.createCampaign.useMutation({
    onSuccess: async () => {
      setCampaignForm({ name: "", slug: "", destinationUrl: referralUrl });
      await Promise.all([utils.member.campaigns.invalidate(), utils.member.analytics.invalidate()]);
      toast.success("Campanha criada.");
    },
    onError: error => toast.error(error.message),
  });
  const deleteCampaign = trpc.member.deleteCampaign.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.member.campaigns.invalidate(), utils.member.analytics.invalidate()]);
      toast.success("Campanha removida.");
    },
    onError: error => toast.error(error.message),
  });
  const createContact = trpc.member.createContact.useMutation({
    onSuccess: async () => {
      setContact({ name: "", email: "", whatsapp: "", source: "", campaignId: "", consentNote: "", consent: false });
      await Promise.all([utils.member.contacts.invalidate(), utils.member.analytics.invalidate()]);
      toast.success("Contato consentido registrado.");
    },
    onError: error => toast.error(error.message),
  });
  const updateContact = trpc.member.updateContact.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.member.contacts.invalidate(), utils.member.analytics.invalidate()]);
      toast.success("Status atualizado.");
    },
    onError: error => toast.error(error.message),
  });
  const createInvitation = trpc.member.createInvitation.useMutation({
    onSuccess: async () => {
      setInvitation({ contactId: "", channel: "link", message: "" });
      await utils.member.invitations.invalidate();
      toast.success("Comunicação preparada.");
    },
    onError: error => toast.error(error.message),
  });

  const orderedCampaigns = useMemo(() => [...(analytics.data?.campaigns ?? [])].sort((a, b) => (b.eventClicks - a.eventClicks) || (b.periodConversions - a.periodConversions) || a.name.localeCompare(b.name)), [analytics.data?.campaigns]);
  const copyLink = async (id: number, slug: string) => {
    try {
      await navigator.clipboard.writeText(campaignUrl(profileSlug, slug));
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(current => current === id ? null : current), 1800);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };
  const submitCampaign = (event: FormEvent) => {
    event.preventDefault();
    if (!campaignForm.destinationUrl) return toast.error("Configure seu identificador público primeiro.");
    createCampaign.mutate(campaignForm);
  };
  const submitContact = (event: FormEvent) => {
    event.preventDefault();
    createContact.mutate({
      name: contact.name,
      email: normalizeEmail(contact.email),
      whatsapp: contact.whatsapp || null,
      source: contact.source,
      campaignId: contact.campaignId ? Number(contact.campaignId) : null,
      consentNote: contact.consentNote || null,
      consent: true,
    });
  };
  const submitInvitation = (event: FormEvent) => {
    event.preventDefault();
    createInvitation.mutate({ contactId: invitation.contactId ? Number(invitation.contactId) : null, channel: invitation.channel, message: invitation.message || null });
  };

  const title = activeTab === "campaigns" ? "Campanhas" : activeTab === "traffic" ? "Tráfego" : activeTab === "conversions" ? "Conversões" : activeTab === "contacts" ? "Contatos" : activeTab === "history" ? "Histórico" : "Minha operação";
  const description = activeTab === "overview" ? "Centralize a divulgação, acompanhe a origem dos acessos e veja quais ações geraram interesse." : "Acompanhe dados próprios da sua operação com filtros por período e identificação de origem.";

  return (
    <DashboardLayout menuItems={menu} title="Escritório Virtual">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Central operacional</span>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">{description}</p>
        </header>

        <nav className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950/60 p-2" aria-label="Abas de Minha operação">
          {tabs.map(tab => <a key={tab.key} href={withAppBase(tab.path)} className={`shrink-0 rounded-xl px-3 py-2 text-sm transition ${activeTab === tab.key ? "bg-emerald-300 font-semibold text-black" : "text-zinc-300 hover:bg-white/10 hover:text-white"}`}>{tab.label}</a>)}
        </nav>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-300"><BarChart3 className="size-4 text-emerald-300" />Período das métricas</div>
          <select value={period} onChange={event => setPeriod(event.target.value as Period)} className="rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white" aria-label="Período das métricas">
            <option value="7d">Últimos 7 dias</option><option value="30d">Últimos 30 dias</option><option value="90d">Últimos 90 dias</option><option value="all">Todo o período</option>
          </select>
        </section>

        {activeTab === "overview" && <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Campanhas" value={analytics.data?.totals.campaigns ?? 0} detail="links próprios" />
            <Metric label="Cliques" value={analytics.data?.totals.clicks ?? 0} detail="acessos registrados" accent />
            <Metric label="Visitantes únicos" value={analytics.data?.totals.uniqueVisitors ?? 0} detail="identificadores anônimos" />
            <Metric label="Sessões" value={analytics.data?.totals.sessions ?? 0} detail="jornadas registradas" />
            <Metric label="Conversões" value={analytics.data?.totals.conversions ?? 0} detail="leads e aplicações" />
          </div>
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <Panel title="Campanhas com maior movimentação" icon={<MousePointerClick className="size-5 text-emerald-300" />}>
              {orderedCampaigns.length ? <div className="divide-y divide-white/10">{orderedCampaigns.slice(0, 5).map(item => <CampaignRow key={item.id} campaign={item} profileSlug={profileSlug} copiedId={copiedId} onCopy={copyLink} onDelete={id => deleteCampaign.mutate({ id })} />)}</div> : <Empty text="Crie uma campanha para começar a acompanhar sua operação." />}
            </Panel>
            <Panel title="Conversões recentes" icon={<ClipboardList className="size-5 text-emerald-300" />}>
              {conversions.data?.length ? <div className="space-y-3">{conversions.data.slice(0, 5).map(item => <div key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-3"><div className="flex items-center justify-between gap-3"><strong className="text-sm text-white">{item.conversionType}</strong><span className="text-xs text-zinc-500">{formatDate(item.occurredAt)}</span></div><p className="mt-1 text-sm text-zinc-400">{item.campaignName} · {item.captureMode === "automatic" ? "automática" : "manual"}</p></div>)}</div> : <Empty text="As conversões aparecerão quando houver leads ou aplicações atribuídas." />}
            </Panel>
          </section>
        </section>}

        {activeTab === "campaigns" && <section className="space-y-6">
          <form onSubmit={submitCampaign} className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:grid-cols-[1fr_1fr_1.3fr_auto] lg:items-end">
            <label className="text-sm text-zinc-200">Nome da campanha<input required value={campaignForm.name} onChange={event => setCampaignForm({ ...campaignForm, name: event.target.value })} className={fieldClass} placeholder="Facebook" /></label>
            <label className="text-sm text-zinc-200">Identificador do link<input required value={campaignForm.slug} onChange={event => setCampaignForm({ ...campaignForm, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className={fieldClass} placeholder="facebook" /></label>
            <label className="text-sm text-zinc-200">Destino automático<input readOnly value={campaignForm.destinationUrl} className={`${fieldClass} cursor-not-allowed text-zinc-400`} placeholder="Configure seu perfil público" /></label>
            <button disabled={createCampaign.isPending || !profileSlug} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"><Plus className="size-4" />Criar campanha</button>
          </form>
          <Panel title="Links rastreáveis" icon={<Link2 className="size-5 text-emerald-300" />}>
            {campaigns.data?.length ? <div className="space-y-3">{campaigns.data.map(item => <CampaignRow key={item.id} campaign={item} profileSlug={profileSlug} copiedId={copiedId} onCopy={copyLink} onDelete={id => deleteCampaign.mutate({ id })} />)}</div> : <Empty text="Nenhuma campanha cadastrada ainda." />}
          </Panel>
        </section>}

        {activeTab === "traffic" && <Panel title="Tráfego por campanha" icon={<MousePointerClick className="size-5 text-emerald-300" />}>
          <div className="mb-5 grid gap-4 sm:grid-cols-3"><Metric label="Cliques" value={analytics.data?.totals.clicks ?? 0} detail="eventos" accent /><Metric label="Visitantes únicos" value={analytics.data?.totals.uniqueVisitors ?? 0} detail="por visitorId" /><Metric label="Sessões" value={analytics.data?.totals.sessions ?? 0} detail="por sessionId" /></div>
          {orderedCampaigns.length ? <div className="divide-y divide-white/10">{orderedCampaigns.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><h2 className="font-medium text-white">{item.name}</h2><p className="text-sm text-zinc-400">/{item.slug}</p></div><div className="flex gap-6 text-right"><span><strong className="block text-white">{item.eventClicks}</strong><small className="text-zinc-500">cliques no período</small></span><span><strong className="block text-emerald-200">{item.periodConversions}</strong><small className="text-zinc-500">conversões</small></span></div></div>)}</div> : <Empty text="Ainda não há eventos de tráfego." />}
        </Panel>}

        {activeTab === "conversions" && <Panel title="Conversões atribuídas" icon={<ClipboardList className="size-5 text-emerald-300" />}>
          <div className="mb-5 grid gap-4 sm:grid-cols-3"><Metric label="Total" value={analytics.data?.totals.conversions ?? 0} detail="conversões" accent /><Metric label="Leads" value={analytics.data?.totals.leads ?? 0} detail="contatos" /><Metric label="Aplicações" value={analytics.data?.totals.applications ?? 0} detail="solicitações" /></div>
          {conversions.data?.length ? <div className="divide-y divide-white/10">{conversions.data.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><h2 className="font-medium text-white">{item.campaignName}</h2><p className="text-sm text-zinc-400">{item.conversionType} · {item.captureMode === "automatic" ? "atribuída automaticamente" : "registrada manualmente"}</p></div><span className="text-sm text-zinc-500">{formatDate(item.occurredAt)}</span></div>)}</div> : <Empty text="Nenhuma conversão atribuída no período." />}
        </Panel>}

        {activeTab === "contacts" && <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <form onSubmit={submitContact} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="flex items-center gap-2 text-white"><UsersRound className="size-5 text-emerald-300" /><h2 className="font-medium">Registrar contato consentido</h2></div>
            <p className="text-sm leading-6 text-zinc-400">Salve somente contatos que autorizaram o registro. Selecione uma campanha para associar o lead ao canal de origem.</p>
            <label className="block text-sm text-zinc-200">Nome<input required value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} className={fieldClass} /></label>
            <label className="block text-sm text-zinc-200">E-mail<input required type="email" value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} className={fieldClass} /></label>
            <label className="block text-sm text-zinc-200">WhatsApp<PhoneInput value={contact.whatsapp} onChange={whatsapp => setContact({ ...contact, whatsapp })} className={fieldClass} /></label>
            <label className="block text-sm text-zinc-200">Origem<input required value={contact.source} onChange={event => setContact({ ...contact, source: event.target.value })} className={fieldClass} placeholder="Facebook, conversa presencial..." /></label>
            <label className="block text-sm text-zinc-200">Campanha associada<select value={contact.campaignId} onChange={event => setContact({ ...contact, campaignId: event.target.value })} className={fieldClass}><option value="">Sem campanha</option>{campaigns.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="block text-sm text-zinc-200">Registro do consentimento<textarea value={contact.consentNote} onChange={event => setContact({ ...contact, consentNote: event.target.value })} className={`${fieldClass} min-h-20`} /></label>
            <label className="flex items-start gap-2 text-sm text-zinc-200"><input required type="checkbox" checked={contact.consent} onChange={event => setContact({ ...contact, consent: event.target.checked })} className="mt-1" />Confirmo que há consentimento explícito.</label>
            <button disabled={createContact.isPending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"><UsersRound className="size-4" />Registrar contato</button>
          </form>
          <Panel title="Contatos registrados" icon={<UsersRound className="size-5 text-emerald-300" />}>
            {contacts.data?.length ? <div className="space-y-3">{contacts.data.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium text-white">{item.name}</h3><p className="text-sm text-zinc-400">{item.email}{item.whatsapp ? ` · ${item.whatsapp}` : ""}</p><p className="mt-1 text-xs text-emerald-200">{item.captureType === "campaign" ? "Lead associado a campanha" : "Contato manual"} · {item.source}</p></div><select value={item.status} onChange={event => updateContact.mutate({ id: item.id, status: event.target.value as ContactStatus })} className="rounded-lg border border-white/15 bg-black px-2 py-2 text-sm text-white"><option value="new">Novo</option><option value="contacted">Contatado</option><option value="qualified">Qualificado</option><option value="archived">Arquivado</option></select></div></article>)}</div> : <Empty text="Nenhum contato consentido registrado." />}
          </Panel>
          <div className="lg:col-span-2">
            <form onSubmit={submitInvitation} className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
              <label className="text-sm text-zinc-200">Contato<select value={invitation.contactId} onChange={event => setInvitation({ ...invitation, contactId: event.target.value })} className={fieldClass}><option value="">Sem contato específico</option>{contacts.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="text-sm text-zinc-200">Canal previsto<select value={invitation.channel} onChange={event => setInvitation({ ...invitation, channel: event.target.value as "link" | "email" | "whatsapp" })} className={fieldClass}><option value="link">Link manual</option><option value="email">E-mail manual</option><option value="whatsapp">WhatsApp manual</option></select></label>
              <label className="text-sm text-zinc-200">Anotação ou mensagem prevista<textarea value={invitation.message} onChange={event => setInvitation({ ...invitation, message: event.target.value })} className={`${fieldClass} min-h-10`} /></label>
              <button disabled={createInvitation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"><Link2 className="size-4" />Preparar comunicação</button>
            </form>
            <Panel title="Comunicações preparadas" icon={<Link2 className="size-5 text-emerald-300" />}>
              {invitations.data?.length ? <div className="divide-y divide-white/10">{invitations.data.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><strong className="text-sm text-white">{item.channel === "whatsapp" ? "WhatsApp" : item.channel === "email" ? "E-mail" : "Link"}</strong><p className="text-sm text-zinc-400">{item.message || "Sem anotação"}</p></div><span className="text-xs text-zinc-500">{formatDate(item.createdAt)}</span></div>)}</div> : <Empty text="Nenhuma comunicação preparada." />}
            </Panel>
          </div>
        </section>}

        {activeTab === "history" && <Panel title="Histórico de eventos" icon={<History className="size-5 text-emerald-300" />}>
          {analytics.data?.recentEvents.length ? <div className="divide-y divide-white/10">{analytics.data.recentEvents.map((event, index) => <div key={`${event.campaignId}-${event.occurredAt.toString()}-${index}`} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><h2 className="font-medium text-white">Clique registrado</h2><p className="text-sm text-zinc-400">Campanha #{event.campaignId} · {event.deviceType || "dispositivo não informado"}{event.referrerOrigin ? ` · ${event.referrerOrigin}` : ""}</p></div><span className="text-sm text-zinc-500">{formatDate(event.occurredAt)}</span></div>)}</div> : <Empty text="Nenhum evento registrado no período." />}
        </Panel>}
      </main>
    </DashboardLayout>
  );
}

function Metric({ label, value, detail, accent = false }: { label: string; value: number; detail: string; accent?: boolean }) {
  return <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span><strong className={`mt-2 block text-3xl ${accent ? "text-emerald-200" : "text-white"}`}>{value}</strong><small className="mt-1 block text-zinc-500">{detail}</small></article>;
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="mb-4 flex items-center gap-2 text-white">{icon}<h2 className="font-medium">{title}</h2></div>{children}</section>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">{text}</p>;
}

function CampaignRow({ campaign, profileSlug, copiedId, onCopy, onDelete }: { campaign: { id: number; name: string; slug: string; eventClicks?: number; periodConversions?: number; clicks?: number; leads?: number }; profileSlug?: string; copiedId: number | null; onCopy: (id: number, slug: string) => void; onDelete: (id: number) => void }) {
  const link = campaignUrl(profileSlug, campaign.slug);
  return <article className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="min-w-0"><h3 className="font-medium text-white">{campaign.name}</h3><p className="mt-1 text-sm text-zinc-400">Use este link para rastrear acessos vindos de <strong className="text-emerald-200">{campaign.slug}</strong>.</p><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"><a href={link} target="_blank" rel="noreferrer" className="min-w-0 break-all text-sm text-emerald-200 underline">{link}</a><button type="button" onClick={() => onCopy(campaign.id, campaign.slug)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-300/10"><Copy className="size-4" />{copiedId === campaign.id ? "Copiado" : "Copiar link"}</button></div><p className="mt-2 text-xs text-emerald-200">{campaign.eventClicks ?? campaign.clicks ?? 0} cliques · {campaign.periodConversions ?? campaign.leads ?? 0} conversões</p></div><button type="button" onClick={() => onDelete(campaign.id)} className="rounded-lg border border-red-300/40 px-3 py-2 text-sm text-red-200">Remover</button></div></article>;
}
