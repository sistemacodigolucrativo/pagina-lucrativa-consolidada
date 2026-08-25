import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, LayoutDashboard, MessageCircleMore, Send, ShieldCheck, Star } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: MessageCircleMore, label: "Fazer depoimento", path: "/membros/fazer-depoimento", group: "Participação" },
];

const labels = { pending: "Em análise", approved: "Aprovado", rejected: "Necessita ajuste", archived: "Arquivado" } as const;

export default function MemberTestimonial() {
  const utils = trpc.useUtils();
  const testimonials = trpc.member.testimonials.useQuery();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [confirmed, setConfirmed] = useState(false);
  const createTestimonial = trpc.member.createTestimonial.useMutation({
    onSuccess: async () => {
      setContent("");
      setRating(5);
      setConfirmed(false);
      await utils.member.testimonials.invalidate();
      toast.success("Seu depoimento foi registrado para análise.");
    },
    onError: error => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!confirmed) return toast.error("Confirme que o depoimento é de sua própria autoria.");
    createTestimonial.mutate({ content, rating, authorConfirmed: true });
  }

  return <DashboardLayout menuItems={menu} title="Escritório Virtual">
    <main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
      <header className="space-y-2">
        <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Depoimento autêntico</span>
        <h1 className="text-3xl font-semibold text-white">Compartilhe sua experiência</h1>
        <p className="max-w-3xl text-sm leading-6 text-zinc-300">Envie somente um depoimento próprio e verdadeiro sobre sua experiência. O conteúdo fica privado até a revisão da administração e não é publicado automaticamente.</p>
      </header>
      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
        <form onSubmit={submit} className="order-1 min-w-0 space-y-4 rounded-2xl border border-emerald-300/25 bg-zinc-950/60 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-white"><MessageCircleMore className="size-5 text-emerald-300" /><h2 className="font-medium">Escrever depoimento</h2></div>
          <label className="block text-sm leading-6 text-zinc-200">Avaliação<select required value={rating} onChange={event => setRating(Number(event.target.value))} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-white outline-none ring-emerald-300/50 focus:ring-2"><option value={5}>5 de 5</option><option value={4}>4 de 5</option><option value={3}>3 de 5</option><option value={2}>2 de 5</option><option value={1}>1 de 5</option></select></label>
          <label className="block text-sm leading-6 text-zinc-200">Sua experiência<textarea required minLength={30} maxLength={8000} value={content} onChange={event => setContent(event.target.value)} placeholder="Conte, com suas próprias palavras, como foi a sua experiência com a operação." className="mt-1 min-h-48 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none ring-emerald-300/50 focus:ring-2" /></label>
          <p className="text-xs text-zinc-500">{content.length}/8000 caracteres</p>
          <label className="flex items-start gap-3 text-sm leading-6 text-zinc-300"><input required type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1 size-4" />Confirmo que este texto é meu, não representa terceiros e não contém dados pessoais, comprovantes ou imagens sem autorização.</label>
          <button type="submit" disabled={createTestimonial.isPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:opacity-60 sm:w-auto"><Send className="size-4" />{createTestimonial.isPending ? "Enviando..." : "Enviar depoimento para análise"}</button>
        </form>
        <section className="order-2 min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-white"><ShieldCheck className="size-5 text-emerald-300" /><h2 className="font-medium">Como funciona a revisão</h2></div>
          <p className="text-sm leading-6 text-zinc-300">A administração pode aprovar, solicitar ajuste, arquivar ou manter seu depoimento em análise. Aprovação significa apenas que o conteúdo está apto para a próxima etapa; não cria uma publicação pública automática.</p>
          <div className="rounded-xl border border-white/10 bg-black/25 p-4"><span className="text-xs uppercase tracking-wider text-emerald-200">Proteção de autoria</span><p className="mt-2 text-sm leading-6 text-zinc-300">Não envie depoimentos em nome de clientes, pessoas da rede ou qualquer terceiro. Para material externo, é necessária autorização verificável do titular.</p></div>
        </section>
      </section>
      <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Acompanhamento</span><h2 className="mt-1 text-lg font-medium text-white">Meus depoimentos enviados</h2></div><span className="text-xs uppercase tracking-wider text-zinc-500">{testimonials.data?.length ?? 0} registros</span></div>
        {testimonials.isLoading ? <p className="text-sm text-zinc-400">Carregando seus depoimentos...</p> : testimonials.isError ? <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">Não foi possível carregar seus depoimentos agora. Tente atualizar a página.</p> : testimonials.data?.length ? <div className="space-y-3">{testimonials.data.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs uppercase tracking-wider text-emerald-200">{labels[item.status]}</span><p className="mt-1 flex items-center gap-1 text-xs text-zinc-400"><Star className="size-3 text-emerald-300" />{item.rating ? `${item.rating}/5` : "Sem avaliação registrada"}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{item.content}</p></div><time className="text-xs text-zinc-500">{new Date(item.updatedAt).toLocaleString("pt-BR")}</time></div>{item.adminNote ? <div className="mt-4 border-l-2 border-emerald-300 pl-3"><span className="text-xs uppercase tracking-wider text-emerald-200">Retorno da administração</span><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{item.adminNote}</p></div> : <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500"><CheckCircle2 className="size-4" />Aguardando revisão da administração.</p>}</article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Você ainda não enviou nenhum depoimento. Quando desejar registrar sua própria experiência, use o formulário acima.</p>}
      </section>
    </main>
  </DashboardLayout>;
}
