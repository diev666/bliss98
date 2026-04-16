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
      return {
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        width: Math.round(r.width),
        height: Math.round(r.height),
        midY: Math.round(r.top + (r.height / 2))
      };
    };
    const dock = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock');
    const tray = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-inner');
    const separator = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-separator');
    const separatorStyle = separator ? getComputedStyle(separator) : null;
    const firstIcon = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-item:not([data-dock-type="trash"]) .dock-icon');
    const trashIcon = document.querySelector('body[data-blissos-style="aqua"] .blissos-dock-item[data-dock-type="trash"] .dock-icon');
    const reflection = document.querySelector('body[data-blissos-style="aqua"] .dock-reflection');
    const reflectionStyle = reflection ? getComputedStyle(reflection) : null;
    return {
      version: document.querySelector('#loginVersion')?.textContent || null,
      dock: dock && rect(dock),
      tray: tray && rect(tray),
      separator: separator && rect(separator),
      separatorOpacity: separatorStyle && separatorStyle.opacity,
      separatorLayers: separatorStyle ? separatorStyle.backgroundPosition.split(',').length : 0,
      separatorInsideTray: !!(tray && separator && separator.getBoundingClientRect().bottom <= tray.getBoundingClientRect().bottom + 1),
      firstIcon: firstIcon && rect(firstIcon),
      trashIcon: trashIcon && rect(trashIcon),
      trayTopToFirstIconMid: firstIcon && tray ? Math.round(tray.getBoundingClientRect().top - (firstIcon.getBoundingClientRect().top + firstIcon.getBoundingClientRect().height / 2)) : null,
      trashTopDelta: firstIcon && trashIcon ? Math.round(trashIcon.getBoundingClientRect().top - firstIcon.getBoundingClientRect().top) : null,
      reflectionFilter: reflectionStyle && reflectionStyle.filter
    };
  });
  const screenshot = 'output/playwright/aqua-mobile-dock-lift.png';
  await p.screenshot({ path: screenshot, fullPage: false });
  await context.close();
  return { metrics, messages, screenshot };
}
