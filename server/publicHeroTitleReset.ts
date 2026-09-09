import { and, eq } from "drizzle-orm";
import { managedContent } from "../drizzle/schema";
import { PUBLIC_SALES_COPY_CATEGORY } from "../shared/publicSalesCopyEditor";
import { restorePublicHeroTitleBody } from "../shared/publicHeroTitle";
import { getDb } from "./db";

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
