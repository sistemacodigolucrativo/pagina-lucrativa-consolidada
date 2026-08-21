import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const field = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-3 text-white outline-none ring-emerald-300/50 focus:ring-2";

export default function ApplicationPersonalization() {
  const publicCode = useMemo(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("codigo")?.trim().toLowerCase() ?? "", []);
  const access = trpc.public.applicationPersonalizationAccess.useQuery({ code: publicCode }, { enabled: Boolean(publicCode), retry: false });
  const [doneEmail, setDoneEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const complete = trpc.public.completePersonalization.useMutation({
    onSuccess: data => {
      setDoneEmail(data.email);
      toast.success("Senha de acesso cadastrada.");
    },
    onError: error => toast.error(error.message),
  });

  const passwordRules = [
    { label: "mínimo de 6 caracteres", ok: password.length >= 6 },
    { label: "pelo menos 1 letra", ok: /[A-Za-z]/.test(password) },
    { label: "pelo menos 1 número", ok: /\d/.test(password) },
    { label: "confirmação igual à senha", ok: Boolean(confirmPassword) && password === confirmPassword },
  ];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!publicCode) return toast.error("Link de personalização inválido.");
    if (password.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");
    if (!/[A-Za-z]/.test(password)) return toast.error("A senha deve conter pelo menos uma letra.");
    if (!/\d/.test(password)) return toast.error("A senha deve conter pelo menos um número.");
    if (password !== confirmPassword) return toast.error("A confirmação da senha não confere.");
    complete.mutate({ publicCode, password });
  }

  if (!publicCode) return <main className="grid min-h-screen place-items-center bg-[#050505] p-6"><section className="max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-7 text-center"><ShieldCheck className="mx-auto size-7 text-emerald-300" /><h1 className="mt-4 text-xl font-semibold text-white">Link inválido</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Acesse novamente pelo acompanhamento do pedido aprovado.</p></section></main>;

  if (doneEmail) return <main className="access-page"><section className="access-card"><div className="access-seal"><CheckCircle2 size={25} /></div><span className="office-eyebrow">Senha cadastrada</span><h1>Agora acesse seu Escritório Virtual.</h1><p>Use o e-mail <strong>{doneEmail}</strong> e a senha que você acabou de escolher.</p><p className="access-note">Após o login, o sistema pedirá os dados públicos obrigatórios da sua Página Lucrativa.</p><a className="btn btn-primary" href={withAppBase("/acesso")}>Ir para login <ArrowRight size={16} /></a></section></main>;

  if (access.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] p-6 text-zinc-300"><Loader2 className="size-6 animate-spin text-emerald-300" /></main>;

  if (access.error || !access.data) return <main className="grid min-h-screen place-items-center bg-[#050505] p-6"><section className="max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-7 text-center"><ShieldCheck className="mx-auto size-7 text-emerald-300" /><h1 className="mt-4 text-xl font-semibold text-white">Acesso indisponível</h1><p className="mt-2 text-sm leading-6 text-zinc-400">O pedido ainda não foi aprovado, o link expirou ou a senha já foi cadastrada.</p><a className="btn btn-ghost mt-5" href={withAppBase("/pedido/acompanhar")}>Acompanhar pedido</a></section></main>;

  return <main className="min-h-screen bg-[#050505] p-5 text-zinc-100"><form onSubmit={submit} className="mx-auto w-full max-w-xl space-y-5 rounded-3xl border border-emerald-300/20 bg-zinc-950 p-5 shadow-2xl sm:p-8">
    <header><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Personalização liberada</span><h1 className="mt-3 text-3xl font-semibold text-white">Crie sua senha de acesso.</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Esta senha será usada com o e-mail do pedido para entrar no Escritório Virtual.</p></header>
    <section className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-zinc-300">
      <strong className="block text-white">{access.data.fullName}</strong>
      <span>E-mail de login: {access.data.email}</span>
    </section>
    <label className="block text-sm text-zinc-200">Senha de acesso
      <div className="relative mt-1">
        <input required type={showPassword ? "text" : "password"} minLength={6} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} className={`${field} mt-0 pr-12`} aria-describedby="password-rules" />
        <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-zinc-400 hover:text-emerald-200" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
      </div>
    </label>
    <label className="block text-sm text-zinc-200">Confirmar senha<input required type={showPassword ? "text" : "password"} minLength={6} maxLength={128} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={field} /></label>
    <div id="password-rules" className="rounded-lg border border-white/10 bg-black/25 p-3 text-xs leading-5 text-zinc-400">
      <p className="text-zinc-300">Exemplo de senha válida: <strong>pagina123</strong></p>
      <ul className="mt-1 space-y-1">{passwordRules.map(rule => <li key={rule.label} className={rule.ok ? "text-emerald-200" : "text-zinc-500"}>{rule.ok ? "✓" : "•"} {rule.label}</li>)}</ul>
    </div>
    <button disabled={complete.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-black disabled:opacity-60">{complete.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Cadastrar senha</button>
  </form></main>;
}
