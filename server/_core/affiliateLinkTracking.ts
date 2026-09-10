import type { Express, NextFunction, Request, Response } from "express";
import { recordPublicAffiliateLinkClick, resolveDefaultAffiliateProfile } from "../db";
import {
  getOrCreateTrackingCookie,
  getTrackingDeviceType,
  getTrackingOrigin,
  getTrackingQueryValue,
  getTrackingUserAgentCategory,
  trackingCookieNames,
} from "./trackingCookies";

const affiliateSlugPattern = /^[a-z0-9-]{3,96}$/;
const appPrefix = (process.env.VITE_DEV_PREFIX ?? "").replace(/\/+$/, "");
const affiliateLandingPaths = new Set(["/", "/dev", "/dev/", appPrefix || null, appPrefix ? appPrefix + "/" : null].filter((path): path is string => Boolean(path)));

export function registerAffiliateLinkTracking(app: Express) {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.method !== "GET" || !affiliateLandingPaths.has(req.path)) {
        next();
        return;
      }

      if (req.query.pl_ref === "campaign") {
        next();
        return;
      }

      const rawSlug = req.query.afiliado;
      const explicitMemberSlug = typeof rawSlug === "string" ? rawSlug.trim().toLowerCase() : null;
      const defaultAffiliate = await resolveDefaultAffiliateProfile();
      const candidateSlugs = Array.from(new Set([
        explicitMemberSlug && affiliateSlugPattern.test(explicitMemberSlug) ? explicitMemberSlug : null,
        defaultAffiliate?.slug && affiliateSlugPattern.test(defaultAffiliate.slug) ? defaultAffiliate.slug : null,
      ].filter((slug): slug is string => Boolean(slug))));

      if (!candidateSlugs.length) {
        next();
        return;
      }

      const visitorId = getOrCreateTrackingCookie(req, res, trackingCookieNames.visitor, 365 * 24 * 60 * 60 * 1000);
      const sessionId = getOrCreateTrackingCookie(req, res, trackingCookieNames.session, 30 * 60 * 1000);
      const userAgent = req.get("user-agent") ?? "";
      const metadata = {
        visitorId,
        sessionId,
        occurredAt: new Date(),
        referrerOrigin: getTrackingOrigin(req.get("referer")),
        userAgentCategory: getTrackingUserAgentCategory(userAgent),
        deviceType: getTrackingDeviceType(userAgent),
        utmSource: getTrackingQueryValue(req, "utm_source"),
        utmMedium: getTrackingQueryValue(req, "utm_medium"),
        utmCampaign: getTrackingQueryValue(req, "utm_campaign"),
        utmContent: getTrackingQueryValue(req, "utm_content"),
        landingPath: req.originalUrl.slice(0, 512),
      };

      for (const memberSlug of candidateSlugs) {
        const recorded = await recordPublicAffiliateLinkClick(memberSlug, metadata).catch(error => {
          console.error("Falha ao registrar clique do link principal de afiliado.", error);
          return null;
        });
        if (recorded) break;
      }
      next();
    } catch (error) {
      next(error);
    }
  });
}
