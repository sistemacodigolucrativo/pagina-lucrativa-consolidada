import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocation } from "wouter";
import { withAppBase } from "@/lib/devPath";
import { isPublicConversionRoute } from "@shared/publicRoutes";

const SOCIAL_PROOF_SECTION_ID = "depoimentos";
const FORM_SECTION_ID = "f";

function hasScrolledPast(element: HTMLElement) {
  return element.getBoundingClientRect().bottom <= 0;
}

export default function PublicConversionCta() {
  const [location] = useLocation();
  const [conversionFormVisible, setConversionFormVisible] = useState(false);
  const [hasPassedSocialProof, setHasPassedSocialProof] = useState(false);

  useEffect(() => {
    setConversionFormVisible(false);
    setHasPassedSocialProof(false);
    if (location !== "/") return;

    const socialProofSection = document.getElementById(SOCIAL_PROOF_SECTION_ID);
    const formSection = document.getElementById(FORM_SECTION_ID);
    let frame = 0;

    const updatePassedSocialProof = () => {
      frame = 0;
      if (socialProofSection) setHasPassedSocialProof(hasScrolledPast(socialProofSection));
    };

    const schedulePassedCheck = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePassedSocialProof);
    };

    let socialProofObserver: IntersectionObserver | null = null;
    let formObserver: IntersectionObserver | null = null;
    const needsScrollFallback = !socialProofSection || typeof IntersectionObserver === "undefined";

    schedulePassedCheck();

    if (socialProofSection && typeof IntersectionObserver !== "undefined") {
      socialProofObserver = new IntersectionObserver(schedulePassedCheck, { threshold: [0, 1] });
      socialProofObserver.observe(socialProofSection);
    } else {
      window.addEventListener("scroll", schedulePassedCheck, { passive: true });
    }

    if (formSection && typeof IntersectionObserver !== "undefined") {
      formObserver = new IntersectionObserver(([entry]) => setConversionFormVisible(Boolean(entry?.isIntersecting)), { threshold: 0.16 });
      formObserver.observe(formSection);
    }

    return () => {
      socialProofObserver?.disconnect();
      formObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      if (needsScrollFallback) window.removeEventListener("scroll", schedulePassedCheck);
    };
  }, [location]);

  if (!isPublicConversionRoute(location) || location !== "/" || !hasPassedSocialProof || conversionFormVisible) return null;

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
