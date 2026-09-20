import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { eq } from "drizzle-orm";
import { memberTestimonials } from "../../drizzle/schema";
import { getDb } from "../db";
import { DEMO_SESSION_COOKIE_NAME, resolveDemoSession } from "../demoAuth";

async function requireAdmin(req: Request, res: Response) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const user = await resolveDemoSession(cookies[DEMO_SESSION_COOKIE_NAME]);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Acesso administrativo necessário." });
    return null;
  }
  return user;
}

export function registerAdminRelationshipMaintenance(app: Express, appPrefix: string) {
  const paths = Array.from(new Set(["/api/admin/relationship-maintenance", appPrefix ? `${appPrefix}/api/admin/relationship-maintenance` : null].filter((value): value is string => Boolean(value))));
  for (const path of paths) {
    app.delete(`${path}/testimonials/:id`, async (req, res) => {
      if (!await requireAdmin(req, res)) return;
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return void res.status(400).json({ error: "Depoimento inválido." });
      const db = await getDb();
      if (!db) return void res.status(503).json({ error: "Banco de dados indisponível." });
      const existing = await db.select({ id: memberTestimonials.id }).from(memberTestimonials).where(eq(memberTestimonials.id, id)).limit(1);
      if (!existing[0]) return void res.status(404).json({ error: "Depoimento não encontrado." });
      await db.delete(memberTestimonials).where(eq(memberTestimonials.id, id));
      res.json({ success: true });
    });
  }
}
