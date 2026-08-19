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

  it("mantém o HTML em um iframe isolado, responsivo e expansível no leitor e na prévia administrativa", async () => {
    const reader = await readFile(path.join(root, "client/src/components/ResponsiveEbookFrame.tsx"), "utf8");
    const admin = await readFile(path.join(root, "client/src/pages/AdminEbooks.tsx"), "utf8");
    expect(reader).toContain("sandbox=\"allow-same-origin\"");
    expect(reader).toContain("srcDoc={htmlContent}");
    expect(reader).toContain("calculateResponsiveEbookScale");
    expect(reader).toContain("requestFullscreen");
    expect(reader).toContain('"fullscreenchange"');
    expect(reader).toContain('event.key !== "Escape"');
    expect(reader).toContain('data-ebook-reader="responsive"');
    expect(reader).toContain('"Ampliar"');
    expect(reader).toContain('"Sair da tela cheia"');
    expect(admin).toContain("sandbox=\"\"");
    expect(admin).toContain("srcDoc={form.htmlContent}");
  });
});
