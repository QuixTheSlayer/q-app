import { Locator, Page, expect } from '@playwright/test';

/**
 * A populated sample page (db.json's get_landingpage_data): lots of
 * pre-built sections, so Layers and Canvas tests have real content.
 */
export const EDITOR_PAGE_ID = '16';

/** Same key as ONBOARDING_TOUR_STORAGE_KEY in src/hooks/useOnboardingTour.ts. */
export const TOUR_SEEN_KEY = 'landing_page_builder_onboarding_tour_seen';

/**
 * Marks the first-time tour as seen before the app loads. Without this a
 * full-screen dialog covers the editor in every fresh browser context and
 * blocks every click.
 */
export async function skipOnboardingTour(page: Page) {
  await page.addInitScript((key) => window.localStorage.setItem(key, 'true'), TOUR_SEEN_KEY);
}

/**
 * Mutating tests intercept the save endpoint: `save/:id` (routes.json) is
 * routed onto the same db.json row that `get_landingpage_data/:id` reads, so
 * a real PUT would rewrite the shared dev database. Edits stay in memory
 * until Save is clicked, so this only matters for Save-flow tests.
 */
export async function blockSaveRequests(page: Page) {
  await page.route('**/landing-page-builder/save/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
}

/** Opens the editor and waits until the page data has loaded and rendered. */
export async function gotoEditor(page: Page, pageId: string = EDITOR_PAGE_ID) {
  await skipOnboardingTour(page);
  // 'domcontentloaded': the page keeps loading remote images long after the
  // editor is usable, so waiting for 'load' can exceed the timeout.
  await page.goto(`/landing-page-builder/editor/${pageId}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Back to dashboard' })).toBeVisible({ timeout: 60_000 });
  await openLayersTab(page);
  await expect(page.getByRole('treeitem').first()).toBeVisible({ timeout: 30_000 });
  await openInsertTab(page);
}

/**
 * The left side panel shows either the content tabs (Insert, Layers, Sub
 * Templates) or the Property panel. Focusing a node switches it to
 * Properties, which hides the content tabs. This brings the tabs back.
 */
export async function showContentPanel(page: Page) {
  const insertTab = page.getByRole('tab', { name: 'Insert' });
  if (!(await insertTab.isVisible())) {
    await page.getByRole('button', { name: 'Open Insert panel' }).click();
    await expect(insertTab).toBeVisible();
  }
}

export async function openInsertTab(page: Page) {
  await showContentPanel(page);
  await page.getByRole('tab', { name: 'Insert' }).click();
  await expect(page.getByText('Insert Panel', { exact: true })).toBeVisible();
}

export async function openLayersTab(page: Page) {
  await showContentPanel(page);
  await page.getByRole('tab', { name: 'Layers' }).click();
  await expect(page.getByText('Element Layers')).toBeVisible();
}

export async function openSubTemplatesTab(page: Page) {
  await showContentPanel(page);
  await page.getByRole('tab', { name: 'Sub Templates' }).click();
}

/** The Property panel's scrollable body (header, tabs and sections). */
export function propertyPanel(page: Page) {
  return page.locator('[data-tour="property-panel-controls"]');
}

/** Shows the Property panel. Does nothing if it is already showing. */
export async function openPropertyPanel(page: Page) {
  const showing = propertyPanel(page).or(page.getByText('No element selected'));
  if (!(await showing.first().isVisible())) {
    await page.getByRole('button', { name: 'Open Property panel' }).click();
  }
  await expect(showing.first()).toBeVisible();
}

/** Number of rows in the Layers tree (root included). Layers tab must be open. */
export function layerRows(page: Page) {
  return page.getByRole('treeitem');
}

/**
 * Insert-panel buttons have no `aria-label`, so their accessible name is
 * their whole text: the shortcut badge ("/ + S") and any plan badge
 * ("PRO", "ENTERPRISE") come before the label. Match the label as the
 * trailing part of the name.
 */
export function insertButton(page: Page, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page.getByRole('button', { name: new RegExp(`${escaped}$`) });
}

/**
 * Every canvas node's `data-id` also sits on a hidden mirror `<section>`
 * with no `data-node-path`. Match both attributes to get the real,
 * interactive canvas element.
 */
export function canvasNodeById(page: Page, id: string) {
  return page.locator(`[data-node-path][data-id="${id}"]`);
}

/**
 * Id of the last layer row. The Layers DOM follows the model's child order,
 * unlike the canvas, where portals can mount in a different order, so a
 * just-inserted node is identified from its Layers row (`id={node.id}`).
 */
async function lastLayerRowId(page: Page) {
  await openLayersTab(page);
  const id = await page.locator('input[data-name="layer-item-open"]').last().getAttribute('id');
  await openInsertTab(page);
  return id!;
}

/**
 * Inserts an empty section and returns a locator for it. `insertSection`
 * focuses the node it creates, so it is already selected and the Property
 * panel is showing its properties.
 */
export async function insertEmptySection(page: Page) {
  await openInsertTab(page);
  await insertButton(page, 'Section').click();
  return canvasNodeById(page, await lastLayerRowId(page));
}

/**
 * Text, Image, Button and Table cannot go straight into a section (content
 * needs a Block in between). A new Block is not focused automatically, so
 * this focuses it from the Layers tab before returning.
 */
export async function insertFocusedBlockInNewSection(page: Page) {
  await insertEmptySection(page);
  await openInsertTab(page);
  await insertButton(page, 'Block').click();

  await openLayersTab(page);
  // The new Block is the only child of the newest section, so it is the last row.
  const blockRow = page.locator('input[data-name="layer-item-open"]').last();
  const id = await blockRow.getAttribute('id');
  await blockRow.click();

  await openInsertTab(page);
  return canvasNodeById(page, id!);
}

/**
 * Clicks a canvas node to focus it. Canvas nodes are dnd-kit draggables and
 * carry `aria-disabled`, which Playwright treats as disabled for a plain
 * click, so the click is forced.
 */
export async function clickCanvasNode(node: Locator) {
  await node.click({ position: { x: 10, y: 10 }, force: true });
}

/**
 * The "Insert Table" dialog is not the only `role="dialog"` on the page
 * (closed Radix tooltips and popovers keep the role), so scope by title.
 */
export function insertTableDialog(page: Page) {
  return page.getByRole('dialog').filter({ hasText: 'Insert Table' });
}

/** Opens the top bar's "More" menu and clicks one of its items (Custom CSS & JS, Import HTML, Take a tour, Toggle theme). */
export async function clickMoreMenuItem(page: Page, name: string) {
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByRole('menuitem', { name }).click();
}

/** Dialog opened from the top bar's More menu (Import HTML, Custom Code), scoped by title. */
export function dialogTitled(page: Page, title: string) {
  return page.getByRole('dialog').filter({ hasText: title });
}

/**
 * Clicks the strip of canvas padding at the top-centre of `#editor-wrapper`:
 * a click that hits no node clears the selection and moves focus off any
 * input. The corners are covered by the side panels' collapse handles, so
 * click at the horizontal centre.
 */
export async function clickEmptyCanvas(page: Page) {
  const box = await page.locator('#editor-wrapper').boundingBox();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + 5);
}

/** Focuses a node from its Layers row (reliable where clicking a small canvas element is not). */
export async function focusViaLayers(page: Page, id: string) {
  await openLayersTab(page);
  await page.locator(`input[data-name="layer-item-open"][id="${id}"]`).click();
}
