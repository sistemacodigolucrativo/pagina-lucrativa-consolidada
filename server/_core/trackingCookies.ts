import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";

const appPrefix = (process.env.VITE_DEV_PREFIX ?? "").replace(/\/+$/, "");
const cookiePath = appPrefix || "/";

export const trackingCookieNames = { visitor: "pl_visitor", session: "pl_session" } as const;

export function readTrackingCookie(req: Request, name: string) {
  const raw = req.headers.cookie ?? "";
  const entry = raw.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

export function getOrCreateTrackingCookie(req: Request, res: Response, name: string, maxAge: number) {
  const current = readTrackingCookie(req, name);
  const value = current && /^[a-f0-9-]{16,80}$/i.test(current) ? current : randomUUID();
  const secure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const attributes = [`${name}=${encodeURIComponent(value)}`, `Max-Age=${Math.floor(maxAge / 1000)}`, `Path=${cookiePath}`, "HttpOnly", "SameSite=Lax"];
  if (secure) attributes.push("Secure");
  res.append("Set-Cookie", attributes.join("; "));
  return value;
}

export function getTrackingOrigin(referer: string | undefined) {
  if (!referer) return null;
  try {
    return new URL(referer).origin.slice(0, 255);
  } catch {
    return null;
  }
}

export function getTrackingDeviceType(userAgent: string) {
  return /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop";
}

export function getTrackingUserAgentCategory(userAgent: string) {
  return /bot|crawler|spider|slurp|headless/i.test(userAgent) ? "bot" : "human";
}

export function getTrackingQueryValue(req: Request, key: string) {
  const value = req.query[key];
  return typeof value === "string" ? value.slice(0, 160) : null;
}
