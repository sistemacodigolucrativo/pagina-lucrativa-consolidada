import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { applicationInputSchema } from "@shared/applications";
import {
  createAdminContent,
  createApplication,
  createMemberCampaign,
  createMemberTicket,
  createMemberContact,
  createMemberInvitation,
  deleteMemberCampaign,
  getAdminContent,
  getAdminOverview,
  getAdminTickets,
  getAdminContacts,
  getAdminActivities,
  getMemberCampaigns,
  getMemberOverview,
  getMemberProducts,
  getMemberProfile,
  getMemberTickets,
  getMemberContacts,
  getMemberInvitations,
  getMemberActivities,
  getPublishedContent,
  getPublishedCourses,
  getRecentApplications,
  updateAdminContentStatus,
  updateAdminTicket,
  updateAdminContact,
  updateMemberProfile,
  updateMemberContact,
} from "./db";
import { createDemoSession, DEMO_SESSION_COOKIE_NAME, demoLoginInputSchema, resolveDemoAccount } from "./demoAuth";
import { z } from "zod";

const campaignInput = z.object({
  name: z.string().trim().min(3).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Use letras, números e hífens.").min(3).max(128),
  destinationUrl: z.string().url().max(1024),
});
const profileInput = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Use letras, números e hífens.").min(3).max(96),
  bio: z.string().trim().max(2000).optional().nullable(),
  whatsapp: z.string().trim().max(32).optional().nullable(),
  websiteUrl: z.string().url().max(512).optional().nullable(),
});
const ticketInput = z.object({ subject: z.string().trim().min(4).max(180), message: z.string().trim().min(10).max(8000) });
const contentInput = z.object({
  kind: z.enum(["material", "article", "faq", "notice"]),
  title: z.string().trim().min(3).max(240),
  summary: z.string().trim().max(8000).optional().nullable(),
  body: z.string().trim().max(60000).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]),
});

export const captureContactInput = z.object({ campaignId: z.number().int().positive().optional().nullable(), name: z.string().trim().min(2).max(180), email: z.string().email().max(320), whatsapp: z.string().trim().max(32).optional().nullable(), source: z.string().trim().min(2).max(160), consent: z.literal(true), consentNote: z.string().trim().max(2000).optional().nullable() });
export const invitationInput = z.object({ contactId: z.number().int().positive().optional().nullable(), channel: z.enum(["link", "email", "whatsapp"]), message: z.string().trim().max(4000).optional().nullable() });
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(DEMO_SESSION_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    demoLogin: publicProcedure.input(demoLoginInputSchema).mutation(({ ctx, input }) => {
      const account = resolveDemoAccount(input.username, input.password);
      if (!account) throw new Error("Credenciais de demonstração inválidas.");
      const token = createDemoSession(account);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(DEMO_SESSION_COOKIE_NAME, token, { ...cookieOptions, sameSite: cookieOptions.secure ? "none" : "lax", maxAge: 1000 * 60 * 60 * 12 });
      return { role: account.role } as const;
    }),
  }),
  member: router({
    overview: protectedProcedure.query(({ ctx }) => getMemberOverview(ctx.user.id)),
    campaigns: protectedProcedure.query(({ ctx }) => getMemberCampaigns(ctx.user.id)),
    createCampaign: protectedProcedure.input(campaignInput).mutation(({ ctx, input }) => createMemberCampaign(ctx.user.id, input)),
    deleteCampaign: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteMemberCampaign(ctx.user.id, input.id)),
    products: protectedProcedure.query(({ ctx }) => getMemberProducts(ctx.user.id)),
    academy: protectedProcedure.query(() => getPublishedCourses()),
    profile: protectedProcedure.query(({ ctx }) => getMemberProfile(ctx.user.id)),
    updateProfile: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => updateMemberProfile(ctx.user.id, input)),
    tickets: protectedProcedure.query(({ ctx }) => getMemberTickets(ctx.user.id)),
    createTicket: protectedProcedure.input(ticketInput).mutation(({ ctx, input }) => createMemberTicket(ctx.user.id, input)),
    content: protectedProcedure.query(() => getPublishedContent()),
    contacts: protectedProcedure.query(({ ctx }) => getMemberContacts(ctx.user.id)),
    createContact: protectedProcedure.input(captureContactInput).mutation(({ ctx, input }) => createMemberContact(ctx.user.id, input)),
    updateContact: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "contacted", "qualified", "archived"]), source: z.string().trim().min(2).max(160).optional() })).mutation(({ ctx, input }) => updateMemberContact(ctx.user.id, input.id, input)),
    invitations: protectedProcedure.query(({ ctx }) => getMemberInvitations(ctx.user.id)),
    createInvitation: protectedProcedure.input(invitationInput).mutation(({ ctx, input }) => createMemberInvitation(ctx.user.id, input)),
    activities: protectedProcedure.query(({ ctx }) => getMemberActivities(ctx.user.id)),
  }),
  applications: router({ submit: publicProcedure.input(applicationInputSchema).mutation(({ input }) => createApplication(input)) }),
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    applications: adminProcedure.query(() => getRecentApplications()),
    content: adminProcedure.query(() => getAdminContent()),
    createContent: adminProcedure.input(contentInput).mutation(({ ctx, input }) => createAdminContent({ ...input, createdBy: ctx.user.id })),
    updateContentStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "published", "archived"]) })).mutation(({ input }) => updateAdminContentStatus(input.id, input.status)),
    tickets: adminProcedure.query(() => getAdminTickets()),
    updateTicket: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["open", "answered", "closed"]), adminResponse: z.string().trim().max(8000).optional().nullable() })).mutation(({ input }) => updateAdminTicket(input.id, input)),
    contacts: adminProcedure.query(() => getAdminContacts()),
    updateContact: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "contacted", "qualified", "archived"]) })).mutation(({ input }) => updateAdminContact(input.id, input)),
    activities: adminProcedure.query(() => getAdminActivities()),
  }),
});
export type AppRouter = typeof appRouter;
