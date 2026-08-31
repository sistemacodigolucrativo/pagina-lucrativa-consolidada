import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  authenticateLocalUser: vi.fn(),
  getStoredPasswordHashByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { createDemoSession, resolveDemoAccount, resolveDemoSession } from "./demoAuth";

describe("resolveDemoAccount", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dbMocks.upsertUser.mockResolvedValue(undefined);
  });

  it("reconhece a conta administrativa local", async () => {
    expect(await resolveDemoAccount("admin", "123")).toMatchObject({ openId: "local_demo_admin", role: "admin" });
    expect(dbMocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "local_demo_admin", role: "admin" }));
  });

  it("reconhece a conta de membro local", async () => {
    expect(await resolveDemoAccount("user", "123")).toMatchObject({ openId: "local_demo_member", role: "user" });
    expect(dbMocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "local_demo_member", role: "user" }));
  });

  it("recusa combinações incorretas", async () => {
    expect(await resolveDemoAccount("admin", "senha-incorreta")).toBeNull();
    expect(await resolveDemoAccount("desconhecido", "123")).toBeNull();
  });

  it("emite uma sessão local assinada que não depende da memória do processo", async () => {
    const account = await resolveDemoAccount("admin", "123");
    const token = createDemoSession(account!);
    expect(token.split(".")).toHaveLength(2);
    expect(resolveDemoSession(token)).toMatchObject({ openId: "local_demo_admin", role: "admin", loginMethod: "local_demo" });
    expect(resolveDemoSession(`${token}invalid`)).toBeNull();
  });
});
