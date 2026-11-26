import { test, expect } from '@playwright/test';
import { gotoEditor, openInsertTab, blockSaveRequests, insertButton, EDITOR_PAGE_ID } from './fixtures';

test.describe('Save and Preview flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
  });

  test('inserting content flips the badge to unsaved, then Save clears it', async ({ page }) => {
    // Never let a real PUT reach json-server: it would rewrite db.json.
    await blockSaveRequests(page);

    await openInsertTab(page);
    await insertButton(page, 'Section').click();
    await expect(page.getByText('Unsaved Changes')).toBeVisible();

    await page.getByRole('button', { name: 'Save page' }).click();
    await expect(page.getByText('All changes saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test('Ctrl+S saves from the keyboard', async ({ page }) => {
    await blockSaveRequests(page);

    await openInsertTab(page);
    await insertButton(page, 'Section').click();
    await expect(page.getByText('Unsaved Changes')).toBeVisible();

    await page.keyboard.press('Control+s');
    await expect(page.getByText('All changes saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test('the save request carries the edited title', async ({ page }) => {
    let body = '';
    await page.route('**/landing-page-builder/save/**', (route) => {
      body = route.request().postData() ?? '';
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.getByRole('textbox', { name: 'Page title' }).fill('Title From Test');
    await page.getByRole('button', { name: 'Save page' }).click();
    await expect(page.getByText('All changes saved', { exact: true })).toBeVisible({ timeout: 10_000 });
    expect(body).toContain('Title From Test');
  });

  test('Preview opens the read-only route for the same page', async ({ page }) => {
    await page.getByRole('button', { name: 'Switch to preview page' }).click();
    await expect(page).toHaveURL(new RegExp(`/landing-page-builder/preview/${EDITOR_PAGE_ID}$`));

    // Preview has no editor chrome.
    await expect(page.getByRole('link', { name: 'Back to dashboard' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Switch to editor page' })).toBeVisible();
  });
});
