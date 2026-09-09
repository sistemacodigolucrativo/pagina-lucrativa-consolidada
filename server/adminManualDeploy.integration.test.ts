import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { inspectManualDeploy, queueManualDeployRequest } from "./_core/manualDeploy";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");
const tempRoots: string[] = [];
const SHA = "1234567890abcdef1234567890abcdef12345678";

function tempDeployRoot() {
  const root = mkdtempSync(join(tmpdir(), "pagina-manual-deploy-"));
  tempRoots.push(root);
  const release = join(root, "releases", "current-test");
  mkdirSync(join(release, "scripts"), { recursive: true });
  writeFileSync(join(release, ".deployed-sha"), `${SHA}\n`);
  symlinkSync(release, join(root, "current"));
  writeFileSync(join(root, "deploy-status.json"), JSON.stringify({ status: "completed", progress: 100, sha: SHA, updatedAt: new Date().toISOString() }));
  writeFileSync(join(root, "manual-deploy-worker.json"), JSON.stringify({ pid: 123, updatedAt: new Date().toISOString() }));
  return { root, release };
}

afterEach(() => {
  while (tempRoots.length) rmSync(tempRoots.pop()!, { recursive: true, force: true });
});

describe("deploy manual pelo painel administrativo", () => {
  it("mantém o workflow automático e reutiliza o deploy-vps.sh real", () => {
    const workflow = read(".github/workflows/deploy-vps.yml");
    const deploy = read("scripts/deploy-vps.sh");
    const worker = read("scripts/manual-deploy-worker.sh");
    expect(workflow).toContain("push:\n    branches: [main]");
    expect(workflow).toContain("workflow_dispatch:");
    expect(worker).toContain('bash "$DEPLOY_SCRIPT" "$SHA" "$DEPLOY_ROOT" "$ARTIFACT" "$HEALTHCHECK_URL"');
    expect(deploy).toContain('flock -w 1200 9');
    expect(deploy).toContain('DEPLOY_INVOCATION="${DEPLOY_INVOCATION:-auto}"');
    expect(deploy).toContain('CURRENT_DEPLOYED_SHA" == "$TARGET_SHA"');
    expect(deploy).toContain('start_manual_deploy_worker');
    expect(deploy).toContain('write_deploy_status "completed" 100');
  });

  it("só enfileira o SHA atualmente publicado e mantém uma única solicitação", async () => {
    const { root } = tempDeployRoot();
    const before = await inspectManualDeploy(root);
    expect(before.available).toBe(true);
    expect(before.currentSha).toBe(SHA);
    expect(before.queued).toBe(false);

    const queued = await queueManualDeployRequest(100, root);
    expect(queued).toEqual({ status: "queued", sha: SHA });
    const request = JSON.parse(readFileSync(join(root, "manual-deploy-request.json"), "utf8"));
    expect(request.sha).toBe(SHA);
    expect(request.requestedBy).toBe(100);
    await expect(queueManualDeployRequest(100, root)).rejects.toThrow("Já existe uma solicitação");
  });

  it("worker consome a fila e chama o mesmo script de publicação com o membro atual", () => {
    const { root, release } = tempDeployRoot();
    writeFileSync(join(root, "manual-deploy-request.json"), JSON.stringify({ sha: SHA, requestedBy: 100, requestedAt: new Date().toISOString() }));
    writeFileSync(join(release, "scripts", "deploy-vps.sh"), [
      "#!/usr/bin/env bash",
      "set -e",
      `printf '%s\\n' \"$1\" \"$2\" > \"${join(root, "worker-called.txt")}\"`,
      "rm -f \"$3\"",
    ].join("\n"));

    execFileSync("bash", [resolve(process.cwd(), "scripts/manual-deploy-worker.sh")], {
      env: { ...process.env, DEPLOY_ROOT: root, MANUAL_DEPLOY_WORKER_ONCE: "1", PUBLIC_HEALTHCHECK_URL: "" },
      stdio: "pipe",
      timeout: 10_000,
    });

    const called = readFileSync(join(root, "worker-called.txt"), "utf8");
    expect(called).toContain(SHA);
    expect(called).toContain(root);
    expect(() => readFileSync(join(root, "manual-deploy-request.json"), "utf8")).toThrow();
    expect(() => readFileSync(join(root, "manual-deploy-processing.json"), "utf8")).toThrow();
  });

  it("restringe o endpoint ao admin, exige confirmação e não expõe secrets no frontend", () => {
    const endpoint = read("server/_core/manualDeploy.ts");
    const page = read("client/src/pages/AdminManualDeploy.tsx");
    const server = read("server/_core/index.ts");
    expect(endpoint).toContain('user.role !== "admin"');
    expect(endpoint).toContain('req.body?.confirm !== true');
    expect(endpoint).toContain('Acesso administrativo necessário.');
    expect(server).toContain('registerAdminManualDeploy(app, appPrefix)');
    expect(page).toContain('body: JSON.stringify({ confirm: true })');
    expect(page).not.toMatch(/VPS_SSH_KEY|GITHUB_TOKEN|VPS_HOST|VPS_KNOWN_HOSTS/);
  });

  it("integra a opção em Sistema e mantém layout responsivo em mobile, tablet e desktop", () => {
    const page = read("client/src/pages/AdminManualDeploy.tsx");
    const navigation = read("client/src/lib/adminNavigation.ts");
    const app = read("client/src/App.tsx");
    expect(navigation).toContain('label: "Deploy manual", path: "/admin/deploy", group: "Sistema"');
    expect(app).toContain('<Route path="/admin/deploy" component={AdminManualDeploy} />');
    expect(page).toContain('p-4 sm:p-6 lg:p-8');
    expect(page).toContain('md:grid-cols-2');
    expect(page).toContain('lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]');
    expect(page).toContain('w-full');
    expect(page).toContain('sm:w-auto');
    expect(page).toContain('max-h-[85vh] overflow-y-auto');
    expect(page).toContain('Confirmar e iniciar');
  });
});
