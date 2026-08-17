import { z } from "zod";

export const applicationInputSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo.").max(180),
  email: z.string().trim().email("Informe um e-mail válido.").max(320),
  whatsapp: z.string().trim().min(10, "Informe seu WhatsApp com DDD.").max(32),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;

export const applicationStatusLabel = {
  pending: "Novo pedido",
  contacted: "Contato iniciado",
  approved: "Aprovado",
  archived: "Arquivado",
} as const;
