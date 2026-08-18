import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

export default function DemoLogin() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const login = trpc.auth.demoLogin.useMutation({
    onSuccess: async account => {
      await utils.auth.me.invalidate();
      setLocation(account.role === "admin" ? "/admin" : "/membros");
    },
    onError: error => setFormError(error.message),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    login.mutate({ username, password });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] px-5 py-6 text-[#f5f0e7] sm:px-8 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d5aa5a]/10" />
        <div className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d5aa5a]/15" />
        <div className="absolute -right-24 -top-20 h-[440px] w-[440px] rounded-full bg-[#d5aa5a]/[0.10] blur-[120px]" />
        <div className="absolute -bottom-32 -left-28 h-[380px] w-[380px] rounded-full bg-[#d5aa5a]/[0.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#f5f0e7]/65 transition-colors hover:text-[#d5aa5a]">
            <ArrowLeft className="h-4 w-4" /> Voltar para a Página Lucrativa
          </Link>
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f5f0e7]/45 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d5aa5a] shadow-[0_0_14px_rgba(213,170,90,0.9)]" /> Acesso reservado
          </span>
        </header>

        <section aria-labelledby="login-title" className="mx-auto flex w-full max-w-md flex-1 items-center py-10 sm:py-14">
          <div className="relative w-full overflow-hidden rounded-[26px] border border-[#d5aa5a]/25 bg-[#0c0c0b]/90 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-9">
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.045),transparent_32%,rgba(213,170,90,0.07))]" />
            <div className="relative">
              <div className="mb-9 flex items-start justify-between gap-5">
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#d5aa5a]">Ambiente reservado</p>
                  <h1 id="login-title" className="font-[Space_Grotesk] text-3xl font-semibold tracking-[-0.035em] text-[#f5f0e7] sm:text-4xl">Acesse seu Escritório Virtual.</h1>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d5aa5a]/50 bg-[#d5aa5a]/10 text-[#d5aa5a] shadow-[inset_0_0_20px_rgba(213,170,90,0.12)]">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>

              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-username" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e7]/55">Usuário</Label>
                    <Input id="demo-username" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" className="h-12 rounded-md border-white/15 bg-black/35 text-[#f5f0e7] shadow-inner shadow-black/30 placeholder:text-[#f5f0e7]/25 focus-visible:border-[#d5aa5a] focus-visible:ring-[#d5aa5a]/25" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-password" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e7]/55">Senha</Label>
                    <div className="relative">
                      <Input id="demo-password" type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" className="h-12 rounded-md border-white/15 bg-black/35 pr-12 text-[#f5f0e7] shadow-inner shadow-black/30 placeholder:text-[#f5f0e7]/25 focus-visible:border-[#d5aa5a] focus-visible:ring-[#d5aa5a]/25" required />
                      <button type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-[#f5f0e7]/50 transition-colors hover:text-[#d5aa5a] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#d5aa5a]">
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                </div>

                {(formError || login.isError) && <p role="alert" className="border-l-2 border-red-400 pl-3 text-sm text-red-200">{formError || "Não foi possível iniciar a sessão."}</p>}

                <Button type="submit" disabled={login.isPending} className="h-12 w-full rounded-md bg-[#d5aa5a] font-semibold text-[#171108] shadow-[0_10px_30px_rgba(213,170,90,0.2)] transition hover:bg-[#e6c171]">
                  <span>{login.isPending ? "Iniciando sessão..." : "Entrar na conta"}</span>
                  {!login.isPending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
                </Button>

                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#f5f0e7]/48"><ShieldCheck className="h-3.5 w-3.5 text-[#d5aa5a]" aria-hidden="true" /> Dados protegidos</span>
                  <button type="button" disabled title="A recuperação de acesso será configurada em uma próxima etapa." className="text-[11px] text-[#f5f0e7]/48 underline decoration-[#d5aa5a]/45 underline-offset-4 disabled:cursor-not-allowed">Recuperar acesso</button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#f5f0e7]/32">Página Lucrativa · Acesso protegido</footer>
      </div>
    </main>
  );
}
