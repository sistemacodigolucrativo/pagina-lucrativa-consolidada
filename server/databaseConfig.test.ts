import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./_core/env";

describe("configuração de banco em produção", () => {
  const source = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

  it("falha explicitamente em produção sem DATABASE_URL e limita socket ao desenvolvimento", () => {
    expect(source).toContain("!ENV.databaseUrl && ENV.isProduction");
    expect(source).toContain("DATABASE_URL é obrigatório em produção para conectar ao banco.");
    expect(source).toContain("!ENV.isProduction && existsSync(VPS_SOCKET_PATH)");
    expect(source).toContain("if (ENV.isProduction) throw error;");
  });

  it("prioriza DATABASE_URL e usa REMOTE_DATABASE_URL quando a configuração MYSQL do Preview está incompleta", () => {
    expect(resolveDatabaseUrl({
      databaseUrl: "mysql://production/db",
      previewDatabaseUrl: "",
      remoteDatabaseUrl: "mysql://remote/db",
      isProduction: false,
    })).toBe("mysql://production/db");
    expect(resolveDatabaseUrl({
      previewDatabaseUrl: "",
      remoteDatabaseUrl: "mysql://remote/db",
      isProduction: false,
    })).toBe("mysql://remote/db");
  });

  it("não usa os fallbacks do Preview em produção", () => {
    expect(resolveDatabaseUrl({
      previewDatabaseUrl: "mysql://preview/db",
      remoteDatabaseUrl: "mysql://remote/db",
      isProduction: true,
    })).toBe("");
  });
});
