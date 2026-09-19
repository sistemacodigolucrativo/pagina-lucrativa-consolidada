import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { composePromotionalMaterialBody, isDirectImageUrl, isHttpsUrl, splitPromotionalMaterialBody } from "@/lib/promotionalMaterialMetadata";
import { ArrowLeft, FilePenLine, PencilLine, PlusCircle, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ContentKind = "material" | "article" | "faq" | "notice";
type ContentStatus = "draft" | "published" | "archived";
type PublicationForm = { kind: ContentKind; title: string; summary: string; body: string; imageUrl: string; resourceUrl: string; resourceCategory: string; resourceType: string; status: ContentStatus };
type PublicationConfig = { kind: ContentKind; title: string; eyebrow: string; description: string; splitFlow?: boolean };

const routeConfig: Record<string, PublicationConfig> = {
  "/admin/biblioteca-recursos": { kind: "material", title: "Biblioteca de Recursos", eyebrow: "Conteúdo", description: "Cadastre, organize, publique, arquive e exclua os recursos disponibilizados aos membros.", splitFlow: true },
  "/admin/perguntas-frequentes": { kind: "faq", title: "Perguntas Frequentes", eyebrow: "Landing Page", description: "Gerencie as perguntas e respostas exibidas na página pública de vendas." },
  "/admin/publicacoes": { kind: "notice", title: "Publicações", eyebrow: "Conteúdo", description: "Gerencie as comunicações existentes. Esta seção permanece no local atual até sua revisão específica." },
};
const resourceCategories = ["Automação", "Divulgação", "Produtividade", "Redes sociais", "Outros"];
const resourceTypes = ["Aplicativo", "Ferramenta", "Pacote de arquivos", "Material complementar", "Imagem / Banner", "Texto / Copy", "Vídeo", "Áudio"];
const resourceUrlMessage = "Use uma URL HTTPS válida para o recurso.";
const missingResourceUrlMessage = "Informe o link do recurso antes de publicar.";
const promotionalImageUrlMessage = "Use um link HTTPS direto para uma imagem JPG, JPEG, PNG, WEBP, GIF, SVG ou AVIF.";
const SYSTEM_CONTENT_CATEGORIES = new Set(["public-sales-copy", "public-sales-layout", "member-admin-control", "public-toast-config"]);

function currentConfig(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  const basePath = Object.keys(routeConfig).find(base => path === base || path.startsWith(`${base}/`)) ?? "/admin/publicacoes";
  return { ...routeConfig[basePath], basePath };
}
function blankForm(kind: ContentKind): PublicationForm {
  return {
    kind,
    title: "",
    summary: "",
    body: "",
    imageUrl: "",
    resourceUrl: "",
    resourceCategory: kind === "article" ? "Divulgação" : "Automação",
    resourceType: kind === "article" ? "Imagem / Banner" : "Ferramenta",
    status: "draft",
  };
}
function normalizeHttpsUrl(value: string) {
  const clean = value.trim();
  if (!clean || /^[a-z][a-z0-9+.-]*:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
}
function friendlyPublicationError(message: string) { if (message.includes("resourceUrl") || message.includes("invalid_string") || message.includes("URL HTTPS")) return message.includes("Informe o link") ? missingResourceUrlMessage : resourceUrlMessage; return message; }
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
  const [location, setLocation] = useLocation();
  const config = currentConfig(location);
  const normalizedLocation = location.replace(/\/$/, "");
  const isPublicationManager = config.basePath === "/admin/publicacoes";
  const isPublicationDraftScreen = normalizedLocation === "/admin/publicacoes/rascunhos";
  const editMatch = config.splitFlow ? normalizedLocation.match(new RegExp(`^${config.basePath}/(\\d+)/editar$`)) : null;
  const editRouteId = editMatch ? Number(editMatch[1]) : null;
  const isCreateScreen = Boolean(config.splitFlow && normalizedLocation === `${config.basePath}/novo`);
  const isEditScreen = Boolean(config.splitFlow && editRouteId !== null);
  const isListScreen = Boolean(config.splitFlow && !isCreateScreen && !isEditScreen);
  const isResourceLibrary = config.basePath === "/admin/biblioteca-recursos";
  const hasResourceFields = config.kind === "material";
  const listTitle = isPublicationDraftScreen ? "Rascunhos salvos" : isResourceLibrary ? "Recursos cadastrados" : "Conteúdos cadastrados";
  const createActionLabel = isResourceLibrary ? "Criar Conteúdo" : "Criar";
  const utils = trpc.useUtils();
  const content = trpc.admin.content.useQuery();
  const [editingId, setEditingId] = useState<number | null>(() => editRouteId);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [form, setForm] = useState<PublicationForm>(() => blankForm(config.kind));
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const refresh = () => utils.admin.content.invalidate();
  const goToList = () => setLocation(config.basePath);
  const resetLocalForm = () => { setEditingId(null); setFormError(null); setForm(blankForm(config.kind)); };
  const reset = () => { resetLocalForm(); if (config.splitFlow) goToList(); else setShowInlineForm(false); };
  const create = trpc.admin.createContent.useMutation({ onSuccess: () => { void refresh(); toast.success("Conteúdo registrado."); if (config.splitFlow) goToList(); else { resetLocalForm(); setShowInlineForm(false); } }, onError: error => { const message = friendlyPublicationError(error.message); setFormError(message); toast.error(message); } });
  const update = trpc.admin.updateContent.useMutation({ onSuccess: () => { void refresh(); toast.success("Conteúdo atualizado."); if (config.splitFlow) goToList(); else { resetLocalForm(); setShowInlineForm(false); } }, onError: error => { const message = friendlyPublicationError(error.message); setFormError(message); toast.error(message); } });
  const managedItems = useMemo(() => (content.data ?? []).filter(item => {
    if (isResourceLibrary ? !(item.kind === "material" || item.kind === "article") : item.kind !== config.kind) return false;
    if (config.kind === "notice" && SYSTEM_CONTENT_CATEGORIES.has(item.resourceCategory ?? "")) return false;
    if (isPublicationDraftScreen) return item.status === "draft";
    return true;
  }), [content.data, config.kind, isPublicationDraftScreen, isResourceLibrary]);
  const busy = create.isPending || update.isPending || deletingId !== null;
  const editingItemExists = editRouteId === null || managedItems.some(item => item.id === editRouteId);

  useEffect(() => {
    setFormError(null);
    if (!config.splitFlow) {
      setEditingId(null);
      setForm(blankForm(config.kind));
      setShowInlineForm(false);
      return;
    }
    if (isCreateScreen) {
      setEditingId(null);
      setForm(blankForm(config.kind));
      return;
    }
    if (editRouteId !== null) {
      setEditingId(editRouteId);
      const item = (content.data ?? []).find(candidate => candidate.id === editRouteId && (isResourceLibrary ? (candidate.kind === "material" || candidate.kind === "article") : candidate.kind === config.kind));
      if (item) {
        const promotional = isResourceLibrary ? splitPromotionalMaterialBody(item.body) : { body: item.body ?? "", imageUrl: "" };
        setForm({
          kind: config.kind,
          title: item.title,
          summary: item.summary ?? "",
          body: promotional.body,
          imageUrl: promotional.imageUrl,
          resourceUrl: item.resourceUrl ?? "",
          resourceCategory: item.resourceCategory ?? "Automação",
          resourceType: item.resourceType ?? "Ferramenta",
          status: item.status,
        });
      }
      return;
    }
    setEditingId(null);
    setForm(blankForm(config.kind));
  }, [config.kind, config.splitFlow, content.data, editRouteId, isCreateScreen, isPublicationDraftScreen, isResourceLibrary]);

  function openCreate() {
    if (config.splitFlow) {
      setLocation(`${config.basePath}/novo`);
      return;
    }
    resetLocalForm();
    setShowInlineForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function edit(item: NonNullable<typeof content.data>[number]) {
    if (config.splitFlow) {
      setLocation(`${config.basePath}/${item.id}/editar`);
      return;
    }
    const promotional = isResourceLibrary ? splitPromotionalMaterialBody(item.body) : { body: item.body ?? "", imageUrl: "" };
    setEditingId(item.id);
    setShowInlineForm(true);
    setForm({
      kind: config.kind,
      title: item.title,
      summary: item.summary ?? "",
      body: promotional.body,
      imageUrl: promotional.imageUrl,
      resourceUrl: item.resourceUrl ?? "",
      resourceCategory: item.resourceCategory ?? "Automação",
      resourceType: item.resourceType ?? "Ferramenta",
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeItem(item: NonNullable<typeof content.data>[number]) {
    if (!window.confirm(`Excluir definitivamente "${item.title}"?\n\nEsta ação remove o registro do sistema e não pode ser desfeita.`)) return;
    setDeletingId(item.id);
    try {
      const response = await fetch(withAppBase(`/api/admin/content-management/${item.id}`), { method: "DELETE", credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir o conteúdo.");
      if (editingId === item.id) resetLocalForm();
      await refresh();
      toast.success("Conteúdo excluído definitivamente.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível excluir o conteúdo."); }
    finally { setDeletingId(null); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const resourceUrl = form.resourceUrl.trim();
    const imageUrl = form.imageUrl.trim();
    if (config.kind === "material" && form.status === "published" && !resourceUrl) { setFormError(missingResourceUrlMessage); toast.error(missingResourceUrlMessage); return; }
    if (config.kind === "material" && resourceUrl && !isHttpsUrl(resourceUrl)) { setFormError(resourceUrlMessage); toast.error(resourceUrlMessage); return; }
    if (isResourceLibrary && imageUrl && !isDirectImageUrl(imageUrl)) { setFormError(promotionalImageUrlMessage); toast.error(promotionalImageUrlMessage); return; }

    const storedBody = isResourceLibrary ? composePromotionalMaterialBody(form.body, imageUrl) : form.body.trim() || null;
    const payload = {
      ...form,
      kind: config.kind,
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      body: storedBody || null,
      resourceUrl: hasResourceFields ? resourceUrl || null : null,
      resourceCategory: hasResourceFields ? form.resourceCategory.trim() || null : null,
      resourceType: hasResourceFields ? form.resourceType.trim() || null : null,
    };
    delete (payload as Partial<PublicationForm>).imageUrl;
    if (editingId) update.mutate({ id: editingId, ...payload }); else create.mutate(payload);
  }

  const pageTitle = isPublicationDraftScreen ? "Rascunhos — Publicações" : isCreateScreen ? `Novo conteúdo — ${config.title}` : isEditScreen ? `Editar conteúdo — ${config.title}` : config.title;
  const pageDescription = isPublicationDraftScreen ? "Revise conteúdos salvos como rascunho antes de publicar ou arquivar." : config.description;
  const imagePreviewUrl = isResourceLibrary && isDirectImageUrl(form.imageUrl.trim()) ? form.imageUrl.trim() : "";

  const formPanel = (
    <form onSubmit={submit} className="min-w-0 space-y-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">
      <div className="dashboard-form-heading flex items-center gap-2 text-white"><FilePenLine className="size-5 shrink-0 text-emerald-300" /><FormTitle editing={Boolean(editingId)} title={config.title} /></div>
      <label className="block text-sm text-zinc-200">Estado<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ContentStatus })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label>
      <label className="block text-sm text-zinc-200">Título<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
      <label className="block text-sm text-zinc-200">Resumo / descrição breve<textarea value={form.summary} onChange={event => setForm({ ...form, summary: event.target.value })} className="mt-1 min-h-20 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
      <label className="block text-sm text-zinc-200">{config.kind === "faq" ? "Resposta" : "Conteúdo / descrição completa"}<textarea value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} className="mt-1 min-h-44 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
      {hasResourceFields ? (
        <section className="min-w-0 space-y-4 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3 sm:p-4">
          <p className="text-sm leading-6 text-emerald-50">Configure a apresentação e o acesso do recurso. Se o link for digitado sem protocolo, o sistema adiciona https:// automaticamente ao sair do campo.</p>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="min-w-0 text-sm text-zinc-200">Categoria do recurso<select value={form.resourceCategory} onChange={event => setForm({ ...form, resourceCategory: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">{resourceCategories.map(category => <option key={category}>{category}</option>)}</select></label>
            <label className="min-w-0 text-sm text-zinc-200">Tipo do recurso<select value={form.resourceType} onChange={event => setForm({ ...form, resourceType: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">{resourceTypes.map(type => <option key={type}>{type}</option>)}</select></label>
          </div>
          <label className="block text-sm text-zinc-200">Link da imagem<input type="url" value={form.imageUrl} onBlur={event => setForm({ ...form, imageUrl: normalizeHttpsUrl(event.target.value) })} onChange={event => setForm({ ...form, imageUrl: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="https://exemplo.com/banner.jpg" /></label>
          {imagePreviewUrl ? <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30"><img src={imagePreviewUrl} alt="Prévia do recurso" loading="lazy" className="aspect-video w-full object-cover sm:max-h-80" /></div> : form.imageUrl.trim() ? <p className="text-xs leading-5 text-zinc-400">A miniatura aparecerá quando o link HTTPS apontar diretamente para JPG, JPEG, PNG, WEBP, GIF, SVG ou AVIF.</p> : null}
          <label className="block text-sm text-zinc-200">Link do recurso<input type="url" value={form.resourceUrl} onBlur={event => setForm({ ...form, resourceUrl: normalizeHttpsUrl(event.target.value) })} onChange={event => setForm({ ...form, resourceUrl: event.target.value })} required={form.status === "published"} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="https://exemplo.com/recurso" /></label>
          {formError ? <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{formError}</p> : null}
        </section>
      ) : formError ? <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{formError}</p> : null}
      <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3"><button disabled={busy} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 sm:w-auto"><PlusCircle className="size-4" />{create.isPending || update.isPending ? "Salvando..." : editingId ? "Salvar alterações" : "Criar"}</button>{editingId || config.splitFlow || showInlineForm ? <button type="button" onClick={reset} className="min-h-11 w-full rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 sm:w-auto">Cancelar</button> : null}</div>
    </form>
  );

  const listPanel = (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><h2 className="break-words font-medium text-white">{listTitle}</h2><span className="mt-1 block text-xs uppercase tracking-wider text-zinc-500">{managedItems.length} itens</span></div>
        {config.splitFlow ? <button type="button" onClick={openCreate} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.98] sm:w-auto"><PlusCircle className="size-4" />{createActionLabel}</button> : null}
        {!config.splitFlow && isPublicationManager && !isPublicationDraftScreen ? <button type="button" onClick={openCreate} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.98] sm:w-auto"><PlusCircle className="size-4" />Criar Conteúdo</button> : null}
      </div>
      {content.isLoading ? <p className="text-sm text-zinc-400">Carregando...</p> : managedItems.length ? <div className="space-y-3">{managedItems.map(item => {
        const displayBody = isResourceLibrary ? splitPromotionalMaterialBody(item.body).body : item.body;
        return <article key={item.id} role={config.splitFlow ? "button" : undefined} tabIndex={config.splitFlow ? 0 : undefined} onClick={config.splitFlow ? () => edit(item) : undefined} onKeyDown={config.splitFlow ? event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); edit(item); } } : undefined} className={`min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4 ${config.splitFlow ? "cursor-pointer transition hover:border-emerald-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60" : ""}`}><div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><span className="text-xs uppercase tracking-wider text-emerald-200">{statusLabel(item.status)}</span><h3 className="mt-1 font-medium text-white [overflow-wrap:anywhere]">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-zinc-400 [overflow-wrap:anywhere]">{item.summary || displayBody || "Sem descrição."}</p></div><div className="grid w-full min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:w-auto sm:flex"><button type="button" onClick={event => { event.stopPropagation(); edit(item); }} className="inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 sm:w-auto"><PencilLine className="size-4" />Editar</button><button type="button" disabled={deletingId === item.id} onClick={event => { event.stopPropagation(); void removeItem(item); }} className="inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border border-red-400/25 px-3 py-2 text-sm text-red-200 disabled:opacity-60 sm:w-auto"><Trash2 className="size-4" />{deletingId === item.id ? "Excluindo..." : "Excluir"}</button></div></div></article>;
      })}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">{isPublicationDraftScreen ? "Nenhum rascunho salvo no momento." : "Nenhum conteúdo registrado ainda."}</p>}
    </section>
  );

  return <DashboardLayout menuItems={adminMenu} title="Administração"><main className="mx-auto w-full min-w-0 max-w-7xl space-y-7 overflow-x-clip p-4 sm:p-6 lg:p-8">
    <header className="min-w-0 space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">{config.eyebrow}</span><h1 className="break-words text-2xl font-semibold text-white sm:text-3xl">{pageTitle}</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">{pageDescription}</p></header>
    {config.splitFlow && !isListScreen ? <button type="button" onClick={goToList} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-emerald-300/40 hover:text-emerald-100 sm:w-auto"><ArrowLeft className="size-4" />Voltar para {config.title}</button> : null}
    {config.splitFlow ? (
      isListScreen ? listPanel : isEditScreen && content.isLoading ? <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm text-zinc-400">Carregando conteúdo para edição...</section> : isEditScreen && !editingItemExists ? <section className="space-y-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><h2 className="font-medium text-amber-100">Conteúdo não encontrado</h2><p className="text-sm leading-6 text-amber-50/80">O item solicitado não existe nesta área ou não está mais disponível.</p></section> : formPanel
    ) : !isPublicationManager || showInlineForm ? <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">{formPanel}{listPanel}</section> : listPanel}
  </main></DashboardLayout>;
}
