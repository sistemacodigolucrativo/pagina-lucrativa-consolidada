import { randomBytes } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEPLOY_HERO_RESET_COMPLETE,
  DEPLOY_HERO_RESET_FAILED,
  DEPLOY_HERO_RESET_PENDING,
} from "../server/publicHeroTitleReset";
import { PUBLIC_HERO_TITLE } from "../shared/publicHeroTitle";

const COPY_ENDPOINT = process.env.PUBLIC_SALES_COPY_RESET_URL || "http://127.0.0.1:3101/api/public-sales-copy";

async function main() {
  const root = process.env.DEPLOY_ROOT?.trim();
  if (!root || !path.isAbsolute(root)) throw new Error("DEPLOY_ROOT absoluto é obrigatório para restaurar o Hero.");
  const pending = path.join(root, DEPLOY_HERO_RESET_PENDING);
  const complete = path.join(root, DEPLOY_HERO_RESET_COMPLETE);
  const failed = path.join(root, DEPLOY_HERO_RESET_FAILED);

  await rm(complete, { force: true });
  await rm(failed, { force: true });
  await writeFile(pending, `${randomBytes(32).toString("hex")}\n`, "utf8");

  const response = await fetch(COPY_ENDPOINT, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Aplicação não processou a restauração do Hero: HTTP ${response.status}.`);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const raw = await readFile(complete, "utf8");
      const result = JSON.parse(raw) as { status?: string; matched?: number; updated?: number; unchanged?: number; malformed?: number };
      if (result.status === "completed") {
        console.log(`[deploy] Hero público restaurado para: ${PUBLIC_HERO_TITLE}`);
        console.log(`[deploy] Registros Hero encontrados=${result.matched ?? 0} atualizados=${result.updated ?? 0} inalterados=${result.unchanged ?? 0} malformados=${result.malformed ?? 0}`);
        return;
      }
    } catch {
      // O processo da aplicação pode ainda estar concluindo a escrita do resultado.
    }

    try {
      const raw = await readFile(failed, "utf8");
      const result = JSON.parse(raw) as { status?: string };
      if (result.status === "failed") throw new Error("A aplicação falhou ao restaurar o título público do Hero.");
    } catch (error) {
      if (error instanceof Error && error.message.includes("falhou ao restaurar")) throw error;
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  throw new Error("A aplicação não confirmou a restauração do título público do Hero dentro do prazo.");
}

main().catch(error => {
  console.error("[deploy] Falha ao restaurar o título público do Hero:", error);
  process.exitCode = 1;
});
