import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recordPublicAffiliateLinkClick: vi.fn(),
  resolveDefaultAffiliateProfile: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { registerAffiliateLinkTracking } from "./_core/affiliateLinkTracking";

function getHandler() {
  let handler: Function | null = null;
  registerAffiliateLinkTracking({ use: (fn: Function) => { handler = fn; } } as never);
  if (!handler) throw new Error("Middleware não registrado.");
  return handler;
}

function request(query: Record<string, string>) {
  return {
    method: "GET",
    path: "/",
    originalUrl: "/?afiliado=marcelo",
    query,
    secure: true,
    headers: { cookie: "", "x-forwarded-proto": "https" },
    get: (name: string) => name.toLowerCase() === "user-agent" ? "Mozilla/5.0" : undefined,
  };
}

describe("affiliate link tracking", () => {
  beforeEach(() => {
    mocks.recordPublicAffiliateLinkClick.mockReset();
    mocks.resolveDefaultAffiliateProfile.mockReset();
  });

  it("does not duplicate affiliate clicks already recorded as campaign traffic", async () => {
    const handler = getHandler();
    const response = { append: vi.fn() };
    const next = vi.fn();

    await handler(request({ afiliado: "marcelo", pl_ref: "campaign" }), response, next);

    expect(mocks.recordPublicAffiliateLinkClick).not.toHaveBeenCalled();
    expect(response.append).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("records regular affiliate landing clicks", async () => {
    mocks.recordPublicAffiliateLinkClick.mockResolvedValueOnce({ userId: 1 });
    const handler = getHandler();
    const response = { append: vi.fn() };
    const next = vi.fn();

    await handler(request({ afiliado: "marcelo" }), response, next);

    expect(mocks.recordPublicAffiliateLinkClick).toHaveBeenCalledWith("marcelo", expect.objectContaining({
      visitorId: expect.any(String),
      sessionId: expect.any(String),
      deviceType: "desktop",
      userAgentCategory: "human",
    }));
    expect(response.append).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledOnce();
  });

  it("records pure-domain clicks for the global admin default affiliate when available", async () => {
    mocks.resolveDefaultAffiliateProfile.mockResolvedValueOnce({ userId: 9, slug: "admin-global" });
    mocks.recordPublicAffiliateLinkClick.mockResolvedValueOnce({ userId: 9 });
    const handler = getHandler();
    const response = { append: vi.fn() };
    const next = vi.fn();

    await handler({ ...request({}), originalUrl: "/" }, response, next);

    expect(mocks.resolveDefaultAffiliateProfile).toHaveBeenCalledOnce();
    expect(mocks.recordPublicAffiliateLinkClick).toHaveBeenCalledWith("admin-global", expect.objectContaining({
      visitorId: expect.any(String),
      sessionId: expect.any(String),
      landingPath: "/",
    }));
    expect(response.append).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledOnce();
  });

  it("does not replace an invalid explicit affiliate parameter with the admin default", async () => {
    mocks.resolveDefaultAffiliateProfile.mockResolvedValueOnce({ userId: 9, slug: "admin-global" });
    const handler = getHandler();
    const response = { append: vi.fn() };
    const next = vi.fn();

    await handler({ ...request({ afiliado: "slug invalido" }), originalUrl: "/?afiliado=slug%20invalido" }, response, next);

    expect(mocks.resolveDefaultAffiliateProfile).not.toHaveBeenCalled();
    expect(mocks.recordPublicAffiliateLinkClick).not.toHaveBeenCalled();
    expect(response.append).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
