import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-improve-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle','--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const consoleErrors = [];
page.on('console', (msg)=>{ if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err)=>consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden)', { timeout: 10000 });
await page.waitForSelector('#snakeBoard', { timeout: 10000 });

await page.click('#win_games [data-snake-action="start"]');
await page.waitForTimeout(350);

for(const key of ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','ArrowRight']){
  await page.keyboard.press(key);
  await page.waitForTimeout(180);
}

await page.keyboard.press('Space');
await page.waitForTimeout(120);
await page.keyboard.press('Space');
await page.waitForTimeout(120);

// Force deterministic steps to let game progress and maybe spawn bonus.
await page.evaluate(() => {
  if(typeof window.advanceTime === 'function'){
    for(let i = 0; i < 80; i += 1) window.advanceTime(1000 / 60);
  }
});

const win = await page.$('#win_games');
if(win){
  await win.screenshot({ path: path.join(outDir, 'snake-window.png') });
}

const metrics = await page.evaluate(() => {
  const ui = {
    score: document.querySelector('#win_games [data-snake-score]')?.textContent?.trim() || '',
    high: document.querySelector('#win_games [data-snake-high]')?.textContent?.trim() || '',
    length: document.querySelector('#win_games [data-snake-length]')?.textContent?.trim() || '',
    level: document.querySelector('#win_games [data-snake-level]')?.textContent?.trim() || '',
    bonus: document.querySelector('#win_games [data-snake-bonus]')?.textContent?.trim() || '',
    pauseBtn: document.querySelector('#win_games [data-snake-action="pause"]')?.textContent?.trim() || '',
  };
  let stateText = null;
  try{
    stateText = typeof window.render_game_to_text === 'function' ? window.render_game_to_text() : null;
  } catch {}
  let state = null;
  try{ state = stateText ? JSON.parse(stateText) : null; } catch {}
  const overlay = document.querySelector('#win_games #snakeOverlay');
  const overlayTitle = document.querySelector('#win_games [data-snake-overlay-title]')?.textContent?.trim() || '';
  return {
    ui,
    state,
    overlayVisible: overlay ? !overlay.classList.contains('hidden') : null,
    overlayTitle,
  };
});

metrics.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(metrics, null, 2));

await browser.close();
