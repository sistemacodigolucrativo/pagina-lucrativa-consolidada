import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import {
  BookOpenCheck,
  ChartNoAxesCombined,
  ClipboardList,
  Download,
  Filter,
  FileText,
  LifeBuoy,
  MoreHorizontal,
  Star,
  UsersRound,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  isObsidianPreviewEnabled,
  obsidianPreviewActivities,
  obsidianPreviewAdminMetrics,
  obsidianPreviewMembers,
  obsidianPreviewTestimonials,
  obsidianPreviewTickets,
} from "@/lib/obsidianPreviewData";
import {
  LoadingPanel,
  MetricCard,
  ObsidianBadge,
  ObsidianCard,
  ObsidianProgressBars,
  PlaceholderFeatureCard,
  SectionHeader,
  StatePanel,
} from "@/components/dashboard/PanelPrimitives";

function attentionLabel(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export default function AdminOffice() {
  const [location, setLocation] = useLocation();
  const previewEnabled = isObsidianPreviewEnabled();
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
  const displayMemberCount = previewEnabled ? obsidianPreviewAdminMetrics.totalMembers : data?.memberCount ?? 0;
  const displayPublishedContent = previewEnabled ? "327" : publishedContent;
  const displayTotalContent = previewEnabled ? "412" : totalContent;
  const displayPublishedCourseCount = previewEnabled ? "23" : data?.publishedCourseCount ?? 0;
  const displayPublicationRate = previewEnabled ? obsidianPreviewAdminMetrics.conversion : `${publicationRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
  const displayOpenTickets = previewEnabled ? obsidianPreviewAdminMetrics.activeTickets : openTickets;
  const displayPendingTestimonials = previewEnabled ? "18" : pendingTestimonials;
  const displayDraftContent = previewEnabled ? "85" : draftContent;

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
            <div className="obsidian-action-row" aria-label="Ações visuais preservadas do template Obsidian">
              <button type="button" className="obsidian-button is-secondary" disabled title="Placeholder visual: filtros avançados">
                <Filter aria-hidden="true" />
                Filtros
              </button>
              <button type="button" className="obsidian-button is-primary" disabled title="Placeholder visual: exportação de relatório">
                <Download aria-hidden="true" />
                Relatório
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
            {previewEnabled ? (
              <section className="obsidian-preview-banner" aria-label="Modo de prévia Obsidian">
                <ObsidianBadge variant="info">Prévia Obsidian ativa</ObsidianBadge>
                <p>Dados temporários do template carregados apenas no frontend para validação visual. Banco e dados reais não foram alterados.</p>
                <a href="?obsidianPreview=0">Desativar prévia</a>
              </section>
            ) : null}

            <section className="office-stat-grid office-overview-stats">
              <MetricCard
                icon={UsersRound}
                label="Membros e rede"
                value={displayMemberCount}
                detail="Total de membros cadastrados"
                aria-label="Abrir Membros e Rede"
                onClick={() => openCard("/admin/membros")}
              />
              <MetricCard
                icon={FileText}
                label="Conteúdos publicados"
                value={displayPublishedContent}
                detail={`${displayTotalContent} conteúdos cadastrados`}
                ariaLabel="Abrir Publicações"
                onActivate={() => openCard("/admin/publicacoes")}
              />
              <MetricCard
                icon={BookOpenCheck}
                label="Cursos publicados"
                value={displayPublishedCourseCount}
                detail="Trilhas ativas para membros"
                ariaLabel="Abrir Academia"
                onActivate={() => openCard("/admin/academia")}
              />
              <MetricCard
                icon={ChartNoAxesCombined}
                label="Taxa de publicação"
                value={displayPublicationRate}
                detail="Publicados / conteúdos cadastrados"
                ariaLabel="Abrir Publicações"
                onActivate={() => openCard("/admin/publicacoes")}
              />
            </section>

            <section className="office-stat-grid office-overview-stats">
              <MetricCard
                icon={LifeBuoy}
                label="Tickets abertos"
                value={displayOpenTickets}
                detail="Solicitações de suporte"
                aria-label="Abrir Suporte"
                onClick={() => openCard("/admin/suporte")}
              />
              <MetricCard
                icon={ClipboardList}
                label="Depoimentos pendentes"
                value={displayPendingTestimonials}
                detail="Aguardando revisão administrativa"
                ariaLabel="Abrir Depoimentos"
                onActivate={() => openCard("/admin/relatos")}
              />
              <MetricCard
                icon={FileText}
                label="Rascunhos"
                value={displayDraftContent}
                detail="Conteúdos que exigem revisão"
                ariaLabel="Abrir Publicações em revisão"
                onActivate={() => openCard("/admin/publicacoes")}
              />
            </section>

            <section className="obsidian-dashboard-grid" aria-label="Blocos visuais Obsidian integrados ao painel administrativo">
              <ObsidianCard
                className="obsidian-card-wide"
                eyebrow="Análise visual"
                title="Crescimento de membros ativos"
                description="Estrutura visual preservada do template Obsidian. A série temporal fica pronta para receber métrica histórica real quando o backend expuser essa agregação."
              >
                <ObsidianProgressBars values={[40, 60, 45, 80, 55, 90, 75]} labels={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]} />
              </ObsidianCard>

              <ObsidianCard
                eyebrow="Log operacional"
                title="Atividades recentes"
                action={<button type="button" className="obsidian-icon-button" disabled aria-label="Mais ações"><MoreHorizontal aria-hidden="true" /></button>}
              >
                {previewEnabled ? (
                  <div className="obsidian-activity-list">
                    {obsidianPreviewActivities.map(activity => (
                      <article key={activity.id}>
                        <span className="obsidian-activity-dot" aria-hidden="true" />
                        <div>
                          <p><strong>{activity.user}</strong> · {activity.action}</p>
                          <time>{activity.time}</time>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : activities.isLoading ? (
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
                  <PlaceholderFeatureCard
                    icon={ClipboardList}
                    title="Sem atividade recente"
                    description="O componente de log do Obsidian foi preservado e exibirá eventos quando houver registros administrativos."
                    status="Aguardando dados"
                  />
                )}
              </ObsidianCard>
            </section>

            {previewEnabled ? (
              <section className="obsidian-preview-grid" aria-label="Dados temporários de população visual Obsidian">
                <ObsidianCard eyebrow="Arquivo X" title="Mocks de membros">
                  <div className="obsidian-preview-list">
                    {obsidianPreviewMembers.map(member => (
                      <article key={member.id}>
                        <div>
                          <strong>{member.name}</strong>
                          <span>{member.email}</span>
                        </div>
                        <ObsidianBadge variant={member.status === "Ativo" ? "success" : member.status === "Pendente" ? "warning" : "neutral"}>{member.status}</ObsidianBadge>
                        <small>{member.plan} · {member.progress}%</small>
                      </article>
                    ))}
                  </div>
                </ObsidianCard>

                <ObsidianCard eyebrow="Arquivo W" title="Tickets e depoimentos">
                  <div className="obsidian-preview-list">
                    {obsidianPreviewTickets.map(ticket => (
                      <article key={ticket.id}>
                        <div>
                          <strong>{ticket.subject}</strong>
                          <span>{ticket.user} · {ticket.time}</span>
                        </div>
                        <ObsidianBadge variant={ticket.priority === "Urgente" ? "danger" : ticket.priority === "Alta" ? "warning" : "neutral"}>{ticket.priority}</ObsidianBadge>
                      </article>
                    ))}
                    {obsidianPreviewTestimonials.map(testimonial => (
                      <article key={testimonial.id}>
                        <div>
                          <strong>{testimonial.user}</strong>
                          <span>{testimonial.content}</span>
                        </div>
                        <small><Star aria-hidden="true" /> {testimonial.rating}/5 · {testimonial.status}</small>
                      </article>
                    ))}
                  </div>
                </ObsidianCard>
              </section>
            ) : null}

            <section className="obsidian-placeholder-grid" aria-label="Placeholders preservados do template administrativo">
              <PlaceholderFeatureCard
                icon={Filter}
                title="Filtros avançados"
                description="Placeholder visual mantido. Nenhuma regra de negócio foi criada enquanto não houver backend próprio."
              />
              <PlaceholderFeatureCard
                icon={Download}
                title="Exportação de relatórios"
                description="Placeholder visual mantido para futura exportação administrativa, sem alteração nas APIs atuais."
              />
              <PlaceholderFeatureCard
                icon={ChartNoAxesCombined}
                title="Indicadores históricos"
                description="Área preparada para séries temporais reais sem substituir os indicadores já existentes."
              />
            </section>

            <section className="office-next">
              <div>
                <span className="office-eyebrow">Precisa de atenção</span>
                <h2>Filas administrativas abertas.</h2>
                <p>
                  {displayOpenTickets} {attentionLabel(openTickets, "ticket aberto", "tickets abertos")}, {displayPendingTestimonials} {attentionLabel(pendingTestimonials, "depoimento em análise", "depoimentos em análise")} e {displayDraftContent} {attentionLabel(draftContent, "rascunho", "rascunhos")}.
                </p>
                <div className="obsidian-status-row">
                  <ObsidianBadge variant={openTickets || previewEnabled ? "warning" : "success"}>{openTickets || previewEnabled ? "Suporte pendente" : "Suporte em dia"}</ObsidianBadge>
                  <ObsidianBadge variant={pendingTestimonials || previewEnabled ? "warning" : "success"}>{pendingTestimonials || previewEnabled ? "Moderação pendente" : "Moderação em dia"}</ObsidianBadge>
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
