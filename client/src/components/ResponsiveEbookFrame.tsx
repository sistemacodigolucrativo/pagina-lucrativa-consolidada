import { calculateResponsiveEbookScale } from "@shared/ebookReader";
import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ResponsiveEbookFrameProps = {
  title: string;
  htmlContent: string;
  className?: string;
  displayMode?: "embedded" | "modal";
};

export default function ResponsiveEbookFrame({ title, htmlContent, className = "", displayMode = "embedded" }: ResponsiveEbookFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isModal = displayMode === "modal";

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
      window.requestAnimationFrame(fitDocument);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [fitDocument]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.fullscreenElement !== containerRef.current) return;
      void document.exitFullscreen().catch(() => undefined);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement === container) {
      await document.exitFullscreen();
      return;
    }

    await container.requestFullscreen();
  };

  const handleLoad = () => {
    fitDocument();
    window.requestAnimationFrame(fitDocument);
    window.setTimeout(fitDocument, 80);
  };

  return (
    <div
      ref={containerRef}
      data-ebook-reader="responsive"
      data-reader-mode={isFullscreen ? "fullscreen" : "embedded"}
      data-reader-display={displayMode}
      className={`min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10 bg-white ${isFullscreen ? "flex h-dvh w-screen flex-col rounded-none border-0" : isModal ? "flex h-full min-h-0 max-h-full flex-col" : ""} ${className}`}
    >
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          {isFullscreen ? "Leitura ampliada" : "Leitor integrado"}
        </p>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? "Sair da tela cheia" : "Ampliar leitor"}
          aria-pressed={isFullscreen}
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.97]"
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />}
          {isFullscreen ? "Sair da tela cheia" : "Ampliar"}
        </button>
      </div>
      <iframe
        ref={frameRef}
        title={title}
        sandbox="allow-same-origin"
        srcDoc={htmlContent}
        onLoad={handleLoad}
        className={`block w-full max-w-full border-0 bg-white ${isFullscreen ? "h-[calc(100dvh-3rem)] min-h-0 flex-1" : isModal ? "h-full min-h-0 flex-1" : "h-[64dvh] min-h-[430px] sm:h-[72vh] sm:min-h-[560px]"}`}
      />
    </div>
  );
}
