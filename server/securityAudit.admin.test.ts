import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appendAdminAudit, beginAdminMutation } from "./_core/adminAudit";
import { createDemoSession, DEMO_SESSION_COOKIE_NAME } from "./demoAuth";

describe("HIGH-07: autenticação recente e trilha administrativa", () => {
  let directory: string;
  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "audit-test-"));
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ENABLE_LOCAL_AUTH", "true");
    vi.stubEnv("SECURITY_AUDIT_DIR", directory);
  });
  afterEach(async () => { vi.useRealTimers(); vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); });

  it("registra ator, operação e resultado sem gravar cookie ou credencial", async () => {
    const token = createDemoSession({ id: 40, openId: "real-admin", role: "admin", username: "test", name: "Admin", email: "admin@example.test", loginMethod: "password" });
    const req = { headers: { cookie: `${DEMO_SESSION_COOKIE_NAME}=${token}` } } as any;
    const event = await beginAdminMutation(req, 40, "admin.reviewReceipt");
    await appendAdminAudit({ ...event, phase: "completed" });
    const body = await readFile(path.join(directory, (await readdir(directory))[0]), "utf8");
    const rows = body.trim().split("\n").map(line => JSON.parse(line));
    expect(rows.map(row => row.phase)).toEqual(["started", "completed"]);
    expect(rows.every(row => row.actorId === 40)).toBe(true);
    expect(body).not.toContain(token);
    expect(body).not.toContain("admin@example.test");
    vi.useFakeTimers(); vi.setSystemTime(Date.now() + 16 * 60_000);
    await expect(beginAdminMutation(req, 40, "admin.reviewReceipt")).rejects.toThrow(/Entre novamente/);
  });
  it("recusa operação antes de executá-la quando não há sessão recente", async () => {
    await expect(beginAdminMutation({ headers: {} } as any, 40, "admin.deleteMember")).rejects.toThrow();
    expect(await readdir(directory)).toEqual([]);
  });
  it("recusa produção sem diretório persistente configurado", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("SECURITY_AUDIT_DIR", "");
    await expect(appendAdminAudit({ requestId: "test", actorId: 40, action: "delete", phase: "started" })).rejects.toThrow(/SECURITY_AUDIT_DIR/);
  });
});
