import { withAppBase } from "@/lib/devPath";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export const gettingStartedStepIds = ["profile", "receiving", "campaign", "disclosure", "metrics", "conversion"] as const;
export type GettingStartedStepId = typeof gettingStartedStepIds[number];

function getQuery(location: string, browserSearch = typeof window === "undefined" ? "" : window.location.search) {
  return location.includes("?") ? location.split("?")[1] : browserSearch.replace(/^\?/, "");
}

function getValidStep(value: string | null) {
  return gettingStartedStepIds.includes(value as GettingStartedStepId) ? value as GettingStartedStepId : null;
}

export function getGettingStartedStepFromLocation(location: string, browserSearch?: string) {
  const step = new URLSearchParams(getQuery(location, browserSearch)).get("onboardingStep");
  return getValidStep(step);
}

export function getGettingStartedReturnStepFromLocation(location: string, browserSearch?: string) {
  const step = new URLSearchParams(getQuery(location, browserSearch)).get("step");
  return getValidStep(step);
}

export function getGettingStartedReturnUrl(step: GettingStartedStepId) {
  return withAppBase(`/membros/como-divulgar?step=${encodeURIComponent(step)}`);
}

export function withGettingStartedStep(path: string, stepId: GettingStartedStepId) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}onboardingStep=${encodeURIComponent(stepId)}`;
}

export default function GettingStartedReturnButton() {
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [nearPageEnd, setNearPageEnd] = useState(false);
  const step = getGettingStartedStepFromLocation(location);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted || !step) return;
    const updateNearPageEnd = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const viewportBottom = window.scrollY + window.innerHeight;
      setNearPageEnd(viewportBottom >= documentHeight - 180);
    };
    updateNearPageEnd();
    window.addEventListener("scroll", updateNearPageEnd, { passive: true });
    window.addEventListener("resize", updateNearPageEnd);
    return () => {
      window.removeEventListener("scroll", updateNearPageEnd);
      window.removeEventListener("resize", updateNearPageEnd);
    };
  }, [mounted, step]);
  if (!step || !mounted) return null;

  return (
    <div className="getting-started-return-button-shell">
      <a
        href={getGettingStartedReturnUrl(step)}
        data-testid="getting-started-return-button"
        data-near-page-end={nearPageEnd ? "true" : "false"}
        className={`getting-started-return-button inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-center text-xs font-semibold shadow-xl outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[.97] sm:px-4 ${nearPageEnd ? "border-emerald-200/40 bg-emerald-300 text-black shadow-emerald-950/40 hover:bg-emerald-200" : "border-white/15 bg-zinc-700/95 text-zinc-50 shadow-black/30 hover:bg-zinc-600"}`}
      >
        Dar o próximo passo
        <ArrowRight className="size-3.5" />
      </a>
    </div>
  );
}
