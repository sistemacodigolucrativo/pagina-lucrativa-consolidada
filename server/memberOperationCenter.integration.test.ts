import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("Central de Divulgação", () => {
  it("exibe visão global e campanhas individuais no mesmo domínio", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(center).toContain("Central de Divulgação");
    expect(center).toContain("Visão geral");
    expect(center).toContain("Campanhas");
    expect(center).toContain("Tráfego");
    expect(center).toContain("Conversões");
    expect(center).toContain("Contatos");
    expect(center).toContain("Histórico");
    expect(center).toContain("Métricas exclusivas desta campanha");
    expect(center).toContain("Ver métricas");
    expect(center).toContain("trpc.member.analytics.useQuery");
  });

  it("mantém as seções em menu dropdown navegável", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(center).toContain("Menu da Central de Divulgação");
    expect(center).toContain("Seção da central");
    expect(center).toContain("onboardingStep ? withGettingStartedStep(event.target.value, onboardingStep) : event.target.value");
    expect(center).toContain("<select");
    expect(center).not.toContain("overflow-x-auto");
  });

  it("mantém retorno guiado quando aberto pelos Primeiros Passos", async () => {
    const gettingStarted = await readFile(path.join(root, "client/src/pages/MemberGettingStarted.tsx"), "utf8");
    const returnButton = await readFile(path.join(root, "client/src/components/GettingStartedReturnButton.tsx"), "utf8");
    const profile = await readFile(path.join(root, "client/src/pages/MemberProfile.tsx"), "utf8");
    const receiving = await readFile(path.join(root, "client/src/pages/MemberReceiving.tsx"), "utf8");
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");

    expect(gettingStarted).toContain('id: "profile"');
    expect(gettingStarted).toContain('id: "disclosure"');
    expect(gettingStarted).toContain('id: "conversion"');
    expect(gettingStarted).toContain("withGettingStartedStep(step.path, step.id)");
    expect(gettingStarted).toContain("scrollIntoView");
    expect(returnButton).toContain("Voltar para Primeiros Passos");
    expect(returnButton).toContain("Undo2");
    expect(returnButton).toContain("/membros/como-divulgar?step=");
    expect(profile).toContain("<GettingStartedReturnButton />");
    expect(receiving).toContain("<GettingStartedReturnButton />");
    expect(center).toContain("<GettingStartedReturnButton />");
  });

  it("bloqueia sequencialmente os cards dos Primeiros Passos", async () => {
    const gettingStarted = await readFile(path.join(root, "client/src/pages/MemberGettingStarted.tsx"), "utf8");
    expect(gettingStarted).toContain("validatePhoneBR(profile.data.whatsapp)");
    expect(gettingStarted).toContain("profile.data?.photoUrl");
    expect(gettingStarted).toContain("hasValidAddress(profile.data)");
    expect(gettingStarted).toContain("hasText(profile.address");
    expect(gettingStarted).toContain("hasText(receiving.data?.holderName)");
    expect(gettingStarted).toContain("validatePixKeyByType");
    expect(gettingStarted).toContain("validBankAccounts");
    expect(gettingStarted).toContain("metricsViewed");
    expect(gettingStarted).toContain("unlocked: index === 0 || baseSteps.slice(0, index).every(previous => previous.done)");
    expect(gettingStarted).toContain("Conclua a etapa anterior");
  });

  it("persiste a consulta de métricas sem usar o botão flutuante como conclusão", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");

    expect(center).toContain('onboardingStep !== "metrics"');
    expect(center).toContain("markGettingStartedMetricsViewed");
    expect(router).toContain("markGettingStartedMetricsViewed");
    expect(db).toContain("markMemberGettingStartedMetricsViewed");
    expect(db).toContain("COUNT(*)");
    expect(schema).toContain('metricsViewedAt: timestamp("metricsViewedAt")');
  });

  it("mantém links rastreáveis copiáveis e cria campanhas com origem", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    expect(center).toContain("Copiar link");
    expect(center).toContain("Origem");
    expect(center).toContain("Meio");
    expect(center).toContain("Identificação do conteúdo");
    expect(center).toContain("/r/${encodeURIComponent(profileSlug)}");
    expect(center).toContain("navigator.clipboard.writeText");
  });

  it("isola a Etapa 4 em uma experiência de divulgação sem gestão de campanhas", async () => {
    const center = await readFile(path.join(root, "client/src/pages/MemberOperationCenter.tsx"), "utf8");
    const gettingStarted = await readFile(path.join(root, "client/src/pages/MemberGettingStarted.tsx"), "utf8");

    expect(gettingStarted).toContain('id: "disclosure"');
    expect(gettingStarted).toContain('action: "Divulgar links"');
    expect(gettingStarted).toContain("done: firstClick");
    expect(center).toContain('onboardingStep === "disclosure"');
    expect(center).toContain("Faça sua primeira divulgação");
    expect(center).toContain("Link de indicação");
    expect(center).toContain("URL individual do membro");
    expect(center).toContain("DisclosureCampaignRow");
    expect(center).toContain("Você ainda não possui campanhas de divulgação.");
    expect(center.indexOf("DisclosureCampaignRow")).toBeLessThan(center.indexOf("function CampaignRow"));
    const guidedCard = center.slice(center.indexOf("function DisclosureCampaignRow"), center.indexOf("function CampaignRow"));
    expect(guidedCard).not.toContain("Criar nova campanha");
    expect(guidedCard).not.toContain("Métricas");
    expect(guidedCard).not.toContain("Remover");
  });

  it("mantém suporte em componente dedicado", async () => {
    const page = await readFile(path.join(root, "client/src/pages/MemberSupport.tsx"), "utf8");
    expect(page).toContain("Nova solicitação");
    expect(page).toContain("Minhas solicitações");
    expect(page).toContain("createTicket.mutate(form)");
    expect(page).not.toContain("Criar nova campanha");
  });

  it("mantém destinos legados via redirect", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    expect(app).toContain('path="/membros/operacao" component={MemberOperationCenter}');
    expect(app).toContain('path="/membros/operacao/:campaignId" component={MemberOperationCenter}');
    expect(app).toContain('path="/membros/como-divulgar" component={MemberGettingStarted}');
    expect(app).toContain('path="/membros/historico" component={MemberLegacyRedirect}');
  });
});
