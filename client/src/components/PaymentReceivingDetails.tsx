export type PaymentReceivingData = {
  preferredMethod?: "pix" | "bank_transfer" | "other" | string | null;
  holderName?: string | null;
  receivingKey?: string | null;
  instructions?: string | null;
  pagSeguro?: { email: string } | null;
  paypal?: { email: string } | null;
  banks?: Array<{
    name?: string | null;
    agency?: string | null;
    account?: string | null;
    type?: "checking" | "savings" | null;
    holder?: string | null;
  }>;
  other?: { key?: string | null; instructions?: string | null } | null;
};

export type ReceivingPaymentMethod = "bank_transfer" | "pagseguro" | "paypal" | "other";

function Value({ children }: { children: string }) {
  return <dd className="mt-1 min-w-0 break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">{children}</dd>;
}

export default function PaymentReceivingDetails({ receiving, method }: { receiving: PaymentReceivingData; method: ReceivingPaymentMethod }) {
  if (method === "bank_transfer") {
    const banks = receiving.banks ?? [];
    if (!banks.length) return null;
    return <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      {banks.map((bank, index) => <dl key={`${bank.name ?? "banco"}-${index}`} className="min-w-0 space-y-3 rounded-xl border border-white/10 bg-black/30 p-4">
        <div><dt className="text-xs uppercase tracking-wider text-zinc-500">Banco</dt><Value>{bank.name || `Conta ${index + 1}`}</Value></div>
        {bank.holder ? <div><dt className="text-xs uppercase tracking-wider text-zinc-500">Titular</dt><Value>{bank.holder}</Value></div> : null}
        {bank.agency ? <div><dt className="text-xs uppercase tracking-wider text-zinc-500">Agência</dt><Value>{bank.agency}</Value></div> : null}
        {bank.account ? <div><dt className="text-xs uppercase tracking-wider text-zinc-500">Conta</dt><Value>{bank.account}</Value></div> : null}
        {bank.type ? <div><dt className="text-xs uppercase tracking-wider text-zinc-500">Tipo</dt><Value>{bank.type === "checking" ? "Conta corrente" : "Conta poupança"}</Value></div> : null}
      </dl>)}
      {receiving.instructions ? <p className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere] sm:col-span-2">{receiving.instructions}</p> : null}
    </div>;
  }

  const email = method === "pagseguro" ? receiving.pagSeguro?.email : method === "paypal" ? receiving.paypal?.email : null;
  if (email) {
    return <dl className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-4">
      <dt className="text-xs uppercase tracking-wider text-zinc-500">E-mail para pagamento</dt>
      <Value>{email}</Value>
      {receiving.holderName ? <><dt className="mt-4 text-xs uppercase tracking-wider text-zinc-500">Titular</dt><Value>{receiving.holderName}</Value></> : null}
      {receiving.instructions ? <><dt className="mt-4 text-xs uppercase tracking-wider text-zinc-500">Instruções</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">{receiving.instructions}</dd></> : null}
    </dl>;
  }

  if (method === "other" && receiving.other) {
    return <dl className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-4">
      {receiving.other.key ? <><dt className="text-xs uppercase tracking-wider text-zinc-500">Dados para pagamento</dt><Value>{receiving.other.key}</Value></> : null}
      {receiving.other.instructions ? <><dt className="mt-4 text-xs uppercase tracking-wider text-zinc-500">Instruções</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">{receiving.other.instructions}</dd></> : null}
    </dl>;
  }

  return null;
}
