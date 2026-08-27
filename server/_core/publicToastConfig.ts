import type { Express } from "express";
import { getAdminContent } from "../db";
import {
  PUBLIC_TOAST_CATEGORY,
  PUBLIC_TOAST_SETTINGS_TYPE,
  PUBLIC_TOAST_TEMPLATE_TYPE,
  normalizePublicToastSettings,
  publicToastDefaultSettings,
  publicToastDefaultTemplates,
  type PublicToastTemplate,
} from "@shared/publicToastSystem";

function parseDisclaimer(body?: string | null) {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body) as { disclaimer?: string };
    return parsed.disclaimer ?? "";
  } catch {
    return body;
  }
}

function parseSettings(body?: string | null) {
  if (!body) return publicToastDefaultSettings;
  try {
    return normalizePublicToastSettings(JSON.parse(body));
  } catch {
    return publicToastDefaultSettings;
  }
}

export function registerPublicToastConfig(app: Express, appPrefix = "") {
  const paths = Array.from(new Set(["/api/public-toast-config", appPrefix ? `${appPrefix}/api/public-toast-config` : null].filter((value): value is string => Boolean(value))));
  for (const path of paths) {
    app.get(path, async (_req, res) => {
      try {
        const content = await getAdminContent();
        const templates: PublicToastTemplate[] = content
          .filter(item => item.kind === "notice" && item.resourceCategory === PUBLIC_TOAST_CATEGORY && item.resourceType === PUBLIC_TOAST_TEMPLATE_TYPE && item.status === "published")
          .map(item => ({
            id: item.id,
            title: item.title,
            message: item.summary ?? "",
            disclaimer: parseDisclaimer(item.body),
          }))
          .filter(item => item.message.trim().length > 0);
        const settingsItem = content.find(item => item.kind === "notice" && item.resourceCategory === PUBLIC_TOAST_CATEGORY && item.resourceType === PUBLIC_TOAST_SETTINGS_TYPE && item.status !== "archived");
        res.json({
          templates: templates.length ? templates : publicToastDefaultTemplates,
          settings: parseSettings(settingsItem?.body),
        });
      } catch (error) {
        console.warn("[PublicToast] Failed to load admin configuration:", error);
        res.json({ templates: publicToastDefaultTemplates, settings: publicToastDefaultSettings });
      }
    });
  }
}
