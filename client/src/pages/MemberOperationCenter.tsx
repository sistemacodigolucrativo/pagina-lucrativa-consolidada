import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import GettingStartedReturnButton, { getGettingStartedStepFromLocation, withGettingStartedStep } from "@/components/GettingStartedReturnButton";
import { PhoneInput } from "@/components/PhoneInput";
import { copyTextToClipboard } from "@/lib/clipboard";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { normalizeEmail } from "@shared/contactValidation";
import { validateHttpUrl } from "@shared/structuredValidation";
import { ArrowLeft, BarChart3, ClipboardList, Copy, Eye, History, Link2, MousePointerClick, Plus, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Period = "7d" | "30d" | "90d" | "all";
type ContactStatus = "new" | "contacted" | "qualified" | "archived";

const menu: DashboardMenuItem[] = [
  { icon: BarChart3, label: "Central de Divulgação", path: "/membros/operacao", group: "Início" },
  { icon: Link2, label: "Minha página e perfil", path: "/membros/configuracoes", group: "Minha página" },
  { icon: UsersRound, label: "Minha rede", path: "/membros/rede", group: "Rede" },
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
const errorClass = "mt-1 block text-xs text-red-300";

function campaignUrl(profileSlug: string | undefined, slug: string) {
  const path = profileSlug ? `/r/${encodeURIComponent(profileSlug)}/${encodeURIComponent(slug)}` : `/${encodeURIComponent(slug)}`;
  return typeof window === "undefined" ? path : `${window.location.origin}${withAppBase(path)}`;
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("pt-BR");
}

function conversionRate(conversions: number, visitors: number) {
  if (!visitors) return "0,00%";
  return `${((conversions / visitors) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function MemberOperationCenter() {
  const [location, setLocation] = useLocation();
  const pathname = location.split("?")[0];
  const detailMatch = pathname.match(/^\/membros\/operacao\/(\d+)$/);
  const selectedCampaignId = detailMatch ? Number(detailMatch[1]) : null;
  const activeTab = selectedCampaignId ? "detail" : (tabs.find(tab => tab.path === pathname)?.key ?? "overview");
  const onboardingStep = getGettingStartedStepFromLocation(location);
  const isDisclosureGuide = activeTab === "campaigns" && onboardingStep === "disclosure";
  const [period, setPeriod] = useState<Period>("30d");
  const [campaignForm, setCampaignForm] = useState({ name: "", slug: "", destinationUrl: "", source: "", medium: "social", content: "" });
  const [campaignErrors, setCampaignErrors] = useState<Partial<Record<keyof typeof campaignForm, string>>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", whatsapp: "", source: "", campaignId: "", consentNote: "", consent: false });
  const [invitation, setInvitation] = useState({ contactId: "", channel: "link" as "link" | "email" | "whatsapp", message: "" });
  const utils = trpc.useUtils();
  const profile = trpc.member.profile.useQuery();
  const analytics = trpc.member.analytics.useQuery({ period });
  const campaigns = trpc.member.campaigns.useQuery();
  const conversions = trpc.member.conversions.useQuery({ period });
  const contacts = trpc.member.contacts.useQuery();
  const invitations = trpc.member.invitations.useQuery();
  const markMetricsViewed = trpc.member.markGettingStartedMetricsViewed.useMutation({
    onSuccess: async () => {
      await utils.member.profile.invalidate();
    },
  });

  const profileSlug = profile.data?.slug;
  const referralUrl = typeof window !== "undefined" && profileSlug ? `${window.location.origin}${withAppBase(`/?afiliado=${encodeURIComponent(profileSlug)}`)}` : "";
  useEffect(() => {
    if (referralUrl) setCampaignForm(current => ({ ...current, destinationUrl: referralUrl }));
  }, [referralUrl]);

  useEffect(() => {
    if (activeTab !== "overview" || onboardingStep !== "metrics") return;
    if (profile.data?.metricsViewedAt || markMetricsViewed.isPending || markMetricsViewed.isSuccess) return;
    if ((analytics.data?.totals.clicks ?? 0) <= 0) return;
    markMetricsViewed.mutate();
  }, [activeTab, analytics.data?.totals.clicks, markMetricsViewed, onboardingStep, profile.data?.metricsViewedAt]);

  const createCampaign = trpc.member.createCampaign.useMutation({
    onSuccess: async () => {
      setCampaignForm({ name: "", slug: "", destinationUrl: referralUrl, source: "", medium: "social", content: "" });
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
  const selectedCampaign = selectedCampaignId ? orderedCampaigns.find(item => item.id === selectedCampaignId) : null;
  const selectedConversions = selectedCampaignId ? (conversions.data ?? []).filter(item => item.campaignId === selectedCampaignId) : [];
  const selectedEvents = selectedCampaignId ? (analytics.data?.recentEvents ?? []).filter(item => item.campaignId === selectedCampaignId) : [];

  const copyText = async (text: string, onCopied: () => void) => {
    const copied = await copyTextToClipboard(text);
    if (copied) {
      onCopied();
      toast.success("Link copiado.");
    } else {
      toast.error("Não foi possível copiar o link.");
    }
  };
  const copyReferralLink = () => {
    if (!referralUrl) return;
    void copyText(referralUrl, () => {
      setCopiedReferral(true);
      window.setTimeout(() => setCopiedReferral(false), 1800);
    });
  };
  const copyLink = async (id: number, slug: string) => {
    await copyText(campaignUrl(profileSlug, slug), () => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(current => current === id ? null : current), 1800);
    });
  };

  const submitCampaign = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof typeof campaignForm, string>> = {};
    if (!campaignForm.name.trim()) nextErrors.name = "Este campo é obrigatório.";
    if (!campaignForm.slug.trim()) nextErrors.slug = "Este campo é obrigatório.";
    if (campaignForm.slug.trim() && !/^[a-z0-9-]{3,128}$/.test(campaignForm.slug.trim())) nextErrors.slug = "Use letras, números e hífens, com pelo menos 3 caracteres.";
    if (!campaignForm.destinationUrl.trim()) nextErrors.destinationUrl = "Configure sua Código Lucrativo primeiro.";
    if (campaignForm.destinationUrl.trim() && !validateHttpUrl(campaignForm.destinationUrl)) nextErrors.destinationUrl = "O destino precisa ser uma URL válida.";
    if (Object.keys(nextErrors).length) {
      setCampaignErrors(nextErrors);
      toast.error("Corrija os campos indicados antes de criar a campanha.");
      return;
    }
    setCampaignErrors({});
    createCampaign.mutate({
      ...campaignForm,
      source: campaignForm.source || null,
      medium: campaignForm.medium || null,
      content: campaignForm.content || null,
    });
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

  const title = isDisclosureGuide ? "Faça sua primeira divulgação" : activeTab === "detail" ? (selectedCampaign?.name ?? "Campanha") : activeTab === "campaigns" ? "Campanhas" : activeTab === "traffic" ? "Tráfego" : activeTab === "conversions" ? "Conversões" : activeTab === "contacts" ? "Contatos" : activeTab === "history" ? "Histórico" : "Visão geral";
  const description = isDisclosureGuide
    ? "Compartilhe seu link e comece a receber visitantes."
    : activeTab === "overview"
    ? "Acompanhe em um só lugar o desempenho das suas campanhas de divulgação."
    : activeTab === "campaigns"
      ? "Crie e gerencie campanhas de divulgação com links rastreáveis."
      : activeTab === "detail"
        ? "Métricas exclusivas desta campanha no período selecionado."
        : activeTab === "traffic"
          ? "Acompanhe acessos, visitantes e sessões gerados pelas suas campanhas."
          : activeTab === "conversions"
            ? "Acompanhe as conversões e os resultados gerados pelas suas campanhas de divulgação."
            : activeTab === "contacts"
              ? "Organize contatos consentidos e comunicações vinculadas às suas campanhas."
              : "Consulte os registros recentes da sua divulgação por período e origem.";

  return (
    <DashboardLayout menuItems={menu} title="Escritório Virtual">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Central de Divulgação</span>
            {activeTab === "detail" ? <a href={withAppBase("/membros/operacao/campanhas")} className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300 transition hover:border-emerald-300/35 hover:text-white"><ArrowLeft className="size-4" />Voltar para campanhas</a> : null}
          </div>
          <h1 className="break-words text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">{description}</p>
        </header>

        {activeTab !== "detail" && !isDisclosureGuide ? <nav className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4" aria-label="Menu da Central de Divulgação">
          <label className="block text-sm font-medium text-zinc-200">
            Seção da central
            <select
              value={tabs.find(tab => tab.key === activeTab)?.path ?? "/membros/operacao"}
              onChange={event => setLocation(onboardingStep ? withGettingStartedStep(event.target.value, onboardingStep) : event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30"
            >
              {tabs.map(tab => <option key={tab.key} value={tab.path}>{tab.label}</option>)}
            </select>
          </label>
        </nav> : null}

        {!isDisclosureGuide ? <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-300"><BarChart3 className="size-4 text-emerald-300" />Período das métricas</div>
          <select value={period} onChange={event => setPeriod(event.target.value as Period)} className="rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white" aria-label="Período das métricas">
            <option value="7d">Últimos 7 dias</option><option value="30d">Últimos 30 dias</option><option value="90d">Últimos 90 dias</option><option value="all">Todo o período</option>
          </select>
        </section> : null}

        {activeTab === "overview" && <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Campanhas" value={analytics.data?.totals.campaigns ?? 0} detail="links rastreáveis" />
            <Metric label="Cliques" value={analytics.data?.totals.clicks ?? 0} detail="links de divulgação" accent />
            <Metric label="Visitantes únicos" value={analytics.data?.totals.uniqueVisitors ?? 0} detail="links de divulgação" />
            <Metric label="Sessões" value={analytics.data?.totals.sessions ?? 0} detail="links de divulgação" />
            <Metric label="Conversões" value={analytics.data?.totals.conversions ?? 0} detail="todas as campanhas" />
          </div>
          <Panel title="Desempenho por campanha" icon={<MousePointerClick className="size-5 text-emerald-300" />}>
            {orderedCampaigns.length ? <div className="space-y-3">{orderedCampaigns.map(item => <OperationSummary key={item.id} item={item} />)}</div> : <Empty text="Você ainda não criou nenhuma campanha. Crie seu primeiro link rastreável para começar a medir sua divulgação." />}
          </Panel>
        </section>}

        {activeTab === "campaigns" && (isDisclosureGuide ? <section className="space-y-6">
          <Panel title="Link de indicação" icon={<Link2 className="size-5 text-emerald-300" />}>
            <div className="space-y-4">
              <p className="text-sm leading-6 text-zinc-400">Use este link principal para divulgar sua Código Lucrativo.</p>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-500">URL individual do membro</span>
                <p className="mt-2 break-all font-mono text-sm text-emerald-100">{referralUrl || "Configure sua Código Lucrativo para liberar seu link principal."}</p>
              </div>
              <button type="button" onClick={copyReferralLink} disabled={!referralUrl} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50">
                <Copy className="size-4" />{copiedReferral ? "Link copiado!" : "Copiar link"}
              </button>
            </div>
          </Panel>
          <Panel title="Minhas campanhas" icon={<MousePointerClick className="size-5 text-emerald-300" />}>
            {campaigns.data?.length ? <div className="space-y-3">{campaigns.data.map(item => <DisclosureCampaignRow key={item.id} campaign={item} profileSlug={profileSlug} copiedId={copiedId} onCopy={copyLink} />)}</div> : <Empty text="Você ainda não possui campanhas de divulgação." />}
          </Panel>
        </section> : <section className="space-y-6">
          <form onSubmit={submitCampaign} className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:grid-cols-2">
            <div className="lg:col-span-2"><h2 className="font-medium text-white">Criar nova campanha</h2><p className="mt-1 text-sm text-zinc-400">O slug identifica a origem no seu link. Exemplo: facebook, instagram-bio ou whatsapp-grupo.</p></div>
            <label className="text-sm text-zinc-200">Nome da campanha *<input required value={campaignForm.name} onChange={event => { setCampaignErrors(current => ({ ...current, name: undefined })); setCampaignForm({ ...campaignForm, name: event.target.value }); }} aria-invalid={Boolean(campaignErrors.name) || undefined} className={fieldClass} placeholder="Facebook - Perfil" />{campaignErrors.name ? <small className={errorClass} role="alert">{campaignErrors.name}</small> : null}</label>
            <label className="text-sm text-zinc-200">Slug *<input required value={campaignForm.slug} onChange={event => { setCampaignErrors(current => ({ ...current, slug: undefined })); setCampaignForm({ ...campaignForm, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }); }} aria-invalid={Boolean(campaignErrors.slug) || undefined} className={fieldClass} placeholder="facebook" />{campaignErrors.slug ? <small className={errorClass} role="alert">{campaignErrors.slug}</small> : null}</label>
            <label className="text-sm text-zinc-200">Origem <span className="text-zinc-500">(opcional)</span><select value={campaignForm.source} onChange={event => setCampaignForm({ ...campaignForm, source: event.target.value })} className={fieldClass}><option value="">Outra / não definida</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="whatsapp">WhatsApp</option><option value="youtube">YouTube</option><option value="google">Google</option><option value="tiktok">TikTok</option></select></label>
            <label className="text-sm text-zinc-200">Meio <span className="text-zinc-500">(opcional)</span><select value={campaignForm.medium} onChange={event => setCampaignForm({ ...campaignForm, medium: event.target.value })} className={fieldClass}><option value="social">Social</option><option value="messaging">Mensagem</option><option value="paid">Anúncio pago</option><option value="organic">Orgânico</option><option value="referral">Indicação</option><option value="other">Outro</option></select></label>
            <label className="text-sm text-zinc-200">Identificação do conteúdo <span className="text-zinc-500">(opcional)</span><input value={campaignForm.content} onChange={event => setCampaignForm({ ...campaignForm, content: event.target.value })} className={fieldClass} placeholder="reels-01, bio, grupo-a..." /></label>
            <label className="text-sm text-zinc-200">Destino automático *<input readOnly value={campaignForm.destinationUrl} aria-invalid={Boolean(campaignErrors.destinationUrl) || undefined} className={`${fieldClass} cursor-not-allowed text-zinc-400`} placeholder="Configure sua Código Lucrativo" />{campaignErrors.destinationUrl ? <small className={errorClass} role="alert">{campaignErrors.destinationUrl}</small> : null}</label>
            <div className="lg:col-span-2"><button disabled={createCampaign.isPending || !profileSlug} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"><Plus className="size-4" />Criar campanha</button>{!profileSlug ? <a href={withAppBase("/membros/configuracoes")} className="ml-3 text-sm text-amber-200 underline">Configure sua página primeiro</a> : null}</div>
          </form>
          <Panel title="Minhas campanhas" icon={<Link2 className="size-5 text-emerald-300" />}>
            {campaigns.data?.length ? <div className="space-y-3">{campaigns.data.map(item => <CampaignRow key={item.id} campaign={item} analytics={orderedCampaigns.find(row => row.id === item.id)} profileSlug={profileSlug} copiedId={copiedId} onCopy={copyLink} onDelete={id => deleteCampaign.mutate({ id })} />)}</div> : <Empty text="Nenhuma campanha criada ainda." />}
          </Panel>
        </section>)}

        {activeTab === "detail" && (selectedCampaign ? <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Cliques" value={selectedCampaign.eventClicks} detail="nesta campanha" accent />
            <Metric label="Visitantes únicos" value={selectedCampaign.uniqueVisitors} detail="nesta campanha" />
            <Metric label="Sessões" value={selectedCampaign.sessions} detail="nesta campanha" />
            <Metric label="Conversões" value={selectedCampaign.periodConversions} detail="nesta campanha" />
            <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"><span className="text-xs uppercase tracking-wider text-zinc-500">Taxa de conversão</span><strong className="mt-2 block text-3xl text-white">{conversionRate(selectedCampaign.periodConversions, selectedCampaign.uniqueVisitors)}</strong><small className="mt-1 block text-zinc-500">conversões ÷ visitantes</small></article>
          </div>
          <Panel title="Identificação da campanha" icon={<Link2 className="size-5 text-emerald-300" />}>
            <div className="grid gap-4 md:grid-cols-2"><Info label="Link rastreável" value={campaignUrl(profileSlug, selectedCampaign.slug)} /><Info label="Slug" value={selectedCampaign.slug} /><Info label="Origem" value={selectedCampaign.source || "Não definida"} /><Info label="Meio" value={selectedCampaign.medium || "Não definido"} /><Info label="Conteúdo" value={selectedCampaign.content || "Não definido"} /><Info label="Status" value={selectedCampaign.status} /></div>
          </Panel>
          <Panel title="Conversões desta campanha" icon={<ClipboardList className="size-5 text-emerald-300" />}>
            {selectedConversions.length ? <div className="divide-y divide-white/10">{selectedConversions.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><h3 className="font-medium text-white">{item.conversionType}</h3><p className="text-sm text-zinc-400">{item.captureMode === "automatic" ? "Atribuída automaticamente" : "Registrada manualmente"}</p></div><span className="text-sm text-zinc-500">{formatDate(item.occurredAt)}</span></div>)}</div> : <Empty text="Nenhuma conversão atribuída a esta campanha no período." />}
          </Panel>
          <Panel title="Atividade recente desta campanha" icon={<History className="size-5 text-emerald-300" />}>
            {selectedEvents.length ? <div className="divide-y divide-white/10">{selectedEvents.map((event, index) => <div key={`${event.campaignId}-${event.occurredAt.toString()}-${index}`} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><h3 className="font-medium text-white">Clique registrado</h3><p className="text-sm text-zinc-400">{event.deviceType || "dispositivo não informado"}{event.referrerOrigin ? ` · ${event.referrerOrigin}` : ""}</p></div><span className="text-sm text-zinc-500">{formatDate(event.occurredAt)}</span></div>)}</div> : <Empty text="Nenhum evento recente desta campanha no período." />}
          </Panel>
        </section> : <Empty text="Campanha não encontrada ou sem dados disponíveis." />)}

        {activeTab === "traffic" && <Panel title="Tráfego por campanha" icon={<MousePointerClick className="size-5 text-emerald-300" />}>
          <div className="mb-5 grid gap-4 sm:grid-cols-3"><Metric label="Cliques" value={analytics.data?.totals.clicks ?? 0} detail="globais" accent /><Metric label="Visitantes únicos" value={analytics.data?.totals.uniqueVisitors ?? 0} detail="globais" /><Metric label="Sessões" value={analytics.data?.totals.sessions ?? 0} detail="globais" /></div>
          {orderedCampaigns.length ? <div className="space-y-3">{orderedCampaigns.map(item => <OperationSummary key={item.id} item={item} />)}</div> : <Empty text="Ainda não há eventos de tráfego." />}
        </Panel>}

        {activeTab === "conversions" && <Panel title="Conversões atribuídas" icon={<ClipboardList className="size-5 text-emerald-300" />}>
          <div className="mb-5 grid gap-4 sm:grid-cols-3"><Metric label="Total" value={analytics.data?.totals.conversions ?? 0} detail="conversões" accent /><Metric label="Leads" value={analytics.data?.totals.leads ?? 0} detail="contatos" /><Metric label="Aplicações" value={analytics.data?.totals.applications ?? 0} detail="solicitações" /></div>
          {conversions.data?.length ? <div className="divide-y divide-white/10">{conversions.data.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><a href={withAppBase(`/membros/operacao/${item.campaignId}`)} className="font-medium text-white hover:text-emerald-200">{item.campaignName}</a><p className="text-sm text-zinc-400">{item.conversionType} · {item.captureMode === "automatic" ? "atribuída automaticamente" : "registrada manualmente"}</p></div><span className="text-sm text-zinc-500">{formatDate(item.occurredAt)}</span></div>)}</div> : <Empty text="Você ainda não possui conversões. Continue divulgando suas campanhas. Assim que seu primeiro resultado for registrado, ele aparecerá aqui e a última etapa dos Primeiros Passos será concluída automaticamente." />}
        </Panel>}

        {activeTab === "contacts" && <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <form onSubmit={submitContact} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="flex items-center gap-2 text-white"><UsersRound className="size-5 text-emerald-300" /><h2 className="font-medium">Registrar contato consentido</h2></div>
            <p className="text-sm leading-6 text-zinc-400">Salve somente contatos que autorizaram o registro. Associe uma campanha quando souber a origem.</p>
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
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={submitInvitation} className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
              <label className="text-sm text-zinc-200">Contato<select value={invitation.contactId} onChange={event => setInvitation({ ...invitation, contactId: event.target.value })} className={fieldClass}><option value="">Sem contato específico</option>{contacts.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="text-sm text-zinc-200">Canal previsto<select value={invitation.channel} onChange={event => setInvitation({ ...invitation, channel: event.target.value as "link" | "email" | "whatsapp" })} className={fieldClass}><option value="link">Link manual</option><option value="email">E-mail manual</option><option value="whatsapp">WhatsApp manual</option></select></label>
              <label className="text-sm text-zinc-200">Mensagem preparada<textarea value={invitation.message} onChange={event => setInvitation({ ...invitation, message: event.target.value })} className={`${fieldClass} min-h-10`} /></label>
              <button disabled={createInvitation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"><Link2 className="size-4" />Preparar comunicação</button>
            </form>
            <Panel title="Comunicações preparadas" icon={<Link2 className="size-5 text-emerald-300" />}>
              {invitations.data?.length ? <div className="divide-y divide-white/10">{invitations.data.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><strong className="text-sm text-white">{item.channel === "whatsapp" ? "WhatsApp" : item.channel === "email" ? "E-mail" : "Link"}</strong><p className="text-sm text-zinc-400">{item.message || "Sem anotação"}</p></div><span className="text-xs text-zinc-500">{formatDate(item.createdAt)}</span></div>)}</div> : <Empty text="Nenhuma comunicação preparada." />}
            </Panel>
          </div>
        </section>}

        {activeTab === "history" && <Panel title="Histórico de eventos" icon={<History className="size-5 text-emerald-300" />}>
          {analytics.data?.recentEvents.length ? <div className="divide-y divide-white/10">{analytics.data.recentEvents.map((event, index) => { const campaign = orderedCampaigns.find(item => item.id === event.campaignId); return <div key={`${event.campaignId}-${event.occurredAt.toString()}-${index}`} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><a href={withAppBase(`/membros/operacao/${event.campaignId}`)} className="font-medium text-white hover:text-emerald-200">{campaign?.name ?? `Campanha #${event.campaignId}`}</a><p className="text-sm text-zinc-400">Clique · {event.deviceType || "dispositivo não informado"}{event.referrerOrigin ? ` · ${event.referrerOrigin}` : ""}</p></div><span className="text-sm text-zinc-500">{formatDate(event.occurredAt)}</span></div>; })}</div> : <Empty text="Nenhum evento registrado no período." />}
        </Panel>}
      </main>
      <GettingStartedReturnButton />
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

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-black/25 p-4"><span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span><p className="mt-1 break-all text-sm text-zinc-200">{value}</p></div>;
}

type AnalyticsCampaign = {
  id: number;
  name: string;
  slug: string;
  source: string | null;
  medium: string | null;
  content: string | null;
  status: "active" | "paused" | "archived";
  eventClicks: number;
  uniqueVisitors: number;
  sessions: number;
  periodConversions: number;
};

function OperationSummary({ item }: { item: AnalyticsCampaign }) {
  return <article className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium text-white">{item.name}</h3>{item.source ? <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-zinc-400">{item.source}</span> : null}</div><p className="mt-1 text-sm text-zinc-500">/{item.slug}</p></div><div className="flex flex-wrap gap-5"><MiniMetric label="Cliques" value={item.eventClicks} /><MiniMetric label="Visitantes" value={item.uniqueVisitors} /><MiniMetric label="Conversões" value={item.periodConversions} /><MiniMetric label="Taxa" value={conversionRate(item.periodConversions, item.uniqueVisitors)} /></div><a href={withAppBase(`/membros/operacao/${item.id}`)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-300/10"><Eye className="size-4" />Ver métricas</a></div></article>;
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return <span><strong className="block text-white">{value}</strong><small className="text-zinc-500">{label}</small></span>;
}

function campaignChannel(campaign: { source?: string | null; medium?: string | null }) {
  return campaign.source || campaign.medium || "Canal não definido";
}

function DisclosureCampaignRow({ campaign, profileSlug, copiedId, onCopy }: { campaign: { id: number; name: string; slug: string; source?: string | null; medium?: string | null }; profileSlug?: string; copiedId: number | null; onCopy: (id: number, slug: string) => void }) {
  const link = campaignUrl(profileSlug, campaign.slug);
  return <article className="rounded-xl border border-white/10 bg-black/30 p-4">
    <div className="space-y-4">
      <div className="min-w-0">
        <h3 className="font-medium text-white">{campaign.name}</h3>
        <p className="mt-1 text-sm text-zinc-400">{campaignChannel(campaign)}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/25 p-3">
        <span className="text-xs uppercase tracking-wider text-zinc-500">Link da campanha</span>
        <a href={link} target="_blank" rel="noreferrer" className="mt-2 block break-all font-mono text-sm text-emerald-100 underline underline-offset-4">{link}</a>
      </div>
      <button type="button" onClick={() => onCopy(campaign.id, campaign.slug)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/45 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/10 active:scale-[.98] sm:w-auto">
        <Copy className="size-4" />{copiedId === campaign.id ? "Link copiado!" : "Copiar link"}
      </button>
    </div>
  </article>;
}

function CampaignRow({ campaign, analytics, profileSlug, copiedId, onCopy, onDelete }: { campaign: { id: number; name: string; slug: string; source?: string | null }; analytics?: AnalyticsCampaign; profileSlug?: string; copiedId: number | null; onCopy: (id: number, slug: string) => void; onDelete: (id: number) => void }) {
  const link = campaignUrl(profileSlug, campaign.slug);
  return <article className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium text-white">{campaign.name}</h3>{campaign.source ? <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-zinc-400">{campaign.source}</span> : null}</div><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"><a href={link} target="_blank" rel="noreferrer" className="min-w-0 break-all text-sm text-emerald-200 underline">{link}</a><button type="button" onClick={() => onCopy(campaign.id, campaign.slug)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-300/10"><Copy className="size-4" />{copiedId === campaign.id ? "Copiado" : "Copiar link"}</button></div><p className="mt-2 text-xs text-emerald-200">{analytics?.eventClicks ?? 0} cliques · {analytics?.uniqueVisitors ?? 0} visitantes · {analytics?.periodConversions ?? 0} conversões</p></div><div className="flex gap-2"><a href={withAppBase(`/membros/operacao/${campaign.id}`)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"><BarChart3 className="size-4" />Métricas</a><button type="button" onClick={() => onDelete(campaign.id)} className="rounded-lg border border-red-300/40 px-3 py-2 text-sm text-red-200">Remover</button></div></div></article>;
}
