import { test, expect } from '@playwright/test';
import { clickEmptyCanvas, gotoEditor, openLayersTab, layerRows, propertyPanel } from './fixtures';

// Pressing "/" arms the insert shortcuts, then a letter inserts (see insertShortcuts.ts).
test.describe('Insert keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
    // Move focus off any input so the key presses reach the document.
    await clickEmptyCanvas(page);
  });

  test('"/" then "S" inserts a section and focuses it', async ({ page }) => {
    await openLayersTab(page);
    const before = await layerRows(page).count();

    await page.keyboard.press('/');
    await page.keyboard.press('s');

    // The new section is focused, so the side panel switches to Properties.
    await expect(propertyPanel(page)).toBeVisible();
    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(before + 1);
  });

  test('"/" then "B" with nothing focused warns instead of inserting', async ({ page }) => {
    await page.keyboard.press('/');
    await page.keyboard.press('b');
    await expect(page.getByText(/no focused container component to insert/i)).toBeVisible();
  });

  test('typing "S" without "/" does not insert anything', async ({ page }) => {
    await openLayersTab(page);
    const before = await layerRows(page).count();
    await clickEmptyCanvas(page);
    await page.keyboard.press('s');
    await page.waitForTimeout(300);
    expect(await layerRows(page).count()).toBe(before);
  });
});
