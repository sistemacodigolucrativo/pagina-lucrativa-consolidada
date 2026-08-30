import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { ClipboardList } from "lucide-react";
import { KeyboardEvent } from "react";
import { useLocation } from "wouter";

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

  const draftContent = content.data?.filter(item => item.status === "draft").length ?? 0;
  const publishedContent = content.data?.filter(item => item.status === "published").length ?? 0;
  const openTickets = tickets.data?.filter(ticket => ticket.status === "open").length ?? 0;
  const pendingTestimonials = testimonials.data?.filter(item => item.status === "pending").length ?? 0;

  const openCard = (path: string) => setLocation(path);
  const openCardWithKeyboard = (event: KeyboardEvent<HTMLElement>, path: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setLocation(path);
  };

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
              <article
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                aria-label="Abrir Membros e Rede"
                onClick={() => openCard("/admin/membros")}
                onKeyDown={event => openCardWithKeyboard(event, "/admin/membros")}
              >
                <span>Membros e rede</span><strong>{data?.memberCount ?? 0}</strong><small>Total de membros cadastrados</small>
              </article>
              <article
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                aria-label="Abrir Publicações"
                onClick={() => openCard("/admin/publicacoes")}
                onKeyDown={event => openCardWithKeyboard(event, "/admin/publicacoes")}
              >
                <span>Conteúdos publicados</span><strong>{publishedContent}</strong><small>Publicações ativas para membros</small>
              </article>
              <article
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                aria-label="Abrir Academia"
                onClick={() => openCard("/admin/academia")}
                onKeyDown={event => openCardWithKeyboard(event, "/admin/academia")}
              >
                <span>Cursos publicados</span><strong>{data?.publishedCourseCount ?? 0}</strong><small>Trilhas ativas para membros</small>
              </article>
              <article
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                aria-label="Abrir Depoimentos"
                onClick={() => openCard("/admin/relatos")}
                onKeyDown={event => openCardWithKeyboard(event, "/admin/relatos")}
              >
                <span>Depoimentos pendentes</span><strong>{pendingTestimonials}</strong><small>Aguardando revisão administrativa</small>
              </article>
            </section>

            <section className="office-stat-grid office-overview-stats">
              <article
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                aria-label="Abrir Suporte"
                onClick={() => openCard("/admin/suporte")}
                onKeyDown={event => openCardWithKeyboard(event, "/admin/suporte")}
              >
                <span>Tickets abertos</span><strong>{openTickets}</strong><small>Solicitações de suporte</small>
              </article>
              <article
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                aria-label="Abrir Publicações em revisão"
                onClick={() => openCard("/admin/publicacoes")}
                onKeyDown={event => openCardWithKeyboard(event, "/admin/publicacoes")}
              >
                <span>Rascunhos</span><strong>{draftContent}</strong><small>Conteúdos que exigem revisão</small>
              </article>
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
