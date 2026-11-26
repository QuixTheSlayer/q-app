import { test, expect } from '@playwright/test';
import { gotoEditor, insertEmptySection, openPropertyPanel, propertyPanel } from './fixtures';

// The redesigned panel is behind `enable_panel_redesign` (editor.config.ts).
test.describe('Redesigned property panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
    await insertEmptySection(page);
    await openPropertyPanel(page);
  });

  test('has Design, Actions and More tabs, with Design selected first', async ({ page }) => {
    const panel = propertyPanel(page);
    await expect(panel.getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'true');
    await expect(panel.getByRole('tab', { name: 'Actions' })).toBeVisible();
    await expect(panel.getByRole('tab', { name: 'More' })).toBeVisible();
  });

  test('Actions tab offers a new animation trigger', async ({ page }) => {
    const panel = propertyPanel(page);
    await panel.getByRole('tab', { name: 'Actions' }).click();
    await expect(panel.getByText('Animation')).toBeVisible();
    await expect(panel.getByText('New trigger')).toBeVisible();
  });

  test('More tab holds the element attributes', async ({ page }) => {
    const panel = propertyPanel(page);
    await panel.getByRole('tab', { name: 'More' }).click();
    await expect(panel.getByText('Attributes')).toBeVisible();
    await expect(panel.getByText('Class', { exact: true })).toBeVisible();
    await expect(panel.getByText('Id', { exact: true })).toBeVisible();
  });

  test('switching tabs and back keeps the Design values', async ({ page }) => {
    const panel = propertyPanel(page);
    const gap = panel.getByRole('textbox', { name: 'Gap' });
    await gap.fill('4');
    await gap.blur();

    await panel.getByRole('tab', { name: 'More' }).click();
    await panel.getByRole('tab', { name: 'Design' }).click();
    await expect(gap).toHaveValue('4');
  });

  test('a section can be collapsed and expanded', async ({ page }) => {
    const panel = propertyPanel(page);
    const layout = panel.getByRole('button', { name: 'Layout', exact: true });
    await expect(layout).toHaveAttribute('aria-expanded', 'true');

    await layout.click();
    await expect(layout).toHaveAttribute('aria-expanded', 'false');
    await expect(panel.getByRole('textbox', { name: 'Gap' })).toBeHidden();

    await layout.click();
    await expect(panel.getByRole('textbox', { name: 'Gap' })).toBeVisible();
  });

  test('header offers the hide toggle and the three device scopes', async ({ page }) => {
    const panel = propertyPanel(page);
    await expect(panel.locator('button[aria-label="Hide on page"]')).toBeVisible();
    await expect(panel.locator('button[aria-label="Edit Desktop styles"]')).toBeVisible();
    await expect(panel.locator('button[aria-label="Edit Tablet styles"]')).toBeVisible();
    await expect(panel.locator('button[aria-label="Edit Mobile styles"]')).toBeVisible();
  });

  test('editing in the tablet scope shows a scope notice', async ({ page }) => {
    const panel = propertyPanel(page);
    await panel.locator('button[aria-label="Edit Tablet styles"]').click();
    await expect(panel.getByRole('status')).toBeVisible();
    await panel.locator('button[aria-label="Edit Desktop styles"]').click();
    await expect(panel.getByRole('status')).toHaveCount(0);
  });
});
