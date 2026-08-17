import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./cookies";

function request(protocol: "http" | "https", forwardedProto?: string) {
  return {
    protocol,
    headers: forwardedProto ? { "x-forwarded-proto": forwardedProto } : {},
  } as any;
}

describe("getSessionCookieOptions", () => {
  it("uses a browser-compatible Lax cookie for the HTTP IP preview", () => {
    expect(getSessionCookieOptions(request("http"))).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("keeps SameSite=None with Secure for HTTPS and proxied HTTPS", () => {
    expect(getSessionCookieOptions(request("https"))).toMatchObject({
      sameSite: "none",
      secure: true,
    });
    expect(getSessionCookieOptions(request("http", "https"))).toMatchObject({
      sameSite: "none",
      secure: true,
    });
  });
});
