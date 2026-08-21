import DashboardLayout from "@/components/DashboardLayout";
import { PhoneInput } from "@/components/PhoneInput";
import { trpc } from "@/lib/trpc";
import { normalizePhone } from "@shared/contactValidation";
import { normalizeHttpUrl } from "@shared/structuredValidation";
import { CheckCircle2, Loader2, Share2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const field = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-3 text-white outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/20";

export default function MemberInitialPublicProfile() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: status, isLoading } = trpc.member.initialProfileStatus.useQuery();
  const [form, setForm] = useState({ name: "", whatsapp: "", facebookUrl: "", instagramUrl: "" });
  const complete = trpc.member.completeInitialPublicProfile.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.member.initialProfileStatus.invalidate(), utils.member.profile.invalidate(), utils.member.overview.invalidate()]);
      toast.success("Perfil público configurado.");
      setLocation("/membros");
    },
    onError: error => toast.error(error.message),
  });

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const whatsapp = normalizePhone(form.whatsapp);
    if (form.name.trim().length < 2) return toast.error("Informe seu nome com pelo menos 2 caracteres.");
    if (whatsapp.length < 10) return toast.error("Informe um WhatsApp com DDD.");
    complete.mutate({
      name: form.name.trim(),
      whatsapp,
      facebookUrl: form.facebookUrl ? normalizeHttpUrl(form.facebookUrl) : null,
      instagramUrl: form.instagramUrl ? normalizeHttpUrl(form.instagramUrl) : null,
    });
  }

  if (isLoading) return <DashboardLayout title="Escritório Virtual"><main className="grid min-h-[60vh] place-items-center p-6 text-zinc-300"><Loader2 className="size-6 animate-spin text-emerald-300" /></main></DashboardLayout>;
  if (status && !status.required) return <DashboardLayout title="Escritório Virtual"><main className="mx-auto max-w-xl p-6"><section className="rounded-2xl border border-emerald-300/25 bg-zinc-950/70 p-6 text-center"><CheckCircle2 className="mx-auto size-7 text-emerald-300" /><h1 className="mt-4 text-2xl font-semibold text-white">Perfil público já configurado.</h1><button type="button" className="btn btn-primary mt-5" onClick={() => setLocation("/membros")}>Ir para o Escritório</button></section></main></DashboardLayout>;

  return <DashboardLayout title="Escritório Virtual"><main className="mx-auto w-full max-w-2xl p-5 sm:p-8">
    <form onSubmit={submit} className="space-y-5 rounded-3xl border border-emerald-300/20 bg-zinc-950/80 p-5 shadow-2xl sm:p-8">
      <header><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Configuração obrigatória</span><h1 className="mt-3 text-3xl font-semibold text-white">Complete seus dados públicos.</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Essas informações criam a base da sua Página Lucrativa. O número do WhatsApp não será exibido em texto na página pública; aparecerá como botão “WhatsApp”.</p></header>
      <section className="grid gap-4">
        <label className="block text-sm text-zinc-200">Nome público<input required minLength={2} maxLength={180} value={form.name} onChange={event => setField("name", event.target.value)} className={field} placeholder="Seu nome" /></label>
        <label className="block text-sm text-zinc-200">WhatsApp<PhoneInput required value={form.whatsapp} onChange={value => setField("whatsapp", value)} className={field} placeholder="DDD e número" /></label>
        <section className="space-y-4 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-white"><Share2 className="size-4 text-emerald-300" /><h2 className="font-medium">Redes sociais opcionais</h2></div>
          <label className="block text-sm text-zinc-200">Facebook<input type="url" maxLength={512} value={form.facebookUrl} onChange={event => setField("facebookUrl", event.target.value)} className={field} placeholder="https://facebook.com/seu-perfil" /></label>
          <label className="block text-sm text-zinc-200">Instagram<input type="url" maxLength={512} value={form.instagramUrl} onChange={event => setField("instagramUrl", event.target.value)} className={field} placeholder="https://instagram.com/seu-perfil" /></label>
        </section>
      </section>
      <button disabled={complete.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-black disabled:opacity-60">{complete.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Confirmar e entrar no Escritório</button>
    </form>
  </main></DashboardLayout>;
}
