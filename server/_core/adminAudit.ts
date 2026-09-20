import { randomUUID } from "node:crypto";
import { appendFile, mkdir, realpath } from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import { parse } from "cookie";
import { DEMO_SESSION_COOKIE_NAME, hasRecentLocalAuthentication } from "../demoAuth";
import { LOCAL_STORAGE_DIR } from "../storage";

function contained(root: string, target: string) {
  const relative = path.relative(root, target);
  return !relative || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

export function assertAuditConfiguration() {
  if (process.env.NODE_ENV !== "production") return;
  const directory = process.env.SECURITY_AUDIT_DIR;
  if (!directory || !path.isAbsolute(directory) || contained(process.cwd(), directory)
    || contained(path.resolve(LOCAL_STORAGE_DIR), directory) || directory.split(path.sep).includes("releases")) {
    throw new Error("SECURITY_AUDIT_DIR deve ser absoluto, persistente, fora das releases e do storage público.");
  }
}

export async function appendAdminAudit(event: { requestId: string; actorId: number; action: string; phase: "started" | "completed" | "failed"; status?: number }) {
  assertAuditConfiguration();
  const configured = process.env.SECURITY_AUDIT_DIR || path.resolve(".local-audit");
  await mkdir(configured, { recursive: true, mode: 0o700 });
  const directory = await realpath(configured);
  if (process.env.NODE_ENV === "production") {
    const root = await realpath(process.cwd());
    const storage = await realpath(LOCAL_STORAGE_DIR).catch(() => path.resolve(LOCAL_STORAGE_DIR));
    if (contained(root, directory) || contained(storage, directory) || directory.split(path.sep).includes("releases")) throw new Error("Diretório de auditoria resolve para local não permitido.");
  }
  const filename = path.join(directory, `admin-${new Date().toISOString().slice(0, 10)}.jsonl`);
  await appendFile(filename, JSON.stringify({ at: new Date().toISOString(), ...event }) + "\n", { encoding: "utf8", mode: 0o600 });
}

export async function beginAdminMutation(req: Request, actorId: number, action: string) {
  const token = parse(req.headers.cookie ?? "")[DEMO_SESSION_COOKIE_NAME];
  if (!hasRecentLocalAuthentication(token)) throw new Error("Entre novamente para confirmar esta operação administrativa (sessão recente de até 15 minutos).");
  const event = { requestId: randomUUID(), actorId, action };
  await appendAdminAudit({ ...event, phase: "started" });
  return event;
}

export async function enforceAdminMutation(req: Request, res: Response, actorId: number) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  try {
    const event = await beginAdminMutation(req, actorId, `${req.method} ${req.route?.path || req.path}`);
    res.once("finish", () => {
      void appendAdminAudit({ ...event, phase: res.statusCode < 400 ? "completed" : "failed", status: res.statusCode })
        .catch(() => console.error("[AdminAudit] Falha ao concluir registro; reconciliar evento started."));
    });
    return true;
  } catch (error) {
    res.status(403).json({ error: error instanceof Error ? error.message : "Auditoria administrativa indisponível." });
    return false;
  }
}
