import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminToast.tsx"), "utf8");

describe("admin Toast responsive UX", () => {
  it("keeps the library before the editor on mobile and restores desktop order", () => {
    expect(source).toContain('className="order-2 scroll-mt-24');
    expect(source).toContain('xl:order-1');
    expect(source).toContain('className="order-1 rounded-2xl');
    expect(source).toContain('xl:order-2');
  });

  it("scrolls only the editor into view instead of forcing the page to the top", () => {
    expect(source).toContain('editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })');
    expect(source).not.toContain('window.scrollTo({ top: 0');
  });

  it("keeps compact mobile controls and an explicit new-model action", () => {
    expect(source).toContain('grid grid-cols-3 gap-2');
    expect(source).toContain('grid grid-cols-2 gap-3');
    expect(source).toContain('onClick={startNewModel}');
    expect(source).toContain('Preview');
  });
});
