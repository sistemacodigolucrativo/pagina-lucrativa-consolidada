import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { normalizeEmail, validateEmail } from "@shared/contactValidation";
import { ClipboardList, KeyRound, LockKeyhole, Mail, Save, Settings } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: ClipboardList, label: "Meus dados", path: "/membros/meus-dados", group: "Escritório" },
  { icon: Settings, label: "Editar perfil", path: "/membros/configuracoes", group: "Escritório" },
];
const inputClass = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30";

type AccountForm = { name: string; email: string; newPassword: string; confirmPassword: string };
type SecurityForm = { securityQuestion: string; securityAnswer: string; confirmSecurityAnswer: string };

export default function MemberAccount() {
  const utils = trpc.useUtils();
  const account = trpc.member.account.useQuery();
  const [form, setForm] = useState<AccountForm>({ name: "", email: "", newPassword: "", confirmPassword: "" });
  const [securityForm, setSecurityForm] = useState<SecurityForm>({ securityQuestion: "", securityAnswer: "", confirmSecurityAnswer: "" });

  useEffect(() => {
    const data = account.data;
    if (!data) return;
    setForm(current => ({ ...current, name: data.name ?? "", email: data.email ?? "" }));
    setSecurityForm(current => ({ ...current, securityQuestion: data.securityQuestion ?? "" }));
  }, [account.data]);

  const save = trpc.member.updateAccount.useMutation({
    onSuccess: async () => {
      await utils.member.account.invalidate();
      setForm(current => ({ ...current, newPassword: "", confirmPassword: "" }));
      toast.success("Dados cadastrais atualizados.");
    },
    onError: error => toast.error(error.message),
  });
  const saveSecurityRecovery = trpc.member.updateSecurityRecovery.useMutation({
    onSuccess: async () => {
      await utils.member.account.invalidate();
      setSecurityForm(current => ({ ...current, securityAnswer: "", confirmSecurityAnswer: "" }));
      toast.success("Pergunta secreta atualizada.");
    },
    onError: error => toast.error(error.message),
  });

  function setField<K extends keyof AccountForm>(key: K, value: AccountForm[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function setSecurityField<K extends keyof SecurityForm>(key: K, value: SecurityForm[K]) {
    setSecurityForm(current => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateEmail(form.email)) {
      toast.error("Informe um e-mail de contato válido.");
      return;
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    save.mutate({ name: form.name.trim(), email: normalizeEmail(form.email), newPassword: form.newPassword || null, confirmPassword: form.confirmPassword || null });
  }

  function submitSecurityRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (securityForm.securityAnswer.trim() !== securityForm.confirmSecurityAnswer.trim()) {
      toast.error("As respostas secretas não conferem.");
      return;
    }
    saveSecurityRecovery.mutate({
      securityQuestion: securityForm.securityQuestion.trim(),
      securityAnswer: securityForm.securityAnswer.trim(),
    });
  }

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-5xl space-y-7 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[.16em] text-emerald-300">Conta e privacidade</span><h1 className="text-3xl font-semibold text-white">Meus dados</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Mantenha atualizados somente os dados cadastrais e pessoais da sua conta. Informações públicas ficam em Editar perfil.</p></header>
    <aside className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm leading-6 text-emerald-50"><strong>Organização dos dados:</strong> nome, e-mail e senha ficam aqui. PayPal, PagSeguro, contas bancárias e PIX foram concentrados em <a href={withAppBase("/membros/recebimentos")} className="font-semibold underline decoration-emerald-300/60 underline-offset-4">Dados de recebimento</a>.</aside>
    <form onSubmit={submit} className="space-y-6">
      <section className="grid min-w-0 gap-6 lg:grid-cols-2"><article className="order-1 min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><ClipboardList className="size-5 text-emerald-300" /><h2 className="font-medium">Dados cadastrais</h2></div><label className="block text-sm text-zinc-200">Novo nome<input required minLength={2} maxLength={180} autoComplete="name" value={form.name} onChange={event => setField("name", event.target.value)} className={inputClass} placeholder="Seu nome de identificação" /></label><label className="block text-sm text-zinc-200">Novo e-mail<input required type="email" maxLength={320} autoComplete="email" value={form.email} onChange={event => setField("email", normalizeEmail(event.target.value))} className={inputClass} placeholder="voce@dominio.com" /></label></article><article className="order-2 min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><LockKeyhole className="size-5 text-emerald-300" /><h2 className="font-medium">Separação de dados</h2></div><p className="text-sm leading-6 text-zinc-300">Dados públicos como identificador, descrição, foto, redes sociais e endereço ficam em <strong className="text-white">Editar perfil</strong>.</p><p className="text-sm leading-6 text-zinc-400">Meios e informações de recebimento ficam em <strong className="text-white">Dados de recebimento</strong>, onde são carregados e salvos pelo contrato próprio dessa área.</p><a href={withAppBase("/membros/recebimentos")} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-emerald-300/40 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/10 sm:w-auto">Abrir Dados de recebimento</a></article></section>
      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)]"><article className="order-1 min-w-0 space-y-4 rounded-2xl border border-emerald-300/25 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><KeyRound className="size-5 text-emerald-300" /><h2 className="font-medium">Alterar senha</h2></div><p className="text-xs leading-5 text-zinc-500">Use pelo menos 6 caracteres. A senha nunca é exibida depois de salva.</p><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-zinc-200">Nova senha<input type="password" minLength={6} maxLength={128} autoComplete="new-password" value={form.newPassword} onChange={event => setField("newPassword", event.target.value)} className={inputClass} /></label><label className="block text-sm text-zinc-200">Confirmar nova senha<input type="password" minLength={6} maxLength={128} autoComplete="new-password" value={form.confirmPassword} onChange={event => setField("confirmPassword", event.target.value)} className={inputClass} /></label></div></article><article className="order-2 min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><Mail className="size-5 text-emerald-300" /><h2 className="font-medium">Privacidade da conta</h2></div><p className="text-sm leading-6 text-zinc-300">Esses dados cadastrais são privados e ficam separados do seu perfil público.</p><p className="text-sm leading-6 text-zinc-400">Para alterar a foto, descrição, links ou endereço público, use Editar perfil.</p></article></section>
      <button disabled={save.isPending || account.isLoading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"><Save className="size-4" />{save.isPending ? "Salvando..." : "Salvar dados cadastrais"}</button>{save.isSuccess ? <p className="text-sm text-emerald-300">Dados cadastrais atualizados.</p> : null}
    </form>
    <form onSubmit={submitSecurityRecovery} className="space-y-5 rounded-2xl border border-emerald-300/25 bg-zinc-950/60 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-white"><LockKeyhole className="size-5 text-emerald-300" /><h2 className="font-medium">Recuperação de acesso</h2></div>
      <p className="text-sm leading-6 text-zinc-300">Cadastre uma pergunta e uma resposta secreta para recuperar sua senha pelo botão “Recuperar acesso” na tela de login.</p>
      {account.data?.securityRecoveryConfigured ? <p className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-50">Recuperação configurada. Para trocar a resposta, informe uma nova resposta secreta abaixo.</p> : null}
      <label className="block text-sm text-zinc-200">Pergunta secreta<input required minLength={6} maxLength={240} value={securityForm.securityQuestion} onChange={event => setSecurityField("securityQuestion", event.target.value)} className={inputClass} placeholder="Ex.: Qual foi o nome do meu primeiro projeto?" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-zinc-200">Resposta secreta<input required minLength={3} maxLength={180} type="password" autoComplete="new-password" value={securityForm.securityAnswer} onChange={event => setSecurityField("securityAnswer", event.target.value)} className={inputClass} placeholder="Digite uma resposta segura" /></label>
        <label className="block text-sm text-zinc-200">Confirmar resposta<input required minLength={3} maxLength={180} type="password" autoComplete="new-password" value={securityForm.confirmSecurityAnswer} onChange={event => setSecurityField("confirmSecurityAnswer", event.target.value)} className={inputClass} placeholder="Repita a resposta" /></label>
      </div>
      <p className="text-xs leading-5 text-zinc-500">A resposta não será exibida depois de salva. Ela é armazenada apenas em formato protegido.</p>
      <button disabled={saveSecurityRecovery.isPending || account.isLoading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"><Save className="size-4" />{saveSecurityRecovery.isPending ? "Salvando..." : "Salvar recuperação de acesso"}</button>
    </form>
  </main></DashboardLayout>;
}
