import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@shared/dashboard";
import { CurrencyInput } from "@/components/NumericInput";
import { formatCurrencyInput, parseCurrencyBR } from "@shared/structuredValidation";
import { LayoutDashboard, PackagePlus, PencilLine, Store } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Escritório", path: "/membros", group: "Navegação" },
  { icon: Store, label: "Venda seus produtos", path: "/membros/produtos", group: "Negócio" },
];
type ProductForm = { title: string; description: string; category: string; price: string };
const blankForm = (): ProductForm => ({ title: "", description: "", category: "", price: "" });

export default function MemberProducts() {
  const utils = trpc.useUtils();
  const products = trpc.member.products.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(blankForm);
  const refresh = () => utils.member.products.invalidate();
  const create = trpc.member.createProduct.useMutation({ onSuccess: () => { void refresh(); setForm(blankForm()); toast.success("Produto enviado para revisão."); }, onError: error => toast.error(error.message) });
  const update = trpc.member.updateProduct.useMutation({ onSuccess: () => { void refresh(); setEditingId(null); setForm(blankForm()); toast.success("Produto atualizado e encaminhado para nova revisão."); }, onError: error => toast.error(error.message) });
  const busy = create.isPending || update.isPending;
  function edit(product: NonNullable<typeof products.data>[number]) { setEditingId(product.id); setForm({ title: product.title, description: product.description || "", category: product.category || "", price: formatCurrencyInput(product.priceCents) }); }
  function submit(event: FormEvent) {
    event.preventDefault();
    const priceCents = parseCurrencyBR(form.price);
    if (priceCents === null || priceCents < 0 || priceCents > 100000000) return toast.error("Informe um preço válido.");
    const payload = { title: form.title.trim(), description: form.description.trim() || null, category: form.category.trim() || null, priceCents };
    if (editingId) update.mutate({ id: editingId, ...payload }); else create.mutate(payload);
  }
  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Vitrine pessoal</span><h1 className="text-3xl font-semibold text-white">Venda seus produtos</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Cadastre soluções próprias, acompanhe o estado de cada anúncio e mantenha sua vitrine organizada. Toda publicação passa pela curadoria administrativa.</p></header><section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"><form onSubmit={submit} className="order-1 min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><PackagePlus className="size-5 text-emerald-300" /><h2 className="font-medium">{editingId ? "Editar produto" : "Cadastrar produto"}</h2></div><label className="block text-sm text-zinc-200">Nome do produto<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label><label className="block text-sm text-zinc-200">Categoria<input value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="Ex.: curso, serviço, material digital" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label><label className="block text-sm text-zinc-200">Preço (R$)<CurrencyInput required minCents={0} value={form.price} onValueChange={price => setForm({ ...form, price })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" placeholder="0,00" /></label><label className="block text-sm text-zinc-200">Descrição<textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-28 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label><div className="flex flex-wrap gap-3"><button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:opacity-60 sm:w-auto">{busy ? "Salvando..." : editingId ? "Salvar e reenviar" : "Cadastrar para revisão"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankForm()); }} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200">Cancelar</button>}</div></form><section className="order-2 min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-medium text-white">Minha vitrine</h2><span className="text-xs uppercase tracking-wider text-zinc-500">{products.data?.length ?? 0} produtos</span></div>{products.isLoading ? <p className="text-sm text-zinc-400">Carregando produtos...</p> : products.data?.length ? <div className="space-y-3">{products.data.map(product => <article key={product.id} className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-emerald-200">{product.status === "active" ? "Publicado" : product.status === "archived" ? "Arquivado" : "Em revisão"}</p><h3 className="mt-1 font-medium text-white">{product.title}</h3><p className="mt-1 text-sm text-zinc-400">{product.description || "Sem descrição cadastrada."}</p></div><strong className="text-sm text-emerald-200">{formatCurrency(product.priceCents)}</strong></div><div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3"><span className="text-xs text-zinc-500">{product.category || "Sem categoria"}</span><button type="button" onClick={() => edit(product)} className="inline-flex items-center gap-1 text-sm text-zinc-200 hover:text-emerald-200"><PencilLine className="size-4" />Editar</button></div></article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Ainda não há produtos cadastrados. Use o formulário para enviar o primeiro item à revisão.</p>}</section></section></main></DashboardLayout>;
}
