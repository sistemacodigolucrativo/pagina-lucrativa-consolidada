import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocation } from "wouter";
import { withAppBase } from "@/lib/devPath";
import { isPublicConversionRoute } from "@shared/publicRoutes";

export default function PublicConversionCta() {
  const [location] = useLocation();
  const [conversionFormVisible, setConversionFormVisible] = useState(false);

  useEffect(() => {
    setConversionFormVisible(false);
    if (location !== "/") return;
    const formSection = document.getElementById("f");
    if (!formSection || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setConversionFormVisible(Boolean(entry?.isIntersecting)), { threshold: 0.16 });
    observer.observe(formSection);
    return () => observer.disconnect();
  }, [location]);

  if (!isPublicConversionRoute(location) || conversionFormVisible) return null;

  return <a className="public-conversion-cta" style={{ borderRadius: "8px" }} href={withAppBase("/#f")} aria-label="Quero começar agora">
    <span>Quero começar</span>
    <ArrowUpRight size={15} aria-hidden="true" />
  </a>;
}
