import "dotenv/config";
import mysql from "mysql2/promise";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolveDatabaseConfig } from "../shared/databaseConfig.mjs";

// Fixed identifiers from the current schema. No SQL identifier comes from user input.
const relations = [
  ["transactions", "userId", "users"], ["transactions", "createdBy", "users"],
  ["applications", "ownerUserId", "users"],
  ["applicationPaymentReceipts", "applicationId", "applications"],
  ["applicationPaymentReceipts", "ownerUserId", "users"],
  ["applicationPaymentReceipts", "reviewedBy", "users"],
  ["applicationAccessTokens", "applicationId", "applications"],
  ["applicationAccessTokens", "ownerUserId", "users"],
  ["applicationAccessTokens", "createdBy", "users"],
  ["courseProgress", "userId", "users"],
  ["managedContent", "createdBy", "users"],
  ["ebooks", "createdBy", "users"],
  ["campaignLinks", "userId", "users"],
  ["campaignClickEvents", "campaignId", "campaignLinks"],
  ["campaignAttributions", "campaignId", "campaignLinks"],
  ["campaignConversions", "campaignId", "campaignLinks"],
  ["campaignConversions", "attributionId", "campaignAttributions"],
];

export async function checkRelationalIntegrity({ env = process.env, connect = mysql.createConnection } = {}) {
  const config = resolveDatabaseConfig(env);
  const db = await connect(config.connection);
  let started = false;
  try {
    await db.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await db.execute("START TRANSACTION READ ONLY"); started = true;
    const findings = [];
    async function count(relation, query) {
      const [rows] = await db.execute(query);
      const count = Number(rows[0]?.missing);
      if (!Number.isSafeInteger(count) || count < 0) throw new Error("Contagem inválida no diagnóstico de integridade.");
      findings.push({ relation, missingParents: count });
    }
    for (const [child, column, parent] of relations) {
      await count(`${child}.${column} -> ${parent}.id`,
        `SELECT COUNT(*) AS missing FROM \`${child}\` c LEFT JOIN \`${parent}\` p ON c.\`${column}\` = p.id WHERE c.\`${column}\` IS NOT NULL AND p.id IS NULL`);
    }
    // courseId is polymorphic: legacy courses, hashed groups, or encoded ebook IDs.
    await count("courseProgress.courseId -> courses.id (legacy only)",
      "SELECT COUNT(*) AS missing FROM courseProgress c LEFT JOIN courses p ON c.courseId = p.id WHERE c.courseId < 900000000 AND p.id IS NULL");
    await count("courseProgress.courseId -> ebooks.id (encoded reading)",
      "SELECT COUNT(*) AS missing FROM courseProgress c LEFT JOIN ebooks p ON c.courseId - 1500000000 = p.id WHERE c.courseId >= 1500000000 AND c.courseId < 2000000000 AND p.id IS NULL");
    return {
      mode: "read-only", databaseMode: config.mode,
      hasMissingParents: findings.some(item => item.missingParents > 0),
      findings,
      coverageLimitations: [
        "Hashed/legacy Academy group IDs from 900000000 to 1499999999 require reconciliation with course slugs; no direct FK to courses is valid for this range.",
        "Only listed relationships are checked. Historical author references can be intentional; review each finding before any repair.",
        "No assertion about live FKs, triggers, balances or all business invariants is made.",
      ],
    };
  } finally {
    try { if (started) await db.rollback(); } finally { await db.end(); }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    if (process.argv.length > 2) throw new Error("Este verificador não aceita modo de escrita.");
    const result = await checkRelationalIntegrity();
    console.log(JSON.stringify(result, null, 2));
    if (result.hasMissingParents) process.exitCode = 2;
  } catch {
    console.error("Verificação de integridade incompleta; confira configuração/permissões/schema em ambiente autorizado.");
    process.exitCode = 1;
  }
}
