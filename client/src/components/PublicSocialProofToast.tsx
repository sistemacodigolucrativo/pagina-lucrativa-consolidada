import { useEffect, useRef, useState } from "react";
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

export const PUBLIC_TOAST_PREVIEW_EVENT = "pagina-lucrativa:toast-preview";

type ActiveNotice = {
  message: string;
  disclaimer: string;
  key: number;
  forceSimulationNotice?: boolean;
  headerMessage?: string;
  footerMessage?: string;
};

type PublicToastResponse = {
  templates: PublicToastTemplate[];
  settings: PublicToastSettings;
};

type PublicToastPreviewDetail = {
  message: string;
  disclaimer?: string;
  showSimulationNotice?: boolean;
  headerMessage?: string;
  footerMessage?: string;
  visibleSeconds?: number;
};

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function renderTemplate(message: string) {
  const firstName = randomItem(publicToastNames);
  const surname = randomItem(publicToastSurnames);
  const city = randomItem(publicToastCities);
  const displayName = `${firstName} ${surname.charAt(0)}.`;
  return message.replaceAll("{{nome}}", displayName).replaceAll("{{cidade}}", city);
}

export default function PublicSocialProofToast() {
  const [location] = useLocation();
  const [notice, setNotice] = useState<ActiveNotice | null>(null);
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
      .catch(() => {
        if (!active) return;
        setTemplates([...publicToastDefaultTemplates]);
        setSettings(publicToastDefaultSettings);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handlePreview = (event: Event) => {
      const detail = (event as CustomEvent<PublicToastPreviewDetail>).detail;
      if (!detail?.message?.trim()) return;
      if (previewDismissRef.current !== undefined) window.clearTimeout(previewDismissRef.current);
      setNotice({
        message: renderTemplate(detail.message.trim()),
        disclaimer: detail.disclaimer?.trim() ?? "",
        key: Date.now(),
        forceSimulationNotice: detail.showSimulationNotice,
        headerMessage: detail.headerMessage,
        footerMessage: detail.footerMessage,
      });
      const visibleMs = Math.max(2, Math.min(30, detail.visibleSeconds ?? settings.visibleSeconds)) * 1000;
      previewDismissRef.current = window.setTimeout(() => setNotice(null), visibleMs);
    };
    window.addEventListener(PUBLIC_TOAST_PREVIEW_EVENT, handlePreview);
    return () => {
      window.removeEventListener(PUBLIC_TOAST_PREVIEW_EVENT, handlePreview);
      if (previewDismissRef.current !== undefined) window.clearTimeout(previewDismissRef.current);
    };
  }, [settings.visibleSeconds]);

  useEffect(() => {
    let cancelled = false;
    let nextTimer: number | undefined;
    let dismissTimer: number | undefined;

    const clearTimers = () => {
      if (nextTimer !== undefined) window.clearTimeout(nextTimer);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };

    if (!settings.enabled || !isPublicSocialProofRoute(location) || templates.length === 0) {
      return clearTimers;
    }

    const chooseIndex = () => {
      const recent = new Set(historyRef.current.slice(-Math.min(3, templates.length - 1)));
      const available = templates.map((_, index) => index).filter(index => !recent.has(index));
      const candidates = available.length ? available : templates.map((_, index) => index);
      return randomItem(candidates);
    };

    const scheduleNext = (delay: number) => {
      nextTimer = window.setTimeout(() => {
        if (cancelled) return;
        const index = chooseIndex();
        const template = templates[index];
        if (!template) return;
        historyRef.current = [...historyRef.current, index].slice(-3);
        setNotice({ message: renderTemplate(template.message), disclaimer: template.disclaimer, key: Date.now() });
        dismissTimer = window.setTimeout(() => {
          if (cancelled) return;
          setNotice(null);
          scheduleNext(randomBetween(settings.intervalMinSeconds * 1000, settings.intervalMaxSeconds * 1000));
        }, settings.visibleSeconds * 1000);
      }, delay);
    };

    historyRef.current = [];
    scheduleNext(settings.initialDelaySeconds * 1000);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [location, settings, templates]);

  if (!notice) return null;

  const showSimulationNotice = notice.forceSimulationNotice ?? settings.showSimulationNotice;
  const headerMessage = notice.headerMessage ?? settings.headerMessage;
  const footerMessage = notice.footerMessage ?? settings.footerMessage ?? notice.disclaimer;

  return <aside className="public-social-proof-toast" role="status" aria-live="polite" aria-atomic="true" key={notice.key}>
    <span className="public-social-proof-toast-mark" aria-hidden="true">PL</span>
    <span className="public-social-proof-toast-copy">
      {showSimulationNotice && headerMessage ? <span className="public-social-proof-toast-kicker">{headerMessage}</span> : null}
      <strong>{notice.message}</strong>
      {showSimulationNotice && footerMessage ? <small>{footerMessage}</small> : null}
    </span>
  </aside>;
}
