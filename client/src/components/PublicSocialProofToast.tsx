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

type ActiveNotice = {
  message: string;
  disclaimer: string;
  key: number;
};

type PublicToastResponse = {
  templates: PublicToastTemplate[];
  settings: PublicToastSettings;
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
    let cancelled = false;
    let nextTimer: number | undefined;
    let dismissTimer: number | undefined;

    const clearTimers = () => {
      if (nextTimer !== undefined) window.clearTimeout(nextTimer);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };

    if (!settings.enabled || !isPublicSocialProofRoute(location) || templates.length === 0) {
      setNotice(null);
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

    setNotice(null);
    historyRef.current = [];
    scheduleNext(settings.initialDelaySeconds * 1000);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [location, settings, templates]);

  if (!notice) return null;

  return <aside className="public-social-proof-toast" role="status" aria-live="polite" aria-atomic="true" key={notice.key}>
    <span className="public-social-proof-toast-mark" aria-hidden="true">PL</span>
    <span className="public-social-proof-toast-copy">
      {settings.showSimulationNotice ? <span className="public-social-proof-toast-kicker">Atividade ilustrativa</span> : null}
      <strong>{notice.message}</strong>
      {settings.showSimulationNotice && notice.disclaimer ? <small>{notice.disclaimer}</small> : null}
    </span>
  </aside>;
}
