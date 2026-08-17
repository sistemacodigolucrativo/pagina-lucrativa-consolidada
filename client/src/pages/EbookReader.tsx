import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BookOpenText, LibraryBig, LayoutDashboard, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: LibraryBig, label: "Biblioteca de e-books", path: "/membros/ebooks", group: "Navegação" },
];

export default function EbookReader() {
  const ebooks = trpc.member.ebooks.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  useEffect(() => {
    if (selectedId === null && ebooks.data?.[0]) setSelectedId(ebooks.data[0].id);
  }, [ebooks.data, selectedId]);
  const selected = trpc.member.ebook.useQuery({ id: selectedId ?? 0 }, { enabled: selectedId !== null });

  return <DashboardLayout menuItems={menu} title="Biblioteca de e-books"><main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Área de estudo</span><h1 className="text-3xl font-semibold text-white">Biblioteca de e-books</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Consulte os materiais publicados pela administração diretamente no navegador. A leitura fica restrita aos conteúdos liberados para a sua conta.</p></header>
    {ebooks.isLoading ? <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm text-zinc-300"><LoaderCircle className="size-4 animate-spin text-amber-300" />Carregando biblioteca...</div> : ebooks.data?.length ? <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]"><aside className="max-h-[72vh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/60 p-3"><p className="px-2 pb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">{ebooks.data.length} publicações</p><div className="space-y-2">{ebooks.data.map(ebook => <button type="button" key={ebook.id} onClick={() => setSelectedId(ebook.id)} className={`w-full rounded-xl border p-4 text-left transition hover:border-amber-300/50 ${selectedId === ebook.id ? "border-amber-300/70 bg-amber-300/10" : "border-white/10 bg-black/25"}`}><div className="flex gap-3"><BookOpenText className="mt-0.5 size-5 shrink-0 text-amber-300" /><div><h2 className="text-sm font-medium text-white">{ebook.title}</h2><p className="mt-1 line-clamp-3 text-xs leading-5 text-zinc-400">{ebook.summary || "Material de estudo publicado."}</p></div></div></button>)}</div></aside>
      <section className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-3 sm:p-5">{selected.isLoading ? <div className="flex min-h-96 items-center justify-center gap-2 text-sm text-zinc-400"><LoaderCircle className="size-4 animate-spin text-amber-300" />Abrindo e-book...</div> : selected.data ? <><div className="mb-4 border-b border-white/10 pb-4"><span className="text-xs uppercase tracking-wider text-amber-200">E-book publicado</span><h2 className="mt-1 text-2xl font-semibold text-white">{selected.data.title}</h2>{selected.data.summary && <p className="mt-2 text-sm text-zinc-400">{selected.data.summary}</p>}</div><iframe title={`Leitor de ${selected.data.title}`} sandbox="" srcDoc={selected.data.htmlContent} className="h-[72vh] w-full rounded-xl border border-white/10 bg-white" /></> : <div className="flex min-h-96 items-center justify-center text-sm text-zinc-400">Não foi possível carregar este material.</div>}</section>
    </section> : <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-8 text-center"><LibraryBig className="mx-auto size-8 text-amber-300" /><h2 className="mt-3 text-lg font-medium text-white">Nenhum e-book publicado</h2><p className="mt-2 text-sm text-zinc-400">Quando a administração liberar materiais, eles aparecerão nesta biblioteca.</p></section>}
  </main></DashboardLayout>;
}
