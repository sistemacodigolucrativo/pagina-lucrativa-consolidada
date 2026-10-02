import { resolvePublicSalesPresentation } from "@shared/publicSalesPresentation";

export function getPublicSalesPresentation() {
  const viewportWidth = window.innerWidth;
  return resolvePublicSalesPresentation({
    viewportWidth,
    screenShortSide: window.screen
      ? Math.min(window.screen.width, window.screen.height)
      : viewportWidth,
    hasTouchInput:
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0,
  });
}