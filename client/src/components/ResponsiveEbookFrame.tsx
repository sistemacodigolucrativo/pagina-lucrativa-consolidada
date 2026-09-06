import { calculateResponsiveEbookScale } from "@shared/ebookReader";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type ResponsiveEbookFrameProps = {
  title: string;
  htmlContent: string;
  pdfUrl?: string | null;
  className?: string;
  displayMode?: "embedded" | "modal";
  readerVariant?: "default" | "tech-futuristic";
};

const scaleRootId = "codigo-lucrativo-ebook-scale-root";
const studioLayoutBodyClass = "codigo-lucrativo-tech-shell";

type PdfReaderStatus = "loading" | "ready" | "error";

type PdfCanvasPageProps = {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  containerWidth: number;
  zoom: number;
};

function isPdfCancelError(error: unknown) {
  return error instanceof Error && error.name === "RenderingCancelledException";
}

function PdfCanvasPage({ pdfDoc, pageNumber, containerWidth, zoom }: PdfCanvasPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<PdfReaderStatus>("loading");

  useEffect(() => {
    if (!containerWidth) return;

    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null;

    const renderPage = async () => {
      setStatus("loading");
      const page = await pdfDoc.getPage(pageNumber);
      if (cancelled) return;

      const canvas = canvasRef.current;
      const canvasContext = canvas?.getContext("2d");
      if (!canvas || !canvasContext) return;

      const baseViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(240, containerWidth - 4);
      const fitScale = Math.min(1.8, Math.max(0.25, availableWidth / baseViewport.width));
      const viewport = page.getViewport({ scale: fitScale * zoom });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      const transform = outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0];

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);

      renderTask = page.render({ canvasContext, viewport, transform });
      await renderTask.promise;
      if (!cancelled) setStatus("ready");
    };

    void renderPage().catch(error => {
      if (!cancelled && !isPdfCancelError(error)) setStatus("error");
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [containerWidth, pageNumber, pdfDoc, zoom]);

  return (
    <div className="relative flex w-full justify-center">
      {status !== "ready" ? (
        <div className="absolute inset-x-2 top-2 z-10 rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-center text-xs font-semibold text-slate-600 shadow-sm">
          {status === "error" ? "Não foi possível renderizar esta página." : "Carregando página..."}
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        aria-label={`Página ${pageNumber} do PDF`}
        className="max-w-full bg-white shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
      />
    </div>
  );
}

function PdfCanvasReader({ pdfUrl, title, className = "" }: { pdfUrl: string; title: string; className?: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState<PdfReaderStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    const loadingTask = getDocument({ url: pdfUrl, withCredentials: true });

    setStatus("loading");
    setPdfDoc(null);
    setPageCount(0);

    void loadingTask.promise
      .then(document => {
        if (cancelled) {
          void document.destroy();
          return;
        }

        setPdfDoc(document);
        setPageCount(document.numPages);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      void loadingTask.destroy().catch(() => undefined);
    };
  }, [pdfUrl]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateWidth = () => setContainerWidth(viewport.clientWidth);
    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <section className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-200 text-slate-900 ${className}`} aria-label={title}>
      <div className="sticky top-0 z-20 flex min-h-9 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-white/95 px-2 py-1 text-xs shadow-sm backdrop-blur">
        <span className="font-semibold text-slate-700">
          {status === "ready" ? `${pageCount} página${pageCount === 1 ? "" : "s"}` : status === "error" ? "Erro ao carregar PDF" : "Carregando PDF..."}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom(value => Math.max(0.8, Number((value - 0.1).toFixed(2))))}
            className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            -
          </button>
          <span className="min-w-12 text-center font-semibold text-slate-600">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom(value => Math.min(1.8, Number((value + 0.1).toFixed(2))))}
            className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            +
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="min-h-0 flex-1 overflow-auto px-0.5 py-1 sm:px-1">
        {status === "error" ? (
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-white p-5 text-center text-sm text-red-700 shadow-sm">
            Não foi possível carregar este PDF dentro do leitor.
          </div>
        ) : null}

        {status === "loading" ? (
          <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 text-center text-sm font-semibold text-slate-600 shadow-sm">
            Preparando leitura...
          </div>
        ) : null}

        {pdfDoc ? (
          <div className="mx-auto flex w-full max-w-full flex-col items-center gap-2">
            {pageNumbers.map(pageNumber => (
              <PdfCanvasPage key={pageNumber} pdfDoc={pdfDoc} pageNumber={pageNumber} containerWidth={containerWidth} zoom={zoom} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

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
  const isModal = displayMode === "modal";
  const isTechFuturistic = readerVariant === "tech-futuristic";
  const hasPdfSource = Boolean(pdfUrl);

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
  const techFrameClass = `flex w-full max-w-5xl flex-col overflow-hidden shadow-2xl ${techFrameHeightClass}`;

  if (hasPdfSource && pdfUrl) {
    return (
      <div
        ref={containerRef}
        data-ebook-reader="responsive"
        data-reader-mode={isFullscreen ? "fullscreen" : "embedded"}
        data-reader-display={displayMode}
        data-reader-variant="pdf-focused"
        className={`flex min-w-0 w-full max-w-full overflow-hidden rounded-lg border border-white/10 bg-slate-200 ${
          isFullscreen ? "h-dvh w-[100dvw] rounded-none border-0" : isModal ? "h-full min-h-0 max-h-full" : "h-[72dvh] min-h-[520px]"
        } ${className}`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-9 shrink-0 items-center justify-between gap-2 border-b border-slate-300 bg-slate-50 px-2 py-1">
            <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Leitor PDF</p>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen ? "Sair da tela cheia" : "Ampliar leitor PDF"}
              aria-pressed={isFullscreen}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              title={isFullscreen ? "Sair da tela cheia" : "Abrir PDF no leitor ampliado"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" /> : <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
              {isFullscreen ? "Sair" : "Abrir PDF"}
            </button>
          </div>
          <PdfCanvasReader pdfUrl={pdfUrl} title={title} className="min-h-0 flex-1" />
        </div>
      </div>
    );
  }

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
        <header className="shrink-0 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Leitor integrado</p>
              <h2 className="truncate text-sm font-semibold text-white">{title}</h2>
            </div>

            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                isFullscreen
                  ? "border-amber-400 bg-amber-400 text-neutral-950"
                  : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              aria-pressed={isFullscreen}
            >
              {isFullscreen ? <Minimize2 className="size-4" aria-hidden="true" /> : <Maximize2 className="size-4" aria-hidden="true" />}
              <span className="hidden text-[11px] sm:inline">{isFullscreen ? "Sair" : "Tela cheia"}</span>
            </button>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 justify-center overflow-auto bg-neutral-900 p-1 sm:p-2">
          <div className={techFrameClass}>
            {hasPdfSource && pdfUrl ? (
              <PdfCanvasReader pdfUrl={pdfUrl} title={title} className="min-h-0 flex-1 bg-[#050811]" />
            ) : (
              <iframe
                ref={frameRef}
                title={title}
                sandbox="allow-same-origin"
                srcDoc={htmlContent}
                onLoad={handleLoad}
                className="block min-h-0 w-full max-w-full min-w-0 flex-1 border-0 bg-[#050811]"
              />
            )}
          </div>
        </main>
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
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            title="Abrir PDF no leitor ampliado"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Abrir PDF
          </button>
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
      {hasPdfSource && pdfUrl ? (
        <PdfCanvasReader
          pdfUrl={pdfUrl}
          title={title}
          className={isFullscreen ? "h-[calc(100dvh-3rem)] min-h-0 flex-1" : isModal ? "h-full min-h-0 flex-1" : "h-[64dvh] min-h-[430px] sm:h-[72vh] sm:min-h-[560px]"}
        />
      ) : (
        <iframe
          ref={frameRef}
          title={title}
          sandbox="allow-same-origin"
          srcDoc={htmlContent}
          onLoad={handleLoad}
          className={`block w-full max-w-full min-w-0 border-0 bg-white ${isFullscreen ? "h-[calc(100dvh-3rem)] min-h-0 flex-1" : isModal ? "h-full min-h-0 flex-1" : "h-[64dvh] min-h-[430px] sm:h-[72vh] sm:min-h-[560px]"}`}
        />
      )}
    </div>
  );
}
