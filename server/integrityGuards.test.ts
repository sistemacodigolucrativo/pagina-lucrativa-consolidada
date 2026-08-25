import { describe, expect, it } from "vitest";
import {
  assertReceiptReviewAllowed,
  assertReceiptUploadAllowed,
  assertSponsorImmutable,
} from "./integrityGuards";

describe("regras de integridade da rede e do pagamento", () => {
  it("preserva o patrocinador quando o reprocessamento usa o mesmo responsável", () => {
    expect(() => assertSponsorImmutable(12, 12)).not.toThrow();
    expect(() => assertSponsorImmutable(null, 12)).not.toThrow();
  });

  it("bloqueia troca de patrocinador já registrado", () => {
    expect(() => assertSponsorImmutable(12, 27)).toThrow("outro patrocinador");
  });

  it("aceita comprovante somente antes da confirmação ou após rejeição", () => {
    expect(() => assertReceiptUploadAllowed("awaiting_payment", "not_started")).not.toThrow();
    expect(() => assertReceiptUploadAllowed("rejected", "not_started")).not.toThrow();
    expect(() => assertReceiptUploadAllowed("confirmed", "access_issued")).toThrow("já foi confirmado");
    expect(() => assertReceiptUploadAllowed("awaiting_payment", "member_activated")).toThrow("já foi confirmado");
    expect(() => assertReceiptUploadAllowed("receipt_received", "not_started")).toThrow("aguardando análise");
  });

  it("permite decidir somente comprovante pendente de pedido recebido", () => {
    expect(() => assertReceiptReviewAllowed("pending", "receipt_received")).not.toThrow();
    expect(() => assertReceiptReviewAllowed("approved", "receipt_received")).toThrow("já foi analisado");
    expect(() => assertReceiptReviewAllowed("pending", "confirmed")).toThrow("não está aguardando");
  });
});
