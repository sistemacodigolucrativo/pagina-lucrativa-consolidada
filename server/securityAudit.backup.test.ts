import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, rm, stat, symlink } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createContentBackup, resolveContentBackupDir } from "../scripts/lib/content-sync-backup.mjs";

const roots: string[] = [];
async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "content-backup-")); roots.push(root);
  const projectRoot = path.join(root, "releases/new");
  await mkdir(projectRoot, { recursive: true });
  return { root, projectRoot };
}
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

describe("HIGH-04: backup privado persistente", () => {
  it("exige caminho absoluto fora das releases e do storage, inclusive via symlink", async () => {
    const { root, projectRoot } = await fixture();
    const env = { NODE_ENV: "production", DEPLOY_ROOT: root };
    await expect(resolveContentBackupDir(env, projectRoot)).rejects.toThrow("obrigatório");
    for (const dir of ["relative", projectRoot, path.join(root, "releases/old/backups"), path.join(root, "storage/backups")]) {
      await expect(resolveContentBackupDir({ ...env, CONTENT_SYNC_BACKUP_DIR: dir }, projectRoot)).rejects.toThrow();
    }
    await symlink(projectRoot, path.join(root, "disguised"));
    await expect(resolveContentBackupDir({ ...env, CONTENT_SYNC_BACKUP_DIR: path.join(root, "disguised/backups") }, projectRoot)).rejects.toThrow();
  });
  it("grava backups completos sem colisão e com 0700/0600; sobrevivem à remoção da release", async () => {
    const { root, projectRoot } = await fixture();
    const dir = path.join(root, "private-backups");
    const options = { projectRoot, env: { NODE_ENV: "production", DEPLOY_ROOT: root, CONTENT_SYNC_BACKUP_DIR: dir } };
    const rows = [{ id: 7, sourceId: "previous", summary: "curadoria", htmlContent: "<p>Corpo</p>" }];
    const first = await createContentBackup(rows, ["new-source"], options);
    const second = await createContentBackup(rows, [], options);
    expect(first).not.toBe(second);
    expect((await stat(dir)).mode & 0o777).toBe(0o700);
    expect((await stat(first)).mode & 0o777).toBe(0o600);
    await rm(projectRoot, { recursive: true });
    const backup = JSON.parse(await readFile(first, "utf8"));
    expect(backup).toMatchObject({ version: 2, rows, plannedInsertedSourceIds: ["new-source"] });
  });
  it("recusa diretório acessível por outros usuários sem alterar suas permissões", async () => {
    const { root, projectRoot } = await fixture();
    const dir = path.join(root, "shared"); await mkdir(dir, { mode: 0o755 });
    await expect(resolveContentBackupDir({ CONTENT_SYNC_BACKUP_DIR: dir }, projectRoot)).rejects.toThrow("0700");
    expect((await stat(dir)).mode & 0o777).toBe(0o755);
  });
});
