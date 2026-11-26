const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 700 } });

  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  await page.goto('http://localhost:5190/landing-page-builder/editor/999', {
    waitUntil: 'load',
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'screenshots/timeline_full.png', fullPage: true });
  const el = page.locator('[data-id="section1"]');
  try {
    await el.waitFor({ timeout: 10000 });
    await el.screenshot({ path: 'screenshots/timeline_classic_zoom.png' });
  } catch (e) {
    console.log('zoom screenshot skipped:', e.message);
  }
  await browser.close();
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
