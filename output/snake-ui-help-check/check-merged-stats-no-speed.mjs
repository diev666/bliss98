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
if(win){
  await win.screenshot({ path: path.join(outDir, 'snake-merged-stats.png') });
}

const result = await page.evaluate(() => {
  const stats = document.querySelector('#win_games .snake-board-stats');
  const statsText = stats ? stats.textContent.replace(/\s+/g, ' ').trim() : '';
  const hasScore = !!document.querySelector('#win_games [data-snake-score]');
  const hasHigh = !!document.querySelector('#win_games [data-snake-high]');
  const hasLength = !!document.querySelector('#win_games [data-snake-length]');
  const hasLevel = !!document.querySelector('#win_games [data-snake-level]');
  const hasBonus = !!document.querySelector('#win_games [data-snake-bonus]');
  const hasSpeedUi = !!document.querySelector('#win_games [data-snake-speed]') || !!Array.from(document.querySelectorAll('#win_games .snake-topbar *')).find(el => (el.textContent || '').trim().toLowerCase().startsWith('speed'));
  const topbarText = (document.querySelector('#win_games .snake-topbar')?.textContent || '').replace(/\s+/g, ' ').trim();

  const getRect = (sel) => {
    const el = document.querySelector(sel);
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
  };

  return {
    statsText,
    hasScore,
    hasHigh,
    hasLength,
    hasLevel,
    hasBonus,
    hasSpeedUi,
    topbarText,
    rects: {
      stats: getRect('#win_games .snake-board-stats'),
      board: getRect('#win_games #snakeBoard')
    }
  };
});

result.statsAboveBoard = !!(result.rects.stats && result.rects.board && result.rects.stats.bottom <= result.rects.board.top);
result.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'merged-stats-no-speed-result.json'), JSON.stringify(result, null, 2));

await browser.close();
