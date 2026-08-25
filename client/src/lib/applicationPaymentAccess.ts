const STORAGE_PREFIX = "pagina-lucrativa:payment-access:";

function storageKey(trackingCode: string) {
  return `${STORAGE_PREFIX}${trackingCode.trim().toUpperCase()}`;
}

export function savePaymentAccessToken(trackingCode: string, token: string) {
  if (typeof window === "undefined" || !token) return;
  window.sessionStorage.setItem(storageKey(trackingCode), token);
}

export function readPaymentAccessToken(trackingCode: string) {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(storageKey(trackingCode)) ?? "";
}

export function clearPaymentAccessToken(trackingCode: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey(trackingCode));
}
