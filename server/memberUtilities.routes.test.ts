import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("rotas funcionais do Escritório Virtual", () => {
  const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("usa páginas dedicadas para onboarding, suporte e central operacional", () => {
    expect(appSource).toContain('<Route path="/membros/como-divulgar" component={MemberGettingStarted} />');
    expect(appSource).toContain('<Route path="/membros/fale-conosco" component={MemberSupport} />');
    expect(appSource).toContain('<Route path="/membros/operacao" component={MemberOperationCenter} />');
    expect(appSource).toContain('<Route path="/membros/operacao/:campaignId" component={MemberOperationCenter} />');
  });

  it("mantém configurações privadas em telas próprias", () => {
    expect(appSource).toContain('<Route path="/membros/meus-dados" component={MemberAccount} />');
    expect(appSource).toContain('<Route path="/membros/configuracoes" component={MemberProfile} />');
    expect(appSource).toContain('<Route path="/membros/recebimentos" component={MemberReceiving} />');
  });

  it("redireciona atalhos legados em vez de reativar componentes multipropósito", () => {
    expect(appSource).toContain('<Route path="/membros/campanhas" component={MemberLegacyRedirect} />');
    expect(appSource).toContain('<Route path="/membros/convites" component={MemberLegacyRedirect} />');
    expect(appSource).toContain('<Route path="/membros/automacoes" component={MemberLegacyRedirect} />');
    expect(appSource).toContain('<Route path="/membros/patrocinador" component={MemberLegacyRedirect} />');
  });
});
