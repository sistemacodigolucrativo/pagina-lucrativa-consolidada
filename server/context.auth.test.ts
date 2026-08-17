import { beforeEach, describe, expect, it, vi } from "vitest";

const sdkMocks = vi.hoisted(() => ({
  authenticateDemoRequest: vi.fn(),
  authenticateRequest: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  sdk: sdkMocks,
}));

import { createContext } from "./_core/context";

const demoUser = {
  id: 2,
  openId: "local_demo_member",
  name: "Membro de demonstração",
  email: "membro.demo@pagina-lucrativa.local",
  loginMethod: "local_demo",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const manusUser = {
  ...demoUser,
  id: 3,
  openId: "manus-user",
  loginMethod: "manus",
};

function options() {
  return { req: { headers: {} }, res: {} } as any;
}

describe("createContext session source", () => {
  beforeEach(() => vi.resetAllMocks());

  it("prioritizes the separate demo session when both modes can resolve", async () => {
    sdkMocks.authenticateDemoRequest.mockResolvedValue(demoUser);
    sdkMocks.authenticateRequest.mockResolvedValue(manusUser);

    const context = await createContext(options());

    expect(context.user?.openId).toBe("local_demo_member");
    expect(context.authSource).toBe("demo");
    expect(sdkMocks.authenticateRequest).not.toHaveBeenCalled();
  });

  it("falls back to Manus when a demo session is absent", async () => {
    sdkMocks.authenticateDemoRequest.mockRejectedValue(new Error("no demo session"));
    sdkMocks.authenticateRequest.mockResolvedValue(manusUser);

    const context = await createContext(options());

    expect(context.user?.openId).toBe("manus-user");
    expect(context.authSource).toBe("manus");
  });
});
