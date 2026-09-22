import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { inspectManualDeploy, queueManualDeployRequest } from "./_core/manualDeploy";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");
const tempRoots: string[] = [];
const SHA = "1234567890abcdef1234567890abcdef12345678";
const TOKEN = "github_pat_test_1234567890abcdef1234567890abcdef";

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
  it("preserva o workflow real e conecta o painel ao script mestre de autodeploy", () => {
    const workflow = read(".github/workflows/deploy-vps.yml");
    const autodeploy = read("scripts/vps-autodeploy-master.sh");
    const worker = read("scripts/manual-deploy-worker.sh");
    expect(workflow).toContain("workflow_dispatch:");
    expect(worker).toContain('DEPLOY_SCRIPT="$CURRENT_RELEASE/scripts/vps-autodeploy-master.sh"');
    expect(worker).toContain('GITHUB_TOKEN="$TOKEN"');
    expect(worker).toContain('DEPLOY_REF="$DEPLOY_REF"');
    expect(worker).toContain('write_manual_result "completed"');
    expect(autodeploy).toContain('flock -n 9');
    expect(autodeploy).toContain('RUN_DRIZZLE_MIGRATIONS="${RUN_DRIZZLE_MIGRATIONS:-1}"');
    expect(autodeploy).toContain('AUTO_RUN_KNOWN_SYNC_SCRIPTS="${AUTO_RUN_KNOWN_SYNC_SCRIPTS:-1}"');
    expect(autodeploy).toContain('node "$script" --apply');
    expect(autodeploy).toContain('activate_release');
  });

  it("enfileira uma atualização com token temporário e mantém uma única solicitação", async () => {
    const { root } = tempDeployRoot();
    const before = await inspectManualDeploy(root);
    expect(before.available).toBe(true);
    expect(before.currentSha).toBe(SHA);
    expect(before.queued).toBe(false);
    expect(before.lastManualDeploy).toBeNull();
    expect(before.hasSavedGithubToken).toBe(false);
    expect(before.defaultDeployRef).toBe("main");

    const queued = await queueManualDeployRequest(100, { githubToken: TOKEN, deployRef: "main" }, root);
    expect(queued.status).toBe("queued");
    expect(queued.sha).toBe(SHA);
    expect(queued.deployRef).toBe("main");
    expect(queued.tokenSaved).toBe(false);
    expect(Date.parse(queued.requestedAt)).not.toBeNaN();
    const request = JSON.parse(readFileSync(join(root, "manual-deploy-request.json"), "utf8"));
    expect(request.sha).toBe(SHA);
    expect(request.deployRef).toBe("main");
    expect(request.githubToken).toBe(TOKEN);
    expect(request.tokenSource).toBe("inline");
    expect(request.requestedBy).toBe(100);
    await expect(queueManualDeployRequest(100, { githubToken: TOKEN }, root)).rejects.toThrow("Já existe uma solicitação");
  });

  it("permite salvar token na VPS com permissão restrita", async () => {
    const { root } = tempDeployRoot();
    const queued = await queueManualDeployRequest(100, { githubToken: TOKEN, deployRef: "main", saveGithubToken: true }, root);
    expect(queued.tokenSaved).toBe(true);
    const savedToken = readFileSync(join(root, "shared", "github-token"), "utf8").trim();
    expect(savedToken).toBe(TOKEN);
    const request = JSON.parse(readFileSync(join(root, "manual-deploy-request.json"), "utf8"));
    expect(request.githubToken).toBeUndefined();
    expect(request.tokenSource).toBe("saved");
  });

  it("exige token quando não há token salvo", async () => {
    const { root } = tempDeployRoot();
    await expect(queueManualDeployRequest(100, { deployRef: "main" }, root)).rejects.toThrow("Informe o token do GitHub");
  });

  it("worker consome a fila, chama o script mestre e grava prova do resultado manual", () => {
    const { root, release } = tempDeployRoot();
    const requestedAt = new Date().toISOString();
    writeFileSync(join(root, "manual-deploy-request.json"), JSON.stringify({ sha: SHA, deployRef: "main", githubToken: TOKEN, requestedBy: 100, requestedAt }));
    writeFileSync(join(release, "scripts", "vps-autodeploy-master.sh"), [
      "#!/usr/bin/env bash",
      "set -e",
      `printf '%s\\n' \"$DEPLOY_REF\" \"$GITHUB_TOKEN\" > \"${join(root, "worker-called.txt")}\"`,
    ].join("\n"));

    execFileSync("bash", [resolve(process.cwd(), "scripts/manual-deploy-worker.sh")], {
      env: { ...process.env, DEPLOY_ROOT: root, MANUAL_DEPLOY_WORKER_ONCE: "1", PUBLIC_HEALTHCHECK_URL: "" },
      stdio: "pipe",
      timeout: 10_000,
    });

    const called = readFileSync(join(root, "worker-called.txt"), "utf8");
    expect(called).toContain("main");
    expect(called).toContain(TOKEN);
    const audit = JSON.parse(readFileSync(join(root, "manual-deploy-result.json"), "utf8"));
    expect(audit.status).toBe("completed");
    expect(audit.sha).toBe(SHA);
    expect(audit.deployRef).toBe("main");
    expect(audit.requestedBy).toBe(100);
    expect(audit.requestedAt).toBe(requestedAt);
    expect(audit.exitCode).toBe(0);
    expect(audit.stage).toContain("validado de ponta a ponta");
    expect(() => readFileSync(join(root, "manual-deploy-request.json"), "utf8")).toThrow();
    expect(() => readFileSync(join(root, "manual-deploy-processing.json"), "utf8")).toThrow();
  });

  it("restringe o endpoint ao admin, exige confirmação e não expõe token salvo no frontend", () => {
    const endpoint = read("server/_core/manualDeploy.ts");
    const page = read("client/src/pages/AdminManualDeploy.tsx");
    const server = read("server/_core/index.ts");
    expect(endpoint).toContain('user.role !== "admin"');
    expect(endpoint).toContain('req.body?.confirm !== true');
    expect(endpoint).toContain('Acesso administrativo necessário.');
    expect(endpoint).toContain('manual-deploy-result.json');
    expect(endpoint).toContain('savedGithubToken');
    expect(endpoint).toContain('mode: 0o600');
    expect(server).toContain('registerAdminManualDeploy(app, appPrefix)');
    expect(page).toContain('body: JSON.stringify({');
    expect(page).toContain('githubToken: cleanToken || undefined');
    expect(page).toContain('saveGithubToken: Boolean(cleanToken && saveGithubToken)');
    expect(page).toContain("Última execução manual");
    expect(page).not.toContain("GITHUB_TOKEN=");
    expect(page).not.toMatch(/VPS_SSH_KEY|VPS_HOST|VPS_KNOWN_HOSTS/);
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
    expect(page).toContain('sm:grid-cols-2 lg:grid-cols-4');
    expect(page).toContain('sm:col-span-2 lg:col-span-4');
    expect(page).toContain('w-full');
    expect(page).toContain('sm:w-auto');
    expect(page).toContain('max-h-[85vh] overflow-y-auto');
    expect(page).toContain('Confirmar e iniciar');
    expect(page).toContain('Branch/ref para publicar');
    expect(page).toContain('Token GitHub');
    expect(page).toContain('Salvar este token com segurança na VPS');
  });
});
