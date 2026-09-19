import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { desc, eq, gte } from "drizzle-orm";
import {
  affiliateLinkClickEvents,
  applicationAccessTokens,
  applicationPaymentReceipts,
  applications,
  campaignClickEvents,
  campaignConversions,
  campaignLinks,
  memberContacts,
  memberInvitations,
  memberProfiles,
  pointEntries,
  transactions,
  users,
} from "../../drizzle/schema";
import { getDb, reviewPaymentReceipt } from "../db";
import { DEMO_SESSION_COOKIE_NAME, resolveDemoSession } from "../demoAuth";

type AdminUser = NonNullable<ReturnType<typeof resolveDemoSession>>;
type PaymentStatus = "not_started" | "awaiting_payment" | "receipt_received" | "confirmed" | "rejected";

const paymentStatuses = new Set(["not_started", "awaiting_payment", "receipt_received", "confirmed", "rejected"]);

function queryString(value: unknown) {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : null;
  return typeof value === "string" ? value : null;
}

function parsePositiveInt(value: unknown) {
  const raw = queryString(value);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function cents(value: number | null | undefined) {
  return Number.isFinite(value ?? Number.NaN) ? Number(value) : 0;
}

async function requireAdmin(req: Request, res: Response): Promise<AdminUser | null> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const user = resolveDemoSession(cookies[DEMO_SESSION_COOKIE_NAME]);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Acesso administrativo necessario." });
    return null;
  }
  return user;
}

function wrap(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response) => {
    handler(req, res).catch(error => {
      console.error("Falha no backoffice comercial administrativo.", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Falha interna." });
    });
  };
}

function handleReceiptReviewError(error: unknown, res: Response) {
  const message = error instanceof Error ? error.message : "Falha ao analisar comprovante.";
  if (message === "Pedido não encontrado.") {
    res.status(404).json({ error: message });
    return;
  }
  if (
    message === "Comprovante não encontrado ou já analisado."
    || message === "Pedido sem responsável."
    || message === "Este comprovante já foi analisado por outra operação."
    || message === "O estado do pedido mudou; atualize a página antes de concluir a análise."
  ) {
    res.status(409).json({ error: message });
    return;
  }
  throw error;
}

async function listOrderRows() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");

  const rows = await db
    .select({
      id: applications.id,
      fullName: applications.fullName,
      email: applications.email,
      whatsapp: applications.whatsapp,
      trackingCode: applications.trackingCode,
      ownerUserId: applications.ownerUserId,
      affiliateSlug: applications.affiliateSlug,
      status: applications.status,
      paymentStatus: applications.paymentStatus,
      activationStatus: applications.activationStatus,
      offerAmountCents: applications.offerAmountCents,
      selectedPaymentMethod: applications.selectedPaymentMethod,
      adminNote: applications.adminNote,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      sponsorName: users.name,
      sponsorEmail: users.email,
      sponsorSlug: memberProfiles.slug,
    })
    .from(applications)
    .leftJoin(users, eq(users.id, applications.ownerUserId))
    .leftJoin(memberProfiles, eq(memberProfiles.userId, applications.ownerUserId))
    .orderBy(desc(applications.createdAt))
    .limit(500);

  const receipts = await db
    .select({
      id: applicationPaymentReceipts.id,
      applicationId: applicationPaymentReceipts.applicationId,
      fileUrl: applicationPaymentReceipts.fileUrl,
      contentType: applicationPaymentReceipts.contentType,
      originalName: applicationPaymentReceipts.originalName,
      fileSize: applicationPaymentReceipts.fileSize,
      status: applicationPaymentReceipts.status,
      createdAt: applicationPaymentReceipts.createdAt,
      reviewedAt: applicationPaymentReceipts.reviewedAt,
      reviewedBy: applicationPaymentReceipts.reviewedBy,
    })
    .from(applicationPaymentReceipts)
    .orderBy(desc(applicationPaymentReceipts.createdAt))
    .limit(1000);

  const receiptCounts = new Map<number, number>();
  const latestReceipt = new Map<number, (typeof receipts)[number]>();
  for (const receipt of receipts) {
    receiptCounts.set(receipt.applicationId, (receiptCounts.get(receipt.applicationId) ?? 0) + 1);
    if (!latestReceipt.has(receipt.applicationId)) latestReceipt.set(receipt.applicationId, receipt);
  }

  return rows.map(row => {
    const receipt = latestReceipt.get(row.id) ?? null;
    return {
      ...row,
      receiptCount: receiptCounts.get(row.id) ?? 0,
      latestReceiptId: receipt?.id ?? null,
      latestReceiptStatus: receipt?.status ?? null,
      latestReceiptUrl: receipt?.fileUrl ?? null,
      latestReceiptCreatedAt: receipt?.createdAt ?? null,
    };
  });
}

function orderTotals(items: Awaited<ReturnType<typeof listOrderRows>>) {
  return {
    total: items.length,
    awaitingPayment: items.filter(item => item.paymentStatus === "awaiting_payment").length,
    receiptReceived: items.filter(item => item.paymentStatus === "receipt_received").length,
    confirmed: items.filter(item => item.paymentStatus === "confirmed").length,
    rejected: items.filter(item => item.paymentStatus === "rejected").length,
    orphaned: items.filter(item => !item.ownerUserId).length,
    confirmedCents: items.filter(item => item.paymentStatus === "confirmed").reduce((sum, item) => sum + cents(item.offerAmountCents), 0),
    pendingCents: items.filter(item => item.paymentStatus === "awaiting_payment" || item.paymentStatus === "receipt_received").reduce((sum, item) => sum + cents(item.offerAmountCents), 0),
  };
}

async function handleOrders(req: Request, res: Response) {
  if (!await requireAdmin(req, res)) return;
  const rawPaymentStatus = queryString(req.query.paymentStatus);
  const paymentStatus = rawPaymentStatus && paymentStatuses.has(rawPaymentStatus) ? rawPaymentStatus as PaymentStatus : null;
  const query = (queryString(req.query.q) ?? "").trim().toLowerCase();
  const ownerUserId = parsePositiveInt(req.query.ownerUserId);
  const rows = await listOrderRows();
  const items = rows.filter(item => {
    if (paymentStatus && item.paymentStatus !== paymentStatus) return false;
    if (ownerUserId && item.ownerUserId !== ownerUserId) return false;
    if (!query) return true;
    return [
      item.fullName,
      item.email,
      item.whatsapp,
      item.trackingCode ?? "",
      item.affiliateSlug ?? "",
      item.sponsorName ?? "",
      item.sponsorEmail ?? "",
      item.sponsorSlug ?? "",
    ].some(value => value.toLowerCase().includes(query));
  });

  res.json({ items, totals: orderTotals(rows), generatedAt: new Date().toISOString() });
}

async function handleOrderDetail(req: Request, res: Response) {
  if (!await requireAdmin(req, res)) return;
  const applicationId = parsePositiveInt(req.params.id);
  if (!applicationId) {
    res.status(400).json({ error: "Pedido invalido." });
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");
  const row = (await listOrderRows()).find(item => item.id === applicationId);
  if (!row) {
    res.status(404).json({ error: "Pedido nao encontrado." });
    return;
  }
  const receipts = await db
    .select({
      id: applicationPaymentReceipts.id,
      applicationId: applicationPaymentReceipts.applicationId,
      ownerUserId: applicationPaymentReceipts.ownerUserId,
      fileUrl: applicationPaymentReceipts.fileUrl,
      contentType: applicationPaymentReceipts.contentType,
      originalName: applicationPaymentReceipts.originalName,
      fileSize: applicationPaymentReceipts.fileSize,
      status: applicationPaymentReceipts.status,
      createdAt: applicationPaymentReceipts.createdAt,
      reviewedAt: applicationPaymentReceipts.reviewedAt,
      reviewedBy: applicationPaymentReceipts.reviewedBy,
    })
    .from(applicationPaymentReceipts)
    .where(eq(applicationPaymentReceipts.applicationId, applicationId))
    .orderBy(desc(applicationPaymentReceipts.createdAt));

  const accessTokens = await db
    .select({
      id: applicationAccessTokens.id,
      publicCode: applicationAccessTokens.publicCode,
      status: applicationAccessTokens.status,
      accessCount: applicationAccessTokens.accessCount,
      lastAccessAt: applicationAccessTokens.lastAccessAt,
      expiresAt: applicationAccessTokens.expiresAt,
      createdAt: applicationAccessTokens.createdAt,
      createdBy: applicationAccessTokens.createdBy,
    })
    .from(applicationAccessTokens)
    .where(eq(applicationAccessTokens.applicationId, applicationId))
    .orderBy(desc(applicationAccessTokens.createdAt));

  res.json({ ...row, receipts, accessTokens });
}

async function handleOrderDelete(req: Request, res: Response) {
  if (!await requireAdmin(req, res)) return;
  const applicationId = parsePositiveInt(req.params.id);
  if (!applicationId) {
    res.status(400).json({ error: "Pedido invalido." });
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");
  const rows = await db.select({ id: applications.id }).from(applications).where(eq(applications.id, applicationId)).limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Pedido nao encontrado." });
    return;
  }
  await db.transaction(async tx => {
    await tx.delete(applicationAccessTokens).where(eq(applicationAccessTokens.applicationId, applicationId));
    await tx.delete(applicationPaymentReceipts).where(eq(applicationPaymentReceipts.applicationId, applicationId));
    await tx.delete(applications).where(eq(applications.id, applicationId));
  });
  res.json({ ok: true, id: applicationId });
}

async function handleReceiptReview(req: Request, res: Response) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const applicationId = parsePositiveInt(req.params.id);
  const receiptId = parsePositiveInt(req.params.receiptId);
  const status = queryString(req.body?.status);
  if (!applicationId || !receiptId || (status !== "approved" && status !== "rejected")) {
    res.status(400).json({ error: "Informe pedido, comprovante e status valido." });
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");
  const applicationRows = await db
    .select({ id: applications.id, ownerUserId: applications.ownerUserId })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  const application = applicationRows[0];
  if (!application) {
    res.status(404).json({ error: "Pedido nao encontrado." });
    return;
  }
  if (!application.ownerUserId) {
    res.status(409).json({ error: "Pedido sem apresentador responsavel nao pode ser aprovado." });
    return;
  }

  try {
    const result = await reviewPaymentReceipt(application.ownerUserId, { applicationId, receiptId, status }, admin.id);
    res.json({ success: true, receipt: result });
  } catch (error) {
    handleReceiptReviewError(error, res);
  }
}

async function handleFinance(req: Request, res: Response) {
  if (!await requireAdmin(req, res)) return;
  const orderRows = await listOrderRows();
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");
  const transactionRows = await db
    .select({
      id: transactions.id,
      userId: transactions.userId,
      type: transactions.type,
      description: transactions.description,
      amountCents: transactions.amountCents,
      status: transactions.status,
      adminNote: transactions.adminNote,
      occurredAt: transactions.occurredAt,
      createdAt: transactions.createdAt,
      memberName: users.name,
      memberEmail: users.email,
      memberSlug: memberProfiles.slug,
    })
    .from(transactions)
    .leftJoin(users, eq(users.id, transactions.userId))
    .leftJoin(memberProfiles, eq(memberProfiles.userId, transactions.userId))
    .orderBy(desc(transactions.occurredAt))
    .limit(300);

  const byMember = new Map<number, {
    userId: number;
    memberName: string | null;
    memberEmail: string | null;
    memberSlug: string | null;
    confirmedOrders: number;
    confirmedCents: number;
    pendingOrders: number;
    pendingCents: number;
    rejectedOrders: number;
    orphanedOrders: number;
  }>();

  for (const order of orderRows) {
    const key = order.ownerUserId ?? 0;
    const entry = byMember.get(key) ?? {
      userId: key,
      memberName: order.sponsorName ?? null,
      memberEmail: order.sponsorEmail ?? null,
      memberSlug: order.sponsorSlug ?? order.affiliateSlug ?? null,
      confirmedOrders: 0,
      confirmedCents: 0,
      pendingOrders: 0,
      pendingCents: 0,
      rejectedOrders: 0,
      orphanedOrders: 0,
    };
    if (!order.ownerUserId) entry.orphanedOrders += 1;
    if (order.paymentStatus === "confirmed") {
      entry.confirmedOrders += 1;
      entry.confirmedCents += cents(order.offerAmountCents);
    }
    if (order.paymentStatus === "awaiting_payment" || order.paymentStatus === "receipt_received") {
      entry.pendingOrders += 1;
      entry.pendingCents += cents(order.offerAmountCents);
    }
    if (order.paymentStatus === "rejected") entry.rejectedOrders += 1;
    byMember.set(key, entry);
  }

  const transactionSummary = transactionRows.reduce((summary, row) => {
    summary.total += 1;
    if (row.status === "posted") summary.postedCents += cents(row.amountCents);
    if (row.status === "pending") summary.pendingCents += cents(row.amountCents);
    if (row.status === "void") summary.voidCents += cents(row.amountCents);
    return summary;
  }, { total: 0, postedCents: 0, pendingCents: 0, voidCents: 0 });

  res.json({
    summary: {
      ...orderTotals(orderRows),
      transactionCount: transactionSummary.total,
      postedTransactionCents: transactionSummary.postedCents,
      pendingTransactionCents: transactionSummary.pendingCents,
      voidTransactionCents: transactionSummary.voidCents,
    },
    byMember: Array.from(byMember.values()).sort((a, b) => b.confirmedCents - a.confirmedCents),
    transactions: transactionRows,
    generatedAt: new Date().toISOString(),
  });
}

function periodStart(period: string | null) {
  const now = new Date();
  const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "all" ? null : 30;
  if (!days) return null;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

async function handleOperation(req: Request, res: Response) {
  if (!await requireAdmin(req, res)) return;
  const period = queryString(req.query.period) ?? "30d";
  const since = periodStart(period);
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");

  const campaignRows = await db
    .select({
      id: campaignLinks.id,
      userId: campaignLinks.userId,
      name: campaignLinks.name,
      slug: campaignLinks.slug,
      destinationUrl: campaignLinks.destinationUrl,
      source: campaignLinks.source,
      medium: campaignLinks.medium,
      status: campaignLinks.status,
      clicks: campaignLinks.clicks,
      leads: campaignLinks.leads,
      createdAt: campaignLinks.createdAt,
      updatedAt: campaignLinks.updatedAt,
      memberName: users.name,
      memberEmail: users.email,
      memberSlug: memberProfiles.slug,
    })
    .from(campaignLinks)
    .leftJoin(users, eq(users.id, campaignLinks.userId))
    .leftJoin(memberProfiles, eq(memberProfiles.userId, campaignLinks.userId))
    .orderBy(desc(campaignLinks.updatedAt))
    .limit(500);

  const campaignClicks = since
    ? await db.select({ campaignId: campaignClickEvents.campaignId, userId: campaignClickEvents.userId, occurredAt: campaignClickEvents.occurredAt }).from(campaignClickEvents).where(gte(campaignClickEvents.occurredAt, since)).limit(5000)
    : await db.select({ campaignId: campaignClickEvents.campaignId, userId: campaignClickEvents.userId, occurredAt: campaignClickEvents.occurredAt }).from(campaignClickEvents).limit(5000);
  const mainLinkClicks = since
    ? await db.select({ userId: affiliateLinkClickEvents.userId, occurredAt: affiliateLinkClickEvents.occurredAt }).from(affiliateLinkClickEvents).where(gte(affiliateLinkClickEvents.occurredAt, since)).limit(5000)
    : await db.select({ userId: affiliateLinkClickEvents.userId, occurredAt: affiliateLinkClickEvents.occurredAt }).from(affiliateLinkClickEvents).limit(5000);
  const conversions = since
    ? await db.select({ id: campaignConversions.id, campaignId: campaignConversions.campaignId, userId: campaignConversions.userId, conversionType: campaignConversions.conversionType, status: campaignConversions.status, valueCents: campaignConversions.valueCents, entityType: campaignConversions.entityType, entityId: campaignConversions.entityId, occurredAt: campaignConversions.occurredAt }).from(campaignConversions).where(gte(campaignConversions.occurredAt, since)).limit(1000)
    : await db.select({ id: campaignConversions.id, campaignId: campaignConversions.campaignId, userId: campaignConversions.userId, conversionType: campaignConversions.conversionType, status: campaignConversions.status, valueCents: campaignConversions.valueCents, entityType: campaignConversions.entityType, entityId: campaignConversions.entityId, occurredAt: campaignConversions.occurredAt }).from(campaignConversions).limit(1000);
  const contacts = since
    ? await db.select({ id: memberContacts.id, userId: memberContacts.userId, campaignId: memberContacts.campaignId, status: memberContacts.status, createdAt: memberContacts.createdAt }).from(memberContacts).where(gte(memberContacts.createdAt, since)).limit(1000)
    : await db.select({ id: memberContacts.id, userId: memberContacts.userId, campaignId: memberContacts.campaignId, status: memberContacts.status, createdAt: memberContacts.createdAt }).from(memberContacts).limit(1000);
  const invitations = since
    ? await db.select({ id: memberInvitations.id, userId: memberInvitations.userId, createdAt: memberInvitations.createdAt }).from(memberInvitations).where(gte(memberInvitations.createdAt, since)).limit(1000)
    : await db.select({ id: memberInvitations.id, userId: memberInvitations.userId, createdAt: memberInvitations.createdAt }).from(memberInvitations).limit(1000);
  const applicationRows = since
    ? await db.select({ id: applications.id, ownerUserId: applications.ownerUserId, paymentStatus: applications.paymentStatus, createdAt: applications.createdAt }).from(applications).where(gte(applications.createdAt, since)).limit(1000)
    : await db.select({ id: applications.id, ownerUserId: applications.ownerUserId, paymentStatus: applications.paymentStatus, createdAt: applications.createdAt }).from(applications).limit(1000);
  const members = await db.select({ id: users.id }).from(users).where(eq(users.role, "user")).limit(5000);

  const clicksByCampaign = new Map<number, number>();
  const conversionsByCampaign = new Map<number, number>();
  const contactsByCampaign = new Map<number, number>();
  for (const row of campaignClicks) clicksByCampaign.set(row.campaignId, (clicksByCampaign.get(row.campaignId) ?? 0) + 1);
  for (const row of conversions) conversionsByCampaign.set(row.campaignId, (conversionsByCampaign.get(row.campaignId) ?? 0) + 1);
  for (const row of contacts) if (row.campaignId) contactsByCampaign.set(row.campaignId, (contactsByCampaign.get(row.campaignId) ?? 0) + 1);

  res.json({
    period,
    since: since ? since.toISOString() : null,
    totals: {
      members: members.length,
      campaigns: campaignRows.length,
      activeCampaigns: campaignRows.filter(item => item.status === "active").length,
      campaignClicks: campaignClicks.length,
      mainLinkClicks: mainLinkClicks.length,
      conversions: conversions.length,
      contacts: contacts.length,
      invitations: invitations.length,
      applications: applicationRows.length,
      orphanedApplications: applicationRows.filter(item => !item.ownerUserId).length,
      confirmedApplications: applicationRows.filter(item => item.paymentStatus === "confirmed").length,
    },
    campaigns: campaignRows.map(row => ({
      ...row,
      periodClicks: clicksByCampaign.get(row.id) ?? 0,
      periodConversions: conversionsByCampaign.get(row.id) ?? 0,
      periodContacts: contactsByCampaign.get(row.id) ?? 0,
    })),
    recentConversions: conversions.slice(0, 100),
    generatedAt: new Date().toISOString(),
  });
}


async function handlePerformance(req: Request, res: Response) {
  if (!await requireAdmin(req, res)) return;
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      slug: memberProfiles.slug,
    })
    .from(users)
    .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .where(eq(users.role, "user"))
    .orderBy(desc(users.updatedAt))
    .limit(5000);

  const entries = await db
    .select({
      id: pointEntries.id,
      userId: pointEntries.userId,
      amount: pointEntries.amount,
      reason: pointEntries.reason,
      status: pointEntries.status,
      createdBy: pointEntries.createdBy,
      createdAt: pointEntries.createdAt,
      updatedAt: pointEntries.updatedAt,
      memberName: users.name,
      memberEmail: users.email,
      memberSlug: memberProfiles.slug,
    })
    .from(pointEntries)
    .leftJoin(users, eq(users.id, pointEntries.userId))
    .leftJoin(memberProfiles, eq(memberProfiles.userId, pointEntries.userId))
    .orderBy(desc(pointEntries.createdAt))
    .limit(1000);

  const memberSummaries = new Map(members.map(member => [member.id, { ...member, postedPoints: 0, pendingPoints: 0, entries: 0 }]));
  for (const entry of entries) {
    const summary = memberSummaries.get(entry.userId);
    if (!summary) continue;
    summary.entries += 1;
    if (entry.status === "posted") summary.postedPoints += entry.amount;
    if (entry.status === "pending") summary.pendingPoints += entry.amount;
  }

  res.json({
    totals: {
      postedPoints: entries.filter(entry => entry.status === "posted").reduce((sum, entry) => sum + entry.amount, 0),
      pendingPoints: entries.filter(entry => entry.status === "pending").reduce((sum, entry) => sum + entry.amount, 0),
      voidPoints: entries.filter(entry => entry.status === "void").reduce((sum, entry) => sum + entry.amount, 0),
      entries: entries.length,
      membersWithPoints: Array.from(memberSummaries.values()).filter(member => member.entries > 0).length,
    },
    members: Array.from(memberSummaries.values()).sort((a, b) => b.postedPoints - a.postedPoints),
    entries,
    generatedAt: new Date().toISOString(),
  });
}

async function handleCreatePointEntry(req: Request, res: Response) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const userId = Number(req.body?.userId);
  const amount = Number(req.body?.amount);
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  const status = typeof req.body?.status === "string" ? req.body.status : "posted";
  if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(amount) || !reason || reason.length > 320 || !["pending", "posted", "void"].includes(status)) {
    res.status(400).json({ error: "Informe membro, pontos, motivo e status validos." });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");
  const targetRows = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (targetRows[0]?.role !== "user") {
    res.status(404).json({ error: "Membro nao encontrado." });
    return;
  }

  await db.insert(pointEntries).values({ userId, amount, reason, status: status as "pending" | "posted" | "void", createdBy: admin.id });
  res.json({ success: true });
}

async function handleUpdatePointEntryStatus(req: Request, res: Response) {
  if (!await requireAdmin(req, res)) return;
  const entryId = parsePositiveInt(req.params.entryId);
  const status = typeof req.body?.status === "string" ? req.body.status : "";
  if (!entryId || !["pending", "posted", "void"].includes(status)) {
    res.status(400).json({ error: "Lancamento ou status invalido." });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponivel.");
  await db.update(pointEntries).set({ status: status as "pending" | "posted" | "void" }).where(eq(pointEntries.id, entryId));
  res.json({ success: true });
}

export function registerAdminCommercialOperations(app: Express, appPrefix: string) {
  const prefixes = Array.from(new Set(["/api/admin", appPrefix ? appPrefix + "/api/admin" : null].filter((path): path is string => Boolean(path))));
  for (const prefix of prefixes) {
    app.get(prefix + "/orders", wrap(handleOrders));
    app.get(prefix + "/orders/:id", wrap(handleOrderDetail));
    app.delete(prefix + "/orders/:id", wrap(handleOrderDelete));
    app.post(prefix + "/orders/:id/receipts/:receiptId/review", wrap(handleReceiptReview));
    app.get(prefix + "/finance", wrap(handleFinance));
    app.get(prefix + "/operation", wrap(handleOperation));
    app.get(prefix + "/performance", wrap(handlePerformance));
    app.post(prefix + "/performance", wrap(handleCreatePointEntry));
    app.post(prefix + "/performance/:entryId/status", wrap(handleUpdatePointEntryStatus));
  }
}
