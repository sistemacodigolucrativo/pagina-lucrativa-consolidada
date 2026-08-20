import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolvePublicCampaignAndRecordClick: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { registerCampaignRedirectRoutes } from "./_core/campaignRedirect";

describe("campaign redirect route", () => {
  function getHandler() {
    const routes: Array<{ path: string; handler: Function }> = [];
    const app = { get: (path: string, handler: Function) => routes.push({ path, handler }) };
    registerCampaignRedirectRoutes(app as never);
    return routes[0];
  }

  it("resolves the slug, records the click and redirects to the configured destination", async () => {
    mocks.resolvePublicCampaignAndRecordClick.mockResolvedValueOnce({ destinationUrl: "https://example.com/landing" });
    const route = getHandler();
    const response = { redirect: vi.fn() };
    const next = vi.fn();

    await route.handler({ params: { campaignSlug: "facebook-acess" } }, response, next);

    expect(mocks.resolvePublicCampaignAndRecordClick).toHaveBeenCalledWith("facebook-acess");
    expect(response.redirect).toHaveBeenCalledWith(302, "https://example.com/landing");
    expect(next).not.toHaveBeenCalled();
  });

  it("passes unknown slugs to the application fallback", async () => {
    mocks.resolvePublicCampaignAndRecordClick.mockResolvedValueOnce(null);
    const route = getHandler();
    const response = { redirect: vi.fn() };
    const next = vi.fn();

    await route.handler({ params: { campaignSlug: "missing-campaign" } }, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.redirect).not.toHaveBeenCalled();
  });
});
