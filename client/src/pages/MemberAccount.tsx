import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { normalizeEmail, validateEmail } from "@shared/contactValidation";
import { BadgeCheck, ClipboardList, LockKeyhole, Save, Settings } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: ClipboardList, label: "Meus dados", path: "/membros/meus-dados", group: "Escritório" },
  { icon: Settings, label: "Editar perfil", path: "/membros/configuracoes", group: "Escritório" },
];

const field = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white";

export default function MemberAccount() {
  const utils = trpc.useUtils();
  const account = trpc.member.account.useQuery();
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (account.data) setForm({ name: account.data.name ?? "", email: account.data.email ?? "" });
  }, [account.data]);

  const saveAccount = trpc.member.updateAccount.useMutation({
    onSuccess: async () => {
      await utils.member.account.invalidate();
      toast.success("Dados cadastrais atualizados.");
    },
    onError: error => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const email = normalizeEmail(form.email);
    if (!validateEmail(email)) {
      toast.error("Informe um e-mail válido, sem espaços e com domínio.");
      return;
    }
    saveAccount.mutate({ name: form.name.trim(), email });
  };

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-4xl space-y-6 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Conta e privacidade</span><h1 className="text-3xl font-semibold text-white">Meus dados</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Atualize os dados privados utilizados para identificação e contato na sua conta. Eles não são exibidos automaticamente na sua página personalizada.</p></header>
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><ClipboardList size={18} className="text-amber-300" /><h2 className="font-medium">Dados cadastrais</h2></div>
      <label className="block text-sm text-zinc-200">Nome de identificação<input required minLength={2} maxLength={180} autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className={field} placeholder="Seu nome" /></label>
      <label className="block text-sm text-zinc-200">E-mail de contato<input required type="email" autoComplete="email" maxLength={320} value={form.email} onChange={event => setForm({ ...form, email: normalizeEmail(event.target.value) })} className={field} placeholder="voce@dominio.com" /></label>
      <button disabled={saveAccount.isPending || account.isLoading} className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"><Save size={16} />{saveAccount.isPending ? "Salvando..." : "Salvar meus dados"}</button>
    </form>
    <section className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><BadgeCheck size={18} className="text-amber-300" /><h2 className="font-medium">Dados públicos</h2></div><p className="mt-3 text-sm leading-6 text-zinc-400">Identificador, apresentação, WhatsApp público e site pertencem a <strong className="text-zinc-200">Editar perfil</strong>.</p></article><article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><LockKeyhole size={18} className="text-amber-300" /><h2 className="font-medium">Dados de recebimento</h2></div><p className="mt-3 text-sm leading-6 text-zinc-400">Chave PIX e instruções de recebimento permanecem isoladas em <strong className="text-zinc-200">Dados de recebimento</strong>.</p></article></section>
  </main></DashboardLayout>;
}
