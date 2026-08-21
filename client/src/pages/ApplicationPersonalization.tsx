import { PhoneInput } from "@/components/PhoneInput";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { normalizeEmail, normalizePhone } from "@shared/contactValidation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const field = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-3 text-white outline-none ring-emerald-300/50 focus:ring-2";

export default function ApplicationPersonalization() {
  const [location] = useLocation();
  const publicCode = useMemo(() => new URLSearchParams(location.split("?")[1] ?? "").get("codigo")?.trim().toLowerCase() ?? "", [location]);
  const accessToken = typeof window === "undefined" || !publicCode ? "" : sessionStorage.getItem(`pl-application-access-${publicCode}`) ?? "";
  const [doneEmail, setDoneEmail] = useState("");
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", slug: "", bio: "", password: "", pixType: "celular", pixKey: "" });
  const [showPassword, setShowPassword] = useState(false);
  const complete = trpc.public.completePersonalization.useMutation({
    onSuccess: data => {
      sessionStorage.removeItem(`pl-application-access-${publicCode}`);
      setDoneEmail(data.email);
      toast.success("Página Lucrativa personalizada com sucesso.");
    },
    onError: error => toast.error(error.message),
  });

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!publicCode || !accessToken) return toast.error("Acesso inválido ou expirado. Volte ao link de senha especial.");
    if (form.name.trim().length < 2) return toast.error("Informe seu nome com pelo menos 2 caracteres.");
    if (!normalizeEmail(form.email)) return toast.error("Informe um e-mail válido.");
    if (normalizePhone(form.whatsapp).length < 10) return toast.error("Informe um WhatsApp com DDD.");
    if (form.slug.trim().length < 3) return toast.error("Informe um identificador da página com pelo menos 3 caracteres.");
    if (form.password.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");
    if (!/[A-Za-z]/.test(form.password)) return toast.error("A senha deve conter pelo menos uma letra.");
    if (!/\d/.test(form.password)) return toast.error("A senha deve conter pelo menos um número.");
    complete.mutate({
      publicCode,
      accessToken,
      name: form.name,
      email: normalizeEmail(form.email),
      whatsapp: normalizePhone(form.whatsapp),
      slug: form.slug.trim().toLowerCase(),
      bio: form.bio || null,
      password: form.password,
      pixType: form.pixType || null,
      pixKey: form.pixKey || null,
    });
  }

  if (!publicCode || !accessToken) return <main className="grid min-h-screen place-items-center bg-[#050505] p-6"><section className="max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-7 text-center"><ShieldCheck className="mx-auto size-7 text-emerald-300" /><h1 className="mt-4 text-xl font-semibold text-white">Acesso inválido</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Volte ao link de senha especial e informe a senha novamente para continuar.</p></section></main>;

  if (doneEmail) return <main className="access-page"><section className="access-card"><div className="access-seal"><CheckCircle2 size={25} /></div><span className="office-eyebrow">Personalização concluída</span><h1>Parabéns! Sua Página Lucrativa foi personalizada com sucesso.</h1><p>Use o e-mail <strong>{doneEmail}</strong> e a senha cadastrada para acessar seu Escritório Virtual.</p><a className="btn btn-primary" href={withAppBase("/acesso")}>Acessar meu Escritório Virtual <ArrowRight size={16} /></a></section></main>;

  const passwordRules = [
    { label: "mínimo de 6 caracteres", ok: form.password.length >= 6 },
    { label: "pelo menos 1 letra", ok: /[A-Za-z]/.test(form.password) },
    { label: "pelo menos 1 número", ok: /\d/.test(form.password) },
  ];

  return <main className="min-h-screen bg-[#050505] p-5 text-zinc-100"><form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-5 rounded-3xl border border-emerald-300/20 bg-zinc-950 p-5 shadow-2xl sm:p-8">
    <header><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Personalizar sua Página Lucrativa</span><h1 className="mt-3 text-3xl font-semibold text-white">Configure seus dados iniciais.</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Esses dados criam sua conta, seu perfil público e seus recebimentos iniciais.</p></header>
    <section className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm text-zinc-200">Nome<input required minLength={2} maxLength={180} value={form.name} onChange={event => setField("name", event.target.value)} className={field} /></label>
      <label className="block text-sm text-zinc-200">E-mail<input required type="email" maxLength={320} value={form.email} onChange={event => setField("email", event.target.value)} className={field} /></label>
      <label className="block text-sm text-zinc-200">WhatsApp<PhoneInput required value={form.whatsapp} onChange={value => setField("whatsapp", value)} className={field} /></label>
      <label className="block text-sm text-zinc-200">Identificador da página<input required minLength={3} maxLength={96} value={form.slug} onChange={event => setField("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className={field} placeholder="seu-nome" /></label>
      <label className="block text-sm text-zinc-200 sm:col-span-2">Apresentação<textarea maxLength={2000} value={form.bio} onChange={event => setField("bio", event.target.value)} className={`${field} min-h-24`} /></label>
      <div className="block text-sm text-zinc-200">
        <span>Senha de acesso</span>
        <div className="relative mt-1">
          <input required type={showPassword ? "text" : "password"} minLength={6} maxLength={128} value={form.password} onChange={event => setField("password", event.target.value)} className={`${field} mt-0 pr-12`} aria-describedby="password-rules" />
          <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-zinc-400 hover:text-emerald-200" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        </div>
        <div id="password-rules" className="mt-2 rounded-lg border border-white/10 bg-black/25 p-3 text-xs leading-5 text-zinc-400">
          <p className="text-zinc-300">Exemplo: <strong>pagina123</strong></p>
          <ul className="mt-1 space-y-1">{passwordRules.map(rule => <li key={rule.label} className={rule.ok ? "text-emerald-200" : "text-zinc-500"}>{rule.ok ? "✓" : "•"} {rule.label}</li>)}</ul>
        </div>
      </div>
      <label className="block text-sm text-zinc-200">Tipo PIX<select value={form.pixType} onChange={event => setField("pixType", event.target.value)} className={field}><option value="celular">Celular</option><option value="cpf">CPF</option><option value="cnpj">CNPJ</option><option value="e-mail">E-mail</option><option value="aleatoria">Chave aleatória</option></select></label>
      <label className="block text-sm text-zinc-200 sm:col-span-2">Chave PIX<input value={form.pixKey} onChange={event => setField("pixKey", event.target.value)} maxLength={255} className={field} /></label>
    </section>
    <button disabled={complete.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-black disabled:opacity-60">{complete.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Concluir personalização</button>
  </form></main>;
}
