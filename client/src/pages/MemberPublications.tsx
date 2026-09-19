import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import LibraryResourcesPremium from "@/components/resources/LibraryResourcesPremium";
import { splitPromotionalMaterialBody } from "@/lib/promotionalMaterialMetadata";
import { trpc } from "@/lib/trpc";
import { BookOpenText, Inbox, LayoutDashboard, LibraryBig, Mail, MessageCircleQuestion } from "lucide-react";
import { useLocation } from "wouter";

type ContentKind = "material" | "article" | "faq" | "notice";
type EditorialView = { eyebrow: string; title: string; description: string; kind?: ContentKind; icon: typeof LibraryBig };

const views: Record<string, EditorialView> = {
  "/membros/classificados": { eyebrow: "Conteúdo publicado", title: "Classificados", description: "Publicações e oportunidades liberadas pela administração da plataforma.", kind: "article", icon: Inbox },
  "/membros/materiais": { eyebrow: "Biblioteca de Recursos", title: "Biblioteca de Recursos", description: "Recursos disponibilizados para apoiar sua divulgação e sua rotina.", kind: "material", icon: LibraryBig },
  "/membros/bonus": { eyebrow: "Biblioteca de Recursos", title: "Biblioteca de Recursos", description: "Recursos disponibilizados para apoiar sua divulgação e sua rotina.", kind: "material", icon: LibraryBig },
  "/membros/perguntas-frequentes": { eyebrow: "Ajuda e dúvidas", title: "Perguntas frequentes", description: "Respostas oficiais publicadas para orientar sua operação e seu acesso.", kind: "faq", icon: MessageCircleQuestion },
  "/membros/emails-site": { eyebrow: "Comunicação", title: "E-mails do site e materiais", description: "Orientações e comunicações publicadas para apoiar suas campanhas.", kind: "notice", icon: Mail },
  "/membros/emails-interessados": { eyebrow: "Comunicação", title: "E-mails de interessados", description: "Mensagens e conteúdos administrados para relacionamento com interessados.", kind: "notice", icon: Mail },
  "/membros/emails-whatsapp": { eyebrow: "Comunicação", title: "E-mails capturados no WhatsApp", description: "Conteúdos e avisos relacionados à sua captação consentida.", kind: "notice", icon: Mail },
};

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Visão geral", path: "/membros", group: "Navegação" },
  { icon: LibraryBig, label: "Biblioteca de Recursos", path: "/membros/materiais", group: "Conteúdos e materiais" },
  { icon: MessageCircleQuestion, label: "Ajuda e dúvidas", path: "/membros/perguntas-frequentes", group: "Conteúdos e materiais" },
];

const fallback: EditorialView = { eyebrow: "Conteúdos publicados", title: "Conteúdos publicados", description: "Materiais de divulgação, Biblioteca de Recursos, perguntas frequentes e comunicações administradas para o seu Escritório Virtual.", icon: BookOpenText };

export default function MemberPublications() {
  const [location] = useLocation();
  const view = views[location] ?? fallback;
  const Icon = view.icon;
  const content = trpc.member.content.useQuery();
  const items = (content.data ?? []).filter(item => !view.kind || item.kind === view.kind);
  const resourceItems = (content.data ?? []).filter(item => item.kind === "material" || item.kind === "article").map(item => {
    const promotional = splitPromotionalMaterialBody(item.body);
    return { ...item, body: promotional.body, imageUrl: promotional.imageUrl || null };
  });

  if (location === "/membros/materiais") {
    return (
      <DashboardLayout menuItems={menu} title="Escritório Virtual">
        <LibraryResourcesPremium items={resourceItems} isLoading={content.isLoading} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menu} title="Escritório Virtual">
      <main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">{view.eyebrow}</span>
          <div className="flex items-start gap-3">
            <Icon className="mt-1 size-7 text-emerald-300" />
            <div>
              <h1 className="text-3xl font-semibold text-white">{view.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">{view.description}</p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-medium text-white">Recursos publicados para você</h2>
            <span className="text-xs uppercase tracking-wider text-zinc-500">{items.length} publicações</span>
          </div>
          {content.isLoading ? <p className="text-sm text-zinc-400">Carregando publicações...</p> : items.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map(item => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-5">
                  <span className="text-xs uppercase tracking-wider text-emerald-200">{item.kind === "faq" ? "Pergunta frequente" : item.kind === "material" ? "Biblioteca de Recursos" : item.kind === "notice" ? "Comunicação" : "Publicação"}</span>
                  <h3 className="mt-2 text-lg font-medium text-white">{item.title}</h3>
                  {item.summary && <p className="mt-2 text-sm leading-6 text-zinc-300">{item.summary}</p>}
                  {item.body && <div className="mt-4 whitespace-pre-wrap border-t border-white/10 pt-4 text-sm leading-6 text-zinc-400">{item.body}</div>}
                </article>
              ))}
            </div>
          ) : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Ainda não há conteúdo publicado nesta categoria. Consulte outra área do Escritório Virtual ou volte quando novos recursos forem liberados.</p>}
        </section>
      </main>
    </DashboardLayout>
  );
}
