import { test, expect } from '@playwright/test';
import { gotoEditor, EDITOR_PAGE_ID, clickMoreMenuItem } from './fixtures';

const tour = (page: import('@playwright/test').Page) => page.getByRole('dialog', { name: 'Getting started tour' });

test.describe('First-time onboarding tour', () => {
  test('opens automatically for a first-time visitor', async ({ page }) => {
    await page.goto(`/landing-page-builder/editor/${EDITOR_PAGE_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(tour(page)).toBeVisible({ timeout: 60_000 });
    await expect(tour(page).getByText('Step 1 of')).toBeVisible();
  });

  test('Next moves to the next step', async ({ page }) => {
    await page.goto(`/landing-page-builder/editor/${EDITOR_PAGE_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(tour(page)).toBeVisible({ timeout: 60_000 });

    await tour(page).getByRole('button', { name: 'Next' }).click();
    await expect(tour(page).getByText('Step 2 of')).toBeVisible();
  });

  test('Skip tour closes it and it stays closed after a reload', async ({ page }) => {
    await page.goto(`/landing-page-builder/editor/${EDITOR_PAGE_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(tour(page)).toBeVisible({ timeout: 60_000 });

    await tour(page).getByRole('button', { name: 'Skip tour' }).click();
    await expect(tour(page)).toBeHidden();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Back to dashboard' })).toBeVisible({ timeout: 60_000 });
    await expect(tour(page)).toBeHidden();
  });

  test('does not open once it has been seen, but "Take a tour" reopens it', async ({ page }) => {
    await gotoEditor(page);
    await expect(tour(page)).toBeHidden();

    await clickMoreMenuItem(page, 'Take a tour');
    await expect(tour(page)).toBeVisible();
    await tour(page).getByRole('button', { name: 'Close tour' }).click();
    await expect(tour(page)).toBeHidden();
  });
});

