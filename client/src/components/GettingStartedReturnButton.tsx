import { withAppBase } from "@/lib/devPath";
import { Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const step = getGettingStartedStepFromLocation(location);
  useEffect(() => setMounted(true), []);
  if (!step || !mounted) return null;

  return createPortal(
    <a
      href={getGettingStartedReturnUrl(step)}
      aria-label="Voltar para Primeiros Passos"
      title="Voltar para Primeiros Passos"
      data-testid="getting-started-return-button"
      style={{ color: "#00060D" }}
      className="getting-started-return-button inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-white/70 bg-white px-3 py-2 text-center text-black shadow-xl shadow-black/25 outline-none transition duration-200 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-emerald-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[.97]"
    >
      <Undo2 className="size-4" aria-hidden="true" />
    </a>,
    document.body,
  );
}
