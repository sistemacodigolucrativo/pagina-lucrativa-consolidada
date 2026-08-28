import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { MessageCircleQuestion, PencilLine, PlusCircle, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type Status = "draft" | "published" | "archived";
type Form = { title: string; body: string; status: Status };
const blank: Form = { title: "", body: "", status: "draft" };
const statusLabel = (status: Status) => status === "published" ? "Publicado" : status === "archived" ? "Arquivado" : "Rascunho";

export default function AdminFaqManager() {
  const utils = trpc.useUtils();
  const content = trpc.admin.content.useQuery();
  const create = trpc.admin.createContent.useMutation();
  const update = trpc.admin.updateContent.useMutation();
  const [form, setForm] = useState<Form>(blank);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const items = useMemo(() => (content.data ?? []).filter(item => item.kind === "faq"), [content.data]);
  const reset = () => { setForm(blank); setEditingId(null); };
  const refresh = () => utils.admin.content.invalidate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { kind: "faq" as const, title: form.title.trim(), summary: null, body: form.body.trim() || null, resourceUrl: null, resourceCategory: null, resourceType: null, status: form.status };
    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      await refresh(); reset(); toast.success(editingId ? "Pergunta atualizada." : "Pergunta criada.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar a pergunta."); }
  }

  function edit(item: NonNullable<typeof content.data>[number]) {
    setEditingId(item.id);
    setForm({ title: item.title, body: item.body ?? "", status: item.status });
  }

  async function remove(item: NonNullable<typeof content.data>[number]) {
    if (!window.confirm(`Excluir definitivamente "${item.title}"?`)) return;
    setDeletingId(item.id);
    try {
      const response = await fetch(withAppBase(`/api/admin/content-management/${item.id}`), { method: "DELETE", credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir a pergunta.");
      if (editingId === item.id) reset();
      await refresh(); toast.success("Pergunta excluída.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível excluir a pergunta."); }
    finally { setDeletingId(null); }
  }

  const busy = create.isPending || update.isPending || deletingId !== null;
  return <section className="mx-auto mt-8 w-full max-w-7xl space-y-5 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-7" data-faq-manager>
    <header className="space-y-2"><div className="flex items-center gap-2 text-emerald-300"><MessageCircleQuestion size={20}/><span className="text-xs font-semibold uppercase tracking-[0.16em]">Seção final da Landing Page</span></div><h2 className="text-2xl font-semibold text-white">Perguntas Frequentes</h2><p className="max-w-3xl text-sm leading-6 text-zinc-300">Configure aqui as perguntas e respostas exibidas no final da página pública de vendas.</p></header>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-white/10 bg-black/25 p-4">
        <label className="block text-sm text-zinc-200">Estado<select value={form.status} onChange={e => setForm({...form,status:e.target.value as Status})} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label>
        <label className="block text-sm text-zinc-200">Pergunta<input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"/></label>
        <label className="block text-sm text-zinc-200">Resposta<textarea required value={form.body} onChange={e => setForm({...form,body:e.target.value})} className="mt-1 min-h-36 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"/></label>
        <div className="flex flex-wrap gap-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"><PlusCircle size={16}/>{editingId ? "Salvar alterações" : "Criar pergunta"}</button>{editingId ? <button type="button" onClick={reset} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200">Cancelar</button> : null}</div>
      </form>
      <div className="space-y-3">{content.isLoading ? <p className="text-sm text-zinc-400">Carregando...</p> : items.length ? items.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4"><span className="text-xs uppercase tracking-wider text-emerald-200">{statusLabel(item.status)}</span><h3 className="mt-1 font-medium text-white">{item.title}</h3><p className="mt-2 text-sm text-zinc-400">{item.body || "Sem resposta."}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => edit(item)} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200"><PencilLine size={15}/>Editar</button><button type="button" disabled={deletingId===item.id} onClick={() => void remove(item)} className="inline-flex items-center gap-1 rounded-lg border border-red-400/25 px-3 py-2 text-sm text-red-200 disabled:opacity-60"><Trash2 size={15}/>{deletingId===item.id?"Excluindo...":"Excluir"}</button></div></article>) : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">Nenhuma pergunta cadastrada.</p>}</div>
    </div>
  </section>;
}
