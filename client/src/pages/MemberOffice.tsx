import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { formatCurrency } from "@shared/dashboard";
import { ChevronRight, Copy, CircleDollarSign, Link2, MousePointerClick, Percent, UsersRound } from "lucide-react";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const menuItems: DashboardMenuItem[] = memberDashboardMenuItems;
const overviewOnboardingStorageBase = "pagina-lucrativa.member-office-onboarding.dismissed";
const overviewOnboardingSteps = [
  "01 — Complete seu perfil e seus dados de conta.",
  "02 — Configure suas preferências de recebimento.",
  "03 — Personalize sua página e sua apresentação.",
  "04 — Entenda a oferta e como os pedidos são atribuídos.",
  "05 — Aprenda a divulgar na Academia e na biblioteca.",
  "06 — Crie seu primeiro link ou campanha.",
  "07 — Comece a divulgar para o público adequado.",
  "08 — Acompanhe visitas, contatos e pedidos registrados.",
];

const moduleDetails: Record<string, { eyebrow: string; title: string; detail: string; notes: string[] }> = {
  "/membros/fazer-depoimento": { eyebrow: "Relato autêntico", title: "Compartilhe sua experiência", detail: "Este espaço deve receber apenas um relato próprio, verdadeiro e verificável do membro autenticado.", notes: ["Não publique opiniões em nome de terceiros.", "Imagens de pessoas ou comprovantes exigem autorização do titular antes da publicação."] },
  "/membros/meus-dados": { eyebrow: "Conta", title: "Meus dados", detail: "Confira e mantenha atualizadas as informações necessárias à operação da sua página.", notes: ["Dados de contato e recebimento ficam protegidos na sua conta.", "Evite inserir informações sensíveis em campos de divulgação."] },
  "/membros/como-divulgar": { eyebrow: "Comece por aqui", title: "Saiba como divulgar", detail: "Use seu link de divulgação, explique a proposta com clareza e acompanhe a origem das visitas.", notes: ["Crie uma campanha para cada canal que você deseja medir.", "Prefira materiais autorizados e uma promessa comercial transparente."] },
  "/membros/emails-site": { eyebrow: "Captação", title: "E-mails site e materiais", detail: "Centralize mensagens e materiais que ajudam a orientar visitantes interessados.", notes: ["Os contatos aparecerão aqui quando existirem dados próprios e autorizados.", "Use títulos objetivos e conteúdo de apoio útil."] },
  "/membros/emails-interessados": { eyebrow: "Captação", title: "E-mails de interessados", detail: "Acompanhe os contatos que demonstraram interesse, respeitando consentimento e privacidade.", notes: ["Nenhum contato de terceiros foi importado da referência.", "A lista será alimentada somente por captações da sua operação."] },
  "/membros/emails-whatsapp": { eyebrow: "Captação", title: "E-mails capturados WhatsApp", detail: "Organize os registros de interesse captados por canais de mensagem que tenham consentimento.", notes: ["Use uma linguagem de autorização clara antes de salvar dados.", "Evite transferir dados de outras plataformas sem base legal."] },
  "/membros/patrocinador": { eyebrow: "Rede", title: "Meu patrocinador", detail: "Consulte aqui a relação de suporte da sua rede quando ela estiver cadastrada para sua conta.", notes: ["Dados de outras pessoas não são exibidos nesta prévia.", "A conexão será mostrada apenas para o membro autorizado."] },
  "/membros/blog": { eyebrow: "Material de divulgação", title: "Material de divulgação", detail: "Acesse materiais prontos para apoiar a divulgação do Código Lucrativo.", notes: ["Use banners, textos, descrições e conteúdos promocionais liberados pela administração.", "A Biblioteca de Recursos continua separada para ferramentas e arquivos externos."] },
  "/membros/classificados": { eyebrow: "Vitrine", title: "Classificados", detail: "Organize oportunidades e materiais comerciais próprios em uma vitrine única.", notes: ["Cadastre somente ofertas que você tem autorização para divulgar.", "Não apresente resultados ou avaliações não verificáveis."] },
  "/membros/historico": { eyebrow: "Análise", title: "Histórico de visitas", detail: "Acompanhe a evolução de visitas e origens quando sua operação começar a receber tráfego.", notes: ["As métricas serão exibidas a partir de dados próprios.", "Use campanhas identificadas para comparar canais."] },
  "/membros/perguntas-frequentes": { eyebrow: "Suporte", title: "Perguntas frequentes", detail: "Encontre orientações para as dúvidas mais comuns sobre página, divulgação e acesso.", notes: ["Use o suporte quando uma dúvida envolver sua conta.", "Não compartilhe senha ou dados financeiros em chats públicos."] },
  "/membros/convites": { eyebrow: "Crescimento em rede", title: "Convide amigos", detail: "Compartilhe sua página de divulgação com pessoas que tenham interesse legítimo em conhecer a proposta.", notes: ["Convites devem apontar para o seu link de campanha.", "Acompanhe os resultados sem expor dados de convidados."] },
  "/membros/cartao-certificado": { eyebrow: "Reconhecimento", title: "Cartão e certificado", detail: "Guarde os materiais de identificação e certificados liberados para a sua conta.", notes: ["Arquivos aparecerão após publicação pela administração.", "Use apenas certificados associados à sua própria conta."] },
  "/membros/artigos": { eyebrow: "Material de divulgação", title: "Material de divulgação", detail: "Encontre imagens, banners, textos, copies e outros conteúdos preparados para suas divulgações.", notes: ["Use esta área para conteúdos promocionais prontos.", "Ferramentas, automações e links externos ficam na Biblioteca de Recursos."] },
  "/membros/automacoes": { eyebrow: "Comunicação assistida", title: "Preparar comunicações", detail: "Organize uma mensagem e registre o canal que você pretende utilizar com contatos consentidos.", notes: ["O módulo registra o preparo, mas não realiza envios externos automáticos.", "Use somente contatos próprios e autorizações verificáveis."] },
  "/membros/top-visitas": { eyebrow: "Análise", title: "Top 10 visitas", detail: "Quando houver atividade suficiente, esta área mostrará os conteúdos e campanhas de maior alcance da sua operação.", notes: ["O ranking será calculado com dados próprios.", "Dados de outros membros não são exibidos."] },
  "/membros/bonus": { eyebrow: "Biblioteca de Recursos", title: "Biblioteca de Recursos", detail: "Consulte recursos adicionais liberados pela administração para apoiar sua divulgação e rotina.", notes: ["Os itens publicados aparecem conforme liberação administrativa.", "Use cada recurso de acordo com sua licença e finalidade."] },
  "/membros/pontos-niveis": { eyebrow: "Evolução", title: "Tabela de pontos e níveis", detail: "Entenda os critérios de evolução quando o programa de pontos estiver ativo.", notes: ["Os critérios serão publicados de forma transparente.", "A pontuação será calculada a partir de registros próprios."] },
  "/membros/mais-lucrativos": { eyebrow: "Evolução", title: "Usuários mais lucrativos", detail: "Esta visão só deve ser habilitada com métricas agregadas e autorização adequada.", notes: ["A prévia não exibe nomes, ganhos ou rankings de terceiros.", "Privacidade e transparência são requisitos para qualquer ranking."] },
};

function SectionIntro({ eyebrow, title, detail, action, actionHref }: { eyebrow: string; title: string; detail: string; action?: string; actionHref?: string }) {
  return <div className="office-intro"><div><span className="office-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{detail}</p></div>{action && actionHref && <a className="office-action" href={actionHref}>{action}<ChevronRight size={16} /></a>}</div>;
}

function LoadingPanel() {
  return <div className="office-loading"><span>Carregando seu escritório</span><i /><i /><i /></div>;
}

function QueryState({ title, message }: { title: string; message: string }) {
  return <section className="office-empty"><span className="office-empty-mark">PL</span><h2>{title}</h2><p>{message}</p></section>;
}

function ModulePanel({ detail }: { detail: { eyebrow: string; title: string; detail: string; notes: string[] } }) {
  return <><SectionIntro eyebrow={detail.eyebrow} title={detail.title} detail={detail.detail} /><section className="office-guidance"><span className="office-guidance-mark">PL</span><div><span className="office-eyebrow">Orientação operacional</span><h2>Conteúdo preparado para a sua operação.</h2><p>O módulo reproduz a navegação e a finalidade observadas na referência, mas não replica dados privados nem conteúdo atribuído a terceiros.</p><ul>{detail.notes.map(note => <li key={note}>{note}</li>)}</ul></div></section></>;
}

function OverviewOnboardingModal({ open, onDismiss }: { open: boolean; onDismiss: () => void }) {
  if (!open) return null;

  return <div className="office-onboarding-backdrop" role="presentation">
    <section className="office-onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="office-onboarding-title">
      <div className="office-onboarding-content">
        <section className="office-onboarding-guidance">
          <span className="office-guidance-mark">PL</span>
          <div>
            <span className="office-eyebrow">Jornada de primeiros passos</span>
            <h3 id="office-onboarding-title">Ative a estrutura por etapas.</h3>
            <p>Você não precisa abrir todos os módulos de uma vez. Siga uma sequência simples e avance conforme sua operação estiver pronta.</p>
            <ul>
              {overviewOnboardingSteps.map(step => <li key={step}>{step}</li>)}
            </ul>
          </div>
        </section>
      </div>
      <div className="office-onboarding-actions">
        <a className="office-action" href={withAppBase("/membros/como-divulgar")}>Comece por aqui<ChevronRight size={16} /></a>
        <button type="button" className="office-onboarding-dismiss" onClick={onDismiss}>Dispensar</button>
      </div>
    </section>
  </div>;
}

export default function MemberOffice() {
  const [location] = useLocation();
  const currentPath = location.split("?")[0] || "/";
  const forceTour = location.includes("tour=1") || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tour") === "1");
  const auth = useAuth();
  const needsOverview = ["/membros", "/membros/ganhos", "/membros/configuracoes"].includes(currentPath);
  const overview = trpc.member.overview.useQuery(undefined, { enabled: needsOverview });
  const analytics = trpc.member.analytics.useQuery({ period: "all" }, { enabled: currentPath === "/membros" });
  const referrals = trpc.member.referrals.useQuery(undefined, { enabled: currentPath === "/membros" });
  const campaigns = trpc.member.campaigns.useQuery(undefined, { enabled: currentPath === "/membros/campanhas" });
  const academy = trpc.member.academy.useQuery(undefined, { enabled: currentPath === "/membros/academia" });
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const onboardingStorageKey = useMemo(() => auth.user?.id ? `${overviewOnboardingStorageBase}.${auth.user.id}` : overviewOnboardingStorageBase, [auth.user?.id]);

  useEffect(() => {
    if (currentPath !== "/membros" || !auth.user) {
      setOnboardingOpen(false);
      return;
    }
    setOnboardingOpen(forceTour || localStorage.getItem(onboardingStorageKey) !== "1");
  }, [auth.user, currentPath, forceTour, onboardingStorageKey]);

  useEffect(() => {
    if (!onboardingOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [onboardingOpen]);

  const dismissOnboarding = () => {
    localStorage.setItem(onboardingStorageKey, "1");
    setOnboardingOpen(false);
  };

  const buildAffiliateLink = (slug: string) => {
    const basePath = withAppBase(`/?afiliado=${encodeURIComponent(slug)}`);
    return typeof window === "undefined" ? basePath : `${window.location.origin}${basePath}`;
  };

  const copyAffiliateLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success("Link de indicação copiado.");
  };

  const renderBody = () => {
    if (needsOverview && overview.isLoading) return <LoadingPanel />;
    if (needsOverview && overview.isError) return <QueryState title="Não foi possível carregar a visão geral." message="Atualize a página para tentar novamente. Nenhum indicador foi apresentado como zero enquanto a consulta estava indisponível." />;
    const data = overview.data;

    if (currentPath === "/membros/campanhas" && campaigns.isLoading) return <LoadingPanel />;
    if (currentPath === "/membros/campanhas" && campaigns.isError) return <QueryState title="Não foi possível carregar as campanhas." message="Atualize a página para tentar novamente. Nenhum estado vazio foi assumido enquanto a consulta estava indisponível." />;
    if (currentPath === "/membros/campanhas") return <><SectionIntro eyebrow="Captação" title="Links & campanhas" detail="Centralize seus links, acompanhe interesse e organize a origem de cada oportunidade." action="Criar campanha" actionHref="/membros/campanhas" />{campaigns.data?.length ? <div className="office-list">{campaigns.data.map(link => <article key={link.id}><div><span className="office-list-code">{link.slug}</span><h3>{link.name}</h3><p>{link.destinationUrl}</p></div><div className="office-list-metric"><strong>{link.clicks}</strong><span>cliques</span></div><button className="office-icon-button" type="button" aria-label={`Copiar link ${link.name}`}><Copy size={16} /></button></article>)}</div> : <section className="office-empty"><span className="office-empty-mark">PL</span><h2>Seu primeiro link começa aqui.</h2><p>Crie um link de campanha para medir interesse sem perder o contexto da sua divulgação.</p></section>}</>;
    if (currentPath === "/membros/ganhos") {
      const confirmedApplications = data?.recentApplications?.filter(application => application.paymentStatus === "confirmed") ?? [];
      return <><SectionIntro eyebrow="Relatório de adesões" title="Ganhos e extrato de adesões" detail="Acompanhe os pagamentos confirmados atribuídos ao seu Código Lucrativo." /><div className="office-balance"><span>Valor das adesões confirmadas</span><strong>{formatCurrency(data?.confirmedApplicationValueCents ?? 0)}</strong><p>Valor informativo dos pagamentos confirmados diretamente entre comprador e patrocinador. A plataforma não mantém saldo interno nem processa saques.</p></div>{confirmedApplications.length ? <div className="office-list">{confirmedApplications.map(application => <article key={application.id}><div><h3>{application.fullName}</h3><p>{application.whatsapp}</p></div><time className="text-sm text-zinc-400">{new Date(application.updatedAt).toLocaleDateString("pt-BR")}</time></article>)}</div> : <section className="office-empty"><span className="office-empty-mark">PL</span><h2>Sem adesões confirmadas por enquanto.</h2><p>Quando um pagamento for confirmado, ele aparecerá automaticamente neste relatório.</p></section>}</>;
    }
    if (currentPath === "/membros/academia" && academy.isLoading) return <LoadingPanel />;
    if (currentPath === "/membros/academia" && academy.isError) return <QueryState title="Não foi possível carregar os cursos." message="Atualize a página para tentar novamente. O painel não assumirá que não há cursos enquanto a consulta estiver indisponível." />;
    if (currentPath === "/membros/academia") return <><SectionIntro eyebrow="Academia de execução" title="Aprenda e aplique" detail="Cursos publicados e progresso individual para transformar estudo em ações da sua operação digital." />{academy.data?.length ? <div className="office-course-grid">{academy.data.map(course => <article key={course.id}><span>{course.level}</span><h2>{course.title}</h2><p>{course.summary || "Conteúdo em preparação."}</p><footer><small>{course.durationMinutes} min</small><span>Disponível em breve</span></footer></article>)}</div> : <section className="office-empty"><span className="office-empty-mark">PL</span><h2>A área de estudo está sendo preparada.</h2><p>Os conteúdos publicados pela administração aparecerão aqui, organizados por etapa e tema.</p></section>}</>;
    if (currentPath === "/membros/rede") return <ModulePanel detail={{ eyebrow: "Minha operação", title: "Minha rede direta", detail: "Consulte o patrocinador e os indicados diretos vinculados à sua conta, com privacidade e rastreabilidade.", notes: ["A rede exibida representa vínculos diretos registrados pela operação.", "Indicação não significa venda, pagamento ou ganho automático."] }} />;
    if (currentPath === "/membros/materiais") return <ModulePanel detail={{ eyebrow: "Biblioteca de Recursos", title: "Biblioteca de Recursos", detail: "Acesse recursos publicados para apoiar sua divulgação e sua rotina.", notes: ["Os itens aparecem conforme publicação administrativa.", "Use cada recurso de acordo com sua licença e finalidade."] }} />;
    if (currentPath === "/membros/ranking") return <ModulePanel detail={{ eyebrow: "Pontos e níveis", title: "Acompanhe sua evolução", detail: "Consulte pontos confirmados e níveis derivados dos registros da sua própria conta.", notes: ["A pontuação depende de lançamentos e critérios administrativos.", "A prévia não expõe ganhos, nomes ou dados de outros membros."] }} />;
    if (currentPath === "/membros/configuracoes") return <><SectionIntro eyebrow="Sua presença" title="Editar perfil" detail="Mantenha seus dados, sua apresentação e seu link público alinhados com o momento do seu negócio." /><section className="office-profile-card"><span>Perfil público</span><h2>{data?.profile?.slug ? `/${data.profile.slug}` : "Ainda não configurado"}</h2><p>{data?.profile?.bio || "Adicione uma breve descrição para apresentar seu trabalho de forma objetiva."}</p></section></>;
    if (moduleDetails[currentPath]) return <ModulePanel detail={moduleDetails[currentPath]} />;
    if (currentPath !== "/membros") {
      const active = menuItems.find(item => item.path === currentPath);
      if (!active) return <QueryState title="Módulo indisponível." message="Este caminho não faz parte da navegação ativa do Escritório Virtual." />;
      return <ModulePanel detail={{ eyebrow: active?.group ?? "Escritório virtual", title: active?.label ?? "Módulo do escritório", detail: "A estrutura deste módulo foi preparada para receber dados e conteúdos próprios da sua operação.", notes: ["Nenhum dado da conta de referência foi copiado para esta área.", "O conteúdo será alimentado por materiais e registros autorizados."] }} />;
    }

    const profileSlug = data?.profile?.slug ?? "";
    const affiliateLink = profileSlug ? buildAffiliateLink(profileSlug) : "";
    const visits = analytics.data?.totals.clicks ?? 0;
    const conversions = analytics.data?.totals.conversions ?? 0;
    const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;
    const metricUnavailable = analytics.isError || referrals.isError;

    return <>
      <SectionIntro eyebrow="Escritório Virtual" title="Visão geral" detail="Acompanhe os indicadores globais da sua conta e acesse rapidamente seus principais caminhos de divulgação." />
      <section className="mt-7 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-white"><Link2 className="size-5 text-emerald-300" /><h2 className="font-medium">Seu link de indicação</h2></div>
            {affiliateLink ? <code className="mt-3 block break-all rounded-xl border border-emerald-300/20 bg-black/30 p-3 text-sm text-emerald-100">{affiliateLink}</code> : <p className="mt-3 text-sm leading-6 text-emerald-50">Configure o identificador da sua página para liberar seu link de indicação.</p>}
          </div>
          {affiliateLink ? <button type="button" onClick={() => copyAffiliateLink(affiliateLink)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-200 sm:w-auto"><Copy className="size-4" />Copiar link</button> : <a href={withAppBase("/membros/configuracoes")} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/10 sm:w-auto">Configurar identificador <ChevronRight size={15} /></a>}
        </div>
      </section>
      <section className="office-stat-grid office-overview-stats">
        <article><span>Ganhos totais</span><CircleDollarSign className="mt-4 size-5 text-emerald-300" /><strong>{formatCurrency(data?.confirmedApplicationValueCents ?? 0)}</strong><small>Pagamentos confirmados</small></article>
        <article><span>Indicados</span><UsersRound className="mt-4 size-5 text-emerald-300" /><strong>{referrals.isLoading ? "..." : referrals.isError ? "—" : referrals.data?.activeCount ?? 0}</strong><small>{referrals.isError ? "Indicador indisponível" : "Indicações diretas ativas"}</small></article>
        <article><span>Visitas</span><MousePointerClick className="mt-4 size-5 text-emerald-300" /><strong>{analytics.isLoading ? "..." : analytics.isError ? "—" : visits}</strong><small>{analytics.isError ? "Indicador indisponível" : "Link principal + campanhas"}</small></article>
        <article><span>Taxa de conversão</span><Percent className="mt-4 size-5 text-emerald-300" /><strong>{analytics.isLoading ? "..." : analytics.isError ? "—" : `${conversionRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}</strong><small>{analytics.isError ? "Indicador indisponível" : "Resultados / visitas"}</small></article>
      </section>
      {metricUnavailable ? <p className="mt-4 rounded-xl border border-yellow-300/25 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-50">Alguns indicadores não puderam ser carregados agora. Atualize a página para tentar novamente.</p> : null}
      <section className="office-workspace">
        <article><span className="office-eyebrow">Divulgação</span><h2>Ver campanhas</h2><p>Crie e organize campanhas de divulgação com links rastreáveis.</p><a href={withAppBase("/membros/operacao/campanhas")}>Abrir campanhas <ChevronRight size={15} /></a></article>
        <article><span className="office-eyebrow">Rede</span><h2>Ver indicados</h2><p>Consulte os vínculos diretos ativos da sua rede.</p><a href={withAppBase("/membros/rede")}>Abrir rede <ChevronRight size={15} /></a></article>
        <article><span className="office-eyebrow">Relatório</span><h2>Ver ganhos</h2><p>Acompanhe adesões e pagamentos confirmados diretamente pelo patrocinador.</p><a href={withAppBase("/membros/ganhos")}>Abrir ganhos <ChevronRight size={15} /></a></article>
      </section>
    </>;
  };

  return <DashboardLayout menuItems={menuItems} title="Código Lucrativo"><div className="office-page">{renderBody()}</div><OverviewOnboardingModal open={onboardingOpen} onDismiss={dismissOnboarding} /></DashboardLayout>;
}
