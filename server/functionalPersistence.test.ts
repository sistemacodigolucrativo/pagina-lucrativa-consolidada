import { describe, expect, it } from "vitest";
import { resolveDemoAccount, toDemoUser } from "./demoAuth";

describe("identidades locais persistentes", () => {
  it("mantém identificadores estáveis que correspondem às contas da base local", () => {
    const admin = resolveDemoAccount("admin", "123");
    const member = resolveDemoAccount("user", "123");
    expect(admin).toBeDefined();
    expect(member).toBeDefined();
    expect(toDemoUser(admin!).id).toBe(1);
    expect(toDemoUser(member!).id).toBe(2);
    expect(toDemoUser(admin!).role).toBe("admin");
    expect(toDemoUser(member!).role).toBe("user");
  });
});
