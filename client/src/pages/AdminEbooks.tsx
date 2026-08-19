import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BookOpenText, Eye, FilePenLine, LayoutDashboard, PlusCircle, Save, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Visão geral", path: "/admin", group: "Gestão" },
  { icon: BookOpenText, label: "E-books", path: "/admin/ebooks", group: "Conteúdo" },
  { icon: FilePenLine, label: "Central de manutenção", path: "/admin/operacao", group: "Gestão" },
];
type EbookStatus = "draft" | "published" | "archived";
type EbookForm = { sourceId: string; sourceFile: string; sourcePath: string; title: string; summary: string; htmlContent: string; status: EbookStatus };
const newForm = (): EbookForm => ({ sourceId: "", sourceFile: "Manual", sourcePath: "Administração", title: "", summary: "", htmlContent: "<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\"><title>Novo e-book</title></head><body><h1>Novo e-book</h1><p>Edite este conteúdo antes de publicar.</p></body></html>", status: "draft" });

export default function AdminEbooks() {
  const utils = trpc.useUtils();
  const ebooks = trpc.admin.ebooks.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const detail = trpc.admin.ebook.useQuery({ id: selectedId ?? 0 }, { enabled: selectedId !== null });
  const [form, setForm] = useState<EbookForm>(newForm);
  useEffect(() => {
    if (!detail.data) return;
    setForm({ sourceId: detail.data.sourceId, sourceFile: detail.data.sourceFile, sourcePath: detail.data.sourcePath, title: detail.data.title, summary: detail.data.summary || "", htmlContent: detail.data.htmlContent, status: detail.data.status });
  }, [detail.data]);
  const refresh = async () => { await utils.admin.ebooks.invalidate(); if (selectedId) await utils.admin.ebook.invalidate({ id: selectedId }); };
  const create = trpc.admin.createEbook.useMutation({ onSuccess: async () => { await refresh(); toast.success("E-book criado como rascunho ou publicação."); }, onError: error => toast.error(error.message) });
  const update = trpc.admin.updateEbook.useMutation({ onSuccess: async () => { await refresh(); toast.success("E-book atualizado."); }, onError: error => toast.error(error.message) });
  function resetForm() { setSelectedId(null); setForm(newForm()); }
  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, sourceId: form.sourceId.trim() || `manual-${Date.now()}`, sourceFile: form.sourceFile.trim() || "Manual", sourcePath: form.sourcePath.trim() || "Administração", title: form.title.trim(), summary: form.summary.trim() || null };
    if (!payload.title) return toast.error("Informe o título do e-book.");
    if (selectedId) update.mutate({ id: selectedId, ...payload }); else create.mutate(payload);
  }
  const pending = create.isPending || update.isPending;

  return <DashboardLayout menuItems={menu} title="Administração"><main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Gestão de conteúdo</span><h1 className="text-3xl font-semibold text-white">E-books HTML</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Revise o conteúdo convertido, edite metadados e controle a publicação de cada material disponível na biblioteca do membro.</p></header>
    <section className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]"><aside className="rounded-2xl border border-white/10 bg-zinc-950/60 p-3"><button type="button" onClick={resetForm} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black"><PlusCircle className="size-4" />Novo e-book</button><div className="max-h-[68vh] space-y-2 overflow-y-auto">{ebooks.isLoading ? <p className="p-3 text-sm text-zinc-400">Carregando catálogo...</p> : ebooks.data?.map(ebook => <button type="button" key={ebook.id} onClick={() => setSelectedId(ebook.id)} className={`w-full rounded-xl border p-3 text-left transition hover:border-emerald-300/50 ${selectedId === ebook.id ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-black/25"}`}><div className="flex items-start gap-2"><BookOpenText className="mt-0.5 size-4 shrink-0 text-emerald-300" /><div><p className="text-sm font-medium text-white">{ebook.title}</p><p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{ebook.status === "published" ? "Publicado" : ebook.status === "draft" ? "Rascunho" : "Arquivado"}</p></div></div></button>) || <p className="p-3 text-sm text-zinc-400">Nenhum e-book no catálogo.</p>}</div></aside>
      <div className="space-y-6"><form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-medium text-white">{selectedId ? "Editar e-book" : "Novo e-book"}</h2><p className="mt-1 text-sm text-zinc-400">O conteúdo publicado ficará disponível para os membros.</p></div>{selectedId && <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"><X className="size-4" />Fechar edição</button>}</div><div className="grid gap-4 md:grid-cols-[1fr_160px]"><label className="text-sm text-zinc-200">Título<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label><label className="text-sm text-zinc-200">Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as EbookStatus })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label></div><label className="block text-sm text-zinc-200">Resumo<textarea value={form.summary} onChange={event => setForm({ ...form, summary: event.target.value })} className="mt-1 min-h-20 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label><label className="block text-sm text-zinc-200">HTML do e-book<textarea required value={form.htmlContent} onChange={event => setForm({ ...form, htmlContent: event.target.value })} spellCheck={false} className="mt-1 min-h-80 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-xs leading-5 text-white" /></label><button disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"><Save className="size-4" />{pending ? "Salvando..." : selectedId ? "Salvar alterações" : "Criar e-book"}</button></form>
        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="mb-4 flex items-center gap-2 text-white"><Eye className="size-5 text-emerald-300" /><h2 className="font-medium">Prévia isolada</h2></div><iframe title="Prévia do e-book" sandbox="" srcDoc={form.htmlContent} className="h-[480px] w-full rounded-xl border border-white/10 bg-white" /></section>
      </div></section>
  </main></DashboardLayout>;
}
