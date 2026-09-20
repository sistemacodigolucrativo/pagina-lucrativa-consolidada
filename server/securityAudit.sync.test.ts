import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { runContentSync } from "../scripts/sync-packaged-content.mjs";

const roots: string[] = [];
const ids = ["1111111111111111", "2222222222222222"];
async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "content-sync-")); roots.push(root);
  const projectRoot = path.join(root, "releases/new");
  for (const dir of ["ebook-import", "content-seeds", "shared"]) await mkdir(path.join(projectRoot, dir), { recursive: true });
  for (const id of ids) {
    const dir = path.join(projectRoot, "ebook-import/fontes_importados", id);
    await mkdir(dir, { recursive: true }); await writeFile(path.join(dir, "source.pdf"), "%PDF-1.4\nfixture");
  }
  await writeFile(path.join(projectRoot, "ebook-import/ebook-manifest.tsv"), "id\ttitle\tsource_file\tsource_path\tsummary\n" + ids.map((id, i) => `${id}\tLivro ${i}\tbook.pdf\tsource.pdf\tResumo ${i}`).join("\n"));
  await writeFile(path.join(projectRoot, "shared/ebookLibraryCatalog.ts"), "");
  await writeFile(path.join(projectRoot, "content-seeds/academy-courses.json"), JSON.stringify({ courses: [{ title: "Curso", slug: "curso", modules: [{ title: "Módulo", lessons: [{ sourceId: ids[0] }] }] }] }));
  const env = { NODE_ENV: "production", DATABASE_URL: "mysql://test.invalid/catalog", DEPLOY_ROOT: root, CONTENT_SYNC_BACKUP_DIR: path.join(root, "private-backups") };
  return { projectRoot, env };
}

// Transactional driver fixture: a rejected statement must leave persisted rows untouched.
function database(initial: any[] = [], beforeWrite?: (n: number) => Promise<void>) {
  const state = { rows: structuredClone(initial), writes: 0, commits: 0, rollbacks: 0, readOnly: false };
  let pending = structuredClone(initial);
  const connect = vi.fn(async () => ({
    execute: async (query: string, values: any[] = []) => {
      if (query.startsWith("SELECT ENGINE")) return [[{ engine: "InnoDB" }]];
      if (query.startsWith("SET TRANSACTION")) return [[]];
      if (query.startsWith("START TRANSACTION")) { state.readOnly = query.includes("READ ONLY"); pending = structuredClone(state.rows); return [[]]; }
      if (query.startsWith("SELECT id")) return [structuredClone(pending)];
      if (state.readOnly) throw new Error("Write attempted during READ ONLY");
      state.writes++; await beforeWrite?.(state.writes);
      if (query.startsWith("INSERT INTO ebooks")) {
        const [sourceId, sourceFile, sourcePath, title, summary, htmlContent] = values;
        pending.push({ id: pending.length + 1, sourceId, sourceFile, sourcePath, title, summary, htmlContent, status: "published", publishedAt: new Date() });
      } else if (query.startsWith("UPDATE ebooks")) {
        const [sourceFile, sourcePath, title, summary, htmlContent, id] = values;
        Object.assign(pending.find(row => row.id === id), { sourceFile, sourcePath, title, summary, htmlContent, status: "published", publishedAt: new Date() });
      } else { throw new Error(`Unexpected SQL: ${query}`); }
      return [{ affectedRows: 1 }];
    },
    commit: async () => { state.commits++; state.rows = structuredClone(pending); },
    rollback: async () => { state.rollbacks++; pending = structuredClone(state.rows); },
    end: async () => {},
  }));
  return { state, connect };
}
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

describe("HIGH-03/HIGH-04: sync controlado", () => {
  it("valida manifestos e PDFs sem conectar; arquivo obrigatório ausente impede continuar", async () => {
    const config = await fixture(); const db = database();
    expect(await runContentSync({ ...config, connect: db.connect, validateOnly: true })).toMatchObject({ totalManifestEbooks: 2, totalVersionedCourses: 1, totalVersionedLessons: 1 });
    expect(db.connect).not.toHaveBeenCalled();
    await rm(path.join(config.projectRoot, "content-seeds/academy-courses.json"));
    await expect(runContentSync({ ...config, connect: db.connect, validateOnly: true })).rejects.toThrow();
    expect(db.connect).not.toHaveBeenCalled();
  });
  it("dry-run/check detecta divergência, sem DML ou backup", async () => {
    const config = await fixture(); const db = database();
    expect(await runContentSync({ ...config, connect: db.connect, check: true })).toMatchObject({ hasChanges: true, totalPlannedInserts: 2 });
    expect(db.state).toMatchObject({ writes: 0, commits: 0, rollbacks: 1, readOnly: true, rows: [] });
    await expect(readdir(config.env.CONTENT_SYNC_BACKUP_DIR)).rejects.toThrow();
  });
  it("apply grava backup antes de escrever e a segunda verificação fica zerada", async () => {
    const config = await fixture();
    const db = database([], async () => { expect((await readdir(config.env.CONTENT_SYNC_BACKUP_DIR)).length).toBe(1); });
    const applied = await runContentSync({ ...config, connect: db.connect, apply: true });
    expect(applied.totalUpdated).toBe(2);
    expect(JSON.parse(await readFile(applied.backupPath!, "utf8"))).toMatchObject({ rows: [], plannedInsertedSourceIds: ids });
    const result = await runContentSync({ ...config, connect: db.connect, check: true });
    expect(result).toMatchObject({ hasChanges: false, totalPlannedUpdates: 0, totalPlannedInserts: 0 });
    expect(db.state.commits).toBe(1);
  });
  it("preserva resumo e corpo HTML editados pelo administrador e metadados extras", async () => {
    const config = await fixture(); const db = database();
    await runContentSync({ ...config, connect: db.connect, apply: true });
    db.state.rows[0].summary = "Resumo escrito pelo administrador";
    db.state.rows[0].title = "Título divergente";
    db.state.rows[0].htmlContent = '<html><head><meta name="codigo-lucrativo-academy" content="%7B%22customFlag%22%3Atrue%7D"></head><body>Curadoria preservada</body></html>';
    await runContentSync({ ...config, connect: db.connect, apply: true });
    expect(db.state.rows[0]).toMatchObject({ title: "Livro 0", summary: "Resumo escrito pelo administrador" });
    expect(db.state.rows[0].htmlContent).toContain("Curadoria preservada");
    expect(db.state.rows[0].htmlContent).toContain("customFlag");
    expect((await runContentSync({ ...config, connect: db.connect, check: true })).hasChanges).toBe(false);
  });
  it("falha na segunda escrita reverte a transação completa e mantém o backup", async () => {
    const config = await fixture();
    const db = database([], async n => { if (n === 2) throw new Error("simulated failure"); });
    await expect(runContentSync({ ...config, connect: db.connect, apply: true })).rejects.toThrow("simulated failure");
    expect(db.state).toMatchObject({ rows: [], commits: 0, rollbacks: 1 });
    expect(await readdir(config.env.CONTENT_SYNC_BACKUP_DIR)).toHaveLength(1);
  });
  it("duplicidade real ou PDF inválido abortam antes de DML", async () => {
    const config = await fixture(); const db = database([{ id: 1, sourceId: ids[0] }, { id: 2, sourceId: ids[0] }]);
    await expect(runContentSync({ ...config, connect: db.connect, apply: true })).rejects.toThrow("sourceId duplicado no banco");
    expect(db.state.writes).toBe(0);
    db.connect.mockClear();
    await writeFile(path.join(config.projectRoot, "ebook-import/fontes_importados", ids[0], "source.pdf"), "not a PDF");
    await expect(runContentSync({ ...config, connect: db.connect })).rejects.toThrow("PDF valido");
    expect(db.connect).not.toHaveBeenCalled();
  });
});
