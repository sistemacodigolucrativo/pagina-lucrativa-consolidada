import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import {
  PUBLIC_SALES_COPY_CATEGORY,
  PUBLIC_SALES_COPY_SECTIONS,
  defaultValuesForSection,
} from "@shared/publicSalesCopyEditor";
import { Check, Eye, ImagePlus, Monitor, MousePointer2, RotateCcw, Save, Smartphone, Tablet, X } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function sectionRoot(doc: Document, section: (typeof PUBLIC_SALES_COPY_SECTIONS)[number]) {
  if (typeof section.referenceCopyIndex === "number") {
    return doc.querySelectorAll<HTMLElement>("section.reference-copy")[section.referenceCopyIndex] ?? null;
  }
  return section.sectionSelector ? doc.querySelector<HTMLElement>(section.sectionSelector) : null;
}

function queryWithin(root: HTMLElement, selector: string) {
  const normalized = selector.trim().startsWith(">") ? `:scope ${selector.trim()}` : selector;
  return root.querySelector<HTMLElement>(normalized);
}

function breakpointWidth(breakpoint: Breakpoint) {
  if (breakpoint === "mobile") return 430;
  if (breakpoint === "tablet") return 820;
  return null;
}

export default function AdminSalesImages() {
  const utils = trpc.useUtils();
  const content = trpc.admin.content.useQuery();
  const createContent = trpc.admin.createContent.useMutation();
  const updateContent = trpc.admin.updateContent.useMutation();
  const saveImage = trpc.admin.upsertPublicSalesSectionImage.useMutation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageTargetRef = useRef<{ imageSectionId: string; element: HTMLImageElement } | null>(null);
  const cleanupEditorRef = useRef<(() => void) | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [interactionMode, setInteractionMode] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [savingText, setSavingText] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [layout, setLayout] = useState<FloatingLayout>(DEFAULT_LAYOUT);
  const [savingLayout, setSavingLayout] = useState(false);
  const [frameReady, setFrameReady] = useState(false);

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

  const finishEditing = useCallback((state: EditingState | null) => {
    if (!state) return;
    state.element.contentEditable = "false";
    delete state.element.dataset.salesEditing;
    state.element.removeAttribute("role");
    state.element.removeAttribute("aria-label");
  }, []);

  const discardTextEdit = useCallback(() => {
    setEditing(current => {
      if (!current) return null;
      current.element.textContent = current.originalValue;
      finishEditing(current);
      return null;
    });
  }, [finishEditing]);

  const applyLayoutInsideFrame = useCallback((nextLayout: FloatingLayout, activeBreakpoint: Breakpoint) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const selectors: Record<FloatingId, string> = {
      fab: ".member-chat-fab-wrap",
      cta: ".public-conversion-cta",
      toast: ".public-social-proof-toast",
    };
    (Object.keys(selectors) as FloatingId[]).forEach(id => {
      const element = doc.querySelector<HTMLElement>(selectors[id]);
      const point = nextLayout[activeBreakpoint][id];
      if (!element) return;
      element.dataset.visualDraggable = id;
      element.style.left = `${point.x}%`;
      element.style.top = `${point.y}%`;
      element.style.right = "auto";
      element.style.bottom = "auto";
      element.style.transform = "translate(-50%, -50%)";
    });
  }, []);

  useEffect(() => {
    if (frameReady) applyLayoutInsideFrame(layout, breakpoint);
  }, [layout, breakpoint, frameReady, applyLayoutInsideFrame]);

  const persistLayout = useCallback(async (nextLayout: FloatingLayout) => {
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
  }, [layoutRecord, updateContent, createContent, utils.admin.content]);

  const installEditor = useCallback(() => {
    cleanupEditorRef.current?.();
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (!frame || !doc || !win) return;

    doc.documentElement.dataset.visualSalesEditor = interactionMode ? "preview" : "editing";
    let style = doc.getElementById("visual-sales-editor-injected-style") as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = "visual-sales-editor-injected-style";
      style.textContent = `
        html[data-visual-sales-editor="editing"] [data-sales-editing="true"]{outline:2px solid #6ee7b7!important;outline-offset:4px;border-radius:4px;cursor:text!important}
        html[data-visual-sales-editor="editing"] h1:hover,html[data-visual-sales-editor="editing"] h2:hover,html[data-visual-sales-editor="editing"] p:hover,html[data-visual-sales-editor="editing"] .eyebrow:hover,html[data-visual-sales-editor="editing"] li:hover,html[data-visual-sales-editor="editing"] summary:hover{outline:1px dashed rgba(110,231,183,.75);outline-offset:3px}
        html[data-visual-sales-editor="editing"] img{cursor:pointer}html[data-visual-sales-editor="editing"] img:hover{outline:2px solid rgba(110,231,183,.8);outline-offset:3px}
        html[data-visual-sales-editor="editing"] [data-visual-draggable]{cursor:grab!important;touch-action:none!important;outline:2px dashed rgba(110,231,183,.85);outline-offset:4px}
        html[data-visual-sales-editor="editing"] [data-visual-draggable]:active{cursor:grabbing!important}
      `;
      doc.head.appendChild(style);
    }

    const activateText = (sectionId: string, key: string, fieldLabel: string, element: HTMLElement) => {
      setEditing(current => {
        if (current && current.element !== element) {
          current.element.textContent = current.originalValue;
          finishEditing(current);
        }
        const originalValue = element.textContent ?? "";
        element.contentEditable = "true";
        element.dataset.salesEditing = "true";
        element.setAttribute("role", "textbox");
        element.setAttribute("aria-label", `Editar ${fieldLabel}`);
        win.setTimeout(() => {
          element.focus();
          const selection = win.getSelection();
          const range = doc.createRange();
          range.selectNodeContents(element);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }, 0);
        return { sectionId, key, element, originalValue };
      });
    };

    const onClick = (event: MouseEvent) => {
      if (interactionMode) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      for (const section of PUBLIC_SALES_COPY_SECTIONS) {
        const root = sectionRoot(doc, section);
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
          activateText(section.id, field.key, field.label, fieldElement);
          return;
        }
      }
    };

    let dragId: FloatingId | null = null;
    const onPointerDown = (event: PointerEvent) => {
      if (interactionMode || savingLayout) return;
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-visual-draggable]");
      const id = element?.dataset.visualDraggable as FloatingId | undefined;
      if (!element || !id) return;
      event.preventDefault();
      event.stopPropagation();
      dragId = id;
      try { element.setPointerCapture(event.pointerId); } catch { /* navegador pode não suportar */ }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragId) return;
      const x = Math.max(3, Math.min(97, (event.clientX / Math.max(1, win.innerWidth)) * 100));
      const y = Math.max(4, Math.min(96, (event.clientY / Math.max(1, win.innerHeight)) * 100));
      const id = dragId;
      setLayout(current => ({ ...current, [breakpoint]: { ...current[breakpoint], [id]: { x, y } } }));
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragId) return;
      const id = dragId;
      dragId = null;
      const x = Math.max(3, Math.min(97, (event.clientX / Math.max(1, win.innerWidth)) * 100));
      const y = Math.max(4, Math.min(96, (event.clientY / Math.max(1, win.innerHeight)) * 100));
      setLayout(current => {
        const next = { ...current, [breakpoint]: { ...current[breakpoint], [id]: { x, y } } };
        void persistLayout(next);
        return next;
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!editing) return;
      if (event.key === "Escape") {
        event.preventDefault();
        discardTextEdit();
      }
    };

    const refreshDraggables = () => applyLayoutInsideFrame(layout, breakpoint);
    const observer = new MutationObserver(refreshDraggables);
    observer.observe(doc.body, { childList: true, subtree: true });
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("pointermove", onPointerMove, true);
    doc.addEventListener("pointerup", onPointerUp, true);
    doc.addEventListener("keydown", onKeyDown, true);
    refreshDraggables();
    setFrameReady(true);

    cleanupEditorRef.current = () => {
      observer.disconnect();
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("pointermove", onPointerMove, true);
      doc.removeEventListener("pointerup", onPointerUp, true);
      doc.removeEventListener("keydown", onKeyDown, true);
    };
  }, [interactionMode, savingLayout, breakpoint, layout, editing, finishEditing, discardTextEdit, applyLayoutInsideFrame, persistLayout]);

  useEffect(() => {
    if (frameReady) installEditor();
    return () => cleanupEditorRef.current?.();
  }, [interactionMode, breakpoint]);

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
    const payload = {
      kind: "notice" as const,
      title: `Copy: ${section.adminLabel}`,
      summary: null,
      body: JSON.stringify({ ...currentValues, [editing.key]: value }),
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

  const width = breakpointWidth(breakpoint);

  return <DashboardLayout menuItems={adminMenu} title="Administração">
    <main className="visual-editor-shell">
      <header className="visual-editor-toolbar" data-visual-editor-ui>
        <div className="visual-editor-brand"><MousePointer2 size={18} /><div><strong>Editor visual da página</strong><span>A página pública real é carregada abaixo em modo de edição WYSIWYG.</span></div></div>
        <div className="visual-editor-breakpoints" role="group" aria-label="Tamanho da visualização">
          <button className={breakpoint === "desktop" ? "is-active" : ""} onClick={() => setBreakpoint("desktop")} type="button"><Monitor size={16} /><span>Desktop</span></button>
          <button className={breakpoint === "tablet" ? "is-active" : ""} onClick={() => setBreakpoint("tablet")} type="button"><Tablet size={16} /><span>Tablet</span></button>
          <button className={breakpoint === "mobile" ? "is-active" : ""} onClick={() => setBreakpoint("mobile")} type="button"><Smartphone size={16} /><span>Mobile</span></button>
        </div>
        <button type="button" className={`visual-editor-preview-toggle ${interactionMode ? "is-active" : ""}`} onClick={() => { discardTextEdit(); setInteractionMode(value => !value); }}><Eye size={16} />{interactionMode ? "Voltar a editar" : "Testar interação"}</button>
      </header>

      <section className="visual-editor-iframe-area">
        <iframe
          ref={iframeRef}
          src={withAppBase("/?visual-editor=1")}
          title="Editor visual da página pública"
          className="visual-editor-iframe"
          style={{ width: width ? `${width}px` : "100%" }}
          onLoad={() => { setFrameReady(true); window.setTimeout(installEditor, 50); }}
        />
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
