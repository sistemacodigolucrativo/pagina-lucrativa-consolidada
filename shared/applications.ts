import { z } from "zod";
import { normalizedEmailZodSchema, phoneZodSchema } from "./contactValidation";
import { httpUrlZodSchema } from "./structuredValidation";

export const applicationInputSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo.").max(180),
  email: normalizedEmailZodSchema,
  whatsapp: phoneZodSchema,
  affiliateSlug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Identificador de indicação inválido.").min(3).max(96).optional().nullable(),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;

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
  access_issued: "Senha emitida",
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
  dataUrl: z.string().max(7_200_000, "O arquivo deve ter no máximo 5 MB."),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
  originalName: z.string().trim().max(255).optional().nullable(),
});

export const applicationPersonalizationSchema = z.object({
  publicCode: z.string().trim().toLowerCase().regex(/^[a-z0-9]+$/).min(8).max(48),
  accessToken: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(180),
  email: normalizedEmailZodSchema,
  whatsapp: phoneZodSchema,
  slug: z.string().trim().toLowerCase().regex(/^(?=.*[a-z0-9])[a-z0-9-]+$/, "Use letras, números e hífens.").min(3).max(96),
  bio: z.string().trim().max(2000).optional().nullable(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").max(128).regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.").regex(/\d/, "A senha deve conter pelo menos um número."),
  pixType: z.string().trim().max(64).optional().nullable(),
  pixKey: z.string().trim().max(255).optional().nullable(),
});

export type MemberPaymentLinkInput = z.infer<typeof memberPaymentLinkInputSchema>;
export type ApplicationReceiptUpload = z.infer<typeof applicationReceiptUploadSchema>;
export type ApplicationPersonalizationInput = z.infer<typeof applicationPersonalizationSchema>;
