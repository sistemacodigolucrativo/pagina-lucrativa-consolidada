import path from "node:path";

// The server and maintenance scripts must select the same database explicitly.
export function resolveDatabaseConfig(env = process.env, { allowDisabled = false } = {}) {
  const production = env.NODE_ENV === "production";
  const url = (env.DATABASE_URL || (!production && env.REMOTE_DATABASE_URL) || "").trim();
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "mysql:" || !parsed.hostname || parsed.pathname.length < 2) throw new Error();
    } catch {
      // Never include the supplied URL or driver error: they may contain credentials.
      throw new Error("DATABASE_URL inválida; informe uma URL MySQL com banco explícito.");
    }
    return { mode: "url", connection: url };
  }
  if (env.ALLOW_VPS_SOCKET_DB === "true") {
    const socketPath = env.MYSQL_SOCKET || "/run/mysqld/mysqld.sock";
    if (!path.isAbsolute(socketPath)) throw new Error("MYSQL_SOCKET deve ser absoluto.");
    return {
      mode: "socket",
      connection: {
        socketPath,
        user: env.MYSQL_USER || "ubuntu",
        database: env.MYSQL_DATABASE || "pagina_lucrativa",
        ...(env.MYSQL_PASSWORD ? { password: env.MYSQL_PASSWORD } : {}),
      },
    };
  }
  if (allowDisabled && !production) return { mode: "disabled", connection: null };
  throw new Error("DATABASE_URL é obrigatória; socket local exige ALLOW_VPS_SOCKET_DB=true explícito.");
}
