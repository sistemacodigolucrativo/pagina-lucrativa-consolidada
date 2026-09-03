import { describe, expect, it } from "vitest";
import {
  choosePublicSocialProofIndex,
  formatPublicSocialProof,
  isPublicSocialProofRoute,
  publicSocialProofConfig,
  publicSocialProofDisclaimer,
  publicSocialProofEntries,
  randomBetween,
} from "./publicSocialProof";

describe("public social proof policy and rotation", () => {
  it("allows only the public Home route", () => {
    for (const path of [
      "/",
      "/?afiliado=abc",
    ]) expect(isPublicSocialProofRoute(path)).toBe(true);

    for (const path of [
      "/acesso",
      "/personalizar",
      "/pedido/acompanhar",
      "/pedido/ABC123/pagamento",
      "/institucional",
      "/termos-de-uso",
      "/politica-de-privacidade",
      "/regras-comerciais",
      "/contato?source=footer",
      "/membros",
      "/membros/ebooks",
      "/admin",
      "/admin/ebooks",
      "/preview",
      "/404",
      "/not-found",
    ]) expect(isPublicSocialProofRoute(path)).toBe(false);
  });

  it("keeps the initial and subsequent delays variable and bounded", () => {
    expect(randomBetween(publicSocialProofConfig.initialDelayMs.min, publicSocialProofConfig.initialDelayMs.max, 0)).toBe(publicSocialProofConfig.initialDelayMs.min);
    expect(randomBetween(publicSocialProofConfig.initialDelayMs.min, publicSocialProofConfig.initialDelayMs.max, 1)).toBe(publicSocialProofConfig.initialDelayMs.max);
    expect(randomBetween(publicSocialProofConfig.betweenNoticesMs.min, publicSocialProofConfig.betweenNoticesMs.max, 0)).toBe(publicSocialProofConfig.betweenNoticesMs.min);
    expect(randomBetween(publicSocialProofConfig.betweenNoticesMs.min, publicSocialProofConfig.betweenNoticesMs.max, 1)).toBe(publicSocialProofConfig.betweenNoticesMs.max);
    expect(publicSocialProofConfig.initialDelayMs.min).toBeLessThan(publicSocialProofConfig.initialDelayMs.max);
    expect(publicSocialProofConfig.betweenNoticesMs.min).toBeLessThan(publicSocialProofConfig.betweenNoticesMs.max);
    expect(publicSocialProofConfig.visibleForMs).toBeLessThan(publicSocialProofConfig.betweenNoticesMs.min);
  });

  it("rotates away from the recent history before allowing a repeat", () => {
    const first = choosePublicSocialProofIndex([], 0);
    const second = choosePublicSocialProofIndex([first], 0);
    const third = choosePublicSocialProofIndex([first, second], 0);
    expect(new Set([first, second, third]).size).toBe(3);

    const exhaustedHistory = publicSocialProofEntries.map((_, index) => index);
    expect(choosePublicSocialProofIndex(exhaustedHistory, 0)).toBe(0);
  });

  it("uses transparent illustrative copy instead of claiming a verified purchase", () => {
    const message = formatPublicSocialProof(publicSocialProofEntries[0]!);
    expect(message).toContain("está conhecendo o Método Código Lucrativo");
    expect(message).not.toContain("acabou de adquirir");
    expect(publicSocialProofDisclaimer).toContain("não representa uma compra real");
  });
});
