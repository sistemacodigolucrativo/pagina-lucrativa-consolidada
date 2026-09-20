import { readdir, readFile, lstat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

async function schemaDigest(root) {
  const hash = createHash("sha256");
  async function visit(relative) {
    const target = path.join(root, relative);
    const info = await lstat(target);
    if (info.isSymbolicLink()) throw new Error("Schema não pode depender de symlink externo.");
    hash.update(`${relative}\0`);
    if (info.isDirectory()) {
      for (const child of (await readdir(target)).sort()) await visit(path.join(relative, child));
    } else if (info.isFile()) {
      hash.update(createHash("sha256").update(await readFile(target)).digest("hex"));
    } else { throw new Error("Entrada de schema inválida."); }
  }
  await visit("drizzle");
  await visit("drizzle.config.ts");
  return hash.digest("hex");
}

export async function assertReleaseSchemaUnchanged(previous, candidate, expectedBase = "") {
  if (!previous || !candidate) throw new Error("Release anterior e candidata são obrigatórias.");
  const deployed = (await readFile(path.join(previous, ".deployed-sha"), "utf8")).trim();
  if (!/^[0-9a-f]{40}$/.test(deployed)) throw new Error("SHA implantada ausente ou inválida.");
  if (expectedBase && deployed !== expectedBase) throw new Error("A SHA implantada mudou; valide novamente a base operacional.");
  if (await schemaDigest(previous) !== await schemaDigest(candidate)) {
    throw new Error("Schema diverge da release ativa; deploy automático bloqueado. Revisão e operação de banco separadas são obrigatórias.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await assertReleaseSchemaUnchanged(...process.argv.slice(2));
    console.log("Schema idêntico ao da release ativa.");
  } catch {
    console.error("Schema/base da release ativa não pôde ser validado; implantação bloqueada.");
    process.exitCode = 1;
  }
}
