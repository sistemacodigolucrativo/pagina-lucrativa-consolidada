import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { and, desc, eq } from "drizzle-orm";
import {
  affiliateLinkClickEvents,
  applicationAccessTokens,
  applications,
  campaignAttributions,
  campaignClickEvents,
  campaignConversions,
  campaignLinks,
  courseProgress,
  managedContent,
  memberAccountDetails,
  memberActivities,
  memberContacts,
  memberInvitations,
  memberNotifications,
  memberPaymentLinks,
  memberProfiles,
  memberTestimonials,
  pointEntries,
  products,
  receivingPreferences,
  referralLinks,
  supportTickets,
  transactions,
  userSecurityRecovery,
  users,
} from "../../drizzle/schema";
import { getDb, getMemberReceivingPreference, updateMemberReceivingPreference } from "../db";
import { DEMO_SESSION_COOKIE_NAME, resolveDemoSession } from "../demoAuth";

const CONTROL_CATEGORY = "member-admin-control";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type MemberControl = {
  blocked: boolean;
  deletionRequestedAt: string | null;
  deleteAfter: string | null;
  updatedBy: number;
};

function parseControl(body: string | null | undefined): MemberControl | null {
  if (!body) return null;
  try {
    const value = JSON.parse(body) as Partial<MemberControl>;
    return {
      blocked: Boolean(value.blocked),
      deletionRequestedAt: typeof value.deletionRequestedAt === "string" ? value.deletionRequestedAt : null,
      deleteAfter: typeof value.deleteAfter === "string" ? value.deleteAfter : null,
      updatedBy: Number(value.updatedBy || 0),
    };
  } catch {
    return null;
  }
}

async function requireAdmin(req: Request, res: Response) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const user = resolveDemoSession(cookies[DEMO_SESSION_COOKIE_NAME]);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Acesso administrativo necessário." });
    return null;
  }
  return user;
}

async function getControlRow(userId: number) {
  const db = await getDb();
  // A consulta de bloqueio participa da criação do contexto de autenticação.
  // Se o banco estiver temporariamente indisponível, não derrubamos toda a sessão;
  // operações administrativas que gravam estado continuam falhando de forma segura.
  if (!db) return null;
  try {
    const rows = await db.select().from(managedContent).where(and(
      eq(managedContent.resourceCategory, CONTROL_CATEGORY),
      eq(managedContent.resourceType, String(userId)),
      eq(managedContent.status, "published"),
    )).orderBy(desc(managedContent.updatedAt)).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.warn("[AdminMemberManagement] Failed to read member control state:", error);
    return null;
  }
}

async function getManagedMember(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const rows = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).where(and(eq(users.id, userId), eq(users.role, "user"))).limit(1);
  return rows[0] ?? null;
}

async function saveControl(userId: number, adminId: number, next: MemberControl) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const current = await getControlRow(userId);
  const payload = {
    kind: "notice" as const,
    title: `Controle administrativo do membro #${userId}`,
    summary: null,
    body: JSON.stringify(next),
    resourceUrl: null,
    resourceCategory: CONTROL_CATEGORY,
    resourceType: String(userId),
    status: "published" as const,
    createdBy: adminId,
  };
  if (current) await db.update(managedContent).set(payload).where(eq(managedContent.id, current.id));
  else await db.insert(managedContent).values(payload);
  return next;
}

export async function isMemberAdministrativelyBlocked(userId: number) {
  const row = await getControlRow(userId);
  const control = parseControl(row?.body);
  return Boolean(control?.blocked || control?.deletionRequestedAt);
}

async function purgeMember(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  await db.transaction(async tx => {
    await tx.delete(referralLinks).where(eq(referralLinks.sponsorId, userId));
    await tx.delete(referralLinks).where(eq(referralLinks.referredUserId, userId));
    await tx.delete(memberInvitations).where(eq(memberInvitations.userId, userId));
    await tx.delete(memberActivities).where(eq(memberActivities.userId, userId));
    await tx.delete(memberContacts).where(eq(memberContacts.userId, userId));
    await tx.delete(memberNotifications).where(eq(memberNotifications.userId, userId));
    await tx.delete(supportTickets).where(eq(supportTickets.userId, userId));
    await tx.delete(memberPaymentLinks).where(eq(memberPaymentLinks.userId, userId));
    await tx.delete(courseProgress).where(eq(courseProgress.userId, userId));
    await tx.delete(pointEntries).where(eq(pointEntries.userId, userId));
    await tx.delete(memberTestimonials).where(eq(memberTestimonials.userId, userId));
    await tx.delete(transactions).where(eq(transactions.userId, userId));
    await tx.delete(campaignConversions).where(eq(campaignConversions.userId, userId));
    await tx.delete(campaignAttributions).where(eq(campaignAttributions.userId, userId));
    await tx.delete(campaignClickEvents).where(eq(campaignClickEvents.userId, userId));
    await tx.delete(affiliateLinkClickEvents).where(eq(affiliateLinkClickEvents.userId, userId));
    await tx.delete(campaignLinks).where(eq(campaignLinks.userId, userId));
    await tx.delete(products).where(eq(products.ownerId, userId));
    await tx.delete(applicationAccessTokens).where(eq(applicationAccessTokens.ownerUserId, userId));
    await tx.update(applications).set({ ownerUserId: null, affiliateSlug: null }).where(eq(applications.ownerUserId, userId));
    await tx.delete(receivingPreferences).where(eq(receivingPreferences.userId, userId));
    await tx.delete(memberAccountDetails).where(eq(memberAccountDetails.userId, userId));
    await tx.delete(userSecurityRecovery).where(eq(userSecurityRecovery.userId, userId));
    await tx.delete(memberProfiles).where(eq(memberProfiles.userId, userId));
    await tx.delete(users).where(and(eq(users.id, userId), eq(users.role, "user")));
  });

  const control = await getControlRow(userId);
  if (control) await db.update(managedContent).set({ status: "archived" }).where(eq(managedContent.id, control.id));
}

export async function purgeExpiredMemberDeletions() {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(managedContent).where(and(
    eq(managedContent.resourceCategory, CONTROL_CATEGORY),
    eq(managedContent.status, "published"),
  ));
  const now = Date.now();
  for (const row of rows) {
    const userId = Number(row.resourceType);
    const control = parseControl(row.body);
    const deadline = control?.deleteAfter ? new Date(control.deleteAfter).getTime() : NaN;
    if (Number.isInteger(userId) && userId > 0 && Number.isFinite(deadline) && deadline <= now) {
      await purgeMember(userId);
    }
  }
}

async function listMembers() {
  await purgeExpiredMemberDeletions();
  const db = await getDb();
  if (!db) return { members: [], deletionQueue: [] };
  const [memberRows, controlRows, links] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, updatedAt: users.updatedAt, lastSignedIn: users.lastSignedIn }).from(users).where(eq(users.role, "user")).orderBy(desc(users.updatedAt)),
    db.select().from(managedContent).where(and(eq(managedContent.resourceCategory, CONTROL_CATEGORY), eq(managedContent.status, "published"))),
    db.select().from(referralLinks),
  ]);
  const controls = new Map(controlRows.map(row => [Number(row.resourceType), parseControl(row.body)]));
  const members = memberRows.map(member => {
    const control = controls.get(member.id) ?? null;
    return {
      ...member,
      blocked: Boolean(control?.blocked),
      deletionRequestedAt: control?.deletionRequestedAt ?? null,
      deleteAfter: control?.deleteAfter ?? null,
      referralsCount: links.filter(link => link.sponsorId === member.id && link.status === "active").length,
      sponsorId: links.find(link => link.referredUserId === member.id && link.status === "active")?.sponsorId ?? null,
    };
  });
  return { members, deletionQueue: members.filter(member => member.deletionRequestedAt) };
}

export function registerAdminMemberManagement(app: Express, appPrefix: string) {
  const paths = Array.from(new Set(["/api/admin/member-management", appPrefix ? `${appPrefix}/api/admin/member-management` : null].filter((value): value is string => Boolean(value))));

  for (const path of paths) {
    app.get(path, async (req, res) => {
      if (!await requireAdmin(req, res)) return;
      try { res.json(await listMembers()); }
      catch (error) { res.status(500).json({ error: error instanceof Error ? error.message : "Falha ao carregar membros." }); }
    });

    app.get(`${path}/:userId`, async (req, res) => {
      if (!await requireAdmin(req, res)) return;
      const userId = Number(req.params.userId);
      if (!Number.isInteger(userId) || userId <= 0) return void res.status(400).json({ error: "Membro inválido." });
      try {
        const member = await getManagedMember(userId);
        if (!member) return void res.status(404).json({ error: "Membro não encontrado." });
        const receiving = await getMemberReceivingPreference(userId);
        res.json({ member, receiving });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Falha ao carregar o membro." });
      }
    });

    app.post(`${path}/edit`, async (req, res) => {
      if (!await requireAdmin(req, res)) return;
      const userId = Number(req.body?.userId);
      const name = String(req.body?.name ?? "").trim();
      const email = String(req.body?.email ?? "").trim().toLowerCase();
      if (!Number.isInteger(userId) || userId <= 0 || name.length < 2 || !email.includes("@")) return void res.status(400).json({ error: "Dados do membro inválidos." });
      const db = await getDb();
      if (!db) return void res.status(503).json({ error: "Banco de dados indisponível." });
      const member = await getManagedMember(userId);
      if (!member) return void res.status(404).json({ error: "Membro não encontrado." });
      await db.update(users).set({ name, email }).where(and(eq(users.id, userId), eq(users.role, "user")));
      const updated = await getManagedMember(userId);
      res.json({ success: true, member: updated });
    });

    app.post(`${path}/receiving`, async (req, res) => {
      if (!await requireAdmin(req, res)) return;
      const userId = Number(req.body?.userId);
      if (!Number.isInteger(userId) || userId <= 0) return void res.status(400).json({ error: "Membro inválido." });
      const member = await getManagedMember(userId);
      if (!member) return void res.status(404).json({ error: "Membro não encontrado." });
      const { receivingPreferenceInput } = await import("../routers");
      const parsed = receivingPreferenceInput.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: parsed.error.issues[0]?.message || "Dados de recebimento inválidos." });
      try {
        const receiving = await updateMemberReceivingPreference(userId, parsed.data);
        res.json({ success: true, receiving });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Falha ao atualizar os dados de recebimento." });
      }
    });

    app.post(`${path}/block`, async (req, res) => {
      const admin = await requireAdmin(req, res); if (!admin) return;
      const userId = Number(req.body?.userId);
      const blocked = Boolean(req.body?.blocked);
      if (!Number.isInteger(userId) || userId <= 0) return void res.status(400).json({ error: "Membro inválido." });
      const current = parseControl((await getControlRow(userId))?.body);
      await saveControl(userId, admin.id, { blocked, deletionRequestedAt: current?.deletionRequestedAt ?? null, deleteAfter: current?.deleteAfter ?? null, updatedBy: admin.id });
      res.json({ success: true });
    });

    app.post(`${path}/delete`, async (req, res) => {
      const admin = await requireAdmin(req, res); if (!admin) return;
      const userId = Number(req.body?.userId);
      if (!Number.isInteger(userId) || userId <= 0) return void res.status(400).json({ error: "Membro inválido." });
      const requestedAt = new Date();
      const deleteAfter = new Date(requestedAt.getTime() + SEVEN_DAYS_MS);
      await saveControl(userId, admin.id, { blocked: true, deletionRequestedAt: requestedAt.toISOString(), deleteAfter: deleteAfter.toISOString(), updatedBy: admin.id });
      res.json({ success: true, deleteAfter: deleteAfter.toISOString() });
    });

    app.post(`${path}/restore`, async (req, res) => {
      const admin = await requireAdmin(req, res); if (!admin) return;
      const userId = Number(req.body?.userId);
      if (!Number.isInteger(userId) || userId <= 0) return void res.status(400).json({ error: "Membro inválido." });
      await saveControl(userId, admin.id, { blocked: false, deletionRequestedAt: null, deleteAfter: null, updatedBy: admin.id });
      res.json({ success: true });
    });
  }

  const timer = setInterval(() => { void purgeExpiredMemberDeletions().catch(error => console.error("[MemberDeletion]", error)); }, 60 * 60 * 1000);
  timer.unref?.();
  void purgeExpiredMemberDeletions().catch(error => console.error("[MemberDeletion]", error));
}
