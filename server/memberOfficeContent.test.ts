import { describe, expect, it } from "vitest";
import { memberOfficeModuleCount, memberOfficeNavigation } from "../shared/memberOfficeContent";

describe("memberOfficeNavigation", () => {
  it("keeps the audited office groups and unique internal routes", () => {
    const labels = memberOfficeNavigation.map(group => group.label);
    const paths = memberOfficeNavigation.flatMap(group => group.items.map(item => item.path));

    expect(labels).toEqual(expect.arrayContaining([
      "Escritório",
      "Comece por aqui",
      "Ferramentas administrativas",
      "Área de estudo",
    ]));
    expect(memberOfficeModuleCount).toBeGreaterThanOrEqual(35);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("does not seed private account values or customer testimonials", () => {
    const serializedNavigation = JSON.stringify(memberOfficeNavigation).toLowerCase();

    expect(serializedNavigation).not.toContain("@live.com");
    expect(serializedNavigation).not.toContain("depoimento de cliente");
    expect(serializedNavigation).not.toContain("r$ 100,00");
  });
});
