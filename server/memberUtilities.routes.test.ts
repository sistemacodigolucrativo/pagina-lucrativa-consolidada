import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("rotas funcionais do Escritório Virtual", () => {
  const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("encaminha personalização, visitas e certificados para telas dedicadas", () => {
    expect(appSource).toContain('<Route path="/membros/mensagem-especial" component={MemberPersonalization} />');
    expect(appSource).toContain('<Route path="/membros/historico" component={MemberTraffic} />');
    expect(appSource).toContain('<Route path="/membros/top-visitas" component={MemberTraffic} />');
    expect(appSource).toContain('<Route path="/membros/cartao-certificado" component={MemberCredentials} />');
  });

  it("reaproveita fluxos persistentes para dados, divulgação, convites e automações", () => {
    expect(appSource).toContain('<Route path="/membros/meus-dados" component={MemberOperations} />');
    expect(appSource).toContain('<Route path="/membros/como-divulgar" component={MemberOperations} />');
    expect(appSource).toContain('<Route path="/membros/convites" component={MemberOperations} />');
    expect(appSource).toContain('<Route path="/membros/automacoes" component={MemberCommunications} />');
  });
});
