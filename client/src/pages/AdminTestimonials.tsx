import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { CheckCircle2, FileText, LayoutDashboard, Save, Search, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", group: "Visão geral" },
  { icon: FileText, label: "Depoimentos", path: "/admin/relatos", group: "Relacionamento" },
];
const statusLabels = { pending: "Em análise", approved: "Aprovado", rejected: "Necessita ajuste", archived: "Arquivado" } as const;
type TestimonialStatus = keyof typeof statusLabels;
type TestimonialFilter = "all" | TestimonialStatus;

export default function AdminTestimonials() {
  const utils = trpc.useUtils();
  const testimonials = trpc.admin.testimonials.useQuery();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<TestimonialFilter>("all");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const update = trpc.admin.updateTestimonial.useMutation({
    onSuccess: async () => {
      await utils.admin.testimonials.invalidate();
      toast.success("Revisão do depoimento atualizada.");
    },
    onError: error => toast.error(error.message),
  });
  function save(id: number, status: TestimonialStatus, fallbackNote: string | null) {
    update.mutate({ id, status, adminNote: notes[id] ?? fallbackNote ?? null });
  }
  const all = testimonials.data ?? [];
  const counts = useMemo(() => ({
    all: all.length,
    pending: all.filter(item => item.status === "pending").length,
    approved: all.filter(item => item.status === "approved").length,
    rejected: all.filter(item => item.status === "rejected").length,
    archived: all.filter(item => item.status === "archived").length,
  }), [all]);
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return all.filter(item => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!term) return true;
      return [item.memberName ?? "", item.memberEmail ?? "", item.content, item.adminNote ?? ""].some(value => value.toLowerCase().includes(term));
    });
  }, [all, filter, query]);
  async function remove(id: number, memberName: string | null) {
    if (!window.confirm(`Excluir definitivamente o depoimento de ${memberName || "este membro"}?\n\nEsta ação não poderá ser desfeita.`)) return;
    setDeletingId(id);
    try {
      const response = await fetch(withAppBase(`/api/admin/relationship-maintenance/testimonials/${id}`), { method: "DELETE", credentials: "include" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir o depoimento.");
      await utils.admin.testimonials.invalidate();
      toast.success("Depoimento excluído.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o depoimento.");
    } finally {
      setDeletingId(null);
    }
  }

  return <DashboardLayout menuItems={menu} title="Administração"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Gestão de depoimentos</span><h1 className="text-3xl font-semibold text-white">Depoimentos de membros</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Revise, aprove, solicite ajustes, arquive ou exclua depoimentos enviados pela própria conta autenticada.</p></header>
  <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{(["all", "pending", "approved", "rejected", "archived"] as TestimonialFilter[]).map(status => <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-2xl border p-4 text-left ${filter === status ? "border-emerald-300/40 bg-emerald-300/10" : "border-white/10 bg-zinc-950/60"}`}><span className="text-xs uppercase tracking-wider text-zinc-400">{status === "all" ? "Todos" : statusLabels[status]}</span><strong className="mt-1 block text-2xl text-white">{counts[status]}</strong></button>)}</section>
  <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="font-medium text-white">Fila de moderação</h2><label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-500" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar membro ou conteúdo" className="h-10 w-full rounded-lg border border-white/15 bg-black pl-9 pr-3 text-sm text-white" /></label></div>{testimonials.isLoading ? <p className="text-sm text-zinc-400">Carregando depoimentos...</p> : testimonials.isError ? <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">Não foi possível carregar a fila de depoimentos. Confirme a sessão administrativa e tente novamente.</p> : visible.length ? <div className="space-y-4">{visible.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><span className="text-xs uppercase tracking-wider text-emerald-200">{statusLabels[item.status]}</span><h2 className="mt-1 font-medium text-white">{item.memberName || "Membro sem nome"}</h2><p className="text-sm text-zinc-500">{item.memberEmail || "E-mail não informado"}</p><p className="mt-2 flex items-center gap-1 text-xs text-zinc-400"><Star className="size-3 text-emerald-300" />{item.rating ? `${item.rating}/5` : "Sem avaliação registrada"}</p></div><time className="text-xs text-zinc-500">Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}</time></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{item.content}</p><div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]"><label className="text-sm text-zinc-300">Nota privada para o membro<textarea value={notes[item.id] ?? item.adminNote ?? ""} onChange={event => setNotes(current => ({ ...current, [item.id]: event.target.value }))} maxLength={4000} className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none ring-emerald-300/50 focus:ring-2" placeholder="Opcional: descreva a decisão ou o ajuste necessário." /></label><label className="text-sm text-zinc-300">Status<select defaultValue={item.status} onChange={event => save(item.id, event.target.value as TestimonialStatus, item.adminNote)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-white"><option value="pending">Em análise</option><option value="approved">Aprovado</option><option value="rejected">Necessita ajuste</option><option value="archived">Arquivado</option></select></label><div className="mt-auto grid gap-2 sm:grid-cols-2 lg:grid-cols-1"><button onClick={() => save(item.id, item.status, item.adminNote)} disabled={update.isPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:opacity-60"><Save className="size-4" />Salvar nota</button><button onClick={() => void remove(item.id, item.memberName)} disabled={deletingId === item.id} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 disabled:opacity-60"><Trash2 className="size-4" />Excluir</button></div></div><p className="mt-3 flex items-center gap-2 text-xs leading-5 text-zinc-500"><CheckCircle2 className="size-4 text-emerald-200" />Aprovação mantém a origem real do depoimento; conteúdo não deve ser fabricado ou alterado para simular experiência do membro.</p></article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Nenhum depoimento corresponde aos filtros atuais.</p>}</section></main></DashboardLayout>;
}
