import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import {
  applicationActivationStatusLabel,
  applicationPaymentStatusLabel,
  applicationStatusLabel,
} from "@shared/applications";
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, ExternalLink, RefreshCcw, Search, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ApplicationPaymentStatus = keyof typeof applicationPaymentStatusLabel;
type ApplicationStatus = keyof typeof applicationStatusLabel;
type ApplicationActivationStatus = keyof typeof applicationActivationStatusLabel;
type ReceiptStatus = "pending" | "approved" | "rejected";

type OrderItem = {
  id: number;
  fullName: string;
  email: string;
  whatsapp: string;
  trackingCode: string | null;
  ownerUserId: number | null;
  affiliateSlug: string | null;
  status: ApplicationStatus;
  paymentStatus: ApplicationPaymentStatus;
  activationStatus: ApplicationActivationStatus;
  offerAmountCents: number;
  selectedPaymentMethod: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  sponsorName: string | null;
  sponsorEmail: string | null;
  sponsorSlug: string | null;
  receiptCount: number;
  latestReceiptId: number | null;
  latestReceiptStatus: ReceiptStatus | null;
  latestReceiptUrl: string | null;
  latestReceiptCreatedAt: string | null;
};

type OrderDetail = OrderItem & {
  receipts: Array<{
    id: number;
    applicationId: number;
    ownerUserId: number;
    fileUrl: string;
    contentType: string;
    originalName: string | null;
    fileSize: number;
    status: ReceiptStatus;
    createdAt: string;
    reviewedAt: string | null;
    reviewedBy: number | null;
  }>;
  accessTokens: Array<{
    id: number;
    publicCode: string;
    status: "active" | "revoked" | "used";
    accessCount: number;
    lastAccessAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    createdBy: number;
  }>;
};

type OrdersResponse = {
  items: OrderItem[];
  totals: {
    total: number;
    awaitingPayment: number;
    receiptReceived: number;
    confirmed: number;
    rejected: number;
    orphaned: number;
    confirmedCents: number;
    pendingCents: number;
  };
  generatedAt: string;
};

const paymentStatusOptions: Array<"all" | ApplicationPaymentStatus> = ["all", "awaiting_payment", "receipt_received", "confirmed", "rejected"];
const ORDERS_PER_PAGE = 10;

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR") : "Sem data";
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(withAppBase(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    let message = "Falha ao acessar o backoffice administrativo.";
    try {
      const body = await response.json();
      if (typeof body?.error === "string") message = body.error;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export default function AdminOrders() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"all" | ApplicationPaymentStatus>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showOrderQueue, setShowOrderQueue] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
      if (query.trim()) params.set("q", query.trim());
      const suffix = params.toString() ? "?" + params.toString() : "";
      setData(await fetchJson<OrdersResponse>("/api/admin/orders" + suffix));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(orderId: number) {
    setSelectedId(orderId);
    setDetailLoading(true);
    try {
      setDetail(await fetchJson<OrderDetail>("/api/admin/orders/" + orderId));
    } catch (loadError) {
      toast.error(loadError instanceof Error ? loadError.message : "Falha ao carregar pedido.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function reviewReceipt(status: "approved" | "rejected") {
    const receipt = detail?.receipts.find(item => item.status === "pending");
    if (!detail || !receipt) return;
    setActionLoading(true);
    try {
      await fetchJson("/api/admin/orders/" + detail.id + "/receipts/" + receipt.id + "/review", {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      toast.success(status === "approved" ? "Comprovante aprovado e acesso liberado." : "Comprovante recusado.");
      await Promise.all([loadOrders(), loadDetail(detail.id)]);
    } catch (reviewError) {
      toast.error(reviewError instanceof Error ? reviewError.message : "Falha ao analisar comprovante.");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, [paymentStatus]);

  const visibleItems = useMemo(() => data?.items ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / ORDERS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const firstItem = (currentPage - 1) * ORDERS_PER_PAGE;
    return visibleItems.slice(firstItem, firstItem + ORDERS_PER_PAGE);
  }, [currentPage, visibleItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [paymentStatus, query]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Campanhas comerciais</span>
          <h1 className="text-3xl font-semibold text-white">Pedidos</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Audite pedidos, afiliado responsavel, comprovantes enviados e status de liberacao de acesso.</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button type="button" onClick={() => setPaymentStatus("awaiting_payment")} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-left">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Aguardando pagamento</span>
            <strong className="mt-1 block text-2xl text-white">{data?.totals.awaitingPayment ?? 0}</strong>
          </button>
          <button type="button" onClick={() => { setPaymentStatus("receipt_received"); setShowOrderQueue(true); }} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-left">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Comprovantes recebidos</span>
            <strong className="mt-1 block text-2xl text-white">{data?.totals.receiptReceived ?? 0}</strong>
          </button>
          <button type="button" onClick={() => { setPaymentStatus("confirmed"); setShowOrderQueue(true); }} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-left">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Confirmados</span>
            <strong className="mt-1 block text-2xl text-white">{data?.totals.confirmed ?? 0}</strong>
          </button>
          <button type="button" onClick={() => { setPaymentStatus("all"); setShowOrderQueue(true); }} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-left">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Pedidos sem afiliado</span>
            <strong className="mt-1 block text-2xl text-white">{data?.totals.orphaned ?? 0}</strong>
          </button>
        </section>

        {!showOrderQueue ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-500">Fila administrativa</span>
                <h2 className="mt-1 text-xl font-semibold text-white">A lista completa fica recolhida por padrão.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Abra a fila somente quando for revisar pedidos, buscar cadastros ou auditar comprovantes.</p>
              </div>
              <button type="button" onClick={() => setShowOrderQueue(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.98]">
                <ClipboardList className="size-4" />
                Exibir fila de pedidos
              </button>
            </div>
          </section>
        ) : <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-white">
              <ClipboardList className="size-5 text-emerald-300" />
              <h2 className="font-medium">Fila de pedidos</h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative block w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-500" />
                <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void loadOrders(); }} placeholder="Buscar nome, email, WhatsApp ou codigo" className="h-10 w-full rounded-lg border border-white/15 bg-black pl-9 pr-3 text-sm text-white" />
              </label>
              <select value={paymentStatus} onChange={event => setPaymentStatus(event.target.value as "all" | ApplicationPaymentStatus)} className="h-10 rounded-lg border border-white/15 bg-black px-3 text-sm text-white">
                {paymentStatusOptions.map(status => <option key={status} value={status}>{status === "all" ? "Todos os status" : applicationPaymentStatusLabel[status]}</option>)}
              </select>
              <button type="button" onClick={() => void loadOrders()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-sm text-white"><RefreshCcw className="size-4" />Atualizar</button>
              <button type="button" onClick={() => setShowOrderQueue(false)} className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 px-3 text-sm text-zinc-200">Recolher fila</button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400">Carregando pedidos...</p>
          ) : error ? (
            <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">{error}</p>
          ) : visibleItems.length ? (
            <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="py-3 pr-4">Pedido</th>
                    <th className="py-3 pr-4">Afiliado</th>
                    <th className="py-3 pr-4">Pagamento</th>
                    <th className="py-3 pr-4">Comprovante</th>
                    <th className="py-3 pr-4">Criado em</th>
                    <th className="py-3 pr-4">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedItems.map(item => (
                    <tr key={item.id} className="align-top">
                      <td className="py-4 pr-4">
                        <strong className="block text-white">{item.fullName}</strong>
                        <span className="block text-zinc-400">{item.email}</span>
                        <span className="block text-xs text-zinc-500">{item.trackingCode ?? "Sem codigo"}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={item.ownerUserId ? "text-zinc-200" : "text-red-200"}>{item.sponsorName ?? item.affiliateSlug ?? "Sem apresentador"}</span>
                        <span className="block text-xs text-zinc-500">{item.sponsorSlug ?? item.sponsorEmail ?? "Sem vinculo"}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-zinc-200">{applicationPaymentStatusLabel[item.paymentStatus]}</span>
                        <span className="block text-xs text-zinc-500">{formatMoney(item.offerAmountCents)}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-zinc-200">{item.latestReceiptStatus ?? "Sem comprovante"}</span>
                        <span className="block text-xs text-zinc-500">{item.receiptCount} arquivo(s)</span>
                      </td>
                      <td className="py-4 pr-4 text-zinc-400">{formatDate(item.createdAt)}</td>
                      <td className="py-4 pr-4">
                        <button type="button" onClick={() => void loadDetail(item.id)} className="rounded-lg border border-emerald-300/30 px-3 py-2 text-xs font-medium text-emerald-100">Auditar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Exibindo {paginatedItems.length} de {visibleItems.length} pedido(s). Página {currentPage} de {totalPages}.</span>
              <div className="flex gap-2">
                <button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} className="inline-flex h-10 items-center gap-1 rounded-lg border border-white/15 px-3 text-zinc-200 disabled:cursor-not-allowed disabled:opacity-45"><ChevronLeft className="size-4" />Anterior</button>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} className="inline-flex h-10 items-center gap-1 rounded-lg border border-white/15 px-3 text-zinc-200 disabled:cursor-not-allowed disabled:opacity-45">Próxima<ChevronRight className="size-4" /></button>
              </div>
            </div>
            </>
          ) : (
            <p className="rounded-xl border border-white/10 p-4 text-sm text-zinc-400">Nenhum pedido encontrado para o filtro atual.</p>
          )}
        </section>}

        {selectedId ? (
          <section className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/78 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Auditoria do pedido">
            <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl sm:p-6">
            {detailLoading || !detail ? (
              <p className="text-sm text-zinc-400">Carregando auditoria do pedido...</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-300">Pedido #{detail.id}</span>
                    <h2 className="mt-1 text-2xl font-semibold text-white">{detail.fullName}</h2>
                    <p className="text-sm text-zinc-400">{detail.email} · {detail.whatsapp}</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedId(null); setDetail(null); }} className="inline-flex size-10 items-center justify-center rounded-lg border border-white/15 text-zinc-200" aria-label="Fechar auditoria"><X className="size-4" /></button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <article className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <span className="text-xs uppercase tracking-wider text-zinc-500">Status comercial</span>
                    <strong className="mt-1 block text-white">{applicationStatusLabel[detail.status]}</strong>
                  </article>
                  <article className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <span className="text-xs uppercase tracking-wider text-zinc-500">Pagamento</span>
                    <strong className="mt-1 block text-white">{applicationPaymentStatusLabel[detail.paymentStatus]}</strong>
                  </article>
                  <article className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <span className="text-xs uppercase tracking-wider text-zinc-500">Acesso</span>
                    <strong className="mt-1 block text-white">{applicationActivationStatusLabel[detail.activationStatus]}</strong>
                  </article>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <h3 className="font-medium text-white">Comprovantes</h3>
                  <div className="mt-3 space-y-3">
                    {detail.receipts.length ? detail.receipts.map(receipt => (
                      <article key={receipt.id} className="flex flex-col gap-3 rounded-lg border border-white/10 p-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <strong className="text-white">{receipt.originalName ?? "Comprovante #" + receipt.id}</strong>
                          <span className="block text-xs text-zinc-500">{receipt.status} · {formatDate(receipt.createdAt)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a href={withAppBase(receipt.fileUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs text-zinc-100"><ExternalLink className="size-4" />Abrir arquivo</a>
                          {receipt.status === "pending" ? (
                            <>
                              <button type="button" disabled={actionLoading} onClick={() => void reviewReceipt("approved")} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/40 px-3 py-2 text-xs text-emerald-100 disabled:opacity-50"><CheckCircle2 className="size-4" />Aprovar</button>
                              <button type="button" disabled={actionLoading} onClick={() => void reviewReceipt("rejected")} className="inline-flex items-center gap-1 rounded-lg border border-red-300/40 px-3 py-2 text-xs text-red-100 disabled:opacity-50"><XCircle className="size-4" />Recusar</button>
                            </>
                          ) : null}
                        </div>
                      </article>
                    )) : <p className="text-sm text-zinc-400">Nenhum comprovante enviado.</p>}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <h3 className="font-medium text-white">Vinculo e token</h3>
                  <p className="mt-2 text-sm text-zinc-300">Afiliado: {detail.sponsorName ?? detail.affiliateSlug ?? "Sem apresentador"} · slug {detail.sponsorSlug ?? "indisponivel"}</p>
                  <p className="text-sm text-zinc-400">Tokens de personalizacao emitidos: {detail.accessTokens.length}</p>
                </div>
              </div>
            )}
            </div>
          </section>
        ) : null}
      </main>
    </DashboardLayout>
  );
}
