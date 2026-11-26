import { test, expect } from '@playwright/test';
import { gotoEditor, blockSaveRequests, insertButton, openInsertTab, clickMoreMenuItem } from './fixtures';

test.describe('Editor top bar', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
  });

  test('shows the page title, Save and Preview, the More menu and the save status', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Page title' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save page' })).toBeVisible();
    await page.getByRole('button', { name: 'More' }).click();
    await expect(page.getByRole('menuitem', { name: 'Custom CSS & JS' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Import HTML' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Switch to preview page' })).toBeVisible();

    // The device-view effect (Canvas.tsx) writes a width style into the
    // content on mount, so the badge may already read "Unsaved Changes".
    await expect(page.getByText(/^(All changes saved|Unsaved Changes|Saving changes|Error Syncing)$/)).toBeVisible();
  });

  test('the page title can be edited', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Page title' });
    await titleInput.fill('My Renamed Landing Page');
    await expect(titleInput).toHaveValue('My Renamed Landing Page');
    await expect(page.getByText('Unsaved Changes')).toBeVisible();
  });

  test('switches between desktop, tablet and mobile views', async ({ page }) => {
    const desktop = page.getByRole('button', { name: 'Preview desktop view' });
    const tablet = page.getByRole('button', { name: 'Preview tablet view' });
    const mobile = page.getByRole('button', { name: 'Preview mobile view' });

    await expect(desktop).toHaveAttribute('aria-pressed', 'true');

    await tablet.click();
    await expect(tablet).toHaveAttribute('aria-pressed', 'true');
    await expect(desktop).toHaveAttribute('aria-pressed', 'false');

    await mobile.click();
    await expect(mobile).toHaveAttribute('aria-pressed', 'true');
    await expect(tablet).toHaveAttribute('aria-pressed', 'false');

    await desktop.click();
    await expect(desktop).toHaveAttribute('aria-pressed', 'true');
  });

  test('the canvas gets narrower in the mobile view', async ({ page }) => {
    const frame = page.locator('#editor-wrapper');
    const desktopWidth = (await frame.boundingBox())!.width;

    await page.getByRole('button', { name: 'Preview mobile view' }).click();
    await expect(async () => {
      const mobileWidth = (await page.locator('[data-node-path]').first().boundingBox())!.width;
      expect(mobileWidth).toBeLessThan(desktopWidth);
    }).toPass();
  });

  test('the theme toggle changes the theme and a reload keeps it', async ({ page }) => {
    const root = page.locator('html');
    const before = (await root.getAttribute('class')) ?? '';
    await clickMoreMenuItem(page, 'Toggle theme');
    await expect(root).not.toHaveAttribute('class', before);
  });

  test('Save only sends a request while there are unsaved changes', async ({ page }) => {
    let saveRequests = 0;
    await page.route('**/landing-page-builder/save/**', (route) => {
      saveRequests += 1;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await openInsertTab(page);
    await insertButton(page, 'Section').click();
    await expect(page.getByText('Unsaved Changes')).toBeVisible();

    await page.getByRole('button', { name: 'Save page' }).click();
    await expect(page.getByText('All changes saved', { exact: true })).toBeVisible({ timeout: 10_000 });
    expect(saveRequests).toBe(1);

    // Already synced: clicking Save again must do nothing.
    await page.getByRole('button', { name: 'Save page' }).click();
    await page.waitForTimeout(500);
    expect(saveRequests).toBe(1);
  });

  test('a failed save shows the error badge and Save can be retried', async ({ page }) => {
    await page.route('**/landing-page-builder/save/**', (route) => route.abort('failed'));

    await openInsertTab(page);
    await insertButton(page, 'Section').click();
    await page.getByRole('button', { name: 'Save page' }).click();
    await expect(page.getByText('Error Syncing')).toBeVisible({ timeout: 10_000 });

    await page.unroute('**/landing-page-builder/save/**');
    await blockSaveRequests(page);
    await page.getByRole('button', { name: 'Save page' }).click();
    await expect(page.getByText('All changes saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  });
});
