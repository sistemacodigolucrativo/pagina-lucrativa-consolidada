import type { Express } from "express";
import { sql } from "drizzle-orm";
import { resolveDatabaseConfig } from "../../shared/databaseConfig.mjs";
import { getDb } from "../db";

export function registerDatabaseHealth(app: Express, prefix = "") {
  for (const route of new Set(["/api/healthz", `${prefix}/api/healthz`])) {
    app.get(route, async (_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      try {
        const { mode } = resolveDatabaseConfig(process.env);
        const db = await getDb();
        if (!db) throw new Error();
        await db.execute(sql`SELECT 1`);
        res.json({ status: "ok", database: mode });
      } catch {
        res.status(503).json({ status: "unavailable" });
      }
    });
  }
}
