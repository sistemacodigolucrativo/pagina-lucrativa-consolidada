import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("public member counter animation", () => {
  it("animates the public member count only when the stat enters the viewport", () => {
    expect(homeSource).toContain("function AnimatedMemberCount");
    expect(homeSource).toContain("IntersectionObserver");
    expect(homeSource).toContain("threshold: 0.35");
    expect(homeSource).toContain("requestAnimationFrame");
    expect(homeSource).toContain("prefers-reduced-motion: reduce");
    expect(homeSource).toContain("<AnimatedMemberCount value={socialProof.data?.memberCount ?? 0} />");
  });

  it("formats the animated counter using Brazilian thousands separators", () => {
    expect(homeSource).toContain('toLocaleString("pt-BR")');
    expect(homeSource).toContain("formatPublicCounter(displayValue)");
  });
});
