import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import type { User } from "../../drizzle/schema";
import { DEMO_SESSION_COOKIE_NAME, resolveDemoSession } from "../demoAuth";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  authSource: "demo" | "manus" | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let authSource: TrpcContext["authSource"] = null;

  const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
  const demoUser = resolveDemoSession(cookies[DEMO_SESSION_COOKIE_NAME]);

  if (demoUser) {
    user = demoUser;
    authSource = "demo";
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
      authSource = "manus";
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    authSource,
  };
}
