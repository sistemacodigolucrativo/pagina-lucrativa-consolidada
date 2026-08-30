import { beforeEach, describe, expect, it, vi } from "vitest";

const demoMocks = vi.hoisted(() => ({
  resolveDemoSession: vi.fn(),
}));

vi.mock("./demoAuth", () => ({
  DEMO_SESSION_COOKIE_NAME: "pl_demo_session",
  resolveDemoSession: demoMocks.resolveDemoSession,
}));

import { createContext } from "./_core/context";

const demoUser = {
  id: 2,
  openId: "local_demo_member",
  name: "Membro Código Lucrativo",
  email: "membro@pagina-lucrativa.local",
  loginMethod: "local_demo",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function options() {
  return { req: { headers: { cookie: "pl_demo_session=demo-token" } }, res: {} } as any;
}

describe("createContext session source", () => {
  beforeEach(() => vi.resetAllMocks());

  it("resolves a valid local user-and-password session", async () => {
    demoMocks.resolveDemoSession.mockReturnValue(demoUser);

    const context = await createContext(options());

    expect(context.user?.openId).toBe("local_demo_member");
    expect(context.authSource).toBe("demo");
  });

  it("treats a request without a local session as unauthenticated", async () => {
    demoMocks.resolveDemoSession.mockReturnValue(null);

    const context = await createContext(options());

    expect(context.user).toBeNull();
    expect(context.authSource).toBeNull();
  });
});
