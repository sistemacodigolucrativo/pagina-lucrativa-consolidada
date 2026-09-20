import type { Request, RequestHandler } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function origin(value: string | undefined) {
  if (!value || value === "null") return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}

export function assertCsrfConfiguration() {
  const configured = process.env.PUBLIC_APP_ORIGIN;
  if (process.env.NODE_ENV === "production" && (!configured || origin(configured) !== configured || !configured.startsWith("https://"))) {
    throw new Error("PUBLIC_APP_ORIGIN deve ser a origem HTTPS pública exata, sem barra final, em produção.");
  }
  if (configured && origin(configured) !== configured) throw new Error("PUBLIC_APP_ORIGIN inválida.");
}

export function hasTrustedOrigin(req: Request) {
  const source = req.headers.origin !== undefined
    ? origin(typeof req.headers.origin === "string" ? req.headers.origin : undefined)
    : origin(req.headers.referer);
  // Em produção nunca derivar a origem de Host/X-Forwarded-* controláveis.
  const target = process.env.PUBLIC_APP_ORIGIN
    || (process.env.NODE_ENV !== "production" ? origin(`${req.protocol}://${req.get("host")}`) : null);
  return Boolean(source && target && source === target && req.headers["sec-fetch-site"] !== "cross-site");
}

export const csrfProtection: RequestHandler = (req, res, next) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) return next();
  if (!hasTrustedOrigin(req)) {
    res.status(403).json({ error: "Origem da requisição não autorizada." });
    return;
  }
  next();
};
