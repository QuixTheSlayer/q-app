import { test, expect } from '@playwright/test';
import { gotoEditor, dialogTitled, clickMoreMenuItem } from './fixtures';

test.describe('Custom Code dialog', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
    await clickMoreMenuItem(page, 'Custom CSS & JS');
  });

  test('opens on the CSS tab and can be cancelled', async ({ page }) => {
    const dialog = dialogTitled(page, 'Custom CSS & JS');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Upload .css' })).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  });

  test('saving page CSS restyles the canvas and marks the page unsaved', async ({ page }) => {
    const dialog = dialogTitled(page, 'Custom CSS & JS');
    await dialog.locator('.cm-content').click();
    await page.keyboard.insertText('h1 { letter-spacing: 9px; }');
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('Unsaved Changes')).toBeVisible();
    await expect(page.locator('[data-node-path] h1').first()).toHaveCSS('letter-spacing', '9px');
  });

  test('the JS tab swaps the editor and the upload button', async ({ page }) => {
    const dialog = dialogTitled(page, 'Custom CSS & JS');
    await dialog.getByText('JS', { exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Upload .js' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Upload .css' })).toBeHidden();
  });
});
