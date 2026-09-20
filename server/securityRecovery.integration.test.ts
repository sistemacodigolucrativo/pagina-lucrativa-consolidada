import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("recuperação de senha por pergunta secreta", () => {
  it("mantém a resposta secreta como hash em tabela própria", async () => {
    const schema = await readFile(path.join(root, "drizzle/schema.ts"), "utf8");
    const migration = await readFile(path.join(root, "drizzle/migrations/0025_add_user_security_recovery.sql"), "utf8");
    const db = await readFile(path.join(root, "server/db.ts"), "utf8");

    expect(schema).toContain("userSecurityRecovery");
    expect(schema).toContain("securityAnswerHash");
    expect(schema).not.toContain("securityAnswer: varchar");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS `userSecurityRecovery`");
    expect(migration).toContain("UNIQUE KEY `user_security_recovery_user_unique` (`userId`)");
    expect(db).toContain("hashSecurityAnswer");
    expect(db).toContain("securityAnswerHash: await hashSecurityAnswer");
    expect(db).not.toContain("securityAnswer: input.securityAnswer");
  });

  it("expõe configuração protegida e recuperação pública sem retornar hash", async () => {
    const router = await readFile(path.join(root, "server/routers.ts"), "utf8");
    const accountPage = await readFile(path.join(root, "client/src/pages/MemberAccount.tsx"), "utf8");
    const loginPage = await readFile(path.join(root, "client/src/pages/DemoLogin.tsx"), "utf8");
    const personalizationPage = await readFile(path.join(root, "client/src/pages/ApplicationPersonalization.tsx"), "utf8");
    const applications = await readFile(path.join(root, "shared/applications.ts"), "utf8");

    expect(router).toContain("updateSecurityRecovery: protectedProcedure");
    expect(router).toContain("startPasswordRecovery: publicProcedure");
    expect(router).toContain("resetPasswordWithSecurityAnswer: publicProcedure");
    expect(router).not.toContain("securityAnswerHash: publicProcedure");
    expect(accountPage).toContain("Recuperação de acesso");
    expect(accountPage).toContain("Resposta secreta");
    expect(accountPage).toContain("A resposta não será exibida depois de salva");
    expect(loginPage).toContain("Recuperar acesso");
    expect(loginPage).not.toContain("disabled title=\"A recuperação de acesso");
    expect(loginPage).toContain("Pergunta secreta");
    expect(loginPage).toContain("Definir nova senha");
    expect(personalizationPage).toContain("Recuperação de acesso");
    expect(personalizationPage).toContain("securityQuestion");
    expect(personalizationPage).toContain("securityAnswer");
    expect(applications).toContain("securityQuestion");
    expect(applications).toContain("securityAnswer");
  });
});
