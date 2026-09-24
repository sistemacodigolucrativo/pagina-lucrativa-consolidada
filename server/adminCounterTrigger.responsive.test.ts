import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const hookSource = readFileSync(resolve(process.cwd(), "client/src/hooks/useRapidClickToggle.ts"), "utf8");
const referralsSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminReferrals.tsx"), "utf8");
const testimonialsSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminTestimonials.tsx"), "utf8");

describe("admin public counter hidden trigger", () => {
  it("toggles controls with five rapid clicks anywhere on the screen", () => {
    expect(hookSource).toContain("requiredClicks = 5");
    expect(hookSource).toContain("windowMs = 1_000");
    expect(hookSource).toContain('window.addEventListener("pointerdown", handlePointerDown, true)');
    expect(hookSource).toContain("setVisible(current => !current)");
  });

  it("keeps member and testimonial counter edit buttons hidden until the trigger is active", () => {
    expect(referralsSource).toContain("const counterControlsVisible = useRapidClickToggle()");
    expect(referralsSource).toContain("counterControlsVisible ? <button");
    expect(referralsSource).toContain("counterControlsVisible && counterEditorOpen");
    expect(testimonialsSource).toContain("const counterControlsVisible = useRapidClickToggle()");
    expect(testimonialsSource).toContain("counterControlsVisible ? <button");
    expect(testimonialsSource).toContain("counterControlsVisible && reviewCounterEditorOpen");
  });
});
