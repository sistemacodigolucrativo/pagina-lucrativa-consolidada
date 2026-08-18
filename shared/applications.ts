import { z } from "zod";
import { normalizedEmailZodSchema, phoneZodSchema } from "./contactValidation";

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
