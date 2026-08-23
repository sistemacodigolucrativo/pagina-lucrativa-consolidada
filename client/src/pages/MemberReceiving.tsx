import DashboardLayout from "@/components/DashboardLayout";
import GettingStartedReturnButton from "@/components/GettingStartedReturnButton";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { trpc } from "@/lib/trpc";
import { normalizeEmail, validateEmail } from "@shared/contactValidation";
import { normalizePixKey, normalizePixKeyByType, validatePixKeyByType } from "@shared/structuredValidation";
import { CheckCircle2, CreditCard, Landmark, ShieldCheck, WalletCards, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type Method = "pix" | "bank_transfer" | "other";
type BankType = "checking" | "savings" | null;
const inputClass = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30";
const helpClass = "mt-1 text-xs leading-5 text-zinc-500";
const errorClass = "mt-1 block text-xs text-red-300";
const empty = { holderName: "", method: "pix" as Method, receivingKey: "", instructions: "", paypalEmail: "", paypalEnabled: false, pagseguroEmail: "", pagseguroEnabled: false, bank1Name: "", bank1Agency: "", bank1Account: "", bank1Type: null as BankType, bank1Holder: "", bank2Name: "", bank2Agency: "", bank2Account: "", bank2Type: null as BankType, bank2Holder: "", bank3Name: "", bank3Agency: "", bank3Account: "", bank3Type: null as BankType, bank3Holder: "", bank4Name: "", bank4Agency: "", bank4Account: "", bank4Type: null as BankType, bank4Holder: "", pixType: "", pixKey: "" };

type ReceivingForm = typeof empty;
type ReceivingErrorKey = keyof ReceivingForm | "bank1";
type ReceivingErrors = Partial<Record<ReceivingErrorKey, string>>;
const bankAccountNumbers = [1, 2, 3, 4] as const;
type BankAccountNumber = typeof bankAccountNumbers[number];
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
  const [errors, setErrors] = useState<ReceivingErrors>({});
  const [visibleBankAccounts, setVisibleBankAccounts] = useState<BankAccountNumber>(1);
  const [responsibleUseOpen, setResponsibleUseOpen] = useState(false);
  const [responsibleUseAcknowledged, setResponsibleUseAcknowledged] = useState(false);
  const isTypedPixKeyInvalid = Boolean(form.pixKey && (!form.pixType || !validatePixKeyByType(form.pixKey, form.pixType)));

  useEffect(() => {
    if (!preference.data) return;
    const data = preference.data;
    setForm({
      holderName: data.holderName ?? "",
      method: data.method,
      receivingKey: data.method === "pix" ? normalizePixKey(data.receivingKey) : data.receivingKey ?? "",
      instructions: data.instructions ?? "",
      paypalEmail: data.paypalEmail ?? "",
      paypalEnabled: Boolean(data.paypalEnabled),
      pagseguroEmail: data.pagseguroEmail ?? "",
      pagseguroEnabled: Boolean(data.pagseguroEnabled),
      bank1Name: data.bank1Name ?? "",
      bank1Agency: data.bank1Agency ?? "",
      bank1Account: data.bank1Account ?? "",
      bank1Type: data.bank1Type,
      bank1Holder: data.bank1Holder ?? "",
      bank2Name: data.bank2Name ?? "",
      bank2Agency: data.bank2Agency ?? "",
      bank2Account: data.bank2Account ?? "",
      bank2Type: data.bank2Type,
      bank2Holder: data.bank2Holder ?? "",
      bank3Name: data.bank3Name ?? "",
      bank3Agency: data.bank3Agency ?? "",
      bank3Account: data.bank3Account ?? "",
      bank3Type: data.bank3Type,
      bank3Holder: data.bank3Holder ?? "",
      bank4Name: data.bank4Name ?? "",
      bank4Agency: data.bank4Agency ?? "",
      bank4Account: data.bank4Account ?? "",
      bank4Type: data.bank4Type,
      bank4Holder: data.bank4Holder ?? "",
      pixType: data.pixType ?? "",
      pixKey: data.pixKey ?? "",
    });
    setVisibleBankAccounts(1);
  }, [preference.data]);

  useEffect(() => {
    if (!preference.isFetched || responsibleUseAcknowledged || preference.data?.responsibleUseModalSeenAt) return;
    setResponsibleUseOpen(true);
  }, [preference.data?.responsibleUseModalSeenAt, preference.isFetched, responsibleUseAcknowledged]);

  const save = trpc.member.updateReceiving.useMutation({
    onSuccess: async () => {
      await utils.member.receiving.invalidate();
      toast.success("Dados de recebimento atualizados.");
    },
    onError: error => {
      console.error("Falha ao salvar preferências de recebimento", { message: error.message, data: error.data });
      const issues = (() => {
        try {
          const parsed = JSON.parse(error.message) as Array<{ message?: string }>;
          return Array.isArray(parsed) ? parsed.map(issue => issue.message).filter(Boolean) : [];
        } catch {
          return [];
        }
      })();
      toast.error(issues[0] || error.message || "Não foi possível salvar os dados de recebimento.");
    },
  });

  const markResponsibleUseSeen = trpc.member.markReceivingResponsibleUseSeen.useMutation({
    onSuccess: async () => {
      await utils.member.receiving.invalidate();
    },
    onError: error => {
      console.error("Falha ao registrar visualização do aviso de uso responsável", { message: error.message, data: error.data });
      toast.error("Não foi possível registrar a leitura do aviso. Ele pode aparecer novamente no próximo acesso.");
    },
  });

  const setField = <K extends keyof ReceivingForm>(key: K, value: ReceivingForm[K]) => {
    setErrors(current => ({ ...current, [key]: undefined }));
    setForm(current => ({ ...current, [key]: value }));
  };

  function closeResponsibleUseModal() {
    setResponsibleUseOpen(false);
    setResponsibleUseAcknowledged(true);
    if (!preference.data?.responsibleUseModalSeenAt && !markResponsibleUseSeen.isPending) {
      markResponsibleUseSeen.mutate();
    }
  }

  function addBankAccount() {
    setVisibleBankAccounts(current => Math.min(current + 1, 4) as BankAccountNumber);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedKey = form.method === "pix" ? normalizePixKeyByType(form.pixKey, form.pixType) : form.receivingKey.trim();
    const nextErrors: ReceivingErrors = {};
    if (!form.holderName.trim()) nextErrors.holderName = "Este campo é obrigatório.";
    if (form.paypalEmail && !validateEmail(form.paypalEmail)) {
      nextErrors.paypalEmail = "Informe um e-mail PayPal válido.";
    }
    if (form.pagseguroEmail && !validateEmail(form.pagseguroEmail)) {
      nextErrors.pagseguroEmail = "Informe um e-mail PagSeguro válido.";
    }
    if (form.method === "pix" && (!form.pixKey || !form.pixType || !validatePixKeyByType(form.pixKey, form.pixType))) {
      setPixKeyTouched(true);
      if (!form.pixType) nextErrors.pixType = "Este campo é obrigatório.";
      nextErrors.pixKey = "Informe a chave no formato correspondente ao tipo selecionado.";
    }
    if (form.method === "bank_transfer") {
      const missingBankFields: ReceivingErrorKey[] = [];
      if (!form.bank1Name.trim()) missingBankFields.push("bank1Name");
      if (!form.bank1Agency.trim()) missingBankFields.push("bank1Agency");
      if (!form.bank1Account.trim()) missingBankFields.push("bank1Account");
      if (!form.bank1Type) missingBankFields.push("bank1Type");
      if (!form.bank1Holder.trim()) missingBankFields.push("bank1Holder");
      for (const key of missingBankFields) nextErrors[key] = "Este campo é obrigatório.";
      if (missingBankFields.length) nextErrors.bank1 = "Preencha os campos obrigatórios da conta bancária.";
    }
    if (form.method === "other" && !form.receivingKey.trim() && !(form.paypalEnabled && validateEmail(form.paypalEmail)) && !(form.pagseguroEnabled && validateEmail(form.pagseguroEmail))) {
      setReceivingKeyTouched(true);
      nextErrors.receivingKey = "Informe uma identificação de recebimento ou habilite PayPal/PagSeguro com e-mail válido.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Corrija os campos indicados antes de salvar.");
      return;
    }
    setErrors({});
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
      bank3Name: form.bank3Name.trim() || null,
      bank3Agency: form.bank3Agency.trim() || null,
      bank3Account: form.bank3Account.trim() || null,
      bank3Type: form.bank3Type,
      bank3Holder: form.bank3Holder.trim() || null,
      bank4Name: form.bank4Name.trim() || null,
      bank4Agency: form.bank4Agency.trim() || null,
      bank4Account: form.bank4Account.trim() || null,
      bank4Type: form.bank4Type,
      bank4Holder: form.bank4Holder.trim() || null,
      pixType: form.pixType.trim() || null,
      pixKey: form.pixKey.trim() ? normalizePixKeyByType(form.pixKey, form.pixType) : null,
    });
  }

  return <DashboardLayout menuItems={memberDashboardMenuItems} title="Preferências de recebimento"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
    {responsibleUseOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="responsible-use-title">
      <section className="w-full max-w-lg rounded-2xl border border-emerald-300/20 bg-zinc-950 p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-white"><ShieldCheck className="size-5 text-emerald-300" /><h2 id="responsible-use-title" className="font-medium">Uso responsável</h2></div>
          <button type="button" onClick={closeResponsibleUseModal} aria-label="Fechar aviso de uso responsável" className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-6">
          <p className="text-zinc-300">Esses dados pertencem ao titular do Escritório Virtual.</p>
          <p className="text-zinc-300">Cada membro configura somente os próprios dados.</p>
          <p className="text-zinc-400">O sistema mantém as referências para acompanhamento.</p>
          <p className="text-zinc-400">A confirmação do recebimento ocorre entre o afiliado e o comprador.</p>
        </div>
        <button type="button" onClick={closeResponsibleUseModal} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] sm:w-auto">Entendi</button>
      </section>
    </div> : null}
    <header className="space-y-2"><span className="text-xs uppercase tracking-[.16em] text-emerald-300">Minha operação</span><h1 className="text-3xl font-semibold text-white">Preferências de recebimento</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Concentre aqui os meios e dados utilizados para receber valores. Esta tela registra preferências, não movimenta dinheiro, não processa pagamentos e não solicita senha, cartão ou token bancário.</p></header>
    <aside className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm leading-6 text-emerald-50"><strong>Separação de dados:</strong> nome, e-mail e senha ficam em <strong>Meus dados</strong>. PayPal, PagSeguro, contas bancárias e PIX pertencem a esta área.</aside>
    <form onSubmit={submit} className="space-y-6">
      <section className="order-1 min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-white"><Landmark className="size-5 text-emerald-300" /><h2 className="font-medium">Organizar preferência</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-200">Titular *<input value={form.holderName} onChange={event => setField("holderName", event.target.value)} maxLength={180} aria-invalid={Boolean(errors.holderName) || undefined} className={inputClass} placeholder="Nome do titular" />{errors.holderName ? <small className={errorClass} role="alert">{errors.holderName}</small> : null}</label>
          <label className="block text-sm text-zinc-200">Forma preferida *<select value={form.method} onChange={event => { const next = event.target.value as Method; setField("method", next); setField("receivingKey", next === "pix" ? "" : form.receivingKey); setReceivingKeyTouched(false); }} className={inputClass}><option value="pix">PIX</option><option value="bank_transfer">Transferência bancária</option><option value="other">Outra forma combinada</option></select></label>
        </div>
        {form.method !== "pix" ? <label className="block text-sm text-zinc-200">Chave ou identificação de recebimento {form.method === "other" ? "*" : <span className="text-zinc-500">(opcional)</span>}<input value={form.receivingKey} onChange={event => setField("receivingKey", event.target.value)} onBlur={() => setReceivingKeyTouched(true)} maxLength={255} aria-invalid={Boolean(errors.receivingKey) || receivingKeyTouched && !form.receivingKey.trim() || undefined} className={inputClass} placeholder="Identificador combinado" />{errors.receivingKey ? <small className={errorClass} role="alert">{errors.receivingKey}</small> : receivingKeyTouched && !form.receivingKey.trim() && form.method === "other" ? <small className={errorClass} role="alert">Informe uma identificação de recebimento.</small> : null}</label> : null}
      </section>
      {form.method === "pix" ? <section className="order-2 min-w-0 space-y-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-white"><WalletCards className="size-5 text-emerald-300" /><h2 className="font-medium">Tipo de chave PIX</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-200">Tipo da chave PIX *<select value={form.pixType || ""} onChange={event => { const next = event.target.value; setField("pixType", next); setField("pixKey", normalizePixKeyByType(form.pixKey, next)); setPixKeyTouched(false); }} aria-invalid={Boolean(errors.pixType) || undefined} className={inputClass}><option value="">Selecione o tipo</option>{!pixTypeOptions.some(option => option.value === form.pixType) && form.pixType ? <option value={form.pixType}>Valor salvo: {form.pixType}</option> : null}{pixTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><span className={helpClass}>Este é o PIX exibido na tela de pagamento do comprador.</span>{errors.pixType ? <small className={errorClass} role="alert">{errors.pixType}</small> : null}</label>
          <label className="block text-sm text-zinc-200">Chave PIX *<input value={form.pixKey} onChange={event => { setField("pixKey", normalizePixKeyByType(event.target.value, form.pixType)); setPixKeyTouched(true); }} onBlur={() => setPixKeyTouched(true)} inputMode={form.pixType === "e-mail" ? "email" : form.pixType === "cpf" || form.pixType === "cnpj" || form.pixType === "celular" ? "numeric" : "text"} maxLength={form.pixType === "celular" ? 16 : form.pixType === "cpf" ? 14 : form.pixType === "cnpj" ? 18 : 320} aria-invalid={Boolean(errors.pixKey) || pixKeyTouched && isTypedPixKeyInvalid || undefined} className={inputClass} placeholder={form.pixType === "celular" ? "(99) 9 9999-9999" : form.pixType === "cpf" ? "111.111.111-11" : form.pixType === "cnpj" ? "11.111.111/1111-11" : form.pixType === "e-mail" ? "voce@dominio.com" : "Sua chave PIX"} />{errors.pixKey ? <small className={errorClass} role="alert">{errors.pixKey}</small> : pixKeyTouched && isTypedPixKeyInvalid ? <small className={errorClass} role="alert">Informe a chave no formato correspondente ao tipo selecionado.</small> : null}</label>
        </div>
      </section> : null}
      <section className="space-y-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-white"><Landmark className="size-5 text-emerald-300" /><h2 className="font-medium">Dados bancários</h2></div>
        <p className={helpClass}>Cadastre ou atualize até quatro contas bancárias usadas para recebimento.</p>
        <div className="grid min-w-0 gap-6 lg:grid-cols-2">{bankAccountNumbers.slice(0, visibleBankAccounts).map(accountNumber => { const prefix = `bank${accountNumber}` as const; const values = { name: form[`${prefix}Name`], agency: form[`${prefix}Agency`], account: form[`${prefix}Account`], type: form[`${prefix}Type`], holder: form[`${prefix}Holder`] }; const requiredMark = form.method === "bank_transfer" && accountNumber === 1 ? " *" : ""; return <section key={accountNumber} className="min-w-0 space-y-4 rounded-xl border border-white/10 bg-black/25 p-4"><h3 className="font-medium text-white">Conta bancária {accountNumber}{accountNumber === 1 && form.method === "bank_transfer" ? " — Obrigatória" : ""}</h3>{accountNumber === 1 && errors.bank1 ? <small className={errorClass} role="alert">{errors.bank1}</small> : null}<label className="block text-sm text-zinc-200">Nome do banco{requiredMark}<input value={values.name} onChange={event => setField(`${prefix}Name`, event.target.value)} aria-invalid={Boolean(errors[`${prefix}Name`]) || undefined} className={inputClass} />{errors[`${prefix}Name`] ? <small className={errorClass} role="alert">{errors[`${prefix}Name`]}</small> : null}</label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm text-zinc-200">Agência{requiredMark}<input value={values.agency} onChange={event => setField(`${prefix}Agency`, event.target.value)} aria-invalid={Boolean(errors[`${prefix}Agency`]) || undefined} className={inputClass} />{errors[`${prefix}Agency`] ? <small className={errorClass} role="alert">{errors[`${prefix}Agency`]}</small> : null}</label><label className="block text-sm text-zinc-200">Conta{requiredMark}<input value={values.account} onChange={event => setField(`${prefix}Account`, event.target.value)} aria-invalid={Boolean(errors[`${prefix}Account`]) || undefined} className={inputClass} />{errors[`${prefix}Account`] ? <small className={errorClass} role="alert">{errors[`${prefix}Account`]}</small> : null}</label></div><fieldset><legend className="text-sm text-zinc-200">Tipo de conta{requiredMark}</legend><div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-300"><label className="flex items-center gap-2"><input type="radio" name={`${prefix}Type`} checked={values.type === "checking"} onChange={() => setField(`${prefix}Type`, "checking")} className="accent-emerald-300" />Corrente</label><label className="flex items-center gap-2"><input type="radio" name={`${prefix}Type`} checked={values.type === "savings"} onChange={() => setField(`${prefix}Type`, "savings")} className="accent-emerald-300" />Poupança</label></div>{errors[`${prefix}Type`] ? <small className={errorClass} role="alert">{errors[`${prefix}Type`]}</small> : null}</fieldset><label className="block text-sm text-zinc-200">Titular{requiredMark}<input value={values.holder} onChange={event => setField(`${prefix}Holder`, event.target.value)} aria-invalid={Boolean(errors[`${prefix}Holder`]) || undefined} className={inputClass} />{errors[`${prefix}Holder`] ? <small className={errorClass} role="alert">{errors[`${prefix}Holder`]}</small> : null}</label></section>; })}</div>
        {visibleBankAccounts < 4 ? <button type="button" onClick={addBankAccount} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-emerald-300/40 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/10 sm:w-auto">Adicionar conta bancária</button> : null}
      </section>
      <section className="grid min-w-0 gap-6 lg:grid-cols-2"><article className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><WalletCards className="size-5 text-emerald-300" /><h2 className="font-medium">Email PayPal</h2></div><p className={helpClass}>Opcional. Se habilitado ou preenchido, precisa conter um e-mail válido.</p><label className="block text-sm text-zinc-200">E-mail PayPal <span className="text-zinc-500">(opcional)</span><input type="email" maxLength={320} value={form.paypalEmail} onChange={event => setField("paypalEmail", normalizeEmail(event.target.value))} aria-invalid={Boolean(errors.paypalEmail) || undefined} className={inputClass} placeholder="paypal@dominio.com" />{errors.paypalEmail ? <small className={errorClass} role="alert">{errors.paypalEmail}</small> : null}</label><label className="flex items-start gap-3 text-sm leading-6 text-zinc-300"><input type="checkbox" checked={form.paypalEnabled} onChange={event => setField("paypalEnabled", event.target.checked)} className="mt-1 size-4 accent-emerald-300" />Habilitar PayPal na configuração da página de pedido</label></article><article className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><CreditCard className="size-5 text-emerald-300" /><h2 className="font-medium">Email PagSeguro</h2></div><p className={helpClass}>Opcional. Se habilitado ou preenchido, precisa conter um e-mail válido.</p><label className="block text-sm text-zinc-200">Novo e-mail PagSeguro <span className="text-zinc-500">(opcional)</span><input type="email" maxLength={320} value={form.pagseguroEmail} onChange={event => setField("pagseguroEmail", normalizeEmail(event.target.value))} aria-invalid={Boolean(errors.pagseguroEmail) || undefined} className={inputClass} placeholder="pagseguro@dominio.com" />{errors.pagseguroEmail ? <small className={errorClass} role="alert">{errors.pagseguroEmail}</small> : null}</label><label className="flex items-start gap-3 text-sm leading-6 text-zinc-300"><input type="checkbox" checked={form.pagseguroEnabled} onChange={event => setField("pagseguroEnabled", event.target.checked)} className="mt-1 size-4 accent-emerald-300" />Habilitar PagSeguro na configuração da página de pedido</label></article></section>
      <button disabled={save.isPending || preference.isLoading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"><CheckCircle2 className="size-4" />{save.isPending ? "Salvando..." : "Salvar preferências"}</button>{save.isSuccess ? <p className="text-sm text-emerald-300">Dados de recebimento atualizados.</p> : null}
    </form>
  </main><GettingStartedReturnButton /></DashboardLayout>;
}
