import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("AdminOffice — visão administrativa sem fila global de pedidos", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminOffice.tsx"), "utf8");

  it("mantém indicadores administrativos navegáveis sem consultar pedidos globais", () => {
    expect(source).toContain("office-stat-grid");
    expect(source).toContain('aria-label="Abrir Membros e Rede"');
    expect(source).toContain('onClick={() => openCard("/admin/membros")}');
    expect(source).toContain('aria-label="Abrir Suporte"');
    expect(source).toContain('onClick={() => openCard("/admin/suporte")}');
    expect(source).toContain("trpc.admin.overview.useQuery");
    expect(source).toContain("hasAttentionQueue ? (");
    expect(source).toContain("const hasAttentionQueue = openTickets > 0 || pendingTestimonials > 0");
    expect(source).toContain("const hasOperationalLog = !activities.isLoading && Boolean(activities.data?.length)");
    expect(source).toContain("Biblioteca de Recursos");
    expect(source).toContain('onClick={() => openCard("/admin/biblioteca-recursos")}');
    expect(source).not.toContain("disabled aria-disabled");
    expect(source).not.toContain("trpc.admin.academy.list.useQuery");
    expect(source).not.toContain("const COURSES_PER_PAGE = 10");
    expect(source).not.toContain("Trilhas ativas na Academia");
    expect(source).not.toContain("setCoursesPage");
    expect(source).not.toContain('eyebrow="Panorama real"');
    expect(source).not.toContain("Nenhuma atividade recente registrada.");
    expect(source).not.toContain("draftContent} {attentionLabel(draftContent");
    expect(source).not.toContain("office-workspace");
    expect(source).not.toContain("trpc.admin.applications.useQuery");
    expect(source).not.toContain("Pedidos recentes");
    expect(source).not.toContain("Pedidos pendentes");
    expect(source).not.toContain("Pedidos aprovados");
    expect(source).not.toContain("office-list-mobile-date");
    expect(source).not.toContain("office-list-desktop-date");
  });
});
