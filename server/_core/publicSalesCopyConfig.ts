import type { Express } from "express";
import { getAdminContent } from "../db";
import { PUBLIC_SALES_COPY_CATEGORY, type PublicSalesCopyOverrides } from "@shared/publicSalesCopyEditor";

const FLOATING_LAYOUT_CATEGORY = "public-sales-layout";
const FLOATING_LAYOUT_RESOURCE = "floating";

export function registerPublicSalesCopyConfig(app: Express, appPrefix = "") {
  const paths = Array.from(new Set([
    "/api/public-sales-copy",
    appPrefix ? `${appPrefix}/api/public-sales-copy` : null,
  ].filter((value): value is string => Boolean(value))));

  for (const path of paths) {
    app.get(path, async (_req, res) => {
      try {
        const content = await getAdminContent();
        const overrides: PublicSalesCopyOverrides = {};
        let floatingLayout: Record<string, unknown> = {};
        for (const item of content) {
          if (item.kind !== "notice" || item.status === "archived") continue;
          if (item.resourceCategory === FLOATING_LAYOUT_CATEGORY && item.resourceType === FLOATING_LAYOUT_RESOURCE) {
            try {
              const parsed = JSON.parse(item.body ?? "{}") as Record<string, unknown>;
              floatingLayout = parsed;
            } catch {
              floatingLayout = {};
            }
            continue;
          }
          if (item.resourceCategory !== PUBLIC_SALES_COPY_CATEGORY || !item.resourceType) continue;
          try {
            const parsed = JSON.parse(item.body ?? "{}") as Record<string, unknown>;
            overrides[item.resourceType] = Object.fromEntries(
              Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
            );
          } catch {
            // Ignora somente o registro malformado; os demais continuam disponíveis.
          }
        }
        res.json({ overrides, floatingLayout });
      } catch (error) {
        console.warn("[PublicSalesCopy] Failed to load admin configuration:", error);
        res.json({ overrides: {}, floatingLayout: {} });
      }
    });
  }
}
