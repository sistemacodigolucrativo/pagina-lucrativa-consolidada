import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("visão geral do membro", () => {
  it("apresenta indicadores globais e link principal sem cards fora do escopo", async () => {
    const memberOffice = await readFile(path.join(root, "client/src/pages/MemberOffice.tsx"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    const css = await readFile(path.join(root, "client/src/index.css"), "utf8");

    expect(memberOffice).toContain("Seu link de indicação");
    expect(memberOffice).toContain("buildAffiliateLink(profileSlug)");
    expect(memberOffice).toContain("withAppBase(`/?afiliado=");
    expect(memberOffice).toContain("Copiar link");
    expect(memberOffice).toContain("Ganhos totais");
    expect(memberOffice).toContain("confirmedApplicationValueCents");
    expect(memberOffice).toContain("Indicados");
    expect(memberOffice).toContain("referrals.data?.activeCount");
    expect(memberOffice).toContain("Visitas");
    expect(memberOffice).toContain('trpc.member.analytics.useQuery({ period: "all" }');
    expect(memberOffice).toContain("analytics.data?.totals.clicks");
    expect(memberOffice).toContain("Taxa de conversão");
    expect(memberOffice).toContain("conversions / visits");
    expect(memberOffice).not.toContain("Central de ação");
    expect(memberOffice).not.toContain("Atalhos da operação");
    expect(memberOffice).not.toContain("<span>Aguardando análise</span>");
    expect(memberOffice).not.toContain("<span>Conversões</span>");
    expect(db).toContain("Number(clickTotals[0]?.value ?? 0) + Number(affiliateClickTotals[0]?.value ?? 0)");
    expect(css).toContain(".office-overview-stats { grid-template-columns: repeat(4, 1fr); }");
  });
});
