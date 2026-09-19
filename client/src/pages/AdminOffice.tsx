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
  ObsidianBadge,
  ObsidianCard,
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
  const activities = trpc.admin.activities.useQuery(undefined, { enabled: isKnownAdminPath });

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
          action={
            <div className="obsidian-action-row" aria-label="Atalhos administrativos reais">
              <button type="button" className="obsidian-button is-secondary" onClick={() => openCard("/admin/publicacoes")}>
                <FileText aria-hidden="true" />
                Publicações
              </button>
              <button type="button" className="obsidian-button is-primary" onClick={() => openCard("/admin/academia")}>
                <BookOpenCheck aria-hidden="true" />
                Academia
              </button>
            </div>
          }
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
                ariaLabel="Abrir Rascunhos"
                onActivate={() => openCard("/admin/publicacoes/rascunhos")}
              />
            </section>

            <section className="obsidian-dashboard-grid" aria-label="Blocos visuais Obsidian integrados ao painel administrativo">
              <ObsidianCard
                className="obsidian-card-wide"
                eyebrow="Panorama real"
                title="Conteúdo em campanha"
                description="Resumo calculado a partir das consultas administrativas atuais, sem série temporal simulada."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <button type="button" onClick={() => openCard("/admin/publicacoes")} className="rounded-xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-emerald-300/40">
                    <span className="text-xs uppercase tracking-wider text-zinc-500">Publicados</span>
                    <strong className="mt-2 block text-2xl text-white">{publishedContent}</strong>
                  </button>
                  <button type="button" onClick={() => openCard("/admin/publicacoes/rascunhos")} className="rounded-xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-emerald-300/40">
                    <span className="text-xs uppercase tracking-wider text-zinc-500">Rascunhos</span>
                    <strong className="mt-2 block text-2xl text-white">{draftContent}</strong>
                  </button>
                  <button type="button" onClick={() => openCard("/admin/academia")} className="rounded-xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-emerald-300/40">
                    <span className="text-xs uppercase tracking-wider text-zinc-500">Cursos</span>
                    <strong className="mt-2 block text-2xl text-white">{data?.publishedCourseCount ?? 0}</strong>
                  </button>
                </div>
              </ObsidianCard>

              <ObsidianCard
                eyebrow="Log operacional"
                title="Atividades recentes"
              >
                {activities.isLoading ? (
                  <p className="obsidian-muted">Carregando atividades...</p>
                ) : activities.data?.length ? (
                  <div className="obsidian-activity-list">
                    {activities.data.slice(0, 5).map(activity => (
                      <article key={activity.id}>
                        <span className="obsidian-activity-dot" aria-hidden="true" />
                        <div>
                          <p>{activity.description}</p>
                          <time>{new Date(activity.createdAt).toLocaleString("pt-BR")}</time>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="obsidian-muted">Nenhuma atividade recente registrada.</p>
                )}
              </ObsidianCard>
            </section>


            <section className="office-next">
              <div>
                <span className="office-eyebrow">Precisa de atenção</span>
                <h2>Filas administrativas abertas.</h2>
                <p>
                  {openTickets} {attentionLabel(openTickets, "ticket aberto", "tickets abertos")}, {pendingTestimonials} {attentionLabel(pendingTestimonials, "depoimento em análise", "depoimentos em análise")} e {draftContent} {attentionLabel(draftContent, "rascunho", "rascunhos")}.
                </p>
                <div className="obsidian-status-row">
                  <ObsidianBadge variant={openTickets ? "warning" : "success"}>{openTickets ? "Suporte pendente" : "Suporte em dia"}</ObsidianBadge>
                  <ObsidianBadge variant={pendingTestimonials ? "warning" : "success"}>{pendingTestimonials ? "Moderação pendente" : "Moderação em dia"}</ObsidianBadge>
                </div>
              </div>
              <ClipboardList size={34} />
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
