import { calculateResponsiveEbookScale } from "@shared/ebookReader";
import { Bookmark, CheckCircle2, ExternalLink, Layers, Maximize2, Minimize2, Monitor, Moon, Smartphone, Tablet } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ResponsiveEbookFrameProps = {
  title: string;
  htmlContent: string;
  pdfUrl?: string | null;
  className?: string;
  displayMode?: "embedded" | "modal";
  readerVariant?: "default" | "tech-futuristic";
};

type DeviceView = "responsive" | "tablet" | "mobile";

const scaleRootId = "codigo-lucrativo-ebook-scale-root";
const studioLayoutBodyClass = "codigo-lucrativo-tech-shell";

function getEmbeddedPdfFrameSource(pdfUrl: string | null) {
  if (!pdfUrl) return undefined;

  if (typeof window === "undefined") return pdfUrl;

  try {
    const absolutePdfUrl = new URL(pdfUrl, window.location.href).toString();
    const host = window.location.hostname.toLowerCase();
    const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    if (isLocalHost) return absolutePdfUrl;

    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(absolutePdfUrl)}`;
  } catch {
    return pdfUrl;
  }
}

const techJumpSections = [
  { label: "Capa", target: "#capa" },
  { label: "Introdução", target: "#introducao" },
  { label: "Sumário", target: "#sumario" },
  { label: "Protocolo", target: "#protocolo" },
  { label: "Leitura", target: "#leitura" },
  { label: "Execução", target: "#execucao" },
  { label: "Conclusão", target: "#conclusao" },
  { label: "CTA Final", target: "#cta-final" },
];

function getElementWidth(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return Math.ceil(Math.max(element.offsetWidth, element.scrollWidth, rect.width));
}

function getElementHeight(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return Math.ceil(Math.max(element.offsetHeight, element.scrollHeight, rect.height));
}

function getNumericStyle(style: CSSStyleDeclaration, property: string) {
  const value = Number.parseFloat(style.getPropertyValue(property));
  return Number.isFinite(value) ? value : 0;
}

export default function ResponsiveEbookFrame({
  title,
  htmlContent,
  pdfUrl = null,
  className = "",
  displayMode = "embedded",
  readerVariant = "default",
}: ResponsiveEbookFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceView, setDeviceView] = useState<DeviceView>("responsive");
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const isModal = displayMode === "modal";
  const isTechFuturistic = readerVariant === "tech-futuristic";
  const hasPdfSource = Boolean(pdfUrl);
  const pdfFrameSource = hasPdfSource ? getEmbeddedPdfFrameSource(pdfUrl) : undefined;

  const fitStudioOriginalContent = useCallback((document: Document) => {
    const viewports = Array.from(document.querySelectorAll<HTMLElement>(".cl-original-viewport"));
    viewports.forEach(viewport => {
      const original = viewport.querySelector<HTMLElement>(".cl-original-content");
      if (!original) return;

      original.style.removeProperty("transform");
      original.style.removeProperty("width");
      original.style.removeProperty("max-width");
      original.style.removeProperty("margin");
      viewport.style.removeProperty("height");
      viewport.style.removeProperty("min-height");
      viewport.style.removeProperty("overflow-x");
      viewport.style.removeProperty("overflow-y");

      const pages = Array.from(original.querySelectorAll<HTMLElement>("[id^='page'][id$='-div'], .page"));
      const pageWidth = Math.max(0, ...pages.map(getElementWidth));
      const naturalWidth = Math.max(1, pageWidth, getElementWidth(original));
      const pageHeight = Math.max(0, ...pages.map(page => page.offsetTop + getElementHeight(page)));
      const naturalHeight = Math.max(1, pageHeight, getElementHeight(original));
      const viewportStyle = document.defaultView?.getComputedStyle(viewport);
      const horizontalPadding = viewportStyle
        ? getNumericStyle(viewportStyle, "padding-left") + getNumericStyle(viewportStyle, "padding-right")
        : 0;
      const verticalPadding = viewportStyle
        ? getNumericStyle(viewportStyle, "padding-top") + getNumericStyle(viewportStyle, "padding-bottom")
        : 0;
      const availableWidth = Math.max(1, Math.floor(viewport.clientWidth - horizontalPadding));
      const scale = calculateResponsiveEbookScale(availableWidth, naturalWidth);
      const scaledHeight = Math.ceil(naturalHeight * scale + verticalPadding);

      viewport.style.setProperty("height", `${scaledHeight}px`, "important");
      viewport.style.setProperty("min-height", `${Math.min(scaledHeight, 360)}px`, "important");
      viewport.style.setProperty("overflow-x", "hidden", "important");
      viewport.style.setProperty("overflow-y", "hidden", "important");
      original.style.setProperty("width", `${naturalWidth}px`, "important");
      original.style.setProperty("max-width", `${naturalWidth}px`, "important");
      original.style.setProperty("transform-origin", "top left", "important");

      if (scale < 1) {
        original.style.setProperty("margin", "0", "important");
        original.style.setProperty("transform", `scale(${scale})`, "important");
        return;
      }

      original.style.setProperty("margin", "0 auto", "important");
    });
  }, []);

  const fitDocument = useCallback(() => {
    if (hasPdfSource) return;

    const frame = frameRef.current;
    const document = frame?.contentDocument;
    if (!frame || !document?.body) return;

    const body = document.body;
    const html = document.documentElement;
    const hasStudioLayout = body.classList.contains(studioLayoutBodyClass);

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
        ${hasStudioLayout ? "" : "background: #ffffff !important;"}
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

      body.${studioLayoutBodyClass} #${scaleRootId} {
        width: 100% !important;
        max-width: 100% !important;
      }

      img, svg, canvas, video, object, embed {
        max-width: 100% !important;
      }
    `;

    html.style.setProperty("overflow-x", "hidden", "important");
    body.style.setProperty("margin", "0", "important");
    body.style.setProperty("padding", "0", "important");
    body.style.setProperty("width", "100%", "important");
    body.style.setProperty("max-width", "100%", "important");
    body.style.setProperty("overflow-x", "hidden", "important");
    scaleRoot.style.setProperty("transform-origin", "top left", "important");

    if (hasStudioLayout) {
      body.style.setProperty("min-height", "100%", "important");
      html.style.setProperty("min-height", "100%", "important");
      scaleRoot.style.setProperty("position", "static", "important");
      scaleRoot.style.setProperty("width", "100%", "important");
      scaleRoot.style.setProperty("max-width", "100%", "important");
      scaleRoot.style.setProperty("transform", "none", "important");
      fitStudioOriginalContent(document);
      return;
    }

    const pages = Array.from(scaleRoot.querySelectorAll<HTMLElement>("[id^='page'][id$='-div'], .page"));
    const pageWidth = Math.max(0, ...pages.map(getElementWidth));
    const rootRect = scaleRoot.getBoundingClientRect();
    const contentWidth = Math.ceil(
      Math.max(pageWidth, scaleRoot.scrollWidth, scaleRoot.offsetWidth, rootRect.width, body.scrollWidth, html.scrollWidth)
    );
    const availableWidth = Math.max(1, Math.floor((frame.clientWidth || frame.getBoundingClientRect().width) - 2));
    const scale = calculateResponsiveEbookScale(availableWidth, contentWidth);
    const contentHeight = Math.ceil(Math.max(scaleRoot.scrollHeight, scaleRoot.offsetHeight, rootRect.height, body.scrollHeight, html.scrollHeight));
    const scaledHeight = Math.ceil(contentHeight * scale);

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
  }, [fitStudioOriginalContent, hasPdfSource]);

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

    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
        return;
      }

      await container.requestFullscreen();
    } catch {
      setIsFullscreen(current => !current);
    }
  };

  const handleLoad = () => {
    if (hasPdfSource) return;

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

  const jumpToSection = (target: string) => {
    if (hasPdfSource) return;

    frameRef.current?.contentDocument?.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(fitDocument, 220);
  };

  const deviceFrameClass =
    deviceView === "tablet"
      ? "flex w-[768px] max-w-full flex-col overflow-hidden rounded-2xl border-8 border-neutral-800 shadow-2xl"
      : deviceView === "mobile"
        ? "flex w-[412px] max-w-full flex-col overflow-hidden rounded-3xl border-8 border-neutral-800 shadow-2xl"
        : "flex w-full max-w-5xl flex-col overflow-hidden shadow-2xl";
  const techContainerStateClass = isFullscreen
    ? "flex h-dvh w-[100dvw] flex-col rounded-none border-0"
    : isModal
      ? "flex h-full min-h-0 max-h-full flex-col"
      : "flex min-h-[76dvh] flex-col";
  const techFrameHeightClass = isFullscreen
    ? "h-full min-h-0"
    : isModal
      ? "h-full min-h-[520px]"
      : "h-[72vh] min-h-[560px]";

  if (isTechFuturistic) {
    return (
      <div
        ref={containerRef}
        data-ebook-reader="responsive"
        data-reader-mode={isFullscreen ? "fullscreen" : "embedded"}
        data-reader-display={displayMode}
        data-reader-variant="tech-futuristic"
        className={`relative min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-cyan-300/20 bg-neutral-950 text-neutral-100 ${techContainerStateClass} ${className}`}
      >
        <header className="shrink-0 border-b border-neutral-800 bg-neutral-950/95 shadow-xl backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex min-w-0 flex-col items-start border-x border-neutral-800 px-2 py-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-400">1 / 1</span>
                  <span className="inline-flex items-center gap-1 rounded border border-indigo-700/50 bg-indigo-950 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                    <Moon className="size-2.5" aria-hidden="true" /> DARK
                  </span>
                  <span className="hidden rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300 sm:inline">
                    Cyber / HUD
                  </span>
                </div>
                <span className="max-w-[15rem] truncate text-sm font-bold tracking-tight text-white">TECH FUTURISTIC</span>
              </div>
              <span className="hidden border border-emerald-500/30 px-2 py-1 text-[10px] tracking-[0.18em] text-emerald-400 md:inline">
                TEMPLATE INTEGRAL
              </span>
            </div>

            {!hasPdfSource ? (
              <div className="hidden items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[11px] xl:flex">
                <span className="flex items-center gap-1 px-1.5 font-semibold text-neutral-500">
                  <Bookmark className="size-3 text-neutral-400" aria-hidden="true" /> Ir para:
                </span>
                {techJumpSections.map(section => (
                  <button
                    key={section.target}
                    type="button"
                    onClick={() => jumpToSection(section.target)}
                    className="rounded px-2 py-1 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              {hasPdfSource ? (
                <a
                  href={pdfUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/20 hover:text-white"
                  title="Abrir PDF em nova aba"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">ABRIR PDF</span>
                </a>
              ) : null}
              <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 p-0.5">
                <button
                  type="button"
                  onClick={() => setDeviceView("responsive")}
                  className={`rounded p-1.5 text-xs transition-colors ${deviceView === "responsive" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"}`}
                  title="Largura completa / responsivo"
                  aria-pressed={deviceView === "responsive"}
                >
                  <Monitor className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView("tablet")}
                  className={`rounded p-1.5 text-xs transition-colors ${deviceView === "tablet" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"}`}
                  title="Simular tablet"
                  aria-pressed={deviceView === "tablet"}
                >
                  <Tablet className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView("mobile")}
                  className={`rounded p-1.5 text-xs transition-colors ${deviceView === "mobile" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"}`}
                  title="Simular smartphone"
                  aria-pressed={deviceView === "mobile"}
                >
                  <Smartphone className="size-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                  isFullscreen
                    ? "border-amber-400 bg-amber-400 text-neutral-950"
                    : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
                title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                aria-pressed={isFullscreen}
              >
                {isFullscreen ? <Minimize2 className="size-4" aria-hidden="true" /> : <Maximize2 className="size-4" aria-hidden="true" />}
                <span className="hidden text-[11px] md:inline">{isFullscreen ? "SAIR" : "FULL SCREEN"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTemplateMenuOpen(open => !open)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                  isTemplateMenuOpen
                    ? "border-amber-400 bg-amber-400 text-neutral-950"
                    : "border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
                }`}
                aria-expanded={isTemplateMenuOpen}
                title="Ver template ativo"
              >
                <Layers className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">TEMPLATE ATIVO</span>
              </button>
            </div>
          </div>

          {isTemplateMenuOpen ? (
            <div className="border-t border-neutral-800 bg-neutral-950 p-4 shadow-2xl sm:p-6">
              <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                    <CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" />
                    Template ativo
                  </h3>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-neutral-400">
                    O leitor está renderizando o design TECH FUTURISTIC integral: HUD, capa, sumário, capítulos, leitura principal, execução, conclusão e CTA final.
                  </p>
                </div>
                <div className="max-w-sm rounded-xl border border-amber-400 bg-neutral-900 p-3.5 shadow-lg ring-2 ring-amber-400/40">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400">#01 (Ex-05)</span>
                    <span className="inline-flex items-center gap-1 rounded border border-indigo-700/50 bg-indigo-950 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                      <Moon className="size-2.5" aria-hidden="true" /> DARK
                    </span>
                  </div>
                  <h4 className="mb-1 text-xs font-bold text-white">TECH FUTURISTIC</h4>
                  <p className="mb-2 text-[11px] leading-relaxed text-neutral-400">
                    Aparência de interface HUD, tipografia técnica, preto fosco, ciano e verde neon.
                  </p>
                  <div className="flex items-center justify-between border-t border-neutral-800/80 pt-2 text-[10px] text-neutral-400">
                    <span className="truncate">Preto Fosco & Verde Neon</span>
                    <span className="font-semibold text-amber-400">ATIVO</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </header>

        <main className="flex min-h-0 flex-1 justify-center overflow-auto bg-neutral-900 px-2 py-3 sm:px-4 sm:py-5">
          <div className={`${deviceFrameClass} ${techFrameHeightClass} transition-all duration-300`}>
            {deviceView !== "responsive" ? (
              <div className="border-b border-neutral-700 bg-neutral-800 py-1.5 text-center text-[11px] text-neutral-400">
                {deviceView === "tablet" ? "SIMULAÇÃO TABLET - 768px" : "SIMULAÇÃO SMARTPHONE - 412px"}
              </div>
            ) : null}
            <iframe
              ref={frameRef}
              title={title}
              sandbox={hasPdfSource ? undefined : "allow-same-origin"}
              src={pdfFrameSource}
              srcDoc={hasPdfSource ? undefined : htmlContent}
              onLoad={handleLoad}
              className="block min-h-0 w-full max-w-full min-w-0 flex-1 border-0 bg-[#050811]"
            />
          </div>
        </main>

        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="absolute bottom-16 right-4 z-40 inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/90 p-3 text-xs text-white shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-neutral-800"
          title={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
          aria-pressed={isFullscreen}
        >
          {isFullscreen ? <Minimize2 className="size-4 text-amber-400" aria-hidden="true" /> : <Maximize2 className="size-4 text-amber-400" aria-hidden="true" />}
          <span className="hidden text-[10px] sm:inline">{isFullscreen ? "ESC" : "FULL SCREEN"}</span>
        </button>

        <footer className="flex shrink-0 flex-col items-center justify-between gap-2 border-t border-neutral-800 bg-neutral-950 px-4 py-3 text-center text-xs text-neutral-400 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold text-amber-400">TEMPLATE ATIVO:</span>
            <span>TECH FUTURISTIC (Cyber / HUD)</span>
          </div>
          <span className="text-[11px] text-neutral-400">
            Paleta: <strong className="text-neutral-200">Preto Fosco & Verde Neon</strong> | Tipografia:{" "}
            <strong className="text-neutral-200">Space Grotesk + Mono</strong>
          </span>
        </footer>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-ebook-reader="responsive"
      data-reader-mode={isFullscreen ? "fullscreen" : "embedded"}
      data-reader-display={displayMode}
      data-reader-variant="default"
      className={`min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-white ${isFullscreen ? "flex h-dvh w-[100dvw] flex-col rounded-none border-0" : isModal ? "flex h-full min-h-0 max-h-full flex-col" : ""} ${className}`}
    >
      <div className="flex min-h-12 min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          {isFullscreen ? "Leitura ampliada" : "Leitor integrado"}
        </p>
        {hasPdfSource ? (
          <a
            href={pdfUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Abrir PDF
          </a>
        ) : null}
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
        sandbox={hasPdfSource ? undefined : "allow-same-origin"}
        src={pdfFrameSource}
        srcDoc={hasPdfSource ? undefined : htmlContent}
        onLoad={handleLoad}
        className={`block w-full max-w-full min-w-0 border-0 bg-white ${isFullscreen ? "h-[calc(100dvh-3rem)] min-h-0 flex-1" : isModal ? "h-full min-h-0 flex-1" : "h-[64dvh] min-h-[430px] sm:h-[72vh] sm:min-h-[560px]"}`}
      />
    </div>
  );
}
