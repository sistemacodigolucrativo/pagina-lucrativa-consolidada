import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
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

  try {
    user = await sdk.authenticateDemoRequest(opts.req);
    authSource = "demo";
  } catch (error) {
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
