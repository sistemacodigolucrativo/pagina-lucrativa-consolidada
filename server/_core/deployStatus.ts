import type { Express } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_STORAGE_DIR } from "../storage";

type DeployState = {
  status: "idle" | "deploying" | "completed" | "failed";
  progress: number;
  stage?: string;
  sha?: string;
  updatedAt?: string;
};

const DEFAULT_STATE: DeployState = { status: "idle", progress: 0 };

function resolveDeployStatusFile() {
  if (process.env.DEPLOY_STATUS_FILE) return process.env.DEPLOY_STATUS_FILE;
  return path.join(path.dirname(LOCAL_STORAGE_DIR), "deploy-status.json");
}

async function readDeployState(): Promise<DeployState> {
  try {
    const raw = await readFile(resolveDeployStatusFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<DeployState>;
    const progress = Math.max(0, Math.min(100, Number(parsed.progress ?? 0)));
    const status = parsed.status;
    if (!status || !["idle", "deploying", "completed", "failed"].includes(status)) return DEFAULT_STATE;
    return {
      status,
      progress,
      stage: typeof parsed.stage === "string" ? parsed.stage : undefined,
      sha: typeof parsed.sha === "string" ? parsed.sha : undefined,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function registerDeployStatus(app: Express, appPrefix = "") {
  const paths = Array.from(new Set([
    "/api/deploy-status",
    appPrefix ? `${appPrefix}/api/deploy-status` : null,
  ].filter((value): value is string => Boolean(value))));

  for (const routePath of paths) {
    app.get(routePath, async (_req, res) => {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.json(await readDeployState());
    });
  }
}
