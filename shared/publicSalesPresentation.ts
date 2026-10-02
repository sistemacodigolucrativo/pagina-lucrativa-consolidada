export const PUBLIC_SALES_PRESENTATION_WIDTHS = {
  mobileMax: 767,
  tabletMax: 1199,
  compactHeaderMax: 900,
  mobileScreenMax: 560,
  desktopOnMobileMinViewport: 901,
  desktopOnMobileLayoutWidth: 1366,
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

export function getDesktopOnMobileViewportContent(content: string): string {
  const widthDirective = /(^|,)\s*width\s*=\s*[^,]+/i;
  const replacement = `width=${PUBLIC_SALES_PRESENTATION_WIDTHS.desktopOnMobileLayoutWidth}`;

  if (widthDirective.test(content)) {
    return content.replace(widthDirective, (_match, separator: string) =>
      `${separator}${separator ? " " : ""}${replacement}`
    );
  }

  const trimmedContent = content.trim();
  return `${trimmedContent}${trimmedContent ? ", " : ""}${replacement}`;
}

export function resolvePublicSalesPresentation({
  viewportWidth,
  screenShortSide,
  hasTouchInput,
}: PublicSalesPresentationInput): PublicSalesPresentation {
  const detectedBreakpoint: PublicSalesVisualBreakpoint =
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
  const visualBreakpoint: PublicSalesVisualBreakpoint = isDesktopOnMobile
    ? "desktop"
    : detectedBreakpoint;

  return {
    mode: isDesktopOnMobile ? "desktop-on-mobile" : visualBreakpoint,
    visualBreakpoint,
    compactHeader:
      !isDesktopOnMobile &&
      viewportWidth <= PUBLIC_SALES_PRESENTATION_WIDTHS.compactHeaderMax,
  };
}