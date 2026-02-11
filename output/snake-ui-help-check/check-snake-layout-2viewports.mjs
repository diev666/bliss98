import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-ui-help-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const checks = [];

for (const vp of [{ w: 1366, h: 900, tag: 'desktop-900h' }, { w: 1366, h: 1280, tag: 'desktop-1280h' }]) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  const consoleErrors = [];
  page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(String(err)));

  await page.goto('http://127.0.0.1:4173/index.html?user=BOT', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('bliss98_window_games', JSON.stringify({ left: 12, top: 28, width: 380, height: 520 }));
  });

  await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 10000 });
  await page.waitForTimeout(450);

  const win = await page.$('#win_games');
  if(win){
    await win.screenshot({ path: path.join(outDir, `snake-${vp.tag}.png`) });
  }

  const result = await page.evaluate(() => {
    const readRect = (sel) => {
      const el = document.querySelector(sel);
      if(!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        width: Math.round(r.width),
        height: Math.round(r.height),
        centerX: Math.round(r.left + r.width / 2)
      };
    };

    const winRect = readRect('#win_games');
    const contentRect = readRect('#win_games .content');
    const boardRect = readRect('#win_games #snakeBoard');
    const statsRect = readRect('#win_games .snake-board-stats');
    const actionRect = readRect('#win_games .snake-action-row');

    const visibleStats = Array.from(document.querySelectorAll('#win_games .snake-board-stats .tiny'))
      .filter(el => el.offsetParent !== null && getComputedStyle(el).display !== 'none')
      .map(el => el.textContent.replace(/\s+/g, ' ').trim());

    const content = document.querySelector('#win_games .content');
    const overflowX = content ? Math.max(0, Math.ceil(content.scrollWidth - content.clientWidth)) : null;
    const overflowY = content ? Math.max(0, Math.ceil(content.scrollHeight - content.clientHeight)) : null;

    return {
      winRect,
      contentRect,
      boardRect,
      statsRect,
      actionRect,
      overflowX,
      overflowY,
      boardCentered: !!(contentRect && boardRect && Math.abs(contentRect.centerX - boardRect.centerX) <= 2),
      startVisible: !!(contentRect && actionRect && actionRect.bottom <= contentRect.bottom && actionRect.top >= contentRect.top),
      statsCount: visibleStats.length,
      hasVisibleBonusText: visibleStats.some(txt => /bonus/i.test(txt))
    };
  });

  checks.push({ viewport: vp, ...result, consoleErrors });
  await page.close();
}

fs.writeFileSync(path.join(outDir, 'snake-layout-2viewports-result.json'), JSON.stringify(checks, null, 2));
await browser.close();
