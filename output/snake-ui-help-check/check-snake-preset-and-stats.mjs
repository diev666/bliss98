import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-ui-help-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const consoleErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html?user=BOT', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  localStorage.setItem('bliss98_window_games', JSON.stringify({ left: 28, top: 54, width: 900, height: 860 }));
});

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 10000 });
await page.waitForTimeout(450);

const win = await page.$('#win_games');
if(win){
  await win.screenshot({ path: path.join(outDir, 'snake-preset-stats.png') });
}

const result = await page.evaluate(() => {
  const readRect = (sel) => {
    const el = document.querySelector(sel);
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: Math.round(r.left),
      top: Math.round(r.top),
      width: Math.round(r.width),
      height: Math.round(r.height)
    };
  };

  const visibleStats = Array.from(document.querySelectorAll('#win_games .snake-board-stats .tiny'))
    .filter(el => el.offsetParent !== null && getComputedStyle(el).display !== 'none')
    .map(el => el.textContent.replace(/\s+/g, ' ').trim());

  const bonusEl = document.querySelector('#win_games [data-snake-bonus]');
  const bonusContainer = bonusEl ? bonusEl.closest('.tiny') : null;
  const bonusHidden = !!(bonusContainer && getComputedStyle(bonusContainer).display === 'none');

  let bonusTextBefore = bonusEl ? bonusEl.textContent : null;
  let bonusTextAfter = bonusTextBefore;
  let bonusStateMutationOk = false;
  if(window.snake && typeof window.updateSnakeUI === 'function' && bonusEl){
    window.snake.bonusFood = { x: 1, y: 1, expiresAtTick: (window.snake.tickCount || 0) + 20 };
    window.updateSnakeUI();
    bonusTextAfter = bonusEl.textContent;
    bonusStateMutationOk = typeof bonusTextAfter === 'string' && /s$/.test(bonusTextAfter.trim());
  }

  return {
    winRect: readRect('#win_games'),
    contentRect: readRect('#win_games .content'),
    statsVisibleItems: visibleStats,
    statsVisibleCount: visibleStats.length,
    statsContainsVisibleBonusText: visibleStats.some(txt => /bonus/i.test(txt)),
    bonusDataElExists: !!bonusEl,
    bonusHidden,
    bonusTextBefore,
    bonusTextAfter,
    bonusStateMutationOk,
  };
});

result.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'snake-preset-and-stats-result.json'), JSON.stringify(result, null, 2));
await browser.close();
