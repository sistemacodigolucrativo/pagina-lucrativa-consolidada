import { describe, expect, it } from "vitest";
import {
  getDesktopOnMobileViewportContent,
  resolvePublicSalesPresentation,
} from "./publicSalesPresentation";

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

  it("forces the desktop composition when desktop mode is detected on a phone", () => {
    expect(
      resolvePublicSalesPresentation({
        viewportWidth: 980,
        screenShortSide: 390,
        hasTouchInput: true,
      })
    ).toEqual({
      mode: "desktop-on-mobile",
      visualBreakpoint: "desktop",
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
      mode: "tablet",
      visualBreakpoint: "tablet",
      compactHeader: false,
    });
  });

  it("uses the documented mobile, tablet, and desktop boundaries", () => {
    const resolve = (viewportWidth: number) =>
      resolvePublicSalesPresentation({
        viewportWidth,
        screenShortSide: viewportWidth,
        hasTouchInput: false,
      });

    expect(resolve(767).visualBreakpoint).toBe("mobile");
    expect(resolve(768).visualBreakpoint).toBe("tablet");
    expect(resolve(1199).visualBreakpoint).toBe("tablet");
    expect(resolve(1200).visualBreakpoint).toBe("desktop");
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

  it("sets a fixed desktop canvas width without dropping other viewport directives", () => {
    expect(
      getDesktopOnMobileViewportContent(
        "width=device-width, initial-scale=1.0, viewport-fit=cover"
      )
    ).toBe("width=1366, initial-scale=1.0, viewport-fit=cover");
  });

  it("adds the desktop canvas width when the viewport meta tag has no width", () => {
    expect(
      getDesktopOnMobileViewportContent("initial-scale=1.0, viewport-fit=cover")
    ).toBe("initial-scale=1.0, viewport-fit=cover, width=1366");
  });
});