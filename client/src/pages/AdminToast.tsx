import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCircle2, Eye, Pencil, Plus, RotateCcw, Sparkles, Trash2, XCircle } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type ToastForm = {
  title: string;
  message: string;
  disclaimer: string;
  status: "draft" | "published";
};

const TOAST_CATEGORY = "Toast";
const TOAST_TYPE = "social-proof-template";
const defaultForm = (): ToastForm => ({
  title: "",
  message: "{{nome}}, de {{cidade}}, está conhecendo a Página Lucrativa.",
  disclaimer: "Demonstração ilustrativa — não representa uma compra real.",
  status: "published",
});

function renderPreview(message: string) {
  return message
    .replaceAll("{{nome}}", "Ana")
    .replaceAll("{{cidade}}", "Curitiba");
}

function parseDisclaimer(body?: string | null) {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body) as { disclaimer?: string };
    return parsed.disclaimer ?? "";
  } catch {
    return body;
  }
}

export default function AdminToast() {
  const utils = trpc.useUtils();
  const content = trpc.admin.content.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState<ToastForm>(defaultForm);

  const toastItems = useMemo(
    () => (content.data ?? []).filter(item => item.kind === "notice" && item.resourceCategory === TOAST_CATEGORY && item.resourceType === TOAST_TYPE),
    [content.data],
  );
  const visibleItems = toastItems.filter(item => (showArchived ? item.status === "archived" : item.status !== "archived"));
  const activeCount = toastItems.filter(item => item.status === "published").length;
  const draftCount = toastItems.filter(item => item.status === "draft").length;
  const archivedCount = toastItems.filter(item => item.status === "archived").length;
  const refresh = () => utils.admin.content.invalidate();

  const create = trpc.admin.createContent.useMutation({
    onSuccess: () => {
      void refresh();
      setForm(defaultForm());
      toast.success("Modelo de Toast criado.");
    },
    onError: error => toast.error(error.message),
  });

  const update = trpc.admin.updateContent.useMutation({
    onSuccess: () => {
      void refresh();
      setEditingId(null);
      setForm(defaultForm());
      toast.success("Modelo de Toast atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  const updateStatus = trpc.admin.updateContentStatus.useMutation({
    onSuccess: () => void refresh(),
    onError: error => toast.error(error.message),
  });

  const busy = create.isPending || update.isPending || updateStatus.isPending;

  function submit(event: FormEvent) {
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
      resourceCategory: TOAST_CATEGORY,
      resourceType: TOAST_TYPE,
      status: form.status,
    };
    if (editingId) update.mutate({ id: editingId, ...payload });
    else create.mutate(payload);
  }

  function edit(item: NonNullable<typeof content.data>[number]) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      message: item.summary ?? "",
      disclaimer: parseDisclaimer(item.body),
      status: item.status === "published" ? "published" : "draft",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(defaultForm());
  }

  function remove(id: number) {
    if (!window.confirm("Excluir este modelo de Toast? Ele será arquivado com segurança e poderá ser restaurado.")) return;
    updateStatus.mutate({ id, status: "archived" }, { onSuccess: () => toast.success("Modelo removido do Toast.") });
  }

  function restore(id: number) {
    updateStatus.mutate({ id, status: "draft" }, { onSuccess: () => toast.success("Modelo restaurado como rascunho.") });
  }

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
        <header className="relative overflow-hidden rounded-3xl border border-emerald-300/15 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.14),transparent_38%),linear-gradient(145deg,rgba(9,18,16,.98),rgba(3,8,9,.99))] p-6 shadow-2xl md:p-8">
          <div className="absolute right-5 top-5 rounded-full border border-emerald-300/20 bg-emerald-300/5 p-3 text-emerald-300">
            <Sparkles className="size-5" />
          </div>
          <div className="max-w-3xl">
            <span className="text-[11px] font-semibold uppercase tracking-[.18em] text-emerald-300">Sistema · Prova social</span>
            <div className="mt-3 flex items-center gap-3">
              <Bell className="size-7 text-emerald-300" />
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Central de Toast</h1>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 md:text-base">
              Crie e organize modelos de notificação para a experiência pública. Use <strong className="text-white">{"{{nome}}"}</strong> e <strong className="text-white">{"{{cidade}}"}</strong> como variáveis dinâmicas.
            </p>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-emerald-300/15 bg-zinc-950/70 p-5"><span className="text-xs uppercase tracking-wider text-zinc-500">Ativos</span><div className="mt-2 flex items-end justify-between"><strong className="text-3xl text-white">{activeCount}</strong><CheckCircle2 className="size-5 text-emerald-300" /></div></article>
          <article className="rounded-2xl border border-amber-300/15 bg-zinc-950/70 p-5"><span className="text-xs uppercase tracking-wider text-zinc-500">Rascunhos</span><div className="mt-2 flex items-end justify-between"><strong className="text-3xl text-white">{draftCount}</strong><XCircle className="size-5 text-amber-300" /></div></article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5"><span className="text-xs uppercase tracking-wider text-zinc-500">Arquivados</span><div className="mt-2 flex items-end justify-between"><strong className="text-3xl text-white">{archivedCount}</strong><Trash2 className="size-5 text-zinc-500" /></div></article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-white/10 bg-zinc-950/75 p-5 shadow-xl md:p-6">
            <div className="flex items-center justify-between gap-4"><div><span className="text-xs uppercase tracking-wider text-emerald-300">Editor</span><h2 className="mt-1 text-xl font-semibold text-white">{editingId ? "Editar modelo" : "Novo modelo"}</h2></div>{editingId ? <button type="button" onClick={cancelEdit} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">Cancelar</button> : null}</div>

            <label className="block text-sm text-zinc-200">Nome interno<input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} maxLength={240} placeholder="Ex.: Visitante conhecendo o projeto" className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50" /></label>

            <label className="block text-sm text-zinc-200">Mensagem<textarea value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} maxLength={8000} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50" /></label>

            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setForm({ ...form, message: `${form.message}{{nome}}` })} className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-xs text-emerald-200">+ nome</button><button type="button" onClick={() => setForm({ ...form, message: `${form.message}{{cidade}}` })} className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-xs text-emerald-200">+ cidade</button></div>

            <label className="block text-sm text-zinc-200">Aviso / rodapé<textarea value={form.disclaimer} onChange={event => setForm({ ...form, disclaimer: event.target.value })} maxLength={4000} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50" /></label>

            <label className="block text-sm text-zinc-200">Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ToastForm["status"] })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white"><option value="published">Ativo</option><option value="draft">Rascunho / desativado</option></select></label>

            <section className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[.035] p-4"><div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300"><Eye className="size-4" />Preview</div><div className="rounded-2xl border border-emerald-200/20 bg-gradient-to-r from-[#071512] to-[#03090c] p-4 shadow-xl"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-200 text-[10px] font-bold text-black">PL</span><div className="min-w-0"><span className="text-[9px] uppercase tracking-[.14em] text-emerald-300">Atividade ilustrativa</span><p className="mt-1 text-sm font-medium leading-5 text-white">{renderPreview(form.message) || "Sua mensagem aparecerá aqui."}</p>{form.disclaimer ? <p className="mt-1 text-[10px] leading-4 text-zinc-400">{form.disclaimer}</p> : null}</div></div></div></section>

            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 font-semibold text-black transition hover:bg-emerald-200 disabled:opacity-50">{editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}{busy ? "Salvando..." : editingId ? "Salvar alterações" : "Criar modelo"}</button>
          </form>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/75 p-5 shadow-xl md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><span className="text-xs uppercase tracking-wider text-emerald-300">Biblioteca</span><h2 className="mt-1 text-xl font-semibold text-white">Modelos cadastrados</h2></div><button type="button" onClick={() => setShowArchived(value => !value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">{showArchived ? "Ver ativos" : `Lixeira (${archivedCount})`}</button></div>

            {content.isLoading ? <p className="text-sm text-zinc-400">Carregando modelos...</p> : visibleItems.length ? <div className="space-y-3">{visibleItems.map(item => <article key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-emerald-300/20"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${item.status === "published" ? "bg-emerald-300/10 text-emerald-300" : item.status === "archived" ? "bg-zinc-800 text-zinc-400" : "bg-amber-300/10 text-amber-200"}`}>{item.status === "published" ? "Ativo" : item.status === "archived" ? "Arquivado" : "Rascunho"}</span><span className="text-[10px] text-zinc-600">#{item.id}</span></div><h3 className="mt-2 font-medium text-white">{item.title}</h3><p className="mt-2 text-sm leading-5 text-zinc-400">{item.summary}</p>{parseDisclaimer(item.body) ? <p className="mt-2 text-[11px] leading-4 text-zinc-600">{parseDisclaimer(item.body)}</p> : null}</div></div><div className="mt-4 flex flex-wrap gap-2">{item.status === "archived" ? <button type="button" disabled={busy} onClick={() => restore(item.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/20 px-3 py-2 text-xs text-emerald-200"><RotateCcw className="size-3.5" />Restaurar</button> : <><button type="button" onClick={() => edit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-200"><Pencil className="size-3.5" />Editar</button><button type="button" disabled={busy} onClick={() => updateStatus.mutate({ id: item.id, status: item.status === "published" ? "draft" : "published" })} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/20 px-3 py-2 text-xs text-emerald-200">{item.status === "published" ? "Desativar" : "Ativar"}</button><button type="button" disabled={busy} onClick={() => remove(item.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/15 px-3 py-2 text-xs text-red-300"><Trash2 className="size-3.5" />Excluir</button></>}</div></article>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center"><Bell className="mx-auto size-8 text-zinc-700" /><p className="mt-3 text-sm text-zinc-400">{showArchived ? "A lixeira está vazia." : "Nenhum modelo de Toast cadastrado ainda."}</p></div>}
          </section>
        </section>
      </main>
    </DashboardLayout>
  );
}
