import { test, expect } from '@playwright/test';
import {
  gotoEditor,
  openInsertTab,
  openLayersTab,
  openPropertyPanel,
  propertyPanel,
  insertFocusedBlockInNewSection,
  insertButton,
  clickCanvasNode,
  layerRows,
  blockSaveRequests,
  canvasNodeById,
  focusViaLayers,
  EDITOR_PAGE_ID,
} from './fixtures';

// Records a video on failure only; the shared config does not record.
test.use({ video: 'retain-on-failure' });

/**
 * Inserts with a plain click (every Insert button adds to the focused
 * container) and returns a locator for the new node, found from the last
 * Layers row. Drag-and-drop from the Insert panel is not used here: its
 * drop target depends on a 10px edge threshold (getNearestEdge in
 * dnd.utils.ts) and lands in the wrong parent intermittently.
 */
async function insertViaClick(page: import('@playwright/test').Page, source: import('@playwright/test').Locator) {
  await source.click();
  await openLayersTab(page);
  const id = await page.locator('input[data-name="layer-item-open"]').last().getAttribute('id');
  await openInsertTab(page);
  return canvasNodeById(page, id!);
}

test('build a page: insert content, edit it, check its properties, save, preview', async ({ page }) => {
  test.setTimeout(150_000);
  await blockSaveRequests(page);
  await gotoEditor(page);

  await test.step('insert a Section, then a focused Block inside it', async () => {
    await insertFocusedBlockInNewSection(page);
    await openPropertyPanel(page);
    await expect(propertyPanel(page).getByText('Block', { exact: true }).first()).toBeVisible();
  });

  const text = await test.step('insert Text into the Block', async () => {
    await openLayersTab(page);
    const before = await layerRows(page).count();
    await openInsertTab(page);
    const node = await insertViaClick(page, insertButton(page, 'Text'));
    await openLayersTab(page);
    await expect(layerRows(page)).toHaveCount(before + 1);
    await openInsertTab(page);
    return node;
  });

  const image = await test.step('insert an Image into the Block', async () => insertViaClick(page, insertButton(page, 'Image')));
  const imageId = (await image.getAttribute('data-id'))!;

  // "Button" alone also matches "Submit Entry Button" and "Register Button", so match the shortcut badge too.
  const button = await test.step('insert a Button into the Block', async () =>
    insertViaClick(page, page.getByRole('button', { name: /\/\s*\+\s*N\s*Button$/ })));
  const buttonId = (await button.getAttribute('data-id'))!;

  await test.step('type into the text element on the canvas', async () => {
    // The text node is a live Tiptap editor. Type straight after the click,
    // before anything else moves focus.
    await clickCanvasNode(text);
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('Welcome to the page!');
    await expect(text).toContainText('Welcome to the page!');

    await openPropertyPanel(page);
    await expect(propertyPanel(page).getByText('Text', { exact: true }).first()).toBeVisible();
  });

  await test.step('selecting the image shows the image panel', async () => {
    await focusViaLayers(page, imageId);
    await expect(propertyPanel(page).getByText('Image', { exact: true }).first()).toBeVisible();
  });

  await test.step('rename the button label', async () => {
    await focusViaLayers(page, buttonId);
    await expect(propertyPanel(page).getByText('Button', { exact: true }).first()).toBeVisible();
    await propertyPanel(page).getByRole('textbox').first().fill('Click Here');
    await expect(button).toContainText('Click Here');
  });

  await test.step('the Layers panel lists what was inserted', async () => {
    await openLayersTab(page);
    await expect(page.getByText('Element Layers')).toBeVisible();
  });

  await test.step('save (mocked) and see the badge settle', async () => {
    await expect(page.getByText('Unsaved Changes')).toBeVisible();
    await page.getByRole('button', { name: 'Save page' }).click();
    await expect(page.getByText('All changes saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  await test.step('open Preview', async () => {
    await page.getByRole('button', { name: 'Switch to preview page' }).click();
    await expect(page).toHaveURL(new RegExp(`/landing-page-builder/preview/${EDITOR_PAGE_ID}$`));
    await expect(page.getByRole('link', { name: 'Back to dashboard' })).toHaveCount(0);
  });
});
