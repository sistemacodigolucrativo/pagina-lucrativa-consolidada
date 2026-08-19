import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000/';
const executablePath = process.env.PLAYWRIGHT_CHROME_PATH || '/usr/bin/chromium';
const outputDir = '/home/ubuntu/Pagina-Lucrativa-2026/docs/visual-checks';
await fs.mkdir(outputDir, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true, executablePath });
const results = [];
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.top-promo-banner');
    await page.waitForSelector('.site-header');
    await page.waitForSelector('img[src="/codigo-lucrativo-banner.png"]');
    await page.waitForSelector('img[src="/structure-mechanism.png"]');
    await page.waitForSelector('img[src="/structure-journey.png"]');
    await page.waitForSelector('img[src="/structure-value-stack.png"]');
    await page.waitForTimeout(300);

    const before = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      closeButton: document.querySelector('.top-promo-close')?.getAttribute('aria-label'),
      bannerImageWidth: document.querySelector('.top-promo-banner img')?.getBoundingClientRect().width,
      navTop: document.querySelector('.site-header')?.getBoundingClientRect().top,
      imageCount: document.querySelectorAll('img[src^="/structure-"]').length,
    }));

    await page.screenshot({ path: `${outputDir}/${viewport.name}-before-close.png`, fullPage: false });
    await page.getByRole('button', { name: 'Fechar imagem de apresentação' }).click();
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => ({
      bannerPresent: Boolean(document.querySelector('.top-promo-banner')),
      navTop: document.querySelector('.site-header')?.getBoundingClientRect().top,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    await page.screenshot({ path: `${outputDir}/${viewport.name}-after-close.png`, fullPage: false });

    const strategicImages = page.locator('img[src^="/structure-"]');
    for (let imageIndex = 0; imageIndex < await strategicImages.count(); imageIndex += 1) {
      const image = strategicImages.nth(imageIndex);
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(element => {
        if (element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0) return;
        return new Promise((resolve, reject) => {
          const node = element;
          const onLoad = () => { cleanup(); resolve(); };
          const onError = () => { cleanup(); reject(new Error(`failed to load ${node.getAttribute('src')}`)); };
          const cleanup = () => { node.removeEventListener('load', onLoad); node.removeEventListener('error', onError); };
          node.addEventListener('load', onLoad, { once: true });
          node.addEventListener('error', onError, { once: true });
        });
      });
    }
    const naturalWidths = await strategicImages.evaluateAll(images => images.map(image => ({ src: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight })));
    results.push({ viewport, before, after, naturalWidths });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
for (const result of results) {
  if (result.before.scrollWidth > result.before.innerWidth + 1) throw new Error(`${result.viewport.name}: horizontal overflow before close`);
  if (result.after.scrollWidth > result.after.innerWidth + 1) throw new Error(`${result.viewport.name}: horizontal overflow after close`);
  if (result.before.closeButton !== 'Fechar imagem de apresentação') throw new Error(`${result.viewport.name}: close button is not accessible`);
  if (result.before.imageCount !== 3) throw new Error(`${result.viewport.name}: expected 3 strategic images`);
  if (result.after.bannerPresent) throw new Error(`${result.viewport.name}: banner did not close`);
  if (result.naturalWidths.some(image => image.naturalWidth === 0 || image.naturalHeight === 0)) throw new Error(`${result.viewport.name}: an image did not load`);
}
console.log('VISUAL_CHECK_STATUS=ok');
