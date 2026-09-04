import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const pages = [
  "MemberReceiving.tsx",
  "MemberTestimonial.tsx",
] as const;

describe("member operational pages responsive hierarchy", () => {
  it.each(pages)("keeps the primary mechanism before secondary content on mobile: %s", fileName => {
    const source = readFileSync(path.join(process.cwd(), "client/src/pages", fileName), "utf8");
    expect(source).toContain('min-w-0');
    expect(source).toContain('order-1');
    expect(source).toContain('order-2');
  });

  it("keeps desktop column order explicit where the mobile order is meaningful", () => {
    const profile = readFileSync(path.join(process.cwd(), "client/src/pages/MemberProfile.tsx"), "utf8");
    expect(profile).toContain('lg:order-1');
    expect(profile).toContain('lg:order-2');
  });

  it("mantém o retorno das métricas de campanha responsivo no mobile", () => {
    const operationCenter = readFileSync(path.join(process.cwd(), "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(operationCenter).toContain('sm:flex-row sm:items-center sm:justify-between');
    expect(operationCenter).toContain('inline-flex min-h-10 w-fit');
    expect(operationCenter).toContain('break-words text-2xl');
  });

  it("preserva a posição do menu mobile ao navegar em itens baixos", () => {
    const layout = readFileSync(path.join(process.cwd(), "client/src/components/DashboardLayout.tsx"), "utf8");
    expect(layout).toContain("dashboard-menu-scroll");
    expect(layout).toContain('data-dashboard-sidebar-content="true"');
    expect(layout).toContain("storeSidebarScroll(event.currentTarget.scrollTop)");
    expect(layout).toContain('scrollIntoView({ block: "center" })');
  });

  it("exibe o Modo Administrativo somente para administradores", () => {
    const layout = readFileSync(path.join(process.cwd(), "client/src/components/DashboardLayout.tsx"), "utf8");
    expect(layout).toContain('{user?.role === "admin" ? (');
    expect(layout).toContain("Modo Administrativo");
    expect(layout).toContain("Modo Membro");
    expect(layout).not.toContain('disabled={user?.role !== "admin"}');
  });
});
