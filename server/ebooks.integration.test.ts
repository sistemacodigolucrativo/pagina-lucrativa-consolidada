import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();
const read = (file: string) => readFile(path.join(root, file), "utf8");

describe("módulo canônico de e-books e Academia", () => {
  it("protege leitura/gestão e expõe progresso sincronizado", async () => {
    const router = await read("server/routers.ts");
    expect(router).toContain("ebooks: protectedProcedure.query(() => getPublishedEbooks())");
    expect(router).toContain("ebook: protectedProcedure.input");
    expect(router).toContain("ebookReadingHistory: protectedProcedure.query");
    expect(router).toContain("ebookReadingProgress: protectedProcedure.input");
    expect(router).toContain("updateEbookReadingProgress: protectedProcedure.input");
    expect(router).toContain("updateCoursePublication: adminProcedure.input");
    expect(router).toContain("createEbook: adminProcedure.input(ebookInput)");
    expect(router).toContain('contentType: z.literal("application/pdf")');
  });

  it("registra Biblioteca e Academia como rotas administrativas reais", async () => {
    const app = await read("client/src/App.tsx");
    const navigation = await read("shared/memberOfficeContent.ts");
    const adminNavigation = await read("client/src/lib/adminNavigation.ts");
    expect(app).toContain('path="/membros/ebooks" component={EbookReader}');
    expect(app).toContain('path="/admin/academia" component={AdminAcademy}');
    expect(app).toContain('path="/admin/ebooks" component={AdminEbooks}');
    expect(navigation).toContain('label: "Biblioteca de e-books", path: "/membros/ebooks"');
    expect(adminNavigation).toContain('label: "Academia", path: "/admin/academia"');
    expect(adminNavigation).toContain('label: "Biblioteca de e-books", path: "/admin/ebooks"');
  });

  it("organiza a biblioteca por categorias reais e agrupa e-books sem categoria em Outros", async () => {
    const memberReader = await read("client/src/pages/EbookReader.tsx");
    expect(memberReader).toContain("const libraryShelves = [");
    for (const label of ["Negócio digital", "Marca e posicionamento", "Produto digital", "Conteúdo e criativos", "SEO e descoberta", "Captação e funis", "E-mail e relacionamento", "Tráfego e divulgação", "Vendas e conversão", "Marketing de rede", "Ferramentas e modelos", "Desenvolvimento pessoal e financeiro"]) {
      expect(memberReader).toContain(`label: \"${label}\"`);
    }
    expect(memberReader).toContain("order: 1");
    expect(memberReader).toContain("a.order ?? 999");
    expect(memberReader).toContain("normalizeSearchText");
    expect(memberReader).toContain("classifyEbook");
    expect(memberReader).toContain("shelfFromPersistedCategory");
    expect(memberReader).toContain('label: "Outros"');
    expect(memberReader).toContain("const shelf = persistedShelf ?? uncategorizedShelf");
    expect(memberReader).not.toContain("keywords.some(keyword => searchableText.includes(keyword))");
    expect(memberReader).not.toContain("ebookShelfOverrides");
    expect(memberReader).toContain('placeholder="Buscar por título ou assunto"');
    expect(memberReader).toContain('aria-label="Ordenar e-books"');
    expect(memberReader).toContain('value="recentes"');
    expect(memberReader).toContain('value="az"');
    expect(memberReader).toContain('value="za"');
    expect(memberReader).toContain("recentEbooksStorageKey");
    expect(memberReader).toContain("window.localStorage.setItem(recentEbooksStorageKey");
    expect(memberReader).toContain("ebookReadingHistory");
    expect(memberReader).toContain("updateEbookReadingProgress");
    expect(memberReader).toContain("Progresso sincronizado com sua conta.");
    expect(memberReader).toContain("Continuar lendo");
    expect(memberReader).toContain('aria-label="Carrossel de e-books recentes"');
    expect(memberReader).toContain("snap-x snap-mandatory");
    expect(memberReader).toContain("snap-start");
    expect(memberReader).toContain("Prateleiras da biblioteca");
    expect(memberReader).toContain("categoria cadastrada na administração");
    expect(memberReader).toContain("sem categoria definida aparecem automaticamente em Outros");
  });

  it("renderiza PDF internamente, restaura página e informa progresso", async () => {
    const reader = await read("client/src/components/ResponsiveEbookFrame.tsx");
    const memberReader = await read("client/src/pages/EbookReader.tsx");
    const memberCourses = await read("client/src/pages/MemberCourses.tsx");
    expect(reader).toContain("pdfUrl?: string | null");
    expect(reader).toContain('from "pdfjs-dist"');
    expect(reader).toContain("function PdfCanvasReader");
    expect(reader).toContain("getDocument({ url: pdfUrl, withCredentials: true })");
    expect(reader).toContain("page.render({ canvasContext, viewport, transform })");
    expect(reader).toContain('sandbox="allow-same-origin"');
    expect(reader).not.toContain("docs.google.com/gview");
    expect(reader).toContain("initialPage?: number | null");
    expect(reader).toContain("onProgressChange?:");
    expect(reader).toContain("data-pdf-page={pageNumber}");
    expect(reader).toContain("Página ${currentPage} de ${pageCount}");
    expect(reader).toContain("requestFullscreen");
    expect(memberReader).toContain("<Dialog open={readerOpen}");
    expect(memberReader).toContain("setReaderOpen(true)");
    expect(memberReader).toContain("onEscapeKeyDown={handleDialogEscape}");
    expect(memberReader).toContain("pdfUrl={selected.data.pdfUrl ?? null}");
    expect(memberReader).toContain('displayMode="modal"');
    expect(memberReader).toContain("initialPage={readingProgress.data?.currentPage ?? 1}");
    expect(memberReader).toContain("onProgressChange={handleReadingProgress}");
    expect(memberReader).toContain("!inset-0");
    expect(memberReader).toContain("!w-auto");
    expect(memberReader).toContain("[overflow-wrap:anywhere]");
    expect(memberReader).toContain('DialogDescription className="sr-only"');
    expect(memberReader).toContain("pb-[calc(env(safe-area-inset-bottom)+0.25rem)]");
    expect(memberReader).toContain('className="h-full w-full min-w-0"');
    expect(memberCourses).toContain("courseEbooks");
    expect(memberCourses).toContain('aria-label="Materiais do curso"');
    expect(memberCourses).toContain("updateEbookReadingProgress");
    expect(memberCourses).not.toContain("Avançar 20%");
  });

  it("mantém upload seguro, agrupamento administrativo e publicação de curso como unidade", async () => {
    const admin = await read("client/src/pages/AdminEbooks.tsx");
    const academy = await read("client/src/pages/AdminAcademy.tsx");
    const canonical = await read("server/academyCanonical.ts");
    const db = await read("server/db.ts");
    expect(admin).toContain("readPdfFile");
    expect(admin).toContain("MAX_PDF_BYTES");
    expect(admin).toContain('accept=".pdf,application/pdf"');
    expect(admin).toContain("Publicados sem curso");
    expect(admin).toContain('status: "draft"');
    expect(admin).toContain("Materiais publicados com destino Academia aparecem agrupados por curso");
    expect(academy).toContain("updateCoursePublication");
    expect(academy).toContain("Publicação dos cursos");
    expect(canonical).toContain("coursePublished");
    expect(canonical).toContain("updateAcademyCoursePublication");
    expect(canonical).toContain("stableCourseId");
    expect(canonical).toContain('createHash("sha256")');
    expect(canonical).toContain("EBOOK_READING_PROGRESS_ID_OFFSET");
    expect(canonical).toContain("summary.sourceId && detail.sourceId !== summary.sourceId");
    expect(db).toContain('buffer.subarray(0, 5).toString("ascii") !== "%PDF-"');
  });

  it("mantém leitor Tech Futuristic para copy e vendas", async () => {
    const reader = await read("client/src/components/ResponsiveEbookFrame.tsx");
    const memberReader = await read("client/src/pages/EbookReader.tsx");
    expect(reader).toContain('readerVariant?: "default" | "tech-futuristic"');
    expect(reader).toContain('data-reader-variant="tech-futuristic"');
    expect(reader).toContain("fitStudioOriginalContent");
    expect(memberReader).toContain('selectedCatalog?.shelf.id === "conteudo-criativos"');
    expect(memberReader).toContain('selectedCatalog?.shelf.id === "vendas-conversao"');
    expect(memberReader).toContain('readerVariant={usesTechFuturisticReader ? "tech-futuristic" : "default"}');
  });
});
