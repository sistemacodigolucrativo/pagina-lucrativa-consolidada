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

  return (
    <a
      className="public-conversion-cta"
      style={{
        borderRadius: "10px",
        minWidth: "auto",
        minHeight: "44px",
        padding: "10px 14px",
        gap: "7px",
      }}
      href={withAppBase("/#f")}
      aria-label="Quero começar agora"
      title="Quero começar agora"
    >
      <span style={{ fontSize: "11px", lineHeight: 1, fontWeight: 800, whiteSpace: "nowrap" }}>
        Quero começar agora
      </span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}
