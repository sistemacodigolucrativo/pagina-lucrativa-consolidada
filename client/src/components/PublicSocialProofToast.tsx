import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import "./PublicSocialProofToast.css";
import {
  choosePublicSocialProofIndex,
  formatPublicSocialProof,
  isPublicSocialProofRoute,
  publicSocialProofConfig,
  publicSocialProofDisclaimer,
  publicSocialProofEntries,
  randomBetween,
  type PublicSocialProofEntry,
} from "@shared/publicSocialProof";

type ActiveNotice = {
  entry: PublicSocialProofEntry;
  key: number;
};

export default function PublicSocialProofToast() {
  const [location] = useLocation();
  const [notice, setNotice] = useState<ActiveNotice | null>(null);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    let nextTimer: number | undefined;
    let dismissTimer: number | undefined;

    const clearTimers = () => {
      if (nextTimer !== undefined) window.clearTimeout(nextTimer);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };

    if (!isPublicSocialProofRoute(location) || publicSocialProofEntries.length === 0) {
      setNotice(null);
      return clearTimers;
    }

    const scheduleNext = (delay: number) => {
      nextTimer = window.setTimeout(() => {
        if (cancelled) return;
        const index = choosePublicSocialProofIndex(historyRef.current);
        if (index < 0) return;
        historyRef.current = [...historyRef.current, index].slice(-publicSocialProofConfig.recentHistoryLimit);
        setNotice({ entry: publicSocialProofEntries[index]!, key: Date.now() });
        dismissTimer = window.setTimeout(() => {
          if (cancelled) return;
          setNotice(null);
          scheduleNext(randomBetween(publicSocialProofConfig.betweenNoticesMs.min, publicSocialProofConfig.betweenNoticesMs.max));
        }, publicSocialProofConfig.visibleForMs);
      }, delay);
    };

    setNotice(null);
    scheduleNext(randomBetween(publicSocialProofConfig.initialDelayMs.min, publicSocialProofConfig.initialDelayMs.max));

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [location]);

  if (!notice) return null;

  return <aside className="public-social-proof-toast" role="status" aria-live="polite" aria-atomic="true" key={notice.key}>
    <span className="public-social-proof-toast-mark" aria-hidden="true">PL</span>
    <span className="public-social-proof-toast-copy">
      <span className="public-social-proof-toast-kicker">Atividade ilustrativa</span>
      <strong>{formatPublicSocialProof(notice.entry)}</strong>
      <small>{publicSocialProofDisclaimer}</small>
    </span>
  </aside>;
}
