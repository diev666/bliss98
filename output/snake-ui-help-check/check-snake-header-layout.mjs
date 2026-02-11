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

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 10000 });
await page.waitForTimeout(350);

const win = await page.$('#win_games');
if(win){
  await win.screenshot({ path: path.join(outDir, 'snake-header-layout.png') });
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
      centerX: Math.round(r.left + r.width / 2),
      centerY: Math.round(r.top + r.height / 2)
    };
  };

  const content = readRect('#win_games .content');
  const header = readRect('#win_games .snake-header');
  const title = readRect('#win_games .snake-title');
  const backBtn = readRect('#win_games .snake-topbar .btn');
  const board = readRect('#win_games #snakeBoard');

  const sameLine = !!(title && backBtn && Math.abs(title.centerY - backBtn.centerY) <= 3);
  const backOnLeft = !!(title && backBtn && backBtn.left < title.left);
  const centeredBoard = !!(content && board && Math.abs(content.centerX - board.centerX) <= 2);
  const centeredTitle = !!(header && title && Math.abs(header.centerX - title.centerX) <= 2);

  return {
    content,
    header,
    title,
    backBtn,
    board,
    checks: {
      sameLine,
      backOnLeft,
      centeredBoard,
      centeredTitle
    }
  };
});

result.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'snake-header-layout-result.json'), JSON.stringify(result, null, 2));
await browser.close();
