import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { eq } from "drizzle-orm";
import { managedContent } from "../../drizzle/schema";
import { getDb } from "../db";
import { DEMO_SESSION_COOKIE_NAME, resolveDemoSession } from "../demoAuth";

const SYSTEM_CATEGORIES = ["public-sales-copy", "public-sales-layout", "member-admin-control", "public-toast-config"];

async function requireAdmin(req: Request, res: Response) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const user = resolveDemoSession(cookies[DEMO_SESSION_COOKIE_NAME]);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Acesso administrativo necessário." });
    return null;
  }
  return user;
}

export function registerAdminContentManagement(app: Express, appPrefix: string) {
  const paths = Array.from(new Set(["/api/admin/content-management", appPrefix ? `${appPrefix}/api/admin/content-management` : null].filter((value): value is string => Boolean(value))));
  for (const path of paths) {
    app.delete(`${path}/:id`, async (req, res) => {
      if (!await requireAdmin(req, res)) return;
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return void res.status(400).json({ error: "Conteúdo inválido." });
      const db = await getDb();
      if (!db) return void res.status(503).json({ error: "Banco de dados indisponível." });
      const row = await db.select({ id: managedContent.id, resourceCategory: managedContent.resourceCategory }).from(managedContent).where(eq(managedContent.id, id)).limit(1);
      if (!row[0]) return void res.status(404).json({ error: "Conteúdo não encontrado." });
      if (row[0].resourceCategory && SYSTEM_CATEGORIES.includes(row[0].resourceCategory)) return void res.status(409).json({ error: "Este registro pertence à configuração interna do sistema e não pode ser excluído por esta tela." });
      await db.delete(managedContent).where(eq(managedContent.id, id));
      res.json({ success: true });
    });
  }
}
