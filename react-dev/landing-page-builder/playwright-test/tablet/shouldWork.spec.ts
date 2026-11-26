import { expect, test, devices } from '@playwright/test';

test.use(devices['Galaxy Tab S9 landscape']);

test('should be worked', async ({ page, context }) => {
  await context.route('**.jpg', route => route.abort());
  await page.goto('http://localhost:5173/landing-page-builder/editor/12');

 
});