import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("manutenção administrativa de relacionamento", () => {
  it("mantém ações de membro acessíveis sem dependência de breakpoint desktop", () => {
    const source = read("client/src/pages/AdminReferrals.tsx");
    expect(source).toContain(">Editar</button>");
    expect(source).toContain("Desbloquear");
    expect(source).toContain(">Excluir</button>");
    expect(source).not.toContain('hidden sm:flex');
    expect(source).not.toContain('hidden md:flex');
  });

  it("oferece busca, filtros e ciclo de atendimento no suporte", () => {
    const source = read("client/src/pages/AdminSupport.tsx");
    expect(source).toContain('type TicketFilter = "all" | TicketStatus');
    expect(source).toContain("Buscar assunto ou mensagem");
    expect(source).toContain("Escreva uma resposta antes de marcar o ticket como respondido.");
    expect(source).toContain('option value="closed"');
  });

  it("mantém exclusão de conteúdos e permite operar também sobre arquivados", () => {
    const source = read("client/src/pages/AdminPublications.tsx");
    expect(source).toContain("statusLabel(item.status)");
    expect(source).toContain("/api/admin/content-management/");
    expect(source).not.toContain('filter(item => item.status !== "archived")');
  });

  it("oferece moderação e exclusão explícita de depoimentos", () => {
    const page = read("client/src/pages/AdminTestimonials.tsx");
    const endpoint = read("server/_core/adminRelationshipMaintenance.ts");
    expect(page).toContain("Gestão de depoimentos");
    expect(page).toContain("Buscar membro ou conteúdo");
    expect(page).toContain("relationship-maintenance/testimonials");
    expect(page).toContain(">Excluir</button>");
    expect(endpoint).toContain("db.delete(memberTestimonials)");
  });
});
