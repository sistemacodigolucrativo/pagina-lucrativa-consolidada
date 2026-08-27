import DashboardLayout from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import {
  PUBLIC_SALES_COPY_CATEGORY,
  PUBLIC_SALES_COPY_SECTIONS,
  defaultValuesForSection,
} from "@shared/publicSalesCopyEditor";
import { Check, Eye, ImagePlus, Monitor, MousePointer2, RotateCcw, Save, Smartphone, Tablet, X } from "lucide-react";
import { ChangeEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import "./AdminVisualSalesEditor.css";

const acceptedTypes = ["image/jpeg", "image/png", "image/gif"] as const;
const FLOATING_LAYOUT_CATEGORY = "public-sales-layout";
const FLOATING_LAYOUT_RESOURCE = "floating";
type AcceptedImageType = (typeof acceptedTypes)[number];
type Breakpoint = "desktop" | "tablet" | "mobile";
type FloatingId = "fab" | "cta" | "toast";
type Point = { x: number; y: number };
type FloatingLayout = Record<Breakpoint, Record<FloatingId, Point>>;
type EditingState = { sectionId: string; key: string; element: HTMLElement; originalValue: string };
type PendingImage = { imageSectionId: string; dataUrl: string; contentType: AcceptedImageType; originalName: string; element: HTMLImageElement; originalSrc: string };

const DEFAULT_LAYOUT: FloatingLayout = {
  desktop: { fab: { x: 94, y: 88 }, cta: { x: 88, y: 78 }, toast: { x: 50, y: 12 } },
  tablet: { fab: { x: 92, y: 88 }, cta: { x: 82, y: 78 }, toast: { x: 50, y: 12 } },
  mobile: { fab: { x: 88, y: 86 }, cta: { x: 72, y: 76 }, toast: { x: 50, y: 14 } },
};

function sectionRoot(container: HTMLElement, section: (typeof PUBLIC_SALES_COPY_SECTIONS)[number]) {
  if (typeof section.referenceCopyIndex === "number") {
    return container.querySelectorAll<HTMLElement>("section.reference-copy")[section.referenceCopyIndex] ?? null;
  }
  return section.sectionSelector ? container.querySelector<HTMLElement>(section.sectionSelector) : null;
}

function queryWithin(root: HTMLElement, selector: string) {
  const normalized = selector.trim().startsWith(">") ? `:scope ${selector.trim()}` : selector;
  return root.querySelector<HTMLElement>(normalized);
}

export default function AdminSalesImages() {
  const utils = trpc.useUtils();
  const content = trpc.admin.content.useQuery();
  const images = trpc.admin.publicSalesSectionImages.useQuery();
  const createContent = trpc.admin.createContent.useMutation();
  const updateContent = trpc.admin.updateContent.useMutation();
  const saveImage = trpc.admin.upsertPublicSalesSectionImage.useMutation();
  const editorRootRef = useRef<HTMLDivElement>(null);
  const editorViewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageTargetRef = useRef<{ imageSectionId: string; element: HTMLImageElement } | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [interactionMode, setInteractionMode] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [savingText, setSavingText] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [layout, setLayout] = useState<FloatingLayout>(DEFAULT_LAYOUT);
  const [savingLayout, setSavingLayout] = useState(false);

  const copyRecords = useMemo(() => (content.data ?? []).filter(item => item.kind === "notice" && item.resourceCategory === PUBLIC_SALES_COPY_CATEGORY && item.status !== "archived"), [content.data]);
  const copyRecordBySection = useMemo(() => new Map(copyRecords.map(item => [item.resourceType ?? "", item])), [copyRecords]);
  const layoutRecord = useMemo(() => (content.data ?? []).find(item => item.kind === "notice" && item.resourceCategory === FLOATING_LAYOUT_CATEGORY && item.resourceType === FLOATING_LAYOUT_RESOURCE && item.status !== "archived"), [content.data]);

  useEffect(() => {
    if (!layoutRecord?.body) return;
    try {
      const parsed = JSON.parse(layoutRecord.body) as Partial<FloatingLayout>;
      setLayout({
        desktop: { ...DEFAULT_LAYOUT.desktop, ...(parsed.desktop ?? {}) },
        tablet: { ...DEFAULT_LAYOUT.tablet, ...(parsed.tablet ?? {}) },
        mobile: { ...DEFAULT_LAYOUT.mobile, ...(parsed.mobile ?? {}) },
      });
    } catch {
      setLayout(DEFAULT_LAYOUT);
    }
  }, [layoutRecord?.body]);

  useEffect(() => {
    const container = editorRootRef.current;
    if (!container || interactionMode) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-visual-editor-ui]")) return;

      for (const section of PUBLIC_SALES_COPY_SECTIONS) {
        const root = sectionRoot(container, section);
        if (!root || !root.contains(target)) continue;

        if (section.imageSectionId) {
          const image = target.closest("img") as HTMLImageElement | null;
          if (image && root.contains(image)) {
            event.preventDefault();
            event.stopPropagation();
            imageTargetRef.current = { imageSectionId: section.imageSectionId, element: image };
            fileInputRef.current?.click();
            return;
          }
        }

        for (const field of section.fields) {
          if (!field.selector) continue;
          const fieldElement = queryWithin(root, field.selector);
          if (!fieldElement || !(fieldElement === target || fieldElement.contains(target))) continue;
          event.preventDefault();
          event.stopPropagation();
          if (editing && editing.element !== fieldElement) discardTextEdit();
          const originalValue = fieldElement.textContent ?? "";
          fieldElement.contentEditable = "true";
          fieldElement.dataset.salesEditing = "true";
          fieldElement.setAttribute("role", "textbox");
          fieldElement.setAttribute("aria-label", `Editar ${field.label}`);
          setEditing({ sectionId: section.id, key: field.key, element: fieldElement, originalValue });
          window.setTimeout(() => {
            fieldElement.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(fieldElement);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }, 0);
          return;
        }
      }
    };

    container.addEventListener("click", handleClick, true);
    return () => container.removeEventListener("click", handleClick, true);
  }, [interactionMode, editing]);

  const finishEditing = (state: EditingState | null) => {
    if (!state) return;
    state.element.contentEditable = "false";
    delete state.element.dataset.salesEditing;
    state.element.removeAttribute("role");
    state.element.removeAttribute("aria-label");
  };

  const discardTextEdit = () => {
    if (!editing) return;
    editing.element.textContent = editing.originalValue;
    finishEditing(editing);
    setEditing(null);
  };

  const saveTextEdit = async () => {
    if (!editing) return;
    const section = PUBLIC_SALES_COPY_SECTIONS.find(item => item.id === editing.sectionId);
    if (!section) return;
    const value = editing.element.textContent?.trim() ?? "";
    const defaults = defaultValuesForSection(section);
    const record = copyRecordBySection.get(section.id);
    let currentValues: Record<string, string> = defaults;
    if (record?.body) {
      try {
        const parsed = JSON.parse(record.body) as Record<string, unknown>;
        currentValues = { ...defaults, ...Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string")) };
      } catch {
        currentValues = defaults;
      }
    }
    const values = { ...currentValues, [editing.key]: value };
    const payload = {
      kind: "notice" as const,
      title: `Copy: ${section.adminLabel}`,
      summary: null,
      body: JSON.stringify(values),
      resourceUrl: null,
      resourceCategory: PUBLIC_SALES_COPY_CATEGORY,
      resourceType: section.id,
      status: "published" as const,
    };
    setSavingText(true);
    try {
      if (record) await updateContent.mutateAsync({ id: record.id, ...payload });
      else await createContent.mutateAsync(payload);
      await utils.admin.content.invalidate();
      finishEditing(editing);
      setEditing(null);
      toast.success("Texto salvo e publicado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o texto.");
      editing.element.focus();
    } finally {
      setSavingText(false);
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const target = imageTargetRef.current;
    if (!file || !target) return;
    if (!(acceptedTypes as readonly string[]).includes(file.type)) return void toast.error("Envie uma imagem JPG, PNG ou GIF.");
    if (file.size > 4 * 1024 * 1024) return void toast.error("A imagem deve ter no máximo 4 MB.");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const originalSrc = target.element.src;
      target.element.src = reader.result;
      setPendingImage({ imageSectionId: target.imageSectionId, dataUrl: reader.result, contentType: file.type as AcceptedImageType, originalName: file.name, element: target.element, originalSrc });
    };
    reader.onerror = () => toast.error("Não foi possível ler a imagem selecionada.");
    reader.readAsDataURL(file);
  };

  const discardImage = () => {
    if (!pendingImage) return;
    pendingImage.element.src = pendingImage.originalSrc;
    setPendingImage(null);
    imageTargetRef.current = null;
  };

  const persistImage = async () => {
    if (!pendingImage) return;
    setSavingImage(true);
    try {
      await saveImage.mutateAsync({ sectionId: pendingImage.imageSectionId, dataUrl: pendingImage.dataUrl, contentType: pendingImage.contentType, originalName: pendingImage.originalName });
      await Promise.all([utils.admin.publicSalesSectionImages.invalidate(), utils.public.salesSectionImages.invalidate()]);
      setPendingImage(null);
      imageTargetRef.current = null;
      toast.success("Imagem salva e publicada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a imagem.");
    } finally {
      setSavingImage(false);
    }
  };

  const persistLayout = async (nextLayout: FloatingLayout) => {
    const payload = {
      kind: "notice" as const,
      title: "Posição dos elementos flutuantes da página pública",
      summary: null,
      body: JSON.stringify(nextLayout),
      resourceUrl: null,
      resourceCategory: FLOATING_LAYOUT_CATEGORY,
      resourceType: FLOATING_LAYOUT_RESOURCE,
      status: "published" as const,
    };
    setSavingLayout(true);
    try {
      if (layoutRecord) await updateContent.mutateAsync({ id: layoutRecord.id, ...payload });
      else await createContent.mutateAsync(payload);
      await utils.admin.content.invalidate();
      toast.success("Posição salva para este tamanho de tela.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a posição.");
    } finally {
      setSavingLayout(false);
    }
  };

  const startDrag = (id: FloatingId, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (interactionMode || savingLayout) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const viewport = editorViewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const update = (clientX: number, clientY: number) => {
      const x = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(6, Math.min(94, ((clientY - rect.top) / rect.height) * 100));
      setLayout(current => ({ ...current, [breakpoint]: { ...current[breakpoint], [id]: { x, y } } }));
    };
    const move = (moveEvent: PointerEvent) => update(moveEvent.clientX, moveEvent.clientY);
    const up = (upEvent: PointerEvent) => {
      update(upEvent.clientX, upEvent.clientY);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setLayout(current => {
        void persistLayout(current);
        return current;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const viewportClass = breakpoint === "desktop" ? "is-desktop" : breakpoint === "tablet" ? "is-tablet" : "is-mobile";
  const currentLayout = layout[breakpoint];

  return <DashboardLayout menuItems={adminMenu} title="Administração">
    <main className="visual-editor-shell">
      <header className="visual-editor-toolbar" data-visual-editor-ui>
        <div className="visual-editor-brand"><MousePointer2 size={18} /><div><strong>Editor visual da página</strong><span>O que você vê aqui é a própria página pública em modo de edição.</span></div></div>
        <div className="visual-editor-breakpoints" role="group" aria-label="Tamanho da visualização">
          <button className={breakpoint === "desktop" ? "is-active" : ""} onClick={() => setBreakpoint("desktop")} type="button"><Monitor size={16} /><span>Desktop</span></button>
          <button className={breakpoint === "tablet" ? "is-active" : ""} onClick={() => setBreakpoint("tablet")} type="button"><Tablet size={16} /><span>Tablet</span></button>
          <button className={breakpoint === "mobile" ? "is-active" : ""} onClick={() => setBreakpoint("mobile")} type="button"><Smartphone size={16} /><span>Mobile</span></button>
        </div>
        <button type="button" className={`visual-editor-preview-toggle ${interactionMode ? "is-active" : ""}`} onClick={() => { if (editing) discardTextEdit(); setInteractionMode(value => !value); }}><Eye size={16} />{interactionMode ? "Voltar a editar" : "Testar interação"}</button>
      </header>

      <section className={`visual-editor-viewport-wrap ${viewportClass}`}>
        <div ref={editorViewportRef} className="visual-editor-viewport">
          <div className="visual-editor-floating-layer" data-visual-editor-ui>
            <button type="button" className="visual-editor-floating visual-editor-floating-fab" style={{ left: `${currentLayout.fab.x}%`, top: `${currentLayout.fab.y}%` }} onPointerDown={event => startDrag("fab", event)} aria-label="Arrastar botão FAB">FAB</button>
            <button type="button" className="visual-editor-floating visual-editor-floating-cta" style={{ left: `${currentLayout.cta.x}%`, top: `${currentLayout.cta.y}%` }} onPointerDown={event => startDrag("cta", event)} aria-label="Arrastar CTA">Quero começar</button>
            <button type="button" className="visual-editor-floating visual-editor-floating-toast" style={{ left: `${currentLayout.toast.x}%`, top: `${currentLayout.toast.y}%` }} onPointerDown={event => startDrag("toast", event)} aria-label="Arrastar toast"><span>PL</span><strong>Toast de notificação</strong></button>
          </div>
          <div ref={editorRootRef} className={`visual-editor-stage ${interactionMode ? "is-preview" : "is-editing"}`}>
            <Home />
          </div>
        </div>
      </section>

      <input ref={fileInputRef} type="file" className="sr-only" accept="image/jpeg,image/png,image/gif" onChange={handleFile} />

      {editing ? <div className="visual-editor-actionbar" data-visual-editor-ui role="dialog" aria-label="Controles de edição do texto">
        <span><Save size={15} />Texto em edição</span>
        <button type="button" className="save" disabled={savingText} onClick={saveTextEdit}><Check size={16} />{savingText ? "Salvando..." : "Salvar"}</button>
        <button type="button" disabled={savingText} onClick={discardTextEdit}><RotateCcw size={16} />Descartar</button>
      </div> : null}

      {pendingImage ? <div className="visual-editor-actionbar" data-visual-editor-ui role="dialog" aria-label="Controles da nova imagem">
        <span><ImagePlus size={15} />Nova imagem em pré-visualização</span>
        <button type="button" className="save" disabled={savingImage} onClick={persistImage}><Check size={16} />{savingImage ? "Salvando..." : "Salvar imagem"}</button>
        <button type="button" disabled={savingImage} onClick={discardImage}><X size={16} />Descartar</button>
      </div> : null}
    </main>
  </DashboardLayout>;
}
