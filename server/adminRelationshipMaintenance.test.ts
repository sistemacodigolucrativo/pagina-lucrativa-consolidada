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
    expect(source).not.toContain("hidden sm:flex");
    expect(source).not.toContain("hidden md:flex");
  });

  it("oferece busca, filtros e ciclo de atendimento no suporte", () => {
    const source = read("client/src/pages/AdminSupport.tsx");
    expect(source).toContain("const activeTickets = useMemo(");
    expect(source).toContain("const closedTickets = useMemo(");
    expect(source).toContain('"/admin/suporte/encerrados"');
    expect(source).toContain('item.status !== "closed"');
    expect(source).toContain("support-ticket-details-${item.id}");
    expect(source).toContain("Buscar assunto ou mensagem");
    expect(source).toContain('option value="auto"');
    expect(source).toContain('option value="closed"');
    expect(source).toContain("deleteTicket.mutate");
    expect(source).toContain("Excluir este ticket definitivamente?");
    const db = read("server/db.ts");
    const layout = read("client/src/components/DashboardLayout.tsx");
    expect(db).toContain('status: "open"');
    expect(db).toContain("const nextStatus =");
    expect(db).toContain("deleteAdminTicket");
    expect(db).toContain('type: "support_ticket_answered"');
    expect(db).toContain('entityType: "support_ticket"');
    expect(db).toContain("A administração respondeu seu ticket");
    expect(layout).toContain('notification.entityType === "support_ticket"');
    expect(layout).toContain("/membros/fale-conosco");
  });

  it("mantém exclusão de conteúdos e permite operar também sobre arquivados", () => {
    const source = read("client/src/pages/AdminPublications.tsx");
    expect(source).toContain("statusLabel(item.status)");
    expect(source).toContain("/api/admin/content-management/");
    expect(source).not.toContain('filter(item => item.status !== "archived")');
  });

  it("oferece moderação e exclusão explícita de agradecimentos", () => {
    const page = read("client/src/pages/AdminTestimonials.tsx");
    const endpoint = read("server/_core/adminRelationshipMaintenance.ts");
    expect(page).toContain("Gestão de agradecimentos");
    expect(page).toContain("Buscar membro ou conteúdo");
    expect(page).toContain("relationship-maintenance/testimonials");
    expect(page).toContain("Excluir");
    expect(endpoint).toContain("db.delete(memberTestimonials)");
  });
});
