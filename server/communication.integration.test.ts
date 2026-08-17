import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("fluxo de comunicação preparada", () => {
  it("mantém canais de convite do membro e supervisão administrativa protegida", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("createInvitation");
    expect(router).toContain("invitations: adminProcedure.query");
    expect(router).toContain("updateInvitation: adminProcedure.input");
    expect(router).toContain('z.enum(["prepared", "cancelled"])');
  });

  it("registra as rotas de comunicação do membro e da administração", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain('path="/membros/emails-site" component={MemberCommunications}');
    expect(app).toContain('path="/membros/emails-interessados" component={MemberCommunications}');
    expect(app).toContain('path="/membros/emails-whatsapp" component={MemberCommunications}');
    expect(app).toContain('path="/admin/comunicacoes" component={AdminCommunications}');
  });
});
