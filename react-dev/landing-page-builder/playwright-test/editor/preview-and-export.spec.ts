import { test, expect } from '@playwright/test';
import { skipOnboardingTour, EDITOR_PAGE_ID } from './fixtures';

test.describe('Preview page and exports', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboardingTour(page);
    await page.goto(`/landing-page-builder/preview/${EDITOR_PAGE_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Switch to editor page' })).toBeVisible({ timeout: 60_000 });
  });

  test('renders the saved page content', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('an FAQ answer collapses when its question is clicked', async ({ page }) => {
    // The first FAQ item starts open.
    const answer = page.getByText(/Any artist, band, or label/);
    await expect(answer).toBeVisible();
    await page.getByText('Who is eligible to submit an entry?').click();
    await expect(answer).toBeHidden();
  });

  test('Export page as HTML downloads an .html file', async ({ page }) => {
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export page as HTML' }).click();
    expect((await download).suggestedFilename()).toMatch(/\.html$/);
  });

  test('Switch to editor returns to the editor route', async ({ page }) => {
    await page.getByRole('button', { name: 'Switch to editor page' }).click();
    await expect(page).toHaveURL(new RegExp(`/landing-page-builder/editor/${EDITOR_PAGE_ID}$`));
  });
});
