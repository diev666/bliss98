import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from '/Users/dieverson/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';

const APP_URL = process.argv[2] || 'http://127.0.0.1:4173';
const OUT_DIR = path.resolve('output/grid-snap-regression');
const STEP_X = 104;
const STEP_Y = 96;

function ensureDir(p){
  fs.mkdirSync(p, { recursive: true });
}

function isSnapped(pos){
  if(!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return false;
  return (pos.x % STEP_X === 0) && (pos.y % STEP_Y === 0);
}

async function login(page, username){
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#app');

  const desktopVisible = await page.locator('#desktop:not(.hidden)').count();
  if(desktopVisible === 0){
    await page.fill('#username', username);
    await page.click('#enter');
  }

  await page.waitForSelector('#desktop:not(.hidden)', { timeout: 10000 });
  await page.waitForTimeout(180);
}

async function setGridSnap(page, enabled){
  const applied = await page.evaluate((value)=>{
    state.gridSnap = !!value;
    saveGridSnap();
    return state.gridSnap;
  }, enabled);

  if(applied !== enabled){
    throw new Error(`Failed to set gridSnap=${enabled}`);
  }
}

async function getIconPos(page, appId){
  const icon = page.locator(`.icon[data-app-id="${appId}"]`).first();
  await icon.waitFor({ state: 'visible', timeout: 10000 });
  return icon.evaluate((el)=>({
    x: parseInt(el.style.left || '0', 10),
    y: parseInt(el.style.top || '0', 10),
  }));
}

async function dragIcon(page, appId, dx, dy){
  const icon = page.locator(`.icon[data-app-id="${appId}"]`).first();
  await icon.waitFor({ state: 'visible', timeout: 10000 });

  const before = await getIconPos(page, appId);
  const box = await icon.boundingBox();
  if(!box) throw new Error(`No bounding box for icon ${appId}`);

  const startX = box.x + (box.width / 2);
  const startY = box.y + (box.height / 2);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dx, startY + dy, { steps: 18 });
  await page.mouse.up();
  await page.waitForTimeout(180);

  const after = await getIconPos(page, appId);
  const fsPos = await page.evaluate((id)=>{
    const item = getFsItem(id);
    if(!item) return null;
    return { x: item.x, y: item.y, parentId: item.parentId || null };
  }, appId);

  return { before, after, fsPos };
}

async function pickDragIconId(page){
  return page.evaluate(()=>{
    const ids = Array.from(document.querySelectorAll('#iconGrid .icon'))
      .map((el)=>el.dataset.appId)
      .filter(Boolean);
    return ids.find((id)=>id !== 'trash') || ids[0] || null;
  });
}

async function runScenario(browser, name, contextOpts){
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg)=>{
    if(msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err)=>{
    consoleErrors.push(String(err));
  });

  await login(page, `${name}-user`);
  const dragId = await pickDragIconId(page);
  if(!dragId) throw new Error('No desktop icon found for drag validation');

  await setGridSnap(page, false);
  const offDrag = await dragIcon(page, dragId, 37, 29);
  const offSnapped = isSnapped(offDrag.after);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await login(page, `${name}-user`);

  const afterReload = await getIconPos(page, dragId);
  const offPersistMatches =
    afterReload.x === offDrag.after.x &&
    afterReload.y === offDrag.after.y;

  await setGridSnap(page, true);
  const onDrag = await dragIcon(page, dragId, 31, 23);
  const onSnapped = isSnapped(onDrag.after);

  const screenshotPath = path.join(OUT_DIR, `${name}-after.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await context.close();

  return {
    name,
    dragId,
    offDrag,
    offSnapped,
    afterReload,
    offPersistMatches,
    onDrag,
    onSnapped,
    consoleErrors,
    screenshotPath,
  };
}

async function main(){
  ensureDir(OUT_DIR);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader'],
  });

  try{
    const desktop = await runScenario(browser, 'desktop', {
      viewport: { width: 1366, height: 900 },
    });

    const mobile = await runScenario(browser, 'mobile', {
      ...devices['iPhone 12'],
    });

    const result = {
      url: APP_URL,
      step: { x: STEP_X, y: STEP_Y },
      desktop,
      mobile,
      passed:
        !desktop.offSnapped &&
        desktop.offPersistMatches &&
        desktop.onSnapped &&
        desktop.consoleErrors.length === 0 &&
        !mobile.offSnapped &&
        mobile.offPersistMatches &&
        mobile.onSnapped &&
        mobile.consoleErrors.length === 0,
    };

    const resultPath = path.join(OUT_DIR, 'result.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ resultPath, passed: result.passed }, null, 2));

    if(!result.passed){
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

main().catch((err)=>{
  console.error(err);
  process.exit(1);
});
