import { PUBLIC_HERO_TITLE } from "../shared/publicHeroTitle";
import { resetPublicHeroTitleForDeploy } from "../server/publicHeroTitleReset";

async function main() {
  const result = await resetPublicHeroTitleForDeploy();
  console.log(`[deploy] Hero público restaurado para: ${PUBLIC_HERO_TITLE}`);
  console.log(`[deploy] Registros Hero encontrados=${result.matched} atualizados=${result.updated} inalterados=${result.unchanged} malformados=${result.malformed}`);
}

main().catch(error => {
  console.error("[deploy] Falha ao restaurar o título público do Hero:", error);
  process.exitCode = 1;
});
