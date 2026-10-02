export const PUBLIC_SALES_PRESENTATION_WIDTHS = {
  mobileMax: 560,
  tabletMax: 980,
  compactHeaderMax: 900,
  mobileScreenMax: 560,
  desktopOnMobileMinViewport: 901,
} as const;

export type PublicSalesVisualBreakpoint = "desktop" | "tablet" | "mobile";
export type PublicSalesPresentationMode =
  | PublicSalesVisualBreakpoint
  | "desktop-on-mobile";

export type PublicSalesPresentation = {
  mode: PublicSalesPresentationMode;
  visualBreakpoint: PublicSalesVisualBreakpoint;
  compactHeader: boolean;
};

export type PublicSalesPresentationInput = {
  viewportWidth: number;
  screenShortSide: number;
  hasTouchInput: boolean;
};

export function resolvePublicSalesPresentation({
  viewportWidth,
  screenShortSide,
  hasTouchInput,
}: PublicSalesPresentationInput): PublicSalesPresentation {
  const visualBreakpoint: PublicSalesVisualBreakpoint =
    viewportWidth <= PUBLIC_SALES_PRESENTATION_WIDTHS.mobileMax
      ? "mobile"
      : viewportWidth <= PUBLIC_SALES_PRESENTATION_WIDTHS.tabletMax
        ? "tablet"
        : "desktop";

  const isDesktopOnMobile =
    hasTouchInput &&
    screenShortSide > 0 &&
    screenShortSide <= PUBLIC_SALES_PRESENTATION_WIDTHS.mobileScreenMax &&
    viewportWidth >=
      PUBLIC_SALES_PRESENTATION_WIDTHS.desktopOnMobileMinViewport;

  return {
    mode: isDesktopOnMobile ? "desktop-on-mobile" : visualBreakpoint,
    visualBreakpoint,
    compactHeader:
      viewportWidth <= PUBLIC_SALES_PRESENTATION_WIDTHS.compactHeaderMax,
  };
}