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
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const userSecurityRecovery = mysqlTable("userSecurityRecovery", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  securityQuestion: varchar("securityQuestion", { length: 240 }).notNull(),
  securityAnswerHash: varchar("securityAnswerHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userUnique: uniqueIndex("user_security_recovery_user_unique").on(table.userId),
}));

export const publicSalesSectionImages = mysqlTable("publicSalesSectionImages", {
  id: int("id").autoincrement().primaryKey(),
  sectionId: varchar("sectionId", { length: 64 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  storageKey: varchar("storageKey", { length: 1024 }).notNull(),
  contentType: varchar("contentType", { length: 32 }).notNull(),
  status: mysqlEnum("status", ["active", "removed"]).default("active").notNull(),
  originalName: varchar("originalName", { length: 255 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  sectionUniqueIndex: uniqueIndex("public_sales_section_images_section_uidx").on(table.sectionId),
  updatedIndex: index("public_sales_section_images_updated_idx").on(table.updatedAt),
}));

export const platformSettings = mysqlTable("platformSettings", {
  key: varchar("key", { length: 96 }).primaryKey(),
  value: text("value").notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const memberAccountDetails = mysqlTable("memberAccountDetails", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  paypalEnabled: int("paypalEnabled").default(0).notNull(),
  pagseguroEmail: varchar("pagseguroEmail", { length: 320 }),
  pagseguroEnabled: int("pagseguroEnabled").default(0).notNull(),
  bank1Name: varchar("bank1Name", { length: 180 }),
  bank1Agency: varchar("bank1Agency", { length: 64 }),
  bank1Account: varchar("bank1Account", { length: 96 }),
  bank1Type: mysqlEnum("bank1Type", ["checking", "savings"]),
  bank1Holder: varchar("bank1Holder", { length: 180 }),
  bank2Name: varchar("bank2Name", { length: 180 }),
  bank2Agency: varchar("bank2Agency", { length: 64 }),
  bank2Account: varchar("bank2Account", { length: 96 }),
  bank2Type: mysqlEnum("bank2Type", ["checking", "savings"]),
  bank2Holder: varchar("bank2Holder", { length: 180 }),
  pixType: varchar("pixType", { length: 64 }),
  pixKey: varchar("pixKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userUnique: uniqueIndex("member_account_details_user_unique").on(table.userId),
}));

export const memberProfiles = mysqlTable("memberProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  slug: varchar("slug", { length: 96 }).notNull(),
  bio: text("bio"),
  whatsapp: varchar("whatsapp", { length: 32 }),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  photoUrl: varchar("photoUrl", { length: 1024 }),
  facebookUrl: varchar("facebookUrl", { length: 512 }),
  instagramUrl: varchar("instagramUrl", { length: 512 }),
  twitterUrl: varchar("twitterUrl", { length: 512 }),
  linkedinUrl: varchar("linkedinUrl", { length: 512 }),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }),
  skype: varchar("skype", { length: 255 }),
  address: varchar("address", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 32 }),
  addressComplement: varchar("addressComplement", { length: 160 }),
  postalCode: varchar("postalCode", { length: 20 }),
  district: varchar("district", { length: 120 }),
  city: varchar("city", { length: 120 }),
  state: varchar("state", { length: 80 }),
  metricsViewedAt: timestamp("metricsViewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userUnique: uniqueIndex("member_profiles_user_unique").on(table.userId),
  slugUnique: uniqueIndex("member_profiles_slug_unique").on(table.slug),
}));

export const receivingPreferences = mysqlTable("receivingPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  holderName: varchar("holderName", { length: 180 }),
  method: mysqlEnum("method", ["pix", "bank_transfer", "other"]).default("pix").notNull(),
  receivingKey: varchar("receivingKey", { length: 255 }),
  instructions: text("instructions"),
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  paypalEnabled: int("paypalEnabled").default(0).notNull(),
  pagseguroEmail: varchar("pagseguroEmail", { length: 320 }),
  pagseguroEnabled: int("pagseguroEnabled").default(0).notNull(),
  bank1Name: varchar("bank1Name", { length: 180 }),
  bank1Agency: varchar("bank1Agency", { length: 64 }),
  bank1Account: varchar("bank1Account", { length: 96 }),
  bank1Type: mysqlEnum("bank1Type", ["checking", "savings"]),
  bank1Holder: varchar("bank1Holder", { length: 180 }),
  bank2Name: varchar("bank2Name", { length: 180 }),
  bank2Agency: varchar("bank2Agency", { length: 64 }),
  bank2Account: varchar("bank2Account", { length: 96 }),
  bank2Type: mysqlEnum("bank2Type", ["checking", "savings"]),
  bank2Holder: varchar("bank2Holder", { length: 180 }),
  bank3Name: varchar("bank3Name", { length: 180 }),
  bank3Agency: varchar("bank3Agency", { length: 64 }),
  bank3Account: varchar("bank3Account", { length: 96 }),
  bank3Type: mysqlEnum("bank3Type", ["checking", "savings"]),
  bank3Holder: varchar("bank3Holder", { length: 180 }),
  bank4Name: varchar("bank4Name", { length: 180 }),
  bank4Agency: varchar("bank4Agency", { length: 64 }),
  bank4Account: varchar("bank4Account", { length: 96 }),
  bank4Type: mysqlEnum("bank4Type", ["checking", "savings"]),
  bank4Holder: varchar("bank4Holder", { length: 180 }),
  pixType: varchar("pixType", { length: 64 }),
  pixKey: varchar("pixKey", { length: 255 }),
  responsibleUseModalSeenAt: timestamp("responsibleUseModalSeenAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userUnique: uniqueIndex("receiving_preferences_user_unique").on(table.userId),
}));

export const referralLinks = mysqlTable("referralLinks", {
  id: int("id").autoincrement().primaryKey(),
  sponsorId: int("sponsorId").notNull(),
  referredUserId: int("referredUserId").notNull(),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  referredUnique: uniqueIndex("referral_links_referred_unique").on(table.referredUserId),
  sponsorIndex: index("referral_links_sponsor_idx").on(table.sponsorId),
  statusIndex: index("referral_links_status_idx").on(table.status),
}));

export const pointEntries = mysqlTable("pointEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  reason: varchar("reason", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["pending", "posted", "void"]).default("posted").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userIndex: index("point_entries_user_idx").on(table.userId),
  statusIndex: index("point_entries_status_idx").on(table.status),
}));

export const memberTestimonials = mysqlTable("memberTestimonials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  authorConfirmed: int("authorConfirmed").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "archived"]).default("pending").notNull(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userUpdatedIndex: index("member_testimonials_user_updated_idx").on(table.userId, table.updatedAt),
  statusUpdatedIndex: index("member_testimonials_status_updated_idx").on(table.status, table.updatedAt),
}));

export const campaignLinks = mysqlTable("campaignLinks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull(),
  destinationUrl: varchar("destinationUrl", { length: 1024 }).notNull(),
  source: varchar("source", { length: 96 }),
  medium: varchar("medium", { length: 96 }),
  content: varchar("content", { length: 160 }),
  status: mysqlEnum("status", ["active", "paused", "archived"]).default("active").notNull(),
  clicks: int("clicks").default(0).notNull(),
  leads: int("leads").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  archivedAt: timestamp("archivedAt"),
}, table => ({
  userCreatedIndex: index("campaign_links_user_created_idx").on(table.userId, table.createdAt),
  userStatusIndex: index("campaign_links_user_status_idx").on(table.userId, table.status),
  userSlugUnique: uniqueIndex("campaign_links_user_slug_unique").on(table.userId, table.slug),
}));

export const campaignClickEvents = mysqlTable("campaignClickEvents", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  userId: int("userId").notNull(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  referrerOrigin: varchar("referrerOrigin", { length: 255 }),
  userAgentCategory: varchar("userAgentCategory", { length: 48 }),
  deviceType: varchar("deviceType", { length: 32 }),
  utmSource: varchar("utmSource", { length: 96 }),
  utmMedium: varchar("utmMedium", { length: 96 }),
  utmCampaign: varchar("utmCampaign", { length: 160 }),
  utmContent: varchar("utmContent", { length: 160 }),
  landingPath: varchar("landingPath", { length: 512 }),
}, table => ({
  campaignDateIndex: index("campaign_click_events_campaign_date_idx").on(table.campaignId, table.occurredAt),
  userDateIndex: index("campaign_click_events_user_date_idx").on(table.userId, table.occurredAt),
  visitorIndex: index("campaign_click_events_visitor_idx").on(table.visitorId),
  sessionIndex: index("campaign_click_events_session_idx").on(table.sessionId),
}));

export const affiliateLinkClickEvents = mysqlTable("affiliateLinkClickEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  referrerOrigin: varchar("referrerOrigin", { length: 255 }),
  userAgentCategory: varchar("userAgentCategory", { length: 48 }),
  deviceType: varchar("deviceType", { length: 32 }),
  utmSource: varchar("utmSource", { length: 96 }),
  utmMedium: varchar("utmMedium", { length: 96 }),
  utmCampaign: varchar("utmCampaign", { length: 160 }),
  utmContent: varchar("utmContent", { length: 160 }),
  landingPath: varchar("landingPath", { length: 512 }),
}, table => ({
  userDateIndex: index("affiliate_link_click_events_user_date_idx").on(table.userId, table.occurredAt),
  visitorIndex: index("affiliate_link_click_events_visitor_idx").on(table.visitorId),
  sessionIndex: index("affiliate_link_click_events_session_idx").on(table.sessionId),
}));

export const campaignAttributions = mysqlTable("campaignAttributions", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  userId: int("userId").notNull(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  firstOccurredAt: timestamp("firstOccurredAt").defaultNow().notNull(),
  lastOccurredAt: timestamp("lastOccurredAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  source: varchar("source", { length: 96 }),
  medium: varchar("medium", { length: 96 }),
  campaignName: varchar("campaignName", { length: 160 }),
  content: varchar("content", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  campaignDateIndex: index("campaign_attributions_campaign_date_idx").on(table.campaignId, table.lastOccurredAt),
  userDateIndex: index("campaign_attributions_user_date_idx").on(table.userId, table.lastOccurredAt),
  userVisitorSessionUnique: uniqueIndex("campaign_attributions_user_visitor_session_unique").on(table.userId, table.visitorId, table.sessionId),
}));

export const campaignConversions = mysqlTable("campaignConversions", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  userId: int("userId").notNull(),
  attributionId: int("attributionId"),
  visitorId: varchar("visitorId", { length: 64 }),
  sessionId: varchar("sessionId", { length: 64 }),
  conversionType: mysqlEnum("conversionType", ["lead", "application", "order", "sale", "commission"]).notNull(),
  status: mysqlEnum("status", ["active", "reversed"]).default("active").notNull(),
  entityType: varchar("entityType", { length: 48 }).notNull(),
  entityId: int("entityId"),
  valueCents: int("valueCents").default(0).notNull(),
  captureMode: mysqlEnum("captureMode", ["automatic", "manual"]).default("automatic").notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  campaignDateIndex: index("campaign_conversions_campaign_date_idx").on(table.campaignId, table.occurredAt),
  userDateIndex: index("campaign_conversions_user_date_idx").on(table.userId, table.occurredAt),
  entityUnique: uniqueIndex("campaign_conversions_entity_unique").on(table.entityType, table.entityId, table.conversionType),
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
  createdBy: int("createdBy"),
  campaignId: int("campaignId"),
  type: mysqlEnum("type", ["sale", "commission", "adjustment", "withdrawal"]).notNull(),
  description: varchar("description", { length: 320 }).notNull(),
  amountCents: int("amountCents").notNull(),
  status: mysqlEnum("status", ["pending", "posted", "void"]).default("posted").notNull(),
  adminNote: text("adminNote"),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userDateIndex: index("transactions_user_date_idx").on(table.userId, table.occurredAt),
  campaignIndex: index("transactions_campaign_idx").on(table.campaignId),
}));

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 240 }).notNull(),
  routeKey: varchar("routeKey", { length: 160 }).notNull(),
  summary: text("summary"),
  category: varchar("category", { length: 96 }),
  durationMinutes: int("durationMinutes").default(0).notNull(),
  level: mysqlEnum("level", ["fundamentos", "pratica", "avancado"]).default("fundamentos").notNull(),
  ebookId: int("ebookId"),
  isPublished: int("isPublished").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  routeKeyUnique: uniqueIndex("courses_route_key_unique").on(table.routeKey),
  ebookIndex: index("courses_ebook_idx").on(table.ebookId),
}));

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
  ownerUserId: int("ownerUserId"),
  affiliateSlug: varchar("affiliateSlug", { length: 96 }),
  status: mysqlEnum("status", ["pending", "contacted", "approved", "archived"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["not_started", "awaiting_payment", "receipt_received", "confirmed", "rejected"]).default("awaiting_payment").notNull(),
  activationStatus: mysqlEnum("activationStatus", ["not_started", "access_issued", "personalization_started", "member_activated", "cancelled"]).default("not_started").notNull(),
  offerAmountCents: int("offerAmountCents").default(5000).notNull(),
  selectedPaymentMethod: varchar("selectedPaymentMethod", { length: 120 }),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  statusDateIndex: index("applications_status_date_idx").on(table.status, table.createdAt),
  emailIndex: index("applications_email_idx").on(table.email),
  ownerDateIndex: index("applications_owner_date_idx").on(table.ownerUserId, table.createdAt),
  affiliateSlugIndex: index("applications_affiliate_slug_idx").on(table.affiliateSlug),
}));

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

export const memberPaymentLinks = mysqlTable("memberPaymentLinks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  paymentUrl: varchar("paymentUrl", { length: 1024 }).notNull(),
  isEnabled: int("isEnabled").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userSortIndex: index("member_payment_links_user_sort_idx").on(table.userId, table.sortOrder),
  enabledIndex: index("member_payment_links_enabled_idx").on(table.userId, table.isEnabled),
}));

export const applicationPaymentReceipts = mysqlTable("applicationPaymentReceipts", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  ownerUserId: int("ownerUserId").notNull(),
  storageKey: varchar("storageKey", { length: 1024 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  contentType: varchar("contentType", { length: 80 }).notNull(),
  originalName: varchar("originalName", { length: 255 }),
  fileSize: int("fileSize").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy"),
}, table => ({
  applicationDateIndex: index("application_payment_receipts_application_date_idx").on(table.applicationId, table.createdAt),
  ownerStatusIndex: index("application_payment_receipts_owner_status_idx").on(table.ownerUserId, table.status),
}));

export const memberNotifications = mysqlTable("memberNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: int("entityId").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userReadDateIndex: index("member_notifications_user_read_date_idx").on(table.userId, table.readAt, table.createdAt),
  entityIndex: index("member_notifications_entity_idx").on(table.entityType, table.entityId),
}));

export const applicationAccessTokens = mysqlTable("applicationAccessTokens", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  ownerUserId: int("ownerUserId").notNull(),
  publicCode: varchar("publicCode", { length: 48 }).notNull(),
  tokenHash: varchar("tokenHash", { length: 255 }).notNull(),
  encryptedToken: varchar("encryptedToken", { length: 512 }),
  status: mysqlEnum("status", ["active", "revoked", "used"]).default("active").notNull(),
  accessCount: int("accessCount").default(0).notNull(),
  lastAccessAt: timestamp("lastAccessAt"),
  expiresAt: timestamp("expiresAt"),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
}, table => ({
  codeUnique: uniqueIndex("application_access_tokens_code_unique").on(table.publicCode),
  applicationStatusIndex: index("application_access_tokens_application_status_idx").on(table.applicationId, table.status),
  ownerStatusIndex: index("application_access_tokens_owner_status_idx").on(table.ownerUserId, table.status),
}));

export const managedContent = mysqlTable("managedContent", {
  id: int("id").autoincrement().primaryKey(),
  kind: mysqlEnum("kind", ["material", "article", "faq", "notice"]).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  summary: text("summary"),
  body: text("body"),
  resourceUrl: varchar("resourceUrl", { length: 2048 }),
  resourceCategory: varchar("resourceCategory", { length: 96 }),
  resourceType: varchar("resourceType", { length: 96 }),
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
  captureType: mysqlEnum("captureType", ["manual", "campaign", "organic"]).default("manual").notNull(),
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
