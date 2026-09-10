import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { CircleDollarSign, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

type FinanceResponse = {
  summary: {
    total: number;
    awaitingPayment: number;
    receiptReceived: number;
    confirmed: number;
    rejected: number;
    orphaned: number;
    confirmedCents: number;
    pendingCents: number;
    transactionCount: number;
    postedTransactionCents: number;
    pendingTransactionCents: number;
    voidTransactionCents: number;
  };
  byMember: Array<{
    userId: number;
    memberName: string | null;
    memberEmail: string | null;
    memberSlug: string | null;
    confirmedOrders: number;
    confirmedCents: number;
    pendingOrders: number;
    pendingCents: number;
    rejectedOrders: number;
    orphanedOrders: number;
  }>;
  transactions: Array<{
    id: number;
    userId: number;
    type: "sale" | "commission" | "adjustment" | "withdrawal";
    description: string;
    amountCents: number;
    status: "pending" | "posted" | "void";
    adminNote: string | null;
    occurredAt: string;
    createdAt: string;
    memberName: string | null;
    memberEmail: string | null;
    memberSlug: string | null;
  }>;
  generatedAt: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

async function loadFinance() {
  const response = await fetch(withAppBase("/api/admin/finance"), { credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : "Falha ao carregar financeiro.");
  }
  return response.json() as Promise<FinanceResponse>;
}

export default function AdminFinance() {
  const [data, setData] = useState<FinanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setData(await loadFinance());
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Falha ao carregar financeiro.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Operação comercial</span>
            <h1 className="text-3xl font-semibold text-white">Financeiro</h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300">Conferencia financeira baseada em pedidos reais, comprovantes confirmados e transacoes registradas.</p>
          </div>
          <button type="button" onClick={() => void refresh()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-sm text-white"><RefreshCcw className="size-4" />Atualizar</button>
        </header>

        {loading ? (
          <p className="text-sm text-zinc-400">Carregando financeiro...</p>
        ) : error ? (
          <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">{error}</p>
        ) : data ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-400">Receita confirmada</span>
                <strong className="mt-1 block text-2xl text-white">{formatMoney(data.summary.confirmedCents)}</strong>
                <span className="text-xs text-zinc-500">{data.summary.confirmed} pedido(s)</span>
              </article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-400">Valor pendente</span>
                <strong className="mt-1 block text-2xl text-white">{formatMoney(data.summary.pendingCents)}</strong>
                <span className="text-xs text-zinc-500">{data.summary.awaitingPayment + data.summary.receiptReceived} pedido(s)</span>
              </article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-400">Transacoes lancadas</span>
                <strong className="mt-1 block text-2xl text-white">{formatMoney(data.summary.postedTransactionCents)}</strong>
                <span className="text-xs text-zinc-500">{data.summary.transactionCount} registro(s)</span>
              </article>
              <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-400">Pedidos sem afiliado</span>
                <strong className="mt-1 block text-2xl text-white">{data.summary.orphaned}</strong>
                <span className="text-xs text-zinc-500">exigem saneamento operacional</span>
              </article>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2 text-white"><CircleDollarSign className="size-5 text-emerald-300" /><h2 className="font-medium">Resultado por membro</h2></div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="py-3 pr-4">Membro</th>
                      <th className="py-3 pr-4">Confirmado</th>
                      <th className="py-3 pr-4">Pendente</th>
                      <th className="py-3 pr-4">Recusado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {data.byMember.map(item => (
                      <tr key={item.userId} className="align-top">
                        <td className="py-4 pr-4">
                          <strong className="block text-white">{item.memberName ?? "Sem apresentador"}</strong>
                          <span className="block text-xs text-zinc-500">{item.memberSlug ?? item.memberEmail ?? "Sem slug"}</span>
                        </td>
                        <td className="py-4 pr-4 text-zinc-200">{formatMoney(item.confirmedCents)}<span className="block text-xs text-zinc-500">{item.confirmedOrders} pedido(s)</span></td>
                        <td className="py-4 pr-4 text-zinc-200">{formatMoney(item.pendingCents)}<span className="block text-xs text-zinc-500">{item.pendingOrders} pedido(s)</span></td>
                        <td className="py-4 pr-4 text-zinc-400">{item.rejectedOrders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
              <h2 className="font-medium text-white">Transacoes administrativas</h2>
              <div className="mt-4 space-y-3">
                {data.transactions.length ? data.transactions.map(item => (
                  <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <strong className="text-white">{item.description}</strong>
                      <span className="text-sm text-zinc-300">{formatMoney(item.amountCents)}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{item.memberName ?? item.memberSlug ?? "Membro sem perfil"} · {item.type} · {item.status}</p>
                  </article>
                )) : <p className="text-sm text-zinc-400">Nenhuma transacao registrada. O financeiro atual usa principalmente pedidos em applications.</p>}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </DashboardLayout>
  );
}
