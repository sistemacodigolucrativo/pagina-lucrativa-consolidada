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
import { getPublicSalesPresentation } from "@/lib/publicSalesPresentation";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  PUBLIC_SALES_COPY_CATEGORY,
  PUBLIC_SALES_COPY_SECTIONS,
  defaultValuesForSection,
  type PublicSalesCopyOverrides,
} from "@shared/publicSalesCopyEditor";
import {
  resolvePublicSalesContent,
  type PublicSalesContentSnapshot,
} from "@shared/publicSalesContent";
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
  normalizePublicVisualLayoutTargetIds,
  publicVisualElementForTarget,
  publicVisualLayoutResource,
  publicVisualTargetIdentity,
  parsePublicVisualLayout,
  type PublicVisualBreakpoint,
  type PublicVisualElement,
  type PublicVisualEditorConfig,
  type PublicVisualLayout,
  type PublicVisualTargetIdentity,
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

type PublicSalesCopyContextValue = PublicSalesCopyState & {
  content: PublicSalesContentSnapshot;
};

const PUBLIC_SALES_COPY_ENDPOINT = "/api/public-sales-copy";
const DEFAULT_PUBLIC_SALES_CONTENT = resolvePublicSalesContent();
const PublicSalesCopyContext = createContext<PublicSalesCopyContextValue>({
  overrides: {},
  floatingLayout: {},
  pageTemplate: DEFAULT_PUBLIC_PAGE_TEMPLATE,
  visualEditor: { enabled: false, layouts: {} },
  ready: false,
  content: DEFAULT_PUBLIC_SALES_CONTENT,
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

  const content = useMemo(
    () => resolvePublicSalesContent(state.overrides),
    [state.overrides]
  );
  const contextValue = useMemo(
    () => ({ ...state, content }),
    [state, content]
  );

  return (
    <PublicSalesCopyContext.Provider value={contextValue}>
      {children}
    </PublicSalesCopyContext.Provider>
  );
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
  const breakpoint = getPublicSalesPresentation().visualBreakpoint;
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

type EditableTarget = PublicVisualTargetIdentity & {
  sectionId: string;
  fieldKey: string;
  label: string;
  kind: "text" | "image" | "button" | "block";
  element: HTMLElement;
};

function assignEditableTarget(
  targets: EditableTarget[],
  target: EditableTarget,
  storage: "copy" | "layout",
  annotate = true
) {
  if (
    target.element.closest(
      "[data-visual-editor-ui], [data-public-visual-generated-duplicate]"
    )
  )
    return;
  if (annotate) {
    target.element.dataset.publicVisualEditable = target.id;
    target.element.dataset.publicVisualSection = target.sectionId;
    target.element.dataset.publicVisualField = target.fieldKey;
    target.element.dataset.publicVisualLabel = target.label;
    target.element.dataset.publicVisualKind = target.kind;
    target.element.dataset.publicVisualStorage = storage;
  }
  targets.push(target);
}

function labelForInteractiveElement(element: HTMLElement, index: number) {
  const explicit =
    element.getAttribute("aria-label") ??
    element.getAttribute("title") ??
    element.textContent;
  const label = explicit?.replace(/\s+/g, " ").trim();
  return label ? `Botao - ${label}` : `Botao ${index + 1}`;
}

function labelForBlockElement(sectionLabel: string, index: number) {
  return `${sectionLabel} - bloco ${index + 1}`;
}

function editableBlockElements(root: HTMLElement) {
  return root.querySelectorAll<HTMLElement>(
    ".package-grid > article, .objection-grid > article, .social-proof-stats > article, .testimonial-card, .reference-image-frame, .sales-actions"
  );
}

function editableTargets(doc: Document, annotate = true): EditableTarget[] {
  const targets: EditableTarget[] = [];
  for (const section of PUBLIC_SALES_COPY_SECTIONS) {
    const root = sectionRoot(doc, section);
    if (!root) continue;
    for (const field of section.fields) {
      if (!field.selector) continue;
      let element = queryWithin(root, field.selector);
      if (
        section.id === "hero" &&
        field.key === "trust" &&
        element &&
        element.getClientRects().length === 0
      ) {
        element =
          Array.from(
            doc.querySelectorAll<HTMLElement>(field.selector)
          ).find(candidate => candidate.getClientRects().length > 0) ?? element;
      }
      if (!element) continue;
      const id = `${section.id}.${field.key}`;
      assignEditableTarget(
        targets,
        {
          id,
          sectionId: section.id,
          fieldKey: field.key,
          label: field.label,
          kind: "text",
          element,
        },
        "copy",
        annotate
      );
    }
    editableBlockElements(root).forEach((block, index) => {
      const identity = publicVisualTargetIdentity(
        section.id,
        "block",
        block.dataset.publicVisualKey,
        index
      );
      assignEditableTarget(
        targets,
        {
          ...identity,
          sectionId: section.id,
          fieldKey: `block${index + 1}`,
          label: labelForBlockElement(section.adminLabel, index),
          kind: "block",
          element: block,
        },
        "layout",
        annotate
      );
    });
    root.querySelectorAll<HTMLElement>("img").forEach((image, index) => {
      const identity = publicVisualTargetIdentity(
        section.id,
        "image",
        image.dataset.publicVisualKey,
        index
      );
      assignEditableTarget(
        targets,
        {
          ...identity,
          sectionId: section.id,
          fieldKey: `image${index + 1}`,
          label: `${section.adminLabel} - imagem ${index + 1}`,
          kind: "image",
          element: image,
        },
        "layout",
        annotate
      );
    });
    root
      .querySelectorAll<HTMLElement>("a, button, [role='button']")
      .forEach((action, index) => {
        if (action.closest("[data-public-visual-editable]") !== action) return;
        const identity = publicVisualTargetIdentity(
          section.id,
          "action",
          action.dataset.publicVisualKey,
          index
        );
        assignEditableTarget(
          targets,
          {
            ...identity,
            sectionId: section.id,
            fieldKey: `action${index + 1}`,
            label: labelForInteractiveElement(action, index),
            kind: "button",
            element: action,
          },
          "layout",
          annotate
        );
      });
  }
  return targets;
}

function setEditableElementText(element: HTMLElement, text: string) {
  const normalized = text.trim();
  const textNode = Array.from(element.childNodes).find(
    node => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim()
  );
  if (textNode) {
    textNode.textContent = normalized ? `${normalized} ` : "";
    return;
  }
  element.textContent = normalized;
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
  if (
    typeof config.text === "string" &&
    element.dataset.publicVisualKind !== "image"
  ) {
    setEditableElementText(element, config.text);
  }
}

function removeGeneratedDuplicates() {
  document
    .querySelectorAll<HTMLElement>("[data-public-visual-generated-duplicate]")
    .forEach(element => element.remove());
}

function findEditableTarget(
  targets: readonly EditableTarget[],
  id: string
) {
  return targets.find(
    target => target.id === id || target.legacyIds?.includes(id)
  );
}

function applyVisualLayout(layout: PublicVisualLayout | undefined) {
  const targets = editableTargets(document);
  const compatibleLayout = layout
    ? normalizePublicVisualLayoutTargetIds(layout, targets)
    : undefined;
  removeGeneratedDuplicates();
  const orderedGroups = new Map<HTMLElement, EditableTarget[]>();
  for (const target of targets) {
    const config = publicVisualElementForTarget(compatibleLayout, target);
    applyVisualElementStyle(target.element, config);
    const order = config?.order;
    if (typeof order === "number" && target.element.parentElement) {
      const group = orderedGroups.get(target.element.parentElement) ?? [];
      group.push(target);
      orderedGroups.set(target.element.parentElement, group);
    }
  }
  orderedGroups.forEach((group, parent) => {
    group
      .sort((first, second) => {
        const firstOrder =
          publicVisualElementForTarget(compatibleLayout, first)?.order ?? 0;
        const secondOrder =
          publicVisualElementForTarget(compatibleLayout, second)?.order ?? 0;
        return firstOrder - secondOrder;
      })
      .forEach(target => parent.appendChild(target.element));
  });
  if (!compatibleLayout) return;
  for (const [id, config] of Object.entries(compatibleLayout.elements)) {
    if (!config.duplicateOf) continue;
    const source = findEditableTarget(targets, config.duplicateOf);
    if (!source || config.hidden) continue;
    const clone = source.element.cloneNode(true) as HTMLElement;
    clone.dataset.publicVisualGeneratedDuplicate = id;
    clone.dataset.publicVisualEditable = id;
    clone.dataset.publicVisualSection = source.sectionId;
    clone.dataset.publicVisualField = source.fieldKey;
    clone.dataset.publicVisualLabel = `${source.label} duplicado`;
    clone.dataset.publicVisualKind = source.kind;
    clone.dataset.publicVisualStorage =
      source.element.dataset.publicVisualStorage ?? "layout";
    source.element.insertAdjacentElement("afterend", clone);
    applyVisualElementStyle(clone, config);
  }
}

function visualLayoutElementForId(
  layout: PublicVisualLayout | null | undefined,
  id: string
) {
  const target = findEditableTarget(editableTargets(document, false), id);
  return target
    ? publicVisualElementForTarget(layout, target)
    : layout?.elements[id];
}

type RectBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type AlignmentGuide = {
  axis: "x" | "y";
  position: number;
};

function rectBounds(rect: DOMRect): RectBounds {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function viewportBounds(): RectBounds {
  return {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  };
}

function intersectBounds(first: RectBounds, second: RectBounds): RectBounds {
  const left = Math.max(first.left, second.left);
  const top = Math.max(first.top, second.top);
  const right = Math.min(first.right, second.right);
  const bottom = Math.min(first.bottom, second.bottom);
  if (right <= left || bottom <= top) return first;
  return { left, top, right, bottom };
}

function dragBoundsForElement(element: HTMLElement) {
  const container =
    element.closest<HTMLElement>(".shell") ??
    element.closest<HTMLElement>("section") ??
    element.closest<HTMLElement>(".sales-page") ??
    document.documentElement;
  return intersectBounds(
    viewportBounds(),
    rectBounds(container.getBoundingClientRect())
  );
}

function clampOffsetToBounds(
  startRect: DOMRect,
  bounds: RectBounds,
  desiredX: number,
  desiredY: number
) {
  const padding = 4;
  const minX = bounds.left + padding - startRect.left;
  const maxX = bounds.right - padding - startRect.right;
  const minY = bounds.top + padding - startRect.top;
  const maxY = bounds.bottom - padding - startRect.bottom;
  return {
    x: clamp(minX, desiredX, Math.max(minX, maxX)),
    y: clamp(minY, desiredY, Math.max(minY, maxY)),
  };
}

function elementCenter(rect: DOMRect | RectBounds) {
  return {
    x: (rect.left + rect.right) / 2,
    y: (rect.top + rect.bottom) / 2,
  };
}

function snapOffsetForElement(
  element: HTMLElement,
  startRect: DOMRect,
  desiredX: number,
  desiredY: number
) {
  const threshold = 8;
  let x = desiredX;
  let y = desiredY;
  const guides: AlignmentGuide[] = [];
  const dragged = {
    left: startRect.left + desiredX,
    right: startRect.right + desiredX,
    top: startRect.top + desiredY,
    bottom: startRect.bottom + desiredY,
  };
  const draggedCenter = elementCenter(dragged);
  const container = dragBoundsForElement(element);
  const xCandidates = [
    container.left,
    elementCenter(container).x,
    container.right,
  ];
  const yCandidates = [
    container.top,
    elementCenter(container).y,
    container.bottom,
  ];

  document
    .querySelectorAll<HTMLElement>("[data-public-visual-editable]")
    .forEach(candidate => {
      if (
        candidate === element ||
        candidate.contains(element) ||
        element.contains(candidate)
      )
        return;
      const rect = candidate.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const center = elementCenter(rect);
      xCandidates.push(rect.left, center.x, rect.right);
      yCandidates.push(rect.top, center.y, rect.bottom);
    });

  const draggedXPoints = [
    { value: dragged.left, adjust: "left" as const },
    { value: draggedCenter.x, adjust: "center" as const },
    { value: dragged.right, adjust: "right" as const },
  ];
  const draggedYPoints = [
    { value: dragged.top, adjust: "top" as const },
    { value: draggedCenter.y, adjust: "center" as const },
    { value: dragged.bottom, adjust: "bottom" as const },
  ];

  let bestX = threshold + 1;
  for (const candidate of xCandidates) {
    for (const point of draggedXPoints) {
      const distance = Math.abs(candidate - point.value);
      if (distance >= bestX || distance > threshold) continue;
      bestX = distance;
      const nextX =
        point.adjust === "left"
          ? candidate - startRect.left
          : point.adjust === "right"
            ? candidate - startRect.right
            : candidate - (startRect.left + startRect.width / 2);
      x = nextX;
      guides[0] = { axis: "x", position: candidate };
    }
  }

  let bestY = threshold + 1;
  for (const candidate of yCandidates) {
    for (const point of draggedYPoints) {
      const distance = Math.abs(candidate - point.value);
      if (distance >= bestY || distance > threshold) continue;
      bestY = distance;
      const nextY =
        point.adjust === "top"
          ? candidate - startRect.top
          : point.adjust === "bottom"
            ? candidate - startRect.bottom
            : candidate - (startRect.top + startRect.height / 2);
      y = nextY;
      guides[1] = { axis: "y", position: candidate };
    }
  }

  return { x, y, guides: guides.filter(Boolean) };
}

function editableDirectChildren(parent: HTMLElement) {
  return Array.from(parent.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      Boolean(child.dataset.publicVisualEditable) &&
      child.parentElement === parent
  );
}

function orderedEditableIds(parent: HTMLElement) {
  return editableDirectChildren(parent)
    .map(element => element.dataset.publicVisualEditable)
    .filter((id): id is string => Boolean(id));
}

function shouldReorderTarget(kind: string | undefined) {
  return kind === "block" || kind === "button" || kind === "image";
}

function reorderElementNearPointer(
  element: HTMLElement,
  pointerX: number,
  pointerY: number
) {
  if (!shouldReorderTarget(element.dataset.publicVisualKind)) return null;
  const parent = element.parentElement;
  if (!parent) return null;
  const siblings = editableDirectChildren(parent);
  if (siblings.length < 2 || !siblings.includes(element)) return null;

  const target = siblings.find(sibling => {
    if (sibling === element) return false;
    const rect = sibling.getBoundingClientRect();
    return (
      pointerX >= rect.left &&
      pointerX <= rect.right &&
      pointerY >= rect.top &&
      pointerY <= rect.bottom
    );
  });
  if (!target) return null;

  const targetRect = target.getBoundingClientRect();
  const rowLike =
    siblings.filter(sibling => {
      const rect = sibling.getBoundingClientRect();
      return Math.abs(rect.top - targetRect.top) < targetRect.height * 0.6;
    }).length > 1;
  const insertAfter = rowLike
    ? pointerX > targetRect.left + targetRect.width / 2
    : pointerY > targetRect.top + targetRect.height / 2;
  const reference = insertAfter ? target.nextSibling : target;
  if (reference === element || target === element.nextSibling) return null;

  parent.insertBefore(element, reference);
  element.style.setProperty("--public-visual-x", "0px");
  element.style.setProperty("--public-visual-y", "0px");
  return orderedEditableIds(parent);
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
        : getPublicSalesPresentation().visualBreakpoint
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
    kind: "text" | "image" | "button" | "block";
    rect: DOMRect;
  } | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [textEditing, setTextEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorEnabled = ready && visualEditor.enabled && isAdmin;

  const cloneLayout = useCallback(
    (layout: PublicVisualLayout | null | undefined): PublicVisualLayout => {
      if (layout)
        return normalizePublicVisualLayoutTargetIds(
          JSON.parse(JSON.stringify(layout)) as PublicVisualLayout,
          editableTargets(document, false)
        );
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
        element.dataset.publicVisualKind === "image"
          ? "image"
          : element.dataset.publicVisualKind === "button"
            ? "button"
            : element.dataset.publicVisualKind === "block"
              ? "block"
              : "text";
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

  const persistElementOrder = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      setDirty(true);
      setPendingLayout(current => {
        const next = cloneLayout(current ?? activeSavedLayout);
        ids.forEach((id, index) => {
          next.elements[id] = {
            ...(next.elements[id] ?? {}),
            order: index,
            x: 0,
            y: 0,
          };
        });
        return next;
      });
    },
    [activeSavedLayout, cloneLayout]
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
        visualLayoutElementForId(
          pendingLayout ?? activeSavedLayout,
          selectedNow.id
        ) ?? {};
      const startOffsetX = startConfig.x ?? 0;
      const startOffsetY = startConfig.y ?? 0;
      const startWidth = startConfig.width ?? rect.width;
      const startHeight = startConfig.height ?? rect.height;
      const bounds = dragBoundsForElement(element);
      const previousTouchAction = document.body.style.touchAction;
      const previousUserSelect = document.body.style.userSelect;
      let hasDragged = false;
      let lastPointerX = startX;
      let lastPointerY = startY;
      document.body.style.touchAction = "none";
      document.body.style.userSelect = "none";

      const onMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        lastPointerX = moveEvent.clientX;
        lastPointerY = moveEvent.clientY;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (!hasDragged && Math.hypot(dx, dy) < 5) return;
        hasDragged = true;
        if (mode === "move") {
          const snapped = snapOffsetForElement(element, rect, dx, dy);
          const nextOffset = clampOffsetToBounds(
            rect,
            bounds,
            snapped.x,
            snapped.y
          );
          setAlignmentGuides(snapped.guides);
          patchElement(
            selectedNow.id,
            {
              x: Math.round(startOffsetX + nextOffset.x),
              y: Math.round(startOffsetY + nextOffset.y),
            },
            element
          );
          return;
        }
        setAlignmentGuides([]);
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
        document.body.style.touchAction = previousTouchAction;
        document.body.style.userSelect = previousUserSelect;
        setAlignmentGuides([]);
        if (mode === "move" && hasDragged) {
          const order = reorderElementNearPointer(
            element,
            lastPointerX,
            lastPointerY
          );
          if (order) {
            persistElementOrder(order);
            window.requestAnimationFrame(() => refreshSelectionRect(element));
          }
        }
      };
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp, { once: true });
    },
    [
      activeSavedLayout,
      patchElement,
      pendingLayout,
      persistElementOrder,
      refreshSelectionRect,
      selected,
    ]
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
      setActiveBreakpoint(getPublicSalesPresentation().visualBreakpoint);
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
      [data-public-visual-kind="image"]{touch-action:none}
    `;
    document.head.appendChild(style);

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>(
        "[data-public-visual-editable]"
      );
      if (!element) return;
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      const startX = event.clientX;
      const startY = event.clientY;
      const startElement = element;
      if (startElement.closest("a, button, [role='button']")) {
        event.preventDefault();
        event.stopPropagation();
      }
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null;
        selectVisualElement(startElement);
        if (startElement.dataset.publicVisualKind !== "image") return;

        const id = startElement.dataset.publicVisualEditable;
        if (!id) return;
        const rect = startElement.getBoundingClientRect();
        const startConfig =
          visualLayoutElementForId(pendingLayout ?? activeSavedLayout, id) ?? {};
        const startOffsetX = startConfig.x ?? 0;
        const startOffsetY = startConfig.y ?? 0;
        const bounds = dragBoundsForElement(startElement);
        const previousTouchAction = document.body.style.touchAction;
        const previousUserSelect = document.body.style.userSelect;
        let hasDragged = false;
        let lastPointerX = startX;
        let lastPointerY = startY;
        document.body.style.touchAction = "none";
        document.body.style.userSelect = "none";

        const onDirectMove = (moveEvent: PointerEvent) => {
          moveEvent.preventDefault();
          lastPointerX = moveEvent.clientX;
          lastPointerY = moveEvent.clientY;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (!hasDragged && Math.hypot(dx, dy) < 5) return;
          hasDragged = true;
          const snapped = snapOffsetForElement(startElement, rect, dx, dy);
          const nextOffset = clampOffsetToBounds(
            rect,
            bounds,
            snapped.x,
            snapped.y
          );
          setAlignmentGuides(snapped.guides);
          patchElement(
            id,
            {
              x: Math.round(startOffsetX + nextOffset.x),
              y: Math.round(startOffsetY + nextOffset.y),
            },
            startElement
          );
        };
        const onDirectUp = () => {
          window.removeEventListener("pointermove", onDirectMove);
          window.removeEventListener("pointerup", onDirectUp);
          document.body.style.touchAction = previousTouchAction;
          document.body.style.userSelect = previousUserSelect;
          setAlignmentGuides([]);
          if (hasDragged) {
            const order = reorderElementNearPointer(
              startElement,
              lastPointerX,
              lastPointerY
            );
            if (order) {
              persistElementOrder(order);
              window.requestAnimationFrame(() =>
                refreshSelectionRect(startElement)
              );
            }
          }
        };
        window.addEventListener("pointermove", onDirectMove, {
          passive: false,
        });
        window.addEventListener("pointerup", onDirectUp, { once: true });
      }, 320);
    };

    const clearHoldTimer = () => {
      if (!holdTimerRef.current) return;
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>(
        "[data-public-visual-editable]"
      );
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      clearHoldTimer();
      selectVisualElement(element);
    };

    const onDblClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>(
        "[data-public-visual-editable]"
      );
      if (!element || element.dataset.publicVisualKind === "image") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      clearHoldTimer();
      beginTextEditing(element);
    };

    const onInput = (event: Event) => {
      const element = (
        event.target as HTMLElement | null
      )?.closest<HTMLElement>("[data-public-visual-editable]");
      if (
        !element ||
        element.getAttribute("contenteditable") !== "plaintext-only"
      )
        return;
      const sectionId = element.dataset.publicVisualSection;
      const fieldKey = element.dataset.publicVisualField;
      const elementId = element.dataset.publicVisualEditable;
      if (!sectionId || !fieldKey || !elementId) return;
      const value = element.textContent?.trim() ?? "";
      if (element.dataset.publicVisualStorage === "layout") {
        patchElement(elementId, { text: value }, element);
        return;
      }
      pendingTextsRef.current[sectionId] ??= {};
      pendingTextsRef.current[sectionId][fieldKey] = value;
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
    activeSavedLayout,
    dirty,
    editorEnabled,
    patchElement,
    pendingLayout,
    persistElementOrder,
    refreshSelectionRect,
    selectVisualElement,
  ]);

  useEffect(() => {
    if (!editorEnabled || !selected) return;
    let queued = false;
    const updateSelection = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        const target = selectedElementRef.current;
        if (!target || target.style.display === "none") {
          setSelected(null);
          return;
        }
        const rect = target.getBoundingClientRect();
        const visible =
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth;
        if (!visible) {
          setSelected(null);
          target.removeAttribute("data-public-visual-editing");
          target.setAttribute("contenteditable", "false");
          return;
        }
        setSelected(current => (current ? { ...current, rect } : current));
      });
    };
    window.addEventListener("scroll", updateSelection, { passive: true });
    window.addEventListener("resize", updateSelection);
    updateSelection();
    return () => {
      window.removeEventListener("scroll", updateSelection);
      window.removeEventListener("resize", updateSelection);
    };
  }, [editorEnabled, selected]);

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
      for (const [sectionId, values] of Object.entries(
        pendingTextsRef.current
      )) {
        const section = PUBLIC_SALES_COPY_SECTIONS.find(
          item => item.id === sectionId
        );
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
        if (record)
          await updateContent.mutateAsync({ id: record.id, ...payload });
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
        if (record)
          await updateContent.mutateAsync({ id: record.id, ...payload });
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
          {selected.kind === "text" || selected.kind === "button" ? (
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
          <button type="button" onClick={duplicateSelected}>
            Duplicar
          </button>
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
      {alignmentGuides.map((guide, index) => (
        <div
          key={`${guide.axis}-${guide.position}-${index}`}
          className={`public-visual-guide public-visual-guide-${guide.axis}`}
          style={
            guide.axis === "x"
              ? { left: guide.position }
              : { top: guide.position }
          }
        />
      ))}
      {dirty ? (
        <div
          className="public-visual-savebar"
          role="dialog"
          aria-label="Alteracoes pendentes"
        >
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
