import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("MemberProfile responsive hierarchy", () => {
  it("places the photo editor first on mobile and keeps the form first on desktop", () => {
    const source = readFileSync(path.join(process.cwd(), "client/src/pages/MemberProfile.tsx"), "utf8");

    expect(source).toContain('className="order-2 space-y-6 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:order-1"');
    expect(source).toContain('className="order-1 space-y-4 lg:order-2"');
  });
});
