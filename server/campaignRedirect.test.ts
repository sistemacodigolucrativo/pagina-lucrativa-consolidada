import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolvePublicCampaignAndRecordClick: vi.fn(),
  resolvePublicMemberCampaignAndRecordClick: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { registerCampaignRedirectRoutes } from "./_core/campaignRedirect";

type Route = { path: string; handler: Function };

function getRoutes() {
  const routes: Route[] = [];
  const app = { get: (path: string, handler: Function) => routes.push({ path, handler }) };
  registerCampaignRedirectRoutes(app as never);
  return routes;
}

function request(params: Record<string, string>, path: string) {
  return {
    params,
    path,
    hostname: "ocodigolucrativo.site",
    secure: true,
    headers: { cookie: "", "x-forwarded-proto": "https" },
    query: {},
    get: (name: string) => name.toLowerCase() === "user-agent" ? "Mozilla/5.0" : undefined,
  };
}

describe("campaign redirect route", () => {
  it("resolves a member campaign, records metadata and keeps the sponsor visible on the landing page", async () => {
    mocks.resolvePublicMemberCampaignAndRecordClick.mockResolvedValueOnce({ destinationUrl: "https://ocodigolucrativo.site/dev/", status: "active" });
    const route = getRoutes().find(item => item.path.endsWith("/r/:memberSlug/:campaignSlug"));
    expect(route).toBeDefined();
    const response = { redirect: vi.fn(), append: vi.fn() };
    const next = vi.fn();

    await route!.handler(request({ memberSlug: "marcelo", campaignSlug: "facebook-acess" }, "/r/marcelo/facebook-acess"), response, next);

    expect(mocks.resolvePublicMemberCampaignAndRecordClick).toHaveBeenCalledWith(
      "marcelo",
      "facebook-acess",
      expect.objectContaining({ visitorId: expect.any(String), sessionId: expect.any(String), deviceType: "desktop", userAgentCategory: "human" }),
    );
    expect(response.append).toHaveBeenCalledTimes(2);
    expect(response.redirect).toHaveBeenCalledWith(302, "https://ocodigolucrativo.site/dev/?afiliado=marcelo&pl_ref=campaign");
    expect(next).not.toHaveBeenCalled();
  });

  it("overrides stale affiliate query params on member campaign redirects", async () => {
    mocks.resolvePublicMemberCampaignAndRecordClick.mockResolvedValueOnce({ destinationUrl: "https://ocodigolucrativo.site/dev/?afiliado=outro", status: "active" });
    const route = getRoutes().find(item => item.path.endsWith("/r/:memberSlug/:campaignSlug"));
    const response = { redirect: vi.fn(), append: vi.fn() };
    const next = vi.fn();

    await route!.handler(request({ memberSlug: "marcelo", campaignSlug: "facebook-acess" }, "/r/marcelo/facebook-acess"), response, next);

    expect(response.redirect).toHaveBeenCalledWith(302, "https://ocodigolucrativo.site/dev/?afiliado=marcelo&pl_ref=campaign");
    expect(next).not.toHaveBeenCalled();
  });

  it("keeps the legacy slug route functional", async () => {
    mocks.resolvePublicCampaignAndRecordClick.mockResolvedValueOnce({ destinationUrl: "https://ocodigolucrativo.site/dev/", status: "active" });
    const route = getRoutes().find(item => item.path === "/:campaignSlug");
    expect(route).toBeDefined();
    const response = { redirect: vi.fn(), append: vi.fn() };
    const next = vi.fn();

    await route!.handler(request({ campaignSlug: "facebook-acess" }, "/facebook-acess"), response, next);

    expect(mocks.resolvePublicCampaignAndRecordClick).toHaveBeenCalledWith("facebook-acess", expect.objectContaining({ visitorId: expect.any(String) }));
    expect(response.redirect).toHaveBeenCalledWith(302, "https://ocodigolucrativo.site/dev/");
    expect(next).not.toHaveBeenCalled();
  });

  it("passes unknown slugs to the application fallback", async () => {
    mocks.resolvePublicCampaignAndRecordClick.mockResolvedValueOnce(null);
    const route = getRoutes().find(item => item.path === "/:campaignSlug");
    expect(route).toBeDefined();
    const response = { redirect: vi.fn(), append: vi.fn() };
    const next = vi.fn();

    await route!.handler(request({ campaignSlug: "missing-campaign" }, "/missing-campaign"), response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.redirect).not.toHaveBeenCalled();
  });

  it("does not redirect to an external destination", async () => {
    mocks.resolvePublicMemberCampaignAndRecordClick.mockResolvedValueOnce({ destinationUrl: "https://example.com/landing", status: "active" });
    const route = getRoutes().find(item => item.path.endsWith("/r/:memberSlug/:campaignSlug"));
    expect(route).toBeDefined();
    const response = { redirect: vi.fn(), append: vi.fn() };
    const next = vi.fn();

    await route!.handler(request({ memberSlug: "marcelo", campaignSlug: "facebook-acess" }, "/r/marcelo/facebook-acess"), response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.redirect).not.toHaveBeenCalled();
  });
});
