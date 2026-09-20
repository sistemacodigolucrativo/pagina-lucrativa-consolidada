import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { MySqlDialect } from "drizzle-orm/mysql-core";

const state = vi.hoisted(() => ({ user: null as any, rows: [] as any[], selection: null as any, where: null as any, resolve: vi.fn() }));
vi.mock("./demoAuth", () => ({ DEMO_SESSION_COOKIE_NAME: "session", resolveDemoSession: state.resolve }));
vi.mock("./_core/env", () => ({ ENV: { databaseUrl: "mysql://test.invalid/catalog", isProduction: false } }));
vi.mock("drizzle-orm/mysql2", () => ({ drizzle: () => ({ select: (selection: any) => {
  state.selection = selection;
  const query = { where: (where: any) => { state.where = where; return query; }, orderBy: async () => state.rows };
  return { from: () => query };
} }) }));
import { registerDeployStatus } from "./_core/deployStatus";
import { getAdminPublicSalesSectionImages, getPublicSalesSectionImages } from "./db";

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("MED-05/MED-06: superfícies públicas", () => {
  it("status detalhado recusa visitante/membro e atende admin com sessão atual", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deploy-status-"));
    const file = path.join(root, "status.json");
    await writeFile(file, JSON.stringify({ status: "deploying", sha: "a".repeat(40), stage: "privado", progress: 50 }));
    vi.stubEnv("DEPLOY_STATUS_FILE", file);
    const app = express(); registerDeployStatus(app, "/dev");
    const server = app.listen(0, "127.0.0.1"); await new Promise<void>(resolve => server.once("listening", resolve));
    const port = (server.address() as { port: number }).port;
    try {
      for (const [user, status] of [[null, 403], [{ id: 1, role: "user" }, 403], [{ id: 2, role: "admin" }, 200]] as const) {
        state.resolve.mockResolvedValue(user);
        const response = await fetch(`http://127.0.0.1:${port}/dev/api/deploy-status`, { headers: { cookie: "session=test-session" } });
        expect(response.status).toBe(status);
        const body = await response.json();
        if (status === 200) expect(body).toMatchObject({ sha: "a".repeat(40), stage: "privado", progress: 50 });
        else expect(body).not.toHaveProperty("sha");
      }
      expect(state.resolve).toHaveBeenCalledWith("test-session");
      state.resolve.mockRejectedValue(new Error("internal details"));
      const failed = await fetch(`http://127.0.0.1:${port}/api/deploy-status`);
      expect(failed.status).toBe(503); expect(await failed.text()).not.toContain("internal details");
    } finally { await new Promise<void>(resolve => server.close(() => resolve())); await rm(root, { recursive: true }); }
  });
  it("retorna URL apenas de imagem ativa, preserva marcador de remoção e histórico administrativo", async () => {
    state.rows = [
      { sectionId: "active", status: "active", imageUrl: "/visible.png", originalName: "private-original", createdBy: 90 },
      { sectionId: "removed", status: "removed", imageUrl: "/removed.png", originalName: "removed-original", createdBy: 90 },
    ];
    expect(await getPublicSalesSectionImages()).toEqual([
      { sectionId: "active", status: "active", imageUrl: "/visible.png" },
      { sectionId: "removed", status: "removed", imageUrl: null },
    ]);
    expect(Object.keys(state.selection)).toEqual(["sectionId", "status", "imageUrl"]);
    const dialect = new MySqlDialect();
    expect(dialect.sqlToQuery(state.selection.imageUrl).sql).toContain("ELSE NULL END");
    expect(dialect.sqlToQuery(state.where).params).toEqual(["active", "removed"]);
    expect(await getAdminPublicSalesSectionImages()).toEqual(state.rows);
  });
});
