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
  localStorage.setItem('bliss98_window_games', JSON.stringify({
    left: 36,
    top: 82,
    width: 580,
    height: 650
  }));
});

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 10000 });
await page.waitForTimeout(550);

const win = await page.$('#win_games');
if(win){
  await win.screenshot({ path: path.join(outDir, 'snake-saved-rect-overflow.png') });
}

const result = await page.evaluate(() => {
  const content = document.querySelector('#win_games .content');
  const board = document.querySelector('#win_games #snakeBoard');
  const action = document.querySelector('#win_games .snake-action-row');
  const stats = document.querySelector('#win_games .snake-board-stats');
  const readRect = (el) => {
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      left: Math.round(r.left),
      right: Math.round(r.right),
      width: Math.round(r.width),
      height: Math.round(r.height)
    };
  };
  const contentRect = readRect(content);
  const boardRect = readRect(board);
  const actionRect = readRect(action);
  const statsRect = readRect(stats);
  const overflowX = content ? Math.max(0, Math.ceil(content.scrollWidth - content.clientWidth)) : null;
  const overflowY = content ? Math.max(0, Math.ceil(content.scrollHeight - content.clientHeight)) : null;
  return {
    overflowX,
    overflowY,
    contentRect,
    boardRect,
    actionRect,
    statsRect,
    statsAboveBoard: !!(statsRect && boardRect && statsRect.bottom <= boardRect.top),
    actionVisible: !!(actionRect && contentRect && actionRect.bottom <= contentRect.bottom && actionRect.top >= contentRect.top),
    speedUiVisible: !!document.querySelector('#win_games [data-snake-speed]') || /speed/i.test(document.querySelector('#win_games .snake-topbar')?.textContent || '')
  };
});

result.consoleErrors = consoleErrors;

fs.writeFileSync(path.join(outDir, 'saved-rect-overflow-result.json'), JSON.stringify(result, null, 2));
await browser.close();
