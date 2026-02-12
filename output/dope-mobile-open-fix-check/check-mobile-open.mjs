import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'dope-mobile-open-fix-check');
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
await page.waitForSelector('#win_dope-skate .skate-shell', { timeout: 10000 });
await page.waitForTimeout(380);

const dopeWin = await page.$('#win_dope-skate');
if(dopeWin){
  await dopeWin.screenshot({ path: path.join(outDir, 'mobile-dope-open.png') });
}

const metrics = await page.evaluate(() => {
  const rectObj = (el) => {
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left };
  };
  const dope = document.getElementById('win_dope-skate');
  const shell = dope ? dope.querySelector('.skate-shell') : null;
  const topMenuBtn = dope ? dope.querySelector('.skate-topbar-actions [data-skate-action="menu"]') : null;
  const frame = dope ? dope.querySelector('.frame') : null;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const rect = dope ? dope.getBoundingClientRect() : null;
  const style = dope ? getComputedStyle(dope) : null;
  const menuStyle = topMenuBtn ? getComputedStyle(topMenuBtn) : null;

  return {
    viewport: { w: viewportW, h: viewportH },
    rects: {
      dope: rectObj(dope),
      shell: rectObj(shell),
      frame: rectObj(frame)
    },
    classMobileGame: dope ? dope.classList.contains('mobile-game') : false,
    positionStyle: style ? style.position : null,
    insetStyle: style ? `${style.top},${style.right},${style.bottom},${style.left}` : null,
    menuButtonVisible: !!(topMenuBtn && topMenuBtn.isConnected && topMenuBtn.offsetParent),
    fillsViewport: !!(rect && Math.abs(rect.left) <= 1 && Math.abs(rect.top) <= 1 && Math.abs(rect.width - viewportW) <= 1 && Math.abs(rect.height - viewportH) <= 1)
  };
});
metrics.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(metrics, null, 2));

await context.close();
await browser.close();
