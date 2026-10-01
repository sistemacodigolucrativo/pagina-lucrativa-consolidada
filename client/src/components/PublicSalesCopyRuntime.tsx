import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  PUBLIC_SALES_COPY_CATEGORY,
  PUBLIC_SALES_COPY_SECTIONS,
  defaultValuesForSection,
  type PublicSalesCopyOverrides,
} from "@shared/publicSalesCopyEditor";
import {
  PUBLIC_HERO_TITLE,
  splitPublicHeroTitle,
} from "@shared/publicHeroTitle";
import {
  DEFAULT_PUBLIC_PAGE_TEMPLATE,
  normalizePublicPageTemplate,
  type PublicPageTemplate,
} from "@shared/publicPageTemplate";
import {
  PUBLIC_VISUAL_EDITOR_CATEGORY,
  createEmptyPublicVisualLayout,
  publicVisualLayoutResource,
  parsePublicVisualLayout,
  type PublicVisualBreakpoint,
  type PublicVisualElement,
  type PublicVisualEditorConfig,
  type PublicVisualLayout,
} from "@shared/publicVisualEditor";

type Point = { x?: number; y?: number };
export type FloatingLayout = Partial<
  Record<
    "desktop" | "tablet" | "mobile",
    Partial<Record<"fab" | "cta" | "toast", Point>>
  >
>;

type PublicSalesCopyState = {
  overrides: PublicSalesCopyOverrides;
  floatingLayout: FloatingLayout;
  pageTemplate: PublicPageTemplate;
  visualEditor: PublicVisualEditorConfig;
  ready: boolean;
};

const PUBLIC_SALES_COPY_ENDPOINT = "/api/public-sales-copy";
const PublicSalesCopyContext = createContext<PublicSalesCopyState>({
  overrides: {},
  floatingLayout: {},
  pageTemplate: DEFAULT_PUBLIC_PAGE_TEMPLATE,
  visualEditor: { enabled: false, layouts: {} },
  ready: false,
});
const FLOATING_POSITION_PROPS = [
  "left",
  "top",
  "right",
  "bottom",
  "transform",
] as const;
const HERO_TITLE_SELECTOR = ".reference-page .sales-hero .sales-hero-copy > h1";

export function usePublicSalesCopy() {
  return useContext(PublicSalesCopyContext);
}

export function PublicSalesCopyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PublicSalesCopyState>({
    overrides: {},
    floatingLayout: {},
    pageTemplate: DEFAULT_PUBLIC_PAGE_TEMPLATE,
    visualEditor: { enabled: false, layouts: {} },
    ready: false,
  });

  useEffect(() => {
    let active = true;
    fetch(withAppBase(PUBLIC_SALES_COPY_ENDPOINT), { credentials: "include" })
      .then(response =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Falha ao carregar copy pública"))
      )
      .then((payload: Omit<PublicSalesCopyState, "ready">) => {
        if (!active) return;
        setState({
          overrides: payload.overrides ?? {},
          floatingLayout: payload.floatingLayout ?? {},
          pageTemplate: normalizePublicPageTemplate(payload.pageTemplate),
          visualEditor: payload.visualEditor ?? { enabled: false, layouts: {} },
          ready: true,
        });
      })
      .catch(error => {
        console.warn("[PublicSalesCopy] copy pública indisponível:", error);
        if (active) setState(current => ({ ...current, ready: true }));
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicSalesCopyContext.Provider value={state}>
      {children}
    </PublicSalesCopyContext.Provider>
  );
}

function breakpointForWidth(width: number): "desktop" | "tablet" | "mobile" {
  if (width <= 560) return "mobile";
  if (width <= 980) return "tablet";
  return "desktop";
}

function publicVisualBreakpointForWidth(width: number): PublicVisualBreakpoint {
  return breakpointForWidth(width);
}

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resetFloatingPosition(element: HTMLElement) {
  FLOATING_POSITION_PROPS.forEach(property =>
    element.style.removeProperty(property)
  );
}

function clampPointToViewport(element: HTMLElement, point: Required<Point>) {
  const rect = element.getBoundingClientRect();
  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  const elementWidth = rect.width || element.offsetWidth || 0;
  const elementHeight = rect.height || element.offsetHeight || 0;
  const minX = Math.min(50, ((elementWidth / 2 + 8) / viewportWidth) * 100);
  const maxX = Math.max(50, 100 - minX);
  const minY = Math.min(50, ((elementHeight / 2 + 8) / viewportHeight) * 100);
  const maxY = Math.max(50, 100 - minY);
  return {
    x: clamp(minX, clamp(0, point.x, 100), maxX),
    y: clamp(minY, clamp(0, point.y, 100), maxY),
  };
}

function rectanglesOverlap(first: DOMRect, second: DOMRect) {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

function preventFloatingActionOverlap() {
  const cta = document.querySelector<HTMLElement>(".public-conversion-cta");
  const fab = document.querySelector<HTMLElement>(".member-chat-fab-wrap");
  if (!cta || !fab) return;

  if (
    rectanglesOverlap(cta.getBoundingClientRect(), fab.getBoundingClientRect())
  ) {
    resetFloatingPosition(cta);
    resetFloatingPosition(fab);
  }
}

function applyHeroTitle(overrides: PublicSalesCopyOverrides, ready: boolean) {
  document
    .querySelectorAll<HTMLHeadingElement>(HERO_TITLE_SELECTOR)
    .forEach(element => {
      if (!ready) {
        element.classList.remove("public-hero-title-ready");
        return;
      }

      const title = overrides.hero?.title?.trim() || PUBLIC_HERO_TITLE;
      if (
        element.dataset.publicHeroTitle === title &&
        element.classList.contains("public-hero-title-ready")
      )
        return;

      const { accent, remainder } = splitPublicHeroTitle(title);
      const accentNode = document.createElement("span");
      accentNode.className = "public-hero-title-accent";
      accentNode.textContent = accent;
      element.replaceChildren(accentNode);
      if (remainder) element.append(document.createTextNode(` ${remainder}`));
      element.dataset.publicHeroTitle = title;
      element.classList.add("public-hero-title-ready");
    });
}

function applyFloatingLayout(layout: FloatingLayout) {
  const breakpoint = breakpointForWidth(window.innerWidth);
  const positions = layout[breakpoint] ?? {};
  const selectors: Record<"fab" | "cta" | "toast", string> = {
    fab: ".member-chat-fab-wrap",
    cta: ".public-conversion-cta",
    toast: ".public-social-proof-toast",
  };

  (Object.keys(selectors) as Array<keyof typeof selectors>).forEach(id => {
    document.querySelectorAll<HTMLElement>(selectors[id]).forEach(element => {
      if (id === "fab" || id === "cta") {
        resetFloatingPosition(element);
        return;
      }
      if (element.classList.contains("public-social-proof-toast-inline"))
        return;
      const point = positions[id];
      if (typeof point?.x !== "number" || typeof point?.y !== "number") {
        resetFloatingPosition(element);
        return;
      }

      const nextPoint = clampPointToViewport(element, {
        x: point.x,
        y: point.y,
      });
      element.style.left = nextPoint.x + "%";
      element.style.top = nextPoint.y + "%";
      element.style.right = "auto";
      element.style.bottom = "auto";
      element.style.transform = "translate(-50%, -50%)";
    });
  });
  preventFloatingActionOverlap();
}

function sectionRoot(
  doc: Document,
  section: (typeof PUBLIC_SALES_COPY_SECTIONS)[number]
) {
  if (typeof section.referenceCopyIndex === "number") {
    return (
      doc.querySelectorAll<HTMLElement>("section.reference-copy")[
        section.referenceCopyIndex
      ] ?? null
    );
  }
  return section.sectionSelector
    ? doc.querySelector<HTMLElement>(section.sectionSelector)
    : null;
}

function queryWithin(root: HTMLElement, selector: string) {
  const normalized = selector.trim().startsWith(">")
    ? `:scope ${selector.trim()}`
    : selector;
  return root.querySelector<HTMLElement>(normalized);
}

type EditableTarget = {
  id: string;
  sectionId: string;
  fieldKey: string;
  label: string;
  kind: "text" | "image";
  element: HTMLElement;
};

function editableTargets(doc: Document): EditableTarget[] {
  const targets: EditableTarget[] = [];
  for (const section of PUBLIC_SALES_COPY_SECTIONS) {
    const root = sectionRoot(doc, section);
    if (!root) continue;
    for (const field of section.fields) {
      if (!field.selector) continue;
      const element = queryWithin(root, field.selector);
      if (!element) continue;
      const id = `${section.id}.${field.key}`;
      element.dataset.publicVisualEditable = id;
      element.dataset.publicVisualSection = section.id;
      element.dataset.publicVisualField = field.key;
      element.dataset.publicVisualLabel = field.label;
      element.dataset.publicVisualKind = "text";
      targets.push({
        id,
        sectionId: section.id,
        fieldKey: field.key,
        label: field.label,
        kind: "text",
        element,
      });
    }
    if (section.imageSectionId) {
      const image = root.querySelector<HTMLElement>("img");
      if (!image) continue;
      const id = `${section.id}.image`;
      image.dataset.publicVisualEditable = id;
      image.dataset.publicVisualSection = section.id;
      image.dataset.publicVisualField = "image";
      image.dataset.publicVisualLabel = `${section.adminLabel} - imagem`;
      image.dataset.publicVisualKind = "image";
      targets.push({
        id,
        sectionId: section.id,
        fieldKey: "image",
        label: `${section.adminLabel} - imagem`,
        kind: "image",
        element: image,
      });
    }
  }
  return targets;
}

function applyVisualElementStyle(
  element: HTMLElement,
  config: PublicVisualElement | undefined
) {
  element.classList.add("public-visual-layout-target");
  element.style.removeProperty("--public-visual-x");
  element.style.removeProperty("--public-visual-y");
  element.style.removeProperty("--public-visual-width");
  element.style.removeProperty("--public-visual-height");
  element.style.removeProperty("display");
  if (!config) return;
  if (config.hidden) {
    element.style.display = "none";
    return;
  }
  if (typeof config.x === "number")
    element.style.setProperty("--public-visual-x", `${config.x}px`);
  if (typeof config.y === "number")
    element.style.setProperty("--public-visual-y", `${config.y}px`);
  if (typeof config.width === "number")
    element.style.setProperty("--public-visual-width", `${config.width}px`);
  if (typeof config.height === "number")
    element.style.setProperty("--public-visual-height", `${config.height}px`);
}

function removeGeneratedDuplicates() {
  document
    .querySelectorAll<HTMLElement>("[data-public-visual-generated-duplicate]")
    .forEach(element => element.remove());
}

function applyVisualLayout(layout: PublicVisualLayout | undefined) {
  const targets = editableTargets(document);
  removeGeneratedDuplicates();
  for (const target of targets) {
    applyVisualElementStyle(target.element, layout?.elements[target.id]);
  }
  if (!layout) return;
  for (const [id, config] of Object.entries(layout.elements)) {
    if (!config.duplicateOf) continue;
    const source = targets.find(target => target.id === config.duplicateOf);
    if (!source || config.hidden) continue;
    const clone = source.element.cloneNode(true) as HTMLElement;
    clone.dataset.publicVisualGeneratedDuplicate = id;
    clone.dataset.publicVisualEditable = id;
    clone.dataset.publicVisualSection = source.sectionId;
    clone.dataset.publicVisualField = source.fieldKey;
    clone.dataset.publicVisualLabel = `${source.label} duplicado`;
    source.element.insertAdjacentElement("afterend", clone);
    applyVisualElementStyle(clone, config);
  }
}

export default function PublicSalesCopyRuntime() {
  const { floatingLayout, overrides, pageTemplate, ready, visualEditor } =
    usePublicSalesCopy();
  const session = trpc.auth.me.useQuery(undefined, { retry: false });
  const isAdmin = session.data?.role === "admin";
  const adminContent = trpc.admin.content.useQuery(undefined, {
    enabled: Boolean(isAdmin && visualEditor.enabled),
  });
  const createContent = trpc.admin.createContent.useMutation();
  const updateContent = trpc.admin.updateContent.useMutation();
  const utils = trpc.useUtils();
  const [activeBreakpoint, setActiveBreakpoint] =
    useState<PublicVisualBreakpoint>(() =>
      typeof window === "undefined"
        ? "desktop"
        : publicVisualBreakpointForWidth(window.innerWidth)
    );
  const activeSavedLayout =
    visualEditor.layouts[pageTemplate]?.[activeBreakpoint];
  const [pendingLayout, setPendingLayout] = useState<PublicVisualLayout | null>(
    null
  );
  const activeVisualLayout = pendingLayout ?? activeSavedLayout;
  const pendingTextsRef = useRef<Record<string, Record<string, string>>>({});
  const selectedElementRef = useRef<HTMLElement | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const [selected, setSelected] = useState<{
    id: string;
    sectionId: string;
    fieldKey: string;
    label: string;
    kind: "text" | "image";
    rect: DOMRect;
  } | null>(null);
  const [textEditing, setTextEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorEnabled = ready && visualEditor.enabled && isAdmin;

  const cloneLayout = useCallback(
    (layout: PublicVisualLayout | null | undefined): PublicVisualLayout => {
      if (layout) return JSON.parse(JSON.stringify(layout)) as PublicVisualLayout;
      return createEmptyPublicVisualLayout(pageTemplate, activeBreakpoint);
    },
    [activeBreakpoint, pageTemplate]
  );

  const refreshSelectionRect = useCallback((element?: HTMLElement | null) => {
    const target = element ?? selectedElementRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setSelected(current => (current ? { ...current, rect } : current));
  }, []);

  const selectVisualElement = useCallback(
    (element: HTMLElement) => {
      selectedElementRef.current?.removeAttribute("data-public-visual-editing");
      selectedElementRef.current?.setAttribute("contenteditable", "false");
      setTextEditing(false);
      selectedElementRef.current = element;
      element.dataset.publicVisualEditing = "true";
      const id = element.dataset.publicVisualEditable ?? "";
      const sectionId = element.dataset.publicVisualSection ?? "";
      const fieldKey = element.dataset.publicVisualField ?? "";
      const label = element.dataset.publicVisualLabel ?? "Elemento";
      const kind =
        element.dataset.publicVisualKind === "image" ? "image" : "text";
      setSelected({
        id,
        sectionId,
        fieldKey,
        label,
        kind,
        rect: element.getBoundingClientRect(),
      });
      window.requestAnimationFrame(() => refreshSelectionRect(element));
    },
    [refreshSelectionRect]
  );

  const beginTextEditing = useCallback(
    (element: HTMLElement) => {
      if (element.dataset.publicVisualKind === "image") return;
      selectVisualElement(element);
      element.setAttribute("contenteditable", "plaintext-only");
      element.setAttribute("role", "textbox");
      setTextEditing(true);
      window.requestAnimationFrame(() => {
        element.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
        refreshSelectionRect(element);
      });
    },
    [refreshSelectionRect, selectVisualElement]
  );

  const patchElement = useCallback(
    (
      id: string,
      patch: PublicVisualElement,
      target: HTMLElement | null = selectedElementRef.current
    ) => {
      setDirty(true);
      setPendingLayout(current => {
        const next = cloneLayout(current ?? activeSavedLayout);
        next.elements[id] = { ...(next.elements[id] ?? {}), ...patch };
        if (target?.dataset.publicVisualEditable === id)
          applyVisualElementStyle(target, next.elements[id]);
        return next;
      });
      window.requestAnimationFrame(() => refreshSelectionRect(target));
    },
    [activeSavedLayout, cloneLayout, refreshSelectionRect]
  );

  const beginPointerEdit = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, mode: "move" | "resize") => {
      const selectedNow = selected;
      const element = selectedElementRef.current;
      if (!selectedNow || !element) return;
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startY = event.clientY;
      const rect = element.getBoundingClientRect();
      const startConfig =
        (pendingLayout ?? activeSavedLayout)?.elements[selectedNow.id] ?? {};
      const startOffsetX = startConfig.x ?? 0;
      const startOffsetY = startConfig.y ?? 0;
      const startWidth = startConfig.width ?? rect.width;
      const startHeight = startConfig.height ?? rect.height;

      const onMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (mode === "move") {
          patchElement(
            selectedNow.id,
            {
              x: Math.round(startOffsetX + dx),
              y: Math.round(startOffsetY + dy),
            },
            element
          );
          return;
        }
        patchElement(
          selectedNow.id,
          {
            width: Math.round(Math.max(40, startWidth + dx)),
            height: Math.round(Math.max(24, startHeight + dy)),
          },
          element
        );
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    },
    [activeSavedLayout, patchElement, pendingLayout, selected]
  );

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let queued = false;

    const applyRuntime = () => {
      if (cancelled) return;
      applyHeroTitle(overrides, ready);
      applyFloatingLayout(floatingLayout);
      applyVisualLayout(activeVisualLayout);
    };

    const scheduleApply = () => {
      if (queued || cancelled) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        applyRuntime();
      });
    };

    const handleResize = () => scheduleApply();
    window.addEventListener("resize", handleResize);

    applyRuntime();
    observer = new MutationObserver(() => {
      applyHeroTitle(overrides, ready);
      scheduleApply();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [activeVisualLayout, floatingLayout, overrides, ready]);

  useEffect(() => {
    const updateBreakpoint = () =>
      setActiveBreakpoint(publicVisualBreakpointForWidth(window.innerWidth));
    window.addEventListener("resize", updateBreakpoint);
    updateBreakpoint();
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  useEffect(() => {
    if (!editorEnabled) return;
    const style = document.createElement("style");
    style.dataset.publicVisualRuntimeStyle = "true";
    style.textContent = `
      [data-public-visual-editable]{cursor:pointer}
      [data-public-visual-editable]:hover{outline:1px dashed rgba(110,231,183,.8);outline-offset:4px}
      [data-public-visual-editing="true"]{outline:2px solid #6ee7b7!important;outline-offset:5px}
    `;
    document.head.appendChild(style);

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>("[data-public-visual-editable]");
      if (!element) return;
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = window.setTimeout(() => {
        selectVisualElement(element);
      }, 320);
    };

    const clearHoldTimer = () => {
      if (!holdTimerRef.current) return;
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>("[data-public-visual-editable]");
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      clearHoldTimer();
      selectVisualElement(element);
    };

    const onDblClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>("[data-public-visual-editable]");
      if (!element || element.dataset.publicVisualKind === "image") return;
      event.preventDefault();
      event.stopPropagation();
      clearHoldTimer();
      beginTextEditing(element);
    };

    const onInput = (event: Event) => {
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-public-visual-editable]"
      );
      if (!element || element.getAttribute("contenteditable") !== "plaintext-only")
        return;
      const sectionId = element.dataset.publicVisualSection;
      const fieldKey = element.dataset.publicVisualField;
      if (!sectionId || !fieldKey) return;
      pendingTextsRef.current[sectionId] ??= {};
      pendingTextsRef.current[sectionId][fieldKey] =
        element.textContent?.trim() ?? "";
      setDirty(true);
      refreshSelectionRect(element);
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", clearHoldTimer, true);
    document.addEventListener("pointercancel", clearHoldTimer, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("dblclick", onDblClick, true);
    document.addEventListener("input", onInput, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    editableTargets(document);
    return () => {
      clearHoldTimer();
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", clearHoldTimer, true);
      document.removeEventListener("pointercancel", clearHoldTimer, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("dblclick", onDblClick, true);
      document.removeEventListener("input", onInput, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      selectedElementRef.current?.removeAttribute("data-public-visual-editing");
      selectedElementRef.current?.setAttribute("contenteditable", "false");
      style.remove();
    };
  }, [
    beginTextEditing,
    dirty,
    editorEnabled,
    refreshSelectionRect,
    selectVisualElement,
  ]);

  useEffect(() => {
    if (!textEditing) return;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    const bodyTouchAction = document.body.style.touchAction;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      document.body.style.touchAction = bodyTouchAction;
    };
  }, [textEditing]);

  const duplicateSelected = useCallback(() => {
    if (!selected || !selectedElementRef.current) return;
    const source = selectedElementRef.current;
    const rect = source.getBoundingClientRect();
    const id = `${selected.id}#copy-${Date.now()}`;
    setDirty(true);
    setPendingLayout(current => {
      const next = cloneLayout(current ?? activeSavedLayout);
      next.elements[id] = {
        duplicateOf: selected.id,
        x: 18,
        y: 18,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
      window.requestAnimationFrame(() => applyVisualLayout(next));
      return next;
    });
  }, [activeSavedLayout, cloneLayout, selected]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    patchElement(selected.id, { hidden: true });
    setSelected(null);
    selectedElementRef.current = null;
  }, [patchElement, selected]);

  const discardPending = useCallback(() => {
    pendingTextsRef.current = {};
    setPendingLayout(null);
    setDirty(false);
    setSelected(null);
    setTextEditing(false);
    selectedElementRef.current = null;
    window.location.reload();
  }, []);

  const savePending = useCallback(async () => {
    if (!editorEnabled) return;
    setSaving(true);
    try {
      const records = adminContent.data ?? [];
      for (const [sectionId, values] of Object.entries(pendingTextsRef.current)) {
        const section = PUBLIC_SALES_COPY_SECTIONS.find(item => item.id === sectionId);
        if (!section) continue;
        const record = records.find(
          item =>
            item.kind === "notice" &&
            item.resourceCategory === PUBLIC_SALES_COPY_CATEGORY &&
            item.resourceType === sectionId &&
            item.status !== "archived"
        );
        let currentValues = defaultValuesForSection(section);
        if (record?.body) {
          try {
            const parsed = JSON.parse(record.body) as Record<string, unknown>;
            currentValues = {
              ...currentValues,
              ...Object.fromEntries(
                Object.entries(parsed).filter(
                  (entry): entry is [string, string] =>
                    typeof entry[1] === "string"
                )
              ),
            };
          } catch {
            /* Mantem os valores padrao da secao. */
          }
        }
        const payload = {
          kind: "notice" as const,
          title: `Copy: ${section.adminLabel}`,
          summary: null,
          body: JSON.stringify({ ...currentValues, ...values }),
          resourceUrl: null,
          resourceCategory: PUBLIC_SALES_COPY_CATEGORY,
          resourceType: sectionId,
          status: "published" as const,
        };
        if (record) await updateContent.mutateAsync({ id: record.id, ...payload });
        else await createContent.mutateAsync(payload);
      }

      if (pendingLayout) {
        const resourceType = publicVisualLayoutResource(
          pageTemplate,
          activeBreakpoint
        );
        const record = records.find(
          item =>
            item.kind === "notice" &&
            item.resourceCategory === PUBLIC_VISUAL_EDITOR_CATEGORY &&
            item.resourceType === resourceType &&
            item.status !== "archived"
        );
        const payload = {
          kind: "notice" as const,
          title: `Layout visual ${pageTemplate}/${activeBreakpoint}`,
          summary: "Ajustes visuais da pagina publica",
          body: JSON.stringify({
            ...pendingLayout,
            template: pageTemplate,
            breakpoint: activeBreakpoint,
          }),
          resourceUrl: null,
          resourceCategory: PUBLIC_VISUAL_EDITOR_CATEGORY,
          resourceType,
          status: "published" as const,
        };
        const parsed = parsePublicVisualLayout(payload.body);
        if (!parsed) throw new Error("Layout visual invalido.");
        if (record) await updateContent.mutateAsync({ id: record.id, ...payload });
        else await createContent.mutateAsync(payload);
      }

      pendingTextsRef.current = {};
      setPendingLayout(null);
      setDirty(false);
      setTextEditing(false);
      selectedElementRef.current?.setAttribute("contenteditable", "false");
      await utils.admin.content.invalidate();
      toast.success("Alteracoes da pagina publica salvas.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar as alteracoes."
      );
    } finally {
      setSaving(false);
    }
  }, [
    activeBreakpoint,
    adminContent.data,
    createContent,
    editorEnabled,
    pageTemplate,
    pendingLayout,
    updateContent,
    utils.admin.content,
  ]);

  if (!editorEnabled) return null;

  return (
    <>
      {selected ? (
        <div
          className="public-visual-selection-box"
          style={{
            left: selected.rect.left,
            top: selected.rect.top,
            width: selected.rect.width,
            height: selected.rect.height,
          }}
        >
          <div className="public-visual-selection-label">{selected.label}</div>
          <button
            type="button"
            className="public-visual-move-handle"
            onPointerDown={event => beginPointerEdit(event, "move")}
          >
            Mover
          </button>
          {selected.kind === "text" ? (
            <button
              type="button"
              onClick={() => {
                if (selectedElementRef.current)
                  beginTextEditing(selectedElementRef.current);
              }}
            >
              Editar texto
            </button>
          ) : null}
          {selected.kind === "text" ? (
            <button type="button" onClick={duplicateSelected}>
              Duplicar
            </button>
          ) : null}
          <button type="button" onClick={deleteSelected}>
            Excluir
          </button>
          <button
            type="button"
            className="public-visual-resize-handle"
            aria-label="Redimensionar"
            onPointerDown={event => beginPointerEdit(event, "resize")}
          />
        </div>
      ) : null}
      {dirty ? (
        <div className="public-visual-savebar" role="dialog" aria-label="Alteracoes pendentes">
          <span>Alteracoes pendentes em {activeBreakpoint}</span>
          <button type="button" onClick={savePending} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={discardPending} disabled={saving}>
            Descartar
          </button>
        </div>
      ) : null}
    </>
  );
}
