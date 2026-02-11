import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-ui-help-check');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 10000 });
await page.waitForTimeout(350);
const result = await page.evaluate(() => {
  const read = (sel)=>{
    const el=document.querySelector(sel);
    if(!el) return null;
    const r=el.getBoundingClientRect();
    return {w:Math.round(r.width),h:Math.round(r.height),left:Math.round(r.left),top:Math.round(r.top)};
  };
  return {
    window: read('#win_games'),
    content: read('#win_games .content'),
    frame: read('#win_games .frame')
  };
});
fs.writeFileSync(path.join(outDir, 'snake-window-rect-result.json'), JSON.stringify(result,null,2));
await browser.close();
