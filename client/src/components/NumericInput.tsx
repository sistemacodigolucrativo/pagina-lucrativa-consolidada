import { useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { parseCurrencyBR, parseIntegerInput, sanitizeCurrencyInput, sanitizeIntegerInput } from "@shared/structuredValidation";

type CommonProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "inputMode"> & {
  value: string;
  onValueChange: (value: string) => void;
  validationMessage?: string;
};

function isNavigationKey(event: KeyboardEvent<HTMLInputElement>) {
  return event.ctrlKey || event.metaKey || event.altKey || ["Backspace", "Delete", "Tab", "Enter", "Escape", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key);
}

export function CurrencyInput({ value, onValueChange, required, minCents = 1, maxCents = 100_000_000, validationMessage = "Informe um valor em reais válido.", onBlur, ...props }: CommonProps & { minCents?: number; maxCents?: number }) {
  const [touched, setTouched] = useState(false);
  const cents = parseCurrencyBR(value);
  const isInvalid = value !== "" && (cents === null || cents < minCents || cents > maxCents);
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isNavigationKey(event)) return;
    if (/\d/.test(event.key)) return;
    if ((event.key === "," || event.key === ".") && !/[,.]/.test(value)) return;
    event.preventDefault();
  };
  return <><input {...props} type="text" inputMode="decimal" required={required} value={value} aria-invalid={isInvalid || undefined} onChange={event => onValueChange(sanitizeCurrencyInput(event.target.value))} onKeyDown={onKeyDown} onBlur={event => { setTouched(true); onBlur?.(event); }} />{touched && isInvalid ? <small className="mt-1 block text-xs text-red-300" role="alert">{validationMessage}</small> : null}</>;
}

export function IntegerInput({ value, onValueChange, required, min, max, allowNegative = false, validationMessage = "Informe um número inteiro válido.", onBlur, ...props }: CommonProps & { min?: number; max?: number; allowNegative?: boolean }) {
  const [touched, setTouched] = useState(false);
  const number = parseIntegerInput(value);
  const isInvalid = value !== "" && (number === null || (min !== undefined && number < min) || (max !== undefined && number > max));
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isNavigationKey(event)) return;
    if (/\d/.test(event.key)) return;
    if (allowNegative && event.key === "-" && event.currentTarget.selectionStart === 0 && !value.includes("-")) return;
    event.preventDefault();
  };
  return <><input {...props} type="text" inputMode={allowNegative ? "text" : "numeric"} required={required} value={value} aria-invalid={isInvalid || undefined} onChange={event => onValueChange(sanitizeIntegerInput(event.target.value, allowNegative))} onKeyDown={onKeyDown} onBlur={event => { setTouched(true); onBlur?.(event); }} />{touched && isInvalid ? <small className="mt-1 block text-xs text-red-300" role="alert">{validationMessage}</small> : null}</>;
}
