import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { resolveDatabaseConfig } from "../shared/databaseConfig.mjs";

const state = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("./db", () => ({ getDb: async () => ({ execute: state.execute }) }));
import { registerDatabaseHealth } from "./_core/databaseHealth";

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("HIGH-05: seleção explícita do banco", () => {
  it.each([undefined, "false", "1"])("recusa produção sem URL e sem opt-in válido (%s)", flag => {
    expect(() => resolveDatabaseConfig({ NODE_ENV: "production", ALLOW_VPS_SOCKET_DB: flag, REMOTE_DATABASE_URL: "mysql://example.invalid/db" }))
      .toThrow("DATABASE_URL é obrigatória");
  });
  it("permite ambiente de desenvolvimento sem banco, mas scripts continuam exigindo configuração", () => {
    expect(resolveDatabaseConfig({}, { allowDisabled: true })).toEqual({ mode: "disabled", connection: null });
    expect(() => resolveDatabaseConfig({})).toThrow();
    expect(() => resolveDatabaseConfig({ NODE_ENV: "production" }, { allowDisabled: true })).toThrow();
  });
  it("prioriza URL explícita e permite socket somente com opt-in", () => {
    const url = "mysql://user:secret@example.invalid/catalog";
    expect(resolveDatabaseConfig({ DATABASE_URL: url, ALLOW_VPS_SOCKET_DB: "true" })).toEqual({ mode: "url", connection: url });
    expect(resolveDatabaseConfig({ NODE_ENV: "production", ALLOW_VPS_SOCKET_DB: "true", MYSQL_SOCKET: "/tmp/mysql.sock", MYSQL_USER: "app", MYSQL_DATABASE: "catalog" }))
      .toEqual({ mode: "socket", connection: { socketPath: "/tmp/mysql.sock", user: "app", database: "catalog" } });
    expect(() => resolveDatabaseConfig({ ALLOW_VPS_SOCKET_DB: "true", MYSQL_SOCKET: "relative.sock" })).toThrow();
  });
  it.each(["not-a-url:credential", "https://user:secret@example.invalid/db", "mysql://user:secret@example.invalid/"])("rejeita URL inválida sem revelar credencial", url => {
    expect(() => resolveDatabaseConfig({ DATABASE_URL: url })).toThrow("DATABASE_URL inválida");
    try { resolveDatabaseConfig({ DATABASE_URL: url }); } catch (error) { expect(String(error)).not.toContain("secret"); }
  });
  it("health verifica SELECT real do driver e falha sem revelar diagnóstico ou URL", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://user:secret@example.invalid/catalog");
    const app = express();
    registerDatabaseHealth(app, "/dev");
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>(resolve => server.once("listening", resolve));
    const port = (server.address() as { port: number }).port;
    try {
      state.execute.mockResolvedValueOnce([{ value: 1 }]);
      const good = await fetch(`http://127.0.0.1:${port}/dev/api/healthz`);
      expect(good.status).toBe(200);
      expect(await good.json()).toEqual({ status: "ok", database: "url" });
      expect(state.execute).toHaveBeenCalledOnce();
      state.execute.mockRejectedValueOnce(new Error("secret driver details"));
      const failed = await fetch(`http://127.0.0.1:${port}/api/healthz`);
      expect(failed.status).toBe(503);
      expect(await failed.json()).toEqual({ status: "unavailable" });
    } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
  });
});
