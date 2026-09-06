import type { Express, Request, Response } from "express";
import path from "node:path";
import { LOCAL_STORAGE_DIR, normalizeKey } from "../storage";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  const appPrefix = (process.env.VITE_DEV_PREFIX ?? "").replace(/\/+$/, "");
  const storagePaths = Array.from(new Set(["/manus-storage/*", appPrefix ? `${appPrefix}/manus-storage/*` : null].filter((path): path is string => Boolean(path))));

  const handleStorageRequest = async (req: Request, res: Response) => {
    const rawKey = (req.params as Record<string, string>)[0];
    if (!rawKey) {
      res.status(400).send("Missing storage key");
      return;
    }

    let key: string;
    try {
      key = normalizeKey(rawKey);
    } catch {
      res.status(400).send("Invalid storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      const root = path.resolve(LOCAL_STORAGE_DIR);
      const target = path.resolve(root, key);
      if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
        res.status(400).send("Invalid storage key");
        return;
      }
      res.set("Cache-Control", "private, max-age=3600");
      if (key.toLowerCase().endsWith(".pdf")) {
        res.set("Content-Disposition", "inline");
        res.set("Content-Type", "application/pdf");
        res.set("X-Content-Type-Options", "nosniff");
      }
      res.sendFile(key, { root }, (error: Error | null) => {
        if (!error || res.headersSent) return;
        const typedError = error as NodeJS.ErrnoException & { statusCode?: number };
        res.status(typedError.statusCode === 404 || typedError.code === "ENOENT" ? 404 : 500).send("Stored file unavailable");
      });
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  };

  for (const storagePath of storagePaths) {
    app.get(storagePath, handleStorageRequest);
  }
}
