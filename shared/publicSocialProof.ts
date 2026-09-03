export type PublicSocialProofEntry = {
  id: string;
  name: string;
  city: string;
};

/**
 * These entries are intentionally illustrative. They are not purchase records
 * and must never be presented as verified customer activity.
 */
export const publicSocialProofEntries: readonly PublicSocialProofEntry[] = [
  { id: "ana-curitiba", name: "Ana", city: "Curitiba" },
  { id: "bruno-recife", name: "Bruno", city: "Recife" },
  { id: "camila-goiania", name: "Camila", city: "Goiânia" },
  { id: "danilo-belo-horizonte", name: "Danilo", city: "Belo Horizonte" },
  { id: "elaine-florianopolis", name: "Elaine", city: "Florianópolis" },
  { id: "felipe-salvador", name: "Felipe", city: "Salvador" },
  { id: "julia-manaus", name: "Julia", city: "Manaus" },
  { id: "marcos-campinas", name: "Marcos", city: "Campinas" },
  { id: "renata-porto-alegre", name: "Renata", city: "Porto Alegre" },
  { id: "thiago-belem", name: "Thiago", city: "Belém" },
];

export const publicSocialProofConfig = {
  initialDelayMs: { min: 9_000, max: 17_000 },
  betweenNoticesMs: { min: 18_000, max: 42_000 },
  visibleForMs: 7_000,
  recentHistoryLimit: 3,
} as const;

export function isPublicSocialProofRoute(pathname: string): boolean {
  const normalizedPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return normalizedPath === "/";
}

export function randomBetween(min: number, max: number, randomValue = Math.random()): number {
  const safeRandomValue = Math.min(1, Math.max(0, randomValue));
  return Math.min(max, Math.floor(min + safeRandomValue * (max - min + 1)));
}

export function choosePublicSocialProofIndex(
  recentIndices: readonly number[],
  randomValue = Math.random(),
): number {
  if (publicSocialProofEntries.length === 0) return -1;
  const recent = new Set(recentIndices.slice(-publicSocialProofConfig.recentHistoryLimit));
  const available = publicSocialProofEntries
    .map((_, index) => index)
    .filter(index => !recent.has(index));
  const candidates = available.length > 0 ? available : publicSocialProofEntries.map((_, index) => index);
  return candidates[Math.min(candidates.length - 1, Math.floor(Math.max(0, Math.min(1, randomValue)) * candidates.length))] ?? 0;
}

export function formatPublicSocialProof(entry: PublicSocialProofEntry): string {
  return `${entry.name}, de ${entry.city}, está conhecendo o Método Código Lucrativo.`;
}

export const publicSocialProofDisclaimer = "Demonstração ilustrativa — não representa uma compra real.";
