import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCircle2, Eye, Pencil, Plus, RotateCcw, Save, Sparkles, Trash2, XCircle } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  PUBLIC_TOAST_CATEGORY,
  PUBLIC_TOAST_SETTINGS_TYPE,
  PUBLIC_TOAST_TEMPLATE_TYPE,
  normalizePublicToastSettings,
  publicToastDefaultSettings,
  publicToastDefaultTemplates,
  type PublicToastSettings,
} from "@shared/publicToastSystem";

type ToastForm = {
  title: string;
  message: string;
  disclaimer: string;
  status: "draft" | "published";
};

const PUBLIC_TOAST_PREVIEW_EVENT = "pagina-lucrativa:toast-preview";

const defaultForm = (): ToastForm => ({
  title: "",
  message: "{{nome}} acabou de se cadastrar",
  disclaimer: "Demonstração ilustrativa — não representa uma atividade real.",
  status: "published",
});

function parseDisclaimer(body?: string | null) {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body) as { disclaimer?: string };
    return parsed.disclaimer ?? "";
  } catch {
    return body;
  }
}

function parseSettings(body?: string | null) {
  if (!body) return publicToastDefaultSettings;
  try {
    return normalizePublicToastSettings(JSON.parse(body));
  } catch {
    return publicToastDefaultSettings;
  }
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description: string }) {
  return <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 text-left transition hover:border-emerald-300/20 sm:gap-4 sm:p-4">
    <span className="min-w-0"><strong className="block text-sm font-medium text-white">{label}</strong><span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span></span>
    <span aria-hidden="true" className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-emerald-300" : "bg-zinc-700"}`}><span className={`absolute top-1 size-5 rounded-full bg-black transition ${checked ? "left-6" : "left-1"}`} /></span>
  </button>;
}

export default function AdminToast() {
  const utils = trpc.useUtils();
  const content = trpc.admin.content.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState<ToastForm>(defaultForm);
  const [settings, setSettings] = useState<PublicToastSettings>(publicToastDefaultSettings);
  const seededRef = useRef(false);
  const settingsLoadedRef = useRef(false);
  const editorRef = useRef<HTMLFormElement | null>(null);

  const toastItems = useMemo(() => (content.data ?? []).filter(item => item.kind === "notice" && item.resourceCategory === PUBLIC_TOAST_CATEGORY && item.resourceType === PUBLIC_TOAST_TEMPLATE_TYPE), [content.data]);
  const settingsItem = useMemo(() => (content.data ?? []).find(item => item.kind === "notice" && item.resourceCategory === PUBLIC_TOAST_CATEGORY && item.resourceType === PUBLIC_TOAST_SETTINGS_TYPE && item.status !== "archived"), [content.data]);
  const visibleItems = toastItems.filter(item => showArchived ? item.status === "archived" : item.status !== "archived");
  const activeCount = toastItems.filter(item => item.status === "published").length;
  const draftCount = toastItems.filter(item => item.status === "draft").length;
  const archivedCount = toastItems.filter(item => item.status === "archived").length;
  const refresh = () => utils.admin.content.invalidate();

  const create = trpc.admin.createContent.useMutation();
  const update = trpc.admin.updateContent.useMutation();
  const updateStatus = trpc.admin.updateContentStatus.useMutation({ onSuccess: () => void refresh(), onError: error => toast.error(error.message) });
  const seedCreate = trpc.admin.createContent.useMutation();

  useEffect(() => {
    if (!settingsItem || settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;
    setSettings(parseSettings(settingsItem.body));
  }, [settingsItem]);

  useEffect(() => {
    if (!content.data || seededRef.current) return;
    const hasAnyTemplate = toastItems.length > 0;
    const hasSettings = Boolean(settingsItem);
    if (hasAnyTemplate && hasSettings) return;
    seededRef.current = true;
    const run = async () => {
      try {
        if (!hasAnyTemplate) {
          for (const model of publicToastDefaultTemplates) {
            await seedCreate.mutateAsync({
              kind: "notice",
              title: model.title,
              summary: model.message,
              body: JSON.stringify({ disclaimer: model.disclaimer }),
              resourceUrl: null,
              resourceCategory: PUBLIC_TOAST_CATEGORY,
              resourceType: PUBLIC_TOAST_TEMPLATE_TYPE,
              status: "published",
            });
          }
        }
        if (!hasSettings) {
          await seedCreate.mutateAsync({
            kind: "notice",
            title: "Configuração do Toast",
            summary: "Configuração global do sistema de Toast.",
            body: JSON.stringify(publicToastDefaultSettings),
            resourceUrl: null,
            resourceCategory: PUBLIC_TOAST_CATEGORY,
            resourceType: PUBLIC_TOAST_SETTINGS_TYPE,
            status: "published",
          });
        }
        await refresh();
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível preparar os modelos iniciais do Toast.");
      }
    };
    void run();
  }, [content.data, settingsItem, toastItems.length]);

  const busy = create.isPending || update.isPending || updateStatus.isPending || seedCreate.isPending;

  function focusEditor() {
    window.requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function startNewModel() {
    setEditingId(null);
    setForm(defaultForm());
    focusEditor();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const title = form.title.trim();
    const message = form.message.trim();
    if (!title || !message) {
      toast.error("Informe o nome interno e a mensagem do Toast.");
      return;
    }
    const payload = {
      kind: "notice" as const,
      title,
      summary: message,
      body: JSON.stringify({ disclaimer: form.disclaimer.trim() }),
      resourceUrl: null,
      resourceCategory: PUBLIC_TOAST_CATEGORY,
      resourceType: PUBLIC_TOAST_TEMPLATE_TYPE,
      status: form.status,
    };
    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      await refresh();
      setEditingId(null);
      setForm(defaultForm());
      toast.success(editingId ? "Modelo atualizado." : "Modelo criado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o modelo.");
    }
  }

  async function saveSettings() {
    const normalized = normalizePublicToastSettings(settings);
    setSettings(normalized);
    const payload = {
      kind: "notice" as const,
      title: "Configuração do Toast",
      summary: "Configuração global do sistema de Toast.",
      body: JSON.stringify(normalized),
      resourceUrl: null,
      resourceCategory: PUBLIC_TOAST_CATEGORY,
      resourceType: PUBLIC_TOAST_SETTINGS_TYPE,
      status: "published" as const,
    };
    try {
      if (settingsItem) await update.mutateAsync({ id: settingsItem.id, ...payload });
      else await create.mutateAsync(payload);
      await refresh();
      toast.success("Configurações do Toast salvas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar as configurações.");
    }
  }

  function previewToast() {
    const message = form.message.trim();
    if (!message) {
      toast.error("Informe uma mensagem para visualizar o Toast.");
      return;
    }
    window.dispatchEvent(new CustomEvent(PUBLIC_TOAST_PREVIEW_EVENT, {
      detail: {
        message,
        disclaimer: form.disclaimer.trim(),
        showSimulationNotice: settings.showSimulationNotice,
        visibleSeconds: settings.visibleSeconds,
      },
    }));
  }

  function edit(item: NonNullable<typeof content.data>[number]) {
    setEditingId(item.id);
    setForm({ title: item.title, message: item.summary ?? "", disclaimer: parseDisclaimer(item.body), status: item.status === "published" ? "published" : "draft" });
    focusEditor();
  }

  function remove(id: number) {
    if (!window.confirm("Excluir este modelo de Toast? Ele será enviado para a lixeira e poderá ser restaurado.")) return;
    updateStatus.mutate({ id, status: "archived" }, { onSuccess: () => toast.success("Modelo enviado para a lixeira.") });
  }

  return <DashboardLayout menuItems={adminMenu} title="Administração"><main className="mx-auto w-full max-w-7xl space-y-4 p-3 sm:p-4 md:space-y-6 md:p-8">
    <header className="relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.16),transparent_38%),linear-gradient(145deg,rgba(9,18,16,.98),rgba(3,8,9,.99))] p-4 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8">
      <div className="absolute right-4 top-4 rounded-full border border-emerald-300/20 bg-emerald-300/5 p-2.5 text-emerald-300 sm:right-5 sm:top-5 sm:p-3"><Sparkles className="size-4 sm:size-5" /></div>
      <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-300 sm:text-[11px] sm:tracking-[.18em]">Sistema · Prova social</span>
      <div className="mt-2 flex items-center gap-2.5 pr-12 sm:mt-3 sm:gap-3"><Bell className="size-6 text-emerald-300 sm:size-7" /><h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">Central de Toast</h1></div>
      <p className="mt-3 max-w-3xl text-xs leading-5 text-zinc-300 sm:mt-4 sm:text-sm sm:leading-6 md:text-base">Gerencie o comportamento, os tempos e todos os modelos exibidos nas páginas públicas. As variáveis <strong className="text-white">{"{{nome}}"}</strong> e <strong className="text-white">{"{{cidade}}"}</strong> são preenchidas automaticamente.</p>
    </header>

    <section className="grid grid-cols-3 gap-2 sm:gap-3">
      <article className="min-w-0 rounded-xl border border-emerald-300/15 bg-zinc-950/70 p-3 sm:rounded-2xl sm:p-5"><span className="block truncate text-[9px] uppercase tracking-wide text-zinc-500 sm:text-xs sm:tracking-wider">Ativos</span><div className="mt-1.5 flex items-end justify-between gap-1 sm:mt-2"><strong className="text-2xl text-white sm:text-3xl">{activeCount}</strong><CheckCircle2 className="size-4 shrink-0 text-emerald-300 sm:size-5" /></div></article>
      <article className="min-w-0 rounded-xl border border-amber-300/15 bg-zinc-950/70 p-3 sm:rounded-2xl sm:p-5"><span className="block truncate text-[9px] uppercase tracking-wide text-zinc-500 sm:text-xs sm:tracking-wider">Rascunhos</span><div className="mt-1.5 flex items-end justify-between gap-1 sm:mt-2"><strong className="text-2xl text-white sm:text-3xl">{draftCount}</strong><XCircle className="size-4 shrink-0 text-amber-300 sm:size-5" /></div></article>
      <article className="min-w-0 rounded-xl border border-white/10 bg-zinc-950/70 p-3 sm:rounded-2xl sm:p-5"><span className="block truncate text-[9px] uppercase tracking-wide text-zinc-500 sm:text-xs sm:tracking-wider">Arquivados</span><div className="mt-1.5 flex items-end justify-between gap-1 sm:mt-2"><strong className="text-2xl text-white sm:text-3xl">{archivedCount}</strong><Trash2 className="size-4 shrink-0 text-zinc-500 sm:size-5" /></div></article>
    </section>

    <section className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-xl sm:rounded-3xl sm:p-5 md:p-6">
      <div className="mb-4 sm:mb-5"><span className="text-[10px] uppercase tracking-wider text-emerald-300 sm:text-xs">Comportamento global</span><h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Configurações do sistema</h2></div>
      <div className="grid gap-3 lg:grid-cols-2 sm:gap-4">
        <Toggle checked={settings.enabled} onChange={value => setSettings(current => ({ ...current, enabled: value }))} label="Sistema de Toast ativo" description="Liga ou desliga todas as notificações públicas sem excluir os modelos." />
        <Toggle checked={settings.showSimulationNotice} onChange={value => setSettings(current => ({ ...current, showSimulationNotice: value }))} label="Exibir aviso de mensagem simulada" description="Controla a exibição do rótulo “Atividade ilustrativa” e do aviso/rodapé do modelo." />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 xl:grid-cols-4">
        <label className="text-xs text-zinc-300 sm:text-sm">Primeira exibição (s)<input type="number" min={1} max={300} value={settings.initialDelaySeconds} onChange={event => setSettings(current => ({ ...current, initialDelaySeconds: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-white sm:px-4 sm:py-3" /></label>
        <label className="text-xs text-zinc-300 sm:text-sm">Intervalo mínimo (s)<input type="number" min={5} max={600} value={settings.intervalMinSeconds} onChange={event => setSettings(current => ({ ...current, intervalMinSeconds: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-white sm:px-4 sm:py-3" /></label>
        <label className="text-xs text-zinc-300 sm:text-sm">Intervalo máximo (s)<input type="number" min={5} max={900} value={settings.intervalMaxSeconds} onChange={event => setSettings(current => ({ ...current, intervalMaxSeconds: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-white sm:px-4 sm:py-3" /></label>
        <label className="text-xs text-zinc-300 sm:text-sm">Tempo visível (s)<input type="number" min={2} max={30} value={settings.visibleSeconds} onChange={event => setSettings(current => ({ ...current, visibleSeconds: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-white sm:px-4 sm:py-3" /></label>
      </div>
      <button type="button" disabled={busy} onClick={() => void saveSettings()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50 sm:mt-5 sm:w-auto"><Save className="size-4" />Salvar configurações</button>
    </section>

    <section className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
      <form ref={editorRef} onSubmit={submit} className="order-2 scroll-mt-24 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-xl sm:space-y-5 sm:rounded-3xl sm:p-5 md:p-6 xl:order-1">
        <div className="flex items-start justify-between gap-3"><div><span className="text-[10px] uppercase tracking-wider text-emerald-300 sm:text-xs">Editor</span><h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">{editingId ? "Editar modelo" : "Novo modelo"}</h2></div>{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(defaultForm()); }} className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">Cancelar</button> : null}</div>
        <label className="block text-sm text-zinc-200">Nome interno<input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} maxLength={240} placeholder="Ex.: Cadastro recente" className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-emerald-300/50" /></label>
        <label className="block text-sm text-zinc-200">Mensagem<textarea value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} maxLength={8000} rows={4} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-emerald-300/50" /></label>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setForm({ ...form, message: `${form.message}{{nome}}` })} className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-xs text-emerald-200">+ nome</button><button type="button" onClick={() => setForm({ ...form, message: `${form.message}{{cidade}}` })} className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-xs text-emerald-200">+ cidade</button></div>
        <label className="block text-sm text-zinc-200">Aviso / rodapé<textarea value={form.disclaimer} onChange={event => setForm({ ...form, disclaimer: event.target.value })} maxLength={4000} rows={2} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-emerald-300/50" /></label>
        <label className="block text-sm text-zinc-200">Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ToastForm["status"] })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white"><option value="published">Ativo</option><option value="draft">Rascunho / desativado</option></select></label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button type="button" onClick={previewToast} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300/25 bg-emerald-300/5 px-3 py-3 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/10 sm:gap-2 sm:px-4 sm:text-sm"><Eye className="size-4 shrink-0" />Preview</button>
          <button disabled={busy} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-300 px-3 py-3 text-xs font-semibold text-black disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-sm">{editingId ? <Pencil className="size-4 shrink-0" /> : <Plus className="size-4 shrink-0" />}{busy ? "Salvando..." : editingId ? "Salvar" : "Criar"}</button>
        </div>
        <p className="text-[11px] leading-4 text-zinc-500 sm:text-xs sm:leading-5">O preview aparece no topo da tela usando o mesmo componente público, sem salvar ou alterar o modelo.</p>
      </form>

      <section className="order-1 rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-xl sm:rounded-3xl sm:p-5 md:p-6 xl:order-2">
        <div className="mb-4 space-y-3 sm:mb-5 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:space-y-0"><div><span className="text-[10px] uppercase tracking-wider text-emerald-300 sm:text-xs">Biblioteca</span><h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Modelos cadastrados</h2></div><div className="grid grid-cols-2 gap-2 sm:flex"><button type="button" onClick={startNewModel} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-300/5 px-3 py-2 text-xs font-medium text-emerald-200"><Plus className="size-3.5" />Novo</button><button type="button" onClick={() => setShowArchived(value => !value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">{showArchived ? "Ver ativos" : `Lixeira (${archivedCount})`}</button></div></div>
        {content.isLoading || seedCreate.isPending ? <p className="text-sm text-zinc-400">Preparando modelos...</p> : visibleItems.length ? <div className="space-y-3">{visibleItems.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-3.5 transition hover:border-emerald-300/20 sm:rounded-2xl sm:p-4"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${item.status === "published" ? "bg-emerald-300/10 text-emerald-300" : item.status === "archived" ? "bg-zinc-800 text-zinc-400" : "bg-amber-300/10 text-amber-200"}`}>{item.status === "published" ? "Ativo" : item.status === "archived" ? "Arquivado" : "Rascunho"}</span><span className="text-[10px] text-zinc-600">#{item.id}</span></div><h3 className="mt-2 break-words font-medium text-white">{item.title}</h3><p className="mt-2 break-words text-sm leading-5 text-zinc-400">{item.summary}</p>{parseDisclaimer(item.body) ? <p className="mt-2 break-words text-[11px] leading-4 text-zinc-600">{parseDisclaimer(item.body)}</p> : null}<div className={`mt-4 grid gap-2 ${item.status === "archived" ? "grid-cols-1" : "grid-cols-3"}`}>{item.status === "archived" ? <button type="button" disabled={busy} onClick={() => updateStatus.mutate({ id: item.id, status: "draft" }, { onSuccess: () => toast.success("Modelo restaurado como rascunho.") })} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300/20 px-2 py-2 text-xs text-emerald-200"><RotateCcw className="size-3.5" />Restaurar</button> : <><button type="button" onClick={() => edit(item)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-[11px] text-zinc-200 sm:gap-1.5 sm:text-xs"><Pencil className="size-3.5 shrink-0" />Editar</button><button type="button" disabled={busy} onClick={() => updateStatus.mutate({ id: item.id, status: item.status === "published" ? "draft" : "published" })} className="rounded-lg border border-emerald-300/20 px-2 py-2 text-[11px] text-emerald-200 sm:text-xs">{item.status === "published" ? "Desativar" : "Ativar"}</button><button type="button" disabled={busy} onClick={() => remove(item.id)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-400/15 px-2 py-2 text-[11px] text-red-300 sm:gap-1.5 sm:text-xs"><Trash2 className="size-3.5 shrink-0" />Excluir</button></>}</div></article>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center sm:p-8"><Bell className="mx-auto size-8 text-zinc-700" /><p className="mt-3 text-sm text-zinc-400">{showArchived ? "A lixeira está vazia." : "Nenhum modelo cadastrado."}</p></div>}
      </section>
    </section>
  </main></DashboardLayout>;
}
