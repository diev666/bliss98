import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseUrl = process.env.CHECK_URL || 'http://127.0.0.1:4173/index.html';
const outDir = process.env.CHECK_OUT || 'output/dock-separator-check';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => { consoleErrors.push(String(err)); });

await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
await page.fill('#username', 'Dock Test');
await page.click('#enter');
await page.waitForTimeout(700);

const runSnapshot = async (mode) => {
  const data = await page.evaluate((m) => {
    if (typeof setOsTheme === 'function') {
      setOsTheme('blissos');
    }
    if (typeof setBlissOSAqua === 'function') {
      setBlissOSAqua(m === 'aqua');
    }
    if (typeof renderBlissOSDock === 'function') {
      renderBlissOSDock();
    }
    const dock = document.querySelector('#blissosDock .blissos-dock-inner');
    const separator = document.querySelector('#blissosDock .blissos-dock-separator');
    const trash = document.querySelector('#blissosDock .blissos-dock-right [data-dock-type="trash"]');
    if (!dock || !separator || !trash) {
      return {
        mode: m,
        hasDock: !!dock,
        hasSeparator: !!separator,
        hasTrash: !!trash,
        separatorHeight: null,
        separatorBg: null,
        bodyTheme: document.body.dataset.theme || null,
        bodyStyle: document.body.dataset.blissosStyle || null,
      };
    }
    const sepStyle = window.getComputedStyle(separator);
    const trashRect = trash.getBoundingClientRect();
    const sepRect = separator.getBoundingClientRect();
    const dockTypeOrder = Array.from(document.querySelectorAll('#blissosDock .blissos-dock-right > *')).map(el => {
      if (el.classList.contains('blissos-dock-separator')) return 'separator';
      return el.getAttribute('data-dock-type') || el.tagName.toLowerCase();
    });
    return {
      mode: m,
      hasDock: true,
      hasSeparator: true,
      hasTrash: true,
      separatorHeight: Math.round(sepRect.height),
      separatorBg: sepStyle.backgroundImage,
      separatorBeforeTrash: sepRect.left < trashRect.left,
      rightOrder: dockTypeOrder,
      bodyTheme: document.body.dataset.theme || null,
      bodyStyle: document.body.dataset.blissosStyle || null,
    };
  }, mode);

  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outDir}/${mode}.png`, fullPage: true });
  return data;
};

const normal = await runSnapshot('classic');
const aqua = await runSnapshot('aqua');

const result = {
  ok: !!normal.hasSeparator && !!aqua.hasSeparator && !!normal.separatorBeforeTrash && !!aqua.separatorBeforeTrash,
  normal,
  aqua,
  consoleErrors,
};

await fs.writeFile(`${outDir}/result.json`, JSON.stringify(result, null, 2));
await browser.close();
