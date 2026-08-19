import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const cssSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("public mobile header layout", () => {
  it("renders one in-flow header before the hero profile presentation", () => {
    expect((homeSource.match(/className=\"site-header\"/g) ?? []).length).toBe(1);
    expect(homeSource.indexOf('className="site-header"')).toBeLessThan(homeSource.indexOf("affiliate-profile-hero"));
    expect(homeSource).not.toContain("affiliate-banner");
  });

  it("keeps the header and hero presentation in the normal layout flow", () => {
    expect(cssSource).toContain('.site-header { position: relative;');
    expect(cssSource).toContain('.affiliate-profile-hero { max-width: 610px;');
    expect(cssSource).toContain('.affiliate-profile-hero .affiliate-profile-summary { margin-left: -3px; }');
    expect(cssSource).toContain('.sales-hero { position: relative;');
  });

  it("uses header-relative mobile menu positioning and balanced hero offsets", () => {
    expect(cssSource).toContain('.nav-links { position: absolute; top: calc(100% + 8px);');
    expect(cssSource).toContain('.sales-hero { position: relative; min-height: 720px; padding: 58px 0 94px;');
    expect(cssSource).toContain('  .sales-hero { padding-top: 68px; }');
    expect(cssSource).toContain('  .sales-hero { min-height: auto; padding: 38px 0 70px; }');
  });
});
