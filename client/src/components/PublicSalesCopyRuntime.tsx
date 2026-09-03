import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { withAppBase } from "@/lib/devPath";
import type { PublicSalesCopyOverrides } from "@shared/publicSalesCopyEditor";

type Point = { x?: number; y?: number };
export type FloatingLayout = Partial<Record<"desktop" | "tablet" | "mobile", Partial<Record<"fab" | "cta" | "toast", Point>>>>;

type PublicSalesCopyState = {
  overrides: PublicSalesCopyOverrides;
  floatingLayout: FloatingLayout;
};

const PUBLIC_SALES_COPY_ENDPOINT = "/api/public-sales-copy";
const PublicSalesCopyContext = createContext<PublicSalesCopyState>({ overrides: {}, floatingLayout: {} });
const FLOATING_POSITION_PROPS = ["left", "top", "right", "bottom", "transform"] as const;

export function usePublicSalesCopy() {
  return useContext(PublicSalesCopyContext);
}

export function PublicSalesCopyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PublicSalesCopyState>({ overrides: {}, floatingLayout: {} });

  useEffect(() => {
    let active = true;
    fetch(withAppBase(PUBLIC_SALES_COPY_ENDPOINT), { credentials: "include" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Falha ao carregar copy pública")))
      .then((payload: PublicSalesCopyState) => {
        if (!active) return;
        setState({
          overrides: payload.overrides ?? {},
          floatingLayout: payload.floatingLayout ?? {},
        });
      })
      .catch(error => console.warn("[PublicSalesCopy] configuração indisponível:", error));
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
      if (element.classList.contains("public-social-proof-toast-inline")) return;
      const point = positions[id];
      if (typeof point?.x !== "number" || typeof point.y !== "number") {
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
  const { floatingLayout } = usePublicSalesCopy();

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let queued = false;

    const scheduleApply = () => {
      if (queued || cancelled) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        if (!cancelled) {
          applyFloatingLayout(floatingLayout);
        }
      });
    };

    const handleResize = () => scheduleApply();
    window.addEventListener("resize", handleResize);

    scheduleApply();
    observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [floatingLayout]);

  return null;
}
