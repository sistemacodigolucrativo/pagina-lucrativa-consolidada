import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { withAppBase } from "@/lib/devPath";
import type { PublicSalesCopyOverrides } from "@shared/publicSalesCopyEditor";
import { PUBLIC_HERO_TITLE, splitPublicHeroTitle } from "@shared/publicHeroTitle";

type Point = { x?: number; y?: number };
export type FloatingLayout = Partial<Record<"desktop" | "tablet" | "mobile", Partial<Record<"fab" | "cta" | "toast", Point>>>>;

type PublicSalesCopyState = {
  overrides: PublicSalesCopyOverrides;
  floatingLayout: FloatingLayout;
  ready: boolean;
};

const PUBLIC_SALES_COPY_ENDPOINT = "/api/public-sales-copy";
const PublicSalesCopyContext = createContext<PublicSalesCopyState>({ overrides: {}, floatingLayout: {}, ready: false });
const FLOATING_POSITION_PROPS = ["left", "top", "right", "bottom", "transform"] as const;
const HERO_TITLE_SELECTOR = ".reference-page .sales-hero .sales-hero-copy > h1";

export function usePublicSalesCopy() {
  return useContext(PublicSalesCopyContext);
}

export function PublicSalesCopyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PublicSalesCopyState>({ overrides: {}, floatingLayout: {}, ready: false });

  useEffect(() => {
    let active = true;
    fetch(withAppBase(PUBLIC_SALES_COPY_ENDPOINT), { credentials: "include" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Falha ao carregar copy pública")))
      .then((payload: Omit<PublicSalesCopyState, "ready">) => {
        if (!active) return;
        setState({
          overrides: payload.overrides ?? {},
          floatingLayout: payload.floatingLayout ?? {},
          ready: true,
        });
      })
      .catch(error => {
        console.warn("[PublicSalesCopy] copy pública indisponível:", error);
        if (active) setState(current => ({ ...current, ready: true }));
      });
    return () => { active = false; };
  }, []);

  return <PublicSalesCopyContext.Provider value={state}>{children}</PublicSalesCopyContext.Provider>;
}

function breakpointForWidth(width: number): "desktop" | "tablet" | "mobile" {
  if (width <= 560) return "mobile";
  if (width <= 980) return "tablet";
  return "desktop";
}

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resetFloatingPosition(element: HTMLElement) {
  FLOATING_POSITION_PROPS.forEach(property => element.style.removeProperty(property));
}

function clampPointToViewport(element: HTMLElement, point: Required<Point>) {
  const rect = element.getBoundingClientRect();
  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  const elementWidth = rect.width || element.offsetWidth || 0;
  const elementHeight = rect.height || element.offsetHeight || 0;
  const minX = Math.min(50, ((elementWidth / 2 + 8) / viewportWidth) * 100);
  const maxX = Math.max(50, 100 - minX);
  const minY = Math.min(50, ((elementHeight / 2 + 8) / viewportHeight) * 100);
  const maxY = Math.max(50, 100 - minY);
  return {
    x: clamp(minX, clamp(0, point.x, 100), maxX),
    y: clamp(minY, clamp(0, point.y, 100), maxY),
  };
}

function rectanglesOverlap(first: DOMRect, second: DOMRect) {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

function preventFloatingActionOverlap() {
  const cta = document.querySelector<HTMLElement>(".public-conversion-cta");
  const fab = document.querySelector<HTMLElement>(".member-chat-fab-wrap");
  if (!cta || !fab) return;

  if (rectanglesOverlap(cta.getBoundingClientRect(), fab.getBoundingClientRect())) {
    resetFloatingPosition(cta);
    resetFloatingPosition(fab);
  }
}

function applyHeroTitle(overrides: PublicSalesCopyOverrides, ready: boolean) {
  document.querySelectorAll<HTMLHeadingElement>(HERO_TITLE_SELECTOR).forEach(element => {
    if (!ready) {
      element.classList.remove("public-hero-title-ready");
      return;
    }

    const title = overrides.hero?.title?.trim() || PUBLIC_HERO_TITLE;
    if (element.dataset.publicHeroTitle === title && element.classList.contains("public-hero-title-ready")) return;

    const { accent, remainder } = splitPublicHeroTitle(title);
    const accentNode = document.createElement("span");
    accentNode.className = "public-hero-title-accent";
    accentNode.textContent = accent;
    element.replaceChildren(accentNode);
    if (remainder) element.append(document.createTextNode(` ${remainder}`));
    element.dataset.publicHeroTitle = title;
    element.classList.add("public-hero-title-ready");
  });
}

function applyFloatingLayout(layout: FloatingLayout) {
  const breakpoint = breakpointForWidth(window.innerWidth);
  const positions = layout[breakpoint] ?? {};
  const selectors: Record<"fab" | "cta" | "toast", string> = {
    fab: ".member-chat-fab-wrap",
    cta: ".public-conversion-cta",
    toast: ".public-social-proof-toast",
  };

  (Object.keys(selectors) as Array<keyof typeof selectors>).forEach(id => {
    document.querySelectorAll<HTMLElement>(selectors[id]).forEach(element => {
      if (id === "fab" || id === "cta") {
        resetFloatingPosition(element);
        return;
      }
      if (element.classList.contains("public-social-proof-toast-inline")) return;
      const point = positions[id];
      if (typeof point?.x !== "number" || typeof point?.y !== "number") {
        resetFloatingPosition(element);
        return;
      }

      const nextPoint = clampPointToViewport(element, { x: point.x, y: point.y });
      element.style.left = nextPoint.x + "%";
      element.style.top = nextPoint.y + "%";
      element.style.right = "auto";
      element.style.bottom = "auto";
      element.style.transform = "translate(-50%, -50%)";
    });
  });
  preventFloatingActionOverlap();
}

export default function PublicSalesCopyRuntime() {
  const { floatingLayout, overrides, ready } = usePublicSalesCopy();

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let queued = false;

    const applyRuntime = () => {
      if (cancelled) return;
      applyHeroTitle(overrides, ready);
      applyFloatingLayout(floatingLayout);
    };

    const scheduleApply = () => {
      if (queued || cancelled) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        applyRuntime();
      });
    };

    const handleResize = () => scheduleApply();
    window.addEventListener("resize", handleResize);

    applyRuntime();
    observer = new MutationObserver(() => {
      applyHeroTitle(overrides, ready);
      scheduleApply();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [floatingLayout, overrides, ready]);

  return null;
}
