const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  // Intercept every canvas.toBlob call so we can dump the exact bitmap
  // html2canvas hands back, without needing the (mock-only) upload step to
  // succeed.
  await page.addInitScript(() => {
    const nativeToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (cb, type, quality) {
      try {
        window.__lastCaptureDataUrl = this.toDataURL('image/png');
        window.__lastCaptureSize = { width: this.width, height: this.height };
      } catch (e) {}
      return nativeToBlob.call(this, cb, type, quality);
    };
  });

  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5175/landing-page-builder/editor/11', {
    waitUntil: 'load',
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  // Unfold "Page Setting" panel
  await page.mouse.click(15, 100);
  await page.waitForTimeout(500);

  const changeImageBtn = page.getByText('Change Image');
  await changeImageBtn.first().evaluate((el) => el.click());
  await page.waitForTimeout(500);

  // Screenshot the live "Preview" element (captureRef target) as ground truth
  // page.getByTestId("")
  const previewPanel = page.getByText('Preview', { exact: true }).locator('..');
  await previewPanel.screenshot({ path: 'screenshots/_cmp_ground_truth.png' }).catch(e => console.log('ground truth screenshot failed:', e.message));

  const createBtn = page.getByText('Create', { exact: true });
  await createBtn.first().evaluate((el) => el.click());
  await page.waitForTimeout(3000);

  const dataUrl = await page.evaluate(() => window.__lastCaptureDataUrl);
  const size = await page.evaluate(() => window.__lastCaptureSize);
  console.log('Captured canvas size:', size);

  if (dataUrl) {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('screenshots/_cmp_html2canvas_result.png', Buffer.from(base64, 'base64'));
    console.log('Saved html2canvas result.');
  } else {
    console.log('No canvas.toBlob was intercepted - capture may have failed before reaching canvas stage.');
  }

  await page.screenshot({ path: 'screenshots/_cmp_after_create_full.png' });

  await browser.close();
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
