import type { Express, NextFunction, Request, Response } from "express";
import { resolvePublicCampaignAndRecordClick } from "../db";

const appPrefix = (process.env.VITE_DEV_PREFIX ?? "").replace(/\/+$/, "");
const campaignRoutes = Array.from(new Set(["/:campaignSlug", appPrefix ? `${appPrefix}/:campaignSlug` : null].filter((route): route is string => Boolean(route))));

export function registerCampaignRedirectRoutes(app: Express) {
  const handleCampaignRedirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = String(req.params.campaignSlug ?? "").trim().toLowerCase();
      if (!/^[a-z0-9-]{3,128}$/.test(slug)) {
        next();
        return;
      }
      const campaign = await resolvePublicCampaignAndRecordClick(slug);
      if (!campaign) {
        next();
        return;
      }
      res.redirect(302, campaign.destinationUrl);
    } catch (error) {
      next(error);
    }
  };
  for (const route of campaignRoutes) app.get(route, handleCampaignRedirect);
}
