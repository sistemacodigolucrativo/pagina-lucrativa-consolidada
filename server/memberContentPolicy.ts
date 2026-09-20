export const INTERNAL_CONTENT_CATEGORIES = [
  "member-admin-control", "public-sales-copy", "public-sales-layout", "public-toast-config",
] as const;

export const MEMBER_CONTENT_KINDS = ["material", "article", "faq", "notice"] as const;

export function isMemberVisibleContent(item: { kind: string; status: string; resourceCategory: string | null }) {
  return item.status === "published"
    && (MEMBER_CONTENT_KINDS as readonly string[]).includes(item.kind)
    && !(INTERNAL_CONTENT_CATEGORIES as readonly (string | null)[]).includes(item.resourceCategory);
}
