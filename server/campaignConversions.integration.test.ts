import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("atribuição e conversões de campanhas", () => {
  it("mantém eventos de atribuição e conversões no domínio de campanhas", async () => {
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(schema).toContain('export const campaignConversions = mysqlTable("campaignConversions"');
    expect(schema).toContain('conversionType: mysqlEnum("conversionType", ["lead", "application", "order", "sale", "commission"])');
    expect(db).toContain("getValidCampaignAttribution");
    expect(db).toContain("recordCampaignConversion");
    expect(db).toContain('conversionType: "application"');
  });

  it("passa o request público para preservar cookies de visitante e sessão", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(router).toContain("createApplication(input, ctx.req)");
    expect(db).toContain('readCampaignCookie(request, "pl_visitor")');
    expect(db).toContain('readCampaignCookie(request, "pl_session")');
  });

  it("distingue contato de campanha de contato manual e mantém o contador legado", async () => {
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(schema).toContain('captureType: mysqlEnum("captureType", ["manual", "campaign", "organic"])');
    expect(db).toContain('captureType: campaignId !== null ? "campaign" : "manual"');
    expect(db).toContain("campaignLinks.leads");
    expect(db).toContain("return db.transaction(async tx => {");
    expect(db).toContain("duplicateWhere");
    expect(db).toContain("entityType: \"memberContact\"");
    expect(db).toContain("recordMemberActivity(userId, \"contact_created\", \"contact\", id");
  });
});
