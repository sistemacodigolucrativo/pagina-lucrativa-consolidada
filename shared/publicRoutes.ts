const publicConversionPaths = new Set([
  "/",
  "/acesso",
  "/personalizar",
  "/institucional",
  "/termos-de-uso",
  "/politica-de-privacidade",
  "/regras-comerciais",
  "/contato",
]);

export function isPublicConversionRoute(pathname: string): boolean {
  const normalizedPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return publicConversionPaths.has(normalizedPath);
}
