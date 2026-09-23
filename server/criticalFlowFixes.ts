import { eq, sql } from "drizzle-orm";
import type { ApplicationInput } from "@shared/applications";
import {
  applicationAccessTokens,
  applications,
  memberProfiles,
  receivingPreferences,
  userSecurityRecovery,
  users,
} from "../drizzle/schema";
import { hashPassword, hashesMatch } from "./credentialHash";
import {
  createApplication,
  getApplicationPaymentPage,
  getApplicationPersonalizationAccess,
  getDb,
  getMemberAccount,
  resolveDefaultAffiliateProfile,
} from "./db";

type CampaignRequestLike = { headers?: { cookie?: string | string[] } };

type MemberAccountUpdate = {
  name: string;
  email: string;
  newPassword?: string | null;
};

function normalizeEmailForLookup(value: string) {
  return value.trim().toLowerCase();
}

function normalizedEmailCondition(column: typeof users.email | typeof applications.email, email: string) {
  return sql<boolean>`LOWER(TRIM(${column})) = ${normalizeEmailForLookup(email)}`;
}

function normalizeNullableSlug(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized.length ? normalized : null;
}

function normalizeSecurityAnswer(answer: string) {
  return answer.trim().replace(/\s+/g, " ").toLowerCase();
}

function hashSecurityAnswer(answer: string) {
  return hashPassword(`security-answer:${normalizeSecurityAnswer(answer)}`);
}

async function findRecoveryAccount(identifier: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const normalized = normalizeEmailForLookup(identifier);
  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      securityQuestion: userSecurityRecovery.securityQuestion,
      securityAnswerHash: userSecurityRecovery.securityAnswerHash,
    })
    .from(users)
    .innerJoin(userSecurityRecovery, eq(userSecurityRecovery.userId, users.id))
    .where(sql<boolean>`LOWER(TRIM(${users.email})) = ${normalized}`)
    .limit(1);
  return rows[0] ?? null;
}

export async function updateMemberAccountLocked(userId: number, input: MemberAccountUpdate) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const email = normalizeEmailForLookup(input.email);
  const existingEmailRows = await db.select({ id: users.id }).from(users).where(sql<boolean>`LOWER(TRIM(${users.email})) = ${email} AND ${users.id} <> ${userId}`).limit(1);
  if (existingEmailRows.length) throw new Error("Este e-mail já está em uso por outra conta.");

  const userUpdate: { name: string; email: string; passwordHash?: string; loginMethod?: string } = {
    name: input.name.trim(),
    email,
  };
  const newPassword = input.newPassword ?? null;
  if (newPassword) {
    userUpdate.passwordHash = hashPassword(newPassword);
    userUpdate.loginMethod = "password";
  }

  await db.update(users).set(userUpdate).where(eq(users.id, userId));

  if (userUpdate.passwordHash) {
    const persisted = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
    if (persisted[0]?.passwordHash !== userUpdate.passwordHash) {
      throw new Error("A nova senha não pôde ser confirmada. Tente novamente.");
    }
  }

  return getMemberAccount(userId);
}

export async function startSecurityPasswordRecoverySafe(identifier: string) {
  const row = await findRecoveryAccount(identifier);
  if (!row) throw new Error("Não encontramos recuperação configurada para essa conta.");
  return { email: row.email, securityQuestion: row.securityQuestion };
}

export async function resetPasswordWithSecurityAnswerSafe(input: { identifier: string; securityAnswer: string; newPassword: string }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const row = await findRecoveryAccount(input.identifier);
  if (!row) throw new Error("Não encontramos recuperação configurada para essa conta.");

  if (!hashesMatch(row.securityAnswerHash, `security-answer:${normalizeSecurityAnswer(input.securityAnswer)}`)) throw new Error("Resposta secreta incorreta.");

  const passwordHash = hashPassword(input.newPassword);
  await db.update(users).set({ passwordHash, loginMethod: "password" }).where(eq(users.id, row.userId));
  const persisted = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, row.userId)).limit(1);
  if (persisted[0]?.passwordHash !== passwordHash) {
    throw new Error("A nova senha não pôde ser confirmada. Tente novamente.");
  }
  return { success: true } as const;
}

export async function emailExistsForNewRegistration(email: string) {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível no momento.");
  const [userRows, applicationRows] = await Promise.all([
    db.select({ id: users.id }).from(users).where(normalizedEmailCondition(users.email, email)).limit(1),
    db.select({ id: applications.id }).from(applications).where(normalizedEmailCondition(applications.email, email)).limit(1),
  ]);
  return Boolean(userRows[0] || applicationRows[0]);
}

async function resolveApplicationAffiliate(input: ApplicationInput): Promise<ApplicationInput> {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível no momento.");

  const candidateSlug = normalizeNullableSlug(input.affiliateSlug);
  if (candidateSlug) {
    const rows = await db.select({ slug: memberProfiles.slug }).from(memberProfiles).where(eq(memberProfiles.slug, candidateSlug)).limit(1);
    if (rows[0]?.slug) return { ...input, affiliateSlug: rows[0].slug, affiliateSlugProvided: true };
  }

  const defaultAffiliate = await resolveDefaultAffiliateProfile();
  if (defaultAffiliate?.slug) return { ...input, affiliateSlug: defaultAffiliate.slug, affiliateSlugProvided: false };

  if (candidateSlug) {
    throw new Error("O link de afiliado informado é inválido e não existe um responsável padrão configurado para este cadastro.");
  }

  throw new Error("Nenhum responsável válido foi encontrado para este cadastro. Configure um afiliado padrão antes de receber novos pedidos.");
}

export async function createApplicationWithUniqueEmail(input: ApplicationInput, request?: CampaignRequestLike) {
  if (await emailExistsForNewRegistration(input.email)) {
    throw new Error("Este e-mail já está cadastrado. Use o acesso existente ou informe outro e-mail.");
  }
  return createApplication(await resolveApplicationAffiliate(input), request);
}

export async function getApplicationPaymentPageComplete(trackingCode: string, paymentAccessToken: string) {
  const base = await getApplicationPaymentPage(trackingCode, paymentAccessToken);
  if (!base) return null;

  const db = await getDb();
  if (!db) return base;
  const normalizedTrackingCode = trackingCode.trim().toUpperCase();
  const applicationRows = await db
    .select({ ownerUserId: applications.ownerUserId })
    .from(applications)
    .where(eq(applications.trackingCode, normalizedTrackingCode))
    .limit(1);
  const ownerId = applicationRows[0]?.ownerUserId ?? null;
  if (!ownerId) return { ...base, receiving: null };

  const receivingRows = await db.select().from(receivingPreferences).where(eq(receivingPreferences.userId, ownerId)).limit(1);
  const receiving = receivingRows[0];
  if (!receiving) return { ...base, receiving: null };

  const banks = [1, 2, 3, 4].map(index => {
    const row = receiving as typeof receiving & Record<string, string | number | Date | null>;
    const name = row[`bank${index}Name`] as string | null;
    const agency = row[`bank${index}Agency`] as string | null;
    const account = row[`bank${index}Account`] as string | null;
    const type = row[`bank${index}Type`] as "checking" | "savings" | null;
    const holder = row[`bank${index}Holder`] as string | null;
    return { name, agency, account, type, holder };
  }).filter(bank => Boolean(bank.name || bank.agency || bank.account || bank.holder));

  return {
    ...base,
    receiving: {
      preferredMethod: receiving.method,
      holderName: receiving.holderName ?? null,
      receivingKey: receiving.receivingKey ?? null,
      instructions: receiving.instructions ?? null,
      pagSeguro: receiving.pagseguroEnabled && receiving.pagseguroEmail ? { email: receiving.pagseguroEmail } : null,
      paypal: receiving.paypalEnabled && receiving.paypalEmail ? { email: receiving.paypalEmail } : null,
      banks,
      other: receiving.method === "other" && (receiving.receivingKey || receiving.instructions)
        ? { key: receiving.receivingKey ?? null, instructions: receiving.instructions ?? null }
        : null,
    },
  };
}

export async function getApplicationPersonalizationAccessPrefilled(publicCode: string) {
  const base = await getApplicationPersonalizationAccess(publicCode);
  if (!base) return null;
  const db = await getDb();
  if (!db) return { ...base, whatsapp: "" };

  const tokenRows = await db.select({ applicationId: applicationAccessTokens.applicationId })
    .from(applicationAccessTokens)
    .where(eq(applicationAccessTokens.publicCode, publicCode))
    .limit(1);
  const applicationId = tokenRows[0]?.applicationId;
  if (!applicationId) return { ...base, whatsapp: "" };

  const applicationRows = await db.select({ whatsapp: applications.whatsapp }).from(applications).where(eq(applications.id, applicationId)).limit(1);
  return { ...base, whatsapp: applicationRows[0]?.whatsapp ?? "" };
}
