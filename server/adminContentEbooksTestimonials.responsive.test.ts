import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("anotações administrativas — publicações, e-books e agradecimentos", () => {
  it("mantém Publicações responsiva e remove configurações internas da listagem", () => {
    const source = read("client/src/pages/AdminPublications.tsx");
    expect(source).toContain("SYSTEM_CONTENT_CATEGORIES");
    expect(source).toContain('"public-sales-copy"');
    expect(source).toContain('"public-sales-layout"');
    expect(source).toContain('"member-admin-control"');
    expect(source).toContain('"public-toast-config"');
    expect(source).toContain('if (config.kind === "notice" && SYSTEM_CONTENT_CATEGORIES.has(item.resourceCategory ?? "")) return false;');
    expect(source).toContain("p-4 sm:p-6 lg:p-8");
    expect(source).toContain("min-w-0");
    expect(source).toContain("overflow-x-clip");
    expect(source).toContain("[overflow-wrap:anywhere]");
    expect(source).toContain("grid w-full min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:w-auto sm:flex");
  });

  it("padroniza Biblioteca de Recursos e Material de Divulgação com listagem e formulários independentes", () => {
    const source = read("client/src/pages/AdminPublications.tsx");
    const routes = read("client/src/App.tsx");
    expect(source).toContain('splitFlow: true');
    expect(source).toContain('normalizedLocation === `${config.basePath}/novo`');
    expect(source).toContain('setLocation(`${config.basePath}/novo`)');
    expect(source).toContain('setLocation(`${config.basePath}/${item.id}/editar`)');
    expect(source).toContain('onSuccess: () => { void refresh(); toast.success("Conteúdo registrado."); if (config.splitFlow) goToList()');
    expect(source).toContain('Conteúdos cadastrados');
    expect(source).toContain('onClick={openCreate}');
    expect(source).toContain('Voltar para {config.title}');
    expect(source).toContain('overflow-x-clip p-4 sm:p-6 lg:p-8');
    expect(routes).toContain('/admin/material-divulgacao/novo');
    expect(routes).toContain('/admin/material-divulgacao/:contentId/editar');
    expect(routes).toContain('/admin/biblioteca-recursos/novo');
    expect(routes).toContain('/admin/biblioteca-recursos/:contentId/editar');
  });

  it("mostra Todos os agradecimentos em prévia expansível sem remover as páginas por status", () => {
    const source = read("client/src/pages/AdminTestimonials.tsx");
    expect(source).toContain('const [expandedIds, setExpandedIds]');
    expect(source).toContain('function toggleExpanded(id: number)');
    expect(source).toContain('id="testimonial-all-list"');
    expect(source).toContain('Todos os agradecimentos');
    expect(source).toContain('aria-expanded={expanded}');
    expect(source).toContain('line-clamp-3');
    expect(source).toContain('Ver agradecimento completo');
    expect(source).toContain('Recolher agradecimento');
    expect(source).toContain('overflow-x-clip p-4 sm:space-y-7 sm:p-6 lg:p-8');
    expect(source).toContain('onClick={() => setLocation(statusPaths[status])}');
  });

  it("mantém os cards das páginas por status super slim e expande as ações administrativas sob demanda", () => {
    const source = read("client/src/pages/AdminTestimonials.tsx");
    expect(source).toContain('const detailsId = `testimonial-moderation-details-${item.id}`');
    expect(source).toContain('aria-controls={detailsId}');
    expect(source).toContain('min-h-11 w-full min-w-0 items-center');
    expect(source).toContain('{expanded ? "Recolher" : "Expandir"}');
    expect(source).toContain('{expanded ? (');
    expect(source).toContain('Nota privada para o membro');
    expect(source).toContain('<select value={item.status}');
    expect(source).toContain('Salvar nota');
    expect(source).toContain('>Excluir</button>');
  });

  it("organiza Biblioteca de e-books com criação e edição em telas independentes", () => {
    const source = read("client/src/pages/AdminEbooks.tsx");
    expect(source).toContain('const libraryCreateMode = location === "/admin/ebooks/novo"');
    expect(source).toContain("const libraryEditId = libraryEditMatch ? Number(libraryEditMatch[1]) : null");
    expect(source).toContain("const isLibraryFormScreen");
    expect(source).toContain("const openNewForm = () =>");
    expect(source).toContain('setLocation("/admin/ebooks/novo")');
    expect(source).toContain("const openExisting = (id: number) =>");
    expect(source).toContain('setLocation(`/admin/ebooks/${id}/editar`)');
    expect(source).toContain("onClick={openNewForm}");
    expect(source).toContain("onClick={() => openExisting(ebook.id)}");
    expect(source).toContain("(!isLibraryAdmin || formOpen) ? <form");
    expect(source).toContain('isLibraryAdmin ? "grid min-w-0 gap-5"');
    expect(source).toContain('isLibraryFormScreen ? "hidden"');
    expect(source).toContain('"Voltar para e-books"');
  });

  it("faz os cards de agradecimentos abrirem listas independentes pelo status real", () => {
    const source = read("client/src/pages/AdminTestimonials.tsx");
    expect(source).toContain("const statusPaths");
    expect(source).toContain('pending: "/admin/relatos/em-analise"');
    expect(source).toContain('approved: "/admin/relatos/aprovados"');
    expect(source).toContain('rejected: "/admin/relatos/necessita-ajuste"');
    expect(source).toContain('archived: "/admin/relatos/arquivados"');
    expect(source).toContain("onClick={() => setLocation(statusPaths[status])}");
    expect(source).toContain("if (item.status !== activeStatus) return false;");
    expect(source).toContain('pending: all.filter(item => item.status === "pending").length');
    expect(source).toContain('approved: all.filter(item => item.status === "approved").length');
    expect(source).toContain('rejected: all.filter(item => item.status === "rejected").length');
    expect(source).toContain('archived: all.filter(item => item.status === "archived").length');
    expect(source).toContain("Voltar para Agradecimentos");
  });
});
