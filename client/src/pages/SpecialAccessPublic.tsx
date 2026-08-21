import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRoute } from "wouter";
import { toast } from "sonner";

export default function SpecialAccessPublic() {
  const [, params] = useRoute("/senha-especial/:code");
  const code = params?.code ?? "";
  const page = trpc.public.specialAccess.useQuery({ code }, { enabled: Boolean(code) });
  const [password, setPassword] = useState("");
  const unlock = trpc.public.unlockSpecialAccess.useMutation({ onSuccess: data => { sessionStorage.setItem(`pl-application-access-${code}`, password); window.location.assign(withAppBase(data.destinationUrl)); }, onError: error => toast.error(error.message) });
  const submit = (event: FormEvent) => { event.preventDefault(); if (!password) return toast.error("Informe a senha de acesso."); unlock.mutate({ code, password }); };
  if (page.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] p-6 text-zinc-300"><Loader2 className="size-7 animate-spin text-emerald-300" /></main>;
  if (!page.data) return <main className="grid min-h-screen place-items-center bg-[#050505] p-6"><section className="max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-7 text-center"><ShieldCheck className="mx-auto size-7 text-emerald-300" /><h1 className="mt-4 text-xl font-semibold text-white">Acesso indisponível</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Este link não está publicado, foi pausado ou não existe mais.</p></section></main>;
  return <main className="grid min-h-screen place-items-center bg-[#050505] p-5"><section className="w-full max-w-xl rounded-3xl border border-emerald-300/20 bg-zinc-950 p-6 shadow-2xl sm:p-9"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Acesso reservado</span><h1 className="mt-3 text-3xl font-semibold text-white">{page.data.title}</h1><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{page.data.message}</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm text-zinc-200">Senha de acesso<input autoFocus type="password" autoComplete="current-password" maxLength={128} value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-3 text-white outline-none ring-emerald-300/50 focus:ring-2" /></label><button disabled={unlock.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"><KeyRound className="size-4" />{unlock.isPending ? "Verificando..." : page.data.buttonLabel}</button></form></section></main>;
}
