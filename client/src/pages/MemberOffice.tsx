import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@shared/dashboard";
import { memberOfficeNavigation } from "@shared/memberOfficeContent";
import {
  Award,
  BookOpen,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Copy,
  FileText,
  Gift,
  GraduationCap,
  History,
  Link2,
  Mail,
  Medal,
  MessageCircleMore,
  PanelTop,
  Send,
  Settings,
  Share2,
  Sparkles,
  Trophy,
  UserCog,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";

const iconByKey: Record<string, LucideIcon> = {
  overview: ChartNoAxesCombined,
  message: Mail,
  testimonial: MessageCircleMore,
  profile: Settings,
  data: ClipboardList,
  how: Sparkles,
  email: Mail,
  earnings: WalletCards,
  sponsor: UserCog,
  network: UsersRound,
  products: Boxes,
  blog: FileText,
  classified: PanelTop,
  history: History,
  academy: BookOpen,
  faq: CircleHelp,
  support: CircleHelp,
  invite: Send,
  downloads: Boxes,
  certificate: Award,
  ranking: Medal,
  articles: FileText,
  automation: Bot,
  visits: ChartNoAxesCombined,
  link: Link2,
  bonus: Gift,
  study: GraduationCap,
};

const menuItems: DashboardMenuItem[] = memberOfficeNavigation.flatMap(group => group.items.map(item => ({
  icon: iconByKey[item.icon] ?? PanelTop,
  label: item.label,
  path: item.path,
  group: group.label,
})));

const moduleDetails: Record<string, { eyebrow: string; title: string; detail: string; notes: string[] }> = {
  "/membros/mensagem-especial": { eyebrow: "Acesso e personalização", title: "Mensagem e senha especial", detail: "Organize a mensagem que acompanha o acesso de personalização da sua página.", notes: ["A senha de personalização é enviada após a confirmação do pedido.", "Mantenha instruções claras e não compartilhe credenciais em áreas públicas."] },
  "/membros/fazer-depoimento": { eyebrow: "Relato autêntico", title: "Compartilhe sua experiência", detail: "Este espaço deve receber apenas um relato próprio, verdadeiro e verificável do membro autenticado.", notes: ["Não publique opiniões em nome de terceiros.", "Imagens de pessoas ou comprovantes exigem autorização do titular antes da publicação."] },
  "/membros/meus-dados": { eyebrow: "Conta", title: "Meus dados", detail: "Confira e mantenha atualizadas as informações necessárias à operação da sua página.", notes: ["Dados de contato e recebimento ficam protegidos na sua conta.", "Evite inserir informações sensíveis em campos de divulgação."] },
  "/membros/como-divulgar": { eyebrow: "Comece por aqui", title: "Saiba como divulgar", detail: "Use seu link de divulgação, explique a proposta com clareza e acompanhe a origem das visitas.", notes: ["Crie uma campanha para cada canal que você deseja medir.", "Prefira materiais autorizados e uma promessa comercial transparente."] },
  "/membros/emails-site": { eyebrow: "Captação", title: "E-mails site & artigos", detail: "Centralize mensagens e artigos que ajudam a orientar visitantes interessados.", notes: ["Os contatos aparecerão aqui quando existirem dados próprios e autorizados.", "Use títulos objetivos e conteúdo de apoio útil."] },
  "/membros/emails-interessados": { eyebrow: "Captação", title: "E-mails de interessados", detail: "Acompanhe os contatos que demonstraram interesse, respeitando consentimento e privacidade.", notes: ["Nenhum contato de terceiros foi importado da referência.", "A lista será alimentada somente por captações da sua operação."] },
  "/membros/emails-whatsapp": { eyebrow: "Captação", title: "E-mails capturados WhatsApp", detail: "Organize os registros de interesse captados por canais de mensagem que tenham consentimento.", notes: ["Use uma linguagem de autorização clara antes de salvar dados.", "Evite transferir dados de outras plataformas sem base legal."] },
  "/membros/patrocinador": { eyebrow: "Rede", title: "Meu patrocinador", detail: "Consulte aqui a relação de suporte da sua rede quando ela estiver cadastrada para sua conta.", notes: ["Dados de outras pessoas não são exibidos nesta prévia.", "A conexão será mostrada apenas para o membro autorizado."] },
  "/membros/blog": { eyebrow: "Conteúdo", title: "Blog Página Lucrativa", detail: "Reúna artigos e materiais que apoiem uma divulgação clara e responsável.", notes: ["Publique conteúdo próprio ou devidamente licenciado.", "Mantenha o foco em educação e apresentação da oferta."] },
  "/membros/classificados": { eyebrow: "Vitrine", title: "Classificados", detail: "Organize oportunidades e materiais comerciais próprios em uma vitrine única.", notes: ["Cadastre somente ofertas que você tem autorização para divulgar.", "Não apresente resultados ou avaliações não verificáveis."] },
  "/membros/historico": { eyebrow: "Análise", title: "Histórico de visitas", detail: "Acompanhe a evolução de visitas e origens quando sua operação começar a receber tráfego.", notes: ["As métricas serão exibidas a partir de dados próprios.", "Use campanhas identificadas para comparar canais."] },
  "/membros/perguntas-frequentes": { eyebrow: "Suporte", title: "Perguntas frequentes", detail: "Encontre orientações para as dúvidas mais comuns sobre página, divulgação e acesso.", notes: ["Use o suporte quando uma dúvida envolver sua conta.", "Não compartilhe senha ou dados financeiros em chats públicos."] },
  "/membros/convites": { eyebrow: "Crescimento em rede", title: "Convide amigos", detail: "Compartilhe sua página de divulgação com pessoas que tenham interesse legítimo em conhecer a proposta.", notes: ["Convites devem apontar para o seu link de campanha.", "Acompanhe os resultados sem expor dados de convidados."] },
  "/membros/cartao-certificado": { eyebrow: "Reconhecimento", title: "Cartão e certificado", detail: "Guarde os materiais de identificação e certificados liberados para a sua conta.", notes: ["Arquivos aparecerão após publicação pela administração.", "Use apenas certificados associados à sua própria conta."] },
  "/membros/artigos": { eyebrow: "Biblioteca", title: "Artigos marketing", detail: "Acesse referências de marketing e comunicação para apoiar a sua rotina de divulgação.", notes: ["Os materiais devem ser próprios ou licenciados.", "Transforme aprendizado em campanhas mensuráveis."] },
  "/membros/automacoes": { eyebrow: "Comunicação assistida", title: "Preparar comunicações", detail: "Organize uma mensagem e registre o canal que você pretende utilizar com contatos consentidos.", notes: ["O módulo registra o preparo, mas não realiza envios externos automáticos.", "Use somente contatos próprios e autorizações verificáveis."] },
  "/membros/top-visitas": { eyebrow: "Análise", title: "Top 10 visitas", detail: "Quando houver atividade suficiente, esta área mostrará os conteúdos e campanhas de maior alcance da sua operação.", notes: ["O ranking será calculado com dados próprios.", "Dados de outros membros não são exibidos."] },
  "/membros/bonus": { eyebrow: "Materiais", title: "Bônus e materiais", detail: "Consulte os materiais adicionais liberados pela administração para a sua jornada.", notes: ["Os downloads publicados aparecerão nesta biblioteca.", "Use sempre os arquivos de acordo com sua licença."] },
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

export default function MemberOffice() {
  const [location] = useLocation();
  const overview = trpc.member.overview.useQuery();
  const campaigns = trpc.member.campaigns.useQuery();
  const products = trpc.member.products.useQuery();
  const academy = trpc.member.academy.useQuery();

  const renderBody = () => {
    if (overview.isLoading) return <LoadingPanel />;
    const data = overview.data;

    if (location === "/membros/campanhas" && campaigns.isLoading) return <LoadingPanel />;
    if (location === "/membros/campanhas" && campaigns.isError) return <QueryState title="Não foi possível carregar as campanhas." message="Atualize a página para tentar novamente. Nenhum estado vazio foi assumido enquanto a consulta estava indisponível." />;
    if (location === "/membros/campanhas") return <><SectionIntro eyebrow="Captação" title="Links & campanhas" detail="Centralize seus links, acompanhe interesse e organize a origem de cada oportunidade." action="Criar campanha" actionHref="/membros/campanhas" />{campaigns.data?.length ? <div className="office-list">{campaigns.data.map(link => <article key={link.id}><div><span className="office-list-code">{link.slug}</span><h3>{link.name}</h3><p>{link.destinationUrl}</p></div><div className="office-list-metric"><strong>{link.clicks}</strong><span>cliques</span></div><button className="office-icon-button" type="button" aria-label={`Copiar link ${link.name}`}><Copy size={16} /></button></article>)}</div> : <section className="office-empty"><span className="office-empty-mark">PL</span><h2>Seu primeiro link começa aqui.</h2><p>Crie um link de campanha para medir interesse sem perder o contexto da sua divulgação.</p></section>}</>;
    if (location === "/membros/ganhos") return <><SectionIntro eyebrow="Meus resultados" title="Extrato e lançamentos" detail="Acompanhe os registros financeiros da sua operação, distinguindo valores confirmados, pendentes e outras movimentações." /><div className="office-balance"><span>Valor registrado</span><strong>{formatCurrency(data?.balanceCents ?? 0)}</strong><p>O extrato organiza os lançamentos disponíveis para sua conta. Registro financeiro não significa pagamento processado ou ganho garantido.</p></div>{data?.recentTransactions?.length ? <div className="office-list">{data.recentTransactions.map(transaction => <article key={transaction.id}><div><span className="office-list-code">{transaction.type}</span><h3>{transaction.description}</h3><p>{new Date(transaction.occurredAt).toLocaleDateString("pt-BR")}</p></div><div className="office-list-metric"><strong>{formatCurrency(transaction.amountCents)}</strong></div></article>)}</div> : <section className="office-empty"><span className="office-empty-mark">PL</span><h2>Sem movimentações por enquanto.</h2><p>Quando uma transação acontecer, ela será registrada com data, descrição e valor neste extrato.</p></section>}</>;
    if (location === "/membros/produtos" && products.isLoading) return <LoadingPanel />;
    if (location === "/membros/produtos" && products.isError) return <QueryState title="Não foi possível carregar o catálogo." message="Atualize a página para tentar novamente. O painel não mostrará uma vitrine vazia até concluir a consulta." />;
    if (location === "/membros/produtos") return <><SectionIntro eyebrow="Minha operação" title="Meus produtos" detail="Organize produtos próprios, envie-os para revisão e use a estrutura de divulgação para apresentar cada solução." action="Ir para campanhas" actionHref="/membros/campanhas" />{products.data?.length ? <div className="office-product-grid">{products.data.map(product => <article key={product.id}><span>{product.status === "active" ? "Ativo" : "Rascunho"}</span><h2>{product.title}</h2><p>{product.description || "Sem descrição cadastrada."}</p><strong>{formatCurrency(product.priceCents)}</strong></article>)}</div> : <section className="office-empty"><span className="office-empty-mark">PL</span><h2>Sua vitrine está pronta para começar.</h2><p>Cadastre seu primeiro produto e reúna as informações que ajudam a apresentá-lo com clareza.</p></section>}</>;
    if (location === "/membros/academia" && academy.isLoading) return <LoadingPanel />;
    if (location === "/membros/academia" && academy.isError) return <QueryState title="Não foi possível carregar os cursos." message="Atualize a página para tentar novamente. O painel não assumirá que não há cursos enquanto a consulta estiver indisponível." />;
    if (location === "/membros/academia") return <><SectionIntro eyebrow="Academia de execução" title="Aprenda e aplique" detail="Cursos publicados e progresso individual para transformar estudo em ações da sua operação digital." />{academy.data?.length ? <div className="office-course-grid">{academy.data.map(course => <article key={course.id}><span>{course.level}</span><h2>{course.title}</h2><p>{course.summary || "Conteúdo em preparação."}</p><footer><small>{course.durationMinutes} min</small><span>Disponível em breve</span></footer></article>)}</div> : <section className="office-empty"><span className="office-empty-mark">PL</span><h2>A área de estudo está sendo preparada.</h2><p>Os conteúdos publicados pela administração aparecerão aqui, organizados por etapa e tema.</p></section>}</>;
    if (location === "/membros/rede") return <ModulePanel detail={{ eyebrow: "Minha operação", title: "Minha rede direta", detail: "Consulte o patrocinador e os indicados diretos vinculados à sua conta, com privacidade e rastreabilidade.", notes: ["A rede exibida representa vínculos diretos registrados pela operação.", "Indicação não significa venda, pagamento ou ganho automático."] }} />;
    if (location === "/membros/materiais") return <ModulePanel detail={{ eyebrow: "Conteúdos e materiais", title: "Biblioteca de recursos", detail: "Acesse materiais, bônus e arquivos publicados para apoiar a execução da sua operação.", notes: ["Os conteúdos aparecem conforme publicação administrativa.", "Use cada arquivo de acordo com sua licença e finalidade."] }} />;
    if (location === "/membros/ranking") return <ModulePanel detail={{ eyebrow: "Pontos e níveis", title: "Acompanhe sua evolução", detail: "Consulte pontos confirmados e níveis derivados dos registros da sua própria conta.", notes: ["A pontuação depende de lançamentos e critérios administrativos.", "A prévia não expõe ganhos, nomes ou dados de outros membros."] }} />;
    if (location === "/membros/configuracoes") return <><SectionIntro eyebrow="Sua presença" title="Editar perfil" detail="Mantenha seus dados, sua apresentação e seu link público alinhados com o momento do seu negócio." /><section className="office-profile-card"><span>Perfil público</span><h2>{data?.profile?.slug ? `/${data.profile.slug}` : "Ainda não configurado"}</h2><p>{data?.profile?.bio || "Adicione uma breve descrição para apresentar seu trabalho de forma objetiva."}</p></section></>;
    if (moduleDetails[location]) return <ModulePanel detail={moduleDetails[location]} />;
    if (location !== "/membros") {
      const active = menuItems.find(item => item.path === location);
      return <ModulePanel detail={{ eyebrow: active?.group ?? "Escritório virtual", title: active?.label ?? "Módulo do escritório", detail: "A estrutura deste módulo foi preparada para receber dados e conteúdos próprios da sua operação.", notes: ["Nenhum dado da conta de referência foi copiado para esta área.", "O conteúdo será alimentado por materiais e registros autorizados."] }} />;
    }

    return <><SectionIntro eyebrow="Sua estrutura digital" title="Organize sua operação em um só lugar." detail="O Escritório Virtual reúne os caminhos disponíveis para você personalizar, aprender, divulgar e acompanhar sua estrutura." action="Comece por aqui" actionHref="/membros/como-divulgar" /><section className="office-guidance"><span className="office-guidance-mark">PL</span><div><span className="office-eyebrow">Jornada de primeiros passos</span><h2>Ative a estrutura por etapas.</h2><p>Você não precisa abrir todos os módulos de uma vez. Siga uma sequência simples e avance conforme sua operação estiver pronta.</p><ul><li>01 — Complete seu perfil e seus dados de conta.</li><li>02 — Configure suas preferências de recebimento.</li><li>03 — Personalize sua página e sua apresentação.</li><li>04 — Entenda a oferta e como os pedidos são atribuídos.</li><li>05 — Aprenda a divulgar na Academia e na biblioteca.</li><li>06 — Crie seu primeiro link ou campanha.</li><li>07 — Comece a divulgar para o público adequado.</li><li>08 — Acompanhe visitas, contatos e pedidos registrados.</li></ul></div></section><section className="office-stat-grid"><article><span>Movimentações registradas</span><strong>{formatCurrency(data?.balanceCents ?? 0)}</strong><small>Consulte o extrato e os status</small></article><article><span>Links & campanhas</span><strong>{data?.campaignCount ?? 0}</strong><small>{data?.campaignClicks ?? 0} cliques registrados</small></article><article><span>Produtos ativos</span><strong>{data?.activeProductCount ?? 0}</strong><small>{data?.productCount ?? 0} no seu catálogo</small></article></section><section className="office-workspace"><article><span className="office-eyebrow">Divulgação</span><h2>Organize seus links.</h2><p>Crie uma campanha para cada canal e acompanhe a movimentação registrada sem perder a origem da divulgação.</p><a href="/membros/campanhas">Abrir links & campanhas <ChevronRight size={15} /></a></article><article><span className="office-eyebrow">Minha operação</span><h2>Acompanhe seus registros.</h2><p>Consulte pedidos, contatos, resultados e preferências de recebimento conforme os dados da sua conta.</p><a href="/membros/ganhos">Ver meus resultados <ChevronRight size={15} /></a></article><article><span className="office-eyebrow">Academia</span><h2>Aprenda e aplique.</h2><p>Encontre cursos e materiais publicados para apoiar a execução diária da sua operação digital.</p><a href="/membros/academia">Abrir Academia <ChevronRight size={15} /></a></article></section></>;
  };

  return <DashboardLayout menuItems={menuItems} title="Página Lucrativa"><div className="office-page">{renderBody()}</div></DashboardLayout>;
}
