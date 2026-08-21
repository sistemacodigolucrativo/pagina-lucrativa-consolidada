import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { ArrowLeft, ArrowRight, CheckCircle2, Clipboard, CreditCard, Loader2, QrCode, UploadCloud, X } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
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

export default function ApplicationPaymentMethods() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/pedido/:trackingCode/pagamento");
  const queryCode = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("codigo") ?? "";
  const trackingCode = (params?.trackingCode ?? queryCode).trim().toUpperCase();
  const payment = trpc.applications.paymentPage.useQuery({ trackingCode }, { enabled: Boolean(trackingCode), retry: false });
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const uploadReceipt = trpc.applications.uploadReceipt.useMutation({
    onSuccess: () => {
      toast.success("Comprovante enviado. Seu pedido está aguardando análise.");
      setLocation(`/pedido/confirmacao?codigo=${encodeURIComponent(trackingCode)}&comprovante=1`);
    },
    onError: error => toast.error(error.message),
  });

  const pixKey = useMemo(() => {
    const receiving = payment.data?.receiving;
    return receiving?.pixKey || (receiving?.method === "pix" ? receiving.receivingKey : null);
  }, [payment.data?.receiving]);

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
    uploadReceipt.mutate({ trackingCode, dataUrl: receiptDataUrl, contentType: receiptFile.type as typeof allowedReceiptTypes[number], originalName: receiptFile.name });
  }

  if (!trackingCode) return <main className="access-page"><section className="access-card"><a href={withAppBase("/")} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Pedido não informado.</h1><p>Não foi possível identificar o pedido.</p></section></main>;
  if (payment.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] p-6 text-zinc-300"><Loader2 className="size-7 animate-spin text-emerald-300" /></main>;
  if (!payment.data) return <main className="access-page"><section className="access-card"><a href={withAppBase("/")} className="access-back"><ArrowLeft size={15} /> Voltar</a><h1>Pedido não encontrado.</h1><p>Confira o código recebido e tente novamente.</p></section></main>;

  const { application, paymentLinks } = payment.data;
  const sponsorName = payment.data.sponsor?.name || payment.data.sponsor?.profile?.slug || "responsável pela Página Lucrativa";
  const instructionsUrl = withAppBase(`/pedido/${encodeURIComponent(application.trackingCode ?? trackingCode)}/pagamento/instrucoes`);
  const trackingUrl = withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(application.trackingCode ?? trackingCode)}`);

  return <main className="min-h-screen bg-[#050505] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <a href={withAppBase("/")} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-200"><ArrowLeft size={15} /> Voltar para a Página Lucrativa</a>
      <header className="rounded-3xl border border-emerald-300/20 bg-zinc-950/80 p-5 shadow-2xl sm:p-7">
        <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Meios de pagamento</span>
        <h1 className="mt-3 text-3xl font-semibold text-white">Escolha como deseja pagar.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">Seu pedido foi criado. Agora escolha um dos meios habilitados pelo responsável pela Página Lucrativa.</p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          {pixKey ? <article className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5">
            <div className="flex items-start gap-3"><QrCode className="mt-1 size-5 shrink-0 text-emerald-300" /><div><h2 className="font-medium text-white">PIX</h2><p className="mt-1 text-sm leading-6 text-zinc-300">Use a chave PIX do responsável e depois envie o comprovante.</p></div></div>
            <button type="button" onClick={() => setPixModalOpen(true)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black sm:w-auto">Ver dados PIX <ArrowRight className="size-4" /></button>
          </article> : null}

          {paymentLinks.map(link => <article key={link.id} className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
            <div className="flex items-start gap-3"><CreditCard className="mt-1 size-5 shrink-0 text-emerald-300" /><div><h2 className="font-medium text-white">{link.label}</h2><p className="mt-1 text-sm leading-6 text-zinc-400">Checkout externo configurado pelo responsável.</p></div></div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a href={link.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black">Pagar com {link.label}</a>
            </div>
          </article>)}

          {!pixKey && !paymentLinks.length ? <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 text-sm leading-6 text-zinc-300">Nenhum meio de pagamento está habilitado para este responsável no momento.</article> : null}
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
          <div><span className="text-xs uppercase tracking-wider text-zinc-500">Código de acompanhamento</span><strong className="mt-1 block text-lg text-emerald-200">{application.trackingCode}</strong><button type="button" onClick={copyCode} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5"><Clipboard className="size-3.5" />Copiar código</button></div>
          <div className="border-t border-white/10 pt-4"><span className="text-xs uppercase tracking-wider text-zinc-500">Valor</span><strong className="mt-1 block text-2xl text-white">{formatCurrency(application.offerAmountCents)}</strong></div>
          <div className="border-t border-white/10 pt-4"><span className="text-xs uppercase tracking-wider text-zinc-500">Pagamento para</span><strong className="mt-1 block text-white">{sponsorName}</strong></div>
          <a href={trackingUrl} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/35 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10">Acompanhar meu pedido <ArrowRight className="size-4" /></a>
        </aside>
      </section>

      {pixModalOpen ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pix-payment-modal-title">
        <section className="max-h-[min(90dvh,720px)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-emerald-300/25 bg-zinc-950 p-5 shadow-2xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Pagamento via PIX</span><h2 id="pix-payment-modal-title" className="mt-2 text-2xl font-semibold text-white">Dados para pagamento</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Depois de realizar o PIX, envie o comprovante para análise. Isso não aprova o pagamento automaticamente.</p></div>
            <button type="button" onClick={() => setPixModalOpen(false)} aria-label="Fechar modal PIX" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"><X className="size-4" /></button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/25 p-4"><span className="text-xs uppercase tracking-wider text-zinc-500">Recebedor</span><strong className="mt-1 block text-white">{sponsorName}</strong></div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4"><span className="text-xs uppercase tracking-wider text-zinc-500">Valor</span><strong className="mt-1 block text-white">{formatCurrency(application.offerAmountCents)}</strong></div>
          </div>

          <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <span className="text-xs uppercase tracking-wider text-emerald-200">Chave PIX</span>
            <code className="mt-2 block break-all text-sm text-emerald-50">{pixKey}</code>
            <button type="button" onClick={copyPix} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 text-sm font-semibold text-emerald-50 hover:bg-emerald-300/10"><Clipboard className="size-4" />Copiar chave PIX</button>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
            <span className="text-sm font-medium text-white">Enviar comprovante</span>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Formatos aceitos: JPG, PNG, WEBP ou PDF até 5 MB.</p>
            <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm text-zinc-200 hover:border-emerald-300/40 hover:text-emerald-100">
              <UploadCloud className="size-4" />{receiptFile ? receiptFile.name : "Selecionar arquivo"}
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" disabled={uploadReceipt.isPending} onChange={handleReceiptFile} />
            </label>
            {receiptFile ? <p className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-200"><CheckCircle2 className="size-3.5" />Arquivo selecionado</p> : null}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setPixModalOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5">Fechar</button>
            <button type="button" onClick={submitReceipt} disabled={uploadReceipt.isPending || !receiptFile} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">{uploadReceipt.isPending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}{uploadReceipt.isPending ? "Enviando..." : "Confirmar envio"}</button>
          </div>
        </section>
      </div> : null}
    </section>
  </main>;
}
