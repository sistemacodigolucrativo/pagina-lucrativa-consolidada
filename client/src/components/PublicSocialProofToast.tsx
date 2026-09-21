import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "wouter";
import "./PublicSocialProofToast.css";
import { isPublicSocialProofRoute, randomBetween } from "@shared/publicSocialProof";
import {
  normalizePublicToastSettings,
  publicToastCities,
  publicToastDefaultSettings,
  publicToastDefaultTemplates,
  publicToastNames,
  publicToastSurnames,
  type PublicToastSettings,
  type PublicToastTemplate,
} from "@shared/publicToastSystem";
import { withAppBase } from "@/lib/devPath";

export const PUBLIC_TOAST_PREVIEW_EVENT = "codigo-lucrativo:toast-preview";

type ActiveNotice = {
  message: string;
  displayName: string;
  disclaimer: string;
  key: number;
  forceSimulationNotice?: boolean;
  headerMessage?: string;
  footerMessage?: string;
  colors?: Pick<PublicToastSettings, "headerColor" | "nameColor" | "messageColor" | "footerColor">;
};

type PublicToastResponse = { templates: PublicToastTemplate[]; settings: PublicToastSettings };
type PublicToastPreviewDetail = {
  message: string;
  disclaimer?: string;
  showSimulationNotice?: boolean;
  headerMessage?: string;
  footerMessage?: string;
  headerColor?: string;
  nameColor?: string;
  messageColor?: string;
  footerColor?: string;
  visibleSeconds?: number;
};

function randomItem<T>(items: readonly T[]): T { return items[Math.floor(Math.random() * items.length)]!; }
function renderTemplate(message: string) {
  const firstName = randomItem(publicToastNames);
  const surname = randomItem(publicToastSurnames);
  const city = randomItem(publicToastCities);
  const displayName = `${firstName} ${surname.charAt(0)}.`;
  return { message: message.replaceAll("{{nome}}", displayName).replaceAll("{{cidade}}", city), displayName };
}
function colorizedMessage(message: string, displayName: string, nameColor: string): ReactNode {
  if (!displayName || !message.includes(displayName)) return message;
  const [before, ...rest] = message.split(displayName);
  return <>{before}<span className="public-social-proof-toast-name" style={{ color: nameColor }}>{displayName}</span>{rest.join(displayName)}</>;
}

function isVisibleElement(element: HTMLElement | null) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none" && style.opacity !== "0";
}

function getFloatingAnchor() {
  const mobileMenu = document.querySelector<HTMLElement>(".mobile-menu-button");
  if (mobileMenu && isVisibleElement(mobileMenu) && window.getComputedStyle(mobileMenu).position === "fixed") return mobileMenu;
  const conversionCta = document.querySelector<HTMLElement>(".public-conversion-cta");
  if (isVisibleElement(conversionCta)) return conversionCta;
  return null;
}

function hasFloatingAnchor() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  return Boolean(getFloatingAnchor());
}

function positionToastInPageFlow() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  window.requestAnimationFrame(() => {
    const anchor = getFloatingAnchor();
    if (!anchor) return;
    const anchorRect = anchor.getBoundingClientRect();
    const gap = window.innerWidth <= 650 ? 10 : 14;
    const viewportMargin = window.innerWidth <= 650 ? 8 : 18;
    const availableWidth = Math.max(0, anchorRect.left - viewportMargin - gap);
    const toastWidth = Math.min(320, availableWidth);
    if (toastWidth < 220) return;
    const compactToastHeight = window.innerWidth <= 650 ? 44 : 46;
    const viewportTop = anchorRect.top + (anchorRect.height - compactToastHeight) / 2;
    const viewportLeft = anchorRect.left - gap - toastWidth;
    document.documentElement.style.setProperty("--public-toast-page-top", `${Math.round(Math.max(viewportMargin, viewportTop))}px`);
    document.documentElement.style.setProperty("--public-toast-page-left", `${Math.round(Math.max(viewportMargin, viewportLeft))}px`);
    document.documentElement.style.setProperty("--public-toast-page-width", `${Math.round(toastWidth)}px`);
  });
}

export default function PublicSocialProofToast() {
  const [location] = useLocation();
  const [notice, setNotice] = useState<ActiveNotice | null>(null);
  const [templates, setTemplates] = useState<PublicToastTemplate[]>([...publicToastDefaultTemplates]);
  const [settings, setSettings] = useState<PublicToastSettings>(publicToastDefaultSettings);
  const historyRef = useRef<number[]>([]);
  const previewDismissRef = useRef<number | undefined>(undefined);
  const floatingAnchorReadyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let frame = 0;
    const updateAnchorState = () => {
      frame = 0;
      floatingAnchorReadyRef.current = hasFloatingAnchor();
      if (!notice) positionToastInPageFlow();
    };
    const scheduleAnchorState = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateAnchorState);
    };
    scheduleAnchorState();
    window.addEventListener("scroll", scheduleAnchorState, { passive: true });
    window.addEventListener("resize", scheduleAnchorState);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleAnchorState);
      window.removeEventListener("resize", scheduleAnchorState);
    };
  }, [notice]);

  useEffect(() => {
    if (!isPublicSocialProofRoute(location)) {
      setNotice(null);
    }
  }, [location]);

  useEffect(() => {
    const handlePreview = (event: Event) => {
      const detail = (event as CustomEvent<PublicToastPreviewDetail>).detail;
      if (!detail?.message?.trim()) return;
      if (previewDismissRef.current !== undefined) window.clearTimeout(previewDismissRef.current);
      const rendered = renderTemplate(detail.message.trim());
      setNotice({
        ...rendered,
        disclaimer: detail.disclaimer?.trim() ?? "",
        key: Date.now(),
        forceSimulationNotice: detail.showSimulationNotice,
        headerMessage: detail.headerMessage,
        footerMessage: detail.footerMessage,
        colors: {
          headerColor: detail.headerColor ?? settings.headerColor,
          nameColor: detail.nameColor ?? settings.nameColor,
          messageColor: detail.messageColor ?? settings.messageColor,
          footerColor: detail.footerColor ?? settings.footerColor,
        },
      });
      const visibleMs = Math.max(2, Math.min(30, detail.visibleSeconds ?? settings.visibleSeconds)) * 1000;
      previewDismissRef.current = window.setTimeout(() => setNotice(null), visibleMs);
    };
    window.addEventListener(PUBLIC_TOAST_PREVIEW_EVENT, handlePreview);
    return () => {
      window.removeEventListener(PUBLIC_TOAST_PREVIEW_EVENT, handlePreview);
      if (previewDismissRef.current !== undefined) window.clearTimeout(previewDismissRef.current);
    };
  }, [settings]);

  useEffect(() => {
    let cancelled = false;
    fetch(withAppBase("/api/public-toast-config"))
      .then(async response => {
        if (!response.ok) throw new Error("Não foi possível carregar os avisos públicos.");
        return response.json() as Promise<PublicToastResponse>;
      })
      .then(data => {
        if (cancelled) return;
        const nextTemplates = Array.isArray(data.templates) && data.templates.length ? data.templates : [...publicToastDefaultTemplates];
        setTemplates(nextTemplates);
        setSettings(normalizePublicToastSettings(data.settings));
      })
      .catch(() => {
        if (cancelled) return;
        setTemplates([...publicToastDefaultTemplates]);
        setSettings(publicToastDefaultSettings);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let nextTimer: number | undefined;
    let dismissTimer: number | undefined;
    const clearTimers = () => { if (nextTimer !== undefined) window.clearTimeout(nextTimer); if (dismissTimer !== undefined) window.clearTimeout(dismissTimer); };
    if (!settings.enabled || !isPublicSocialProofRoute(location) || templates.length === 0) {
      setNotice(null);
      return clearTimers;
    }

    const chooseIndex = () => {
      const recent = new Set(historyRef.current.slice(-Math.min(3, templates.length - 1)));
      const available = templates.map((_, index) => index).filter(index => !recent.has(index));
      return randomItem(available.length ? available : templates.map((_, index) => index));
    };
    const scheduleNext = (delay: number) => {
      nextTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (!floatingAnchorReadyRef.current) {
          scheduleNext(1000);
          return;
        }
        const index = chooseIndex();
        const template = templates[index];
        if (!template) return;
        historyRef.current = [...historyRef.current, index].slice(-3);
        const rendered = renderTemplate(template.message);
        setNotice({ ...rendered, disclaimer: template.disclaimer, key: Date.now() });
        dismissTimer = window.setTimeout(() => {
          if (cancelled) return;
          setNotice(null);
          scheduleNext(randomBetween(settings.intervalMinSeconds * 1000, settings.intervalMaxSeconds * 1000));
        }, settings.visibleSeconds * 1000);
      }, delay);
    };
    historyRef.current = [];
    scheduleNext(Math.min(settings.initialDelaySeconds * 1000, 4_000));
    return () => { cancelled = true; clearTimers(); };
  }, [location, settings, templates]);

  useEffect(() => {
    if (!notice) return;
    positionToastInPageFlow();
  }, [notice]);

  if (!notice) return null;
  const showSimulationNotice = notice.forceSimulationNotice ?? settings.showSimulationNotice;
  const headerMessage = notice.headerMessage ?? settings.headerMessage;
  const footerMessage = notice.footerMessage ?? settings.footerMessage ?? notice.disclaimer;
  const colors = notice.colors ?? settings;
  const style = {
    "--toast-header-color": colors.headerColor,
    "--toast-message-color": colors.messageColor,
    "--toast-footer-color": colors.footerColor,
  } as CSSProperties;

  const toast = <aside translate="no" className="public-social-proof-toast public-social-proof-toast-inline" style={style} role="status" aria-live="polite" aria-atomic="true" key={notice.key}>
    <span className="public-social-proof-toast-mark" aria-hidden="true">CL</span>
    <span className="public-social-proof-toast-copy">
      {showSimulationNotice && headerMessage ? <span className="public-social-proof-toast-kicker">{headerMessage}</span> : null}
      <strong>{colorizedMessage(notice.message, notice.displayName, colors.nameColor)}</strong>
      {showSimulationNotice && footerMessage ? <small>{footerMessage}</small> : null}
    </span>
  </aside>;
  return toast;
}
