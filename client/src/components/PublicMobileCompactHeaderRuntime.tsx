import { useEffect } from "react";

const MOBILE_TABLET_QUERY = "(max-width: 900px)";
const COMPACT_SCROLL_THRESHOLD = 28;
const COMPACT_CLASS = "public-mobile-scrolled";

export default function PublicMobileCompactHeaderRuntime() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_TABLET_QUERY);
    let frame = 0;

    const sync = () => {
      frame = 0;
      const isPublicSalesPage = Boolean(document.querySelector(".sales-page.reference-page"));
      const shouldCompact = isPublicSalesPage && media.matches && window.scrollY > COMPACT_SCROLL_THRESHOLD;
      document.documentElement.classList.toggle(COMPACT_CLASS, shouldCompact);
    };

    const scheduleSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    media.addEventListener?.("change", scheduleSync);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove(COMPACT_CLASS);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      media.removeEventListener?.("change", scheduleSync);
    };
  }, []);

  return null;
}
