import { ArrowRight, CheckCircle2, Clipboard, ClipboardCheck, Search, XCircle } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { normalizeEmail } from "@shared/contactValidation";
import { applicationActivationStatusLabel, applicationPaymentStatusLabel } from "@shared/applications";
import { toast } from "sonner";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default function ApplicationTracking() {
  const [, setLocation] = useLocation();
  const initialCode = new URLSearchParams(window.location.search).get("codigo") ?? "";
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState<{ trackingCode: string; email: string } | null>(null);
  const lookup = trpc.applications.lookup.useQuery(query!, { enabled: !!query, retry: false });

  const result = lookup.data;
  const state = useMemo(() => {
    if (!result) return null;
    if (result.paymentStatus === "confirmed") return "approved";
    if (result.paymentStatus === "rejected") return "rejected";
    if (result.paymentStatus === "receipt_received" || result.latestReceiptStatus === "pending") return "receipt";
    return "awaiting";
  }, [result]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCode = trackingCode.trim().toUpperCase();
    const nextEmail = normalizeEmail(email);
    setQuery({ trackingCode: nextCode, email: nextEmail });
    setLocation(`/pedido/acompanhar?codigo=${encodeURIComponent(nextCode)}`);
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado.`);
  }

  return <main className="access-page"><div className="access-card">
    <Link href="/" className="access-back">← Voltar para a Página Lucrativa</Link>
    <div className="access-seal"><ClipboardCheck size={25} /></div>
    <span className="office-eyebrow">Acompanhamento do pedido</span>
    <h1>Acompanhe sua ativação.</h1>
    <p>Informe o código de acompanhamento e o mesmo e-mail utilizado no pedido. O código identifica o pedido; ele não é senha de personalização.</p>

    <form className="office-form-grid access-form" onSubmit={submit}>
      <label className="office-form-full"><span>Código do pedido</span><input value={trackingCode} onChange={event => setTrackingCode(event.target.value.toUpperCase())} required placeholder="PL-XXXXXXXXXXXX" /></label>
      <label className="office-form-full"><span>E-mail utilizado no pedido</span><input value={email} onChange={event => setEmail(normalizeEmail(event.target.value))} required maxLength={320} type="email" autoComplete="email" placeholder="voce@email.com" /></label>
      <button className="btn btn-primary" type="submit"><Search size={16} /> Acompanhar pedido</button>
    </form>

    {lookup.isFetching ? <p className="access-note">Consultando o andamento do pedido...</p> : lookup.error ? <p className="application-error">Não localizamos um pedido com estes dados.</p> : result && state ? <section className="access-steps">
      <div><b>PL</b><span><strong>Código de acompanhamento: {result.trackingCode}</strong><br />Registrado em {new Date(result.createdAt).toLocaleDateString("pt-BR")} · Valor: {formatCurrency(result.offerAmountCents)}</span></div>
      {state === "awaiting" ? <div><b>01</b><span><strong>Aguardando pagamento</strong><br />Seu pedido foi registrado, mas ainda não identificamos a confirmação do pagamento.</span></div> : null}
      {state === "receipt" ? <div><b>02</b><span><strong>Comprovante recebido</strong><br />Recebemos seu comprovante. Ele está aguardando análise do responsável.</span></div> : null}
      {state === "rejected" ? <div><b><XCircle size={18} /></b><span><strong>Pagamento não aprovado</strong><br />Não foi possível confirmar seu pagamento. Se necessário, volte para a tela de pagamento e envie novo comprovante.</span></div> : null}
      {state === "approved" ? <div><b><CheckCircle2 size={18} /></b><span><strong>Pagamento aprovado</strong><br />Sua Página Lucrativa foi liberada para personalização.</span></div> : null}
      <div><b>→</b><span><strong>Pagamento:</strong> {applicationPaymentStatusLabel[result.paymentStatus]}<br /><strong>Acesso:</strong> {applicationActivationStatusLabel[result.activationStatus]}</span></div>
    </section> : null}

    {result && state === "approved" && result.access ? <section className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-left">
      <span className="text-xs uppercase tracking-[0.16em] text-emerald-200">Personalização liberada</span>
      <h2 className="mt-2 text-xl font-semibold text-white">Senha especial</h2>
      {result.access.password ? <code className="mt-3 block break-all rounded-xl bg-black/40 p-3 text-lg font-semibold text-emerald-100">{result.access.password}</code> : <p className="mt-3 text-sm leading-6 text-emerald-50">A senha foi liberada, mas não pôde ser recuperada automaticamente. Solicite nova liberação ao responsável.</p>}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {result.access.password ? <button type="button" onClick={() => copy(result.access!.password!, "Senha especial")} className="btn btn-ghost"><Clipboard size={16} /> Copiar senha</button> : null}
        <a className="btn btn-primary" href={withAppBase(result.access.specialAccessUrl)}>Personalizar minha Página Lucrativa <ArrowRight size={16} /></a>
      </div>
    </section> : null}

    <div className="access-actions">
      {result?.nextAction === "pay" || result?.nextAction === "retry_receipt" ? <a className="btn btn-primary" href={withAppBase(`/pedido/${encodeURIComponent(result.trackingCode ?? "")}/pagamento`)}>Ir para pagamento <ArrowRight size={16} /></a> : null}
      <Link href="/" className="btn btn-ghost">Voltar à estrutura</Link>
    </div>
  </div></main>;
}
