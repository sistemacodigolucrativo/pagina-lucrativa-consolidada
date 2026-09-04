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

    const body = document.body;
    const html = document.documentElement;

    body.style.removeProperty("zoom");
    body.style.removeProperty("width");
    body.style.removeProperty("max-width");
    body.style.removeProperty("transform");
    body.style.removeProperty("min-height");

    let responsiveStyle = document.getElementById("codigo-lucrativo-ebook-responsive-style") as HTMLStyleElement | null;
    if (!responsiveStyle) {
      responsiveStyle = document.createElement("style");
      responsiveStyle.id = "codigo-lucrativo-ebook-responsive-style";
      document.head?.appendChild(responsiveStyle);
    }

    responsiveStyle.textContent = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
        background: #ffffff !important;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      img, svg, canvas, video, object, embed {
        max-width: 100% !important;
      }
    `;

    const pages = Array.from(document.querySelectorAll<HTMLElement>("[id^='page'][id$='-div'], .page"));
    const pageWidth = Math.max(
      0,
      ...pages.map(page => Math.ceil(Math.max(page.offsetWidth, page.scrollWidth, page.getBoundingClientRect().width)))
    );
    const contentWidth = Math.ceil(Math.max(pageWidth, body.scrollWidth, html.scrollWidth, body.offsetWidth, html.offsetWidth));
    const availableWidth = Math.floor(frame.clientWidth || frame.getBoundingClientRect().width);
    const scale = calculateResponsiveEbookScale(availableWidth, contentWidth);

    html.style.setProperty("overflow-x", "hidden", "important");
    body.style.setProperty("margin", "0", "important");
    body.style.setProperty("padding", "0", "important");
    body.style.setProperty("overflow-x", "hidden", "important");
    body.style.setProperty("transform-origin", "top left", "important");

    if (scale < 1) {
      body.style.setProperty("width", `${contentWidth}px`, "important");
      body.style.setProperty("max-width", `${contentWidth}px`, "important");
      body.style.setProperty("transform", `scale(${scale})`, "important");
      body.style.setProperty("min-height", `${Math.ceil(Math.max(body.scrollHeight, html.scrollHeight) * scale)}px`, "important");
      return;
    }

    body.style.setProperty("width", "100%", "important");
    body.style.setProperty("max-width", "100%", "important");
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => fitDocument());
    observer.observe(frame);
    return () => observer.disconnect();
  }, [fitDocument]);

  useEffect(() => {
    const handleViewportChange = () => window.requestAnimationFrame(fitDocument);

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
    };
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
    const document = frameRef.current?.contentDocument;
    const images = Array.from(document?.images ?? []);

    fitDocument();
    window.requestAnimationFrame(fitDocument);
    window.setTimeout(fitDocument, 80);
    window.setTimeout(fitDocument, 240);

    if (document?.fonts?.ready) {
      void document.fonts.ready.then(fitDocument).catch(() => undefined);
    }

    images.forEach(image => {
      if (image.complete) return;
      image.addEventListener("load", fitDocument, { once: true });
      image.addEventListener("error", fitDocument, { once: true });
    });
  };

  return (
    <div
      ref={containerRef}
      data-ebook-reader="responsive"
      data-reader-mode={isFullscreen ? "fullscreen" : "embedded"}
      data-reader-display={displayMode}
      className={`min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10 bg-white ${isFullscreen ? "flex h-dvh w-[100dvw] flex-col rounded-none border-0" : isModal ? "flex h-full min-h-0 max-h-full flex-col" : ""} ${className}`}
    >
      <div className="flex min-h-12 min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
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
          {isFullscreen ? "Sair" : "Ampliar"}
        </button>
      </div>
      <iframe
        ref={frameRef}
        title={title}
        sandbox="allow-same-origin"
        srcDoc={htmlContent}
        onLoad={handleLoad}
        className={`block w-full max-w-full min-w-0 border-0 bg-white ${isFullscreen ? "h-[calc(100dvh-3rem)] min-h-0 flex-1" : isModal ? "h-full min-h-0 flex-1" : "h-[64dvh] min-h-[430px] sm:h-[72vh] sm:min-h-[560px]"}`}
      />
    </div>
  );
}
