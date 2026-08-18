import DashboardLayout from "@/components/DashboardLayout";
import { memberDashboardMenuItems } from "@/lib/memberDashboardNavigation";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { CheckCircle2, Landmark, ShieldCheck } from "lucide-react";

type Method = "pix" | "bank_transfer" | "other";

export default function MemberReceiving() {
  const preference = trpc.member.receiving.useQuery();
  const utils = trpc.useUtils();
  const [holderName, setHolderName] = useState("");
  const [method, setMethod] = useState<Method>("pix");
  const [receivingKey, setReceivingKey] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (!preference.data) return;
    setHolderName(preference.data.holderName ?? "");
    setMethod(preference.data.method);
    setReceivingKey(preference.data.receivingKey ?? "");
    setInstructions(preference.data.instructions ?? "");
  }, [preference.data]);

  const save = trpc.member.updateReceiving.useMutation({
    onSuccess: () => utils.member.receiving.invalidate(),
  });

  return <DashboardLayout menuItems={memberDashboardMenuItems} title="Escritório Virtual"><main className="mx-auto w-full max-w-4xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[.16em] text-amber-300">Operação pessoal</span><h1 className="text-3xl font-semibold text-white">Dados de recebimento</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Informe os dados que você utiliza para receber valores diretamente nas suas vendas. Esta tela registra preferências e não movimenta dinheiro, não processa pagamentos e não solicita senha, cartão ou token bancário.</p></header><section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]"><form onSubmit={event => { event.preventDefault(); save.mutate({ holderName: holderName || null, method, receivingKey: receivingKey || null, instructions: instructions || null }); }} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-white"><Landmark className="size-5 text-amber-300" /><h2 className="font-medium">Preferência de recebimento</h2></div><label className="block text-sm text-zinc-200">Titular<input value={holderName} onChange={event => setHolderName(event.target.value)} maxLength={180} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-300/50" placeholder="Nome do titular" /></label><label className="block text-sm text-zinc-200">Forma preferida<select value={method} onChange={event => setMethod(event.target.value as Method)} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-300/50"><option value="pix">PIX</option><option value="bank_transfer">Transferência bancária</option><option value="other">Outra forma combinada</option></select></label><label className="block text-sm text-zinc-200">Chave ou identificação de recebimento<input value={receivingKey} onChange={event => setReceivingKey(event.target.value)} maxLength={255} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-300/50" placeholder="Ex.: chave PIX ou identificador combinado" /></label><label className="block text-sm text-zinc-200">Orientação adicional<textarea value={instructions} onChange={event => setInstructions(event.target.value)} maxLength={2000} className="mt-1 min-h-28 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-300/50" placeholder="Informações que deseja manter para a sua operação." /></label><button disabled={save.isPending} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"><CheckCircle2 className="size-4" />{save.isPending ? "Salvando..." : "Salvar dados"}</button>{save.isSuccess ? <p className="text-sm text-emerald-300">Dados de recebimento atualizados.</p> : null}</form><aside className="space-y-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><ShieldCheck className="size-6 text-amber-300" /><h2 className="font-medium text-white">Uso responsável</h2><p className="text-sm leading-6 text-zinc-300">Esses dados pertencem ao titular do Escritório Virtual. Cada afiliado, inclusive o administrador em sua atuação pessoal, configura somente os próprios dados.</p><p className="text-sm leading-6 text-zinc-400">A confirmação do recebimento ocorre diretamente entre o afiliado e o comprador, conforme a forma indicada. O sistema mantém o pedido e seu responsável para acompanhamento.</p></aside></section></main></DashboardLayout>;
}
