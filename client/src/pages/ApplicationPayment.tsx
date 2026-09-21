import PaymentReceivingDetails, { type PaymentReceivingData, type ReceivingPaymentMethod } from "@/components/PaymentReceivingDetails";
import { trpc } from "@/lib/trpc";
import { copyTextToClipboard } from "@/lib/clipboard";
import { withAppBase } from "@/lib/devPath";
import { readPaymentAccessToken } from "@/lib/applicationPaymentAccess";
import { applicationActivationStatusLabel, applicationPaymentStatusLabel } from "@shared/applications";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clipboard, CreditCard, Loader2, QrCode, UploadCloud, UserRound, WalletCards } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { toast } from "sonner";

const allowedReceiptTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
type PaymentMethod = "pix" | ReceivingPaymentMethod | "checkout";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Arquivo inválido."));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

function receiptUploadErrorMessage(message: string) {
  if (/413|HTML|Unexpected token|not valid JSON|Request Entity Too Large/i.test(message)) {
    return "Não foi possível enviar o comprovante. Verifique se o arquivo tem até 5 MB e tente novamente.";
  }
  return message;
}

export default function ApplicationPayment() {
  const [, instructionParams] = useRoute("/pedido/:trackingCode/pagamento/instrucoes");
  const [, legacyParams] = useRoute("/pedido/:trackingCode/pagamento");
  const queryCode = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("codigo") ?? "";
  const trackingCode = (instructionParams?.trackingCode ?? legacyParams?.trackingCode ?? queryCode).trim().toUpperCase();
  const paymentAccessToken = readPaymentAccessToken(trackingCode);
  const payment = trpc.applications.paymentPage.useMutation();

  useEffect(() => {
    if (trackingCode && paymentAccessToken) payment.mutate({ trackingCode, paymentAccessToken });
  }, [trackingCode, paymentAccessToken]);
  const uploadReceipt = trpc.applications.uploadReceipt.useMutation({
    onSuccess: async () => {
      payment.mutate({ trackingCode, paymentAccessToken });
      toast.success("Comprovante enviado. O responsável recebeu sua solicitação.");
    },
    onError: error => toast.error(receiptUploadErrorMessage(error.message)),
  });

  const pixKey = payment.data?.pix?.key ?? null;
  const pixType = payment.data?.pix?.type || (pixKey ? "PIX" : null);
  const sponsorName = payment.data?.sponsor?.name || "responsável pelo Código Lucrativo";
  const receiving = (payment.data?.receiving ?? null) as PaymentReceivingData | null;
  const availableMethods = useMemo<PaymentMethod[]>(() => {
    const methods: PaymentMethod[] = [];
    if (pixKey) methods.push("pix");
    if ((receiving?.banks?.length ?? 0) > 0) methods.push("bank_transfer");
    if (receiving?.pagSeguro?.email) methods.push("pagseguro");
    if (receiving?.paypal?.email) methods.push("paypal");
    if (receiving?.other && (receiving.other.key || receiving.other.instructions)) methods.push("other");
    if ((payment.data?.paymentLinks.length ?? 0) > 0) methods.push("checkout");
    const preferred = receiving?.preferredMethod as PaymentMethod | null | undefined;
    if (preferred && methods.includes(preferred)) return [preferred, ...methods.filter(method => method !== preferred)];
    return methods;
  }, [payment.data?.paymentLinks.length, pixKey, receiving]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!availableMethods.length) {
      setSelectedMethod(null);
      return;
    }
    if (!selectedMethod || !availableMethods.includes(selectedMethod)) {
      setSelectedMethod(availableMethods[0]);
    }
  }, [availableMethods, selectedMethod]);

  async function copyPix() {
    if (!pixKey) return;
    const copied = await copyTextToClipboard(pixKey);
    if (copied) toast.success("Chave PIX copiada.");
    else toast.error("Não foi possível copiar a chave PIX.");
  }

  async function copyCode() {
    if (!trackingCode) return;
    const copied = await copyTextToClipboard(trackingCode);
    if (copied) toast.success("Código de acompanhamento copiado.");
    else toast.error("Não foi possível copiar o código.");
  }

  async function handleReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!allowedReceiptTypes.includes(file.type as typeof allowedReceiptTypes[number])) {
      toast.error("Envie JPG, PNG, WEBP ou PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O comprovante deve ter no máximo 5 MB.");
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    uploadReceipt.mutate({ trackingCode, paymentAccessToken, dataUrl, contentType: file.type as typeof allowedReceiptTypes[number], originalName: file.name });
  }

  if (!trackingCode) {
    return <main className="access-page"><section className="access-card"><a href={withAppBase("/")} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Pedido não informado.</h1><p>Não foi possível identificar o código do pedido para carregar o pagamento.</p></section></main>;
  }

  if (!paymentAccessToken) {
    return <main className="access-page"><section className="access-card"><a href={withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(trackingCode)}`)} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Acesso de pagamento não disponível.</h1><p>Por segurança, esta página precisa ser aberta a partir do pedido recém-registrado ou após confirmar o código e o e-mail no acompanhamento.</p><a className="btn btn-primary mt-5" href={withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(trackingCode)}`)}>Confirmar meus dados</a></section></main>;
  }

  if (payment.isPending || (paymentAccessToken && !payment.data)) {
    return <main className="grid min-h-screen place-items-center bg-[#050505] p-6 text-zinc-300"><Loader2 className="size-7 animate-spin text-emerald-300" /></main>;
  }

  if (!payment.data) {
    return <main className="access-page"><section className="access-card"><a href={withAppBase("/")} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Pedido não encontrado.</h1><p>Confira o código recebido e tente novamente.</p></section></main>;
  }

  const application = payment.data;
  const { paymentLinks } = payment.data;
  const latestReceiptStatus = payment.data.latestReceiptStatus;
  const hasReceiptAwaitingReview = application.paymentStatus === "receipt_received" || latestReceiptStatus === "pending";
  const canRetryRejectedReceipt = application.paymentStatus === "rejected" && latestReceiptStatus !== "pending";
  const hasSubmittedReceipt = application.paymentStatus === "confirmed" || (Boolean(latestReceiptStatus) && !canRetryRejectedReceipt);
  const orderTrackingCode = application.trackingCode || trackingCode;
  const trackingHref = withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(orderTrackingCode)}`);
  const showReceiptUpload = Boolean(selectedMethod && selectedMethod !== "checkout") && application.paymentStatus !== "confirmed";
  const showPaymentMethodChooser = availableMethods.length > 1;
  const showPaymentStatusSummary = application.paymentStatus !== "awaiting_payment" && application.paymentStatus !== "not_started";
  const paymentDetailsStep = showPaymentMethodChooser ? 2 : 1;
  const trackOrderStep = showReceiptUpload ? paymentDetailsStep + 2 : paymentDetailsStep + 1;
  const receiptStatusLabel = application.paymentStatus === "confirmed" ? "Pagamento confirmado"
    : application.paymentStatus === "rejected" ? "Comprovante rejeitado"
      : hasReceiptAwaitingReview ? "Comprovante recebido — aguardando análise"
        : "Aguardando comprovante";
  const handleTrackOrder = async () => {
    try {
      const copied = await copyTextToClipboard(orderTrackingCode);
      if (copied) toast.success("Código copiado.");
    } catch {
      toast.info("Abrindo acompanhamento do pedido.");
    }
    window.setTimeout(() => {
      window.location.href = trackingHref;
    }, 450);
  };
  const buyerDetailsContent = <>
    <div className="flex min-w-0 items-center gap-2 text-white"><UserRound className="size-5 shrink-0 text-emerald-300" /><h2 className="min-w-0 break-words font-semibold [overflow-wrap:anywhere]">Detalhes do comprador</h2></div>
    <div className="min-w-0"><span className="text-xs uppercase tracking-wider text-zinc-500">Nome</span><strong className="mt-1 block min-w-0 break-words text-white [overflow-wrap:anywhere]">{application.buyerName}</strong></div>
    <div className="min-w-0 border-t border-white/10 pt-4 text-sm leading-6 text-zinc-300"><h3 className="mb-2 font-semibold text-white">Status do pedido</h3><p className="break-words [overflow-wrap:anywhere]"><strong className="text-white">Pagamento:</strong> {applicationPaymentStatusLabel[application.paymentStatus]}</p><p className="break-words [overflow-wrap:anywhere]"><strong className="text-white">Comprovante:</strong> {receiptStatusLabel}</p><p className="break-words [overflow-wrap:anywhere]"><strong className="text-white">Acesso:</strong> {applicationActivationStatusLabel[application.activationStatus]}</p></div>
  </>;

  const receivingMethodTitle: Partial<Record<PaymentMethod, string>> = {
    bank_transfer: "Transferência bancária",
    pagseguro: "PagSeguro",
    paypal: "PayPal",
    other: "Outra forma de pagamento",
  };

  return <main className="min-h-screen overflow-x-hidden bg-[#050505] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <a href={withAppBase("/")} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-200"><ArrowLeft size={15} /> Voltar para o Código Lucrativo</a>

      <header className="min-w-0 rounded-3xl border border-emerald-300/20 bg-zinc-950/80 p-5 shadow-2xl sm:p-7">
        <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Pagamento da solicitação de ativação</span>
        <h1 className="mt-3 break-words text-3xl font-semibold text-white [overflow-wrap:anywhere]">Finalize seu pagamento de ativação</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">Depois de pagar, envie o comprovante quando solicitado e acompanhe a análise pelo código do pedido.</p>
      </header>

      <section className="grid min-w-0 gap-6">
        <div className="min-w-0 space-y-6">
          {showPaymentMethodChooser ? <article className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">1. Escolha como pagar</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Mostramos apenas as formas de pagamento configuradas para este pedido. A opção preferida do responsável aparece primeiro.</p>
            {availableMethods.length ? <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
              {pixKey ? <button type="button" onClick={() => setSelectedMethod("pix")} aria-pressed={selectedMethod === "pix"} className={`min-w-0 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-300/40 ${selectedMethod === "pix" ? "border-emerald-300/60 bg-emerald-300/10 text-white" : "border-white/10 bg-black/25 text-zinc-300 hover:border-white/25"}`}><span className="flex items-center gap-2 font-semibold"><QrCode className="size-4 shrink-0 text-emerald-300" />PIX</span><span className="mt-2 block break-words text-sm text-zinc-400">Pagamento direto com chave PIX</span></button> : null}
              {(receiving?.banks?.length ?? 0) > 0 ? <button type="button" onClick={() => setSelectedMethod("bank_transfer")} aria-pressed={selectedMethod === "bank_transfer"} className={`min-w-0 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-300/40 ${selectedMethod === "bank_transfer" ? "border-emerald-300/60 bg-emerald-300/10 text-white" : "border-white/10 bg-black/25 text-zinc-300 hover:border-white/25"}`}><span className="flex items-center gap-2 font-semibold"><Building2 className="size-4 shrink-0 text-emerald-300" />Dados bancários</span><span className="mt-2 block break-words text-sm text-zinc-400">Transferência para conta configurada</span></button> : null}
              {receiving?.pagSeguro?.email ? <button type="button" onClick={() => setSelectedMethod("pagseguro")} aria-pressed={selectedMethod === "pagseguro"} className={`min-w-0 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-300/40 ${selectedMethod === "pagseguro" ? "border-emerald-300/60 bg-emerald-300/10 text-white" : "border-white/10 bg-black/25 text-zinc-300 hover:border-white/25"}`}><span className="flex items-center gap-2 font-semibold"><WalletCards className="size-4 shrink-0 text-emerald-300" />PagSeguro</span><span className="mt-2 block break-words text-sm text-zinc-400">Dados configurados para PagSeguro</span></button> : null}
              {receiving?.paypal?.email ? <button type="button" onClick={() => setSelectedMethod("paypal")} aria-pressed={selectedMethod === "paypal"} className={`min-w-0 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-300/40 ${selectedMethod === "paypal" ? "border-emerald-300/60 bg-emerald-300/10 text-white" : "border-white/10 bg-black/25 text-zinc-300 hover:border-white/25"}`}><span className="flex items-center gap-2 font-semibold"><WalletCards className="size-4 shrink-0 text-emerald-300" />PayPal</span><span className="mt-2 block break-words text-sm text-zinc-400">Dados configurados para PayPal</span></button> : null}
              {receiving?.other && (receiving.other.key || receiving.other.instructions) ? <button type="button" onClick={() => setSelectedMethod("other")} aria-pressed={selectedMethod === "other"} className={`min-w-0 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-300/40 ${selectedMethod === "other" ? "border-emerald-300/60 bg-emerald-300/10 text-white" : "border-white/10 bg-black/25 text-zinc-300 hover:border-white/25"}`}><span className="flex items-center gap-2 font-semibold"><WalletCards className="size-4 shrink-0 text-emerald-300" />Outra forma</span><span className="mt-2 block break-words text-sm text-zinc-400">Instruções configuradas pelo responsável</span></button> : null}
              {paymentLinks.length ? <button type="button" onClick={() => setSelectedMethod("checkout")} aria-pressed={selectedMethod === "checkout"} className={`min-w-0 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-300/40 ${selectedMethod === "checkout" ? "border-emerald-300/60 bg-emerald-300/10 text-white" : "border-white/10 bg-black/25 text-zinc-300 hover:border-white/25"}`}><span className="flex items-center gap-2 font-semibold"><CreditCard className="size-4 shrink-0 text-emerald-300" />Cartão ou outras formas</span><span className="mt-2 block break-words text-sm text-zinc-400">Pagamento via link de checkout</span></button> : null}
            </div> : <div className="mt-4 rounded-xl border border-yellow-300/25 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">Nenhuma forma de pagamento está configurada para este pedido. Acompanhe seu pedido ou aguarde orientação do responsável.</div>}
          </article> : !availableMethods.length ? <article className="min-w-0 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-5 text-sm leading-6 text-yellow-50 sm:p-6">Nenhuma forma de pagamento está configurada para este pedido. Acompanhe seu pedido ou aguarde orientação do responsável.</article> : null}

          <article className="min-w-0 space-y-5 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6">{buyerDetailsContent}</article>

          <article className="min-w-0 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5 shadow-xl shadow-emerald-950/20 sm:p-6">
            <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Resumo do pedido</span><h2 className="mt-2 break-words text-xl font-semibold text-white [overflow-wrap:anywhere]">Confira os dados antes de pagar</h2><p className="mt-2 text-sm leading-6 text-zinc-400">O pagamento é realizado diretamente ao responsável indicado abaixo.</p></div>
              <div className="min-w-0 rounded-2xl border border-emerald-300/25 bg-black/35 p-4 lg:min-w-56"><span className="text-xs uppercase tracking-wider text-zinc-500">Valor da solicitação de ativação</span><strong className="mt-1 block break-words text-3xl text-emerald-200">{formatCurrency(application.offerAmountCents)}</strong></div>
            </div>
            <dl className={`mt-5 grid min-w-0 gap-3 ${showPaymentStatusSummary ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">Este é o seu apresentador</dt><dd className="mt-1 break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">{sponsorName}</dd></div>
              <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">Código do pedido</dt><dd className="mt-2 flex min-w-0 flex-wrap items-center gap-2"><code className="min-w-0 break-all text-sm text-emerald-100">{application.trackingCode}</code><button type="button" onClick={copyCode} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-xs font-semibold text-white hover:bg-white/5"><Clipboard className="size-3.5" />Copiar</button></dd></div>
              {showPaymentStatusSummary ? <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">Status do pagamento</dt><dd className="mt-1 break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">{applicationPaymentStatusLabel[application.paymentStatus]}</dd></div> : null}
            </dl>
            <p className="mt-4 text-sm text-zinc-400">Confira o responsável antes de realizar o pagamento.</p>
          </article>

          {selectedMethod === "pix" && pixKey ? <article className="min-w-0 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><QrCode className="size-5 text-emerald-300" /><h2 className="text-lg font-semibold">{paymentDetailsStep}. Pague com PIX</h2></div><div className="mt-4 min-w-0 space-y-4"><dl className="grid min-w-0 gap-3 sm:grid-cols-2"><div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">Titular</dt><dd className="mt-1 break-words text-white [overflow-wrap:anywhere]">{payment.data.pix?.holderName || sponsorName}</dd></div><div className="min-w-0 rounded-xl border border-white/10 bg-black/35 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">{pixType ? `Chave PIX · ${pixType}` : "Chave PIX"}</dt><dd className="mt-2 min-w-0 break-all text-sm text-emerald-100">{pixKey}</dd></div></dl>{payment.data.pix?.instructions ? <p className="whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">{payment.data.pix.instructions}</p> : null}<button type="button" onClick={copyPix} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-200 active:scale-[.98] sm:w-auto"><Clipboard className="size-4" />Copiar chave PIX</button></div></article> : null}

          {receiving && selectedMethod && ["bank_transfer", "pagseguro", "paypal", "other"].includes(selectedMethod) ? <article className="min-w-0 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5 sm:p-6"><div className="flex min-w-0 items-center gap-2 text-white"><WalletCards className="size-5 shrink-0 text-emerald-300" /><h2 className="min-w-0 break-words text-lg font-semibold [overflow-wrap:anywhere]">{paymentDetailsStep}. {receivingMethodTitle[selectedMethod] ?? "Dados para pagamento"}</h2></div><p className="mt-2 text-sm leading-6 text-zinc-400">Use os dados abaixo exatamente como informados pelo responsável pelo recebimento.</p><div className="mt-4 min-w-0"><PaymentReceivingDetails receiving={receiving} method={selectedMethod as ReceivingPaymentMethod} /></div></article> : null}

          {selectedMethod === "checkout" && paymentLinks.length ? <article className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><CreditCard className="size-5 text-emerald-300" /><h2 className="text-lg font-semibold">{paymentDetailsStep}. Pague pelo checkout</h2></div><p className="mt-2 text-sm leading-6 text-zinc-400">Você será encaminhado para o checkout configurado pelo responsável. O Código Lucrativo não processa cartão diretamente.</p><div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">{paymentLinks.map((link, index) => <a key={`${link.label}-${index}`} href={link.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 min-w-0 items-center justify-center break-words rounded-lg bg-emerald-300 px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-emerald-200 [overflow-wrap:anywhere]">Pagar com {link.label}</a>)}</div></article> : null}

          {showReceiptUpload && !hasSubmittedReceipt ? <article className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><UploadCloud className="size-5 text-emerald-300" /><h2 className="text-lg font-semibold">Já pagou? Envie seu comprovante</h2></div><p className="mt-2 text-sm leading-6 text-zinc-400">Envie o comprovante para que o responsável confira o pagamento e dê continuidade à análise.</p><label className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.98] sm:w-auto"><UploadCloud className="size-4" />{uploadReceipt.isPending ? "Enviando..." : "Enviar comprovante"}<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" disabled={uploadReceipt.isPending} onChange={handleReceipt} /></label><p className="mt-3 text-xs leading-5 text-zinc-500">Formatos aceitos: JPG, PNG, WEBP ou PDF. Limite: 5 MB.</p></article> : null}

          {showReceiptUpload && hasSubmittedReceipt ? <article className="min-w-0 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-5 text-center text-sm leading-6 text-emerald-50 shadow-xl shadow-emerald-950/20 sm:p-6"><CheckCircle2 className="mx-auto mb-3 size-7" /><h2 className="break-words text-lg font-semibold [overflow-wrap:anywhere]">Comprovante recebido — {receiptStatusLabel.replace("Comprovante recebido — ", "")}</h2><span className="mt-4 block text-emerald-100/80">Código do pedido:</span><strong className="mt-1 block break-all text-base text-white">{application.trackingCode}</strong><button type="button" onClick={handleTrackOrder} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-4 py-2 font-semibold hover:bg-emerald-300/10">Acompanhar pedido <ArrowRight className="size-4" /></button></article> : <article className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6"><h2 className="text-lg font-semibold text-white">{trackOrderStep}. Acompanhe seu pedido</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Após pagar e enviar o comprovante, acompanhe análise e liberação do acesso.</p><button type="button" onClick={handleTrackOrder} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10 sm:w-auto">Acompanhar pedido <ArrowRight className="size-4" /></button></article>}
        </div>
      </section>
    </section>
  </main>;
}
