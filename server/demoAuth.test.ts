import { describe, expect, it } from "vitest";
import { createDemoSession, resolveDemoAccount, resolveDemoSession } from "./demoAuth";

describe("resolveDemoAccount", () => {
  it("reconhece a conta administrativa local", async () => {
    expect(await resolveDemoAccount("admin", "123")).toMatchObject({ openId: "local_demo_admin", role: "admin" });
  });

  it("reconhece a conta de membro local", async () => {
    expect(await resolveDemoAccount("user", "123")).toMatchObject({ openId: "local_demo_member", role: "user" });
  });

  it("recusa combinações incorretas", async () => {
    expect(await resolveDemoAccount("admin", "senha-incorreta")).toBeNull();
    expect(await resolveDemoAccount("desconhecido", "123")).toBeNull();
  });

  it("emite uma sessão local resolvida sem OAuth", async () => {
    const account = await resolveDemoAccount("admin", "123");
    const token = createDemoSession(account!);
    expect(resolveDemoSession(token)).toMatchObject({ openId: "local_demo_admin", role: "admin", loginMethod: "local_demo" });
  });
});
