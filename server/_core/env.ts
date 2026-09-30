function buildPreviewDatabaseUrl() {
  const host = process.env.MYSQL_HOST?.trim();
  const port = process.env.MYSQL_PORT?.trim() || "3306";
  const database = process.env.MYSQL_DATABASE?.trim();
  const user = process.env.MYSQL_USER?.trim();
  const password = process.env.MYSQL_PASSWORD;

  if (!host || !database || !user || password === undefined || password === "") return "";
  if (!/^\d+$/.test(port)) return "";

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}

const isProduction = process.env.NODE_ENV === "production";
const previewDatabaseUrl = isProduction ? "" : buildPreviewDatabaseUrl();
const databaseUrl =
  process.env.DATABASE_URL ??
  previewDatabaseUrl ??
  process.env.REMOTE_DATABASE_URL ??
  "";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl,
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
