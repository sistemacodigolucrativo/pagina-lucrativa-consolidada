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
  const [recovering, setRecovering] = useState(false);
  const [loginRedirecting, setLoginRedirecting] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const login = trpc.auth.demoLogin.useMutation();
  const startRecovery = trpc.auth.startPasswordRecovery.useMutation({
    onError: error => setFormError(error.message),
  });
  const resetPassword = trpc.auth.resetPasswordWithSecurityAnswer.useMutation({
    onSuccess: () => {
      setUsername(recoveryEmail);
      setPassword("");
      setSecurityAnswer("");
      setNewPassword("");
      setConfirmPassword("");
      setRecovering(false);
      setFormError("");
      setRecoverySuccess(true);
      startRecovery.reset();
    },
    onError: error => setFormError(error.message),
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (login.isPending || loginRedirecting) return;
    setFormError("");
    setRecoverySuccess(false);
    setLoginRedirecting(true);
    try {
      const account = await login.mutateAsync({ username: username.trim(), password });
      await utils.auth.me.invalidate();
      const currentUser = await utils.auth.me.fetch().catch(() => null);
      if (!currentUser) {
        await new Promise(resolve => window.setTimeout(resolve, 150));
        await utils.auth.me.invalidate();
        const retryUser = await utils.auth.me.fetch().catch(() => null);
        if (!retryUser) throw new Error("Sessão iniciada, mas ainda não foi confirmada. Tente novamente.");
      }
      setLocation(account.role === "admin" ? "/admin" : "/membros");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível iniciar a sessão.");
      setLoginRedirecting(false);
    }
  }

  function submitRecoveryAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setRecoverySuccess(false);
    setSecurityAnswer("");
    setNewPassword("");
    setConfirmPassword("");
    startRecovery.mutate({ identifier: recoveryEmail });
  }

  function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (newPassword !== confirmPassword) {
      setFormError("As senhas não conferem.");
      return;
    }
    resetPassword.mutate({ identifier: recoveryEmail, securityAnswer, newPassword, confirmPassword });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000105] px-5 py-6 text-[#f5f0e7] sm:px-8 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#03d660]/10" />
        <div className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#03d660]/15" />
        <div className="absolute -right-24 -top-20 h-[440px] w-[440px] rounded-full bg-[#03d660]/[0.10] blur-[120px]" />
        <div className="absolute -bottom-32 -left-28 h-[380px] w-[380px] rounded-full bg-[#03d660]/[0.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#f5f0e7]/65 transition-colors hover:text-[#03d660]">
            <ArrowLeft className="h-4 w-4" /> Voltar para o Código Lucrativo
          </Link>
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f5f0e7]/45 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#03d660] shadow-[0_0_14px_rgba(3,214,96,0.9)]" /> Acesso reservado
          </span>
        </header>

        <section aria-labelledby="login-title" className="mx-auto flex w-full max-w-md flex-1 items-center py-10 sm:py-14">
          <div className="relative w-full overflow-hidden rounded-[26px] border border-[#03d660]/25 bg-[#01090E]/90 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-9">
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.045),transparent_32%,rgba(3,214,96,0.07))]" />
            <div className="relative">
              <div className="mb-9 flex items-start justify-between gap-5">
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#03d660]">Ambiente reservado</p>
                  <h1 id="login-title" className="font-[Space_Grotesk] text-3xl font-semibold tracking-[-0.035em] text-[#f5f0e7] sm:text-4xl">Acesse seu Escritório Virtual.</h1>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#03d660]/50 bg-[#03d660]/10 text-[#03d660] shadow-[inset_0_0_20px_rgba(3,214,96,0.12)]">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>

              {!recovering ? <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-username" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e7]/55">Usuário</Label>
                    <Input id="demo-username" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" className="h-12 rounded-md border-white/15 bg-black/35 text-[#f5f0e7] shadow-inner shadow-black/30 placeholder:text-[#f5f0e7]/25 focus-visible:border-[#03d660] focus-visible:ring-[#03d660]/25" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-password" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e7]/55">Senha</Label>
                    <div className="relative">
                      <Input id="demo-password" type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" className="h-12 rounded-md border-white/15 bg-black/35 pr-12 text-[#f5f0e7] shadow-inner shadow-black/30 placeholder:text-[#f5f0e7]/25 focus-visible:border-[#03d660] focus-visible:ring-[#03d660]/25" required />
                      <button type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-[#f5f0e7]/50 transition-colors hover:text-[#03d660] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#03d660]">
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                </div>

                {(formError || login.isError) && <p role="alert" className="border-l-2 border-red-400 pl-3 text-sm text-red-200">{formError || "Não foi possível iniciar a sessão."}</p>}

                <Button type="submit" disabled={login.isPending || loginRedirecting} aria-busy={login.isPending || loginRedirecting} className="h-12 w-full rounded-md bg-[#03d660] font-semibold text-[#00060D] shadow-[0_10px_30px_rgba(3,214,96,0.2)] transition hover:bg-[#ABF6D0]">
                  <span>{login.isPending || loginRedirecting ? "Iniciando sessão..." : "Entrar na conta"}</span>
                  {!login.isPending && !loginRedirecting && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
                </Button>

                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#f5f0e7]/48"><ShieldCheck className="h-3.5 w-3.5 text-[#03d660]" aria-hidden="true" /> Dados protegidos</span>
                  <button type="button" onClick={() => { setRecovering(true); setFormError(""); setRecoverySuccess(false); setRecoveryEmail(username); startRecovery.reset(); }} className="text-[11px] text-[#f5f0e7]/70 underline decoration-[#03d660]/45 underline-offset-4 transition hover:text-[#03d660]">Recuperar acesso</button>
                </div>
                {recoverySuccess ? <p role="status" className="rounded-lg border border-[#03d660]/25 bg-[#03d660]/10 px-3 py-2 text-sm text-[#ABF6D0]">Senha redefinida. Entre com sua nova senha.</p> : null}
              </form> : startRecovery.data ? <form className="space-y-6" onSubmit={submitNewPassword}>
                <div className="space-y-4">
                  <button type="button" onClick={() => { setRecovering(false); setFormError(""); }} className="inline-flex items-center gap-2 text-sm text-[#f5f0e7]/65 transition-colors hover:text-[#03d660]"><ArrowLeft className="h-4 w-4" /> Voltar ao login</button>
                  <div className="rounded-xl border border-[#03d660]/25 bg-[#03d660]/10 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#03d660]">Pergunta secreta</p>
                    <p className="mt-2 text-sm leading-6 text-[#f5f0e7]">{startRecovery.data.securityQuestion}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="security-answer" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e7]/55">Resposta secreta</Label>
                    <Input id="security-answer" value={securityAnswer} onChange={event => setSecurityAnswer(event.target.value)} autoComplete="off" className="h-12 rounded-md border-white/15 bg-black/35 text-[#f5f0e7] shadow-inner shadow-black/30 placeholder:text-[#f5f0e7]/25 focus-visible:border-[#03d660] focus-visible:ring-[#03d660]/25" required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="recovery-new-password" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e7]/55">Nova senha</Label>
                      <Input id="recovery-new-password" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} minLength={6} maxLength={128} autoComplete="new-password" className="h-12 rounded-md border-white/15 bg-black/35 text-[#f5f0e7] shadow-inner shadow-black/30 placeholder:text-[#f5f0e7]/25 focus-visible:border-[#03d660] focus-visible:ring-[#03d660]/25" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recovery-confirm-password" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e7]/55">Confirmar senha</Label>
                      <Input id="recovery-confirm-password" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} minLength={6} maxLength={128} autoComplete="new-password" className="h-12 rounded-md border-white/15 bg-black/35 text-[#f5f0e7] shadow-inner shadow-black/30 placeholder:text-[#f5f0e7]/25 focus-visible:border-[#03d660] focus-visible:ring-[#03d660]/25" required />
                    </div>
                  </div>
                </div>
                {(formError || resetPassword.isError) && <p role="alert" className="border-l-2 border-red-400 pl-3 text-sm text-red-200">{formError || "Não foi possível redefinir a senha."}</p>}
                <Button type="submit" disabled={resetPassword.isPending} className="h-12 w-full rounded-md bg-[#03d660] font-semibold text-[#00060D] shadow-[0_10px_30px_rgba(3,214,96,0.2)] transition hover:bg-[#ABF6D0]">
                  <span>{resetPassword.isPending ? "Salvando nova senha..." : "Definir nova senha"}</span>
                  {!resetPassword.isPending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
                </Button>
              </form> : <form className="space-y-6" onSubmit={submitRecoveryAccount}>
                <div className="space-y-4">
                  <button type="button" onClick={() => { setRecovering(false); setFormError(""); }} className="inline-flex items-center gap-2 text-sm text-[#f5f0e7]/65 transition-colors hover:text-[#03d660]"><ArrowLeft className="h-4 w-4" /> Voltar ao login</button>
                  <p className="text-sm leading-6 text-[#f5f0e7]/70">Informe o e-mail da sua conta para responder a pergunta secreta cadastrada.</p>
                  <div className="space-y-2">
                    <Label htmlFor="recovery-email" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e7]/55">E-mail da conta</Label>
                    <Input id="recovery-email" value={recoveryEmail} onChange={event => setRecoveryEmail(event.target.value.trim().toLowerCase())} type="email" autoComplete="email" className="h-12 rounded-md border-white/15 bg-black/35 text-[#f5f0e7] shadow-inner shadow-black/30 placeholder:text-[#f5f0e7]/25 focus-visible:border-[#03d660] focus-visible:ring-[#03d660]/25" required />
                  </div>
                </div>
                {(formError || startRecovery.isError) && <p role="alert" className="border-l-2 border-red-400 pl-3 text-sm text-red-200">{formError || "Não foi possível iniciar a recuperação."}</p>}
                <Button type="submit" disabled={startRecovery.isPending} className="h-12 w-full rounded-md bg-[#03d660] font-semibold text-[#00060D] shadow-[0_10px_30px_rgba(3,214,96,0.2)] transition hover:bg-[#ABF6D0]">
                  <span>{startRecovery.isPending ? "Localizando conta..." : "Continuar"}</span>
                  {!startRecovery.isPending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
                </Button>
              </form>}
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#f5f0e7]/32">Código Lucrativo · Acesso protegido</footer>
      </div>
    </main>
  );
}
