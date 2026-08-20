import { randomUUID } from "node:crypto";
import type { Express, NextFunction, Request, Response } from "express";
import { resolvePublicCampaignAndRecordClick, resolvePublicMemberCampaignAndRecordClick } from "../db";

const appPrefix = (process.env.VITE_DEV_PREFIX ?? "").replace(/\/+$/, "");
const cookiePath = appPrefix || "/";
const cookieNames = { visitor: "pl_visitor", session: "pl_session" } as const;
const memberCampaignRoutes = Array.from(new Set(["/r/:memberSlug/:campaignSlug", appPrefix ? `${appPrefix}/r/:memberSlug/:campaignSlug` : null].filter((route): route is string => Boolean(route))));
const legacyCampaignRoutes = Array.from(new Set(["/:campaignSlug", appPrefix ? `${appPrefix}/:campaignSlug` : null].filter((route): route is string => Boolean(route))));

function readCookie(req: Request, name: string) {
  const raw = req.headers.cookie ?? "";
  const entry = raw.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function getOrCreateCookie(req: Request, res: Response, name: string, maxAge: number) {
  const current = readCookie(req, name);
  const value = current && /^[a-f0-9-]{16,80}$/i.test(current) ? current : randomUUID();
  const secure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const attributes = [`${name}=${encodeURIComponent(value)}`, `Max-Age=${Math.floor(maxAge / 1000)}`, `Path=${cookiePath}`, "HttpOnly", "SameSite=Lax"];
  if (secure) attributes.push("Secure");
  res.append("Set-Cookie", attributes.join("; "));
  return value;
}

function getOrigin(referer: string | undefined) {
  if (!referer) return null;
  try {
    return new URL(referer).origin.slice(0, 255);
  } catch {
    return null;
  }
}

function getDeviceType(userAgent: string) {
  return /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop";
}

function getUserAgentCategory(userAgent: string) {
  return /bot|crawler|spider|slurp|headless/i.test(userAgent) ? "bot" : "human";
}

function getQueryValue(req: Request, key: string) {
  const value = req.query[key];
  return typeof value === "string" ? value.slice(0, 160) : null;
}

function destinationIsAllowed(destinationUrl: string, req: Request) {
  try {
    const destination = new URL(destinationUrl);
    if (!["http:", "https:"].includes(destination.protocol)) return false;
    const allowedHosts = new Set([req.hostname, "ocodigolucrativo.site", "www.ocodigolucrativo.site"]);
    return allowedHosts.has(destination.hostname);
  } catch {
    return false;
  }
}

export function registerCampaignRedirectRoutes(app: Express) {
  const handleCampaignRedirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberSlug = String(req.params.memberSlug ?? "").trim().toLowerCase();
      const campaignSlug = String(req.params.campaignSlug ?? "").trim().toLowerCase();
      if (!/^[a-z0-9-]{3,128}$/.test(memberSlug) || !/^[a-z0-9-]{3,128}$/.test(campaignSlug)) {
        next();
        return;
      }
      const visitorId = getOrCreateCookie(req, res, cookieNames.visitor, 365 * 24 * 60 * 60 * 1000);
      const sessionId = getOrCreateCookie(req, res, cookieNames.session, 30 * 60 * 1000);
      const occurredAt = new Date();
      const userAgent = req.get("user-agent") ?? "";
      const campaign = await resolvePublicMemberCampaignAndRecordClick(memberSlug, campaignSlug, {
        visitorId,
        sessionId,
        occurredAt,
        referrerOrigin: getOrigin(req.get("referer")),
        userAgentCategory: getUserAgentCategory(userAgent),
        deviceType: getDeviceType(userAgent),
        utmSource: getQueryValue(req, "utm_source"),
        utmMedium: getQueryValue(req, "utm_medium"),
        utmCampaign: getQueryValue(req, "utm_campaign"),
        utmContent: getQueryValue(req, "utm_content"),
        landingPath: req.path.slice(0, 512),
      });
      if (!campaign || !destinationIsAllowed(campaign.destinationUrl, req)) {
        next();
        return;
      }
      res.redirect(302, campaign.destinationUrl);
    } catch (error) {
      next(error);
    }
  };

  const handleLegacyCampaignRedirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = String(req.params.campaignSlug ?? "").trim().toLowerCase();
      if (!/^[a-z0-9-]{3,128}$/.test(slug)) {
        next();
        return;
      }
      const visitorId = getOrCreateCookie(req, res, cookieNames.visitor, 365 * 24 * 60 * 60 * 1000);
      const sessionId = getOrCreateCookie(req, res, cookieNames.session, 30 * 60 * 1000);
      const occurredAt = new Date();
      const userAgent = req.get("user-agent") ?? "";
      const campaign = await resolvePublicCampaignAndRecordClick(slug, {
        visitorId,
        sessionId,
        occurredAt,
        referrerOrigin: getOrigin(req.get("referer")),
        userAgentCategory: getUserAgentCategory(userAgent),
        deviceType: getDeviceType(userAgent),
        utmSource: getQueryValue(req, "utm_source"),
        utmMedium: getQueryValue(req, "utm_medium"),
        utmCampaign: getQueryValue(req, "utm_campaign"),
        utmContent: getQueryValue(req, "utm_content"),
        landingPath: req.path.slice(0, 512),
      });
      if (!campaign || !destinationIsAllowed(campaign.destinationUrl, req)) {
        next();
        return;
      }
      res.redirect(302, campaign.destinationUrl);
    } catch (error) {
      next(error);
    }
  };

  for (const route of memberCampaignRoutes) app.get(route, handleCampaignRedirect);
  for (const route of legacyCampaignRoutes) app.get(route, handleLegacyCampaignRedirect);
}
