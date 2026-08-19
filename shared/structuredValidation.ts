import { z } from "zod";
import { formatPhoneBR, normalizeEmail, validateEmail, validatePhoneBR } from "./contactValidation";

export const MONEY_MAX_CENTS = 100_000_000;
export const POINTS_MIN_VALUE = -100_000;
export const POINTS_MAX_VALUE = 100_000;

export function sanitizeCurrencyInput(raw: string | null | undefined): string {
  const compact = String(raw ?? "").replace(/[^\d,\.]/g, "").replace(/\./g, ",");
  const [integer = "", ...fractionParts] = compact.split(",");
  const fraction = fractionParts.join("").slice(0, 2);
  return fractionParts.length ? `${integer},${fraction}` : integer;
}

export function parseCurrencyBR(raw: string | null | undefined): number | null {
  const value = String(raw ?? "");
  if (!/^\d+(,\d{1,2})?$/.test(value)) return null;
  const [integerPart, decimalPart = ""] = value.split(",");
  const integer = Number(integerPart);
  if (!Number.isSafeInteger(integer)) return null;
  const cents = integer * 100 + Number(`${decimalPart}00`.slice(0, 2));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function formatCurrencyInput(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) return "";
  return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}`;
}

export function sanitizeIntegerInput(raw: string | null | undefined, allowNegative = false): string {
  const value = String(raw ?? "");
  const isNegative = allowNegative && value.trimStart().startsWith("-");
  const digits = value.replace(/\D/g, "");
  return `${isNegative ? "-" : ""}${digits}`;
}

export function parseIntegerInput(raw: string | null | undefined): number | null {
  const value = String(raw ?? "");
  if (!/^-?\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function normalizeHttpUrl(raw: string | null | undefined): string {
  return String(raw ?? "").trim();
}

export function validateHttpUrl(raw: string | null | undefined): boolean {
  try {
    const url = new URL(normalizeHttpUrl(raw));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const httpUrlZodSchema = z
  .string()
  .trim()
  .max(1024, "A URL deve ter no máximo 1024 caracteres.")
  .url("Informe uma URL válida.")
  .refine(value => validateHttpUrl(value), "Use uma URL iniciada por http:// ou https://.");

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function validateCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || /^(\d)\1+$/.test(digits)) return false;
  const checksum = (length: number) => {
    const total = digits.slice(0, length).split("").reduce((sum, digit, index) => sum + Number(digit) * (length + 1 - index), 0);
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return checksum(9) === Number(digits[9]) && checksum(10) === Number(digits[10]);
}

export function formatCpfPixKey(raw: string | null | undefined): string {
  const digits = onlyDigits(String(raw ?? "")).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function validateCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits) || /^(\d)\1+$/.test(digits)) return false;
  const checksum = (weights: number[]) => {
    const total = weights.reduce((sum, weight, index) => sum + Number(digits[index]) * weight, 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return checksum([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[12]) && checksum([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[13]);
}

export function formatCnpjPixKey(raw: string | null | undefined): string {
  const digits = onlyDigits(String(raw ?? "")).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export type PixKeyType = "cpf" | "cnpj" | "e-mail" | "celular" | "telefone" | "chave-aleatoria" | "outro" | string;

export function normalizePixKeyByType(raw: string | null | undefined, type: string | null | undefined): string {
  switch (type) {
    case "cpf": return formatCpfPixKey(raw);
    case "cnpj": return formatCnpjPixKey(raw);
    case "e-mail": return normalizeEmail(raw);
    case "celular":
    case "telefone": return formatPhoneBR(raw);
    default: return normalizePixKey(raw);
  }
}

export function validatePixKeyByType(raw: string | null | undefined, type: string | null | undefined): boolean {
  const source = String(raw ?? "").trim();
  const digits = onlyDigits(source);
  switch (type) {
    case "cpf": return /^\d{11}$/.test(digits);
    case "cnpj": return /^\d{14}$/.test(digits);
    case "e-mail": return validateEmail(source);
    case "celular":
    case "telefone": return /^\d{11}$/.test(digits) && validatePhoneBR(digits);
    case "chave-aleatoria": return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(source);
    default: return validatePixKey(source);
  }
}

export function normalizePixKey(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (value.includes("@")) return normalizeEmail(value);
  const digits = onlyDigits(value);
  if (digits.length === 10 || digits.length === 11 || digits.length === 14) return digits;
  return value.toLowerCase();
}

export function validatePixKey(raw: string | null | undefined): boolean {
  const source = String(raw ?? "").trim();
  if (!source || /\s/.test(source)) return false;
  if (source.includes("@")) return validateEmail(source);
  const digits = onlyDigits(source);
  if (digits.length === 11) return validatePhoneBR(digits) || validateCpf(digits);
  if (digits.length === 14) return validateCnpj(digits);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(source);
}

export const pixKeyZodSchema = z
  .string()
  .trim()
  .min(1, "Informe a chave PIX.")
  .max(255, "A chave PIX deve ter no máximo 255 caracteres.")
  .refine(value => validatePixKey(value), "Informe uma chave PIX válida.")
  .transform(value => normalizePixKey(value));

export const nonNegativeCentsZodSchema = z.number().int().min(0).max(MONEY_MAX_CENTS);
export const positiveCentsZodSchema = z.number().int().positive().max(MONEY_MAX_CENTS);
export const signedPointsZodSchema = z.number().int().min(POINTS_MIN_VALUE).max(POINTS_MAX_VALUE).refine(value => value !== 0);
