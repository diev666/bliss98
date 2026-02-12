import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'dope-mobile-title-center-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle','--use-angle=swiftshader'] });
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

const page = await context.newPage();
const consoleErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
await page.fill('#username', 'DIEV');
await page.click('#enter');
await page.waitForSelector('#desktop:not(.hidden)', { timeout: 10000 });
await page.waitForTimeout(220);

await page.dblclick('#iconGrid .icon[data-app-id="games"]');
await page.waitForSelector('#win_games:not(.hidden)', { timeout: 10000 });
await page.waitForTimeout(220);

await page.dblclick('#win_games [data-game-id="dope-skate"]');
await page.waitForSelector('#win_dope-skate:not(.hidden)', { timeout: 10000 });
await page.waitForSelector('#win_dope-skate .skate-topbar .skate-title', { timeout: 10000 });
await page.waitForTimeout(400);

const win = await page.$('#win_dope-skate');
if(win){
  await win.screenshot({ path: path.join(outDir, 'mobile-title-center.png') });
}

const metrics = await page.evaluate(() => {
  const rectObj = (el) => {
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return { left:r.left, top:r.top, width:r.width, height:r.height, right:r.right, bottom:r.bottom, x:r.x, y:r.y };
  };
  const topbar = document.querySelector('#win_dope-skate .skate-topbar');
  const title = document.querySelector('#win_dope-skate .skate-topbar .skate-title');
  const back = document.querySelector('#win_dope-skate .skate-topbar [data-games-action="back"]');
  if(!topbar || !title){
    return { ok:false, reason:'missing-topbar-or-title' };
  }
  const tr = title.getBoundingClientRect();
  const br = back ? back.getBoundingClientRect() : null;
  const bar = topbar.getBoundingClientRect();
  const barCenter = bar.left + (bar.width / 2);
  const titleCenter = tr.left + (tr.width / 2);
  const centerOffset = titleCenter - barCenter;

  return {
    ok:true,
    centerOffset,
    centeredWithin8px: Math.abs(centerOffset) <= 8,
    overlapsBack: !!(br && !(tr.right <= br.left || tr.left >= br.right || tr.bottom <= br.top || tr.top >= br.bottom)),
    rects: {
      topbar: rectObj(topbar),
      title: rectObj(title),
      back: rectObj(back)
    }
  };
});
metrics.consoleErrors = consoleErrors;

fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(metrics, null, 2));

await context.close();
await browser.close();
