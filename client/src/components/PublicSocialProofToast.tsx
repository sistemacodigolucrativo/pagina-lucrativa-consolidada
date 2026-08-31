import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
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

const MOBILE_TABLET_QUERY = "(max-width: 900px)";
const COMPACT_SCROLL_THRESHOLD = 28;
const MOBILE_SCROLL_RECHECK_MS = 250;

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

export default function PublicSocialProofToast() {
  const [location] = useLocation();
  const [notice, setNotice] = useState<ActiveNotice | null>(null);
  const [toastSlot, setToastSlot] = useState<HTMLElement | null>(null);
  const [templates, setTemplates] = useState<PublicToastTemplate[]>([...publicToastDefaultTemplates]);
  const [settings, setSettings] = useState<PublicToastSettings>(publicToastDefaultSettings);
  const historyRef = useRef<number[]>([]);
  const previewDismissRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let active = true;
    fetch(withAppBase("/api/public-toast-config"), { headers: { Accept: "application/json" } })
      .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then((data: PublicToastResponse) => {
        if (!active) return;
        if (Array.isArray(data.templates) && data.templates.length) setTemplates(data.templates);
        setSettings(normalizePublicToastSettings(data.settings));
      })
      .catch(() => { if (active) { setTemplates([...publicToastDefaultTemplates]); setSettings(publicToastDefaultSettings); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setToastSlot(typeof document === "undefined" ? null : document.getElementById("public-social-proof-toast-slot"));
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
    let nextTimer: number | undefined;
    let dismissTimer: number | undefined;
    const clearTimers = () => { if (nextTimer !== undefined) window.clearTimeout(nextTimer); if (dismissTimer !== undefined) window.clearTimeout(dismissTimer); };
    if (!settings.enabled || !isPublicSocialProofRoute(location) || templates.length === 0) return clearTimers;

    const chooseIndex = () => {
      const recent = new Set(historyRef.current.slice(-Math.min(3, templates.length - 1)));
      const available = templates.map((_, index) => index).filter(index => !recent.has(index));
      return randomItem(available.length ? available : templates.map((_, index) => index));
    };
    const shouldWaitForMobileScroll = () => window.matchMedia(MOBILE_TABLET_QUERY).matches && window.scrollY <= COMPACT_SCROLL_THRESHOLD;
    const scheduleNext = (delay: number) => {
      nextTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (shouldWaitForMobileScroll()) {
          scheduleNext(MOBILE_SCROLL_RECHECK_MS);
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
    scheduleNext(settings.initialDelaySeconds * 1000);
    return () => { cancelled = true; clearTimers(); };
  }, [location, settings, templates]);

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

  const toast = <aside className={`public-social-proof-toast${toastSlot ? " public-social-proof-toast-inline" : ""}`} style={style} role="status" aria-live="polite" aria-atomic="true" key={notice.key}>
    <span className="public-social-proof-toast-mark" aria-hidden="true">CL</span>
    <span className="public-social-proof-toast-copy">
      {showSimulationNotice && headerMessage ? <span className="public-social-proof-toast-kicker">{headerMessage}</span> : null}
      <strong>{colorizedMessage(notice.message, notice.displayName, colors.nameColor)}</strong>
      {showSimulationNotice && footerMessage ? <small>{footerMessage}</small> : null}
    </span>
  </aside>;
  return toastSlot ? createPortal(toast, toastSlot) : toast;
}
