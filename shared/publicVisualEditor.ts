import { z } from "zod";
import {
  DEFAULT_PUBLIC_PAGE_TEMPLATE,
  PUBLIC_PAGE_TEMPLATES,
  normalizePublicPageTemplate,
  type PublicPageTemplate,
} from "./publicPageTemplate";

export const PUBLIC_VISUAL_EDITOR_CATEGORY = "public-sales-visual-editor";
export const PUBLIC_VISUAL_EDITOR_MODE_RESOURCE = "mode";
export const PUBLIC_VISUAL_EDITOR_LAYOUT_PREFIX = "layout";

export const publicVisualBreakpointSchema = z.enum([
  "desktop",
  "tablet",
  "mobile",
]);
export type PublicVisualBreakpoint = z.infer<
  typeof publicVisualBreakpointSchema
>;

export const publicVisualElementSchema = z
  .object({
    x: z.number().min(-2000).max(2000).optional(),
    y: z.number().min(-2000).max(2000).optional(),
    width: z.number().min(24).max(2400).optional(),
    height: z.number().min(18).max(2400).optional(),
    hidden: z.boolean().optional(),
    duplicateOf: z.string().trim().max(160).optional(),
    text: z.string().trim().max(6000).optional(),
    order: z.number().int().min(0).max(500).optional(),
  })
  .strict();

export type PublicVisualElement = z.infer<typeof publicVisualElementSchema>;

export const publicVisualLayoutSchema = z
  .object({
    version: z.literal(1),
    template: z.enum(PUBLIC_PAGE_TEMPLATES),
    breakpoint: publicVisualBreakpointSchema,
    elements: z.record(
      z.string().trim().min(1).max(180),
      publicVisualElementSchema
    ),
  })
  .strict();

export type PublicVisualLayout = z.infer<typeof publicVisualLayoutSchema>;

export type PublicVisualTargetIdentity = {
  id: string;
  legacyIds?: readonly string[];
};

export function publicVisualTargetIdentity(
  sectionId: string,
  kind: "block" | "image" | "action",
  stableKey: string | undefined,
  legacyIndex: number
): PublicVisualTargetIdentity {
  const legacyId = `${sectionId}.${kind}${legacyIndex + 1}`;
  const key = stableKey?.trim();
  if (!key) return { id: legacyId };

  const id = `${sectionId}.${kind}.${key}`;
  if (id.length > 180) return { id: legacyId };
  return { id, legacyIds: [legacyId] };
}

export function normalizePublicVisualLayoutTargetIds(
  layout: PublicVisualLayout,
  targets: readonly PublicVisualTargetIdentity[]
): PublicVisualLayout {
  const elements = { ...layout.elements };
  const legacyToStableId = new Map<string, string>();

  for (const target of targets) {
    for (const legacyId of target.legacyIds ?? []) {
      if (legacyId === target.id) continue;
      legacyToStableId.set(legacyId, target.id);
      if (!Object.prototype.hasOwnProperty.call(elements, legacyId)) continue;
      if (!Object.prototype.hasOwnProperty.call(elements, target.id)) {
        elements[target.id] = elements[legacyId]!;
      }
      delete elements[legacyId];
    }
  }

  for (const [id, element] of Object.entries(elements)) {
    const stableSourceId = element.duplicateOf
      ? legacyToStableId.get(element.duplicateOf)
      : undefined;
    if (stableSourceId) {
      elements[id] = { ...element, duplicateOf: stableSourceId };
    }
  }

  return { ...layout, elements };
}

export function publicVisualElementForTarget(
  layout: PublicVisualLayout | null | undefined,
  target: PublicVisualTargetIdentity
) {
  if (!layout) return undefined;
  if (layout.elements[target.id]) return layout.elements[target.id];
  for (const legacyId of target.legacyIds ?? []) {
    if (layout.elements[legacyId]) return layout.elements[legacyId];
  }
  return undefined;
}

export const publicVisualModeSchema = z
  .object({
    enabled: z.boolean(),
  })
  .strict();

export type PublicVisualMode = z.infer<typeof publicVisualModeSchema>;

export type PublicVisualEditorConfig = {
  enabled: boolean;
  layouts: Partial<
    Record<
      PublicPageTemplate,
      Partial<Record<PublicVisualBreakpoint, PublicVisualLayout>>
    >
  >;
};

export function publicVisualLayoutResource(
  template: PublicPageTemplate,
  breakpoint: PublicVisualBreakpoint
) {
  return `${PUBLIC_VISUAL_EDITOR_LAYOUT_PREFIX}:${template}:${breakpoint}`;
}

export function parsePublicVisualMode(body: string | null | undefined) {
  if (!body) return { enabled: false };
  try {
    return publicVisualModeSchema.parse(JSON.parse(body));
  } catch {
    return { enabled: false };
  }
}

export function parsePublicVisualLayout(body: string | null | undefined) {
  if (!body) return null;
  try {
    return publicVisualLayoutSchema.parse(JSON.parse(body));
  } catch {
    return null;
  }
}

export function createEmptyPublicVisualLayout(
  template: PublicPageTemplate = DEFAULT_PUBLIC_PAGE_TEMPLATE,
  breakpoint: PublicVisualBreakpoint = "desktop"
): PublicVisualLayout {
  return {
    version: 1,
    template: normalizePublicPageTemplate(template),
    breakpoint,
    elements: {},
  };
}
