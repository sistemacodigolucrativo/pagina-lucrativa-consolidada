import { useEffect } from "react";
import { getPublicSalesPresentation } from "@/lib/publicSalesPresentation";
import { getDesktopOnMobileViewportContent } from "@shared/publicSalesPresentation";

const COARSE_POINTER_QUERY = "(pointer: coarse)";
const COMPACT_SCROLL_THRESHOLD = 28;
const COMPACT_CLASS = "public-mobile-scrolled";
const PRESENTATION_ATTRIBUTE = "data-public-sales-presentation";

export default function PublicMobileCompactHeaderRuntime() {
  useEffect(() => {
    const pointerMedia = window.matchMedia(COARSE_POINTER_QUERY);
    const viewportMeta =
      document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const originalViewportContent = viewportMeta?.content ?? null;
    const desktopViewportContent =
      originalViewportContent === null
        ? null
        : getDesktopOnMobileViewportContent(originalViewportContent);
    let frame = 0;

    const setDesktopViewport = (enabled: boolean) => {
      if (!viewportMeta || originalViewportContent === null) return;
      const content = enabled
        ? desktopViewportContent
        : originalViewportContent;
      if (content !== null && viewportMeta.content !== content) {
        viewportMeta.content = content;
      }
    };

    const sync = () => {
      frame = 0;
      const isPublicSalesPage = Boolean(document.querySelector(".sales-page.reference-page"));
      const presentation = getPublicSalesPresentation();
      if (isPublicSalesPage) {
        document.documentElement.setAttribute(
          PRESENTATION_ATTRIBUTE,
          presentation.mode
        );
        setDesktopViewport(presentation.mode === "desktop-on-mobile");
      } else {
        document.documentElement.removeAttribute(PRESENTATION_ATTRIBUTE);
        setDesktopViewport(false);
      }
      const shouldCompact =
        isPublicSalesPage &&
        presentation.compactHeader &&
        window.scrollY > COMPACT_SCROLL_THRESHOLD;
      document.documentElement.classList.toggle(COMPACT_CLASS, shouldCompact);
    };

    const scheduleSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sync);
    };
    const routeObserver = new MutationObserver(scheduleSync);

    sync();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("orientationchange", scheduleSync);
    pointerMedia.addEventListener?.("change", scheduleSync);
    routeObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      routeObserver.disconnect();
      document.documentElement.classList.remove(COMPACT_CLASS);
      document.documentElement.removeAttribute(PRESENTATION_ATTRIBUTE);
      setDesktopViewport(false);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("orientationchange", scheduleSync);
      pointerMedia.removeEventListener?.("change", scheduleSync);
    };
  }, []);

  return null;
}
