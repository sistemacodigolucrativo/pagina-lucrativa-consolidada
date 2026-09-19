import {
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  FileText,
  Layers3,
  LayoutTemplate,
  Megaphone,
  Search,
  Sparkles,
  TableProperties,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type LibraryResource = {
  id: number;
  title: string;
  summary?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  resourceUrl?: string | null;
  resourceCategory?: string | null;
  resourceType?: string | null;
};

type Props = {
  items: LibraryResource[];
  isLoading: boolean;
};

type TypeConfig = {
  icon: LucideIcon;
  label: string;
  badge: string;
  hover: string;
  glow: string;
};

function normalize(value?: string | null) {
  return (value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function getTypeConfig(resourceType?: string | null): TypeConfig {
  const type = normalize(resourceType);
  if (type.includes("ebook") || type.includes("e-book") || type.includes("livro")) {
    return { icon: BookOpen, label: "E-BOOK", badge: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300", hover: "hover:border-emerald-400/45", glow: "bg-emerald-500/10" };
  }
  if (type.includes("planilha") || type.includes("xlsx") || type.includes("excel")) {
    return { icon: TableProperties, label: "PLANILHA", badge: "border-blue-500/30 bg-blue-500/15 text-blue-300", hover: "hover:border-blue-400/45", glow: "bg-blue-500/10" };
  }
  if (type.includes("template") || type.includes("modelo")) {
    return { icon: LayoutTemplate, label: "TEMPLATE", badge: "border-violet-500/30 bg-violet-500/15 text-violet-300", hover: "hover:border-violet-400/45", glow: "bg-violet-500/10" };
  }
  if (type.includes("prompt") || type.includes("ia")) {
    return { icon: Sparkles, label: "PROMPT IA", badge: "border-amber-500/30 bg-amber-500/15 text-amber-300", hover: "hover:border-amber-400/45", glow: "bg-amber-500/10" };
  }
  if (type.includes("checklist")) {
    return { icon: CheckSquare, label: "CHECKLIST", badge: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300", hover: "hover:border-cyan-400/45", glow: "bg-cyan-500/10" };
  }
  if (type.includes("script")) {
    return { icon: FileText, label: "SCRIPT", badge: "border-rose-500/30 bg-rose-500/15 text-rose-300", hover: "hover:border-rose-400/45", glow: "bg-rose-500/10" };
  }
  if (type.includes("ferrament") || type.includes("tool")) {
    return { icon: Wrench, label: "FERRAMENTA", badge: "border-orange-500/30 bg-orange-500/15 text-orange-300", hover: "hover:border-orange-400/45", glow: "bg-orange-500/10" };
  }
  if (type.includes("marketing") || type.includes("divulgação") || type.includes("banner") || type.includes("copy")) {
    return { icon: Megaphone, label: resourceType?.trim().toUpperCase() || "MARKETING", badge: "border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300", hover: "hover:border-fuchsia-400/45", glow: "bg-fuchsia-500/10" };
  }
  return { icon: Layers3, label: resourceType?.trim().toUpperCase() || "RECURSO", badge: "border-indigo-500/30 bg-indigo-500/15 text-indigo-300", hover: "hover:border-indigo-400/45", glow: "bg-indigo-500/10" };
}

const ITEMS_PER_PAGE = 10;

export default function LibraryResourcesPremium({ items, isLoading }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<LibraryResource | null>(null);

  const copy = {
    eyebrow: "Biblioteca de recursos",
    title: "Biblioteca de Recursos",
    description: "Materiais práticos para acelerar sua divulgação, organização e operação digital em um só lugar.",
    countLabel: "Recursos",
    searchPlaceholder: "Buscar recursos...",
    sectionTitle: "Recursos disponíveis",
    emptyTitle: "Nenhum recurso encontrado",
    emptyDescription: "Tente outro termo de busca ou selecione uma categoria diferente.",
    actionLabel: "Acessar recurso",
  };

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map(item => item.resourceCategory?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return ["Todos", ...unique];
  }, [items]);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return items.filter(item => {
      const matchesCategory = category === "Todos" || item.resourceCategory === category;
      const haystack = normalize([item.title, item.summary, item.resourceCategory, item.resourceType].filter(Boolean).join(" "));
      return matchesCategory && (!needle || haystack.includes(needle));
    });
  }, [category, items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
    setActiveId(null);
  }, [category, query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,.12),transparent_32%),radial-gradient(circle_at_88%_8%,rgba(6,182,212,.10),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 p-5 sm:p-7 lg:p-9">
        <header className="mb-8 border-b border-white/10 pb-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                <Sparkles className="size-4" /> {copy.eyebrow}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{copy.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">{copy.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500">{copy.countLabel}</span>
                <strong className="mt-1 block text-xl text-white">{items.length}</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500">Categorias</span>
                <strong className="mt-1 block text-xl text-white">{Math.max(categories.length - 1, 0)}</strong>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-7 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-xl">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="h-12 w-full rounded-2xl border border-white/10 bg-neutral-900/75 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400/45 focus:ring-2 focus:ring-emerald-500/10"
              />
              {query ? <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/5 hover:text-white"><X className="size-4" /></button> : null}
            </label>

            <span className="self-end rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-xs font-semibold text-neutral-400 lg:self-auto">Lista paginada</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${category === item ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,.08)]" : "border-white/10 bg-neutral-900/60 text-neutral-400 hover:border-white/20 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white">{copy.sectionTitle}</h2>
          <p className="mt-1 text-xs text-neutral-500">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"} · Página {page} de {totalPages}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />)}
          </div>
        ) : filtered.length ? (
          <>
          <div className="space-y-3">
            {paginated.map(resource => {
              const config = getTypeConfig(resource.resourceType);
              const Icon = config.icon;
              const expanded = activeId === resource.id;
              const panelId = `resource-panel-${resource.id}`;
              return (
                <article
                  key={resource.id}
                  className={`overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 transition ${expanded ? "border-emerald-400/35 shadow-[0_0_30px_rgba(16,185,129,.08)]" : config.hover}`}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setActiveId(expanded ? null : resource.id)}
                    className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.025] sm:px-5"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl border ${config.badge}`}><Icon className="size-4" /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-white sm:text-base">{resource.title}</span>
                        <span className="mt-0.5 block truncate text-xs uppercase tracking-[0.12em] text-neutral-500">{resource.resourceCategory || "Outros"} · {config.label}</span>
                      </span>
                    </span>
                    {expanded ? <ChevronUp className="size-5 shrink-0 text-emerald-300" /> : <ChevronDown className="size-5 shrink-0 text-neutral-500" />}
                  </button>

                  {expanded ? (
                    <div id={panelId} className="border-t border-white/10 px-4 py-4 sm:px-5">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,160px)_minmax(0,1fr)] md:items-start">
                        {resource.imageUrl ? (
                          <button type="button" onClick={() => setPreviewImage(resource)} className="group/image overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70">
                            <img src={resource.imageUrl} alt={`Miniatura de ${resource.title}`} loading="lazy" className="aspect-video w-full object-cover transition group-hover/image:scale-[1.02] md:h-24" />
                            <span className="block px-3 py-2 text-xs font-semibold text-emerald-200">Ampliar imagem</span>
                          </button>
                        ) : null}
                        <div className="min-w-0">
                          {resource.summary ? <p className="text-sm leading-6 text-neutral-300">{resource.summary}</p> : null}
                          {resource.body ? <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-400">{resource.body}</div> : !resource.summary ? <p className="text-sm leading-6 text-neutral-500">Sem descrição adicional.</p> : null}
                          {resource.resourceUrl ? <a href={resource.resourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2.5 text-sm font-black text-neutral-950 shadow-[0_0_30px_rgba(16,185,129,.18)] transition hover:from-emerald-400 hover:to-emerald-300 sm:w-auto"><ExternalLink className="size-4" />{copy.actionLabel}</a> : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-3 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Exibindo {paginated.length} de {filtered.length} recurso(s).</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-neutral-200 disabled:cursor-not-allowed disabled:opacity-45"><ChevronLeft className="size-4" />Anterior</button>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-neutral-200 disabled:cursor-not-allowed disabled:opacity-45">Próxima<ChevronRight className="size-4" /></button>
            </div>
          </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center">
            <Search className="mx-auto size-8 text-neutral-700" />
            <h3 className="mt-4 font-semibold text-white">{copy.emptyTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">{copy.emptyDescription}</p>
            {(query || category !== "Todos") ? <button type="button" onClick={() => { setQuery(""); setCategory("Todos"); }} className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/15">Limpar filtros</button> : null}
          </div>
        )}
      </div>

      {previewImage?.imageUrl ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label={`Imagem de ${previewImage.title}`}>
          <button type="button" className="fixed inset-0 cursor-default" onClick={() => setPreviewImage(null)} aria-label="Fechar imagem" />
          <section className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_rgba(0,0,0,.75)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950/95 px-5 py-4 backdrop-blur sm:px-7">
              <span className="min-w-0 truncate text-sm font-semibold text-white">{previewImage.title}</span>
              <button type="button" onClick={() => setPreviewImage(null)} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-neutral-400 transition hover:text-white" aria-label="Fechar"><X className="size-4" /></button>
            </div>
            <div className="overflow-y-auto bg-black p-3 sm:p-5">
              <img src={previewImage.imageUrl} alt={`Imagem de ${previewImage.title}`} className="mx-auto max-h-[78vh] w-auto max-w-full rounded-xl object-contain" />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
