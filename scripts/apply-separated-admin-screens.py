from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"Trecho não encontrado em {path}: {old[:140]!r}")
    p.write_text(text.replace(old, new, 1))


app = "client/src/App.tsx"
replace_once(app,
    '    <Route path="/admin/ebooks" component={AdminEbooks} />',
    '    <Route path="/admin/ebooks/novo" component={AdminEbooks} />\n    <Route path="/admin/ebooks/:ebookId/editar" component={AdminEbooks} />\n    <Route path="/admin/ebooks" component={AdminEbooks} />')
replace_once(app,
    '    <Route path="/admin/relatos" component={AdminTestimonials} />',
    '    <Route path="/admin/relatos/em-analise" component={AdminTestimonials} />\n    <Route path="/admin/relatos/aprovados" component={AdminTestimonials} />\n    <Route path="/admin/relatos/necessita-ajuste" component={AdminTestimonials} />\n    <Route path="/admin/relatos/arquivados" component={AdminTestimonials} />\n    <Route path="/admin/relatos" component={AdminTestimonials} />')

pub = "client/src/pages/AdminPublications.tsx"
replace_once(pub,
    '<main className="mx-auto w-full max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">',
    '<main className="mx-auto w-full min-w-0 max-w-7xl space-y-7 overflow-x-clip p-4 sm:p-6 lg:p-8">')
replace_once(pub,
    '<header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">{config.eyebrow}</span><h1 className="text-3xl font-semibold text-white">{config.title}</h1>',
    '<header className="min-w-0 space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">{config.eyebrow}</span><h1 className="break-words text-2xl font-semibold text-white sm:text-3xl">{config.title}</h1>')
replace_once(pub,
    '<form onSubmit={submit} className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">',
    '<form onSubmit={submit} className="min-w-0 space-y-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">')
replace_once(pub,
    '{config.kind === "material" ? <section className="space-y-4 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">',
    '{config.kind === "material" ? <section className="min-w-0 space-y-4 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3 sm:p-4">')
replace_once(pub,
    '<div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-zinc-200">Categoria do recurso',
    '<div className="grid min-w-0 gap-4 sm:grid-cols-2"><label className="min-w-0 text-sm text-zinc-200">Categoria do recurso')
replace_once(pub,
    '</select></label><label className="block text-sm text-zinc-200">Tipo do recurso',
    '</select></label><label className="min-w-0 text-sm text-zinc-200">Tipo do recurso')
replace_once(pub,
    '<div className="flex flex-wrap gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">',
    '<div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3"><button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 sm:w-auto">')
replace_once(pub,
    '{editingId ? <button type="button" onClick={reset} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200">Cancelar</button> : null}</div>',
    '{editingId ? <button type="button" onClick={reset} className="w-full rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 sm:w-auto">Cancelar</button> : null}</div>')
replace_once(pub,
    '<section className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">',
    '<section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">')
replace_once(pub,
    '<article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4">',
    '<article key={item.id} className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4">')
replace_once(pub,
    '<div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex">',
    '<div className="grid w-full min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:w-auto sm:flex">')

ebooks = "client/src/pages/AdminEbooks.tsx"
replace_once(ebooks,
    'import { ExternalLink, FileText, GraduationCap, PlusCircle, Save, UploadCloud, X } from "lucide-react";',
    'import { ArrowLeft, ExternalLink, FileText, GraduationCap, PlusCircle, Save, UploadCloud, X } from "lucide-react";')
replace_once(ebooks,
    '  const [location] = useLocation();\n  const isLibraryAdmin = location.startsWith("/admin/ebooks");',
    '  const [location, setLocation] = useLocation();\n  const isLibraryAdmin = location.startsWith("/admin/ebooks");\n  const libraryCreateMode = location === "/admin/ebooks/novo";\n  const libraryEditMatch = location.match(/^\\/admin\\/ebooks\\/(\\d+)\\/editar$/);\n  const libraryEditId = libraryEditMatch ? Number(libraryEditMatch[1]) : null;\n  const isLibraryFormScreen = isLibraryAdmin && (libraryCreateMode || libraryEditId !== null);')
replace_once(ebooks,
    '  const [selectedId, setSelectedId] = useState<number | null>(null);',
    '  const [selectedId, setSelectedId] = useState<number | null>(() => libraryEditId);')
replace_once(ebooks,
    '  useEffect(() => {\n    setFormOpen(!isLibraryAdmin);\n  }, [isLibraryAdmin]);',
    '  useEffect(() => {\n    if (!isLibraryAdmin) {\n      setFormOpen(true);\n      return;\n    }\n    setSelectedId(libraryEditId);\n    setFormOpen(isLibraryFormScreen);\n    if (libraryCreateMode) setForm(newForm("library"));\n  }, [isLibraryAdmin, isLibraryFormScreen, libraryCreateMode, libraryEditId]);')
replace_once(ebooks,
    '      if (isLibraryAdmin) setFormOpen(false);\n      toast.success(isLibraryAdmin ? "E-book criado." : "Material da Academia criado.");',
    '      if (isLibraryAdmin) {\n        setFormOpen(false);\n        setLocation("/admin/ebooks");\n      }\n      toast.success(isLibraryAdmin ? "E-book criado." : "Material da Academia criado.");')
replace_once(ebooks,
    '    onSuccess: () => {\n      void refresh();\n      toast.success("Material atualizado.");\n    },',
    '    onSuccess: () => {\n      void refresh();\n      if (isLibraryAdmin) setLocation("/admin/ebooks");\n      toast.success("Material atualizado.");\n    },')
replace_once(ebooks,
    '  const closeForm = () => {\n    setSelectedId(null);\n    setForm(newForm(defaultUsage));\n    if (isLibraryAdmin) setFormOpen(false);\n  };',
    '  const closeForm = () => {\n    setSelectedId(null);\n    setForm(newForm(defaultUsage));\n    if (isLibraryAdmin) {\n      setFormOpen(false);\n      setLocation("/admin/ebooks");\n    }\n  };')
replace_once(ebooks,
    '  const openNewForm = () => {\n    setSelectedId(null);\n    setForm(newForm(defaultUsage));\n    setFormOpen(true);\n  };',
    '  const openNewForm = () => {\n    if (isLibraryAdmin) {\n      setLocation("/admin/ebooks/novo");\n      return;\n    }\n    setSelectedId(null);\n    setForm(newForm(defaultUsage));\n    setFormOpen(true);\n  };')
replace_once(ebooks,
    '  const openExisting = (id: number) => {\n    setSelectedId(id);\n    setFormOpen(true);\n  };',
    '  const openExisting = (id: number) => {\n    if (isLibraryAdmin) {\n      setLocation(`/admin/ebooks/${id}/editar`);\n      return;\n    }\n    setSelectedId(id);\n    setFormOpen(true);\n  };')
replace_once(ebooks,
    '  return (\n    <DashboardLayout menuItems={adminMenu} title="Administração">',
    '  const libraryPageTitle = libraryCreateMode ? "Novo e-book" : libraryEditId !== null ? "Editar e-book" : "Biblioteca de e-books";\n  const libraryPageDescription = libraryCreateMode\n    ? "Cadastre o novo PDF em uma tela dedicada, preservando as regras da Biblioteca e da Academia."\n    : libraryEditId !== null\n      ? "Edite somente o e-book selecionado em uma tela dedicada e retorne à listagem ao concluir."\n      : "Controle e-books independentes da Biblioteca e materiais que também podem aparecer na Academia.";\n\n  return (\n    <DashboardLayout menuItems={adminMenu} title="Administração">')
replace_once(ebooks,
    '<h1 className="text-2xl font-semibold text-white sm:text-3xl">{isLibraryAdmin ? "Biblioteca de e-books" : "Academia"}</h1>',
    '<h1 className="break-words text-2xl font-semibold text-white sm:text-3xl">{isLibraryAdmin ? libraryPageTitle : "Academia"}</h1>')
replace_once(ebooks,
    '{isLibraryAdmin ? "Controle e-books independentes da Biblioteca e materiais que também podem aparecer na Academia." : "Publique cursos em PDF, organize os materiais em sequência e entregue tudo no leitor da Academia."}',
    '{isLibraryAdmin ? libraryPageDescription : "Publique cursos em PDF, organize os materiais em sequência e entregue tudo no leitor da Academia."}')
replace_once(ebooks,
    '<section className={isLibraryAdmin ? "grid gap-5" : "grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start"}>',
    '<section className={isLibraryAdmin ? "grid min-w-0 gap-5" : "grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start"}>')
replace_once(ebooks,
    '<aside className={isLibraryAdmin ? "order-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-3" : "order-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-3 lg:order-1"}>',
    '<aside className={isLibraryAdmin ? (isLibraryFormScreen ? "hidden" : "order-2 min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-3") : "order-2 min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-3 lg:order-1"}>')
replace_once(ebooks,
    '<X className="size-4" />\n                    {selectedId ? "Fechar edição" : "Fechar formulário"}',
    '{isLibraryAdmin ? <ArrowLeft className="size-4" /> : <X className="size-4" />}\n                    {isLibraryAdmin ? "Voltar para e-books" : selectedId ? "Fechar edição" : "Fechar formulário"}')
replace_once(ebooks,
    '<section className={isLibraryAdmin ? "order-1 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5" : "rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5"}>',
    '<section className={isLibraryAdmin ? (isLibraryFormScreen ? "hidden" : "order-1 min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5") : "min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5"}>')

test = Path("server/adminSeparatedScreens.responsive.test.ts")
test.write_text('''import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("telas administrativas separadas e responsivas", () => {
  it("mantém Publicações contida em mobile, tablet e desktop", () => {
    const source = read("client/src/pages/AdminPublications.tsx");
    expect(source).toContain("min-w-0 max-w-7xl");
    expect(source).toContain("overflow-x-clip");
    expect(source).toContain("break-words text-2xl");
    expect(source).toContain("min-[420px]:grid-cols-2");
    expect(source).toContain("sm:w-auto");
  });

  it("abre criação e edição de e-books em rotas independentes", () => {
    const app = read("client/src/App.tsx");
    const ebooks = read("client/src/pages/AdminEbooks.tsx");
    expect(app).toContain("/admin/ebooks/novo");
    expect(app).toContain("/admin/ebooks/:ebookId/editar");
    expect(ebooks).toContain('setLocation("/admin/ebooks/novo")');
    expect(ebooks).toContain('setLocation(`/admin/ebooks/${id}/editar`)');
    expect(ebooks).toContain('isLibraryFormScreen ? "hidden"');
    expect(ebooks).toContain('"Voltar para e-books"');
    expect(ebooks).toContain("sm:p-5");
  });

  it("abre cada fila de agradecimentos em uma rota independente", () => {
    const app = read("client/src/App.tsx");
    const testimonials = read("client/src/pages/AdminTestimonials.tsx");
    for (const route of ["/admin/relatos/em-analise", "/admin/relatos/aprovados", "/admin/relatos/necessita-ajuste", "/admin/relatos/arquivados"]) {
      expect(app).toContain(route);
      expect(testimonials).toContain(route);
    }
    expect(testimonials).toContain("setLocation(statusPaths[status])");
    expect(testimonials).toContain("Voltar para Agradecimentos");
    expect(testimonials).toContain("sm:grid-cols-2 lg:grid-cols-5");
    expect(testimonials).toContain("lg:grid-cols-[minmax(0,1fr)_180px_auto]");
  });
});
''')
