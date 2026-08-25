import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("AdminOffice — visão administrativa sem fila global de pedidos", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminOffice.tsx"), "utf8");

  it("mantém indicadores e módulos administrativos ativos sem consultar pedidos globais", () => {
    expect(source).toContain("office-stat-grid");
    expect(source).toContain("office-workspace");
    expect(source).toContain("trpc.admin.overview.useQuery");
    expect(source).not.toContain("trpc.admin.applications.useQuery");
    expect(source).not.toContain("Pedidos recentes");
    expect(source).not.toContain("Pedidos pendentes");
    expect(source).not.toContain("Pedidos aprovados");
    expect(source).not.toContain("office-list-mobile-date");
    expect(source).not.toContain("office-list-desktop-date");
  });
});
