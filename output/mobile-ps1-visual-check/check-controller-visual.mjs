import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'mobile-ps1-visual-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader']
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2
});

const consoleErrors = [];
page.on('console', msg => {
  if(msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', err => consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
await page.fill('#username', 'DIEV');
await page.click('#enter');
await page.waitForSelector('#desktop:not(.hidden)', { timeout: 10000 });
await page.waitForTimeout(250);

await page.evaluate(() => {
  const icon = document.querySelector('#iconGrid .icon[data-app-id="games"]');
  if(icon){
    icon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
  }
});
await page.waitForSelector('#win_games:not(.hidden)', { timeout: 10000 });
await page.waitForTimeout(250);

await page.evaluate(() => {
  const card = document.querySelector('#win_games [data-game-id="dope-skate"]');
  if(card){
    card.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
  }
});
await page.waitForTimeout(500);

const scope = await page.evaluate(() => {
  const dope = document.querySelector('#win_dope-skate:not(.hidden)');
  return dope ? '#win_dope-skate' : '#win_games';
});

await page.waitForSelector(`${scope} [data-skate-action="start"]`, { timeout: 10000 });
await page.click(`${scope} [data-skate-action="start"]`);
await page.waitForTimeout(900);

await page.waitForSelector(`${scope} .ps1-dock`, { timeout: 10000 });

await page.evaluate((containerScope) => {
  const dock = document.querySelector(`${containerScope} .ps1-dock`);
  if(!dock) return;
  if(dock.dataset.mode === 'analog'){
    const btn = dock.querySelector('[data-mobile-action="analog"]');
    if(btn) btn.click();
  }
}, scope);
await page.waitForTimeout(350);

const dockBody = await page.$(`${scope} .ps1-dock-body`);
if(dockBody){
  await dockBody.screenshot({ path: path.join(outDir, 'dock-after-visual-fix.png') });
}

const win = await page.$(scope);
if(win){
  await win.screenshot({ path: path.join(outDir, 'window-after-visual-fix.png') });
}

const metrics = await page.evaluate((containerScope) => {
  const dock = document.querySelector(`${containerScope} .ps1-dock`);
  const faceButtons = dock ? Array.from(dock.querySelectorAll('.ps1-face-btn')).map(btn => ({
    classes: btn.className,
    iconSvg: !!btn.querySelector('svg'),
    iconPathCount: btn.querySelectorAll('path,circle,rect').length
  })) : [];
  const dpad = dock ? dock.querySelector('.ps1-dpad') : null;
  const dpadCornersVisible = dpad ? Array.from(dpad.querySelectorAll('.ps1-dpad-corner')).map(el => {
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      color: cs.color,
      width: cs.width,
      height: cs.height,
      background: cs.backgroundImage || cs.backgroundColor
    };
  }) : [];

  return {
    scope: containerScope,
    dockMode: dock?.dataset?.mode || null,
    hasDock: !!dock,
    faceButtons,
    dpadCornersVisible
  };
}, scope);

metrics.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(metrics, null, 2));

await browser.close();
