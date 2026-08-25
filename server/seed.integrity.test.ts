import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("integridade do seed de demonstração", () => {
  it("preserva ownership e patrocinador em reexecuções", async () => {
    const seed = await readFile(path.join(root, "scripts/seed-demo.ts"), "utf8");
    expect(seed).toContain("SELECT id, ownerUserId, affiliateSlug, paymentStatus, activationStatus FROM applications");
    expect(seed).toContain("Seed recusado: ownership existente diverge");
    expect(seed).not.toContain("ownerUserId = VALUES(ownerUserId)");
    expect(seed).not.toContain("affiliateSlug = VALUES(affiliateSlug)");
    expect(seed).toContain("SELECT id, sponsorId FROM referralLinks WHERE referredUserId = ?");
    expect(seed).toContain("Seed recusado: patrocinador existente diverge");
    expect(seed).not.toContain("ON DUPLICATE KEY UPDATE sponsorId = VALUES(sponsorId)");
  });
});
