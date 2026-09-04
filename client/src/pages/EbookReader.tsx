import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import ResponsiveEbookFrame from "@/components/ResponsiveEbookFrame";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { BookOpenText, LibraryBig, LayoutDashboard, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Visão geral", path: "/membros", group: "Navegação" },
  { icon: LibraryBig, label: "E-books", path: "/membros/ebooks", group: "Navegação" },
];

const recentEbooksStorageKey = "codigo-lucrativo-recent-ebooks";

const libraryShelves = [
  {
    id: "copy",
    label: "Copy e anúncios",
    shortLabel: "Copy",
    description: "Textos, anúncios, headlines, persuasão e comunicação de venda.",
    keywords: ["copy", "anuncio", "anuncios", "headline", "headlines", "persuas", "texto de venda", "carta de venda"],
  },
  {
    id: "vendas",
    label: "Vendas e oferta",
    shortLabel: "Vendas",
    description: "Oferta, precificação, argumentos, fechamento e conversão.",
    keywords: ["venda", "vendas", "oferta", "preco", "precificacao", "checkout", "conversao", "fechamento", "cliente"],
  },
  {
    id: "trafego",
    label: "Tráfego e divulgação",
    shortLabel: "Tráfego",
    description: "Campanhas, redes sociais, tráfego pago, leads e divulgação.",
    keywords: ["trafego", "divulgacao", "campanha", "campanhas", "facebook", "instagram", "google", "ads", "rede social", "redes sociais", "lead", "leads"],
  },
  {
    id: "produto",
    label: "Produto digital",
    shortLabel: "Produto",
    description: "Criação, estruturação e organização de e-books, cursos e infoprodutos.",
    keywords: ["ebook", "e-book", "livro", "produto digital", "infoproduto", "curso", "conteudo", "criar", "criacao"],
  },
  {
    id: "modelos",
    label: "Ferramentas e modelos",
    shortLabel: "Modelos",
    description: "Templates, checklists, roteiros, guias rápidos e materiais de apoio.",
    keywords: ["template", "templates", "checklist", "checklists", "modelo", "modelos", "planilha", "guia", "roteiro", "script"],
  },
  {
    id: "estrategia",
    label: "Negócio digital",
    shortLabel: "Estratégia",
    description: "Estratégia, funil, posicionamento, operação e visão do negócio.",
    keywords: ["negocio", "funil", "posicionamento", "estrategia", "marketing", "mercado", "operacao", "empreendedorismo"],
  },
  {
    id: "produtividade",
    label: "Produtividade",
    shortLabel: "Produtividade",
    description: "Foco, disciplina, organização, rotina e desenvolvimento pessoal.",
    keywords: ["produtividade", "disciplina", "foco", "mentalidade", "organizacao", "rotina", "habito", "habitos"],
  },
] as const;

type LibraryShelf = (typeof libraryShelves)[number];
type FilterId = "todos" | LibraryShelf["id"];
type SortMode = "recentes" | "az" | "za";

type EbookSummary = {
  id: number;
  title: string;
  summary?: string | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

type CatalogedEbook = {
  ebook: EbookSummary;
  shelf: LibraryShelf;
  searchableText: string;
};

const fallbackLibraryShelf = libraryShelves.find(shelf => shelf.id === "estrategia") ?? libraryShelves[0];

const filterOptions: Array<{ id: FilterId; label: string; shortLabel: string }> = [
  { id: "todos", label: "Todos", shortLabel: "Todos" },
  ...libraryShelves.map(shelf => ({ id: shelf.id, label: shelf.label, shortLabel: shelf.shortLabel })),
];

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function buildSearchableEbookText(ebook: EbookSummary) {
  return normalizeSearchText(`${ebook.title} ${ebook.summary ?? ""}`);
}

function classifyEbook(ebook: EbookSummary) {
  const searchableText = buildSearchableEbookText(ebook);
  const shelf = libraryShelves.find(item => item.keywords.some(keyword => searchableText.includes(keyword))) ?? fallbackLibraryShelf;
  return { ebook, shelf, searchableText };
}

function getSortableTime(value: EbookSummary["publishedAt"]) {
  if (!value) return 0;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getEbookRecencyScore(ebook: EbookSummary) {
  return Math.max(getSortableTime(ebook.publishedAt), getSortableTime(ebook.updatedAt), getSortableTime(ebook.createdAt), ebook.id);
}

function readRecentEbookIds() {
  if (typeof window === "undefined") return [] as number[];
  try {
    const stored = window.localStorage.getItem(recentEbooksStorageKey);
    if (!stored) return [] as number[];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [] as number[];
    return parsed.filter((id): id is number => Number.isInteger(id) && id > 0).slice(0, 5);
  } catch {
    return [] as number[];
  }
}

function storeRecentEbookIds(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(recentEbooksStorageKey, JSON.stringify(ids));
  } catch {
    // O histórico local é apenas conveniência visual; a leitura continua funcionando sem ele.
  }
}

function EbookCard({ item, isActive, onOpen, compact = false }: { item: CatalogedEbook; isActive: boolean; onOpen: (ebookId: number) => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.ebook.id)}
      aria-pressed={isActive}
      className={`group min-w-0 rounded-xl border text-left transition hover:border-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-300/60 ${compact ? "p-3" : "p-4"} ${isActive ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-black/25"}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
          <BookOpenText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-flex max-w-full rounded-full bg-emerald-300/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
            <span className="truncate">{item.shelf.label}</span>
          </span>
          <h3 className="mt-2 line-clamp-2 break-words text-sm font-semibold leading-snug text-white [overflow-wrap:anywhere]">
            {item.ebook.title}
          </h3>
          <p className="mt-1 line-clamp-3 break-words text-xs leading-5 text-zinc-400 [overflow-wrap:anywhere]">
            {item.ebook.summary || "Material de estudo publicado."}
          </p>
          <span className="mt-3 inline-flex text-xs font-semibold text-emerald-200 transition group-hover:text-emerald-100">
            {isActive ? "Leitura selecionada" : "Ler agora"}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function EbookReader() {
  const ebooks = trpc.member.ebooks.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("todos");
  const [sortMode, setSortMode] = useState<SortMode>("recentes");
  const [recentIds, setRecentIds] = useState<number[]>([]);

  useEffect(() => {
    if (selectedId === null && ebooks.data?.[0]) setSelectedId(ebooks.data[0].id);
  }, [ebooks.data, selectedId]);

  useEffect(() => {
    setRecentIds(readRecentEbookIds());
  }, []);

  const catalogedEbooks = useMemo(() => (ebooks.data ?? []).map(classifyEbook), [ebooks.data]);
  const shelfCounts = useMemo(() => {
    const counts = new Map<FilterId, number>([["todos", catalogedEbooks.length]]);
    catalogedEbooks.forEach(item => counts.set(item.shelf.id, (counts.get(item.shelf.id) ?? 0) + 1));
    return counts;
  }, [catalogedEbooks]);
  const filteredEbooks = useMemo(() => {
    const query = normalizeSearchText(searchTerm.trim());
    const items = catalogedEbooks.filter(item => {
      const matchesShelf = activeFilter === "todos" || item.shelf.id === activeFilter;
      const matchesSearch = !query || item.searchableText.includes(query);
      return matchesShelf && matchesSearch;
    });

    return [...items].sort((a, b) => {
      if (sortMode === "az") return a.ebook.title.localeCompare(b.ebook.title, "pt-BR");
      if (sortMode === "za") return b.ebook.title.localeCompare(a.ebook.title, "pt-BR");
      return getEbookRecencyScore(b.ebook) - getEbookRecencyScore(a.ebook);
    });
  }, [activeFilter, catalogedEbooks, searchTerm, sortMode]);
  const visibleGroups = useMemo(() => {
    const shelves = activeFilter === "todos" ? libraryShelves : libraryShelves.filter(shelf => shelf.id === activeFilter);
    return shelves
      .map(shelf => ({ shelf, items: filteredEbooks.filter(item => item.shelf.id === shelf.id) }))
      .filter(group => group.items.length > 0);
  }, [activeFilter, filteredEbooks]);
  const recentEbooks = useMemo(
    () => recentIds
      .map(id => catalogedEbooks.find(item => item.ebook.id === id))
      .filter((item): item is CatalogedEbook => Boolean(item))
      .slice(0, 4),
    [catalogedEbooks, recentIds]
  );
  const selectedCatalog = useMemo(
    () => catalogedEbooks.find(item => item.ebook.id === selectedId) ?? null,
    [catalogedEbooks, selectedId]
  );

  const selected = trpc.member.ebook.useQuery({ id: selectedId ?? 0 }, { enabled: selectedId !== null });
  const selectedSummary = ebooks.data?.find(ebook => ebook.id === selectedId);
  const readerTitle = selected.data?.title ?? selectedSummary?.title ?? "Abrindo e-book";
  const readerSummary = selected.data?.summary ?? selectedSummary?.summary ?? "Aguarde enquanto o material é carregado.";
  const usesTechFuturisticReader =
    selected.data?.htmlContent.includes("codigo-lucrativo-tech-shell") ||
    selectedCatalog?.shelf.id === "copy" ||
    selectedCatalog?.shelf.id === "vendas";

  const rememberEbook = (ebookId: number) => {
    setRecentIds(previous => {
      const next = [ebookId, ...previous.filter(id => id !== ebookId)].slice(0, 5);
      storeRecentEbookIds(next);
      return next;
    });
  };

  const openEbook = (ebookId: number) => {
    setSelectedId(ebookId);
    rememberEbook(ebookId);
    setReaderOpen(true);
  };

  const handleReaderOpenChange = (open: boolean) => {
    if (!open && typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    setReaderOpen(open);
  };

  const handleDialogEscape = (event: KeyboardEvent) => {
    if (typeof document === "undefined" || !document.fullscreenElement) return;
    event.preventDefault();
    void document.exitFullscreen().catch(() => undefined);
  };

  return (
    <DashboardLayout menuItems={menu} title="Biblioteca de execução">
      <main className="mx-auto w-full max-w-7xl min-w-0 space-y-7 overflow-x-hidden p-4 sm:p-8">
        <header className="min-w-0 space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Biblioteca de e-books</span>
          <h1 className="break-words text-2xl font-semibold leading-tight text-white sm:text-3xl">Acervo de materiais de estudo</h1>
          <p className="max-w-3xl break-words text-sm leading-6 text-zinc-300">
            Encontre rapidamente o e-book pelo tema que você precisa agora. A leitura abre em janela flutuante, sem sair da biblioteca.
          </p>
        </header>

        {ebooks.isLoading ? (
          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm text-zinc-300">
            <LoaderCircle className="size-4 animate-spin text-emerald-300" />
            Carregando biblioteca...
          </div>
        ) : ebooks.data?.length ? (
          <>
            {recentEbooks.length ? (
              <section className="min-w-0 rounded-2xl border border-emerald-300/15 bg-emerald-300/5 p-3 sm:p-5">
                <div className="mb-3 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-xs font-medium uppercase tracking-wider text-emerald-200">Continuar lendo</p>
                    <h2 className="mt-1 break-words text-lg font-semibold leading-snug text-white">Últimos e-books abertos</h2>
                  </div>
                  <p className="break-words text-xs leading-5 text-zinc-400">Atalho salvo neste dispositivo.</p>
                </div>
                <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {recentEbooks.map(item => (
                    <EbookCard key={`recent-${item.ebook.id}`} item={item} isActive={selectedId === item.ebook.id && readerOpen} onOpen={openEbook} compact />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-3 sm:p-5">
              <div className="mb-4 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {filteredEbooks.length} de {catalogedEbooks.length} materiais encontrados
                  </p>
                  <h2 className="mt-1 break-words text-lg font-semibold leading-snug text-white">Prateleiras da biblioteca</h2>
                  <p className="mt-1 max-w-2xl break-words text-xs leading-5 text-zinc-400">
                    Os e-books são agrupados automaticamente por tema a partir do título e resumo cadastrados.
                  </p>
                </div>
                <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_180px] lg:min-w-[520px]">
                  <label className="relative min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                    <input
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                      placeholder="Buscar por título ou assunto"
                      aria-label="Buscar e-books por título ou assunto"
                      className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/20"
                    />
                  </label>
                  <select
                    value={sortMode}
                    onChange={event => setSortMode(event.target.value as SortMode)}
                    aria-label="Ordenar e-books"
                    className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/20"
                  >
                    <option value="recentes">Mais recentes</option>
                    <option value="az">A-Z</option>
                    <option value="za">Z-A</option>
                  </select>
                </div>
              </div>

              <div className="-mx-3 mb-5 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
                <div className="flex min-w-max gap-2">
                  {filterOptions.map(option => {
                    const isActive = activeFilter === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setActiveFilter(option.id)}
                        aria-pressed={isActive}
                        className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300/60 ${isActive ? "border-emerald-300/70 bg-emerald-300/15 text-emerald-100" : "border-white/10 bg-black/20 text-zinc-300 hover:border-emerald-300/40 hover:text-white"}`}
                      >
                        {option.shortLabel}
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">{shelfCounts.get(option.id) ?? 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {visibleGroups.length ? (
                <div className="space-y-6">
                  {visibleGroups.map(group => (
                    <section key={group.shelf.id} className="min-w-0">
                      <div className="mb-3 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="break-words text-base font-semibold text-white">{group.shelf.label}</h3>
                          <p className="mt-1 max-w-2xl break-words text-xs leading-5 text-zinc-400">{group.shelf.description}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-zinc-500">
                          {group.items.length} {group.items.length === 1 ? "material" : "materiais"}
                        </span>
                      </div>
                      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {group.items.map(item => (
                          <EbookCard key={item.ebook.id} item={item} isActive={selectedId === item.ebook.id && readerOpen} onOpen={openEbook} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-6 text-center">
                  <LibraryBig className="mx-auto size-7 text-emerald-300" />
                  <h3 className="mt-3 break-words text-base font-semibold text-white">Nenhum e-book encontrado</h3>
                  <p className="mt-2 break-words text-sm leading-6 text-zinc-400">
                    Ajuste a busca ou selecione outra prateleira para ver os materiais disponíveis.
                  </p>
                </div>
              )}
            </section>

            <Dialog open={readerOpen} onOpenChange={handleReaderOpenChange}>
              <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={handleDialogEscape}
                className="!fixed !inset-0 !left-0 !top-0 grid !h-auto !max-h-none !w-auto !max-w-none !translate-x-0 !translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden overscroll-contain rounded-none border-white/10 bg-zinc-950 p-0 text-white shadow-2xl sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!h-[min(92dvh,920px)] sm:!max-h-[92dvh] sm:!w-[min(1120px,calc(100vw-2rem))] sm:!max-w-[min(1120px,calc(100vw-2rem))] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:rounded-2xl"
              >
                <DialogHeader className="min-w-0 border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)] text-left sm:px-5 sm:pt-5">
                  <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Leitura selecionada</span>
                      <DialogTitle className="mt-1 line-clamp-2 max-w-full break-words text-base font-semibold leading-snug text-white [overflow-wrap:anywhere] sm:text-xl">{readerTitle}</DialogTitle>
                      <DialogDescription className="mt-1 line-clamp-2 max-w-full break-words text-xs leading-5 text-zinc-400 [overflow-wrap:anywhere] sm:text-sm">
                        {readerSummary}
                      </DialogDescription>
                    </div>
                    <DialogClose asChild>
                      <button
                        type="button"
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-zinc-300 transition hover:border-emerald-300/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                        aria-label="Fechar leitor"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </DialogClose>
                  </div>
                </DialogHeader>

                <div className="min-h-0 min-w-0 overflow-hidden px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:p-4">
                  {selected.isLoading ? (
                    <div className="flex h-full min-h-[55dvh] min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/25 text-sm text-zinc-400">
                      <LoaderCircle className="size-4 animate-spin text-emerald-300" />
                      Abrindo e-book...
                    </div>
                  ) : selected.isError ? (
                    <div className="flex h-full min-h-[55dvh] min-w-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 p-6 text-center text-sm text-zinc-400">
                      Não foi possível carregar este material. Feche o leitor e tente abrir novamente.
                    </div>
                  ) : selected.data ? (
                    <ResponsiveEbookFrame
                      title={`Leitor de ${selected.data.title}`}
                      htmlContent={selected.data.htmlContent}
                      displayMode="modal"
                      readerVariant={usesTechFuturisticReader ? "tech-futuristic" : "default"}
                      className="h-full w-full min-w-0"
                    />
                  ) : (
                    <div className="flex h-full min-h-[55dvh] min-w-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 p-6 text-center text-sm text-zinc-400">
                      Selecione um e-book para iniciar a leitura.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <section className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-8 text-center">
            <LibraryBig className="mx-auto size-8 text-emerald-300" />
            <h2 className="mt-3 break-words text-lg font-medium text-white">Nenhum e-book publicado</h2>
            <p className="mt-2 break-words text-sm text-zinc-400">Quando a administração liberar materiais, eles aparecerão nesta biblioteca.</p>
          </section>
        )}
      </main>
    </DashboardLayout>
  );
}
