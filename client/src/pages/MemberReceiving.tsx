import DashboardLayout from "@/components/DashboardLayout";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { trpc } from "@/lib/trpc";
import { normalizeEmail, validateEmail } from "@shared/contactValidation";
import { normalizePixKey, normalizePixKeyByType, validatePixKey, validatePixKeyByType } from "@shared/structuredValidation";
import { CheckCircle2, CreditCard, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type Method = "pix" | "bank_transfer" | "other";
type BankType = "checking" | "savings" | null;
const inputClass = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30";
const helpClass = "mt-1 text-xs leading-5 text-zinc-500";
const empty = { holderName: "", method: "pix" as Method, receivingKey: "", instructions: "", paypalEmail: "", paypalEnabled: false, pagseguroEmail: "", pagseguroEnabled: false, bank1Name: "", bank1Agency: "", bank1Account: "", bank1Type: null as BankType, bank1Holder: "", bank2Name: "", bank2Agency: "", bank2Account: "", bank2Type: null as BankType, bank2Holder: "", pixType: "", pixKey: "" };

type ReceivingForm = typeof empty;
const pixTypeOptions = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "e-mail", label: "E-mail" },
  { value: "celular", label: "Celular" },
  { value: "chave-aleatoria", label: "Chave aleatória" },
  { value: "outro", label: "Outro" },
] as const;

export default function MemberReceiving() {
  const preference = trpc.member.receiving.useQuery();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<ReceivingForm>(empty);
  const [receivingKeyTouched, setReceivingKeyTouched] = useState(false);
  const [pixKeyTouched, setPixKeyTouched] = useState(false);
  const isPixKeyInvalid = form.method === "pix" && form.receivingKey !== "" && !validatePixKey(form.receivingKey);
  const isTypedPixKeyInvalid = Boolean(form.pixKey && (!form.pixType || !validatePixKeyByType(form.pixKey, form.pixType)));

  useEffect(() => {
    if (!preference.data) return;
    setForm({
      holderName: preference.data.holderName ?? "",
      method: preference.data.method,
      receivingKey: preference.data.method === "pix" ? normalizePixKey(preference.data.receivingKey) : preference.data.receivingKey ?? "",
      instructions: preference.data.instructions ?? "",
      paypalEmail: preference.data.paypalEmail ?? "",
      paypalEnabled: Boolean(preference.data.paypalEnabled),
      pagseguroEmail: preference.data.pagseguroEmail ?? "",
      pagseguroEnabled: Boolean(preference.data.pagseguroEnabled),
      bank1Name: preference.data.bank1Name ?? "",
      bank1Agency: preference.data.bank1Agency ?? "",
      bank1Account: preference.data.bank1Account ?? "",
      bank1Type: preference.data.bank1Type,
      bank1Holder: preference.data.bank1Holder ?? "",
      bank2Name: preference.data.bank2Name ?? "",
      bank2Agency: preference.data.bank2Agency ?? "",
      bank2Account: preference.data.bank2Account ?? "",
      bank2Type: preference.data.bank2Type,
      bank2Holder: preference.data.bank2Holder ?? "",
      pixType: preference.data.pixType ?? "",
      pixKey: preference.data.pixKey ?? "",
    });
  }, [preference.data]);

  const save = trpc.member.updateReceiving.useMutation({
    onSuccess: async () => {
      await utils.member.receiving.invalidate();
      toast.success("Dados de recebimento atualizados.");
    },
    onError: error => toast.error(error.message),
  });

  const setField = <K extends keyof ReceivingForm>(key: K, value: ReceivingForm[K]) => setForm(current => ({ ...current, [key]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedKey = form.method === "pix" ? normalizePixKey(form.receivingKey) : form.receivingKey.trim();
    if (form.method === "pix" && !validatePixKey(normalizedKey)) {
      setReceivingKeyTouched(true);
      toast.error("Informe uma chave PIX válida: CPF, CNPJ, telefone, e-mail ou chave aleatória.");
      return;
    }
    if (form.paypalEmail && !validateEmail(form.paypalEmail)) {
      toast.error("Informe um e-mail PayPal válido.");
      return;
    }
    if (form.pagseguroEmail && !validateEmail(form.pagseguroEmail)) {
      toast.error("Informe um e-mail PagSeguro válido.");
      return;
    }
    if (form.pixKey && (!form.pixType || !validatePixKeyByType(form.pixKey, form.pixType))) {
      setPixKeyTouched(true);
      toast.error("A chave PIX não corresponde ao tipo selecionado.");
      return;
    }
    save.mutate({
      holderName: form.holderName.trim() || null,
      method: form.method,
      receivingKey: normalizedKey || null,
      instructions: form.instructions.trim() || null,
      paypalEmail: form.paypalEmail.trim() ? normalizeEmail(form.paypalEmail) : null,
      paypalEnabled: form.paypalEnabled,
      pagseguroEmail: form.pagseguroEmail.trim() ? normalizeEmail(form.pagseguroEmail) : null,
      pagseguroEnabled: form.pagseguroEnabled,
      bank1Name: form.bank1Name.trim() || null,
      bank1Agency: form.bank1Agency.trim() || null,
      bank1Account: form.bank1Account.trim() || null,
      bank1Type: form.bank1Type,
      bank1Holder: form.bank1Holder.trim() || null,
      bank2Name: form.bank2Name.trim() || null,
      bank2Agency: form.bank2Agency.trim() || null,
      bank2Account: form.bank2Account.trim() || null,
      bank2Type: form.bank2Type,
      bank2Holder: form.bank2Holder.trim() || null,
      pixType: form.pixType.trim() || null,
      pixKey: form.pixKey.trim() ? normalizePixKeyByType(form.pixKey, form.pixType) : null,
    });
  }

  return <DashboardLayout menuItems={memberDashboardMenuItems} title="Preferências de recebimento"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[.16em] text-emerald-300">Minha operação</span><h1 className="text-3xl font-semibold text-white">Preferências de recebimento</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Concentre aqui os meios e dados utilizados para receber valores. Esta tela registra preferências, não movimenta dinheiro, não processa pagamentos e não solicita senha, cartão ou token bancário.</p></header>
    <aside className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm leading-6 text-emerald-50"><strong>Separação de dados:</strong> nome, e-mail e senha ficam em <strong>Meus dados</strong>. PayPal, PagSeguro, contas bancárias e PIX pertencem a esta área.</aside>
    <form onSubmit={submit} className="space-y-6">
      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]"><div className="order-1 min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><Landmark className="size-5 text-emerald-300" /><h2 className="font-medium">Organizar preferência</h2></div><label className="block text-sm text-zinc-200">Titular<input value={form.holderName} onChange={event => setField("holderName", event.target.value)} maxLength={180} className={inputClass} placeholder="Nome do titular" /></label><label className="block text-sm text-zinc-200">Forma preferida<select value={form.method} onChange={event => { const next = event.target.value as Method; setField("method", next); setField("receivingKey", next === "pix" ? normalizePixKey(form.receivingKey) : form.receivingKey); setReceivingKeyTouched(false); }} className={inputClass}><option value="pix">PIX</option><option value="bank_transfer">Transferência bancária</option><option value="other">Outra forma combinada</option></select></label><label className="block text-sm text-zinc-200">{form.method === "pix" ? "Chave PIX" : "Chave ou identificação de recebimento"}<input required={form.method === "pix"} value={form.receivingKey} onChange={event => setField("receivingKey", form.method === "pix" ? normalizePixKey(event.target.value) : event.target.value)} onBlur={() => setReceivingKeyTouched(true)} maxLength={255} aria-invalid={isPixKeyInvalid || undefined} className={inputClass} placeholder={form.method === "pix" ? "CPF, CNPJ, telefone, e-mail ou chave aleatória" : "Identificador combinado"} />{receivingKeyTouched && isPixKeyInvalid ? <small className="mt-1 block text-xs text-red-300" role="alert">Use uma chave PIX válida: CPF, CNPJ, telefone, e-mail ou chave aleatória.</small> : null}</label><label className="block text-sm text-zinc-200">Orientação adicional<textarea value={form.instructions} onChange={event => setField("instructions", event.target.value)} maxLength={2000} className={`${inputClass} min-h-28`} placeholder="Informações que deseja manter para a sua operação." /></label></div><aside className="order-2 min-w-0 space-y-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5"><ShieldCheck className="size-6 text-emerald-300" /><h2 className="font-medium text-white">Uso responsável</h2><p className="text-sm leading-6 text-zinc-300">Esses dados pertencem ao titular do Escritório Virtual. Cada membro configura somente os próprios dados.</p><p className="text-sm leading-6 text-zinc-400">O sistema mantém as preferências para acompanhamento; a confirmação do recebimento ocorre entre o afiliado e o comprador.</p></aside></section>
      <section className="grid min-w-0 gap-6 lg:grid-cols-2"><article className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><WalletCards className="size-5 text-emerald-300" /><h2 className="font-medium">Email PayPal</h2></div><p className={helpClass}>Mantenha a preferência do e-mail usado para receber valores pelo PayPal.</p><label className="block text-sm text-zinc-200">E-mail PayPal<input type="email" maxLength={320} value={form.paypalEmail} onChange={event => setField("paypalEmail", normalizeEmail(event.target.value))} className={inputClass} placeholder="paypal@dominio.com" /></label><label className="flex items-start gap-3 text-sm leading-6 text-zinc-300"><input type="checkbox" checked={form.paypalEnabled} onChange={event => setField("paypalEnabled", event.target.checked)} className="mt-1 size-4 accent-emerald-300" />Habilitar PayPal na configuração da página de pedido</label></article><article className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><CreditCard className="size-5 text-emerald-300" /><h2 className="font-medium">Email PagSeguro</h2></div><p className={helpClass}>Mantenha a preferência do e-mail usado para receber valores pelo PagSeguro.</p><label className="block text-sm text-zinc-200">Novo e-mail PagSeguro<input type="email" maxLength={320} value={form.pagseguroEmail} onChange={event => setField("pagseguroEmail", normalizeEmail(event.target.value))} className={inputClass} placeholder="pagseguro@dominio.com" /></label><label className="flex items-start gap-3 text-sm leading-6 text-zinc-300"><input type="checkbox" checked={form.pagseguroEnabled} onChange={event => setField("pagseguroEnabled", event.target.checked)} className="mt-1 size-4 accent-emerald-300" />Habilitar PagSeguro na configuração da página de pedido</label></article></section>
      <section className="space-y-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><Landmark className="size-5 text-emerald-300" /><h2 className="font-medium">Dados bancários</h2></div><p className={helpClass}>Cadastre ou atualize as duas contas bancárias usadas para recebimento.</p><div className="grid min-w-0 gap-6 lg:grid-cols-2">{([1, 2] as const).map(accountNumber => { const prefix = `bank${accountNumber}` as const; const values = { name: form[`${prefix}Name`], agency: form[`${prefix}Agency`], account: form[`${prefix}Account`], type: form[`${prefix}Type`], holder: form[`${prefix}Holder`] }; return <section key={accountNumber} className="min-w-0 space-y-4 rounded-xl border border-white/10 bg-black/25 p-4"><h3 className="font-medium text-white">Conta bancária {accountNumber}</h3><label className="block text-sm text-zinc-200">Nome do banco<input value={values.name} onChange={event => setField(`${prefix}Name`, event.target.value)} className={inputClass} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm text-zinc-200">Agência<input value={values.agency} onChange={event => setField(`${prefix}Agency`, event.target.value)} className={inputClass} /></label><label className="block text-sm text-zinc-200">Conta<input value={values.account} onChange={event => setField(`${prefix}Account`, event.target.value)} className={inputClass} /></label></div><fieldset><legend className="text-sm text-zinc-200">Tipo de conta</legend><div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-300"><label className="flex items-center gap-2"><input type="radio" name={`${prefix}Type`} checked={values.type === "checking"} onChange={() => setField(`${prefix}Type`, "checking")} className="accent-emerald-300" />Corrente</label><label className="flex items-center gap-2"><input type="radio" name={`${prefix}Type`} checked={values.type === "savings"} onChange={() => setField(`${prefix}Type`, "savings")} className="accent-emerald-300" />Poupança</label></div></fieldset><label className="block text-sm text-zinc-200">Titular<input value={values.holder} onChange={event => setField(`${prefix}Holder`, event.target.value)} className={inputClass} /></label></section>; })}</div></section>
      <section className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><CheckCircle2 className="size-5 text-emerald-300" /><h2 className="font-medium">Dados PIX</h2></div><p className={helpClass}>Informe o tipo e a chave PIX cadastrados para receber valores.</p><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-zinc-200">Tipo da chave PIX<select value={form.pixType || ""} onChange={event => { const next = event.target.value; setField("pixType", next); setField("pixKey", normalizePixKeyByType(form.pixKey, next)); setPixKeyTouched(false); }} className={inputClass}><option value="">Selecione o tipo</option>{!pixTypeOptions.some(option => option.value === form.pixType) && form.pixType ? <option value={form.pixType}>Valor salvo: {form.pixType}</option> : null}{pixTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><span className={helpClass}>Escolha o tipo correspondente à chave cadastrada.</span></label><label className="block text-sm text-zinc-200">Chave PIX<input value={form.pixKey} onChange={event => { setField("pixKey", normalizePixKeyByType(event.target.value, form.pixType)); setPixKeyTouched(true); }} onBlur={() => setPixKeyTouched(true)} inputMode={form.pixType === "e-mail" ? "email" : form.pixType === "cpf" || form.pixType === "cnpj" || form.pixType === "celular" ? "numeric" : "text"} maxLength={form.pixType === "celular" ? 16 : form.pixType === "cpf" ? 14 : form.pixType === "cnpj" ? 18 : 320} aria-invalid={pixKeyTouched && isTypedPixKeyInvalid || undefined} className={inputClass} placeholder={form.pixType === "celular" ? "(99) 9 9999-9999" : form.pixType === "cpf" ? "111.111.111-11" : form.pixType === "cnpj" ? "11.111.111/1111-11" : form.pixType === "e-mail" ? "voce@dominio.com" : "Sua chave PIX"} />{pixKeyTouched && isTypedPixKeyInvalid ? <small className="mt-1 block text-xs text-red-300" role="alert">Informe a chave no formato correspondente ao tipo selecionado.</small> : null}</label></div></section>
      <button disabled={save.isPending || preference.isLoading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"><CheckCircle2 className="size-4" />{save.isPending ? "Salvando..." : "Salvar preferências"}</button>{save.isSuccess ? <p className="text-sm text-emerald-300">Dados de recebimento atualizados.</p> : null}
    </form>
  </main></DashboardLayout>;
}
