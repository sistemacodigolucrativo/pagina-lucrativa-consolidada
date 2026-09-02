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

function applyFloatingLayout(layout: FloatingLayout) {
  const breakpoint = breakpointForWidth(window.innerWidth);
  const positions = layout[breakpoint];
  if (!positions) return;
  const selectors: Record<"fab" | "cta" | "toast", string> = {
    fab: ".member-chat-fab-wrap",
    cta: ".public-conversion-cta",
    toast: ".public-social-proof-toast",
  };
  (Object.keys(selectors) as Array<keyof typeof selectors>).forEach(id => {
    const point = positions[id];
    const element = document.querySelector<HTMLElement>(selectors[id]);
    if (!element || typeof point?.x !== "number" || typeof point?.y !== "number") return;
    element.style.left = `${Math.max(2, Math.min(98, point.x))}%`;
    element.style.top = `${Math.max(2, Math.min(98, point.y))}%`;
    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.transform = "translate(-50%, -50%)";
  });
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
