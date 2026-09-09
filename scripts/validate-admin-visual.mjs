import { chromium } from "playwright";
import { createHmac } from "node:crypto";
import { mkdir } from "node:fs/promises";

const baseURL = "http://127.0.0.1:4173";
const secret = "admin-visual-validation-secret";
const encodedPayload = Buffer.from(JSON.stringify({
  openId: "local_demo_admin",
  role: "admin",
  expiresAt: Date.now() + 60 * 60 * 1000,
}), "utf8").toString("base64url");
const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
const cookieValue = `${encodedPayload}.${signature}`;

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const routes = [
  { path: "/admin/publicacoes", heading: "Publicações", required: ["Publicações cadastradas"] },
  { path: "/admin/ebooks", heading: "Biblioteca de e-books", required: ["E-books cadastrados", "Regras de exibição"] },
  { path: "/admin/ebooks/novo", heading: "Novo e-book", required: ["Novo e-book PDF", "Voltar para e-books"] },
  { path: "/admin/ebooks/1/editar", heading: "Editar e-book", required: ["Editar material", "Voltar para e-books"] },
  { path: "/admin/relatos", heading: "Agradecimentos de membros", required: ["Em análise", "Aprovado", "Necessita ajuste", "Arquivado"] },
  { path: "/admin/relatos/em-analise", heading: "Agradecimentos — Em análise", required: ["Voltar para Agradecimentos"] },
  { path: "/admin/relatos/aprovados", heading: "Agradecimentos — Aprovado", required: ["Voltar para Agradecimentos"] },
  { path: "/admin/relatos/necessita-ajuste", heading: "Agradecimentos — Necessita ajuste", required: ["Voltar para Agradecimentos"] },
  { path: "/admin/relatos/arquivados", heading: "Agradecimentos — Arquivado", required: ["Voltar para Agradecimentos"] },
];

await mkdir("visual-artifacts", { recursive: true });
const browser = await chromium.launch({ headless: true });
let failures = 0;

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.addCookies([{ name: "pl_demo_session", value: cookieValue, url: baseURL, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();

  for (const route of routes) {
    const response = await page.goto(`${baseURL}${route.path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(250);
    const currentPath = new URL(page.url()).pathname;
    const h1 = (await page.locator("h1").first().textContent().catch(() => null))?.trim() ?? "";
    const bodyText = await page.locator("body").innerText();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }));
    const horizontalOverflow = Math.max(dimensions.documentWidth, dimensions.bodyWidth) > dimensions.viewport + 1;
    const missing = route.required.filter(text => !bodyText.includes(text));
    const headingOk = h1.includes(route.heading);
    const routeOk = currentPath === route.path;
    const httpOk = response ? response.status() < 500 : true;
    const ok = routeOk && headingOk && !horizontalOverflow && missing.length === 0 && httpOk;

    console.log(JSON.stringify({
      viewport: viewport.name,
      size: `${viewport.width}x${viewport.height}`,
      route: route.path,
      currentPath,
      heading: h1,
      documentWidth: dimensions.documentWidth,
      bodyWidth: dimensions.bodyWidth,
      expectedWidth: dimensions.viewport,
      horizontalOverflow,
      missing,
      httpStatus: response?.status() ?? null,
      ok,
    }));

    await page.screenshot({
      path: `visual-artifacts/${viewport.name}-${route.path.replaceAll("/", "_").replace(/^_/, "") || "home"}.png`,
      fullPage: true,
    });

    if (!ok) failures += 1;
  }
  await context.close();
}

await browser.close();
if (failures) {
  console.error(`Validação visual falhou em ${failures} combinação(ões) de rota/viewport.`);
  process.exit(1);
}
console.log("Validação visual concluída: todas as rotas passaram em Mobile, Tablet e Desktop sem overflow horizontal.");
