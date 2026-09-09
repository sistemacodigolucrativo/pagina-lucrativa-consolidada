import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_HERO_TITLE, restorePublicHeroTitleBody } from "../shared/publicHeroTitle";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("restauração do título público do Hero no deploy", () => {
  it("restaura somente hero.title e preserva as demais personalizações da seção", () => {
    const original = JSON.stringify({
      kicker: "Chamada personalizada",
      title: "0000",
      description: "Descrição personalizada",
      trust: "Confiança personalizada",
    });
    const restored = restorePublicHeroTitleBody(original);
    expect(restored).not.toBeNull();
    expect(JSON.parse(restored!)).toEqual({
      kicker: "Chamada personalizada",
      title: PUBLIC_HERO_TITLE,
      description: "Descrição personalizada",
      trust: "Confiança personalizada",
    });
  });

  it("não inventa conteúdo ao encontrar um registro malformado", () => {
    expect(restorePublicHeroTitleBody("{invalido")).toBeNull();
    expect(restorePublicHeroTitleBody(null)).toBeNull();
  });

  it("executa a restauração pelo mesmo deploy-vps.sh usado no GitHub e no painel", () => {
    const deploy = read("scripts/deploy-vps.sh");
    const worker = read("scripts/manual-deploy-worker.sh");
    const resetScript = read("scripts/reset-public-hero-title.ts");
    const resetService = read("server/publicHeroTitleReset.ts");
    const publicCopyConfig = read("server/_core/publicSalesCopyConfig.ts");

    expect(deploy).toContain('"$PNPM_BIN" exec tsx scripts/reset-public-hero-title.ts');
    expect(deploy).toContain('write_deploy_status "deploying" 99 "Restaurando título padrão do Hero"');
    expect(worker).toContain('bash "$DEPLOY_SCRIPT" "$SHA" "$DEPLOY_ROOT" "$ARTIFACT" "$HEALTHCHECK_URL"');
    expect(resetScript).toContain("DEPLOY_HERO_RESET_PENDING");
    expect(resetScript).toContain("/api/public-sales-copy");
    expect(publicCopyConfig).toContain("processPendingPublicHeroTitleResetForDeploy");
    expect(resetService).toContain('eq(managedContent.resourceType, "hero")');
    expect(resetService).toContain("restorePublicHeroTitleBody(row.body)");
  });

  it("mantém o mesmo workflow disponível para disparo manual", () => {
    const workflow = read(".github/workflows/deploy-vps.yml");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("Branch ou commit para publicar");
  });
});
