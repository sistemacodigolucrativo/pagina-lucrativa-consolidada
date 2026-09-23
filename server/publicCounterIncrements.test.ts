import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const referralsSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminReferrals.tsx"), "utf8");
const testimonialsSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminTestimonials.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("public counter increments", () => {
  it("persists display-only increments in managedContent without creating real records", () => {
    expect(dbSource).toContain("PUBLIC_COUNTER_CONFIG_CATEGORY");
    expect(dbSource).toContain("public_members_counter_increment");
    expect(dbSource).toContain("public_reviews_counter_increment");
    expect(dbSource).toContain("realMemberCount + increments.members");
    expect(dbSource).toContain("realReviewCount + increments.reviews");
    expect(dbSource).not.toContain("await db.insert(users).values(payload)");
    expect(dbSource).not.toContain("await db.insert(memberTestimonials).values(payload)");
  });

  it("restricts counter changes to admin procedures", () => {
    expect(routerSource).toContain("publicCounterSettings: adminProcedure.query");
    expect(routerSource).toContain("updatePublicCounterIncrement: adminProcedure");
    expect(routerSource).toContain("z.enum([\"public_members_counter_increment\", \"public_reviews_counter_increment\"])");
    expect(routerSource).toContain("z.number().int().min(0)");
  });

  it("shows real count, increment and public total in admin screens", () => {
    expect(referralsSource).toContain("Contador público de membros");
    expect(referralsSource).toContain("Membros reais");
    expect(referralsSource).toContain("Incremento manual");
    expect(referralsSource).toContain("Total exibido publicamente");
    expect(referralsSource).toContain("public_members_counter_increment");
    expect(testimonialsSource).toContain("Contador público de avaliações");
    expect(testimonialsSource).toContain("Avaliações reais");
    expect(testimonialsSource).toContain("public_reviews_counter_increment");
  });

  it("keeps the public home consuming the adjusted public counters only", () => {
    expect(homeSource).toContain("socialProof.data?.memberCount");
    expect(homeSource).toContain("const reviewCount = socialProof.data?.reviewCount ?? 0");
    expect(homeSource).not.toContain("realMemberCount");
    expect(homeSource).not.toContain("realReviewCount");
  });
});
