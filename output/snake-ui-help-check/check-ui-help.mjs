import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-ui-help-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle','--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const consoleErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 10000 });
await page.waitForTimeout(220);

const win = await page.$('#win_games');
if(win) await win.screenshot({ path: path.join(outDir, 'snake-layout.png') });

await page.click('#win_games .titlebar', { force: true });
await page.waitForTimeout(100);

const menuMode = await page.evaluate(() => {
  const topHelp = document.querySelector('#blissosMenubar .blissos-menu-item[data-blissos-menu="help"]');
  if(topHelp && topHelp.offsetParent !== null) return 'blissos';
  const winHelp = document.querySelector('#win_games .menubar span[data-menu="help"]');
  if(winHelp && winHelp.offsetParent !== null) return 'window';
  return 'none';
});

if(menuMode === 'blissos'){
  await page.click('#blissosMenubar .blissos-menu-item[data-blissos-menu="help"]', { force: true });
  await page.waitForSelector('#blissosMenuDrop:not(.hidden) [data-menu-action="games:howto"]', { timeout: 5000 });
  await page.click('#blissosMenuDrop [data-menu-action="games:howto"]', { force: true });
} else {
  await page.click('#win_games .menubar span[data-menu="help"]', { force: true });
  await page.waitForSelector('#win_games .menu-drop:not(.hidden) [data-menu-action="games:howto"]', { timeout: 5000 });
  await page.click('#win_games .menu-drop [data-menu-action="games:howto"]', { force: true });
}

await page.waitForSelector('#modal:not(.hidden)', { timeout: 5000 });
if(win) await win.screenshot({ path: path.join(outDir, 'snake-help-open.png') });

const result = await page.evaluate(() => {
  const getRect = (sel) => {
    const el = document.querySelector(sel);
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
  };
  return {
    statsText: {
      lengthValue: document.querySelector('#win_games .snake-board-stats [data-snake-length]')?.textContent?.trim() || '',
      levelValue: document.querySelector('#win_games .snake-board-stats [data-snake-level]')?.textContent?.trim() || '',
      bonusValue: document.querySelector('#win_games .snake-board-stats [data-snake-bonus]')?.textContent?.trim() || ''
    },
    howToPlay: {
      title: document.querySelector('#modalTitle')?.textContent?.trim() || '',
      body: document.querySelector('#modalBody')?.textContent?.trim() || ''
    },
    rects: {
      stats: getRect('#win_games .snake-board-stats'),
      board: getRect('#win_games #snakeBoard')
    }
  };
});
result.statsAboveBoard = !!(result.rects.stats && result.rects.board && result.rects.stats.bottom <= result.rects.board.top);
result.menuMode = menuMode;
result.consoleErrors = consoleErrors;

fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(result, null, 2));
await browser.close();
