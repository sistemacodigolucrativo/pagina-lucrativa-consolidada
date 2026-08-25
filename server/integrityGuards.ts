export type PaymentStatus = "not_started" | "awaiting_payment" | "receipt_received" | "confirmed" | "rejected";
export type ActivationStatus = "not_started" | "access_issued" | "personalization_started" | "member_activated" | "cancelled";
export type ReceiptStatus = "pending" | "approved" | "rejected";

export function assertSponsorImmutable(existingSponsorId: number | null | undefined, requestedSponsorId: number) {
  if (existingSponsorId != null && existingSponsorId !== requestedSponsorId) {
    throw new Error("Este membro já possui outro patrocinador registrado; o vínculo não pode ser alterado.");
  }
}

export function assertReceiptUploadAllowed(paymentStatus: PaymentStatus, activationStatus: ActivationStatus) {
  if (paymentStatus === "confirmed" || activationStatus === "access_issued" || activationStatus === "member_activated") {
    throw new Error("Este pagamento já foi confirmado e não aceita novo comprovante.");
  }
  if (paymentStatus === "receipt_received") {
    throw new Error("Já existe um comprovante aguardando análise para este pedido.");
  }
  if (paymentStatus !== "awaiting_payment" && paymentStatus !== "rejected") {
    throw new Error("O pedido não está em um estado que permita o envio de comprovante.");
  }
}

export function assertReceiptReviewAllowed(receiptStatus: ReceiptStatus, paymentStatus: PaymentStatus) {
  if (receiptStatus !== "pending") {
    throw new Error("Este comprovante já foi analisado e não pode ser revisado novamente.");
  }
  if (paymentStatus !== "receipt_received") {
    throw new Error("O pedido não está aguardando a análise deste comprovante.");
  }
}
