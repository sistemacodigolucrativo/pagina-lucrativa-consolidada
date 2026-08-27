import { CheckCircle2, RefreshCw, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { withAppBase } from "@/lib/devPath";

type DeployState = {
  status: "idle" | "deploying" | "completed" | "failed";
  progress: number;
  stage?: string;
  sha?: string;
  updatedAt?: string;
};

const IDLE: DeployState = { status: "idle", progress: 0 };
const ACKNOWLEDGED_DEPLOY_KEY = "admin:last-acknowledged-deploy";

function deploymentIdentity(state: DeployState) {
  return state.sha || state.updatedAt || "completed";
}

export default function AdminDeployStatus() {
  const [location] = useLocation();
  const [state, setState] = useState<DeployState>(IDLE);
  const [acknowledgedDeploy, setAcknowledgedDeploy] = useState(() => {
    try {
      return window.sessionStorage.getItem(ACKNOWLEDGED_DEPLOY_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const isAdminRoute = location === "/admin" || location.startsWith("/admin/");

  useEffect(() => {
    if (!isAdminRoute) {
      setState(IDLE);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(withAppBase(`/api/deploy-status?t=${Date.now()}`), {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) return;
        const next = await response.json() as DeployState;
        if (!cancelled) setState(next);
      } catch {
        // O painel não deve ser afetado se o endpoint de status estiver temporariamente indisponível.
      }
    };

    void load();
    const timer = window.setInterval(load, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isAdminRoute]);

  if (!isAdminRoute || state.status === "idle" || state.status === "failed") return null;

  const completed = state.status === "completed";
  const currentDeployIdentity = completed ? deploymentIdentity(state) : "";
  if (completed && acknowledgedDeploy === currentDeployIdentity) return null;

  const progress = completed ? 100 : Math.max(1, Math.min(99, Math.round(state.progress || 1)));

  const acknowledgeAndReload = () => {
    const identity = deploymentIdentity(state);
    try {
      window.sessionStorage.setItem(ACKNOWLEDGED_DEPLOY_KEY, identity);
    } catch {
      // Se o storage estiver indisponível, o reload continua funcionando normalmente.
    }
    setAcknowledgedDeploy(identity);
    window.location.reload();
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] border-b border-white/10 bg-zinc-950/98 shadow-2xl backdrop-blur-xl" role="status" aria-live="polite">
      <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center gap-3 px-3 sm:px-5 lg:px-8">
        {completed ? <CheckCircle2 className="size-5 shrink-0 text-emerald-300" /> : <Rocket className="size-5 shrink-0 text-emerald-300" />}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">
                {completed ? "Deploy concluído" : "Atualizando sistema"}
              </p>
              {!completed ? <p className="truncate text-[11px] text-zinc-500">{state.stage || "Publicando nova versão"}</p> : null}
            </div>
            {!completed ? <strong className="shrink-0 font-mono text-sm text-emerald-300">{progress}%</strong> : null}
          </div>
          {!completed ? (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-300 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
                aria-label={`Deploy ${progress}% concluído`}
              />
            </div>
          ) : null}
        </div>
        {completed ? (
          <button
            type="button"
            onClick={acknowledgeAndReload}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-3 py-2 text-xs font-bold text-black transition hover:bg-emerald-200 sm:px-4 sm:text-sm"
          >
            <RefreshCw className="size-4" />
            <span className="hidden sm:inline">Deploy concluído</span>
            <span className="sm:hidden">Atualizar</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
