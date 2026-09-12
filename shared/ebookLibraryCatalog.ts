export const PACKAGED_EBOOK_LIBRARY_CATEGORIES = {
  "1d8e16d1223794d3": "Vendas e conversão",
  "ca8f8fffe31879b0": "Produto digital",
  "0c3d80f743f7d741": "Tráfego e divulgação",
  "df81605e3e33bd06": "Vendas e conversão",
  "f067cf4e35bef1fb": "Negócio digital",
  "dcf2c294d0106c58": "Negócio digital",
  "f79d6b99393dd257": "Negócio digital",
  "d1d5a93bdc43efa5": "Desenvolvimento pessoal e financeiro",
  "9feb86683db10d30": "Negócio digital",
  "59bd2bc9ce090c66": "Negócio digital",
  "24a8db479323bec9": "Vendas e conversão",
  "c301bd528371cde1": "Negócio digital",
  "b5c67c69d55242b2": "Tráfego e divulgação",
  "00b17def0c107cda": "Desenvolvimento pessoal e financeiro",
  "e160e8fab8fc682e": "Tráfego e divulgação",
  "ec5d0d54c698e4d9": "Negócio digital",
  "4e7d9cf6c3b2c27a": "Tráfego e divulgação",
  "0dbe0f033a14b0e8": "Tráfego e divulgação",
  "8c92c6f20ceb06a4": "Tráfego e divulgação",
  "f47950b8ee163dc5": "Desenvolvimento pessoal e financeiro",
  "eadf8b9f21a06345": "Tráfego e divulgação",
  "5d5373a602833e83": "Tráfego e divulgação",
  "2b2c4e19cecfa415": "Negócio digital",
  "a0776006258f02e6": "Produto digital",
  "f789737a6772817a": "Produto digital",
  "d89f64de22eed9aa": "Negócio digital",
  "2a3da4b8df2faaa4": "Negócio digital",
  "3cdf2d469e99b81e": "Negócio digital",
  "73b27e9348b1c6d9": "Produto digital",
} as const;

export type PackagedEbookLibraryCategory = (typeof PACKAGED_EBOOK_LIBRARY_CATEGORIES)[keyof typeof PACKAGED_EBOOK_LIBRARY_CATEGORIES];

export function getPackagedEbookLibraryCategory(sourceId: string | null | undefined): PackagedEbookLibraryCategory | null {
  if (!sourceId) return null;
  return PACKAGED_EBOOK_LIBRARY_CATEGORIES[sourceId as keyof typeof PACKAGED_EBOOK_LIBRARY_CATEGORIES] ?? null;
}
