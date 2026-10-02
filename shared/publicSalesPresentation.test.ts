import { describe, expect, it } from "vitest";
import { resolvePublicSalesPresentation } from "./publicSalesPresentation";

describe("public sales presentation resolver", () => {
  it("keeps a normal mobile viewport in the mobile presentation", () => {
    expect(
      resolvePublicSalesPresentation({
        viewportWidth: 390,
        screenShortSide: 390,
        hasTouchInput: true,
      })
    ).toEqual({
      mode: "mobile",
      visualBreakpoint: "mobile",
      compactHeader: true,
    });
  });

  it("keeps tablet layout and compact-header behavior based on viewport width", () => {
    expect(
      resolvePublicSalesPresentation({
        viewportWidth: 820,
        screenShortSide: 820,
        hasTouchInput: false,
      })
    ).toEqual({
      mode: "tablet",
      visualBreakpoint: "tablet",
      compactHeader: true,
    });
  });

  it("distinguishes a desktop site opened on a phone without changing its width breakpoint", () => {
    expect(
      resolvePublicSalesPresentation({
        viewportWidth: 980,
        screenShortSide: 390,
        hasTouchInput: true,
      })
    ).toEqual({
      mode: "desktop-on-mobile",
      visualBreakpoint: "tablet",
      compactHeader: false,
    });
  });

  it("does not infer a phone presentation from screen size alone", () => {
    expect(
      resolvePublicSalesPresentation({
        viewportWidth: 1024,
        screenShortSide: 390,
        hasTouchInput: false,
      })
    ).toEqual({
      mode: "desktop",
      visualBreakpoint: "desktop",
      compactHeader: false,
    });
  });

  it("preserves the established width boundaries", () => {
    const resolve = (viewportWidth: number) =>
      resolvePublicSalesPresentation({
        viewportWidth,
        screenShortSide: viewportWidth,
        hasTouchInput: false,
      });

    expect(resolve(560).visualBreakpoint).toBe("mobile");
    expect(resolve(561).visualBreakpoint).toBe("tablet");
    expect(resolve(980).visualBreakpoint).toBe("tablet");
    expect(resolve(981).visualBreakpoint).toBe("desktop");
    expect(resolve(900).compactHeader).toBe(true);
    expect(resolve(901).compactHeader).toBe(false);
  });

  it("still identifies desktop-on-mobile in landscape using the screen's short side", () => {
    expect(
      resolvePublicSalesPresentation({
        viewportWidth: 1024,
        screenShortSide: 390,
        hasTouchInput: true,
      }).mode
    ).toBe("desktop-on-mobile");
  });
});