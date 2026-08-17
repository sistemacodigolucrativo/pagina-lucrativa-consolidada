import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@shared/dashboard";
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  ChartNoAxesCombined,
  Copy,
  Link2,
  Medal,
  Send,
  Settings,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useLocation } from "wouter";

const menuItems: DashboardMenuItem[] = [
  { icon: ChartNoAxesCombined, label: "Visão geral", path: "/membros", group: "Escritório" },
  { icon: Link2, label: "Links & campanhas", path: "/membros/campanhas", group: "Captação" },
  { icon: WalletCards, label: "Ganhos", path: "/membros/ganhos", group: "Captação" },
  { icon: Boxes, label: "Produtos", path: "/membros/produtos", group: "Captação" },
  { icon: BookOpen, label: "Academia", path: "/membros/academia", group: "Evolução" },
  { icon: UsersRound, label: "Rede & convites", path: "/membros/rede", group: "Evolução" },
  { icon: Sparkles, label: "Materiais", path: "/membros/materiais", group: "Evolução" },
  { icon: Medal, label: "Ranking", path: "/membros/ranking", group: "Evolução" },
  { icon: Settings, label: "Configurações", path: "/membros/configuracoes", group: "Conta" },
];

function SectionIntro({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: string }) {
  return <div className="office-intro"><div><span className="office-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{detail}</p></div>{action && <button className="office-action" type="button">{action}<ArrowUpRight size={16} /></button>}</div>;
}

function EmptyPanel({ title, body, action }: { title: string; body: string; action: string }) {
  return <section className="office-empty"><span className="office-empty-mark">PL</span><h2>{title}</h2><p>{body}</p><button className="office-action" type="button">{action}<ArrowUpRight size={16} /></button></section>;
}

function LoadingPanel() {
  return <div className="office-loading"><span>Carregando seu escritório</span><i /><i /><i /></div>;
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
    if (location === "/membros/campanhas") {
      return <><SectionIntro eyebrow="Aquisição" title="Links & campanhas" detail="Centralize seus links, acompanhe interesse e organize a origem de cada oportunidade." action="Novo link" />
        {campaigns.data?.length ? <div className="office-list">{campaigns.data.map(link => <article key={link.id}><div><span className="office-list-code">{link.slug}</span><h3>{link.name}</h3><p>{link.destinationUrl}</p></div><div className="office-list-metric"><strong>{link.clicks}</strong><span>cliques</span></div><button className="office-icon-button" type="button" aria-label={`Copiar link ${link.name}`}><Copy size={16} /></button></article>)}</div> : <EmptyPanel title="Seu primeiro link começa aqui." body="Crie um link de campanha para medir interesse sem perder o contexto da sua divulgação." action="Criar link" />}</>;
    }
    if (location === "/membros/ganhos") {
      return <><SectionIntro eyebrow="Financeiro" title="Ganhos" detail="Uma leitura simples do que entrou, do que está disponível e das movimentações da sua operação." />
        <div className="office-balance"><span>Saldo operacional</span><strong>{formatCurrency(data?.balanceCents ?? 0)}</strong><p>Os lançamentos aparecerão aqui assim que sua operação registrar a primeira venda ou comissão.</p></div>
        {data?.recentTransactions?.length ? <div className="office-list">{data.recentTransactions.map(transaction => <article key={transaction.id}><div><span className="office-list-code">{transaction.type}</span><h3>{transaction.description}</h3><p>{new Date(transaction.occurredAt).toLocaleDateString("pt-BR")}</p></div><div className="office-list-metric"><strong>{formatCurrency(transaction.amountCents)}</strong></div></article>)}</div> : <EmptyPanel title="Sem movimentações por enquanto." body="Quando uma transação acontecer, ela será registrada com data, descrição e valor neste extrato." action="Ver como funciona" />}</>;
    }
    if (location === "/membros/produtos") {
      return <><SectionIntro eyebrow="Catálogo" title="Produtos" detail="Organize o que você vende, publique uma vitrine e crie campanhas para promover cada solução." action="Cadastrar produto" />
        {products.data?.length ? <div className="office-product-grid">{products.data.map(product => <article key={product.id}><span>{product.status === "active" ? "Ativo" : "Rascunho"}</span><h2>{product.title}</h2><p>{product.description || "Sem descrição cadastrada."}</p><strong>{formatCurrency(product.priceCents)}</strong></article>)}</div> : <EmptyPanel title="Sua vitrine está pronta para começar." body="Cadastre seu primeiro produto e reúna as informações que ajudam a apresentá-lo com clareza." action="Cadastrar produto" />}</>;
    }
    if (location === "/membros/academia") {
      return <><SectionIntro eyebrow="Aprendizado aplicado" title="Academia" detail="Uma biblioteca organizada para transformar estudo em execução no dia a dia da sua operação." />
        {academy.data?.length ? <div className="office-course-grid">{academy.data.map(course => <article key={course.id}><span>{course.level}</span><h2>{course.title}</h2><p>{course.summary || "Conteúdo em preparação."}</p><footer><small>{course.durationMinutes} min</small><button type="button">Abrir <ArrowUpRight size={14} /></button></footer></article>)}</div> : <EmptyPanel title="A academia está sendo preparada." body="Os conteúdos publicados pela administração aparecerão aqui, organizados por etapa e tema." action="Explorar trilhas" />}</>;
    }
    if (location === "/membros/rede") return <><SectionIntro eyebrow="Crescimento em rede" title="Rede & convites" detail="Convide pessoas, acompanhe indicações e mantenha sua rede organizada em um só lugar." action="Enviar convite" /><EmptyPanel title="Toda rede começa com um convite." body="Compartilhe um convite quando sua proposta estiver clara e acompanhe as conexões a partir daqui." action="Criar convite" /></>;
    if (location === "/membros/materiais") return <><SectionIntro eyebrow="Biblioteca comercial" title="Materiais" detail="Tenha seus argumentos, templates e materiais de divulgação ao alcance da próxima conversa." /><EmptyPanel title="Monte sua biblioteca de divulgação." body="Adicione roteiros, peças e referências que você usa para apresentar suas soluções." action="Adicionar material" /></>;
    if (location === "/membros/ranking") return <><SectionIntro eyebrow="Ritmo de execução" title="Ranking" detail="Uma leitura de participação e progresso, sem expor dados pessoais de outros membros." /><EmptyPanel title="O ranking será ativado com os primeiros dados." body="Quando houver atividade suficiente, esta área mostrará seu avanço e a dinâmica da comunidade." action="Entender critérios" /></>;
    if (location === "/membros/configuracoes") return <><SectionIntro eyebrow="Sua presença" title="Configurações" detail="Mantenha seus dados, sua apresentação e seu link público alinhados com o momento do seu negócio." action="Editar perfil" /><section className="office-profile-card"><span>Perfil público</span><h2>{data?.profile?.slug ? `/${data.profile.slug}` : "Ainda não configurado"}</h2><p>{data?.profile?.bio || "Adicione uma breve descrição para apresentar seu trabalho de forma objetiva."}</p></section></>;

    return <><SectionIntro eyebrow="Escritório virtual" title="Seu próximo passo está claro." detail="Acompanhe a operação comercial sem perder o fio da estratégia, da divulgação e do que você quer construir." action="Criar campanha" />
      <section className="office-stat-grid"><article><span>Saldo operacional</span><strong>{formatCurrency(data?.balanceCents ?? 0)}</strong><small>Movimentações registradas</small></article><article><span>Campanhas ativas</span><strong>{data?.campaignCount ?? 0}</strong><small>{data?.campaignClicks ?? 0} cliques registrados</small></article><article><span>Produtos publicados</span><strong>{data?.activeProductCount ?? 0}</strong><small>{data?.productCount ?? 0} no seu catálogo</small></article></section>
      <section className="office-next"><div><span className="office-eyebrow">Comece pela operação</span><h2>Organize uma campanha antes de buscar mais alcance.</h2><p>Crie um link, defina o destino e use o escritório para acompanhar o que está funcionando.</p></div><Link2 size={34} /></section>
      <section className="office-split"><article><span className="office-eyebrow">Próximo movimento</span><h2>Crie seu primeiro link de campanha.</h2><p>Você terá uma origem clara para cada divulgação e uma base para ajustar suas próximas ações.</p><a href="/membros/campanhas">Ir para campanhas <ArrowUpRight size={15} /></a></article><article><span className="office-eyebrow">Biblioteca</span><h2>Construa sua trilha de execução.</h2><p>A academia reunirá conteúdos por etapa para reduzir a distância entre aprender e aplicar.</p><a href="/membros/academia">Ver academia <ArrowUpRight size={15} /></a></article></section></>;
  };

  return <DashboardLayout menuItems={menuItems} title="Página Lucrativa"><div className="office-page">{renderBody()}</div></DashboardLayout>;
}
