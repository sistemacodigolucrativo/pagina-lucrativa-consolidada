import { mkdir, open, realpath, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

function within(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function canonicalPath(candidate) {
  try { return await realpath(candidate); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    const parent = path.dirname(candidate);
    if (parent === candidate) throw error;
    return path.join(await canonicalPath(parent), path.basename(candidate));
  }
}

export async function resolveContentBackupDir(env = process.env, projectRoot = process.cwd()) {
  const production = env.NODE_ENV === "production";
  if (production && !env.CONTENT_SYNC_BACKUP_DIR) throw new Error("CONTENT_SYNC_BACKUP_DIR é obrigatório em produção.");
  const candidate = env.CONTENT_SYNC_BACKUP_DIR || path.join(projectRoot, "backups");
  if (!path.isAbsolute(candidate)) throw new Error("CONTENT_SYNC_BACKUP_DIR deve ser absoluto.");
  const root = await canonicalPath(path.resolve(projectRoot));
  const target = await canonicalPath(candidate);
  const forbidden = [
    path.join(root, ".git"), path.join(root, "client/public"), path.join(root, "dist/public"),
    path.join(root, ".local-storage"),
    env.LOCAL_STORAGE_DIR || "/home/ubuntu/servicos/pagina-lucrativa/storage",
    ...(production ? [root] : []),
    ...(env.DEPLOY_ROOT ? [path.join(env.DEPLOY_ROOT, "releases"), path.join(env.DEPLOY_ROOT, "storage")] : []),
    ...(path.basename(path.dirname(root)) === "releases" ? [path.dirname(root)] : []),
  ];
  for (const directory of forbidden) {
    if (within(await canonicalPath(path.resolve(directory)), target)) {
      throw new Error("Backup deve ficar em diretório privado fora das releases e do storage público.");
    }
  }
  await mkdir(target, { recursive: true, mode: 0o700 });
  const directoryStat = await stat(target);
  if (!directoryStat.isDirectory() || (directoryStat.mode & 0o077) !== 0) {
    throw new Error("Diretório de backup deve ter permissão 0700; corrija a configuração antes do apply.");
  }
  return target;
}

export async function createContentBackup(rows, insertedSourceIds = [], options = {}) {
  const backupDir = await resolveContentBackupDir(options.env, options.projectRoot);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `packaged-content-sync-${stamp}-${randomUUID()}.json`);
  const file = await open(backupPath, "wx", 0o600);
  try {
    await file.writeFile(JSON.stringify({
      version: 2,
      createdAt: new Date().toISOString(),
      // Planned inserts are essential for a reviewed rollback; no automatic deletion.
      plannedInsertedSourceIds: insertedSourceIds,
      rows,
    }, null, 2), "utf8");
    await file.sync();
  } finally { await file.close(); }
  return backupPath;
}
