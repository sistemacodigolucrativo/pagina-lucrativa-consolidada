import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@shared/dashboard";
import { BookOpenCheck, ChartNoAxesCombined, CircleDollarSign, FileText, Layers3, UsersRound } from "lucide-react";

const adminMenu: DashboardMenuItem[] = [
  { icon: ChartNoAxesCombined, label: "Operação", path: "/admin", group: "Gestão" },
  { icon: Layers3, label: "Central de manutenção", path: "/admin/operacao", group: "Gestão" },
  { icon: UsersRound, label: "Membros", path: "/admin/membros", group: "Gestão" },
  { icon: ChartNoAxesCombined, label: "Pontuação", path: "/admin/pontos", group: "Gestão" },
  { icon: FileText, label: "Pedidos", path: "/admin/pedidos", group: "Gestão" },
  { icon: Layers3, label: "Catálogo", path: "/admin/catalogo", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "Academia", path: "/admin/academia", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "E-books", path: "/admin/ebooks", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "Publicações", path: "/admin/publicacoes", group: "Conteúdo" },
  { icon: Layers3, label: "Produtos", path: "/admin/produtos", group: "Conteúdo" },
  { icon: CircleDollarSign, label: "Financeiro", path: "/admin/financeiro", group: "Gestão" },
];

export default function AdminOffice() {
  const overview = trpc.admin.overview.useQuery();
  const applications = trpc.admin.applications.useQuery();
  const data = overview.data;

  return <DashboardLayout menuItems={adminMenu} title="Administração"><div className="office-page admin-page"><div className="office-intro"><div><span className="office-eyebrow">Operação da plataforma</span><h1>Administração</h1><p>Uma leitura objetiva da base de membros, do catálogo e do conteúdo publicado.</p></div></div>
    {overview.isLoading ? <div className="office-loading"><span>Carregando operação</span><i /><i /><i /></div> : overview.error ? <section className="office-empty"><span className="office-empty-mark">PL</span><h2>Área exclusiva da administração.</h2><p>Esta rota só é liberada para contas com permissão administrativa no projeto.</p></section> : <><section className="office-stat-grid"><article><span>Membros ativos</span><strong>{data?.memberCount ?? 0}</strong><small>Contas de membros</small></article><article><span>Pedidos pendentes</span><strong>{data?.pendingApplicationCount ?? 0}</strong><small>Solicitações públicas aguardando acompanhamento</small></article><article><span>Volume registrado</span><strong>{formatCurrency(data?.grossVolumeCents ?? 0)}</strong><small>Transações da base</small></article></section><section className="office-next"><div><span className="office-eyebrow">Curadoria</span><h2>{data?.publishedCourseCount ?? 0} cursos disponíveis na academia.</h2><p>Use esta área para acompanhar o que está publicado e decidir os próximos conteúdos de formação.</p></div><BookOpenCheck size={34} /></section><section className="office-list"><span className="office-eyebrow">Pedidos públicos recentes</span>{applications.isLoading ? <div className="office-loading"><span>Carregando pedidos</span><i /><i /><i /></div> : applications.data?.length ? applications.data.map(application => <article key={application.id}><div><span className="office-list-code">{application.status}</span><h3>{application.fullName}</h3><p>{application.email} · {application.whatsapp}</p></div><time>{new Date(application.createdAt).toLocaleDateString("pt-BR")}</time></article>) : <article><div><span className="office-list-code">Sem pedidos</span><h3>Nenhuma solicitação registrada.</h3><p>Os pedidos enviados pelo formulário público aparecerão aqui.</p></div></article>}</section></>}</div></DashboardLayout>;
}
