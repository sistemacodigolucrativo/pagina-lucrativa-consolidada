import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import {
  BookOpenCheck,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  LifeBuoy,
  UsersRound,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  LoadingPanel,
  MetricCard,
  SectionHeader,
  StatePanel,
} from "@/components/dashboard/PanelPrimitives";

function attentionLabel(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export default function AdminOffice() {
  const [location, setLocation] = useLocation();
  const overview = trpc.admin.overview.useQuery();
  const content = trpc.admin.content.useQuery();
  const tickets = trpc.admin.tickets.useQuery();
  const testimonials = trpc.admin.testimonials.useQuery();
  const data = overview.data;
  const currentPath = location.split("?")[0] || "/";
  const isKnownAdminPath = currentPath === "/admin" || adminMenu.some(item => item.path === currentPath);

  const contentItems = content.data;
  const ticketItems = tickets.data;
  const testimonialItems = testimonials.data;
  const draftContent = contentItems?.filter(item => item.status === "draft").length ?? 0;
  const publishedContent = contentItems?.filter(item => item.status === "published").length ?? 0;
  const totalContent = contentItems?.length ?? 0;
  const publicationRate = totalContent > 0 ? (publishedContent / totalContent) * 100 : 0;
  const openTickets = ticketItems?.filter(ticket => ticket.status === "open").length ?? 0;
  const pendingTestimonials = testimonialItems?.filter(item => item.status === "pending").length ?? 0;

  const openCard = (path: string) => setLocation(path);

  if (!isKnownAdminPath) {
    return (
      <DashboardLayout menuItems={adminMenu} title="Administração">
        <div className="office-page admin-page">
          <StatePanel title="Módulo administrativo indisponível." message="Este caminho não faz parte da navegação administrativa ativa." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <div className="office-page admin-page">
        <SectionHeader
          eyebrow="Console administrativo"
          title="Cockpit executivo"
          detail="Indicadores reais do sistema, conteúdo publicado e filas que exigem decisão administrativa."
        />

        {overview.isLoading ? (
          <LoadingPanel label="Carregando dashboard" />
        ) : overview.error ? (
          <StatePanel error title="Área exclusiva da administração." message="Esta rota só é liberada para contas com permissão administrativa no projeto." />
        ) : (
          <>
            <section className="office-stat-grid office-overview-stats">
              <MetricCard
                icon={UsersRound}
                label="Membros e rede"
                value={data?.memberCount ?? 0}
                detail="Total de membros cadastrados"
                aria-label="Abrir Membros e Rede"
                onClick={() => openCard("/admin/membros")}
              />
              <MetricCard
                icon={FileText}
                label="Conteúdos publicados"
                value={publishedContent}
                detail={`${totalContent} conteúdos cadastrados`}
                ariaLabel="Abrir Publicações"
                onActivate={() => openCard("/admin/publicacoes")}
              />
              <MetricCard
                icon={BookOpenCheck}
                label="Cursos publicados"
                value={data?.publishedCourseCount ?? 0}
                detail="Trilhas ativas para membros"
                ariaLabel="Abrir Academia"
                onActivate={() => openCard("/admin/academia")}
              />
              <MetricCard
                icon={ChartNoAxesCombined}
                label="Taxa de publicação"
                value={`${publicationRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}
                detail="Publicados / conteúdos cadastrados"
                ariaLabel="Abrir Publicações"
                onActivate={() => openCard("/admin/publicacoes")}
              />
            </section>

            <section className="office-stat-grid office-overview-stats">
              <MetricCard
                icon={LifeBuoy}
                label="Tickets abertos"
                value={openTickets}
                detail="Solicitações de suporte"
                aria-label="Abrir Suporte"
                onClick={() => openCard("/admin/suporte")}
              />
              <MetricCard
                icon={ClipboardList}
                label="Depoimentos pendentes"
                value={pendingTestimonials}
                detail="Aguardando revisão administrativa"
                ariaLabel="Abrir Depoimentos"
                onActivate={() => openCard("/admin/relatos")}
              />
              <MetricCard
                icon={FileText}
                label="Rascunhos"
                value={draftContent}
                detail="Conteúdos que exigem revisão"
                ariaLabel="Abrir Publicações em revisão"
                onActivate={() => openCard("/admin/publicacoes")}
              />
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
