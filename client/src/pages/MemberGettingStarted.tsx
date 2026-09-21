import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { getGettingStartedReturnStepFromLocation, type GettingStartedStepId, withGettingStartedStep } from "@/components/GettingStartedReturnButton";
import { withAppBase } from "@/lib/devPath";
import { useMemberGettingStartedProgress, type MemberGettingStartedRequirement } from "@/hooks/useMemberGettingStartedProgress";
import { trpc } from "@/lib/trpc";
import { BarChart3, CheckCircle2, Circle, CircleDashed, ExternalLink, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const GETTING_STARTED_FINALIZED_STORAGE_BASE = "pagina-lucrativa.getting-started.finalized";

const menu: DashboardMenuItem[] = [
  { icon: Circle, label: "Primeiros passos", path: "/membros/como-divulgar", group: "Início" },
  { icon: BarChart3, label: "Central de Divulgação", path: "/membros/operacao", group: "Início" },
  { icon: UserRound, label: "Minha página e perfil", path: "/membros/configuracoes", group: "Minha página" },
];

export default function MemberGettingStarted() {
  const utils = trpc.useUtils();
  const [location, setLocation] = useLocation();
  const { profile, steps, completed, percentage } = useMemberGettingStartedProgress();
  const user = trpc.auth.me.useQuery();
  const returnedStep = useMemo(() => {
    return getGettingStartedReturnStepFromLocation(location);
  }, [location]);
  const [highlightedStep, setHighlightedStep] = useState<GettingStartedStepId | null>(null);

  useEffect(() => {
    if (!returnedStep || !steps.some(step => step.id === returnedStep)) return;
    let highlightTimer: number | undefined;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(`getting-started-${returnedStep}`);
      if (!target) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      setHighlightedStep(returnedStep);
      highlightTimer = window.setTimeout(() => setHighlightedStep(current => current === returnedStep ? null : current), 2200);
    }, 120);
    return () => {
      window.clearTimeout(timer);
      if (highlightTimer) window.clearTimeout(highlightTimer);
    };
  }, [returnedStep, steps]);

  useEffect(() => {
    if (!returnedStep) return;
    void Promise.all([
      utils.member.profile.invalidate(),
      utils.member.receiving.invalidate(),
      utils.member.paymentLinks.invalidate(),
      utils.member.campaigns.invalidate(),
      utils.member.analytics.invalidate(),
    ]);
  }, [returnedStep]);

  const finishGettingStarted = () => {
    const userId = user.data?.id;
    const key = userId ? `${GETTING_STARTED_FINALIZED_STORAGE_BASE}.${userId}` : GETTING_STARTED_FINALIZED_STORAGE_BASE;
    try {
      localStorage.setItem(key, "1");
      window.dispatchEvent(new Event("pagina-lucrativa:getting-started-finalized"));
    } catch {
      // A navegacao final ainda deve acontecer se o storage nao estiver disponivel.
    }
    setLocation("/membros");
  };

  return (
    <DashboardLayout menuItems={menu} title="Escritório Virtual">
      <main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Sua jornada</span>
          <h1 className="text-3xl font-semibold text-white">Primeiros passos</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">O sistema identifica o que você já concluiu e direciona para a próxima etapa. Aqui você não configura tudo de novo: cada botão leva à ferramenta correta.</p>
        </header>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-100">Progresso da configuração</p>
              <strong className="mt-1 block text-3xl text-white">{percentage}%</strong>
              <p className="mt-1 text-sm text-zinc-300">{completed} de {steps.length} etapas concluídas</p>
            </div>
            {profile.data?.slug ? <a href={withAppBase(`/?afiliado=${encodeURIComponent(profile.data.slug)}`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-300/10"><ExternalLink className="size-4" />Visualizar minha página</a> : null}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${percentage}%` }} /></div>
        </section>

        <section className="space-y-3">
          {steps.map((step, index) => (
            <article
              key={step.id}
              id={`getting-started-${step.id}`}
              className={`scroll-mt-28 rounded-2xl border p-5 transition duration-500 ${highlightedStep === step.id ? "border-emerald-200 bg-emerald-300/10 shadow-lg shadow-emerald-950/40" : step.done ? "border-emerald-300/20 bg-emerald-300/5" : step.unlocked ? "border-white/10 bg-zinc-950/60" : "border-white/10 bg-zinc-950/35 opacity-80"}`}
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 gap-4">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${step.done ? "bg-emerald-300 text-black" : "bg-white/5 text-zinc-300"}`}>{step.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">Etapa {index + 1}</p>
                    <h2 className="mt-1 font-medium text-white">{step.title}</h2>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {step.requirements.map(requirement => (
                        <RequirementItem key={requirement.label} requirement={requirement} locked={!step.unlocked && !step.done} />
                      ))}
                    </ul>
                  </div>
                </div>
                {step.done ? (
                  <p className="shrink-0 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-center text-sm font-semibold text-emerald-100">
                    Parabéns! Etapa {index + 1} concluída.
                  </p>
                ) : step.unlocked ? (
                  <a href={withAppBase(withGettingStartedStep(step.path, step.id))} className="shrink-0 rounded-lg bg-emerald-300 px-4 py-2 text-center text-sm font-semibold text-black">{step.action}</a>
                ) : (
                  <button type="button" disabled className="shrink-0 cursor-not-allowed rounded-lg border border-white/10 px-4 py-2 text-center text-sm font-semibold text-zinc-500">Conclua a etapa anterior</button>
                )}
              </div>
            </article>
          ))}
        </section>

        {completed === steps.length ? (
          <section className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.16em] text-emerald-200">Primeiros Passos concluido</span>
                <h2 className="mt-2 text-xl font-semibold text-white">Sua configuracao inicial foi finalizada.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">A partir de agora, use a visao geral, sua central de divulgacao e os relatorios para acompanhar a operacao.</p>
              </div>
              <button
                type="button"
                onClick={finishGettingStarted}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-200 sm:w-auto"
              >
                Finalizar Primeiros Passos
              </button>
            </div>
          </section>
        ) : null}
      </main>
    </DashboardLayout>
  );
}

function RequirementItem({ requirement, locked }: { requirement: MemberGettingStartedRequirement; locked: boolean }) {
  const Icon = requirement.done ? CheckCircle2 : CircleDashed;
  const state = requirement.done ? "Concluído" : "Pendente";
  return (
    <li
      aria-label={`${state}: ${requirement.label}`}
      className={`flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm ${requirement.done
        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
        : locked
          ? "border-white/10 bg-white/[0.02] text-zinc-500"
          : "border-white/10 bg-black/20 text-zinc-300"}`}
    >
      <Icon className={`size-4 shrink-0 ${requirement.done ? "text-emerald-300" : "text-zinc-500"}`} aria-hidden="true" />
      <span className="min-w-0 break-words">{requirement.label}</span>
    </li>
  );
}
