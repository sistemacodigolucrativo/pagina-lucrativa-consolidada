import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { PUBLIC_SALES_SECTIONS } from "@shared/publicSalesSections";
import { ImagePlus, Send, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const acceptedTypes = ["image/jpeg", "image/png", "image/gif"] as const;
type AcceptedImageType = (typeof acceptedTypes)[number];
type PendingImage = { dataUrl: string; contentType: AcceptedImageType; originalName: string };

export default function AdminSalesImages() {
  const utils = trpc.useUtils();
  const images = trpc.admin.publicSalesSectionImages.useQuery();
  const [pendingBySection, setPendingBySection] = useState<Record<string, PendingImage>>({});
  const [busySection, setBusySection] = useState<string | null>(null);
  const [removeBusySection, setRemoveBusySection] = useState<string | null>(null);
  const savedBySection = useMemo(() => new Map((images.data ?? []).map(image => [image.sectionId, image])), [images.data]);
  const refresh = () => Promise.all([utils.admin.publicSalesSectionImages.invalidate(), utils.public.salesSectionImages.invalidate()]);
  const saveImage = trpc.admin.upsertPublicSalesSectionImage.useMutation({
    onSuccess: async (_data, variables) => {
      await refresh();
      setPendingBySection(current => { const next = { ...current }; delete next[variables.sectionId]; return next; });
      toast.success("Imagem da seção atualizada.");
    },
    onError: error => toast.error(error.message),
    onSettled: () => setBusySection(null),
  });
  const removeImage = trpc.admin.removePublicSalesSectionImage.useMutation({
    onSuccess: async (_data, variables) => { await refresh(); setPendingBySection(current => { const next = { ...current }; delete next[variables.sectionId]; return next; }); toast.success("Imagem removida da seção pública."); },
    onError: error => toast.error(error.message),
    onSettled: () => setRemoveBusySection(null),
  });

  const handleFile = (sectionId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!(acceptedTypes as readonly string[]).includes(file.type)) {
      toast.error("Envie uma imagem JPG, PNG ou GIF.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 4 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setPendingBySection(current => ({ ...current, [sectionId]: { dataUrl: reader.result as string, contentType: file.type as AcceptedImageType, originalName: file.name } }));
      toast.success("Imagem selecionada. Clique em Enviar imagem para confirmar.");
    };
    reader.onerror = () => toast.error("Não foi possível ler a imagem selecionada.");
    reader.readAsDataURL(file);
  };

  const sendImage = (sectionId: string) => {
    const pending = pendingBySection[sectionId];
    if (!pending) {
      toast.error("Selecione uma imagem antes de enviar.");
      return;
    }
    setBusySection(sectionId);
    saveImage.mutate({ sectionId, ...pending });
  };

  return <DashboardLayout menuItems={adminMenu} title="Administração"><main className="mx-auto w-full max-w-6xl space-y-6 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Página pública de vendas</span><h1 className="text-3xl font-semibold text-white">Gerenciador de imagens</h1><p className="max-w-3xl leading-6 text-zinc-300">Selecione uma imagem, confira a prévia e clique em <strong>Enviar imagem</strong> para substituir o banner daquela seção. A posição e a responsividade são definidas automaticamente pela página pública.</p></header>
    {images.isLoading ? <p className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm text-zinc-400">Carregando seções...</p> : <section className="grid gap-4">
      {PUBLIC_SALES_SECTIONS.map(section => {
        const saved = savedBySection.get(section.id);
        const pending = pendingBySection[section.id];
        const currentImageUrl = saved ? (saved.status === "active" ? withAppBase(saved.imageUrl) : null) : section.defaultImage ? withAppBase(section.defaultImage) : null;
        const imageUrl = pending?.dataUrl ?? currentImageUrl;
        const isBusy = busySection === section.id;
        const isRemoving = removeBusySection === section.id;
        return <article key={section.id} className="grid gap-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">{imageUrl ? <img src={imageUrl} alt={section.defaultAlt} className="aspect-video w-full object-contain" /> : <div className="flex aspect-video items-center justify-center p-4 text-center text-sm text-zinc-500">Nenhuma imagem cadastrada</div>}</div>
          <div className="min-w-0 space-y-4"><div><span className="text-xs uppercase tracking-[0.14em] text-emerald-300">{section.id}</span><h2 className="mt-1 text-xl font-semibold text-white">{section.eyebrow || "Hero da apresentação"}</h2><p className="mt-1 leading-6 text-zinc-400">{section.title}</p></div><p className="text-xs text-zinc-500">{pending ? `Nova imagem selecionada · ${pending.originalName}` : saved?.status === "active" ? `Imagem cadastrada${saved.originalName ? ` · ${saved.originalName}` : ""}` : saved?.status === "removed" ? "Imagem removida; a seção não usa imagem padrão." : currentImageUrl ? "Imagem padrão do layout" : "Sem imagem nesta seção"}</p><div className="flex flex-wrap gap-3"><label htmlFor={`sales-image-${section.id}`} className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-zinc-100 hover:border-emerald-300/50 ${isBusy || isRemoving ? "pointer-events-none opacity-60" : ""}`}><Upload size={16} />Selecionar imagem<input id={`sales-image-${section.id}`} type="file" accept="image/jpeg,image/png,image/gif" className="sr-only" disabled={isBusy || isRemoving} onChange={event => handleFile(section.id, event)} /></label><button type="button" disabled={!pending || isBusy || isRemoving} onClick={() => sendImage(section.id)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} />{isBusy ? "Enviando..." : "Enviar imagem"}</button>{saved?.status === "active" && <button type="button" disabled={isRemoving || isBusy} onClick={() => { setRemoveBusySection(section.id); removeImage.mutate({ sectionId: section.id }); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-200 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 size={16} />{isRemoving ? "Removendo..." : "Remover imagem"}</button>}</div></div>
        </article>;
      })}
    </section>}
    <aside className="flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4 leading-6 text-emerald-50"><ImagePlus className="mt-0.5 size-5 shrink-0 text-emerald-300" />A imagem selecionada só passa a fazer parte da página pública depois do clique em <strong>Enviar imagem</strong>. O sistema não oferece editor, crop, filtros ou configurações manuais de tamanho e posição.</aside>
  </main></DashboardLayout>;
}
