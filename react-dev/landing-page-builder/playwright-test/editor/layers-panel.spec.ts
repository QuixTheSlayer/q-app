import { test, expect } from '@playwright/test';
import { gotoEditor, openLayersTab, propertyPanel, layerRows } from './fixtures';

test.describe('Layers panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
    await openLayersTab(page);
  });

  test('lists the page tree as treeitems, root included', async ({ page }) => {
    // The sample page has many sections, each with nested content.
    expect(await layerRows(page).count()).toBeGreaterThan(15);
  });

  test('clicking a layer focuses that node and opens its properties', async ({ page }) => {
    const secondRow = page.locator('input[data-name="layer-item-open"]').nth(1); // index 0 is the root
    await secondRow.click();

    // Focusing a node switches the side panel to Properties.
    await expect(propertyPanel(page)).toBeVisible();

    // Back in Layers, the focused row is highlighted (`bg-input`, Layers.tsx).
    await openLayersTab(page);
    const wrapper = page.locator('input[data-name="layer-item-open"]').nth(1).locator('xpath=..');
    await expect(wrapper).toHaveClass(/bg-input/);
    await expect(layerRows(page).nth(1)).toHaveAttribute('aria-selected', 'true');
  });

  test('renaming a layer keeps the new name', async ({ page }) => {
    const secondRow = page.locator('input[data-name="layer-item-open"]').nth(1);
    await secondRow.fill('My Custom Section Name');
    await expect(secondRow).toHaveValue('My Custom Section Name');
  });

  test('expand and collapse toggles a container layer with children', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Collapse layer' }).first();
    await expect(toggle).toBeVisible();

    const before = await layerRows(page).count();
    await toggle.click();
    await expect(page.getByRole('button', { name: 'Expand layer' }).first()).toBeVisible();
    expect(await layerRows(page).count()).toBeLessThan(before);

    await page.getByRole('button', { name: 'Expand layer' }).first().click();
    await expect(layerRows(page)).toHaveCount(before);
  });

  test('does not show the empty-layers message for a populated page', async ({ page }) => {
    await expect(
      page.getByText('No layers yet. Insert a section from the Insert tab to see it here.'),
    ).toBeHidden();
  });
});
