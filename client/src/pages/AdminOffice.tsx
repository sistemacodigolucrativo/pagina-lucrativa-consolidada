import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@shared/dashboard";
import { BookOpenCheck, ClipboardList, FileText, LifeBuoy, Megaphone, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";

function attentionLabel(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export default function AdminOffice() {
  const [location] = useLocation();
  const overview = trpc.admin.overview.useQuery();
  const applications = trpc.admin.applications.useQuery();
  const content = trpc.admin.content.useQuery();
  const tickets = trpc.admin.tickets.useQuery();
  const contacts = trpc.admin.contacts.useQuery();
  const testimonials = trpc.admin.testimonials.useQuery();
  const data = overview.data;
  const currentPath = location.split("?")[0] || "/";
  const isKnownAdminPath = currentPath === "/admin" || adminMenu.some(item => item.path === currentPath);

  const pendingApplications = applications.data?.filter(application => application.status === "pending").length ?? data?.pendingApplicationCount ?? 0;
  const approvedApplications = applications.data?.filter(application => application.status === "approved" || application.paymentStatus === "confirmed").length ?? 0;
  const draftContent = content.data?.filter(item => item.status === "draft").length ?? 0;
  const publishedContent = content.data?.filter(item => item.status === "published").length ?? 0;
  const openTickets = tickets.data?.filter(ticket => ticket.status === "open").length ?? 0;
  const pendingTestimonials = testimonials.data?.filter(item => item.status === "pending").length ?? 0;
  const capturedContacts = contacts.data?.length ?? 0;

  if (!isKnownAdminPath) {
    return (
      <DashboardLayout menuItems={adminMenu} title="Administração">
        <div className="office-page admin-page">
          <section className="office-empty">
            <span className="office-empty-mark">PL</span>
            <h2>Módulo administrativo indisponível.</h2>
            <p>Este caminho não faz parte da navegação administrativa ativa.</p>
          </section>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <div className="office-page admin-page">
        <div className="office-intro">
          <div>
            <span className="office-eyebrow">Visão geral</span>
            <h1>Dashboard</h1>
            <p>Indicadores executivos e filas que exigem decisão administrativa.</p>
          </div>
        </div>

        {overview.isLoading ? (
          <div className="office-loading"><span>Carregando dashboard</span><i /><i /><i /></div>
        ) : overview.error ? (
          <section className="office-empty">
            <span className="office-empty-mark">PL</span>
            <h2>Área exclusiva da administração.</h2>
            <p>Esta rota só é liberada para contas com permissão administrativa no projeto.</p>
          </section>
        ) : (
          <>
            <section className="office-stat-grid office-overview-stats">
              <article><span>Total de membros</span><strong>{data?.memberCount ?? 0}</strong><small>Contas de membros cadastradas</small></article>
              <article><span>Pedidos pendentes</span><strong>{pendingApplications}</strong><small>Aguardando ação administrativa</small></article>
              <article><span>Pedidos aprovados</span><strong>{approvedApplications}</strong><small>Pagamentos ou pedidos confirmados</small></article>
              <article><span>Volume confirmado</span><strong>{formatCurrency(data?.grossVolumeCents ?? 0)}</strong><small>Base financeira registrada</small></article>
            </section>

            <section className="office-stat-grid office-overview-stats">
              <article><span>Contatos captados</span><strong>{capturedContacts}</strong><small>Registros da divulgação</small></article>
              <article><span>Tickets abertos</span><strong>{openTickets}</strong><small>Solicitações de suporte</small></article>
              <article><span>Depoimentos pendentes</span><strong>{pendingTestimonials}</strong><small>Aguardando revisão</small></article>
              <article><span>Conteúdos publicados</span><strong>{publishedContent}</strong><small>Publicações ativas para membros</small></article>
            </section>

            <section className="office-next">
              <div>
                <span className="office-eyebrow">Precisa de atenção</span>
                <h2>Filas administrativas abertas.</h2>
                <p>
                  {pendingApplications} {attentionLabel(pendingApplications, "pedido pendente", "pedidos pendentes")}, {openTickets} {attentionLabel(openTickets, "ticket aberto", "tickets abertos")}, {pendingTestimonials} {attentionLabel(pendingTestimonials, "depoimento em análise", "depoimentos em análise")} e {draftContent} {attentionLabel(draftContent, "rascunho", "rascunhos")}.
                </p>
              </div>
              <ClipboardList size={34} />
            </section>

            <section className="office-workspace">
              <article><UsersRound size={24} className="text-emerald-300" /><h2>Membros e rede</h2><p>Consulte vínculos de indicação criados pelo fluxo de adesão.</p><Link href="/admin/membros">Abrir módulo</Link></article>
              <article><ClipboardList size={24} className="text-emerald-300" /><h2>Pedidos</h2><p>Analise solicitações, comprovantes e retornos administrativos.</p><Link href="/admin/pedidos">Ver pedidos</Link></article>
              <article><LifeBuoy size={24} className="text-emerald-300" /><h2>Suporte</h2><p>Responda aos chamados enviados pelos membros.</p><Link href="/admin/suporte">Responder suporte</Link></article>
              <article><Megaphone size={24} className="text-emerald-300" /><h2>Divulgação</h2><p>Supervisione contatos captados pela Central de Divulgação.</p><Link href="/admin/divulgacao">Ver contatos</Link></article>
              <article><FileText size={24} className="text-emerald-300" /><h2>Publicações</h2><p>Publique materiais de divulgação, recursos, FAQ e comunicações.</p><Link href="/admin/publicacoes">Novo conteúdo</Link></article>
              <article><BookOpenCheck size={24} className="text-emerald-300" /><h2>Academia</h2><p>{data?.publishedCourseCount ?? 0} cursos publicados para os membros.</p><Link href="/admin/academia">Gerenciar cursos</Link></article>
            </section>

            <section className="office-list">
              <span className="office-eyebrow">Pedidos recentes</span>
              {applications.isLoading ? (
                <div className="office-loading"><span>Carregando pedidos</span><i /><i /><i /></div>
              ) : applications.data?.length ? (
                applications.data.slice(0, 8).map(application => (
                  <article key={application.id}>
                    <div className="min-w-0">
                      <span className="office-list-code">{application.trackingCode || application.status}</span>
                      <h3>{application.fullName}</h3>
                      <p>{application.email} · {application.whatsapp}</p>
                      <time className="office-list-mobile-date mt-2 block text-xs text-[var(--muted-strong)] sm:hidden">{new Date(application.createdAt).toLocaleDateString("pt-BR")}</time>
                    </div>
                    <time className="office-list-desktop-date hidden sm:block">{new Date(application.createdAt).toLocaleDateString("pt-BR")}</time>
                  </article>
                ))
              ) : (
                <article><div><span className="office-list-code">Sem pedidos</span><h3>Nenhuma solicitação registrada.</h3><p>Os pedidos enviados pelo formulário público aparecerão aqui.</p></div></article>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
