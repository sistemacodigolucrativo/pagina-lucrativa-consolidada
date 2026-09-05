import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("módulo de e-books", () => {
  it("expõe leitura somente para membros autenticados e gestão somente para administradores", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(router).toContain("ebooks: protectedProcedure.query(() => getPublishedEbooks())");
    expect(router).toContain("ebook: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getPublishedEbook(input.id))");
    expect(router).toContain("ebooks: adminProcedure.query(() => getAdminEbooks())");
    expect(router).toContain("createEbook: adminProcedure.input(ebookInput)");
    expect(router).toContain("updateEbook: adminProcedure.input(ebookInput.extend");
  });

  it("registra as rotas e a biblioteca no menu do Escritório Virtual", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const navigation = await readFile(path.join(root, "shared/memberOfficeContent.ts"), "utf8");
    expect(app).toContain('path="/membros/ebooks" component={EbookReader}');
    expect(app).toContain('path="/admin/ebooks" component={AdminEbooks}');
    expect(navigation).toContain('label: "Biblioteca de e-books", path: "/membros/ebooks"');
  });

  it("organiza a biblioteca pública do membro como acervo pesquisável e categorizado", async () => {
    const memberReader = await readFile(path.join(root, "client/src/pages/EbookReader.tsx"), "utf8");
    expect(memberReader).toContain("const libraryShelves = [");
    expect(memberReader).toContain('label: "Copy e anúncios"');
    expect(memberReader).toContain('label: "Vendas e oferta"');
    expect(memberReader).toContain('label: "Tráfego e divulgação"');
    expect(memberReader).toContain('label: "Produto digital"');
    expect(memberReader).toContain('label: "Ferramentas e modelos"');
    expect(memberReader).toContain('label: "Negócio digital"');
    expect(memberReader).toContain('label: "Produtividade"');
    expect(memberReader).toContain("normalizeSearchText");
    expect(memberReader).toContain("classifyEbook");
    expect(memberReader).toContain('placeholder="Buscar por título ou assunto"');
    expect(memberReader).toContain('aria-label="Ordenar e-books"');
    expect(memberReader).toContain('value="recentes"');
    expect(memberReader).toContain('value="az"');
    expect(memberReader).toContain('value="za"');
    expect(memberReader).toContain("recentEbooksStorageKey");
    expect(memberReader).toContain("window.localStorage.setItem(recentEbooksStorageKey");
    expect(memberReader).toContain("Continuar lendo");
    expect(memberReader).toContain("Prateleiras da biblioteca");
  });

  it("renderiza PDF no leitor interno e mantém HTML isolado como fallback", async () => {
    const reader = await readFile(path.join(root, "client/src/components/ResponsiveEbookFrame.tsx"), "utf8");
    const memberReader = await readFile(path.join(root, "client/src/pages/EbookReader.tsx"), "utf8");
    const admin = await readFile(path.join(root, "client/src/pages/AdminEbooks.tsx"), "utf8");
    expect(reader).toContain("pdfUrl?: string | null");
    expect(reader).toContain('from "pdfjs-dist"');
    expect(reader).toContain('pdf.worker.min.mjs?url');
    expect(reader).toContain("function PdfCanvasReader");
    expect(reader).toContain("getDocument({ url: pdfUrl, withCredentials: true })");
    expect(reader).toContain("page.render({ canvasContext, viewport, transform })");
    expect(reader).toContain('sandbox="allow-same-origin"');
    expect(reader).toContain("srcDoc={htmlContent}");
    expect(reader).not.toContain("docs.google.com/gview");
    expect(reader).not.toContain("src={pdfUrl ?? undefined}");
    expect(reader).not.toContain("href={pdfUrl ?? undefined}");
    expect(reader).toContain("Abrir PDF");
    expect(reader).toContain("calculateResponsiveEbookScale");
    expect(reader).toContain("requestFullscreen");
    expect(reader).toContain('"fullscreenchange"');
    expect(reader).toContain('event.key !== "Escape"');
    expect(reader).toContain('data-ebook-reader="responsive"');
    expect(reader).toContain('displayMode?: "embedded" | "modal"');
    expect(reader).toContain("data-reader-display={displayMode}");
    expect(reader).toContain('displayMode === "modal"');
    expect(reader).toContain("codigo-lucrativo-ebook-scale-root");
    expect(reader).toContain('scaleRoot.style.setProperty("transform"');
    expect(reader).toContain('body.style.removeProperty("zoom")');
    expect(reader).not.toContain('body.style.setProperty("zoom"');
    expect(reader).toContain('"Ampliar"');
    expect(reader).toContain('"Sair da tela cheia"');
    expect(memberReader).toContain("<Dialog open={readerOpen}");
    expect(memberReader).toContain("setReaderOpen(true)");
    expect(memberReader).toContain("onEscapeKeyDown={handleDialogEscape}");
    expect(memberReader).toContain("pdfUrl={selected.data.pdfUrl ?? null}");
    expect(memberReader).toContain('displayMode="modal"');
    expect(memberReader).toContain("!inset-0");
    expect(memberReader).toContain("!w-auto");
    expect(memberReader).toContain("[overflow-wrap:anywhere]");
    expect(memberReader).toContain('className="h-full w-full min-w-0"');
    expect(memberReader).not.toContain("xl:grid-cols-[300px_minmax(0,1fr)]");
    expect(admin).toContain("E-books PDF e HTML");
    expect(admin).toContain("HTML do e-book (fallback)");
    expect(admin).toContain('sandbox=""');
    expect(admin).toContain("srcDoc={form.htmlContent}");
  });

  it("expõe os PDFs importados por rota estática e remove a dependência dos HTMLs empacotados", async () => {
    const server = await readFile(path.join(root, "server/_core/index.ts"), "utf8");
    const staticEbooks = await readFile(path.join(root, "server/staticEbooks.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");

    expect(staticEbooks).toContain('PACKAGED_EBOOK_FILE_ROUTE = "/ebook-files"');
    expect(staticEbooks).toContain('contentType: "application/pdf" as const');
    expect(staticEbooks).not.toContain('html-output');
    expect(staticEbooks).toContain("await stat(resolvedPath)");
    expect(server).toContain("registerPackagedEbookFiles(app, appPrefix)");
    expect(server).toContain("express.static(pdfRoot");
    expect(db).toContain("withEbookContentDefaults");
    expect(db).toContain("getPackagedEbookContentMetadataBySource");
    expect(db).toContain("withPackagedEbookContentMetadata");
    expect(db).toContain("return result.length ? withPackagedEbookContentMetadata(result) : getPackagedEbooks()");
  });

  it("ativa o leitor Tech Futuristic integral para e-books de copy e vendas", async () => {
    const reader = await readFile(path.join(root, "client/src/components/ResponsiveEbookFrame.tsx"), "utf8");
    const memberReader = await readFile(path.join(root, "client/src/pages/EbookReader.tsx"), "utf8");
    const studioLayout = await readFile(path.join(root, "server/ebookStudioLayout.ts"), "utf8");

    expect(reader).toContain('readerVariant?: "default" | "tech-futuristic"');
    expect(reader).toContain('data-reader-variant="tech-futuristic"');
    expect(reader).toContain("techJumpSections");
    expect(reader).toContain("fitStudioOriginalContent");
    expect(reader).toContain("TEMPLATE INTEGRAL");
    expect(reader).toContain("SIMULAÇÃO SMARTPHONE - 412px");
    expect(memberReader).toContain('selectedCatalog?.shelf.id === "copy"');
    expect(memberReader).toContain('selectedCatalog?.shelf.id === "vendas"');
    expect(memberReader).toContain('readerVariant={usesTechFuturisticReader ? "tech-futuristic" : "default"}');
    expect(studioLayout).toContain("CHAPTER_01 // PART_I");
    expect(studioLayout).toContain("CHAPTER_02 // PART_II");
    expect(studioLayout).toContain("CHAPTER_03 // PART_III");
    expect(studioLayout).toContain("COPYWRITING_E_VENDAS");
    expect(studioLayout).toContain("VENDAS_E_OFERTA");
  });
});
