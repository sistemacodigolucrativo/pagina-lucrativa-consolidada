import { afterEach, describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { assertReleaseSchemaUnchanged } from "../scripts/check-release-schema.mjs";

const roots: string[] = [];
const guard = path.resolve("scripts/check-schema-range.sh");
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "schema-guard-")); roots.push(root);
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init", "--quiet"); git("config", "user.name", "Test"); git("config", "user.email", "test@example.invalid");
  mkdirSync(path.join(root, "drizzle")); writeFileSync(path.join(root, "drizzle/schema.ts"), "schema-original");
  writeFileSync(path.join(root, "drizzle.config.ts"), "config-original");
  const commit = () => { git("add", "."); git("commit", "--quiet", "-m", "fixture"); return git("rev-parse", "HEAD"); };
  const base = commit();
  const check = (from: string, to: string) => spawnSync("bash", [guard, from, to], { cwd: root }).status;
  return { root, git, commit, base, check };
}
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe("HIGH-06: intervalo completo e schema da release ativa", () => {
  it("propaga falha para o trap de rollback sem executar o script de deploy", () => {
    const failDeclaration = readFileSync(path.resolve("scripts/deploy-vps.sh"), "utf8").split("\n").find(line => line.startsWith("fail()"));
    expect(failDeclaration).toBeDefined();
    const result = spawnSync("bash", ["-c", `set -Eeuo pipefail\n${failDeclaration}\ntrap 'echo rollback-invoked' ERR\nfalse || fail 'simulated health failure'\necho unreachable`], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stdout.trim()).toBe("rollback-invoked");
  });
  it("aceita mudanças apenas de código e recusa base ausente/zero/desconhecida", () => {
    const f = fixture(); writeFileSync(path.join(f.root, "app.txt"), "code"); const target = f.commit();
    expect(f.check(f.base, target)).toBe(0);
    for (const base of ["", "0".repeat(40), "f".repeat(40), "--all"]) expect(f.check(base, target)).toBe(1);
  });
  it("bloqueia schema alterado antes do último commit, inclusive se revertido depois", () => {
    const f = fixture(); writeFileSync(path.join(f.root, "drizzle/schema.ts"), "changed"); f.commit();
    writeFileSync(path.join(f.root, "app.txt"), "code"); const target = f.commit();
    expect(f.check(f.base, target)).toBe(1);
    writeFileSync(path.join(f.root, "drizzle/schema.ts"), "schema-original"); const reverted = f.commit();
    expect(f.check(f.base, reverted)).toBe(1);
  });
  it("confere artefatos locais contra a release efetivamente ativa e a base declarada", async () => {
    const f = fixture(); writeFileSync(path.join(f.root, ".deployed-sha"), f.base);
    const next = path.join(f.root, "candidate"); mkdirSync(path.join(next, "drizzle"), { recursive: true });
    writeFileSync(path.join(next, "drizzle/schema.ts"), "schema-original");
    writeFileSync(path.join(next, "drizzle.config.ts"), "config-original");
    await expect(assertReleaseSchemaUnchanged(f.root, next, f.base)).resolves.toBeUndefined();
    await expect(assertReleaseSchemaUnchanged(f.root, next, "a".repeat(40))).rejects.toThrow("SHA implantada");
    writeFileSync(path.join(next, "drizzle/extra.sql"), "not executed");
    await expect(assertReleaseSchemaUnchanged(f.root, next)).rejects.toThrow("Schema diverge");
    rmSync(path.join(next, "drizzle.config.ts"));
    await expect(assertReleaseSchemaUnchanged(f.root, next)).rejects.toThrow();
  });
});
