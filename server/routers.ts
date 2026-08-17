import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { applicationInputSchema } from "@shared/applications";
import { createApplication, getAdminOverview, getMemberCampaigns, getMemberOverview, getMemberProducts, getPublishedCourses, getRecentApplications, upsertUser } from "./db";
import { DEMO_SESSION_COOKIE_NAME, demoLoginInputSchema, resolveDemoAccount } from "./demoAuth";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const sessionCookieName = ctx.authSource === "demo"
        ? DEMO_SESSION_COOKIE_NAME
        : COOKIE_NAME;
      ctx.res.clearCookie(sessionCookieName, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    demoLogin: publicProcedure.input(demoLoginInputSchema).mutation(async ({ ctx, input }) => {
      const account = resolveDemoAccount(input.username, input.password);

      if (!account) {
        throw new Error("Credenciais de demonstração inválidas.");
      }

      await upsertUser({
        openId: account.openId,
        name: account.name,
        email: account.email,
        loginMethod: "local_demo",
        role: account.role,
        lastSignedIn: new Date(),
      });

      const token = await sdk.createSessionToken(account.openId, {
        name: account.name,
        expiresInMs: 1000 * 60 * 60 * 12,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(DEMO_SESSION_COOKIE_NAME, token, {
        ...cookieOptions,
        sameSite: cookieOptions.secure ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 12,
      });

      return { role: account.role } as const;
    }),
  }),
  member: router({
    overview: protectedProcedure.query(({ ctx }) => getMemberOverview(ctx.user.id)),
    campaigns: protectedProcedure.query(({ ctx }) => getMemberCampaigns(ctx.user.id)),
    products: protectedProcedure.query(({ ctx }) => getMemberProducts(ctx.user.id)),
    academy: protectedProcedure.query(() => getPublishedCourses()),
  }),
  applications: router({
    submit: publicProcedure.input(applicationInputSchema).mutation(({ input }) => createApplication(input)),
  }),
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    applications: adminProcedure.query(() => getRecentApplications()),
  }),
});

export type AppRouter = typeof appRouter;
