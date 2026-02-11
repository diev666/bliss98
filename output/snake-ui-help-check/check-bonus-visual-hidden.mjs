import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-ui-help-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [];
page.on('console', msg => { if(msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 10000 });
await page.waitForTimeout(300);

const win = await page.$('#win_games');
if(win) await win.screenshot({ path: path.join(outDir, 'snake-bonus-hidden.png') });

const result = await page.evaluate(() => {
  const stats = document.querySelector('#win_games .snake-board-stats');
  const bonus = document.querySelector('#win_games [data-snake-bonus]');
  const bonusRow = bonus ? bonus.closest('.tiny') : null;
  const visibleStats = Array.from(document.querySelectorAll('#win_games .snake-board-stats .tiny'))
    .filter(el => el.offsetParent !== null && getComputedStyle(el).display !== 'none')
    .map(el => el.textContent.replace(/\s+/g, ' ').trim());
  const statsRect = stats ? stats.getBoundingClientRect() : null;
  return {
    visibleStats,
    statsCount: visibleStats.length,
    hasVisibleBonus: visibleStats.some(t => /bonus/i.test(t)),
    bonusDataElExists: !!bonus,
    bonusRowHidden: !!(bonusRow && getComputedStyle(bonusRow).display === 'none'),
    statsRect: statsRect ? {
      width: Math.round(statsRect.width),
      height: Math.round(statsRect.height)
    } : null
  };
});

result.consoleErrors = errors;
fs.writeFileSync(path.join(outDir, 'bonus-visual-hidden-result.json'), JSON.stringify(result, null, 2));
await browser.close();
