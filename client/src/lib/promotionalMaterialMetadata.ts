const PROMOTIONAL_META_PATTERN = /\n*\[\[CL_PROMO_META:([^\]]+)\]\]\s*$/;

export type PromotionalMaterialMetadata = {
  body: string;
  imageUrl: string;
};

export function splitPromotionalMaterialBody(value?: string | null): PromotionalMaterialMetadata {
  const source = value ?? "";
  const match = source.match(PROMOTIONAL_META_PATTERN);
  if (!match || match.index === undefined) return { body: source, imageUrl: "" };

  try {
    const metadata = JSON.parse(decodeURIComponent(match[1])) as { imageUrl?: unknown };
    return {
      body: source.slice(0, match.index).trimEnd(),
      imageUrl: typeof metadata.imageUrl === "string" ? metadata.imageUrl.trim() : "",
    };
  } catch {
    return { body: source, imageUrl: "" };
  }
}

export function composePromotionalMaterialBody(body: string, imageUrl: string) {
  const cleanBody = body.trim();
  const cleanImageUrl = imageUrl.trim();
  if (!cleanImageUrl) return cleanBody;

  const metadata = encodeURIComponent(JSON.stringify({ imageUrl: cleanImageUrl }));
  const marker = `[[CL_PROMO_META:${metadata}]]`;
  return cleanBody ? `${cleanBody}\n\n${marker}` : marker;
}

export function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isDirectImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname);
  } catch {
    return false;
  }
}
