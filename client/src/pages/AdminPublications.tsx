import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { FilePenLine, PencilLine, PlusCircle, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type ContentKind = "material" | "article" | "faq" | "notice";
type ContentStatus = "draft" | "published" | "archived";
type PublicationForm = { kind: ContentKind; title: string; summary: string; body: string; resourceUrl: string; resourceCategory: string; resourceType: string; status: ContentStatus };

const routeConfig: Record<string, { kind: ContentKind; title: string; eyebrow: string; description: string }> = {
  "/admin/material-divulgacao": { kind: "article", title: "Material de Divulgação", eyebrow: "Conteúdo", description: "Crie, revise, publique, arquive e exclua os materiais de divulgação disponibilizados pelo projeto." },
  "/admin/biblioteca-recursos": { kind: "material", title: "Biblioteca de Recursos", eyebrow: "Conteúdo", description: "Gerencie os recursos e ferramentas disponibilizados aos membros, preservando os arquivos e registros existentes." },
  "/admin/perguntas-frequentes": { kind: "faq", title: "Perguntas Frequentes", eyebrow: "Landing Page", description: "Gerencie as perguntas e respostas exibidas na página pública de vendas." },
  "/admin/publicacoes": { kind: "notice", title: "Publicações", eyebrow: "Conteúdo", description: "Gerencie as comunicações existentes. Esta seção permanece no local atual até sua revisão específica." },
};
const resourceCategories = ["Automação", "Divulgação", "Produtividade", "Redes sociais", "Outros"];
const resourceTypes = ["Aplicativo", "Ferramenta", "Pacote de arquivos", "Material complementar"];
const googleDriveHosts = new Set(["drive.google.com", "docs.google.com", "drive.usercontent.google.com"]);
const googleDriveUrlMessage = "Use uma URL HTTPS válida do Google Drive.";
const missingGoogleDriveUrlMessage = "Informe o link do Google Drive antes de publicar o recurso.";

function currentConfig() {
  const path = window.location.pathname.replace(/\/$/, "");
  return routeConfig[path] ?? routeConfig["/admin/publicacoes"];
}
function blankForm(kind: ContentKind): PublicationForm { return { kind, title: "", summary: "", body: "", resourceUrl: "", resourceCategory: "Automação", resourceType: "Ferramenta", status: "draft" }; }
function isGoogleDriveUrl(value: string) { try { const url = new URL(value); return url.protocol === "https:" && googleDriveHosts.has(url.hostname.toLowerCase()); } catch { return false; } }
function friendlyPublicationError(message: string) { if (message.includes("Google Drive") || message.includes("resourceUrl") || message.includes("invalid_string")) return message.includes("Informe o link") ? missingGoogleDriveUrlMessage : googleDriveUrlMessage; return message; }
function statusLabel(status: ContentStatus) { return status === "published" ? "Publicado" : status === "archived" ? "Arquivado" : "Rascunho"; }
function FormTitle({ editing, title }: { editing: boolean; title: string }) {
  return (
    <h2 className="dashboard-responsive-title font-medium">
      <span>{editing ? "Editar" : "Novo conteúdo"}</span>
      <span aria-hidden="true">—</span>
      <span className="dashboard-responsive-title-phrase">{title}</span>
    </h2>
  );
}

export default function AdminPublications() {
  const config = currentConfig();
  const utils = trpc.useUtils();
  const content = trpc.admin.content.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PublicationForm>(() => blankForm(config.kind));
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const refresh = () => utils.admin.content.invalidate();
  const reset = () => { setEditingId(null); setFormError(null); setForm(blankForm(config.kind)); };
  const create = trpc.admin.createContent.useMutation({ onSuccess: () => { void refresh(); reset(); toast.success("Conteúdo registrado."); }, onError: error => { const message = friendlyPublicationError(error.message); setFormError(message); toast.error(message); } });
  const update = trpc.admin.updateContent.useMutation({ onSuccess: () => { void refresh(); reset(); toast.success("Conteúdo atualizado."); }, onError: error => { const message = friendlyPublicationError(error.message); setFormError(message); toast.error(message); } });
  const managedItems = useMemo(() => (content.data ?? []).filter(item => item.kind === config.kind), [content.data, config.kind]);
  const busy = create.isPending || update.isPending || deletingId !== null;

  function edit(item: NonNullable<typeof content.data>[number]) {
    setEditingId(item.id);
    setForm({ kind: config.kind, title: item.title, summary: item.summary ?? "", body: item.body ?? "", resourceUrl: item.resourceUrl ?? "", resourceCategory: item.resourceCategory ?? "Automação", resourceType: item.resourceType ?? "Ferramenta", status: item.status });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function removeItem(item: NonNullable<typeof content.data>[number]) {
    if (!window.confirm(`Excluir definitivamente "${item.title}"?\n\nEsta ação remove o registro do sistema e não pode ser desfeita.`)) return;
    setDeletingId(item.id);
    try {
      const response = await fetch(withAppBase(`/api/admin/content-management/${item.id}`), { method: "DELETE", credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir o conteúdo.");
      if (editingId === item.id) reset();
      await refresh();
      toast.success("Conteúdo excluído definitivamente.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível excluir o conteúdo."); }
    finally { setDeletingId(null); }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const resourceUrl = form.resourceUrl.trim();
    if (config.kind === "material" && form.status === "published" && !resourceUrl) { setFormError(missingGoogleDriveUrlMessage); toast.error(missingGoogleDriveUrlMessage); return; }
    if (config.kind === "material" && resourceUrl && !isGoogleDriveUrl(resourceUrl)) { setFormError(googleDriveUrlMessage); toast.error(googleDriveUrlMessage); return; }
    const payload = { ...form, kind: config.kind, title: form.title.trim(), summary: form.summary.trim() || null, body: form.body.trim() || null, resourceUrl: config.kind === "material" ? resourceUrl || null : null, resourceCategory: config.kind === "material" ? form.resourceCategory.trim() || null : null, resourceType: config.kind === "material" ? form.resourceType.trim() || null : null };
    if (editingId) update.mutate({ id: editingId, ...payload }); else create.mutate(payload);
  }

  return <DashboardLayout menuItems={adminMenu} title="Administração"><main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">{config.eyebrow}</span><h1 className="text-3xl font-semibold text-white">{config.title}</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">{config.description}</p></header>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
        <div className="dashboard-form-heading flex items-center gap-2 text-white"><FilePenLine className="size-5 text-emerald-300" /><FormTitle editing={Boolean(editingId)} title={config.title} /></div>
        <label className="block text-sm text-zinc-200">Estado<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ContentStatus })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label>
        <label className="block text-sm text-zinc-200">Título<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
        <label className="block text-sm text-zinc-200">Resumo / descrição breve<textarea value={form.summary} onChange={event => setForm({ ...form, summary: event.target.value })} className="mt-1 min-h-20 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
        <label className="block text-sm text-zinc-200">{config.kind === "faq" ? "Resposta" : "Conteúdo / descrição completa"}<textarea value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} className="mt-1 min-h-44 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
        {config.kind === "material" ? <section className="space-y-4 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4"><p className="text-sm leading-6 text-emerald-50">O arquivo precisa estar compartilhado no Google Drive com permissão adequada para os membros.</p><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-zinc-200">Categoria do recurso<select value={form.resourceCategory} onChange={event => setForm({ ...form, resourceCategory: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">{resourceCategories.map(category => <option key={category}>{category}</option>)}</select></label><label className="block text-sm text-zinc-200">Tipo do recurso<select value={form.resourceType} onChange={event => setForm({ ...form, resourceType: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">{resourceTypes.map(type => <option key={type}>{type}</option>)}</select></label></div><label className="block text-sm text-zinc-200">Link do Google Drive<input type="url" value={form.resourceUrl} onChange={event => setForm({ ...form, resourceUrl: event.target.value })} required={form.status === "published"} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="https://drive.google.com/..." /></label>{formError ? <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{formError}</p> : null}</section> : formError ? <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{formError}</p> : null}
        <div className="flex flex-wrap gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"><PlusCircle className="size-4" />{create.isPending || update.isPending ? "Salvando..." : editingId ? "Salvar alterações" : "Criar"}</button>{editingId ? <button type="button" onClick={reset} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200">Cancelar</button> : null}</div>
      </form>
      <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-medium text-white">Conteúdos cadastrados</h2><span className="text-xs uppercase tracking-wider text-zinc-500">{managedItems.length} itens</span></div>{content.isLoading ? <p className="text-sm text-zinc-400">Carregando...</p> : managedItems.length ? <div className="space-y-3">{managedItems.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs uppercase tracking-wider text-emerald-200">{statusLabel(item.status)}</span><h3 className="mt-1 font-medium text-white">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-zinc-400">{item.summary || item.body || "Sem descrição."}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => edit(item)} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200"><PencilLine className="size-4" />Editar</button><button type="button" disabled={deletingId === item.id} onClick={() => void removeItem(item)} className="inline-flex items-center gap-1 rounded-lg border border-red-400/25 px-3 py-2 text-sm text-red-200 disabled:opacity-60"><Trash2 className="size-4" />{deletingId === item.id ? "Excluindo..." : "Excluir"}</button></div></div></article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">Nenhum conteúdo registrado ainda.</p>}</section>
    </section>
  </main></DashboardLayout>;
}
