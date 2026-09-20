import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { readFile, realpath, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_STORAGE_DIR } from "../storage";
import { DEMO_SESSION_COOKIE_NAME, resolveDemoSession } from "../demoAuth";

const WORKER_FRESHNESS_MS = 15_000;

export const MANUAL_DEPLOY_UPDATES = [
  "Reempacota o código da versão atualmente publicada.",
  "Instala as dependências do release com pnpm 10.4.1.",
  "Gera novamente o build de produção do frontend e do servidor.",
  "Executa smoke test isolado na porta 3199 antes da ativação.",
  "Ativa o novo release por troca atômica do symlink current e reinicia pagina-lucrativa.service.",
  "Valida a aplicação local e o endpoint público, com rollback automático se a ativação falhar.",
] as const;

type DeployState = {
  status: "idle" | "deploying" | "completed" | "failed";
  progress: number;
  stage?: string;
  sha?: string;
  updatedAt?: string;
};

type ManualDeployAudit = {
  status: "running" | "completed" | "failed";
  sha: string;
  requestedBy: number | null;
  requestedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  stage: string | null;
  exitCode: number | null;
};

type WorkerHeartbeat = {
  updatedAt?: string;
};

class ManualDeployError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function manualDeployRoot() {
  return process.env.DEPLOY_ROOT || path.dirname(LOCAL_STORAGE_DIR);
}

function filesFor(root: string) {
  return {
    current: path.join(root, "current"),
    status: path.join(root, "deploy-status.json"),
    request: path.join(root, "manual-deploy-request.json"),
    processing: path.join(root, "manual-deploy-processing.json"),
    heartbeat: path.join(root, "manual-deploy-worker.json"),
    audit: path.join(root, "manual-deploy-result.json"),
  };
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

async function fileExists(file: string) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function readCurrentSha(root: string) {
  try {
    const release = await realpath(filesFor(root).current);
    const releasesRoot = path.join(root, "releases") + path.sep;
    if (!release.startsWith(releasesRoot)) return null;
    const sha = (await readFile(path.join(release, ".deployed-sha"), "utf8")).trim();
    return /^[0-9a-f]{40}$/.test(sha) ? sha : null;
  } catch {
    return null;
  }
}

async function readDeployState(root: string): Promise<DeployState> {
  const parsed = await readJson<Partial<DeployState>>(filesFor(root).status);
  const status = parsed?.status;
  if (!status || !["idle", "deploying", "completed", "failed"].includes(status)) {
    return { status: "idle", progress: 0 };
  }
  return {
    status,
    progress: Math.max(0, Math.min(100, Number(parsed?.progress ?? 0))),
    stage: typeof parsed?.stage === "string" ? parsed.stage : undefined,
    sha: typeof parsed?.sha === "string" ? parsed.sha : undefined,
    updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : undefined,
  };
}

async function readManualDeployAudit(root: string): Promise<ManualDeployAudit | null> {
  const parsed = await readJson<Partial<ManualDeployAudit>>(filesFor(root).audit);
  if (!parsed || !["running", "completed", "failed"].includes(String(parsed.status))) return null;
  if (typeof parsed.sha !== "string" || !/^[0-9a-f]{40}$/.test(parsed.sha)) return null;
  return {
    status: parsed.status as ManualDeployAudit["status"],
    sha: parsed.sha,
    requestedBy: Number.isInteger(parsed.requestedBy) ? Number(parsed.requestedBy) : null,
    requestedAt: typeof parsed.requestedAt === "string" ? parsed.requestedAt : null,
    startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : null,
    finishedAt: typeof parsed.finishedAt === "string" ? parsed.finishedAt : null,
    stage: typeof parsed.stage === "string" ? parsed.stage : null,
    exitCode: Number.isInteger(parsed.exitCode) ? Number(parsed.exitCode) : null,
  };
}

async function workerIsActive(root: string) {
  const heartbeat = await readJson<WorkerHeartbeat>(filesFor(root).heartbeat);
  const timestamp = heartbeat?.updatedAt ? new Date(heartbeat.updatedAt).getTime() : NaN;
  return Number.isFinite(timestamp) && Date.now() - timestamp <= WORKER_FRESHNESS_MS;
}

export async function inspectManualDeploy(root = manualDeployRoot()) {
  const deployFiles = filesFor(root);
  const [sha, workerActive, deployStatus, lastManualDeploy, requestExists, processingExists] = await Promise.all([
    readCurrentSha(root),
    workerIsActive(root),
    readDeployState(root),
    readManualDeployAudit(root),
    fileExists(deployFiles.request),
    fileExists(deployFiles.processing),
  ]);
  const queued = requestExists || processingExists;
  return {
    available: Boolean(sha && workerActive),
    currentSha: sha,
    workerActive,
    queued,
    deployStatus,
    lastManualDeploy,
    updates: MANUAL_DEPLOY_UPDATES,
  };
}

export async function queueManualDeployRequest(adminId: number, root = manualDeployRoot()) {
  const info = await inspectManualDeploy(root);
  if (!info.currentSha || !info.workerActive) {
    throw new ManualDeployError(503, "O mecanismo de deploy manual ainda não está disponível nesta instalação.");
  }
  if (info.deployStatus.status === "deploying") {
    throw new ManualDeployError(409, "Já existe um deploy em execução. Aguarde a conclusão antes de solicitar outro.");
  }
  if (info.queued) {
    throw new ManualDeployError(409, "Já existe uma solicitação de deploy manual aguardando processamento.");
  }

  const deployFiles = filesFor(root);
  const request = {
    sha: info.currentSha,
    requestedBy: adminId,
    requestedAt: new Date().toISOString(),
  };
  const temp = `${deployFiles.request}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temp, `${JSON.stringify(request)}\n`, { encoding: "utf8", mode: 0o640 });
  await rename(temp, deployFiles.request);
  return { status: "queued" as const, sha: info.currentSha, requestedAt: request.requestedAt };
}

async function requireAdmin(req: Request, res: Response) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const user = await resolveDemoSession(cookies[DEMO_SESSION_COOKIE_NAME]);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Acesso administrativo necessário." });
    return null;
  }
  return user;
}

export function registerAdminManualDeploy(app: Express, appPrefix = "") {
  const paths = Array.from(new Set([
    "/api/admin/manual-deploy",
    appPrefix ? `${appPrefix}/api/admin/manual-deploy` : null,
  ].filter((value): value is string => Boolean(value))));

  for (const routePath of paths) {
    app.get(routePath, async (req, res) => {
      if (!await requireAdmin(req, res)) return;
      res.setHeader("Cache-Control", "no-store, max-age=0");
      try {
        res.json(await inspectManualDeploy());
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Falha ao consultar deploy manual." });
      }
    });

    app.post(routePath, async (req, res) => {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      if (req.body?.confirm !== true) {
        res.status(400).json({ error: "Confirmação explícita é obrigatória para iniciar o deploy." });
        return;
      }
      try {
        res.status(202).json(await queueManualDeployRequest(admin.id));
      } catch (error) {
        if (error instanceof ManualDeployError) {
          res.status(error.statusCode).json({ error: error.message });
          return;
        }
        res.status(500).json({ error: error instanceof Error ? error.message : "Falha ao solicitar deploy manual." });
      }
    });
  }
}
