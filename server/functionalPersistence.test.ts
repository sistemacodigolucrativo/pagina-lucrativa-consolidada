import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  authenticateLocalUser: vi.fn(),
  getStoredPasswordHashByOpenId: vi.fn(),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

import { resolveDemoAccount, toDemoUser } from "./demoAuth";

describe("identidades locais persistentes", () => {
  beforeEach(() => vi.stubEnv("ENABLE_LOCAL_AUTH", "true"));
  afterEach(() => vi.unstubAllEnvs());
  it("mantém identificadores estáveis que correspondem às contas da base local", async () => {
    const admin = await resolveDemoAccount("admin", "123");
    const member = await resolveDemoAccount("user", "123");
    expect(admin).toBeDefined();
    expect(member).toBeDefined();
    expect(toDemoUser(admin!).id).toBe(1);
    expect(toDemoUser(member!).id).toBe(2);
    expect(toDemoUser(admin!).role).toBe("admin");
    expect(toDemoUser(member!).role).toBe("user");
  });
});
