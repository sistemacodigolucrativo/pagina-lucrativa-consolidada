import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const pages = [
  "MemberCommunications.tsx",
  "MemberPersonalization.tsx",
  "MemberReceiving.tsx",
  "MemberTestimonial.tsx",
] as const;

describe("member operational pages responsive hierarchy", () => {
  it.each(pages)("keeps the primary mechanism before secondary content on mobile: %s", fileName => {
    const source = readFileSync(path.join(process.cwd(), "client/src/pages", fileName), "utf8");
    expect(source).toContain('min-w-0');
    expect(source).toContain('order-1');
    expect(source).toContain('order-2');
  });

  it("keeps desktop column order explicit where the mobile order is meaningful", () => {
    const profile = readFileSync(path.join(process.cwd(), "client/src/pages/MemberProfile.tsx"), "utf8");
    expect(profile).toContain('lg:order-1');
    expect(profile).toContain('lg:order-2');
  });
});
