import { z } from "zod";
import { normalizedEmailZodSchema, phoneZodSchema } from "./contactValidation";
import { httpUrlZodSchema } from "./structuredValidation";

export const applicationInputSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo.").max(180),
  email: normalizedEmailZodSchema,
  whatsapp: phoneZodSchema,
  affiliateSlug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Identificador de indicação inválido.").min(3).max(96).optional().nullable(),
  affiliateSlugProvided: z.boolean().optional(),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;

export type PublicPaymentPage = {
  trackingCode: string;
  buyerName: string;
  offerAmountCents: number;
  paymentStatus: "not_started" | "awaiting_payment" | "receipt_received" | "confirmed" | "rejected";
  activationStatus: "not_started" | "access_issued" | "personalization_started" | "member_activated" | "cancelled";
  latestReceiptStatus: "pending" | "approved" | "rejected" | null;
  sponsor: { name: string } | null;
  pix: {
    holderName: string | null;
    type: string | null;
    key: string;
    instructions: string | null;
  } | null;
  paymentLinks: Array<{ label: string; paymentUrl: string }>;
};

export const paymentAccessInputSchema = z.object({
  trackingCode: z.string().trim().toUpperCase().min(6).max(24),
  paymentAccessToken: z.string().trim().min(32).max(2048),
});

export const applicationStatusLabel = {
  pending: "Novo pedido",
  contacted: "Contato iniciado",
  approved: "Aprovado",
  archived: "Arquivado",
} as const;

export const applicationPaymentStatusLabel = {
  not_started: "Pagamento não iniciado",
  awaiting_payment: "Aguardando pagamento",
  receipt_received: "Comprovante recebido",
  confirmed: "Pagamento confirmado",
  rejected: "Comprovante rejeitado",
} as const;

export const applicationActivationStatusLabel = {
  not_started: "Acesso não liberado",
  access_issued: "Personalização liberada",
  personalization_started: "Personalização iniciada",
  member_activated: "Membro ativado",
  cancelled: "Cancelado",
} as const;

export const OFFER_AMOUNT_CENTS = 5000;

export const memberPaymentLinkInputSchema = z.object({
  id: z.number().int().positive().optional(),
  label: z.string().trim().min(2, "Informe o nome do meio de pagamento.").max(120),
  paymentUrl: httpUrlZodSchema,
  isEnabled: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(1000).default(0),
});

export const memberPaymentLinksInputSchema = z.object({
  links: z.array(memberPaymentLinkInputSchema).max(10, "Cadastre no máximo 10 links de checkout."),
});

export const applicationReceiptUploadSchema = z.object({
  trackingCode: z.string().trim().toUpperCase().min(6).max(24),
  paymentAccessToken: z.string().trim().min(32).max(2048),
  dataUrl: z.string().max(7_200_000, "O arquivo deve ter no máximo 5 MB."),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
  originalName: z.string().trim().max(255).optional().nullable(),
});

export const applicationPersonalizationSchema = z.object({
  publicCode: z.string().trim().toLowerCase().regex(/^[a-z0-9]+$/).min(8).max(48),
  name: z.string().trim().min(2, "Informe seu nome.").max(180),
  whatsapp: phoneZodSchema,
  facebookUrl: httpUrlZodSchema.max(512).optional().nullable(),
  instagramUrl: httpUrlZodSchema.max(512).optional().nullable(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").max(128).regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.").regex(/\d/, "A senha deve conter pelo menos um número."),
  securityQuestion: z.string().trim().min(6, "Escolha uma pergunta secreta.").max(240),
  securityAnswer: z.string().trim().min(3, "Informe uma resposta secreta com pelo menos 3 caracteres.").max(180),
});

export type MemberPaymentLinkInput = z.infer<typeof memberPaymentLinkInputSchema>;
export type ApplicationReceiptUpload = z.infer<typeof applicationReceiptUploadSchema>;
export type ApplicationPersonalizationInput = z.infer<typeof applicationPersonalizationSchema>;
