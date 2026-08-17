import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { campaignLinks, courses, InsertUser, memberProfiles, products, transactions, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getMemberOverview(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [profileRows, linkRows, productRows, transactionRows, recentTransactions] = await Promise.all([
    db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1),
    db.select().from(campaignLinks).where(eq(campaignLinks.userId, userId)),
    db.select().from(products).where(eq(products.ownerId, userId)),
    db.select().from(transactions).where(eq(transactions.userId, userId)),
    db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.occurredAt)).limit(5),
  ]);

  return {
    profile: profileRows[0] ?? null,
    campaignCount: linkRows.length,
    campaignClicks: linkRows.reduce((total, link) => total + link.clicks, 0),
    productCount: productRows.length,
    activeProductCount: productRows.filter(product => product.status === "active").length,
    balanceCents: transactionRows.reduce((total, transaction) => total + transaction.amountCents, 0),
    recentTransactions,
  };
}

export async function getMemberCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignLinks).where(eq(campaignLinks.userId, userId)).orderBy(desc(campaignLinks.createdAt));
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

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return null;

  const [memberRows, productRows, courseRows, transactionRows] = await Promise.all([
    db.select().from(users),
    db.select().from(products),
    db.select().from(courses),
    db.select().from(transactions),
  ]);

  return {
    memberCount: memberRows.filter(user => user.role === "user").length,
    activeProductCount: productRows.filter(product => product.status === "active").length,
    publishedCourseCount: courseRows.filter(course => course.isPublished === 1).length,
    grossVolumeCents: transactionRows.reduce((total, transaction) => total + transaction.amountCents, 0),
  };
}
