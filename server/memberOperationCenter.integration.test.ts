import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("central Minha operação", () => {
  it("exibe visão global e operações individuais no mesmo domínio", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(center).toContain("Visão geral");
    expect(center).toContain("Operações");
    expect(center).toContain("Tráfego");
    expect(center).toContain("Conversões");
    expect(center).toContain("Contatos");
    expect(center).toContain("Histórico");
    expect(center).toContain("Métricas exclusivas desta operação");
    expect(center).toContain("Ver métricas");
    expect(center).toContain("trpc.member.analytics.useQuery");
  });

  it("mantém links rastreáveis copiáveis e cria operações com origem", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(center).toContain("Copiar link");
    expect(center).toContain("Origem");
    expect(center).toContain("Meio");
    expect(center).toContain("Identificação do conteúdo");
    expect(center).toContain("/r/${encodeURIComponent(profileSlug)}");
    expect(center).toContain("navigator.clipboard.writeText");
  });

  it("mantém suporte em componente dedicado", async () => {
    const page = await readFile(path.join(root, "client/src/pages/MemberSupport.tsx"), "utf8");
    expect(page).toContain("Nova solicitação");
    expect(page).toContain("Minhas solicitações");
    expect(page).toContain("createTicket.mutate(form)");
    expect(page).not.toContain("Criar nova operação");
  });

  it("mantém destinos legados via redirect", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    expect(app).toContain('path="/membros/operacao" component={MemberOperationCenter}');
    expect(app).toContain('path="/membros/operacao/:campaignId" component={MemberOperationCenter}');
    expect(app).toContain('path="/membros/como-divulgar" component={MemberGettingStarted}');
    expect(app).toContain('path="/membros/historico" component={MemberLegacyRedirect}');
  });
});
