import { describe, expect, it } from "vitest";
import { createDemoSession, resolveDemoAccount, resolveDemoSession } from "./demoAuth";

describe("resolveDemoAccount", () => {
  it("reconhece a conta administrativa local", () => {
    expect(resolveDemoAccount("admin", "123")).toMatchObject({
      openId: "local_demo_admin",
      role: "admin",
    });
  });

  it("reconhece a conta de membro local", () => {
    expect(resolveDemoAccount("user", "123")).toMatchObject({
      openId: "local_demo_member",
      role: "user",
    });
  });

  it("recusa combinações incorretas", () => {
    expect(resolveDemoAccount("admin", "senha-incorreta")).toBeNull();
    expect(resolveDemoAccount("desconhecido", "123")).toBeNull();
  });

  it("emite uma sessão local resolvida sem banco de dados ou OAuth", () => {
    const account = resolveDemoAccount("admin", "123");
    const token = createDemoSession(account!);

    expect(resolveDemoSession(token)).toMatchObject({
      openId: "local_demo_admin",
      role: "admin",
      loginMethod: "local_demo",
    });
  });
});
