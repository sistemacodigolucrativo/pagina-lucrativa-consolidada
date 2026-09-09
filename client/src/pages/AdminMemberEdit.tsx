import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { normalizeEmail, validateEmail } from "@shared/contactValidation";
import { normalizePixKeyByType, validatePixKeyByType } from "@shared/structuredValidation";
import { ArrowLeft, CreditCard, Landmark, Mail, Save, UserRound, WalletCards } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoute } from "wouter";

type Method = "pix" | "bank_transfer" | "other";
type BankType = "checking" | "savings" | null;
type BankNumber = 1 | 2 | 3 | 4;

type MemberDetail = {
  id: number;
  name: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
};

const emptyReceiving = {
  holderName: "",
  method: "pix" as Method,
  receivingKey: "",
  instructions: "",
  paypalEmail: "",
  paypalEnabled: false,
  pagseguroEmail: "",
  pagseguroEnabled: false,
  bank1Name: "",
  bank1Agency: "",
  bank1Account: "",
  bank1Type: null as BankType,
  bank1Holder: "",
  bank2Name: "",
  bank2Agency: "",
  bank2Account: "",
  bank2Type: null as BankType,
  bank2Holder: "",
  bank3Name: "",
  bank3Agency: "",
  bank3Account: "",
  bank3Type: null as BankType,
  bank3Holder: "",
  bank4Name: "",
  bank4Agency: "",
  bank4Account: "",
  bank4Type: null as BankType,
  bank4Holder: "",
  pixType: "",
  pixKey: "",
};

type ReceivingForm = typeof emptyReceiving;
type MemberDetailResponse = { member: MemberDetail; receiving: Partial<ReceivingForm> | null };

const inputClass = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/30";
const bankNumbers: BankNumber[] = [1, 2, 3, 4];
const pixTypes = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "e-mail", label: "E-mail" },
  { value: "celular", label: "Celular" },
  { value: "chave-aleatoria", label: "Chave aleatória" },
  { value: "outro", label: "Outro" },
];

async function request(path: string, init?: RequestInit) {
  const response = await fetch(withAppBase(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
  return data;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export default function AdminMemberEdit() {
  const [, params] = useRoute("/admin/membros/:memberId/editar");
  const memberId = Number(params?.memberId);
  const validMemberId = Number.isInteger(memberId) && memberId > 0;
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [accountForm, setAccountForm] = useState({ name: "", email: "" });
  const [receivingForm, setReceivingForm] = useState<ReceivingForm>(emptyReceiving);
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingReceiving, setSavingReceiving] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!validMemberId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await request(`/api/admin/member-management/${memberId}`) as MemberDetailResponse;
      setMember(data.member);
      setAccountForm({ name: data.member.name ?? "", email: data.member.email ?? "" });
      const receiving = data.receiving ?? {};
      setReceivingForm({
        holderName: receiving.holderName ?? "",
        method: receiving.method ?? "pix",
        receivingKey: receiving.receivingKey ?? "",
        instructions: receiving.instructions ?? "",
        paypalEmail: receiving.paypalEmail ?? "",
        paypalEnabled: Boolean(receiving.paypalEnabled),
        pagseguroEmail: receiving.pagseguroEmail ?? "",
        pagseguroEnabled: Boolean(receiving.pagseguroEnabled),
        bank1Name: receiving.bank1Name ?? "",
        bank1Agency: receiving.bank1Agency ?? "",
        bank1Account: receiving.bank1Account ?? "",
        bank1Type: receiving.bank1Type ?? null,
        bank1Holder: receiving.bank1Holder ?? "",
        bank2Name: receiving.bank2Name ?? "",
        bank2Agency: receiving.bank2Agency ?? "",
        bank2Account: receiving.bank2Account ?? "",
        bank2Type: receiving.bank2Type ?? null,
        bank2Holder: receiving.bank2Holder ?? "",
        bank3Name: receiving.bank3Name ?? "",
        bank3Agency: receiving.bank3Agency ?? "",
        bank3Account: receiving.bank3Account ?? "",
        bank3Type: receiving.bank3Type ?? null,
        bank3Holder: receiving.bank3Holder ?? "",
        bank4Name: receiving.bank4Name ?? "",
        bank4Agency: receiving.bank4Agency ?? "",
        bank4Account: receiving.bank4Account ?? "",
        bank4Type: receiving.bank4Type ?? null,
        bank4Holder: receiving.bank4Holder ?? "",
        pixType: receiving.pixType ?? "",
        pixKey: receiving.pixKey ?? "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar o membro.");
    } finally {
      setLoading(false);
    }
  }, [memberId, validMemberId]);

  useEffect(() => { void loadDetail(); }, [loadDetail]);

  function setReceivingField<K extends keyof ReceivingForm>(key: K, value: ReceivingForm[K]) {
    setReceivingForm(current => ({ ...current, [key]: value }));
  }

  function setBankField(bank: BankNumber, field: "Name" | "Agency" | "Account" | "Type" | "Holder", value: string | BankType) {
    const key = `bank${bank}${field}` as keyof ReceivingForm;
    setReceivingForm(current => ({ ...current, [key]: value }));
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = accountForm.name.trim();
    const email = normalizeEmail(accountForm.email);
    if (name.length < 2) return void toast.error("Informe um nome válido.");
    if (!validateEmail(email)) return void toast.error("Informe um e-mail válido.");
    setSavingAccount(true);
    try {
      await request("/api/admin/member-management/edit", {
        method: "POST",
        body: JSON.stringify({ userId: memberId, name, email }),
      });
      await loadDetail();
      toast.success("Dados da conta atualizados.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar a conta.");
    } finally {
      setSavingAccount(false);
    }
  }

  async function saveReceiving(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = receivingForm;
    if (!form.holderName.trim()) return void toast.error("Informe o titular dos dados de recebimento.");
    if (form.paypalEmail && !validateEmail(form.paypalEmail)) return void toast.error("Informe um e-mail PayPal válido.");
    if (form.pagseguroEmail && !validateEmail(form.pagseguroEmail)) return void toast.error("Informe um e-mail PagSeguro válido.");
    if (form.method === "pix" && (!form.pixType || !form.pixKey || !validatePixKeyByType(form.pixKey, form.pixType))) {
      return void toast.error("Informe uma chave PIX válida e o tipo correspondente.");
    }
    if (form.method === "bank_transfer" && (!form.bank1Name.trim() || !form.bank1Agency.trim() || !form.bank1Account.trim() || !form.bank1Type || !form.bank1Holder.trim())) {
      return void toast.error("Preencha todos os dados obrigatórios da primeira conta bancária.");
    }
    if (form.method === "other" && !form.receivingKey.trim() && !(form.paypalEnabled && validateEmail(form.paypalEmail)) && !(form.pagseguroEnabled && validateEmail(form.pagseguroEmail))) {
      return void toast.error("Informe uma identificação de recebimento ou habilite PayPal/PagSeguro com e-mail válido.");
    }

    const normalizedPixKey = form.pixKey.trim() ? normalizePixKeyByType(form.pixKey, form.pixType) : null;
    setSavingReceiving(true);
    try {
      await request("/api/admin/member-management/receiving", {
        method: "POST",
        body: JSON.stringify({
          userId: memberId,
          holderName: form.holderName.trim() || null,
          method: form.method,
          receivingKey: form.method === "pix" ? normalizedPixKey : form.receivingKey.trim() || null,
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
          pixKey: normalizedPixKey,
        }),
      });
      await loadDetail();
      toast.success("Dados de recebimento atualizados.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar os dados de recebimento.");
    } finally {
      setSavingReceiving(false);
    }
  }

  if (!validMemberId) {
    return <DashboardLayout menuItems={adminMenu} title="Administração"><main className="mx-auto w-full max-w-5xl p-5 sm:p-8"><p className="rounded-2xl border border-red-400/25 bg-red-400/5 p-5 text-red-200">Identificador de membro inválido.</p></main></DashboardLayout>;
  }

  return <DashboardLayout menuItems={adminMenu} title="Administração">
    <main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
      <a href={withAppBase("/admin/membros")} className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"><ArrowLeft className="size-4" />Voltar para Contas de membros</a>

      <header className="min-w-0 space-y-2">
        <span className="text-xs uppercase tracking-[.16em] text-emerald-300">Gerenciamento individual</span>
        <h1 className="break-words text-3xl font-semibold text-white">{loading ? "Carregando membro..." : member?.name || `Membro #${memberId}`}</h1>
        {member ? <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400"><span>ID #{member.id}</span><span className="break-all">{member.email || "Sem e-mail"}</span><span>Último acesso: {formatDate(member.lastSignedIn)}</span></div> : null}
      </header>

      {!loading && !member ? <section className="rounded-2xl border border-red-400/25 bg-red-400/5 p-5 text-red-200">Membro não encontrado ou não disponível para gerenciamento.</section> : null}

      {member ? <>
        <form onSubmit={saveAccount} className="space-y-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-white"><UserRound className="size-5 text-emerald-300" /><h2 className="font-medium">Dados da conta</h2></div>
          <p className="text-sm leading-6 text-zinc-400">Edite somente os campos de conta que a administração já permite alterar. ID, papel de acesso e credenciais internas permanecem protegidos.</p>
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <label className="min-w-0 text-sm text-zinc-200">Nome<input required minLength={2} maxLength={180} value={accountForm.name} onChange={event => setAccountForm(current => ({ ...current, name: event.target.value }))} className={inputClass} /></label>
            <label className="min-w-0 text-sm text-zinc-200">E-mail<input required type="email" maxLength={320} value={accountForm.email} onChange={event => setAccountForm(current => ({ ...current, email: event.target.value }))} className={inputClass} /></label>
          </div>
          <div className="grid gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-xl bg-white/[0.035] p-3"><span className="text-zinc-500">ID da conta</span><strong className="mt-1 block text-zinc-200">#{member.id}</strong></div>
            <div className="rounded-xl bg-white/[0.035] p-3"><span className="text-zinc-500">Cadastro</span><strong className="mt-1 block text-zinc-200">{formatDate(member.createdAt)}</strong></div>
            <div className="rounded-xl bg-white/[0.035] p-3"><span className="text-zinc-500">Última atualização</span><strong className="mt-1 block text-zinc-200">{formatDate(member.updatedAt)}</strong></div>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-xs leading-5 text-zinc-400"><Mail className="mt-0.5 size-4 shrink-0 text-emerald-300" />A senha do membro não é exibida nem manipulada nesta tela.</div>
          <button disabled={savingAccount} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 sm:w-auto"><Save className="size-4" />{savingAccount ? "Salvando..." : "Salvar dados da conta"}</button>
        </form>

        <form onSubmit={saveReceiving} className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-white"><CreditCard className="size-5 text-emerald-300" /><h2 className="font-medium">Dados de recebimento</h2></div>
          <p className="text-sm leading-6 text-zinc-400">Esta seção usa os mesmos campos e a mesma persistência da área de recebimentos do membro selecionado.</p>

          <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-white"><Landmark className="size-4 text-emerald-300" /><h3 className="text-sm font-medium">Preferência principal</h3></div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-zinc-200">Titular *<input required maxLength={180} value={receivingForm.holderName} onChange={event => setReceivingField("holderName", event.target.value)} className={inputClass} /></label>
              <label className="text-sm text-zinc-200">Forma preferida *<select value={receivingForm.method} onChange={event => setReceivingField("method", event.target.value as Method)} className={inputClass}><option value="pix">PIX</option><option value="bank_transfer">Transferência bancária</option><option value="other">Outra forma combinada</option></select></label>
            </div>
            {receivingForm.method === "pix" ? <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-zinc-200">Tipo da chave PIX *<select value={receivingForm.pixType} onChange={event => setReceivingField("pixType", event.target.value)} className={inputClass}><option value="">Selecione</option>{pixTypes.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <label className="text-sm text-zinc-200">Chave PIX *<input value={receivingForm.pixKey} onChange={event => setReceivingField("pixKey", event.target.value)} maxLength={255} className={inputClass} /></label>
            </div> : <label className="block text-sm text-zinc-200">Chave ou identificação de recebimento<input value={receivingForm.receivingKey} onChange={event => setReceivingField("receivingKey", event.target.value)} maxLength={255} className={inputClass} /></label>}
            <label className="block text-sm text-zinc-200">Instruções adicionais<textarea value={receivingForm.instructions} onChange={event => setReceivingField("instructions", event.target.value)} maxLength={2000} rows={4} className={inputClass} /></label>
          </section>

          <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-white"><WalletCards className="size-4 text-emerald-300" /><h3 className="text-sm font-medium">Carteiras e intermediadores</h3></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-white/10 p-4"><label className="flex items-center gap-2 text-sm text-zinc-200"><input type="checkbox" checked={receivingForm.paypalEnabled} onChange={event => setReceivingField("paypalEnabled", event.target.checked)} />PayPal habilitado</label><label className="block text-sm text-zinc-200">E-mail PayPal<input type="email" maxLength={320} value={receivingForm.paypalEmail} onChange={event => setReceivingField("paypalEmail", event.target.value)} className={inputClass} /></label></div>
              <div className="space-y-3 rounded-xl border border-white/10 p-4"><label className="flex items-center gap-2 text-sm text-zinc-200"><input type="checkbox" checked={receivingForm.pagseguroEnabled} onChange={event => setReceivingField("pagseguroEnabled", event.target.checked)} />PagSeguro habilitado</label><label className="block text-sm text-zinc-200">E-mail PagSeguro<input type="email" maxLength={320} value={receivingForm.pagseguroEmail} onChange={event => setReceivingField("pagseguroEmail", event.target.value)} className={inputClass} /></label></div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-white"><Landmark className="size-4 text-emerald-300" /><h3 className="text-sm font-medium">Contas bancárias</h3></div>
            <div className="space-y-4">{bankNumbers.map(bank => {
              const prefix = `bank${bank}` as const;
              const name = receivingForm[`${prefix}Name` as keyof ReceivingForm] as string;
              const agency = receivingForm[`${prefix}Agency` as keyof ReceivingForm] as string;
              const account = receivingForm[`${prefix}Account` as keyof ReceivingForm] as string;
              const type = receivingForm[`${prefix}Type` as keyof ReceivingForm] as BankType;
              const holder = receivingForm[`${prefix}Holder` as keyof ReceivingForm] as string;
              return <div key={bank} className="space-y-3 rounded-xl border border-white/10 p-4">
                <h4 className="text-sm font-medium text-zinc-200">Conta bancária {bank}{bank === 1 && receivingForm.method === "bank_transfer" ? " *" : ""}</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <label className="text-xs text-zinc-300">Banco<input maxLength={180} value={name} onChange={event => setBankField(bank, "Name", event.target.value)} className={inputClass} /></label>
                  <label className="text-xs text-zinc-300">Agência<input maxLength={64} value={agency} onChange={event => setBankField(bank, "Agency", event.target.value)} className={inputClass} /></label>
                  <label className="text-xs text-zinc-300">Conta<input maxLength={96} value={account} onChange={event => setBankField(bank, "Account", event.target.value)} className={inputClass} /></label>
                  <label className="text-xs text-zinc-300">Tipo<select value={type ?? ""} onChange={event => setBankField(bank, "Type", (event.target.value || null) as BankType)} className={inputClass}><option value="">Selecione</option><option value="checking">Corrente</option><option value="savings">Poupança</option></select></label>
                  <label className="text-xs text-zinc-300">Titular<input maxLength={180} value={holder} onChange={event => setBankField(bank, "Holder", event.target.value)} className={inputClass} /></label>
                </div>
              </div>;
            })}</div>
          </section>

          <button disabled={savingReceiving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 sm:w-auto"><Save className="size-4" />{savingReceiving ? "Salvando..." : "Salvar dados de recebimento"}</button>
        </form>
      </> : null}
    </main>
  </DashboardLayout>;
}
