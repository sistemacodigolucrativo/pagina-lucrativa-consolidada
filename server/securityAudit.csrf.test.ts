import express from "express";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { assertCsrfConfiguration, csrfProtection } from "./_core/csrf";

describe("HIGH-02: CSRF por HTTP real, antes de REST/tRPC", () => {
  let server: Server, base: string, mutations = 0;
  beforeAll(async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PUBLIC_APP_ORIGIN", "https://app.example.test");
    const app = express();
    app.use(csrfProtection);
    for (const route of ["/api/admin/test", "/api/trpc/member.test", "/dev/api/trpc/member.test"]) {
      app.all(route, (_req, res) => { mutations++; res.json({ success: true }); });
    }
    server = await new Promise<Server>(resolve => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });
    base = `http://127.0.0.1:${(server.address() as any).port}`;
  });
  afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())); vi.unstubAllEnvs(); });

  it.each(["POST", "DELETE", "PATCH", "PUT"])("bloqueia %s cross-site sem executar o handler", async method => {
    const before = mutations;
    const res = await fetch(`${base}/api/admin/test`, { method, headers: { origin: "https://attacker.example", cookie: "pl_demo_session=irrelevant" } });
    expect(res.status).toBe(403);
    expect(mutations).toBe(before);
  });
  it.each([undefined, "null", "https://app.example.test.attacker.test", "http://app.example.test"])("recusa origem ausente, nula, sufixo ou protocolo errado #%#", async origin => {
    const headers: Record<string, string> = { "x-forwarded-host": "attacker.test" };
    if (origin) headers.origin = origin;
    expect((await fetch(`${base}/api/trpc/member.test`, { method: "POST", headers })).status).toBe(403);
  });
  it.each(["/api/admin/test", "/api/trpc/member.test", "/dev/api/trpc/member.test"])("aceita origem exata em %s", async route => {
    expect((await fetch(`${base}${route}`, { method: "POST", headers: { origin: "https://app.example.test" } })).status).toBe(200);
  });
  it("aceita Referer válido quando Origin ausente; Origin inválido não usa fallback", async () => {
    const headers = { referer: "https://app.example.test/account" };
    expect((await fetch(`${base}/api/admin/test`, { method: "DELETE", headers })).status).toBe(200);
    expect((await fetch(`${base}/api/admin/test`, { method: "DELETE", headers: { ...headers, origin: "null" } })).status).toBe(403);
  });
  it("exige origem explícita em produção e permite leituras GET", async () => {
    expect((await fetch(`${base}/api/admin/test`)).status).toBe(200);
    expect(assertCsrfConfiguration).not.toThrow();
    vi.stubEnv("PUBLIC_APP_ORIGIN", "");
    expect(assertCsrfConfiguration).toThrow(/PUBLIC_APP_ORIGIN/);
    vi.stubEnv("PUBLIC_APP_ORIGIN", "https://app.example.test");
  });
});
