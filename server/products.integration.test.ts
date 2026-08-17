import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();
describe("catálogo de produtos", () => {
  it("mantém o cadastro do membro protegido e restringe a atualização ao proprietário", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");
    expect(router).toContain("createProduct: protectedProcedure.input(productInput)");
    expect(router).toContain("updateProduct: protectedProcedure.input(productInput.extend");
    expect(db).toContain("where(and(eq(products.id, productId), eq(products.ownerId, ownerId)))");
    expect(db).toContain('status: "draft"');
  });
  it("oferece curadoria exclusiva da administração", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    expect(router).toContain("products: adminProcedure.query(() => getAdminProducts())");
    expect(router).toContain("updateProductStatus: adminProcedure.input");
  });
  it("registra as telas de produtos dos dois perfis", async () => {
    const app = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    const member = await readFile(path.join(root, "client/src/pages/MemberProducts.tsx"), "utf8");
    const admin = await readFile(path.join(root, "client/src/pages/AdminProducts.tsx"), "utf8");
    expect(app).toContain('path="/membros/produtos" component={MemberProducts}');
    expect(app).toContain('path="/admin/produtos" component={AdminProducts}');
    expect(member).toContain("Cadastrar para revisão");
    expect(admin).toContain("Produtos dos membros");
  });
});
