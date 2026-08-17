import { describe, expect, it } from "vitest";
import { formatCompactCount, formatCurrency, memberNavigation } from "./dashboard";

describe("dashboard contracts", () => {
  it("keeps the member navigation grouped and free of duplicated paths", () => {
    expect(new Set(memberNavigation.map(item => item.path)).size).toBe(memberNavigation.length);
    expect(memberNavigation.map(item => item.group)).toEqual(expect.arrayContaining(["Escritório Virtual", "Crescimento", "Conta"]));
  });

  it("formats operational values for Brazilian members", () => {
    expect(formatCurrency(9750)).toContain("97,50");
    expect(formatCompactCount(1200)).toContain("1,2");
  });
});
