import DashboardLayout from "@/components/DashboardLayout";
import PublicSocialProofToast, { PUBLIC_TOAST_PREVIEW_EVENT } from "@/components/PublicSocialProofToast";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { Bell, ChevronDown, ChevronUp, Copy, Eye, Pencil, RotateCcw, Save, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

type ToastForm = { title: string; message: string; disclaimer: string; status: "draft" | "published" };
type ColorKey = "headerColor" | "nameColor" | "messageColor" | "footerColor";

function parseDisclaimer(body?: string | null) {
  if (!body) return "";
  try { return (JSON.parse(body) as { disclaimer?: string }).disclaimer ?? ""; } catch { return body; }
}
function parseSettings(body?: string | null) {
  if (!body) return publicToastDefaultSettings;
  try { return normalizePublicToastSettings(JSON.parse(body)); } catch { return publicToastDefaultSettings; }
}
function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description: string }) {
  return <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 text-left transition hover:border-emerald-300/20 sm:p-4">
    <span className="min-w-0"><strong className="block text-sm font-medium text-white">{label}</strong><span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span></span>
    <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-emerald-300" : "bg-zinc-700"}`}><span className={`absolute top-1 size-5 rounded-full bg-black transition ${checked ? "left-6" : "left-1"}`} /></span>
  </button>;
}
function ColorControl({ label, colorKey, settings, setSettings }: { label: string; colorKey: ColorKey; settings: PublicToastSettings; setSettings: React.Dispatch<React.SetStateAction<PublicToastSettings>> }) {
  return <label className="text-xs text-zinc-300 sm:text-sm">{label}<span className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 p-2"><input type="color" value={settings[colorKey]} onChange={e => setSettings(c => ({ ...c, [colorKey]: e.target.value }))} className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0" /><input value={settings[colorKey]} maxLength={7} onChange={e => setSettings(c => ({ ...c, [colorKey]: e.target.value }))} aria-label={`Cor ${label}`} className="min-w-0 flex-1 bg-transparent text-xs uppercase text-white outline-none" /></span></label>;
}

export default function AdminToast() {
  const utils = trpc.useUtils();
  const content = trpc.admin.content.useQuery();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [duplicateSourceId, setDuplicateSourceId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState<ToastForm>({ title: "", message: "", disclaimer: "", status: "draft" });
  const [settings, setSettings] = useState<PublicToastSettings>(publicToastDefaultSettings);
  const seededRef = useRef(false);
  const settingsLoadedRef = useRef(false);

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
  const busy = create.isPending || update.isPending || updateStatus.isPending || seedCreate.isPending;

  useEffect(() => {
    if (!settingsItem || settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;
    setSettings(parseSettings(settingsItem.body));
  }, [settingsItem]);

  useEffect(() => {
    if (!content.data || seededRef.current) return;
    const hasTemplates = toastItems.length > 0;
    const hasSettings = Boolean(settingsItem);
    if (hasTemplates && hasSettings) return;
    seededRef.current = true;
    void (async () => {
      try {
        if (!hasTemplates) for (const model of publicToastDefaultTemplates) await seedCreate.mutateAsync({ kind: "notice", title: model.title, summary: model.message, body: JSON.stringify({ disclaimer: model.disclaimer }), resourceUrl: null, resourceCategory: PUBLIC_TOAST_CATEGORY, resourceType: PUBLIC_TOAST_TEMPLATE_TYPE, status: "published" });
        if (!hasSettings) await seedCreate.mutateAsync({ kind: "notice", title: "Configuração do Toast", summary: "Configuração global do sistema de Toast.", body: JSON.stringify(publicToastDefaultSettings), resourceUrl: null, resourceCategory: PUBLIC_TOAST_CATEGORY, resourceType: PUBLIC_TOAST_SETTINGS_TYPE, status: "published" });
        await refresh();
      } catch { toast.error("Não foi possível preparar os modelos iniciais do Toast."); }
    })();
  }, [content.data, settingsItem, toastItems.length]);

  function toggleExpanded(id: number) {
    setExpandedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function ensureExpanded(id: number) { setExpandedIds(current => new Set(current).add(id)); }
  function closeInlineEditor() { setEditingId(null); setDuplicateSourceId(null); }
  function edit(item: NonNullable<typeof content.data>[number]) {
    ensureExpanded(item.id); setDuplicateSourceId(null); setEditingId(item.id);
    setForm({ title: item.title, message: item.summary ?? "", disclaimer: parseDisclaimer(item.body), status: item.status === "published" ? "published" : "draft" });
  }
  function duplicate(item: NonNullable<typeof content.data>[number]) {
    ensureExpanded(item.id); setEditingId(null); setDuplicateSourceId(item.id);
    setForm({ title: `${item.title} — cópia`, message: item.summary ?? "", disclaimer: parseDisclaimer(item.body), status: "draft" });
  }
  async function saveInline() {
    if (!form.title.trim() || !form.message.trim()) return toast.error("Informe o nome interno e a mensagem do Toast.");
    const wasEditing = editingId !== null;
    const payload = { kind: "notice" as const, title: form.title.trim(), summary: form.message.trim(), body: JSON.stringify({ disclaimer: form.disclaimer.trim() }), resourceUrl: null, resourceCategory: PUBLIC_TOAST_CATEGORY, resourceType: PUBLIC_TOAST_TEMPLATE_TYPE, status: form.status };
    try {
      if (editingId !== null) await update.mutateAsync({ id: editingId, ...payload });
      else if (duplicateSourceId !== null) await create.mutateAsync(payload);
      await refresh(); closeInlineEditor();
      toast.success(wasEditing ? "Modelo atualizado." : "Cópia criada como novo Toast.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar o modelo."); }
  }
  async function saveSettings() {
    const normalized = normalizePublicToastSettings(settings); setSettings(normalized);
    const payload = { kind: "notice" as const, title: "Configuração do Toast", summary: "Configuração global do sistema de Toast.", body: JSON.stringify(normalized), resourceUrl: null, resourceCategory: PUBLIC_TOAST_CATEGORY, resourceType: PUBLIC_TOAST_SETTINGS_TYPE, status: "published" as const };
    try { if (settingsItem) await update.mutateAsync({ id: settingsItem.id, ...payload }); else await create.mutateAsync(payload); await refresh(); toast.success("Configurações do Toast salvas."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar as configurações."); }
  }
  function dispatchPreview(message: string, disclaimer: string) {
    if (!message.trim()) return toast.error("Este modelo não possui uma mensagem para visualizar.");
    window.dispatchEvent(new CustomEvent(PUBLIC_TOAST_PREVIEW_EVENT, { detail: { message: message.trim(), disclaimer: disclaimer.trim(), showSimulationNotice: settings.showSimulationNotice, headerMessage: settings.headerMessage, footerMessage: settings.footerMessage, headerColor: settings.headerColor, nameColor: settings.nameColor, messageColor: settings.messageColor, footerColor: settings.footerColor, visibleSeconds: settings.visibleSeconds } }));
  }
  function previewItem(item: NonNullable<typeof content.data>[number]) { dispatchPreview(item.summary ?? "", parseDisclaimer(item.body)); }
  function remove(id: number) { if (window.confirm("Excluir este modelo de Toast? Ele poderá ser restaurado pela lixeira.")) updateStatus.mutate({ id, status: "archived" }); }

  return <DashboardLayout menuItems={adminMenu} title="Administração"><><div id="admin-public-toast-preview-slot" className="public-social-proof-toast-slot" aria-live="polite" style={{ left: "50%", transform: "translateX(-50%)", width: "min(320px, calc(100vw - 24px))" }}><PublicSocialProofToast /></div><main className="mx-auto w-full max-w-7xl space-y-4 p-3 sm:p-4 md:space-y-6 md:p-8">
    <header className="relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.16),transparent_38%),linear-gradient(145deg,rgba(9,18,16,.98),rgba(3,8,9,.99))] p-4 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8">
      <Sparkles className="absolute right-5 top-5 size-5 text-emerald-300" /><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-300">Sistema · Prova social</span>
      <div className="mt-2 flex items-center gap-3"><Bell className="size-6 text-emerald-300" /><h1 className="text-2xl font-semibold text-white sm:text-3xl">Central de Toast</h1></div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">Controle completo dos modelos, frequência, cabeçalho, rodapé e identidade visual dos Toasts públicos.</p>
    </header>

    <section className="grid grid-cols-3 gap-2">{[["Ativos", activeCount], ["Rascunhos", draftCount], ["Arquivados", archivedCount]].map(([label, count]) => <article key={String(label)} className="rounded-xl border border-white/10 bg-zinc-950/70 p-3 sm:p-5"><span className="block truncate text-[9px] uppercase text-zinc-500 sm:text-xs">{label}</span><strong className="mt-2 block text-2xl text-white sm:text-3xl">{count}</strong></article>)}</section>

    <section className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-xl sm:rounded-3xl sm:p-6">
      <span className="text-[10px] uppercase tracking-wider text-emerald-300">Comportamento global</span><h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Configurações do sistema</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2"><Toggle checked={settings.enabled} onChange={value => setSettings(c => ({ ...c, enabled: value }))} label="Sistema de Toast ativo" description="Liga ou desliga todas as notificações públicas sem excluir os modelos." /><Toggle checked={settings.showSimulationNotice} onChange={value => setSettings(c => ({ ...c, showSimulationNotice: value }))} label="Controle de Cabeçalho e Rodapé do Toast" description="Liga ou desliga a exibição do cabeçalho e do rodapé configuráveis do Toast." /></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2"><label className="text-xs text-zinc-300 sm:text-sm">Mensagem de cabeçalho<input value={settings.headerMessage} maxLength={120} onChange={e => setSettings(c => ({ ...c, headerMessage: e.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white" /></label><label className="text-xs text-zinc-300 sm:text-sm">Mensagem de rodapé<input value={settings.footerMessage} maxLength={500} onChange={e => setSettings(c => ({ ...c, footerMessage: e.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white" /></label></div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4"><span className="text-[10px] uppercase tracking-wider text-emerald-300">Paleta global do Toast</span><p className="mt-1 text-xs leading-5 text-zinc-500">Uma única definição é aplicada automaticamente a todos os modelos.</p><div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><ColorControl label="Cabeçalho" colorKey="headerColor" settings={settings} setSettings={setSettings} /><ColorControl label="Nome" colorKey="nameColor" settings={settings} setSettings={setSettings} /><ColorControl label="Mensagem" colorKey="messageColor" settings={settings} setSettings={setSettings} /><ColorControl label="Rodapé" colorKey="footerColor" settings={settings} setSettings={setSettings} /></div></div>
      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4"><label className="text-xs text-zinc-300">Primeira exibição (s)<input type="number" min={1} max={300} value={settings.initialDelaySeconds} onChange={e => setSettings(c => ({ ...c, initialDelaySeconds: Number(e.target.value) }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-white" /></label><label className="text-xs text-zinc-300">Intervalo mínimo (s)<input type="number" min={5} max={600} value={settings.intervalMinSeconds} onChange={e => setSettings(c => ({ ...c, intervalMinSeconds: Number(e.target.value) }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-white" /></label><label className="text-xs text-zinc-300">Intervalo máximo (s)<input type="number" min={5} max={900} value={settings.intervalMaxSeconds} onChange={e => setSettings(c => ({ ...c, intervalMaxSeconds: Number(e.target.value) }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-white" /></label><label className="text-xs text-zinc-300">Tempo visível (s)<input type="number" min={2} max={30} value={settings.visibleSeconds} onChange={e => setSettings(c => ({ ...c, visibleSeconds: Number(e.target.value) }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-white" /></label></div>
      <button type="button" disabled={busy} onClick={() => void saveSettings()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-black sm:w-auto"><Save className="size-4" />Salvar configurações</button>
    </section>

    <section className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-xl sm:rounded-3xl sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] uppercase text-emerald-300">Biblioteca</span><h2 className="text-lg font-semibold text-white">Modelos cadastrados</h2></div><button type="button" onClick={() => { setShowArchived(v => !v); setExpandedIds(new Set()); closeInlineEditor(); }} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">{showArchived ? "Ver ativos" : `Lixeira (${archivedCount})`}</button></div>
      <div className="space-y-2">{visibleItems.map(item => {
        const expanded = expandedIds.has(item.id);
        const inlineEditing = editingId === item.id || duplicateSourceId === item.id;
        return <article key={item.id} className={`overflow-hidden rounded-xl border bg-black/30 transition ${inlineEditing ? "border-emerald-300/30 shadow-[0_0_0_1px_rgba(110,231,183,.06)]" : "border-white/10"}`}>
          <button type="button" aria-expanded={expanded} onClick={() => { if (!inlineEditing) toggleExpanded(item.id); }} className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left sm:px-4 sm:py-3"><span className={`size-2.5 shrink-0 rounded-full ${item.status === "published" ? "bg-emerald-300" : item.status === "archived" ? "bg-zinc-600" : "bg-amber-300"}`} /><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{item.title}</strong><span className="block truncate text-[11px] text-zinc-500">{item.summary}</span></span>{expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
          {expanded ? <div className="border-t border-white/10 p-3 sm:p-4">
            {inlineEditing ? <div className="space-y-3" data-inline-toast-editor="true"><div className="flex items-center justify-between gap-2"><div><span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">{editingId === item.id ? "Editando este modelo" : "Duplicando este modelo"}</span>{duplicateSourceId === item.id ? <p className="mt-1 text-[11px] text-zinc-500">A cópia será criada como um novo Toast independente.</p> : null}</div><button type="button" onClick={closeInlineEditor} className="rounded-lg border border-white/10 p-2 text-zinc-400" aria-label="Cancelar edição"><X className="size-4" /></button></div>
              <div className="grid gap-3 md:grid-cols-2"><label className="text-xs text-zinc-300">Nome interno<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-white" /></label><label className="text-xs text-zinc-300">Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ToastForm["status"] })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-white"><option value="published">Ativo</option><option value="draft">Rascunho / desativado</option></select></label></div>
              <label className="block text-xs text-zinc-300">Mensagem<textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-white" /></label>
              <label className="block text-xs text-zinc-300">Aviso legado do modelo<textarea value={form.disclaimer} onChange={e => setForm({ ...form, disclaimer: e.target.value })} rows={2} className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-white" /></label>
              <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => dispatchPreview(form.message, form.disclaimer)} className="rounded-xl border border-emerald-300/20 py-2.5 text-xs font-medium text-emerald-200"><Eye className="mr-1 inline size-3.5" />Visualizar</button><button type="button" disabled={busy} onClick={() => void saveInline()} className="rounded-xl bg-emerald-300 py-2.5 text-xs font-semibold text-black disabled:opacity-50"><Save className="mr-1 inline size-3.5" />{editingId === item.id ? "Salvar alterações" : "Criar cópia"}</button></div>
            </div> : item.status === "archived" ? <button type="button" onClick={() => updateStatus.mutate({ id: item.id, status: "draft" })} className="flex items-center gap-2 text-xs text-emerald-200"><RotateCcw className="size-4" />Restaurar</button> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-5"><button type="button" onClick={() => previewItem(item)} className="rounded-lg border border-emerald-300/20 p-2.5 text-xs text-emerald-200"><Eye className="mr-1 inline size-3" />Visualizar</button><button type="button" onClick={() => edit(item)} className="rounded-lg border border-white/10 p-2.5 text-xs text-zinc-200"><Pencil className="mr-1 inline size-3" />Editar</button><button type="button" onClick={() => duplicate(item)} className="rounded-lg border border-sky-300/15 p-2.5 text-xs text-sky-200"><Copy className="mr-1 inline size-3" />Duplicar</button><button type="button" onClick={() => updateStatus.mutate({ id: item.id, status: item.status === "published" ? "draft" : "published" })} className="rounded-lg border border-amber-300/15 p-2.5 text-xs text-amber-100">{item.status === "published" ? "Desativar" : "Ativar"}</button><button type="button" onClick={() => remove(item.id)} className="rounded-lg border border-red-400/15 p-2.5 text-xs text-red-300"><Trash2 className="mr-1 inline size-3" />Excluir</button></div>}
          </div> : null}
        </article>;
      })}</div>
    </section>
  </main></></DashboardLayout>;
}
