import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocation } from "wouter";
import { withAppBase } from "@/lib/devPath";
import { isPublicConversionRoute } from "@shared/publicRoutes";

const PACKAGE_SECTION_ID = "o-que-recebe";
const FORM_SECTION_ID = "f";

function hasReachedViewportTop(element: HTMLElement) {
  return element.getBoundingClientRect().top <= 0;
}

function hasEnteredViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function pointsToActivationSection(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") ?? "";
  return href === "#f" || href.endsWith("/#f");
}

export default function PublicConversionCta() {
  const [location] = useLocation();
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [dismissedByActivationClick, setDismissedByActivationClick] = useState(false);

  useEffect(() => {
    setShowFloatingCta(false);
    setDismissedByActivationClick(false);
    if (location !== "/") return;

    const packageSection = document.getElementById(PACKAGE_SECTION_ID);
    const formSection = document.getElementById(FORM_SECTION_ID);
    let frame = 0;

    const updateVisibility = () => {
      frame = 0;
      const packageReachedTop = packageSection ? hasReachedViewportTop(packageSection) : false;
      const activationVisible = formSection ? hasEnteredViewport(formSection) : false;
      if (!packageReachedTop) setDismissedByActivationClick(false);
      setShowFloatingCta(packageReachedTop && !activationVisible);
    };

    const scheduleVisibilityCheck = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateVisibility);
    };

    const hideOnActivationLinkClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (anchor && pointsToActivationSection(anchor)) {
        setDismissedByActivationClick(true);
        setShowFloatingCta(false);
      }
    };

    let packageObserver: IntersectionObserver | null = null;
    let formObserver: IntersectionObserver | null = null;
    scheduleVisibilityCheck();

    if (packageSection && typeof IntersectionObserver !== "undefined") {
      packageObserver = new IntersectionObserver(scheduleVisibilityCheck, { threshold: [0, 1] });
      packageObserver.observe(packageSection);
    }

    if (formSection && typeof IntersectionObserver !== "undefined") {
      formObserver = new IntersectionObserver(scheduleVisibilityCheck, { threshold: [0, 0.01] });
      formObserver.observe(formSection);
    }
    window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true });
    window.addEventListener("resize", scheduleVisibilityCheck);
    document.addEventListener("click", hideOnActivationLinkClick);

    return () => {
      packageObserver?.disconnect();
      formObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleVisibilityCheck);
      window.removeEventListener("resize", scheduleVisibilityCheck);
      document.removeEventListener("click", hideOnActivationLinkClick);
    };
  }, [location]);

  if (!isPublicConversionRoute(location) || location !== "/" || !showFloatingCta || dismissedByActivationClick) return null;

  return (
    <a
      className="public-conversion-cta"
      href={withAppBase("/#f")}
      aria-label="Quero ativar minha estrutura"
      title="Quero ativar minha estrutura"
    >
      <span className="public-conversion-cta-label">Quero ativar minha estrutura</span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}
