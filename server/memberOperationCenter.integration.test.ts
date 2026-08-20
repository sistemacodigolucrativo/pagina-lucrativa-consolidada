import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("central Minha operação", () => {
  it("exibe as abas operacionais em um shell único", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(center).toContain("Visão geral");
    expect(center).toContain("Campanhas");
    expect(center).toContain("Tráfego");
    expect(center).toContain("Conversões");
    expect(center).toContain("Contatos");
    expect(center).toContain("Histórico");
    expect(center).toContain("trpc.member.analytics.useQuery");
    expect(center).toContain("trpc.member.conversions.useQuery");
  });

  it("mantém o link rastreável clicável e copiável dentro da central", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(center).toContain("Use este link para rastrear acessos vindos de");
    expect(center).toContain("Copiar link");
    expect(center).toContain("/r/${encodeURIComponent(profileSlug)}");
    expect(center).toContain("navigator.clipboard.writeText");
  });

  it("mantém o suporte separado da central e o exibe em Fale conosco", async () => {
    const page = await readFile(path.join(root, "client/src/pages/MemberOperations.tsx"), "utf8");
    expect(page).toContain('context.anchorId === "support" && <section id="support"');
    expect(page).toContain("Solicitar suporte");
    expect(page).toContain("createTicket.mutate(ticket)");
  });

  it("registra as rotas canônicas sem remover os destinos legados", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    expect(app).toContain('path="/membros/operacao" component={MemberOperationCenter}');
    expect(app).toContain('path="/membros/operacao/campanhas" component={MemberOperationCenter}');
    expect(app).toContain('path="/membros/operacao/trafego" component={MemberOperationCenter}');
    expect(app).toContain('path="/membros/como-divulgar" component={MemberOperations}');
    expect(app).toContain('path="/membros/historico" component={MemberTraffic}');
  });
});
