async (page) => {
  const browser = page.context().browser();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  const p = await context.newPage();
  const messages = [];
  p.on('console', msg => {
    if(['warning', 'error'].includes(msg.type())) messages.push(`${msg.type()}: ${msg.text()}`);
  });
  await p.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Bliss Aqua' }).click();
  await p.getByRole('textbox', { name: 'Name:' }).fill('Test');
  await p.getByRole('button', { name: 'Enter' }).click();
  await p.waitForSelector('body[data-blissos-style="aqua"] .blissos-dock-separator', { state: 'visible', timeout: 12000 });
  await p.waitForTimeout(4200);
  const metrics = await p.evaluate(() => {
    const rect = el => {
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
    };
    const tray = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-inner');
    const separator = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-separator');
    const appReflection = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-item:not([data-dock-type="trash"]) .dock-reflection');
    const trashReflection = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-item[data-dock-type="trash"] .dock-reflection');
    const appIcon = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-item:not([data-dock-type="trash"]) .dock-icon');
    const trashIcon = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-item[data-dock-type="trash"] .dock-icon');
    const appReflectionStyle = appReflection ? getComputedStyle(appReflection) : null;
    const trashReflectionStyle = trashReflection ? getComputedStyle(trashReflection) : null;
    const separatorStyle = separator ? getComputedStyle(separator) : null;
    const trayBottom = tray ? tray.getBoundingClientRect().bottom : 0;
    return {
      tray: tray && rect(tray),
      appIcon: appIcon && rect(appIcon),
      trashIcon: trashIcon && rect(trashIcon),
      appReflection: appReflection && rect(appReflection),
      trashReflection: trashReflection && rect(trashReflection),
      appReflectionBottomGap: appReflection ? Math.round(trayBottom - appReflection.getBoundingClientRect().bottom) : null,
      trashReflectionBottomGap: trashReflection ? Math.round(trayBottom - trashReflection.getBoundingClientRect().bottom) : null,
      appReflectionFilter: appReflectionStyle && appReflectionStyle.filter,
      trashReflectionFilter: trashReflectionStyle && trashReflectionStyle.filter,
      appReflectionBottom: appReflectionStyle && appReflectionStyle.bottom,
      trashReflectionBottom: trashReflectionStyle && trashReflectionStyle.bottom,
      separatorOpacity: separatorStyle && separatorStyle.opacity
    };
  });
  const screenshot = 'output/playwright/aqua-reflection-check.png';
  await p.screenshot({ path: screenshot, fullPage: false });
  await context.close();
  return { metrics, messages, screenshot };
}
