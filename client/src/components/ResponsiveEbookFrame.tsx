import { calculateResponsiveEbookScale } from "@shared/ebookReader";
import { useCallback, useEffect, useRef } from "react";

type ResponsiveEbookFrameProps = {
  title: string;
  htmlContent: string;
  className?: string;
};

export default function ResponsiveEbookFrame({ title, htmlContent, className = "" }: ResponsiveEbookFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const fitDocument = useCallback(() => {
    const frame = frameRef.current;
    const document = frame?.contentDocument;
    if (!frame || !document?.body) return;

    document.body.style.removeProperty("zoom");
    document.body.style.removeProperty("width");

    const pages = Array.from(document.querySelectorAll<HTMLElement>("[id^='page'][id$='-div']"));
    const pageWidth = Math.max(0, ...pages.map(page => page.offsetWidth));
    const contentWidth = Math.max(pageWidth, document.body.scrollWidth, document.documentElement.scrollWidth);
    const scale = calculateResponsiveEbookScale(frame.clientWidth, contentWidth);

    document.documentElement.style.setProperty("overflow-x", "hidden", "important");
    document.body.style.setProperty("margin", "0", "important");
    document.body.style.setProperty("transform-origin", "top left", "important");

    if (scale < 1) {
      document.body.style.setProperty("width", `${100 / scale}%`, "important");
      document.body.style.setProperty("zoom", String(scale), "important");
    }
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => fitDocument());
    observer.observe(frame);
    return () => observer.disconnect();
  }, [fitDocument]);

  const handleLoad = () => {
    fitDocument();
    window.requestAnimationFrame(fitDocument);
    window.setTimeout(fitDocument, 80);
  };

  return (
    <div className={`min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10 bg-white ${className}`}>
      <iframe
        ref={frameRef}
        title={title}
        sandbox="allow-same-origin"
        srcDoc={htmlContent}
        onLoad={handleLoad}
        className="block h-[64dvh] min-h-[430px] w-full max-w-full border-0 bg-white sm:h-[72vh] sm:min-h-[560px]"
      />
    </div>
  );
}
