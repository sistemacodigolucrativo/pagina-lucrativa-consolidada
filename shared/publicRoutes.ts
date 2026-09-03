const publicConversionPaths = new Set([
  "/",
  "/acesso",
  "/personalizar",
  "/institucional",
  "/termos-de-uso",
  "/politica-de-privacidade",
  "/regras-comerciais",
  "/perguntas-frequentes",
  "/contato",
]);

export function isPublicConversionRoute(pathname: string): boolean {
  const normalizedPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return publicConversionPaths.has(normalizedPath);
}
