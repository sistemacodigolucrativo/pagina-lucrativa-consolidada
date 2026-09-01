import { trpc } from "@/lib/trpc";
import { validateEmail, validatePhoneBR } from "@shared/contactValidation";
import { validateHttpUrl, validatePixKey, validatePixKeyByType } from "@shared/structuredValidation";
import { BarChart3, CreditCard, Link2, MousePointerClick, UserRound, WalletCards } from "lucide-react";
import { createElement, useMemo, type ReactNode } from "react";

export type MemberGettingStartedStepId = "profile" | "receiving" | "campaign" | "disclosure" | "metrics" | "conversion";

export type MemberGettingStartedRequirement = {
  label: string;
  done: boolean;
};

export type MemberGettingStartedStep = {
  id: MemberGettingStartedStepId;
  title: string;
  path: string;
  action: string;
  requirements: MemberGettingStartedRequirement[];
  done: boolean;
  unlocked: boolean;
  icon: ReactNode;
};

type UseMemberGettingStartedProgressOptions = {
  enabled?: boolean;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function hasValidAddress(profile: Record<string, unknown> | null | undefined) {
  if (!profile) return false;
  return hasText(profile.address as string | null | undefined);
}

export function useMemberGettingStartedProgress(options: UseMemberGettingStartedProgressOptions = {}) {
  const enabled = options.enabled ?? true;
  const profile = trpc.member.profile.useQuery(undefined, { enabled });
  const receiving = trpc.member.receiving.useQuery(undefined, { enabled });
  const paymentLinks = trpc.member.paymentLinks.useQuery(undefined, { enabled });
  const campaigns = trpc.member.campaigns.useQuery(undefined, { enabled });
  const analytics = trpc.member.analytics.useQuery({ period: "all" }, { enabled });

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

  const steps: MemberGettingStartedStep[] = useMemo(() => {
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
        icon: createElement(UserRound, { className: "size-5" }),
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
        icon: createElement(WalletCards, { className: "size-5" }),
      },
      {
        id: "campaign" as const,
        title: "Crie sua primeira campanha de divulgação",
        path: "/membros/operacao/campanhas",
        action: "Criar primeira campanha",
        requirements: [
          { label: "Primeira campanha criada", done: operationReady },
        ],
        icon: createElement(Link2, { className: "size-5" }),
      },
      {
        id: "disclosure" as const,
        title: "Faça sua primeira divulgação",
        path: "/membros/operacao/campanhas",
        action: "Fazer minha divulgação",
        requirements: [
          { label: "Primeiro clique no seu link", done: firstClick },
        ],
        icon: createElement(MousePointerClick, { className: "size-5" }),
      },
      {
        id: "metrics" as const,
        title: "Acompanhe suas métricas",
        path: "/membros/operacao",
        action: "Acompanhar métricas",
        requirements: [
          { label: "Acessou suas métricas", done: metricsViewed },
        ],
        icon: createElement(BarChart3, { className: "size-5" }),
      },
      {
        id: "conversion" as const,
        title: "Conquiste sua primeira conversão",
        path: "/membros/operacao/conversoes",
        action: "Acompanhar conversões",
        requirements: [
          { label: "Primeira conversão gerada", done: firstConversion },
        ],
        icon: createElement(CreditCard, { className: "size-5" }),
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

  return {
    profile,
    receiving,
    paymentLinks,
    campaigns,
    analytics,
    steps,
    completed,
    percentage,
    isComplete: percentage === 100,
  };
}
