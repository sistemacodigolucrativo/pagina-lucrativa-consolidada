import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";

const ADMIN_OPEN_ID = "local_demo_admin";
const DEPLOY_SMOKE_PORT = "3199";

/**
 * Temporary production-only recovery hook.
 * It clears the persisted override so the existing built-in admin credential
 * can be used again. Remove this file immediately after the recovery deploy.
 */
export async function applyTemporaryAdminAccessRepair() {
  if (process.env.NODE_ENV !== "production" || process.env.PORT === DEPLOY_SMOKE_PORT) return;

  const db = await getDb();
  if (!db) throw new Error("[AdminAccessRepair] Banco de dados indisponível; recuperação não aplicada.");

  const adminRows = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.openId, ADMIN_OPEN_ID))
    .limit(1);
  const admin = adminRows[0];

  if (!admin || admin.role !== "admin") {
    throw new Error("[AdminAccessRepair] Conta administrativa esperada não foi encontrada; recuperação abortada.");
  }

  await db
    .update(users)
    .set({ passwordHash: null })
    .where(eq(users.openId, ADMIN_OPEN_ID));

  const verificationRows = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.openId, ADMIN_OPEN_ID))
    .limit(1);

  if (verificationRows[0]?.passwordHash !== null) {
    throw new Error("[AdminAccessRepair] Banco não confirmou a recuperação; inicialização abortada.");
  }

  console.log("[AdminAccessRepair] Credencial administrativa original restaurada e confirmada no banco.");
}
