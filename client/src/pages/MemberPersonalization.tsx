import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Copy, ExternalLink, KeyRound, Link2, Save, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: Link2, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: KeyRound, label: "Mensagem senha especial", path: "/membros/mensagem-especial", group: "Personalização" },
  { icon: ShieldCheck, label: "Meus dados", path: "/membros/meus-dados", group: "Personalização" },
];
const field = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none ring-emerald-300/50 focus:ring-2";

export default function MemberPersonalization() {
  const utils = trpc.useUtils();
  const specialAccess = trpc.member.specialAccess.useQuery();
  const [form, setForm] = useState({ title: "", message: "", buttonLabel: "", destinationUrl: "", password: "", status: "draft" as "draft" | "published" | "paused" });

  useEffect(() => {
    if (!specialAccess.data) return;
    setForm({ title: specialAccess.data.title, message: specialAccess.data.message, buttonLabel: specialAccess.data.buttonLabel, destinationUrl: specialAccess.data.destinationUrl, password: "", status: specialAccess.data.status });
  }, [specialAccess.data]);

  const publicLink = useMemo(() => specialAccess.data && typeof window !== "undefined" ? `${window.location.origin}/senha-especial/${specialAccess.data.publicCode}` : "", [specialAccess.data]);
  const save = trpc.member.updateSpecialAccess.useMutation({
    onSuccess: async () => { setForm(current => ({ ...current, password: "" })); await utils.member.specialAccess.invalidate(); toast.success("Mensagem especial atualizada."); },
    onError: error => toast.error(error.message),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (form.status === "published" && !specialAccess.data?.hasPassword && !form.password) return toast.error("Defina uma senha antes de publicar.");
    save.mutate({ ...form, password: form.password || undefined });
  };
  const copyLink = async () => {
    if (!publicLink) return;
    await navigator.clipboard.writeText(publicLink);
    toast.success("Link copiado.");
  };

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Acesso e personalização</span><h1 className="text-3xl font-semibold text-white">Mensagem senha especial</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Crie uma página de acesso privada com mensagem, senha e direcionamento próprios. A senha nunca é exibida depois de salva.</p></header>
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]"><form onSubmit={submit} className="order-1 min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-white"><KeyRound className="size-5 text-emerald-300" /><h2 className="font-medium">Configurar acesso especial</h2></div>
      <label className="block text-sm text-zinc-200">Título<input required maxLength={160} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className={field} placeholder="Acesso especial" /></label>
      <label className="block text-sm text-zinc-200">Mensagem<textarea required minLength={10} maxLength={5000} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className={`${field} min-h-32`} placeholder="Escreva a orientação que o visitante verá antes de informar a senha." /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-zinc-200">Texto do botão<input required maxLength={80} value={form.buttonLabel} onChange={event => setForm({ ...form, buttonLabel: event.target.value })} className={field} /></label><label className="block text-sm text-zinc-200">Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as typeof form.status })} className={field}><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="paused">Pausado</option></select></label></div>
      <label className="block text-sm text-zinc-200">Destino após a senha<input required type="url" maxLength={1024} value={form.destinationUrl} onChange={event => setForm({ ...form, destinationUrl: event.target.value })} className={field} placeholder="https://" /></label>
      <label className="block text-sm text-zinc-200">{specialAccess.data?.hasPassword ? "Nova senha (opcional)" : "Senha de acesso"}<input type="password" minLength={6} maxLength={128} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} className={field} placeholder={specialAccess.data?.hasPassword ? "Deixe em branco para manter a atual" : "Mínimo de 6 caracteres"} /></label>
      <button disabled={save.isPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:opacity-60 sm:w-auto"><Save className="size-4" />{save.isPending ? "Salvando..." : "Salvar configuração"}</button>
    </form><aside className="order-2 min-w-0 space-y-4 rounded-2xl border border-emerald-300/25 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><ShieldCheck className="size-5 text-emerald-300" /><h2 className="font-medium">Publicação e controle</h2></div>
      <p className="text-sm leading-6 text-zinc-300">O link só funciona quando o status está como publicado e uma senha foi definida. A administração pode pausar a página a qualquer momento.</p>
      <div className="rounded-xl border border-white/10 bg-black/25 p-4"><span className="text-xs uppercase tracking-wider text-emerald-200">Link de divulgação</span><p className="mt-2 break-all text-sm text-white">{publicLink || "Carregando..."}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={copyLink} disabled={!publicLink} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white disabled:opacity-60"><Copy className="size-4" />Copiar</button>{specialAccess.data?.status === "published" && <a href={publicLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white"><ExternalLink className="size-4" />Abrir</a>}</div></div>
      <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-zinc-500">Acessos</dt><dd className="mt-1 font-medium text-white">{specialAccess.data?.accessCount ?? 0}</dd></div><div><dt className="text-zinc-500">Senha</dt><dd className="mt-1 font-medium text-white">{specialAccess.data?.hasPassword ? "Configurada" : "Pendente"}</dd></div></dl>{specialAccess.data?.adminNote && <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-50"><strong>Orientação administrativa:</strong><br />{specialAccess.data.adminNote}</div>}</aside></section>
  </main></DashboardLayout>;
}
