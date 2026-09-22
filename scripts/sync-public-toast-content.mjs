import "dotenv/config";
import { existsSync } from "node:fs";
import mysql from "mysql2/promise";

const LEGACY_PUBLIC_TOAST_CATEGORY = "Toast";
const PUBLIC_TOAST_CATEGORY = "public-toast-config";
const PUBLIC_TOAST_TEMPLATE_TYPE = "social-proof-template";
const PUBLIC_TOAST_SETTINGS_TYPE = "social-proof-settings";
const DEFAULT_DISCLAIMER = "Demonstração ilustrativa — não representa uma atividade real.";
const VPS_SOCKET_PATH = "/run/mysqld/mysqld.sock";

const templates = [
  ["Cadastro", "{{nome}} acabou de se cadastrar"],
  ["Aquisição", "{{nome}} acabou de adquirir o programa"],
  ["Entrada no grupo", "{{nome}} entrou para o grupo"],
  ["Visualização", "{{nome}} está visualizando agora"],
  ["Início", "{{nome}} acabou de iniciar o programa"],
  ["Vaga garantida", "{{nome}} acabou de garantir sua vaga"],
].map(([title, summary]) => ({
  title,
  summary,
  body: JSON.stringify({ disclaimer: DEFAULT_DISCLAIMER }),
}));

const settings = {
  title: "Configuração do Toast",
  summary: "Configuração global do sistema de Toast.",
  body: JSON.stringify({
    enabled: true,
    showSimulationNotice: true,
    headerMessage: "Atividade ilustrativa",
    footerMessage: DEFAULT_DISCLAIMER,
    headerColor: "#FACC15",
    nameColor: "#38BDF8",
    messageColor: "#FFFFFF",
    footerColor: "#F9A8D4",
    initialDelaySeconds: 12,
    intervalMinSeconds: 22,
    intervalMaxSeconds: 60,
    visibleSeconds: 5,
  }),
};

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL || process.env.REMOTE_DATABASE_URL;
  if (databaseUrl) return databaseUrl;
  if (existsSync(VPS_SOCKET_PATH)) {
    return {
      socketPath: VPS_SOCKET_PATH,
      user: process.env.DB_SOCKET_USER || "ubuntu",
      database: process.env.DB_SOCKET_DATABASE || "pagina_lucrativa",
      multipleStatements: false,
    };
  }
  throw new Error("DATABASE_URL ou REMOTE_DATABASE_URL é obrigatório para sincronizar o Toast.");
}

async function getCreatedBy(connection) {
  const [rows] = await connection.execute(
    "SELECT id FROM `users` WHERE `role` = 'admin' ORDER BY id ASC LIMIT 1",
  );
  return rows[0]?.id ?? 1;
}

async function countRows(connection, whereSql, params) {
  const [rows] = await connection.execute(`SELECT COUNT(*) AS total FROM \`managedContent\` WHERE ${whereSql}`, params);
  return Number(rows[0]?.total ?? 0);
}

async function migrateLegacyCategory(connection) {
  const [result] = await connection.execute(
    `UPDATE \`managedContent\`
       SET \`resourceCategory\` = ?
     WHERE \`kind\` = 'notice'
       AND \`resourceCategory\` = ?
       AND \`resourceType\` IN (?, ?)`,
    [PUBLIC_TOAST_CATEGORY, LEGACY_PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_TEMPLATE_TYPE, PUBLIC_TOAST_SETTINGS_TYPE],
  );
  return result.affectedRows ?? 0;
}

async function insertMissingTemplate(connection, template, createdBy) {
  const exists = await countRows(
    connection,
    "`kind` = 'notice' AND `resourceCategory` = ? AND `resourceType` = ? AND `title` = ? AND `status` <> 'archived'",
    [PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_TEMPLATE_TYPE, template.title],
  );
  if (exists > 0) return false;
  await connection.execute(
    `INSERT INTO \`managedContent\`
      (\`kind\`, \`title\`, \`summary\`, \`body\`, \`resourceUrl\`, \`resourceCategory\`, \`resourceType\`, \`status\`, \`createdBy\`)
     VALUES ('notice', ?, ?, ?, NULL, ?, ?, 'published', ?)`,
    [template.title, template.summary, template.body, PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_TEMPLATE_TYPE, createdBy],
  );
  return true;
}

async function insertMissingSettings(connection, createdBy) {
  const exists = await countRows(
    connection,
    "`kind` = 'notice' AND `resourceCategory` = ? AND `resourceType` = ? AND `status` <> 'archived'",
    [PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_SETTINGS_TYPE],
  );
  if (exists > 0) return false;
  await connection.execute(
    `INSERT INTO \`managedContent\`
      (\`kind\`, \`title\`, \`summary\`, \`body\`, \`resourceUrl\`, \`resourceCategory\`, \`resourceType\`, \`status\`, \`createdBy\`)
     VALUES ('notice', ?, ?, ?, NULL, ?, ?, 'published', ?)`,
    [settings.title, settings.summary, settings.body, PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_SETTINGS_TYPE, createdBy],
  );
  return true;
}

async function report(connection) {
  const legacyToastRows = await countRows(
    connection,
    "`kind` = 'notice' AND `resourceCategory` = ? AND `resourceType` IN (?, ?)",
    [LEGACY_PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_TEMPLATE_TYPE, PUBLIC_TOAST_SETTINGS_TYPE],
  );
  const currentToastRows = await countRows(
    connection,
    "`kind` = 'notice' AND `resourceCategory` = ? AND `resourceType` IN (?, ?)",
    [PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_TEMPLATE_TYPE, PUBLIC_TOAST_SETTINGS_TYPE],
  );
  const currentTemplates = await countRows(
    connection,
    "`kind` = 'notice' AND `resourceCategory` = ? AND `resourceType` = ? AND `status` <> 'archived'",
    [PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_TEMPLATE_TYPE],
  );
  const currentSettings = await countRows(
    connection,
    "`kind` = 'notice' AND `resourceCategory` = ? AND `resourceType` = ? AND `status` <> 'archived'",
    [PUBLIC_TOAST_CATEGORY, PUBLIC_TOAST_SETTINGS_TYPE],
  );
  return { legacyToastRows, currentToastRows, currentTemplates, currentSettings };
}

async function main() {
  const apply = hasFlag("--apply");
  const connection = await mysql.createConnection(getConnectionConfig());
  try {
    const before = await report(connection);
    console.log("[public-toast] Estado atual:", before);
    if (!apply) {
      console.log("[public-toast] Dry-run concluído. Execute com --apply para aplicar a sincronização.");
      return;
    }

    await connection.beginTransaction();
    const createdBy = await getCreatedBy(connection);
    const migratedRows = await migrateLegacyCategory(connection);
    let insertedTemplates = 0;
    for (const template of templates) {
      if (await insertMissingTemplate(connection, template, createdBy)) insertedTemplates += 1;
    }
    const insertedSettings = await insertMissingSettings(connection, createdBy);
    await connection.commit();

    const after = await report(connection);
    console.log("[public-toast] Sincronização aplicada:", {
      migratedRows,
      insertedTemplates,
      insertedSettings: insertedSettings ? 1 : 0,
      after,
    });
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error("[public-toast] Falha na sincronização:", error);
  process.exitCode = 1;
});
