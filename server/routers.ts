import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { applicationInputSchema } from "@shared/applications";
import { normalizedEmailZodSchema, optionalPhoneZodSchema } from "@shared/contactValidation";
import { httpUrlZodSchema, nonNegativeCentsZodSchema, normalizePixKey, normalizePixKeyByType, pixKeyZodSchema, positiveCentsZodSchema, signedPointsZodSchema, validatePixKeyByType } from "@shared/structuredValidation";
import {
  createAdminContent,
  createAdminEbook,
  createApplication,
  getApplicationTracking,
  updateAdminApplication,
  createMemberCampaign,
  createMemberTicket,
  createMemberContact,
  createMemberInvitation,
  createMemberProduct,
  deleteMemberCampaign,
  getAdminContent,
  getAdminEbook,
  getAdminEbooks,
  getAdminOverview,
  getAdminProducts,
  getAdminTickets,
  getAdminContacts,
  getAdminActivities,
  getMemberCampaigns,
  getMemberOperationAnalytics,
  getMemberOperationConversions,
  getMemberOverview,
  getMemberFinance,
  createMemberFinanceEntry,
  getAdminTransactions,
  getFinanceMembers,
  createAdminTransaction,
  updateAdminTransaction,
  getMemberProducts,
  getMemberProfile,
  getMemberAccount,
  getMemberReceivingPreference,
  getMemberAffiliateApplications,
  getMemberTickets,
  getMemberContacts,
  getMemberInvitations,
  getMemberActivities,
  getPublishedContent,
  getPublicSalesSectionImages,
  getAdminPublicSalesSectionImages,
  getPublicAffiliateProfile,
  getPublishedEbook,
  getPublishedEbooks,
  getPublishedCourses,
  getMemberCourseByRouteKey,
  getMemberCourses,
  updateMemberCourseProgress,
  getAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  updateAdminCoursePublication,
  getRecentApplications,
  updateAdminContent,
  updateAdminContentStatus,
  updateAdminEbook,
  updateAdminProductStatus,
  updateAdminTicket,
  updateAdminContact,
  updateMemberProfile,
  uploadMemberProfilePhoto,
  updateMemberAccount,
  updateMemberReceivingPreference,
  updateMemberContact,
  updateMemberProduct,
  setAdminReferralLink,
  getAdminReferralLinks,
  getReferralMembers,
  getMemberReferrals,
  getMemberPerformance,
  getAdminPerformance,
  getPerformanceMembers,
  createAdminPointEntry,
  updateAdminPointEntry,
  getAdminInvitations,
  updateAdminInvitation,
  getMemberTestimonials,
  createMemberTestimonial,
  getAdminTestimonials,
  updateAdminTestimonial,
  getMemberSpecialAccess,
  updateMemberSpecialAccess,
  getPublicSpecialAccess,
  unlockPublicSpecialAccess,
  getAdminSpecialAccessPages,
  updateAdminSpecialAccessPage,
  removeAdminPublicSalesSectionImage,
  upsertAdminPublicSalesSectionImage,
} from "./db";
import { createDemoSession, DEMO_SESSION_COOKIE_NAME, demoLoginInputSchema, resolveDemoAccount } from "./demoAuth";
import { z } from "zod";

const campaignInput = z.object({
  name: z.string().trim().min(3).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Use letras, números e hífens.").min(3).max(128),
  destinationUrl: httpUrlZodSchema,
});
export const profileInput = z.object({
  slug: z.string().trim().toLowerCase().regex(/^(?=.*[a-z0-9])[a-z0-9-]+$/, "Use letras, números e hífens.").min(3).max(96),
  bio: z.string().trim().max(2000).optional().nullable(),
  whatsapp: optionalPhoneZodSchema,
  websiteUrl: httpUrlZodSchema.max(512).optional().nullable(),
  facebookUrl: httpUrlZodSchema.max(512).optional().nullable(),
  twitterUrl: httpUrlZodSchema.max(512).optional().nullable(),
  linkedinUrl: httpUrlZodSchema.max(512).optional().nullable(),
  youtubeUrl: httpUrlZodSchema.max(512).optional().nullable(),
  skype: z.string().trim().max(255).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  addressNumber: z.string().trim().max(32).optional().nullable(),
  addressComplement: z.string().trim().max(160).optional().nullable(),
  postalCode: z.string().trim().max(20).optional().nullable(),
  district: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(80).optional().nullable(),
});
export const profilePhotoInput = z.object({
  dataUrl: z.string().regex(/^data:image\/(?:jpeg|png|gif);base64,[A-Za-z0-9+/=\s]+$/).max(1_450_000),
  contentType: z.enum(["image/jpeg", "image/png", "image/gif"]),
});
export const accountInput = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(180),
  email: normalizedEmailZodSchema,
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres.").optional().nullable(),
  confirmPassword: z.string().max(128).optional().nullable(),
}).superRefine((value, context) => {
  if (value.newPassword && value.newPassword !== value.confirmPassword) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "As senhas não conferem." });
  }
});
export const receivingPreferenceInput = z.object({
  holderName: z.string().trim().max(180).optional().nullable(),
  method: z.enum(["pix", "bank_transfer", "other"]),
  receivingKey: z.string().trim().max(255).optional().nullable(),
  instructions: z.string().trim().max(2000).optional().nullable(),
  paypalEmail: normalizedEmailZodSchema.optional().nullable(),
  paypalEnabled: z.boolean().optional(),
  pagseguroEmail: normalizedEmailZodSchema.optional().nullable(),
  pagseguroEnabled: z.boolean().optional(),
  bank1Name: z.string().trim().max(180).optional().nullable(),
  bank1Agency: z.string().trim().max(64).optional().nullable(),
  bank1Account: z.string().trim().max(96).optional().nullable(),
  bank1Type: z.enum(["checking", "savings"]).optional().nullable(),
  bank1Holder: z.string().trim().max(180).optional().nullable(),
  bank2Name: z.string().trim().max(180).optional().nullable(),
  bank2Agency: z.string().trim().max(64).optional().nullable(),
  bank2Account: z.string().trim().max(96).optional().nullable(),
  bank2Type: z.enum(["checking", "savings"]).optional().nullable(),
  bank2Holder: z.string().trim().max(180).optional().nullable(),
  pixType: z.string().trim().max(64).optional().nullable(),
  pixKey: z.string().trim().max(255).optional().nullable(),
}).superRefine((value, context) => {
  if (value.method === "pix" && !value.receivingKey) context.addIssue({ code: z.ZodIssueCode.custom, path: ["receivingKey"], message: "Informe a chave PIX." });
  if (value.method === "pix" && value.receivingKey && !pixKeyZodSchema.safeParse(value.receivingKey).success) context.addIssue({ code: z.ZodIssueCode.custom, path: ["receivingKey"], message: "Informe uma chave PIX válida." });
  if (value.pixKey && !value.pixType) context.addIssue({ code: z.ZodIssueCode.custom, path: ["pixType"], message: "Selecione o tipo da chave PIX." });
  if (value.pixKey && value.pixType && !validatePixKeyByType(value.pixKey, value.pixType)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["pixKey"], message: "A chave PIX não corresponde ao tipo selecionado." });
}).transform(value => ({ ...value, receivingKey: value.method === "pix" && value.receivingKey ? normalizePixKey(value.receivingKey) : value.receivingKey?.trim() || null, pixKey: value.pixKey && value.pixType ? normalizePixKeyByType(value.pixKey, value.pixType) : value.pixKey?.trim() || null }));
const ticketInput = z.object({ subject: z.string().trim().min(4).max(180), message: z.string().trim().min(10).max(8000) });
const productInput = z.object({ title: z.string().trim().min(3).max(240), description: z.string().trim().max(8000).optional().nullable(), category: z.string().trim().max(96).optional().nullable(), priceCents: nonNegativeCentsZodSchema });
const courseInput = z.object({
  title: z.string().trim().min(3).max(240),
  summary: z.string().trim().max(8000).optional().nullable(),
  category: z.string().trim().max(96).optional().nullable(),
  durationMinutes: z.number().int().min(0).max(100000),
  level: z.enum(["fundamentos", "pratica", "avancado"]),
  ebookId: z.number().int().positive().nullable(),
  isPublished: z.boolean(),
});
const publicSalesSectionImageInput = z.object({
  sectionId: z.string().trim().regex(/^[a-z0-9_]+$/).min(3).max(64),
  dataUrl: z.string().regex(/^data:image\/(?:jpeg|png|gif);base64,[A-Za-z0-9+/=\s]+$/).max(5_700_000),
  contentType: z.enum(["image/jpeg", "image/png", "image/gif"]),
  originalName: z.string().trim().max(255).optional().nullable(),
});
const contentInput = z.object({
  kind: z.enum(["material", "article", "faq", "notice"]),
  title: z.string().trim().min(3).max(240),
  summary: z.string().trim().max(8000).optional().nullable(),
  body: z.string().trim().max(60000).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]),
});

const ebookInput = z.object({
  sourceId: z.string().trim().min(4).max(64),
  sourceFile: z.string().trim().min(1).max(255),
  sourcePath: z.string().trim().min(1).max(1024),
  title: z.string().trim().min(3).max(240),
  summary: z.string().trim().max(16000).optional().nullable(),
  htmlContent: z.string().min(20).max(18000000),
  status: z.enum(["draft", "published", "archived"]),
});
export const captureContactInput = z.object({ campaignId: z.number().int().positive().optional().nullable(), name: z.string().trim().min(2).max(180), email: normalizedEmailZodSchema, whatsapp: optionalPhoneZodSchema, source: z.string().trim().min(2).max(160), consent: z.literal(true), consentNote: z.string().trim().max(2000).optional().nullable() });
export const invitationInput = z.object({ contactId: z.number().int().positive().optional().nullable(), channel: z.enum(["link", "email", "whatsapp"]), message: z.string().trim().max(4000).optional().nullable() });
export const testimonialInput = z.object({ content: z.string().trim().min(30).max(8000), authorConfirmed: z.literal(true) });
export const specialAccessInput = z.object({
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
  buttonLabel: z.string().trim().min(2).max(80),
  destinationUrl: httpUrlZodSchema.max(1024),
  password: z.string().min(6, "Use pelo menos 6 caracteres na senha.").max(128).optional(),
  status: z.enum(["draft", "published", "paused"]),
});
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(DEMO_SESSION_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    demoLogin: publicProcedure.input(demoLoginInputSchema).mutation(async ({ ctx, input }) => {
      const account = await resolveDemoAccount(input.username, input.password);
      if (!account) throw new Error("Usuário ou senha inválidos.");
      const token = createDemoSession(account);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(DEMO_SESSION_COOKIE_NAME, token, { ...cookieOptions, sameSite: cookieOptions.secure ? "none" : "lax", maxAge: 1000 * 60 * 60 * 12 });
      return { role: account.role } as const;
    }),
  }),
  member: router({
    overview: protectedProcedure.query(({ ctx }) => getMemberOverview(ctx.user.id)),
    campaigns: protectedProcedure.query(({ ctx }) => getMemberCampaigns(ctx.user.id)),
    analytics: protectedProcedure.input(z.object({ period: z.enum(["7d", "30d", "90d", "all"]).default("30d") })).query(({ ctx, input }) => getMemberOperationAnalytics(ctx.user.id, input.period)),
    conversions: protectedProcedure.input(z.object({ period: z.enum(["7d", "30d", "90d", "all"]).default("30d") })).query(({ ctx, input }) => getMemberOperationConversions(ctx.user.id, input.period)),
    createCampaign: protectedProcedure.input(campaignInput).mutation(({ ctx, input }) => createMemberCampaign(ctx.user.id, input)),
    deleteCampaign: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteMemberCampaign(ctx.user.id, input.id)),
    products: protectedProcedure.query(({ ctx }) => getMemberProducts(ctx.user.id)),
    createProduct: protectedProcedure.input(productInput).mutation(({ ctx, input }) => createMemberProduct(ctx.user.id, input)),
    updateProduct: protectedProcedure.input(productInput.extend({ id: z.number().int().positive() })).mutation(({ ctx, input }) => { const { id, ...product } = input; return updateMemberProduct(ctx.user.id, id, product); }),
    finance: protectedProcedure.query(({ ctx }) => getMemberFinance(ctx.user.id)),
    createFinanceEntry: protectedProcedure.input(z.object({ type: z.enum(["sale", "withdrawal"]), description: z.string().trim().min(3).max(320), amountCents: positiveCentsZodSchema })).mutation(({ ctx, input }) => createMemberFinanceEntry(ctx.user.id, input)),
    academy: protectedProcedure.query(({ ctx }) => getMemberCourses(ctx.user.id)),
    courses: protectedProcedure.query(({ ctx }) => getMemberCourses(ctx.user.id)),
    course: protectedProcedure.input(z.object({ routeKey: z.string().trim().min(3).max(160) })).query(({ ctx, input }) => getMemberCourseByRouteKey(ctx.user.id, input.routeKey)),
    updateCourseProgress: protectedProcedure.input(z.object({ courseId: z.number().int().positive(), progressPercent: z.number().int().min(0).max(100) })).mutation(({ ctx, input }) => updateMemberCourseProgress(ctx.user.id, input.courseId, input.progressPercent)),
    profile: protectedProcedure.query(({ ctx }) => getMemberProfile(ctx.user.id)),
    updateProfile: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => updateMemberProfile(ctx.user.id, input)),
    uploadProfilePhoto: protectedProcedure.input(profilePhotoInput).mutation(({ ctx, input }) => uploadMemberProfilePhoto(ctx.user.id, input)),
    account: protectedProcedure.query(({ ctx }) => getMemberAccount(ctx.user.id)),
    updateAccount: protectedProcedure.input(accountInput).mutation(({ ctx, input }) => {
      const { confirmPassword: _confirmPassword, ...accountInputValue } = input;
      return updateMemberAccount(ctx.user.id, accountInputValue);
    }),
    receiving: protectedProcedure.query(({ ctx }) => getMemberReceivingPreference(ctx.user.id)),
    updateReceiving: protectedProcedure.input(receivingPreferenceInput).mutation(({ ctx, input }) => updateMemberReceivingPreference(ctx.user.id, input)),
    affiliateApplications: protectedProcedure.query(({ ctx }) => getMemberAffiliateApplications(ctx.user.id)),
    tickets: protectedProcedure.query(({ ctx }) => getMemberTickets(ctx.user.id)),
    createTicket: protectedProcedure.input(ticketInput).mutation(({ ctx, input }) => createMemberTicket(ctx.user.id, input)),
    content: protectedProcedure.query(() => getPublishedContent()),
    ebooks: protectedProcedure.query(() => getPublishedEbooks()),
    ebook: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getPublishedEbook(input.id)),
    contacts: protectedProcedure.query(({ ctx }) => getMemberContacts(ctx.user.id)),
    createContact: protectedProcedure.input(captureContactInput).mutation(({ ctx, input }) => createMemberContact(ctx.user.id, input)),
    updateContact: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "contacted", "qualified", "archived"]), source: z.string().trim().min(2).max(160).optional() })).mutation(({ ctx, input }) => updateMemberContact(ctx.user.id, input.id, input)),
    invitations: protectedProcedure.query(({ ctx }) => getMemberInvitations(ctx.user.id)),
    createInvitation: protectedProcedure.input(invitationInput).mutation(({ ctx, input }) => createMemberInvitation(ctx.user.id, input)),
    activities: protectedProcedure.query(({ ctx }) => getMemberActivities(ctx.user.id)),
    referrals: protectedProcedure.query(({ ctx }) => getMemberReferrals(ctx.user.id)),
    performance: protectedProcedure.query(({ ctx }) => getMemberPerformance(ctx.user.id)),
    testimonials: protectedProcedure.query(({ ctx }) => getMemberTestimonials(ctx.user.id)),
    createTestimonial: protectedProcedure.input(testimonialInput).mutation(({ ctx, input }) => createMemberTestimonial(ctx.user.id, input)),
    specialAccess: protectedProcedure.query(({ ctx }) => getMemberSpecialAccess(ctx.user.id)),
    updateSpecialAccess: protectedProcedure.input(specialAccessInput).mutation(({ ctx, input }) => updateMemberSpecialAccess(ctx.user.id, input)),
  }),
  applications: router({
    submit: publicProcedure.input(applicationInputSchema).mutation(({ ctx, input }) => createApplication(input, ctx.req)),
    lookup: publicProcedure.input(z.object({ trackingCode: z.string().trim().min(6).max(24), email: normalizedEmailZodSchema })).query(({ input }) => getApplicationTracking(input.trackingCode, input.email)),
  }),
  public: router({
    affiliateProfile: publicProcedure.input(z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).min(3).max(96) })).query(({ input }) => getPublicAffiliateProfile(input.slug)),
    specialAccess: publicProcedure.input(z.object({ code: z.string().trim().toLowerCase().regex(/^[a-z0-9]+$/).min(8).max(48) })).query(({ input }) => getPublicSpecialAccess(input.code)),
    salesSectionImages: publicProcedure.query(() => getPublicSalesSectionImages()),
    unlockSpecialAccess: publicProcedure.input(z.object({ code: z.string().trim().toLowerCase().regex(/^[a-z0-9]+$/).min(8).max(48), password: z.string().min(1).max(128) })).mutation(({ input }) => unlockPublicSpecialAccess(input.code, input.password)),
  }),
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    applications: adminProcedure.query(() => getRecentApplications(100)),
    updateApplication: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "contacted", "approved", "archived"]), adminNote: z.string().max(2000).optional() })).mutation(({ input }) => updateAdminApplication(input.id, input)),
    transactions: adminProcedure.query(() => getAdminTransactions()),
    financeMembers: adminProcedure.query(() => getFinanceMembers()),
    createTransaction: adminProcedure.input(z.object({ userId: z.number().int().positive(), type: z.enum(["sale", "commission", "adjustment", "withdrawal"]), description: z.string().trim().min(3).max(320), amountCents: positiveCentsZodSchema, status: z.enum(["pending", "posted", "void"]) })).mutation(({ ctx, input }) => createAdminTransaction(ctx.user.id, input)),
    updateTransaction: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "posted", "void"]), adminNote: z.string().trim().max(2000).optional() })).mutation(({ input }) => updateAdminTransaction(input.id, input)),
    courses: adminProcedure.query(() => getAdminCourses()),
    createCourse: adminProcedure.input(courseInput).mutation(({ input }) => createAdminCourse(input)),
    updateCourse: adminProcedure.input(courseInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => { const { id, ...course } = input; return updateAdminCourse(id, course); }),
    updateCoursePublication: adminProcedure.input(z.object({ id: z.number().int().positive(), isPublished: z.boolean() })).mutation(({ input }) => updateAdminCoursePublication(input.id, input.isPublished)),
    products: adminProcedure.query(() => getAdminProducts()),
    updateProductStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "active", "archived"]) })).mutation(({ input }) => updateAdminProductStatus(input.id, input.status)),
    content: adminProcedure.query(() => getAdminContent()),
    createContent: adminProcedure.input(contentInput).mutation(({ ctx, input }) => createAdminContent({ ...input, createdBy: ctx.user.id })),
    updateContent: adminProcedure.input(contentInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => { const { id, ...content } = input; return updateAdminContent(id, content); }),
    updateContentStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "published", "archived"]) })).mutation(({ input }) => updateAdminContentStatus(input.id, input.status)),
    ebooks: adminProcedure.query(() => getAdminEbooks()),
    ebook: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getAdminEbook(input.id)),
    createEbook: adminProcedure.input(ebookInput).mutation(({ ctx, input }) => createAdminEbook({ ...input, createdBy: ctx.user.id })),
    updateEbook: adminProcedure.input(ebookInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...ebook } = input;
      return updateAdminEbook(id, ebook);
    }),
    tickets: adminProcedure.query(() => getAdminTickets()),
    updateTicket: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["open", "answered", "closed"]), adminResponse: z.string().trim().max(8000).optional().nullable() })).mutation(({ input }) => updateAdminTicket(input.id, input)),
    contacts: adminProcedure.query(() => getAdminContacts()),
    updateContact: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "contacted", "qualified", "archived"]) })).mutation(({ input }) => updateAdminContact(input.id, input)),
    activities: adminProcedure.query(() => getAdminActivities()),
    invitations: adminProcedure.query(() => getAdminInvitations()),
    updateInvitation: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["prepared", "cancelled"]) })).mutation(({ input }) => updateAdminInvitation(input.id, input.status)),
    performance: adminProcedure.query(() => getAdminPerformance()),
    performanceMembers: adminProcedure.query(() => getPerformanceMembers()),
    createPointEntry: adminProcedure.input(z.object({ userId: z.number().int().positive(), amount: signedPointsZodSchema, reason: z.string().trim().min(3).max(320), status: z.enum(["pending", "posted", "void"]) })).mutation(({ ctx, input }) => createAdminPointEntry(ctx.user.id, input)),
    updatePointEntry: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "posted", "void"]) })).mutation(({ input }) => updateAdminPointEntry(input.id, input)),
    testimonials: adminProcedure.query(() => getAdminTestimonials()),
    updateTestimonial: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "approved", "rejected", "archived"]), adminNote: z.string().trim().max(4000).optional().nullable() })).mutation(({ input }) => updateAdminTestimonial(input.id, input)),
    specialAccess: adminProcedure.query(() => getAdminSpecialAccessPages()),
    publicSalesSectionImages: adminProcedure.query(() => getAdminPublicSalesSectionImages()),
    upsertPublicSalesSectionImage: adminProcedure.input(publicSalesSectionImageInput).mutation(({ ctx, input }) => upsertAdminPublicSalesSectionImage(ctx.user.id, input.sectionId, input)),
    removePublicSalesSectionImage: adminProcedure.input(z.object({ sectionId: z.string().trim().regex(/^[a-z0-9_]+$/).min(3).max(64) })).mutation(({ input }) => removeAdminPublicSalesSectionImage(input.sectionId)),
    updateSpecialAccess: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "published", "paused"]), adminNote: z.string().trim().max(2000).optional().nullable() })).mutation(({ input }) => updateAdminSpecialAccessPage(input.id, input)),
    referralMembers: adminProcedure.query(() => getReferralMembers()),
    referralLinks: adminProcedure.query(() => getAdminReferralLinks()),
    setReferralLink: adminProcedure.input(z.object({ sponsorId: z.number().int().positive(), referredUserId: z.number().int().positive(), status: z.enum(["active", "archived"]) })).mutation(({ input }) => setAdminReferralLink(input)),
  }),
});
export type AppRouter = typeof appRouter;
