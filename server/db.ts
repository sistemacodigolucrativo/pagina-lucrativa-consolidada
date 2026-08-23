import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import {
  applications,
  applicationAccessTokens,
  applicationPaymentReceipts,
  campaignLinks,
  campaignClickEvents,
  campaignAttributions,
  campaignConversions,
  courseProgress,
  courses,
  ebooks,
  InsertUser,
  managedContent,
  memberAccountDetails,
  memberNotifications,
  memberPaymentLinks,
  memberProfiles,
  receivingPreferences,
  referralLinks,
  memberContacts,
  memberInvitations,
  memberActivities,
  memberTestimonials,
  pointEntries,
  platformSettings,
  publicSalesSectionImages,
  supportTickets,
  transactions,
  users,
} from "../drizzle/schema";
import { OFFER_AMOUNT_CENTS, type ApplicationInput, type ApplicationPersonalizationInput, type ApplicationReceiptUpload, type MemberPaymentLinkInput } from "@shared/applications";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";
import { hashPassword } from "./credentialHash";
import { getPublicSalesSection } from "../shared/publicSalesSections";

const VPS_SOCKET_PATH = "/run/mysqld/mysqld.sock";
const HIDE_EXTERNAL_PREVIEW_NOTICE_KEY = "hideExternalPreviewNotice";
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (_db) return _db;
  try {
    if (process.env.DATABASE_URL) {
      _db = drizzle(process.env.DATABASE_URL);
    } else if (existsSync(VPS_SOCKET_PATH)) {
      _db = drizzle({
        connection: {
          socketPath: VPS_SOCKET_PATH,
          user: "ubuntu",
          database: "pagina_lucrativa",
          connectionLimit: 5,
        },
      });
    }
  } catch (error) {
    console.warn("[Database] Failed to connect:", error);
    _db = null;
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  try {
    const db = await getDb();
    if (!db) return undefined;
    const normalized = email.trim().toLowerCase();
    const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
    return result[0];
  } catch {
    return undefined;
  }
}

export async function authenticateLocalUser(identifier: string, password: string) {
  try {
    const user = await getUserByEmail(identifier);
    if (!user?.passwordHash) return null;
    const candidateHash = hashPassword(password);
    const stored = Buffer.from(user.passwordHash, "hex");
    const candidate = Buffer.from(candidateHash, "hex");
    if (stored.length !== candidate.length || stored.length === 0 || !timingSafeEqual(stored, candidate)) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getMemberOverview(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [profileRows, links, applicationRows, recentApplications, tickets] = await Promise.all([
    db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1),
    db.select().from(campaignLinks).where(eq(campaignLinks.userId, userId)),
    db.select().from(applications).where(eq(applications.ownerUserId, userId)),
    db.select().from(applications).where(eq(applications.ownerUserId, userId)).orderBy(desc(applications.createdAt)).limit(5),
    db.select().from(supportTickets).where(and(eq(supportTickets.userId, userId), eq(supportTickets.status, "open"))),
  ]);
  const confirmedApplications = applicationRows.filter(application => application.paymentStatus === "confirmed");
  return {
    profile: profileRows[0] ?? null,
    campaignCount: links.length,
    campaignClicks: links.reduce((total, link) => total + link.clicks, 0),
    confirmedApplicationCount: confirmedApplications.length,
    confirmedApplicationValueCents: confirmedApplications.reduce((total, application) => total + application.offerAmountCents, 0),
    awaitingReviewCount: applicationRows.filter(application => application.paymentStatus === "receipt_received").length,
    openTicketCount: tickets.length,
    recentApplications,
  };
}

export async function getMemberFinance(userId: number) {
  const db = await getDb();
  if (!db) return { entries: [], confirmedCount: 0, confirmedValueCents: 0, awaitingReviewCount: 0 };
  const entries = await db.select({
    id: applications.id,
    trackingCode: applications.trackingCode,
    fullName: applications.fullName,
    email: applications.email,
    offerAmountCents: applications.offerAmountCents,
    paymentStatus: applications.paymentStatus,
    createdAt: applications.createdAt,
    updatedAt: applications.updatedAt,
  }).from(applications).where(eq(applications.ownerUserId, userId)).orderBy(desc(applications.createdAt));
  const confirmed = entries.filter(entry => entry.paymentStatus === "confirmed");
  return {
    entries,
    confirmedCount: confirmed.length,
    confirmedValueCents: confirmed.reduce((total, entry) => total + entry.offerAmountCents, 0),
    awaitingReviewCount: entries.filter(entry => entry.paymentStatus === "receipt_received").length,
  };
}
export async function getAdminTransactions() {
  const db = await getDb();
  if (!db) return [];
  const [rows, memberRows] = await Promise.all([db.select().from(transactions).orderBy(desc(transactions.occurredAt)), db.select({ id: users.id, name: users.name, email: users.email }).from(users)]);
  const members = new Map(memberRows.map(member => [member.id, member]));
  return rows.map(row => ({ ...row, memberName: members.get(row.userId)?.name ?? null, memberEmail: members.get(row.userId)?.email ?? null }));
}
export async function getFinanceMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email }).from(users).orderBy(users.id);
}
export async function createAdminTransaction(adminId: number, input: { userId: number; campaignId?: number | null; type: "sale" | "commission" | "adjustment"; description: string; amountCents: number; status: "pending" | "posted" | "void" }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const amountCents = Math.abs(input.amountCents);
  const result = await db.insert(transactions).values({ ...input, campaignId: input.campaignId ?? null, description: input.description.trim(), amountCents, createdBy: adminId });
  const id = Number(result[0].insertId);
  if (input.campaignId && input.status !== "pending") await syncTransactionCampaignConversion(id);
  return { id };
}
export async function updateAdminTransaction(transactionId: number, input: { status: "pending" | "posted" | "void"; adminNote?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(transactions).set({ status: input.status, adminNote: input.adminNote?.trim() || null }).where(eq(transactions.id, transactionId));
  await syncTransactionCampaignConversion(transactionId);
  return { success: true } as const;
}

export async function getMemberPerformance(userId: number) {
  const db = await getDb();
  if (!db) return { entries: [], postedPoints: 0 };
  const entries = await db.select().from(pointEntries).where(eq(pointEntries.userId, userId)).orderBy(desc(pointEntries.createdAt));
  return { entries, postedPoints: entries.filter(entry => entry.status === "posted").reduce((total, entry) => total + entry.amount, 0) };
}

export async function getPerformanceMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.role, "user")).orderBy(desc(users.id));
}

export async function getAdminPerformance() {
  const db = await getDb();
  if (!db) return { entries: [], members: [] };
  const [entries, members] = await Promise.all([
    db.select().from(pointEntries).orderBy(desc(pointEntries.createdAt)),
    getPerformanceMembers(),
  ]);
  return { entries, members };
}

export async function createAdminPointEntry(adminId: number, input: { userId: number; amount: number; reason: string; status: "pending" | "posted" | "void" }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const member = await db.select({ id: users.id }).from(users).where(and(eq(users.id, input.userId), eq(users.role, "user"))).limit(1);
  if (!member[0]) throw new Error("Membro não encontrado.");
  const result = await db.insert(pointEntries).values({ userId: input.userId, amount: input.amount, reason: input.reason.trim(), status: input.status, createdBy: adminId });
  return { id: Number(result[0].insertId) };
}

export async function updateAdminPointEntry(id: number, input: { status: "pending" | "posted" | "void" }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(pointEntries).set({ status: input.status }).where(eq(pointEntries.id, id));
  return { success: true };
}

export async function getMemberCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignLinks).where(eq(campaignLinks.userId, userId)).orderBy(desc(campaignLinks.createdAt));
}

export async function createMemberCampaign(userId: number, input: { name: string; slug: string; destinationUrl: string; source?: string | null; medium?: string | null; content?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const result = await db.insert(campaignLinks).values({ userId, ...input });
  return { id: Number(result[0].insertId) };
}

export type CampaignAnalyticsPeriod = "7d" | "30d" | "90d" | "all";

function getAnalyticsStart(period: CampaignAnalyticsPeriod) {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function getMemberOperationAnalytics(userId: number, period: CampaignAnalyticsPeriod = "30d") {
  const db = await getDb();
  if (!db) return { period, campaigns: [], totals: { campaigns: 0, clicks: 0, uniqueVisitors: 0, sessions: 0, conversions: 0, leads: 0, applications: 0 }, recentEvents: [] };
  const start = getAnalyticsStart(period);
  const eventWhere = start ? and(eq(campaignClickEvents.userId, userId), gte(campaignClickEvents.occurredAt, start)) : eq(campaignClickEvents.userId, userId);
  const conversionWhere = start ? and(eq(campaignConversions.userId, userId), eq(campaignConversions.status, "active"), gte(campaignConversions.occurredAt, start)) : and(eq(campaignConversions.userId, userId), eq(campaignConversions.status, "active"));
  const [campaignRows, clickTotals, visitorTotals, sessionTotals, conversionTotals, leadTotals, applicationTotals, clickByCampaign, visitorsByCampaign, sessionsByCampaign, conversionByCampaign, recentEvents] = await Promise.all([
    db.select().from(campaignLinks).where(eq(campaignLinks.userId, userId)).orderBy(desc(campaignLinks.createdAt)),
    db.select({ value: sql<number>`COUNT(*)` }).from(campaignClickEvents).where(eventWhere),
    db.select({ value: sql<number>`COUNT(DISTINCT ${campaignClickEvents.visitorId})` }).from(campaignClickEvents).where(eventWhere),
    db.select({ value: sql<number>`COUNT(DISTINCT ${campaignClickEvents.sessionId})` }).from(campaignClickEvents).where(eventWhere),
    db.select({ value: sql<number>`COUNT(*)` }).from(campaignConversions).where(conversionWhere),
    db.select({ value: sql<number>`COUNT(*)` }).from(campaignConversions).where(and(conversionWhere, eq(campaignConversions.conversionType, "lead"))),
    db.select({ value: sql<number>`COUNT(*)` }).from(campaignConversions).where(and(conversionWhere, eq(campaignConversions.conversionType, "application"))),
    db.select({ campaignId: campaignClickEvents.campaignId, value: sql<number>`COUNT(*)` }).from(campaignClickEvents).where(eventWhere).groupBy(campaignClickEvents.campaignId),
    db.select({ campaignId: campaignClickEvents.campaignId, value: sql<number>`COUNT(DISTINCT ${campaignClickEvents.visitorId})` }).from(campaignClickEvents).where(eventWhere).groupBy(campaignClickEvents.campaignId),
    db.select({ campaignId: campaignClickEvents.campaignId, value: sql<number>`COUNT(DISTINCT ${campaignClickEvents.sessionId})` }).from(campaignClickEvents).where(eventWhere).groupBy(campaignClickEvents.campaignId),
    db.select({ campaignId: campaignConversions.campaignId, value: sql<number>`COUNT(*)` }).from(campaignConversions).where(conversionWhere).groupBy(campaignConversions.campaignId),
    db.select({ campaignId: campaignClickEvents.campaignId, occurredAt: campaignClickEvents.occurredAt, visitorId: campaignClickEvents.visitorId, deviceType: campaignClickEvents.deviceType, referrerOrigin: campaignClickEvents.referrerOrigin }).from(campaignClickEvents).where(eventWhere).orderBy(desc(campaignClickEvents.occurredAt)).limit(50),
  ]);
  const clickMap = new Map(clickByCampaign.map(row => [row.campaignId, Number(row.value ?? 0)]));
  const visitorMap = new Map(visitorsByCampaign.map(row => [row.campaignId, Number(row.value ?? 0)]));
  const sessionMap = new Map(sessionsByCampaign.map(row => [row.campaignId, Number(row.value ?? 0)]));
  const conversionMap = new Map(conversionByCampaign.map(row => [row.campaignId, Number(row.value ?? 0)]));
  const campaigns = campaignRows.map(campaign => ({
    ...campaign,
    eventClicks: clickMap.get(campaign.id) ?? 0,
    uniqueVisitors: visitorMap.get(campaign.id) ?? 0,
    sessions: sessionMap.get(campaign.id) ?? 0,
    periodConversions: conversionMap.get(campaign.id) ?? 0,
  }));
  return {
    period,
    campaigns,
    totals: {
      campaigns: campaignRows.length,
      clicks: Number(clickTotals[0]?.value ?? 0),
      uniqueVisitors: Number(visitorTotals[0]?.value ?? 0),
      sessions: Number(sessionTotals[0]?.value ?? 0),
      conversions: Number(conversionTotals[0]?.value ?? 0),
      leads: Number(leadTotals[0]?.value ?? 0),
      applications: Number(applicationTotals[0]?.value ?? 0),
    },
    recentEvents,
  };
}

export async function getMemberOperationConversions(userId: number, period: CampaignAnalyticsPeriod = "30d") {
  const db = await getDb();
  if (!db) return [];
  const start = getAnalyticsStart(period);
  const where = start ? and(eq(campaignConversions.userId, userId), eq(campaignConversions.status, "active"), gte(campaignConversions.occurredAt, start)) : and(eq(campaignConversions.userId, userId), eq(campaignConversions.status, "active"));
  return db.select({
    id: campaignConversions.id,
    campaignId: campaignConversions.campaignId,
    campaignName: campaignLinks.name,
    conversionType: campaignConversions.conversionType,
    entityType: campaignConversions.entityType,
    entityId: campaignConversions.entityId,
    valueCents: campaignConversions.valueCents,
    status: campaignConversions.status,
    captureMode: campaignConversions.captureMode,
    occurredAt: campaignConversions.occurredAt,
  }).from(campaignConversions).innerJoin(campaignLinks, eq(campaignConversions.campaignId, campaignLinks.id)).where(where).orderBy(desc(campaignConversions.occurredAt)).limit(200);
}

type CampaignClickMetadata = {
  visitorId: string;
  sessionId: string;
  occurredAt: Date;
  referrerOrigin?: string | null;
  userAgentCategory?: string | null;
  deviceType?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  landingPath?: string | null;
};

type PublicCampaign = {
  id: number;
  userId: number;
  name: string;
  slug: string;
  destinationUrl: string;
  source: string | null;
  medium: string | null;
  content: string | null;
  status: "active" | "paused" | "archived";
};

async function recordCampaignClick(campaign: PublicCampaign, metadata: CampaignClickMetadata) {
  const db = await getDb();
  if (!db || campaign.status !== "active") return null;
  const expiresAt = new Date(metadata.occurredAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  await db.transaction(async tx => {
    await tx.insert(campaignClickEvents).values({
      campaignId: campaign.id,
      userId: campaign.userId,
      visitorId: metadata.visitorId,
      sessionId: metadata.sessionId,
      occurredAt: metadata.occurredAt,
      referrerOrigin: metadata.referrerOrigin ?? null,
      userAgentCategory: metadata.userAgentCategory ?? null,
      deviceType: metadata.deviceType ?? null,
      utmSource: metadata.utmSource ?? campaign.source ?? null,
      utmMedium: metadata.utmMedium ?? campaign.medium ?? null,
      utmCampaign: metadata.utmCampaign ?? campaign.name,
      utmContent: metadata.utmContent ?? campaign.content ?? null,
      landingPath: metadata.landingPath ?? null,
    });
    await tx.insert(campaignAttributions).values({
      campaignId: campaign.id,
      userId: campaign.userId,
      visitorId: metadata.visitorId,
      sessionId: metadata.sessionId,
      firstOccurredAt: metadata.occurredAt,
      lastOccurredAt: metadata.occurredAt,
      expiresAt,
      source: metadata.utmSource ?? campaign.source ?? null,
      medium: metadata.utmMedium ?? campaign.medium ?? null,
      campaignName: metadata.utmCampaign ?? campaign.name,
      content: metadata.utmContent ?? campaign.content ?? null,
    }).onDuplicateKeyUpdate({ set: {
      campaignId: campaign.id,
      lastOccurredAt: metadata.occurredAt,
      expiresAt,
      source: metadata.utmSource ?? campaign.source ?? null,
      medium: metadata.utmMedium ?? campaign.medium ?? null,
      campaignName: metadata.utmCampaign ?? campaign.name,
      content: metadata.utmContent ?? campaign.content ?? null,
    }});
    await tx.update(campaignLinks).set({ clicks: sql`${campaignLinks.clicks} + 1` }).where(eq(campaignLinks.id, campaign.id));
  });
  return campaign;
}

async function getActiveCampaignWhere(where: SQL | undefined) {
  if (!where) return null;
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    id: campaignLinks.id,
    userId: campaignLinks.userId,
    name: campaignLinks.name,
    slug: campaignLinks.slug,
    destinationUrl: campaignLinks.destinationUrl,
    source: campaignLinks.source,
    medium: campaignLinks.medium,
    content: campaignLinks.content,
    status: campaignLinks.status,
  }).from(campaignLinks).where(where).limit(1);
  return rows[0] && rows[0].status === "active" ? rows[0] as PublicCampaign : null;
}

export async function resolvePublicCampaignAndRecordClick(slug: string, metadata: CampaignClickMetadata) {
  const campaign = await getActiveCampaignWhere(eq(campaignLinks.slug, slug));
  return campaign ? recordCampaignClick(campaign, metadata) : null;
}

export async function resolvePublicMemberCampaignAndRecordClick(memberSlug: string, campaignSlug: string, metadata: CampaignClickMetadata) {
  const db = await getDb();
  if (!db) return null;
  const members = await db.select({ userId: memberProfiles.userId }).from(memberProfiles).where(eq(memberProfiles.slug, memberSlug)).limit(1);
  const member = members[0];
  if (!member) return null;
  const campaign = await getActiveCampaignWhere(and(eq(campaignLinks.userId, member.userId), eq(campaignLinks.slug, campaignSlug)));
  return campaign ? recordCampaignClick(campaign, metadata) : null;
}

type CampaignConversionInput = {
  campaignId: number;
  userId: number;
  attributionId?: number | null;
  visitorId?: string | null;
  sessionId?: string | null;
  conversionType: "lead" | "application" | "order" | "sale" | "commission";
  status?: "active" | "reversed";
  entityType: string;
  entityId?: number | null;
  valueCents?: number;
  captureMode?: "automatic" | "manual";
  occurredAt?: Date;
};

export async function getValidCampaignAttribution(userId: number, visitorId: string, sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(campaignAttributions).where(and(
    eq(campaignAttributions.userId, userId),
    eq(campaignAttributions.visitorId, visitorId),
    eq(campaignAttributions.sessionId, sessionId),
  )).limit(1);
  const attribution = rows[0];
  return attribution && attribution.expiresAt.getTime() >= Date.now() ? attribution : null;
}

export async function recordCampaignConversion(input: CampaignConversionInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const existing = input.entityId == null ? null : await db.select({ id: campaignConversions.id }).from(campaignConversions).where(and(
    eq(campaignConversions.entityType, input.entityType),
    eq(campaignConversions.entityId, input.entityId),
    eq(campaignConversions.conversionType, input.conversionType),
  )).limit(1);
  if (existing?.[0]) {
    await db.update(campaignConversions).set({ status: input.status ?? "active", valueCents: Math.max(0, input.valueCents ?? 0) }).where(eq(campaignConversions.id, existing[0].id));
    return { id: existing[0].id, created: false } as const;
  }
  const result = await db.insert(campaignConversions).values({
    campaignId: input.campaignId,
    userId: input.userId,
    attributionId: input.attributionId ?? null,
    visitorId: input.visitorId ?? null,
    sessionId: input.sessionId ?? null,
    conversionType: input.conversionType,
    status: input.status ?? "active",
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    valueCents: Math.max(0, input.valueCents ?? 0),
    captureMode: input.captureMode ?? "automatic",
    occurredAt: input.occurredAt ?? new Date(),
  });
  return { id: Number(result[0].insertId), created: true } as const;
}

async function syncTransactionCampaignConversion(transactionId: number) {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select({ id: transactions.id, userId: transactions.userId, campaignId: transactions.campaignId, type: transactions.type, amountCents: transactions.amountCents, status: transactions.status, occurredAt: transactions.occurredAt }).from(transactions).where(eq(transactions.id, transactionId)).limit(1);
  const transaction = rows[0];
  if (!transaction?.campaignId || !["sale", "commission"].includes(transaction.type)) return;
  const conversionType = transaction.type === "sale" ? "sale" : "commission";
  await recordCampaignConversion({
    campaignId: transaction.campaignId,
    userId: transaction.userId,
    conversionType,
    entityType: "transaction",
    entityId: transaction.id,
    valueCents: Math.abs(transaction.amountCents),
    status: transaction.status === "void" ? "reversed" : "active",
    captureMode: "manual",
    occurredAt: transaction.occurredAt,
  });
}

export async function deleteMemberCampaign(userId: number, campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.delete(campaignLinks).where(and(eq(campaignLinks.id, campaignId), eq(campaignLinks.userId, userId)));
  return { success: true } as const;
}

export async function getPublishedCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.isPublished, 1)).orderBy(desc(courses.updatedAt));
}

type CourseLevel = "fundamentos" | "pratica" | "avancado";
type CourseInput = { title: string; summary?: string | null; category?: string | null; durationMinutes: number; level: CourseLevel; ebookId: number | null; isPublished: boolean };

function createCourseRouteKey(title: string) {
  const stem = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "curso";
  return `${stem}-${randomUUID().slice(0, 8)}`;
}

async function assertCourseEbook(ebookId: number | null, mustBePublished: boolean) {
  if (!ebookId) {
    if (mustBePublished) throw new Error("Vincule um e-book publicado antes de disponibilizar este curso.");
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const result = await db.select({ id: ebooks.id, status: ebooks.status }).from(ebooks).where(eq(ebooks.id, ebookId)).limit(1);
  if (!result[0]) throw new Error("O e-book selecionado não existe.");
  if (mustBePublished && result[0].status !== "published") throw new Error("Selecione um e-book publicado para disponibilizar este curso.");
}

export async function getMemberCourses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const [courseRows, progressRows, publishedEbookRows] = await Promise.all([
    db.select().from(courses).where(eq(courses.isPublished, 1)).orderBy(desc(courses.updatedAt)),
    db.select().from(courseProgress).where(eq(courseProgress.userId, userId)),
    db.select({ id: ebooks.id }).from(ebooks).where(eq(ebooks.status, "published")),
  ]);
  const progressByCourse = new Map(progressRows.map(row => [row.courseId, row]));
  const publishedEbookIds = new Set(publishedEbookRows.map(ebook => ebook.id));
  return courseRows
    .filter(course => course.ebookId !== null && publishedEbookIds.has(course.ebookId))
    .map(course => ({ ...course, progressPercent: progressByCourse.get(course.id)?.progressPercent ?? 0, lastAccessedAt: progressByCourse.get(course.id)?.lastAccessedAt ?? null }));
}

export async function getMemberCourseByRouteKey(userId: number, routeKey: string) {
  const db = await getDb();
  if (!db) return null;
  const courseRows = await db.select().from(courses).where(and(eq(courses.routeKey, routeKey), eq(courses.isPublished, 1))).limit(1);
  const course = courseRows[0];
  if (!course?.ebookId) return null;
  const [ebookRows, progressRows] = await Promise.all([
    db.select().from(ebooks).where(and(eq(ebooks.id, course.ebookId), eq(ebooks.status, "published"))).limit(1),
    db.select().from(courseProgress).where(and(eq(courseProgress.userId, userId), eq(courseProgress.courseId, course.id))).limit(1),
  ]);
  const ebook = ebookRows[0];
  if (!ebook) return null;
  const progress = progressRows[0];
  return { ...course, ebook, progressPercent: progress?.progressPercent ?? 0, lastAccessedAt: progress?.lastAccessedAt ?? null };
}

export async function updateMemberCourseProgress(userId: number, courseId: number, progressPercent: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const course = await db.select({ id: courses.id }).from(courses).where(and(eq(courses.id, courseId), eq(courses.isPublished, 1))).limit(1);
  if (!course[0]) throw new Error("Curso não encontrado ou indisponível.");
  const normalized = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const now = new Date();
  await db.insert(courseProgress).values({ userId, courseId, progressPercent: normalized, lastAccessedAt: now }).onDuplicateKeyUpdate({ set: { progressPercent: normalized, lastAccessedAt: now } });
  return { courseId, progressPercent: normalized };
}

export async function getAdminCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).orderBy(desc(courses.updatedAt));
}

export async function createAdminCourse(input: CourseInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await assertCourseEbook(input.ebookId, input.isPublished);
  const result = await db.insert(courses).values({ title: input.title.trim(), routeKey: createCourseRouteKey(input.title), summary: input.summary?.trim() || null, category: input.category?.trim() || null, durationMinutes: input.durationMinutes, level: input.level, ebookId: input.ebookId, isPublished: input.isPublished ? 1 : 0 });
  return { id: Number(result[0].insertId) };
}

export async function updateAdminCourse(courseId: number, input: CourseInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await assertCourseEbook(input.ebookId, input.isPublished);
  await db.update(courses).set({ title: input.title.trim(), summary: input.summary?.trim() || null, category: input.category?.trim() || null, durationMinutes: input.durationMinutes, level: input.level, ebookId: input.ebookId, isPublished: input.isPublished ? 1 : 0 }).where(eq(courses.id, courseId));
  return { success: true } as const;
}

export async function updateAdminCoursePublication(courseId: number, isPublished: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  if (isPublished) {
    const courseRows = await db.select({ ebookId: courses.ebookId }).from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!courseRows[0]) throw new Error("Curso não encontrado.");
    await assertCourseEbook(courseRows[0].ebookId, true);
  }
  await db.update(courses).set({ isPublished: isPublished ? 1 : 0 }).where(eq(courses.id, courseId));
  return { success: true } as const;
}


export async function getMemberReferrals(userId: number) {
  const db = await getDb();
  if (!db) return { sponsor: null, referrals: [], activeCount: 0, archivedCount: 0 };
  const [links, memberRows] = await Promise.all([
    db.select().from(referralLinks),
    db.select({ id: users.id, name: users.name }).from(users),
  ]);
  const members = new Map(memberRows.map(member => [member.id, member]));
  const sponsorLink = links.find(link => link.referredUserId === userId && link.status === "active");
  const referrals = links.filter(link => link.sponsorId === userId).map(link => ({ ...link, name: members.get(link.referredUserId)?.name ?? null }));
  return {
    sponsor: sponsorLink ? { id: sponsorLink.sponsorId, name: members.get(sponsorLink.sponsorId)?.name ?? null, createdAt: sponsorLink.createdAt } : null,
    referrals,
    activeCount: referrals.filter(link => link.status === "active").length,
    archivedCount: referrals.filter(link => link.status === "archived").length,
  };
}
export async function getReferralMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email }).from(users).orderBy(users.id);
}
export async function getAdminReferralLinks() {
  const db = await getDb();
  if (!db) return [];
  const [links, memberRows] = await Promise.all([db.select().from(referralLinks).orderBy(desc(referralLinks.updatedAt)), db.select({ id: users.id, name: users.name }).from(users)]);
  const members = new Map(memberRows.map(member => [member.id, member]));
  return links.map(link => ({ ...link, sponsorName: members.get(link.sponsorId)?.name ?? null, referredName: members.get(link.referredUserId)?.name ?? null }));
}
export async function setAdminReferralLink(input: { sponsorId: number; referredUserId: number; status: "active" | "archived" }) {
  if (input.sponsorId === input.referredUserId) throw new Error("Um membro não pode patrocinar a si mesmo.");
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const people = await db.select({ id: users.id }).from(users).where(eq(users.id, input.sponsorId)).limit(1);
  const referred = await db.select({ id: users.id }).from(users).where(eq(users.id, input.referredUserId)).limit(1);
  if (!people[0] || !referred[0]) throw new Error("Patrocinador ou indicado não foi encontrado.");
  await db.insert(referralLinks).values(input).onDuplicateKeyUpdate({ set: { sponsorId: input.sponsorId, status: input.status } });
  return { success: true } as const;
}

export async function getMemberProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export type MemberAccount = {
  name: string | null;
  email: string | null;
  role: "admin" | "user";
  updatedAt: Date;
};

export type MemberAccountUpdateInput = {
  name: string;
  email: string;
  newPassword?: string | null;
};

export async function getMemberAccount(userId: number): Promise<MemberAccount | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ name: users.name, email: users.email, role: users.role, updatedAt: users.updatedAt }).from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] ?? null;
}

export async function getStoredPasswordHash(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  return rows[0]?.passwordHash ?? null;
}

export async function getStoredPasswordHashByOpenId(openId: string) {
  try {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.openId, openId)).limit(1);
    return rows[0]?.passwordHash ?? null;
  } catch {
    return null;
  }
}

export async function updateMemberAccount(userId: number, input: MemberAccountUpdateInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const userUpdate: { name: string; email: string; passwordHash?: string } = { name: input.name.trim(), email: input.email.trim().toLowerCase() };
  if (input.newPassword?.trim()) userUpdate.passwordHash = hashPassword(input.newPassword.trim());
  await db.update(users).set(userUpdate).where(eq(users.id, userId));
  return getMemberAccount(userId);
}

type MemberProfileUpdateInput = {
  slug: string;
  bio?: string | null;
  whatsapp?: string | null;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  skype?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  postalCode?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
};

const cleanOptional = (value?: string | null) => value?.trim() || null;

export async function updateMemberProfile(userId: number, input: MemberProfileUpdateInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const values = {
    userId,
    slug: input.slug.trim().toLowerCase(),
    bio: cleanOptional(input.bio),
    whatsapp: cleanOptional(input.whatsapp),
    websiteUrl: cleanOptional(input.websiteUrl),
    facebookUrl: cleanOptional(input.facebookUrl),
    instagramUrl: cleanOptional(input.instagramUrl),
    twitterUrl: cleanOptional(input.twitterUrl),
    linkedinUrl: cleanOptional(input.linkedinUrl),
    youtubeUrl: cleanOptional(input.youtubeUrl),
    skype: cleanOptional(input.skype),
    address: cleanOptional(input.address),
    addressNumber: cleanOptional(input.addressNumber),
    addressComplement: cleanOptional(input.addressComplement),
    postalCode: cleanOptional(input.postalCode),
    district: cleanOptional(input.district),
    city: cleanOptional(input.city),
    state: cleanOptional(input.state),
  };
  const { userId: _userId, ...profileValues } = values;
  await db.insert(memberProfiles).values(values).onDuplicateKeyUpdate({ set: profileValues });
  return getMemberProfile(userId);
}

export async function uploadMemberProfilePhoto(userId: number, input: { dataUrl: string; contentType: "image/jpeg" | "image/png" | "image/gif" }) {
  const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|gif));base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match || match[1] !== input.contentType) throw new Error("Arquivo de imagem inválido.");
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 1024 * 1024) throw new Error("A foto deve ter no máximo 1 MB.");
  const extension = input.contentType === "image/jpeg" ? "jpg" : input.contentType.slice("image/".length);
  const stored = await storagePut(`member-profiles/${userId}/profile.${extension}`, buffer, input.contentType);
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(memberProfiles).set({ photoUrl: stored.url }).where(eq(memberProfiles.userId, userId));
  return getMemberProfile(userId);
}

export async function markMemberGettingStartedMetricsViewed(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const clickTotals = await db.select({ value: sql<number>`COUNT(*)` }).from(campaignClickEvents).where(eq(campaignClickEvents.userId, userId));
  if (Number(clickTotals[0]?.value ?? 0) <= 0) throw new Error("As métricas só podem ser marcadas após o primeiro acesso registrado.");
  const profileRows = await db.select({ id: memberProfiles.id }).from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1);
  if (!profileRows[0]) throw new Error("Configure sua Página Lucrativa antes de acompanhar métricas.");
  await db.update(memberProfiles).set({ metricsViewedAt: new Date() }).where(eq(memberProfiles.userId, userId));
  return getMemberProfile(userId);
}

export type MemberReceivingUpdateInput = {
  holderName?: string | null;
  method: "pix" | "bank_transfer" | "other";
  receivingKey?: string | null;
  instructions?: string | null;
  paypalEmail?: string | null;
  paypalEnabled?: boolean;
  pagseguroEmail?: string | null;
  pagseguroEnabled?: boolean;
  bank1Name?: string | null;
  bank1Agency?: string | null;
  bank1Account?: string | null;
  bank1Type?: "checking" | "savings" | null;
  bank1Holder?: string | null;
  bank2Name?: string | null;
  bank2Agency?: string | null;
  bank2Account?: string | null;
  bank2Type?: "checking" | "savings" | null;
  bank2Holder?: string | null;
  bank3Name?: string | null;
  bank3Agency?: string | null;
  bank3Account?: string | null;
  bank3Type?: "checking" | "savings" | null;
  bank3Holder?: string | null;
  bank4Name?: string | null;
  bank4Agency?: string | null;
  bank4Account?: string | null;
  bank4Type?: "checking" | "savings" | null;
  bank4Holder?: string | null;
  pixType?: string | null;
  pixKey?: string | null;
};

export async function getMemberReceivingPreference(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(receivingPreferences).where(eq(receivingPreferences.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function updateMemberReceivingPreference(userId: number, input: MemberReceivingUpdateInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const values = {
    userId,
    holderName: input.holderName?.trim() || null,
    method: input.method,
    receivingKey: input.receivingKey?.trim() || null,
    instructions: input.instructions?.trim() || null,
    paypalEmail: input.paypalEmail?.trim().toLowerCase() || null,
    paypalEnabled: input.paypalEnabled ? 1 : 0,
    pagseguroEmail: input.pagseguroEmail?.trim().toLowerCase() || null,
    pagseguroEnabled: input.pagseguroEnabled ? 1 : 0,
    bank1Name: input.bank1Name?.trim() || null,
    bank1Agency: input.bank1Agency?.trim() || null,
    bank1Account: input.bank1Account?.trim() || null,
    bank1Type: input.bank1Type || null,
    bank1Holder: input.bank1Holder?.trim() || null,
    bank2Name: input.bank2Name?.trim() || null,
    bank2Agency: input.bank2Agency?.trim() || null,
    bank2Account: input.bank2Account?.trim() || null,
    bank2Type: input.bank2Type || null,
    bank2Holder: input.bank2Holder?.trim() || null,
    bank3Name: input.bank3Name?.trim() || null,
    bank3Agency: input.bank3Agency?.trim() || null,
    bank3Account: input.bank3Account?.trim() || null,
    bank3Type: input.bank3Type || null,
    bank3Holder: input.bank3Holder?.trim() || null,
    bank4Name: input.bank4Name?.trim() || null,
    bank4Agency: input.bank4Agency?.trim() || null,
    bank4Account: input.bank4Account?.trim() || null,
    bank4Type: input.bank4Type || null,
    bank4Holder: input.bank4Holder?.trim() || null,
    pixType: input.pixType?.trim() || null,
    pixKey: input.pixKey?.trim() || null,
  };
  await db.insert(receivingPreferences).values(values).onDuplicateKeyUpdate({ set: values });
  return getMemberReceivingPreference(userId);
}

export async function markMemberReceivingResponsibleUseModalSeen(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const values = {
    userId,
    responsibleUseModalSeenAt: new Date(),
  };
  await db.insert(receivingPreferences).values(values).onDuplicateKeyUpdate({ set: values });
  return getMemberReceivingPreference(userId);
}

export async function getMemberPaymentLinks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberPaymentLinks).where(eq(memberPaymentLinks.userId, userId)).orderBy(memberPaymentLinks.sortOrder, memberPaymentLinks.id);
}

export async function updateMemberPaymentLinks(userId: number, input: { links: MemberPaymentLinkInput[] }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.delete(memberPaymentLinks).where(eq(memberPaymentLinks.userId, userId));
  if (input.links.length) {
    await db.insert(memberPaymentLinks).values(input.links.map((link, index) => ({
      userId,
      label: link.label.trim(),
      paymentUrl: link.paymentUrl.trim(),
      isEnabled: link.isEnabled ? 1 : 0,
      sortOrder: link.sortOrder ?? index,
    })));
  }
  return getMemberPaymentLinks(userId);
}

export async function getPublicAffiliateProfile(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    slug: memberProfiles.slug,
    bio: memberProfiles.bio,
    name: users.name,
    photoUrl: memberProfiles.photoUrl,
    whatsapp: memberProfiles.whatsapp,
    websiteUrl: memberProfiles.websiteUrl,
    facebookUrl: memberProfiles.facebookUrl,
    instagramUrl: memberProfiles.instagramUrl,
    twitterUrl: memberProfiles.twitterUrl,
    linkedinUrl: memberProfiles.linkedinUrl,
    youtubeUrl: memberProfiles.youtubeUrl,
    skype: memberProfiles.skype,
  }).from(memberProfiles).innerJoin(users, eq(users.id, memberProfiles.userId)).where(eq(memberProfiles.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getMemberTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.updatedAt));
}

export async function createMemberTicket(userId: number, input: { subject: string; message: string }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const result = await db.insert(supportTickets).values({ userId, ...input });
  return { id: Number(result[0].insertId) };
}

export async function getPublicSalesSectionImages() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ sectionId: publicSalesSectionImages.sectionId, imageUrl: publicSalesSectionImages.imageUrl, contentType: publicSalesSectionImages.contentType, status: publicSalesSectionImages.status, originalName: publicSalesSectionImages.originalName, updatedAt: publicSalesSectionImages.updatedAt }).from(publicSalesSectionImages).orderBy(desc(publicSalesSectionImages.updatedAt));
}

export async function getAdminPublicSalesSectionImages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publicSalesSectionImages).orderBy(desc(publicSalesSectionImages.updatedAt));
}

export async function upsertAdminPublicSalesSectionImage(adminId: number, sectionId: string, input: { dataUrl: string; contentType: "image/jpeg" | "image/png" | "image/gif"; originalName?: string | null }) {
  if (!getPublicSalesSection(sectionId)) throw new Error("Seção pública inválida.");
  const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|gif));base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match || match[1] !== input.contentType) throw new Error("Arquivo de imagem inválido.");
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 4 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 4 MB.");
  const extension = input.contentType === "image/jpeg" ? "jpg" : input.contentType.slice("image/".length);
  const originalName = input.originalName?.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 255) || null;
  const stored = await storagePut(`public-sales/${sectionId}/${Date.now()}.${extension}`, buffer, input.contentType);
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.insert(publicSalesSectionImages).values({ sectionId, imageUrl: stored.url, storageKey: stored.key, contentType: input.contentType, status: "active", originalName, createdBy: adminId }).onDuplicateKeyUpdate({ set: { imageUrl: stored.url, storageKey: stored.key, contentType: input.contentType, status: "active", originalName, createdBy: adminId } });
  return db.select().from(publicSalesSectionImages).where(eq(publicSalesSectionImages.sectionId, sectionId)).limit(1).then(rows => rows[0] ?? null);
}

export async function removeAdminPublicSalesSectionImage(sectionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(publicSalesSectionImages).set({ status: "removed" }).where(eq(publicSalesSectionImages.sectionId, sectionId));
  return { success: true } as const;
}

export async function getPublishedContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(managedContent).where(eq(managedContent.status, "published")).orderBy(desc(managedContent.updatedAt));
}

const ebookListFields = {
  id: ebooks.id,
  sourceId: ebooks.sourceId,
  sourceFile: ebooks.sourceFile,
  sourcePath: ebooks.sourcePath,
  title: ebooks.title,
  summary: ebooks.summary,
  status: ebooks.status,
  publishedAt: ebooks.publishedAt,
  createdAt: ebooks.createdAt,
  updatedAt: ebooks.updatedAt,
};
type EbookStatus = "draft" | "published" | "archived";
type EbookInput = {
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary?: string | null;
  htmlContent: string;
  status: EbookStatus;
  createdBy: number;
};
export async function getPublishedEbooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select(ebookListFields).from(ebooks).where(eq(ebooks.status, "published")).orderBy(desc(ebooks.publishedAt), desc(ebooks.updatedAt));
}
export async function getPublishedEbook(ebookId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ebooks).where(and(eq(ebooks.id, ebookId), eq(ebooks.status, "published"))).limit(1);
  return result[0] ?? null;
}
export async function getAdminEbooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select(ebookListFields).from(ebooks).orderBy(desc(ebooks.updatedAt));
}
export async function getAdminEbook(ebookId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ebooks).where(eq(ebooks.id, ebookId)).limit(1);
  return result[0] ?? null;
}
export async function createAdminEbook(input: EbookInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const result = await db.insert(ebooks).values({ ...input, publishedAt: input.status === "published" ? new Date() : null });
  return { id: Number(result[0].insertId) };
}
export async function updateAdminEbook(ebookId: number, input: Omit<EbookInput, "createdBy">) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const current = await db.select({ id: ebooks.id }).from(ebooks).where(eq(ebooks.id, ebookId)).limit(1);
  if (!current[0]) throw new Error("E-book não encontrado.");
  await db.update(ebooks).set({ ...input, publishedAt: input.status === "published" ? new Date() : null }).where(eq(ebooks.id, ebookId));
  return { success: true } as const;
}
type CampaignRequestLike = { headers?: { cookie?: string | string[] } };

function readCampaignCookie(request: CampaignRequestLike | undefined, name: string) {
  const raw = request?.headers?.cookie;
  const cookieHeader = Array.isArray(raw) ? raw.join(";") : raw ?? "";
  const entry = cookieHeader.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

export async function createApplication(input: ApplicationInput, request?: CampaignRequestLike) {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível no momento.");
  const trackingCode = `PL-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const affiliateSlug = input.affiliateSlug ?? null;
  let owner = affiliateSlug
    ? await db.select({ userId: memberProfiles.userId, slug: memberProfiles.slug }).from(memberProfiles).where(eq(memberProfiles.slug, affiliateSlug)).limit(1)
    : [];
  if (!owner[0]) {
    const defaultMembers = await db.select({ userId: memberProfiles.userId, slug: memberProfiles.slug }).from(memberProfiles).innerJoin(users, eq(users.id, memberProfiles.userId)).where(eq(users.role, "user")).limit(2);
    if (defaultMembers.length === 1) owner = defaultMembers;
  }
  const result = await db.insert(applications).values({
    fullName: input.fullName,
    email: input.email,
    whatsapp: input.whatsapp,
    trackingCode,
    affiliateSlug: owner[0]?.slug ?? null,
    ownerUserId: owner[0]?.userId ?? null,
    paymentStatus: "awaiting_payment",
    activationStatus: "not_started",
    offerAmountCents: OFFER_AMOUNT_CENTS,
  });
  const id = Number(result[0].insertId);
  const visitorId = readCampaignCookie(request, "pl_visitor");
  const sessionId = readCampaignCookie(request, "pl_session");
  if (owner[0] && visitorId && sessionId) {
    const attribution = await getValidCampaignAttribution(owner[0].userId, visitorId, sessionId);
    if (attribution) {
      await recordCampaignConversion({
        campaignId: attribution.campaignId,
        userId: owner[0].userId,
        attributionId: attribution.id,
        visitorId,
        sessionId,
        conversionType: "application",
        entityType: "application",
        entityId: id,
      });
    }
  }
  return { id, trackingCode };
}

export async function getMemberAffiliateApplications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(applications).where(eq(applications.ownerUserId, userId)).orderBy(desc(applications.createdAt));
  const receipts = await db.select().from(applicationPaymentReceipts).where(eq(applicationPaymentReceipts.ownerUserId, userId));
  const tokens = await db.select().from(applicationAccessTokens).where(eq(applicationAccessTokens.ownerUserId, userId));
  return rows.map(application => {
    const applicationReceipts = receipts.filter(receipt => receipt.applicationId === application.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const latestReceipt = applicationReceipts[0] ?? null;
    return {
      ...application,
      receiptCount: applicationReceipts.length,
      latestReceiptStatus: latestReceipt?.status ?? null,
      latestReceiptReviewedAt: latestReceipt?.reviewedAt ?? null,
      accessStatus: tokens.filter(token => token.applicationId === application.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.status ?? null,
    };
  }).filter(application => !shouldHideRejectedApplication(application.paymentStatus, application.latestReceiptStatus, application.latestReceiptReviewedAt));
}

function shouldHideRejectedApplication(paymentStatus: string, latestReceiptStatus: string | null, reviewedAt: Date | null) {
  if (paymentStatus !== "rejected" || latestReceiptStatus !== "rejected" || !reviewedAt) return false;
  return Date.now() - reviewedAt.getTime() >= 48 * 60 * 60 * 1000;
}

export async function getMemberAffiliateApplication(userId: number, applicationId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(applications).where(and(eq(applications.id, applicationId), eq(applications.ownerUserId, userId))).limit(1);
  const application = rows[0];
  if (!application) return null;
  const [receipts, tokens] = await Promise.all([
    db.select().from(applicationPaymentReceipts).where(and(eq(applicationPaymentReceipts.applicationId, application.id), eq(applicationPaymentReceipts.ownerUserId, userId))).orderBy(desc(applicationPaymentReceipts.createdAt)),
    db.select().from(applicationAccessTokens).where(and(eq(applicationAccessTokens.applicationId, application.id), eq(applicationAccessTokens.ownerUserId, userId))).orderBy(desc(applicationAccessTokens.createdAt)),
  ]);
  const latestReceipt = receipts[0] ?? null;
  if (shouldHideRejectedApplication(application.paymentStatus, latestReceipt?.status ?? null, latestReceipt?.reviewedAt ?? null)) return null;
  return { application, receipts, activeAccess: tokens.find(token => token.status === "active") ?? null, accessHistory: tokens };
}

export async function getApplicationTracking(inputTrackingCode: string, email: string) {
  const db = await getDb();
  if (!db) return null;
  const trackingCode = inputTrackingCode.trim().toUpperCase();
  const rows = await db.select().from(applications).where(and(eq(applications.trackingCode, trackingCode), eq(applications.email, email.trim().toLowerCase()))).limit(1);
  const application = rows[0];
  if (!application) return null;
  const receiptRows = await db.select().from(applicationPaymentReceipts).where(eq(applicationPaymentReceipts.applicationId, application.id)).orderBy(desc(applicationPaymentReceipts.createdAt)).limit(1);
  const sponsorRows = application.ownerUserId
    ? await db.select({
      name: users.name,
      email: users.email,
      whatsapp: memberProfiles.whatsapp,
    }).from(users).leftJoin(memberProfiles, eq(memberProfiles.userId, users.id)).where(eq(users.id, application.ownerUserId)).limit(1)
    : [];
  const activeTokens = application.paymentStatus === "confirmed"
    ? await db.select().from(applicationAccessTokens).where(and(eq(applicationAccessTokens.applicationId, application.id), eq(applicationAccessTokens.status, "active"))).orderBy(desc(applicationAccessTokens.createdAt)).limit(1)
    : [];
  const activeToken = activeTokens[0] ?? null;
  const contactReferenceDate = receiptRows[0]?.createdAt ?? application.createdAt;
  const canShowSponsorContact = application.paymentStatus !== "confirmed" && hasBusinessHoursElapsed(contactReferenceDate, new Date(), 4);
  const sponsor = sponsorRows[0] ?? null;
  return {
    trackingCode: application.trackingCode,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    offerAmountCents: application.offerAmountCents,
    status: application.status,
    paymentStatus: application.paymentStatus,
    activationStatus: application.activationStatus,
    latestReceiptStatus: receiptRows[0]?.status ?? null,
    sponsorContact: canShowSponsorContact && sponsor ? {
      name: sponsor.name,
      email: sponsor.email,
      whatsapp: sponsor.whatsapp,
    } : null,
    nextAction: application.paymentStatus === "confirmed" ? "personalize" : application.paymentStatus === "rejected" ? "retry_receipt" : application.paymentStatus === "receipt_received" ? "wait_review" : "pay",
    access: activeToken ? {
      publicCode: activeToken.publicCode,
      personalizationUrl: `/personalizar?codigo=${activeToken.publicCode}`,
    } : null,
  };
}

function hasBusinessHoursElapsed(start: Date, end: Date, requiredHours: number) {
  if (end <= start) return false;
  let elapsedMs = 0;
  let cursor = new Date(start);
  while (cursor < end && elapsedMs < requiredHours * 60 * 60 * 1000) {
    const next = new Date(Math.min(cursor.getTime() + 60 * 60 * 1000, end.getTime()));
    const day = cursor.getUTCDay();
    if (day >= 1 && day <= 5) elapsedMs += next.getTime() - cursor.getTime();
    cursor = next;
  }
  return elapsedMs >= requiredHours * 60 * 60 * 1000;
}

export async function getApplicationPaymentPage(trackingCode: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(applications).where(eq(applications.trackingCode, trackingCode.trim().toUpperCase())).limit(1);
  const application = rows[0];
  if (!application) return null;
  const ownerId = application.ownerUserId;
  const [sponsorRows, profileRows, receivingRows, checkoutLinks, receiptRows] = ownerId ? await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, ownerId)).limit(1),
    db.select().from(memberProfiles).where(eq(memberProfiles.userId, ownerId)).limit(1),
    db.select().from(receivingPreferences).where(eq(receivingPreferences.userId, ownerId)).limit(1),
    db.select().from(memberPaymentLinks).where(and(eq(memberPaymentLinks.userId, ownerId), eq(memberPaymentLinks.isEnabled, 1))).orderBy(memberPaymentLinks.sortOrder, memberPaymentLinks.id),
    db.select().from(applicationPaymentReceipts).where(eq(applicationPaymentReceipts.applicationId, application.id)).orderBy(desc(applicationPaymentReceipts.createdAt)),
  ]) : [[], [], [], [], []];
  return {
    application,
    sponsor: sponsorRows[0] ? { ...sponsorRows[0], profile: profileRows[0] ?? null } : null,
    receiving: receivingRows[0] ?? null,
    paymentLinks: checkoutLinks,
    receipts: receiptRows,
  };
}

function parseReceiptDataUrl(input: ApplicationReceiptUpload) {
  const escaped = input.contentType.replace("/", "\\/");
  const match = input.dataUrl.match(new RegExp(`^data:${escaped};base64,([A-Za-z0-9+/=\\s]+)$`));
  if (!match) throw new Error("Arquivo inválido.");
  const buffer = Buffer.from(match[1].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new Error("O comprovante deve ter no máximo 5 MB.");
  return buffer;
}

function receiptExtension(contentType: ApplicationReceiptUpload["contentType"]) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "pdf";
}

function sanitizeOriginalName(name: string | null | undefined) {
  return name?.replace(/[^A-Za-z0-9_. -]/g, "").replace(/\s+/g, " ").trim().slice(0, 255) || null;
}

export async function uploadApplicationPaymentReceipt(input: ApplicationReceiptUpload) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const rows = await db.select().from(applications).where(eq(applications.trackingCode, input.trackingCode.trim().toUpperCase())).limit(1);
  const application = rows[0];
  if (!application?.ownerUserId) throw new Error("Pedido não encontrado ou sem responsável definido.");
  const buffer = parseReceiptDataUrl(input);
  const extension = receiptExtension(input.contentType);
  const stored = await storagePut(`payment-receipts/${application.ownerUserId}/${application.id}/${randomUUID()}.${extension}`, buffer, input.contentType);
  const receiptResult = await db.insert(applicationPaymentReceipts).values({
    applicationId: application.id,
    ownerUserId: application.ownerUserId,
    storageKey: stored.key,
    fileUrl: stored.url,
    contentType: input.contentType,
    originalName: sanitizeOriginalName(input.originalName),
    fileSize: buffer.length,
    status: "pending",
  });
  await db.update(applications).set({ paymentStatus: "receipt_received", selectedPaymentMethod: "PIX" }).where(eq(applications.id, application.id));
  await db.insert(memberNotifications).values({
    userId: application.ownerUserId,
    type: "payment_receipt_received",
    title: "Novo comprovante recebido",
    message: `Nome: ${application.fullName}\nE-mail: ${application.email}\nWhatsApp: ${application.whatsapp}`,
    entityType: "application",
    entityId: application.id,
  });
  return { id: Number(receiptResult[0].insertId), status: "pending" as const };
}

export async function getMemberNotifications(userId: number) {
  const db = await getDb();
  if (!db) return { unreadCount: 0, items: [] };
  const items = await db.select().from(memberNotifications).where(eq(memberNotifications.userId, userId)).orderBy(desc(memberNotifications.createdAt)).limit(20);
  return { unreadCount: items.filter(item => !item.readAt).length, items };
}

export async function markMemberNotificationRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const rows = await db.select().from(memberNotifications).where(and(eq(memberNotifications.id, notificationId), eq(memberNotifications.userId, userId))).limit(1);
  if (!rows[0]) throw new Error("Notificação não encontrada.");
  await db.update(memberNotifications).set({ readAt: new Date() }).where(eq(memberNotifications.id, notificationId));
  return rows[0];
}

export async function reviewPaymentReceipt(userId: number, input: { applicationId: number; receiptId: number; status: "approved" | "rejected" }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const rows = await db.select().from(applications).where(and(eq(applications.id, input.applicationId), eq(applications.ownerUserId, userId))).limit(1);
  if (!rows[0]) throw new Error("Pedido não encontrado.");
  const receiptRows = await db.select().from(applicationPaymentReceipts).where(and(eq(applicationPaymentReceipts.id, input.receiptId), eq(applicationPaymentReceipts.applicationId, input.applicationId), eq(applicationPaymentReceipts.ownerUserId, userId))).limit(1);
  if (!receiptRows[0]) throw new Error("Comprovante não encontrado.");
  await db.update(applicationPaymentReceipts).set({ status: input.status, reviewedAt: new Date(), reviewedBy: userId }).where(eq(applicationPaymentReceipts.id, input.receiptId));
  if (input.status === "approved") {
    await ensureApplicationAccessToken(rows[0], userId);
  }
  await db.update(applications).set({
    paymentStatus: input.status === "approved" ? "confirmed" : "rejected",
    activationStatus: input.status === "approved" ? "access_issued" : "not_started",
    status: input.status === "approved" ? "approved" : "contacted",
  }).where(eq(applications.id, input.applicationId));
  return { success: true } as const;
}
export async function updateAdminApplication(applicationId: number, input: { status: "pending" | "contacted" | "approved" | "archived"; adminNote?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(applications).set({ status: input.status, adminNote: input.adminNote?.trim() || null }).where(eq(applications.id, applicationId));
  return { success: true } as const;
}

export async function getRecentApplications(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applications).orderBy(desc(applications.createdAt)).limit(limit);
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return null;
  const [memberRows, courseRows, transactionRows, applicationRows] = await Promise.all([
    db.select().from(users), db.select().from(courses), db.select().from(transactions), db.select().from(applications),
  ]);
  return {
    memberCount: memberRows.filter(user => user.role === "user").length,
    publishedCourseCount: courseRows.filter(course => course.isPublished === 1).length,
    grossVolumeCents: transactionRows.reduce((total, transaction) => total + transaction.amountCents, 0),
    pendingApplicationCount: applicationRows.filter(application => application.status === "pending").length,
  };
}

function parseBooleanSetting(value: string | null | undefined, fallback = false) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export async function getPublicPlatformSettings() {
  const db = await getDb();
  if (!db) return { hideExternalPreviewNotice: false };
  const rows = await db.select().from(platformSettings).where(eq(platformSettings.key, HIDE_EXTERNAL_PREVIEW_NOTICE_KEY)).limit(1);
  return { hideExternalPreviewNotice: parseBooleanSetting(rows[0]?.value, false) };
}

export async function getAdminPlatformSettings() {
  return getPublicPlatformSettings();
}

export async function updateAdminPlatformSettings(adminId: number, input: { hideExternalPreviewNotice: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.insert(platformSettings).values({
    key: HIDE_EXTERNAL_PREVIEW_NOTICE_KEY,
    value: String(input.hideExternalPreviewNotice),
    updatedBy: adminId,
  }).onDuplicateKeyUpdate({ set: { value: String(input.hideExternalPreviewNotice), updatedBy: adminId } });
  return getAdminPlatformSettings();
}

export async function getAdminContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(managedContent).orderBy(desc(managedContent.updatedAt));
}

export async function createAdminContent(input: { kind: "material" | "article" | "faq" | "notice"; title: string; summary?: string | null; body?: string | null; status: "draft" | "published" | "archived"; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const result = await db.insert(managedContent).values(input);
  return { id: Number(result[0].insertId) };
}

export async function updateAdminContent(contentId: number, input: { kind: "material" | "article" | "faq" | "notice"; title: string; summary?: string | null; body?: string | null; status: "draft" | "published" | "archived" }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(managedContent).set(input).where(eq(managedContent.id, contentId));
  return { success: true } as const;
}

export async function updateAdminContentStatus(contentId: number, status: "draft" | "published" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(managedContent).set({ status }).where(eq(managedContent.id, contentId));
  return { success: true } as const;
}

export async function getAdminTickets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).orderBy(desc(supportTickets.updatedAt));
}

export async function updateAdminTicket(ticketId: number, input: { status: "open" | "answered" | "closed"; adminResponse?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(supportTickets).set({ status: input.status, adminResponse: input.adminResponse ?? null }).where(eq(supportTickets.id, ticketId));
  return { success: true } as const;
}

const contactStatuses = ["new", "contacted", "qualified", "archived"] as const;
type ContactStatus = typeof contactStatuses[number];

async function recordMemberActivity(userId: number, type: "contact_created" | "contact_updated" | "invitation_prepared" | "invitation_cancelled" | "admin_contact_update", entityType: string, entityId: number | null, description: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(memberActivities).values({ userId, type, entityType, entityId, description });
}

export async function getMemberContacts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberContacts).where(eq(memberContacts.userId, userId)).orderBy(desc(memberContacts.updatedAt));
}

export async function createMemberContact(userId: number, input: { campaignId?: number | null; name: string; email: string; whatsapp?: string | null; source: string; consentNote?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  if (input.campaignId) {
    const campaign = await db.select({ id: campaignLinks.id }).from(campaignLinks).where(and(eq(campaignLinks.id, input.campaignId), eq(campaignLinks.userId, userId))).limit(1);
    if (!campaign[0]) throw new Error("Campanha não encontrada para esta conta.");
  }
  const result = await db.insert(memberContacts).values({ userId, campaignId: input.campaignId ?? null, name: input.name, email: input.email, whatsapp: input.whatsapp ?? null, source: input.source, consentNote: input.consentNote ?? null, captureType: input.campaignId ? "campaign" : "manual" });
  if (input.campaignId) {
    await db.update(campaignLinks).set({ leads: sql`${campaignLinks.leads} + 1` }).where(eq(campaignLinks.id, input.campaignId));
  }
  const id = Number(result[0].insertId);
  if (input.campaignId) {
    await recordCampaignConversion({ campaignId: input.campaignId, userId, conversionType: "lead", entityType: "memberContact", entityId: id, captureMode: "manual" });
  }
  await recordMemberActivity(userId, "contact_created", "contact", id, `Contato consentido registrado: ${input.name}.`);
  return { id };
}

export async function updateMemberContact(userId: number, contactId: number, input: { status: ContactStatus; source?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const owned = await db.select({ id: memberContacts.id }).from(memberContacts).where(and(eq(memberContacts.id, contactId), eq(memberContacts.userId, userId))).limit(1);
  if (!owned[0]) throw new Error("Contato não encontrado para esta conta.");
  await db.update(memberContacts).set({ status: input.status, ...(input.source ? { source: input.source } : {}) }).where(eq(memberContacts.id, contactId));
  await recordMemberActivity(userId, "contact_updated", "contact", contactId, `Contato atualizado para o status ${input.status}.`);
  return { success: true } as const;
}

export async function getMemberInvitations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberInvitations).where(eq(memberInvitations.userId, userId)).orderBy(desc(memberInvitations.createdAt));
}

export async function createMemberInvitation(userId: number, input: { contactId?: number | null; channel: "link" | "email" | "whatsapp"; message?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  if (input.contactId) {
    const contact = await db.select({ id: memberContacts.id }).from(memberContacts).where(and(eq(memberContacts.id, input.contactId), eq(memberContacts.userId, userId))).limit(1);
    if (!contact[0]) throw new Error("Contato não encontrado para esta conta.");
  }
  const result = await db.insert(memberInvitations).values({ userId, contactId: input.contactId ?? null, channel: input.channel, message: input.message ?? null });
  const id = Number(result[0].insertId);
  await recordMemberActivity(userId, "invitation_prepared", "invitation", id, "Convite preparado manualmente; nenhum envio externo foi realizado.");
  return { id };
}

export async function getMemberActivities(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberActivities).where(eq(memberActivities.userId, userId)).orderBy(desc(memberActivities.createdAt)).limit(30);
}

export async function getAdminContacts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberContacts).orderBy(desc(memberContacts.updatedAt));
}

export async function updateAdminContact(contactId: number, input: { status: ContactStatus }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const contact = await db.select().from(memberContacts).where(eq(memberContacts.id, contactId)).limit(1);
  if (!contact[0]) throw new Error("Contato não encontrado.");
  await db.update(memberContacts).set({ status: input.status }).where(eq(memberContacts.id, contactId));
  await recordMemberActivity(contact[0].userId, "admin_contact_update", "contact", contactId, `Administração atualizou o status para ${input.status}.`);
  return { success: true } as const;
}

export async function getAdminActivities() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberActivities).orderBy(desc(memberActivities.createdAt)).limit(80);
}


export async function getAdminInvitations() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: memberInvitations.id,
    userId: memberInvitations.userId,
    contactId: memberInvitations.contactId,
    channel: memberInvitations.channel,
    message: memberInvitations.message,
    status: memberInvitations.status,
    createdAt: memberInvitations.createdAt,
    memberName: users.name,
    memberEmail: users.email,
    contactName: memberContacts.name,
    contactEmail: memberContacts.email,
  }).from(memberInvitations)
    .leftJoin(users, eq(memberInvitations.userId, users.id))
    .leftJoin(memberContacts, eq(memberInvitations.contactId, memberContacts.id))
    .orderBy(desc(memberInvitations.createdAt));
}

export async function updateAdminInvitation(invitationId: number, status: "prepared" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const invitation = await db.select().from(memberInvitations).where(eq(memberInvitations.id, invitationId)).limit(1);
  if (!invitation[0]) throw new Error("Preparação de comunicação não encontrada.");
  await db.update(memberInvitations).set({ status }).where(eq(memberInvitations.id, invitationId));
  await recordMemberActivity(invitation[0].userId, status === "cancelled" ? "invitation_cancelled" : "invitation_prepared", "invitation", invitationId, "Administração atualizou o preparo de comunicação para " + status + ".");
  return { success: true };
}

export async function getMemberTestimonials(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberTestimonials).where(eq(memberTestimonials.userId, userId)).orderBy(desc(memberTestimonials.updatedAt));
}

export async function createMemberTestimonial(userId: number, input: { content: string }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const result = await db.insert(memberTestimonials).values({ userId, content: input.content, authorConfirmed: 1, status: "pending" });
  return { id: Number(result[0].insertId) };
}

export async function getAdminTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: memberTestimonials.id,
    userId: memberTestimonials.userId,
    content: memberTestimonials.content,
    authorConfirmed: memberTestimonials.authorConfirmed,
    status: memberTestimonials.status,
    adminNote: memberTestimonials.adminNote,
    createdAt: memberTestimonials.createdAt,
    updatedAt: memberTestimonials.updatedAt,
    memberName: users.name,
    memberEmail: users.email,
  }).from(memberTestimonials).leftJoin(users, eq(memberTestimonials.userId, users.id)).orderBy(desc(memberTestimonials.updatedAt));
}

export async function updateAdminTestimonial(testimonialId: number, input: { status: "pending" | "approved" | "rejected" | "archived"; adminNote?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const testimonial = await db.select({ id: memberTestimonials.id }).from(memberTestimonials).where(eq(memberTestimonials.id, testimonialId)).limit(1);
  if (!testimonial[0]) throw new Error("Relato não encontrado.");
  await db.update(memberTestimonials).set({ status: input.status, adminNote: input.adminNote ?? null }).where(eq(memberTestimonials.id, testimonialId));
  return { success: true } as const;
}

function hashAccessToken(token: string) {
  const salt = randomUUID();
  const digest = scryptSync(token, salt, 64).toString("hex");
  return `scrypt$${salt}$${digest}`;
}

function accessTokenEncryptionKey() {
  const secret = ENV.cookieSecret || process.env.JWT_SECRET || "pagina-lucrativa-local-access-token-key";
  return createHash("sha256").update(secret).digest();
}

function encryptAccessToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", accessTokenEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptAccessToken(payload: string | null) {
  if (!payload) return null;
  const [ivRaw, tagRaw, encryptedRaw] = payload.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", accessTokenEncryptionKey(), Buffer.from(ivRaw, "base64url"));
    decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

function generateReadableAccessToken() {
  return randomBytes(6).toString("base64url").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

async function ensureApplicationAccessToken(application: typeof applications.$inferSelect, createdBy: number) {
  if (!application.ownerUserId) throw new Error("Pedido sem responsável.");
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const existing = await db.select().from(applicationAccessTokens).where(and(eq(applicationAccessTokens.applicationId, application.id), eq(applicationAccessTokens.status, "active"))).orderBy(desc(applicationAccessTokens.createdAt)).limit(1);
  if (existing[0]) {
    return { tokenRow: existing[0], plainToken: decryptAccessToken(existing[0].encryptedToken) };
  }
  const plainToken = generateReadableAccessToken();
  const publicCode = randomUUID().replace(/-/g, "").slice(0, 16);
  await db.insert(applicationAccessTokens).values({
    applicationId: application.id,
    ownerUserId: application.ownerUserId,
    publicCode,
    tokenHash: hashAccessToken(plainToken),
    encryptedToken: encryptAccessToken(plainToken),
    status: "active",
    createdBy,
  });
  const created = await db.select().from(applicationAccessTokens).where(eq(applicationAccessTokens.publicCode, publicCode)).limit(1);
  return { tokenRow: created[0], plainToken };
}

function slugFromName(name: string, userId: number) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "membro";
  return `${base}-${userId}`.slice(0, 96);
}

export async function getApplicationPersonalizationAccess(publicCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const tokenRows = await db.select().from(applicationAccessTokens).where(and(eq(applicationAccessTokens.publicCode, publicCode), eq(applicationAccessTokens.status, "active"))).limit(1);
  const token = tokenRows[0];
  if (!token) return null;
  const applicationRows = await db.select({
    id: applications.id,
    fullName: applications.fullName,
    email: applications.email,
    paymentStatus: applications.paymentStatus,
    activationStatus: applications.activationStatus,
  }).from(applications).where(and(eq(applications.id, token.applicationId), eq(applications.paymentStatus, "confirmed"))).limit(1);
  const application = applicationRows[0];
  if (!application) return null;
  return {
    publicCode,
    fullName: application.fullName,
    email: application.email,
    activationStatus: application.activationStatus,
  };
}

export async function completeApplicationPersonalization(input: ApplicationPersonalizationInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const tokenRows = await db.select().from(applicationAccessTokens).where(and(eq(applicationAccessTokens.publicCode, input.publicCode), eq(applicationAccessTokens.status, "active"))).limit(1);
  const token = tokenRows[0];
  if (!token) throw new Error("Acesso inválido ou expirado.");
  const applicationRows = await db.select().from(applications).where(and(eq(applications.id, token.applicationId), eq(applications.paymentStatus, "confirmed"))).limit(1);
  const application = applicationRows[0];
  if (!application?.ownerUserId) throw new Error("Pedido não encontrado ou ainda não aprovado.");
  const normalizedEmail = application.email.trim().toLowerCase();
  const openId = `application:${token.publicCode}`;
  const existingUsers = await db.select({ id: users.id, openId: users.openId, email: users.email }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
  const existingUser = existingUsers[0] ?? null;
  if (existingUser && existingUser.openId !== openId) throw new Error("Já existe uma conta com este e-mail. Use outro e-mail ou solicite suporte.");
  let userId = existingUser?.id ?? 0;
  const normalizedName = input.name.trim();
  if (userId) {
    await db.update(users).set({ name: normalizedName, email: normalizedEmail, passwordHash: hashPassword(input.password), loginMethod: "password", lastSignedIn: new Date() }).where(eq(users.id, userId));
  } else {
    const result = await db.insert(users).values({ openId, name: normalizedName, email: normalizedEmail, passwordHash: hashPassword(input.password), loginMethod: "password", role: "user" });
    userId = Number(result[0].insertId);
  }
  const slug = slugFromName(normalizedName, userId);
  await db.insert(memberProfiles).values({
    userId,
    slug,
    whatsapp: input.whatsapp,
    facebookUrl: cleanOptional(input.facebookUrl),
    instagramUrl: cleanOptional(input.instagramUrl),
  }).onDuplicateKeyUpdate({ set: {
    slug,
    whatsapp: input.whatsapp,
    facebookUrl: cleanOptional(input.facebookUrl),
    instagramUrl: cleanOptional(input.instagramUrl),
  } });
  await db.insert(referralLinks).values({ sponsorId: application.ownerUserId, referredUserId: userId, status: "active" }).onDuplicateKeyUpdate({ set: { sponsorId: application.ownerUserId, status: "active" } });
  await db.update(applicationAccessTokens).set({ status: "used", usedAt: new Date() }).where(eq(applicationAccessTokens.id, token.id));
  await db.update(applications).set({ activationStatus: "member_activated", status: "approved" }).where(eq(applications.id, application.id));
  return { success: true, email: normalizedEmail, slug } as const;
}
