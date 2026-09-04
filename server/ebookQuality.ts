export type EbookQualitySeverity = "warning" | "blocker";

export type EbookQualityIssue = {
  code: string;
  severity: EbookQualitySeverity;
  message: string;
};

export type EbookQualityInput = {
  sourceId: string;
  title: string;
  sourceFile: string;
  sourcePath: string;
  htmlFile?: string;
  htmlContent: string;
};

export type EbookQualityReport = {
  isPublishable: boolean;
  textLength: number;
  sanitizedLinkCount: number;
  issues: EbookQualityIssue[];
  warnings: EbookQualityIssue[];
  blockers: EbookQualityIssue[];
};

const TITLE_OVERRIDES: Record<string, string> = {
  dcd29a74b61b3dd4: "10 Maneiras De Escrever Anúncios Mais Eficientes",
  "1d8e16d1223794d3": "30 Truques Para Maximizar As Taxas De Conversão",
  "59bd2bc9ce090c66": "Despeça O Seu Chefe",
  ca8f8fffe31879b0: "7 Passos Para Ter Seu Próprio Produto Digital",
  f067cf4e35bef1fb: "A Sobrevivência No Marketing De Rede",
  dcf2c294d0106c58: "As Armadilhas Mortais No Marketing De Rede",
  a0776006258f02e6: "Os Segredos Da Criação De Vídeos",
  c301bd528371cde1: "Explosão Do Marketing De Rede",
  "24a8db479323bec9": "Estratégias De Vendas Intemporais",
  "00b17def0c107cda": "Maneiras Poderosas De Avivar A Sua Memória",
  e160e8fab8fc682e: "Marketing Com Newsletters De A a Z",
  "3cdf2d469e99b81e": "Upline Imparável",
  ea8406506d5192c9: "Métodos para Ganhar Dinheiro na Internet",
  eadf8b9f21a06345: "O Guia De Geração De Contactos Ilimitados",
  "4e7d9cf6c3b2c27a": "Marketing Por Email de A a Z",
  "8c92c6f20ceb06a4": "Noções Básicas De SEO",
  d89f64de22eed9aa: "Porque Você Nunca Terá Sucesso Online",
  "73b27e9348b1c6d9": "eBooks Grátis Expostos",
  "2a3da4b8df2faaa4": "Trabalhe Em Rede Com Eficiência Em Qualquer Indústria",
  "36075aaa6221c74b": "Como Conseguir Publicidade Gratuita para Seu Negócio",
};

const LEGACY_REFERENCE_PATTERNS = [
  /google\s*\+/i,
  /orkut/i,
  /msn\s+messenger/i,
  /page\s*rank/i,
  /pagerank/i,
  /ptc|paid\s*to\s*click|autosurf/i,
];

const DANGEROUS_OR_BROKEN_HREF = /^(?:javascript|vbscript|file):/i;
const ABSOLUTE_OR_SAFE_PROTOCOL = /^(?:https?:|mailto:|tel:)/i;
const LOCAL_DOCUMENT_LINK = /(?:^|\/|\\)(?:read\s*me|readme|adsense|banners|external|sitenoar|tos|version|tabela[^\/\\]*online)\.(?:html?|txt|rtf)$/i;
const WINDOWS_PATH = /^[a-z]:[\\/]/i;

function cleanImportedText(value: string) {
  return value
    .replace(/Ã¡/g, "á")
    .replace(/Ã¢/g, "â")
    .replace(/Ã£/g, "ã")
    .replace(/Ãª/g, "ê")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ã´/g, "ô")
    .replace(/Ãµ/g, "õ")
    .replace(/Ãº/g, "ú")
    .replace(/Ã§/g, "ç")
    .replace(/Ã/g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã“/g, "Ó")
    .replace(/Ã‡/g, "Ç")
    .replace(/[âÐ•]+/g, "")
    .replace(/[‘’“”]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripExtension(value: string) {
  return value.replace(/\.[a-z0-9]+$/i, "");
}

export function normalizeImportedEbookTitle(row: Pick<EbookQualityInput, "sourceId" | "title" | "sourceFile">) {
  const title = row.title.trim();
  const baseTitle = title && title.toLowerCase() !== "source" ? title : stripExtension(row.sourceFile).replace(/[_-]+/g, " ");
  return cleanImportedText(TITLE_OVERRIDES[row.sourceId] ?? baseTitle);
}

function isScriptPackageAsset(input: Pick<EbookQualityInput, "sourceFile" | "sourcePath" | "title">) {
  const sourceFile = input.sourceFile.toLowerCase();
  const sourcePath = input.sourcePath.toLowerCase();
  const title = input.title.toLowerCase();

  return (
    sourceFile.includes("script_ptc") ||
    sourcePath.includes("site ptc/") ||
    LOCAL_DOCUMENT_LINK.test(sourcePath) ||
    /^(read\s*me|readme|adsense|banners|external|sitenoar|tos|version|tabela)/i.test(title)
  );
}

function htmlEntityText(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

export function extractVisibleEbookText(htmlContent: string) {
  return htmlEntityText(
    htmlContent
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function decodeHref(href: string) {
  return htmlEntityText(href.trim());
}

export function isBrokenOrUnsafeEbookHref(rawHref: string) {
  const href = decodeHref(rawHref);
  if (!href || href === "#") return true;
  if (DANGEROUS_OR_BROKEN_HREF.test(href) || WINDOWS_PATH.test(href)) return true;
  if (ABSOLUTE_OR_SAFE_PROTOCOL.test(href)) return false;
  if (href.startsWith("#page") || href.startsWith("#toc") || href.startsWith("#bookmark")) return false;
  if (href.startsWith("#")) return false;
  if (/^[./]/.test(href)) return true;
  if (/\.(?:html?|php|asp|aspx|txt|rtf)(?:$|[?#])/i.test(href)) return true;
  return false;
}

function countBrokenOrUnsafeLinks(htmlContent: string) {
  const links = htmlContent.matchAll(/<a\b[^>]*\shref=(['"])(.*?)\1/gis);
  let count = 0;

  for (const [, , href] of links) {
    if (isBrokenOrUnsafeEbookHref(href)) count += 1;
  }

  return count;
}

export function sanitizeEbookHtml(htmlContent: string) {
  return htmlContent.replace(/(<a\b[^>]*?\s)href=(['"])(.*?)\2/gis, (match, prefix: string, _quote: string, href: string) => {
    if (!isBrokenOrUnsafeEbookHref(href)) return match;
    return `${prefix}href="#" data-disabled-link="true" aria-disabled="true" title="Link removido por revisão automática"`;
  });
}

export function auditPackagedEbook(input: EbookQualityInput): EbookQualityReport {
  const issues: EbookQualityIssue[] = [];
  const visibleText = extractVisibleEbookText(input.htmlContent);
  const textLength = visibleText.length;
  const sanitizedLinkCount = countBrokenOrUnsafeLinks(input.htmlContent);
  const combinedText = `${input.title} ${input.sourceFile} ${input.sourcePath} ${visibleText.slice(0, 25000)}`;

  if (isScriptPackageAsset(input)) {
    issues.push({
      code: "non-ebook-asset",
      severity: "blocker",
      message: "Arquivo auxiliar de script/pacote removido da biblioteca de membros por não ser e-book consumível.",
    });
  }

  if (input.htmlContent.trim().length < 5000 || textLength < 120) {
    issues.push({
      code: "incomplete-html",
      severity: "blocker",
      message: "Conversão HTML pequena demais ou sem texto suficiente, indicando material quebrado ou faltando partes.",
    });
  }

  if (sanitizedLinkCount > 0) {
    issues.push({
      code: "broken-link",
      severity: "warning",
      message: `${sanitizedLinkCount} link(s) interno(s), local(is) ou inseguro(s) foram neutralizados no leitor.`,
    });
  }

  if (LEGACY_REFERENCE_PATTERNS.some(pattern => pattern.test(combinedText))) {
    issues.push({
      code: "legacy-reference",
      severity: "warning",
      message: "O material contém referências legadas e deve ser tratado como estudo histórico, não como instrução operacional atual.",
    });
  }

  const oldYearMatch = combinedText.match(/\b(?:19\d{2}|20[01]\d)\b/);
  if (oldYearMatch) {
    issues.push({
      code: "old-date-reference",
      severity: "warning",
      message: `O material contém referência antiga (${oldYearMatch[0]}) e pode exigir contextualização.`,
    });
  }

  const blockers = issues.filter(issue => issue.severity === "blocker");
  const warnings = issues.filter(issue => issue.severity === "warning");

  return {
    isPublishable: blockers.length === 0,
    textLength,
    sanitizedLinkCount,
    issues,
    warnings,
    blockers,
  };
}

export function buildEbookSummary(title: string, quality: EbookQualityReport) {
  const notes: string[] = [];

  if (quality.sanitizedLinkCount > 0) {
    notes.push("links internos problemáticos foram neutralizados");
  }

  if (quality.warnings.some(issue => issue.code === "legacy-reference" || issue.code === "old-date-reference")) {
    notes.push("conteúdo histórico sinalizado para uso com critério");
  }

  const reviewNote = notes.length ? ` Revisão automática: ${notes.join("; ")}.` : "";
  return `Material de estudo publicado e empacotado no projeto: ${title}.${reviewNote}`;
}
