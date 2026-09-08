import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.env.PROJECT_ROOT || process.cwd();
const outputDir = path.join(root, "docs/visual-checks/admin-academy-publication-bar");

const viewports = [
  { name: "mobile-360", width: 360, height: 740 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 900 },
];

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    throw new Error(
      "Playwright não está instalado. Rode `pnpm dlx playwright install chromium` ou adicione Playwright ao ambiente de validação antes de executar este contrato visual.",
    );
  }
}

function assertMetric(condition, message, metrics) {
  if (!condition) {
    throw new Error(`${message}\n${JSON.stringify(metrics, null, 2)}`);
  }
}

const css = await readFile(path.join(root, "client/src/admin-academy-mobile.css"), "utf8");
await mkdir(outputDir, { recursive: true });

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.setContent(`<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            html, body, #root { margin: 0; min-height: 100%; background: #09090b; color: #fff; font-family: system-ui, sans-serif; }
            .dashboard-main { min-height: 140vh; }
            .content { width: min(100%, 64rem); margin: 0 auto; padding: 1rem; }
            .content-card { min-height: 18rem; border: 1px solid rgba(255,255,255,.15); border-radius: 1rem; padding: 1rem; }
            ${css}
          </style>
        </head>
        <body>
          <div id="root">
            <main class="dashboard-main flex-1">
              <main class="max-w-5xl content">
                <section class="content-card">
                  <h1>Editar Curso</h1>
                  <p>Conteúdo de teste para validar a barra no rodapé.</p>
                </section>
              </main>
              <div class="admin-academy-publication-bar fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-[220] flex justify-center px-3 pointer-events-none sm:bottom-6 sm:px-4">
                <div class="admin-academy-publication-card pointer-events-auto w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur sm:p-4">
                  <div style="display:flex; flex-direction:column; gap:.75rem;">
                    <div style="min-width:0;">
                      <p style="margin:0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#71717a;">Publicação do curso</p>
                      <p style="margin:.25rem 0 0; font-size:14px; color:#d4d4d8;">Status: <strong>Publicado</strong></p>
                    </div>
                    <button type="button" style="width:100%; min-height:44px; border:1px solid rgba(253,230,138,.3); border-radius:.75rem; background:#09090b; color:#fef3c7; font-weight:700;">Ocultar curso</button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </body>
      </html>`);

    const metrics = await page.evaluate(() => {
      const bar = document.querySelector(".admin-academy-publication-bar");
      const card = document.querySelector(".admin-academy-publication-card");
      if (!(bar instanceof HTMLElement) || !(card instanceof HTMLElement)) return { found: false };
      const barRect = bar.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const viewportCenter = window.innerWidth / 2;
      const cardCenter = cardRect.left + cardRect.width / 2;
      return {
        found: true,
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        barLeft: barRect.left,
        barRight: barRect.right,
        barWidth: barRect.width,
        cardLeft: cardRect.left,
        cardRight: cardRect.right,
        cardWidth: cardRect.width,
        centerDelta: Math.abs(cardCenter - viewportCenter),
        buttonHeight: document.querySelector("button")?.getBoundingClientRect().height ?? 0,
      };
    });

    assertMetric(metrics.found === true, "Barra de publicação não foi renderizada.", metrics);
    assertMetric(metrics.scrollWidth <= viewport.width, "A página gerou overflow horizontal.", metrics);
    assertMetric(metrics.cardLeft >= -0.5, "O card ficou cortado na lateral esquerda.", metrics);
    assertMetric(metrics.cardRight <= viewport.width + 0.5, "O card ultrapassou a lateral direita.", metrics);
    assertMetric(metrics.centerDelta <= 1, "O card não ficou centralizado no viewport.", metrics);
    assertMetric(metrics.buttonHeight >= 44, "O botão ficou abaixo da área mínima de toque mobile.", metrics);

    await page.screenshot({ path: path.join(outputDir, `${viewport.name}.png`), fullPage: true });
    results.push({ viewport, metrics, status: "ok" });
    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(
  path.join(outputDir, "result.json"),
  `${JSON.stringify({ status: "ok", checkedAt: new Date().toISOString(), results }, null, 2)}\n`,
  "utf8",
);

console.log("ADMIN_ACADEMY_PUBLICATION_BAR_VISUAL_CONTRACT=ok");
