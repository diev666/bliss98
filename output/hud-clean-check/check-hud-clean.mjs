import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'hud-clean-check');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle','--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const consoleErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
await page.fill('#username', 'DIEV');
await page.click('#enter');
await page.waitForSelector('#desktop:not(.hidden)', { timeout: 10000 });
await page.waitForTimeout(300);
await page.dblclick('#iconGrid .icon[data-app-id="games"]');
await page.waitForSelector('#win_games:not(.hidden)', { timeout: 10000 });
await page.waitForTimeout(300);
await page.dblclick('#win_games [data-game-id="dope-skate"]');
await page.waitForSelector('#win_games [data-skate-action="start"]', { timeout: 10000 });
await page.click('#win_games [data-skate-action="start"]');
await page.waitForTimeout(900);

const win = await page.$('#win_games');
if(win){
  await win.screenshot({ path: path.join(outDir, 'run-clean-hud.png') });
}

const metrics = await page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const styleObj = (el) => {
    if(!el) return null;
    const cs = getComputedStyle(el);
    return {
      background: cs.background,
      backgroundColor: cs.backgroundColor,
      border: cs.border,
      borderWidth: cs.borderWidth,
      borderStyle: cs.borderStyle,
      borderColor: cs.borderColor,
      borderRadius: cs.borderRadius,
      width: cs.width,
      padding: cs.padding,
      boxShadow: cs.boxShadow,
    };
  };
  const rectObj = (el) => {
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  };

  const missionBox = q('#win_games .skate-mission-box');
  const missionTier = q('#win_games [data-skate-mission-tier]');
  const missionCount = q('#win_games [data-skate-mission-count]');
  const missionProgress = q('#win_games .skate-mission-progress');

  return {
    hudCardStyle: styleObj(q('#win_games .skate-hud-card')),
    missionBoxStyle: styleObj(missionBox),
    landingStyle: styleObj(q('#win_games .skate-landing-indicator')),
    comboItemStyle: styleObj(q('#win_games .skate-combo-item')),
    missionProgressStyle: styleObj(missionProgress),
    missionRects: {
      box: rectObj(missionBox),
      tier: rectObj(missionTier),
      count: rectObj(missionCount),
      progress: rectObj(missionProgress)
    },
    missionTierText: missionTier ? missionTier.textContent.trim() : '',
    missionCountText: missionCount ? missionCount.textContent.trim() : '',
    consoleErrors: []
  };
});
metrics.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(metrics, null, 2));

await browser.close();
