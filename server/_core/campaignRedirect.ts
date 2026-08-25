import type { Express, NextFunction, Request, Response } from "express";
import { resolvePublicCampaignAndRecordClick, resolvePublicMemberCampaignAndRecordClick } from "../db";
import {
  getOrCreateTrackingCookie,
  getTrackingDeviceType,
  getTrackingOrigin,
  getTrackingQueryValue,
  getTrackingUserAgentCategory,
  trackingCookieNames,
} from "./trackingCookies";

const appPrefix = (process.env.VITE_DEV_PREFIX ?? "").replace(/\/+$/, "");
const memberCampaignRoutes = Array.from(new Set(["/r/:memberSlug/:campaignSlug", appPrefix ? `${appPrefix}/r/:memberSlug/:campaignSlug` : null].filter((route): route is string => Boolean(route))));
const legacyCampaignRoutes = Array.from(new Set(["/:campaignSlug", appPrefix ? `${appPrefix}/:campaignSlug` : null].filter((route): route is string => Boolean(route))));
const affiliateLandingPaths = new Set(["/", "/dev", "/dev/", appPrefix || null, appPrefix ? `${appPrefix}/` : null].filter((path): path is string => Boolean(path)));

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

function withCampaignAffiliate(destinationUrl: string, memberSlug: string) {
  const destination = new URL(destinationUrl);
  if (!affiliateLandingPaths.has(destination.pathname)) return destinationUrl;
  destination.searchParams.set("afiliado", memberSlug);
  destination.searchParams.set("pl_ref", "campaign");
  return destination.toString();
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
      const visitorId = getOrCreateTrackingCookie(req, res, trackingCookieNames.visitor, 365 * 24 * 60 * 60 * 1000);
      const sessionId = getOrCreateTrackingCookie(req, res, trackingCookieNames.session, 30 * 60 * 1000);
      const occurredAt = new Date();
      const userAgent = req.get("user-agent") ?? "";
      const campaign = await resolvePublicMemberCampaignAndRecordClick(memberSlug, campaignSlug, {
        visitorId,
        sessionId,
        occurredAt,
        referrerOrigin: getTrackingOrigin(req.get("referer")),
        userAgentCategory: getTrackingUserAgentCategory(userAgent),
        deviceType: getTrackingDeviceType(userAgent),
        utmSource: getTrackingQueryValue(req, "utm_source"),
        utmMedium: getTrackingQueryValue(req, "utm_medium"),
        utmCampaign: getTrackingQueryValue(req, "utm_campaign"),
        utmContent: getTrackingQueryValue(req, "utm_content"),
        landingPath: req.path.slice(0, 512),
      });
      if (!campaign || !destinationIsAllowed(campaign.destinationUrl, req)) {
        next();
        return;
      }
      res.redirect(302, withCampaignAffiliate(campaign.destinationUrl, memberSlug));
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
      const visitorId = getOrCreateTrackingCookie(req, res, trackingCookieNames.visitor, 365 * 24 * 60 * 60 * 1000);
      const sessionId = getOrCreateTrackingCookie(req, res, trackingCookieNames.session, 30 * 60 * 1000);
      const occurredAt = new Date();
      const userAgent = req.get("user-agent") ?? "";
      const campaign = await resolvePublicCampaignAndRecordClick(slug, {
        visitorId,
        sessionId,
        occurredAt,
        referrerOrigin: getTrackingOrigin(req.get("referer")),
        userAgentCategory: getTrackingUserAgentCategory(userAgent),
        deviceType: getTrackingDeviceType(userAgent),
        utmSource: getTrackingQueryValue(req, "utm_source"),
        utmMedium: getTrackingQueryValue(req, "utm_medium"),
        utmCampaign: getTrackingQueryValue(req, "utm_campaign"),
        utmContent: getTrackingQueryValue(req, "utm_content"),
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
