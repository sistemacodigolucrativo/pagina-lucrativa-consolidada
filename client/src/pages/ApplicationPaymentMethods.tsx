import PaymentReceivingDetails, { type PaymentReceivingData, type ReceivingPaymentMethod } from "@/components/PaymentReceivingDetails";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { readPaymentAccessToken } from "@/lib/applicationPaymentAccess";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clipboard, CreditCard, Loader2, QrCode, UploadCloud, WalletCards, X } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

const allowedReceiptTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

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

export default function ApplicationPaymentMethods() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/pedido/:trackingCode/pagamento");
  const queryCode = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("codigo") ?? "";
  const trackingCode = (params?.trackingCode ?? queryCode).trim().toUpperCase();
  const paymentAccessToken = readPaymentAccessToken(trackingCode);
  const payment = trpc.applications.paymentPage.useMutation();

  useEffect(() => {
    if (trackingCode && paymentAccessToken) payment.mutate({ trackingCode, paymentAccessToken });
  }, [trackingCode, paymentAccessToken]);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const uploadReceipt = trpc.applications.uploadReceipt.useMutation({
    onSuccess: () => {
      toast.success("Comprovante enviado. Seu pedido está aguardando análise.");
      setLocation(`/pedido/confirmacao?codigo=${encodeURIComponent(trackingCode)}&comprovante=1`);
    },
    onError: error => toast.error(receiptUploadErrorMessage(error.message)),
  });

  const pixKey = payment.data?.pix?.key ?? null;

  async function copyCode() {
    if (!trackingCode) return;
    await navigator.clipboard.writeText(trackingCode);
    toast.success("Código de acompanhamento copiado.");
  }

  async function copyPix() {
    if (!pixKey) return;
    await navigator.clipboard.writeText(pixKey);
    toast.success("Chave PIX copiada.");
  }

  async function handleReceiptFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setReceiptFile(null);
    setReceiptDataUrl(null);
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
    setReceiptFile(file);
    setReceiptDataUrl(dataUrl);
  }

  function submitReceipt() {
    if (!receiptFile || !receiptDataUrl) {
      toast.error("Selecione o arquivo do comprovante.");
      return;
    }
    uploadReceipt.mutate({ trackingCode, paymentAccessToken, dataUrl: receiptDataUrl, contentType: receiptFile.type as typeof allowedReceiptTypes[number], originalName: receiptFile.name });
  }

  if (!trackingCode) return <main className="access-page"><section className="access-card"><a href={withAppBase("/")} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Pedido não informado.</h1><p>Não foi possível identificar o pedido.</p></section></main>;
  if (!paymentAccessToken) return <main className="access-page"><section className="access-card"><a href={withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(trackingCode)}`)} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Acesso de pagamento não disponível.</h1><p>Confirme o código e o e-mail do pedido no acompanhamento para abrir os meios de pagamento.</p><a className="btn btn-primary mt-5" href={withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(trackingCode)}`)}>Confirmar meus dados</a></section></main>;
  if (payment.isPending) return <main className="grid min-h-screen place-items-center bg-[#050505] p-6 text-zinc-300"><Loader2 className="size-7 animate-spin text-emerald-300" /></main>;
  if (!payment.data) return <main className="access-page"><section className="access-card"><a href={withAppBase("/")} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Pedido não encontrado.</h1><p>Confira o código recebido e tente novamente.</p></section></main>;

  const application = payment.data;
  const { paymentLinks } = payment.data;
  const sponsorName = payment.data.sponsor?.name || "responsável pelo Código Lucrativo";
  const receiving = (payment.data.receiving ?? null) as PaymentReceivingData | null;
  const instructionsUrl = withAppBase(`/pedido/${encodeURIComponent(application.trackingCode || trackingCode)}/pagamento/instrucoes`);
  const trackingUrl = withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(application.trackingCode || trackingCode)}`);
  const hasNonPixReceiving = Boolean((receiving?.banks?.length ?? 0) || receiving?.pagSeguro?.email || receiving?.paypal?.email || receiving?.other);

  const receivingCard = (method: ReceivingPaymentMethod, title: string, description: string, icon: "bank" | "wallet") => <article className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
    <div className="flex min-w-0 items-start gap-3">{icon === "bank" ? <Building2 className="mt-1 size-5 shrink-0 text-emerald-300" /> : <WalletCards className="mt-1 size-5 shrink-0 text-emerald-300" />}<div className="min-w-0"><h2 className="break-words font-medium text-white [overflow-wrap:anywhere]">{title}</h2><p className="mt-1 break-words text-sm leading-6 text-zinc-400 [overflow-wrap:anywhere]">{description}</p></div></div>
    {receiving ? <div className="mt-4 min-w-0"><PaymentReceivingDetails receiving={receiving} method={method} /></div> : null}
    <a href={instructionsUrl} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/35 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10 sm:w-auto">Continuar pagamento <ArrowRight className="size-4" /></a>
  </article>;

  return <main className="min-h-screen overflow-x-hidden bg-[#050505] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <a href={withAppBase("/")} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-200"><ArrowLeft size={15} /> Voltar para o Código Lucrativo</a>
      <header className="min-w-0 rounded-3xl border border-emerald-300/20 bg-zinc-950/80 p-5 shadow-2xl sm:p-7">
        <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Meios de pagamento</span>
        <h1 className="mt-3 break-words text-3xl font-semibold text-white [overflow-wrap:anywhere]">Escolha como deseja pagar.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">Seu pedido foi criado. Agora escolha um dos meios habilitados pelo responsável pelo Código Lucrativo.</p>
      </header>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          {pixKey ? <article className="min-w-0 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5">
            <div className="flex min-w-0 items-start gap-3"><QrCode className="mt-1 size-5 shrink-0 text-emerald-300" /><div className="min-w-0"><h2 className="font-medium text-white">PIX</h2><p className="mt-1 break-words text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">Use a chave PIX do responsável e depois envie o comprovante.</p></div></div>
            <button type="button" onClick={() => setPixModalOpen(true)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black sm:w-auto">Ver dados PIX <ArrowRight className="size-4" /></button>
          </article> : null}

          {(receiving?.banks?.length ?? 0) > 0 ? receivingCard("bank_transfer", "Dados bancários", "Faça a transferência usando uma das contas informadas pelo responsável.", "bank") : null}
          {receiving?.pagSeguro?.email ? receivingCard("pagseguro", "PagSeguro", "Use o e-mail configurado pelo responsável para concluir o pagamento.", "wallet") : null}
          {receiving?.paypal?.email ? receivingCard("paypal", "PayPal", "Use o e-mail configurado pelo responsável para concluir o pagamento.", "wallet") : null}
          {receiving?.other ? receivingCard("other", "Outra forma de pagamento", "Siga os dados e instruções configurados pelo responsável.", "wallet") : null}

          {paymentLinks.map((link, index) => <article key={`${link.label}-${index}`} className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
            <div className="flex min-w-0 items-start gap-3"><CreditCard className="mt-1 size-5 shrink-0 text-emerald-300" /><div className="min-w-0"><h2 className="break-words font-medium text-white [overflow-wrap:anywhere]">{link.label}</h2><p className="mt-1 text-sm leading-6 text-zinc-400">Checkout externo configurado pelo responsável.</p></div></div>
            <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row"><a href={link.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 min-w-0 items-center justify-center break-words rounded-lg bg-emerald-300 px-4 py-2 text-center text-sm font-semibold text-black [overflow-wrap:anywhere]">Pagar com {link.label}</a></div>
          </article>)}

          {!pixKey && !hasNonPixReceiving && !paymentLinks.length ? <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 text-sm leading-6 text-zinc-300">Nenhum meio de pagamento está habilitado para este responsável no momento.</article> : null}
        </div>

        <aside className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
          <div className="min-w-0"><span className="text-xs uppercase tracking-wider text-zinc-500">Código de acompanhamento</span><strong className="mt-1 block break-all text-lg text-emerald-200">{application.trackingCode}</strong><button type="button" onClick={copyCode} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5"><Clipboard className="size-3.5" />Copiar código</button></div>
          <div className="min-w-0 border-t border-white/10 pt-4"><span className="text-xs uppercase tracking-wider text-zinc-500">Valor</span><strong className="mt-1 block break-words text-2xl text-white">{formatCurrency(application.offerAmountCents)}</strong></div>
          <div className="min-w-0 border-t border-white/10 pt-4"><span className="text-xs uppercase tracking-wider text-zinc-500">Pagamento para</span><strong className="mt-1 block break-words text-white [overflow-wrap:anywhere]">{sponsorName}</strong></div>
          <a href={trackingUrl} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/35 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10">Acompanhar meu pedido <ArrowRight className="size-4" /></a>
        </aside>
      </section>

      {pixModalOpen ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pix-payment-modal-title">
        <section className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-2xl border border-emerald-300/25 bg-zinc-950 p-4 shadow-2xl sm:p-5">
          <div className="flex items-center justify-between gap-3"><div className="min-w-0"><span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300">PIX</span><h2 id="pix-payment-modal-title" className="mt-1 break-words text-xl font-semibold text-white">Dados de pagamento</h2></div><button type="button" onClick={() => setPixModalOpen(false)} aria-label="Fechar modal PIX" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"><X className="size-4" /></button></div>

          <div className="mt-4 grid min-w-0 gap-2">
            <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5"><span className="text-[10px] uppercase tracking-wider text-zinc-500">Recebedor</span><strong className="mt-0.5 block break-words text-sm text-white [overflow-wrap:anywhere]">{sponsorName}</strong></div>
            <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5"><span className="text-[10px] uppercase tracking-wider text-zinc-500">Valor</span><strong className="mt-0.5 block break-words text-lg text-white">{formatCurrency(application.offerAmountCents)}</strong></div>
          </div>

          <div className="mt-3 min-w-0 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-3"><span className="text-[10px] uppercase tracking-wider text-emerald-200">Chave PIX</span><code className="mt-1.5 block min-w-0 break-all text-sm leading-5 text-emerald-50">{pixKey}</code><button type="button" onClick={copyPix} className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-1.5 text-xs font-semibold text-emerald-50 hover:bg-emerald-300/10"><Clipboard className="size-3.5" />Copiar chave PIX</button></div>

          <div className="mt-3 min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 py-3"><span className="text-sm font-medium text-white">Comprovante</span><label className="mt-2 flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 px-3 py-2 text-xs text-zinc-200 hover:border-emerald-300/40 hover:text-emerald-100"><UploadCloud className="size-3.5 shrink-0" /><span className="min-w-0 break-all">{receiptFile ? receiptFile.name : "Selecionar arquivo"}</span><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" disabled={uploadReceipt.isPending} onChange={handleReceiptFile} /></label>{receiptFile ? <p className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-200"><CheckCircle2 className="size-3.5" />Arquivo selecionado</p> : null}</div>

          <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => setPixModalOpen(false)} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5">Fechar</button><button type="button" onClick={submitReceipt} disabled={uploadReceipt.isPending || !receiptFile} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-3 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">{uploadReceipt.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}{uploadReceipt.isPending ? "Enviando..." : "Enviar"}</button></div>
        </section>
      </div> : null}
    </section>
  </main>;
}