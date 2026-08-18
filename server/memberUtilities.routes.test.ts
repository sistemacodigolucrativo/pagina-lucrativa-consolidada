import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getMemberCommunicationContext } from "../shared/memberCommunicationRoutes";
import { getMemberOperationContext } from "../shared/memberOperationRoutes";

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

  it("especializa os atalhos compartilhados com a ação pertinente de cada rota", () => {
    expect(getMemberOperationContext("/membros/configuracoes")).toMatchObject({ title: "Editar perfil", anchorId: "profile" });
    expect(getMemberOperationContext("/membros/meus-dados")).toMatchObject({ title: "Meus dados", anchorId: "profile" });
    expect(getMemberOperationContext("/membros/como-divulgar")).toMatchObject({ title: "Saiba como divulgar", anchorId: "profile" });
    expect(getMemberOperationContext("/membros/campanhas")).toMatchObject({ title: "Encurtador de URL e campanhas", anchorId: "profile" });
    expect(getMemberOperationContext("/membros/convites")).toMatchObject({ title: "Convidar amigos", anchorId: "convites" });
  });

  it("diferencia automações como preparação registrada, sem alegar disparo externo", () => {
    expect(getMemberCommunicationContext("/membros/automacoes")).toMatchObject({
      title: "Preparar sequência de divulgação",
      formTitle: "Preparar uma etapa da sequência",
      defaultChannel: "email",
    });
    expect(getMemberCommunicationContext("/membros/automacoes").description).toContain("nenhum envio externo é automatizado");
    expect(getMemberCommunicationContext("/membros/emails-whatsapp")).toMatchObject({ defaultChannel: "whatsapp" });
  });
});
