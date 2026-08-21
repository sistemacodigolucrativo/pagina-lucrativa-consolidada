import DashboardLayout from "@/components/DashboardLayout";
import { withAppBase } from "@/lib/devPath";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { applicationActivationStatusLabel, applicationPaymentStatusLabel, applicationStatusLabel } from "@shared/applications";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ClipboardList, ExternalLink, Link2, Loader2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function MemberAffiliateOrders() {
  const utils = trpc.useUtils();
  const profile = trpc.member.profile.useQuery();
  const orders = trpc.member.affiliateApplications.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedOrderId = selectedId ?? orders.data?.[0]?.id ?? null;
  const detail = trpc.member.affiliateApplication.useQuery({ id: selectedOrderId ?? 0 }, { enabled: Boolean(selectedOrderId), retry: false });
  const review = trpc.member.reviewPaymentReceipt.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.member.affiliateApplications.invalidate(), utils.member.affiliateApplication.invalidate(), utils.member.notifications.invalidate()]);
      toast.success("Pedido atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  const personalLink = profile.data?.slug ? `${window.location.origin}/?afiliado=${encodeURIComponent(profile.data.slug)}` : null;
  const selectedReceipt = useMemo(() => detail.data?.receipts.find(receipt => receipt.status === "pending") ?? detail.data?.receipts[0] ?? null, [detail.data?.receipts]);
  const application = detail.data?.application ?? null;

  return <DashboardLayout menuItems={memberDashboardMenuItems} title="Escritório Virtual"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[.16em] text-emerald-300">Pedidos da operação</span><h1 className="text-3xl font-semibold text-white">Solicitações atribuídas</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Acompanhe solicitações originadas pelo seu link, confira comprovantes e libere a personalização quando o pagamento for aprovado.</p></header>

    <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5"><div className="flex items-start gap-3"><Link2 className="mt-0.5 size-5 shrink-0 text-emerald-300" /><div><h2 className="font-medium text-white">Seu link pessoal</h2>{personalLink ? <><code className="mt-2 block break-all rounded-lg bg-black/40 p-3 text-sm text-emerald-100">{personalLink}</code><p className="mt-2 text-sm text-zinc-300">Pedidos enviados por esse endereço podem ser atribuídos ao seu Escritório Virtual para acompanhamento.</p></> : <p className="mt-2 text-sm text-zinc-300">Defina seu identificador em <a href={withAppBase("/membros/configuracoes")} className="text-emerald-200 underline">Editar perfil</a> para ativar o link pessoal.</p>}</div></div></section>

    <section className="grid gap-6 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5"><div className="flex items-center gap-2 text-white"><ClipboardList className="size-5 text-emerald-300" /><h2 className="font-medium">Pedidos</h2></div><span className="text-xs uppercase tracking-wider text-zinc-500">{orders.data?.length ?? 0} pedidos</span></div>
        {orders.isLoading ? <p className="p-5 text-sm text-zinc-400">Carregando pedidos...</p> : orders.data?.length ? <div className="divide-y divide-white/10">{orders.data.map(order => <button type="button" key={order.id} onClick={() => setSelectedId(order.id)} className={`block w-full p-5 text-left transition hover:bg-white/[0.03] ${selectedOrderId === order.id ? "bg-emerald-300/10" : ""}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium text-white">{order.trackingCode}</p><p className="mt-1 text-sm text-zinc-400">{order.fullName} · {new Date(order.createdAt).toLocaleString("pt-BR")}</p></div><span className="rounded-full border border-emerald-300/30 px-2.5 py-1 text-xs text-emerald-100">{applicationPaymentStatusLabel[order.paymentStatus]}</span></div><p className="mt-2 text-xs text-zinc-500">{applicationStatusLabel[order.status]} · {applicationActivationStatusLabel[order.activationStatus]}</p></button>)}</div> : <div className="p-7 text-sm leading-6 text-zinc-300"><p className="font-medium text-white">Ainda não há solicitações atribuídas ao seu link.</p><p className="mt-1 text-zinc-400">Quando uma pessoa enviar um pedido pelo endereço acima, ele aparecerá aqui.</p></div>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
        {!selectedOrderId ? <p className="text-sm text-zinc-400">Selecione um pedido para visualizar os detalhes.</p> : detail.isLoading ? <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="size-4 animate-spin" />Carregando detalhe...</div> : !application ? <p className="text-sm text-zinc-400">Pedido não encontrado.</p> : <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs uppercase tracking-[.16em] text-emerald-300">Detalhe do pedido</span><h2 className="mt-1 text-2xl font-semibold text-white">{application.trackingCode}</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-200">{applicationPaymentStatusLabel[application.paymentStatus]}</span></div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-xs text-zinc-500">Nome</dt><dd className="mt-1 text-white">{application.fullName}</dd></div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-xs text-zinc-500">E-mail</dt><dd className="mt-1 break-all text-white">{application.email}</dd></div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-xs text-zinc-500">WhatsApp</dt><dd className="mt-1 text-white">{application.whatsapp}</dd></div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-3"><dt className="text-xs text-zinc-500">Acesso</dt><dd className="mt-1 text-white">{applicationActivationStatusLabel[application.activationStatus]}</dd></div>
          </dl>

          <section className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="font-medium text-white">Comprovantes</h3>
            {detail.data?.receipts.length ? <div className="mt-3 space-y-3">{detail.data.receipts.map(receipt => <article key={receipt.id} className="rounded-lg border border-white/10 bg-black/25 p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-white">{receipt.originalName || "Comprovante enviado"}</p><p className="text-xs text-zinc-500">{new Date(receipt.createdAt).toLocaleString("pt-BR")} · {receipt.contentType}</p></div><strong className="text-emerald-200">{receipt.status === "pending" ? "Em análise" : receipt.status === "approved" ? "Aprovado" : "Rejeitado"}</strong></div><a href={receipt.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-200 underline">Abrir comprovante <ExternalLink className="size-3.5" /></a></article>)}</div> : <p className="mt-2 text-sm text-zinc-400">Nenhum comprovante enviado ainda.</p>}
          </section>

          {selectedReceipt ? <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" disabled={review.isPending || selectedReceipt.status !== "pending"} onClick={() => review.mutate({ applicationId: application.id, receiptId: selectedReceipt.id, status: "approved" })} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 className="size-4" />Aprovar pagamento</button>
            <button type="button" disabled={review.isPending || selectedReceipt.status !== "pending"} onClick={() => review.mutate({ applicationId: application.id, receiptId: selectedReceipt.id, status: "rejected" })} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-60"><XCircle className="size-4" />Rejeitar pagamento</button>
          </div> : null}
          {application.paymentStatus === "confirmed" ? <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50">Pagamento aprovado. A personalização já está liberada na página pública de acompanhamento do comprador.</div> : null}
        </div>}
      </div>
    </section>
  </main></DashboardLayout>;
}
