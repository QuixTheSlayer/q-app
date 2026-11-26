import { test, expect } from '@playwright/test';
import { gotoEditor, dialogTitled, blockSaveRequests, clickMoreMenuItem } from './fixtures';

test.describe('Import HTML dialog', () => {
  test.beforeEach(async ({ page }) => {
    await blockSaveRequests(page);
    await gotoEditor(page);
    await clickMoreMenuItem(page, 'Import HTML');
  });

  test('opens with the replace warning and can be cancelled', async ({ page }) => {
    const dialog = dialogTitled(page, 'Import HTML');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/replaces everything currently on this page/i)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Upload .html file' })).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  });

  test('pasted HTML replaces the page with editable content', async ({ page }) => {
    const dialog = dialogTitled(page, 'Import HTML');
    await dialog.locator('.cm-content').click();
    // insertText skips key events, so the editor's auto-closing tags do not
    // mangle the markup.
    await page.keyboard.insertText(
      '<section><h1>Imported Heading</h1><p>Imported paragraph text.</p></section>',
    );
    await dialog.getByRole('button', { name: 'Import', exact: true }).click();
    // Replacing the page asks for a second confirmation.
    await dialog.getByRole('button', { name: 'Replace page content' }).click();

    await expect(dialog).toBeHidden();
    const canvas = page.locator('[data-node-path]');
    await expect(canvas.getByText('Imported Heading')).toBeVisible({ timeout: 15_000 });
    await expect(canvas.getByText('Imported paragraph text.')).toBeVisible();
    await expect(page.getByText('Unsaved Changes')).toBeVisible();
  });

  test('an import can be undone with Undo', async ({ page }) => {
    const dialog = dialogTitled(page, 'Import HTML');
    await dialog.locator('.cm-content').click();
    await page.keyboard.insertText('<section><h1>Temporary Import</h1></section>');
    await dialog.getByRole('button', { name: 'Import', exact: true }).click();
    // Replacing the page asks for a second confirmation.
    await dialog.getByRole('button', { name: 'Replace page content' }).click();
    const imported = page.locator('[data-node-path]').getByText('Temporary Import');
    await expect(imported).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(imported).toHaveCount(0);
  });
});
