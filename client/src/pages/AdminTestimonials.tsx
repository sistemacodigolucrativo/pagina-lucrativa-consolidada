import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FileText, LayoutDashboard, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Administração", path: "/admin", group: "Gestão" },
  { icon: FileText, label: "Relatos", path: "/admin/relatos", group: "Gestão" },
];
const statusLabels = { pending: "Em análise", approved: "Aprovado", rejected: "Necessita ajuste", archived: "Arquivado" } as const;
type TestimonialStatus = keyof typeof statusLabels;

export default function AdminTestimonials() {
  const utils = trpc.useUtils();
  const testimonials = trpc.admin.testimonials.useQuery();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const update = trpc.admin.updateTestimonial.useMutation({
    onSuccess: async () => {
      await utils.admin.testimonials.invalidate();
      toast.success("Revisão do relato atualizada.");
    },
    onError: error => toast.error(error.message),
  });
  function save(id: number, status: TestimonialStatus, fallbackNote: string | null) {
    update.mutate({ id, status, adminNote: notes[id] ?? fallbackNote ?? null });
  }

  return <DashboardLayout menuItems={menu} title="Administração"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Curadoria de relatos</span><h1 className="text-3xl font-semibold text-white">Relatos de membros</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Revise somente relatos enviados pela própria conta autenticada. Esta fila não publica material externo e não cria depoimentos automáticos.</p></header><section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">{testimonials.isLoading ? <p className="text-sm text-zinc-400">Carregando relatos...</p> : testimonials.isError ? <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">Não foi possível carregar a fila de relatos. Confirme a sessão administrativa e tente novamente.</p> : testimonials.data?.length ? <div className="space-y-4">{testimonials.data.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-xs uppercase tracking-wider text-amber-200">{statusLabels[item.status]}</span><h2 className="mt-1 font-medium text-white">{item.memberName || "Membro sem nome"}</h2><p className="text-sm text-zinc-500">{item.memberEmail || "E-mail não informado"}</p></div><time className="text-xs text-zinc-500">Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}</time></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{item.content}</p><div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]"><label className="text-sm text-zinc-300">Nota privada para o membro<textarea value={notes[item.id] ?? item.adminNote ?? ""} onChange={event => setNotes(current => ({ ...current, [item.id]: event.target.value }))} maxLength={4000} className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none ring-amber-300/50 focus:ring-2" placeholder="Opcional: descreva a decisão ou o ajuste necessário." /></label><label className="text-sm text-zinc-300">Status<select defaultValue={item.status} onChange={event => save(item.id, event.target.value as TestimonialStatus, item.adminNote)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-white"><option value="pending">Em análise</option><option value="approved">Aprovado</option><option value="rejected">Necessita ajuste</option><option value="archived">Arquivado</option></select></label><button onClick={() => save(item.id, item.status, item.adminNote)} disabled={update.isPending} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:opacity-60"><Save className="size-4" />Salvar nota</button></div><p className="mt-3 flex items-center gap-2 text-xs leading-5 text-zinc-500"><CheckCircle2 className="size-4 text-amber-200" />Aprovado não significa publicado. Qualquer divulgação exige uma etapa editorial e autorização adequada.</p></article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Ainda não há relatos enviados por membros. Nenhum conteúdo foi criado automaticamente.</p>}</section></main></DashboardLayout>;
}
