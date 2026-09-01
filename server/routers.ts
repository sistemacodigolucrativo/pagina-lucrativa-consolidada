import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { applicationInputSchema, applicationPersonalizationSchema } from "@shared/applications";
import { normalizedEmailZodSchema, optionalPhoneZodSchema } from "@shared/contactValidation";
import { httpUrlZodSchema, normalizePixKey, normalizePixKeyByType, pixKeyZodSchema, validatePixKeyByType } from "@shared/structuredValidation";
import {
  createAdminContent,
  createAdminEbook,
  createApplication,
  getApplicationTracking,
  getApplicationPaymentPage,
  createMemberCampaign,
  createMemberTicket,
  createMemberContact,
  createMemberInvitation,
  deleteMemberCampaign,
  getAdminContent,
  getAdminEbook,
  getAdminEbooks,
  getAdminOverview,
  getAdminTickets,
  getAdminActivities,
  getMemberCampaigns,
  getMemberOperationAnalytics,
  getMemberOperationConversions,
  getMemberOverview,
  getMemberFinance,
  getMemberProfile,
  markMemberGettingStartedMetricsViewed,
  getMemberAccount,
  resetPasswordWithSecurityAnswer,
  getMemberReceivingPreference,
  markMemberReceivingResponsibleUseModalSeen,
  getMemberPaymentLinks,
  getMemberAffiliateApplications,
  getMemberAffiliateApplication,
  getMemberNotifications,
  getMemberTickets,
  getMemberContacts,
  getMemberInvitations,
  getMemberActivities,
  getPublishedContent,
  getPublicSalesSectionImages,
  getAdminPublicSalesSectionImages,
  getDefaultPublicAffiliateProfile,
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
  updateAdminContent,
  updateAdminContentStatus,
  updateAdminEbook,
  updateAdminTicket,
  updateMemberProfile,
  uploadMemberProfilePhoto,
  updateMemberAccount,
  updateMemberSecurityRecovery,
  updateMemberReceivingPreference,
  updateMemberPaymentLinks,
  uploadApplicationPaymentReceipt,
  markMemberNotificationRead,
  reviewPaymentReceipt,
  completeApplicationPersonalization,
  getApplicationPersonalizationAccess,
  updateMemberContact,
  getAdminReferralLinks,
  getMemberReferrals,
  getMemberPerformance,
  getAdminInvitations,
  updateAdminInvitation,
  getMemberTestimonials,
  createMemberTestimonial,
  getAdminTestimonials,
  updateAdminTestimonial,
  getPublicSalesSocialProof,
  removeAdminPublicSalesSectionImage,
  upsertAdminPublicSalesSectionImage,
  startSecurityPasswordRecovery,
} from "./db";
import { createDemoSession, DEMO_SESSION_COOKIE_NAME, demoLoginInputSchema, resolveDemoAccount } from "./demoAuth";
import { applicationReceiptUploadSchema, memberPaymentLinksInputSchema, paymentAccessInputSchema } from "@shared/applications";
import { z } from "zod";

const campaignInput = z.object({
  name: z.string().trim().min(3).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Use letras, números e hífens.").min(3).max(128),
  destinationUrl: httpUrlZodSchema,
  source: z.string().trim().max(96).optional().nullable(),
  medium: z.string().trim().max(96).optional().nullable(),
  content: z.string().trim().max(160).optional().nullable(),
});

function normalizePostalCode(value: string) {
  const digits = value.replace(/\D/g, "");
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export const profileInput = z.object({
  slug: z.string().trim().toLowerCase().regex(/^(?=.*[a-z0-9])[a-z0-9-]+$/, "Use letras, números e hífens.").min(3).max(96),
  bio: z.string().trim().max(2000).optional().nullable(),
  whatsapp: optionalPhoneZodSchema,
  websiteUrl: httpUrlZodSchema.max(512).optional().nullable(),
  facebookUrl: httpUrlZodSchema.max(512).optional().nullable(),
  instagramUrl: httpUrlZodSchema.max(512).optional().nullable(),
  twitterUrl: httpUrlZodSchema.max(512).optional().nullable(),
  linkedinUrl: httpUrlZodSchema.max(512).optional().nullable(),
  youtubeUrl: httpUrlZodSchema.max(512).optional().nullable(),
  skype: z.string().trim().max(255).optional().nullable(),
  address: z.string().trim().min(1, "Este campo é obrigatório.").max(255),
  addressNumber: z.string().trim().max(32).optional().nullable(),
  addressComplement: z.string().trim().max(160).optional().nullable(),
  postalCode: z.string().trim().min(1, "Este campo é obrigatório.").max(9).regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido no formato 00000-000.").transform(normalizePostalCode),
  district: z.string().trim().min(1, "Este campo é obrigatório.").max(120),
  city: z.string().trim().min(1, "Este campo é obrigatório.").max(120),
  state: z.string().trim().min(1, "Este campo é obrigatório.").max(80),
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
export const securityRecoveryInput = z.object({
  securityQuestion: z.string().trim().min(6, "Informe uma pergunta secreta.").max(240),
  securityAnswer: z.string().trim().min(3, "Informe uma resposta secreta com pelo menos 3 caracteres.").max(180),
});
const passwordRecoveryStartInput = z.object({
  identifier: normalizedEmailZodSchema,
});
const passwordRecoveryResetInput = z.object({
  identifier: normalizedEmailZodSchema,
  securityAnswer: z.string().trim().min(1, "Informe a resposta secreta.").max(180),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres.").max(128),
  confirmPassword: z.string().max(128),
}).superRefine((value, context) => {
  if (value.newPassword !== value.confirmPassword) context.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "As senhas não conferem." });
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
  bank3Name: z.string().trim().max(180).optional().nullable(),
  bank3Agency: z.string().trim().max(64).optional().nullable(),
  bank3Account: z.string().trim().max(96).optional().nullable(),
  bank3Type: z.enum(["checking", "savings"]).optional().nullable(),
  bank3Holder: z.string().trim().max(180).optional().nullable(),
  bank4Name: z.string().trim().max(180).optional().nullable(),
  bank4Agency: z.string().trim().max(64).optional().nullable(),
  bank4Account: z.string().trim().max(96).optional().nullable(),
  bank4Type: z.enum(["checking", "savings"]).optional().nullable(),
  bank4Holder: z.string().trim().max(180).optional().nullable(),
  pixType: z.string().trim().max(64).optional().nullable(),
  pixKey: z.string().trim().max(255).optional().nullable(),
}).superRefine((value, context) => {
  if (value.method === "pix" && !value.receivingKey && !value.pixKey) context.addIssue({ code: z.ZodIssueCode.custom, path: ["pixKey"], message: "Informe a chave PIX." });
  if (value.method === "pix" && value.receivingKey && !value.pixKey && !pixKeyZodSchema.safeParse(value.receivingKey).success) context.addIssue({ code: z.ZodIssueCode.custom, path: ["receivingKey"], message: "Informe uma chave PIX válida." });
  if (value.pixKey && !value.pixType) context.addIssue({ code: z.ZodIssueCode.custom, path: ["pixType"], message: "Selecione o tipo da chave PIX." });
  if (value.pixKey && value.pixType && !validatePixKeyByType(value.pixKey, value.pixType)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["pixKey"], message: "A chave PIX não corresponde ao tipo selecionado." });
}).transform(value => {
  const normalizedTypedPixKey = value.pixKey && value.pixType ? normalizePixKeyByType(value.pixKey, value.pixType) : value.pixKey?.trim() || null;
  return {
    ...value,
    receivingKey: value.method === "pix" ? (normalizedTypedPixKey || (value.receivingKey ? normalizePixKey(value.receivingKey) : null)) : value.receivingKey?.trim() || null,
    pixKey: normalizedTypedPixKey,
  };
});
const ticketInput = z.object({ subject: z.string().trim().min(4).max(180), message: z.string().trim().min(10).max(8000) });
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
const googleDriveHosts = new Set(["drive.google.com", "docs.google.com", "drive.usercontent.google.com"]);
const isAllowedGoogleDriveUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && googleDriveHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};
const contentInputBase = z.object({
  kind: z.enum(["material", "article", "faq", "notice"]),
  title: z.string().trim().min(3).max(240),
  summary: z.string().trim().max(8000).optional().nullable(),
  body: z.string().trim().max(60000).optional().nullable(),
  resourceUrl: z.string().trim().max(2048).optional().nullable(),
  resourceCategory: z.string().trim().max(96).optional().nullable(),
  resourceType: z.string().trim().max(96).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]),
});
const validateMaterialResource = (input: z.infer<typeof contentInputBase>, ctx: z.RefinementCtx) => {
  const isMaterial = input.kind === "material";
  const resourceUrl = input.resourceUrl?.trim() ?? "";
  if (!isMaterial) return;
  if (input.status === "published" && !resourceUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["resourceUrl"], message: "Informe o link do Google Drive antes de publicar o recurso." });
    return;
  }
  if (resourceUrl && !isAllowedGoogleDriveUrl(resourceUrl)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["resourceUrl"], message: "Use uma URL HTTPS válida do Google Drive." });
  }
};
const contentInput = contentInputBase.superRefine(validateMaterialResource);
const updateContentInput = contentInputBase.extend({ id: z.number().int().positive() }).superRefine(validateMaterialResource);

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
export const testimonialInput = z.object({ content: z.string().trim().min(30).max(8000), rating: z.number().int().min(1).max(5), authorConfirmed: z.literal(true) });
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
    startPasswordRecovery: publicProcedure.input(passwordRecoveryStartInput).mutation(({ input }) => startSecurityPasswordRecovery(input.identifier)),
    resetPasswordWithSecurityAnswer: publicProcedure.input(passwordRecoveryResetInput).mutation(({ input }) => {
      const { confirmPassword: _confirmPassword, ...resetInput } = input;
      return resetPasswordWithSecurityAnswer(resetInput);
    }),
  }),
  member: router({
    overview: protectedProcedure.query(({ ctx }) => getMemberOverview(ctx.user.id)),
    campaigns: protectedProcedure.query(({ ctx }) => getMemberCampaigns(ctx.user.id)),
    analytics: protectedProcedure.input(z.object({ period: z.enum(["7d", "30d", "90d", "all"]).default("30d") })).query(({ ctx, input }) => getMemberOperationAnalytics(ctx.user.id, input.period)),
    conversions: protectedProcedure.input(z.object({ period: z.enum(["7d", "30d", "90d", "all"]).default("30d") })).query(({ ctx, input }) => getMemberOperationConversions(ctx.user.id, input.period)),
    createCampaign: protectedProcedure.input(campaignInput).mutation(({ ctx, input }) => createMemberCampaign(ctx.user.id, input)),
    deleteCampaign: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteMemberCampaign(ctx.user.id, input.id)),
    finance: protectedProcedure.query(({ ctx }) => getMemberFinance(ctx.user.id)),
    academy: protectedProcedure.query(({ ctx }) => getMemberCourses(ctx.user.id)),
    courses: protectedProcedure.query(({ ctx }) => getMemberCourses(ctx.user.id)),
    course: protectedProcedure.input(z.object({ routeKey: z.string().trim().min(3).max(160) })).query(({ ctx, input }) => getMemberCourseByRouteKey(ctx.user.id, input.routeKey)),
    updateCourseProgress: protectedProcedure.input(z.object({ courseId: z.number().int().positive(), progressPercent: z.number().int().min(0).max(100) })).mutation(({ ctx, input }) => updateMemberCourseProgress(ctx.user.id, input.courseId, input.progressPercent)),
    profile: protectedProcedure.query(({ ctx }) => getMemberProfile(ctx.user.id)),
    markGettingStartedMetricsViewed: protectedProcedure.mutation(({ ctx }) => markMemberGettingStartedMetricsViewed(ctx.user.id)),
    updateProfile: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => updateMemberProfile(ctx.user.id, input)),
    uploadProfilePhoto: protectedProcedure.input(profilePhotoInput).mutation(({ ctx, input }) => uploadMemberProfilePhoto(ctx.user.id, input)),
    account: protectedProcedure.query(({ ctx }) => getMemberAccount(ctx.user.id)),
    updateAccount: protectedProcedure.input(accountInput).mutation(({ ctx, input }) => {
      const { confirmPassword: _confirmPassword, ...accountInputValue } = input;
      return updateMemberAccount(ctx.user.id, accountInputValue);
    }),
    updateSecurityRecovery: protectedProcedure.input(securityRecoveryInput).mutation(({ ctx, input }) => updateMemberSecurityRecovery(ctx.user.id, input)),
    receiving: protectedProcedure.query(({ ctx }) => getMemberReceivingPreference(ctx.user.id)),
    markReceivingResponsibleUseSeen: protectedProcedure.mutation(({ ctx }) => markMemberReceivingResponsibleUseModalSeen(ctx.user.id)),
    updateReceiving: protectedProcedure.input(receivingPreferenceInput).mutation(({ ctx, input }) => updateMemberReceivingPreference(ctx.user.id, input)),
    paymentLinks: protectedProcedure.query(({ ctx }) => getMemberPaymentLinks(ctx.user.id)),
    updatePaymentLinks: protectedProcedure.input(memberPaymentLinksInputSchema).mutation(({ ctx, input }) => updateMemberPaymentLinks(ctx.user.id, input)),
    affiliateApplications: protectedProcedure.query(({ ctx }) => getMemberAffiliateApplications(ctx.user.id)),
    affiliateApplication: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => getMemberAffiliateApplication(ctx.user.id, input.id)),
    reviewPaymentReceipt: protectedProcedure.input(z.object({ applicationId: z.number().int().positive(), receiptId: z.number().int().positive(), status: z.enum(["approved", "rejected"]) })).mutation(({ ctx, input }) => reviewPaymentReceipt(ctx.user.id, input)),
    notifications: protectedProcedure.query(({ ctx }) => getMemberNotifications(ctx.user.id)),
    markNotificationRead: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => markMemberNotificationRead(ctx.user.id, input.id)),
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
  }),
  applications: router({
    submit: publicProcedure.input(applicationInputSchema).mutation(({ ctx, input }) => createApplication(input, ctx.req)),
    lookup: publicProcedure.input(z.object({ trackingCode: z.string().trim().min(6).max(24), email: normalizedEmailZodSchema })).query(({ input }) => getApplicationTracking(input.trackingCode, input.email)),
    paymentPage: publicProcedure.input(paymentAccessInputSchema).mutation(({ input }) => getApplicationPaymentPage(input.trackingCode, input.paymentAccessToken)),
    uploadReceipt: publicProcedure.input(applicationReceiptUploadSchema).mutation(({ input }) => uploadApplicationPaymentReceipt(input)),
  }),
  public: router({
    affiliateProfile: publicProcedure.input(z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).min(3).max(96) })).query(({ input }) => getPublicAffiliateProfile(input.slug)),
    defaultAffiliateProfile: publicProcedure.query(() => getDefaultPublicAffiliateProfile()),
    applicationPersonalizationAccess: publicProcedure.input(z.object({ code: z.string().trim().toLowerCase().regex(/^[a-z0-9]+$/).min(8).max(48) })).query(({ input }) => getApplicationPersonalizationAccess(input.code)),
    salesSectionImages: publicProcedure.query(() => getPublicSalesSectionImages()),
    salesSocialProof: publicProcedure.query(() => getPublicSalesSocialProof()),
    completePersonalization: publicProcedure.input(applicationPersonalizationSchema).mutation(({ input }) => completeApplicationPersonalization(input)),
  }),
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    courses: adminProcedure.query(() => getAdminCourses()),
    createCourse: adminProcedure.input(courseInput).mutation(({ input }) => createAdminCourse(input)),
    updateCourse: adminProcedure.input(courseInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => { const { id, ...course } = input; return updateAdminCourse(id, course); }),
    updateCoursePublication: adminProcedure.input(z.object({ id: z.number().int().positive(), isPublished: z.boolean() })).mutation(({ input }) => updateAdminCoursePublication(input.id, input.isPublished)),
    content: adminProcedure.query(() => getAdminContent()),
    createContent: adminProcedure.input(contentInput).mutation(({ ctx, input }) => createAdminContent({ ...input, createdBy: ctx.user.id })),
    updateContent: adminProcedure.input(updateContentInput).mutation(({ input }) => { const { id, ...content } = input; return updateAdminContent(id, content); }),
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
    activities: adminProcedure.query(() => getAdminActivities()),
    invitations: adminProcedure.query(() => getAdminInvitations()),
    updateInvitation: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["prepared", "cancelled"]) })).mutation(({ input }) => updateAdminInvitation(input.id, input.status)),
    testimonials: adminProcedure.query(() => getAdminTestimonials()),
    updateTestimonial: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "approved", "rejected", "archived"]), adminNote: z.string().trim().max(4000).optional().nullable() })).mutation(({ input }) => updateAdminTestimonial(input.id, input)),
    publicSalesSectionImages: adminProcedure.query(() => getAdminPublicSalesSectionImages()),
    upsertPublicSalesSectionImage: adminProcedure.input(publicSalesSectionImageInput).mutation(({ ctx, input }) => upsertAdminPublicSalesSectionImage(ctx.user.id, input.sectionId, input)),
    removePublicSalesSectionImage: adminProcedure.input(z.object({ sectionId: z.string().trim().regex(/^[a-z0-9_]+$/).min(3).max(64) })).mutation(({ input }) => removeAdminPublicSalesSectionImage(input.sectionId)),
    referralLinks: adminProcedure.query(() => getAdminReferralLinks()),
  }),
});
export type AppRouter = typeof appRouter;
