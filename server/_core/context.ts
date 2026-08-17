import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import type { User } from "../../drizzle/schema";
import { DEMO_SESSION_COOKIE_NAME, resolveDemoSession } from "../demoAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  authSource: "demo" | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
  const demoUser = resolveDemoSession(cookies[DEMO_SESSION_COOKIE_NAME]);

  return {
    req: opts.req,
    res: opts.res,
    user: demoUser ?? null,
    authSource: demoUser ? "demo" : null,
  };
}
