import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("configuração de banco em produção", () => {
  const source = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

  it("falha explicitamente em produção sem DATABASE_URL e limita socket ao desenvolvimento", () => {
    expect(source).toContain("!ENV.databaseUrl && ENV.isProduction");
    expect(source).toContain("DATABASE_URL é obrigatório em produção para conectar ao banco.");
    expect(source).toContain("!ENV.isProduction && existsSync(VPS_SOCKET_PATH)");
    expect(source).toContain("if (ENV.isProduction) throw error;");
  });
});
