export const PUBLIC_HERO_TITLE = "Receba o Método Código Lucrativo pronto para começar — com estrutura consolidada para ativar e operar.";

export function splitPublicHeroTitle(value: string) {
  const title = value.trim();
  const separatorIndex = title.indexOf("—");
  if (separatorIndex < 0) return { accent: title, remainder: "" };
  return {
    accent: title.slice(0, separatorIndex).trimEnd(),
    remainder: title.slice(separatorIndex).trimStart(),
  };
}

export function restorePublicHeroTitleBody(body: string | null | undefined) {
  if (!body) return null;
  try {
    const parsed = JSON.parse(body) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return JSON.stringify({ ...(parsed as Record<string, unknown>), title: PUBLIC_HERO_TITLE });
  } catch {
    return null;
  }
}
