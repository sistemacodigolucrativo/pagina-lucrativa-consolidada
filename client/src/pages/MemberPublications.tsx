import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BookOpenText, FileText, Inbox, LayoutDashboard, LibraryBig, Mail, MessageCircleQuestion } from "lucide-react";
import { useLocation } from "wouter";

type ContentKind = "material" | "article" | "faq" | "notice";
type EditorialView = { eyebrow: string; title: string; description: string; kind?: ContentKind; icon: typeof FileText };

const views: Record<string, EditorialView> = {
  "/membros/blog": { eyebrow: "Conteúdo publicado", title: "Blog Página Lucrativa", description: "Artigos selecionados e publicados pela administração para apoiar sua operação.", kind: "article", icon: BookOpenText },
  "/membros/artigos": { eyebrow: "Conteúdo publicado", title: "Artigos de marketing", description: "Leituras práticas sobre divulgação, campanhas e presença digital.", kind: "article", icon: FileText },
  "/membros/classificados": { eyebrow: "Conteúdo publicado", title: "Classificados", description: "Publicações e oportunidades liberadas pela administração da plataforma.", kind: "article", icon: Inbox },
  "/membros/materiais": { eyebrow: "Biblioteca", title: "Baixar produtos", description: "Materiais complementares disponíveis para consulta e download orientado.", kind: "material", icon: LibraryBig },
  "/membros/bonus": { eyebrow: "Biblioteca", title: "Bônus e materiais", description: "Materiais adicionais publicados para os membros do Escritório Virtual.", kind: "material", icon: LibraryBig },
  "/membros/perguntas-frequentes": { eyebrow: "Ajuda", title: "Perguntas frequentes", description: "Respostas oficiais mantidas pela administração da plataforma.", kind: "faq", icon: MessageCircleQuestion },
  "/membros/emails-site": { eyebrow: "Comunicação", title: "E-mails do site e artigos", description: "Orientações e comunicações publicadas para apoiar suas campanhas.", kind: "notice", icon: Mail },
  "/membros/emails-interessados": { eyebrow: "Comunicação", title: "E-mails de interessados", description: "Mensagens e conteúdos administrados para relacionamento com interessados.", kind: "notice", icon: Mail },
  "/membros/emails-whatsapp": { eyebrow: "Comunicação", title: "E-mails capturados no WhatsApp", description: "Conteúdos e avisos relacionados à sua captação consentida.", kind: "notice", icon: Mail },
};

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: BookOpenText, label: "Blog e artigos", path: "/membros/blog", group: "Conteúdo" },
  { icon: LibraryBig, label: "Materiais", path: "/membros/materiais", group: "Conteúdo" },
  { icon: MessageCircleQuestion, label: "Perguntas frequentes", path: "/membros/perguntas-frequentes", group: "Conteúdo" },
];

const fallback: EditorialView = { eyebrow: "Central editorial", title: "Publicações", description: "Conteúdos administrados e publicados para o seu Escritório Virtual.", icon: BookOpenText };

export default function MemberPublications() {
  const [location] = useLocation();
  const view = views[location] ?? fallback;
  const Icon = view.icon;
  const content = trpc.member.content.useQuery();
  const items = (content.data ?? []).filter(item => !view.kind || item.kind === view.kind);

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">{view.eyebrow}</span><div className="flex items-start gap-3"><Icon className="mt-1 size-7 text-amber-300" /><div><h1 className="text-3xl font-semibold text-white">{view.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">{view.description}</p></div></div></header><section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-medium text-white">Disponíveis para você</h2><span className="text-xs uppercase tracking-wider text-zinc-500">{items.length} publicações</span></div>{content.isLoading ? <p className="text-sm text-zinc-400">Carregando publicações...</p> : items.length ? <div className="grid gap-4 lg:grid-cols-2">{items.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-5"><span className="text-xs uppercase tracking-wider text-amber-200">{item.kind === "faq" ? "Pergunta frequente" : item.kind === "material" ? "Material" : item.kind === "notice" ? "Comunicação" : "Artigo"}</span><h3 className="mt-2 text-lg font-medium text-white">{item.title}</h3>{item.summary && <p className="mt-2 text-sm leading-6 text-zinc-300">{item.summary}</p>}{item.body && <div className="mt-4 whitespace-pre-wrap border-t border-white/10 pt-4 text-sm leading-6 text-zinc-400">{item.body}</div>}</article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">A administração ainda não publicou conteúdo nesta categoria. Volte em breve ou consulte outra área do Escritório Virtual.</p>}</section></main></DashboardLayout>;
}
