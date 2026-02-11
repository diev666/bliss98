import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const outDir = path.join(process.cwd(), 'output', 'snake-ui-help-check');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader']
});

const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
});

const consoleErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(String(err)));

await page.goto('http://127.0.0.1:4173/index.html?autogame=snake&user=BOT', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#win_games:not(.hidden) #snakeBoard', { timeout: 12000 });
await page.waitForTimeout(500);

const win = await page.$('#win_games');
if(win){
  await win.screenshot({ path: path.join(outDir, 'snake-mobile-layout-fixed.png') });
}

const result = await page.evaluate(() => {
  const rect = (sel) => {
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
      centerY: Math.round(r.top + r.height / 2),
    };
  };

  const header = rect('#win_games .snake-header');
  const title = rect('#win_games .snake-title');
  const back = rect('#win_games .snake-topbar .btn');
  const main = rect('#win_games .snake-main');
  const board = rect('#win_games #snakeBoard');
  const canvas = rect('#win_games #snakeCanvas');
  const content = rect('#win_games .content');
  const actionRow = document.querySelector('#win_games .snake-action-row');
  const actionDisplay = actionRow ? getComputedStyle(actionRow).display : null;

  const boardRatio = board ? Number((board.width / Math.max(1, board.height)).toFixed(3)) : null;
  const canvasRatio = canvas ? Number((canvas.width / Math.max(1, canvas.height)).toFixed(3)) : null;
  const fillRatio = (board && canvas) ? Number((canvas.width / Math.max(1, board.width)).toFixed(3)) : null;

  return {
    header,
    title,
    back,
    main,
    board,
    canvas,
    content,
    actionDisplay,
    checks: {
      startHiddenOnMobile: actionDisplay === 'none',
      backOnLeft: !!(header && back && back.left <= header.left + 2),
      titleCentered: !!(header && title && Math.abs(header.centerX - title.centerX) <= 2),
      sameLineHeader: !!(title && back && Math.abs(title.centerY - back.centerY) <= 3),
      boardCentered: !!(main && board && Math.abs(main.centerX - board.centerX) <= 2),
      boardBiggerThan300: !!(board && board.width >= 320),
      boardSquare: boardRatio !== null ? Math.abs(boardRatio - 1) <= 0.02 : false,
      canvasSquare: canvasRatio !== null ? Math.abs(canvasRatio - 1) <= 0.02 : false,
      canvasFillBoard: fillRatio !== null ? fillRatio >= 0.90 : false,
      noContentOverflow: !!(document.querySelector('#win_games .content') &&
        Math.ceil(document.querySelector('#win_games .content').scrollHeight - document.querySelector('#win_games .content').clientHeight) <= 1)
    },
    boardRatio,
    canvasRatio,
    fillRatio,
  };
});

result.consoleErrors = consoleErrors;
fs.writeFileSync(path.join(outDir, 'snake-mobile-layout-fixed-result.json'), JSON.stringify(result, null, 2));
await browser.close();
