import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-ui-help-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle','--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const consoleErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 10000 });
await page.waitForTimeout(180);

const getBtnState = () => page.evaluate(() => {
  const allSnakeButtons = Array.from(document.querySelectorAll('#win_games [data-snake-action]')).map(el => ({
    action: el.getAttribute('data-snake-action'),
    text: (el.textContent || '').trim()
  }));
  const btn = document.querySelector('#win_games [data-snake-action="primary"]');
  return {
    text: btn ? btn.textContent.trim() : null,
    pressed: btn ? btn.classList.contains('pressed') : null,
    actions: allSnakeButtons,
  };
});

const states = {};
states.initial = await getBtnState();

await page.click('#win_games [data-snake-action="primary"]');
await page.waitForTimeout(150);
states.afterStart = await getBtnState();

await page.click('#win_games [data-snake-action="primary"]');
await page.waitForTimeout(120);
states.afterPause = await getBtnState();

await page.click('#win_games [data-snake-action="primary"]');
await page.waitForTimeout(120);
states.afterResume = await getBtnState();

const win = await page.$('#win_games');
if(win){
  await win.screenshot({ path: path.join(outDir, 'snake-single-button.png') });
}

const result = {
  states,
  onlyPrimaryControlOutsideOverlay: states.initial.actions.filter(a => a.action !== 'playAgain').length === 1,
  consoleErrors,
};
fs.writeFileSync(path.join(outDir, 'single-button-result.json'), JSON.stringify(result, null, 2));

await browser.close();
