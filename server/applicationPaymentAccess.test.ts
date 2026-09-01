import { afterEach, describe, expect, it, vi } from "vitest";
import { createPaymentAccessToken, isSupportedReceiptBuffer, verifyPaymentAccessToken } from "./db";

describe("application payment access token", () => {
  afterEach(() => vi.useRealTimers());

  it("vincula o token ao pedido e ao propósito correto", () => {
    const token = createPaymentAccessToken(42, "pl-demo123");
    expect(verifyPaymentAccessToken(token, "PL-DEMO123")).toMatchObject({
      purpose: "application-payment",
      applicationId: 42,
      trackingCode: "PL-DEMO123",
    });
  });

  it("recusa token adulterado ou usado em outro pedido", () => {
    const token = createPaymentAccessToken(42, "PL-DEMO123");
    const [version, payload, signature] = token.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({ purpose: "application-payment", applicationId: 99, trackingCode: "PL-DEMO123", exp: Math.floor(Date.now() / 1000) + 1800 }), "utf8").toString("base64url");
    expect(verifyPaymentAccessToken(`${version}.${tamperedPayload}.${signature}`, "PL-DEMO123")).toBeNull();
    expect(verifyPaymentAccessToken(token, "PL-OTHER123")).toBeNull();
  });

  it("recusa token expirado", () => {
    const now = new Date("2026-08-25T15:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const token = createPaymentAccessToken(42, "PL-DEMO123");
    vi.setSystemTime(new Date(now.getTime() + 31 * 60 * 1000));
    expect(verifyPaymentAccessToken(token, "PL-DEMO123")).toBeNull();
  });

  it("valida a assinatura real dos arquivos aceitos como comprovante", () => {
    expect(isSupportedReceiptBuffer(Buffer.from("hello"), "image/png")).toBe(false);
    expect(isSupportedReceiptBuffer(Buffer.from([0xff, 0xd8, 0xff, 0x00]), "image/jpeg")).toBe(true);
    expect(isSupportedReceiptBuffer(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png")).toBe(true);
    expect(isSupportedReceiptBuffer(Buffer.from("RIFF0000WEBP"), "image/webp")).toBe(true);
    expect(isSupportedReceiptBuffer(Buffer.from("%PDF-1.7"), "application/pdf")).toBe(true);
  });
});
