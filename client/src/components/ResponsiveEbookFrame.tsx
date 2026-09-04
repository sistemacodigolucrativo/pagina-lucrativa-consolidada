import { calculateResponsiveEbookScale } from "@shared/ebookReader";
import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ResponsiveEbookFrameProps = {
  title: string;
  htmlContent: string;
  className?: string;
  displayMode?: "embedded" | "modal";
};

const scaleRootId = "codigo-lucrativo-ebook-scale-root";

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

    let scaleRoot = document.getElementById(scaleRootId) as HTMLDivElement | null;
    if (!scaleRoot) {
      scaleRoot = document.createElement("div");
      scaleRoot.id = scaleRootId;
      while (body.firstChild) {
        scaleRoot.appendChild(body.firstChild);
      }
      body.appendChild(scaleRoot);
    }

    body.style.removeProperty("zoom");
    body.style.removeProperty("width");
    body.style.removeProperty("max-width");
    body.style.removeProperty("height");
    body.style.removeProperty("min-height");
    body.style.removeProperty("position");
    body.style.removeProperty("transform");
    html.style.removeProperty("height");
    html.style.removeProperty("min-height");
    scaleRoot.style.removeProperty("width");
    scaleRoot.style.removeProperty("max-width");
    scaleRoot.style.removeProperty("height");
    scaleRoot.style.removeProperty("min-height");
    scaleRoot.style.removeProperty("position");
    scaleRoot.style.removeProperty("left");
    scaleRoot.style.removeProperty("top");
    scaleRoot.style.removeProperty("transform");

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
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: hidden !important;
        background: #ffffff !important;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      #${scaleRootId} {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        transform-origin: top left !important;
      }

      img, svg, canvas, video, object, embed {
        max-width: 100% !important;
      }
    `;

    const pages = Array.from(scaleRoot.querySelectorAll<HTMLElement>("[id^='page'][id$='-div'], .page"));
    const pageWidth = Math.max(
      0,
      ...pages.map(page => Math.ceil(Math.max(page.offsetWidth, page.scrollWidth, page.getBoundingClientRect().width)))
    );
    const rootRect = scaleRoot.getBoundingClientRect();
    const contentWidth = Math.ceil(
      Math.max(pageWidth, scaleRoot.scrollWidth, scaleRoot.offsetWidth, rootRect.width, body.scrollWidth, html.scrollWidth)
    );
    const availableWidth = Math.max(1, Math.floor((frame.clientWidth || frame.getBoundingClientRect().width) - 2));
    const scale = calculateResponsiveEbookScale(availableWidth, contentWidth);
    const contentHeight = Math.ceil(Math.max(scaleRoot.scrollHeight, scaleRoot.offsetHeight, rootRect.height, body.scrollHeight, html.scrollHeight));
    const scaledHeight = Math.ceil(contentHeight * scale);

    html.style.setProperty("overflow-x", "hidden", "important");
    body.style.setProperty("margin", "0", "important");
    body.style.setProperty("padding", "0", "important");
    body.style.setProperty("width", "100%", "important");
    body.style.setProperty("max-width", "100%", "important");
    body.style.setProperty("overflow-x", "hidden", "important");
    scaleRoot.style.setProperty("transform-origin", "top left", "important");

    if (scale < 1) {
      body.style.setProperty("position", "relative", "important");
      body.style.setProperty("min-height", `${scaledHeight}px`, "important");
      html.style.setProperty("min-height", `${scaledHeight}px`, "important");
      scaleRoot.style.setProperty("position", "absolute", "important");
      scaleRoot.style.setProperty("left", "0", "important");
      scaleRoot.style.setProperty("top", "0", "important");
      scaleRoot.style.setProperty("width", `${contentWidth}px`, "important");
      scaleRoot.style.setProperty("max-width", `${contentWidth}px`, "important");
      scaleRoot.style.setProperty("transform", `scale(${scale})`, "important");
      return;
    }

    body.style.setProperty("min-height", "100%", "important");
    html.style.setProperty("min-height", "100%", "important");
    scaleRoot.style.setProperty("width", "100%", "important");
    scaleRoot.style.setProperty("max-width", "100%", "important");
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
    window.setTimeout(fitDocument, 600);

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
      className={`min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-white ${isFullscreen ? "flex h-dvh w-[100dvw] flex-col rounded-none border-0" : isModal ? "flex h-full min-h-0 max-h-full flex-col" : ""} ${className}`}
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
