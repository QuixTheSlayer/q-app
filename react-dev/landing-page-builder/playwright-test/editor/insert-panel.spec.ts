import { test, expect } from '@playwright/test';
import {
  gotoEditor,
  openInsertTab,
  openLayersTab,
  openSubTemplatesTab,
  layerRows,
  insertEmptySection,
  insertFocusedBlockInNewSection,
  insertTableDialog,
  insertButton,
} from './fixtures';

test.describe('Insert panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
  });

  test('side tabs switch between Insert, Layers and Sub Templates', async ({ page }) => {
    await openLayersTab(page);
    await expect(page.getByText('Element Layers')).toBeVisible();

    await openSubTemplatesTab(page);
    await expect(page.getByText('Sub Templates', { exact: true }).first()).toBeVisible();

    await openInsertTab(page);
    await expect(page.getByText('Containers')).toBeVisible();
    await expect(page.getByText('Contents')).toBeVisible();
    await expect(page.getByText('Event Widgets').first()).toBeVisible();
  });

  test('every Insert button shows its keyboard shortcut', async ({ page }) => {
    // Shortcut badges render as "/ + S" inside the button, ahead of the label.
    await expect(page.getByRole('button', { name: /\/\s*\+\s*S\s*Section$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /\/\s*\+\s*B\s*Block$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /\/\s*\+\s*T\s*Text$/ })).toBeVisible();
  });

  test('inserting a Section with nothing focused appends it at the end of the page', async ({ page }) => {
    await openLayersTab(page);
    const before = await layerRows(page).count();

    await insertEmptySection(page);

    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(before + 1);
  });

  test('inserting Text into a focused Block adds it as a child', async ({ page }) => {
    // A bare Section refuses direct content children, so a Block goes in between.
    await insertFocusedBlockInNewSection(page);

    await openLayersTab(page);
    const beforeText = await layerRows(page).count();

    await openInsertTab(page);
    await insertButton(page, 'Text').click();

    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(beforeText + 1);
  });

  test('warns instead of inserting when no container is focused', async ({ page }) => {
    await openInsertTab(page);
    await insertButton(page, 'Image').click();
    await expect(page.getByText(/no focused container component to insert/i)).toBeVisible();
  });

  test('warns instead of inserting Text directly into a bare Section', async ({ page }) => {
    await insertEmptySection(page);
    await openInsertTab(page);
    await insertButton(page, 'Text').click();
    await expect(page.getByText(/cannot insert content directly into section/i)).toBeVisible();
  });

  test('Insert table opens a dialog and can be cancelled without inserting', async ({ page }) => {
    await insertFocusedBlockInNewSection(page);
    await openInsertTab(page);

    await insertButton(page, 'Table').click();

    const dialog = insertTableDialog(page);
    await expect(dialog).toBeVisible();
    // Target by the label's `htmlFor` id: NumberField and Checkbox forward `id` internally.
    await expect(page.locator('label[for="insert-table-col"]')).toHaveText('Columns');
    await expect(page.locator('label[for="insert-table-row"]')).toHaveText('Rows');
    await expect(page.locator('label[for="insert-table-header-checkbox"]')).toHaveText('Include header row');

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('Ready Made Templates are listed open and a Hero template inserts a whole section', async ({ page }) => {
    await openLayersTab(page);
    const before = await layerRows(page).count();

    await openInsertTab(page);
    // The section heading really reads "Ready Make Templates" (a typo in the
    // locale file); match the real string.
    await expect(page.getByText('Ready Make Templates')).toBeVisible();

    // The group starts expanded (FoldList defaultFold={false}): do not click
    // its label first, that would collapse it.
    const heroButton = insertButton(page, 'Hero');
    await expect(heroButton).toBeVisible();
    await heroButton.click();

    await openLayersTab(page);
    // A template inserts a whole section subtree, so more than one row appears.
    await expect(async () => {
      expect(await layerRows(page).count()).toBeGreaterThan(before + 1);
    }).toPass();
  });
});
