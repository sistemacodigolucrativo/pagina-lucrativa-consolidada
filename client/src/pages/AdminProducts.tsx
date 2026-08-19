import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@shared/dashboard";
import { ChartNoAxesCombined, PackageCheck, Store } from "lucide-react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: ChartNoAxesCombined, label: "Visão geral", path: "/admin", group: "Gestão" },
  { icon: Store, label: "Produtos", path: "/admin/produtos", group: "Conteúdo" },
  { icon: PackageCheck, label: "E-books", path: "/admin/ebooks", group: "Conteúdo" },
];
type ProductStatus = "draft" | "active" | "archived";
const labels: Record<ProductStatus, string> = { draft: "Em revisão", active: "Publicado", archived: "Arquivado" };

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const products = trpc.admin.products.useQuery();
  const updateStatus = trpc.admin.updateProductStatus.useMutation({ onSuccess: async () => { await utils.admin.products.invalidate(); toast.success("Estado do produto atualizado."); }, onError: error => toast.error(error.message) });
  return <DashboardLayout menuItems={menu} title="Administração"><main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8"><header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Curadoria de vitrine</span><h1 className="text-3xl font-semibold text-white">Produtos dos membros</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Revise os cadastros enviados pelos membros e defina quais itens ficam publicados, em revisão ou arquivados.</p></header><section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60">{products.isLoading ? <p className="p-6 text-sm text-zinc-400">Carregando produtos...</p> : products.data?.length ? <div className="divide-y divide-white/10">{products.data.map(product => <article key={product.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_170px_170px]"><div><p className="text-xs uppercase tracking-wider text-zinc-500">Membro #{product.ownerId} · {product.category || "Sem categoria"}</p><h2 className="mt-1 font-medium text-white">{product.title}</h2><p className="mt-1 text-sm leading-6 text-zinc-400">{product.description || "Sem descrição cadastrada."}</p></div><strong className="self-center text-sm text-emerald-200">{formatCurrency(product.priceCents)}</strong><label className="self-center text-sm text-zinc-300">Estado<select disabled={updateStatus.isPending} value={product.status} onChange={event => updateStatus.mutate({ id: product.id, status: event.target.value as ProductStatus })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"><option value="draft">Em revisão</option><option value="active">Publicado</option><option value="archived">Arquivado</option></select><span className="mt-1 block text-xs text-zinc-500">{labels[product.status]}</span></label></article>)}</div> : <div className="p-8 text-center"><Store className="mx-auto size-8 text-emerald-300" /><h2 className="mt-3 font-medium text-white">Nenhum produto para revisar</h2><p className="mt-2 text-sm text-zinc-400">Os produtos enviados pelos membros aparecerão nesta fila.</p></div>}</section></main></DashboardLayout>;
}
