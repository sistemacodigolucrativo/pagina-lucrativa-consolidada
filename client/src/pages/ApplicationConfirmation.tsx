import { ArrowRight, BadgeCheck, CheckCircle2, ChevronLeft, Clipboard, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { withAppBase } from "@/lib/devPath";
import ApplicationPayment from "./ApplicationPayment";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default function ApplicationConfirmation() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const code = params.get("codigo");
  const receiptSent = params.get("comprovante") === "1";
  const payment = trpc.applications.paymentPage.useQuery({ trackingCode: code ?? "" }, { enabled: Boolean(code && receiptSent), retry: false });

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    toast.success("Código de acompanhamento copiado.");
  }

  if (code && receiptSent) {
    const sponsorName = payment.data?.sponsor?.name || payment.data?.sponsor?.profile?.slug || "responsável pela Página Lucrativa";
    return <main className="access-page"><div className="access-card">
      <a href={withAppBase("/")} className="access-back"><ChevronLeft size={15} /> Voltar para a Página Lucrativa</a>
      <div className="access-seal"><CheckCircle2 size={25} /></div>
      <span className="office-eyebrow">Comprovante recebido</span>
      <h1>Seu comprovante foi enviado.</h1>
      <p>Recebemos seu comprovante. O pagamento via PIX ficou registrado como confirmação manual pendente e será analisado pelo responsável.</p>
      {payment.isLoading ? <p className="access-loading"><Loader2 className="inline size-4 animate-spin" /> Carregando dados do pedido...</p> : <section className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-left">
        <span className="text-xs uppercase tracking-[0.16em] text-emerald-200">Código de acompanhamento</span>
        <strong className="mt-2 block break-all text-xl text-white">{code}</strong>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-zinc-500">Valor</dt><dd className="mt-1 font-semibold text-white">{formatCurrency(payment.data?.application.offerAmountCents ?? 5000)}</dd></div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-zinc-500">Pago para</dt><dd className="mt-1 font-semibold text-white">{sponsorName}</dd></div>
        </dl>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={copyCode} className="btn btn-ghost"><Clipboard size={16} /> Copiar código</button>
          <a className="btn btn-primary" href={withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(code)}`)}>Acompanhar meu pedido <ArrowRight size={16} /></a>
        </div>
      </section>}
    </div></main>;
  }

  if (code) return <ApplicationPayment />;
  return <main className="access-page"><div className="access-card"><a href={withAppBase("/")} className="access-back"><ChevronLeft size={15} /> Voltar para a Página Lucrativa</a><div className="access-seal"><BadgeCheck size={25} /></div><span className="office-eyebrow">Solicitação registrada</span><h1>Seu pedido de ativação foi registrado.</h1><p>O próximo passo é acompanhar o retorno com as orientações reais sobre pagamento, liberação do acesso e personalização da sua estrutura digital.</p>{code && <p className="access-note">Código para acompanhamento: <strong>{code}</strong></p>}<div className="access-steps"><div><b>01</b><span>Solicitação registrada para acompanhamento.</span></div><div><b>02</b><span>Orientação sobre o pagamento e as condições da ativação.</span></div><div><b>03</b><span>Liberação das instruções de acesso e personalização.</span></div></div><div className="access-actions"><a className="btn btn-primary" href={withAppBase(`/pedido/acompanhar?codigo=${encodeURIComponent(code ?? "")}`)}>Acompanhar solicitação <ArrowRight size={16} /></a></div></div></main>;
}
