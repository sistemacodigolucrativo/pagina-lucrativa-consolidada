import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import {
  PUBLIC_SALES_COPY_CATEGORY,
  PUBLIC_SALES_COPY_SECTIONS,
  defaultValuesForSection,
} from "@shared/publicSalesCopyEditor";
import { ChevronDown, ImagePlus, Save, Send, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const acceptedTypes = ["image/jpeg", "image/png", "image/gif"] as const;
type AcceptedImageType = (typeof acceptedTypes)[number];
type PendingImage = { dataUrl: string; contentType: AcceptedImageType; originalName: string };
type Drafts = Record<string, Record<string, string>>;

function sameValues(left: Record<string, string> = {}, right: Record<string, string> = {}) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys].every(key => (left[key] ?? "") === (right[key] ?? ""));
}

export default function AdminSalesImages() {
  const utils = trpc.useUtils();
  const images = trpc.admin.publicSalesSectionImages.useQuery();
  const content = trpc.admin.content.useQuery();
  const initialDrafts = useMemo(() => Object.fromEntries(PUBLIC_SALES_COPY_SECTIONS.map(section => [section.id, defaultValuesForSection(section)])), []);
  const [pendingBySection, setPendingBySection] = useState<Record<string, PendingImage>>({});
  const [drafts, setDrafts] = useState<Drafts>(initialDrafts);
  const [savedDrafts, setSavedDrafts] = useState<Drafts>(initialDrafts);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [requestedSectionId, setRequestedSectionId] = useState<string | null>(null);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [busySection, setBusySection] = useState<string | null>(null);
  const [removeBusySection, setRemoveBusySection] = useState<string | null>(null);

  const savedBySection = useMemo(() => new Map((images.data ?? []).map(image => [image.sectionId, image])), [images.data]);
  const copyRecords = useMemo(() => (content.data ?? []).filter(item => item.kind === "notice" && item.resourceCategory === PUBLIC_SALES_COPY_CATEGORY && item.status !== "archived"), [content.data]);
  const copyRecordBySection = useMemo(() => new Map(copyRecords.map(item => [item.resourceType ?? "", item])), [copyRecords]);

  useEffect(() => {
    if (!content.data) return;
    const nextDrafts = Object.fromEntries(PUBLIC_SALES_COPY_SECTIONS.map(section => {
      const defaults = defaultValuesForSection(section);
      const record = copyRecordBySection.get(section.id);
      if (!record?.body) return [section.id, defaults];
      try {
        const parsed = JSON.parse(record.body) as Record<string, unknown>;
        return [section.id, { ...defaults, ...Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string")) }];
      } catch {
        return [section.id, defaults];
      }
    }));
    setDrafts(nextDrafts);
    setSavedDrafts(nextDrafts);
  }, [content.data, copyRecordBySection]);

  const refreshImages = () => Promise.all([utils.admin.publicSalesSectionImages.invalidate(), utils.public.salesSectionImages.invalidate()]);
  const refreshCopy = () => Promise.all([utils.admin.content.invalidate()]);

  const saveImage = trpc.admin.upsertPublicSalesSectionImage.useMutation({
    onSuccess: async (_data, variables) => {
      await refreshImages();
      setPendingBySection(current => { const next = { ...current }; delete next[variables.sectionId]; return next; });
    },
    onError: error => toast.error(error.message),
  });
  const removeImage = trpc.admin.removePublicSalesSectionImage.useMutation({
    onSuccess: async (_data, variables) => {
      await refreshImages();
      setPendingBySection(current => { const next = { ...current }; delete next[variables.sectionId]; return next; });
      toast.success("Imagem removida da seção pública.");
    },
    onError: error => toast.error(error.message),
    onSettled: () => setRemoveBusySection(null),
  });
  const createContent = trpc.admin.createContent.useMutation();
  const updateContent = trpc.admin.updateContent.useMutation();

  const isSectionDirty = (sectionId: string) => {
    const section = PUBLIC_SALES_COPY_SECTIONS.find(item => item.id === sectionId);
    if (!section) return false;
    const copyDirty = !sameValues(drafts[sectionId], savedDrafts[sectionId]);
    const imageDirty = Boolean(section.imageSectionId && pendingBySection[section.imageSectionId]);
    return copyDirty || imageDirty;
  };

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
      toast.success("Imagem selecionada. Você pode enviar agora ou salvar todas as alterações da seção.");
    };
    reader.onerror = () => toast.error("Não foi possível ler a imagem selecionada.");
    reader.readAsDataURL(file);
  };

  const sendImage = async (imageSectionId: string) => {
    const pending = pendingBySection[imageSectionId];
    if (!pending) {
      toast.error("Selecione uma imagem antes de enviar.");
      return;
    }
    setBusySection(imageSectionId);
    try {
      await saveImage.mutateAsync({ sectionId: imageSectionId, ...pending });
      toast.success("Imagem da seção atualizada.");
    } finally {
      setBusySection(null);
    }
  };

  const saveSection = async (sectionId: string) => {
    const section = PUBLIC_SALES_COPY_SECTIONS.find(item => item.id === sectionId);
    if (!section) return false;
    setBusySection(sectionId);
    try {
      const values = drafts[sectionId] ?? defaultValuesForSection(section);
      const record = copyRecordBySection.get(sectionId);
      const payload = {
        kind: "notice" as const,
        title: `Copy: ${section.adminLabel}`,
        summary: null,
        body: JSON.stringify(values),
        resourceUrl: null,
        resourceCategory: PUBLIC_SALES_COPY_CATEGORY,
        resourceType: sectionId,
        status: "published" as const,
      };
      if (record) await updateContent.mutateAsync({ id: record.id, ...payload });
      else await createContent.mutateAsync(payload);

      if (section.imageSectionId && pendingBySection[section.imageSectionId]) {
        await saveImage.mutateAsync({ sectionId: section.imageSectionId, ...pendingBySection[section.imageSectionId] });
      }
      setSavedDrafts(current => ({ ...current, [sectionId]: { ...values } }));
      await refreshCopy();
      toast.success(`Seção ${String(section.publicOrder).padStart(2, "0")} salva. A página pública já pode usar as novas informações.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a seção.");
      return false;
    } finally {
      setBusySection(null);
    }
  };

  const updateDraft = (sectionId: string, key: string, value: string) => {
    setDrafts(current => ({ ...current, [sectionId]: { ...(current[sectionId] ?? {}), [key]: value } }));
  };

  const requestSectionChange = (nextSectionId: string | null) => {
    if (!activeSectionId) {
      setActiveSectionId(nextSectionId);
      return;
    }
    if (activeSectionId === nextSectionId) {
      if (!isSectionDirty(activeSectionId)) {
        setActiveSectionId(null);
        return;
      }
      setRequestedSectionId(null);
      setUnsavedDialogOpen(true);
      return;
    }
    if (!isSectionDirty(activeSectionId)) {
      setActiveSectionId(nextSectionId);
      return;
    }
    setRequestedSectionId(nextSectionId);
    setUnsavedDialogOpen(true);
  };

  const discardCurrentChanges = () => {
    if (!activeSectionId) return;
    const section = PUBLIC_SALES_COPY_SECTIONS.find(item => item.id === activeSectionId);
    setDrafts(current => ({ ...current, [activeSectionId]: { ...(savedDrafts[activeSectionId] ?? defaultValuesForSection(section!)) } }));
    if (section?.imageSectionId) {
      setPendingBySection(current => {
        const next = { ...current };
        delete next[section.imageSectionId!];
        return next;
      });
    }
    setUnsavedDialogOpen(false);
    setActiveSectionId(requestedSectionId);
    setRequestedSectionId(null);
  };

  const saveBeforeChangingSection = async () => {
    if (!activeSectionId) return;
    const currentSectionId = activeSectionId;
    const targetSectionId = requestedSectionId;
    const saved = await saveSection(currentSectionId);
    if (!saved) return;
    setUnsavedDialogOpen(false);
    setActiveSectionId(targetSectionId);
    setRequestedSectionId(null);
  };

  const renderImage = (section: (typeof PUBLIC_SALES_COPY_SECTIONS)[number]) => {
    const imageSectionId = section.imageSectionId;
    const saved = imageSectionId ? savedBySection.get(imageSectionId) : undefined;
    const pending = imageSectionId ? pendingBySection[imageSectionId] : undefined;
    const configuredUrl = saved ? (saved.status === "active" ? withAppBase(saved.imageUrl) : null) : imageSectionId ? null : section.staticImage ? withAppBase(section.staticImage) : null;
    const publicDefault = imageSectionId ? (imageSectionId === "hero_operation" ? "/assets/hero.jpg" : `/${imageSectionId === "problem_start" ? "problem-start" : imageSectionId === "activation_journey" ? "activation-journey" : imageSectionId === "opportunity_indication" ? "digital-asset" : imageSectionId === "behind_structure" ? "behind-structure" : imageSectionId === "not_just_course" || imageSectionId === "comparison" ? "comparison" : imageSectionId === "product_real" ? "product-real" : imageSectionId === "state_desired" ? "state-desired" : imageSectionId === "mechanism" ? "mechanism" : imageSectionId === "ease_real" ? "structure-value-stack" : imageSectionId === "digital_asset" ? "digital-asset" : imageSectionId === "proof_matters" ? "proof-matters" : ""}.png`) : null;
    const imageUrl = pending?.dataUrl ?? configuredUrl ?? (publicDefault ? withAppBase(publicDefault) : null);
    if (!imageUrl && !imageSectionId && !section.staticImage) return null;
    return <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Imagem da seção</span>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
        {imageUrl ? <img src={imageUrl} alt={`Imagem da seção ${section.adminLabel}`} className="aspect-video w-full object-contain" /> : <div className="flex aspect-video items-center justify-center p-4 text-center text-sm text-zinc-500">Nenhuma imagem cadastrada</div>}
      </div>
      {section.staticImage && !imageSectionId ? <p className="text-xs text-zinc-500">Imagem fixa desta seção. O gerenciamento atual de upload não está associado a este banner.</p> : null}
    </div>;
  };

  const loading = images.isLoading || content.isLoading;

  return <DashboardLayout menuItems={adminMenu} title="Administração"><main className="mx-auto w-full max-w-5xl space-y-6 px-3 py-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Página pública de vendas</span><h1 className="text-2xl font-semibold text-white sm:text-3xl">Copy e imagens do sistema</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">Edite cada seção exatamente na ordem em que ela aparece na página pública. Apenas um card fica aberto por vez e qualquer alteração não salva é protegida antes da troca.</p></header>
    {loading ? <p className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm text-zinc-400">Carregando seções...</p> : <section className="grid gap-3">
      {PUBLIC_SALES_COPY_SECTIONS.map(section => {
        const values = drafts[section.id] ?? defaultValuesForSection(section);
        const imageSectionId = section.imageSectionId;
        const pending = imageSectionId ? pendingBySection[imageSectionId] : undefined;
        const saved = imageSectionId ? savedBySection.get(imageSectionId) : undefined;
        const busy = busySection === section.id || (imageSectionId ? busySection === imageSectionId : false);
        const removing = imageSectionId ? removeBusySection === imageSectionId : false;
        const expanded = activeSectionId === section.id;
        const dirty = isSectionDirty(section.id);
        return <article key={section.id} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 shadow-sm">
          <button type="button" onClick={() => requestSectionChange(expanded ? null : section.id)} aria-expanded={expanded} className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03] sm:px-6">
            <div className="flex min-w-0 items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 font-mono text-sm font-bold text-emerald-300">{String(section.publicOrder).padStart(2, "0")}</span><div className="min-w-0"><span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Seção pública</span><h2 className="mt-0.5 break-words text-lg font-semibold text-white sm:text-xl">{section.adminLabel}</h2>{dirty ? <span className="mt-1 inline-block text-xs font-medium text-amber-300">Alterações não salvas</span> : null}</div></div>
            <ChevronDown className={`mt-2 size-5 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded ? <>
            <div className="border-t border-white/10 space-y-4 p-4 sm:p-6">
              {section.fields.map((field, index) => <div key={field.key} className="contents">
                <label className="block space-y-1.5"><span className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">{field.label}</span>{field.input === "textarea" ? <textarea value={values[field.key] ?? ""} onChange={event => updateDraft(section.id, field.key, event.target.value)} rows={Math.min(7, Math.max(3, Math.ceil((values[field.key]?.length ?? 0) / 90)))} className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition focus:border-emerald-300/60" /> : <input value={values[field.key] ?? ""} onChange={event => updateDraft(section.id, field.key, event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-300/60" />}</label>
                {section.imageAfterField === index ? renderImage(section) : null}
              </div>)}
              {section.imageAfterField == null ? renderImage(section) : null}
            </div>
            <footer className="border-t border-white/10 bg-black/20 p-4 sm:px-6"><div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
              {imageSectionId ? <>
                <label htmlFor={`sales-image-${section.id}`} className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-zinc-100 hover:border-emerald-300/50 sm:w-auto ${busy || removing ? "pointer-events-none opacity-60" : ""}`}><Upload size={16} />Selecionar imagem<input id={`sales-image-${section.id}`} type="file" accept="image/jpeg,image/png,image/gif" className="sr-only" disabled={busy || removing} onChange={event => handleFile(imageSectionId, event)} /></label>
                <button type="button" disabled={!pending || busy || removing} onClick={() => sendImage(imageSectionId)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 text-sm font-semibold text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"><Send size={16} />Enviar imagem</button>
                {saved?.status === "active" ? <button type="button" disabled={removing || busy} onClick={() => { setRemoveBusySection(imageSectionId); removeImage.mutate({ sectionId: imageSectionId }); }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-200 disabled:opacity-50 sm:w-auto"><Trash2 size={16} />{removing ? "Removendo..." : "Remover imagem"}</button> : null}
              </> : null}
              <button type="button" disabled={busy || removing} onClick={() => saveSection(section.id)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto"><Save size={16} />{busy ? "Salvando..." : "Salvar alterações"}</button>
            </div></footer>
          </> : null}
        </article>;
      })}
    </section>}
    <aside className="flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-sm leading-6 text-emerald-50"><ImagePlus className="mt-0.5 size-5 shrink-0 text-emerald-300" /><span>Os 22 cards seguem a sequência real da página pública. No mobile, somente a seção em edição permanece expandida, reduzindo rolagem e evitando perda acidental de alterações.</span></aside>

    {unsavedDialogOpen ? <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="unsaved-title" className="w-full max-w-md rounded-2xl border border-amber-300/20 bg-zinc-950 p-5 shadow-2xl sm:p-6">
        <div className="space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Alterações pendentes</span><h2 id="unsaved-title" className="text-xl font-semibold text-white">Existem alterações não salvas nesta seção.</h2><p className="text-sm leading-6 text-zinc-300">Deseja salvar as alterações antes de continuar? Se descartar, somente as mudanças feitas desde o último salvamento serão removidas.</p></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button type="button" disabled={Boolean(busySection)} onClick={saveBeforeChangingSection} className="min-h-11 rounded-lg bg-emerald-300 px-3 py-2 text-sm font-bold text-black disabled:opacity-50">{busySection ? "Salvando..." : "Salvar alterações"}</button>
          <button type="button" disabled={Boolean(busySection)} onClick={discardCurrentChanges} className="min-h-11 rounded-lg border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-200 disabled:opacity-50">Descartar</button>
          <button type="button" disabled={Boolean(busySection)} onClick={() => { setUnsavedDialogOpen(false); setRequestedSectionId(null); }} className="min-h-11 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-zinc-100 disabled:opacity-50">Cancelar</button>
        </div>
      </section>
    </div> : null}
  </main></DashboardLayout>;
}
