import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { existsSync } from "node:fs";
import {
  applications,
  campaignLinks,
  courseProgress,
  courses,
  ebooks,
  InsertUser,
  managedContent,
  memberProfiles,
  referralLinks,
  memberContacts,
  memberInvitations,
  memberActivities,
  products,
  supportTickets,
  transactions,
  users,
} from "../drizzle/schema";
import type { ApplicationInput } from "@shared/applications";
import { ENV } from "./_core/env";

const VPS_SOCKET_PATH = "/run/mysqld/mysqld.sock";
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

export async function getMemberOverview(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [profileRows, links, productRows, transactionRows, recentTransactions, tickets] = await Promise.all([
    db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1),
    db.select().from(campaignLinks).where(eq(campaignLinks.userId, userId)),
    db.select().from(products).where(eq(products.ownerId, userId)),
    db.select().from(transactions).where(eq(transactions.userId, userId)),
    db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.occurredAt)).limit(5),
    db.select().from(supportTickets).where(and(eq(supportTickets.userId, userId), eq(supportTickets.status, "open"))),
  ]);
  return {
    profile: profileRows[0] ?? null,
    campaignCount: links.length,
    campaignClicks: links.reduce((total, link) => total + link.clicks, 0),
    productCount: productRows.length,
    activeProductCount: productRows.filter(product => product.status === "active").length,
    balanceCents: transactionRows.reduce((total, transaction) => total + transaction.amountCents, 0),
    openTicketCount: tickets.length,
    recentTransactions,
  };
}

export async function getMemberFinance(userId: number) {
  const db = await getDb();
  if (!db) return { transactions: [], balanceCents: 0, earnedCents: 0, pendingCents: 0 };
  const transactionsList = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.occurredAt));
  const posted = transactionsList.filter(entry => entry.status === "posted");
  return {
    transactions: transactionsList,
    balanceCents: posted.reduce((total, entry) => total + entry.amountCents, 0),
    earnedCents: posted.filter(entry => entry.amountCents > 0).reduce((total, entry) => total + entry.amountCents, 0),
    pendingCents: transactionsList.filter(entry => entry.status === "pending").reduce((total, entry) => total + entry.amountCents, 0),
  };
}
export async function createMemberFinanceEntry(userId: number, input: { type: "sale" | "withdrawal"; description: string; amountCents: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const amountCents = input.type === "withdrawal" ? -Math.abs(input.amountCents) : Math.abs(input.amountCents);
  const result = await db.insert(transactions).values({ userId, createdBy: userId, type: input.type, description: input.description.trim(), amountCents, status: "pending" });
  return { id: Number(result[0].insertId) };
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
export async function createAdminTransaction(adminId: number, input: { userId: number; type: "sale" | "commission" | "adjustment" | "withdrawal"; description: string; amountCents: number; status: "pending" | "posted" | "void" }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const amountCents = input.type === "withdrawal" ? -Math.abs(input.amountCents) : Math.abs(input.amountCents);
  const result = await db.insert(transactions).values({ ...input, description: input.description.trim(), amountCents, createdBy: adminId });
  return { id: Number(result[0].insertId) };
}
export async function updateAdminTransaction(transactionId: number, input: { status: "pending" | "posted" | "void"; adminNote?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(transactions).set({ status: input.status, adminNote: input.adminNote?.trim() || null }).where(eq(transactions.id, transactionId));
  return { success: true } as const;
}

export async function getMemberCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignLinks).where(eq(campaignLinks.userId, userId)).orderBy(desc(campaignLinks.createdAt));
}

export async function createMemberCampaign(userId: number, input: { name: string; slug: string; destinationUrl: string }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const result = await db.insert(campaignLinks).values({ userId, ...input });
  return { id: Number(result[0].insertId) };
}

export async function deleteMemberCampaign(userId: number, campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.delete(campaignLinks).where(and(eq(campaignLinks.id, campaignId), eq(campaignLinks.userId, userId)));
  return { success: true } as const;
}

export async function getMemberProducts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.ownerId, userId)).orderBy(desc(products.updatedAt));
}

export async function createMemberProduct(ownerId: number, input: { title: string; description?: string | null; category?: string | null; priceCents: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const result = await db.insert(products).values({ ownerId, ...input, status: "draft" });
  return { id: Number(result[0].insertId), status: "draft" as const };
}
export async function updateMemberProduct(ownerId: number, productId: number, input: { title: string; description?: string | null; category?: string | null; priceCents: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(products).set({ ...input, status: "draft" }).where(and(eq(products.id, productId), eq(products.ownerId, ownerId)));
  return { success: true } as const;
}
export async function getAdminProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.updatedAt));
}
export async function updateAdminProductStatus(productId: number, status: "draft" | "active" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(products).set({ status }).where(eq(products.id, productId));
  return { success: true } as const;
}
export async function getPublishedCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.isPublished, 1)).orderBy(desc(courses.updatedAt));
}

type CourseLevel = "fundamentos" | "pratica" | "avancado";
type CourseInput = { title: string; summary?: string | null; category?: string | null; durationMinutes: number; level: CourseLevel; isPublished: boolean };

export async function getMemberCourses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const [courseRows, progressRows] = await Promise.all([
    db.select().from(courses).where(eq(courses.isPublished, 1)).orderBy(desc(courses.updatedAt)),
    db.select().from(courseProgress).where(eq(courseProgress.userId, userId)),
  ]);
  const progressByCourse = new Map(progressRows.map(row => [row.courseId, row]));
  return courseRows.map(course => ({ ...course, progressPercent: progressByCourse.get(course.id)?.progressPercent ?? 0, lastAccessedAt: progressByCourse.get(course.id)?.lastAccessedAt ?? null }));
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
  const result = await db.insert(courses).values({ title: input.title.trim(), summary: input.summary?.trim() || null, category: input.category?.trim() || null, durationMinutes: input.durationMinutes, level: input.level, isPublished: input.isPublished ? 1 : 0 });
  return { id: Number(result[0].insertId) };
}

export async function updateAdminCourse(courseId: number, input: CourseInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.update(courses).set({ title: input.title.trim(), summary: input.summary?.trim() || null, category: input.category?.trim() || null, durationMinutes: input.durationMinutes, level: input.level, isPublished: input.isPublished ? 1 : 0 }).where(eq(courses.id, courseId));
  return { success: true } as const;
}

export async function updateAdminCoursePublication(courseId: number, isPublished: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
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

export async function updateMemberProfile(userId: number, input: { slug: string; bio?: string | null; whatsapp?: string | null; websiteUrl?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.insert(memberProfiles).values({ userId, ...input }).onDuplicateKeyUpdate({ set: { slug: input.slug, bio: input.bio ?? null, whatsapp: input.whatsapp ?? null, websiteUrl: input.websiteUrl ?? null } });
  return getMemberProfile(userId);
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
export async function createApplication(input: ApplicationInput) {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível no momento.");
  const trackingCode = `PL-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const result = await db.insert(applications).values({ ...input, trackingCode });
  return { id: Number(result[0].insertId), trackingCode };
}
export async function getApplicationTracking(trackingCode: string, email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ id: applications.id, status: applications.status, adminNote: applications.adminNote, createdAt: applications.createdAt, updatedAt: applications.updatedAt }).from(applications).where(and(eq(applications.trackingCode, trackingCode), eq(applications.email, email))).limit(1);
  return rows[0] ?? null;
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
  const [memberRows, productRows, courseRows, transactionRows, applicationRows] = await Promise.all([
    db.select().from(users), db.select().from(products), db.select().from(courses), db.select().from(transactions), db.select().from(applications),
  ]);
  return {
    memberCount: memberRows.filter(user => user.role === "user").length,
    activeProductCount: productRows.filter(product => product.status === "active").length,
    publishedCourseCount: courseRows.filter(course => course.isPublished === 1).length,
    grossVolumeCents: transactionRows.reduce((total, transaction) => total + transaction.amountCents, 0),
    pendingApplicationCount: applicationRows.filter(application => application.status === "pending").length,
  };
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
  const result = await db.insert(memberContacts).values({ userId, campaignId: input.campaignId ?? null, name: input.name, email: input.email, whatsapp: input.whatsapp ?? null, source: input.source, consentNote: input.consentNote ?? null });
  const id = Number(result[0].insertId);
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
