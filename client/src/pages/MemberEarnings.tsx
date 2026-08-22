import { CircleDollarSign, ClipboardList, ReceiptText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { formatCurrency } from "@shared/dashboard";
import { applicationPaymentStatusLabel } from "@shared/applications";

export default function MemberEarnings() {
  const finance = trpc.member.finance.useQuery();
  const data = finance.data;

  return <DashboardLayout menuItems={memberDashboardMenuItems} title="Ganhos e extrato" subtitle="Relatório das adesões atribuídas à sua Página Lucrativa.">
    <div className="office-page">
      <section className="office-intro">
        <div>
          <span className="office-eyebrow">Relatório de adesões</span>
          <h1>Ganhos e extrato de adesões</h1>
          <p>Consulte as adesões atribuídas à sua Página Lucrativa e os valores dos pagamentos que você confirmou diretamente com seus compradores. O pagamento ocorre diretamente entre comprador e patrocinador; a Página Lucrativa apenas registra o status da adesão.</p>
        </div>
      </section>

      {finance.isLoading ? <div className="office-loading"><span>Carregando relatório</span><i /><i /><i /></div> : finance.error ? <section className="office-empty"><CircleDollarSign size={26} /><h2>Não foi possível carregar seu relatório.</h2><p>{finance.error.message}</p></section> : <>
        <section className="office-stat-grid">
          <article><span>Adesões confirmadas</span><strong>{data?.confirmedCount ?? 0}</strong><small>Pedidos com pagamento confirmado</small></article>
          <article><span>Valor das adesões confirmadas</span><strong>{formatCurrency(data?.confirmedValueCents ?? 0)}</strong><small>Valor informativo dos pagamentos diretos</small></article>
          <article><span>Aguardando análise</span><strong>{data?.awaitingReviewCount ?? 0}</strong><small>Comprovantes pendentes de conferência</small></article>
        </section>

        <section className="office-section">
          <div className="office-section-head">
            <div><span className="office-eyebrow">Histórico de adesões</span><h2>Pedidos atribuídos à sua página</h2></div>
            <a className="office-action" href={withAppBase("/membros/meus-pedidos")}>Ver pedidos<ClipboardList size={16} /></a>
          </div>
          {data?.entries.length ? <div className="office-stack">{data.entries.map(entry => <article className="office-card" key={entry.id}>
            <div className="office-card-head">
              <div>
                <span className="office-list-code">{entry.trackingCode ?? `Pedido #${entry.id}`}</span>
                <h3>{entry.trackingCode ?? `Pedido #${entry.id}`} · {entry.fullName}</h3>
                <p>{applicationPaymentStatusLabel[entry.paymentStatus]} · {new Date(entry.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className={entry.paymentStatus === "confirmed" ? "finance-positive" : "text-zinc-300"}>
                {formatCurrency(entry.offerAmountCents)}
                <time>{new Date(entry.createdAt).toLocaleDateString("pt-BR")}</time>
              </div>
            </div>
          </article>)}</div> : <div className="office-empty"><ReceiptText size={26} /><h2>Nenhuma adesão atribuída ainda.</h2><p>Quando um pedido for atribuído à sua Página Lucrativa, ele aparecerá automaticamente neste relatório. Você não precisa registrar vendas manualmente.</p></div>}
        </section>
      </>}
    </div>
  </DashboardLayout>;
}
