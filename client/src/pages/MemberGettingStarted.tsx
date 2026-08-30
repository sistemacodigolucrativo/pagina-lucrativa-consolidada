import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { getGettingStartedReturnStepFromLocation, type GettingStartedStepId, withGettingStartedStep } from "@/components/GettingStartedReturnButton";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { validateEmail, validatePhoneBR } from "@shared/contactValidation";
import { validateHttpUrl, validatePixKey, validatePixKeyByType } from "@shared/structuredValidation";
import { BarChart3, CheckCircle2, Circle, CircleDashed, CreditCard, ExternalLink, Link2, MousePointerClick, UserRound, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const menu: DashboardMenuItem[] = [
  { icon: Circle, label: "Primeiros passos", path: "/membros/como-divulgar", group: "Início" },
  { icon: BarChart3, label: "Central de Divulgação", path: "/membros/operacao", group: "Início" },
  { icon: UserRound, label: "Minha página e perfil", path: "/membros/configuracoes", group: "Minha página" },
];

type Step = {
  id: GettingStartedStepId;
  title: string;
  path: string;
  action: string;
  requirements: Requirement[];
  done: boolean;
  unlocked: boolean;
  icon: React.ReactNode;
};

type Requirement = {
  label: string;
  done: boolean;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function hasValidAddress(profile: Record<string, unknown> | null | undefined) {
  if (!profile) return false;
  return hasText(profile.address as string | null | undefined);
}

export default function MemberGettingStarted() {
  const utils = trpc.useUtils();
  const [location] = useLocation();
  const profile = trpc.member.profile.useQuery();
  const receiving = trpc.member.receiving.useQuery();
  const paymentLinks = trpc.member.paymentLinks.useQuery();
  const campaigns = trpc.member.campaigns.useQuery();
  const analytics = trpc.member.analytics.useQuery({ period: "all" });
  const returnedStep = useMemo(() => {
    return getGettingStartedReturnStepFromLocation(location);
  }, [location]);
  const [highlightedStep, setHighlightedStep] = useState<GettingStartedStepId | null>(null);

  const profilePhotoReady = Boolean(profile.data?.photoUrl);
  const profileSlugReady = Boolean(profile.data?.slug && /^(?=.*[a-z0-9])[a-z0-9-]{3,96}$/.test(profile.data.slug));
  const profileWhatsappReady = validatePhoneBR(profile.data?.whatsapp);
  const profileAddressReady = hasValidAddress(profile.data);
  const validPix = Boolean(
    receiving.data?.pixType
    && receiving.data?.pixKey
    && validatePixKeyByType(receiving.data.pixKey, receiving.data.pixType),
  ) || Boolean(receiving.data?.receivingKey && validatePixKey(receiving.data.receivingKey));
  const validBankAccounts = [1, 2, 3, 4].some(index => {
    const data = receiving.data as Record<string, unknown> | null | undefined;
    return hasText(data?.[`bank${index}Name`] as string | null | undefined)
      && hasText(data?.[`bank${index}Agency`] as string | null | undefined)
      && hasText(data?.[`bank${index}Account`] as string | null | undefined)
      && hasText(data?.[`bank${index}Holder`] as string | null | undefined)
      && hasText(data?.[`bank${index}Type`] as string | null | undefined);
  });
  const validOtherReceiving = Boolean(
    hasText(receiving.data?.receivingKey)
    || (receiving.data?.paypalEnabled && validateEmail(receiving.data.paypalEmail))
    || (receiving.data?.pagseguroEnabled && validateEmail(receiving.data.pagseguroEmail))
    || paymentLinks.data?.some(link => Boolean(link.isEnabled) && validateHttpUrl(link.paymentUrl)),
  );
  const receivingHolderReady = hasText(receiving.data?.holderName);
  const receivingPreferenceReady = receiving.data?.method === "pix" || receiving.data?.method === "bank_transfer" || receiving.data?.method === "other";
  const receivingMediumReady = Boolean(
    receiving.data?.method === "pix" ? validPix
      : receiving.data?.method === "bank_transfer" ? validBankAccounts
        : receiving.data?.method === "other" ? validOtherReceiving
          : false,
  );
  const operationReady = Boolean(campaigns.data?.length);
  const firstClick = (analytics.data?.totals.clicks ?? 0) > 0;
  const metricsViewed = Boolean(profile.data?.metricsViewedAt);
  const firstConversion = (analytics.data?.totals.conversions ?? 0) > 0;

  const steps: Step[] = useMemo(() => {
    const baseSteps = [
      {
        id: "profile" as const,
        title: "Configure seu Código Lucrativo",
        path: "/membros/configuracoes",
        action: "Iniciar configuração",
        requirements: [
          { label: "Foto de perfil", done: profilePhotoReady },
          { label: "Identificador da sua página", done: profileSlugReady },
          { label: "WhatsApp", done: profileWhatsappReady },
          { label: "Endereço cadastrado", done: profileAddressReady },
        ],
        icon: <UserRound className="size-5" />,
      },
      {
        id: "receiving" as const,
        title: "Configure seus recebimentos",
        path: "/membros/recebimentos",
        action: "Configurar recebimentos",
        requirements: [
          { label: "Nome do titular", done: receivingHolderReady },
          { label: "Forma preferida de recebimento", done: receivingPreferenceReady },
          { label: "Pelo menos uma forma de recebimento configurada", done: receivingMediumReady },
        ],
        icon: <WalletCards className="size-5" />,
      },
      {
        id: "campaign" as const,
        title: "Crie sua primeira campanha de divulgação",
        path: "/membros/operacao/campanhas",
        action: "Criar primeira campanha",
        requirements: [
          { label: "Primeira campanha criada", done: operationReady },
        ],
        icon: <Link2 className="size-5" />,
      },
      {
        id: "disclosure" as const,
        title: "Faça sua primeira divulgação",
        path: "/membros/operacao/campanhas",
        action: "Fazer minha divulgação",
        requirements: [
          { label: "Primeiro clique no seu link", done: firstClick },
        ],
        icon: <MousePointerClick className="size-5" />,
      },
      {
        id: "metrics" as const,
        title: "Acompanhe suas métricas",
        path: "/membros/operacao",
        action: "Acompanhar métricas",
        requirements: [
          { label: "Acessou suas métricas", done: metricsViewed },
        ],
        icon: <BarChart3 className="size-5" />,
      },
      {
        id: "conversion" as const,
        title: "Conquiste sua primeira conversão",
        path: "/membros/operacao/conversoes",
        action: "Acompanhar conversões",
        requirements: [
          { label: "Primeira conversão gerada", done: firstConversion },
        ],
        icon: <CreditCard className="size-5" />,
      },
    ];
    const stepsWithCompletion = baseSteps.map(step => ({
      ...step,
      done: step.requirements.every(requirement => requirement.done),
    }));
    return stepsWithCompletion.map((step, index) => ({
      ...step,
      unlocked: index === 0 || stepsWithCompletion.slice(0, index).every(previous => previous.done),
    }));
  }, [firstClick, firstConversion, metricsViewed, operationReady, profileAddressReady, profilePhotoReady, profileSlugReady, profileWhatsappReady, receivingHolderReady, receivingMediumReady, receivingPreferenceReady]);

  const completed = steps.filter(step => step.done).length;
  const percentage = Math.round((completed / steps.length) * 100);

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
      </main>
    </DashboardLayout>
  );
}

function RequirementItem({ requirement, locked }: { requirement: Requirement; locked: boolean }) {
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
