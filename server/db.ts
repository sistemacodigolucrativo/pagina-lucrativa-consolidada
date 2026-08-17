import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { existsSync } from "node:fs";
import {
  applications,
  campaignLinks,
  courses,
  InsertUser,
  managedContent,
  memberProfiles,
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

export async function getPublishedCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.isPublished, 1)).orderBy(desc(courses.updatedAt));
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

export async function createApplication(input: ApplicationInput) {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível no momento.");
  const result = await db.insert(applications).values(input);
  return { id: Number(result[0].insertId) };
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
