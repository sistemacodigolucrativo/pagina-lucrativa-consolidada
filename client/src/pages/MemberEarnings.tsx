import { CircleDollarSign, ReceiptText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { formatCurrency } from "@shared/dashboard";

export default function MemberEarnings() {
  const finance = trpc.member.finance.useQuery();
  const data = finance.data;
  const confirmedEntries = data?.entries.filter(entry => entry.paymentStatus === "confirmed") ?? [];

  return <DashboardLayout menuItems={memberDashboardMenuItems} title="Ganhos e extrato" subtitle="Relatório das adesões atribuídas ao seu Código Lucrativo.">
    <div className="office-page">
      <section className="office-intro">
        <div>
          <span className="office-eyebrow">Relatório de adesões</span>
          <h1>Ganhos e extrato de adesões</h1>
          <p>Consulte as adesões atribuídas ao seu Código Lucrativo e os valores dos pagamentos que você confirmou diretamente com seus compradores. O pagamento ocorre diretamente entre comprador e patrocinador; o Código Lucrativo apenas registra o status da adesão.</p>
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
          </div>
          {confirmedEntries.length ? <div className="office-stack">{confirmedEntries.map(entry => <article className="office-card" key={entry.id}>
            <div className="office-card-head">
              <div>
                <h3>{entry.fullName}</h3>
                <p>{entry.whatsapp}</p>
              </div>
              <time className="text-sm text-zinc-400">{new Date(entry.updatedAt).toLocaleDateString("pt-BR")}</time>
            </div>
          </article>)}</div> : <div className="office-empty"><ReceiptText size={26} /><h2>Nenhuma adesão confirmada ainda.</h2><p>Quando um pagamento for confirmado, ele aparecerá automaticamente neste relatório.</p></div>}
        </section>
      </>}
    </div>
  </DashboardLayout>;
}
