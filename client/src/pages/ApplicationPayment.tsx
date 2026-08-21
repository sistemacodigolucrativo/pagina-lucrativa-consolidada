import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { applicationActivationStatusLabel, applicationPaymentStatusLabel } from "@shared/applications";
import { ArrowLeft, ArrowRight, CheckCircle2, Clipboard, CreditCard, Loader2, QrCode, UploadCloud, UserRound } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { useRoute } from "wouter";
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

export default function ApplicationPayment() {
  const [, routeParams] = useRoute("/pedido/:trackingCode/pagamento");
  const queryCode = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("codigo") ?? "";
  const trackingCode = (routeParams?.trackingCode ?? queryCode).trim().toUpperCase();
  const payment = trpc.applications.paymentPage.useQuery({ trackingCode }, { enabled: Boolean(trackingCode), retry: false });
  const uploadReceipt = trpc.applications.uploadReceipt.useMutation({
    onSuccess: async () => {
      await payment.refetch();
      toast.success("Comprovante enviado. O responsável recebeu sua solicitação.");
    },
    onError: error => toast.error(error.message),
  });

  const pixKey = useMemo(() => {
    const receiving = payment.data?.receiving;
    return receiving?.pixKey || (receiving?.method === "pix" ? receiving.receivingKey : null);
  }, [payment.data?.receiving]);

  const pixType = payment.data?.receiving?.pixType || (payment.data?.receiving?.method === "pix" ? "PIX" : null);
  const sponsorName = payment.data?.sponsor?.name || payment.data?.sponsor?.profile?.slug || "responsável pela Página Lucrativa";

  async function copyPix() {
    if (!pixKey) return;
    await navigator.clipboard.writeText(pixKey);
    toast.success("Chave PIX copiada.");
  }

  async function copyCode() {
    if (!trackingCode) return;
    await navigator.clipboard.writeText(trackingCode);
    toast.success("Código de acompanhamento copiado.");
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
    uploadReceipt.mutate({ trackingCode, dataUrl, contentType: file.type as typeof allowedReceiptTypes[number], originalName: file.name });
  }

  if (!trackingCode) {
    return <main className="access-page"><section className="access-card"><a href={withAppBase("/")} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Pedido não informado.</h1><p>Não foi possível identificar o código do pedido para carregar o pagamento.</p></section></main>;
  }

  if (payment.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-[#050505] p-6 text-zinc-300"><Loader2 className="size-7 animate-spin text-emerald-300" /></main>;
  }

  if (!payment.data) {
    return <main className="access-page"><section className="access-card"><a href={withAppBase("/")} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Pedido não encontrado.</h1><p>Confira o código recebido e tente novamente.</p></section></main>;
  }

  const { application, paymentLinks, receiving, receipts } = payment.data;
  const hasReceiptAwaitingReview = application.paymentStatus === "receipt_received" || receipts.some(receipt => receipt.status === "pending");
  const trackingHref = withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(application.trackingCode ?? trackingCode)}`);

  return <main className="min-h-screen bg-[#050505] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <a href={withAppBase("/")} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-200"><ArrowLeft size={15} /> Voltar para a Página Lucrativa</a>

      <header className="rounded-3xl border border-emerald-300/20 bg-zinc-950/80 p-5 shadow-2xl sm:p-7">
        <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Pagamento do pedido</span>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold text-white">Finalize sua ativação.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">Seu pedido foi registrado. Use uma das opções abaixo para pagar diretamente ao responsável pela Página Lucrativa.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm">
            <span className="text-zinc-500">Código de acompanhamento</span>
            <strong className="mt-1 block text-lg text-emerald-200">{application.trackingCode}</strong>
            <p className="mt-2 text-xs leading-5 text-zinc-400">Guarde este código. Ele permite acompanhar sua ativação.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={copyCode} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5"><Clipboard className="size-3.5" />Copiar código</button>
              <a href={trackingHref} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/35 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-300/10">Acompanhar <ArrowRight className="size-3.5" /></a>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <UserRound className="mt-1 size-5 shrink-0 text-emerald-300" />
              <div>
                <h2 className="font-medium text-white">Você está realizando o pagamento para: {sponsorName}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">Confira o nome do responsável antes de efetuar o pagamento. O sistema não processa cartão nem captura dados bancários.</p>
              </div>
            </div>
          </article>

          {pixKey ? <article className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-white"><QrCode className="size-5 text-emerald-300" /><h2 className="font-medium">PIX</h2></div>
            <div className="mt-4 space-y-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/25 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">Tipo da chave</dt><dd className="mt-1 text-white">{pixType || "PIX"}</dd></div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">Titular</dt><dd className="mt-1 text-white">{receiving?.holderName || sponsorName}</dd></div>
              </dl>
              <div className="rounded-xl border border-white/10 bg-black/35 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-500">Chave PIX</span>
                <code className="mt-2 block break-all text-sm text-emerald-100">{pixKey}</code>
                {receiving?.instructions ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{receiving.instructions}</p> : null}
              </div>
              <button type="button" onClick={copyPix} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10 sm:w-auto"><Clipboard className="size-4" />Copiar chave PIX</button>
            </div>
          </article> : null}

          {paymentLinks.length ? <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-white"><CreditCard className="size-5 text-emerald-300" /><h2 className="font-medium">Checkout por link</h2></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{paymentLinks.map(link => <a key={link.id} href={link.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-300 px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-emerald-200">Pagar com {link.label}</a>)}</div>
          </article> : null}

          {pixKey ? <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-white"><UploadCloud className="size-5 text-emerald-300" /><h2 className="font-medium">Já realizou o pagamento?</h2></div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Envie o comprovante para que o responsável confira seu pedido e libere a senha especial.</p>
            {hasReceiptAwaitingReview ? <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50"><CheckCircle2 className="mb-2 size-5" /><strong>Comprovante enviado</strong><br />Recebemos seu comprovante. O responsável analisará o pagamento.<br /><span className="mt-2 block">Status: Comprovante recebido — aguardando análise</span><span className="mt-1 block">Código: <strong>{application.trackingCode}</strong></span><a href={trackingHref} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 font-semibold text-emerald-50 hover:bg-emerald-300/10">Acompanhar meu pedido <ArrowRight className="size-4" /></a></div> : null}
            <label className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.98] sm:w-auto">
              <UploadCloud className="size-4" />{uploadReceipt.isPending ? "Enviando..." : "Enviar comprovante"}
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" disabled={uploadReceipt.isPending} onChange={handleReceipt} />
            </label>
            {receipts.length ? <div className="mt-5 space-y-2 text-sm text-zinc-300">{receipts.map(receipt => <div key={receipt.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2"><span>{receipt.originalName || "Comprovante enviado"}</span><strong className="text-emerald-200">{receipt.status === "pending" ? "Em análise" : receipt.status === "approved" ? "Aprovado" : "Rejeitado"}</strong></div>)}</div> : null}
          </article> : null}
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6 lg:sticky lg:top-6 lg:self-start">
          <div><span className="text-xs uppercase tracking-wider text-zinc-500">Comprador</span><strong className="mt-1 block text-white">{application.fullName}</strong><p className="mt-1 break-all text-sm text-zinc-400">{application.email}</p><p className="text-sm text-zinc-400">{application.whatsapp}</p></div>
          <div className="border-t border-white/10 pt-4"><span className="text-xs uppercase tracking-wider text-zinc-500">Valor da adesão</span><strong className="mt-1 block text-2xl text-emerald-200">{formatCurrency(application.offerAmountCents)}</strong></div>
          <div className="border-t border-white/10 pt-4 text-sm leading-6 text-zinc-300"><p><strong className="text-white">Pagamento:</strong> {applicationPaymentStatusLabel[application.paymentStatus]}</p><p><strong className="text-white">Acesso:</strong> {applicationActivationStatusLabel[application.activationStatus]}</p></div>
          {hasReceiptAwaitingReview ? <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-50"><CheckCircle2 className="mb-2 size-5" />Comprovante recebido — aguardando análise.</div> : null}
          <a href={trackingHref} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5">Acompanhar meu pedido <ArrowRight className="size-4" /></a>
        </aside>
      </section>
    </section>
  </main>;
}
