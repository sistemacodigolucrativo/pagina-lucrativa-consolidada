import { index, int, longtext, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const memberProfiles = mysqlTable("memberProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  slug: varchar("slug", { length: 96 }).notNull(),
  bio: text("bio"),
  whatsapp: varchar("whatsapp", { length: 32 }),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  photoUrl: varchar("photoUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userUnique: uniqueIndex("member_profiles_user_unique").on(table.userId),
  slugUnique: uniqueIndex("member_profiles_slug_unique").on(table.slug),
}));

export const campaignLinks = mysqlTable("campaignLinks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull(),
  destinationUrl: varchar("destinationUrl", { length: 1024 }).notNull(),
  clicks: int("clicks").default(0).notNull(),
  leads: int("leads").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userIndex: index("campaign_links_user_idx").on(table.userId),
  slugUnique: uniqueIndex("campaign_links_slug_unique").on(table.slug),
}));

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 96 }),
  priceCents: int("priceCents").notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  ownerIndex: index("products_owner_idx").on(table.ownerId),
  statusIndex: index("products_status_idx").on(table.status),
}));

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["sale", "commission", "adjustment", "withdrawal"]).notNull(),
  description: varchar("description", { length: 320 }).notNull(),
  amountCents: int("amountCents").notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
}, table => ({
  userDateIndex: index("transactions_user_date_idx").on(table.userId, table.occurredAt),
}));

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 240 }).notNull(),
  summary: text("summary"),
  category: varchar("category", { length: 96 }),
  durationMinutes: int("durationMinutes").default(0).notNull(),
  level: mysqlEnum("level", ["fundamentos", "pratica", "avancado"]).default("fundamentos").notNull(),
  isPublished: int("isPublished").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const courseProgress = mysqlTable("courseProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  progressPercent: int("progressPercent").default(0).notNull(),
  lastAccessedAt: timestamp("lastAccessedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  courseUserUnique: uniqueIndex("course_progress_user_course_unique").on(table.userId, table.courseId),
  userIndex: index("course_progress_user_idx").on(table.userId),
}));

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 32 }).notNull(),
  trackingCode: varchar("trackingCode", { length: 24 }),
  status: mysqlEnum("status", ["pending", "contacted", "approved", "archived"]).default("pending").notNull(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  statusDateIndex: index("applications_status_date_idx").on(table.status, table.createdAt),
  emailIndex: index("applications_email_idx").on(table.email),
}));

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

export const managedContent = mysqlTable("managedContent", {
  id: int("id").autoincrement().primaryKey(),
  kind: mysqlEnum("kind", ["material", "article", "faq", "notice"]).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  summary: text("summary"),
  body: text("body"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  statusKindIndex: index("managed_content_status_kind_idx").on(table.status, table.kind),
}));

export const ebooks = mysqlTable("ebooks", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: varchar("sourceId", { length: 64 }).notNull().unique(),
  sourceFile: varchar("sourceFile", { length: 255 }).notNull(),
  sourcePath: varchar("sourcePath", { length: 1024 }).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  summary: text("summary"),
  htmlContent: longtext("htmlContent").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdBy: int("createdBy"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  statusUpdatedIndex: index("ebooks_status_updated_idx").on(table.status, table.updatedAt),
}));
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 180 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "answered", "closed"]).default("open").notNull(),
  adminResponse: text("adminResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userUpdatedIndex: index("support_tickets_user_updated_idx").on(table.userId, table.updatedAt),
  statusUpdatedIndex: index("support_tickets_status_updated_idx").on(table.status, table.updatedAt),
}));

export const memberContacts = mysqlTable("memberContacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 32 }),
  source: varchar("source", { length: 160 }).notNull(),
  consentAt: timestamp("consentAt").defaultNow().notNull(),
  consentNote: text("consentNote"),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "archived"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userStatusIndex: index("member_contacts_user_status_idx").on(table.userId, table.status),
  campaignIndex: index("member_contacts_campaign_idx").on(table.campaignId),
}));

export const memberInvitations = mysqlTable("memberInvitations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId"),
  channel: mysqlEnum("channel", ["link", "email", "whatsapp"]).default("link").notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["prepared", "cancelled"]).default("prepared").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userDateIndex: index("member_invitations_user_date_idx").on(table.userId, table.createdAt),
  contactIndex: index("member_invitations_contact_idx").on(table.contactId),
}));

export const memberActivities = mysqlTable("memberActivities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["contact_created", "contact_updated", "invitation_prepared", "invitation_cancelled", "admin_contact_update"]).notNull(),
  entityType: varchar("entityType", { length: 48 }).notNull(),
  entityId: int("entityId"),
  description: varchar("description", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userDateIndex: index("member_activities_user_date_idx").on(table.userId, table.createdAt),
}));
