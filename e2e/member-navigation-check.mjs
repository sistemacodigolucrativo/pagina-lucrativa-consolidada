import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const results = [];

async function checkViewport(name, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  try {
    await page.goto("http://127.0.0.1:3000/acesso", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Usuário").fill("user");
    await page.getByRole("textbox", { name: "Senha" }).fill("123");
    await page.getByRole("button", { name: "Entrar na conta" }).click();
    await page.waitForURL(/\/membros(?:$|\/)/);
    if (width < 768) {
      await page.locator('button[data-sidebar="trigger"]').first().click();
      await page.waitForSelector('[data-sidebar="sidebar"]', { state: "visible" });
    } else {
      await page.waitForSelector('[data-sidebar="sidebar"]', { state: "visible" });
    }

    const groupButtons = page.locator('button[aria-label$="submenu"]');
    const groups = await groupButtons.evaluateAll(buttons => buttons.map(button => ({
      label: button.textContent?.trim(),
      aria: button.getAttribute("aria-label"),
    })));
    const bodyText = await page.locator("body").innerText();

    if (groups.length !== 8) throw new Error(`${name}: expected 8 global groups, got ${groups.length}`);
    if (!groups.map(group => group.label).join("|").includes("Vendas & Rede")) throw new Error(`${name}: Vendas & Rede missing`);
    if (!groups.map(group => group.label).join("|").includes("Academia")) throw new Error(`${name}: Academia missing`);
    if (bodyText.includes("Curso Google Ads") || bodyText.includes("Curso Facebook Ads")) throw new Error(`${name}: individual course leaked into global navigation`);

    const pageGroup = page.locator('button[aria-label^="Minha página:"]');
    if (await pageGroup.getAttribute("data-state") !== "open") await pageGroup.click();
    await page.waitForFunction(() => document.querySelector('button[aria-label^="Minha página:"]')?.getAttribute("data-state") === "open");
    const pageItem = page.locator('[data-sidebar="menu-button"]').filter({ hasText: "Minha página e perfil" });
    await pageItem.waitFor({ state: "visible" });
    await pageItem.click();
    await page.waitForURL(/\/membros\/configuracoes$/);
    if (width < 768) {
      await page.locator('button[data-sidebar="trigger"]').first().click();
      await page.waitForSelector('[data-sidebar="sidebar"]', { state: "visible" });
    }
    const pageActiveGroup = await page.getByRole("button", { name: /Minha página: .*submenu/ }).getAttribute("aria-label");

    await page.goto("http://127.0.0.1:3000/membros/academia", { waitUntil: "domcontentloaded" });
    if (width < 768) {
      await page.locator('button[data-sidebar="trigger"]').first().click();
      await page.waitForSelector('[data-sidebar="sidebar"]', { state: "visible" });
    } else {
      await page.waitForSelector('[data-sidebar="sidebar"]', { state: "visible" });
    }
    const academyGroup = await page.getByRole("button", { name: /Academia: .*submenu/ }).getAttribute("aria-label");

    results.push({ name, groups, pageActiveGroup, academyGroup });
  } finally {
    await page.close();
  }
}

try {
  await checkViewport("desktop", 1440, 900);
  await checkViewport("mobile", 390, 844);
  console.log(JSON.stringify(results, null, 2));
  console.log("MEMBER_NAVIGATION_E2E_STATUS=ok");
} finally {
  await browser.close();
}
