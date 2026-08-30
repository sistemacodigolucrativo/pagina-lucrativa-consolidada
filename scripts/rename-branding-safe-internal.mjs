import { readFileSync, writeFileSync } from "node:fs";

function edit(file, transform) {
  const before = readFileSync(file, "utf8");
  const after = transform(before);
  if (after !== before) {
    writeFileSync(file, after);
    console.log(`updated ${file}`);
  }
}

edit("client/src/components/PublicSocialProofToast.tsx", source => source
  .replaceAll("pagina-lucrativa:toast-preview", "codigo-lucrativo:toast-preview")
  .replace('aria-hidden="true">PL</span>', 'aria-hidden="true">CL</span>'));

edit("client/src/pages/AdminToast.tsx", source => source
  .replaceAll("pagina-lucrativa:toast-preview", "codigo-lucrativo:toast-preview"));

edit("server/storage.local.test.ts", source => source
  .replaceAll("pagina-lucrativa-storage-", "codigo-lucrativo-storage-"));

edit("e2e/package.json", source => source
  .replace('"name": "pagina-lucrativa-e2e"', '"name": "codigo-lucrativo-e2e"'));

console.log("Final safe internal branding cleanup complete.");
