export function normalizeAffiliateSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  return /^[a-z0-9-]{3,96}$/.test(slug) ? slug : null;
}
