import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCircle2, ChevronDown, ChevronUp, Copy, Eye, Pencil, RotateCcw, Save, Sparkles, Trash2, XCircle } from "lucide-react";
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
  const [duplicateSourceId, setDuplicateSourceId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
  const editorOpen = editingId !== null || duplicateSourceId !== null;
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
    window.requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  function closeEditor() {
    setEditingId(null);
    setDuplicateSourceId(null);
    setForm(defaultForm());
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
      const wasEditing = editingId !== null;
      const wasDuplicating = duplicateSourceId !== null;
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      await refresh();
      closeEditor();
      toast.success(wasEditing ? "Modelo atualizado." : wasDuplicating ? "Cópia criada como novo Toast." : "Modelo criado.");
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

  function dispatchPreview(message: string, disclaimer: string) {
    if (!message.trim()) {
      toast.error("Este modelo não possui uma mensagem para visualizar.");
      return;
    }
    window.dispatchEvent(new CustomEvent(PUBLIC_TOAST_PREVIEW_EVENT, {
      detail: {
        message: message.trim(),
        disclaimer: disclaimer.trim(),
        showSimulationNotice: settings.showSimulationNotice,
        visibleSeconds: settings.visibleSeconds,
      },
    }));
  }

  function previewForm() {
    dispatchPreview(form.message, form.disclaimer);
  }

  function previewItem(item: NonNullable<typeof content.data>[number]) {
    dispatchPreview(item.summary ?? "", parseDisclaimer(item.body));
  }

  function edit(item: NonNullable<typeof content.data>[number]) {
    setDuplicateSourceId(null);
    setEditingId(item.id);
    setForm({ title: item.title, message: item.summary ?? "", disclaimer: parseDisclaimer(item.body), status: item.status === "published" ? "published" : "draft" });
    focusEditor();
  }

  function duplicate(item: NonNullable<typeof content.data>[number]) {
    setEditingId(null);
    setDuplicateSourceId(item.id);
    setForm({
      title: `${item.title} — cópia`,
      message: item.summary ?? "",
      disclaimer: parseDisclaimer(item.body),
      status: "draft",
    });
    focusEditor();
  }

  function remove(id: number) {
    if (!window.confirm("Excluir este modelo de Toast? Ele será enviado para a lixeira e poderá ser restaurado.")) return;
    updateStatus.mutate({ id, status: "archived" }, { onSuccess: () => {
      if (expandedId === id) setExpandedId(null);
      if (editingId === id) closeEditor();
      toast.success("Modelo enviado para a lixeira.");
    } });
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
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
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

    <section className={`grid gap-4 md:gap-6 ${editorOpen ? "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]" : ""}`}>
      <section className={`rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-xl sm:rounded-3xl sm:p-5 md:p-6 ${editorOpen ? "" : "xl:max-w-none"}`}>
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5"><div><span className="text-[10px] uppercase tracking-wider text-emerald-300 sm:text-xs">Biblioteca</span><h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Modelos cadastrados</h2></div><button type="button" onClick={() => { setShowArchived(value => !value); setExpandedId(null); }} className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">{showArchived ? "Ver ativos" : `Lixeira (${archivedCount})`}</button></div>
        {content.isLoading || seedCreate.isPending ? <p className="text-sm text-zinc-400">Preparando modelos...</p> : visibleItems.length ? <div className="space-y-2">{visibleItems.map(item => {
          const expanded = expandedId === item.id;
          return <article key={item.id} className={`overflow-hidden rounded-xl border bg-black/30 transition ${expanded ? "border-emerald-300/25" : "border-white/10 hover:border-white/20"}`}>
            <button type="button" aria-expanded={expanded} onClick={() => setExpandedId(current => current === item.id ? null : item.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left sm:px-4 sm:py-3">
              <span className={`size-2.5 shrink-0 rounded-full ${item.status === "published" ? "bg-emerald-300" : item.status === "archived" ? "bg-zinc-600" : "bg-amber-300"}`} />
              <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-medium text-white">{item.title}</strong><span className="mt-0.5 block truncate text-[11px] text-zinc-500">{item.summary || "Sem mensagem cadastrada"}</span></span>
              <span className="hidden rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-zinc-400 sm:inline">{item.status === "published" ? "Ativo" : item.status === "archived" ? "Arquivado" : "Rascunho"}</span>
              {expanded ? <ChevronUp className="size-4 shrink-0 text-zinc-500" /> : <ChevronDown className="size-4 shrink-0 text-zinc-500" />}
            </button>
            {expanded ? <div className="border-t border-white/10 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
              <div className="rounded-lg bg-white/[.025] p-3"><p className="break-words text-sm leading-5 text-zinc-300">{item.summary || "Sem mensagem cadastrada."}</p>{parseDisclaimer(item.body) ? <p className="mt-2 break-words text-[11px] leading-4 text-zinc-600">{parseDisclaimer(item.body)}</p> : null}</div>
              {item.status === "archived" ? <div className="mt-3"><button type="button" disabled={busy} onClick={() => updateStatus.mutate({ id: item.id, status: "draft" }, { onSuccess: () => toast.success("Modelo restaurado como rascunho.") })} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-300/20 px-3 py-2.5 text-xs text-emerald-200 sm:w-auto"><RotateCcw className="size-3.5" />Restaurar</button></div> : <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <button type="button" onClick={() => previewItem(item)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300/20 bg-emerald-300/5 px-2 py-2.5 text-xs text-emerald-200"><Eye className="size-3.5" />Visualizar</button>
                <button type="button" onClick={() => edit(item)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 py-2.5 text-xs text-zinc-200"><Pencil className="size-3.5" />Editar</button>
                <button type="button" onClick={() => duplicate(item)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-300/15 px-2 py-2.5 text-xs text-sky-200"><Copy className="size-3.5" />Duplicar</button>
                <button type="button" disabled={busy} onClick={() => updateStatus.mutate({ id: item.id, status: item.status === "published" ? "draft" : "published" })} className="rounded-lg border border-amber-300/15 px-2 py-2.5 text-xs text-amber-100">{item.status === "published" ? "Desativar" : "Ativar"}</button>
                <button type="button" disabled={busy} onClick={() => remove(item.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-400/15 px-2 py-2.5 text-xs text-red-300"><Trash2 className="size-3.5" />Excluir</button>
              </div>}
            </div> : null}
          </article>;
        })}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center sm:p-8"><Bell className="mx-auto size-8 text-zinc-700" /><p className="mt-3 text-sm text-zinc-400">{showArchived ? "A lixeira está vazia." : "Nenhum modelo cadastrado."}</p></div>}
      </section>

      {editorOpen ? <form ref={editorRef} onSubmit={submit} className="scroll-mt-24 space-y-4 rounded-2xl border border-emerald-300/15 bg-zinc-950/80 p-4 shadow-xl sm:space-y-5 sm:rounded-3xl sm:p-5 md:p-6">
        <div className="flex items-start justify-between gap-3"><div><span className="text-[10px] uppercase tracking-wider text-emerald-300 sm:text-xs">Editor</span><h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">{editingId ? "Editar modelo" : "Duplicar modelo"}</h2>{duplicateSourceId ? <p className="mt-1 text-xs text-zinc-500">A cópia será criada como um novo Toast independente.</p> : null}</div><button type="button" onClick={closeEditor} className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">Cancelar</button></div>
        <label className="block text-sm text-zinc-200">Nome interno<input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} maxLength={240} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-emerald-300/50" /></label>
        <label className="block text-sm text-zinc-200">Mensagem<textarea value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} maxLength={8000} rows={4} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-emerald-300/50" /></label>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setForm({ ...form, message: `${form.message}{{nome}}` })} className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-xs text-emerald-200">+ nome</button><button type="button" onClick={() => setForm({ ...form, message: `${form.message}{{cidade}}` })} className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-xs text-emerald-200">+ cidade</button></div>
        <label className="block text-sm text-zinc-200">Aviso / rodapé<textarea value={form.disclaimer} onChange={event => setForm({ ...form, disclaimer: event.target.value })} maxLength={4000} rows={2} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-emerald-300/50" /></label>
        <label className="block text-sm text-zinc-200">Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ToastForm["status"] })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white"><option value="published">Ativo</option><option value="draft">Rascunho / desativado</option></select></label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button type="button" onClick={previewForm} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300/25 bg-emerald-300/5 px-3 py-3 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/10 sm:text-sm"><Eye className="size-4" />Visualizar</button>
          <button disabled={busy} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-300 px-3 py-3 text-xs font-semibold text-black disabled:opacity-50 sm:text-sm"><Save className="size-4" />{busy ? "Salvando..." : editingId ? "Salvar alterações" : "Criar cópia"}</button>
        </div>
      </form> : null}
    </section>
  </main></DashboardLayout>;
}
