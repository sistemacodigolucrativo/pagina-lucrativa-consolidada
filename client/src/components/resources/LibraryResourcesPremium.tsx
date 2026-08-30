import {
  BookOpen,
  CheckSquare,
  ExternalLink,
  FileText,
  Grid2X2,
  Layers3,
  LayoutTemplate,
  List,
  Megaphone,
  Search,
  Sparkles,
  TableProperties,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type LibraryResource = {
  id: number;
  title: string;
  summary?: string | null;
  body?: string | null;
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
  if (type.includes("marketing") || type.includes("divulgação")) {
    return { icon: Megaphone, label: "MARKETING", badge: "border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300", hover: "hover:border-fuchsia-400/45", glow: "bg-fuchsia-500/10" };
  }
  return { icon: Layers3, label: resourceType?.trim().toUpperCase() || "RECURSO", badge: "border-indigo-500/30 bg-indigo-500/15 text-indigo-300", hover: "hover:border-indigo-400/45", glow: "bg-indigo-500/10" };
}

export default function LibraryResourcesPremium({ items, isLoading }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState<LibraryResource | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = useMemo(() => {
    const unique = [...new Set(items.map(item => item.resourceCategory?.trim()).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "pt-BR"));
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

  return (
    <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,.12),transparent_32%),radial-gradient(circle_at_88%_8%,rgba(6,182,212,.10),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 p-5 sm:p-7 lg:p-9">
        <header className="mb-8 border-b border-white/10 pb-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                <Sparkles className="size-4" /> Central de conhecimento
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Biblioteca de Recursos</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">Materiais práticos para acelerar sua divulgação, organização e operação digital em um só lugar.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500">Recursos</span>
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
                placeholder="Buscar recursos..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-neutral-900/75 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400/45 focus:ring-2 focus:ring-emerald-500/10"
              />
              {query ? <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/5 hover:text-white"><X className="size-4" /></button> : null}
            </label>

            <div className="flex items-center gap-2 self-end lg:self-auto">
              <button type="button" onClick={() => setViewMode("grid")} aria-label="Visualização em grade" className={`grid size-11 place-items-center rounded-xl border transition ${viewMode === "grid" ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-neutral-900/70 text-neutral-500 hover:text-white"}`}><Grid2X2 className="size-4" /></button>
              <button type="button" onClick={() => setViewMode("list")} aria-label="Visualização em lista" className={`grid size-11 place-items-center rounded-xl border transition ${viewMode === "list" ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-neutral-900/70 text-neutral-500 hover:text-white"}`}><List className="size-4" /></button>
            </div>
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
            <h2 className="text-sm font-bold text-white">Recursos disponíveis</h2>
            <p className="mt-1 text-xs text-neutral-500">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />)}
          </div>
        ) : filtered.length ? (
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
            {filtered.map(resource => {
              const config = getTypeConfig(resource.resourceType);
              const Icon = config.icon;
              return (
                <article
                  key={resource.id}
                  onClick={() => setSelected(resource)}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900/90 via-neutral-900/65 to-neutral-950/95 p-5 transition duration-300 ${config.hover} hover:-translate-y-1 hover:shadow-2xl ${viewMode === "list" ? "sm:flex sm:items-center sm:gap-5" : "min-h-56"}`}
                >
                  <div className={`pointer-events-none absolute -right-20 -top-20 size-44 rounded-full blur-3xl transition duration-500 ${config.glow} group-hover:scale-125`} />
                  <div className={`relative z-10 ${viewMode === "list" ? "sm:flex-1" : "flex h-full flex-col"}`}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-black tracking-[0.08em] ${config.badge}`}><Icon className="size-3.5" />{config.label}</span>
                      <span className="max-w-[45%] truncate text-[10px] uppercase tracking-[0.12em] text-neutral-600">{resource.resourceCategory || "Outros"}</span>
                    </div>
                    <h3 className="text-lg font-bold leading-snug text-white transition group-hover:text-emerald-200">{resource.title}</h3>
                    {resource.summary ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-400">{resource.summary}</p> : <p className="mt-3 text-sm leading-6 text-neutral-600">Abra os detalhes para conhecer este recurso.</p>}
                    <div className={`mt-auto flex items-center justify-between gap-3 ${viewMode === "grid" ? "pt-6" : "pt-4 sm:pt-3"}`}>
                      <span className="text-xs font-semibold text-emerald-300">Ver detalhes</span>
                      <span className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-neutral-400 transition group-hover:border-emerald-400/30 group-hover:text-emerald-300"><ExternalLink className="size-3.5" /></span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center">
            <Search className="mx-auto size-8 text-neutral-700" />
            <h3 className="mt-4 font-semibold text-white">Nenhum recurso encontrado</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">Tente outro termo de busca ou selecione uma categoria diferente.</p>
            {(query || category !== "Todos") ? <button type="button" onClick={() => { setQuery(""); setCategory("Todos"); }} className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/15">Limpar filtros</button> : null}
          </div>
        )}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label={`Detalhes de ${selected.title}`}>
          <button type="button" className="fixed inset-0 cursor-default" onClick={() => setSelected(null)} aria-label="Fechar detalhes" />
          <section className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_rgba(0,0,0,.75)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950/95 px-5 py-4 backdrop-blur sm:px-7">
              <button type="button" onClick={() => setSelected(null)} className="text-xs font-semibold text-neutral-400 transition hover:text-white">← Voltar à Biblioteca</button>
              <button type="button" onClick={() => setSelected(null)} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-neutral-400 transition hover:text-white" aria-label="Fechar"><X className="size-4" /></button>
            </div>
            <div className="overflow-y-auto p-5 sm:p-8">
              {(() => {
                const config = getTypeConfig(selected.resourceType);
                const Icon = config.icon;
                return <>
                  <div className="mb-5 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-black tracking-[0.08em] ${config.badge}`}><Icon className="size-3.5" />{config.label}</span><span className="rounded-md border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-neutral-500">{selected.resourceCategory || "Outros"}</span></div>
                  <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{selected.title}</h2>
                  {selected.summary ? <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">{selected.summary}</p> : null}
                  {selected.body ? <div className="mt-7 whitespace-pre-wrap border-t border-white/10 pt-6 text-sm leading-7 text-neutral-300">{selected.body}</div> : null}
                  {selected.resourceUrl ? <a href={selected.resourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-3 text-sm font-black text-neutral-950 shadow-[0_0_30px_rgba(16,185,129,.24)] transition hover:from-emerald-400 hover:to-emerald-300 sm:w-auto"><ExternalLink className="size-4" />Acessar recurso</a> : null}
                </>;
              })()}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
