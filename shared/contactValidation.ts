import { z } from "zod";

export const PHONE_MIN_DIGITS = 10;
export const PHONE_MAX_DIGITS = 11;

const phoneDigitsPattern = new RegExp(`^\\d{${PHONE_MIN_DIGITS},${PHONE_MAX_DIGITS}}$`);

/** Mantém somente dígitos, sem aplicar limite para que a validação de API detecte excedentes. */
export function normalizePhone(raw: string | null | undefined): string {
  return String(raw ?? "").replace(/\D/g, "");
}

/** Exibe DDD e número no padrão brasileiro enquanto o usuário digita. */
export function formatPhoneBR(raw: string | null | undefined): string {
  const digits = normalizePhone(raw).slice(0, PHONE_MAX_DIGITS);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const firstDigit = digits.slice(2, 3);
  const localNumber = digits.slice(3);
  if (!localNumber) return `(${ddd}) ${firstDigit}`;

  const firstBlock = localNumber.slice(0, 4);
  const lastBlock = localNumber.slice(4, 8);
  return `(${ddd}) ${firstDigit} ${firstBlock}${lastBlock ? `-${lastBlock}` : ""}`;
}

export function validatePhoneBR(raw: string | null | undefined): boolean {
  return phoneDigitsPattern.test(normalizePhone(raw));
}

export function normalizeEmail(raw: string | null | undefined): string {
  return String(raw ?? "").trim().replace(/\s+/g, "").toLowerCase();
}

export function validateEmail(raw: string | null | undefined): boolean {
  const source = String(raw ?? "").trim();
  if (/\s/.test(source)) return false;
  const email = normalizeEmail(source);
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const normalizedEmailZodSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(value => !/\s/.test(value), "O e-mail não pode conter espaços.")
  .email("Informe um e-mail válido.")
  .max(320, "O e-mail deve ter no máximo 320 caracteres.");

export const phoneZodSchema = z
  .string()
  .trim()
  .regex(phoneDigitsPattern, "Informe um telefone com DDD e 10 ou 11 dígitos numéricos.");

export const optionalPhoneZodSchema = phoneZodSchema.optional().nullable();
