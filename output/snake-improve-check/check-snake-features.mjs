import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-improve-check');
fs.mkdirSync(outDir, { recursive: true });

function wrap(v, size){
  return ((v % size) + size) % size;
}

function wrapDist(a, b, size){
  const d1 = wrap(b - a, size);
  const d2 = wrap(a - b, size);
  return Math.min(d1, d2);
}

function chooseDirection(state){
  const head = state?.snake?.body?.[0];
  const target = state?.bonusFood || state?.food;
  if(!head || !target) return null;
  const gridW = state.grid.width;
  const gridH = state.grid.height;
  const dir = state?.snake?.direction || { x: 1, y: 0 };
  const bodySet = new Set((state?.snake?.body || []).map(seg => `${seg.x},${seg.y}`));

  const dirs = [
    { x: 1, y: 0, key: 'ArrowRight' },
    { x: -1, y: 0, key: 'ArrowLeft' },
    { x: 0, y: 1, key: 'ArrowDown' },
    { x: 0, y: -1, key: 'ArrowUp' },
  ];

  dirs.sort((a, b) => {
    const na = { x: wrap(head.x + a.x, gridW), y: wrap(head.y + a.y, gridH) };
    const nb = { x: wrap(head.x + b.x, gridW), y: wrap(head.y + b.y, gridH) };
    const da = wrapDist(na.x, target.x, gridW) + wrapDist(na.y, target.y, gridH);
    const db = wrapDist(nb.x, target.x, gridW) + wrapDist(nb.y, target.y, gridH);
    return da - db;
  });

  for(const cand of dirs){
    if(cand.x === -dir.x && cand.y === -dir.y) continue;
    const nx = wrap(head.x + cand.x, gridW);
    const ny = wrap(head.y + cand.y, gridH);
    if(bodySet.has(`${nx},${ny}`)) continue;
    return cand;
  }

  for(const cand of dirs){
    if(cand.x === -dir.x && cand.y === -dir.y) continue;
    return cand;
  }
  return dirs[0];
}

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle','--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const consoleErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden)', { timeout: 10000 });
await page.waitForSelector('#snakeBoard', { timeout: 10000 });
await page.click('#win_games [data-snake-action="start"]');
await page.waitForTimeout(120);

const pauseCheck = {};
await page.keyboard.press('Space');
await page.waitForTimeout(50);
pauseCheck.pauseOverlay = await page.evaluate(() => {
  const overlay = document.querySelector('#win_games #snakeOverlay');
  const title = document.querySelector('#win_games [data-snake-overlay-title]')?.textContent?.trim() || '';
  const btn = document.querySelector('#win_games [data-snake-overlay-btn]')?.textContent?.trim() || '';
  const pauseBtn = document.querySelector('#win_games [data-snake-action="pause"]')?.textContent?.trim() || '';
  return {
    visible: overlay ? !overlay.classList.contains('hidden') : false,
    title,
    overlayButton: btn,
    pauseButton: pauseBtn,
  };
});
await page.keyboard.press('Space');
await page.waitForTimeout(50);
pauseCheck.afterResume = await page.evaluate(() => {
  const overlay = document.querySelector('#win_games #snakeOverlay');
  const pauseBtn = document.querySelector('#win_games [data-snake-action="pause"]')?.textContent?.trim() || '';
  return { visible: overlay ? !overlay.classList.contains('hidden') : false, pauseButton: pauseBtn };
});

const telemetry = {
  maxScore: 0,
  maxLength: 0,
  maxLevel: 1,
  minStepMs: Infinity,
  bonusSeen: false,
  bonusCaptured: false,
  gameOverCount: 0,
};

let previousScore = 0;
let previousBonus = false;
let stabilized = false;

for(let frame = 0; frame < 1500; frame += 1){
  const state = await page.evaluate(() => {
    if(typeof window.render_game_to_text !== 'function') return null;
    try{ return JSON.parse(window.render_game_to_text()); }
    catch { return null; }
  });
  if(!state) break;

  if(state.mode === 'game_over'){
    telemetry.gameOverCount += 1;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(20);
    previousScore = 0;
    previousBonus = false;
    continue;
  }

  telemetry.maxScore = Math.max(telemetry.maxScore, Number(state.score || 0));
  telemetry.maxLength = Math.max(telemetry.maxLength, Number(state?.snake?.length || 0));
  telemetry.maxLevel = Math.max(telemetry.maxLevel, Number(state.level || 1));
  telemetry.minStepMs = Math.min(telemetry.minStepMs, Number(state.stepMs || Infinity));

  const hasBonus = !!state.bonusFood;
  if(hasBonus) telemetry.bonusSeen = true;
  if(previousBonus && !hasBonus && Number(state.score || 0) >= previousScore + 20){
    telemetry.bonusCaptured = true;
  }

  const dir = chooseDirection(state);
  if(dir){
    const nextDir = state?.snake?.nextDirection || state?.snake?.direction || { x: 1, y: 0 };
    if(dir.x !== nextDir.x || dir.y !== nextDir.y){
      await page.keyboard.press(dir.key);
    }
  }

  await page.evaluate((ms) => {
    if(typeof window.advanceTime === 'function') window.advanceTime(ms);
  }, state.stepMs || 120);

  previousScore = Number(state.score || 0);
  previousBonus = hasBonus;

  if(telemetry.maxLevel >= 2 && telemetry.bonusSeen){
    stabilized = true;
    if(frame > 520) break;
  }
}

const finalState = await page.evaluate(() => {
  if(typeof window.render_game_to_text !== 'function') return null;
  try{ return JSON.parse(window.render_game_to_text()); }
  catch { return null; }
});

const ui = await page.evaluate(() => ({
  score: document.querySelector('#win_games [data-snake-score]')?.textContent?.trim() || '',
  high: document.querySelector('#win_games [data-snake-high]')?.textContent?.trim() || '',
  length: document.querySelector('#win_games [data-snake-length]')?.textContent?.trim() || '',
  level: document.querySelector('#win_games [data-snake-level]')?.textContent?.trim() || '',
  bonus: document.querySelector('#win_games [data-snake-bonus]')?.textContent?.trim() || '',
  pauseButton: document.querySelector('#win_games [data-snake-action="pause"]')?.textContent?.trim() || '',
}));

const win = await page.$('#win_games');
if(win){
  await win.screenshot({ path: path.join(outDir, 'snake-features.png') });
}

const result = {
  pauseCheck,
  telemetry,
  stabilized,
  finalState,
  ui,
  consoleErrors,
};
fs.writeFileSync(path.join(outDir, 'feature-result.json'), JSON.stringify(result, null, 2));

await browser.close();
