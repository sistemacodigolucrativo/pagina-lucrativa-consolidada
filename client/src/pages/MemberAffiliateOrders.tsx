import DashboardLayout from "@/components/DashboardLayout";
import { withAppBase } from "@/lib/devPath";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { applicationPaymentStatusLabel } from "@shared/applications";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, ClipboardList, ExternalLink, Link2, Loader2, ZoomIn, ZoomOut, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function MemberAffiliateOrders() {
  const utils = trpc.useUtils();
  const profile = trpc.member.profile.useQuery();
  const orders = trpc.member.affiliateApplications.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const detail = trpc.member.affiliateApplication.useQuery({ id: selectedId ?? 0 }, { enabled: Boolean(selectedId), retry: false });
  const review = trpc.member.reviewPaymentReceipt.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.member.affiliateApplications.invalidate(), utils.member.affiliateApplication.invalidate(), utils.member.notifications.invalidate()]);
      toast.success("Pedido atualizado.");
      setModalOpen(false);
      setDetailsOpen(false);
      setViewerOpen(false);
    },
    onError: error => toast.error(error.message),
  });

  const personalLink = profile.data?.slug ? `${window.location.origin}/?afiliado=${encodeURIComponent(profile.data.slug)}` : null;
  const selectedReceipt = useMemo(() => detail.data?.receipts.find(receipt => receipt.status === "pending") ?? detail.data?.receipts[0] ?? null, [detail.data?.receipts]);
  const application = detail.data?.application ?? null;

  function openOrder(applicationId: number) {
    setSelectedId(applicationId);
    setDetailsOpen(false);
    setViewerOpen(false);
    setImageZoom(1);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setDetailsOpen(false);
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

    {modalOpen ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="receipt-review-modal-title">
      <section className="max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-emerald-300/25 bg-zinc-950 p-4 shadow-2xl sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div><span className="text-xs uppercase tracking-[.16em] text-emerald-300">Análise do pedido</span><h2 id="receipt-review-modal-title" className="mt-1 text-xl font-semibold text-white">{application?.trackingCode ?? "Pedido"}</h2></div>
          <button type="button" onClick={closeModal} aria-label="Fechar análise" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white">×</button>
        </div>
        {detail.isLoading ? <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="size-4 animate-spin" />Carregando pedido...</div> : !application ? <p className="mt-6 text-sm text-zinc-400">Pedido não encontrado.</p> : <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-3"><h3 className="font-medium text-white">Comprovante</h3>{selectedReceipt?.contentType.startsWith("image/") ? <span className="text-[11px] text-zinc-500">Clique na miniatura para ampliar</span> : null}</div>
            {selectedReceipt ? <div className="mt-3 space-y-3">
              {selectedReceipt.contentType.startsWith("image/") ? <button type="button" onClick={() => { setViewerOpen(true); setImageZoom(1); }} className="group grid w-full place-items-center rounded-xl border border-white/10 bg-black/35 p-3 transition hover:border-emerald-300/40" aria-label="Ampliar comprovante">
                <img src={selectedReceipt.fileUrl} alt={selectedReceipt.originalName || "Comprovante enviado"} className="h-36 max-w-full rounded-lg object-contain shadow-lg transition group-hover:scale-[1.02] sm:h-44" />
              </button> : <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">Comprovante em PDF ou arquivo não visualizável diretamente.</div>}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><div><p className="text-white">{selectedReceipt.originalName || "Comprovante enviado"}</p><p className="text-xs text-zinc-500">{new Date(selectedReceipt.createdAt).toLocaleString("pt-BR")} · {selectedReceipt.contentType}</p></div><a href={selectedReceipt.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-200 underline">Abrir arquivo <ExternalLink className="size-3.5" /></a></div>
            </div> : <p className="mt-2 text-sm text-zinc-400">Nenhum comprovante enviado ainda.</p>}
          </section>

          {detailsOpen ? <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-xs text-zinc-500">Nome</dt><dd className="mt-1 text-white">{application.fullName}</dd></div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-xs text-zinc-500">E-mail</dt><dd className="mt-1 break-all text-white">{application.email}</dd></div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-xs text-zinc-500">WhatsApp</dt><dd className="mt-1 text-white">{application.whatsapp}</dd></div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-xs text-zinc-500">Status</dt><dd className="mt-1 text-white">{applicationPaymentStatusLabel[application.paymentStatus]}</dd></div>
          </dl> : null}

          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" disabled={review.isPending || !selectedReceipt || selectedReceipt.status !== "pending"} onClick={() => selectedReceipt && review.mutate({ applicationId: application.id, receiptId: selectedReceipt.id, status: "approved" })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 className="size-4" />Aceitar</button>
            <button type="button" onClick={() => setDetailsOpen(value => !value)} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5">Detalhes do pedido</button>
            <button type="button" disabled={review.isPending || !selectedReceipt || selectedReceipt.status !== "pending"} onClick={() => selectedReceipt && review.mutate({ applicationId: application.id, receiptId: selectedReceipt.id, status: "rejected" })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-60"><XCircle className="size-4" />Recusar</button>
          </div>
          {selectedReceipt?.status === "rejected" ? <p className="rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-50">Pedido recusado. Ele ficará visível por até 48 horas após a recusa e depois sairá automaticamente desta lista.</p> : null}
        </div>}
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
