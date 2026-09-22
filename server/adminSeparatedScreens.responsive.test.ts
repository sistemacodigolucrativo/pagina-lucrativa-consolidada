import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("telas administrativas separadas e responsivas", () => {
  it("mantém Biblioteca de Recursos contida em mobile, tablet e desktop", () => {
    const source = read("client/src/pages/AdminPublications.tsx");
    expect(source).toContain("min-w-0 max-w-7xl");
    expect(source).toContain("overflow-x-clip");
    expect(source).toContain("break-words text-2xl");
    expect(source).toContain("min-[420px]:grid-cols-2");
    expect(source).toContain("sm:w-auto");
  });

  it("mantém o formulário da Biblioteca de Recursos fechado até o clique em Criar Conteúdo", () => {
    const source = read("client/src/pages/AdminPublications.tsx");
    expect(source).toContain("const [showInlineForm, setShowInlineForm] = useState(false)");
    expect(source).toContain("Criar Conteúdo");
    expect(source).toContain("!config.splitFlow && isPublicationManager && !isPublicationDraftScreen");
    expect(source).toContain("showInlineForm ? <section");
    expect(source).toContain("else setShowInlineForm(false)");
  });

  it("redireciona rotas legadas de Publicações para Biblioteca de Recursos e reposiciona rotas administrativas no topo", () => {
    const app = read("client/src/App.tsx");
    const publications = read("client/src/pages/AdminPublications.tsx");
    expect(app).toContain("function RouteScrollReset()");
    expect(app).toContain('document.querySelector<HTMLElement>(".dashboard-main")?.scrollTo');
    expect(app).toContain('path="/admin/publicacoes/rascunhos"');
    expect(app).toContain('path="/admin/publicacoes"');
    expect(app).toContain('<RedirectRoute to="/admin/biblioteca-recursos" />');
    expect(app).not.toContain('path="/admin/publicacoes/rascunhos" component={AdminPublications}');
    expect(app).not.toContain('path="/admin/publicacoes" component={AdminPublications}');
    expect(app).toContain('path="/admin/biblioteca-recursos" component={AdminPublications}');
    expect(publications).toContain('"/admin/biblioteca-recursos"');
    expect(publications).toContain("Biblioteca de Recursos");
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
