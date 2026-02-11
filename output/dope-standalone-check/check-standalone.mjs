import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'dope-standalone-check');
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
await page.waitForTimeout(250);

await page.dblclick('#iconGrid .icon[data-app-id="games"]');
await page.waitForSelector('#win_games:not(.hidden)', { timeout: 10000 });
await page.waitForTimeout(250);

await page.dblclick('#win_games [data-game-id="dope-skate"]');
await page.waitForSelector('#win_dope-skate:not(.hidden)', { timeout: 10000 });
await page.waitForSelector('#win_dope-skate [data-skate-action="start"]', { timeout: 10000 });
await page.click('#win_dope-skate [data-skate-action="start"]');
await page.waitForTimeout(900);

const gamesWin = await page.$('#win_games');
if(gamesWin){
  await gamesWin.screenshot({ path: path.join(outDir, 'games-hub-window.png') });
}
const dopeWin = await page.$('#win_dope-skate');
if(dopeWin){
  await dopeWin.screenshot({ path: path.join(outDir, 'dope-standalone-window.png') });
}

const metrics = await page.evaluate(() => {
  const rectObj = (el) => {
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left };
  };
  const games = document.getElementById('win_games');
  const dope = document.getElementById('win_dope-skate');
  const dopeContent = dope ? dope.querySelector('.content') : null;
  const hud = dope ? dope.querySelector('#skateHud') : null;
  const mission = dope ? dope.querySelector('[data-skate-mission-box]') : null;
  const missionTier = dope ? dope.querySelector('[data-skate-mission-tier]') : null;
  const missionCount = dope ? dope.querySelector('[data-skate-mission-count]') : null;

  return {
    windowsPresent: {
      games: !!games,
      dopeSkate: !!dope,
    },
    gamesView: games?.querySelector('.content')?.dataset?.gamesView || null,
    dopeDatasetView: dopeContent?.dataset?.gamesView || null,
    dopeFitMinW: dopeContent?.dataset?.fitMinW || null,
    dopeFitMinH: dopeContent?.dataset?.fitMinH || null,
    dopeHasHud: !!hud,
    missionText: {
      tier: missionTier ? missionTier.textContent.trim() : '',
      count: missionCount ? missionCount.textContent.trim() : ''
    },
    rects: {
      games: rectObj(games),
      dope: rectObj(dope),
      mission: rectObj(mission)
    },
    mobileGameClass: {
      games: games?.classList.contains('mobile-game') || false,
      dope: dope?.classList.contains('mobile-game') || false,
    }
  };
});
metrics.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(metrics, null, 2));

await browser.close();
