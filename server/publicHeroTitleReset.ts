import { access, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { managedContent } from "../drizzle/schema";
import { PUBLIC_SALES_COPY_CATEGORY } from "../shared/publicSalesCopyEditor";
import { restorePublicHeroTitleBody } from "../shared/publicHeroTitle";
import { getDb } from "./db";

export const DEPLOY_HERO_RESET_PENDING = ".pending-public-hero-title-reset";
export const DEPLOY_HERO_RESET_COMPLETE = ".public-hero-title-reset-complete.json";
export const DEPLOY_HERO_RESET_FAILED = ".public-hero-title-reset-failed.json";

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function resetPublicHeroTitleForDeploy() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para restaurar o título público do Hero.");

  const rows = await db
    .select({ id: managedContent.id, body: managedContent.body, status: managedContent.status })
    .from(managedContent)
    .where(and(
      eq(managedContent.kind, "notice"),
      eq(managedContent.resourceCategory, PUBLIC_SALES_COPY_CATEGORY),
      eq(managedContent.resourceType, "hero"),
    ));

  let updated = 0;
  let unchanged = 0;
  let malformed = 0;

  for (const row of rows) {
    if (row.status === "archived") continue;
    const restoredBody = restorePublicHeroTitleBody(row.body);
    if (restoredBody === null) {
      if (row.body) malformed += 1;
      else unchanged += 1;
      continue;
    }
    if (restoredBody === row.body) {
      unchanged += 1;
      continue;
    }
    await db.update(managedContent).set({ body: restoredBody }).where(eq(managedContent.id, row.id));
    updated += 1;
  }

  return { matched: rows.length, updated, unchanged, malformed };
}

export async function processPendingPublicHeroTitleResetForDeploy(root = process.cwd()) {
  const pending = path.join(root, DEPLOY_HERO_RESET_PENDING);
  const complete = path.join(root, DEPLOY_HERO_RESET_COMPLETE);
  const failed = path.join(root, DEPLOY_HERO_RESET_FAILED);
  if (!await exists(pending)) return { processed: false as const };

  try {
    const result = await resetPublicHeroTitleForDeploy();
    await rm(failed, { force: true });
    await writeFile(complete, `${JSON.stringify({ status: "completed", finishedAt: new Date().toISOString(), ...result })}\n`, "utf8");
    await unlink(pending);
    console.info(`[PublicHeroDeployReset] concluído: ${result.updated} registro(s) atualizado(s).`);
    return { processed: true as const, success: true as const, ...result };
  } catch (error) {
    await rm(complete, { force: true });
    await writeFile(failed, `${JSON.stringify({ status: "failed", finishedAt: new Date().toISOString() })}\n`, "utf8");
    console.error("[PublicHeroDeployReset] falhou:", error);
    return { processed: true as const, success: false as const };
  }
}
