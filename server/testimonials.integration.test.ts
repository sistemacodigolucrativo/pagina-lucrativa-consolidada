import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("relatos próprios de membros", () => {
  it("mantém envio autenticado, confirmação de autoria e revisão exclusivamente administrativa", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("authorConfirmed: z.literal(true)");
    expect(router).toContain("testimonials: protectedProcedure.query");
    expect(router).toContain("createTestimonial: protectedProcedure.input");
    expect(router).toContain("testimonials: adminProcedure.query");
    expect(router).toContain("updateTestimonial: adminProcedure.input");
    expect(router).toContain('z.enum(["pending", "approved", "rejected", "archived"])');
  });

  it("registra as rotas dedicadas do membro e da administração", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain('path="/membros/fazer-depoimento" component={MemberTestimonial}');
    expect(app).toContain('path="/admin/relatos" component={AdminTestimonials}');
  });
});
