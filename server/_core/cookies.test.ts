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

  it("uses SameSite=Lax with Secure for HTTPS and proxied HTTPS", () => {
    expect(getSessionCookieOptions(request("https"))).toMatchObject({
      sameSite: "lax",
      secure: true,
    });
    expect(getSessionCookieOptions(request("http", "https"))).toMatchObject({
      sameSite: "lax",
      secure: true,
    });
  });

  it("isolates development sessions under the /dev path", () => {
    const previousPrefix = process.env.VITE_DEV_PREFIX;
    process.env.VITE_DEV_PREFIX = "/dev";
    expect(getSessionCookieOptions(request("https"))).toMatchObject({ path: "/dev" });
    if (previousPrefix === undefined) delete process.env.VITE_DEV_PREFIX;
    else process.env.VITE_DEV_PREFIX = previousPrefix;
  });
});
