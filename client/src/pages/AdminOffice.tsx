import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { BookOpenCheck, ClipboardList, FileText, LifeBuoy, Megaphone, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";

function attentionLabel(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export default function AdminOffice() {
  const [location] = useLocation();
  const overview = trpc.admin.overview.useQuery();
  const content = trpc.admin.content.useQuery();
  const tickets = trpc.admin.tickets.useQuery();
  const contacts = trpc.admin.contacts.useQuery();
  const testimonials = trpc.admin.testimonials.useQuery();
  const data = overview.data;
  const currentPath = location.split("?")[0] || "/";
  const isKnownAdminPath = currentPath === "/admin" || adminMenu.some(item => item.path === currentPath);

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
              <article><span>Conteúdos publicados</span><strong>{publishedContent}</strong><small>Publicações ativas para membros</small></article>
              <article><span>Cursos publicados</span><strong>{data?.publishedCourseCount ?? 0}</strong><small>Trilhas ativas para membros</small></article>
              <article><span>Contatos captados</span><strong>{capturedContacts}</strong><small>Registros da divulgação</small></article>
            </section>

            <section className="office-stat-grid office-overview-stats">
              <article><span>Tickets abertos</span><strong>{openTickets}</strong><small>Solicitações de suporte</small></article>
              <article><span>Depoimentos pendentes</span><strong>{pendingTestimonials}</strong><small>Aguardando revisão</small></article>
              <article><span>Rascunhos</span><strong>{draftContent}</strong><small>Conteúdos que exigem revisão</small></article>
            </section>

            <section className="office-next">
              <div>
                <span className="office-eyebrow">Precisa de atenção</span>
                <h2>Filas administrativas abertas.</h2>
                <p>
                  {openTickets} {attentionLabel(openTickets, "ticket aberto", "tickets abertos")}, {pendingTestimonials} {attentionLabel(pendingTestimonials, "depoimento em análise", "depoimentos em análise")} e {draftContent} {attentionLabel(draftContent, "rascunho", "rascunhos")}.
                </p>
              </div>
              <ClipboardList size={34} />
            </section>

            <section className="office-workspace">
              <article><UsersRound size={24} className="text-emerald-300" /><h2>Membros e rede</h2><p>Consulte vínculos de indicação criados pelo fluxo de adesão.</p><Link href="/admin/membros">Abrir módulo</Link></article>
              <article><LifeBuoy size={24} className="text-emerald-300" /><h2>Suporte</h2><p>Responda aos chamados enviados pelos membros.</p><Link href="/admin/suporte">Responder suporte</Link></article>
              <article><Megaphone size={24} className="text-emerald-300" /><h2>Divulgação</h2><p>Supervisione contatos captados pela Central de Divulgação.</p><Link href="/admin/divulgacao">Ver contatos</Link></article>
              <article><FileText size={24} className="text-emerald-300" /><h2>Publicações</h2><p>Publique materiais de divulgação, recursos, FAQ e comunicações.</p><Link href="/admin/publicacoes">Novo conteúdo</Link></article>
              <article><BookOpenCheck size={24} className="text-emerald-300" /><h2>Academia</h2><p>{data?.publishedCourseCount ?? 0} cursos publicados para os membros.</p><Link href="/admin/academia">Gerenciar cursos</Link></article>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
