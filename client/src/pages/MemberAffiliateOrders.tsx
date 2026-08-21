import DashboardLayout from "@/components/DashboardLayout";
import { withAppBase } from "@/lib/devPath";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { applicationPaymentStatusLabel } from "@shared/applications";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, ClipboardList, Link2, Loader2, ZoomIn, ZoomOut, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function MemberAffiliateOrders() {
  const utils = trpc.useUtils();
  const profile = trpc.member.profile.useQuery();
  const orders = trpc.member.affiliateApplications.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const detail = trpc.member.affiliateApplication.useQuery({ id: selectedId ?? 0 }, { enabled: Boolean(selectedId), retry: false });
  const review = trpc.member.reviewPaymentReceipt.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.member.affiliateApplications.invalidate(), utils.member.affiliateApplication.invalidate(), utils.member.notifications.invalidate()]);
      toast.success("Pedido atualizado.");
      setModalOpen(false);
      setViewerOpen(false);
    },
    onError: error => toast.error(error.message),
  });

  const personalLink = profile.data?.slug ? `${window.location.origin}/?afiliado=${encodeURIComponent(profile.data.slug)}` : null;
  const selectedReceipt = useMemo(() => detail.data?.receipts.find(receipt => receipt.status === "pending") ?? detail.data?.receipts[0] ?? null, [detail.data?.receipts]);
  const application = detail.data?.application ?? null;

  function openOrder(applicationId: number) {
    setSelectedId(applicationId);
    setViewerOpen(false);
    setImageZoom(1);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setViewerOpen(false);
    setImageZoom(1);
  }

  return <DashboardLayout menuItems={memberDashboardMenuItems} title="Escritório Virtual"><main className="mx-auto w-full max-w-5xl space-y-7 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[.16em] text-emerald-300">Pedidos da operação</span><h1 className="text-3xl font-semibold text-white">Solicitações atribuídas</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Clique em um pedido para conferir o comprovante e aceitar ou recusar o pagamento.</p></header>

    <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5"><div className="flex items-start gap-3"><Link2 className="mt-0.5 size-5 shrink-0 text-emerald-300" /><div><h2 className="font-medium text-white">Seu link pessoal</h2>{personalLink ? <><code className="mt-2 block break-all rounded-lg bg-black/40 p-3 text-sm text-emerald-100">{personalLink}</code><p className="mt-2 text-sm text-zinc-300">Pedidos enviados por esse endereço podem ser atribuídos ao seu Escritório Virtual para acompanhamento.</p></> : <p className="mt-2 text-sm text-zinc-300">Defina seu identificador em <a href={withAppBase("/membros/configuracoes")} className="text-emerald-200 underline">Editar perfil</a> para ativar o link pessoal.</p>}</div></div></section>

    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-white"><ClipboardList className="size-5 text-emerald-300" /><h2 className="font-medium">Pedidos</h2></div><span className="text-xs uppercase tracking-wider text-zinc-500">{orders.data?.length ?? 0} pedidos</span></div>
      {orders.isLoading ? <p className="rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-400">Carregando pedidos...</p> : orders.data?.length ? <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/50">{orders.data.map(order => <button type="button" key={order.id} onClick={() => openOrder(order.id)} className="grid w-full gap-1 border-b border-white/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.03] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <span className="min-w-0"><strong className="block truncate text-sm text-white">{order.fullName}</strong><span className="block truncate text-xs text-zinc-400">{order.email}</span></span>
        <span className="flex flex-wrap items-center gap-2 text-xs"><code className="text-emerald-200 underline decoration-emerald-300/40 underline-offset-4">{order.trackingCode}</code><span className="rounded-full border border-emerald-300/25 px-2 py-0.5 text-emerald-100">{applicationPaymentStatusLabel[order.paymentStatus]}</span></span>
      </button>)}</div> : <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-5 text-sm leading-6 text-zinc-300"><p className="font-medium text-white">Ainda não há solicitações atribuídas ao seu link.</p><p className="mt-1 text-zinc-400">Quando uma pessoa enviar um pedido pelo endereço acima, ele aparecerá aqui.</p></div>}
    </section>

    {modalOpen ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="receipt-review-modal-title">
      <section className="flex max-h-[min(82dvh,32rem)] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-emerald-300/25 bg-zinc-950 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:w-full sm:max-w-lg">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 p-2.5 sm:p-4">
          <div className="min-w-0"><span className="text-[9px] uppercase tracking-[.14em] text-emerald-300 sm:text-[10px] sm:tracking-[.16em]">Análise do pedido</span><h2 id="receipt-review-modal-title" className="mt-0.5 truncate text-sm font-semibold text-white sm:mt-1 sm:text-xl">{application?.trackingCode ?? "Pedido"}</h2></div>
          <button type="button" onClick={closeModal} aria-label="Fechar análise" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white sm:size-9">×</button>
        </div>
        {detail.isLoading ? <div className="flex min-h-40 items-center gap-2 p-4 text-sm text-zinc-400"><Loader2 className="size-4 animate-spin" />Carregando pedido...</div> : !application ? <p className="p-4 text-sm text-zinc-400">Pedido não encontrado.</p> : <>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5 sm:space-y-3 sm:p-4">
          <section className="rounded-xl border border-white/10 bg-black/25 p-2 sm:rounded-2xl sm:p-3">
            <h3 className="text-center text-sm font-medium text-white sm:text-base">Comprovante</h3>
            {selectedReceipt ? <div className="mt-2 space-y-2">
              {selectedReceipt.contentType.startsWith("image/") ? <div className="grid justify-items-center gap-2">
                <button type="button" onClick={() => { setViewerOpen(true); setImageZoom(1); }} className="inline-flex min-h-9 items-center justify-center rounded-full bg-orange-400 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-black shadow-lg shadow-orange-400/20 transition hover:bg-orange-300">Visualizar</button>
                <button type="button" onClick={() => { setViewerOpen(true); setImageZoom(1); }} className="group flex size-[4.5rem] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/35 p-1 transition hover:border-orange-300/60 sm:size-32 sm:rounded-xl sm:p-1.5" aria-label="Ampliar comprovante">
                  <img src={selectedReceipt.fileUrl} alt="Miniatura do comprovante" className="max-h-full max-w-full rounded-lg object-contain shadow-lg transition group-hover:scale-[1.04]" />
                </button>
              </div> : <div className="grid justify-items-center gap-2">
                <a href={selectedReceipt.fileUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center justify-center rounded-full bg-orange-400 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-black shadow-lg shadow-orange-400/20 transition hover:bg-orange-300">Visualizar</a>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">Arquivo enviado em PDF.</div>
              </div>}
            </div> : <p className="mt-2 text-sm text-zinc-400">Nenhum comprovante enviado ainda.</p>}
          </section>

          {selectedReceipt?.status === "rejected" ? <p className="rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-50">Pedido recusado. Ele ficará visível por até 48 horas após a recusa e depois sairá automaticamente desta lista.</p> : null}
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-1.5 border-t border-white/10 bg-zinc-950 p-2 sm:gap-2 sm:p-3">
          <button type="button" disabled={review.isPending || !selectedReceipt || selectedReceipt.status !== "pending"} onClick={() => selectedReceipt && review.mutate({ applicationId: application.id, receiptId: selectedReceipt.id, status: "approved" })} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-emerald-300 px-1.5 py-1.5 text-[11px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:gap-1.5 sm:px-2 sm:py-2 sm:text-sm"><CheckCircle2 className="size-3.5 sm:size-4" />Aceitar</button>
          <button type="button" disabled={review.isPending || !selectedReceipt || selectedReceipt.status !== "pending"} onClick={() => selectedReceipt && review.mutate({ applicationId: application.id, receiptId: selectedReceipt.id, status: "rejected" })} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-red-300/40 px-1.5 py-1.5 text-[11px] font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:gap-1.5 sm:px-2 sm:py-2 sm:text-sm"><XCircle className="size-3.5 sm:size-4" />Recusar</button>
        </div>
        </>}
      </section>
      {viewerOpen && selectedReceipt?.contentType.startsWith("image/") ? <div className="fixed inset-0 z-[110] flex flex-col bg-black/95 text-white" role="dialog" aria-modal="true" aria-label="Visualizar comprovante ampliado">
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-3 py-2 sm:px-5">
          <button type="button" onClick={() => setViewerOpen(false)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10"><ArrowLeft className="size-4" />Voltar</button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setImageZoom(value => Math.max(0.75, Number((value - 0.25).toFixed(2))))} className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/10" aria-label="Diminuir zoom"><ZoomOut className="size-4" /></button>
            <span className="min-w-14 text-center text-xs text-zinc-300">{Math.round(imageZoom * 100)}%</span>
            <button type="button" onClick={() => setImageZoom(value => Math.min(3, Number((value + 0.25).toFixed(2))))} className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/10" aria-label="Aumentar zoom"><ZoomIn className="size-4" /></button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-3 sm:p-6">
          <div className="grid min-h-full place-items-center">
            <img src={selectedReceipt.fileUrl} alt={selectedReceipt.originalName || "Comprovante ampliado"} style={{ transform: `scale(${imageZoom})` }} className="max-h-[calc(100dvh-7rem)] max-w-full origin-center rounded-xl object-contain transition-transform" />
          </div>
        </div>
      </div> : null}
    </div> : null}
  </main></DashboardLayout>;
}
