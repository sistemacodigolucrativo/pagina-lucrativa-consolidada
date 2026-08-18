import { useEffect, useRef, useState, type ClipboardEvent, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { formatPhoneBR, normalizePhone, PHONE_MAX_DIGITS, validatePhoneBR } from "@shared/contactValidation";

type PhoneInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value: string;
  onChange: (digits: string) => void;
};

/** Campo controlado para telefone brasileiro: aceita somente dígitos e apresenta máscara. */
export function PhoneInput({ value, onChange, required, onBlur, onKeyDown, onPaste, className, ...props }: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  const digits = normalizePhone(value).slice(0, PHONE_MAX_DIGITS);
  const hasValue = digits.length > 0;
  const isInvalid = (Boolean(required) || hasValue) && !validatePhoneBR(digits);
  const validationMessage = "Informe um telefone com DDD e 10 ou 11 dígitos numéricos.";

  useEffect(() => {
    inputRef.current?.setCustomValidity(isInvalid ? validationMessage : "");
  }, [isInvalid]);

  const updateDigits = (raw: string) => onChange(normalizePhone(raw).slice(0, PHONE_MAX_DIGITS));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1 && !/\d/.test(event.key)) event.preventDefault();
    onKeyDown?.(event);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedDigits = normalizePhone(event.clipboardData.getData("text"));
    event.preventDefault();
    const currentValue = event.currentTarget.value;
    const selectionStart = event.currentTarget.selectionStart ?? currentValue.length;
    const selectionEnd = event.currentTarget.selectionEnd ?? currentValue.length;
    const before = normalizePhone(currentValue.slice(0, selectionStart));
    const after = normalizePhone(currentValue.slice(selectionEnd));
    updateDigits(`${before}${pastedDigits}${after}`);
    onPaste?.(event);
  };

  return <><input {...props} ref={inputRef} type="tel" inputMode="numeric" autoComplete={props.autoComplete ?? "tel"} required={required} value={formatPhoneBR(digits)} className={className} aria-invalid={isInvalid || undefined} onChange={event => updateDigits(event.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} onBlur={event => { setTouched(true); onBlur?.(event); }} />{touched && isInvalid ? <small className="mt-1 block text-xs text-red-300" role="alert">{validationMessage}</small> : null}</>;
}
