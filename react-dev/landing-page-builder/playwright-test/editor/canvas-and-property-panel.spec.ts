import { test, expect } from '@playwright/test';
import {
  clickEmptyCanvas,
  gotoEditor,
  openPropertyPanel,
  propertyPanel,
  insertEmptySection,
  clickCanvasNode,
} from './fixtures';

test.describe('Canvas selection and Property panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
  });

  test('shows a placeholder when nothing is selected', async ({ page }) => {
    await openPropertyPanel(page);
    await expect(page.getByText('No element selected')).toBeVisible();
  });

  test('a newly inserted section is focused, outlined, and named in the panel header', async ({ page }) => {
    const section = await insertEmptySection(page);

    // Focused container nodes get the outline classes from Container.tsx.
    await expect(section).toHaveClass(/outline-\[1\.5px\]/);

    await openPropertyPanel(page);
    await expect(propertyPanel(page).getByText('Section', { exact: true }).first()).toBeVisible();
  });

  test('clicking a different section on the canvas moves focus to it', async ({ page }) => {
    const sectionA = await insertEmptySection(page);
    const sectionB = await insertEmptySection(page);

    await expect(sectionB).toHaveClass(/outline-\[1\.5px\]/);
    await clickCanvasNode(sectionA);

    await expect(sectionA).toHaveClass(/outline-\[1\.5px\]/);
    await expect(sectionB).not.toHaveClass(/outline-\[1\.5px\]/);
  });

  test('editing the Gap field in the Design tab keeps the new value', async ({ page }) => {
    await insertEmptySection(page);
    await openPropertyPanel(page);

    const gapField = propertyPanel(page).getByRole('textbox', { name: 'Gap' });
    await expect(gapField).toBeVisible();
    await gapField.fill('3');
    await gapField.blur();
    await expect(gapField).toHaveValue('3');
  });

  test('clicking empty canvas padding clears the selection', async ({ page }) => {
    await insertEmptySection(page);
    await openPropertyPanel(page);
    await expect(propertyPanel(page)).toBeVisible();

    await clickEmptyCanvas(page);
    await expect(propertyPanel(page)).toBeHidden();
  });
});
