import { readFileSync, writeFileSync } from "node:fs";

const phraseFiles = [
  "client/src/pages/MemberOperationCenter.tsx",
  "shared/publicSalesCopyEditor.ts",
  "e2e/tests/published-site.spec.ts",
  "README.md",
  "ROOT_URL_MIGRATION.md",
  "architecture.md",
  "auditoria_final_rotas_2026.md",
  "docs/auditoria/fluxo-adesao-pagamento-acompanhamento.md",
  "docs/auditoria-integridade-rede-pagamentos.md",
  "docs/auditoria-remocao-divulgacao-admin.md",
  "docs/auditoria-remocao-financeiro-admin.md",
  "docs/auditoria-remocao-pedidos-admin.md",
  "docs/correcoes-aplicadas-integridade-rede-pagamentos.md",
  "docs/correcoes-aplicadas-remocao-divulgacao-admin.md",
  "docs/correcoes-aplicadas-remocao-financeiro-admin.md",
  "docs/correcoes-aplicadas-remocao-pedidos-admin.md",
  "docs/diagnostico-banner-preview-2026-08-25.md",
  "docs/estrategia-reposicionamento.md",
  "docs/matriz-beneficio-glossario.md",
  "docs/member-navigation-matrix.md",
  "docs/plano-correcoes-integridade-rede-pagamentos.md",
  "docs/plano-remocao-divulgacao-admin.md",
  "docs/plano-remocao-financeiro-admin.md",
  "docs/plano-remocao-pedidos-admin.md",
  "docs/relatorio-reorganizacao-menu-publico.md",
  "docs/relatorio-toasts-prova-social-2026-08-26.md",
  "docs/validacao-remocao-banner-preview.md",
  "e2e/README.md",
  "inventario_menu_escritorio_virtual.md",
  "todo.md",
  "visual-review-notes.md",
];

function edit(file, transform) {
  const before = readFileSync(file, "utf8");
  const after = transform(before);
  if (after !== before) {
    writeFileSync(file, after);
    console.log(`updated ${file}`);
  }
}

for (const file of phraseFiles) {
  edit(file, source => source
    .replaceAll("Página Lucrativa", "Código Lucrativo")
    .replaceAll("Pagina Lucrativa", "Codigo Lucrativo")
    .replaceAll("PÁGINA LUCRATIVA", "CÓDIGO LUCRATIVO"));
}

edit("client/src/pages/Home.tsx", source => source
  .replace('aria-hidden="true">PL</span><span>Código Lucrativo</span>', 'aria-hidden="true">CL</span><span>Código Lucrativo</span>')
  .replace('affiliateSlug ?? "pagina-lucrativa"', 'affiliateSlug ?? "codigo-lucrativo"'));

edit("server/db.ts", source => source
  .replace("Configure sua Página Lucrativa antes de acompanhar métricas.", "Configure seu Código Lucrativo antes de acompanhar métricas.")
  .replace("Membro da Página Lucrativa", "Membro do Código Lucrativo"));

edit("README.md", source => source
  .replace("git clone <URL-DO-REPOSITORIO> pagina-lucrativa", "git clone <URL-DO-REPOSITORIO> codigo-lucrativo")
  .replace("cd pagina-lucrativa", "cd codigo-lucrativo"));

console.log("Safe branding migration complete.");
