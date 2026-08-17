import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

export default function DemoLogin() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="min-h-screen bg-[#050505] px-5 py-8 text-[#f5f0e7] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <section className="grid w-full overflow-hidden border border-[#e5bd62]/25 bg-[#0b0b0a] shadow-[0_25px_100px_rgba(0,0,0,0.5)] md:grid-cols-[1.05fr_0.95fr]">
          <div className="flex min-h-[320px] flex-col justify-between border-b border-[#e5bd62]/20 bg-[radial-gradient(circle_at_15%_20%,rgba(229,189,98,0.18),transparent_34%),linear-gradient(145deg,#17130d,#070707_68%)] p-8 md:min-h-[580px] md:border-b-0 md:border-r md:p-12">
            <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-[#f5f0e7]/70 transition-colors hover:text-[#e5bd62]">
              <ArrowLeft className="h-4 w-4" /> Voltar para a Página Lucrativa
            </Link>
            <div className="max-w-md space-y-5">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.19em] text-[#e5bd62] uppercase">
                <ShieldCheck className="h-4 w-4" /> Ambiente de verificação
              </span>
              <h1 className="font-[Space_Grotesk] text-4xl font-semibold leading-[0.98] sm:text-5xl">
                Consulte os dois lados da operação.
              </h1>
              <p className="max-w-sm text-sm leading-7 text-[#f5f0e7]/65">
                Esta entrada foi adicionada somente para validar os layouts de membro e administração com perfis separados.
              </p>
            </div>
            <p className="max-w-sm font-mono text-[10px] leading-5 tracking-wide text-[#f5f0e7]/40 uppercase">
              Sessão temporária · Sem acesso ao login Manus
            </p>
          </div>

          <div className="flex items-center p-8 sm:p-12">
            <form className="w-full space-y-7" onSubmit={onSubmit}>
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5bd62]/35 bg-[#e5bd62]/10 text-[#e5bd62]">
                  <KeyRound className="h-4 w-4" />
                </div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-[#e5bd62] uppercase">Acesso local</p>
                <h2 className="font-[Space_Grotesk] text-3xl font-semibold">Entrar para testar</h2>
                <p className="text-sm leading-6 text-[#f5f0e7]/60">Informe as credenciais de verificação recebidas.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="demo-username" className="font-mono text-[10px] tracking-[0.14em] text-[#f5f0e7]/60 uppercase">Usuário</Label>
                  <Input id="demo-username" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" className="h-12 rounded-none border-[#f5f0e7]/20 bg-black/30 text-[#f5f0e7]" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-password" className="font-mono text-[10px] tracking-[0.14em] text-[#f5f0e7]/60 uppercase">Senha</Label>
                  <Input id="demo-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" className="h-12 rounded-none border-[#f5f0e7]/20 bg-black/30 text-[#f5f0e7]" required />
                </div>
              </div>

              {(formError || login.isError) && <p role="alert" className="border-l-2 border-red-400 pl-3 text-sm text-red-200">{formError || "Não foi possível iniciar a sessão."}</p>}

              <Button type="submit" disabled={login.isPending} className="h-12 w-full rounded-none bg-[#e5bd62] font-semibold text-[#16120a] hover:bg-[#f0d28c]">
                {login.isPending ? "Iniciando sessão..." : "Acessar ambiente"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
