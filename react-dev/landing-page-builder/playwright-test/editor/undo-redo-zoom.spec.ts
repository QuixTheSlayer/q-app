import { test, expect } from '@playwright/test';
import { clickEmptyCanvas, gotoEditor, openInsertTab, openLayersTab, layerRows, insertButton } from './fixtures';

test.describe('Undo, redo and zoom', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
  });

  test('undo removes the last inserted section, redo brings it back', async ({ page }) => {
    await openLayersTab(page);
    const before = await layerRows(page).count();

    await openInsertTab(page);
    await insertButton(page, 'Section').click();

    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(before + 1);

    await page.getByRole('button', { name: 'Undo' }).click();
    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(before);

    await page.getByRole('button', { name: 'Redo' }).click();
    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(before + 1);
  });

  test('Ctrl+Z undoes an insert from the keyboard', async ({ page }) => {
    await openLayersTab(page);
    const before = await layerRows(page).count();

    await openInsertTab(page);
    await insertButton(page, 'Section').click();
    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(before + 1);

    await clickEmptyCanvas(page);
    await page.keyboard.press('Control+z');
    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(before);
  });

  test('zoom in and out change the displayed percentage', async ({ page }) => {
    const zoomIn = page.getByRole('button', { name: 'Zoom in' });
    const zoomOut = page.getByRole('button', { name: 'Zoom out' });
    const percent = page.locator('text=/%$/').first();

    const initialPercent = parseInt((await percent.textContent()) || '0', 10);
    expect(initialPercent).toBeGreaterThan(0);

    await zoomIn.click();
    await expect(percent).toHaveText(`${initialPercent + 10}%`);

    await zoomOut.click();
    await zoomOut.click();
    await expect(percent).toHaveText(`${initialPercent - 10}%`);
  });
});
